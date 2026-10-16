(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory(require('./heroes'),require('./hero-entrances'));
  else root.DotaPersonality=factory(root.DotaQuizHeroes,root.DotaHeroEntrances);
})(typeof globalThis!=='undefined'?globalThis:this,function(H,Entrances){
  'use strict';
  const axes=[
    {key:'engage',name:'出手顺序',left:'先手开',right:'后手接'},
    {key:'impact',name:'战斗重心',left:'击杀',right:'救场'},
    {key:'tempo',name:'经济取舍',left:'立即打',right:'先成型'},
    {key:'map',name:'地图走法',left:'抱团',right:'分带'},
    {key:'style',name:'打法选择',left:'稳妥',right:'奇招'}
  ];
  const profiles=[
    {title:'幸存者',target:[87,35,84,58,18],tagline:'团战可以输，命得带回来。',strength:'你会算好风险，等真正能赢的那一波。',watch:'有优势时，也给自己一次主动出手的机会。'},
    {title:'西装暴徒',target:[18,18,24,35,18],tagline:'动作很稳，出手很狠。',strength:'你会挑准目标，用最短的时间打出结果。',watch:'别让漂亮的击杀盖过地图目标。'},
    {title:'跟屁虫',target:[63,83,32,13,25],tagline:'队友去哪，你的支援就到哪。',strength:'你总能把一个人的机会变成两个人的胜势。',watch:'跟人之前，先看看另一边的兵线。'},
    {title:'救火队长',target:[82,94,26,30,60],tagline:'哪里要炸，你就往哪里赶。',strength:'你擅长留一手，把快输的团接回来。',watch:'救完人记得顺手拿点资源。'},
    {title:'开团莽夫',target:[6,40,15,16,62],tagline:'等什么？这波能打！',strength:'你能把队伍从犹豫里拉进同一场战斗。',watch:'开之前，确认队友真的跟得上。'},
    {title:'背刺客',target:[68,13,43,87,76],tagline:'正面在演，真正的你在背后。',strength:'你会从意想不到的角度找到缺口。',watch:'出手后，想好怎么撤出战场。'},
    {title:'拆迁办',target:[43,28,74,92,35],tagline:'你打的是架，拿的是塔。',strength:'你知道怎样把一波优势变成建筑和地图。',watch:'队友被开时，别让他们等太久。'},
    {title:'控场师',target:[43,71,46,38,78],tagline:'人还没到，位置已被你安排。',strength:'你能用技能和站位让对手无路可走。',watch:'好控制需要有人接上伤害。'},
    {title:'补刀仙',target:[52,14,94,65,43],tagline:'先补这一刀，再接管全场。',strength:'你会守住自己的发育节奏，等强势期到来。',watch:'告诉队友你什么时候可以参战。'},
    {title:'赌命人',target:[17,20,43,54,96],tagline:'风险很高？听起来正合适。',strength:'你敢抓住别人不敢碰的机会。',watch:'留一条退路，奇招才有第二次。'},
    {title:'地图幽灵',target:[70,41,67,94,70],tagline:'你不在正面，却处处都有你。',strength:'你用走位和兵线牵着对手转。',watch:'关键团战要及时回到队友身边。'},
    {title:'团战粘合剂',target:[49,91,58,21,65],tagline:'五个人凑一块，你让他们像一个队。',strength:'你会照顾队友的节奏，让每个技能都有接应。',watch:'也别忘记留下自己的高光时刻。'}
  ];
  const archetypes={
    vanguard:{signatureOptions:['立刻开团','等人站一起','断对手的先手','绕侧面切入'],pressure:'一波团要打起来，你先做什么？',pressureOptions:['找角度开团','等人先交技能','替队友扛第一波','从侧面包过去'],highlight:'你最想留下哪种镜头？',highlightOptions:['一人先冲','反手救全队','盯死关键人','出其不意翻盘']},
    guardian:{signatureOptions:['提前帮队友','等对面动手','救最危险的人','转线去支援'],pressure:'两边都在喊你，你先去哪？',pressureOptions:['去最热的战场','先守住阵形','接住危险队友','绕路切入后排'],highlight:'你最开心的是？',highlightOptions:['带队反打','救下丝血队友','补掉逃跑的人','用怪招破局']},
    farmer:{signatureOptions:['有机会就打','等装备成型','帮队友稳住','带线找机会'],pressure:'下一波快来了，你现在会？',pressureOptions:['提前集合打架','再补一点经济','帮队友守住线','换路找发育空间'],highlight:'你最想看到？',highlightOptions:['强势期直接开','顶住后反杀','一人收完战场','把对手带着跑']},
    rover:{signatureOptions:['提前找人','留着反制','帮队友脱身','换路再抓人'],pressure:'地图上有两个机会，你先？',pressureOptions:['立刻找人开雾','等对手露出破绽','去帮被追的队友','去另一条线做事'],highlight:'哪幕最像你？',highlightOptions:['一秒先手','及时赶到救人','绕后收掉目标','骗出技能再回头']},
    trickster:{signatureOptions:['正面亮招','等对手交招','队友危险再用','换角度骗技能'],pressure:'局面僵住，你会怎么破？',pressureOptions:['正面硬开','等他们先犯错','先帮队友稳住','换条路做文章'],highlight:'哪一刻最爽？',highlightOptions:['主动制造混乱','反手扭转局面','悄悄带走核心','用奇招骗过对面']},
    fighter:{signatureOptions:['马上出手','等更好目标','替队友解围','绕后找机会'],pressure:'敌方刚露头，你的第一反应？',pressureOptions:['马上集火','等对手先动','先护住队友','绕开视野找角度'],highlight:'你想当哪种主角？',highlightOptions:['第一个冲上去','最后一个还在场','收掉关键人','做出意外操作']}
  };
  function validHeroIds(raw){
    if(!Array.isArray(raw)||raw.length!==3)return null;
    const ids=raw.map(Number);
    return ids.every((id,i)=>Number.isInteger(id)&&H.hero(id)&&ids.indexOf(id)===i)?ids:null;
  }
  function archetype(hero){
    const [engage,impact,tempo,map,style]=hero.vector;
    if(impact>=75)return 'guardian';
    if(map>=72&&tempo>=58)return 'farmer';
    if(engage<=28)return 'vanguard';
    if(style>=62)return 'trickster';
    if(map>=62)return 'rover';
    return 'fighter';
  }
  const votes=[
    [{value:-2,axis:'engage',bonusAxis:'tempo',bonus:-1},{value:2,axis:'engage',bonusAxis:'style',bonus:-1},{value:2,axis:'impact',bonusAxis:'map',bonus:-1},{value:2,axis:'map',bonusAxis:'style',bonus:1}],
    [{value:-2,axis:'tempo',bonusAxis:'impact',bonus:-1},{value:2,axis:'tempo',bonusAxis:'style',bonus:-1},{value:2,axis:'impact',bonusAxis:'map',bonus:-1},{value:2,axis:'map',bonusAxis:'style',bonus:1}],
    [{value:-2,axis:'engage',bonusAxis:'map',bonus:-1},{value:2,axis:'impact',bonusAxis:'engage',bonus:1},{value:-2,axis:'impact',bonusAxis:'style',bonus:1},{value:2,axis:'style',bonusAxis:'map',bonus:1}]
  ];
  function makeQuestion(hero,round,kind,prompt,texts,cue){return {id:`${hero.id}-${round}`,hero,round,kind,cue,prompt,options:texts.map((text,i)=>({text,...votes[round][i]}))}}
  function questionsFor(rawIds){
    const ids=validHeroIds(rawIds);
    if(!ids)return [];
    return ids.flatMap(id=>{
      const hero=H.hero(id),cue=Entrances.get(id).cue,type=archetypes[archetype(hero)];
      return [
        makeQuestion(hero,0,'signature',`玩${hero.name}，围绕「${cue}」的一波来了，你怎么打？`,type.signatureOptions,cue),
        makeQuestion(hero,1,'situation',`${hero.name}在场。${type.pressure}`,type.pressureOptions,cue),
        makeQuestion(hero,2,'highlight',`玩${hero.name}，${type.highlight}`,type.highlightOptions,cue)
      ];
    });
  }
  function sanitize(raw,rawIds){return questionsFor(rawIds).map((_,i)=>Array.isArray(raw)&&Number.isInteger(raw[i])&&raw[i]>=0&&raw[i]<4?raw[i]:null)}
  function distance(a,b){return a.reduce((sum,n,i)=>sum+(n-b[i])**2,0)}
  function analyze(rawIds,rawAnswers){
    const ids=validHeroIds(rawIds);
    if(!ids)return null;
    const questions=questionsFor(ids),answers=sanitize(rawAnswers,ids);
    if(answers.some(answer=>answer===null))return null;
    const scores=Object.fromEntries(axes.map(axis=>[axis.key,0]));
    questions.forEach((question,index)=>{const option=question.options[answers[index]];scores[option.axis]+=option.value;scores[option.bonusAxis]+=option.bonus});
    // Remove the average vote built into the four choices, so a random path stays near 50.
    const baseline={engage:-.75,impact:2.25,tempo:-.75,map:1.5,style:2.25};
    const dimensions=axes.map(axis=>({...axis,score:Math.max(0,Math.min(100,Math.round(50+(scores[axis.key]-baseline[axis.key])*7.5)))}));
    const vector=dimensions.map(axis=>axis.score);
    const profile=profiles.reduce((best,item)=>distance(vector,item.target)<distance(vector,best.target)?item:best,profiles[0]);
    const matches=H.heroes.map(hero=>({hero,distance:distance(vector,hero.vector)})).sort((a,b)=>a.distance-b.distance||a.hero.id-b.hero.id);
    return {profile,dimensions,matches,favorites:ids.map(id=>H.hero(id)),echoes:matches.filter(match=>!ids.includes(match.hero.id)).slice(0,3),heroCount:H.count};
  }
  function summary(result){if(!result)return '';return `我选了${result.favorites.map(hero=>hero.name).join('、')}，测出的 Dota 2 人格是「${result.profile.title}」！\n${result.profile.tagline}\n同频英雄：${result.echoes.map(match=>match.hero.name).join('、')}\n玩家创作的娱乐测试：https://crisp-shark.github.io/dota2-playstyle-quiz/`}
  return {axes,profiles,archetypes,validHeroIds,questionsFor,sanitize,analyze,summary};
});
