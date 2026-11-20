
const CH=[
{e:"The Reserve · No. 003",t:"Añejo",b:"Día de los Muertos, 2022. One harvest, one fire, one cask. Five years in oak, held in reserve in Santiago Matatlán, Oaxaca.",hero:1,g:"175,0,97",ga:.36,tilt:-8},
{e:"25 October 2022 · The harvest",t:"A field, a morning",b:"A little before 8 am, about 150 espadín plants are cut by hand in the fields of Benito Ruiz and his son Francisco, finished before the afternoon heat.",c:["≈150 plants","≈1,000 L","84°F / 54°F"],g:"236,205,140",ga:.3,tilt:-4},
{e:"28 Oct – 1 Nov · Fire and stone",t:"Four days beneath the earth",b:"The oven is lit before dawn on the 28th and covered in volcanic rock. On 31 October the soil comes off. On 1 November a horse named Isabella and Israel turn the tahona for four hours.",c:["4 days cooking","Volcanic rock","Tahona · horse-drawn"],g:"217,120,50",ga:.38,tilt:2},
{e:"2 – 9 November · Fermentation",t:"Seven wild days",b:"Cold nights, down to 46°F, stretch fermentation a little longer than usual. Marigold and cockscomb are in bloom on every altar nearby, and the wild yeast takes it all in.",c:["7 days","Wild yeast","46–57°F nights"],g:"70,95,150",ga:.3,tilt:6},
{e:"9 – 23 November · Distillation",t:"Twice through copper",b:"On the 9th, Luis Jímenez, our mezcal formulator, confirms the mash. The stills are sealed with barro clay and fired with wood. The second distillation, on the 23rd, passes 53% ABV.",c:["Copper stills","Barro clay seal","> 53% ABV off the still"],g:"200,106,48",ga:.4,tilt:9},
{e:"December 2022 · The barrel",t:"Laid in oak",b:"Part of the batch is set apart and laid into California oak in Santiago Matatlán. The joven was bottled. This was not. It has not left the barrel since.",c:["California oak","Dec 2022","Santiago Matatlán"],g:"217,152,63",ga:.34,tilt:4},
{e:"Today · Resting",t:"The barrel decides",b:"We do not release it on a schedule. Expected notes: oak, vanilla, dried fruit and a whisper of smoke. Until then it is held in reserve, the one Chulele you cannot yet taste.",c:["Añejo 5 Años","100% Espadín","Still aging"],g:"217,152,63",ga:.2,tilt:0},
{e:"The Reserve List",t:"Be there when the cask opens",b:"The añejo will release once, in a single window, by invitation. Leave your name and you will be among the first to know when the barrel is ready.",last:1,g:"175,0,97",ga:.42,tilt:0}
];
const app=document.getElementById('app'),story=document.getElementById('story'),rail=document.getElementById('rail');
CH.forEach((c,i)=>{const s=document.createElement('section');s.className='ch';s.dataset.i=i;
 let h=`<div class="ey">${c.e}</div><h2>${c.t}</h2><p>${c.b}</p>`;
 if(c.c)h+=`<div class="chips">${c.c.map(x=>`<span>${x}</span>`).join('')}</div>`;
 if(c.hero)h+=`<div class="status">Still aging · Held in reserve</div><div class="price"><small>Suggested retail price</small><b>$249</b></div><a class="cta" href="https://mezcalchulele.com/reserve/#reserve-list" target="_blank" rel="noopener">Join the reserve list →</a><div class="cue">Scroll ↓</div>`;
 if(c.last)h+=`<div class="price"><small>Suggested retail price · Held in reserve</small><b>$249</b></div><a class="cta" href="https://mezcalchulele.com/reserve/#reserve-list" target="_blank" rel="noopener">Request an invitation →</a><div class="foot">Chulele Artisanal Mezcal · Santiago Matatlán, Oaxaca · Held in reserve</div>`;
 s.innerHTML=h;story.appendChild(s);const d=document.createElement('i');rail.appendChild(d)});
