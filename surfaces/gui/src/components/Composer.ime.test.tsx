// Regression: during IME composition (e.g. a Chinese input method), the Enter that
// confirms a candidate must NOT submit the message. onKey bails when the native
// keyboard event reports isComposing (keyCode 229 is the legacy fallback signal).
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Composer } from "./Composer";

function stubFetch() {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) => {
      if (url.includes("/skills"))
        return { ok: true, json: async () => ({ skills: [] }) } as Response;
      return { ok: true, json: async () => ({}) } as Response;
    }),
  );
}

const props = (extra: Partial<Parameters<typeof Composer>[0]> = {}) => ({
  mode: "interactive",
  model: "gpt-5.6-sol",
  running: false,
  connected: true,
  sessionId: "s1",
  onSend: vi.fn(),
  onInterrupt: vi.fn(),
  onModeChange: vi.fn(),
  onModelChange: vi.fn(),
  ...extra,
});

const box = () => screen.getByPlaceholderText(/Ask the coworker/);

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("Composer / IME composition", () => {
  it("Enter while composing does not send — the candidate-confirm Enter stays in the IME", async () => {
    stubFetch();
    const p = props();
    render(<Composer {...p} />);
    fireEvent.change(box(), { target: { value: "你好" } });
    // The Enter a Chinese IME fires to confirm the candidate carries isComposing=true
    // (and legacy keyCode 229). It must reach the IME, not onSend.
    fireEvent.keyDown(box(), { key: "Enter", isComposing: true, keyCode: 229 });
    expect(p.onSend).not.toHaveBeenCalled();
    expect((box() as HTMLTextAreaElement).value).toBe("你好");
  });

  it("a real (non-composing) Enter still sends", async () => {
    stubFetch();
    const p = props();
    render(<Composer {...p} />);
    fireEvent.change(box(), { target: { value: "hello" } });
    fireEvent.keyDown(box(), { key: "Enter" });
    await waitFor(() => expect(p.onSend).toHaveBeenCalledWith("hello", [], undefined));
  });
});
