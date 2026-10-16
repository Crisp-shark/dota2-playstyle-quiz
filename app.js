(function(){
  'use strict';
  const Quiz=window.DotaPersonality;
  const Heroes=window.DotaQuizHeroes;
  const key='dota2-playstyle-quiz-v5';
  const intro=document.getElementById('intro-screen');
  const picker=document.getElementById('picker-screen');
  const quiz=document.getElementById('quiz-screen');
  const resultScreen=document.getElementById('result-screen');
  const questionContent=document.getElementById('question-content');
  const resultContent=document.getElementById('result-content');
  const startButton=document.getElementById('start-button');
  const searchInput=document.getElementById('hero-search');
  const escape=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const choiceItems=[
    {id:'blink',glyph:'✦',color:'#9bdcff'},
    {id:'force',glyph:'➜',color:'#f0ae73'},
    {id:'cyclone',glyph:'⟲',color:'#9fe9e6'},
    {id:'bkb',glyph:'⬡',color:'#f4d588'}
  ];
  let saved;
  try{saved=JSON.parse(localStorage.getItem(key))}catch(_){saved=null}
  let heroIds=Array.isArray(saved?.heroIds)?saved.heroIds.filter((id,i,list)=>Number.isInteger(id)&&Heroes.hero(id)&&list.indexOf(id)===i).slice(0,3):[];
  let questions=Quiz.questionsFor(heroIds);
  let answers=Quiz.sanitize(saved?.answers,heroIds);
  let index=Number.isInteger(saved?.index)?Math.min(Math.max(saved.index,0),questions.length):0;
  if(questions.length){
    const firstUnanswered=answers.findIndex(answer=>answer===null);
    index=firstUnanswered<0?questions.length:Math.min(index,firstUnanswered);
  }
  let advanceTimer;
  function save(){try{localStorage.setItem(key,JSON.stringify({heroIds,answers,index}))}catch(_){}}
  function show(screen){intro.hidden=screen!=='intro';picker.hidden=screen!=='picker';quiz.hidden=screen!=='quiz';resultScreen.hidden=screen!=='result';window.scrollTo({top:0,behavior:'auto'})}
  function renderPicker(){
    const slots=document.getElementById('picked-heroes');
    slots.innerHTML=Array.from({length:3},(_,i)=>{
      const hero=Heroes.hero(heroIds[i]);
      return hero?`<button type="button" class="picked-slot filled" data-remove-hero="${hero.id}" aria-label="移除${escape(hero.name)}"><img src="./${escape(hero.image)}" alt=""><span><small>0${i+1} / 已选择</small><strong>${escape(hero.name)}</strong></span><b aria-hidden="true">×</b></button>`:`<div class="picked-slot empty"><span class="slot-number">0${i+1}</span><span>等待选择</span></div>`;
    }).join('');
    document.getElementById('picker-count').textContent=`${heroIds.length} / 3`;
    const begin=document.getElementById('begin-quiz');
    begin.disabled=heroIds.length!==3;
    begin.innerHTML=heroIds.length===3?'开始专属测试 <span>↗</span>':`再选 ${3-heroIds.length} 位英雄 <span>↗</span>`;
    const term=searchInput.value.trim().toLowerCase();
    const found=Heroes.heroes.filter(hero=>!term||`${hero.name} ${hero.en}`.toLowerCase().includes(term));
    document.getElementById('picker-filter-count').textContent=`${found.length} 位英雄`;
    document.getElementById('hero-picker-grid').innerHTML=found.length?found.map(hero=>{
      const active=heroIds.includes(hero.id);
      return `<button type="button" class="pick-hero${active?' is-picked':''}" data-hero-id="${hero.id}" aria-pressed="${active}" ${heroIds.length===3&&!active?'disabled':''}><img src="./${escape(hero.image)}" alt="" loading="lazy"><span><strong>${escape(hero.name)}</strong><small>${escape(hero.en)}</small></span><i aria-hidden="true">${active?'✓':'+'}</i></button>`;
    }).join(''):'<p class="picker-empty">没找到这位英雄，试试其他名字。</p>';
    if(picker.hidden)show('picker');
  }
  function toggleHero(id){
    const at=heroIds.indexOf(id);
    if(at>=0)heroIds.splice(at,1);
    else if(heroIds.length<3&&Heroes.hero(id))heroIds.push(id);
    else return;
    questions=Quiz.questionsFor(heroIds);
    answers=Quiz.sanitize(null,heroIds);
    index=0;
    save();renderPicker();
  }
  function optionHtml(option,choice,selected){
    return `<button type="button" class="option hero-option${selected===choice?' selected':''}" data-choice="${choice}" aria-pressed="${selected===choice}"><b>${String.fromCharCode(65+choice)}</b><span class="item-name">${escape(option.text)}</span><i aria-hidden="true">↗</i></button>`;
  }
  function renderQuestion(){
    clearTimeout(advanceTimer);
    if(questions.length!==9){renderPicker();return}
    if(index>=questions.length){renderResult();return}
    const question=questions[index],selected=answers[index];
    const progress=Math.round(answers.filter(answer=>answer!==null).length/questions.length*100);
    document.getElementById('quiz-party').innerHTML=heroIds.map((id,i)=>{const hero=Heroes.hero(id);return `<span class="party-hero${Math.floor(index/3)===i?' current':''}"><img src="./${escape(hero.image)}" alt=""><small>${escape(hero.name)}</small></span>`}).join('');
    questionContent.innerHTML=`<div class="question-top"><span>ROUND ${String(index+1).padStart(2,'0')} <small>/ ${questions.length}</small></span><span>${progress}% 完成</span></div><div class="progress-track" role="progressbar" aria-label="答题进度" aria-valuenow="${progress}" aria-valuemin="0" aria-valuemax="100"><i style="width:${progress}%"></i></div><div class="question-hero"><img src="./${escape(question.hero.image)}" alt="" loading="eager"><div><span class="quick-kicker">${escape(question.hero.name)} / ${index%3+1} OF 3</span><strong>${escape(question.hero.en)}</strong><small>${question.kind==='signature'?`技能意象 · ${escape(question.cue)}`:question.kind==='situation'?'对局情境':'你的高光'}</small></div></div><h3>${escape(question.prompt)}</h3><div class="question-options hero-options">${question.options.map((option,choice)=>optionHtml(option,choice,selected)).join('')}</div><div class="question-bottom"><button id="previous" class="subtle-button" type="button" ${index===0?'disabled':''}>← 上一题</button><span class="question-auto" role="status" aria-live="polite">点一下，自动进入下一题</span></div><div class="question-links"><button id="change-heroes" type="button">重选英雄</button><span>也可按数字键 1–4</span></div>`;
    questionContent.querySelectorAll('[data-choice]').forEach(button=>button.addEventListener('click',()=>select(Number(button.dataset.choice))));
    questionContent.querySelector('#previous').addEventListener('click',()=>{if(index>0){index--;save();renderQuestion()}});
    questionContent.querySelector('#change-heroes').addEventListener('click',renderPicker);
    show('quiz');
  }
  function select(choice){
    if(!Number.isInteger(choice)||choice<0||choice>3||index>=questions.length||quiz.hidden)return;
    clearTimeout(advanceTimer);
    answers[index]=choice;save();
    const item=choiceItems[choice],chosen=questionContent.querySelector(`[data-choice="${choice}"]`);
    questionContent.querySelectorAll('[data-choice]').forEach(button=>{
      const active=button===chosen;
      button.classList.toggle('selected',active);button.classList.remove('item-active');
      button.removeAttribute('data-item');button.style.removeProperty('--item-color');
      button.querySelector('i').textContent='↗';button.setAttribute('aria-pressed',String(active));
    });
    chosen.dataset.item=item.id;chosen.style.setProperty('--item-color',item.color);chosen.querySelector('i').textContent=item.glyph;
    void chosen.offsetWidth;chosen.classList.add('item-active');
    const status=questionContent.querySelector('.question-auto');
    status.textContent=`${questions[index].options[choice].text} · 已选`;status.style.setProperty('--item-color',item.color);
    status.classList.remove('item-flash');void status.offsetWidth;status.classList.add('item-flash');
    const questionIndex=index;
    advanceTimer=setTimeout(()=>{if(index===questionIndex){index++;save();renderQuestion()}},window.matchMedia('(prefers-reduced-motion: reduce)').matches?260:540);
  }
  function traits(hero){
    const byStrength=hero.vector.map((value,i)=>({value:Math.abs(value-50),label:value>=50?Quiz.axes[i].right:Quiz.axes[i].left})).sort((a,b)=>b.value-a.value);
    return byStrength.slice(0,2).map(item=>item.label);
  }
  function heroCard(match,rank,revealed=false){
    const hero=match.hero;
    const rankLabel=rank===0?'最同频':`同频 0${rank+1}`;
    if(!revealed)return `<button type="button" class="match-card match-sealed" data-reveal-index="${rank}" aria-label="揭晓第 ${rank+1} 位同频英雄"><span class="match-seal" aria-hidden="true"><span class="seal-orbit"></span><span class="seal-glyph">✧</span><span class="seal-rank">0${rank+1}</span></span><span class="match-sealed-copy"><small>HERO ECHO / 0${rank+1}</small><strong>点击揭晓</strong><span>看看谁与你并肩作战 <i>↗</i></span></span></button>`;
    return `<button type="button" class="match-card is-revealed" data-reveal-index="${rank}" aria-label="再次召唤${escape(hero.name)}"><span class="match-image"><img src="./${escape(hero.image)}" alt="" loading="lazy"><span>${rankLabel}</span></span><span class="match-copy"><strong>${escape(hero.name)}</strong><small>${escape(hero.en)}</small><span class="match-tags">${traits(hero).map(tag=>`<span>${escape(tag)}</span>`).join('')}</span><span class="match-replay">再次召唤 ↗</span></span></button>`;
  }
  function revealHero(match,rank,card,fromAtlas=false){
    const hero=match.hero;
    const effect=window.DotaHeroEntrances.get(hero.id);
    const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dialog=document.createElement('dialog');
    dialog.className='hero-reveal';
    dialog.dataset.variant=hero.id===33?'void':'arcane';
    dialog.dataset.mask=effect.mask;
    dialog.dataset.hero=String(hero.id);
    dialog.dataset.phase='gathering';
    dialog.style.setProperty('--hero-glow',effect.colors[0]);
    dialog.style.setProperty('--hero-accent',effect.colors[1]);
    dialog.setAttribute('aria-labelledby','reveal-title');
    dialog.innerHTML=`<div class="reveal-inner"><button type="button" class="reveal-close" aria-label="关闭英雄揭晓">×</button><div class="reveal-overline">${fromAtlas?'HERO ATLAS':`HERO ECHO / 0${rank+1}`}</div><div class="reveal-scene" aria-hidden="true"><div class="reveal-stars"></div><div class="reveal-disc"></div><div class="reveal-core"></div><div class="reveal-ring reveal-ring-one"></div><div class="reveal-ring reveal-ring-two"></div><div class="reveal-particles">${Array.from({length:16},(_,i)=>`<i style="--i:${i}"></i>`).join('')}</div><canvas class="reveal-canvas"></canvas><div class="reveal-portrait"><img src="./${escape(hero.image)}" alt=""></div></div><div class="reveal-loading" id="reveal-title" role="status">${escape(effect.cue)} · 正在显现</div><div class="reveal-identity" hidden><span>技能意象 / ${escape(effect.cue)}</span><h2 id="reveal-name">${escape(hero.name)}</h2><p>${escape(hero.en)} · ${traits(hero).map(escape).join(' / ')}</p><button type="button" class="reveal-done">继续查看 ↗</button></div></div>`;
    document.body.appendChild(dialog);
    let timer;
    let revealed=false;
    const finish=()=>{
      if(!dialog.open||revealed)return;
      revealed=true;
      dialog.dataset.phase='revealed';
      dialog.setAttribute('aria-labelledby','reveal-name');
      dialog.querySelector('.reveal-loading').hidden=true;
      dialog.querySelector('.reveal-identity').hidden=false;
      if(!fromAtlas)card.outerHTML=heroCard(match,rank,true);
    };
    dialog.querySelector('.reveal-close').addEventListener('click',()=>dialog.close());
    dialog.querySelector('.reveal-done').addEventListener('click',()=>dialog.close());
    dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close()});
    dialog.addEventListener('close',()=>{
      clearTimeout(timer);
      stopEffect();
      document.body.classList.remove('reveal-open');
      dialog.remove();
      if(fromAtlas)resultContent.querySelector(`[data-atlas-hero="${hero.id}"]`)?.focus();
      else resultContent.querySelector(`[data-reveal-index="${rank}"]`)?.focus();
    },{once:true});
    dialog.showModal();
    const stopEffect=window.DotaEntranceFX.start(dialog.querySelector('.reveal-canvas'),hero.id);
    document.body.classList.add('reveal-open');
    dialog.querySelector('.reveal-close').focus();
    timer=setTimeout(finish,reducedMotion?0:1720);
  }
  function renderAtlas(matches,query=''){
    const search=query.trim().toLowerCase();
    const filtered=matches.filter(match=>!search||`${match.hero.name} ${match.hero.en}`.toLowerCase().includes(search));
    const grid=resultContent.querySelector('#atlas-grid');
    const count=resultContent.querySelector('#atlas-count');
    count.textContent=`显示 ${filtered.length} / ${matches.length} 位英雄`;
    grid.innerHTML=filtered.length?filtered.map(match=>`<button type="button" class="atlas-hero" data-atlas-hero="${match.hero.id}" aria-label="查看${escape(match.hero.name)}的出场动画"><img src="./${escape(match.hero.image)}" alt="" loading="lazy"><span><strong>${escape(match.hero.name)}</strong><small>${escape(traits(match.hero)[0])} · 查看出场 ↗</small></span></button>`).join(''):'<p class="atlas-empty">没有找到这位英雄，试试其他名字。</p>';
  }
  function renderResult(){
    const result=Quiz.analyze(heroIds,answers);
    if(!result){index=Math.max(0,answers.findIndex(answer=>answer===null));renderQuestion();return}
    const profile=result.profile;
    resultContent.innerHTML=`<div class="result-top"><div><span class="section-index">03 / YOUR PERSONA</span><p class="result-kicker">你的 Dota 2 战局人格</p><h2 id="result-heading">${escape(profile.title)}</h2><p class="result-tagline">${escape(profile.tagline)}</p></div><div class="result-stamp">3 HEROES<br>9 CHOICES <span>↗</span></div></div><div class="favorite-result"><div><span class="section-index">YOUR THREE HEROES</span><h3>从这三位英雄出发</h3></div><div class="favorite-result-grid">${result.favorites.map((hero,i)=>`<div class="favorite-result-card"><img src="./${escape(hero.image)}" alt=""><span><small>0${i+1} / ${escape(window.DotaHeroEntrances.get(hero.id).cue)}</small><strong>${escape(hero.name)}</strong></span></div>`).join('')}</div></div><div class="result-story"><div><span class="story-label">你的拿手戏 / STRENGTH</span><p>${escape(profile.strength)}</p></div><div><span class="story-label">小心这一点 / WATCH OUT</span><p>${escape(profile.watch)}</p></div></div><div class="matches-heading"><span class="section-index">HERO ECHOES</span><h3>再认识 3 位同频英雄</h3><p>先点击卡片，揭晓他们的专属出场动画。</p></div><div class="match-grid">${result.echoes.map((match,rank)=>heroCard(match,rank)).join('')}</div><div class="axes-heading"><div><span class="section-index">YOUR FIVE AXES</span><h3>你的对局偏好</h3></div><p>五个方向都可以随阵容与局势变化。</p></div><div class="axis-grid">${result.dimensions.map(axis=>`<div class="axis-card"><div class="axis-head"><strong>${escape(axis.name)}</strong><span>${escape(axis.score>=50?axis.right:axis.left)}</span></div><div class="axis-bar"><i style="width:${axis.score}%"></i></div><div class="axis-ends"><span>${escape(axis.left)}</span><span>${escape(axis.right)}</span></div></div>`).join('')}</div><details class="hero-atlas" id="hero-atlas"><summary><span>查看全部 ${result.heroCount} 位英雄</span><small>点击英雄查看出场动画 ↗</small></summary><div class="atlas-tools"><label for="atlas-search">搜索英雄</label><input id="atlas-search" type="search" placeholder="输入中文或英文名" autocomplete="off"><span id="atlas-count"></span></div><div class="atlas-grid" id="atlas-grid"></div></details><p class="result-disclaimer">英雄与人格只是这 9 次选择的趣味联想，不代表心理测评或上分建议。</p><div class="result-actions"><button id="copy-result" type="button" class="primary-button">复制结果 <span>↗</span></button><button id="restart" type="button" class="subtle-button">重新选英雄 ↺</button></div><p class="copy-status" id="copy-status" role="status"></p>`;
    resultContent.querySelector('.match-grid').addEventListener('click',event=>{const card=event.target.closest('[data-reveal-index]');if(card){const rank=Number(card.dataset.revealIndex);revealHero(result.echoes[rank],rank,card)}});
    resultContent.querySelector('#hero-atlas').addEventListener('toggle',event=>{if(event.target.open)renderAtlas(result.matches,resultContent.querySelector('#atlas-search').value)});
    resultContent.querySelector('#atlas-grid').addEventListener('click',event=>{const button=event.target.closest('[data-atlas-hero]');if(button){const match=result.matches.find(item=>item.hero.id===Number(button.dataset.atlasHero));if(match)revealHero(match,-1,button,true)}});
    resultContent.querySelector('#atlas-search').addEventListener('input',event=>renderAtlas(result.matches,event.target.value));
    resultContent.querySelector('#copy-result').addEventListener('click',async()=>{
      const status=resultContent.querySelector('#copy-status');
      try{await navigator.clipboard.writeText(Quiz.summary(result));status.textContent='结果已复制，可以发给队友。'}
      catch(_){status.textContent='复制失败，请检查浏览器的剪贴板权限。'}
    });
    resultContent.querySelector('#restart').addEventListener('click',()=>{heroIds=[];questions=[];answers=[];index=0;searchInput.value='';save();renderPicker()});
    show('result');
  }
  startButton.addEventListener('click',()=>{if(questions.length===9&&index<9)renderQuestion();else renderPicker()});
  searchInput.addEventListener('input',renderPicker);
  document.getElementById('hero-picker-grid').addEventListener('click',event=>{const button=event.target.closest('[data-hero-id]');if(button)toggleHero(Number(button.dataset.heroId))});
  document.getElementById('picked-heroes').addEventListener('click',event=>{const button=event.target.closest('[data-remove-hero]');if(button)toggleHero(Number(button.dataset.removeHero))});
  document.getElementById('begin-quiz').addEventListener('click',()=>{if(heroIds.length===3){questions=Quiz.questionsFor(heroIds);answers=Quiz.sanitize(null,heroIds);index=0;save();renderQuestion()}});
  document.getElementById('picker-back').addEventListener('click',()=>show('intro'));
  document.addEventListener('keydown',event=>{if(quiz.hidden||event.altKey||event.ctrlKey||event.metaKey||event.target.closest('input'))return;const number=Number(event.key);if(number>=1&&number<=4)select(number-1)});
  if(questions.length===9&&index===9)renderResult();
  else{if(questions.length===9)startButton.innerHTML=answers.some(answer=>answer!==null)?'继续专属测试 <span>↗</span>':'开始专属测试 <span>↗</span>';show('intro')}
})();
