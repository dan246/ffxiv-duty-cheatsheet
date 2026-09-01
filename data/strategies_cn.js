// 高难攻略来源完整性保护层。
// 不生成跨副本共用的「万能宏」、站位或图片：只有各副本资料中明确写入、
// 且能对应到该副本／流派来源的内容，才允许显示为宏或站位。
(function () {
  "use strict";
  const data = window.FF14_DATA || [];

  // 旧实现会为每一场零式／绝本自动塞入完全相同的八方宏，并把来源页
  // 自动当作 diagramUrl。那不是逐本宏，也不能证明来源页含对应站位图。
  // 这里只替现有的、逐本写入的宏补充来源声明，不再伪造缺失内容。
  data.forEach((d) => {
    if (!["savage", "chaotic", "ultimate"].includes(d.type) || !d.strategies?.length) return;
    const primary = d.strategies.find((strategy) => strategy.primary) || d.strategies[0];
    for (const strategy of d.strategies) {
      if (strategy.macro && !strategy.macroStatus) {
        strategy.macroStatus = "此宏仅对应本条目注明的副本与打法；为本站依公开站位整理的确认摘要，并非逐字复制原作者宏。";
      }
    }
    if (!primary.macro) primary.macroStatus = "未找到可核实、可逐字对应本流派的公开宏；不显示跨副本通用八方模板。请按本页逐招解法与原攻略确认分工。";
    if (!primary.positions) primary.positionsStatus = "未找到可核实的原作者整套站位文本；角色位置保留在本页逐招解法中，不把共用八方模板冒充本流派站位。";
    if (!primary.diagramUrl) primary.diagramStatus = "未找到可核实的原作者公开站位图；不把视频首页或其他攻略页自动标成站位图。";
  });
})();
