(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory(require('./heroes'));
  else root.DotaPersonality=factory(root.DotaQuizHeroes);
})(typeof globalThis!=='undefined'?globalThis:this,function(H){
  'use strict';
  // Each answer gives its question's main axis a strong or soft vote, plus one small cross-axis vote.
  const axes=[
    {key:'engage',name:'交战时机',left:'先手开团',right:'后手反打'},
    {key:'impact',name:'战场职责',left:'输出收割',right:'控制护航'},
    {key:'tempo',name:'成长节奏',left:'早早参战',right:'发育成型'},
    {key:'map',name:'地图路线',left:'正面集结',right:'边路牵制'},
    {key:'style',name:'打法手感',left:'稳稳执行',right:'灵活奇招'}
  ];
  const q=(axis,prompt,options)=>({axis,prompt,options:options.map(([text,value,bonusAxis,bonus])=>({text,value,bonusAxis,bonus}))});
  const questions=[
    q('engage','开局语音里大家还在等人发话，你会怎么打开局面？',[
      ['直接喊人抢第一波主动权',-2,'tempo',-1],['先去关键路口试探，看到机会再叫人',-1,'map',1],['让对方先露位置，我来接住第一波',1,'impact',1],['守住反打技能，等他们先交关键招',2,'style',-1]]),
    q('impact','一波团战即将开始，你最想完成哪件事？',[
      ['盯住残血，收掉能决定战局的人',-2,'engage',1],['把火力集中到最该打的目标',-1,'style',-1],['限制对面关键技能，让队友安全输出',1,'engage',-1],['保住我方核心，团战就还有后手',2,'tempo',1]]),
    q('tempo','十分钟时，身上刚攒出一笔钱，你更愿意……',[
      ['现在就买小件，马上去打下一波',-2,'engage',-1],['先换一件能跟队友联动的装备',-1,'impact',1],['清完两波线，再带着关键装备参团',1,'map',1],['继续稳住经济，等真正的强势节点',2,'impact',-1]]),
    q('map','两路兵线都在动，队伍需要一个选择。你会……',[
      ['五人一起占住正面视野',-2,'impact',1],['和队友抱团压塔，逼对面接战',-1,'engage',-1],['自己处理远端兵线，随时传送回来',1,'tempo',1],['持续在边路牵制，换出地图空间',2,'style',1]]),
    q('style','这局你的第一件关键装备会怎么定？',[
      ['选最稳的那件，按已知节奏打',-2,'tempo',1],['参考阵容缺口，买能稳定起效的装备',-1,'impact',1],['看对面出装，临时调整一个新方案',1,'engage',1],['为一套出其不意的打法提前铺路',2,'map',1]]),
    q('engage','对面五人消失，队友正在摸向河道。你会……',[
      ['主动抢先手，打断他们的集结',-2,'map',-1],['探到位置后马上开雾抓一人',-1,'impact',-1],['拉开阵形，让对手先交第一轮技能',1,'style',-1],['守住核心与退路，把埋伏变成反打',2,'impact',1]]),
    q('impact','敌方核心在视野里露头，但队友状态不满。你想……',[
      ['直接找角度秒掉他',-2,'style',1],['补足伤害，确保这波抓人能成功',-1,'engage',-1],['先控住目标，等队友站到位',1,'engage',-1],['守住后排，别让这次出手被反包',2,'style',-1]]),
    q('tempo','你刚到一个小强势期，地图却很安静。你会……',[
      ['立刻找人，趁技能强势开打',-2,'engage',-1],['带队拿视野与小目标，把优势滚起来',-1,'map',-1],['吃完安全资源，再逼对手接下一波',1,'impact',-1],['先完成核心装备，让胜算更稳',2,'style',-1]]),
    q('map','准备上高地时，对面一直不接正面。你会……',[
      ['五人压在一起，把推进阵形保持完整',-2,'style',-1],['站好高地入口，逼他们正面交技能',-1,'impact',1],['去另一条线施压，等对面有人回防',1,'tempo',1],['不断拉扯两路，让对面来回奔跑',2,'style',1]]),
    q('style','你最享受哪一种漂亮的胜利？',[
      ['每次执行都稳，优势一点点兑现',-2,'tempo',1],['技能和站位严丝合缝地接上',-1,'impact',1],['临场变招，抓住敌人没看到的角度',1,'map',1],['用一套少见的组合突然改写战局',2,'engage',-1]]),
    q('engage','你的大招刚好转好，队友也在附近。下一步是……',[
      ['我先开，给大家一个明确的开战信号',-2,'impact',1],['盯住落单目标，抓住先手窗口',-1,'map',1],['留着大招，等对手先露出破绽',1,'style',1],['站在队友身后，专门接对面第一轮',2,'impact',1]]),
    q('impact','队友被切入，敌方后排同时露出破绽。你更可能……',[
      ['切向后排，先让对面减员',-2,'map',1],['补最后一段伤害，迅速结束这次交手',-1,'engage',1],['控住切入者，让队友先撤出危险区',1,'engage',1],['交出保命资源，把队友留在场上',2,'tempo',-1]]),
    q('tempo','逆风时，地图上只有几块安全区域。你会……',[
      ['找一次短促的开雾反扑',-2,'style',1],['跟队友一起拿能争的小资源',-1,'impact',1],['避开交战，稳稳处理能吃的线',1,'map',1],['把经济集中给关键时刻能翻盘的人',2,'impact',1]]),
    q('map','最后一条外塔还在，你想怎样施加压力？',[
      ['集合推进，把对面压回塔后',-2,'engage',-1],['先站住正面，让队友安全点塔',-1,'impact',1],['自己在侧翼接线，随时包过来',1,'engage',-1],['带远端兵线，迫使对面分人处理',2,'tempo',1]]),
    q('style','决胜团开始前，队友问你怎么打。你会说……',[
      ['按已经分好的职责走，别乱交技能',-2,'impact',1],['先确认谁开、谁留招，照计划执行',-1,'engage',-1],['看对面第一步，再用临场信号转向',1,'engage',1],['给我一点空间，我来找他们没想到的解法',2,'map',1]])
  ];
  const profiles=[
    {title:'雾中先锋',target:[12,55,18,32,50],tagline:'开雾的第一步，往往由你迈出。',strength:'你敢把短暂窗口变成集体行动。',watch:'先确认队友的距离和技能。'},
    {title:'反手执旗',target:[89,70,32,25,27],tagline:'对面先动，你来决定后半场。',strength:'你擅长保留关键技能，等对手露出破绽。',watch:'机会到来时，也要果断回击。'},
    {title:'高地铁壁',target:[79,81,65,12,13],tagline:'你站在那里，队伍就还有阵地。',strength:'你把阵形和退路照看得很稳。',watch:'别只守，记得寻找推进时刻。'},
    {title:'边路幽影',target:[60,23,72,91,73],tagline:'一条兵线，也能牵动整张地图。',strength:'你会用分带与转线为队伍换空间。',watch:'留意队友是否准备好接正面。'},
    {title:'符文猎手',target:[21,19,17,79,80],tagline:'机会出现时，你已在河道另一边。',strength:'你擅长把信息差变成击杀窗口。',watch:'别让一次追击丢掉更大的目标。'},
    {title:'后期主宰',target:[53,10,92,60,33],tagline:'现在稳住，下一波由你收尾。',strength:'你知道何时积累资源，何时接管战斗。',watch:'发育时给队友一个明确的时间点。'},
    {title:'团战导演',target:[34,67,44,31,78],tagline:'五个人的技能，被你接成一段节奏。',strength:'你会寻找控制与伤害衔接的时机。',watch:'连招之外也要留一条退路。'},
    {title:'救场神谕',target:[92,95,20,45,71],tagline:'最危险的一秒，你总有下一手。',strength:'你善于救人，也能从混乱中改写局面。',watch:'保人时别忘了自己的站位。'},
    {title:'阵地法师',target:[76,33,65,15,59],tagline:'这片战场，由你的技能划出边界。',strength:'你善于守住要点，让敌人不敢直进。',watch:'注意远端兵线与侧翼。'},
    {title:'独行刀锋',target:[38,5,70,87,66],tagline:'你找的不是团战，是那一瞬间的破绽。',strength:'你能独自发现落单目标与切入角度。',watch:'出手前给队友留下跟进信号。'},
    {title:'野区游侠',target:[38,46,16,83,67],tagline:'你走过的路径，总能带回新机会。',strength:'你能串起游走、视野与突然转线。',watch:'频繁移动时也别丢掉线上资源。'},
    {title:'控场棋手',target:[64,87,46,34,62],tagline:'敌人的选择，在你布好的局里变少。',strength:'你擅长限制关键目标，为队友创造输出空间。',watch:'控制之后要有人兑现伤害。'},
    {title:'收割号角',target:[17,8,40,32,34],tagline:'一声开战，下一秒就是减员。',strength:'你能迅速聚焦目标，把先手变成果。',watch:'确保这一波打完还有后续。'},
    {title:'地图棋手',target:[54,51,80,89,55],tagline:'你把每条兵线都当成下一手棋。',strength:'你擅长用资源与牵制铺出获胜路线。',watch:'地图上出现团战窗口时别错过。'},
    {title:'前排山岳',target:[19,75,37,11,19],tagline:'你先站稳，队友才能放心向前。',strength:'你愿意承担正面压力，守住队伍阵形。',watch:'扛住伤害后也要及时给出方向。'},
    {title:'奇招火花',target:[19,46,22,69,94],tagline:'对面还在猜，你的第二套打法已成形。',strength:'你能从不寻常的组合里找到机会。',watch:'奇招要让队友知道如何配合。'},
    {title:'正面推手',target:[25,42,75,11,21],tagline:'你喜欢把优势直接压到塔前。',strength:'你会把经济与兵线转换成清晰的目标。',watch:'推进前确认侧翼与视野。'},
    {title:'夜色守望',target:[88,89,11,72,43],tagline:'你看见危险，也看见队友的归路。',strength:'你会在游走中替队伍补上安全感。',watch:'别把所有风险留给自己。'},
    {title:'连环追猎',target:[16,14,18,71,75],tagline:'对手退一步，你已经追出第二步。',strength:'你能连续制造小规模交战机会。',watch:'追击要看地图和队友位置。'},
    {title:'节奏领航',target:[20,63,20,23,29],tagline:'你把零散的行动变成同一个方向。',strength:'你善于喊出时机，让团队在同一拍行动。',watch:'也给队友一些临场调整空间。'}
  ];
  function sanitize(raw){return questions.map((_,i)=>Array.isArray(raw)&&Number.isInteger(raw[i])&&raw[i]>=0&&raw[i]<4?raw[i]:null)}
  function distance(a,b){return a.reduce((sum,n,i)=>sum+(n-b[i])**2,0)}
  function analyze(raw){
    const answers=sanitize(raw);
    if(answers.some(answer=>answer===null))return null;
    const scores=Object.fromEntries(axes.map(axis=>[axis.key,0]));
    questions.forEach((question,index)=>{
      const option=question.options[answers[index]];
      scores[question.axis]+=option.value;
      scores[option.bonusAxis]+=option.bonus;
    });
    const dimensions=axes.map(axis=>({
      ...axis,
      score:Math.max(0,Math.min(100,Math.round(50+scores[axis.key]*5)))
    }));
    const vector=dimensions.map(axis=>axis.score);
    const profile=profiles.reduce((best,item)=>distance(vector,item.target)<distance(vector,best.target)?item:best,profiles[0]);
    const matches=H.heroes.map(hero=>({hero,distance:distance(vector,hero.vector)})).sort((a,b)=>a.distance-b.distance||a.hero.id-b.hero.id);
    return {profile,dimensions,matches,heroCount:H.count};
  }
  function summary(result){if(!result)return '';return `我的 Dota 2 战局称号：${result.profile.title}\n${result.profile.tagline}\n风格同频英雄：${result.matches.slice(0,3).map(match=>match.hero.name).join('、')}\n玩家创作的娱乐测试，英雄是风格联想，不是上分推荐。`}
  return {axes,questions,profiles,sanitize,analyze,summary};
});
