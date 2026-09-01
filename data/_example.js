// 範例資料檔（不在 manifest 內，僅供撰寫參考；內容與 dungeons_arr_a.js 的 Sastasha 相同）
window.FF14_DATA = window.FF14_DATA || [];
window.FF14_DATA.push(
{
  "id": "arr-sastasha",
  "type": "dungeon",
  "expansion": "arr",
  "patch": "2.0",
  "level": 15,
  "ilvl": null,
  "name": {
    "cn": "沙斯塔夏溶洞",
    "en": "Sastasha",
    "tw": "沙斯塔夏溶洞"
  },
  "aliases": [
    "沙斯塔夏",
    "水虎鱼",
    "水虎魚",
    "海盗洞",
    "海盜洞",
    "天然要害"
  ],
  "overview": "新手第一本。三隻 Boss 都很單純，重點是門口珊瑚顏色、鑰匙開門、尾王的閥門。",
  "route": "1. 入口的「血書」會提示藍/紅/綠其中一色，去點對應顏色的珊瑚（點錯會刷怪），再按旁邊的開關叫出第一王。\n2. 第一王後怪會掉 **船长室钥匙**，開南邊船長室；裡面小怪掉 **潮乘门钥匙**，開西南出口的門。\n3. 道中怪可以兩三包一起拉，傷害很低。",
  "bosses": [
    {
      "name": {
        "cn": "锐牙长须豹",
        "en": "Chopper"
      },
      "summary": "只有一招圈圈，出圈就好。",
      "mechanics": [
        {
          "name": {
            "cn": "蓄能晶须",
            "en": "Charged Whisker"
          },
          "desc": "王周圍一圈 AOE，吃到會麻痺。",
          "solve": "看到讀條就離開王身邊，T 也可以退出來。",
          "danger": 1
        }
      ]
    },
    {
      "name": {
        "cn": "麦迪逊船长",
        "en": "Captain Madison"
      },
      "summary": "打兩次；第一次他會逃走，第二次半血叫狗。",
      "mechanics": [
        {
          "name": {
            "cn": "扬沙",
            "en": "Sandslinger"
          },
          "desc": "對 T 上命中率下降 debuff。",
          "solve": "H 有康復就解，沒有就無視。",
          "role": "H",
          "danger": 1
        },
        {
          "name": {
            "cn": "坏血野狗",
            "en": "Scurvy Dog"
          },
          "desc": "第二次戰鬥 50% 血時叫出幾隻狗。",
          "solve": "T 把狗拉到王旁邊一起 AOE，狗先死。",
          "danger": 1,
          "phase": "第二次戰鬥 50%"
        }
      ],
      "tips": [
        "第一次打到一定血量他會跑掉，不用追，繼續清路。"
      ]
    },
    {
      "name": {
        "cn": "海虎牙 邓恩",
        "en": "Denn the Orcatoothed"
      },
      "summary": "尾王。扇形吐息躲側面，場邊四個排水口冒泡就去點。",
      "mechanics": [
        {
          "name": {
            "cn": "水力球",
            "en": "Hydroball"
          },
          "desc": "對 T 方向的扇形 AOE，吃到會沉默。",
          "solve": "非 T 站王側面/後面。",
          "danger": 1
        },
        {
          "name": {
            "cn": "排水口冒泡",
            "en": "Grates (Unnatural Ripples)"
          },
          "desc": "場邊四角的排水口會冒泡，放著會刷出水怪。",
          "solve": "看到冒泡的人走過去點一下就關掉；沒冒泡的不要點。其實小怪很弱，直接打王也行。",
          "danger": 1
        }
      ]
    }
  ],
  "notes": [
    "困難版「沙斯塔夏溶洞（困难）／Sastasha (Hard)」是 Lv50 另一本，機制完全不同。"
  ]
}
);
