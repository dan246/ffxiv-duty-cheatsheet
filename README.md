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

搜尋支援：陸服名（簡體）、繁體、英文、常見簡稱（如「水虎魚」「O5」「P8」「巴哈T5」）、Boss 名。

## 資料

- 說明文字：繁體中文；副本/Boss/技能名稱：陸服（簡體）＋英文。
- 每場副本一個物件，放在 `data/*.js`；檔案清單在 `data/manifest.js`。
- 格式規範見 [`SCHEMA.md`](SCHEMA.md)，完整範例見 `data/_example.js`。
- 新增/修改後執行 `node scripts/validate.js` 檢查格式。

### 目錄

```
index.html          入口
css/style.css       樣式
js/app.js           App 邏輯（搜尋、路由、渲染）
data/manifest.js    資料檔清單
data/*.js           副本資料（依資料片、類型分檔）
scripts/validate.js 資料驗證
scripts/build.js    打包成單一 HTML
```

## 涵蓋範圍

2.0 ～ 7.5：4 人迷宮、討伐戰（普通/困難/極）、8 人大型任務（普通）、24 人聯盟。
零式與絕尚未收錄（格式已支援 `type: "savage" | "ultimate"`，可自行加）。
