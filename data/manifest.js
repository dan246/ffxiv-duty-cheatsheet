// 資料檔清單。app.js 會依序載入這些檔案；檔案不存在會被略過（不會壞掉）。
// 新增資料檔時把檔名加進來即可。
window.FF14_MANIFEST = [
  // 4人迷宮
  "dungeons_arr_a.js",   // 2.0 基礎 16 本
  "dungeons_arr_b.js",   // 2.1～2.55
  "dungeons_hw.js",
  "dungeons_sb.js",
  "dungeons_shb.js",
  "dungeons_ew.js",
  "dungeons_dt.js",
  // 討伐戰（普通/困難）＋ 極
  "trials_arr.js",
  "trials_hw.js",
  "trials_sb.js",
  "trials_shb.js",
  "trials_ew.js",
  "trials_dt.js",
  // 8人大型任務（普通）
  "raids_arr.js",        // 巴哈姆特大迷宮
  "raids_hw.js",         // 亞歷山大
  "raids_sb.js",         // 歐米茄
  "raids_shb.js",        // 伊甸
  "raids_ew.js",         // 萬魔殿
  "raids_dt.js",         // 阿卡狄亞
  // 高難 8 人任務
  "savage_arr_hw.js",    // 巴哈入侵零式＋亞歷山大零式
  "savage_sb.js",        // 歐米茄零式
  "savage_shb.js",       // 伊甸零式
  "savage_ew.js",        // 萬魔殿零式逐招小抄
  "savage_dt.js",        // 阿卡狄亞零式逐招小抄（7.05～7.4）
  "ultimate.js",         // 歷代絕本（4.11～7.51）
  "chaotic_dt.js",       // 7.15 滅聯盟高難
  "strategies_cn.js",    // 补齐所有零式／绝本的国服主流打法入口
  // 24人聯盟
  "alliance_arr_hw.js",
  "alliance_sb_shb.js",
  "alliance_ew_dt.js",
];
