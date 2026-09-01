# 讨伐战逐场身份稽核

日期：2026-09-01

范围：`data/trials_*.js` 的现行普通／困难与极讨伐战。结论为 103 场：57 场普通／困难、46 场极；其中 98 个 8 人本、5 个 4 人本。

## 核对规则与来源

- 英文正式名、ContentFinderCondition row ID、队伍人数：XIVAPI v2 的游戏数据表 `ContentFinderCondition`。每场已写入 `identity.officialKey`、`identity.partySize` 与可直接打开的 `identity.sourceUrl`；稽核脚本已逐场比对 row 的 `Name` 和 `ContentMemberType.MembersPerParty`，不是用名称拼 ID。
- 现行完整清单、英文名、难度、Boss：[FFXIV Wiki Trials](https://ffxiv.consolegameswiki.com/wiki/Trials)。
- 国服正式名：[灰机 Wiki 随机任务：讨伐歼灭战](https://ff14.huijiwiki.com/wiki/随机任务)；特殊高难再以对应灰机副本页复核。
- 版本校验优先官方补丁说明；关键修正使用 [2.2 官方补丁说明](https://na.finalfantasyxiv.com/lodestone/topics/detail/69e2c959d2e9285fd541e7f5f70fb8139b3464da)、[7.35 官方补丁说明](https://na.finalfantasyxiv.com/lodestone/topics/detail/3daca4ab4ea59852a865769ad4a9ecadd4b43d21/)、[7.4 官方补丁说明](https://na.finalfantasyxiv.com/lodestone/topics/detail/06944d892fd98cc00b2a28ff77edbafa4f7eef54/) 与 [7.5 官方专题](https://na.finalfantasyxiv.com/dawntrail/patch_7_5/)。
- 新增攻略机制来源：[究极神兵假想作战（灰机）](https://ff14.huijiwiki.com/wiki/究极神兵假想作战/B)、[Memoria Misera (Extreme)](https://ffxiv.consolegameswiki.com/wiki/Memoria_Misera_(Extreme))、[博兹雅堡垒追忆战（灰机）](https://ff14.huijiwiki.com/wiki/博兹雅堡垒追忆战)、[The Windward Wilds](https://ffxiv.consolegameswiki.com/wiki/The_Windward_Wilds)、[护锁刃龙上位狩猎战（灰机）](https://ff14.huijiwiki.com/wiki/护锁刃龙上位狩猎战/B)。既有场次的机制可由 FFXIV Wiki Trials 表中各副本的直达页面追溯。

## 已移除内容

- `arr-steps-of-faith`／皇都伊修加德保卫战（The Steps of Faith）已在 6.2 从多人讨伐战移除并改成单人任务，故从现行 `trials_arr.js` 删除；没有把已移除内容冒充现行副本，也没有新增同样已移除的 Cape Westwind。来源：[Trials 的 Removed Trials 段落](https://ffxiv.consolegameswiki.com/wiki/Trials#A_Realm_Reborn_Removed_Trials)。

## 逐场结果

### ARR 2.x（26）

- ✅ `arr-bowl-of-embers` — 伊弗利特讨伐战 / The Bowl of Embers；2.0；普通／困难；4 人；Boss：伊弗利特 / Ifrit；cfc:56
- ✅ `arr-navel` — 泰坦讨伐战 / The Navel；2.0；普通／困难；4 人；Boss：泰坦 / Titan；cfc:57
- ✅ `arr-howling-eye` — 迦楼罗讨伐战 / The Howling Eye；2.0；普通／困难；4 人；Boss：迦楼罗 / Garuda；cfc:58
- ✅ `arr-porta-decumana` — 究极神兵破坏作战 / The Porta Decumana；6.1；普通／困难；4 人；Boss：究极神兵 / The Ultima Weapon；cfc:830
- ✅ `arr-relic-reborn-chimera` — 死化奇美拉讨伐战 / A Relic Reborn: the Chimera；2.0；普通／困难；8 人；Boss：死化奇美拉 / Dhorme Chimera；cfc:74
- ✅ `arr-relic-reborn-hydra` — 海德拉讨伐战 / A Relic Reborn: the Hydra；2.0；普通／困难；8 人；Boss：海德拉 / Hydra；cfc:75
- ✅ `arr-bowl-of-embers-hard` — 伊弗利特歼灭战 / The Bowl of Embers (Hard)；2.0；普通／困难；8 人；Boss：伊弗利特 / Ifrit；cfc:59
- ✅ `arr-navel-hard` — 泰坦歼灭战 / The Navel (Hard)；2.0；普通／困难；8 人；Boss：泰坦 / Titan；cfc:60
- ✅ `arr-howling-eye-hard` — 迦楼罗歼灭战 / The Howling Eye (Hard)；2.0；普通／困难；8 人；Boss：迦楼罗 / Garuda；cfc:61
- ✅ `arr-thornmarch-hard` — 莫古力贤王歼灭战 / Thornmarch (Hard)；2.1；普通／困难；8 人；Boss：贤王莫古尔·莫古十二世 / Good King Moggle Mog XII；cfc:66
- ✅ `arr-whorleater-hard` — 利维亚桑歼灭战 / The Whorleater (Hard)；2.2；普通／困难；8 人；Boss：利维亚桑 / Leviathan；cfc:72
- ✅ `arr-striking-tree-hard` — 拉姆歼灭战 / The Striking Tree (Hard)；2.3；普通／困难；8 人；Boss：拉姆 / Ramuh；cfc:77
- ✅ `arr-akh-afah-amphitheatre-hard` — 希瓦歼灭战 / The Akh Afah Amphitheatre (Hard)；2.4；普通／困难；8 人；Boss：希瓦 / Shiva；cfc:79
- ✅ `arr-chrysalis` — 那布里亚勒斯讨伐战 / The Chrysalis；2.5；普通／困难；8 人；Boss：那布里亚勒斯 / Nabriales；cfc:84
- ✅ `arr-urths-fount` — 奥丁歼灭战 / Urth's Fount；2.5；普通／困难；8 人；Boss：奥丁 / Odin；cfc:82
- 🔧 `arr-battle-on-the-big-bridge` — 大桥上的决斗 / Battle on the Big Bridge；2.2；普通／困难；8 人；Boss：吉尔伽美什 / Gilgamesh；cfc:76；修正 patch 2.3 → 2.2
- ✅ `arr-dragons-neck` — 艾玛吉娜杯斗技大会决赛 / The Dragon's Neck；2.4；普通／困难；8 人；Boss：奥尔特罗斯 / 提丰 / Ultros / Typhon；cfc:81
- ✅ `arr-battle-in-the-big-keep` — 无限城的死斗 / Battle in the Big Keep；2.5；普通／困难；8 人；Boss：吉尔伽美什 / 恩奇都 / Gilgamesh / Enkidu；cfc:85
- 🔧 `arr-ultima-bane` — 究极神兵假想作战 / The Minstrel's Ballad: Ultima's Bane；2.1；极；8 人；Boss：究极神兵 / The Ultima Weapon；cfc:68；新增缺漏
- ✅ `arr-bowl-of-embers-ex` — 伊弗利特歼殛战 / The Bowl of Embers (Extreme)；2.1；极；8 人；Boss：伊弗利特 / Ifrit；cfc:63
- ✅ `arr-navel-ex` — 泰坦歼殛战 / The Navel (Extreme)；2.1；极；8 人；Boss：泰坦 / Titan；cfc:64
- ✅ `arr-howling-eye-ex` — 迦楼罗歼殛战 / The Howling Eye (Extreme)；2.1；极；8 人；Boss：迦楼罗 / Garuda；cfc:65
- 🔧 `arr-thornmarch-ex` — 莫古力贤王歼殛战 / Thornmarch (Extreme)；2.2；极；8 人；Boss：贤王莫古尔·莫古十二世 / Good King Moggle Mog XII；cfc:67；修正 patch 2.1 → 2.2
- ✅ `arr-whorleater-ex` — 利维亚桑歼殛战 / The Whorleater (Extreme)；2.2；极；8 人；Boss：利维亚桑 / Leviathan；cfc:73
- ✅ `arr-striking-tree-ex` — 拉姆歼殛战 / The Striking Tree (Extreme)；2.3；极；8 人；Boss：拉姆 / Ramuh；cfc:78
- ✅ `arr-akh-afah-amphitheatre-ex` — 希瓦歼殛战 / The Akh Afah Amphitheatre (Extreme)；2.4；极；8 人；Boss：希瓦 / Shiva；cfc:80

### HW 3.x（14）

- ✅ `hw-thok-ast-thok-hard` — 罗波那歼灭战 / Thok ast Thok (Hard)；3.0；普通／困难；8 人；Boss：罗波那 / Ravana；cfc:86
- ✅ `hw-thok-ast-thok-ex` — 罗波那歼殛战 / Thok ast Thok (Extreme)；3.0；极；8 人；Boss：罗波那 / Ravana；cfc:87
- ✅ `hw-limitless-blue-hard` — 俾斯麦歼灭战 / The Limitless Blue (Hard)；3.0；普通／困难；8 人；Boss：俾斯麦 / Bismarck；cfc:88
- ✅ `hw-limitless-blue-ex` — 俾斯麦歼殛战 / The Limitless Blue (Extreme)；3.0；极；8 人；Boss：俾斯麦 / Bismarck；cfc:89
- ✅ `hw-singularity-reactor` — 圆桌骑士歼灭战 / The Singularity Reactor；3.0；普通／困难；8 人；Boss：骑神托尔丹 / King Thordan；cfc:90
- ✅ `hw-thordans-reign-ex` — 圆桌骑士幻想歼灭战 / The Minstrel's Ballad: Thordan's Reign；3.1；极；8 人；Boss：骑神托尔丹 / King Thordan；cfc:91
- ✅ `hw-containment-bay-s1t7` — 萨菲洛特歼灭战 / Containment Bay S1T7；3.2；普通／困难；8 人；Boss：萨菲洛特 / Sephirot；cfc:134
- ✅ `hw-containment-bay-s1t7-ex` — 萨菲洛特歼殛战 / Containment Bay S1T7 (Extreme)；3.2；极；8 人；Boss：萨菲洛特 / Sephirot；cfc:135
- ✅ `hw-final-steps-of-faith` — 尼德霍格征龙战 / The Final Steps of Faith；3.3；普通／困难；8 人；Boss：尼德霍格 / Nidhogg；cfc:169
- ✅ `hw-nidhoggs-rage-ex` — 尼德霍格传奇征龙战 / The Minstrel's Ballad: Nidhogg's Rage；3.3；极；8 人；Boss：尼德霍格 / Nidhogg；cfc:170
- ✅ `hw-containment-bay-p1t6` — 索菲娅歼灭战 / Containment Bay P1T6；3.4；普通／困难；8 人；Boss：索菲娅 / Sophia；cfc:183
- ✅ `hw-containment-bay-p1t6-ex` — 索菲娅歼殛战 / Containment Bay P1T6 (Extreme)；3.4；极；8 人；Boss：索菲娅 / Sophia；cfc:184
- ✅ `hw-containment-bay-z1t9` — 祖尔宛歼灭战 / Containment Bay Z1T9；3.5；普通／困难；8 人；Boss：祖尔宛 / Zurvan；cfc:223
- ✅ `hw-containment-bay-z1t9-ex` — 祖尔宛歼殛战 / Containment Bay Z1T9 (Extreme)；3.5；极；8 人；Boss：祖尔宛 / Zurvan；cfc:224

### SB 4.x（17）

- ✅ `sb-the-pool-of-tribute` — 须佐之男歼灭战 / The Pool of Tribute；4.0；普通／困难；8 人；Boss：须佐之男 / Susano；cfc:243
- ✅ `sb-the-pool-of-tribute-ex` — 须佐之男歼殛战 / The Pool of Tribute (Extreme)；4.0；极；8 人；Boss：须佐之男 / Susano；cfc:244
- ✅ `sb-emanation` — 吉祥天女歼灭战 / Emanation；4.0；普通／困难；8 人；Boss：吉祥天女 / Lakshmi；cfc:263
- ✅ `sb-emanation-ex` — 吉祥天女歼殛战 / Emanation (Extreme)；4.0；极；8 人；Boss：吉祥天女 / Lakshmi；cfc:264
- ✅ `sb-the-royal-menagerie` — 神龙歼灭战 / The Royal Menagerie；4.0；普通／困难；8 人；Boss：神龙 / Shinryu；cfc:239
- ✅ `sb-the-royal-menagerie-ex` — 神龙梦幻歼灭战 / The Minstrel's Ballad: Shinryu's Domain；4.1；极；8 人；Boss：神龙 / Shinryu；cfc:278
- ✅ `sb-the-jade-stoa` — 白虎镇魂战 / The Jade Stoa；4.2；普通／困难；8 人；Boss：白虎 / Byakko；cfc:290
- ✅ `sb-the-jade-stoa-ex` — 白虎诗魂战 / The Jade Stoa (Extreme)；4.2；极；8 人；Boss：白虎 / Byakko；cfc:291
- ✅ `sb-castrum-fluminis` — 月读歼灭战 / Castrum Fluminis；4.3；普通／困难；8 人；Boss：月读 / Tsukuyomi；cfc:537
- ✅ `sb-castrum-fluminis-ex` — 月读幽夜歼灭战 / The Minstrel's Ballad: Tsukuyomi's Pain；4.3；极；8 人；Boss：月读 / Tsukuyomi；cfc:538
- ✅ `sb-hells-kier` — 朱雀镇魂战 / Hells' Kier；4.4；普通／困难；8 人；Boss：朱雀 / Suzaku；cfc:596
- ✅ `sb-hells-kier-ex` — 朱雀诗魂战 / Hells' Kier (Extreme)；4.4；极；8 人；Boss：朱雀 / Suzaku；cfc:597
- ✅ `sb-the-wreath-of-snakes` — 青龙镇魂战 / The Wreath of Snakes；4.5；普通／困难；8 人；Boss：青龙 / Seiryu；cfc:637
- ✅ `sb-the-wreath-of-snakes-ex` — 青龙诗魂战 / The Wreath of Snakes (Extreme)；4.5；极；8 人；Boss：青龙 / Seiryu；cfc:638
- ✅ `sb-kugane-ohashi` — 保镖歼灭战 / Kugane Ohashi；4.56；普通／困难；8 人；Boss：保镖 / 吉尔伽美什 / Yojimbo / Gilgamesh；cfc:595
- ✅ `sb-the-great-hunt` — 火龙狩猎战 / The Great Hunt；4.36；普通／困难；8 人；Boss：火龙 / Rathalos；cfc:474
- ✅ `sb-the-great-hunt-ex` — 火龙上位狩猎战 / The Great Hunt (Extreme)；4.36；极；4 人；Boss：火龙 / Rathalos；cfc:475

### ShB 5.x（15）

- ✅ `shb-titania` — 缇坦妮雅歼灭战 / The Dancing Plague；5.0；普通／困难；8 人；Boss：缇坦妮雅 / Titania；cfc:657
- ✅ `shb-titania-ex` — 缇坦妮雅歼殛战 / The Dancing Plague (Extreme)；5.0；极；8 人；Boss：缇坦妮雅 / Titania；cfc:658
- ✅ `shb-innocence` — 无瑕灵君歼灭战 / The Crown of the Immaculate；5.0；普通／困难；8 人；Boss：无瑕灵君 / Innocence；cfc:666
- ✅ `shb-innocence-ex` — 无瑕灵君歼殛战 / The Crown of the Immaculate (Extreme)；5.0；极；8 人；Boss：无瑕灵君 / Innocence；cfc:667
- ✅ `shb-hades` — 哈迪斯歼灭战 / The Dying Gasp；5.0；普通／困难；8 人；Boss：哈迪斯 / Hades；cfc:687
- ✅ `shb-hades-ex` — 哈迪斯孤念歼灭战 / The Minstrel's Ballad: Hades's Elegy；5.1；极；8 人；Boss：哈迪斯 / Hades；那布里亚勒斯之影 / Nabriales's Shade；拉哈布雷亚与以格约姆之影 / Lahabrea's and Igeyorhm's Shades；至尊无影之影 / Ascian Prime's Shade；哈迪斯（P3／P4） / Hades (Phase 3 / 4)；cfc:693
- ✅ `shb-ruby-weapon` — 红宝石神兵破坏作战 / Cinder Drift；5.2；普通／困难；8 人；Boss：红宝石神兵 / The Ruby Weapon；红宝石神兵（奈尔的幻影） / The Ruby Weapon (Nael's Image)；cfc:717
- ✅ `shb-ruby-weapon-ex` — 红宝石神兵狂想作战 / Cinder Drift (Extreme)；5.2；极；8 人；Boss：红宝石神兵 / The Ruby Weapon；红宝石神兵（奈尔的幻影） / The Ruby Weapon (Nael's Image)；cfc:718
- 🔧 `shb-memoria-misera-ex` — 博兹雅堡垒追忆战 / Memoria Misera (Extreme)；5.25；极；8 人；Boss：瓦厉斯·耶·加尔乌斯 / Varis yae Galvus；cfc:725；新增缺漏
- ✅ `shb-emerald-weapon` — 绿宝石神兵破坏作战 / Castrum Marinum；5.4；普通／困难；8 人；Boss：绿宝石神兵 / The Emerald Weapon；绿宝石神兵（第二形态） / The Emerald Weapon (Golden)；cfc:762
- ✅ `shb-emerald-weapon-ex` — 绿宝石神兵狂想作战 / Castrum Marinum (Extreme)；5.4；极；8 人；Boss：绿宝石神兵 / The Emerald Weapon；绿宝石神兵（第二形态） / The Emerald Weapon (Golden)；cfc:763
- ✅ `shb-diamond-weapon` — 钻石神兵捕获作战 / The Cloud Deck；5.5；普通／困难；8 人；Boss：钻石神兵 / The Diamond Weapon；cfc:781
- ✅ `shb-diamond-weapon-ex` — 钻石神兵狂想作战 / The Cloud Deck (Extreme)；5.5；极；8 人；Boss：钻石神兵 / The Diamond Weapon；cfc:782
- ✅ `shb-warrior-of-light` — 光之战士歼灭战 / The Seat of Sacrifice；5.3；普通／困难；8 人；Boss：光之战士 / Warrior of Light；cfc:738
- ✅ `shb-warrior-of-light-ex` — 光之战士幻耀歼灭战 / The Seat of Sacrifice (Extreme)；5.3；极；8 人；Boss：光之战士 / Warrior of Light；cfc:739

### EW 6.x（15）

- ✅ `ew-the-dark-inside` — 佐迪亚克歼灭战 / The Dark Inside；6.0；普通／困难；8 人；Boss：佐迪亚克 / Zodiark；cfc:802
- ✅ `ew-zodiark-ex` — 佐迪亚克暝暗歼灭战 / The Minstrel's Ballad: Zodiark's Fall；6.0；极；8 人；Boss：佐迪亚克 / Zodiark；cfc:803
- ✅ `ew-the-mothercrystal` — 海德林歼灭战 / The Mothercrystal；6.0；普通／困难；8 人；Boss：海德林 / Hydaelyn；cfc:790
- ✅ `ew-hydaelyn-ex` — 海德林晖光歼灭战 / The Minstrel's Ballad: Hydaelyn's Call；6.0；极；8 人；Boss：海德林 / Hydaelyn；cfc:791
- ✅ `ew-the-final-day` — 终结之战 / The Final Day；6.0；普通／困难；8 人；Boss：讴歌终结之物 / The Endsinger；cfc:796
- ✅ `ew-endsinger-ex` — 终极之战 / The Minstrel's Ballad: Endsinger's Aria；6.1；极；8 人；Boss：讴歌终结之物 / The Endsinger；cfc:846
- ✅ `ew-storms-crown` — 巴尔巴莉希娅歼灭战 / Storm's Crown；6.2；普通／困难；8 人；Boss：巴尔巴莉希娅 / Barbariccia；cfc:870
- ✅ `ew-barbariccia-ex` — 巴尔巴莉希娅歼殛战 / Storm's Crown (Extreme)；6.2；极；8 人；Boss：巴尔巴莉希娅 / Barbariccia；cfc:871
- ✅ `ew-mount-ordeals` — 卢比坎特歼灭战 / Mount Ordeals；6.3；普通／困难；8 人；Boss：卢比坎特 / Rubicante；cfc:886
- ✅ `ew-rubicante-ex` — 卢比坎特歼殛战 / Mount Ordeals (Extreme)；6.3；极；8 人；Boss：卢比坎特 / Rubicante；cfc:924
- ✅ `ew-the-voidcast-dais` — 高贝扎歼灭战 / The Voidcast Dais；6.4；普通／困难；8 人；Boss：高贝扎 / Golbez；cfc:949
- ✅ `ew-golbez-ex` — 高贝扎歼殛战 / The Voidcast Dais (Extreme)；6.4；极；8 人；Boss：高贝扎 / Golbez；cfc:950
- ✅ `ew-the-abyssal-fracture` — 泽罗姆斯歼灭战 / The Abyssal Fracture；6.5；普通／困难；8 人；Boss：泽罗姆斯 / Zeromus；cfc:964
- ✅ `ew-zeromus-ex` — 泽罗姆斯歼殛战 / The Abyssal Fracture (Extreme)；6.5；极；8 人；Boss：泽罗姆斯 / Zeromus；cfc:965
- 🔧 `ew-the-gilded-araya` — 阿修罗歼灭战 / The Gilded Araya；6.55；普通／困难；8 人；Boss：阿修罗 / Asura；cfc:944；修正 patch 6.5 → 6.55

### DT 7.x（16）

- ✅ `dt-valigarmanda` — 艳翼蛇鸟歼灭战 / Worqor Lar Dor；7.0；普通／困难；8 人；Boss：艳翼蛇鸟 / Valigarmanda；cfc:832
- ✅ `dt-valigarmanda-ex` — 艳翼蛇鸟歼殛战 / Worqor Lar Dor (Extreme)；7.0；极；8 人；Boss：艳翼蛇鸟 / Valigarmanda；cfc:833
- ✅ `dt-zoraal-ja` — 佐拉加歼灭战 / Everkeep；7.0；普通／困难；8 人；Boss：佐拉加 / Zoraal Ja；cfc:995
- ✅ `dt-zoraal-ja-ex` — 佐拉加歼殛战 / Everkeep (Extreme)；7.0；极；8 人；Boss：佐拉加 / Zoraal Ja；cfc:996
- ✅ `dt-sphene` — 永恒女王歼灭战 / The Interphos；7.0；普通／困难；8 人；Boss：永恒女王 / Queen Eternal；cfc:984
- ✅ `dt-sphene-ex` — 永恒女王忆想歼灭战 / The Minstrel's Ballad: Sphene's Burden；7.1；极；8 人；Boss：永恒女王 / Queen Eternal；cfc:1017
- ✅ `dt-zelenia` — 泽莲尼娅歼灭战 / Recollection；7.2；普通／困难；8 人；Boss：泽莲尼娅 / Zelenia；cfc:1030
- ✅ `dt-zelenia-ex` — 泽莲尼娅歼殛战 / Recollection (Extreme)；7.2；极；8 人；Boss：泽莲尼娅 / Zelenia；cfc:1031
- ✅ `dt-necron` — 永远之暗歼灭战 / The Ageless Necropolis；7.3；普通／困难；8 人；Boss：永远之暗 / Necron；cfc:1061
- ✅ `dt-necron-ex` — 永远之暗悲惶歼灭战 / The Minstrel's Ballad: Necron's Embrace；7.3；极；8 人；Boss：永远之暗 / Necron；cfc:1062
- 🔧 `dt-guardian-arkveld` — 护锁刃龙狩猎战 / The Windward Wilds；7.35；普通／困难；8 人；Boss：护锁刃龙 / Guardian Arkveld；cfc:1043；新增缺漏
- 🔧 `dt-guardian-arkveld-ex` — 护锁刃龙上位狩猎战 / The Windward Wilds (Extreme)；7.35；极；8 人；Boss：护锁刃龙 / Guardian Arkveld；cfc:1044；新增缺漏
- 🔧 `dt-doomtrain` — 格莱杨拉波尔歼灭战 / Hell on Rails；7.4；普通／困难；8 人；Boss：格莱杨拉波尔 / Doomtrain；cfc:1076；修正 Boss 英文身分為 Doomtrain
- 🔧 `dt-doomtrain-ex` — 格莱杨拉波尔歼殛战 / Hell on Rails (Extreme)；7.4；极；8 人；Boss：格莱杨拉波尔 / Doomtrain；cfc:1077；修正 Boss 英文身分為 Doomtrain
- 🔧 `dt-enuo` — 恩欧歼灭战 / The Unmaking；7.5；普通／困难；8 人；Boss：恩欧 / Enuo；cfc:1115；修正 Boss 英文身分為 Enuo
- 🔧 `dt-enuo-ex` — 恩欧歼殛战 / The Unmaking (Extreme)；7.5；极；8 人；Boss：恩欧 / Enuo；cfc:1116；修正 Boss 英文身分為 Enuo

## 第二轮：TODO／意译机制逐项核对

以下项目均以可追溯攻略或官方游戏数据核对；中文字段若不是游戏内正式技能名，已明确标成「动作判读」或描述性标题，不再把攻略用语冒充正式名称。

### ARR

- ✅ Gilgamesh：`Minimum` 两名连线者一起移动；`Chicken` 约 25 秒无法行动，但可用鸡形态穿过／清理 Mini Tornadoes。已修正原本「鸡变没得解」的误导。来源：https://ffxiv.consolegameswiki.com/wiki/Battle_in_the_Big_Keep
- ✅ Hydra：`Mean Thrash` 是后方触发顺劈；`White Breath` 正面并附无法驱散的治疗降低；`Radiant Breath` 是中距离范围。来源：https://ffxiv.consolegameswiki.com/wiki/A_Relic_Reborn%3A_the_Hydra
- ✅ Leviathan：`Water Spout` 无标记点两名治疗；`Body Slam` 从水柱所在角落击退；`Tidal Wave` 用转换器处理。来源：https://ffxiv.consolegameswiki.com/wiki/The_Whorleater_%28Extreme%29
- ✅ Thornmarch EX：小莫古死亡会触发全场陨石型伤害，但来源没有独立技能名；已把自造的「小莫古死亡陨石 / Add-death meteor」改为明确的描述性标题。来源：https://ffxiv.consolegameswiki.com/wiki/Thornmarch_%28Extreme%29
- ➖ Vishap／The Steps of Faith：6.2 已从多人任务移除并改为单人战，现行 trials 清单不保留该旧副本，因此「灼热俯冲」无可编辑条目。来源：https://na.finalfantasyxiv.com/lodestone/topics/detail/8598a871dba4f24d5f750fe4ba2116de0de2447b

### HW

- 🔧 Ravana EX `Blinding Blade`：应由两坦分摊，不是「OT 可选」。已修正。来源：https://ffxiv.consolegameswiki.com/wiki/Thok_ast_Thok_%28Extreme%29
- 🔧 Sophia 普通 `Quasar`：平台向较重侧倾斜，玩家滑向较重侧；应预站较轻侧。原文方向相反，已修正。来源：https://ffxiv.consolegameswiki.com/wiki/Containment_Bay_P1T6
- 🔧 ShB 极本中原先仅凭估算写入的绝对分钟数已移除，保留可由机制／读条辨认的阶段终点，避免把团队输出差异写成固定时间。

### SB

- ✅ Susano EX `Sinkhole`：进入黑色中线后获得 5 秒 Sinking，倒数归零死亡；现有处理正确。来源：https://ffxiv.consolegameswiki.com/wiki/The_Pool_of_Tribute_%28Extreme%29
- 🔧 Kugane Ohashi `Embodiment`：两只小怪靠近会获得极高减伤，必须由两坦分开；已补上。来源：https://ffxiv.consolegameswiki.com/wiki/Kugane_Ohashi
- ✅ Seiryu EX：`Onmyo Sigil` 为单次符号；`Onmyo Circle` 会先显示太极／蛇眼顺序再照顺序执行，现有 P2 连续条目已核实。来源：https://ffxiv.consolegameswiki.com/wiki/The_Wreath_of_Snakes_%28Extreme%29
- 🔧 Rathalos：普通 `The Great Hunt` 是 8 人，只有 Extreme 是 4 人；普通版原先的 4 人说明已修正。`Whipping Bite`、`Tail Swipe`、`Charging Bite` 均靠动作判读且无可等待读条，中文标题已明确标注「动作判读」。来源：https://ffxiv.consolegameswiki.com/wiki/The_Great_Hunt 、https://ffxiv.consolegameswiki.com/wiki/The_Great_Hunt_%28Extreme%29

### ShB

- ✅ Titania EX `Phantom Rune`：张翼为近身大圆（远离），转法杖为月环（贴身）；现有处理正确。来源：https://ffxiv.consolegameswiki.com/wiki/The_Dancing_Plague_%28Extreme%29
- 🔧 Hades EX：`Annihilation` 直接赋予 Burning／Freezing Brand，不是「场上火冰球分摊」；燃烧烙印打冰影 Igeyorhm，冰冻烙印打火影 Lahabrea，第二次交换。已重写。来源：https://ffxiv.consolegameswiki.com/wiki/The_Minstrel%27s_Ballad%3A_Hades%27s_Elegy 、https://game8.jp/ff14/280082
- 🔧 Warrior of Light 普通／EX：`Absolute Fire III` 是热病，停止移动与行动；`Absolute Blizzard III` 必须持续移动，否则冻结。原文完全写反，普通、魔法剑、五连咏唱均已修正。来源：https://ffxiv.consolegameswiki.com/wiki/Seat_of_Sacrifice 、https://ffxiv.consolegameswiki.com/wiki/The_Seat_of_Sacrifice_%28Extreme%29

### EW

- ✅ Hydaelyn EX：`Bright Spectrum` 非坦分散，`Dichroic Spectrum` 两坦共同承受，现有光谱对应正确。来源：https://ffxiv.consolegameswiki.com/wiki/The_Minstrel%27s_Ballad%3A_Hydaelyn%27s_Call
- 🔧 Barbariccia EX `Hair Raid`：冲锋／墙版安全处是王冲锋方向的左右侧场边，不是「长头发那面墙附近」。已修正。来源：https://ffxiv.consolegameswiki.com/wiki/Storm%27s_Crown_%28Extreme%29
- 🔧 Golbez EX `Flames of Eventide`：三发由两坦逐发换手，顺序为 MT→ST→MT；已删除含混的「或 1-2-3 轮流」。来源：https://ffxiv.consolegameswiki.com/wiki/The_Voidcast_Dais_%28Extreme%29 、https://www.icy-veins.com/ffxiv/the-voidcast-dais-extreme-trial-guide
- 🔧 The Final Day：需要坦克 LB3 的是卡科代蒙之后第一发 `Ultimate Fate` 单段伤害；第二发为剧情固定必败，不是 `Katastrophe` 六连伤害。技能名、伤害型态与处理均已修正。来源：https://ffxiv.consolegameswiki.com/wiki/The_Final_Day

### DT

- ✅ Valigarmanda EX `Triscourge`：火阶段 Bolt=分散、Chill=到期后移动、Inferno=治疗三段分摊；冰阶段 Bolt=分散+DoT、Bite=坦克大圈、Flames=治疗分摊；雷阶段 Fulgur=地面分散、Frost=浮空躲冰块、Embers=地面治疗分摊。现有条目核对后保留。来源：https://www.icy-veins.com/ffxiv/worqor-lar-dor-extreme-trial-guide
- 🔧 Necron 普通／EX：正式动作链为 `Specter of Death → Invitation`，已改名并补足每次三列择一的说明；EX 不再把「被抓后等死复活」写成可接受解法。来源：https://ffxiv.consolegameswiki.com/wiki/The_Ageless_Necropolis 、https://www.icy-veins.com/ffxiv/the-ageless-necropolis-trial-guide
- ✅ Enuo 普通／EX：灰机正式简中技能名确认为 `光之征兆`。来源：https://ff14.huijiwiki.com/wiki/%E6%81%A9%E6%AC%A7%E6%AD%BC%E7%81%AD%E6%88%98 、https://ff14.huijiwiki.com/wiki/%E6%81%A9%E6%AC%A7%E6%AD%BC%E6%AE%9B%E6%88%98
- ✅ Enuo EX `Gaze of the Void`：10 球扇形、8 球分组吃球、黄色快／紫色慢、治疗顺时针第一颗、远程逆时针第一颗、近战第二组的 PF 分配与 Icy Veins 一致。来源：https://www.icy-veins.com/ffxiv/the-unmaking-extreme-trial-guide
- 🔧 Zelenia EX 六式：重写为两组相对 120° `Holy Hazard`、四塔、四个 `Emblazon` 的正规解，并把 Game8 常见减伤法写清为「每人最多承受一发扇形」，不再写成含混的硬吃玫瑰格。来源：https://ff14.huijiwiki.com/wiki/%E6%B3%BD%E8%8E%B2%E5%B0%BC%E5%A8%85%E6%AD%BC%E6%AE%9B%E6%88%98 、https://www.icy-veins.com/ffxiv/recollection-extreme-trial-guide 、https://game8.jp/ff14/678687

### CFC 最低装等补全

- 依据各条目 `identity.sourceUrl` 对应的 ContentFinderCondition `RequiredItemLevel`，补全 34 项：ARR 22 项（Porta Decumana、Chimera／Hydra、ARR Hard／Extreme、Battle on the Big Bridge／The Dragon's Neck／Battle in the Big Keep、The Chrysalis、Urth's Fount）以及 ShB 12 项（Titania EX、Innocence EX、Hades normal／EX、Ruby／Emerald／Diamond／Warrior of Light normal／EX）。
- ShB 12 项实值：430、430、410、450、455、470、485、500、495、510、465、480（按上述顺序）。

## 机器校验

- 103／103：本地英文正式名与 CFC row 的 `Name` 精确匹配（忽略英文标题首字母大小写）。
- 103／103：`partySize` 与 CFC 的 `MembersPerParty` 相同。4 人例外为 ARR 三个低等级普通讨伐、The Porta Decumana、The Great Hunt (Extreme)。
- 103／103：`type: trial` 对应 `identity.contentType: trial`；`type: extreme` 对应 `extreme-trial`。
- 0 个重复本地 ID；0 个缺 identity；0 个现行清单缺漏；普通与极 Boss 配对无错置。
- `The Gilded Araya` 在全球游戏数据里有同名 CFC 69 与 944；69 是品级 0、排序 9999、未进入随机任务的活动展示／旧 row，944 才是品级 625、进入讨伐随机与导师随机的 6.55 现行副本，因此使用 `cfc:944`。
- `node scripts/validate.js data/trials_arr.js data/trials_hw.js data/trials_sb.js data/trials_shb.js data/trials_ew.js data/trials_dt.js`：103 场全部通过。
- 全项目 `node scripts/validate.js` 另报 `chaotic_dt.js [dt-cloud-of-darkness-chaotic]` 缺灰机来源；这不属于本次 `trials_*.js` 范围，未越权修改。

## 未确认项

- 无身份／名称／版本／难度／Boss／队伍人数未确认项。
- 无 `data/TODO.md` 中 trials 机制未核实项；Vishap 是已从多人内容移除的旧任务，已在上方明确说明而非凭记忆补写。
