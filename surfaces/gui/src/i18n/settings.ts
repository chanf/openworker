// Translation slice for the Settings surface. Each slice exports en + zh under its own
// top-level namespace; i18n.tsx merges all slices and type-checks zh against en there.
export const en = {
  settings: {
    language: "Language",
    langEn: "English",
    langZh: "中文",
    langHelp: "Choose the interface language. You can switch back any time.",

    // Settings shell / sub-nav
    settingsTitle: "Settings",
    tabGeneral: "General",
    tabModels: "Models",
    tabSkills: "Skills",
    tabVoice: "Voice input",
    tabPersonas: "Personas",

    // Models tab
    modelsSub:
      "Providers and the models offered in the composer's picker. Keys are stored only on this computer.",

    // Composer context-bar card
    contextBarTitle: "Composer",
    contextBarShow: "Show the context window bar",
    contextBarDesc:
      "A small meter showing how full the model's context window is. Turn it off to show this session's token total instead; either way the full breakdown is one click away.",

    // Voice input
    voiceTitle: "Voice input",
    voiceSub: "Speak naturally in the composer. Recordings and transcripts stay on this device.",
    voiceDesktopOnly: "Voice Input setup is available in the OpenWorker desktop app.",
    voicePrivateBold: "Private by design.",
    voicePrivateBody:
      "Audio is held in memory only while you record and is transcribed locally.",
    voiceThisDevice: "This device",
    voiceCheckingCompat: "Checking compatibility…",
    voiceCompatible: "● Compatible",
    voiceUnsupported: "Unsupported",
    voiceReqMac: "Mac",
    voiceReqMacDetail: "macOS 12+ · Apple Silicon M1+",
    voiceReqWindows: "Windows",
    voiceReqWindowsDetail: "Windows 10 22H2/11 · x64",
    voiceReqMemory: "Memory",
    voiceReqMemoryDetail: "8 GB recommended",
    voiceReqProcessor: "Processor",
    voiceReqProcessorDetail: "4 CPU cores recommended",
    voiceWhisperModel: "Whisper Base · English",
    voiceInstalledVerified: "Installed and verified · {{bytes}}",
    voiceLocalModel: "Local voice model · {{bytes}}",
    voiceVerified: "Verified",
    voiceRepair: "Repair",
    voiceDelete: "Delete",
    voiceCancel: "Cancel",
    voiceVerifying: "Verifying…",
    voiceDownloadModel: "Download model",
    voiceProgressOf: "{{a}} of {{b}}",
    voiceMicTest: "Microphone test",
    voiceMicReadyDesc: "Your microphone and local transcription engine are working.",
    voiceMicRecordDesc: "Record a short phrase to enable the composer microphone.",
    voiceReady: "● Ready",
    voiceStopCheck: "Stop and check",
    voiceTranscribing: "Transcribing…",
    voiceTestAgain: "Test again",
    voiceTestMic: "Test microphone",
    voiceListening: "● Listening… speak a short phrase, then stop.",
    voiceConfirmDelete: "Delete the local Whisper model and disable Voice Input?",
    voiceNoSpeech: "No speech was detected. Try again and speak for a little longer.",
    voiceErrorAction: "Voice Input could not complete that action.",

    // Personas
    personasSub:
      "Which coworkers are enabled and shown in the picker, plus installing new persona bundles.",
    browseGallery: "Browse the Persona Gallery",
    galleryDesc:
      "Curated coworkers from the OpenWorker team — see what each can do before installing.",
    galleryOpen: "Open →",

    // Appearance / General
    generalSub: "How OpenWorker looks and behaves on this machine.",
    theme: "Theme",
    themeAppearance: "Appearance",
    themeLight: "Light",
    themeDark: "Dark",
    themeAuto: "Auto",
    themeAutoHelp: "Auto follows your Mac's appearance.",
    alwaysOn: "Always-on",
    openAtLogin: "Open at login",
    openAtLoginDesc: "Launch OpenWorker automatically when you sign in.",
    keepAwake: "Keep this system awake",
    keepAwakeDesc: "Prevent idle sleep so scheduled tasks fire on time.",
    setupUpdates: "Setup & updates",
    runSetupAgain: "Run setup again",
    runSetupHelp: "Replays the first-run setup: model, first automation, tips.",

    // Trusted workspaces
    trustedWorkspaces: "Trusted workspaces",
    trustedWorkspacesHelp:
      "Trusted projects may manage their command allowances in .coworker/config.toml.",
    revokeConfirm: "Revoke command trust for {{path}}?",
    revoke: "Revoke",
    loadingDots: "Loading…",
    noTrusted: "No workspaces are trusted.",
    cmdAllowancesOne: "{{n}} project command allowance",
    cmdAllowancesMany: "{{n}} project command allowances",
    noCmdAllowances: "No project command allowances currently declared",
    folderUnavailable: "Folder unavailable",

    // Update inline
    updateInstall: "Update to v{{version}} and restart",
    updateChecking: "Checking…",
    updateCheck: "Check for updates",
    updateLatest: "You're on the latest version.",
    updateCheckError: "Couldn't check right now — try again later.",
    updateDownloading:
      "Downloading — OpenWorker restarts by itself when it's ready.",

    // Token savings
    tokenSavings: "Token savings",
    tokenSavingsHelp:
      "PDF attachments travel with every turn of a conversation, so large documents multiply what you spend on tokens.",
    pdfNoNative: "PDFs on models without native PDF support",
    pdfFallbackAria: "PDF fallback",
    pdfExtractText: "Extract text",
    pdfPageImages: "Send page images",
    pdfFallbackHelp:
      "Claude, GPT and Gemini read PDFs natively — this only applies to models that don't (GLM, Kimi, DeepSeek, local models…). Text extraction is cheapest; page images cost more tokens and need a vision-capable model.",
    maxPages: "Max pages",
    maxSize: "Max size",
    pdfLimitHelp:
      "PDFs over these limits are not attached — you'll see a notice in the composer instead.",

    // Context compaction
    compaction: "Context compaction",
    compactionHelp:
      "Long sessions are compacted automatically: older turns are summarized so the coworker keeps working instead of running out of context. Your visible transcript is never changed — a small marker shows where compaction happened.",
    compactAt: "Compact at",
    compactAtCtx: "% of the context window",
    compactOrAt: "or at",
    compactTokens: "tokens, whichever is smaller",
    compactionCapHelp:
      "The cap makes very-large-context models compact early — quality and speed degrade well before their nominal limit.",
    summarizerModel: "Summarizer model",
    compactionModelDefault: "Session's own model (default)",
    compactionModelHelp:
      "The summary is written by this model. The default follows whatever model the session is using.",

    // Sidebar
    sidebar: "Sidebar",
    sidebarConvs: "Conversations shown per coworker",
    sidebarHelp:
      "Longer lists collapse behind “Show more”. Applies per coworker and per project.",

    // Files
    files: "Files",
    filesBrowse: "Browse",
    filesBrowseTitle: "Pick a folder",
    filesSave: "Save",
    filesHelp:
      "Each conversation gets its own folder under this location. Existing conversations keep their current folder; you can grant access to more folders inside any conversation.",
    filesSaved: "Saved. New conversations will use this location.",
    filesSaveError: "Could not use that location.",
  },
};

