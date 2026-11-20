// Report-relative seconds. Repeated damage ticks and instructional deadlines are grouped.
const UwuTimeline = (() => {
  const phases = {
    garuda: {name:'迦樓羅', start:0, end:152.558, points:[[0,'開場'],[20,'刺羽與氣旋'],[39,'低氣壓與清層'],[87,'雙分身寒風'],[116,'中高壓接線'],[136,'末段氣流與換場']]},
    intermission: {name:'拉哈布雷亞・職能 LB3', start:486, end:536.112, points:[[486,'魔導機雷'],[501.6,'死宣與黑暗'],[525,'究極防禦']]},
    ultima: {name:'究極神兵', start:536.112, end:895.264, points:[[536.112,'轉場演出'],[575,'首輪攻擊'],[595,'追擊'],[629,'四連地火'],[674,'爆擊'],[731,'亂擊'],[780,'以太波動'],[816,'蠻神輪盤']]}
  };
  // Distinct targets from the six non-tanks; the gaol is one of the Eruption baits.
  function assignments(seed) {
    const roles=[2,3,4,5,6,7];
    let value=(seed^0xa4b19fc3)>>>0;
    for(let i=roles.length-1;i>0;i--){
      value=(Math.imul(value,1664525)+1013904223)>>>0;
      const j=value%(i+1);[roles[i],roles[j]]=[roles[j],roles[i]];
    }
    return {eruptions:roles.slice(0,3),gaol:roles[1],singers:roles.slice(3,5),pillar:roles[5]};
  }
  // Each target's status update has its own timestamp, independent of cast end and HP damage.
  // Columns are absolute seconds, role index in MT/ST/H1/H2/D1/D2/D3/D4 order, new stack count.
  const thermalUpdates=[
    [26.751,1,1],[36.179,1,2],[46.361,1,0],
    [50.990,3,1],[50.990,6,1],[51.390,5,1],[51.479,4,1],[51.746,7,1],[51.880,2,1],[51.970,0,1],[51.970,1,1],
    [53.221,1,0],[53.623,6,0],[54.290,2,0],[54.378,3,0],[55.357,7,0],
    [56.783,7,1],[57.270,6,1],[57.270,5,2],[57.537,4,2],[57.670,2,1],[57.939,3,1],[58.073,1,1],[58.206,0,2],
    [61.101,5,0],[65.078,4,0],[125.654,0,0],[125.654,7,0],
  ];
  const garudaDamage=[
    [10.617,'寒風之歌・ST'],[10.750,'寒風之歌・H1'],[10.885,'寒風之歌・H2'],
    [42.177,'寒風之嘯・全隊受傷開始'],[43.108,'寒風之嘯・全隊受傷結束'],
    [52.059,'烈風刃一・全隊受傷開始'],[52.997,'烈風刃一・全隊受傷結束'],
    [58.251,'烈風刃二・全隊受傷開始'],[59.189,'烈風刃二・全隊受傷結束'],
    [99.649,'分身寒風之歌・雙坦受傷'],
  ];
  function build(phase,seed) {
    const events=[],supp=assignments(seed);
    const add=(t,kind,name,extra={})=>{
      const event={t,kind,name,lead:3,...extra};
      if(kind==='bait'){
        const targets=[0,1,2,3,4,5,6,7];let value=(seed^Math.round(t*1000)^0x5742)>>>0;
        for(let i=7;i>0;i--){value=(Math.imul(value,1664525)+1013904223)>>>0;const j=value%(i+1);[targets[i],targets[j]]=[targets[j],targets[i]];}
        event.targets=targets.slice(0,name==='大地之重'?4:5);
      }
      events.push(event);
    };
    const times=(list,kind,name,extra)=>list.forEach(t=>add(t,kind,name,extra));
    const feather=list=>times(list,'bait','飛翎雨',{lead:1.25,r:3});
    const raid=(t,name)=>add(t,'raid',name);
    let lastLandslide=null;
    const slide=(t,angle,name='地裂')=>{
      if(name==='地裂'){
        const source=t<660||t>750?{x:-13.7,y:13.7}:{x:13.7,y:13.7};
        add(t,'slide',name,{angle,who:(seed+events.length)%8,bait:true,source,lead:t-({650.621:648.434,704.884:702.701,765.378:763.200}[t])});
        lastLandslide={t,source};
      }else if(name==='覺醒地裂')add(t,'slide',name,{angle,repeatOf:lastLandslide.t,source:lastLandslide.source,lead:t-({652.628:650.665,706.887:704.929,767.382:765.423}[t])});
      else add(t,'slide',name,{angle});
    };
    const lb=(t,who,name,lead=6)=>add(t,'lb',name,{who,lead});
    const predAngle=(seed%4)*90;
    // Seeded practice targets; these are not targets from the party's log.
    const rouletteTargets=[seed%8,(seed+3)%8,(seed+5)%8];
    if(phase==='garuda'){
      // CFfcHwYn2rGzxPdD fight 13, display-clock seconds at cast completion.
      times([7.641,23.018,121.327,141.827],'cone','螺旋氣流',{lead:2.2});
      add(10.216,'song','寒風之歌',{tank:1,targets:[1,2,3]});
      times([16.313,22.484,28.664,105.374],'whirl','大旋風',{lead:2.7});
      times([26.486,124.809],'buster','下衝氣流',{who:0,lead:0});
      times([26.574,35.688],'cyclone','刺羽・氣旋',{who:1});
      times([36.401,71.459,92.416,103.855,129.267],'bait','飛翎雨',{lead:.7,r:3});
      add(41.244,'raid','寒風之嘯',{lead:2.7});
      add(42.665,'burst','刺羽・大暴風',{lead:2.7});
      add(46.760,'death','刺羽・死亡紀錄',{lead:0});
      times([46.405,53.264,53.667,54.334,54.422,55.401,61.145,65.122,125.698],'discharge','超級氣旋',{lead:0});
      add(50.589,'friction','烈風刃一',{wave:1,lead:1.7});
      add(56.783,'friction','烈風刃二',{wave:2,lead:1.7});
      add(76.239,'raid','大氣爆發',{lead:2.7});
      add(99.244,'sisters','分身・寒風之歌',{targets:[0,1]});
      times([99.605,122.622],'eye','風暴之眼',{lead:2.7});
      add(99.782,'wheel','邪輪旋風',{lead:2.7});
      add(124.675,'tethers','中高壓・雙接線',{targets:[0,7]});
      add(152.558,'handoff','火神開始詠唱深紅旋風',{lead:0});
      const ref=typeof module==='undefined'?globalThis.UWU_REFERENCE:require('./uwu-reference');
      for(const e of events){const casts=(ref?.garuda?.eventCasts||[]).filter(c=>Math.abs(c.t-e.t)<.002&&c.t0<c.t);if(casts.length)e.lead=e.t-Math.min(...casts.map(c=>c.t0));}
    }else if(phase==='intermission'){
      add(488.205,'proximity','魔導浮游炮・中央集合');
      lb(501.5,7,'法系 LB3・擊破機雷',10);raid(501.822,'侵蝕・死宣');lb(509,2,'治療 LB3・解除死宣',7);
      lb(526,4,'近戰 LB3・擊破拉哈布雷亞',14);lb(536.112,0,'坦克 LB3・抵禦究極',5);
    }else{
      raid(579.854,'魔導核爆');add(582.165,'mark','吸附式以太炸彈',{targets:[0],splash:2,ability:11129});add(588.349,'laser','誘導雷射');
      add(593.329,'stack','吸附式炸彈分攤',{who:0,markAt:582.165});raid(599.560,'追擊之究極幻想');
      add(614.372,'pred1','追擊一・鋼鐵／衝鋒／地裂',{lead:8,angle:predAngle});
      add(616.374,'pred2','追擊二・月環／十字／青磷放射',{lead:2,angle:predAngle});add(616.464,'predTornado','追擊・邪輪龍捲',{lead:2,angle:predAngle});add(616.509,'crimsonCross','追擊・覺醒十字火焰',{lead:2,angle:predAngle});feather([621.714]);
      times([636.058,638.020,640.026,642.028],'eruption','地火噴發',{lead:1.45,source:{x:0,y:-22}});
      add(641,'fetter','炎獄之鎖');add(646.253,'raid','光輝炎柱・預告');add(647.055,'plume','光輝炎柱',{lead:647.055-643.095});
      // Six fixed bomb locations from hJPR fight 1; no invented random bait.
      const bombPoints=[[-6,0],[-3,-5],[3,-5],[6,0],[3,5],[-3,5]];
      const landTimes=[647.277,649.281,651.290,653.295,655.300,657.300],blastTimes=[652.851,654.854,656.856,658.857,660.859,662.862];
      bombPoints.forEach((_,id)=>{const [x,y]=bombPoints[(id+(seed%3===1?5:0))%6],center={x,y};add(landTimes[id],'bombLand','炸彈岩落下 '+(id+1),{center,id,lead:.8});add(blastTimes[id],'bomb','炸彈岩爆炸 '+(id+1),{center,id,lead:blastTimes[id]-landTimes[id]});});
      slide(650.621,0);
      add(651.2,'slide','究極神兵・地裂',{ultima:true,who:(seed+3)%8,source:{x:2.65,y:-6.48},offsets:[0],lead:2.186});add(651.29,'slide','究極神兵・雙側地裂',{ultima:true,who:(seed+3)%8,source:{x:2.66,y:-6.46},offsets:[0,45,-45],repeatOf:651.2,lead:2.188});slide(652.628,34,'覺醒地裂');raid(655.787,'七連怒震');
      add(658.456,'mark','吸附式以太炸彈',{targets:[0],splash:2,ability:11129});
      add(663.574,'wheel','分身・邪輪旋風',{centers:[{x:-15,y:0},{x:15,y:0}],radius:8.36,ability:11084});raid(665.579,'寒風之嘯');feather([668.922,672.438]);add(669.634,'stack','吸附式炸彈分攤',{who:0,markAt:658.456});add(670.7,'laser','誘導雷射');
      raid(677.872,'爆擊之究極幻想');times([689.739,692.763,695.747],'bait','大地之重',{lead:3,r:6});
      add(691.785,'stack','烈焰碎擊',{who:4+seed%4});times([692.897,709.915,726.957],'eye','風暴之眼');
      add(694.944,'tether','中高壓一',{who:3});add(712.362,'tether','中高壓二',{who:2});
      [694.187,700.067,708.713,712.805].forEach((t,i)=>add(t,'orb','以太炸彈 '+(i+1),{who:i%2,side:i%2?1:-1,lead:4}));
      add(695.835,'searing','灼熱咆哮',{who:3});times([701.807,707.822,713.828,719.837,725.844],'pulse','灼熱爆發',{who:3});
      feather([699.532,716.942]);slide(704.082,45,'深紅旋風');add(706.220,'crimsonCross','覺醒十字火焰',{lead:2,angle:0});slide(704.884,0);slide(706.887,32,'覺醒地裂');
      raid(715.207,'魔導核爆');add(730.605,'laser','誘導雷射');
      raid(735.806,'亂擊之究極幻想');add(746.703,'gaolmark','岩石投擲',{who:supp.gaol});
      times([747.638,749.638,751.636,753.684],'eruption','亂擊地火',{lead:1.35,targets:supp.eruptions});
      add(750.749,'songside','分身寒風・西',{lead:5,who:supp.singers[0],tank:0,source:{x:-6,y:-6}});add(750.749,'songside','分身寒風・東',{lead:5,who:supp.singers[1],tank:1,source:{x:5.97,y:5.97}});add(753.684,'gaol','花崗岩牢',{who:supp.gaol});
      add(752.927,'suppCone','寒風之歌・大扇形',{lead:2.002,who:(seed*3+4)%8,source:{x:-13.7,y:-13.7},action:11150});
      times([752.658,755.770,756.791,757.814,758.792,759.770,760.793],'pillar','光柱',{lead:1,who:supp.pillar});
      add(756.836,'whirl','大旋風',{lead:3});
      feather([755.326,757.280,773.739]);const lasers=[['right','right','left'],['center','left','right'],['center','center','left']][seed%3];
      // Variants/source/dimensions are from raw casts and game data. South,
      // center-SW and west directions are reconstructed from Arutora's
      // 2018_07_30_1_6.jpg and Lodestone blog/3845052, not packet rotation.
      [757.770,761.908,766.048].forEach((t,i)=>add(t,'aetherLaser','以太化學雷射・'+{right:'右',center:'中',left:'左'}[lasers[i]],{direction:lasers[i],source:{x:13.7,y:-13.7},angle:225+{right:45,center:0,left:-45}[lasers[i]],geometryProvenance:'diagram-reconstructed'}));
      add(764.5,'rescue','擊破石牢',{lead:764.5-753.684});slide(765.378,0);slide(767.382,32,'覺醒地裂');
      add(768.137,'tether','中高壓',{who:1});add(768.937,'stack','烈焰碎擊',{who:4+(seed+1)%4});raid(774.184,'魔導核爆');
      lb(785.611,0,'坦克 LB3・抵禦究極',5);add(795.800,'boom','以太波動・擊退');
      [799.223,799.490,800.824,803.540].forEach((t,i)=>add(t,'grouporb','連線球 '+(i+1),{side:i%2?1:-1,lead:4,orb:i}));
      const orders=[['土','火','風'],['風','火','土'],['火','風','土']];
      orders[seed%3].forEach((primal,i)=>{
        // Align the G-I-T reference on the opening Ultima (536.112 − 522.718).
        const gitOffset=13.394,igtOffset=22.719;
        const summonTimes=[
          [821.15,841.15,861.15],
          [807.555,827.686,847.822].map(n=>n+gitOffset),
          [799.140,819.261,839.390].map(n=>n+igtOffset),
        ];
        const t=summonTimes[seed%3][i];
        add(t,'summon','召喚'+primal+'神',{primal});
        const observed=seed%3===0;
        if(primal==='風'){add(observed?868.602:t+7.2,'wheel','邪輪旋風');add(observed?870.733:t+9.3,'donut','邪輪龍捲');feather([observed?883.116:t+16]);}
        if(primal==='火'){slide(observed?848.414:t+7.2,90,'深紅旋風');add(observed?848.459:t+7.2,'eruption','地火噴發',{lead:1.5,targets:[(seed+2)%8,(seed+5)%8]});}
        if(primal==='土')times(observed?[826.215,829.239,832.217]:[t+5,t+8,t+11],'bait','大地之重',{lead:3,r:6});
        add(observed?[829.863,849.882,869.890][i]:t+8.6,'stack','吸附式炸彈分攤',{who:rouletteTargets[i],markAt:817.055});raid(observed?[835.420,856.421,875.447][i]:seed%3===1?[821.681,842.923,862.121][i]+gitOffset:[814.397,833.412,853.681][i]+igtOffset,{風:'大氣爆發',火:'地獄之火炎',土:'大地之怒'}[primal]);
      });
      add(817.055,'mark','三人吸附式以太炸彈',{targets:rouletteTargets});add(883.828,'enrage','究極幻想・狂暴');
    }
    if(phase==='ultima'){
      // Raw helper begincasts: target snapshots happen at cast start, not at
      // an artificially shortened warning immediately before impact.
      const starts=new Map([[636.058,633.072],[638.020,635.034],[640.026,637.039],[642.028,639.046],[747.638,744.660],[749.638,746.659],[751.636,748.661],[753.684,750.704],[848.459,845.479],[689.739,686.764],[692.763,689.784],[695.747,692.763],[826.215,823.235],[829.239,826.260],[832.217,829.239]]);
      for(const e of events)if(e.kind==='eruption'||e.kind==='bait'&&e.name==='大地之重')e.lead=starts.has(e.t)?e.t-starts.get(e.t):3;
    }
    return events.sort((a,b)=>a.t-b.t || Number(b.kind==='gaol')-Number(a.kind==='gaol'));
  }
  return {phases,build,assignments,thermalUpdates,garudaDamage};
})();
if(typeof module!=='undefined')module.exports=UwuTimeline;
