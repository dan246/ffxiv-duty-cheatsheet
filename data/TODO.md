# 稽核後待確認清單

2026-09-01 已完成全資料第二輪稽核；舊清單中的「憑記憶／推測」不得再當作仍有效的資料來源。

## 已完成

- 369 場副本均綁定唯一 `ContentFinderCondition` 列；正式中英文名、內容類型、隊伍人數、等級、最低裝等已逐筆比對。
- 103 場四人迷宮的舊 TODO 已逐項核對；證據與修正記錄見 `audit_dungeons.md`。
- 103 場討伐／殲滅戰的舊 TODO 已逐項核對，未確認項為 0；見 `audit_trials.md`。
- 73 場普通 8 人團本與 18 場普通 24 人聯盟本的舊 TODO 已逐項核對；見 `audit_raids_alliance.md`。
- E9N、E9S、暗黑之雲誅滅戰分別使用 `cfc:749`、`cfc:750`、`cfc:1010`，不使用名稱或別名互斥特例。

## 明確標為說明性標籤、不是官方技能讀條

- Qarn Hard `Shifting Sands`：場地流沙說明。
- Stigma-4 `Transformation`：外觀變化提示。
- O2 `Aetherial Rift` 的簡中標籤：無獨立本地化讀條可供核對。
- World of Darkness 黃色 comet towers：機制描述，非獨立技能讀條。

這些項目必須在資料中標示為「機制／說明」，不可移除標記後冒充官方技能名。

## 持續性工作

- 新版本上線後重新抓取官方 CFC 目錄，執行 `node scripts/audit_official_identity.js`。
- 修改路由或 manifest 後執行 `node scripts/audit_routes.js`。
- 修改高難攻略後執行 `node scripts/audit_high_end.js`，並人工確認攻略作者、版本與流派內容；格式通過不等於攻略已核實。
