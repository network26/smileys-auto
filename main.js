(function(){
'use strict';
var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
var $=function(s,r){return (r||document).querySelector(s)};
var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var clamp=function(v,a,b){return Math.max(a,Math.min(b,v))};
var tpl=$('#car-tpl');

function makeCar(host){
  host.innerHTML=tpl.innerHTML;
  return {el:host,wheels:$$('.wheel',host)};
}
function spin(car,deg){car.wheels.forEach(function(w){w.style.transform='rotate('+deg+'deg)'})}

var heroCar=makeCar($('#heroCar'));
var pinCar=makeCar($('#pinCar'));
var footCar=makeCar($('#footCar'));
var miniCar=makeCar($('#pcar'));

/* speedometer ticks */
(function(){
  var g=$('#ticks'),ns='http://www.w3.org/2000/svg';
  for(var i=0;i<=14;i++){
    var a=(-135+i*(270/14))*Math.PI/180,major=i%2===0;
    var r1=major?44:48,r2=52;
    var l=document.createElementNS(ns,'line');
    l.setAttribute('x1',60+Math.sin(a)*r1);l.setAttribute('y1',60-Math.cos(a)*r1);
    l.setAttribute('x2',60+Math.sin(a)*r2);l.setAttribute('y2',60-Math.cos(a)*r2);
    l.setAttribute('stroke',i>=12?'#e5202e':'#cfd6e2');l.setAttribute('stroke-width',major?2.2:1.2);
    g.appendChild(l);
  }
})();

/* hours */
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

if(reduce){
  document.documentElement.classList.add('reduce');
  heroCar.el.style.left='46vw';
  heroCar.el.style.bottom='calc(17vh - 74px)';
  $('#pinTrack').style.transform='none';
  $('#pcar').style.display='none';
  return;
}

/* ---------- scroll-linked animation ---------- */
var vw=innerWidth,vh=innerHeight;
var slides=$$('[data-slide]').map(function(el){return {el:el,dir:el.dataset.slide==='left'?-1:1,d:parseFloat(el.dataset.d||0)}});
var hx=$$('[data-hx]').map(function(el){return {el:el,s:parseFloat(el.dataset.hx)}});
var rots=$$('[data-rot]').map(function(el){return {el:el,s:parseFloat(el.dataset.rot)}});
var tracks=$$('[data-track]');
var hero=$('.hero'),heroCopy=$('#heroCopy'),h1a=$('#h1a'),h1b=$('#h1b'),sun=$('#sun');
var hFar=$('#hillsFar'),hNear=$('#hillsNear'),poles=$('#poles'),dash=$('#dash'),hint=$('#hint');
var blades=[$('#b1'),$('#b2'),$('#b3')];
var pin=$('[data-pin]'),pinTrack=$('#pinTrack'),pinDash=$('#pinDash');
var footRoad=$('.foot-road'),footDash=$('#footDash');
var ring=$('#ring'),ringBox=$('.gauge');
var pfill=$('#pfill'),pcarEl=$('#pcar'),nav=$('#nav');
var needle=$('#needle'),mph=$('#mph'),pct=$('#pct');
var sy=scrollY,last=sy,vel=0,spd=0,intro=1,introStart=performance.now();

function onResize(){vw=innerWidth;vh=innerHeight}
addEventListener('resize',onResize,{passive:true});

function ease(p){return 1-Math.pow(1-p,3)}

function frame(now){
  sy=scrollY;
  var dy=sy-last;last=sy;
  vel+=(dy-vel)*0.25;
  var doc=document.documentElement.scrollHeight-vh;
  var prog=doc>0?clamp(sy/doc,0,1):0;

  /* intro: car drives in on load */
  var it=clamp((now-introStart)/1500,0,1);
  intro=1-ease(it);

  /* top progress */
  pfill.style.width=(prog*100)+'%';
  pcarEl.style.transform='translateX('+(prog*(vw-34))+'px)';
  nav.classList.toggle('solid',sy>60);

  /* hero */
  var hh=hero.offsetHeight-vh;
  var hp=clamp(sy/hh,0,1);
  var carW=heroCar.el.offsetWidth;
  var cx=vw*0.07+hp*(vw*1.02+carW*0.4)-intro*(vw*0.07+carW*1.2);
  var bounce=Math.sin(now/90)*(hp>0&&hp<1?1.2:0);
  heroCar.el.style.transform='translate3d('+cx+'px,'+bounce+'px,0)';
  var wheelRot=(sy*1.1)+(now*0.18*intro);
  spin(heroCar,wheelRot);
  heroCopy.style.opacity=clamp(1-(hp-0.35)*3.2,0,1);
  heroCopy.style.transform='translate3d(0,'+(-hp*90)+'px,0)';
  h1a.style.transform='translate3d('+(-hp*vw*0.55)+'px,0,0)';
  h1b.style.transform='translate3d('+(hp*vw*0.55)+'px,0,0)';
  sun.style.transform='translate3d(0,'+(hp*vh*0.28)+'px,0) scale('+(1+hp*0.25)+')';
  hFar.style.transform='translate3d('+(-hp*vw*0.06)+'px,0,0)';
  hNear.style.transform='translate3d('+(-hp*vw*0.14)+'px,0,0)';
  poles.style.backgroundPositionX=(-sy*0.9)+'px';
  dash.style.backgroundPositionX=(-sy*1.6)+'px';
  hint.style.opacity=clamp(1-hp*8,0,1);
  var br=sy*0.25;blades.forEach(function(b,i){b.style.transform='rotate('+(br*(1+i*0.2))+'deg)'});

  /* slide in/out horizontally */
  for(var i=0;i<slides.length;i++){
    var s=slides[i],r=s.el.getBoundingClientRect();
    if(r.bottom<-200||r.top>vh+200){continue}
    var p=clamp((vh*0.94-r.top-s.d*vh)/(vh*0.42),0,1),e=ease(p);
    var off=s.dir*(1-e)*Math.min(vw*0.7,700);
    s.el.style.transform='translate3d('+off+'px,0,0) rotate('+(s.dir*(1-e)*3)+'deg)';
    s.el.style.opacity=e;
  }
  /* continuous drift */
  for(i=0;i<hx.length;i++){
    var h=hx[i],rr=h.el.getBoundingClientRect();
    if(rr.bottom<-300||rr.top>vh+300)continue;
    var c=rr.top+rr.height/2-vh/2;
    h.el.style.transform=(h.el.classList.contains('bigword')?'translateY(-50%) ':'')+'translate3d('+(c*h.s)+'px,0,0)';
  }
  /* tire tracks */
  for(i=0;i<tracks.length;i++){
    var tr=tracks[i],t=tr.getBoundingClientRect();
    if(t.bottom<0||t.top>vh)continue;
    var o=(t.top-vh/2)*0.9;
    tr.style.backgroundPosition=o+'px 8px,'+(o+14)+'px 32px';
  }
  /* icons spin */
  for(i=0;i<rots.length;i++){
    var ro=rots[i];
    ro.el.style.transform='rotate('+(sy*ro.s)+'deg)';
  }

  /* pinned horizontal section */
  var pr=pin.getBoundingClientRect();
  if(pr.bottom>-100&&pr.top<vh+100){
    var pp=clamp(-pr.top/(pr.height-vh),0,1);
    var maxX=Math.max(0,pinTrack.scrollWidth-vw);
    pinTrack.style.transform='translate3d('+(-pp*maxX)+'px,0,0)';
    var pcw=pinCar.el.offsetWidth;
    pinCar.el.style.transform='translate3d('+(pp*(vw*0.82-pcw)+10)+'px,0,0)';
    spin(pinCar,pp*maxX*0.6);
    pinDash.style.backgroundPositionX=(-pp*maxX*1.2)+'px';
  }

  /* rating ring */
  var gb=ringBox.getBoundingClientRect();
  var gp=clamp((vh*0.9-gb.top)/(vh*0.6),0,1);
  ring.style.strokeDashoffset=540.4*(1-0.98*ease(gp));

  /* footer car */
  var fr=footRoad.getBoundingClientRect();
  if(fr.top<vh+50){
    var fp=clamp((vh-fr.top)/(vh*0.55),0,1);
    var fw=footCar.el.offsetWidth;
    footCar.el.style.transform='translate3d('+(vw*0.04+fp*(vw*0.9-fw))+'px,0,0)';
    spin(footCar,fp*900);
    footDash.style.backgroundPositionX=(-fp*500)+'px';
  }

  /* speedometer reacts to scroll speed */
  var target=clamp(Math.abs(vel)*3.2,0,140);
  spd+=(target-spd)*(target>spd?0.25:0.08);
  needle.style.transform='rotate('+(-135+spd/140*270)+'deg)';
  mph.textContent=Math.round(spd);
  pct.textContent=Math.round(prog*100)+'% down the road';

  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
})();
