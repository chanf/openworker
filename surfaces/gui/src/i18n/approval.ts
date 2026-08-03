// Translation slice for the ApprovalCard surface. Each slice exports en + zh under
// its own top-level namespace; i18n.tsx merges them and type-checks zh against en.
export const en = {
  approval: {
    // TOOL_VERBS — human verbs for the §25 grant lines (factory-built).
    verbWriteFile: "Write a file",
    verbReplaceInFile: "Edit a file",
    verbApplyPatch: "Apply a patch",
    verbRunShell: "Run a command",
    verbSendMessage: "Send a message",
    verbSendFile: "Send a file",
    // scopeNote — plain-words scope note.
    actsConnector: "acts on a connected service",
    leavesMac: "leaves this computer → {{dest}}",
    connectedChat: "a connected chat",
    staysMac: "stays on this computer",
    overwritesSuffix: " · overwrites the existing file",
    // save_skill (SKILLS-SPEC §5.2)
    saveSkillScope: "saves to Settings ▸ Skills",
    saveSkillAdd: "Add to my skills",
    saveSkillNotNow: "Not now",
    saveSkillFooter:
      "Approving adds it to your skills on this computer — usable in every conversation from then on.",
    // PreviewBlock
    showLess: "show less",
    showAllLines: "show all {{n}} lines",
    showFull: "show the full message",
    // Buttons
    allow: "Allow",
    allowOnce: "Allow once",
    alwaysAllow: "Always allow",
    alwaysAllowEveryTime: "Allow every time",
    alwaysAllowCommand: "Always allow this command",
    deny: "Deny",
    alwaysTaskTitle:
      "Always allow {{name}} → {{target}} for “{{title}}” — revoke any time on its Automations page",
    thisAutomation: "this automation",
    alwaysToolTitle: "Always allow {{verb}} for this session",
    // compact row peek toggle
    preview: "preview",
    // send_file chip
    fileFallback: "file",
    asScreenshot: " · as a PNG screenshot",
    withMessage: "With the message",
    // grants
    grantWriteNote: " — always allowed once you approve",
    grantReadNote: " — read-only",
    // resolved
    approved: "Approved: {{state}}",
    // shield tooltip
    toolTitle: "Tool: {{name}}",
  },
};

export const zh = {
  approval: {
    // TOOL_VERBS
    verbWriteFile: "写入文件",
    verbReplaceInFile: "编辑文件",
    verbApplyPatch: "应用补丁",
    verbRunShell: "运行命令",
    verbSendMessage: "发送消息",
    verbSendFile: "发送文件",
    // scopeNote
    actsConnector: "作用于已连接的服务",
    leavesMac: "离开本机 → {{dest}}",
    connectedChat: "已连接的聊天",
    staysMac: "停留于本机",
    overwritesSuffix: " · 覆盖现有文件",
    // save_skill (SKILLS-SPEC §5.2)
    saveSkillScope: "保存到设置 ▸ 技能",
    saveSkillAdd: "添加到我的技能",
    saveSkillNotNow: "暂不需要",
    saveSkillFooter: "批准后会将技能添加到本机——之后在每次对话中均可使用。",
    // PreviewBlock
    showLess: "收起",
    showAllLines: "显示全部 {{n}} 行",
    showFull: "显示完整消息",
    // Buttons
    allow: "允许",
    allowOnce: "允许一次",
    alwaysAllow: "始终允许",
    alwaysAllowEveryTime: "每次允许",
    alwaysAllowCommand: "始终允许此命令",
    deny: "拒绝",
    alwaysTaskTitle: "始终允许 {{name}} → {{target}}（针对“{{title}}”）——可在其 Automations 页面随时撤销",
    thisAutomation: "此自动化",
    alwaysToolTitle: "在本会话中始终允许 {{verb}}",
    // compact row peek toggle
    preview: "预览",
    // send_file chip
    fileFallback: "文件",
    asScreenshot: " · 作为 PNG 截图",
    withMessage: "附带消息",
    // grants
    grantWriteNote: " ——一旦批准将始终允许",
    grantReadNote: " ——只读",
    // resolved
    approved: "已批准：{{state}}",
    // shield tooltip
    toolTitle: "工具：{{name}}",
  },
};
