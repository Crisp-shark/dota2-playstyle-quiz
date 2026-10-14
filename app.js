(function(){
  'use strict';
  const Quiz=window.DotaPersonality;
  const key='dota2-playstyle-quiz-v3';
  const intro=document.getElementById('intro-screen');
  const quiz=document.getElementById('quiz-screen');
  const resultScreen=document.getElementById('result-screen');
  const questionContent=document.getElementById('question-content');
  const resultContent=document.getElementById('result-content');
  const startButton=document.getElementById('start-button');
  const escape=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const choiceItems=[
    {id:'blink',name:'跳刀',action:'闪烁',glyph:'✦',color:'#9bdcff'},
    {id:'force',name:'推推棒',action:'推进',glyph:'➜',color:'#f0ae73'},
    {id:'cyclone',name:'吹风杖',action:'旋风',glyph:'⟲',color:'#9fe9e6'},
    {id:'bkb',name:'黑皇杖',action:'金色护盾',glyph:'⬡',color:'#f4d588'}
  ];
  let saved;
  try{saved=JSON.parse(localStorage.getItem(key));}catch(_){saved=null}
  let answers=Quiz.sanitize(saved&&saved.answers);
  let index=Number.isInteger(saved&&saved.index)?Math.min(Math.max(saved.index,0),Quiz.questions.length):0;
  const firstUnanswered=answers.findIndex(answer=>answer===null);
  if(firstUnanswered>=0&&index>firstUnanswered)index=firstUnanswered;
  if(firstUnanswered<0)index=Quiz.questions.length;
  let advanceTimer;

  function save(){try{localStorage.setItem(key,JSON.stringify({answers,index}))}catch(_){}}
  function show(screen){intro.hidden=screen!=='intro';quiz.hidden=screen!=='quiz';resultScreen.hidden=screen!=='result';window.scrollTo({top:0,behavior:'auto'})}
  function renderQuestion(){
    clearTimeout(advanceTimer);
    if(index>=Quiz.questions.length){renderResult();return}
    const question=Quiz.questions[index];
    const selected=answers[index];
    const progress=Math.round(answers.filter(answer=>answer!==null).length/Quiz.questions.length*100);
    questionContent.innerHTML=`<div class="question-top"><span>ROUND ${String(index+1).padStart(2,'0')} <small>/ ${Quiz.questions.length}</small></span><span>${progress}% 完成</span></div><div class="progress-track" role="progressbar" aria-label="答题进度" aria-valuenow="${progress}" aria-valuemin="0" aria-valuemax="100"><i style="width:${progress}%"></i></div><div class="quick-kicker">看战况 · 选装备</div><h3>${escape(question.prompt)}</h3><div class="question-options">${question.options.map((option,choice)=>`<button type="button" class="option${selected===choice?' selected':''}" data-choice="${choice}" aria-pressed="${selected===choice}"><b>${String.fromCharCode(65+choice)}</b><span class="item-art"><img src="./${escape(option.image)}" alt="" loading="eager" decoding="async"></span><span class="item-name">${escape(option.text)}</span><i aria-hidden="true">↗</i></button>`).join('')}</div><div class="question-bottom"><button id="previous" class="subtle-button" type="button" ${index===0?'disabled':''}>← 上一局</button><span class="question-auto" role="status" aria-live="polite">点一下，自动进入下一局</span></div><p class="key-hint">也可按数字键 1–4 快选</p>`;
    questionContent.querySelectorAll('[data-choice]').forEach(button=>button.addEventListener('click',()=>select(Number(button.dataset.choice))));
    questionContent.querySelector('#previous').addEventListener('click',()=>{if(index>0){index--;save();renderQuestion()}});
    show('quiz');
  }
  function select(choice){
    if(!Number.isInteger(choice)||choice<0||choice>3||index>=Quiz.questions.length)return;
    clearTimeout(advanceTimer);
    answers[index]=choice;
    save();
    const item=choiceItems[choice];
    const chosen=questionContent.querySelector(`[data-choice="${choice}"]`);
    questionContent.querySelectorAll('[data-choice]').forEach(button=>{
      const active=button===chosen;
      button.classList.toggle('selected',active);
      button.classList.remove('item-active');
      button.removeAttribute('data-item');
      button.style.removeProperty('--item-color');
      button.querySelector('i').textContent='↗';
      button.setAttribute('aria-pressed',String(active));
    });
    chosen.dataset.item=item.id;
    chosen.style.setProperty('--item-color',item.color);
    chosen.querySelector('i').textContent=item.glyph;
    void chosen.offsetWidth;
    chosen.classList.add('item-active');
    const status=questionContent.querySelector('.question-auto');
    status.textContent=`${Quiz.questions[index].options[choice].text} · 已选`;
    status.style.setProperty('--item-color',item.color);
    status.classList.remove('item-flash');
    void status.offsetWidth;
    status.classList.add('item-flash');
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
    const result=Quiz.analyze(answers);
    if(!result){index=Math.max(0,answers.findIndex(answer=>answer===null));renderQuestion();return}
    const profile=result.profile;
    resultContent.innerHTML=`<div class="result-top"><div><span class="section-index">02 / YOUR PLAYSTYLE</span><p class="result-kicker">你的战局称号</p><h2 id="result-heading">${escape(profile.title)}</h2><p class="result-tagline">${escape(profile.tagline)}</p></div><div class="result-stamp">ALL<br>${result.heroCount} HEROES <span>↗</span></div></div><div class="matches-heading"><span class="section-index">HERO ECHOES</span><h3>与你同频的英雄</h3><p>先点击卡片揭晓英雄；全部 ${result.heroCount} 位英雄都参与风格匹配。</p></div><div class="match-grid">${result.matches.slice(0,3).map((match,rank)=>heroCard(match,rank)).join('')}</div><div class="result-story"><div><span class="story-label">你擅长的事 / STRENGTH</span><p>${escape(profile.strength)}</p></div><div><span class="story-label">留意这一点 / WATCH OUT</span><p>${escape(profile.watch)}</p></div></div><div class="axes-heading"><div><span class="section-index">YOUR FIVE AXES</span><h3>你的对局偏好</h3></div><p>五个方向都可以随阵容与局势变化。</p></div><div class="axis-grid">${result.dimensions.map(axis=>`<div class="axis-card"><div class="axis-head"><strong>${escape(axis.name)}</strong><span>${escape(axis.score>=50?axis.right:axis.left)}</span></div><div class="axis-bar"><i style="width:${axis.score}%"></i></div><div class="axis-ends"><span>${escape(axis.left)}</span><span>${escape(axis.right)}</span></div></div>`).join('')}</div><details class="hero-atlas" id="hero-atlas"><summary><span>查看全部 ${result.heroCount} 位英雄</span><small>点击英雄查看出场动画 ↗</small></summary><div class="atlas-tools"><label for="atlas-search">搜索英雄</label><input id="atlas-search" type="search" placeholder="输入中文或英文名" autocomplete="off"><span id="atlas-count"></span></div><div class="atlas-grid" id="atlas-grid"></div></details><p class="result-disclaimer">英雄与称号只是对装备选择的趣味联想，不代表实战出装或上分推荐。</p><div class="result-actions"><button id="copy-result" type="button" class="primary-button">复制结果 <span>↗</span></button><button id="restart" type="button" class="subtle-button">重新测试 ↺</button></div><p class="copy-status" id="copy-status" role="status"></p>`;
    resultContent.querySelector('.match-grid').addEventListener('click',event=>{const card=event.target.closest('[data-reveal-index]');if(card){const rank=Number(card.dataset.revealIndex);revealHero(result.matches[rank],rank,card)}});
    resultContent.querySelector('#hero-atlas').addEventListener('toggle',event=>{if(event.target.open)renderAtlas(result.matches,resultContent.querySelector('#atlas-search').value)});
    resultContent.querySelector('#atlas-grid').addEventListener('click',event=>{const button=event.target.closest('[data-atlas-hero]');if(button){const match=result.matches.find(item=>item.hero.id===Number(button.dataset.atlasHero));if(match)revealHero(match,-1,button,true)}});
    resultContent.querySelector('#atlas-search').addEventListener('input',event=>renderAtlas(result.matches,event.target.value));
    resultContent.querySelector('#copy-result').addEventListener('click',async()=>{
      const status=resultContent.querySelector('#copy-status');
      try{await navigator.clipboard.writeText(Quiz.summary(result));status.textContent='结果已复制，可以发给队友。'}
      catch(_){status.textContent='复制失败，请检查浏览器的剪贴板权限。'}
    });
    resultContent.querySelector('#restart').addEventListener('click',()=>{answers=Quiz.sanitize(null);index=0;save();renderQuestion()});
    show('result');
  }
  startButton.addEventListener('click',renderQuestion);
  document.addEventListener('keydown',event=>{if(quiz.hidden||event.altKey||event.ctrlKey||event.metaKey||event.target.closest('input'))return;const number=Number(event.key);if(number>=1&&number<=4)select(number-1)});
  if(firstUnanswered<0)renderResult();
  else if(answers.some(answer=>answer!==null)){startButton.innerHTML='继续快选 <span>↗</span>';show('intro')}
  else show('intro');
})();
