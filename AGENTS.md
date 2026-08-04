# AGENTS.md

OpenWorker: local-first AI coworker desktop app. Sidecar architecture — a Python FastAPI backend (`coworker/`) is spawned and supervised by a Rust/Tauri 2 shell (`surfaces/gui/src-tauri/`); the React SPA in `surfaces/gui/` talks to it over HTTP + WebSocket on localhost. The agent engine is a self-built async loop (`coworker/engine.py`, `TurnEngine`); aisuite is used only for tool/schema infra (composition, not inheritance).

## Layout

- `coworker/` — Python backend: `server/app.py` (FastAPI) + `server/manager.py` (SessionManager), `engine.py` (agent loop), `providers/` (router + 5 native providers), `tools/`, `connectors/`, `mcp/`, `permissions.py`, `secrets.py`, `compaction.py`, `memory/`, `automation/`
- `surfaces/gui/` — React SPA + Tauri shell. UI code in `src/`; Rust shell in `src-tauri/`
- `stt/` — Rust whisper speech-to-text sidecar
- `packaging/` — PyInstaller spec (`openworker-server.spec`), DMG/Windows build scripts, update manifest
- `tests/` — backend pytest suite; `coworker/testing/fake_slack.py` is the in-process Slack harness

## Git workflow (do not break)

- This repo is forked from `https://github.com/andrewyng/openworker`; fork lives at `https://github.com/chanf/openworker`.
- Remotes: `upstream` = andrewyng/openworker (original), `github` = chanf/openworker (our fork).
- `main` must stay identical to upstream `main` (fast-forward only, no local commits). It is never developed on — only kept in sync with `andrewyng/openworker` main and mirrored to `github` (fork) main so both stay identical.
- **NEVER commit/push `feng` content into `main`.** No feng-only commits, merge, or cherry-pick may ever land on `main` — main is only ever fast-forwarded from upstream. If you find yourself on `main` and about to commit, stop and switch to `feng`.
- `feng` is our dev branch; ALL development work happens there. Local `feng` work may be pushed to `github` (fork) `feng`.
- Keep everything in sync via: `git fetch upstream && git checkout main && git merge --ff-only upstream/main && git push github main`, then `git checkout feng && git rebase main`. Merge main → feng MUST be a rebase, never a merge: `git pull --rebase upstream main` (or `git rebase main` from `feng`). Resolve conflicts by keeping the upstream feature plus our i18n/localization of it.
- `git pull` from `feng` must not accidentally merge local `main` into `feng`; always `--rebase`.
- Network: GitHub HTTPS transfers often abort with HTTP2 framing / "Empty reply" / "Failed to connect ... port 443". Workaround: `GIT_HTTP_LOW_SPEED_LIMIT=1 GIT_HTTP_LOW_SPEED_TIME=999 git -c http.version=HTTP/1.1 fetch <remote> <branch>`. If direct connect still times out, route through the local proxy: `git -c http.proxy=http://127.0.0.1:7890 ...` (also `HTTPS_PROXY=http://127.0.0.1:7890` for other tools; SSH to GitHub also works: `git push ssh://git@github.com/<owner>/<repo>.git <branch>`).
- Release tags (`v*`) must match the `version` in `surfaces/gui/src-tauri/tauri.conf.json`.

## Setup

```bash
bash packaging/setup_dev_env.sh    # one-time: creates .venv with pip install -e ".[messaging,dev]"
```

- Python >= 3.10 (CI runs 3.12; local venv is 3.11). No Python linter/formatter/typecheck is configured — do not run ruff/black/mypy.
- `aisuite` is pinned to a git commit in `pyproject.toml` (not PyPI). Don't "upgrade" it to a PyPI pin unless the pinned commit is known-good.
- **Server token handshake**: the standalone server writes a per-launch token to `<state-dir>/sidecar-8765.token`. Vite reads it at startup — start the server BEFORE Vite, and restart Vite whenever the server restarts. Direct API calls must send `X-OpenWorker-Token: <token>`.
- `state_dir()` = `$COWORKER_STATE_DIR` → `%APPDATA%\coworker` → `~/.config/coworker`. `openworker-server` log lives at `<state-dir>/logs/openworker-server.log`.

## Run

