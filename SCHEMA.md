# 資料格式規範（data/*.js）

每個資料檔是一個純 JS 檔，會被 `index.html` 以 `<script>` 載入（不用 build、可直接 file:// 開啟）。
檔案開頭固定：

```js
window.FF14_DATA = window.FF14_DATA || [];
window.FF14_DATA.push(
  { ...副本1 },
  { ...副本2 }
);
```

## 語言規則（很重要）

- **說明文字（overview / route / summary / desc / solve / tips / notes）一律用繁體中文**，口語、精簡、像在副本裡邊打邊看的小抄。
- **專有名詞（副本名、Boss 名、技能/機制名）的 `cn` 欄位用陸服（簡體中文）官方翻譯**，`en` 欄位用國際服英文官方名稱。
  - 陸服名稱可在 https://ff14.huijiwiki.com 、 https://garlandtools.cn 或 https://www.garlandtools.org（切換語言 zh）查證。
  - 找不到陸服翻譯的機制名，`cn` 可以自己意譯，但 `en` 一定要正確。
- 說明文字中提到 Boss 或技能時，直接寫陸服名（簡體），例如「吃到**旋风**會被擊飛」。
- 常用術語：坦克 T、治療 H、輸出 D（近戰/遠程）、擊退、死刑（tankbuster）、AOE、分攤、分散、點名、連線、踩塔、月環、鋼鐵（中心圈）、十字、直線、擴散、順劈、無敵、減傷。

## 欄位

```js
{
  id: "arr-sastasha",           // 必填，全域唯一，小寫 kebab-case，前綴用資料片代碼
  type: "dungeon",              // 必填：dungeon | trial | extreme | raid | savage | alliance | ultimate | other
                                //   dungeon=4人迷宮  trial=討伐戰(普通/困難)  extreme=極  raid=8人大型任務(普通)
                                //   savage=零式  alliance=24人聯盟  ultimate=絕
  expansion: "arr",             // 必填：arr | hw | sb | shb | ew | dt
  patch: "2.0",                 // 必填，字串
  level: 15,                    // 必填，等級同步等級（副本等級）
  ilvl: null,                   // 選填，最低裝等
  name: {
    cn: "沙斯塔夏溶洞",          // 必填，陸服名（簡體）
    en: "Sastasha",             // 必填，英文名
    tw: "沙斯塔夏溶洞",          // 必填，cn 的繁體字版本（給搜尋用；字型一樣就照抄）
  },
  aliases: ["沙斯塔夏", "水虎鱼", "水虎魚"],  // 選填，搜尋用別名/簡稱（簡繁都放）
  overview: "一句話總結整個副本的重點",           // 必填
  route: "道中/路線提示，可多行用 \n 分隔",        // 選填（4人本建議填：怪要不要拉一起、鑰匙/機關怎麼開）
  bosses: [                     // 必填，至少 1 個
    {
      name: { cn: "巧舌的萧", en: "Chopper" },   // 必填
      summary: "一句話：這隻 Boss 的核心是什麼",     // 必填
      mechanics: [              // 必填，至少 1 個，依出現順序排列
        {
          name: { cn: "沼气", en: "Bog Bomb" },   // 必填
          desc: "表現：看到什麼（讀條、地板、buff、點名標記…）",  // 必填
          solve: "解法：要怎麼跑、誰做什麼",                       // 必填
          role: "all",          // 選填：all | T | H | D，預設 all
          danger: 2,            // 選填 1~3：1=小傷害/無視也行 2=要處理 3=會死/會團滅
          phase: "P2 / 血量 50% 以下"  // 選填，何時出現
        }
      ],
      tips: ["補充提醒（陣列）"],   // 選填
    }
  ],
  notes: ["整個副本的額外提醒，例如：這本掉落什麼、坐騎、成就"],  // 選填
}
```

## 撰寫品質要求

- 每個 Boss 至少列出所有會致死或需要處理的機制；小傷害可略。
- `desc` 是「看到什麼」，`solve` 是「怎麼做」，兩者要分開、要具體（方向、位置、誰負責）。
- 有固定順序/時間軸的 Boss（討伐戰、大型任務），mechanics 依出現順序排。
- 多次重複的機制只寫一次，之後用 phase 或 tips 說明變化。
- 不要寫廢話、不要寫劇情，只寫打法。
- 等級同步後的正確資訊為準（例如舊本改版後的機制）。