export const zh = {
  settings: {
    language: "语言",
    langEn: "English",
    langZh: "中文",
    langHelp: "选择界面语言。随时可以切换回来。",

    // Settings shell / sub-nav
    settingsTitle: "设置",
    tabGeneral: "通用",
    tabModels: "模型",
    tabSkills: "技能",
    tabVoice: "语音输入",
    tabPersonas: "角色",

    // Models tab
    modelsSub: "服务提供商以及作曲家中可选的模型。密钥仅保存在本机。",

    // Composer context-bar card
    contextBarTitle: "输入框",
    contextBarShow: "显示上下文窗口条",
    contextBarDesc: "一个小仪表，显示模型的上下文窗口已占用多少。关闭它以改为显示本会话的 token 总量；无论哪种方式，完整明细都只需一次点击。",

    // Voice input
    voiceTitle: "语音输入",
    voiceSub: "在作曲家中自然地说话。录音和转写都保留在本设备上。",
    voiceDesktopOnly: "语音输入设置仅在 OpenWorker 桌面应用中可用。",
    voicePrivateBold: "隐私优先。",
    voicePrivateBody: "音频仅在录音时保存在内存中，并在本地完成转写。",
    voiceThisDevice: "本设备",
    voiceCheckingCompat: "正在检查兼容性…",
    voiceCompatible: "● 兼容",
    voiceUnsupported: "不支持",
    voiceReqMac: "Mac",
    voiceReqMacDetail: "macOS 12+ · Apple Silicon M1+",
    voiceReqWindows: "Windows",
    voiceReqWindowsDetail: "Windows 10 22H2/11 · x64",
    voiceReqMemory: "内存",
    voiceReqMemoryDetail: "建议 8 GB",
    voiceReqProcessor: "处理器",
    voiceReqProcessorDetail: "建议 4 个 CPU 核心",
    voiceWhisperModel: "Whisper Base · English",
    voiceInstalledVerified: "已安装并验证 · {{bytes}}",
    voiceLocalModel: "本地语音模型 · {{bytes}}",
    voiceVerified: "已验证",
    voiceRepair: "修复",
    voiceDelete: "删除",
    voiceCancel: "取消",
    voiceVerifying: "正在验证…",
    voiceDownloadModel: "下载模型",
    voiceProgressOf: "{{a}} / {{b}}",
    voiceMicTest: "麦克风测试",
    voiceMicReadyDesc: "你的麦克风和本地转写引擎工作正常。",
    voiceMicRecordDesc: "录制一句短语即可启用作曲家麦克风。",
    voiceReady: "● 就绪",
    voiceStopCheck: "停止并检查",
    voiceTranscribing: "正在转写…",
    voiceTestAgain: "再次测试",
    voiceTestMic: "测试麦克风",
    voiceListening: "● 正在聆听…请说一句短语，然后停止。",
    voiceConfirmDelete: "删除本地 Whisper 模型并禁用语音输入？",
    voiceNoSpeech: "未检测到语音。请重试并多说一会儿。",
    voiceErrorAction: "语音输入无法完成该操作。",

    // Personas
    personasSub: "哪些 coworker 已启用并显示在选择器中，以及安装新的角色包。",
    browseGallery: "浏览角色库",
    galleryDesc: "由 OpenWorker 团队精选的 coworker —— 安装前可查看各自能做什么。",
    galleryOpen: "打开 →",

    // Appearance / General
    generalSub: "OpenWorker 在本机上的外观与行为方式。",
    theme: "主题",
    themeAppearance: "外观",
    themeLight: "浅色",
    themeDark: "深色",
    themeAuto: "自动",
    themeAutoHelp: "自动跟随你的 Mac 外观。",
    alwaysOn: "常驻运行",
    openAtLogin: "登录时打开",
    openAtLoginDesc: "登录时自动启动 OpenWorker。",
    keepAwake: "保持系统唤醒",
    keepAwakeDesc: "防止空闲休眠，确保计划任务准时执行。",
    setupUpdates: "设置与更新",
    runSetupAgain: "重新运行设置",
    runSetupHelp: "重新播放首次设置：模型、第一个自动化和提示。",

    // Trusted workspaces
    trustedWorkspaces: "受信任的工作区",
    trustedWorkspacesHelp:
      "受信任的项目可以在 .coworker/config.toml 中管理其命令授权。",
    revokeConfirm: "撤销对 {{path}} 的命令信任？",
    revoke: "撤销",
    loadingDots: "加载中…",
    noTrusted: "没有受信任的工作区。",
    cmdAllowancesOne: "{{n}} 个项目命令授权",
    cmdAllowancesMany: "{{n}} 个项目命令授权",
    noCmdAllowances: "当前未声明任何项目命令授权",
    folderUnavailable: "文件夹不可用",

    // Update inline
    updateInstall: "更新到 v{{version}} 并重启",
    updateChecking: "正在检查…",
    updateCheck: "检查更新",
    updateLatest: "你已是最新版本。",
    updateCheckError: "暂时无法检查 —— 请稍后再试。",
    updateDownloading: "正在下载 —— 准备就绪后 OpenWorker 会自动重启。",

    // Token savings
    tokenSavings: "Token 节省",
    tokenSavingsHelp:
      "PDF 附件会随对话的每一轮一起发送，因此大文档会成倍增加你的 token 开销。",
    pdfNoNative: "不支持原生 PDF 的模型上的 PDF",
    pdfFallbackAria: "PDF 回退",
    pdfExtractText: "提取文本",
    pdfPageImages: "发送页面图片",
    pdfFallbackHelp:
      "Claude、GPT 和 Gemini 可原生读取 PDF —— 这仅适用于不支持的模型（GLM、Kimi、DeepSeek、本地模型…）。文本提取成本最低；页面图片消耗更多 token 且需要支持视觉的模型。",
    maxPages: "最大页数",
    maxSize: "最大大小",
    pdfLimitHelp: "超过这些限制的 PDF 不会被附加 —— 你会在作曲家中看到提示。",

    // Context compaction
    compaction: "上下文压缩",
    compactionHelp:
      "长会话会自动压缩：较早的轮次会被摘要，以便 coworker 继续工作而不是耗尽上下文。你可见的记录永远不会被更改 —— 只用一个小标记标出压缩发生的位置。",
    compactAt: "压缩于",
    compactAtCtx: "% 的上下文窗口",
    compactOrAt: "或于",
    compactTokens: "token，取较小者",
    compactionCapHelp: "该上限会让超大上下文的模型提前压缩 —— 质量和速度远在其标称上限之前就会下降。",
    summarizerModel: "摘要模型",
    compactionModelDefault: "会话自身模型（默认）",
    compactionModelHelp: "摘要由该模型生成。默认值跟随会话当前使用的模型。",

    // Sidebar
    sidebar: "侧边栏",
    sidebarConvs: "每个 coworker 显示的对话数",
    sidebarHelp: "更长的列表会折叠到“显示更多”后面。按 coworker 和项目分别生效。",

    // Files
    files: "文件",
    filesBrowse: "浏览",
    filesBrowseTitle: "选择文件夹",
    filesSave: "保存",
    filesHelp:
      "每个对话都会在此位置下获得自己的文件夹。现有对话保留其当前文件夹；你可以在任意对话中授予访问更多文件夹的权限。",
    filesSaved: "已保存。新对话将使用此位置。",
    filesSaveError: "无法使用该位置。",
  },
};
