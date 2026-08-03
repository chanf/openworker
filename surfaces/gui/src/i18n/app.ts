// Translation slice for the App shell. Each slice exports en + zh under its own
// top-level namespace; i18n.tsx merges all slices and type-checks zh against en there.
export const en = {
  app: {
    // Splash / boot
    restoringSession: "Restoring your session…",
    startingApp: "Starting OpenWorker…",

    // Automation-run toast
    automationStarted: "Automation started",
    automationRunTime: "{{title}} · {{time}} run",
    viewRun: "View run ›",
    dismiss: "Dismiss",

    // Sidebar / nav reveal
    showSidebar: "Show sidebar",
    showSidebarShortcut: "Show sidebar (⌘B)",
    newSession: "New session",
    search: "Search",

    // Topbar
    artifacts: "Artifacts",
    artifactsTitle: "Show files this conversation produced",
    showSidePanel: "Show side panel",
    hideSidePanel: "Hide side panel",

    // Run banner
    scheduledRun: "Scheduled run",
    runBannerByAutomation: "· started by an automation",
    backToRuns: "← Back to runs",

    // Empty-state hero
    howCanIHelp: "How can I help?",
    letsBuild: "Let's build something.",
    tryATask: "Try a task",

    // Suggestions
    suggestRunTests: "Run the test suite and summarize any failures.",
    suggestOverview: "Read the project and give me a 5-bullet overview.",
    suggestFixBuild: "Find and fix the failing build.",

    // Streaming / waiting
    assistantLabel: "assistant",
    jumpToLatest: "Jump to latest",
    waitingForAgent: "Waiting for agent...",
    compactingContext: "Compacting context…",

    // Composer placeholders
    placeholderCode: "Ask the coder to build, fix, or explain…  (drop or paste files)",
    placeholderChat: "Ask anything…  (drop or paste files)",
    placeholderCowork: "Ask the coworker…  (drop or paste files)",

    // Default session title
    newSessionTitle: "New session",

    // Fallback title for an automation-run toast before the task title arrives
    automationDefaultTitle: "Automation",

    // Transcript notices (frontend fallbacks — the server usually sends d.text)
    noticeMaxIterations: "Stopped: max iterations reached.",
    noticeModelSwitched: "Model switched",
    noticeCompacted: "Context compacted",
    noticeInterrupted: "Interrupted.",
    noticeError: "Error: {{msg}}",
    unknownError: "unknown",
    noticeRejected: "That message was rejected.",
  },
};

export const zh = {
  app: {
    // Splash / boot
    restoringSession: "正在恢复你的会话…",
    startingApp: "正在启动 OpenWorker…",

    // Automation-run toast
    automationStarted: "自动化已开始",
    automationRunTime: "{{title}} · {{time}} 运行",
    viewRun: "查看运行 ›",
    dismiss: "关闭",

    // Sidebar / nav reveal
    showSidebar: "显示侧边栏",
    showSidebarShortcut: "显示侧边栏 (⌘B)",
    newSession: "新建会话",
    search: "搜索",

    // Topbar
    artifacts: "产物",
    artifactsTitle: "显示此对话生成的文件",
    showSidePanel: "显示侧边面板",
    hideSidePanel: "隐藏侧边面板",

    // Run banner
    scheduledRun: "计划运行",
    runBannerByAutomation: "· 由自动化启动",
    backToRuns: "← 返回运行列表",

    // Empty-state hero
    howCanIHelp: "我能帮你做什么？",
    letsBuild: "一起来做点什么吧。",
    tryATask: "试一个任务",

    // Suggestions
    suggestRunTests: "运行测试套件并总结任何失败。",
    suggestOverview: "阅读项目并给我一个 5 点概述。",
    suggestFixBuild: "查找并修复失败的构建。",

    // Streaming / waiting
    assistantLabel: "助手",
    jumpToLatest: "跳到最新",
    waitingForAgent: "正在等待 agent...",
    compactingContext: "正在压缩上下文…",

    // Composer placeholders
    placeholderCode: "让程序员构建、修复或解释… （拖入或粘贴文件）",
    placeholderChat: "随便问…  （拖入或粘贴文件）",
    placeholderCowork: "问问 coworker…  （拖入或粘贴文件）",

    // Default session title
    newSessionTitle: "新会话",

    // Fallback title for an automation-run toast before the task title arrives
    automationDefaultTitle: "自动化",

    // Transcript notices (frontend fallbacks — the server usually sends d.text)
    noticeMaxIterations: "已停止：达到最大迭代次数。",
    noticeModelSwitched: "已切换模型",
    noticeCompacted: "已压缩上下文",
    noticeInterrupted: "已中断。",
    noticeError: "错误：{{msg}}",
    unknownError: "未知",
    noticeRejected: "该消息已被拒绝。",
  },
};
