# 普通 8 人／24 人团本逐场身分稽核

稽核日期：2026-09-01（Asia/Taipei）

## 结论

- 本范围共有 **91 场**：73 场普通／旧 8 人团本，18 场普通 24 人联盟团本。
- 91 场都已加入不可由名称猜测的 `identity.officialKey`，使用游戏 `ContentFinderCondition` row ID；同时记录 `contentType`、`partySize` 与可直接读取该 row 的 `sourceUrl`。
- 逐场以游戏资料表核对英文名、等级、最低装等、队伍资料；再以灰机中文副本页与 FFXIV Community Wiki 的副本原始页核对简中名和 Boss／阶段顺序。
- 发现并修正 5 类实际错误：黎铎拉纳最低装等、瓯博讷最低装等、O12 的欧米茄 F 名称、普通 E12 混入 E12S 暗之巫女、希望之炮台“塔”把道中小王与尾王两阶段误算成多个正式 Boss。
- **暗灭云／暗滅雲不属于伊甸。** 它应指 7.15 独立诛灭战 `the Cloud of Darkness (Chaotic)`；E9/E9S 是 5.4 伊甸再生之章1，只有 Boss 形象同为暗黑之云。

## 可复查来源与方法

1. 游戏资料表：XIVAPI v2 的 `ContentFinderCondition`，资料版本 `284bb7f44b9c0976`。每场的 CFC 链接都列在下表，并写入资料对象。
2. 英文官方条目：Lodestone Eorzea Database；关键条目直接列于“暗黑之云四项分离证据”。
3. 简中本地化与 Boss：灰机 Wiki 对应副本页。下表简中名称均直接链接到对应页面。
4. Boss／阶段顺序第二来源：FFXIV Community Wiki 对应 duty 页；本次 91 个页面全部能用精确英文 duty 名找到，不使用模糊搜寻结果。
5. 版本号按各系列实装补丁核对；新版本内容另以官方 Patch Notes 复核。

> 英文标题开头的 `The/the`：游戏资料表部分 row 以小写 `the` 储存，Lodestone 页面标题使用大写 `The`。网站保留标题式大写；身份判断只依 CFC row，不依大小写。

## 暗黑之云四项分离证据

