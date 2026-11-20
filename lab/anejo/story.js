(function(){
const ART=!!window.__ART__;
gsap.registerPlugin(ScrollTrigger);
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const IMG=n=>ART?window.IMGS[n]:`/lab/anejo/img/${n}.webp`;
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const words=t=>esc(t).split(' ').map(w=>`<span class="w"><span>${w}</span></span>`).join(' ');
const mob=()=>innerWidth<900;
const TOP=()=>mob()?Math.round(innerHeight*.37):0;
const LUX='Premium luxury spirit · Premium luxury brand';
// time in oak (from 1 Dec 2022; 5 Años = 60 months)
const a0=new Date(2022,11,1),n0=new Date();let TM=(n0.getFullYear()-a0.getFullYear())*12+n0.getMonth()-a0.getMonth();if(n0.getDate()<a0.getDate())TM--;
const TIO=`${Math.floor(TM/12)} yr ${TM%12} mo`;
const RES='/reserve/#reserve-list';
// ---------- scene templates ----------
const T={
cover:s=>`<section class="scene cover" data-fx="${s.fx||'none'}" data-c="${s.c||'175,0,97'}" data-a="${s.a||.36}"><div class="pin">
 ${s.bg?`<div class="cbg"><img src="${IMG(s.bg)}" alt=""></div>`:''}
 <div class="big" aria-hidden="true">AÑEJO</div>
 <div class="ci"><div class="eyebrow">${esc(LUX)}</div><h1 class="sr">Chulele Añejo, Día de los Muertos 2022</h1>
 <div class="kick">${esc(s.kicker)}</div><p class="lead">${esc(s.lead)}</p>
 <div class="status">Still aging · Held in reserve</div><div class="price"><small>Suggested retail price</small><b>$249</b></div>
 <a class="cta" data-cur href="${RES}">Join the reserve list →</a></div><div class="cue">Scroll</div></div></section>`,
photo:s=>`<section class="scene photo ${s.cls||''}" data-fx="${s.fx||'none'}" data-c="${s.c||'217,152,63'}" data-a="${s.a||.22}"><div class="pin">
 <div class="ph"><img src="${IMG(s.img)}" alt="${esc(s.alt||'')}" style="object-position:${s.pos||'50% 50%'}"></div><div class="ov"></div>
 <div class="tx"><div class="kick">${esc(s.kicker)}</div><h2>${words(s.title)}</h2><p class="body">${esc(s.text)}</p>
 ${s.stats?`<div class="stats">${s.stats.map(x=>`<div class="stat"><b data-n="${x.n}" data-pre="${x.pre||''}" data-suf="${x.suf||''}" data-dec="${x.dec||0}">${x.pre||''}0${x.suf||''}</b><span>${esc(x.l)}</span></div>`).join('')}</div>`:''}</div></div></section>`,
chart:s=>`<section class="scene chart" data-fx="none" data-c="217,152,63" data-a=".16"><div class="pin"><div class="tx"><div class="kick">${esc(s.kicker)}</div><h2>${words(s.title)}</h2><p class="body">${esc(s.text)}</p></div>
 <svg class="cv" viewBox="0 0 820 400" role="img" aria-label="Daily high and low temperatures from harvest to second distillation">${chartSVG()}</svg>
 <div class="cap">Source: Chulele production notes, Día de los Muertos 2022 · °F · logged days only</div></div></section>`,
gallery:s=>`<section class="scene gallery" data-fx="${s.fx||'petals'}" data-c="${s.c||'224,160,48'}" data-a=".3"><div class="pin"><div class="tx top"><div class="kick">${esc(s.kicker)}</div><h2>${words(s.title)}</h2></div>
 <div class="track">${s.items.map(it=>`<figure><img src="${IMG(it[0])}" alt="${esc(it[1])}"><figcaption>${esc(it[1])}</figcaption></figure>`).join('')}<div class="endcard"><p>${esc(s.text)}</p></div></div></div></section>`,
film:s=>`<section class="scene film" data-fx="none" data-c="175,0,97" data-a=".3"><div class="pin"><div class="ph"><img src="${IMG(s.img)}" alt=""></div><div class="ov"></div>
 <div class="tx mid"><div class="kick">${esc(s.kicker)}</div><h2>${words(s.title)}</h2>
 <a class="play" data-cur data-film href="https://vimeo.com/883190665" ${ART?'target="_blank" rel="noopener"':''} aria-label="Watch the documentary"><svg viewBox="0 0 200 200" aria-hidden="true"><defs><path id="pc" d="M100 100m-82 0a82 82 0 1 1 164 0a82 82 0 1 1 -164 0"/></defs><text><textPath href="#pc">WATCH THE STORY · THE DOCUMENTARY · WATCH THE STORY · THE DOCUMENTARY ·</textPath></text></svg><i></i></a>
 <p class="body">${esc(s.text)}</p></div></div></section>`,
people:s=>`<section class="scene people" data-fx="none" data-c="184,145,90" data-a=".2"><div class="pin"><div class="tx"><div class="kick">${esc(s.kicker)}</div><h2>${words(s.title)}</h2><p class="body">${esc(s.text)}</p>
 <div class="stats">${s.stats.map(x=>`<div class="stat"><b data-n="${x.n}" data-pre="${x.pre||''}" data-suf="${x.suf||''}">${x.pre||''}0${x.suf||''}</b><span>${esc(x.l)}</span></div>`).join('')}</div>
 <div class="maestro"><img src="${IMG('maestro')}" alt="Tomás Mendéz Hernandez"><div><b>Tomás Mendéz Hernandez</b><span>Maestro Mezcalero</span></div></div></div></div></section>`,
cask:s=>`<section class="scene cask" data-fx="embers" data-c="217,152,63" data-a=".4"><div class="pin"><div class="tx"><div class="kick">${esc(s.kicker)}</div><h2>${words(s.title)}</h2><p class="body">${esc(s.text)}</p><p class="body dim">${esc(s.text2||'')}</p><div class="chips"><span>California oak</span><span>Dec 2022</span><span>Santiago Matatlán</span></div></div>
 <svg class="dial" viewBox="-230 -230 460 460" role="img" aria-label="Five-year barrel clock from December 2022">${dialSVG()}</svg></div></section>`,
rare:s=>`<section class="scene rare" data-fx="none" data-c="184,145,90" data-a=".18"><div class="pin"><div class="num5" aria-hidden="true">5</div><div class="tx"><div class="kick">${esc(s.kicker)}</div><h2>${words(s.title)}</h2><p class="body">${esc(s.text)}</p>
 <div class="notes"><div><small>Expected in the añejo</small><ul><li>Oak</li><li>Vanilla</li><li>Dried fruit</li><li>A whisper of smoke</li></ul></div><div><small>Where it began · the joven</small><ul><li>Ripe fruit, cinnamon</li><li>Gentle smokiness</li><li>Soft citrus</li><li>Roasted plantain finish</li></ul></div></div></div></div></section>`,
invite:s=>`<section class="scene invite" data-fx="petals" data-c="175,0,97" data-a=".4"><div class="pin"><div class="tx mid"><div class="kick">${esc(s.kicker)}</div><h2>${words(s.title)}</h2><p class="body">${esc(s.text)}</p>
 <div class="price"><small>Suggested retail price · Held in reserve</small><b>$249</b></div><a class="cta mag" data-cur href="${RES}">Request an invitation →</a>
 <div class="luxe">${esc(LUX)}</div><div class="foot">Chulele Artisanal Mezcal · Santiago Matatlán, Oaxaca · Held in reserve</div></div></div></section>`
};
// ---------- svg builders ----------
function chartSVG(){
 const D=[[0,84,54,'Harvest'],[3,82,52,'Oven lit'],[4,75,54],[5,77,52],[6,79,46,'Oven opened'],[8,75,48,'Fermentation begins'],[9,75,57],[10,79,55],[11,82,57],[12,84,57],[13,79,54,'Day 7'],[15,73,61,'First distillation'],[29,79,50,'Second distillation']];
 const X=d=>40+d/29*740,Y=t=>350-(t-40)/(90-40)*300;
 const hi=D.map(d=>[X(d[0]),Y(d[1])]),lo=D.map(d=>[X(d[0]),Y(d[2])]);
 const P=a=>a.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' ');
 let g='';[40,50,60,70,80,90].forEach(t=>g+=`<line x1="40" x2="780" y1="${Y(t)}" y2="${Y(t)}" class="gl"/><text x="30" y="${Y(t)+3}" class="ax" text-anchor="end">${t}°</text>`);
 const area=P(hi)+' '+lo.slice().reverse().map(p=>'L'+p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' ')+' Z';
 let pts='',lb='';D.forEach((d,i)=>{pts+=`<circle class="pt hp" cx="${hi[i][0]}" cy="${hi[i][1]}" r="3.5"/><circle class="pt lp" cx="${lo[i][0]}" cy="${lo[i][1]}" r="3.5"/>`;
  if(d[3])lb+=`<g class="lbl"><line x1="${hi[i][0]}" x2="${hi[i][0]}" y1="${hi[i][1]-8}" y2="${hi[i][1]-26-(i%2)*14}" class="gl2"/><text x="${hi[i][0]}" y="${hi[i][1]-30-(i%2)*14}" text-anchor="${i>10?'end':i===0?'start':'middle'}" class="tg">${d[3]}</text></g>`});
 return `${g}<path d="${area}" class="area"/><path d="${P(hi)}" class="ln hl"/><path d="${P(lo)}" class="ln ll"/>${pts}${lb}<text x="790" y="${hi[hi.length-1][1]-2}" class="ax hi" >high</text><text x="790" y="${lo[lo.length-1][1]+12}" class="ax lw">low</text>`;
}
function dialSVG(){
 const R=190,C=2*Math.PI*R;let t='',y='';
 for(let i=0;i<60;i++){const a=i/60*2*Math.PI-Math.PI/2,L=i%12===0?16:6,r1=R+8,r2=R+8+L;t+=`<line class="tk${i%12===0?' yr':''}" data-i="${i}" x1="${(r1*Math.cos(a)).toFixed(1)}" y1="${(r1*Math.sin(a)).toFixed(1)}" x2="${(r2*Math.cos(a)).toFixed(1)}" y2="${(r2*Math.sin(a)).toFixed(1)}"/>`}
 ['2022','2023','2024','2025','2026','5 Años'].forEach((l,k)=>{const i=k===5?60:k*12,a=i/60*2*Math.PI-Math.PI/2,r=R+42;y+=`<text class="yl" data-y="${i}" x="${(r*Math.cos(a)).toFixed(1)}" y="${(r*Math.sin(a)+4).toFixed(1)}" text-anchor="middle">${l}</text>`});
 let rings='';for(let r=14;r<=150;r+=7)rings+=`<circle r="${r}" class="gr" style="opacity:${(.12+.5*Math.abs(Math.sin(r*.7))).toFixed(2)}"/>`;
 let st='';for(let x=-120;x<=120;x+=30)st+=`<line x1="${x}" x2="${x}" y1="-160" y2="160" class="stv"/>`;
 return `<defs><clipPath id="hd"><circle r="150"/></clipPath><radialGradient id="wd" cx="50%" cy="45%"><stop offset="0" stop-color="#2a1d10"/><stop offset="1" stop-color="#0f0a06"/></radialGradient><path id="tp" d="M0 0m-172 0a172 172 0 1 1 344 0a172 172 0 1 1 -344 0"/></defs>
 <g class="bar"><circle r="${R}" class="rem" /><circle r="${R}" class="arc" id="arc" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${C.toFixed(1)}" transform="rotate(-90)"/>${t}${y}<circle id="now" r="6" class="nowd"/></g>
 <g class="head"><circle r="152" fill="url(#wd)" stroke="#6b4a26" stroke-width="2"/><g clip-path="url(#hd)">${rings}<g class="staves">${st}</g></g><circle r="150" class="hoop"/><circle r="136" class="hoop2"/>
 <g class="spin"><text class="ring-t"><textPath href="#tp" startOffset="0">CALIFORNIA OAK · SANTIAGO MATATLÁN · DECEMBER 2022 · CALIFORNIA OAK · SANTIAGO MATATLÁN · DECEMBER 2022 ·</textPath></text></g>
 <text y="-14" text-anchor="middle" class="stamp s1">No. 003</text><text y="22" text-anchor="middle" class="stamp s2" id="tio">${TIO}</text><text y="44" text-anchor="middle" class="stamp s3">in oak</text></g>`;
}
// ---------- pitches ----------
const P={
long:{name:'The Long Rest',studio:'New York · heritage',cls:'p-long',scenes:[
 {t:'cover',kicker:'The Reserve · No. 003',lead:'Día de los Muertos, 2022. Five years in California oak. One harvest, one fire, one cask.'},
 {t:'photo',img:'harvest',pos:'50% 40%',kicker:'25 October 2022 · Santiago Matatlán',title:'It began with the harvest.',text:'Before eight in the morning, in the fields of Benito Ruiz and his son Francisco, our Maestro Mezcalero Tomás Mendéz cut about 150 espadín agave by hand, finishing before the afternoon sun.',stats:[{n:150,l:'agave plants'},{n:1000,l:'liters planned',suf:' L'},{n:84,l:'high that day',suf:'°F'}]},
 {t:'photo',img:'smoke',fx:'embers',c:'217,120,50',a:.3,kicker:'28 – 31 October',title:'Four days beneath the earth.',text:'A pit oven, lit before dawn and sealed with volcanic stone. Slow heat turned the agave caramel brown. When the soil came off on the thirty-first, the night had fallen to forty-six degrees.',stats:[{n:4,l:'days of cooking'},{n:46,l:'night low when opened',suf:'°F'}]},
 {t:'photo',img:'fibre',pos:'50% 50%',c:'184,145,90',kicker:'1 – 9 November',title:'Stone, horse and wild yeast.',text:'Israel and Isabella the horse turned the tahona for four hours. Then seven days of wild fermentation in cold nights, with marigold and cockscomb on every altar nearby.',stats:[{n:4,l:'hours on the tahona'},{n:7,l:'days fermenting'}]},
 {t:'photo',img:'juice',pos:'50% 40%',c:'200,106,48',kicker:'9 & 23 November',title:'Twice through copper.',text:'Luis Jímenez, our mezcal formulator, tested the vats on the ninth. Copper stills, sealed with barro clay and fired with wood. After the second distillation the spirit passed fifty-three percent.',stats:[{n:2,l:'distillations'},{n:53,l:'ABV off the still',pre:'>',suf:'%'}]},
 {t:'chart',kicker:'Thirty days, in degrees',title:'A month of weather, kept like a diary.',text:'Highs and lows from harvest to the second distillation, logged by hand. The cool nights of early November are why this fermentation ran long.'},
 {t:'gallery',kicker:'The week it was made',title:'The dead are the guests of honor.',text:'Oaxaca had waited three years for this celebration. This spirit was made in the middle of it.',items:[['altar','The ofrenda'],['cemetery','The panteón by night'],['dance','Celebration in the streets'],['catrina','La Catrina'],['copal','Copal smoke'],['flowers','Cempasúchil and cockscomb'],['candles','Candlelight']]},
 {t:'film',img:'pit',kicker:'The documentary',title:'Watch the story of this mezcal.',text:'From the first cut of the agave to the second distillation.'},
 {t:'people',kicker:'The center of the mezcal world',title:'Santiago Matatlán.',text:'More than anything, the flavor and aromas emanate from the Oaxacan people, who live with an energy to love and create art.',stats:[{n:10175,l:'residents · 2020 census'},{n:8000,l:'speak an indigenous language',suf:'+'},{n:80,l:'of mezcal comes from this region',pre:'>',suf:'%'}]},
 {t:'cask',kicker:'December 2022 · California oak',title:'Then it was set apart.',text:'After the joven was bottled, a portion of the batch was drawn off and laid into California oak in Santiago Matatlán. It has not left the barrel since.',text2:'We do not release it on a schedule. The barrel decides.'},
 {t:'rare',kicker:'Five years',title:'Most mezcal is bottled young. This one waited.',text:'Held in reserve, the one Chulele you cannot yet taste. It will release once, in a single window.'},
 {t:'invite',kicker:'The Reserve List',title:'Be there when the cask opens.',text:'The añejo will release once, by invitation. Leave your name and be among the first to know when the barrel is ready.'}]},
ofrenda:{name:'Ofrenda',studio:'Mexico City · ritual',cls:'p-ofr',scenes:[
 {t:'cover',bg:'cemetery',fx:'petals',c:'224,160,48',a:.38,kicker:'The Reserve · No. 003',lead:'Made in the week the dead return. Resting in oak ever since.'},
 {t:'gallery',kicker:'Oaxaca · Día de los Muertos 2022',title:'The dead are the guests of honor.',text:'Three years of waiting. Then the streets filled, and this spirit was made in the middle of it.',items:[['altar','The ofrenda'],['cemetery','The panteón by night'],['candles','Candlelight'],['dance','Celebration in the streets'],['catrina','La Catrina'],['copal','Copal smoke'],['flowers','Cempasúchil and cockscomb']]},
 {t:'photo',img:'harvest',pos:'50% 40%',c:'236,205,140',kicker:'Offering I · The field',title:'Agave, cut by hand.',text:'25 October 2022, before eight in the morning. About 150 espadín plants from the fields of Benito Ruiz and his son Francisco.',stats:[{n:150,l:'plants'},{n:84,l:'degrees',suf:'°F'}]},
 {t:'photo',img:'smoke',fx:'embers',c:'217,120,50',kicker:'Offering II · The fire',title:'Four days of earth and smoke.',text:'Volcanic stone, a pit oven, and a fire lit before dawn on the twenty-eighth. The agave came out the color of caramel.',stats:[{n:4,l:'days'}]},
 {t:'photo',img:'flowers',pos:'50% 60%',fx:'petals',c:'224,160,48',kicker:'Offering III · The flowers',title:'Marigold in the air.',text:'Seven days of wild fermentation, 2 to 9 November, while marigold and cockscomb dressed every altar nearby. The yeast took it all in.',stats:[{n:7,l:'days'}]},
 {t:'photo',img:'juice',pos:'50% 40%',c:'200,106,48',kicker:'Offering IV · The copper',title:'Twice through copper.',text:'Stills sealed with barro clay and fired with wood. The second distillation, on 23 November, passed fifty-three percent.',stats:[{n:2,l:'distillations'}]},
 {t:'film',img:'pit',kicker:'The documentary',title:'Watch the story of this mezcal.',text:'The people, the land and the week it was made.'},
 {t:'cask',kicker:'The last offering · December 2022',title:'And then, oak.',text:'A portion of the batch was set apart and laid into California oak in Santiago Matatlán. It is there tonight.',text2:'The barrel decides.'},
 {t:'rare',kicker:'Five years',title:'It will be worth the wait.',text:'Held in reserve. Released once, by invitation.'},
 {t:'invite',kicker:'The Reserve List',title:'Leave your name at the altar.',text:'Be among the first to know when the cask opens.'}]},
silence:{name:'Silence in Oak',studio:'Copenhagen · restraint',cls:'p-sil mono',scenes:[
 {t:'cover',c:'255,255,255',a:.1,kicker:'The Reserve · No. 003',lead:'Five years in California oak. Held in reserve.'},
 {t:'photo',img:'jima',pos:'50% 35%',c:'255,255,255',a:.08,kicker:'25 October 2022',title:'Field.',text:'About 150 agave, cut by hand in Santiago Matatlán.',stats:[{n:150,l:'plants'}]},
 {t:'photo',img:'smoke',fx:'none',c:'255,255,255',a:.08,kicker:'28 – 31 October',title:'Fire.',text:'Four days beneath volcanic stone.',stats:[{n:4,l:'days'}]},
 {t:'photo',img:'juice',pos:'50% 40%',c:'255,255,255',a:.08,kicker:'2 – 23 November',title:'Copper.',text:'Seven wild days. Two distillations. Above fifty-three percent.',stats:[{n:7,l:'days'},{n:2,l:'distillations'}]},
 {t:'film',img:'cook',kicker:'The documentary',title:'The story.',text:'Watch how it was made.'},
 {t:'cask',kicker:'December 2022',title:'Oak.',text:'California oak, Santiago Matatlán. It has not left the barrel.',text2:''},
 {t:'rare',kicker:'Time',title:'Most mezcal is bottled young. This waited.',text:'Held in reserve.'},
 {t:'invite',kicker:'The Reserve List',title:'When it is ready.',text:'One release, by invitation.'}]}
};
// ---------- engine ----------
const app=$('#app'),sc=$('#scenes');let cur='long',lenis=null,mm=null,fxMode='none';
function setTop(){document.documentElement.style.setProperty('--top',TOP()+'px');document.documentElement.style.setProperty('--vh',innerHeight+'px')}
function build(k){
 cur=k;const p=P[k];
 ScrollTrigger.getAll().forEach(s=>s.kill());gsap.killTweensOf('*');
 sc.innerHTML=p.scenes.map(s=>T[s.t](s)).join('');app.className='app '+p.cls;
 $$('.sw button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.k===k));$('#studio').textContent=p.studio;
 document.title=p.name+' · Chulele Añejo';try{history.replaceState(null,'','#'+k)}catch(e){}
 scrollTo(0,0);setTop();if(RM){$$('.w>span').forEach(s=>s.style.transform='none');return}
 mm&&mm.revert();mm=gsap.matchMedia();
 mm.add('(min-width:0px)',()=>{init()});
 requestAnimationFrame(()=>ScrollTrigger.refresh());
}
function stageColor(c,a){const [r,g,b]=c.split(',');app.style.setProperty('--gr',r);app.style.setProperty('--gg',g);app.style.setProperty('--gb',b);app.style.setProperty('--ga',a);const bx=document.getElementById('bottle');if(bx)bx.style.setProperty('--b3d-glow',c)}
function pinTL(sc,len,extra){const pin=$('.pin',sc);return gsap.timeline({defaults:{ease:'none'},scrollTrigger:{trigger:sc,start:()=>`top top+=${TOP()}`,end:()=>`+=${len()}`,pin,scrub:.7,anticipatePin:1,invalidateOnRefresh:true,onToggle:s=>{if(s.isActive){stageColor(sc.dataset.c,sc.dataset.a);fxMode=sc.dataset.fx||'none'}}}})}
function counters(tl,sc,at){$$('.stat b',sc).forEach((b,i)=>{const n=+b.dataset.n,pre=b.dataset.pre||'',suf=b.dataset.suf||'',o={v:0};tl.to(o,{v:n,duration:.35,onUpdate(){b.textContent=pre+Math.round(o.v).toLocaleString('en-US')+suf}},at+i*.06)})}
function init(){
 const H=()=>innerHeight-TOP();
 $$('.scene').forEach((s,idx)=>{
  const k=s.classList[1];
  if(k==='cover'){
   const tl=pinTL(s,()=>H()*1.3);
   tl.fromTo('.big',{scale:1,opacity:1},{scale:1.35,opacity:.0,duration:.6},0)
     .fromTo('.cbg',{opacity:.55,scale:1},{opacity:0,scale:1.15,duration:.7},0)
     .fromTo('.ci',{opacity:0,y:40},{opacity:1,y:0,duration:.35},.55).to('.cue',{opacity:0,duration:.1},0.05);
   if(!mob())tl.fromTo('.b3d',{x:()=>innerWidth*.3},{x:0,duration:.7},0);
   gsap.fromTo('.big',{letterSpacing:'.02em'},{letterSpacing:'.12em',ease:'none',scrollTrigger:{trigger:s,start:'top top',end:'+=60%',scrub:.7}});
  }else if(k==='photo'){
   const tl=pinTL(s,()=>H()*1.5);
   tl.fromTo($('.ph img',s),{scale:1.22,yPercent:-4},{scale:1.04,yPercent:5,duration:1},0)
     .fromTo($('.ph',s),{clipPath:'inset(0 0 0 14%)'},{clipPath:'inset(0 0 0 0%)',duration:.25},0)
     .fromTo($$('.w>span',s),{yPercent:115},{yPercent:0,stagger:.025,duration:.22},.05)
     .fromTo([$('.kick',s),$('.body',s)],{opacity:0,y:26},{opacity:1,y:0,stagger:.1,duration:.2},.1)
     .fromTo($('.stats',s)||[],{opacity:0,y:20},{opacity:1,y:0,duration:.2},.3);
   counters(tl,s,.32);
   tl.to($('.tx',s),{opacity:0,y:-30,duration:.18},.86);
  }else if(k==='chart'){
   const tl=pinTL(s,()=>H()*1.6);
   tl.fromTo($$('.w>span',s),{yPercent:115},{yPercent:0,stagger:.03,duration:.2},0).fromTo([$('.kick',s),$('.body',s)],{opacity:0,y:20},{opacity:1,y:0,stagger:.1,duration:.2},.05);
   $$('.ln',s).forEach(l=>{const L=l.getTotalLength();gsap.set(l,{strokeDasharray:L,strokeDashoffset:L});tl.to(l,{strokeDashoffset:0,duration:.6},.15)});
   tl.fromTo($('.area',s),{opacity:0},{opacity:1,duration:.4},.4);
   tl.fromTo($$('.pt',s),{opacity:0,scale:0,transformOrigin:'center'},{opacity:1,scale:1,stagger:.012,duration:.08},.2);
   tl.fromTo($$('.lbl',s),{opacity:0,y:8},{opacity:1,y:0,stagger:.05,duration:.1},.25);
  }else if(k==='gallery'){
   const track=$('.track',s);
   const tl=pinTL(s,()=>Math.max(900,track.scrollWidth-innerWidth*(mob()?1:.55)+innerHeight*.4));
   tl.fromTo($$('.w>span',s),{yPercent:115},{yPercent:0,stagger:.03,duration:.06},0).fromTo($('.kick',s),{opacity:0},{opacity:1,duration:.05},0);
   tl.fromTo(track,{x:0},{x:()=>-(track.scrollWidth-innerWidth*(mob()?.9:.6)),duration:1},.04);
   $$('figure img',s).forEach(im=>tl.fromTo(im,{scale:1.2},{scale:1.02,duration:1},.04));
  }else if(k==='film'){
   const tl=pinTL(s,()=>H()*1.1);
   tl.fromTo($('.ph img',s),{scale:1.25},{scale:1.02,duration:1},0).fromTo($$('.w>span',s),{yPercent:115},{yPercent:0,stagger:.03,duration:.2},.05)
     .fromTo($('.play',s),{scale:.6,opacity:0,rotate:-40},{scale:1,opacity:1,rotate:0,duration:.35},.1).fromTo([$('.kick',s),$('.body',s)],{opacity:0,y:20},{opacity:1,y:0,stagger:.1,duration:.2},.15);
  }else if(k==='people'){
   const tl=pinTL(s,()=>H()*1.3);
   tl.fromTo($$('.w>span',s),{yPercent:115},{yPercent:0,stagger:.03,duration:.2},0).fromTo([$('.kick',s),$('.body',s),$('.stats',s),$('.maestro',s)],{opacity:0,y:24},{opacity:1,y:0,stagger:.12,duration:.2},.05);counters(tl,s,.25);
  }else if(k==='cask'){
   const tl=pinTL(s,()=>H()*1.8),arc=$('#arc',s),C=+arc.getAttribute('stroke-dasharray'),f=Math.min(1,TM/60);
   tl.fromTo($$('.w>span',s),{yPercent:115},{yPercent:0,stagger:.03,duration:.15},0).fromTo([$('.kick',s),$$('.body',s),$('.chips',s)].flat(),{opacity:0,y:22},{opacity:1,y:0,stagger:.08,duration:.15},.05)
     .fromTo($('.dial',s),{opacity:0,scale:.86,rotate:-25},{opacity:1,scale:1,rotate:0,duration:.3},0);
   const o={p:0};tl.to(o,{p:f,duration:.7,onUpdate(){arc.style.strokeDashoffset=C*(1-o.p);const a=o.p*2*Math.PI-Math.PI/2;const nd=$('#now',s);nd.setAttribute('cx',190*Math.cos(a));nd.setAttribute('cy',190*Math.sin(a));
     $$('.tk',s).forEach(t=>t.classList.toggle('on',+t.dataset.i<=o.p*60));$$('.yl',s).forEach(t=>t.classList.toggle('on',+t.dataset.y<=o.p*60+.5))}},.15);
   gsap.fromTo($('.head',s),{rotate:-8},{rotate:8,ease:'none',scrollTrigger:{trigger:s,start:'top bottom',end:'bottom top',scrub:.6}});
  }else if(k==='rare'){
   const tl=pinTL(s,()=>H()*1.3);
   tl.fromTo('.num5',{scale:.7,opacity:0},{scale:1,opacity:.22,duration:.4},0).fromTo($$('.w>span',s),{yPercent:115},{yPercent:0,stagger:.03,duration:.2},.05).fromTo([$('.kick',s),$('.body',s)],{opacity:0,y:20},{opacity:1,y:0,stagger:.1,duration:.2},.08)
     .fromTo($$('.notes li',s),{opacity:0,x:-14},{opacity:1,x:0,stagger:.05,duration:.08},.3);
  }else if(k==='invite'){
   const tl=pinTL(s,()=>H()*.9);
   tl.fromTo($$('.w>span',s),{yPercent:115},{yPercent:0,stagger:.03,duration:.3},0).fromTo($$('.tx>*:not(h2)',s),{opacity:0,y:24},{opacity:1,y:0,stagger:.08,duration:.2},.1);
  }
 });
 // light/mag cta
 if(matchMedia('(pointer:fine)').matches)$$('.mag,.cta').forEach(b=>{b.addEventListener('mousemove',e=>{const r=b.getBoundingClientRect();gsap.to(b,{x:(e.clientX-r.left-r.width/2)*.18,y:(e.clientY-r.top-r.height/2)*.3,duration:.3})});b.addEventListener('mouseleave',()=>gsap.to(b,{x:0,y:0,duration:.5,ease:'elastic.out(1,.4)'}))});
 // header progress
 gsap.to('#pbar',{scaleX:1,ease:'none',scrollTrigger:{trigger:document.body,start:'top top',end:'bottom bottom',scrub:.2}});
}
// ---------- fx canvas ----------
const cv=$('#fx'),cx=cv.getContext('2d');let parts=[],W=0,Hh=0;
function rs(){const d=Math.min(devicePixelRatio||1,2);W=cv.width=innerWidth*d;Hh=cv.height=innerHeight*d;cv.style.width=innerWidth+'px';cv.style.height=innerHeight+'px'}
function mk(m){const d=Math.min(devicePixelRatio||1,2);return m==='petals'?{x:Math.random()*W,y:-20*d,vx:(Math.random()-.5)*.5*d,vy:(.6+Math.random()*.9)*d,r:(4+Math.random()*5)*d,a:Math.random()*6,va:(Math.random()-.5)*.03,c:['#e0a030','#f0b84a','#d4801c','#c9651a'][Math.random()*4|0],o:.35+Math.random()*.4,m}:{x:Math.random()*W,y:Hh+10*d,vx:(Math.random()-.5)*.4*d,vy:-(.5+Math.random()*1.1)*d,r:(1+Math.random()*2.2)*d,a:0,va:0,c:['#ffb347','#ff8c2b','#ffd27a'][Math.random()*3|0],o:.2+Math.random()*.6,m}}
function loop(){requestAnimationFrame(loop);cx.clearRect(0,0,W,Hh);if(fxMode==='none'&&!parts.length)return;
 if(fxMode!=='none'&&parts.length<(RM?0:70)&&Math.random()<.5)parts.push(mk(fxMode));
 parts=parts.filter(p=>p.y>-40&&p.y<Hh+40);
 parts.forEach(p=>{p.x+=p.vx+Math.sin(p.y*.01+p.a)*.4;p.y+=p.vy;p.a+=p.va;cx.globalAlpha=p.o*(p.m==='embers'?Math.min(1,(p.y/Hh)+.2):1);cx.fillStyle=p.c;cx.beginPath();if(p.m==='petals')cx.ellipse(p.x,p.y,p.r,p.r*.55,p.a,0,6.283);else cx.arc(p.x,p.y,p.r,0,6.283);cx.fill()});
 if(fxMode==='none')parts=parts.slice(1)}
rs();addEventListener('resize',()=>{rs();setTop();ScrollTrigger.refresh()});loop();
// cursor
const cur_=$('#cur');if(matchMedia('(pointer:fine)').matches){let tx=0,ty=0,x=0,y=0;addEventListener('mousemove',e=>{tx=e.clientX;ty=e.clientY});gsap.ticker.add(()=>{x+=(tx-x)*.18;y+=(ty-y)*.18;cur_.style.transform=`translate(${x}px,${y}px)`});document.addEventListener('mouseover',e=>cur_.classList.toggle('big',!!e.target.closest('[data-cur]')))}else cur_.remove();
// modal
const vm=$('#vm');function openFilm(){if(ART)return;vm.querySelector('.fr').innerHTML='<iframe src="https://player.vimeo.com/video/883190665?autoplay=1&title=0&byline=0&portrait=0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen title="Chulele documentary"></iframe>';vm.hidden=false;lenis&&lenis.stop()}
function closeFilm(){vm.hidden=true;vm.querySelector('.fr').innerHTML='';lenis&&lenis.start()}
document.addEventListener('click',e=>{const f=e.target.closest('[data-film]');if(f&&!ART){e.preventDefault();openFilm()}if(e.target.closest('[data-close]'))closeFilm();const b=e.target.closest('.sw button');if(b)build(b.dataset.k)});
addEventListener('keydown',e=>{if(e.key==='Escape'&&!vm.hidden)closeFilm()});
// smooth scroll
if(!RM&&window.Lenis){lenis=new Lenis({lerp:.09,smoothWheel:true});lenis.on('scroll',ScrollTrigger.update);gsap.ticker.add(t=>lenis.raf(t*1000));gsap.ticker.lagSmoothing(0)}
const k0=(location.hash||'').slice(1);build(P[k0]?k0:'long');
})();
