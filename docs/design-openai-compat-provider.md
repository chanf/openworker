# 技术设计：通用 OpenAI 兼容供应商（`openai-compat`）

> 对应 [personal-roadmap.md](personal-roadmap.md) #3。
> 状态：✅ 已实现并验证（2026-08-04）。本文档先于实现写成，现作为实现记录留存。

## 0. 一句话结论

这**不是**"新写一套 AI 接口"。标准 OpenAI 兼容的引擎（`OpenAIProvider`）、路由、连接测试、自定义模型录入**都已存在**并被多家厂商复用。缺的只是一个**用户可见的"通用兼容"供应商描述符**——把"base_url 必填、模型名自填"作为一个一等公民选项暴露出来。改动集中在 `coworker/providers/registry.py` 与 `coworker/server/manager.py`，**GUI 基本零改动**。

## 1. 现状澄清：aisuite 不是模型层

仓库确实依赖 `aisuite`（`pyproject.toml:20`，pin 到 `andrewyng/aisuite` 的某 commit），但：

- 它**只用于 toolkits / tracing**——工具元数据 `__aisuite_tool_metadata__`，且**仅 tests** 里 `import aisuite`；运行时 `coworker/` 里没有任何 `import aisuite`。
- 模型调用的真正抽象是自研的 [`ProviderClient`](../coworker/providers/base.py#L102)（`coworker/providers/`），直接用 `openai` / `anthropic` / `google-genai` SDK。`engine.py` 持有一个 `ProviderClient`，调 `provider.stream(...)`。

**因此"增加 OpenAI 兼容接口"是接进 `coworker/providers/`，与 aisuite 无关。**

## 2. 关键现状（带定位）

| 能力 | 位置 | 是否已就绪 |
| --- | --- | --- |
| 兼容引擎（OpenAI SDK + 任意 `base_url`，走 Chat Completions） | [`OpenAIProvider`](../coworker/providers/openai_provider.py#L125) | ✅ 已被 Ollama / Azure / vLLM / zai / deepseek / kimi / qwen / xai / mistral / together / fireworks / openrouter 复用 |
| 按 `provider:model` 前缀路由、剥离前缀 | [`ProviderRouter`](../coworker/providers/router.py)（`_provider_name` / `_bare`） | ✅ 新描述符一经注册，`openai-compat:<模型>` 自动剥离前缀，**无需改路由** |
| 连接测试（`GET {base}/models`，Bearer） | [`verify_provider_key`](../coworker/providers/registry.py#L835) 的 `else` 通用分支 | ✅ 新供应商自动落入此分支，**无需改 verify** |
| 自定义模型名录入（datalist 建议 + 自由文本） | [`add_model`](../coworker/server/manager.py#L1772) + [`_suggested_models`](../coworker/server/manager.py#L1560) + `COMPAT_MODELS` | ✅ 已支持任意 `openai-compat:<名字>` |
| 供应商表单按 descriptor 动态渲染字段 | GUI `ProviderForm`（`ProviderSetup.tsx:312`） | ✅ 新 descriptor 的 `base_url`/`api_key` 字段自动渲染 |
| 模型选择器（composer 下拉） | `Composer.tsx:618` → `Dropdown`（固定列表） | ⚠️ 固定列表，不支持就地输入；但模型在「设置 ▸ 添加模型」录入后自动出现在此列表 |

**现有"逃生口"**：`openai` 供应商已有一个可选 `base_url`「Custom endpoint」字段（[`registry.py:263`](../coworker/providers/registry.py#L263)），填了就切到 Chat Completions 兼容模式。本设计是把它**提升为一个独立、显式的通用供应商**——区别在于：独立的 key profile（不会与官方 OpenAI key 混用）、`base_url` 必填而非可选、无预设模型、UX 上明确面向"自带端点"。

## 3. 实测验证（真实端点）

用用户提供的 agnes-ai 端点做只读探测（`GET /v1/models`，正是本设计 verify 路径要发的请求）：

```
GET https://api.agnes-ai.cn/v1/models   Authorization: Bearer <key>
→ HTTP 200, 6 个模型：
  agnes-2.0-flash, agnes-2.5-flash, agnes-2.5-pro, agnes-2.5-pro-alpha,
  agnes-image-2.1-flash, agnes-video-v2.0
```

**结论**：该端点是标准 OpenAI 兼容服务（`{data:[{id}]}` 形状），`base_url` 含 `/v1`。这同时验证了：
1. 通用 verify `else` 分支对真实第三方端点可用。
2. `OpenAIProvider`（Chat Completions）对该端点可用。
3. 文本对话模型为 `agnes-2.5-pro` / `agnes-2.5-flash` / `agnes-2.0-flash`（image/video 是多模态生成模型，非对话，不纳入）。

> 安全：测试 key 仅用于本地/手动验收，**不写入仓库或本文档**。

## 4. 设计方案

### 4.1 新增 builder（`coworker/providers/registry.py`）

复用 `OpenAIProvider`，只做"base_url + key 都必填、无厂商默认、无 env 回退、fail-fast"：

```python
def _build_openai_compat_endpoint(profile: dict[str, Any], secrets: Any) -> ProviderClient:
    """Generic OpenAI-compatible endpoint the user points at themselves (vLLM、硅基流动、
    OpenRouter、agnes-ai、本地推理、企业网关…)。base_url 与 key 均由用户提供——没有厂商
    默认值可回退、也没有 env 变量可继承，故任一缺失立即 fail-fast。刻意不走 OpenAI 的
    env/SecretStore 回退（resolve_api_key），以免把已配置的 OpenAI key 静默发给第三方端点。
    复用 OpenAIProvider（Chat Completions，兼容工作马）。"""
    p = profile or {}
    base_url = (p.get("base_url") or "").strip()
    api_key = (p.get("api_key") or "").strip()
    if not base_url:
        raise RuntimeError("No endpoint configured — enter the OpenAI-compatible Base URL.")
    if not api_key:
        raise RuntimeError("No API key configured — add it in Settings ▸ Models.")
    return OpenAIProvider(api_key=api_key, base_url=base_url)
```

> 关键安全点：**不调用 `resolve_api_key(secrets)`**。与现有 `_openai_compat`（[registry.py:191](../coworker/providers/registry.py#L191)）的 fail-fast 策略一致——只用本 profile 的显式 key。

### 4.2 新增 descriptor（`DESCRIPTORS` 列表，`registry.py`）

放在兼容厂商区块末尾（openrouter 之后、ollama 之前），让所有兼容供应商聚在一起：

```python
ProviderDescriptor(
    name="openai-compat",
    title="OpenAI 兼容 (自定义端点)",
    needs_key=True,
    fields=[
        ProviderField(
            "base_url",
            "Base URL",
            required=True,
            placeholder="https://api.example.com/v1",
            help="任何兼容 OpenAI /v1/chat/completions 的服务（vLLM、硅基流动、OpenRouter、"
                 "agnes-ai、本地推理、企业网关等）。请包含 /v1 路径。",
        ),
        ProviderField(
            "api_key",
            "API key",
            secret=True,
        ),
    ],
    build=_build_openai_compat_endpoint,
    recommended_model=None,   # 无法预知用户端点的模型名 → 不自动播种，靠「添加模型」
    blurb="指向任意 OpenAI 兼容端点；保存后在「添加模型」里填写该端点支持的模型名。",
),
```

- `title` 用中文「OpenAI 兼容」是用户指定；若希望与兄弟条目（全英文标题）一致，可改 `"OpenAI-Compatible (Custom)"`，中文显示走 i18n（见 [[i18n-translation-progress]]）。
- `recommended_model=None`：[`set_provider`](../coworker/server/manager.py#L1607) 的自动播种分支 `if rec and ...` 不会触发——符合预期，用户手动添加模型。

### 4.3 路由：无需改动

`ProviderRouter._provider_name` / `_bare` / `Manager._model_provider` 三处都通过 `get_descriptor(prefix)` 判断是否为已知供应商。新 descriptor 注册后，`_BY_NAME["openai-compat"]` 自动存在，于是：

- `_provider_name("openai-compat:agnes-2.5-pro")` → `"openai-compat"`
- `_bare("openai-compat:agnes-2.5-pro")` → `"agnes-2.5-pro"`（剥前缀，SDK 拿到裸名）
- 模型名**含冒号**也安全：`openai-compat:foo:bar` 按**首个冒号**切分 → rest=`foo:bar` 整体作为模型名透传（与现有 `qwen2.5-coder:32b` 的处理一致）。

### 4.4 连接测试：无需改动

`verify_provider_key` 的 [`else` 分支](../coworker/providers/registry.py#L835) 已覆盖"openai + 任意兼容端点"：取 `base_url`（字段 default 为空 → 用用户填的值）→ `GET {base}/models` Bearer。实测对 agnes-ai 直接返回 200。

### 4.5 模型名：复用现有「添加模型」流程

GUI 的 `ModelChecklist`（`ModelChecklist.tsx:114`）已有"添加模型…"自由输入框 + datalist 建议。用户保存供应商后，在此输入模型名，前端 [`prefixed`](../surfaces/gui/src/components/ModelChecklist.tsx#L49) 自动加上 `openai-compat:` 前缀，存为 `openai-compat:<名字>`，随后出现在 composer 下拉。

为提升体验，给 `COMPAT_MODELS`（[`manager.py:1546`](../coworker/server/manager.py#L1546)）补一条建议列表（仅 datalist 提示，用户可任意改写）：

```python
"openai-compat": [
    "gpt-4o", "gpt-4o-mini",
    "deepseek-chat", "deepseek-reasoner",
    "Qwen/Qwen2.5-72B-Instruct",
    "glm-4.5", "glm-4-plus",
    "agnes-2.5-pro", "agnes-2.5-flash",
],
```

**可选增强（非必须）**：让 `_suggested_models("openai-compat")` 对用户填的 base_url 发一次 `GET {base}/models`，把端点真实模型名灌进 datalist（类似 ollama 取 `/api/tags`）。能显著降低"不知道该填什么模型名"的摩擦，但增加一次网络调用与失败处理，建议作为第二迭代。

### 4.6 能力探测（可选，显式化）

[`capabilities_for`](../coworker/providers/capabilities.py#L12) 对未在 MATRIX 的模型会落到保守默认（`tools=True, vision=False, parallel_tool_calls=False, streaming=True`）。`openai-compat:<任意>` 必然不在 MATRIX，故默认即可用。为可读性可加一条显式分支（行为与默认相同）：

```python
if provider == "openai-compat":
    # 通用端点背后可能是任何模型：假定工具调用+流式可用（OpenAI 兼容线实际保证），
    # 视觉/并行调用保持保守，待用户按具体模型确认。
    return ModelCapabilities(
        tools=True, vision=False, parallel_tool_calls=False, streaming=True
    )
```

## 5. 改动清单（文件级）

| 文件 | 改动 | 必需 |
| --- | --- | --- |
| `coworker/providers/registry.py` | 新增 `_build_openai_compat_endpoint`；在 `DESCRIPTORS` 加 `openai-compat` 条目 | ✅ |
| `coworker/server/manager.py` | `COMPAT_MODELS` 加 `"openai-compat": [...]` 建议 | ✅（UX） |
| `coworker/providers/capabilities.py` | 加 `openai-compat` 显式分支 | ⬜ 可选 |
| `surfaces/gui/**` | **无必需改动**（descriptor 字段自动渲染；模型走现有添加流程） | — |
| `tests/` | 新增 builder/router/verify/capabilities 单测 | ✅ |

预计净增代码 < 60 行（含测试）。

## 6. 边界与风险

1. **base_url 必须含 `/v1`**。OpenAI SDK 会把 `chat/completions` 拼到 `base_url` 后；若用户填 `https://host`（无 `/v1`），多数服务器会 404。→ 用 `help`/`placeholder` 明确提示"请包含 /v1"；可选地做轻量归一化（仅当结尾既无 `/v1` 也非已知路径时追加），但归一化有误伤风险，**首版只做提示**。
2. **key 隔离**。builder 只读本 profile 的 `api_key`，**不走 OpenAI env/SecretStore 回退**——避免把用户的 OpenAI key 发给第三方端点。（§4.1 已落实。）
3. **能力启发式**。保守默认关闭 vision/parallel_tool_calls；若用户用的是支持视觉/并行的模型，能力被低估（不会出错，只是降级）。后续可让用户按模型手动覆盖，或探测 `/v1/models` 的能力字段。
4. **流式假设**。`OpenAIProvider` 默认走 SSE 流式；个别兼容服务器不支持流式或 `stream_options`，已有 [`_param_fix_retry`](../coworker/providers/openai_provider.py#L86) 兜底（drop `stream_options`）。完全不支持流式的服务器仍会报错——属极少数，超出首版范围。
5. **provider 名含连字符**。`openai-compat` 作为前缀和 SecretStore key（`provider:openai-compat`）均合法（无冒号冲突）。

## 7. 测试计划

**单测（`tests/`）**
- `build_provider_client("openai-compat", {base_url, api_key}, None)` → 返回 `OpenAIProvider` 且 `_base_url`/`_api_key` 正确。
- 缺 `base_url` 或缺 `api_key` → `RuntimeError`（且消息含 provider 语义）。
- key 隔离：profile 无 key 时**不**回退到 `OPENAI_API_KEY` env。
- 路由：`_bare("openai-compat:agnes-2.5-pro")` == `"agnes-2.5-pro"`；`_provider_name(...)` == `"openai-compat"`；含冒号模型名 `openai-compat:foo:bar` → bare `"foo:bar"`。
- verify：mock httpx，`verify_provider_key("openai-compat", api_key=..., base_url="https://x/v1")` 命中 `GET https://x/v1/models` 且带 Bearer。
- capabilities：`capabilities_for("openai-compat:any")` 返回保守能力。

**真实端点 E2E（本地/手动，用 agnes-ai key，不提交）**
- 配置供应商 `openai-compat`：base_url=`https://api.agnes-ai.cn/v1`，key=提供的 key →「Test」通过。
- 添加模型 `agnes-2.5-flash` → 出现在 composer 下拉。
- 发送 "你好" → 收到流式文本回复；工具调用（若有）正常。

## 8. 验收标准

- [ ] `provider_descriptors()` 含 `openai-compat`；其 `fields` 为 `base_url`(必填) + `api_key`(secret)。
- [ ] Settings ▸ Models 出现"OpenAI 兼容 (自定义端点)"，两字段可填、可 Test、可保存。
- [ ] 对接 agnes-ai：Test 通过；添加 `agnes-2.5-flash` 后能正常发起对话并流式返回。
- [ ] key 缺失/端点缺失给出明确错误，且**不**回退到 OpenAI 官方 key。
- [ ] 模型名含冒号（如某些 `owner/model`）不被路由误解析。
- [ ] 单测全绿（含上述 builder/router/verify/capabilities 用例）。

## 9. 工作量与里程碑

- **M1 后端（~0.5 天）**：registry builder + descriptor、COMPAT_MODELS、单测。
- **M2 验证（~0.5 天）**：用 agnes-ai 真实端点跑通配置→Test→添加模型→对话；微调 base_url 提示文案。
- **M3（可选，第二迭代）**：`_suggested_models` 探测 `/v1/models` 自动填建议；能力按模型覆盖。

合计核心 ~1 天。
