# 个性化项目 Roadmap

> 本文档记录 OpenWorker 在实际使用中发现的三个待解决问题，作为个人维护期的优先工作清单。
> 每个条目包含：现象、根因定位（含代码位置）、修复方案、验收标准与优先级评估。
>
> 最后更新：2026-08-04

## 概览

| # | 问题 | 影响面 | 优先级 | 工作量 | 状态 |
| --- | --- | --- | --- | --- | --- |
| 1 | 中文输入法回车误触发发送 | 所有 CJK 用户、阻塞输入 | P0 高 | 小 | ✅ 已完成 |
| 2 | 含中文文件名的文档无法打开 | macOS/Windows 桌面端 | P1 中 | 中 | ✅ 已完成 |
| 3 | 缺少标准 OpenAI 兼容接口 | 自建/第三方模型接入 | P1 中 | 中 | ✅ 已完成 |

---

## 1. 中文输入法回车误触发发送

### 现象
在对话输入框中使用中文输入法（拼音/双拼等 IME）时，按下回车本意是**确认候选词**，但实际会把当前未完成的消息直接发送出去。原因是 IME 组字过程中的回车与"提交消息"的回车没有被区分。

### 根因定位
输入框的键盘事件处理在 [Composer.tsx](../surfaces/gui/src/components/Composer.tsx) 的 `onKey` 函数中：

```ts
// surfaces/gui/src/components/Composer.tsx:354-364
if (e.key === "Enter" && !e.shiftKey) {   // 斜杠菜单分支
  e.preventDefault();
  const chosen = slashMatches[slashIndex];
  if (chosen) pickSkill(chosen);
  return;
}
// ...
if (e.key === "Enter" && !e.shiftKey) {   // 主提交分支
  e.preventDefault();
  submit();                                // ← IME 组字回车也走到了这里
}
```

两处 `Enter` 判断都**没有检测合成（composing）状态**。浏览器在 IME 组字期间产生的按键事件会带上 `keyCode === 229` 且 `event.isComposing === true`，但当前代码忽略了这两个标志。

### 修复方案
在 `onKey` 顶部、所有 `Enter` 判断之前增加合成状态短路：

```ts
const onKey = (e: React.KeyboardEvent) => {
  // IME 组字期间的按键（含确认候选词的回车）一律不触发命令/提交
  if (e.nativeEvent.isComposing || e.keyCode === 229) return;
  // ...原有逻辑
};
```

要点：
- 用 `e.nativeEvent.isComposing`（标准属性）作为主判断，`e.keyCode === 229` 作为旧浏览器/旧输入法的兜底。
- 该守卫放在函数最前面，斜杠菜单分支与主提交分支一并覆盖。
- 不要用 `compositionstart`/`compositionend` 维护布尔标志的方式（易与 React 合成事件时序产生竞态），`isComposing` 已经是浏览器维护好的状态。

### 验收标准
- [x] 补充单测：[Composer.ime.test.tsx](../surfaces/gui/src/components/Composer.ime.test.tsx) 模拟 `isComposing` 事件，断言 `onSend` 未被调用；并验证非组字回车仍正常发送。
- [x] 确认候选词后输入框为空时按回车（非组字状态），仍可正常发送（单测覆盖）。
- [x] Shift+Enter 换行行为不受影响（守卫不动 `!e.shiftKey` 既有逻辑）。
- [x] 斜杠命令菜单（`/`）在 IME 组字期间不会被回车误选中（守卫位于 `onKey` 最顶部，先于斜杠分支）。
- [ ] **待手动验证**：在 macOS 拼音输入法下输入"你好"，按回车确认候选词，候选词正常上屏、消息不被发送（需真人 + 真实 IME，jsdom 无法复现真实输入法）。

### 状态：✅ 已完成（2026-08-04）
- 改动：[Composer.tsx](../surfaces/gui/src/components/Composer.tsx) `onKey` 顶部增加 `if (e.nativeEvent.isComposing || e.keyCode === 229) return;`。
- 验证：GUI 全量单测 110/110 通过，`tsc --noEmit` 通过。
- 仅剩真人 + 真实输入法的手动确认。

