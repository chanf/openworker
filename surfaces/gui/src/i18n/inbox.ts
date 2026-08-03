// Translation slice for the Inbox surface (InboxView + InboxConfigure). Each slice
// exports en + zh under its own top-level namespace; i18n.tsx merges them and
// type-checks zh against en there.
export const en = {
  inbox: {
    // InboxView — page head + tabs
    title: "Inbox",
    sub: "Approvals, questions, and notifications from your coworkers — including sessions running unattended.",
    tabPending: "Pending",
    tabConfigure: "Configure",
    // KIND_TABS
    tabAll: "All",
    tabApprovals: "Approvals",
    tabQuestions: "Questions",
    allCoworkers: "All coworkers",
    // empty states
    emptyAll: "Nothing pending.",
    emptyFilter: "Nothing pending for this filter.",
    // session chip
    openSession: "Open “{{label}}”",
    sessionUnavailable: "Session unavailable",
    // routing status line
    alsoDelivered: "Also delivered to {{label}} — replies there resolve items here.",
    deliveredHereOnly: "Delivered here only.",
    connectSlackHint:
      "Delivered here only. Connect Slack (Connectors page) to also get these in a channel — more platforms later.",
    configureLink: "Configure ›",

    // InboxConfigure — Unrouted section head
    unroutedHeading: "Unrouted",
    unroutedDesc:
      "Inbound messages and background-turn failures nothing claimed — nothing vanishes silently.",
    // InboxRoutingCard
    approvals: "Unattended approvals",
    mirrorDescPre: "Channel where an Unattended session posts Approve/Deny buttons. Currently mirroring to",
    mirrorDescPost: ".",
    inAppOnly: "in-app Inbox only",
    set: "Set",
    clear: "clear",
    missingOwner: "Choose an approval owner under Integrations → Slack before routing approvals here.",
    errUpdate: "Could not update Inbox routing.",
    errClear: "Could not clear Inbox routing.",
    // DmRouteCard
    directMessages: "Direct messages",
    dmDesc: "Session that handles DMs to the bot. With none, DMs park under Unrouted below.",
    noSessionPark: "No session — park DMs",
    // SubscriptionsCard
    channelSubs: "Channel subscriptions",
    subsInbound: "— sessions that listen to a channel (inbound)",
    thSession: "Session",
    thListensTo: "Listens to",
    thRoutesTo: "Inbox routes to",
    collides: "⚠ collides",
    collidesTitle:
      "This channel is also your Inbox-routing target — inbound and outbound on one channel conflate broadcast with request/reply.",
    unsubscribe: "Unsubscribe",
    noSubs: "No channel subscriptions yet — add one below or ask a coworker to watch a channel.",
    chooseSession: "Choose a session…",
    subscribe: "+ Subscribe",
    // UnroutedTable
    unroutedEmpty: "Nothing here — no dropped messages or failed turns.",
    thWhen: "When",
    thSource: "Source",
    thReason: "Reason",
    thMessage: "Message",

    // InboxItemCard — resolution controls
    send: "Send",
    approve: "Approve",
    orTypeOwnAnswer: "Or type your own answer…",
    yourAnswer: "Your answer…",
    noFolderSuggested: "No folder was suggested",
    grant: "Grant",
    grantNoFolder: "Grant (no folder)",
    reject: "Reject",
    dismiss: "Dismiss",
  },
};

export const zh = {
  inbox: {
    // InboxView — page head + tabs
    title: "收件箱",
    sub: "来自同事的审批、问题和通知——包括无人值守的会话。",
    tabPending: "待处理",
    tabConfigure: "配置",
    // KIND_TABS
    tabAll: "全部",
    tabApprovals: "审批",
    tabQuestions: "问题",
    allCoworkers: "所有同事",
    // empty states
    emptyAll: "没有待处理项。",
    emptyFilter: "该筛选条件下没有待处理项。",
    // session chip
    openSession: "打开“{{label}}”",
    sessionUnavailable: "会话不可用",
    // routing status line
    alsoDelivered: "同时发送到 {{label}}——在那里的回复会处理此处的待办。",
    deliveredHereOnly: "仅发送至此处。",
    connectSlackHint: "仅发送至此处。连接 Slack（在 Connectors 页面）即可同时在频道中接收——更多平台即将支持。",
    configureLink: "配置 ›",

    // InboxConfigure — Unrouted section head
    unroutedHeading: "未路由",
    unroutedDesc: "收到的消息和后台轮次失败没有被任何会话认领——不会有任何内容被静默丢弃。",
    // InboxRoutingCard
    approvals: "无人值守审批",
    mirrorDescPre: "无人值守会话发布批准/拒绝按钮的频道。当前镜像到",
    mirrorDescPost: "。",
    inAppOnly: "仅应用内收件箱",
    set: "设置",
    clear: "清除",
    missingOwner: "在 Integrations → Slack 下选择审批所有者，然后再将审批路由到此处。",
    errUpdate: "无法更新收件箱路由。",
    errClear: "无法清除收件箱路由。",
    // DmRouteCard
    directMessages: "私信",
    dmDesc: "处理发送给机器人的私信的会话。若未设置，私信将暂存到下方的“未路由”中。",
    noSessionPark: "无会话——暂存私信",
    // SubscriptionsCard
    channelSubs: "频道订阅",
    subsInbound: "——监听频道的会话（入站）",
    thSession: "会话",
    thListensTo: "监听",
    thRoutesTo: "收件箱路由到",
    collides: "⚠ 冲突",
    collidesTitle: "此频道也是您的收件箱路由目标——同一频道的入站和出站会把广播与请求/回复混在一起。",
    unsubscribe: "取消订阅",
    noSubs: "暂无频道订阅——在下方添加，或让某位同事监听某个频道。",
    chooseSession: "选择一个会话…",
    subscribe: "+ 订阅",
    // UnroutedTable
    unroutedEmpty: "这里空空如也——没有丢失的消息，也没有失败的轮次。",
    thWhen: "时间",
    thSource: "来源",
    thReason: "原因",
    thMessage: "消息",

    // InboxItemCard — resolution controls
    send: "发送",
    approve: "批准",
    orTypeOwnAnswer: "或输入您自己的答案…",
    yourAnswer: "您的答案…",
    noFolderSuggested: "未建议文件夹",
    grant: "授权",
    grantNoFolder: "授权（无文件夹）",
    reject: "拒绝",
    dismiss: "关闭",
  },
};