| 内容 | 唯一身份 | 版本／类型／人数 | 正式名称 | 结论 |
|---|---:|---|---|---|
| 水晶塔三 | [CFC 111](https://v2.xivapi.com/api/sheet/ContentFinderCondition/111) | 2.5／普通联盟／24 | 水晶塔 暗之世界／the World of Darkness | 终王是实际的暗黑之云；不是 E9，也不是诛灭战。 |
| E9 普通 | [CFC 749](https://v2.xivapi.com/api/sheet/ContentFinderCondition/749) | 5.4／普通大型任务／8 | 伊甸希望乐园 再生之章1／Eden's Promise: Umbra | Boss 是伊甸构想出的暗黑之云形象；副本名称绝不能写成暗灭云。 |
| E9S 零式 | [CFC 750](https://v2.xivapi.com/api/sheet/ContentFinderCondition/750) | 5.4／零式／8 | 伊甸零式希望乐园 再生之章1／Eden's Promise: Umbra (Savage) | 与 E9 同系列的零式；仍不是 7.15 诛灭战。 |
| 暗灭云／暗滅雲 | [CFC 1010](https://v2.xivapi.com/api/sheet/ContentFinderCondition/1010)、[Lodestone duty 4a2a0efdb91](https://na.finalfantasyxiv.com/lodestone/playguide/db/duty/4a2a0efdb91/) | 7.15／Chaotic Alliance Raid／最多24 | [暗黑之云诛灭战](https://ff14.huijiwiki.com/wiki/%E6%9A%97%E9%BB%91%E4%B9%8B%E4%BA%91%E8%AF%9B%E7%81%AD%E6%88%98)／the Cloud of Darkness (Chaotic) | 独立高难副本；必须有独立 ID、分类、攻略和页面。 |

补充一手证据：[官方 7.15 Patch Notes](https://na.finalfantasyxiv.com/lodestone/topics/detail/864c7e51128b7a1dced4e193dcaefe7891620f8d/)明确写为新 Chaotic Alliance Raid、等级 100、装等 710、最多 24 人；[灰机 E9 普通页](https://ff14.huijiwiki.com/wiki/%E4%BC%8A%E7%94%B8%E5%B8%8C%E6%9C%9B%E4%B9%90%E5%9B%AD_%E5%86%8D%E7%94%9F%E4%B9%8B%E7%AB%A01)明确写为 5.4、80 级、2T/2H/4D。

## 本次修正

- `alliance_sb_shb.js`：黎铎拉纳大灯塔最低装等 340 → **335**（CFC 550）；瓯博讷修道院 370 → **365**（CFC 636）。
- `raids_sb.js`：O12 普通从错误的“欧米茄M／欧米茄”修为 **欧米茄M／欧米茄F**；双体阶段也改为 M＆F。
- `raids_shb.js`：E12 普通删除只存在于 E12S 的 **暗之巫女／Oracle of Darkness**、零式技能与别名。普通 E12 只保留伊甸之约。
- `alliance_sb_shb.js`：希望之炮台“塔”按官方／灰机的 **4 场正式 Boss 战**整理；荀子＆孟子保留在路线中并注明道中小王，伪造的神明→开花的神明合为同一尾王的两阶段。
- 全部 91 场补上 CFC 身分和人数资料。

## 逐场核对

“Boss／阶段顺序”按实际出现顺序；箭头代表同一战斗转阶段，并非另一个副本。

### 2.x–3.x 普通 24 人联盟

| ID | 版本 | 人数 | CFC | 正式中／英文名 | Boss／阶段顺序 | 结果 |
|---|---:|---:|---:|---|---|---|
| `arr-labyrinth-of-the-ancients` | 2.1 | 24 | [92](https://v2.xivapi.com/api/sheet/ContentFinderCondition/92) | [水晶塔 古代人迷宫](https://ff14.huijiwiki.com/wiki/%E6%B0%B4%E6%99%B6%E5%A1%94_%E5%8F%A4%E4%BB%A3%E4%BA%BA%E8%BF%B7%E5%AE%AB)<br>[The Labyrinth of the Ancients](https://ffxiv.consolegameswiki.com/wiki/The_Labyrinth_of_the_Ancients) | 骸骨龙／Bone Dragon<br>塔纳托斯／Thanatos<br>贝希摩斯王／King Behemoth<br>提坦／Phlegethon | 通过 |
| `arr-syrcus-tower` | 2.3 | 24 | [102](https://v2.xivapi.com/api/sheet/ContentFinderCondition/102) | [水晶塔 希尔科斯塔](https://ff14.huijiwiki.com/wiki/%E6%B0%B4%E6%99%B6%E5%A1%94_%E5%B8%8C%E5%B0%94%E7%A7%91%E6%96%AF%E5%A1%94)<br>[Syrcus Tower](https://ffxiv.consolegameswiki.com/wiki/Syrcus_Tower) | 妖艳无比的六兽妖／Scylla<br>金刚不坏的守护者／Glasya Labolas<br>才思敏捷的亚蒙／Amon<br>始皇帝赞德／Xande | 通过 |
| `arr-world-of-darkness` | 2.5 | 24 | [111](https://v2.xivapi.com/api/sheet/ContentFinderCondition/111) | [水晶塔 暗之世界](https://ff14.huijiwiki.com/wiki/%E6%B0%B4%E6%99%B6%E5%A1%94_%E6%9A%97%E4%B9%8B%E4%B8%96%E7%95%8C)<br>[The World of Darkness](https://ffxiv.consolegameswiki.com/wiki/The_World_of_Darkness) | 安哥拉·曼纽／Angra Mainyu<br>五头巨龙／Five-headed Dragon<br>刻耳柏洛斯／Cerberus<br>暗黑之云／Cloud of Darkness | 通过 |
| `hw-void-ark` | 3.1 | 24 | [120](https://v2.xivapi.com/api/sheet/ContentFinderCondition/120) | [魔航船虚无方舟](https://ff14.huijiwiki.com/wiki/%E9%AD%94%E8%88%AA%E8%88%B9%E8%99%9A%E6%97%A0%E6%96%B9%E8%88%9F)<br>[The Void Ark](https://ffxiv.consolegameswiki.com/wiki/The_Void_Ark) | 刻托斯／Cetus<br>天柱树 / 锯齿花／Irminsul / Sawtooth<br>丘库雷因／Cuchulainn<br>艾奇德娜／Echidna | 通过 |
| `hw-weeping-city-of-mhach` | 3.3 | 24 | [168](https://v2.xivapi.com/api/sheet/ContentFinderCondition/168) | [禁忌城邦玛哈](https://ff14.huijiwiki.com/wiki/%E7%A6%81%E5%BF%8C%E5%9F%8E%E9%82%A6%E7%8E%9B%E5%93%88)<br>[The Weeping City of Mhach](https://ffxiv.consolegameswiki.com/wiki/The_Weeping_City_of_Mhach) | 阿剌克涅／Arachne Eve<br>弗加尔／Forgall<br>奥兹玛／Ozma<br>卡洛菲斯提莉／Calofisteri | 通过 |
| `hw-dun-scaith` | 3.5 | 24 | [220](https://v2.xivapi.com/api/sheet/ContentFinderCondition/220) | [影之国](https://ff14.huijiwiki.com/wiki/%E5%BD%B1%E4%B9%8B%E5%9B%BD)<br>[Dun Scaith](https://ffxiv.consolegameswiki.com/wiki/Dun_Scaith) | 虚空死亡凝视／Deathgaze Hollow<br>虚空弗迪亚／Ferdiad Hollow<br>斯卡哈／Scathach<br>迪亚波罗斯 → 虚空迪亚波罗斯／Diabolos → Diabolos Hollow | 通过 |

### 6.x–7.x 普通 24 人联盟

| ID | 版本 | 人数 | CFC | 正式中／英文名 | Boss／阶段顺序 | 结果 |
|---|---:|---:|---:|---|---|---|
| `ew-aglaia` | 6.1 | 24 | [866](https://v2.xivapi.com/api/sheet/ContentFinderCondition/866) | [灿烂神域阿格莱亚](https://ff14.huijiwiki.com/wiki/%E7%81%BF%E7%83%82%E7%A5%9E%E5%9F%9F%E9%98%BF%E6%A0%BC%E8%8E%B1%E4%BA%9A)<br>[Aglaia](https://ffxiv.consolegameswiki.com/wiki/Aglaia) | 比尔格／Byregot<br>拉尔戈／Rhalgr<br>阿泽玛／Azeyma<br>纳尔札尔／Nald'thal | 通过 |
| `ew-euphrosyne` | 6.3 | 24 | [911](https://v2.xivapi.com/api/sheet/ContentFinderCondition/911) | [喜悦神域欧芙洛绪涅](https://ff14.huijiwiki.com/wiki/%E5%96%9C%E6%82%A6%E7%A5%9E%E5%9F%9F%E6%AC%A7%E8%8A%99%E6%B4%9B%E7%BB%AA%E6%B6%85)<br>[Euphrosyne](https://ffxiv.consolegameswiki.com/wiki/Euphrosyne) | 诺菲卡／Nophica<br>阿尔基克，妮美雅／Althyk & Nymeia<br>哈罗妮／Halone<br>梅茵菲娜／Menphina | 通过 |
| `ew-thaleia` | 6.5 | 24 | [962](https://v2.xivapi.com/api/sheet/ContentFinderCondition/962) | [荣华神域塔利亚](https://ff14.huijiwiki.com/wiki/%E8%8D%A3%E5%8D%8E%E7%A5%9E%E5%9F%9F%E5%A1%94%E5%88%A9%E4%BA%9A)<br>[Thaleia](https://ffxiv.consolegameswiki.com/wiki/Thaleia) | 沙利亚克／Thaliak<br>利姆莱茵／Llymlaen<br>奥修昂／Oschon<br>欧罗基亚／Eulogia | 通过 |
| `dt-jeuno-the-first-walk` | 7.1 | 24 | [1015](https://v2.xivapi.com/api/sheet/ContentFinderCondition/1015) | [朱诺：第一巡行](https://ff14.huijiwiki.com/wiki/%E6%9C%B1%E8%AF%BA%EF%BC%9A%E7%AC%AC%E4%B8%80%E5%B7%A1%E8%A1%8C)<br>[Jeuno: The First Walk](https://ffxiv.consolegameswiki.com/wiki/Jeuno%3A_The_First_Walk) | 遥远的咒缚 普利修／Prishe of the Distant Chains<br>法芙尼尔／Fafnir the Forgotten<br>方舟天使／Ark Angels (MR / GK / TT / EV / HM)<br>暗之王／Shadow Lord | 通过 |
| `dt-san-doria-the-second-walk` | 7.3 | 24 | [1058](https://v2.xivapi.com/api/sheet/ContentFinderCondition/1058) | [桑多利亚：第二巡行](https://ff14.huijiwiki.com/wiki/%E6%A1%91%E5%A4%9A%E5%88%A9%E4%BA%9A%EF%BC%9A%E7%AC%AC%E4%BA%8C%E5%B7%A1%E8%A1%8C)<br>[San d'Oria: The Second Walk](https://ffxiv.consolegameswiki.com/wiki/San_d'Oria%3A_The_Second_Walk) | 信仰之麒麟／Faithbound Kirin<br>以我为终 欧米茄，以众畏我 阿尔蒂玛／Omega, the One & Ultima, the Feared<br>卡姆拉纳特／Kam'lanaut<br>埃尔德纳修／Eald'narche | 通过 |
| `dt-windurst-the-third-walk` | 7.5 | 24 | [1117](https://v2.xivapi.com/api/sheet/ContentFinderCondition/1117) | [温达斯：第三巡行](https://ff14.huijiwiki.com/wiki/%E6%B8%A9%E8%BE%BE%E6%96%AF%EF%BC%9A%E7%AC%AC%E4%B8%89%E5%B7%A1%E8%A1%8C)<br>[Windurst: The Third Walk](https://ffxiv.consolegameswiki.com/wiki/Windurst%3A_The_Third_Walk) | 恶魔香托托／Shantotto the Demon<br>巨神重现 亚历山大／Alexander Resurrected<br>普罗玛西亚／Promathia<br>神龙／虚无之王／Shinryu Paradox / Hollow King | 通过 |

### 4.x–5.x 普通 24 人联盟

| ID | 版本 | 人数 | CFC | 正式中／英文名 | Boss／阶段顺序 | 结果 |
|---|---:|---:|---:|---|---|---|
| `sb-royal-city-of-rabanastre` | 4.1 | 24 | [281](https://v2.xivapi.com/api/sheet/ContentFinderCondition/281) | [失落之都 拉巴纳斯塔](https://ff14.huijiwiki.com/wiki/%E5%A4%B1%E8%90%BD%E4%B9%8B%E9%83%BD_%E6%8B%89%E5%B7%B4%E7%BA%B3%E6%96%AF%E5%A1%94)<br>[The Royal City of Rabanastre](https://ffxiv.consolegameswiki.com/wiki/The_Royal_City_of_Rabanastre) | 背德皇帝马提乌斯／Mateus, the Corrupt<br>统治者哈修马利姆／Hashmal, Bringer of Order<br>人马王洛弗卡勒／Rofocale<br>冷血剑阿加斯／Argath Thadalfus | 通过 |
| `sb-ridorana-lighthouse` | 4.3 | 24 | [550](https://v2.xivapi.com/api/sheet/ContentFinderCondition/550) | [封闭圣塔 黎铎拉纳大灯塔](https://ff14.huijiwiki.com/wiki/%E5%B0%81%E9%97%AD%E5%9C%A3%E5%A1%94_%E9%BB%8E%E9%93%8E%E6%8B%89%E7%BA%B3%E5%A4%A7%E7%81%AF%E5%A1%94)<br>[The Ridorana Lighthouse](https://ffxiv.consolegameswiki.com/wiki/The_Ridorana_Lighthouse) | 暗黑之云法姆弗里特／Famfrit, the Darkening Cloud<br>魔人贝利亚斯／Belias, the Gigas<br>劳动七号／Construct 7<br>鬼龙雅兹玛特／Yiazmat | 通过 |
| `sb-orbonne-monastery` | 4.5 | 24 | [636](https://v2.xivapi.com/api/sheet/ContentFinderCondition/636) | [乐欲之所 瓯博讷修道院](https://ff14.huijiwiki.com/wiki/%E4%B9%90%E6%AC%B2%E4%B9%8B%E6%89%80_%E7%93%AF%E5%8D%9A%E8%AE%B7%E4%BF%AE%E9%81%93%E9%99%A2)<br>[The Orbonne Monastery](https://ffxiv.consolegameswiki.com/wiki/The_Orbonne_Monastery) | 机工士姆斯塔迪奥／Mustadio<br>圣骑士阿格莉亚丝／Agrias<br>雷神西德／The Thunder God<br>圣天使阿尔蒂玛／Ultima, the High Seraph | 通过 |
| `shb-copied-factory` | 5.1 | 24 | [700](https://v2.xivapi.com/api/sheet/ContentFinderCondition/700) | [复制工厂废墟](https://ff14.huijiwiki.com/wiki/%E5%A4%8D%E5%88%B6%E5%B7%A5%E5%8E%82%E5%BA%9F%E5%A2%9F)<br>[The Copied Factory](https://ffxiv.consolegameswiki.com/wiki/The_Copied_Factory) | 多关节型：司令机／Serial-jointed Command Model<br>霍布斯／Hobbes<br>昂格士／Engels<br>9S：接入多脚战车／9S-operated Walking Fortress | 通过 |
| `shb-puppets-bunker` | 5.3 | 24 | [736](https://v2.xivapi.com/api/sheet/ContentFinderCondition/736) | [人偶军事基地](https://ff14.huijiwiki.com/wiki/%E4%BA%BA%E5%81%B6%E5%86%9B%E4%BA%8B%E5%9F%BA%E5%9C%B0)<br>[The Puppets' Bunker](https://ffxiv.consolegameswiki.com/wiki/The_Puppets'_Bunker) | 813P：装备据点防卫装置／813P-operated Aegis Unit<br>强化型飞行装置 [A-lpha]/[B-eta]/[C-hi]／Superior Flight Units A-lpha / B-eta / C-hi<br>905P：装备重型陆战装置／905P-operated Heavy Artillery Unit<br>融合的人偶群 → 2P：融合体／The Compound → Compound 2P | 通过 |
| `shb-tower-at-paradigms-breach` | 5.5 | 24 | [779](https://v2.xivapi.com/api/sheet/ContentFinderCondition/779) | [希望之炮台：“塔”](https://ff14.huijiwiki.com/wiki/%E5%B8%8C%E6%9C%9B%E4%B9%8B%E7%82%AE%E5%8F%B0%EF%BC%9A%E2%80%9C%E5%A1%94%E2%80%9D)<br>[The Tower at Paradigm's Breach](https://ffxiv.consolegameswiki.com/wiki/The_Tower_at_Paradigm's_Breach) | 杰克／Knave of Hearts<br>韩塞尔 & 格雷特／Hansel & Gretel<br>红衣少女／Red Girl<br>伪造的神明 → 开花的神明／False Idol → Her Inflorescence | 通过 |

### 2.x 巴哈姆特大迷宫（8 人）

| ID | 版本 | 人数 | CFC | 正式中／英文名 | Boss／阶段顺序 | 结果 |
|---|---:|---:|---:|---|---|---|
| `arr-coil-t1` | 2.0 | 8 | [93](https://v2.xivapi.com/api/sheet/ContentFinderCondition/93) | [巴哈姆特大迷宫 邂逅之章1](https://ff14.huijiwiki.com/wiki/%E5%B7%B4%E5%93%88%E5%A7%86%E7%89%B9%E5%A4%A7%E8%BF%B7%E5%AE%AB_%E9%82%82%E9%80%85%E4%B9%8B%E7%AB%A01)<br>[The Binding Coil of Bahamut - Turn 1](https://ffxiv.consolegameswiki.com/wiki/The_Binding_Coil_of_Bahamut_-_Turn_1) | 自卫系统／ADS<br>神杖巨蛇／Caduceus | 通过 |
| `arr-coil-t2` | 2.0 | 8 | [94](https://v2.xivapi.com/api/sheet/ContentFinderCondition/94) | [巴哈姆特大迷宫 邂逅之章2](https://ff14.huijiwiki.com/wiki/%E5%B7%B4%E5%93%88%E5%A7%86%E7%89%B9%E5%A4%A7%E8%BF%B7%E5%AE%AB_%E9%82%82%E9%80%85%E4%B9%8B%E7%AB%A02)<br>[The Binding Coil of Bahamut - Turn 2](https://ffxiv.consolegameswiki.com/wiki/The_Binding_Coil_of_Bahamut_-_Turn_2) | 自卫系统／ADS | 通过 |
| `arr-coil-t3` | 2.0 | 8 | [95](https://v2.xivapi.com/api/sheet/ContentFinderCondition/95) | [巴哈姆特大迷宫 邂逅之章3](https://ff14.huijiwiki.com/wiki/%E5%B7%B4%E5%93%88%E5%A7%86%E7%89%B9%E5%A4%A7%E8%BF%B7%E5%AE%AB_%E9%82%82%E9%80%85%E4%B9%8B%E7%AB%A03)<br>[The Binding Coil of Bahamut - Turn 3](https://ffxiv.consolegameswiki.com/wiki/The_Binding_Coil_of_Bahamut_-_Turn_3) | 跳台迷宫（无Boss）／Jump-pad gauntlet (no boss) | 通过 |
| `arr-coil-t4` | 2.0 | 8 | [96](https://v2.xivapi.com/api/sheet/ContentFinderCondition/96) | [巴哈姆特大迷宫 邂逅之章4](https://ff14.huijiwiki.com/wiki/%E5%B7%B4%E5%93%88%E5%A7%86%E7%89%B9%E5%A4%A7%E8%BF%B7%E5%AE%AB_%E9%82%82%E9%80%85%E4%B9%8B%E7%AB%A04)<br>[The Binding Coil of Bahamut - Turn 4](https://ffxiv.consolegameswiki.com/wiki/The_Binding_Coil_of_Bahamut_-_Turn_4) | 亚拉戈发条兵团（六波小怪）／Clockwork waves (no boss) | 通过 |
| `arr-coil-t5` | 2.0 | 8 | [97](https://v2.xivapi.com/api/sheet/ContentFinderCondition/97) | [巴哈姆特大迷宫 邂逅之章5](https://ff14.huijiwiki.com/wiki/%E5%B7%B4%E5%93%88%E5%A7%86%E7%89%B9%E5%A4%A7%E8%BF%B7%E5%AE%AB_%E9%82%82%E9%80%85%E4%B9%8B%E7%AB%A05)<br>[The Binding Coil of Bahamut - Turn 5](https://ffxiv.consolegameswiki.com/wiki/The_Binding_Coil_of_Bahamut_-_Turn_5) | 双塔尼亚／Twintania | 通过 |
| `arr-coil-t6` | 2.2 | 8 | [98](https://v2.xivapi.com/api/sheet/ContentFinderCondition/98) | [巴哈姆特大迷宫 入侵之章1](https://ff14.huijiwiki.com/wiki/%E5%B7%B4%E5%93%88%E5%A7%86%E7%89%B9%E5%A4%A7%E8%BF%B7%E5%AE%AB_%E5%85%A5%E4%BE%B5%E4%B9%8B%E7%AB%A01)<br>[The Second Coil of Bahamut - Turn 1](https://ffxiv.consolegameswiki.com/wiki/The_Second_Coil_of_Bahamut_-_Turn_1) | 大王花／Rafflesia | 通过 |
| `arr-coil-t7` | 2.2 | 8 | [99](https://v2.xivapi.com/api/sheet/ContentFinderCondition/99) | [巴哈姆特大迷宫 入侵之章2](https://ff14.huijiwiki.com/wiki/%E5%B7%B4%E5%93%88%E5%A7%86%E7%89%B9%E5%A4%A7%E8%BF%B7%E5%AE%AB_%E5%85%A5%E4%BE%B5%E4%B9%8B%E7%AB%A02)<br>[The Second Coil of Bahamut - Turn 2](https://ffxiv.consolegameswiki.com/wiki/The_Second_Coil_of_Bahamut_-_Turn_2) | 美瑠姬奴／Melusine | 通过 |
| `arr-coil-t8` | 2.2 | 8 | [100](https://v2.xivapi.com/api/sheet/ContentFinderCondition/100) | [巴哈姆特大迷宫 入侵之章3](https://ff14.huijiwiki.com/wiki/%E5%B7%B4%E5%93%88%E5%A7%86%E7%89%B9%E5%A4%A7%E8%BF%B7%E5%AE%AB_%E5%85%A5%E4%BE%B5%E4%B9%8B%E7%AB%A03)<br>[The Second Coil of Bahamut - Turn 3](https://ffxiv.consolegameswiki.com/wiki/The_Second_Coil_of_Bahamut_-_Turn_3) | 降世化身／The Avatar | 通过 |
| `arr-coil-t9` | 2.2 | 8 | [101](https://v2.xivapi.com/api/sheet/ContentFinderCondition/101) | [巴哈姆特大迷宫 入侵之章4](https://ff14.huijiwiki.com/wiki/%E5%B7%B4%E5%93%88%E5%A7%86%E7%89%B9%E5%A4%A7%E8%BF%B7%E5%AE%AB_%E5%85%A5%E4%BE%B5%E4%B9%8B%E7%AB%A04)<br>[The Second Coil of Bahamut - Turn 4](https://ffxiv.consolegameswiki.com/wiki/The_Second_Coil_of_Bahamut_-_Turn_4) | 奈尔·神·达纳斯／Nael deus Darnus | 通过 |
| `arr-coil-t10` | 2.4 | 8 | [107](https://v2.xivapi.com/api/sheet/ContentFinderCondition/107) | [巴哈姆特大迷宫 真源之章1](https://ff14.huijiwiki.com/wiki/%E5%B7%B4%E5%93%88%E5%A7%86%E7%89%B9%E5%A4%A7%E8%BF%B7%E5%AE%AB_%E7%9C%9F%E6%BA%90%E4%B9%8B%E7%AB%A01)<br>[The Final Coil of Bahamut - Turn 1](https://ffxiv.consolegameswiki.com/wiki/The_Final_Coil_of_Bahamut_-_Turn_1) | 伊姆都古德／Imdugud | 通过 |
| `arr-coil-t11` | 2.4 | 8 | [108](https://v2.xivapi.com/api/sheet/ContentFinderCondition/108) | [巴哈姆特大迷宫 真源之章2](https://ff14.huijiwiki.com/wiki/%E5%B7%B4%E5%93%88%E5%A7%86%E7%89%B9%E5%A4%A7%E8%BF%B7%E5%AE%AB_%E7%9C%9F%E6%BA%90%E4%B9%8B%E7%AB%A02)<br>[The Final Coil of Bahamut - Turn 2](https://ffxiv.consolegameswiki.com/wiki/The_Final_Coil_of_Bahamut_-_Turn_2) | 卡利亚／Kaliya | 通过 |
| `arr-coil-t12` | 2.4 | 8 | [109](https://v2.xivapi.com/api/sheet/ContentFinderCondition/109) | [巴哈姆特大迷宫 真源之章3](https://ff14.huijiwiki.com/wiki/%E5%B7%B4%E5%93%88%E5%A7%86%E7%89%B9%E5%A4%A7%E8%BF%B7%E5%AE%AB_%E7%9C%9F%E6%BA%90%E4%B9%8B%E7%AB%A03)<br>[The Final Coil of Bahamut - Turn 3](https://ffxiv.consolegameswiki.com/wiki/The_Final_Coil_of_Bahamut_-_Turn_3) | 不死鸟／Phoenix | 通过 |
| `arr-coil-t13` | 2.4 | 8 | [110](https://v2.xivapi.com/api/sheet/ContentFinderCondition/110) | [巴哈姆特大迷宫 真源之章4](https://ff14.huijiwiki.com/wiki/%E5%B7%B4%E5%93%88%E5%A7%86%E7%89%B9%E5%A4%A7%E8%BF%B7%E5%AE%AB_%E7%9C%9F%E6%BA%90%E4%B9%8B%E7%AB%A04)<br>[The Final Coil of Bahamut - Turn 4](https://ffxiv.consolegameswiki.com/wiki/The_Final_Coil_of_Bahamut_-_Turn_4) | 至尊巴哈姆特／Bahamut Prime | 通过 |

### 7.x 阿卡狄亚（普通 8 人）

| ID | 版本 | 人数 | CFC | 正式中／英文名 | Boss／阶段顺序 | 结果 |
|---|---:|---:|---:|---|---|---|
| `dt-arcadion-m1` | 7.01 | 8 | [985](https://v2.xivapi.com/api/sheet/ContentFinderCondition/985) | [阿卡狄亚登天斗技场 轻量级1](https://ff14.huijiwiki.com/wiki/%E9%98%BF%E5%8D%A1%E7%8B%84%E4%BA%9A%E7%99%BB%E5%A4%A9%E6%96%97%E6%8A%80%E5%9C%BA_%E8%BD%BB%E9%87%8F%E7%BA%A71)<br>[AAC Light-heavyweight M1](https://ffxiv.consolegameswiki.com/wiki/AAC_Light-heavyweight_M1) | 黑猫／Black Cat | 通过 |
| `dt-arcadion-m2` | 7.01 | 8 | [987](https://v2.xivapi.com/api/sheet/ContentFinderCondition/987) | [阿卡狄亚登天斗技场 轻量级2](https://ff14.huijiwiki.com/wiki/%E9%98%BF%E5%8D%A1%E7%8B%84%E4%BA%9A%E7%99%BB%E5%A4%A9%E6%96%97%E6%8A%80%E5%9C%BA_%E8%BD%BB%E9%87%8F%E7%BA%A72)<br>[AAC Light-heavyweight M2](https://ffxiv.consolegameswiki.com/wiki/AAC_Light-heavyweight_M2) | 蜂蜂小甜心／Honey B. Lovely | 通过 |
| `dt-arcadion-m3` | 7.01 | 8 | [989](https://v2.xivapi.com/api/sheet/ContentFinderCondition/989) | [阿卡狄亚登天斗技场 轻量级3](https://ff14.huijiwiki.com/wiki/%E9%98%BF%E5%8D%A1%E7%8B%84%E4%BA%9A%E7%99%BB%E5%A4%A9%E6%96%97%E6%8A%80%E5%9C%BA_%E8%BD%BB%E9%87%8F%E7%BA%A73)<br>[AAC Light-heavyweight M3](https://ffxiv.consolegameswiki.com/wiki/AAC_Light-heavyweight_M3) | 野蛮爆弹／Brute Bomber | 通过 |
| `dt-arcadion-m4` | 7.01 | 8 | [991](https://v2.xivapi.com/api/sheet/ContentFinderCondition/991) | [阿卡狄亚登天斗技场 轻量级4](https://ff14.huijiwiki.com/wiki/%E9%98%BF%E5%8D%A1%E7%8B%84%E4%BA%9A%E7%99%BB%E5%A4%A9%E6%96%97%E6%8A%80%E5%9C%BA_%E8%BD%BB%E9%87%8F%E7%BA%A74)<br>[AAC Light-heavyweight M4](https://ffxiv.consolegameswiki.com/wiki/AAC_Light-heavyweight_M4) | 狡雷／Wicked Thunder | 通过 |
| `dt-arcadion-m5` | 7.2 | 8 | [1019](https://v2.xivapi.com/api/sheet/ContentFinderCondition/1019) | [阿卡狄亚登天斗技场 中量级1](https://ff14.huijiwiki.com/wiki/%E9%98%BF%E5%8D%A1%E7%8B%84%E4%BA%9A%E7%99%BB%E5%A4%A9%E6%96%97%E6%8A%80%E5%9C%BA_%E4%B8%AD%E9%87%8F%E7%BA%A71)<br>[AAC Cruiserweight M1](https://ffxiv.consolegameswiki.com/wiki/AAC_Cruiserweight_M1) | 热舞绿光／Dancing Green | 通过 |
| `dt-arcadion-m6` | 7.2 | 8 | [1021](https://v2.xivapi.com/api/sheet/ContentFinderCondition/1021) | [阿卡狄亚登天斗技场 中量级2](https://ff14.huijiwiki.com/wiki/%E9%98%BF%E5%8D%A1%E7%8B%84%E4%BA%9A%E7%99%BB%E5%A4%A9%E6%96%97%E6%8A%80%E5%9C%BA_%E4%B8%AD%E9%87%8F%E7%BA%A72)<br>[AAC Cruiserweight M2](https://ffxiv.consolegameswiki.com/wiki/AAC_Cruiserweight_M2) | 狂热糖潮／Sugar Riot | 通过 |
| `dt-arcadion-m7` | 7.2 | 8 | [1023](https://v2.xivapi.com/api/sheet/ContentFinderCondition/1023) | [阿卡狄亚登天斗技场 中量级3](https://ff14.huijiwiki.com/wiki/%E9%98%BF%E5%8D%A1%E7%8B%84%E4%BA%9A%E7%99%BB%E5%A4%A9%E6%96%97%E6%8A%80%E5%9C%BA_%E4%B8%AD%E9%87%8F%E7%BA%A73)<br>[AAC Cruiserweight M3](https://ffxiv.consolegameswiki.com/wiki/AAC_Cruiserweight_M3) | 野蛮恨心／Brute Abombinator | 通过 |
| `dt-arcadion-m8` | 7.2 | 8 | [1025](https://v2.xivapi.com/api/sheet/ContentFinderCondition/1025) | [阿卡狄亚登天斗技场 中量级4](https://ff14.huijiwiki.com/wiki/%E9%98%BF%E5%8D%A1%E7%8B%84%E4%BA%9A%E7%99%BB%E5%A4%A9%E6%96%97%E6%8A%80%E5%9C%BA_%E4%B8%AD%E9%87%8F%E7%BA%A74)<br>[AAC Cruiserweight M4](https://ffxiv.consolegameswiki.com/wiki/AAC_Cruiserweight_M4) | 剑嚎／Howling Blade | 通过 |
| `dt-arcadion-m9` | 7.4 | 8 | [1068](https://v2.xivapi.com/api/sheet/ContentFinderCondition/1068) | [阿卡狄亚登天斗技场 重量级1](https://ff14.huijiwiki.com/wiki/%E9%98%BF%E5%8D%A1%E7%8B%84%E4%BA%9A%E7%99%BB%E5%A4%A9%E6%96%97%E6%8A%80%E5%9C%BA_%E9%87%8D%E9%87%8F%E7%BA%A71)<br>[AAC Heavyweight M1](https://ffxiv.consolegameswiki.com/wiki/AAC_Heavyweight_M1) | 致命美人／Vamp Fatale | 通过 |
| `dt-arcadion-m10` | 7.4 | 8 | [1070](https://v2.xivapi.com/api/sheet/ContentFinderCondition/1070) | [阿卡狄亚登天斗技场 重量级2](https://ff14.huijiwiki.com/wiki/%E9%98%BF%E5%8D%A1%E7%8B%84%E4%BA%9A%E7%99%BB%E5%A4%A9%E6%96%97%E6%8A%80%E5%9C%BA_%E9%87%8D%E9%87%8F%E7%BA%A72)<br>[AAC Heavyweight M2](https://ffxiv.consolegameswiki.com/wiki/AAC_Heavyweight_M2) | 极限兄弟（炽红／深蓝）／The Xtremes (Red Hot / Deep Blue) | 通过 |
| `dt-arcadion-m11` | 7.4 | 8 | [1072](https://v2.xivapi.com/api/sheet/ContentFinderCondition/1072) | [阿卡狄亚登天斗技场 重量级3](https://ff14.huijiwiki.com/wiki/%E9%98%BF%E5%8D%A1%E7%8B%84%E4%BA%9A%E7%99%BB%E5%A4%A9%E6%96%97%E6%8A%80%E5%9C%BA_%E9%87%8D%E9%87%8F%E7%BA%A73)<br>[AAC Heavyweight M3](https://ffxiv.consolegameswiki.com/wiki/AAC_Heavyweight_M3) | 霸王／The Tyrant | 通过 |
| `dt-arcadion-m12` | 7.4 | 8 | [1074](https://v2.xivapi.com/api/sheet/ContentFinderCondition/1074) | [阿卡狄亚登天斗技场 重量级4](https://ff14.huijiwiki.com/wiki/%E9%98%BF%E5%8D%A1%E7%8B%84%E4%BA%9A%E7%99%BB%E5%A4%A9%E6%96%97%E6%8A%80%E5%9C%BA_%E9%87%8D%E9%87%8F%E7%BA%A74)<br>[AAC Heavyweight M4](https://ffxiv.consolegameswiki.com/wiki/AAC_Heavyweight_M4) | 林德布鲁姆／The Lindwurm | 通过 |

### 6.x 万魔殿（普通 8 人）

| ID | 版本 | 人数 | CFC | 正式中／英文名 | Boss／阶段顺序 | 结果 |
|---|---:|---:|---:|---|---|---|
| `ew-pandaemonium-p1` | 6.01 | 8 | [808](https://v2.xivapi.com/api/sheet/ContentFinderCondition/808) | [万魔殿 边境之狱1](https://ff14.huijiwiki.com/wiki/%E4%B8%87%E9%AD%94%E6%AE%BF_%E8%BE%B9%E5%A2%83%E4%B9%8B%E7%8B%B11)<br>[Asphodelos: The First Circle](https://ffxiv.consolegameswiki.com/wiki/Asphodelos%3A_The_First_Circle) | 埃里克特翁尼亚斯／Erichthonios | 通过 |
| `ew-pandaemonium-p2` | 6.01 | 8 | [810](https://v2.xivapi.com/api/sheet/ContentFinderCondition/810) | [万魔殿 边境之狱2](https://ff14.huijiwiki.com/wiki/%E4%B8%87%E9%AD%94%E6%AE%BF_%E8%BE%B9%E5%A2%83%E4%B9%8B%E7%8B%B12)<br>[Asphodelos: The Second Circle](https://ffxiv.consolegameswiki.com/wiki/Asphodelos%3A_The_Second_Circle) | 鱼尾海马怪／Hippokampos | 通过 |
| `ew-pandaemonium-p3` | 6.01 | 8 | [806](https://v2.xivapi.com/api/sheet/ContentFinderCondition/806) | [万魔殿 边境之狱3](https://ff14.huijiwiki.com/wiki/%E4%B8%87%E9%AD%94%E6%AE%BF_%E8%BE%B9%E5%A2%83%E4%B9%8B%E7%8B%B13)<br>[Asphodelos: The Third Circle](https://ffxiv.consolegameswiki.com/wiki/Asphodelos%3A_The_Third_Circle) | 菲尼克司／Phoinix | 通过 |
| `ew-pandaemonium-p4` | 6.01 | 8 | [800](https://v2.xivapi.com/api/sheet/ContentFinderCondition/800) | [万魔殿 边境之狱4](https://ff14.huijiwiki.com/wiki/%E4%B8%87%E9%AD%94%E6%AE%BF_%E8%BE%B9%E5%A2%83%E4%B9%8B%E7%8B%B14)<br>[Asphodelos: The Fourth Circle](https://ffxiv.consolegameswiki.com/wiki/Asphodelos%3A_The_Fourth_Circle) | 赫斯珀洛斯／Hesperos | 通过 |
| `ew-pandaemonium-p5` | 6.2 | 8 | [872](https://v2.xivapi.com/api/sheet/ContentFinderCondition/872) | [万魔殿 炼净之狱1](https://ff14.huijiwiki.com/wiki/%E4%B8%87%E9%AD%94%E6%AE%BF_%E7%82%BC%E5%87%80%E4%B9%8B%E7%8B%B11)<br>[Abyssos: The Fifth Circle](https://ffxiv.consolegameswiki.com/wiki/Abyssos%3A_The_Fifth_Circle) | 原型宝石兽／Proto-Carbuncle | 通过 |
| `ew-pandaemonium-p6` | 6.2 | 8 | [880](https://v2.xivapi.com/api/sheet/ContentFinderCondition/880) | [万魔殿 炼净之狱2](https://ff14.huijiwiki.com/wiki/%E4%B8%87%E9%AD%94%E6%AE%BF_%E7%82%BC%E5%87%80%E4%B9%8B%E7%8B%B12)<br>[Abyssos: The Sixth Circle](https://ffxiv.consolegameswiki.com/wiki/Abyssos%3A_The_Sixth_Circle) | 赫革摩涅／Hegemone | 通过 |
| `ew-pandaemonium-p7` | 6.2 | 8 | [876](https://v2.xivapi.com/api/sheet/ContentFinderCondition/876) | [万魔殿 炼净之狱3](https://ff14.huijiwiki.com/wiki/%E4%B8%87%E9%AD%94%E6%AE%BF_%E7%82%BC%E5%87%80%E4%B9%8B%E7%8B%B13)<br>[Abyssos: The Seventh Circle](https://ffxiv.consolegameswiki.com/wiki/Abyssos%3A_The_Seventh_Circle) | 阿格狄斯提斯／Agdistis | 通过 |
| `ew-pandaemonium-p8` | 6.2 | 8 | [883](https://v2.xivapi.com/api/sheet/ContentFinderCondition/883) | [万魔殿 炼净之狱4](https://ff14.huijiwiki.com/wiki/%E4%B8%87%E9%AD%94%E6%AE%BF_%E7%82%BC%E5%87%80%E4%B9%8B%E7%8B%B14)<br>[Abyssos: The Eighth Circle](https://ffxiv.consolegameswiki.com/wiki/Abyssos%3A_The_Eighth_Circle) | 赫淮斯托斯／Hephaistos | 通过 |
| `ew-pandaemonium-p9` | 6.4 | 8 | [936](https://v2.xivapi.com/api/sheet/ContentFinderCondition/936) | [万魔殿 荒天之狱1](https://ff14.huijiwiki.com/wiki/%E4%B8%87%E9%AD%94%E6%AE%BF_%E8%8D%92%E5%A4%A9%E4%B9%8B%E7%8B%B11)<br>[Anabaseios: The Ninth Circle](https://ffxiv.consolegameswiki.com/wiki/Anabaseios%3A_The_Ninth_Circle) | 科库托斯／Kokytos | 通过 |
| `ew-pandaemonium-p10` | 6.4 | 8 | [938](https://v2.xivapi.com/api/sheet/ContentFinderCondition/938) | [万魔殿 荒天之狱2](https://ff14.huijiwiki.com/wiki/%E4%B8%87%E9%AD%94%E6%AE%BF_%E8%8D%92%E5%A4%A9%E4%B9%8B%E7%8B%B12)<br>[Anabaseios: The Tenth Circle](https://ffxiv.consolegameswiki.com/wiki/Anabaseios%3A_The_Tenth_Circle) | 万魔殿／Pandæmonium | 通过 |
| `ew-pandaemonium-p11` | 6.4 | 8 | [940](https://v2.xivapi.com/api/sheet/ContentFinderCondition/940) | [万魔殿 荒天之狱3](https://ff14.huijiwiki.com/wiki/%E4%B8%87%E9%AD%94%E6%AE%BF_%E8%8D%92%E5%A4%A9%E4%B9%8B%E7%8B%B13)<br>[Anabaseios: The Eleventh Circle](https://ffxiv.consolegameswiki.com/wiki/Anabaseios%3A_The_Eleventh_Circle) | 特弥斯／Themis | 通过 |
| `ew-pandaemonium-p12` | 6.4 | 8 | [942](https://v2.xivapi.com/api/sheet/ContentFinderCondition/942) | [万魔殿 荒天之狱4](https://ff14.huijiwiki.com/wiki/%E4%B8%87%E9%AD%94%E6%AE%BF_%E8%8D%92%E5%A4%A9%E4%B9%8B%E7%8B%B14)<br>[Anabaseios: The Twelfth Circle](https://ffxiv.consolegameswiki.com/wiki/Anabaseios%3A_The_Twelfth_Circle) | 雅典娜／Athena | 通过 |

### 3.x 亚历山大（普通 8 人）

| ID | 版本 | 人数 | CFC | 正式中／英文名 | Boss／阶段顺序 | 结果 |
|---|---:|---:|---:|---|---|---|
| `hw-alexander-a1` | 3.01 | 8 | [112](https://v2.xivapi.com/api/sheet/ContentFinderCondition/112) | [亚历山大机神城 启动之章1](https://ff14.huijiwiki.com/wiki/%E4%BA%9A%E5%8E%86%E5%B1%B1%E5%A4%A7%E6%9C%BA%E7%A5%9E%E5%9F%8E_%E5%90%AF%E5%8A%A8%E4%B9%8B%E7%AB%A01)<br>[Alexander - The Fist of the Father](https://ffxiv.consolegameswiki.com/wiki/Alexander_-_The_Fist_of_the_Father) | 浮士德／Faust<br>压迫者／Oppressor | 通过 |
| `hw-alexander-a2` | 3.01 | 8 | [113](https://v2.xivapi.com/api/sheet/ContentFinderCondition/113) | [亚历山大机神城 启动之章2](https://ff14.huijiwiki.com/wiki/%E4%BA%9A%E5%8E%86%E5%B1%B1%E5%A4%A7%E6%9C%BA%E7%A5%9E%E5%9F%8E_%E5%90%AF%E5%8A%A8%E4%B9%8B%E7%AB%A02)<br>[Alexander - The Cuff of the Father](https://ffxiv.consolegameswiki.com/wiki/Alexander_-_The_Cuff_of_the_Father) | 爆破型7号哥布林战车／Boomtype Magitek Gobwalker G-VII<br>狩猎人偶／Jagd Doll<br>戈耳狄硬盔兵 / 戈耳狄铁心兵 / 士兵 / 狙击手／Gordian Hardhelm / Hardmind / Soldier / Sniper<br>9号哥布林黑寡妇／Magitek Gobwidow G-IX | 通过 |
| `hw-alexander-a3` | 3.01 | 8 | [114](https://v2.xivapi.com/api/sheet/ContentFinderCondition/114) | [亚历山大机神城 启动之章3](https://ff14.huijiwiki.com/wiki/%E4%BA%9A%E5%8E%86%E5%B1%B1%E5%A4%A7%E6%9C%BA%E7%A5%9E%E5%9F%8E_%E5%90%AF%E5%8A%A8%E4%B9%8B%E7%AB%A03)<br>[Alexander - The Arm of the Father](https://ffxiv.consolegameswiki.com/wiki/Alexander_-_The_Arm_of_the_Father) | 有生命活水／Living Liquid | 通过 |
| `hw-alexander-a4` | 3.01 | 8 | [115](https://v2.xivapi.com/api/sheet/ContentFinderCondition/115) | [亚历山大机神城 启动之章4](https://ff14.huijiwiki.com/wiki/%E4%BA%9A%E5%8E%86%E5%B1%B1%E5%A4%A7%E6%9C%BA%E7%A5%9E%E5%9F%8E_%E5%90%AF%E5%8A%A8%E4%B9%8B%E7%AB%A04)<br>[Alexander - The Burden of the Father](https://ffxiv.consolegameswiki.com/wiki/Alexander_-_The_Burden_of_the_Father) | 操纵者／The Manipulator | 通过 |
| `hw-alexander-a5` | 3.2 | 8 | [136](https://v2.xivapi.com/api/sheet/ContentFinderCondition/136) | [亚历山大机神城 律动之章1](https://ff14.huijiwiki.com/wiki/%E4%BA%9A%E5%8E%86%E5%B1%B1%E5%A4%A7%E6%9C%BA%E7%A5%9E%E5%9F%8E_%E5%BE%8B%E5%8A%A8%E4%B9%8B%E7%AB%A01)<br>[Alexander - The Fist of the Son](https://ffxiv.consolegameswiki.com/wiki/Alexander_-_The_Fist_of_the_Son) | 奇才 拉特芬克斯／Ratfinx Twinkledinks | 通过 |
| `hw-alexander-a6` | 3.2 | 8 | [137](https://v2.xivapi.com/api/sheet/ContentFinderCondition/137) | [亚历山大机神城 律动之章2](https://ff14.huijiwiki.com/wiki/%E4%BA%9A%E5%8E%86%E5%B1%B1%E5%A4%A7%E6%9C%BA%E7%A5%9E%E5%9F%8E_%E5%BE%8B%E5%8A%A8%E4%B9%8B%E7%AB%A02)<br>[Alexander - The Cuff of the Son](https://ffxiv.consolegameswiki.com/wiki/Alexander_-_The_Cuff_of_the_Son) | 爆破者／Blaster<br>争斗者／Brawler<br>欺诈者／Swindler<br>环旋者／Vortexer | 通过 |
| `hw-alexander-a7` | 3.2 | 8 | [138](https://v2.xivapi.com/api/sheet/ContentFinderCondition/138) | [亚历山大机神城 律动之章3](https://ff14.huijiwiki.com/wiki/%E4%BA%9A%E5%8E%86%E5%B1%B1%E5%A4%A7%E6%9C%BA%E7%A5%9E%E5%9F%8E_%E5%BE%8B%E5%8A%A8%E4%B9%8B%E7%AB%A03)<br>[Alexander - The Arm of the Son](https://ffxiv.consolegameswiki.com/wiki/Alexander_-_The_Arm_of_the_Son) | 万事通 奎克辛克斯／Quickthinx Allthoughts | 通过 |
| `hw-alexander-a8` | 3.2 | 8 | [139](https://v2.xivapi.com/api/sheet/ContentFinderCondition/139) | [亚历山大机神城 律动之章4](https://ff14.huijiwiki.com/wiki/%E4%BA%9A%E5%8E%86%E5%B1%B1%E5%A4%A7%E6%9C%BA%E7%A5%9E%E5%9F%8E_%E5%BE%8B%E5%8A%A8%E4%B9%8B%E7%AB%A04)<br>[Alexander - The Burden of the Son](https://ffxiv.consolegameswiki.com/wiki/Alexander_-_The_Burden_of_the_Son) | 突击者／Onslaughter<br>争斗者 + 环旋者／Brawler + Vortexer<br>欺诈者 + 爆破者／Swindler + Blaster<br>残暴正义号／Brute Justice | 通过 |
| `hw-alexander-a9` | 3.4 | 8 | [186](https://v2.xivapi.com/api/sheet/ContentFinderCondition/186) | [亚历山大机神城 天动之章1](https://ff14.huijiwiki.com/wiki/%E4%BA%9A%E5%8E%86%E5%B1%B1%E5%A4%A7%E6%9C%BA%E7%A5%9E%E5%9F%8E_%E5%A4%A9%E5%8A%A8%E4%B9%8B%E7%AB%A01)<br>[Alexander - The Eyes of the Creator](https://ffxiv.consolegameswiki.com/wiki/Alexander_-_The_Eyes_of_the_Creator) | 终极浮士德／Faust Z<br>废品翻新装置／Refurbisher 0 | 通过 |
| `hw-alexander-a10` | 3.4 | 8 | [187](https://v2.xivapi.com/api/sheet/ContentFinderCondition/187) | [亚历山大机神城 天动之章2](https://ff14.huijiwiki.com/wiki/%E4%BA%9A%E5%8E%86%E5%B1%B1%E5%A4%A7%E6%9C%BA%E7%A5%9E%E5%9F%8E_%E5%A4%A9%E5%8A%A8%E4%B9%8B%E7%AB%A02)<br>[Alexander - The Breath of the Creator](https://ffxiv.consolegameswiki.com/wiki/Alexander_-_The_Breath_of_the_Creator) | 佣兵雷姆普里克斯／Lamebrix Strikebocks | 通过 |
| `hw-alexander-a11` | 3.4 | 8 | [188](https://v2.xivapi.com/api/sheet/ContentFinderCondition/188) | [亚历山大机神城 天动之章3](https://ff14.huijiwiki.com/wiki/%E4%BA%9A%E5%8E%86%E5%B1%B1%E5%A4%A7%E6%9C%BA%E7%A5%9E%E5%9F%8E_%E5%A4%A9%E5%8A%A8%E4%B9%8B%E7%AB%A03)<br>[Alexander - The Heart of the Creator](https://ffxiv.consolegameswiki.com/wiki/Alexander_-_The_Heart_of_the_Creator) | 巡航驱逐者／Cruise Chaser | 通过 |
| `hw-alexander-a12` | 3.4 | 8 | [189](https://v2.xivapi.com/api/sheet/ContentFinderCondition/189) | [亚历山大机神城 天动之章4](https://ff14.huijiwiki.com/wiki/%E4%BA%9A%E5%8E%86%E5%B1%B1%E5%A4%A7%E6%9C%BA%E7%A5%9E%E5%9F%8E_%E5%A4%A9%E5%8A%A8%E4%B9%8B%E7%AB%A04)<br>[Alexander - The Soul of the Creator](https://ffxiv.consolegameswiki.com/wiki/Alexander_-_The_Soul_of_the_Creator) | 至尊亚历山大／Alexander Prime | 通过 |

### 4.x 欧米茄（普通 8 人）

| ID | 版本 | 人数 | CFC | 正式中／英文名 | Boss／阶段顺序 | 结果 |
|---|---:|---:|---:|---|---|---|
| `sb-omega-o1` | 4.01 | 8 | [252](https://v2.xivapi.com/api/sheet/ContentFinderCondition/252) | [欧米茄时空狭缝 德尔塔幻境1](https://ff14.huijiwiki.com/wiki/%E6%AC%A7%E7%B1%B3%E8%8C%84%E6%97%B6%E7%A9%BA%E7%8B%AD%E7%BC%9D_%E5%BE%B7%E5%B0%94%E5%A1%94%E5%B9%BB%E5%A2%831)<br>[Deltascape V1.0](https://ffxiv.consolegameswiki.com/wiki/Deltascape_V1.0) | 老者／Alte Roite | 通过 |
| `sb-omega-o2` | 4.01 | 8 | [253](https://v2.xivapi.com/api/sheet/ContentFinderCondition/253) | [欧米茄时空狭缝 德尔塔幻境2](https://ff14.huijiwiki.com/wiki/%E6%AC%A7%E7%B1%B3%E8%8C%84%E6%97%B6%E7%A9%BA%E7%8B%AD%E7%BC%9D_%E5%BE%B7%E5%B0%94%E5%A1%94%E5%B9%BB%E5%A2%832)<br>[Deltascape V2.0](https://ffxiv.consolegameswiki.com/wiki/Deltascape_V2.0) | 灾变者／Catastrophe | 通过 |
| `sb-omega-o3` | 4.01 | 8 | [254](https://v2.xivapi.com/api/sheet/ContentFinderCondition/254) | [欧米茄时空狭缝 德尔塔幻境3](https://ff14.huijiwiki.com/wiki/%E6%AC%A7%E7%B1%B3%E8%8C%84%E6%97%B6%E7%A9%BA%E7%8B%AD%E7%BC%9D_%E5%BE%B7%E5%B0%94%E5%A1%94%E5%B9%BB%E5%A2%833)<br>[Deltascape V3.0](https://ffxiv.consolegameswiki.com/wiki/Deltascape_V3.0) | 哈利卡纳苏斯／Halicarnassus | 通过 |
| `sb-omega-o4` | 4.01 | 8 | [255](https://v2.xivapi.com/api/sheet/ContentFinderCondition/255) | [欧米茄时空狭缝 德尔塔幻境4](https://ff14.huijiwiki.com/wiki/%E6%AC%A7%E7%B1%B3%E8%8C%84%E6%97%B6%E7%A9%BA%E7%8B%AD%E7%BC%9D_%E5%BE%B7%E5%B0%94%E5%A1%94%E5%B9%BB%E5%A2%834)<br>[Deltascape V4.0](https://ffxiv.consolegameswiki.com/wiki/Deltascape_V4.0) | 艾克斯迪司／Exdeath | 通过 |
| `sb-omega-o5` | 4.2 | 8 | [286](https://v2.xivapi.com/api/sheet/ContentFinderCondition/286) | [欧米茄时空狭缝 西格玛幻境1](https://ff14.huijiwiki.com/wiki/%E6%AC%A7%E7%B1%B3%E8%8C%84%E6%97%B6%E7%A9%BA%E7%8B%AD%E7%BC%9D_%E8%A5%BF%E6%A0%BC%E7%8E%9B%E5%B9%BB%E5%A2%831)<br>[Sigmascape V1.0](https://ffxiv.consolegameswiki.com/wiki/Sigmascape_V1.0) | 魔列车／Phantom Train | 通过 |
| `sb-omega-o6` | 4.2 | 8 | [287](https://v2.xivapi.com/api/sheet/ContentFinderCondition/287) | [欧米茄时空狭缝 西格玛幻境2](https://ff14.huijiwiki.com/wiki/%E6%AC%A7%E7%B1%B3%E8%8C%84%E6%97%B6%E7%A9%BA%E7%8B%AD%E7%BC%9D_%E8%A5%BF%E6%A0%BC%E7%8E%9B%E5%B9%BB%E5%A2%832)<br>[Sigmascape V2.0](https://ffxiv.consolegameswiki.com/wiki/Sigmascape_V2.0) | 恶魔查达奴克／Demon Chadarnook | 通过 |
| `sb-omega-o7` | 4.2 | 8 | [288](https://v2.xivapi.com/api/sheet/ContentFinderCondition/288) | [欧米茄时空狭缝 西格玛幻境3](https://ff14.huijiwiki.com/wiki/%E6%AC%A7%E7%B1%B3%E8%8C%84%E6%97%B6%E7%A9%BA%E7%8B%AD%E7%BC%9D_%E8%A5%BF%E6%A0%BC%E7%8E%9B%E5%B9%BB%E5%A2%833)<br>[Sigmascape V3.0](https://ffxiv.consolegameswiki.com/wiki/Sigmascape_V3.0) | 守护者／Guardian | 通过 |
| `sb-omega-o8` | 4.2 | 8 | [289](https://v2.xivapi.com/api/sheet/ContentFinderCondition/289) | [欧米茄时空狭缝 西格玛幻境4](https://ff14.huijiwiki.com/wiki/%E6%AC%A7%E7%B1%B3%E8%8C%84%E6%97%B6%E7%A9%BA%E7%8B%AD%E7%BC%9D_%E8%A5%BF%E6%A0%BC%E7%8E%9B%E5%B9%BB%E5%A2%834)<br>[Sigmascape V4.0](https://ffxiv.consolegameswiki.com/wiki/Sigmascape_V4.0) | 凯夫卡／Kefka | 通过 |
| `sb-omega-o9` | 4.4 | 8 | [587](https://v2.xivapi.com/api/sheet/ContentFinderCondition/587) | [欧米茄时空狭缝 阿尔法幻境1](https://ff14.huijiwiki.com/wiki/%E6%AC%A7%E7%B1%B3%E8%8C%84%E6%97%B6%E7%A9%BA%E7%8B%AD%E7%BC%9D_%E9%98%BF%E5%B0%94%E6%B3%95%E5%B9%BB%E5%A2%831)<br>[Alphascape V1.0](https://ffxiv.consolegameswiki.com/wiki/Alphascape_V1.0) | 卡奥斯／Chaos | 通过 |
| `sb-omega-o10` | 4.4 | 8 | [588](https://v2.xivapi.com/api/sheet/ContentFinderCondition/588) | [欧米茄时空狭缝 阿尔法幻境2](https://ff14.huijiwiki.com/wiki/%E6%AC%A7%E7%B1%B3%E8%8C%84%E6%97%B6%E7%A9%BA%E7%8B%AD%E7%BC%9D_%E9%98%BF%E5%B0%94%E6%B3%95%E5%B9%BB%E5%A2%832)<br>[Alphascape V2.0](https://ffxiv.consolegameswiki.com/wiki/Alphascape_V2.0) | 尘世幻龙／Midgardsormr | 通过 |
| `sb-omega-o11` | 4.4 | 8 | [589](https://v2.xivapi.com/api/sheet/ContentFinderCondition/589) | [欧米茄时空狭缝 阿尔法幻境3](https://ff14.huijiwiki.com/wiki/%E6%AC%A7%E7%B1%B3%E8%8C%84%E6%97%B6%E7%A9%BA%E7%8B%AD%E7%BC%9D_%E9%98%BF%E5%B0%94%E6%B3%95%E5%B9%BB%E5%A2%833)<br>[Alphascape V3.0](https://ffxiv.consolegameswiki.com/wiki/Alphascape_V3.0) | 欧米茄／Omega | 通过 |
| `sb-omega-o12` | 4.4 | 8 | [590](https://v2.xivapi.com/api/sheet/ContentFinderCondition/590) | [欧米茄时空狭缝 阿尔法幻境4](https://ff14.huijiwiki.com/wiki/%E6%AC%A7%E7%B1%B3%E8%8C%84%E6%97%B6%E7%A9%BA%E7%8B%AD%E7%BC%9D_%E9%98%BF%E5%B0%94%E6%B3%95%E5%B9%BB%E5%A2%834)<br>[Alphascape V4.0](https://ffxiv.consolegameswiki.com/wiki/Alphascape_V4.0) | 欧米茄M／欧米茄F／Omega-M / Omega-F<br>欧米茄M＆欧米茄F（双体阶段）／Omega-M & Omega-F (duo phase) | 通过 |

### 5.x 伊甸（普通 8 人）

| ID | 版本 | 人数 | CFC | 正式中／英文名 | Boss／阶段顺序 | 结果 |
|---|---:|---:|---:|---|---|---|
| `shb-eden-e1` | 5.01 | 8 | [653](https://v2.xivapi.com/api/sheet/ContentFinderCondition/653) | [伊甸希望乐园 觉醒之章1](https://ff14.huijiwiki.com/wiki/%E4%BC%8A%E7%94%B8%E5%B8%8C%E6%9C%9B%E4%B9%90%E5%9B%AD_%E8%A7%89%E9%86%92%E4%B9%8B%E7%AB%A01)<br>[Eden's Gate: Resurrection](https://ffxiv.consolegameswiki.com/wiki/Eden's_Gate%3A_Resurrection) | 至尊伊甸／Eden Prime | 通过 |
| `shb-eden-e2` | 5.01 | 8 | [684](https://v2.xivapi.com/api/sheet/ContentFinderCondition/684) | [伊甸希望乐园 觉醒之章2](https://ff14.huijiwiki.com/wiki/%E4%BC%8A%E7%94%B8%E5%B8%8C%E6%9C%9B%E4%B9%90%E5%9B%AD_%E8%A7%89%E9%86%92%E4%B9%8B%E7%AB%A02)<br>[Eden's Gate: Descent](https://ffxiv.consolegameswiki.com/wiki/Eden's_Gate%3A_Descent) | 虚无行者／Voidwalker | 通过 |
| `shb-eden-e3` | 5.01 | 8 | [682](https://v2.xivapi.com/api/sheet/ContentFinderCondition/682) | [伊甸希望乐园 觉醒之章3](https://ff14.huijiwiki.com/wiki/%E4%BC%8A%E7%94%B8%E5%B8%8C%E6%9C%9B%E4%B9%90%E5%9B%AD_%E8%A7%89%E9%86%92%E4%B9%8B%E7%AB%A03)<br>[Eden's Gate: Inundation](https://ffxiv.consolegameswiki.com/wiki/Eden's_Gate%3A_Inundation) | 利维亚桑／Leviathan | 通过 |
| `shb-eden-e4` | 5.01 | 8 | [689](https://v2.xivapi.com/api/sheet/ContentFinderCondition/689) | [伊甸希望乐园 觉醒之章4](https://ff14.huijiwiki.com/wiki/%E4%BC%8A%E7%94%B8%E5%B8%8C%E6%9C%9B%E4%B9%90%E5%9B%AD_%E8%A7%89%E9%86%92%E4%B9%8B%E7%AB%A04)<br>[Eden's Gate: Sepulture](https://ffxiv.consolegameswiki.com/wiki/Eden's_Gate%3A_Sepulture) | 泰坦／Titan | 通过 |
| `shb-eden-e5` | 5.2 | 8 | [715](https://v2.xivapi.com/api/sheet/ContentFinderCondition/715) | [伊甸希望乐园 共鸣之章1](https://ff14.huijiwiki.com/wiki/%E4%BC%8A%E7%94%B8%E5%B8%8C%E6%9C%9B%E4%B9%90%E5%9B%AD_%E5%85%B1%E9%B8%A3%E4%B9%8B%E7%AB%A01)<br>[Eden's Verse: Fulmination](https://ffxiv.consolegameswiki.com/wiki/Eden's_Verse%3A_Fulmination) | 拉姆／Ramuh | 通过 |
| `shb-eden-e6` | 5.2 | 8 | [719](https://v2.xivapi.com/api/sheet/ContentFinderCondition/719) | [伊甸希望乐园 共鸣之章2](https://ff14.huijiwiki.com/wiki/%E4%BC%8A%E7%94%B8%E5%B8%8C%E6%9C%9B%E4%B9%90%E5%9B%AD_%E5%85%B1%E9%B8%A3%E4%B9%8B%E7%AB%A02)<br>[Eden's Verse: Furor](https://ffxiv.consolegameswiki.com/wiki/Eden's_Verse%3A_Furor) | 迦楼罗／Garuda<br>伊弗利特／Ifrit<br>赤翼罗羯坨博叉／Raktapaksa | 通过 |
| `shb-eden-e7` | 5.2 | 8 | [726](https://v2.xivapi.com/api/sheet/ContentFinderCondition/726) | [伊甸希望乐园 共鸣之章3](https://ff14.huijiwiki.com/wiki/%E4%BC%8A%E7%94%B8%E5%B8%8C%E6%9C%9B%E4%B9%90%E5%9B%AD_%E5%85%B1%E9%B8%A3%E4%B9%8B%E7%AB%A03)<br>[Eden's Verse: Iconoclasm](https://ffxiv.consolegameswiki.com/wiki/Eden's_Verse%3A_Iconoclasm) | 暗黑心象／The Idol of Darkness | 通过 |
| `shb-eden-e8` | 5.2 | 8 | [728](https://v2.xivapi.com/api/sheet/ContentFinderCondition/728) | [伊甸希望乐园 共鸣之章4](https://ff14.huijiwiki.com/wiki/%E4%BC%8A%E7%94%B8%E5%B8%8C%E6%9C%9B%E4%B9%90%E5%9B%AD_%E5%85%B1%E9%B8%A3%E4%B9%8B%E7%AB%A04)<br>[Eden's Verse: Refulgence](https://ffxiv.consolegameswiki.com/wiki/Eden's_Verse%3A_Refulgence) | 希瓦／Shiva | 通过 |
| `shb-eden-e9` | 5.4 | 8 | [749](https://v2.xivapi.com/api/sheet/ContentFinderCondition/749) | [伊甸希望乐园 再生之章1](https://ff14.huijiwiki.com/wiki/%E4%BC%8A%E7%94%B8%E5%B8%8C%E6%9C%9B%E4%B9%90%E5%9B%AD_%E5%86%8D%E7%94%9F%E4%B9%8B%E7%AB%A01)<br>[Eden's Promise: Umbra](https://ffxiv.consolegameswiki.com/wiki/Eden's_Promise%3A_Umbra) | 暗黑之云／Cloud of Darkness | 通过 |
| `shb-eden-e10` | 5.4 | 8 | [747](https://v2.xivapi.com/api/sheet/ContentFinderCondition/747) | [伊甸希望乐园 再生之章2](https://ff14.huijiwiki.com/wiki/%E4%BC%8A%E7%94%B8%E5%B8%8C%E6%9C%9B%E4%B9%90%E5%9B%AD_%E5%86%8D%E7%94%9F%E4%B9%8B%E7%AB%A02)<br>[Eden's Promise: Litany](https://ffxiv.consolegameswiki.com/wiki/Eden's_Promise%3A_Litany) | 影之王／Shadowkeeper | 通过 |
| `shb-eden-e11` | 5.4 | 8 | [751](https://v2.xivapi.com/api/sheet/ContentFinderCondition/751) | [伊甸希望乐园 再生之章3](https://ff14.huijiwiki.com/wiki/%E4%BC%8A%E7%94%B8%E5%B8%8C%E6%9C%9B%E4%B9%90%E5%9B%AD_%E5%86%8D%E7%94%9F%E4%B9%8B%E7%AB%A03)<br>[Eden's Promise: Anamorphosis](https://ffxiv.consolegameswiki.com/wiki/Eden's_Promise%3A_Anamorphosis) | 绝命战士／Fatebreaker | 通过 |
| `shb-eden-e12` | 5.4 | 8 | [758](https://v2.xivapi.com/api/sheet/ContentFinderCondition/758) | [伊甸希望乐园 再生之章4](https://ff14.huijiwiki.com/wiki/%E4%BC%8A%E7%94%B8%E5%B8%8C%E6%9C%9B%E4%B9%90%E5%9B%AD_%E5%86%8D%E7%94%9F%E4%B9%8B%E7%AB%A04)<br>[Eden's Promise: Eternity](https://ffxiv.consolegameswiki.com/wiki/Eden's_Promise%3A_Eternity) | 伊甸之约／Eden's Promise | 通过 |

## 第二轮：TODO 机制与本地化逐项复核

本轮不再把攻略作者的简称、机制说明或推测英文当作游戏技能名。核对层级如下：

1. 中英技能／状态一一对应：简中 [ffxiv-datamining-cn Action.csv](https://github.com/thewakingsands/ffxiv-datamining-cn/blob/master/csv/Action.csv)、[Status.csv](https://github.com/thewakingsands/ffxiv-datamining-cn/blob/master/csv/Status.csv)，与英文 [ffxiv-datamining Action.csv](https://github.com/xivapi/ffxiv-datamining/blob/master/csv/Action.csv)、[Status.csv](https://github.com/xivapi/ffxiv-datamining/blob/master/csv/Status.csv) 按同一 row ID 配对。
2. 机制顺序、目标、范围与失败结果：对应的 [FFXIV Community Wiki raids](https://ffxiv.consolegameswiki.com/wiki/Raids)／[Alliance Raids](https://ffxiv.consolegameswiki.com/wiki/Alliance_Raid) 精确 duty 页；简中流程再和灰机对应副本页交叉核对。
3. 来源没有独立读条的整段流程，一律加 `[机制]`、`[中场]` 或 `[Transition]`，不冒充正式技能。

### 普通 8 人团本

- `raids_arr.js`
  - T2：节点删除／保留技能会改变 ADS 最终技能组；Allagan Rot 只在保留 Quarantine/净化系统的路线出现，已改掉“必定有 Allagan Rot”的错误。
  - T9：按 Status row 464–466 修正为 **火角／Firescorched、冰爪／Icebitten、雷翼／Thunderstruck**，不再使用错误的 Frostbitten／Scorched。
  - T12：按 Status row 594–595 修正为 **吸魂／Harvest、灵泉祸／Cloak of Death**；灵泉拦线是阻止王获得浴火重生层数，不是“王大量回血”。
  - T13：按 Status row 596 修正为 **龙压／Suffocated Will**，并确认龙神咆哮结算后清层。
- `raids_hw.js`
  - A2 无正式 Boss 的波次结构、A4 蓝球／橙线、A5 变身、A10 连线技均由精确 duty 页复核。
  - A9 修正废料／熔岩关系：用 Power Generator 启动废料；小怪必须死在即将喷发的熔岩格让尸体销毁，活小怪碰熔岩会团灭，王会用 Stockpile 吸收未销毁尸体。Full Metal Faust 同样要让尸体被熔岩销毁。
- `raids_sb.js`
  - O2：100 Gs 是解除悬浮；Gravitational Manipulation／Explosion 需同高度分摊；Maniacal Probe／Epicenter 取代不存在的“Main Quake”。Aetherial Rift 的简中正式技能字串未在当前 Action 表出现，资料中已明确写成 **`[机制] 下沉`**，不把“下沉”冒充官方技能名。
  - O6：Demonic Howl、Demonic Shear、四画作 Possession、Demonic Pain、Flash Gale 已按 [Sigmascape V2.0](https://ffxiv.consolegameswiki.com/wiki/Sigmascape_V2.0) 复核。
  - O8：神像视线正式英文为 **Indolent Will／Ave Maria**；前者背对，后者必须看向。
  - O9：删除错误的“Chaossphere 单人核爆”；Knock Down／Big Bang 改为两治疗距离衰减落点与两组分摊的实际流程。
  - O11：错误的 Rush 王冲锋改为 **Peripheral Synthesis** 巨型 Rocket Punches；Timely Teleport、Aero Assault、Ruin 均可在 Action 表追溯。
  - O12：确认 **Optimized Passage of Arms／Laser Shower**：Omega-M 保护 Omega-F，先击破 M 再在读条结束前击破 F。
- `raids_shb.js`
  - E6 合体没有独立技能名，标为 **`[Transition] Fusion into Raktapaksa`**。
  - E8 分场守水晶是整段中场，不是技能读条；现标为 **`[Intermission] The Path of Light`**，并按三平台实际小怪／分摊／击退顺序记录。
  - E12 普通：删除只存在 E12S 的暗之巫女；“回想记忆”只生成水晶，真正放出攻击的是 **释放／Cast**；三段记忆平台补齐量表归零团灭与各平台处理。
- `raids_ew.js`
  - P3 阳炎鸟修为两对分开击杀，死亡圈重叠会触发共燃；Ashen Eye 是 90° 顺序视线。
  - P4 Shifting Strike 的剑／披风标记相对站位、P8 Blazing Footfalls、P9 Dualspell 均按精确 duty 页复核。
  - P12 Palladion 补上冲锋线本身有伤害，且全员按随机编号依序放落点圈。
- `raids_dt.js`
  - M2：Action row 37280 证明 **心病／Heartsick**；删除重复且不存在的 “Honey B. Live 2” 技能列。
  - M5、M7、M8：全部英文技能逐项与 Cruiserweight 精确 duty 页比对，未发现需改名的剩余项。
  - M9：**Coffinmaker、Coffinfiller、Flaying Fry、Penetrating Pitch、Dead Wake** 均由 Heavyweight M1 duty 页复核。
  - M10：Action row 46507 证明 **混合爆炸／Steam Burst**，范围字段为 9m；不再写推测的 “Explosion”。
  - M11：**Dance of Domination 是 8 段物理全屏**，已从错误的 7 段修正。
  - M12：Action row 46207 证明 **分裂灾变／Split Scourge**；Action row 48088–48095 证明 **细胞失控／Mindless Flesh**；Status row 4747–4751 证明 **Flesh Forward、Flesh Back、Shared Grotesquerie、Directed Grotesquerie**，替换 “Grotesquerie 2” 与 “Cellular Chaos” 两个推测名。

### 普通 24 人联盟团本

- `alliance_arr_hw.js`
  - 亚蒙 **Dimensional Compression** 紫球缩小玩家／Kum Kum 的流程已由 [Syrcus Tower](https://ffxiv.consolegameswiki.com/wiki/Syrcus_Tower) 复核。
  - 暗黑之云黄色陨石塔在来源中没有独立技能读条，现标为 **`[机制] Comet Towers`**；不再伪造正式技能名。
  - 弗迪亚 **Blackbolt**、迪亚波罗斯 **Lifegate／Deathgate／Diabolic Gate** 均由 Action 表与 [Dun Scaith](https://ffxiv.consolegameswiki.com/wiki/Dun_Scaith) 复核。
- `alliance_sb_shb.js`
  - 瓯博讷 Duty Action 正式名称 **Shieldbearer／Swordbearer**，Judgment Blade、Consecration、Heavenly Judgment、Divine Ruination 的盾／剑用途按 [The Orbonne Monastery](https://ffxiv.consolegameswiki.com/wiki/The_Orbonne_Monastery) 复核。
  - 9S 的 **Undock → Bombing Run**、Hobbes 系统提示 **Left Arm／Right Arm** 与两臂实际范围按 [The Copied Factory](https://ffxiv.consolegameswiki.com/wiki/The_Copied_Factory) 复核。
  - 4.x／5.x 联盟最低装等已逐场改用 CFC：拉巴纳斯塔 305、黎铎拉纳 **335**、瓯博讷 **365**、复制工厂 435、人偶军事基地 465、希望之炮台 495。
- `alliance_ew_dt.js`
  - 拉尔戈 Action row 28843：**轰雷之杖／Bronze Work**。
  - 利姆莱茵 Action row 34845：主读条 **召唤大暴风雨／Stormy Seas**；后续为 Stormwhorl／Stormwinds，已修正层级。
  - 麒麟 Action row 44491：**惩戒击／Punishment**，不再使用泛称 Tankbuster。
  - 欧米茄 Action row 44308–44312：**堡垒围攻／Citadel Siege**，已写进转场技能列。
  - 神龙 Action row 49128–49130：**原子甩尾／Atomic Tail**；它是 P1 结尾封闭下层的独立招，和前面的 **宇宙甩尾／Cosmic Tail** 不是同一招。
  - 亚历山大 Action row 50164–50165：**神圣II／Holy II**；Action row 50150：**圣火／Holy Flame**；两者已分别保留，不混称。

### 明确保留的未核实项

- **O2「下沉」的简中正式技能名**：英文 `Aetherial Rift` 与机制可由 duty 页确认，但当前中英 Action 表找不到同一技能 row；资料中已标为 `[机制] 下沉`，这是说明文字，不声称是官方简中技能名。
- **暗黑之云普通联盟的陨石塔读条名**：权威来源只描述 comets on yellow tower markers，未列独立读条；资料中已标为 `[机制] Comet Towers`。除此两项“没有可核对的独立本地化读条”之外，本范围 TODO 所列名称与流程均已有上述可追溯来源。

### E9／E9S／Chaotic 路由约束

- 三者直接依唯一官方键路由：E9N=`cfc:749`、E9S=`cfc:750`、Cloud of Darkness (Chaotic)=`cfc:1010`。
- 分类分别为普通 8 人、零式 8 人、Chaotic Alliance Raid；**不依赖名称别名、关键词排除或任何“如果不是 E9 就算暗灭云”的互斥特例**。

## 验证状态

- 91/91：identity 存在且 officialKey 不重复。
- 91/91：CFC 英文名（忽略开头 the 的标题大小写）、等级、最低装等、队伍人数一致。
- 91/91：精确英文 duty 页面存在。
- 全库 `node scripts/validate.js`：**369 场全部通过**；本范围 91 场 identity 齐全且无重复。
