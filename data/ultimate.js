// 歷代絕本（截至 7.51）。每頁固定一套角色位置與解法，不把解題外包給隊伍宏。
window.FF14_DATA = window.FF14_DATA || [];
(function () {
  "use strict";
  const POS = "角色八方：MT北、ST南、H1西北、H2東北、D1西南、D2東南、D3西、D4東；LP1＝MT/H1/D1/D3（西），LP2＝ST/H2/D2/D4（東）；搭檔＝MT+D3、ST+D4、H1+D1、H2+D2；優先級＝MT＞ST＞D1＞D2＞D3＞D4＞H1＞H2。";
  const CFC = {"sb-ucob":280,"sb-uwu":539,"shb-tea":694,"ew-dsr":788,"ew-top":908,"dt-fru":1006,"dt-dmu":1094};
  const STRAT = {
    "sb-ucob":"Ultimate Uncoiled 跨資料中心 PF 基準",
    "sb-uwu":"Ultimate Uncoiled 跨資料中心 PF 基準",
    "shb-tea":"Elemental 1256/3478 基準",
    "ew-dsr":"Elemental／Tuufless PF 基準",
    "ew-top":"Elemental／Tuufless PF 基準",
    "dt-fru":"Elemental Bowtie PF 基準",
    "dt-dmu":"中文圈角色八方基準",
  };
  const SOURCES = {
    "sb-ucob":"https://ultistrats.com/guides/ucob",
    "sb-uwu":"https://ultistrats.com/guides/uwu",
    "shb-tea":"https://ultistrats.com/guides/tea",
    "ew-dsr":"https://ultistrats.com/guides/dsr",
    "ew-top":"https://ultistrats.com/guides/top",
    "dt-fru":"https://ultistrats.com/guides/fru",
    "dt-dmu":"https://ultistrats.com/guides/umad/",
  };
  const CN_STRATS = {
    "sb-ucob":[
      {name:"暗搓搓文字攻略体系",primary:true,summary:"覆盖绝巴哈全阶段的国服文字攻略入口；各时期野队分组并不完全相同，进队仍须核对奈尔台词、三连优先级及双王分组。",positions:"P1旋风与液体地狱按角色八方；P2奈尔台词按固定标点；P3各三连使用同一套优先级；P4双T分王；P5按坦克LB与减伤表。",macroStatus:"本站依已核实逐招解法整理，非原作者宏；仅供开场核对本页分组，不代表国服唯一主流。",macro:"/p ■UCOB｜本站逐招核对摘要（非原作者宏）\n/p P1 火球：LP1西／LP2东；Hatch点名进拘束装置\n/p P1 液体地狱沿边同向五滩；Twister读条末各自同向一步\n/p P2 雷外放、火球两小队轮流；Doom按短→长一人一白圈\n/p P3 黑炎：H1/H2/D1/D2四斜；MT北/ST南/D3西/D4东补塔\n/p P3 进军火球LP1西/LP2东；八重奏从最后分身旁同向跑\n/p P4 双T分王并控血；P5 Teraflare指定T交LB3",diagramUrl:"https://ff14.org/handbooks/ubahamut/",source:{label:"暗搓搓绝巴哈文字攻略",url:"https://ff14.org/handbooks/ubahamut/"}},
      {name:"Gusty 6.0 野队补完 P1",summary:"该链接只覆盖双塔尼亚 P1，并明确以暗搓搓文字攻略与当时野队打法制作；不能当成 P2～P5 的视频来源。",source:{label:"Gusty 绝巴哈攻略补完 P1",url:"https://www.bilibili.com/video/BV1zV4y1E7SQ/"}},
      {name:"一水泠露 P2 奈尔完整稿",summary:"只覆盖 P2 奈尔阶段，用于核对奈尔台词与现行野队细节；不宣称覆盖 P1 或后续三连、双王、黄金巴哈。",source:{label:"绝巴哈野队整合 P2 完整稿",url:"https://www.bilibili.com/video/BV1xM4m1R74J/"}},
    ],
    "sb-uwu":[
      {name:"菜菜的橙子国服野队整合",primary:true,summary:"Bilibili 合集分为风神、火神、土神和本体四篇；当前链接打开本体篇，页面合集可进入其余三篇。本体含三次运动会。没有跨所有野队版本的唯一通用宏，需核对三连桶、觉醒方式和三运跑法。",positions:"三蛮神按各篇固定标点觉醒；本体一至三运沿用整合攻略分组，球线与LB按队伍减伤表执行。",macroStatus:"本站依已核实逐招解法整理，非原作者宏；仅供开场核对本页分组，不代表国服唯一主流。",macro:"/p ■UWU｜本站逐招核对摘要（非原作者宏）\n/p 风神 Mesohigh两组东西轮换；低气压按LP1→LP2消层\n/p 火神 Searing Wind治疗远离；Eruption沿边同向三滩\n/p 土神石牢：D1西／D2南／D3东，D4标记西→南→东击破\n/p Predation北侧起步：外躲钢铁→进火神冲锋旧线→贴泰坦侧\n/p Annihilation：LP1西球／LP2东球；灼热H南外放\n/p Suppression：T北线／H东西线／DPS南线；雷射在线尾外放",diagramUrl:"https://moeshen.cn/ffxiv/jsb/index.html",source:{label:"绝神兵国服野队整合攻略（合集入口：本体篇）",url:"https://www.bilibili.com/video/BV1TK4y1F7LE/"}},
      {name:"秋后本体三运详解",summary:"专门解释本体一运、二运、三运的完整跑法，用于补足整合攻略中最容易混用的部分。",source:{label:"绝神兵本体三次运动会",url:"https://www.bilibili.com/video/BV1Dr4y1T7y2/"}},
    ],
    "shb-tea":[
      {name:"友利郁也 Steak式／豆腐改",primary:true,summary:"国服完整 17P 超详解；P2 使用 Separe 豆腐改野队通用，P3 含至尊亚历山大，P4 含地火三穿一。原系列没有单一通用队伍宏，Limit Cut、麻将与 Wormhole 必须跟同一套编号。",positions:"P1八方引导；P2按1～8编号与Separe豆腐改；P3麻将采用Steak式／配套魔改；P4 Wormhole与地火依系列固定编号。",macroStatus:"本站依已核实逐招解法整理，非原作者宏；仅供开场核对本页分组，不代表国服唯一主流。",macro:"/p ■TEA｜本站逐招核对摘要（非原作者宏）\n/p P1 四DPS各拉一娃娃至象限，压血后依序喂水基佬\n/p P2 Limit Cut 1256西／3478东\n/p 二人圈搭档：MT-D3／ST-D4／H1-D1／H2-D2\n/p 水回LP1西／LP2东；雷去东西外圈单放\n/p P3 Wormhole按1～8固定路线；时间牢H1→D3→MT\n/p P4 Stillness停步停手／Motion持续移动；未来确定先看本人影子",source:{label:"友利郁也 TEA 超详解",url:"https://www.bilibili.com/video/av83454257/"}},
      {name:"菓子魔改麻将",summary:"P3二运常见国服优化：除1、2号外奇数左、偶数右，1号下灵泉、2号上灵泉；只能替换麻将段。",source:{label:"菓子魔改 P3 二运全视角",url:"https://www.bilibili.com/video/BV1WJ411q7nV/"}},
    ],
    "ew-dsr":[
      {name:"友利郁也 DSR 国服超详解",primary:true,summary:"完整九篇，从门神到骑龙神托尔丹；视频说明会随国服流行打法更新。此系列没有一份适配所有野队的统一宏，重点核对P2分塔、P3预站、P5骑士团和P6双龙分组。",positions:"P1按更新后的1.5运引导；P2优先级分塔；P3按编号预站；P5伪典固定骑士团处理；P6双T分龙；P7固定Exaflare路线。",macroStatus:"本站依已核实逐招解法整理，非原作者宏；仅供开场核对本页分组，不代表国服唯一主流。",macro:"/p ■DSR｜本站逐招核对摘要（非原作者宏）\n/p 门神 Brightwing双T王前左右轮换；其余六人王后\n/p P3 Dive from Grace按1/2/3及高低箭头；高跳远塔／低跳近塔\n/p P5救援：H1 LB3、MT挡NPC、ST接长枪、DPS打枪、H2补NPC\n/p P5死亡：MT/ST北南塔、H1/H2西东塔、DPS补四斜\n/p P6双T分龙；Mortal Vow MT→D1→D2→H2→D3→D4\n/p P7 Trinity：双T王前左右／指定近战王背最近；其余保持远",source:{label:"友利郁也 绝龙诗超详解",url:"https://www.bilibili.com/video/BV1Br4y1V7o7/"}},
    ],
    "ew-top":[
      {name:"MMW × 钰子烧国服攻略合集",primary:true,summary:"公开合集以独立视频覆盖 Part1、Part2、Part3&4 与 Part6，并另列 P1／P3 优化；本条主链接只打开 Part1，后续分集在下方逐项列出。没有一份能同时覆盖莫古力、MMW与各P5分支的统一宏，必须逐阶段核对。",positions:"P1 Program Loop／全能之主；P2男女组合；P3 Hello World；P5 Delta、Sigma、Omega；P6宇宙箭头与双治疗LB3，全部沿用同系列编号。",macroStatus:"本站依已核实逐招解法整理，非原作者宏；仅供开场核对本页分组，不代表国服唯一主流。",macro:"/p ■TOP｜本站逐招核对摘要（非原作者宏）\n/p P2同形：圆北／三角东／方南／叉西；男钢铁离／女月环贴\n/p P3 Monitor三人左中右朝外；其余五人王背\n/p P5 Delta近线MT>ST>D1>D2／远线D3>D4>H1>H2\n/p P5 Sigma：LP1西／LP2东；前两人踩塔、后两人接线，次轮互换\n/p P6 Cosmo Arrow：MT/H1北、ST/H2南、D1/D3西、D2/D4东\n/p Magic Number：第一次H1 LB3／第二次H2 LB3",source:{label:"MMW／钰子烧 绝欧米茄攻略 Part1",url:"https://www.bilibili.com/video/BV1pGWYe7E5U/"}},
      {name:"MMW × 钰子烧 Part2",summary:"MMW 同一公开合集的 Part2；只作为对应阶段来源，编号须与同系列其余分集一致。",source:{label:"绝欧米茄攻略 Part2",url:"https://www.bilibili.com/video/BV1pgWYeUEHD/"}},
      {name:"MMW × 钰子烧 Part3&4",summary:"MMW 同一公开合集的 Part3&4；覆盖范围以影片标题与分集为准。",source:{label:"绝欧米茄攻略 Part3&4",url:"https://www.bilibili.com/video/BV1TcWYeRER2/"}},
      {name:"MMW × 钰子烧 Part6",summary:"MMW 同一公开合集的最终 Part6；用于核对最终阶段，不替代 P5 运动会来源。",source:{label:"绝欧米茄攻略 Part6",url:"https://www.bilibili.com/video/BV1mcWYeREvu/"}},
      {name:"莫古力上下篇",summary:"国服另一主流完整体系；上篇覆盖P1～P4，下篇覆盖P5三运和P6。与MMW混用前先确认P5各运动会站位。",source:{label:"莫古力绝欧米茄下篇",url:"https://www.bilibili.com/video/BV1vz4y1B7xP/"}},
    ],
    "dt-fru":[
      {name:"Elemental Bowtie／Ulti Strats 全流程",primary:true,summary:"可核实的全流程来源；Light Rampant 采用 Bowtie 基准。中文圈各阶段常有不同改法，使用时不得把单一阶段视频扩写成全本攻略。",positions:"P1分摊回LP1西／LP2东，塔按同色近战内、远程外；P2 Diamond Dust角色八方，Light Rampant线组四斜拉Bowtie、无线组四正点踩圈，末塔LP1西／LP2东；P3短组北、中组东西、长组南；P4 Darklit红线LP1西、蓝线LP2东，Crystallize Time短北、中东西、长南；P5双T北侧分线，其余按两小队补塔与分摊。",macroStatus:"本站依已核实逐招解法整理，非原作者宏；仅供开场核对 Elemental Bowtie 分组，不代表国服唯一主流。",macro:"/p ■FRU｜本站逐招核对摘要（非原作者宏）\n/p P1分摊LP1西／LP2东；同色塔近战内／远程外\n/p P2 Diamond Dust角色八方；Light Rampant四线拉Bowtie、无线四人正点踩圈\n/p LR末塔LP1西／LP2东；镜像先绿镜、再按红镜换已炸处\n/p P3 Relativity：短组北／中组东西／长组南；凝视朝外\n/p P4 Darklit红线LP1西／蓝线LP2东；Crystallize短北／中东西／长南\n/p P5双T北侧分线；其余两小队补塔，Akh Morn回各H分摊",source:{label:"Ulti Strats FRU 全流程",url:"https://ultistrats.com/guides/fru"}},
      {name:"莫古力 P3 一运先行版",summary:"该 Bilibili 链接标题与内容范围均为 P3 一运先行版，不是 MMW×莫古力全流程攻略，也不含 P1、P2、P4、P5。",source:{label:"绝伊甸 P3 一运攻略先行版",url:"https://www.bilibili.com/video/BV16EifYaEeq/"}},
    ],
    "dt-dmu":[
      {name:"國服分階段組合（已核实 P2～P4）",primary:true,summary:"这不是单一作者的全流程攻略：本页只分列已核实的 P2 御坂豆腐闲固扇钢、P3 NOCCHH TLB 与 P4 通用按宏；P1／P5 仍以页面逐招与 Ulti Strats 全流程交叉核对。进队必须逐阶段确认，不能把三套编号直接类推。",positions:"P2 采用闲固扇钢配套标点；P3 采用 NOCCHH TLB 配套编号；P4 由观测者按配套宏提示。P1／P5 不冒充上述作者流派。",macroStatus:"本站依已核实逐招解法整理，非原作者宏；只覆盖已核实的 P2～P4 分阶段来源，不代表国服唯一主流。",macro:"/p ■DMU｜本站逐招核对摘要（非原作者宏；仅P2～P4）\n/p P2 Forsaken只在本人轮次与指定搭档进塔：扇朝外／圈单放／三人分摊\n/p P2 Trine从最后出现处起步进已炸区；双T Wings朝外\n/p P3 Chaos组MT/H1/D1/D2；Exdeath组ST/H2/D3/D4\n/p P3黑洞：支援／DPS各按Attack→Bind→Ignore排队\n/p P4真水分摊／假水分散；真雷分散／假雷分摊\n/p P4真凝视背对／假凝视看向；P1／P5不在此宏范围",diagramUrl:"https://www.bilibili.com/opus/1217241319957594120",source:{label:"御坂豆腐 P2 閒固扇鋼",url:"https://www.bilibili.com/opus/1217241319957594120"}},
      {name:"P3 NOCCHH TLB",summary:"P3 一運與麻將的 TLB 處理，作者在評論區附站位圖；不可與另一套 P2 分組直接類推。",source:{label:"NOCCHH P3 一運＋麻將",url:"https://www.bilibili.com/video/BV1zFE868ELh/"}},
      {name:"P4 通用按宏",summary:"由一人觀測後用宏提示全隊的通用思路；原攻略附宏文檔與配套練習。",source:{label:"P4 通用按宏",url:"https://www.bilibili.com/video/BV1eAEU6gEpK/"}},
    ],
  };

  const duties = [
    {
      id:"sb-ucob", expansion:"sb", patch:"4.11", level:70, ilvl:null, ilvlSync:345,
      cn:"巴哈姆特绝境战", tw:"巴哈姆特絕境戰", en:"The Unending Coil of Bahamut (Ultimate)", aliases:["UCOB","绝巴哈","絕巴哈","巴哈绝","巴哈絕"],
      phases:[
        ["双塔尼亚","Twintania","旋風、液體地獄、火球與魔力爆散；旋風出現時立即停手移動，拘束裝置留給轉場。"],
        ["奈尔·神·达纳斯","Nael deus Darnus","台詞技、隕石與龍俯衝；讀台詞判月環/鋼鐵/分攤，照標點放隕石。"],
        ["至尊巴哈姆特","Bahamut Prime","進軍、黑炎、災厄、天地與連擊五套三連；每套都按固定八人位置處理。"],
        ["双塔尼亚／奈尔","Twintania / Nael","雙王同場，拘束裝置、塔與俯衝重疊；兩 T 分王，按擊殺順序壓血。"],
        ["黄金巴哈姆特","Golden Bahamut","無盡頓悟後死亡輪迴、莫恩阿法與十億核爆；排好坦克 LB、換坦與全場減傷。"],
      ],
    },
    {
      id:"sb-uwu", expansion:"sb", patch:"4.31", level:70, ilvl:null, ilvlSync:375,
      cn:"究极神兵绝境战", tw:"究極神兵絕境戰", en:"The Weapon's Refrain (Ultimate)", aliases:["UWU","绝神兵","絕神兵","神兵绝","神兵絕"],
      phases:[
        ["迦楼罗","Garuda","低氣壓、羽毛與喚醒條件；正確用機制打醒蠻神，否則後段無法過關。"],
        ["伊弗利特","Ifrit","火柱、衝鋒與灼熱咆哮；被灼熱者遠離，柱與衝鋒依標點穿插。"],
        ["泰坦","Titan","地裂、炸彈、花崗岩牢獄與三連桌；石牢固定 D1西、D2南、D3東，D4 標記並依西→南→東擊破。"],
        ["究极神兵","The Ultima Weapon","Predation、Annihilation、Suppression；三蠻神連續出招，依本頁北起點與左右小隊移動。"],
        ["究极神兵（以太爆雷）","The Ultima Weapon (Aetheric Boom)","連線球、LB 檢定與連續究極；各職能依序 LB，球線按分組撞掉。"],
      ],
    },
    {
      id:"shb-tea", expansion:"shb", patch:"5.11", level:80, ilvl:null, ilvlSync:475,
      cn:"亚历山大绝境战", tw:"亞歷山大絕境戰", en:"The Epic of Alexander (Ultimate)", aliases:["TEA","绝亚","絕亞","绝亚历山大","絕亞歷山大"],
      phases:[
        ["有生命活水／液体之手","Living Liquid / Liquid Hand","Protean Wave、手掌與娃娃；八方向引導，娃娃壓血後在正確時間餵王。"],
        ["巡航驱逐者／正义号","Cruise Chaser / Brute Justice","Limit Cut、雷水冰火與雙王；按 1～8 號碼跑衝鋒，再依 debuff 分區。"],
        ["至尊亚历山大","Alexander Prime","時間停止、Inception 與次元斷絕；照時停 debuff 站位，水晶與真心不可打錯。"],
        ["亚历山大至尊","Perfect Alexander","Wormhole、Fate Calibration α/β；奇數西、偶數東依號碼進場，未來影像決定最終站位。"],
      ],
    },
    {
      id:"ew-dsr", expansion:"ew", patch:"6.11", level:90, ilvl:null, ilvlSync:605,
      cn:"幻想龙诗绝境战", tw:"幻想龍詩絕境戰", en:"Dragonsong's Reprise (Ultimate)", aliases:["DSR","绝龙诗","絕龍詩","龙诗绝","龍詩絕"],
      phases:[
        ["阿代尔斐尔／格里诺／沙里贝尔／泽菲兰","Ser Adelphel / Ser Grinnaux / Ser Charibert / Ser Zephirin","教皇廳門神；沙里贝尔的光翼、雙騎士衝鋒與泽菲兰長槍處理完後才取得本絕唯一檢查點。"],
        ["教皇托尔丹","King Thordan","Strength、Sanctity 與騎士團長組合；線、塔、隕石和凝視按固定優先級處理。"],
        ["邪龙之影","Nidhogg","Dive from Grace 與塔；按 1/2/3 debuff 排定跳躍、踩塔和落點。"],
        ["双眼","Nidhogg's Eyes","紅藍眼、連線與球；兩組控血並讓正確顏色連線穿過。"],
        ["教皇托尔丹（改写）","King Thordan (Rewind)","拯救奧爾什方後進入改寫時間線；按職能交 LB 並處理騎士團組合。"],
        ["尼德霍格／赫拉斯瓦尔格","Nidhogg / Hraesvelgr","雙龍冰火、咆哮與死亡輪迴；兩 T 分龍，任何死亡都可能觸發暴怒。"],
        ["龙神托尔丹","Dragon-king Thordan","Exaflare、Gigaflare、Akh Morn 與最終狂暴；固定跑火路線並排滿全場減傷。"],
      ],
    },
    {
      id:"ew-top", expansion:"ew", patch:"6.31", level:90, ilvl:null, ilvlSync:635,
      cn:"欧米茄绝境验证战", tw:"歐米茄絕境驗證戰", en:"The Omega Protocol (Ultimate)", aliases:["TOP","绝欧米茄","絕歐米茄","欧米茄绝","歐米茄絕"],
      phases:[
        ["欧米茄甲虫型","Omega (Beetle)","Program Loop 與 Pantokrator；依號碼輪流引線、踩塔及引導砲擊。"],
        ["欧米茄M／欧米茄F","Omega-M / Omega-F","Party Synergy 與 Limitless Synergy；看男女形態、眼睛和分身判安全點。"],
        ["终极欧米茄","Omega","Hello World 與 Critical Error；依 debuff 顏色/時間走固定傳毒路線。"],
        ["蓝屏","Blue Screen","短階段高傷與 DPS 檢定；保留資源並排好連續全場減傷。"],
        ["欧米茄（潜能量）","Omega (Run: Dynamis)","Delta、Sigma、Omega 三套潛能量；每人按 buff 層數、標記與線走對位置。"],
        ["阿尔法欧米茄","Alpha Omega","Cosmo Arrow、Wave Cannon、Meteor 與 Magic Number；跑固定宇宙箭頭路線並交雙治療 LB3。"],
      ],
    },
    {
      id:"dt-fru", expansion:"dt", patch:"7.11", level:100, ilvl:null, ilvlSync:735,
      cn:"光暗未来绝境战", tw:"光暗未來絕境戰", en:"Futures Rewritten (Ultimate)", aliases:["FRU","绝伊甸","絕伊甸","伊甸绝","伊甸絕","未来绝","未來絕"],
      phases:[
        ["绝命战士","Fatebreaker","Fall of Faith、燒灼與光雷火組合；依元素判分攤/分散並固定傳線。"],
        ["冰之巫女","Usurper of Frost","Diamond Dust、Light Rampant；冰圈按角色八方，Light Rampant 固定 Bowtie 傳球與踩塔。"],
        ["暗之巫女","Oracle of Darkness","Ultimate Relativity、Darklit Dragonsong；照 debuff 時間軸依序放沙漏、雷、凝視與分攤。"],
        ["冰之巫女／暗之巫女","Usurper of Frost / Oracle of Darkness","Crystallize Time；兩名正式首領同場，冰火水晶與時間 debuff 疊加，短組北、中組東西、長組南依序結算。"],
        ["潘多拉","Pandora","Fulgent Blade、Paradise Regained/Lost 與記憶結晶；按翅膀/劍路線移動並排好末段減傷。"],
      ],
    },
    {
      id:"dt-dmu", expansion:"dt", patch:"7.51", level:100, ilvl:null, ilvlSync:795,
      cn:"妖星乱舞绝境战", tw:"妖星亂舞絕境戰", en:"Dancing Mad (Ultimate)", aliases:["DMU","UMAD","妖星乱舞绝","妖星亂舞絕","绝卡夫卡","絕卡夫卡","卡夫卡绝","卡夫卡絕","Dancing Mad"],
      phases:[
        ["卡夫卡","Kefka","真假讀條與顛倒機制；先看問號與動作判定，不能只依地板提示。"],
        ["成神凯夫卡","God Kefka","Forsaken 的八輪雙塔、圖示效果與分身誘導，以及 Trine 三角火；P1 隱藏解謎未完成會在此出現假通關。"],
        ["艾克斯迪司／卡奥斯／卡夫卡","Exdeath / Chaos / Kefka","雙王分隊、Bowels of Agony 元素 debuff、黑洞排隊與 Kefka 場外干擾。"],
        ["卡夫卡说","Kefka Says","指令、反轉與假結算；嚴格依 debuff/指令做或不做，錯誤會導向假通關。"],
        ["凯夫卡·狂想","Ultima Kefka","三鬥神元素、鋼鐵/月環與最終魔力釋放；照固定元素口令換位並排滿末段減傷。"],
      ],
      note:"7.51 新絕本；本頁固定角色八方與左右小隊，技能順序依公開攻略整理。",
    },
  ];

  // [機制名, 英文名, 看到什麼, 怎麼做]；依各階段時間軸排列。
  const details = {
    "sb-ucob": [
      [["死刑／垂直下落","Death Sentence / Plummet","MT 重擊與前方順劈；死刑後需換坦。","王面朝北，隊伍在背後；Death Sentence 重減，命中後 ST 挑釁，原 MT 遠離下一次 Plummet。"],["液体地狱","Liquid Hell","隨機目標腳下連續五次落火池。","被點者沿場邊同方向小步引導五灘，禁止折返或切過中央。"],["火球／魔力爆散","Fireball / Hatch","火球需多人分攤；綠球沿線追目標，碰人即炸。","火球依序由 LP1 西、LP2 東四人疊；Hatch 目標站拘束裝置中央，讓綠球先撞裝置。"],["旋风","Twister","讀條完成時在每人當下位置生成不可見旋風。","讀條末全員沿自己鐘點順時針走一小段，之後別踩回舊位置或穿過別人的舊點。"],["拘束装置与俯冲","Neurolink / Divebomb","雙塔尼亞轉場留下三個拘束裝置並連續俯衝；裝置位置會沿用到後段。","三次裝置固定放北、西南、東南成三角，不重疊也不靠牆；俯衝標記者去指定凹點集合，標記鎖定後全員沿同一路線穿場。"]],
      [["奈尔台词","Nael Quotes","台詞組合預告鋼鐵、月環、分攤、分散、凝視或俯衝，通常連做兩招。","看到台詞先翻譯完整組合再動：月環貼、鋼鐵離、Dalamud Dive 近王分攤；不可只跟地板。"],["雷击／火球连锁","Thunderstruck / Fireball","雷圈必須單獨外放；火球需多人分攤並給 Firehorn，連續吃會死亡。","雷點名去東西外緣；火球按兩小隊輪流疊，持 Firehorn 者不再進下一顆。雷火同時先把雷拉離分攤組。"],["末日／热离子束","Doom / Thermionic Beam","三人 Doom 需踩白圈淨化；Beam 為全員分攤。","Doom 按倒數短到長依序踩三白圈，一圈只進一人；其餘王背疊 Beam，淨化後回組。"],["陨石流／月流电圈","Meteor Stream / Lunar Dynamo","雙人小圈或王中心月環，常與台詞重疊。","按角色八方分散；Dynamo 立刻貼王，Meteor 兩兩保持距離。"],["天地崩坏／龙俯冲","Heavensfall / Divebombs","塔落中心擊退，三龍依標記方向穿場。","靠中吃擊退後去標定安全邊，按龍標順序穿縫；凝視同時一律面朝場外。"]],
      [["进军的三重奏","Quickmarch Trio","巴哈與雙塔/奈爾分身同時俯衝、震地與火球。","以巴哈為北回角色八方；擊退後 LP1 西、LP2 東各四人分火球，俯衝線鎖定後才穿中央。"],["黑炎的三重奏","Blackfire Trio","黑火圈、塔與雙塔俯衝組合。","H1/H2/D1/D2 四斜外放黑火；MT北、ST南、D3西、D4東補塔，俯衝後黑火組回中。"],["灾厄的三重奏","Fellruin Trio","Twister、拘束裝置綠球與奈爾台詞同時處理。","先按台詞站內外；Twister 末全員同向一步，再由綠球目標進最近拘束裝置，其他人禁切球線。"],["天地的三重奏","Heavensfall Trio","中心塔擊退、隕石塔與分身大範圍重疊。","靠中吃擊退後回角色八方塔；先以奈爾與巴哈落點找安全半場，再一人一塔。"],["连击的三重奏","Tenstrike Trio","Hatch、火球與拘束裝置連續，綠球分配錯會搶裝置。","先按標記分三組拘束裝置；Hatch 目標進指定裝置，火球組避開球線四人疊，每顆判定後下一組才移動。"],["八重奏","Grand Octet","八個分身依出現順序連續俯衝，最後雙塔尼亞點名玩家衝鋒。","找最後出現分身旁起步，沿場邊同向跑過前七次；雙塔標記出現後被點者續跑外圈，其餘切入中央避最後一衝。"]],
      [["拘束装置","Neurolink","雙塔與奈爾同場，球與俯衝需要拘束裝置處理。","兩 T 分王，球目標進裝置；全員按擊殺順序控血。"],["百万核爆","Megaflare","塔、分散圈與地面圈同時結算。","先八方散開放圈，再補空塔；圈炸後才集合。"]],
      [["死亡轮回","Exaflare","地面火點沿直線連續前進。","站第一個火點旁，爆後斜穿進它原位，再微調躲後續。"],["莫恩阿法","Morn Afah","超高傷全員分攤，後續次數增加。","全員疊緊，坦克 LB/團減按表覆蓋每次。"],["十亿核爆","Teraflare","轉場即死級全場。","指定 T 使用 LB3，其他人集合吃盾與治療。"]],
    ],
    "sb-uwu": [
      [["螺旋气流／邪轮旋风","Slipstream / Wicked Wheel","王前扇形後接鋼鐵與月環。","避正面；Wheel 遠離，Wicked Tornado 再貼回王下，兩段之間不要停在中距離。"],["气旋流","Mesohigh","兩條線需各由兩人分攤，重複吃會因易傷死亡。","固定兩組搭檔在東西接線；第一輪命中後立刻由下一組換入，持易傷者遠離線路。"],["低气压／寒风之歌","Thermal Low / Mistral Shriek","玩家低氣壓層數需用 Shriek 正確消除，過多或過少都會失敗覺醒。","兩組 Mesohigh 依 LP1→LP2 輪替累積低氣壓；Shriek 前回各自東西安全區消層，確認 Garuda 取得覺醒特效才進轉場。"],["羽毛雨／螺旋羽","Feather Rain / Spiny Plume","羽毛落腳下，Spiny Plume 提供後續保護罩。","看到羽毛全員小步離開；Spiny Plume 控血後在指定位置擊殺，全員進罩內吃 Aerial Blast。"],["大气爆发","Aerial Blast","多段高傷並檢查迦樓羅覺醒與護罩。","全員罩內重減群補；覺醒或 Spiny Plume 處理錯會直接滅團。"]],
      [["光辉炎柱","Radiant Plume","內外火圈依序爆炸。","先站後爆區，第一輪炸後換入。"],["地火喷发","Eruption","隨機玩家腳下連續三次大圈，會封住後續衝鋒路線。","被點者沿場邊同方向小步放三圈，其餘人中央集合；禁止穿王腳放火。"],["灼热咆哮","Searing Wind","H 周圍持續大圈，碰隊友即炸。","被點 H 遠離全隊固定外放，直到 debuff 消失；另一 H 負責隊伍血線。"],["炎狱之楔","Infernal Nails","四根釘子需依正確順序控血，打太快會讓全場傷疊加。","全隊按標記順序單體擊破，Searing Wind H 遠離釘子；最後一根前補滿並交團減。"],["深红旋风","Crimson Cyclone","伊弗利特本體與分身依序穿場。","找第一組空隙，進已衝過路線逐次換位；最後一衝結束才回中。"]],
      [["大地粉碎","Geocrush","泰坦跳躍距離衰減。","去落點最遠邊，別站場外。"],["地裂／爆破岩","Landslide / Bomb Boulders","直線擊退與炸彈依出現順序爆炸；覺醒後地裂會追加回頭線。","站最後出現炸彈旁，第一組爆後進已炸處；地裂先避正線，覺醒後再避原線兩側追加。"],["花岗岩牢狱","Granite Gaol","三人石牢，落點與擊殺順序決定泰坦覺醒。","三名點名固定 D1 西、D2 南、D3 東放牢；D4 依西→南→東標記擊破順序；牢不重疊，也不能被地裂掃到。"],["大怒震","Tumult","多段全場物理傷，次數逐步增加。","團減覆蓋整串，H 持續群補；不可只減第一下。"],["大地之怒","Earthen Fury","轉場高傷並檢查泰坦是否成功覺醒。","滿血重減；未出現覺醒狀態就無法完成後段 LB 解謎。"]],
      [["究极掠夺","Ultimate Predation","三蠻神同時做內外、俯衝與地裂。","全員從北側迦樓羅斜後方起跑：先外躲鋼鐵、沿順時針進伊弗利特衝過線、再貼泰坦身側躲地裂；全程不追王。"],["究极歼灭","Ultimate Annihilation","球線、灼熱、地裂與羽毛連續。","LP1 撞西球、LP2 撞東球；灼熱 H 去南外放，其餘先貼內躲鋼鐵、再向北外移躲月環。"],["究极抑制","Ultimate Suppression","三蠻神最終長組合與追蹤雷射。","T 走北線、H 走東西線、DPS 走南線；雷射目標在自己線末端場邊外放，無標記者進已爆衝鋒線。"]],
      [["以太爆雷","Aetheric Boom","多顆球兩兩連線，撞球造成全場傷。","依分組輪流雙人撞球，每顆間隔補滿。"],["原初／净化／究极","Primal / Mesohigh / Ultima","要求近戰、法系、治療 LB。","嚴格按團隊順序交職能 LB，不能提早耗掉 LB。"],["究极幻想","Ultima","末段連續全場直到狂暴。","排完所有團減與坦克 LB，邊補邊全力輸出。"]],
    ],
    "shb-tea": [
      [["倾泻／制限切割","Protean Wave / Limit Cut","八方向扇形後玩家取 1～8 號衝鋒。","先角色八方引扇；按號碼奇偶站兩側依序躲衝鋒，自己兩次命中後才離場。"],["排水／手掌祈祷","Drainage / Hand of Prayer","水圈需分攤；液體手張開為分攤、握拳為擊退。","Drainage 由坦克與指定隊員分攤。手張開全員靠近手，握拳全員遠離並開防擊退；別只看技能名。"],["掌形态／苦痛之手","Hand of Pain","Living Liquid 與 Liquid Hand 血量差過大即滅。","兩組分目標同步控血，Hand of Pain 前把兩者血差壓在容許值內；高血側繼續打、低血側停手。"],["亚历山大人偶","Jagd Dolls","四娃娃需各自壓低血後餵 Living Liquid；娃娃互碰或低血被誤殺會爆團。","四 DPS 各拉一隻到預定象限，單體壓至安全血量後依序餵王；全程關閉會掃到鄰娃娃的 AOE。"],["栓塞物","Embolus","水球沿場地直線漂移，碰玩家或娃娃即爆炸。","所有人與娃娃都避開球路；拉娃娃者先等球通過再橫切，禁止倒退撞球。"]],
      [["制限切割","Limit Cut","1～8 號依序被巡航驅逐者衝鋒／劈砍。","採 1256/3478：1/2/5/6 西側、3/4/7/8 東側；每組依序引衝鋒與扇形，自己兩次結算完才退場。"],["压缩冰火水雷","Compressed Elements","水需分攤、雷需遠離，冰火圈與旋風同時出現。","水回本小隊四人疊；雷去西／東外圈單放；冰固定外放，火等冰圈消失再進已炸處；旋風線由指定玩家接走。"],["二人判定／照准","Enumeration / Optical Sight","二人圈必須恰好兩人；照准可能為大圈分散或全員集合。","搭檔固定 MT-D3、ST-D4、H1-D1、H2-D2 進二人圈；照准分散回角色八方，集合則王背疊。"],["判决结算","Gavel","Nisi、水雷、壓縮元素與不同顏色球同時做最終檢查。","按固定 Nisi 傳遞表保持顏色；各自去指定塔／球位置，水組分攤、雷者單獨，所有 debuff 必須在 Gavel 讀條前正確消除。"],["正义飞踢","Justice Kick","高傷轉場接雙王組合。","中央集合重減，落地 MT 拉巡航者北、ST 拉正義號南；LP1西、LP2東。"]],
      [["时间停止","Temporal Stasis","全員時間停止，Shared Sentence、House Arrest、Restraining Order 與遠近判定同時結算。","先讀自己 debuff：分攤兩兩疊、House Arrest 互相靠近、Restraining Order 拉遠；到固定點後面向正確並停止微調。"],["时空潜行","Inception Formation","水晶、真心、俯衝、火圈與時停組合。","依角色放水晶並保護 True Heart；火圈遠離、俯衝線避開，最後取得 Enigma Codex 才能看見 P4 未來影像。"],["次元断绝","Wormhole Formation","1～8 號處理分身衝鋒、十字、地雷與正義飛踢。","以 Alexander 落點為北按號碼固定路線；前一號兩次判定完下一號才進，踩雷者到指定角外放，不可超車。"],["神圣审判准备","Temporal Prison","三名玩家依序被時間牢獄封住，其餘人承受轉場傷害。","固定 H1→D3→MT 依序進三個牢獄；外面五人集中減傷與輸出，牢內者不要提早踩線。"]],
      [["未来确定α","Fate Calibration Alpha","未來影像演示自己會被哪種攻擊命中，以及分攤／死刑結果。","持 Enigma Codex 觀察自己的影子：先記生死與標記，再依影子結果去固定內外點；沒有看清不得只跟隊友。"],["运动／静止命令","Ordained Motion / Stillness","Motion 要持續移動，Stillness 必須完全停步停手，常在未來確定後立刻出。","Motion 倒數末持續繞小圈；Stillness 在判定前鬆開方向鍵並停技能／自動攻擊。先聽技能名，不要反著做。"],["接近／远离命令","Ordained Capital Punishment / Contact Prohibition","要求靠近指定玩家分攤或與所有人拉遠，並穿插十字砲。","分攤按預定兩組緊疊；遠離回角色八方。先避十字線再調距離，禁止穿王中心。"],["未来确定β","Fate Calibration Beta","影像演示接線、避雷、分攤、转移與亞歷山大分身安全面。","先讀影子取得職責，再按固定優先級接線；雷單獨外放、分攤回組，結算後進影像顯示的安全象限。"],["神圣审判","Divine Judgment","終盤連續全場、三人分攤普通攻擊與 DPS 檢定。","坦克 LB 與團減按表覆蓋；T/H/D 職能組分攤保持不重疊，最後讀條前全員爆發擊殺。"]],
    ],
    "ew-dsr": [
      [["光翼闪","Brightwing","Adelphel 連續點最近兩人扇形並疊加易傷。","雙 T 站王前左右輪流取近點；每次命中後退、下一組進，其他六人全在王後。"],["沉重冲击","Heavy Impact","由內向外五圈依序爆炸。","站第一圈外緣，內圈爆後向內一步；每次只跨一條圈，不要衝到底。"],["阿斯卡隆之仁","Ascalon's Mercy Concealed","Zephirin 八方向無預兆扇形。","角色八方預先誘導，扇形鎖定後全員進扇與扇間的安全縫。"],["圣杖突击","Spear of the Fury","長槍對 NPC／玩家方向造成多段傷與騎士檢定。","兩 T 輪流接線重減，DPS 集火長槍，H 保持目標與隊伍血線；轉場前不可把 LB 浪費。"],["纯洁之心","The Pure of Heart","Zephirin 高傷讀條，需在讀條前打掉並處理最後分攤。","全員爆發擊殺，H/T 交門神最後減傷；成功後取得本絕唯一檢查點。"]],
      [["骑神的威光","Strength of the Ward","騎士衝鋒、雙塔、線與震地連續。","以 Thordan 面向為北；雙 T 拉騎士線朝外，DPS/H 補塔，衝鋒鎖定後進已衝線，再回中處理震地。"],["骑神的圣杖","Sanctity of the Ward","冰圈、隕石、旋轉騎士與塔長組合。","按內外圈優先級放冰與隕石；隕石兩兩保持最大距離，爆後依騎士旋轉方向找缺口，再由未帶易傷者補塔。"],["至天绝技","Ultimate End","超高傷轉場。","團減與盾全開；此後才進無檢查點主體。"],["苍穹体势","Broad Swing / Ancient Quaga","三連半場劍與高傷全場。","看王左右起手連續換到已斬側；Quaga 前集合吃盾補滿。"]],
      [["优雅后跃","Dive from Grace","全員 1/2/3 號與高低跳躍 debuff，依次落圈、跳躍、踩塔。","按號碼與上／下箭頭走固定格；上一號跳躍和塔都結算後下一號才進，無塔者在中線避開。"],["灵泉之炎","Drachenlance","正面巨大扇形後場地塔依 Dive 結果出現。","貼王側後躲正面；高跳者去遠塔、低跳者去近塔，無 debuff 者按角色優先補空塔。"],["灵泉吐息","Geirskogul / Soul Tether","場外龍直線與雙坦靈魂線重疊。","雙 T 分居北側兩邊拉線並重減，隊伍南側躲直線；線判定後立即換坦。"],["复仇之魂","Final Chorus","P3 結束高傷與輸出檢定。","全員集合重減，確保 Nidhogg 在讀條完成前壓到轉場血量。"]],
      [["邪眼交换","Eyes","紅藍眼連線會隨距離累積能量，顏色錯誤或過量即死。","兩小隊各守一眼，拉長／靠近依 debuff 消層；需要交換時只由指定搭檔穿中，其他人不動。"],["红蓝球","Resentment / Orbs","紅藍球追蹤最近玩家，需由相反顏色 buff 玩家撞掉。","各側按優先級一人一球，先確認自身顏色再撞；撞後立刻退回，避免連吃第二顆。"],["灵龙之眼","Mirage Dives","多次俯衝點名並交換 debuff。","按固定優先級在兩側輪流接俯衝；命中後立即與指定搭檔換線，下一個接點者才進。"],["邪龙眼狂暴","Eye of the Tyrant","雙眼能量未正確清除會讀條全滅。","兩側同步控能量，最後分攤前補滿並確認眼血量同時歸零。"]],
      [["时间倒流／救援","Rewind / Spear of the Fury","重演教皇刺殺，需用職能 LB 改寫歷史救下 Haurchefant。","H1 交 LB3；MT 站 NPC 前減傷，ST 接長槍線；DPS 集火長槍，H2 持續補 NPC。NPC 存活才進正史改寫。"],["苍天之怒","Wrath of the Heavens","近遠線、衝鋒、液體地獄與旋風重組。","近線優先 MT>ST>D1>D2，遠線 D3>D4>H1>H2；線者拉外，火池沿牆放，Twister 末全員同向一步後進衝鋒安全縫。"],["苍天之死","Death of the Heavens","死亡風暴、隕石、凝視、塔與俯衝連續。","隕石按角色八方外放，凝視一律朝場外；爆後 MT/ST 北南塔、H1/H2 西東塔、DPS 補四斜塔，最後進騎士缺口。"]],
      [["神圣之翼","Hallowed Wings","Hraesvelgr 左／右翼發光打大半場，並可能附近／遠坦克死刑。","全員去未發光側；雙 T 依近／遠提示分開引導，其他人保持中距離。"],["双龙冰火","Wroth Flames","冰火 debuff、分攤、個人圈與地板線連續。","兩 T 分龍；按 debuff 去冰／火側，分攤組不可混色，個人圈在本側八方外放。"],["死亡轮回","Mortal Vow","高傷 DoT 需要依固定順序傳給指定隊員。","固定傳毒 MT→D1→D2→H2→D3→D4；只在倒數前碰下一人一次；非當輪玩家全遠離，傳完者回原小隊。"],["圣洁之翼／邪炎俯冲","Cauterize / Touchdown","雙龍穿場與落地距離衰減連續。","找兩龍衝鋒線間隙，衝過後去落點最遠側；不要因貪打留在龍腳。"],["双龙咆哮","Akh Afah","兩龍同時小隊分攤，血量差會使低血龍暴怒。","兩小隊各疊一龍並同步控血，血差超過約 3% 高血側續打、低血側停手。"]],
      [["三重攻击","Trinity","普通攻擊同時命中仇恨一、二與離王最近 DPS。","雙 T 分居王前左右、指定近戰站王背最近；其他五人保持更遠，三人全程開短減。"],["死亡轮回","Exaflares' Edge","多線 Exaflare 配合劍氣。","站第一爆旁穿入，沿預定內外路線進已炸點；不臨時折返也不追別組。"],["十亿核爆","Gigaflare's Edge","三次距離衰減從不同方位落下。","看到落點立刻去對角最遠處，下一顆出現後沿場邊換角；每次都補滿。"],["莫恩阿法","Morn Afah's Edge","多輪全員分攤，傷害逐輪提高。","八人王背疊緊，團減按次數排表；最後一輪可配坦克 LB。"],["龙诗终章","Drachenlance enrage","連續全場直到狂暴。","全員爆發，H 保持輸出同時按表補減。"]],
    ],
    "ew-top": [
      [["太阳射线","Solar Ray","仇恨前二各吃圓形死刑。","雙 T 在王左右分開重減，其他六人王背集合；後續普通攻擊維持一二仇。"],["程序循环","Program Loop","1～4 號線與塔交替四輪，線持續過久或塔漏踩即滅。","每號依序處理：奇數輪一組接線、另一組踩塔，下一輪交換；完成者退到場邊，未輪到者不靠近塔線。"],["全能主宰","Pantokrator","旋轉砲、四輪腳下圈、導彈與線同時。","全隊同向繞外圈；T/H 內層、DPS 外層錯開放圈，導彈目標按優先去外側，砲口轉過後進已炸縫。"],["原子射线","Atomic Ray","P1 結束高傷全場與輸出檢查。","全員集合交團減，保留足夠爆發在讀條前擊殺甲蟲型。"]],
      [["协作程序PT","Party Synergy","同形搭檔、男女分身、眼睛方向、遠近／分攤與 Limit Cut 同時。","以眼睛為北；圓北、三角東、方南、叉西，同形兩人排內外。先看男女技能：男鋼鐵離、女月環貼；號碼奇數西、偶數東依序引衝鋒。"],["双重／双人狙击","Optimized Fire III / Blizzard III","火為八方分散，冰為兩人搭檔分攤，常接分身真假安全區。","火回角色八方；冰找同形搭檔疊。先到分身共同安全半場，再展開散／疊。"],["无尽协作","Limitless Synergy","隕石、盾連線、塔與大範圍組合。","隕石依角色八方外放；MT 接北盾線、ST 接南盾線重減，無線者補塔，最後 LP1西、LP2東分攤。"],["协作程序LB","Cosmo Memory","P2 結束即死級全場。","指定 T 在讀條末使用 LB3，全員集合吃盾；過早開會讓 buff 在判定前消失。"]],
      [["你好世界","Hello World","紅藍長短 Rot／Defamation、塔與傳毒連續。","依顏色和長短走固定四站：短先外放並把毒交指定無 debuff 者，長組留中等候；每輪爆炸完全結算再交換，禁止搶跑。"],["过采样波动炮","Oversampled Wave Cannon","三面顯示器朝有 monitor debuff 玩家射大半場，另五人需躲背面。","三 monitor 玩家依固定左中右站王前朝外，其餘五人全在王背安全半場；面向鎖定後不可轉身。"],["波动炮","Wave Cannon","八方向扇形後雙 H 小隊分攤。","角色八方引扇，扇形判定後 LP1西、LP2東四人疊；不要提前穿過鄰扇。"],["关键错误","Critical Error","四組 Hello World 效果以不同順序重播。","維持原組與優先級，按短→長叫號處理塔、圈與傳毒；自己的 debuff 消失前不得離開路線。"]],
      [["波动炮","Wave Cannon","進場先八方扇形與高傷分攤。","角色八方放扇後立即王背集合，團減覆蓋分攤。"],["蓝屏","Blue Screen","短階段長讀條高傷與嚴格輸出檢定。","預留兩分鐘爆發和團減，H 也全力輸出；讀條完成即全滅，不能靠 LB 跳過。"]],
      [["潜能量：三角洲","Run: Dynamis Delta","男女／甲蟲分身、近遠線與世界終結者組合，正確處理可累積 Dynamis。","近線優先 MT>ST>D1>D2、遠線 D3>D4>H1>H2；近線北半、遠線南半，甲蟲衝過後同側內外交換，World 圈單獨外放。"],["潜能量：西格玛","Run: Dynamis Sigma","塔、顏色標記、旋轉分身、手臂與接線。","LP1西、LP2東；同色按優先排，第一輪前兩人踩塔、後兩人接線，第二輪互換。看手臂先躲鋼鐵／月環，再進塔。"],["潜能量：欧米茄","Run: Dynamis Omega","兩輪男女技能、近遠線、monitor 與 Dynamis 層數檢查。","第一輪 LP1西、LP2東，第二輪對穿換側；男鋼鐵離、女月環貼，線保持本側內外。monitor 依 Dynamis 低層優先接，讓全員終局達標。"],["潜能量转移","Dynamis Transfer","標記與線結算後把 Dynamis 層數分配給玩家，層數不足無法通過 Magic Number。","每輪確認自己的層數；已達標者不搶下一次線／塔，低層者按優先補位。P6 前全員必須取得指定層數。"]],
      [["宇宙箭","Cosmo Arrow","地面直線依固定圖形連續爆炸。","MT/H1 北起、ST/H2 南起、D1/D3 西起、D2/D4 東起；依外格→內格→外格進已爆線，同起點兩人一內一外錯半格。"],["波动炮：极限","Wave Cannon","八方扇、分攤與距離衰減連續。","先角色八方放扇，再 LP1西／LP2東分攤；MT北、ST南朝外接死刑。"],["魔数","Magic Number","兩次即死級全場並要求治療 LB3。","第一次讀條 H1 交 LB3、第二次 H2 交 LB3；另一位 H 先盾補滿，其餘團減按輪覆蓋。"]],
    ],
    "dt-fru": [
      [["信念之落","Fall of Faith","四條火雷線依序傳遞；火為分攤或大圈，雷為近遠扇形。","按隊內標記順序接線，每線鎖定後才交下一人；火分攤回組、大圈外放，雷線拉到指定近／遠點朝外。"],["燃火霹雳","Burnt Strike","王前後直線後追加火擊退或雷二次直線。","先站王側面；火讀條靠線準備被推且不可防擊退，雷讀條第一線爆後立即穿進原線。"],["旋回破／光轮召唤","Cyclonic Break / Utopian Sky","八方向扇形與分身半場連續，最後分散或小隊分攤。","角色八方引扇後進已炸縫；看分身武器找共同安全半場，散開留八方，分攤回 LP1西／LP2東。"],["天之转轮","Turn of the Heavens","紅藍塔與元素圈依王身上顏色決定可踩者。","先辨自己光／火耐性，只踩不會被克制顏色塔；同色兩人依近戰優先內、遠程外分配，塔後立刻散開。"],["烧灼荣光","Burnished Glory","高傷全場與持續傷。","團減＋持續群補，為下一線補滿。"]],
      [["钻石星尘","Diamond Dust","冰圈、擊退、分散／分攤與冰地板組合。","角色八方外放冰圈；看分散留八方、分攤回 LP1西／LP2東。擊退落點避開冰圈，滑冰時只用單次直線移動。"],["镜中奇遇","Mirror, Mirror","場邊紅／綠鏡依序複製 Shiva 的鋼鐵、月環或扇形。","先記鏡色與王技能；本體判定後先去綠鏡安全側，再依紅鏡方向換到已炸處。不要只跟著王移動。"],["光之失控","Light Rampant","光球線、塔與放圈；線斷或球碰錯即滅。","採 Bowtie：線組四人在斜角拉成蝴蝶結，無線四人正點依序踩圈；球只走自己外圈象限，最後 LP1西塔、LP2東塔。"],["斧踢／镰踢","Axe Kick / Scythe Kick","鋼鐵或月環後接鏡像重播與分散。","斧遠離、鐮貼王；第一下爆後依鏡像轉到相反內外，最後回角色八方散。"]],
      [["绝对时间压缩","Ultimate Relativity","沙漏、凝視、冰火雷與分攤按 10／20／30 秒組結算。","短組北半、中組東西、長組南半；冰外放、火回中心疊、雷留正點、凝視朝場外。每組完成後沿外圈離場，禁止穿過下一組沙漏線。"],["中级时间压缩","Intermediate Relativity","水分攤、火圈與凝視依倒數兩輪結算。","短水先在北側四人疊，火圈去東西外放；第一輪結束後長水在南側疊，凝視者朝外，無 debuff 者補分攤。"],["高级时间压缩","Advanced Relativity","沙漏光線、Dark Fire、Unholy Darkness 與 Return debuff 重播移動軌跡。","先按長短去預定象限放火／分攤，看到 Return 記錄點後立即走到下一站；重播時回到記錄點，不與別組交叉。"],["震壳／暗之舞","Shell Crusher / Darkest Dance","全員分攤後最遠跳躍大圈與擊退。","Shell Crusher 全員王背疊；Darkest Dance 由指定坦克最遠引到外牆，其他人靠王反側並準備防擊退。"]],
      [["暗光龙诗","Darklit Dragonsong","光線、塔、分攤、暗圈與分身衝鋒同時。","Bowtie 線組拉外側、無線組踩內塔；紅線 LP1西、藍線 LP2東，線斷後回各側 H 分攤並躲分身衝鋒。"],["时间结晶","Crystallize Time","八種時間 debuff、冰火水晶與沙漏連續。","短冰火北半、中倒數東西、長倒數南半；冰水晶外圈、火水晶內圈，紅沙漏穿西、黃沙漏穿東，結算後回角色八方。"],["水晶毁灭","Crystallize Time: Spirit Taker","玩家分身跳躍與水晶爆炸重疊，必須按記憶位置分散。","先避水晶爆炸，再回角色八方讓分身跳躍不重疊；跳後立刻進中央吃轉場分攤。"],["记忆终结","Memory's End","琳與盖娅合擊的高傷轉場。","滿血重減，保留資源進最終階段。"]],
      [["光明剑","Fulgent Blade","多把光劍依序產生穿場直線。","找第一把外側安全縫，爆後進已炸線並跟旋轉方向逐格移動，不穿未爆線。"],["乐园再临","Paradise Regained","兩名坦克線、四人塔與光暗翅膀同時處理。","雙 T 將線拉向北側分開重減；其餘按兩小隊補塔。看翅膀發光側，所有人最後去未發光半場。"],["乐园失落","Paradise Lost","腳下圈、Akh Morn 小隊分攤與翅膀連續。","兩小隊各沿場邊小步放圈，圈停後各回 H 疊 Akh Morn；每輪分攤補滿再依翅膀換安全側。"],["启示录","Apocalypse","地面光暗爆點依固定旋轉順序連鎖。","先記第一爆與旋轉方向；全隊在相反象限起步，第一輪炸後進已炸處，維持小隊分攤不拆組。"],["末日乐园","Pandora's Box","終盤連續全場與狂暴。","交完團減、坦克 LB 與爆發，保持八人存活輸出。"]],
    ],
    "dt-dmu": [
      [["恶狠狠毁荡","Revolting Ruin III","仇恨一、二名依序吃扇形死刑。","兩 T 朝北疊站重減；第一刀後換坦，或由同一坦吃兩刀，隊伍全在王後。"],["神像 1：火冰真假","Graven Image 1: Fire / Ice","冰扇與火分攤／分散可能各自帶問號；一職能同時被神像擊退。","支援固定西、DPS 固定東。冰有問號就進顯示危險扇，無問號去顯示安全扇；火有問號就反轉散／疊。被線職能站外側，讓擊退落在本側安全象限。"],["神像 1：光束与塔","Graven Image 1: Beams / Towers","支援與 DPS 各有兩人被直線點名，直線落點生成塔，未被點者補塔。","兩職能各自在東西橫排；被點者原地放線後退出，未點者依本職能由外到內一人一塔。支援不得跨東側、DPS 不得跨西側。"],["双重陷阱","Double-trouble Trap","支援與 DPS 各一人持擊退分攤 debuff，會在本階段重複三次並跳給組內另一人。","支援四人疊王圈西、DPS 疊東；持 debuff 者站本組外側最大近戰，讓四人共同分傷並朝安全方向被推。每次結算後確認新持有者。"],["神像 2：紫黄线谜题","Graven Image 2: Purple / Yellow Tethers","紫線職能落四人分攤水池，黃線職能落擊退圈；兩輪水池必須疊出交集並在稍後四人踩掉。","LP1 北牆、LP2 南牆各四人疊紫池；黃線的 T／近去最近正點，H／遠去最近斜角，其餘進王下。第二輪紫池緊貼第一池東／西側，使兩池交集落在南北中線；Double-trouble 判定後兩組各四人站交集引爆，聽到正確解謎台詞才算完成。"],["传送践踏＋神像 3","Tele-trouncing / Graven Image 3","每人兩個方向箭頭；之後黃線玩家混亂追最近人、紫線玩家睡眠。十六箭頭全被使用才完成隱藏解謎。","按 Filo 大方框把十六傳送箭排成閉合環，禁止提早踩。支援在西北、DPS 東南解最後一次 Double-trouble；睡眠組依角色鐘點站王圈，混亂組站對應正點箭頭外，讓混亂自動踩四個箭頭傳送。最後真假凝視與火雷同時處理。"]],
      [["终极拥抱","Ultimate Embrace","雙坦分攤死刑，P2 開場與末段各一次。","雙 T 王前疊吃重減；後續 Forsaken 很長，H 先補滿再散開。"],["妖星乱舞","Forsaken","八輪兩人塔推進節奏；全員有四層 Spell's Trouble，每踩一次塔就減一層並觸發頭頂的扇形、個人圈或三人分攤。","只在自己輪次與指定搭檔進塔。扇形圖示者貼近指定誘導者並朝外；個人圈者單獨離組；三人分攤由該玩家加同側兩人吃，第四人去另一塔。每輪先認下一圖示，再移動，不能看到塔就搶踩。"],["妖星乱舞：分身诱导","Forsaken Clones","塔間穿插卡夫卡分身，依最近／最遠或面向放大範圍，位置錯會封住下一對塔。","全隊隨塔順時針推進；當輪指定角色把分身攻擊誘導到外牆，無職責者先站兩塔中線，分身判定後才進下一塔。"],["三角神罚","Trine / Wings of Destruction","三角地火依出現順序爆炸，同時雙 T 扇形死刑。","記三個三角先後，從最後出現處起步，第一組爆後進已炸區連走三次；雙 T 分居隊伍兩側把 Wings 朝外，其他六人疊在安全三角內。"],["虚假通关","False Finale","P1 隱藏解謎任一條件失敗時，P2 後會出現 Complete、寶箱與出口，但不會進 P3。","P1 必須同時完成紫池交集四人踩與十六箭頭全使用，並聽到兩句成功台詞；看到假寶箱不要把它當作完整攻略終點。"]],
      [["决战分队","The Decisive Battle","離 Chaos 最近四人獲 Epic Hero，只能打 Chaos；離 Exdeath 最近四人獲 Fated Hero，只能打 Exdeath。","Chaos 組 MT/H1/D1/D2，Exdeath 組 ST/H2/D3/D4；開場站對王腳取得正確 buff，雙近留 Chaos 保持輸出。"],["苦痛深处：元素长短","Bowels of Agony","火 Entropy、 水 Dynamic Fluid 各有一支援一 DPS，分 20/45 秒；所有人另有 Headwind/Tailwind，要用水擊退正確面向淨化，風晶再點兩組二人分攤。","先找火、水、風晶；Exdeath 拉到長 debuff 同元素晶，Chaos 拉短元素與風晶之間。面向 Chaos：支援左、DPS 右。短 debuff 先外放圈／月環；長 debuff 組利用水晶擊退，Headwind 背對來源、Tailwind 面向來源；無元素 debuff 四人以兩組二人吃風分攤，長短第二輪交換。"],["横／纵向崩坏","Latitudinal / Longitudinal Implosion","Chaos 連續打左右再前後，或前後再左右；Exdeath 同時雙擊近坦死刑。","沿斜角躲第一刀，立刻換進已炸象限。Exdeath 坦無敵或第一刀後換坦；元素 debuff 組向長元素晶躲，其他人向風晶躲。"],["大地震＋冰雷塔","Earthquake / Blizzard III / Towers","平台被震裂後冰圈、分攤與塔連續，場外 Kefka 仍會干擾。","先依分組回兩王側補滿；冰圈按角色散位外放，分攤回本王四人，塔由未帶對應易傷者補。每輪先確認自己還能否攻擊該王。"],["黑洞队列","Black Hole","支援與 DPS 需依標記排兩列進黑洞／處理增生物，順序錯會拉錯或重疊。","支援與 DPS 各自按 Attack→Bind→Ignore 順序排隊，增生物標記另排 Attack3→Bind3。前一人完全離開黑洞範圍後下一人才進；兩列不可互換。"]],
      [["卡夫卡说：三轮真假","Kefka Says / Mystery Magic","卡夫卡、Neo Exdeath、Chaos 每輪各自顯示真或假；三次 Grand Cross 疊加長短水、雷、凝視、加速炸彈與黑白傷口。","每輪分別記王的真假，不可用一個真假套三王。真水＝分攤、假水＝分散；真雷＝分散、假雷＝分攤；真凝視＝背對、假凝視＝看向；真加速炸彈＝停手停步、假炸彈＝保持移動。"],["海啸／地狱火","Tsunami / Inferno","Tsunami 給 Dynamic Fluid、Inferno 給 Entropy；真假會交換鋼鐵與月環型態。","Dynamic Fluid 真＝月環、假＝腳下圓；Entropy 真＝腳下圓、假＝月環。先按角色八方散開判個人型態，再回本側處理 Grand Cross 短 debuff。"],["大十字 3：生死判定","Grand Cross 3","全員取得 Black/White Wound，加上 Allagan Field 或 Beyond Death；真假決定必須吃致死傷或必須避開。","先依真假翻譯自己的兩個 debuff：Beyond Death 真或 Allagan Field 假者必須用正確黑／白 Antilight 吃致死傷；Allagan Field 真或 Beyond Death 假者絕不能死。任何人先完成自己的生死條件，再進後續 Flood。"],["虚无洪流与短长结算","Flood of Naught","場地線配合短水／雷／加速炸彈、短凝視、短元素，之後同一套長 debuff 再結算。","支援西、DPS 東，按角色上下排開。每個倒數只看自己的真假規則；加速炸彈倒數最後一秒停止或持續移動，凝視同時轉向；短組全清後長組才進，不能追著別人臨場分攤。"]],
      [["连续究极","Ultima Repeater","四連高傷全場，開場與中段各一次。","讀條前預鋪團減與盾，四下持續群補；第二次後緊接兩輪 Fell Forces。"],["堕落之力","Fell Forces","每輪同時點一 T、一 H、一 DPS 三組職能分攤普通攻擊。","三職能各自疊緊：雙 T、雙 H、四 DPS 分成三堆且互不重疊；連續輪次間只微調，不穿過另一組。"],["洪水","Flood","四組成對直線快速旋轉，每次另有隨機全員分攤。","只看穿過場中的直線判順／逆時針；全員在近戰圈共同起步，每次線炸後沿旋轉方向進上一格已炸區，四輪全程疊緊。"],["癫狂交响曲","Maddening Orchestra","仇恨一、二名取得 Surprise Flare/Holy；非 T 先隨機三人、再最近三人吃個人圈。","第一組三人外散，未中三人進王圈誘導第二組。雙 T 交換仇恨：Flare 坦去牆邊外放，Holy 坦留王圈無敵，保持王不跟去牆。"],["三星","Celestriad","三輪九座火冰雷塔，每輪四塔亮且每塔二人；六人有元素耐低、兩人無 debuff，第一／三輪另有風月環或土鋼鐵。","有 debuff 者第一輪踩自己元素順時針下一種；雙塔時取順時針那座。無 debuff 者補當輪雙塔元素的逆時針塔。第二輪全員再順時針一元素；第三輪 debuff 消失後回最初同元素。王杖綠風站塔靠中半，黃土站塔靠外半。"],["混沌末世","Stray Apocalypse","東北／西北兩組 Exaflare 交替六輪，速度快且判定早。","每人先回指定象限；看第一組從東北或西北開始，爆點出現即沿自己象限向下一安全縫移，不橫穿中央。"],["遗弃末世／遗弃末点","Forsaken / Enrage","最終 Forsaken 組合後進硬狂暴。","保留最後團減與藥爆發；依既定塔／散疊職責完成，不因王低血跳機制。"]],
    ],
  };

  for (const d of duties) {
    window.FF14_DATA.push({
      id:d.id, type:"ultimate", expansion:d.expansion, patch:d.patch, level:d.level, ilvl:d.ilvl,
      identity:{officialKey:`cfc:${CFC[d.id]}`,contentType:"ultimate-raid",partySize:8,sourceUrl:`https://github.com/thewakingsands/ffxiv-datamining-cn/blob/master/ContentFinderCondition.csv#L${CFC[d.id]+4}`},
      name:{ cn:d.cn, en:d.en, tw:d.tw }, aliases:d.aliases,
      overview:`本頁採 ${STRAT[d.id]}，八人角色位與優先級已寫定；核心階段：${d.phases.map(p=>p[0]).join(" → ")}。`,
      route:`攻略基準：${STRAT[d.id]}。\n${POS}\n階段順序：${d.phases.map((p,i)=>`P${i+1} ${p[0]}`).join(" → ")}。`,
      sources:[{label:"灰机 Wiki（陆服名称／技能）",url:`https://ff14.huijiwiki.com/wiki/${encodeURIComponent(d.cn)}/B`},{label:`Ulti Strats ${d.aliases[0]}`,url:SOURCES[d.id]},{label:"Tuufless Elemental Raid Macros",url:"https://github.com/Tuufless/FFXIV-Elemental-raid-macros"}],
      strategies:CN_STRATS[d.id]||[],
      bosses:d.phases.map((p,i)=>({
        name:{ cn:p[0], en:p[1] }, summary:p[2],
        mechanics:(details[d.id]?.[i] || []).map(m=>({name:{cn:m[0],en:m[1]},desc:m[2],solve:m[3],danger:3,phase:`P${i+1}`})),
      })),
      notes:[d.note || `本頁全程使用 ${STRAT[d.id]} 與同一套角色優先級；機制條目有覆寫時以條目為準。`],
    });
  }
})();