const secs=[...document.querySelectorAll('.ch')],dots=[...rail.children];
// time in oak (from 1 Dec 2022, target 5 years)
(function(){const a=new Date(2022,11,1),n=new Date();let m=(n.getFullYear()-a.getFullYear())*12+n.getMonth()-a.getMonth();if(n.getDate()<a.getDate())m--;
 document.getElementById('ctv').innerHTML=`${Math.floor(m/12)}<small>yr</small>${m%12}<small>mo</small>`;document.getElementById('ctb').style.width=Math.min(100,m/60*100)+'%'})();
// map
const route=document.getElementById('route'),live=document.getElementById('live'),pins=document.getElementById('pins'),me=document.getElementById('me');
const L=route.getTotalLength();live.style.strokeDasharray=L;live.style.strokeDashoffset=L;
const pinAt=[0,.22,.45,.7,1],pinEls=pinAt.map(f=>{const pt=route.getPointAtLength(L*f),c=document.createElementNS('http://www.w3.org/2000/svg','circle');c.setAttribute('cx',pt.x);c.setAttribute('cy',pt.y);c.setAttribute('r',4);c.setAttribute('class','pin');pins.appendChild(c);return c});
let cur=-1;const root=document.documentElement;
function frame(){
 const H=innerHeight,top=story.getBoundingClientRect().top,total=story.offsetHeight-H,p=Math.max(0,Math.min(1,-top/total));
 root.style.setProperty('--p',p.toFixed(4));
 // active chapter = one whose centre is closest to viewport centre
 let best=0,bd=1e9;secs.forEach((s,i)=>{const r=s.getBoundingClientRect(),d=Math.abs(r.top+r.height/2-(innerWidth<=760?H*.72:H/2));if(d<bd){bd=d;best=i}});
 if(best!==cur){cur=best;secs.forEach((s,i)=>s.classList.toggle('on',i===best));dots.forEach((d,i)=>{d.className=i===best?'on':i<best?'done':''});
  const c=CH[best];app.style.setProperty('--gc',app.dataset.skin==='altar'?c.g:'175,0,97');app.style.setProperty('--ga',app.dataset.skin==='altar'?c.ga:(app.dataset.skin==='capsule'?.34:.3));
  pinEls.forEach((el,i)=>el.classList.toggle('on',i<=Math.min(4,Math.max(0,best-1))))}
 const k=p*(CH.length-1),i0=Math.floor(k),f=k-i0,a=CH[i0].tilt,b=(CH[Math.min(CH.length-1,i0+1)]).tilt,tilt=a+(b-a)*f;
 const skin=app.dataset.skin;
 
 app.style.setProperty('--rot',(p*360).toFixed(1)+'deg');
 app.style.setProperty('--bob',(Math.sin(p*18)*5).toFixed(1));
 live.style.strokeDashoffset=L*(1-p);const mp=route.getPointAtLength(L*p);me.setAttribute('cx',mp.x);me.setAttribute('cy',mp.y);
 document.getElementById('pbar').style.width=(p*100)+'%';
}
let tk=false;function req(){if(!tk){tk=true;requestAnimationFrame(()=>{tk=false;frame()})}}
addEventListener('scroll',req,{passive:true});addEventListener('resize',req);
document.querySelectorAll('.sw button').forEach(b=>b.addEventListener('click',()=>setSkin(b.dataset.s)));
function setSkin(s){if(!['capsule','altar','map'].includes(s))s='capsule';app.dataset.skin=s;document.querySelectorAll('.sw button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.s===s));cur=-1;try{history.replaceState(null,'','#'+s)}catch(e){}frame()}
setSkin((location.hash||'#capsule').slice(1));addEventListener('hashchange',()=>setSkin(location.hash.slice(1)));
secs[0].classList.add('on');frame();