### 优先级 / 工作量
**P0，小（约 0.5 天）**——改动集中在一个函数，但影响所有中文用户的日常输入，建议最先修复。

---

## 2. 含中文文件名的文档无法打开

### 现象
在对话窗口右侧的文档（Artifact）面板点击「Open」或「Show in Finder」时，如果文件名包含中文（例如 `季度报告.pdf`），系统无法正确打开或定位该文件——要么无反应，要么报"文件不存在"。

### 根因定位
打开文件是一条贯穿前后端的链路，目前未对非 ASCII 文件名做任何加固：

```
GUI「Open」按钮
  → revealArtifact()                    surfaces/gui/src/api.ts:214
  → POST /v1/sessions/{id}/artifacts/reveal   body={path, mode}
  → FastAPI 路由                         coworker/server/app.py:696
  → manager.reveal_artifact()           coworker/server/manager.py:1391
  → _artifact_target() 解析路径          coworker/server/manager.py:1305
  → 调用 OS 命令打开                     coworker/server/manager.py:1408-1429
```

OS 分发逻辑（[manager.py:1408-1429](../coworker/server/manager.py#L1408-L1429)）：

```python
if sys.platform == "darwin":
    subprocess.Popen(["open", str(target)], ...)      # macOS
elif sys.platform == "win32":
    os.startfile(str(target))                          # Windows
else:
    subprocess.Popen(["xdg-open", tgt], ...)           # Linux
```

可疑根因（**已实测推翻，见下方"实际根因"**）：

> 初稿曾怀疑 macOS NFC/NFD Unicode 归一化不匹配。**实测推翻**：CJK 汉字没有规范分解（`name_nfc == name_nfd` 为 True），归一化差异只影响带重音的拉丁字符（é、ü…），不影响中文文件名。服务端 `_artifact_target` 对中文路径解析完全正常（`is_file=True`、`ls` rc=0）。**复现优先是对的**——避免了按错误方向去改归一化。

**实际根因：GUI 传输途中路径被 percent-encode，服务端拿到的是 `%E5…` 而非中文。**
对话窗口里的文档来自 transcript 中的 markdown 链接 `[标题](artifact:reports/季度报告.pdf)`。react-markdown 按 CommonMark 规范对链接目的地做 URL 归一化，**把非 ASCII 百分号编码** → `href = "artifact:reports/%E5%AD%A3…pdf"`。[Markdown.tsx](../surfaces/gui/src/components/Markdown.tsx) 取 `href.slice("artifact:".length)` 后**未解码**，就把 `reports/%E5…pdf` 当作路径派发 → `revealArtifact`/`readArtifact` 把这个编码串发给服务端 → `_artifact_target` 去找一个字面名为 `%E5…` 的文件 → `is_file=False` → "文件已被移动或删除" / 打不开。

实测对照（macOS，`reports/季度报告.pdf` 真实存在于磁盘）：
- 旧（编码路径 `reports/%E5%AD%A3…pdf`）→ `is_file=False` ❌
- 新（解码路径 `reports/季度报告.pdf`）→ `is_file=True` ✅

> 注：RightRail 工件列表的「Open」走 `getArtifacts` → `list_artifacts`（os.walk 干净 unicode 路径），不受此 bug 影响；只有 transcript 内的 artifact **chip**（经 markdown 链接）受影响——与用户描述"对话窗口中的文档，点击 open"完全吻合。

### 修复方案（已实施）
单点修复，平台无关（解码发生在浏览器，Windows/Linux 同样受益）：在 [Markdown.tsx](../surfaces/gui/src/components/Markdown.tsx) 取出 `artifact:` 路径后 `decodeURIComponent`，`try/catch` 兜底畸形序列（孤立 `%`）：

```tsx
const rawPath = href.slice("artifact:".length);
let path = rawPath;
try { path = decodeURIComponent(rawPath); } catch { path = rawPath; }
```

### 验收标准
- [x] 新增回归测试 [Markdown.test.tsx](../surfaces/gui/src/components/Markdown.test.tsx)：CJK `artifact:` 链接点击后派发的路径为解码后的真实文件名（修复前实测派发 `%E5…`，修复后为 `季度报告.pdf`）。
- [x] 服务端确认：编码路径 `is_file=False`、解码路径 `is_file=True`（根因闭环）。
- [x] GUI 全量单测 111/111 通过，`tsc --noEmit` 通过。
- [ ] **待手动验证**：在桌面 App 里实际点击一个中文文件名文档 chip 的「Open」，确认用默认应用打开 /「Show in Finder」定位（Windows、Linux 未在此环境复现，但修复在浏览器层、与 OS 无关）。

### 状态：✅ 已完成（2026-08-04）
- 改动仅 [Markdown.tsx](../surfaces/gui/src/components/Markdown.tsx)（+解码与兜底）+ [Markdown.test.tsx](../surfaces/gui/src/components/Markdown.test.tsx)（CJK 回归用例）。无需改服务端。
- 关键教训：初稿的 NFC/NFD 假设被实测推翻——中文文件名的真正问题是 markdown 链接 URL 编码未解码。

### 优先级 / 工作量
**P1，实际 ~0.5 天**——根因定位（复现）+ 单点修复 + 回归测试。原估 1.5–2 天是基于错误的归一化假设；真实改动远小于此。

---

## 3. 缺少标准 OpenAI 兼容接口

### 现象
当前对 AI 供应商的支持有限：用户要么选择内置的固定厂商（智谱 Z AI、DeepSeek、Kimi、MiniMax、Qwen、xAI、Mistral、Together、Fireworks、OpenRouter、Ollama 等），要么在「OpenAI」供应商下填一个 custom endpoint。**缺少一个通用的、标准 OpenAI 兼容接口**——即让用户填入任意 `base_url` + `api_key` + **自定义模型名**，即可对接任何 `/v1/chat/completions` 服务（自建 vLLM、硅基流动、OpenRouter 任意模型、本地 LlamaCpp、企业内部网关等）。

### 根因定位
兼容层基础设施其实**已经具备**，缺口在用户可见的"通用描述符"：

- `OpenAIProvider`（[openai_provider.py](../coworker/providers/openai_provider.py)）是"兼容工作马"，只要给 `base_url` 就走 Chat Completions，已支撑所有兼容厂商、Ollama、Azure/vLLM 自定义端点。
- 通用工厂 `_openai_compat` 与描述符构造器 `_compat`（[registry.py:191-246](../coworker/providers/registry.py#L191-L246)）已经能一键生成一个兼容厂商条目。
- 现存的兼容厂商都是**厂商写死**的（[registry.py:468-550](../coworker/providers/registry.py#L468-L550)）：每个 `_compat(...)` 都绑定了固定的 `default_base_url` 与 `recommended_model`。
- 模型路由通过 `provider:` 前缀（[router.py](../coworker/providers/router.py)）：`zai:glm-5.2` → 智谱客户端。模型名由 MATRIX（[matrix.py](../coworker/providers/matrix.py)）预设的条目决定。

因此两个具体缺口：
1. **没有"通用 OpenAI 兼容"供应商描述符**——没有一处让用户填任意 base_url + key + 模型名的 UI。
2. **兼容厂商的模型名被前缀+MATRIX 锁死**——用户无法为任意端点填写任意模型 id（例如对接一个 MATRIX 里没有的内网模型）。

### 修复方案
新增一个一等公民的通用兼容供应商，复用现有 `OpenAIProvider` 与 `_compat` 模式：

1. **新增描述符**（[registry.py](../coworker/providers/registry.py) 的 `DESCRIPTORS` 列表）：

   ```python
   ProviderDescriptor(
       name="openai-compat",            # 通用 OpenAI 兼容
       title="OpenAI-Compatible (自定义)",
       needs_key=True,
       fields=[
           ProviderField("base_url", "API Base URL", required=True,
                         placeholder="https://your-host/v1",
                         help="任何兼容 OpenAI /v1/chat/completions 的服务：vLLM、硅基流动、OpenRouter、本地推理等。"),
           ProviderField("api_key", "API Key", secret=True),
           ProviderField("model", "模型名称", required=True,
                         placeholder="如 gpt-4o、glm-4.5、deepseek-chat…"),
       ],
       build=_build_openai_compat,      # base_url + key → OpenAIProvider
       recommended_model=None,
       blurb="指向任意 OpenAI 兼容端点；模型名自填。",
   )
   ```

2. **模型名透传**。现有路由 `_bare()`（[router.py](../coworker/providers/router.py)）会剥离已知前缀。为 `openai-compat` 增加一条规则：`openai-compat:<任意模型名>` 的前缀被剥离后，把用户填写的模型名直接透传给 `OpenAIProvider`，不依赖 MATRIX 预设。
   - 注意 `_provider_name()` 用 `get_descriptor(prefix)` 判断是否为已知供应商——新增描述符会自动被识别，无需改路由核心逻辑。
   - 需要确认：当 `recommended_model=None` 时，UI 允许用户在前缀后填写任意模型字符串，且该字符串不被当作"未知前缀"误解析（尤其当模型名本身含 `:` 时，参考 `_bare()` 注释里 `qwen2.5-coder:32b` 的处理）。

3. **UI 侧**。Settings ▸ Models 动态渲染描述符字段（已有机制），新描述符的三个字段会自动出现；需确认模型选择器允许输入该供应商下的自由文本模型名。

### 验收标准
- [x] Settings ▸ Models 出现"OpenAI 兼容 (自定义端点)"供应商。**实现决策**：descriptor 含 `base_url`(必填) + `api_key`(secret) **两字段**；模型名**复用现有「添加模型」流程**录入（用户选择，非 descriptor 内 model 字段）。
- [x] 对接 MATRIX 中不存在的真实端点 agnes-ai（`https://api.agnes-ai.cn/v1` + `agnes-2.5-flash`），流式对话正常返回（M2 实测通过）。
- [x] 模型名含冒号（如 `openai-compat:foo:bar`）不被路由误解析——按首个冒号切分，透传 `foo:bar`（单测覆盖）。
- [x] key 缺失时给出明确错误，且**不**回退到 OpenAI 官方 key（builder 只读本 profile，单测 `test_builder_does_not_fall_back_to_openai_env` 覆盖）。
- [x] 新增测试 [test_openai_compat_provider.py](../tests/test_openai_compat_provider.py)：descriptor 形状、builder、fail-fast、key 隔离、路由前缀剥离、verify、capabilities。

### 状态：✅ 已完成（2026-08-04）
- 详见技术设计 [design-openai-compat-provider.md](design-openai-compat-provider.md)。
- 改动：`coworker/providers/registry.py`（builder `_build_openai_compat_endpoint` + descriptor）、`coworker/server/manager.py`（`COMPAT_MODELS["openai-compat"]` 建议）、`coworker/providers/capabilities.py`（显式分支）。**GUI 零改动**（descriptor 字段自动渲染，模型走现有添加流程）。
- 验证：单测 86/86 通过（含新增 9 个）；agnes-ai 真实流式对话通过。
- **待手动验证**：在桌面 App 里实际走一次 Settings 配置 → Test → 添加模型 → composer 对话（需打包/运行 GUI）。

### 优先级 / 工作量
**P1，实际 ~1 天**——底层 `OpenAIProvider` 已就绪，主要是新增描述符 + 路由自动生效（无需改路由/verify）+ 单测 + 真实端点验证。比原估的 1.5 天更省，因为路由与 verify 复用现有通用分支。

---

## 建议执行顺序

1. **#1 IME 回车**（P0，半天）——最影响日常输入，先解决。
2. **#3 通用 OpenAI 兼容接口**（P1）——基础设施已就绪，性价比高，落地后能立即接入更多模型。
3. **#2 中文文件名打开**（P1）——需跨平台实测定位根因，留出调试时间。

每项完成后更新本文档对应验收清单（勾选 `[x]`），并在条目末尾补注实际落地与代码位置。
