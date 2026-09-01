# 資料撰寫任務指引（給子代理人）

你負責替「FF14 副本小抄」網頁 App 撰寫**一個**資料檔。專案根目錄：`/Users/litaicheng/Desktop/ff14`

## 步驟

1. 先讀 `SCHEMA.md`（資料格式）和 `data/_example.js`（完整範例）。**格式必須完全一致**。
2. 依你被指派的副本清單，撰寫 `data/<指定檔名>.js`。每場副本一個物件，全部放在同一個 `window.FF14_DATA.push(...)` 內。
3. 陸服（簡體中文）名稱要正確：副本名、Boss 名、技能名請用 WebSearch / WebFetch 查證，優先來源：
   - 灰機 wiki：`https://ff14.huijiwiki.com/wiki/副本名`（副本頁面通常會列 Boss 與技能的中/英/日文名）
   - `https://garlandtools.cn` 或 `https://www.garlandtools.org/db/#instance/<id>`（切 zh）
   - 英文機制細節可參考 `https://ffxiv.consolegameswiki.com/wiki/<Duty_Name>`、`https://ffxiv.gamerescape.com`
   - 中文攻略可參考灰機 wiki 副本頁的「攻略」段落、NGA 論壇整理
   你對機制本身通常已經熟悉，**查證重點是名詞翻譯與新版本（7.x）內容**；不要為了每個技能都去抓整頁，先抓副本總覽頁把名詞一次拿齊。
4. 寫完後執行 `node scripts/validate.js data/<檔名>.js`，錯誤全部修到通過為止。
5. **不要修改其他任何檔案**（不要動 manifest.js、app.js、其他資料檔）。

## 內容要求（再強調）

- 說明文字：**繁體中文**、口語、精簡，像在副本裡邊打邊看。每個機制 `desc`＝看到什麼、`solve`＝怎麼做，要具體（方向、位置、誰負責）。
- 名詞：`cn` 用陸服簡體官方翻譯，`en` 用英文官方名，`tw` 是 cn 的繁體版（給搜尋用）。
- `aliases` 放常見簡稱（例如「沙斯塔夏」「水虎鱼」「水虎魚」「O1」「E4」「P8」「M2」「巴哈T5」等，簡繁都放）。
- 每個 Boss：至少涵蓋所有致死/需處理的機制，依出現順序排列；`danger` 1~3 要標。
- 4人迷宮：`route` 填道中重點（怪可不可以拉一起、機關/鑰匙、捷徑、要避開的陷阱）。
- 討伐戰／大型任務：mechanics 依時間軸順序，`phase` 標出現時機。
- 等級同步後的現況為準（舊本改版後以改版後為準，例如 6.1 重製的巴哈姆特迷宮/ARR 主線本）。
- 不寫劇情、不寫廢話。
- id 命名：`<expansion>-<英文名 kebab>`，困難版加 `-hard`，極加 `-ex`，例如 `arr-sastasha`、`arr-sastasha-hard`、`dt-valigarmanda-ex`、`sb-omega-o5`、`shb-eden-e8`、`ew-pandaemonium-p12`、`dt-arcadion-m4`、`arr-coil-t5`。

## 完成後回報

用 10 行以內回報：寫了哪些副本（數量）、驗證是否通過、哪些名詞或機制你不確定（列出來即可，不用長篇）。

## 絕本（type "ultimate"）補充規則

- 一場絕本 = 一個物件；`bosses` 陣列用「階段」分段（例如 P1 双塔尼亚、P2 奈尔、P3 巴哈姆特…），`name.cn/en` 填該階段的 Boss 名，`summary` 一句話講該階段核心。
- `mechanics` 依時間軸順序，`phase` 填該機制在階段內的位置或大約時間（例如「P2 開場」「P5 第 3 個機制」）。
- `solve` 寫**目前野團主流打法**。陸服與國際服主流打法不同時，主寫陸服（NGA／灰機／B 站攻略常見打法），並用一句話註明國際服差異（例如「國際服 PF 常用 ○○ 法」）。不確定哪邊主流就寫國際服 PF 常見打法並註明。
- 絕本機制很多，優先寫「會團滅／會死人」的機制，小傷害可併成一條。每階段機制要齊，但一條機制的文字不要超過 3～4 行。
- `route` 可以放整場的階段順序與狂暴時間、Boss 血量檢查點（例如「P1 必須在 x 分前打到 y%」）。
- `notes` 放：分攤/分散通用口訣、常見死法、需要的減傷輪次提醒等。
