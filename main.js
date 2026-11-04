(function(){
'use strict';
var $=function(s,r){return (r||document).querySelector(s)};
var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;

/* mobile menu */
var hdr=$('#hdr'),menuBtn=$('#menuBtn');
menuBtn.addEventListener('click',function(){
  var o=hdr.classList.toggle('menu-open');
  menuBtn.setAttribute('aria-expanded',o?'true':'false');
});
$$('#nav a').forEach(function(a){a.addEventListener('click',function(){hdr.classList.remove('menu-open');menuBtn.setAttribute('aria-expanded','false')})});

/* hours status (America/Chicago) */
(function(){
  var parts;
  try{
    parts=new Intl.DateTimeFormat('en-US',{timeZone:'America/Chicago',weekday:'short',hour:'numeric',minute:'numeric',hourCycle:'h23'}).formatToParts(new Date());
  }catch(e){return}
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

/* reveal-on-scroll (fade + slight slide) */
var rv=$$('.rv');
if(reduce||!('IntersectionObserver' in window)){
  rv.forEach(function(el){el.classList.add('in')});
}else{
  var io=new IntersectionObserver(function(es){
    es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}});
  },{threshold:.12,rootMargin:'0px 0px -6% 0px'});
  rv.forEach(function(el){io.observe(el)});
}
if(reduce){document.documentElement.classList.add('reduce');return}

/* restrained scroll effects: progress hairline, light hero parallax, one horizontal reveal */
var prog=$('#prog'),heroMedia=$('#heroMedia'),heroCopy=$('#heroCopy'),hero=$('#hero');
var tl=$('#tl'),tlFill=$('#tlFill'),cols=$$('.tl-col');
var wide=window.matchMedia('(min-width: 861px)');
var ticking=false;

function clamp(v,a,b){return v<a?a:v>b?b:v}

function update(){
  ticking=false;
  var sy=window.scrollY||0,vh=window.innerHeight,doc=document.documentElement;
  var max=doc.scrollHeight-vh;
  prog.style.transform='scaleX('+(max>0?clamp(sy/max,0,1):0)+')';
  hdr.classList.toggle('solid',sy>24);

  var hh=hero.offsetHeight;
  if(sy<hh+80){
    heroMedia.style.transform='translate3d(0,'+(sy*.16).toFixed(1)+'px,0) scale(1.06)';
    heroCopy.style.transform='translate3d(0,'+(sy*.07).toFixed(1)+'px,0)';
    heroCopy.style.opacity=clamp(1-sy/(hh*.9),0,1).toFixed(3);
  }

  if(wide.matches){
    var r=tl.getBoundingClientRect();
    var p=clamp((vh*.88-r.top)/(vh*.55),0,1);
    tlFill.style.transform='scaleX('+p.toFixed(3)+')';
    cols.forEach(function(c,i){
      var t=clamp((p-i*.28)/.44,0,1);
      var e=1-Math.pow(1-t,3);
      c.style.opacity=(.12+.88*e).toFixed(3);
      c.style.transform='translate3d('+((1-e)*-56).toFixed(1)+'px,0,0)';
    });
  }else{
    tlFill.style.transform='';
    cols.forEach(function(c){c.style.opacity='';c.style.transform=''});
  }
}
function req(){if(!ticking){ticking=true;requestAnimationFrame(update)}}
addEventListener('scroll',req,{passive:true});
addEventListener('resize',req,{passive:true});
update();
})();
