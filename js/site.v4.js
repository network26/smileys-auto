/* Smiley's Auto (unofficial concept) - v4 motion layer.
   Content is visible by default. Motion only runs when GSAP + ScrollTrigger loaded and
   prefers-reduced-motion is not set. On any failure the .js class is removed and everything shows. */
(function(){
'use strict';
var root=document.documentElement;
var $=function(s,r){return (r||document).querySelector(s)};
var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- basics (no GSAP needed) ---------- */
var hdr=$('#hdr'),menuBtn=$('#menuBtn'),prog=$('#prog');
menuBtn.addEventListener('click',function(){
  var o=hdr.classList.toggle('menu-open');
  menuBtn.setAttribute('aria-expanded',o?'true':'false');
});
$$('#nav a').forEach(function(a){a.addEventListener('click',function(){hdr.classList.remove('menu-open');menuBtn.setAttribute('aria-expanded','false')})});

(function(){ /* hours status (America/Chicago) */
  var parts;
  try{parts=new Intl.DateTimeFormat('en-US',{timeZone:'America/Chicago',weekday:'short',hour:'numeric',minute:'numeric',hourCycle:'h23'}).formatToParts(new Date())}catch(e){return}
  var m={};parts.forEach(function(p){m[p.type]=p.value});
  var dayMap={Sun:0,Mon:1,Tue:2,Wed:3,Thu:4,Fri:5,Sat:6};
  var d=dayMap[m.weekday],mins=(+m.hour%24)*60+(+m.minute);
  var li=$('#hoursList li[data-day="'+d+'"]');if(li)li.classList.add('today');
  var st=$('#status');
  var open=d>=1&&d<=5&&mins>=480&&mins<1080;
  st.className='status '+(open?'open':'shut');
  var next=(d===5&&mins>=1080)||d===6||d===0?'opens Monday 8 AM':(mins>=1080?'opens tomorrow 8 AM':'opens 8 AM');
  st.textContent=open?'Open now \u00b7 until 6 PM':'Closed now \u00b7 '+next;
})();

function clamp(v,a,b){return v<a?a:v>b?b:v}
var ticking=false;
function chrome(){ /* header background + top progress hairline */
  ticking=false;
  var sy=window.pageYOffset||0,max=root.scrollHeight-window.innerHeight;
  hdr.classList.toggle('solid',sy>24);
  if(!reduce)prog.style.transform='scaleX('+(max>0?clamp(sy/max,0,1):0).toFixed(4)+')';
}
addEventListener('scroll',function(){if(!ticking){ticking=true;requestAnimationFrame(chrome)}},{passive:true});
chrome();

/* ---------- motion ---------- */
function bail(){root.className=root.className.replace(/\bjs\b/,'').trim();window.__ready=true}
if(reduce){bail();return}
var gsap=window.gsap,ST=window.ScrollTrigger;
if(!gsap||!ST){bail();return}
window.__ready=true;

try{
gsap.registerPlugin(ST);
ST.config({ignoreMobileResize:true});
gsap.defaults({ease:'power3.out'});

var mm=gsap.matchMedia();
var fine=window.matchMedia('(hover:hover) and (pointer:fine)').matches;

/* count-up numbers (final text is already in the HTML) */
function counter(el,delay,trigger){
  var to=parseFloat(el.getAttribute('data-to')),dec=+(el.getAttribute('data-dec')||0),suf=el.getAttribute('data-suffix')||'';
  var o={v:0};
  function run(){
    gsap.to(o,{v:to,duration:1.8,delay:delay||0,ease:'power2.out',onUpdate:function(){el.textContent=o.v.toFixed(dec)+suf},onComplete:function(){el.textContent=to.toFixed(dec)+suf}});
  }
  el.textContent=(0).toFixed(dec)+suf;
  if(trigger)ST.create({trigger:trigger,start:'top 88%',once:true,onEnter:run});else run();
}

/* ---------- hero ---------- */
var hero=$('#hero'),heroImg=$('#heroMedia img'),heroMedia=$('#heroMedia'),heroCopy=$('#heroCopy');
gsap.set(heroImg,{transformOrigin:'60% 40%'});
var tl=gsap.timeline({defaults:{ease:'power3.out'}});
tl.fromTo(heroImg,{scale:1.22},{scale:1,duration:3.2,ease:'power2.out'},0)
  .fromTo('#hero .eyebrow',{opacity:0,y:18},{opacity:1,y:0,duration:.8},.15)
  .fromTo('#hero h1 .w>span',{yPercent:112,opacity:1},{yPercent:0,duration:1,stagger:.11,ease:'power4.out'},.25)
  .fromTo('#hero .lead',{opacity:0,y:22},{opacity:1,y:0,duration:.9},.75)
  .fromTo('#hero .cta',{opacity:0,y:22},{opacity:1,y:0,duration:.9},.9)
  .fromTo('#hero .hero-links',{opacity:0,y:18},{opacity:1,y:0,duration:.8},1.05)
  .fromTo('#hero .badge',{opacity:0,y:22},{opacity:1,y:0,duration:.9},1.15)
  .fromTo('.hero-strip',{opacity:0,y:30},{opacity:1,y:0,duration:1},1.25);
$$('#hero .badge .count').forEach(function(c){counter(c,1.3)});

/* hero parallax + copy exits as you scroll past */
gsap.fromTo(heroMedia,{yPercent:0,scale:1.04},{yPercent:14,scale:1.16,ease:'none',scrollTrigger:{trigger:hero,start:'top top',end:'bottom top',scrub:true}});
gsap.fromTo(heroCopy,{y:0,opacity:1},{y:-70,opacity:0,ease:'none',immediateRender:false,scrollTrigger:{trigger:hero,start:'top top-=40',end:'bottom 30%',scrub:true}});

/* ---------- scrubbed services strip (transform only, no pinning) ---------- */
var rowA=$('.strip-row.a .strip-track'),rowB=$('.strip-row.b .strip-track');
if(rowA&&rowB){
  var mq=$('.mq');
  gsap.fromTo(rowA,{xPercent:0},{xPercent:-42,ease:'none',scrollTrigger:{trigger:mq,start:'top bottom',end:'bottom top',scrub:.6}});
  gsap.fromTo(rowB,{xPercent:-42},{xPercent:0,ease:'none',scrollTrigger:{trigger:mq,start:'top bottom',end:'bottom top',scrub:.6}});
}

/* ---------- red spine drawn down the page ---------- */
var flow=$('#flow');
gsap.fromTo('#spineFill',{scaleY:0},{scaleY:1,ease:'none',scrollTrigger:{trigger:flow,start:'top 55%',end:'bottom 70%',scrub:.4}});

/* ---------- section headers: mask reveal ---------- */
$$('.sec-head').forEach(function(h){
  var words=$$('.w>span',h),idx=$('.idx',h),sub=$('.sub',h);
  var t=gsap.timeline({scrollTrigger:{trigger:h,start:'top 86%',toggleActions:'play none none reverse'}});
  if(idx)t.fromTo(idx,{opacity:0,x:-18},{opacity:1,x:0,duration:.7},0);
  t.fromTo(words,{yPercent:112,opacity:1},{yPercent:0,duration:.95,stagger:.08,ease:'power4.out'},.1);
  if(sub)t.fromTo(sub,{opacity:0,y:18},{opacity:1,y:0,duration:.8},.45);
});
/* contact header (not inside .sec-head) */
(function(){
  var c=$('.contact'),idx=$('.idx',c),words=$$('.contact h2 .w>span');
  var t=gsap.timeline({scrollTrigger:{trigger:c,start:'top 70%',toggleActions:'play none none reverse'}});
  t.fromTo(idx,{opacity:0,x:-18},{opacity:1,x:0,duration:.7},0)
   .fromTo(words,{yPercent:112,opacity:1},{yPercent:0,duration:.95,stagger:.08,ease:'power4.out'},.1)
   .fromTo('.contact-side',{opacity:0,y:40},{opacity:1,y:0,duration:.9},.35);
})();

/* ---------- service cards: alternate sides, slight 3D tilt, icons draw in ---------- */
$$('.grid>li').forEach(function(li,i){
  var dir=i%2?1:-1,cell=$('.cell',li),ico=$$('.ico *',li);
  var narrow=window.innerWidth<=560;
  gsap.set(li,{transformPerspective:900});
  gsap.set(ico,{strokeDasharray:1});
  var t=gsap.timeline({scrollTrigger:{trigger:li,start:'top 90%',toggleActions:'play none none reverse'}});
  t.fromTo(li,{opacity:0,x:dir*(narrow?46:70),y:30,rotationY:dir*-12,rotationX:5,transformOrigin:dir>0?'0% 50%':'100% 50%'},{opacity:1,x:0,y:0,rotationY:0,rotationX:0,duration:1,ease:'power3.out'},0)
   .fromTo(ico,{strokeDashoffset:1},{strokeDashoffset:0,duration:1.3,stagger:.07,ease:'power2.inOut'},.2);
  /* gently exit as it scrolls up past the top, re-enter when scrolling back */
  gsap.fromTo(cell,{opacity:1,y:0},{opacity:.12,y:-34,ease:'none',immediateRender:false,scrollTrigger:{trigger:li,start:'bottom 24%',end:'bottom -4%',scrub:true}});
});
$$('.cell .more').forEach(function(a){a.style.willChange='auto'});

/* ---------- Trust / Talent / Time: slide in while the red line draws across ---------- */
var tlWrap=$('#tl'),cols=$$('.tl-col'),fill=$('#tlFill');
gsap.set(fill,{scaleX:0});
gsap.to(fill,{scaleX:1,ease:'none',scrollTrigger:{trigger:tlWrap,start:'top 82%',end:'bottom 62%',scrub:.4}});
cols.forEach(function(c,i){
  var num=$('.num',c);
  var t=gsap.timeline({scrollTrigger:{trigger:c,start:'top 88%',toggleActions:'play none none reverse'}});
  t.fromTo(c,{opacity:0,x:i===1?0:(i?60:-60),y:i===1?50:0},{opacity:1,x:0,y:0,duration:1,delay:.05*i,ease:'power3.out'},0)
   .fromTo(num,{yPercent:30,opacity:0},{yPercent:0,opacity:1,duration:1.1,ease:'power3.out'},.1);
});

/* ---------- reviews counters + panel ---------- */
$$('.rev-panel .count').forEach(function(c){counter(c,0,$('.rev-panel'))});

/* ---------- map + hours panel slide up ---------- */
var vt=gsap.timeline({scrollTrigger:{trigger:'.visit-grid',start:'top 85%',toggleActions:'play none none reverse'}});
vt.fromTo('.mapbox',{opacity:0,y:90,scale:.97},{opacity:1,y:0,scale:1,duration:1.1,ease:'power3.out'},0)
  .fromTo('.info',{opacity:0,y:70},{opacity:1,y:0,duration:1,ease:'power3.out'},.15)
  .fromTo('.hours li',{opacity:0,x:24},{opacity:1,x:0,duration:.6,stagger:.06},.45);

/* ---------- generic fade-up for remaining .rv blocks (outside hero) ---------- */
$$('.rv').filter(function(el){return !el.closest('#hero')&&!el.closest('.sec-head')&&!el.closest('.contact')}).forEach(function(el){
  gsap.fromTo(el,{opacity:0,y:34},{opacity:1,y:0,duration:.95,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 90%',toggleActions:'play none none reverse'}});
});
/* ---------- gentle exits for big blocks ---------- */
$$('.sec-head.x,.tl.x,.visit-grid.x,.contact-in.x').forEach(function(el){
  gsap.fromTo(el,{opacity:1,y:0},{opacity:.15,y:-36,ease:'none',immediateRender:false,scrollTrigger:{trigger:el,start:'bottom 26%',end:'bottom -6%',scrub:true}});
});

/* ---------- desktop only: magnetic buttons ---------- */
if(fine){
  $$('.hero .btn,.contact .btn,.visit .btn,.reviews .btn,.hdr-call').forEach(function(b){
    var qx=gsap.quickTo(b,'x',{duration:.5,ease:'power3.out'}),qy=gsap.quickTo(b,'y',{duration:.5,ease:'power3.out'});
    b.addEventListener('pointermove',function(e){
      var r=b.getBoundingClientRect();
      qx((e.clientX-(r.left+r.width/2))*.22);qy((e.clientY-(r.top+r.height/2))*.3);
    });
    b.addEventListener('pointerleave',function(){qx(0);qy(0)});
  });
}

/* layout settles after webfonts/images, so recompute trigger positions */
function refresh(){ST.refresh()}
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(refresh);
addEventListener('load',function(){setTimeout(refresh,150)});
}catch(err){
  if(window.console)console.warn('motion disabled:',err);
  try{gsap.killTweensOf('*');ST.getAll().forEach(function(s){s.kill()});gsap.set('.rv,.w>span,.tl-col,.grid>li,.cell,.mapbox,.info,.hours li,.sec-head,.strip-track,#heroMedia,#heroMedia img,#heroCopy,.hero-strip',{clearProps:'all'})}catch(e2){}
  bail();
}
})();
