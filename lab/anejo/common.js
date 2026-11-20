/* Shared foundation only: pitch list, header wiring, smooth scroll, facts. Layout and interaction live in each pitch. */
(function(){
const L=[['lot','Lot Catalogue','New York'],['iris','Vault Iris','New York'],['letter','Reserve Letter','New York'],
['sheet','Contact Sheet','London'],['ruler','The Ruler','London'],['book','Plate Book','London'],
['altar','Ofrenda Altar','Mexico City'],['ruta','Ruta','Mexico City'],['candle','Candle','Mexico City'],
['editorial','Editorial','Milan'],['macro','Macro','Milan'],['mask','Type Mask','Milan'],
['dial','The Dial','Copenhagen'],['days','Days','Copenhagen'],['darkroom','Darkroom','Copenhagen']];
const id=document.body.dataset.id,i=L.findIndex(x=>x[0]===id),pv=L[(i+L.length-1)%L.length],nx=L[(i+1)%L.length];
const hd=document.createElement('header');hd.className='hd';
hd.innerHTML=`<a class="lg" href="../index.html" aria-label="All pitches"><img src="../img/logo.webp" alt="Chulele"></a><span class="pn">${L[i][2]} · ${i+1}/15 · ${L[i][1]}</span><nav><a href="${pv[0]}.html" aria-label="Previous pitch">‹</a><a class="all" href="../index.html">All 15</a><a href="${nx[0]}.html" aria-label="Next pitch">›</a></nav>`;
document.body.prepend(hd);
const g=document.createElement('div');g.className='grain';document.body.append(g);const bb=document.createElement('div');bb.className='band-bg';document.body.prepend(bb);
const a0=new Date(2022,11,1),n0=new Date();let TM=(n0.getFullYear()-a0.getFullYear())*12+n0.getMonth()-a0.getMonth();if(n0.getDate()<a0.getDate())TM--;
const DAYS=Math.floor((n0-new Date(2022,11,1))/864e5);
window.C={L,i,TM,DAYS,TIO:`${Math.floor(TM/12)} yr ${TM%12} mo`,RM:matchMedia('(prefers-reduced-motion: reduce)').matches,mob:()=>innerWidth<900,
 RES:window.__ART__?'https://mezcalchulele.com/reserve/#reserve-list':'/reserve/#reserve-list',LUX:'Premium luxury spirit · Premium luxury brand',
 words:t=>String(t).split(' ').map(w=>`<span class="w"><span>${w.replace(/&/g,'&amp;')}</span></span>`).join(' ')};
if(window.gsap){gsap.registerPlugin(ScrollTrigger);
 if(!C.RM&&window.Lenis){const lenis=new Lenis({lerp:.09,smoothWheel:true});window.lenis=lenis;lenis.on('scroll',ScrollTrigger.update);gsap.ticker.add(t=>lenis.raf(t*1000));gsap.ticker.lagSmoothing(0)}}
// documentary modal (repo build embeds Vimeo; artifact build opens vimeo.com)
document.addEventListener('click',e=>{const f=e.target.closest('[data-film]');if(!f)return;if(window.__ART__)return;e.preventDefault();let vm=document.getElementById('vm');if(!vm){vm=document.createElement('div');vm.id='vm';vm.className='vm';vm.innerHTML='<button data-close>Close</button><div class="fr"></div>';document.body.append(vm)}
 vm.querySelector('.fr').innerHTML='<iframe src="https://player.vimeo.com/video/883190665?autoplay=1&title=0&byline=0&portrait=0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen title="Chulele documentary"></iframe>';vm.hidden=false;window.lenis&&lenis.stop()});
document.addEventListener('click',e=>{if(e.target.closest('[data-close]')){const vm=document.getElementById('vm');vm.hidden=true;vm.querySelector('.fr').innerHTML='';window.lenis&&lenis.start()}});
})();