```bash
.venv/bin/openworker-server --cwd <project> --port 8765     # backend (needs a model key in env or Settings)
cd surfaces/gui && npm install && npm run dev               # browser UI → http://localhost:1420 (strictPort)
cd surfaces/gui && npm run tauri dev                        # desktop shell; manages the server itself
```

`npm run dev` serves on port **1420**, not 5173 (several READMEs say 5173 — stale; `vite.config.ts` is authoritative). `npm run tauri dev` in dev mode finds the server at repo-root `.venv/bin/openworker-server`.

## Tests

```bash
.venv/bin/pytest                          # backend, asyncio_mode=auto; CI installs ".[messaging,dev,bedrock]"
.venv/bin/pytest tests/test_engine.py -k name
cd surfaces/gui && npm test               # vitest unit tests
cd surfaces/gui && npm run e2e            # hermetic Playwright: /v1 + WS mocked, NO Python needed, port 5199
cd surfaces/gui && npx playwright test e2e/chat.spec.ts
cd surfaces/gui && npm run e2e:live       # real backend on :8765 + model key; nondeterministic, costs tokens
npx tsc --noEmit                          # GUI typecheck (build = "tsc && vite build")
```

- `tests/conftest.py` sets an isolated `COWORKER_STATE_DIR` for EVERY test. Without it, tests read your real machine state and emit real telemetry. Never remove that autouse fixture.
- E2E fixtures: `surfaces/gui/e2e/fixtures.ts` mocks endpoints and runs a scripted fake agent over WebSocket. New endpoints need a fixture + route branch there; the catch-all returns `{}` which crashes components expecting arrays.
- `e2e-live/` (`api-smoke.spec.ts`) is a cheap no-cred shape check against a running server — good for verifying mock/backend drift.

## Architecture invariants (do not break)

- **Stored conversation history never mutates.** `_outbound_messages()` (`engine.py`) is the single provider outbound adapter: it strips sidecars, applies compaction, adapts PDF/vision, and injects system-context at outbound time. Compaction also only builds an outbound view. This is what makes mid-session model switching safe.
- Canonical message/tool format = OpenAI chat-completions; each provider (`providers/*_provider.py`) is a pure-function converter. Tool call IDs/result routing, thinking signatures, and schema shapes differ per provider (Gemini synthesizes `call_<n>`, requires thought-signature echo; Anthropic uses `tool_use_id`).
- Model strings are prefixed for routing: `gemini:…`, `anthropic:…`, `openai:…`, `ollama:…`, `bedrock:…`, `vertex:…` — `ProviderRouter` dispatches by prefix and passes the bare name to the SDK. Only a known provider prefix routes; internal `:` in names like `qwen2.5-coder:32b` must not. `_openai_compat` builders resolve keys only from their own provider profile, never falling back to OpenAI.
- Fail-closed by default: no approver → deny-all; MCP `requires_approval` defaults True with PINNED allowlists; write tools are constrained to writable roots even in AUTO mode (`../` escapes rejected); secrets never enter model context (`secrets.py`).
- Approval/prompt/directory/plan requests park as Inbox items and suspend the turn (`inbox.wait`); durable resume replays via `tool_call_id` idempotency. Checkpoints persist at turn start, permission required, etc.

## Packaging & release

- Desktop builds strip experimental connectors: `packaging/openworker-server.spec` filters hiddenimports + excludes; self-builders opt back in with `COWORKER_EXPERIMENTAL=1 ./build_dmg.sh`.
- Release tags (`v*`) must match the `version` in `surfaces/gui/src-tauri/tauri.conf.json` or CI fails loudly (installed apps would otherwise see a phantom update).
- macOS releases are ARM64-only (no Intel target). macOS installers must be signed/notarized (Apple secrets) and updater artifacts minisign-signed (`TAURI_SIGNING_PRIVATE_KEY`); without secrets builds degrade to unsigned.
- Read `docs/architecture-analysis.md` for the detailed subsystem map (file:line annotated).

## Stale docs to ignore

- `surfaces/gui/README.md` and `conftest.py`'s docstring reference a `platform/` root and Vite port 5173 — the repo is flat at `/` and Vite is 1420. Trust `vite.config.ts` and the scripts, not those prose paths.
