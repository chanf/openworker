"""Tests for the generic OpenAI-compatible provider (`openai-compat`): the descriptor shape,
the fail-fast builder (with key isolation), router prefix-stripping (incl. a colon in the
model name), the read-only verify path, and capability defaults. SDK/network-free."""

from __future__ import annotations

from types import SimpleNamespace

import pytest

from coworker.providers import (
    ModelCapabilities,
    OpenAIProvider,
    ProviderRouter,
    capabilities_for,
    verify_provider_key,
)
from coworker.providers.registry import (
    _build_openai_compat_endpoint,
    build_provider_client,
    get_descriptor,
)


# -- descriptor shape (drives the GUI form) -------------------------------------
def test_descriptor_registered_and_shaped():
    d = get_descriptor("openai-compat")
    assert d is not None
    assert d.title  # rendered in Settings
    assert d.needs_key is True
    assert d.recommended_model is None  # unknown endpoint → no auto-seeded model
    by_key = {f.key: f for f in d.fields}
    assert set(by_key) == {"base_url", "api_key"}
    assert by_key["base_url"].required is True and by_key["base_url"].secret is False
    assert by_key["api_key"].secret is True  # masked in the form


# -- builder: happy path hands base_url + key to the OpenAI SDK -----------------
def test_build_client_passes_base_url_and_key(monkeypatch):
    captured: dict = {}

    class FakeOpenAI:
        def __init__(self, **kwargs):
            captured.update(kwargs)

    monkeypatch.setattr("openai.OpenAI", FakeOpenAI)
    client = build_provider_client(
        "openai-compat",
        {"base_url": "https://api.agnes-ai.cn/v1", "api_key": "sk-x"},
        secrets=None,
    )
    assert isinstance(client, OpenAIProvider)
    client._ensure_client()  # type: ignore[attr-defined]
    assert captured == {
        "api_key": "sk-x",
        "base_url": "https://api.agnes-ai.cn/v1",
    }


# -- builder: fail-fast when base_url or key is missing -------------------------
@pytest.mark.parametrize(
    "profile,label",
    [
        ({"api_key": "sk-x"}, "missing base_url"),
        ({"base_url": "https://x/v1"}, "missing api_key"),
        ({}, "empty profile"),
    ],
)
def test_build_requires_base_url_and_key(profile, label):
    with pytest.raises(RuntimeError):
        _build_openai_compat_endpoint(profile, None)


def test_builder_does_not_fall_back_to_openai_env(monkeypatch):
    """Key isolation: a generic endpoint must NEVER silently use the OpenAI env/SecretStore
    key — that would send a user's real OpenAI key to an arbitrary third-party endpoint."""
    monkeypatch.setenv("OPENAI_API_KEY", "sk-env-leak")
    with pytest.raises(RuntimeError):
        _build_openai_compat_endpoint({"base_url": "https://x/v1"}, None)


# -- router: prefix detection + bare-name strip ---------------------------------
def test_router_strips_openai_compat_prefix():
    r = ProviderRouter(secrets=None)
    assert r._provider_name("openai-compat:agnes-2.5-pro") == "openai-compat"
    assert ProviderRouter._bare("openai-compat:agnes-2.5-pro") == "agnes-2.5-pro"


def test_router_keeps_colon_in_model_name():
    """A model name containing a colon (some ids do) must survive prefix-stripping: split on
    the FIRST colon only, pass the rest through verbatim — same contract as ollama tags."""
    assert ProviderRouter._bare("openai-compat:foo:bar") == "foo:bar"
    assert (
        ProviderRouter._bare("openai-compat:Qwen/Qwen2.5-72B-Instruct")
        == "Qwen/Qwen2.5-72B-Instruct"
    )


# -- verify: GET {base}/models with Bearer (the generic else branch) ------------
def test_verify_hits_models_endpoint_with_bearer(monkeypatch):
    cap: dict = {}

    def fake_get(url, **kwargs):
        cap["url"] = url
        cap.update(kwargs)
        return SimpleNamespace(status_code=200)

    monkeypatch.setattr("httpx.get", fake_get)
    assert verify_provider_key(
        "openai-compat",
        api_key="sk-x",
        base_url="https://api.agnes-ai.cn/v1",
    ) == {"ok": True}
    assert cap["url"] == "https://api.agnes-ai.cn/v1/models"
    assert cap["headers"]["Authorization"] == "Bearer sk-x"


def test_verify_bad_key(monkeypatch):
    monkeypatch.setattr(
        "httpx.get", lambda *a, **k: SimpleNamespace(status_code=401)
    )
    result = verify_provider_key(
        "openai-compat", api_key="sk-bad", base_url="https://x/v1"
    )
    assert result == {"ok": False, "error": "Invalid API key."}


# -- capabilities: conservative default for an unknown endpoint/model -----------
def test_capabilities_conservative():
    caps = capabilities_for("openai-compat:any-model")
    assert isinstance(caps, ModelCapabilities)
    assert caps.tools is True
    assert caps.streaming is True
    assert caps.parallel_tool_calls is False  # unprobed → stay safe
    assert caps.vision is False
