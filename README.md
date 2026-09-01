# FF14 副本小抄

進副本前搜一下副本名，每隻 Boss 的機制「看到什麼 → 怎麼做」一頁看完。
純靜態網頁，沒有 build 步驟、沒有框架、可離線。

## 使用

- **直接開**：雙擊 `index.html`（用 Chrome/Edge/Safari 開即可，資料檔用 `<script>` 載入，不會被 file:// 擋）。
- **單檔版**：`node scripts/build.js` 會輸出 `dist/ff14-cheatsheet.html`，所有資料內嵌在一個檔案裡，可以丟到手機、平板、第二螢幕的瀏覽器直接開。
- **架站**：整個目錄丟到 GitHub Pages / Cloudflare Pages / 任何靜態空間都能跑。

### 操作

| 動作 | 說明 |
|---|---|
| `/` | 聚焦搜尋框 |
| `Enter` | 開啟第一個搜尋結果 |
| `Esc` | 清除搜尋 |
| 精簡 | 只顯示機制名＋解法，副本裡邊打邊看用 |
| A− / A+ | 調字級 |
| ☆ | 收藏（存在瀏覽器 localStorage） |
| 機制篩選 | 副本頁上方：危險度「全部 / 要處理 ≥2 / 只看會死 ★3」× 職能「全 / T / H / D」，全站記住 |
| /echo 巨集 | 每隻 Boss 與整本各一顆，複製後貼進遊戲「使用者巨集」，開王前按一下就印在自己的聊天欄 |

### 在遊戲裡看

遊戲沒有瀏覽器，實戰中也沒空讀整段文字，所以改用遊戲內建的 `/echo`（只有自己看得到的訊息）：

1. 副本頁展開「/echo 巨集」→ 複製。內容套用目前的機制篩選，用「只看會死」可把行數壓進 15 行；超過會自動拆成多顆（每顆 15 行、每行 ≤60 字，都在遊戲規格內）。
2. 遊戲內 系統 → 使用者巨集 → 選一格 → 內容欄貼上 → 拖到熱鍵列。
3. 建議新增一個聊天分頁、記錄篩選只勾「回聲」，再把分頁拖出成獨立視窗放在畫面角落，戰鬥訊息就不會把小抄洗掉。
4. 開王前按一下巨集。每行格式：`★` 會死、`◆` 要處理、`·` 小事；`[T]/[H]/[D]` 表示只跟該職能有關。

介面、副本名、Boss、技能與攻略內容統一顯示繁體中文；搜尋仍支援陸服簡中原名、繁體、英文、常見簡稱（如「水虎魚」「O5」「P8」「巴哈T5」）與 Boss 名。

## 資料

- 說明文字：繁體中文；副本/Boss/技能名稱：陸服（簡體）＋英文。
- 每場副本一個物件，放在 `data/*.js`；檔案清單在 `data/manifest.js`。
- 格式規範見 [`SCHEMA.md`](SCHEMA.md)，完整範例見 `data/_example.js`。
- 新增/修改後依序執行：
  - `node scripts/validate.js`：格式、唯一身分與內容完整性。
  - `node scripts/audit_official_identity.js`：逐筆對照官方 CFC 目錄。
  - `node scripts/audit_routes.js`：全量 hash 路由唯一性。
  - `node scripts/audit_high_end.js`：零式／絕／滅聯盟的逐本宏、站位與來源缺口。
  - `node scripts/audit_traditional_display.js`：繁體顯示覆蓋與 URL／官方鍵保留檢查。
- 資料文字有更新時，先執行 `python3 scripts/generate_zh_tw_map.py` 重新產生離線繁體對照表。

### 目錄

```
index.html          入口
css/style.css       樣式
js/app.js           App 邏輯（搜尋、路由、渲染）
data/manifest.js    資料檔清單
data/*.js           副本資料（依資料片、類型分檔）
scripts/validate.js 資料驗證
scripts/audit_official_identity.js 官方身分逐筆稽核
scripts/audit_routes.js 全量路由稽核
scripts/audit_high_end.js 高難攻略來源與逐本內容稽核
scripts/audit_traditional_display.js 繁體顯示稽核
scripts/generate_zh_tw_map.py 產生離線繁體顯示表
scripts/build.js    打包成單一 HTML
```

## 涵蓋範圍

2.0 ～ 7.51：4 人迷宮、討伐戰（普通/困難/極）、8 人大型任務（普通/零式/絕）、24 人聯盟與滅聯盟高難。

零式收錄全部 64 場官方獨立副本（ARR 只有入侵之章 1～4 另設零式）；絕本收錄全部 7 場，包含 7.51 `Dancing Mad (Ultimate)`；滅聯盟獨立收錄 7.15 `The Cloud of Darkness (Chaotic)`。每場以官方 Duty ID、內容類型與玩家數建立獨立身分，不以首領名稱推測副本。高難條目會直接寫出採用的解法、分隊站位、優先級與「看到什麼 → 怎麼做」；整理宏會明示並非原作者逐字宏。只有能確認與該流派相符的圖文頁才標為站位圖，純影片或不同流派圖片不會冒充配套圖。
