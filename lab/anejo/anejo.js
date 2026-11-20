(function(){
const CS=window.CONCEPTS||[];
const SPINE=[
{d:"Held in reserve",chips:["Añejo 5 Años","100% Espadín","$249 suggested"],rows:[["Expression","Añejo 5 Años"],["Agave","100% Espadín"],["Origin","Santiago Matatlán"],["Status","Still aging"]]},
{d:"25 Oct 2022",chips:["≈150 plants","≈1,000 L","84°F / 54°F"],rows:[["Date","25 Oct 2022"],["Place","Ruiz family fields"],["Plants","≈150 → ≈1,000 L"],["Weather","84°F / 54°F"]]},
{d:"28 Oct – 1 Nov",chips:["4 days cooking","Volcanic rock","Tahona · horse-drawn"],rows:[["Oven lit","28 Oct, around 6 am"],["Cooking","4 days, volcanic rock"],["Opened","31 Oct"],["Tahona","1 Nov, about 4 hrs"]]},
{d:"2 – 9 Nov",chips:["7 days","Wild yeast","46–57°F nights"],rows:[["Dates","2 – 9 Nov"],["Duration","7 days"],["Yeast","Wild"],["Nights","46–57°F"]]},
{d:"9 – 23 Nov",chips:["Copper stills","Barro clay seal","> 53% ABV off the still"],rows:[["Mash tested","9 Nov"],["Stills","Copper, barro seal, wood fire"],["Second distillation","23 Nov"],["Strength","> 53% ABV off the still"]]},
{d:"Dec 2022",chips:["California oak","Dec 2022","Santiago Matatlán"],rows:[["Cask","California oak"],["Laid down","Dec 2022"],["Place","Santiago Matatlán"],["Status","In oak"]]},
{d:"Today",chips:["Añejo 5 Años","Still aging","Oak · vanilla · dried fruit"],rows:[["Expected notes","Oak · vanilla · dried fruit · a whisper of smoke"],["Release","When the cask is ready"],["Time in oak","__TIO__"],["Status","Resting"]]},
{d:"By invitation",chips:["$249 suggested","One release","Reserve list"],rows:[["Suggested retail","$249"],["Release","Once, by invitation"],["Access","Reserve list"],["Status","Held in reserve"]]}
];
const ROM=["","I","II","III","IV","V","VI","VII"];
const LB=["Arrival","Harvest","Fire & stone","Fermentation","Distillation","Barrel","Resting","Reserve"];
const TL=["2022","Harvest","Oven","Ferment","Still","Dec 2022","Now","5 Años"];
const COL={steady:[175,0,97],warm:[224,160,48]};
const $=id=>document.getElementById(id);
const app=$('app'),story=$('story'),rail=$('rail'),root=document.documentElement;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
// time in oak (from 1 Dec 2022)
const a0=new Date(2022,11,1),n0=new Date();let TM=(n0.getFullYear()-a0.getFullYear())*12+n0.getMonth()-a0.getMonth();if(n0.getDate()<a0.getDate())TM--;
const TIO=Math.floor(TM/12)+" yr "+(TM%12)+" mo";
CS.forEach(c=>{if(c.id==='plate')c.map=[0,1,2,2,3,4,5,7]});
let C=CS[0],secs=[],dots=[],cur=-1,idx=0;
// map
const route=$('route'),live=$('live'),pins=$('pins'),me=$('me');
const L=route.getTotalLength();live.style.strokeDasharray=L;live.style.strokeDashoffset=L;
const pinEls=[0,.22,.45,.7,1].map(f=>{const pt=route.getPointAtLength(L*f),c=document.createElementNS('http://www.w3.org/2000/svg','circle');c.setAttribute('cx',pt.x);c.setAttribute('cy',pt.y);c.setAttribute('r',4);c.setAttribute('class','pin');pins.appendChild(c);return c});
// marigolds
const mg=$('mg');for(let i=0;i<16;i++){const u=document.createElement('u');u.style.left=(Math.random()*100)+'%';u.style.animationDelay=(-Math.random()*14)+'s';u.style.animationDuration=(10+Math.random()*10)+'s';mg.appendChild(u)}
// tick labels
function glowFor(c,i){
 const k=c.kind,n=c.arc;let col=COL.steady,a=.34;
 if(n==='steady')a=.3;
 if(n==='rise')a=[.1,.14,.2,.28,.38,.55,.5,.42][i];
 if(n==='dim'){const cs=["236,205,140","217,152,63","217,152,63","70,95,150","196,106,48","217,152,63","217,152,63","217,152,63"];return [cs[i],[.4,.36,.34,.3,.32,.24,.16,.22][i]]}
 if(n==='warm'){col=COL.warm;a=[.3,.34,.38,.38,.42,.46,.42,.4][i]}
 if(n==='spot'){return ["236,231,221",[.2,.14,.14,.14,.14,.26,.2,.26][i]]}
 if(k==='quiet')return ["255,255,255",.05];
 return [col.join(','),a];
}
function build(){
 story.innerHTML='';rail.innerHTML='';
 C.frames.forEach((f,i)=>{
  const si=(C.map||[0,1,2,3,4,5,6,7])[i],sp=SPINE[si],s=document.createElement('section');s.className='ch';s.dataset.i=i;
  let h='<div class="in">';
  h+=`<div class="num">${i===0?'No. 003':esc(sp.d)}</div><div class="ey">${i===0?esc(C.city)+' · Team '+C.team+' · '+esc(C.name):esc(LB[si])+' · '+esc(sp.d)}</div>`;
  h+=`<h2>${esc(f.h)}</h2><p class="b">${esc(f.b)}</p>`;
  h+=`<div class="chips">${sp.chips.map(x=>`<span>${esc(x)}</span>`).join('')}</div>`;
  h+=`<table class="specs">${sp.rows.map(r=>`<tr><td>${esc(r[0])}</td><td>${esc(r[1]==='__TIO__'?TIO:r[1])}</td></tr>`).join('')}</table>`;
  if(i===0)h+=`<div class="byline">${esc(C.tag)}</div><div class="status">Still aging · Held in reserve</div><div class="price"><small>Suggested retail price</small><b>$249</b></div><a class="cta" href="/reserve/#reserve-list">Join the reserve list →</a><button class="lnk" data-about>About this pitch</button><div class="cue">Scroll ↓</div>`;
  if(i===7)h+=`<div class="price"><small>Suggested retail price · Held in reserve</small><b>$249</b></div><a class="cta" href="/reserve/#reserve-list">Request an invitation →</a><div class="sig">— Chulele</div><button class="lnk" data-next>Next concept ›</button><div class="foot">Chulele Artisanal Mezcal · Santiago Matatlán, Oaxaca · Held in reserve</div>`;
  h+='</div>';s.innerHTML=h;story.appendChild(s);rail.appendChild(document.createElement('i'));
 });
 secs=[...document.querySelectorAll('.ch')];dots=[...rail.children];
 $('tlb').innerHTML=TL.map(t=>`<span>${t}</span>`).join('');
 app.dataset.kind=C.kind;$('nm').textContent=C.name;document.title=C.name+' · Chulele Añejo concepts';
 cur=-1;scrollTo(0,0);secs[0].classList.add('on');frame();
}
function frame(){
 const H=innerHeight,top=story.getBoundingClientRect().top,total=Math.max(1,story.offsetHeight-H),p=Math.max(0,Math.min(1,-top/total));
 root.style.setProperty('--p',p.toFixed(4));
 const mob=innerWidth<=760;let best=0,bd=1e9;
 secs.forEach((s,i)=>{const r=s.getBoundingClientRect(),d=Math.abs(r.top+r.height/2-(mob?H*.73:H/2));if(d<bd){bd=d;best=i}});
 if(best!==cur){cur=best;secs.forEach((s,i)=>s.classList.toggle('on',i===best));dots.forEach((d,i)=>{d.className=i===best?'on':i<best?'done':''});
  const g=glowFor(C,best);app.style.setProperty('--gc',g[0]);app.style.setProperty('--ga',g[1]);
  pinEls.forEach((el,i)=>el.classList.toggle('on',i<=Math.min(4,Math.max(0,best-1))));
  $('ref').textContent='Ref. 0'+best+' · '+LB[best];
  document.querySelectorAll('#tlb span').forEach((s,i)=>s.classList.toggle('on',i<=best));
 }
 root.style.setProperty('--rot',(p*360).toFixed(1)+'deg');
 live.style.strokeDashoffset=L*(1-p);const mp=route.getPointAtLength(L*p);me.setAttribute('cx',mp.x);me.setAttribute('cy',mp.y);
 const k=p*7,age=Math.max(0,Math.min(1,k-5)),m=Math.round(TM*age);
 $('ctv').innerHTML=Math.floor(m/12)+'<small>yr</small>'+(m%12)+'<small>mo</small>';$('ctb').style.width=(Math.min(100,m/60*100))+'%';
}
let tk=false;function req(){if(!tk){tk=true;requestAnimationFrame(()=>{tk=false;frame()})}}
addEventListener('scroll',req,{passive:true});addEventListener('resize',req);
// menu
const menu=$('menu'),about=$('about');
(function(){let h='<h2>15 concepts</h2><div class="byline">Five studio perspectives · three pitches each · same story, same 3D bottle</div>',last='';
 CS.forEach((c,i)=>{if(c.city!==last){if(last)h+='</div>';h+=`<div class="st">${esc(c.city)}</div><div class="g">`;last=c.city}
  h+=`<button class="it" data-i="${i}"><b>${i+1}. ${esc(c.name)}</b><span>${esc(c.tag)}</span></button>`});
 menu.innerHTML=h+'</div>'})();
function setC(i,push){idx=(i+CS.length)%CS.length;C=CS[idx];build();menu.classList.remove('on');about.classList.remove('on');
 menu.querySelectorAll('.it').forEach((b,j)=>b.setAttribute('aria-current',j===idx));
 if(push!==false){try{history.replaceState(null,'','#'+C.id)}catch(e){}}}
function showAbout(){const c=C;about.innerHTML=`<div class="byline">${esc(c.city)} · Team ${c.team} · Concept ${idx+1} of 15</div><h2>${esc(c.name)}</h2><p style="max-width:62ch;color:#d9d3c7">${esc(c.thesis)}</p><dl>${[["Voice",c.voice],["Look",c.look],["Bottle choreography",c.bottle],["Motion",c.motion],["On phones",c.mobile],["Build effort",c.effort+' · 3D: '+c.three],["Main risk",c.risk]].map(r=>`<div><dt>${r[0]}</dt><dd>${esc(r[1])}</dd></div>`).join('')}</dl>`;about.classList.add('on')}
document.addEventListener('click',e=>{const t=e.target.closest('button,a');if(!t)return;
 if(t.id==='nm'){menu.classList.add('on')}
 else if(t.id==='prev')setC(idx-1);else if(t.id==='next'||t.hasAttribute('data-next'))setC(idx+1);
 else if(t.id==='x'){menu.classList.remove('on');about.classList.remove('on')}
 else if(t.dataset.i!==undefined&&t.classList.contains('it'))setC(+t.dataset.i);
 else if(t.hasAttribute('data-about'))showAbout();});
addEventListener('keydown',e=>{if(e.key==='Escape'){menu.classList.remove('on');about.classList.remove('on')}});
addEventListener('hashchange',()=>{const j=CS.findIndex(c=>c.id===location.hash.slice(1));if(j>=0&&j!==idx)setC(j,false)});
const j0=CS.findIndex(c=>c.id===location.hash.slice(1));setC(j0>=0?j0:0);
})();
