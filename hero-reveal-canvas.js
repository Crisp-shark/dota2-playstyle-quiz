(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory(require('./hero-entrances'));
  else root.DotaEntranceFX=factory(root.DotaHeroEntrances);
})(typeof globalThis!=='undefined'?globalThis:this,function(Entrance){
  'use strict';
  const motifs=new Set('arrow beast blood chain circus dash fire frost gear gravity hammer hook impact ink laser lightning meteor mirror moon music poison portal prison quake roots rune sand shadow shield slash smoke sound spike spirit stone storm summon sun target time trap vortex wave web wing'.split(' '));
  const clamp=value=>Math.max(0,Math.min(1,value));
  const ease=value=>1-(1-clamp(value))**3;
  const rand=(seed,i)=>{let x=Math.sin(seed*127.1+i*311.7)*43758.5453;return x-Math.floor(x)};
  function stroke(ctx,points,p,width=3){
    if(points.length<2||p<=0)return;
    const lengths=points.slice(1).map((point,i)=>Math.hypot(point[0]-points[i][0],point[1]-points[i][1]));
    const total=lengths.reduce((a,b)=>a+b,0);let remaining=total*clamp(p);
    ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(...points[0]);
    for(let i=1;i<points.length&&remaining>0;i++){
      const portion=Math.min(1,remaining/lengths[i-1]);
      ctx.lineTo(points[i-1][0]+(points[i][0]-points[i-1][0])*portion,points[i-1][1]+(points[i][1]-points[i-1][1])*portion);
      remaining-=lengths[i-1];
    }
    ctx.stroke();
  }
  function ring(ctx,r,p,start=0,end=Math.PI*2,width=3){ctx.lineWidth=width;ctx.beginPath();ctx.arc(0,0,r,start,start+(end-start)*clamp(p));ctx.stroke()}
  function polygon(ctx,points,p,fill=false,width=3){
    ctx.lineWidth=width;ctx.beginPath();points.forEach((point,i)=>i?ctx.lineTo(...point):ctx.moveTo(...point));
    ctx.closePath();if(fill)ctx.fill();else{ctx.setLineDash([Math.max(1,1000*p),1000]);ctx.stroke();ctx.setLineDash([])}
  }
  function glow(ctx,color,blur=20){ctx.strokeStyle=color;ctx.fillStyle=color;ctx.shadowColor=color;ctx.shadowBlur=blur;ctx.lineCap='round';ctx.lineJoin='round'}
  function bolt(ctx,p,seed,offset=0){
    const points=[[-35+offset,-205],[-52+offset,-128],[-11+offset,-118],[-40+offset,-51],[8+offset,-65],[-18+offset,14],[23+offset,20],[0+offset,85]];
    stroke(ctx,points,p,6);
    ctx.lineWidth=2;ctx.strokeStyle='#fff';ctx.shadowBlur=13;stroke(ctx,points,p,2);
    if(p>.72){ctx.globalAlpha*=.6;stroke(ctx,[[8+offset,-65],[65+offset,-22],[45+offset,25]],(p-.72)/.28,2)}
  }
  function curved(ctx,points,p,width=3){
    const samples=[];
    for(let i=0;i<=48;i++){const t=i/48,u=1-t;samples.push([u*u*points[0][0]+2*u*t*points[1][0]+t*t*points[2][0],u*u*points[0][1]+2*u*t*points[1][1]+t*t*points[2][1]])}
    stroke(ctx,samples,p,width);
  }
  function draw(ctx,name,p,config,secondary=false){
    if(p<=0)return;
    const seed=config.id+(secondary?211:0),[main,accent]=config.colors;
    ctx.save();ctx.translate(200,200);glow(ctx,secondary?accent:main,22);ctx.globalAlpha=(secondary?.78:1)*Math.min(1,p*3);
    const q=ease(p),spin=p*Math.PI*2;
    switch(name){
      case 'lightning':bolt(ctx,q,seed);break;
      case 'storm':
        for(let i=0;i<3;i++){ctx.save();ctx.translate((i-1)*48,12*i);ctx.scale(.58,.65);bolt(ctx,clamp((p-i*.12)/.72),seed,i*7);ctx.restore()}
        ring(ctx,105*q,q,spin*.4,spin*.4+Math.PI*1.7,2);break;
      case 'vortex':case 'gravity':
        for(let j=0;j<3;j++){
          ctx.beginPath();ctx.lineWidth=name==='vortex'?5:2;
          for(let i=0;i<=110*q;i++){let t=i/110;let a=t*10+spin*(name==='vortex'?1.7:-1)+(j*2.1);let r=(name==='vortex'?150:180)*(1-t)+8;let x=Math.cos(a)*r,y=Math.sin(a)*r*.64;i?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.stroke();
        }
        if(name==='vortex'){ctx.fillStyle='#010105';ctx.beginPath();ctx.ellipse(0,0,48*q,38*q,0,0,Math.PI*2);ctx.fill()}
        break;
      case 'hook':case 'chain':
        curved(ctx,[[-205,-80],[-95,-145],[23,15]],q,name==='hook'?5:3);
        for(let i=0;i<11*q;i++){let t=i/11,x=-205+228*t,y=-80-155*t*(1-t)+95*t;ctx.save();ctx.translate(x,y);ctx.rotate(.25+t);ctx.lineWidth=2;ctx.strokeRect(-7,-4,14,8);ctx.restore()}
        if(name==='hook')stroke(ctx,[[23,15],[53,35],[63,19],[49,13]],q,7);
        break;
      case 'wave':
        for(let j=0;j<4;j++){let points=[];for(let i=0;i<=40;i++){let x=-205+i*10,y=55+j*25-85*q+Math.sin(i*.52+spin+j)*18;points.push([x,y])}stroke(ctx,points,q,5-j*.7)}
        break;
      case 'fire':
        for(let i=0;i<11;i++){let x=(i-5)*31+rand(seed,i)*12,h=(75+rand(seed,i+12)*105)*q;ctx.beginPath();ctx.moveTo(x,165);ctx.quadraticCurveTo(x-31,165-h*.5,x+5,165-h);ctx.quadraticCurveTo(x+26,165-h*.5,x+13,165);ctx.fill()}
        break;
      case 'frost':
        for(let i=0;i<8;i++){ctx.save();ctx.rotate(i*Math.PI/4);stroke(ctx,[[0,0],[0,-135*q]],1,3);for(let k=1;k<4;k++){let y=-32*k*q;stroke(ctx,[[0,y],[-16,y+17]],q,2);stroke(ctx,[[0,y],[16,y+17]],q,2)}ctx.restore()}
        break;
      case 'roots':
        for(let i=0;i<7;i++){let x=(i-3)*50;curved(ctx,[[x,205],[x-35,-20],[x*.22,-115]],q,4);curved(ctx,[[x,80],[x+56,9],[x+75,-25]],q,2)}
        break;
      case 'arrow':
        {let x=-225+275*q;stroke(ctx,[[x-80,-14],[x+33,-14]],1,5);polygon(ctx,[[x+33,-26],[x+65,-14],[x+33,-2]],1,true);stroke(ctx,[[x-58,-14],[x-80,-27]],1,2);stroke(ctx,[[x-58,-14],[x-80,0]],1,2)}
        break;
      case 'slash':
        for(let i=0;i<3;i++){let offset=(i-1)*58;stroke(ctx,[[-145+offset,140],[-80+offset,45],[55+offset,-60],[139+offset,-154]],clamp((p-i*.12)/.67),8-i)}
        break;
      case 'shield':
        for(let j=0;j<2;j++){let r=(98+j*25)*q;polygon(ctx,Array.from({length:6},(_,i)=>[Math.cos(i*Math.PI/3-Math.PI/6)*r,Math.sin(i*Math.PI/3-Math.PI/6)*r]),q,false,4-j)}
        break;
      case 'rune':case 'summon':
        ring(ctx,130*q,q,spin*.45,spin*.45+Math.PI*1.75,3);ring(ctx,86*q,q,-spin*.35,-spin*.35+Math.PI*1.75,2);
        for(let i=0;i<12;i++){let a=i*Math.PI/6+spin*.3,x=Math.cos(a)*113*q,y=Math.sin(a)*113*q;ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.fillRect(-2,-11,4,22);ctx.restore()}
        if(name==='summon')for(let i=0;i<5;i++){let x=(i-2)*55;stroke(ctx,[[x,125],[x,-100*q]],q,3)}
        break;
      case 'time':
        ring(ctx,132*q,q,-Math.PI/2,-Math.PI/2+Math.PI*2,4);
        for(let i=0;i<12;i++){let a=i*Math.PI/6-Math.PI/2;stroke(ctx,[[Math.cos(a)*110*q,Math.sin(a)*110*q],[Math.cos(a)*128*q,Math.sin(a)*128*q]],q,2)}
        stroke(ctx,[[0,0],[Math.sin(spin)*70*q,-Math.cos(spin)*70*q]],q,4);stroke(ctx,[[0,0],[Math.sin(-spin*.5)*40*q,-Math.cos(-spin*.5)*40*q]],q,3);
        break;
      case 'meteor':
        for(let i=0;i<5;i++){let x=-170+i*82+rand(seed,i)*18,y=-220+310*q-i*18;stroke(ctx,[[x-65,y-85],[x,y]],q,5);ctx.beginPath();ctx.arc(x,y,11+rand(seed,i+8)*10,0,Math.PI*2);ctx.fill()}
        break;
      case 'sand':case 'poison':case 'blood':
        for(let i=0;i<80;i++){let a=rand(seed,i)*Math.PI*2,r=(name==='blood'?120:name==='poison'?145:180)*Math.sqrt(rand(seed,i+91));let x=Math.cos(a+spin*.4)*r*q,y=Math.sin(a+spin*.4)*r*q*.72;let size=name==='sand'?1.6:name==='poison'?3.5:2.5;ctx.globalAlpha=(secondary?.7:1)*q*(.35+rand(seed,i+15)*.6);ctx.beginPath();ctx.arc(x,y,size+rand(seed,i+4)*size,0,Math.PI*2);ctx.fill()}
        if(name==='poison')ring(ctx,110*q,q,0,Math.PI*2,4);break;
      case 'web':
        for(let i=0;i<12;i++){let a=i*Math.PI/6;stroke(ctx,[[0,0],[Math.cos(a)*175*q,Math.sin(a)*175*q]],q,1.8)}
        for(let r=35;r<=175;r+=35)ring(ctx,r*q,q,0,Math.PI*2,1.4);break;
      case 'laser':
        {let y=(seed%2?0:-25),length=200*q;ctx.lineWidth=10;ctx.shadowBlur=36;stroke(ctx,[[-220,y],[-220+length*2,y]],q,10);ctx.strokeStyle='#fff';stroke(ctx,[[-220,y],[-220+length*2,y]],q,3)}break;
      case 'quake':
        for(let i=0;i<6;i++){let a=i*Math.PI/5+.15;stroke(ctx,[[0,120],[Math.cos(a)*45,135],[Math.cos(a)*125,160],[Math.cos(a)*205,194]],q,4)}
        break;
      case 'sound':case 'music':
        for(let j=0;j<4;j++){let points=[];for(let i=0;i<=45;i++){let x=-200+i*9,y=(j-1.5)*36+Math.sin(i*.55-spin+j)*18*q;points.push([x,y])}stroke(ctx,points,q,3)}
        if(name==='music')for(let i=0;i<3;i++){let x=-85+i*82,y=-75+i*18;ctx.beginPath();ctx.ellipse(x,y+42,10,6,-.3,0,Math.PI*2);ctx.fill();stroke(ctx,[[x+9,y+40],[x+9,y-18]],q,3)}break;
      case 'moon':
        ctx.lineWidth=13;ctx.beginPath();ctx.arc(0,0,110*q,-1.2,1.8);ctx.stroke();ring(ctx,146*q,q,2.7,5.2,2);break;
      case 'sun':
        ring(ctx,75*q,q,0,Math.PI*2,7);for(let i=0;i<16;i++){let a=i*Math.PI/8+spin*.15;stroke(ctx,[[Math.cos(a)*95*q,Math.sin(a)*95*q],[Math.cos(a)*165*q,Math.sin(a)*165*q]],q,4)}break;
      case 'smoke':case 'shadow':
        for(let i=0;i<18;i++){let a=rand(seed,i)*Math.PI*2,r=rand(seed,i+10)*130*q;ctx.globalAlpha=(name==='shadow'?.17:.11)*q;ctx.beginPath();ctx.arc(Math.cos(a)*r,Math.sin(a)*r,28+rand(seed,i+30)*40,0,Math.PI*2);ctx.fill()}
        if(name==='shadow')stroke(ctx,[[-165,95],[-80,-35],[0,50],[100,-130]],q,4);break;
      case 'spirit':
        for(let i=0;i<12;i++){let a=i*.55+spin*.6,r=25+i*12*q,x=Math.cos(a)*r,y=Math.sin(a)*r;ctx.globalAlpha=.25+i*.06;ctx.beginPath();ctx.arc(x,y,6+i*.55,0,Math.PI*2);ctx.fill()}
        break;
      case 'mirror':
        for(let i=0;i<3;i++){let x=(i-1)*95*q;ctx.globalAlpha=(secondary?.45:.7)*(i===1?1:.55);ctx.lineWidth=3;ctx.strokeRect(x-42,-85,84,170);stroke(ctx,[[x-25,0],[x+25,0]],q,2)}break;
      case 'gear':
        ring(ctx,98*q,q,0,Math.PI*2,5);ring(ctx,54*q,q,0,Math.PI*2,3);for(let i=0;i<16;i++){let a=i*Math.PI/8+spin*.5;ctx.save();ctx.rotate(a);ctx.fillRect(-8,-125*q,16,31*q);ctx.restore()}break;
      case 'target':
        ring(ctx,130*q,q,0,Math.PI*2,2);ring(ctx,75*q,q,0,Math.PI*2,2);stroke(ctx,[[-175*q,0],[175*q,0]],q,2);stroke(ctx,[[0,-175*q],[0,175*q]],q,2);break;
      case 'dash':
        for(let i=0;i<9;i++){let y=(i-4)*28;stroke(ctx,[[-210+rand(seed,i)*35,y],[(-50+rand(seed,i+9)*130)*q,y]],q,2+i%3)}break;
      case 'portal':
        ctx.save();ctx.rotate(spin*.15);ctx.scale(.7,1);ring(ctx,125*q,q,0,Math.PI*2,8);ring(ctx,96*q,q,Math.PI*.3,Math.PI*1.8,3);ctx.restore();break;
      case 'stone':
        for(let i=0;i<12;i++){let a=rand(seed,i)*Math.PI*2,r=(40+rand(seed,i+8)*125)*q,x=Math.cos(a)*r,y=Math.sin(a)*r;ctx.save();ctx.translate(x,y);ctx.rotate(a+spin*.3);polygon(ctx,[[-12,-11],[10,-16],[19,7],[-4,16],[-18,5]],1,true);ctx.restore()}break;
      case 'trap':
        ring(ctx,115*q,q,0,Math.PI*2,3);for(let i=0;i<10;i++){let a=i*Math.PI/5;ctx.save();ctx.rotate(a);polygon(ctx,[[-8,-112*q],[0,-145*q],[8,-112*q]],q,true);ctx.restore()}break;
      case 'spike':
        for(let i=0;i<9;i++){let x=(i-4)*42,h=(70+rand(seed,i)*110)*q;polygon(ctx,[[x-17,180],[x,180-h],[x+17,180]],q,true)}break;
      case 'beast':
        for(let i=0;i<4;i++){let o=(i-1.5)*35;curved(ctx,[[-120+o,150],[-20+o,-20],[100+o,-130]],q,7)}break;
      case 'ink':
        ctx.lineWidth=15;curved(ctx,[[-165,-125],[-28,155],[175,-60]],q,15);ctx.globalAlpha=.5;for(let i=0;i<15;i++){let x=(rand(seed,i)-.5)*240,y=(rand(seed,i+90)-.5)*220;ctx.beginPath();ctx.arc(x,y,2+rand(seed,i+20)*5,0,Math.PI*2);ctx.fill()}break;
      case 'prison':
        ring(ctx,130*q,q,0,Math.PI*2,2);for(let i=0;i<7;i++){let x=(i-3)*35;stroke(ctx,[[x,-145],[x,-145+290*q]],q,3)}break;
      case 'wing':
        for(let side of [-1,1])for(let i=0;i<6;i++){let y=-100+i*31;curved(ctx,[[0,25],[side*(80+i*7),y-45],[side*(155-i*7),y]],q,3)}break;
      case 'impact':
        for(let i=0;i<20;i++){let a=i*Math.PI/10;stroke(ctx,[[Math.cos(a)*20*q,Math.sin(a)*20*q],[Math.cos(a)*(95+rand(seed,i)*85)*q,Math.sin(a)*(95+rand(seed,i)*85)*q]],q,3+i%2)}ring(ctx,55*q,q,0,Math.PI*2,4);break;
      case 'hammer':
        ctx.save();ctx.translate(0,-170+190*q);ctx.rotate(-.45+q*.45);ctx.fillRect(-12,-80,24,128);ctx.fillRect(-67,-95,134,35);ctx.restore();ring(ctx,72*q,q,0,Math.PI*2,2);break;
      case 'circus':
        ring(ctx,127*q,q,0,Math.PI*2,4);for(let i=0;i<12;i++){let a=i*Math.PI/6+spin*.5;stroke(ctx,[[0,0],[Math.cos(a)*125*q,Math.sin(a)*125*q]],q,2)}for(let i=0;i<5;i++){let x=(i-2)*70;stroke(ctx,[[x,-190],[x*.55,-70*q]],q,3)}break;
    }
    ctx.restore();
  }
  function start(canvas,heroId){
    const config=Entrance.get(heroId);
    if(!config||!canvas||!canvas.getContext)return ()=>{};
    const ctx=canvas.getContext('2d');
    if(!ctx)return ()=>{};
    const reduced=typeof window!=='undefined'&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let frame=0,stopped=false,started=performance.now();
    function resize(){const rect=canvas.getBoundingClientRect(),dpr=Math.min(window.devicePixelRatio||1,2);canvas.width=Math.max(1,Math.round(rect.width*dpr));canvas.height=Math.max(1,Math.round(rect.height*dpr))}
    function paint(now){
      if(stopped)return;
      const t=reduced?1:clamp((now-started)/1850);
      ctx.setTransform(canvas.width/400,0,0,canvas.height/400,0,0);ctx.clearRect(0,0,400,400);
      draw(ctx,config.first,clamp(t/.6),config,false);
      draw(ctx,config.second,clamp((t-.25)/.68),config,true);
      if(t<1)frame=requestAnimationFrame(paint);
    }
    resize();window.addEventListener('resize',resize);frame=requestAnimationFrame(paint);
    return ()=>{stopped=true;cancelAnimationFrame(frame);window.removeEventListener('resize',resize)};
  }
  return {start,motifs};
});
