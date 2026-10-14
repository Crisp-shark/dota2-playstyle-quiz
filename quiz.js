(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory(require('./heroes'));
  else root.DotaPersonality=factory(root.DotaQuizHeroes);
})(typeof globalThis!=='undefined'?globalThis:this,function(H){
  'use strict';
  // Each answer gives its question's main axis a strong or soft vote, plus one small cross-axis vote.
  // Each quick choice is a situational item preference, not a claim that the item is optimal for a hero.
  const axes=[
    {key:'engage',name:'出手顺序',left:'先手开',right:'后手接'},
    {key:'impact',name:'战斗重心',left:'击杀',right:'救场'},
    {key:'tempo',name:'经济取舍',left:'立即打',right:'先成型'},
    {key:'map',name:'地图走法',left:'抱团',right:'分带'},
    {key:'style',name:'出装风格',left:'稳妥',right:'奇招'}
  ];
  const q=(axis,prompt,options)=>({axis,prompt,options:options.map(([item,text,value,bonusAxis,bonus])=>({item,text,image:`assets/items/${item}.png`,value,bonusAxis,bonus}))});
  const questions=[
    q('engage','河道撞人，你拿哪件？',[
      ['blink','闪烁匕首',-2,'map',-1],['orchid','紫怨',-1,'impact',-1],['cyclone','吹风杖',1,'style',-1],['lotus_orb','清莲宝珠',2,'impact',1]]),
    q('impact','团战开打，先掏哪件？',[
      ['dagon','达贡之神力',-2,'style',1],['bloodthorn','血棘',-1,'engage',-1],['sheepstick','邪恶镰刀',1,'engage',-1],['glimmer_cape','微光披风',2,'style',-1]]),
    q('tempo','十分钟攒了钱，做哪件？',[
      ['urn_of_shadows','影之灵龛',-2,'engage',-1],['solar_crest','炎阳纹章',-1,'impact',1],['hand_of_midas','迈达斯之手',1,'impact',-1],['bfury','狂战斧',2,'map',1]]),
    q('map','两路都来线，带哪件？',[
      ['guardian_greaves','卫士胫甲',-2,'impact',1],['crimson_guard','赤红甲',-1,'style',-1],['travel_boots','远行鞋',1,'tempo',1],['manta','幻影斧',2,'impact',-1]]),
    q('style','局势僵住，下一件？',[
      ['black_king_bar','黑皇杖',-2,'engage',-1],['sphere','林肯法球',-1,'impact',-1],['meteor_hammer','陨星锤',1,'map',-1],['invis_sword','影刃',2,'map',1]]),
    q('engage','肉山口对峙，选哪件？',[
      ['overwhelming_blink','盛势闪光',-2,'impact',1],['rod_of_atos','阿托斯之棍',-1,'map',1],['ghost','幽魂权杖',1,'style',-1],['blade_mail','刃甲',2,'impact',1]]),
    q('impact','队友被切，先用哪件？',[
      ['nullifier','否决坠饰',-2,'engage',-1],['witch_blade','巫师之刃',-1,'tempo',-1],['force_staff','原力法杖',1,'map',1],['pavise','长盾',2,'style',-1]]),
    q('tempo','刚赢一波，下一件？',[
      ['spirit_vessel','魂之灵瓮',-2,'engage',-1],['ancient_janggo','韧鼓',-1,'map',-1],['mask_of_madness','疯狂面具',1,'impact',-1],['radiance','辉耀',2,'map',1]]),
    q('map','对面缩高地，带哪件？',[
      ['assault','强袭胸甲',-2,'tempo',-1],['shivas_guard','希瓦的守护',-1,'impact',1],['travel_boots_2','远行鞋二级',1,'tempo',1],['silver_edge','白银之锋',2,'style',1]]),
    q('style','决胜团最后一格，选哪件？',[
      ['satanic','撒旦之邪力',-2,'impact',-1],['skadi','斯嘉蒂之眼',-1,'tempo',1],['refresher','刷新球',1,'impact',1],['rapier','圣剑',2,'engage',-1]])
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
      score:Math.max(0,Math.min(100,Math.round(50+scores[axis.key]*7.5)))
    }));
    const vector=dimensions.map(axis=>axis.score);
    const profile=profiles.reduce((best,item)=>distance(vector,item.target)<distance(vector,best.target)?item:best,profiles[0]);
    const matches=H.heroes.map(hero=>({hero,distance:distance(vector,hero.vector)})).sort((a,b)=>a.distance-b.distance||a.hero.id-b.hero.id);
    return {profile,dimensions,matches,heroCount:H.count};
  }
  function summary(result){if(!result)return '';return `我的 Dota 2 战局称号：${result.profile.title}\n${result.profile.tagline}\n风格同频英雄：${result.matches.slice(0,3).map(match=>match.hero.name).join('、')}\n玩家创作的娱乐测试，英雄是风格联想，不是上分推荐。`}
  return {axes,questions,profiles,sanitize,analyze,summary};
});
