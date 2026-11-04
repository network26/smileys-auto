(function(){
'use strict';
var $=function(s,r){return (r||document).querySelector(s)};
var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var NS='http://www.w3.org/2000/svg';
var html=document.documentElement;
var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
var HAS=!!(window.gsap&&window.ScrollTrigger);
var ANIM=HAS&&!reduce;
if(!ANIM)html.classList.remove('js');
window.__ready=1;
if(HAS)gsap.registerPlugin(ScrollTrigger);
function clamp(v,a,b){return v<a?a:v>b?b:v}
function lerp(a,b,t){return a+(b-a)*t}
function ease(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2}
function f1(n){return (Math.round(n*100)/100).toString()}
function el(n,a,p){var e=document.createElementNS(NS,n);for(var k in a)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e}

/* ---------- mobile menu ---------- */
var hdr=$('#hdr'),menuBtn=$('#menuBtn');
menuBtn.addEventListener('click',function(){
  var o=hdr.classList.toggle('menu-open');
  menuBtn.setAttribute('aria-expanded',o?'true':'false');
});
$$('#nav a').forEach(function(a){a.addEventListener('click',function(){hdr.classList.remove('menu-open');menuBtn.setAttribute('aria-expanded','false')})});

/* ---------- hours status (America/Chicago) ---------- */
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

/* ---------- reveal on scroll (.rv, .srow) ---------- */
var drawDiag=function(){};
(function(){
  var items=$$('.rv,.srow');
  if(!ANIM||!('IntersectionObserver' in window)){items.forEach(function(e){e.classList.add('in')});return}
  var io=new IntersectionObserver(function(es){
    es.forEach(function(e){
      if(e.isIntersecting){
        e.target.classList.add('in');
        if(e.target.classList.contains('srow'))drawDiag(e.target);
        io.unobserve(e.target);
      }
    });
  },{threshold:.12,rootMargin:'0px 0px -6% 0px'});
  items.forEach(function(e){io.observe(e)});
})();

/* ---------- part library helpers ---------- */
$$('#lib path,#lib circle,#lib rect,#lib ellipse').forEach(function(e){e.setAttribute('pathLength','1')});
var CENTER={wheelR:[170,330],wheelF:[830,330],brakeR:[170,330],brakeF:[830,330]};
function useMk(k,extra){
  if(k==='wheelR'||k==='wheelF')return '<use href="#wheel-c" transform="translate('+CENTER[k][0]+' '+CENTER[k][1]+')"'+(extra||'')+'/>';
  if(k==='brakeR'||k==='brakeF')return '<use href="#brake-c" transform="translate('+CENTER[k][0]+' '+CENTER[k][1]+')"/>';
  return '<use href="#pt-'+k+'"/>';
}
var BBC={};
function bbox(k){
  if(BBC[k])return BBC[k];
  var s=el('svg',{width:10,height:10,viewBox:'0 0 10 10'});
  s.style.cssText='position:absolute;left:-99px;top:0;visibility:hidden';
  var g=el('g',{});g.innerHTML=useMk(k);
  s.appendChild(g);document.body.appendChild(s);
  var b=g.getBBox();document.body.removeChild(s);
  return (BBC[k]={x:b.x,y:b.y,w:b.width,h:b.height});
}
function fit(svg){
  var vb=svg.viewBox.baseVal;if(!vb||!vb.width)return;
  var r=svg.getBoundingClientRect();if(!r.width)return;
  var sc=r.height>0?Math.min(r.width/vb.width,r.height/vb.height):r.width/vb.width;
  svg.style.setProperty('--sw',f1(1.5/sc));
}
function finish(els){els.forEach(function(e){e.classList.add('done')})}
function drawIn(els,opts){
  opts=opts||{};
  if(!ANIM||!els.length){finish(els);return}
  gsap.fromTo(els,{'--o':1.03,'--a':0},{'--o':0,'--a':1,duration:opts.dur||1.5,ease:'power2.inOut',stagger:opts.stagger||.06,delay:opts.delay||0,
    onComplete:function(){finish(els)}});
}

/* ---------- hero drawing ---------- */
(function(){
  var svg=$('#heroSvg');if(!svg)return;
  fit(svg);
  var dr=$$('.dr',svg);
  drawIn(dr,{dur:1.7,stagger:.07,delay:.25});
  var hw=$$('.hw',svg);
  window.__heroSpin=function(a){
    hw.forEach(function(u,i){var c=i===0?170:830;u.setAttribute('transform','translate('+c+' 330) rotate('+f1(a)+')')});
  };
})();

/* ---------- exploded view ---------- */
var XV=(function(){
  var svg=$('#xv');if(!svg)return null;
  var stage=$('#xvStage');
  var hud={st:$('#xvState'),pct:$('#xvPct'),bar:$('#xvBar')};
  var P=[
    {k:'chassis',stat:1},
    {k:'interior',t:'Cabin',s:'Seats & dash \u00b7 reference',side:'l',td:[300,478],d:.16,row:2,col:1},
    {k:'exhaust',n:'04',t:'Exhaust',s:'Muffler, converter, pipes',side:'b',td:[760,742],d:.3,row:6},
    {k:'trans',n:'08',t:'Transmission',s:'Gearbox & driveshaft',side:'b',td:[700,612],d:.26,row:5},
    {k:'engine',n:'07',t:'Engine',s:'Check engine light, repair',side:'t',td:[984,466],d:.2,row:4,col:0},
    {k:'oil',n:'01',t:'Oil & filter',s:'Maintenance, oil changes',side:'r',td:[1156,480],d:.22,row:4,col:1,mt:'Oil & filter'},
    {k:'battery',n:'06',t:'Electrical',s:'Battery & wiring',side:'b',td:[190,70],d:.12,row:3,col:1},
    {k:'ac',n:'05',t:'Heating & A/C',s:'Compressor, condenser',side:'l',td:[610,78],d:.12,row:3,col:0},
    {k:'shell',t:'Body shell',s:'Reference only',side:'l',td:[700,246],d:.04,row:1},
    {k:'door',t:'Door',s:'Reference only',side:'r',td:[612,480],d:.1,row:2,col:0},
    {k:'hood',t:'Hood',s:'Reference only',side:'r',td:[1040,66],d:0,row:0},
    {k:'suspR',n:'03',t:'Suspension',s:'Shocks & struts \u00b7 rear',side:'r',td:[262,664],d:.34,row:7,col:0,mt:'Suspension \u00b7 rear'},
    {k:'suspF',n:'03',t:'Suspension',s:'Shocks & struts \u00b7 front',side:'l',td:[1180,664],d:.34,row:7,col:1,mt:'Suspension \u00b7 front'},
    {k:'brakeR',n:'02',t:'Brakes',s:'Rotor & caliper \u00b7 rear',side:'r',td:[262,792],d:.36,row:8,col:0,mt:'Brakes \u00b7 rear'},
    {k:'brakeF',n:'02',t:'Brakes',s:'Rotor & caliper \u00b7 front',side:'l',td:[1180,792],d:.36,row:8,col:1,mt:'Brakes \u00b7 front'},
    {k:'wheelR',n:'03',t:'Tires & alignment',s:'Wheel & tire \u00b7 rear',side:'r',td:[262,906],d:.4,row:9,col:0,mt:'Tires \u00b7 rear'},
    {k:'wheelF',n:'03',t:'Tires & alignment',s:'Wheel & tire \u00b7 front',side:'l',td:[1180,906],d:.4,row:9,col:1,mt:'Tires \u00b7 front'}
  ];
  /* layers */
  var gDatum=el('g',{},svg),gLead=el('g',{},svg),gParts=el('g',{},svg),gLbl=el('g',{},svg);
  var datum=el('line',{'class':'datum'},gDatum);
  P.forEach(function(p){
    p.g=el('g',{'class':'dr part'},gParts);
    if(p.k==='wheelR'||p.k==='wheelF'){
      p.spin=el('use',{href:'#wheel-c'},p.g);
    }else{
      p.g.innerHTML=useMk(p.k);
    }
    if(!p.stat){
      p.lead=el('line',{'class':'lead-l'},gLead);
      p.lg=el('g',{},gLbl);
      p.call=el('path',{'class':'call'+(p.n?' sv':''),pathLength:1},p.lg);
      p.mk=el('circle',{'class':'mk'+(p.n?'':' ref'),r:p.n?13:4},p.lg);
      if(p.n)p.ln=el('text',{'class':'l-n','text-anchor':'middle'},p.lg);
      if(p.n)p.ln.textContent=p.n;
      p.lt=el('text',{'class':'l-t'},p.lg);p.lt.textContent=p.t;
      p.ls=el('text',{'class':'l-s'},p.lg);p.ls.textContent=p.s;
    }
  });
  var mode='',MS=.56,layoutW=0,drawn=false,curP=0;
  var m=window.matchMedia('(max-width: 860px)');

  function measure(){P.forEach(function(p){p.g.removeAttribute('transform');if(p.spin)p.spin.setAttribute('transform','translate('+CENTER[p.k][0]+' '+CENTER[p.k][1]+')');var b=p.g.getBBox();p.b={x:b.x,y:b.y,w:b.width,h:b.height,cx:b.x+b.width/2,cy:b.y+b.height/2}})}

  function setLabel(p,x,y,anchor,sub){
    /* x,y = marker center; places text relative to it */
  }

  function layout(){
    mode=m.matches?'m':'d';layoutW=window.innerWidth;
    var s,i;
    if(mode==='d'){
      svg.setAttribute('viewBox','0 0 1440 1000');
      s=1;var Ox=220,Oy=182;
      datum.setAttribute('x1',Ox-70);datum.setAttribute('x2',Ox+1070);datum.setAttribute('y1',Oy+400);datum.setAttribute('y2',Oy+400);
      P.forEach(function(p){
        p.s=s;p.tx0=Ox;p.ty0=Oy;
        if(p.stat){p.tx1=Ox;p.ty1=Oy;return}
        p.tx1=p.td[0]-p.b.cx;p.ty1=p.td[1]-p.b.cy;
        var hw=p.b.w/2,hh=p.b.h/2,cx=p.td[0],cy=p.td[1],mx,my,ex,ey,tx,ty,an,ty2,sy;
        var side=p.side;
        if(side==='r'){ex=cx+hw+3;ey=cy;mx=ex+30;my=cy;an='start';tx=mx+(p.n?22:12);}
        else if(side==='l'){ex=cx-hw-3;ey=cy;mx=ex-30;my=cy;an='end';tx=mx-(p.n?22:12);}
        else if(side==='t'){ex=cx;ey=cy-hh-3;mx=cx;my=ey-32;an='middle';tx=cx;}
        else{ex=cx;ey=cy+hh+3;mx=cx;my=ey+32;an='middle';tx=cx;}
        p.home=[Ox+p.b.cx,Oy+p.b.cy];
        p.lg.setAttribute('transform','translate('+0+' 0)');
        p.mk.setAttribute('cx',mx);p.mk.setAttribute('cy',my);
        if(p.ln){p.ln.setAttribute('x',mx);p.ln.setAttribute('y',my+5)}
        p.call.setAttribute('d','M '+ex+' '+ey+' L '+mx+' '+my);
        p.lt.setAttribute('text-anchor',an);p.ls.setAttribute('text-anchor',an);
        p.lt.style.display='';p.ls.style.display='';
        if(side==='t'){p.lt.setAttribute('x',tx);p.ls.setAttribute('x',tx);p.lt.setAttribute('y',my-(p.n?34:22));p.ls.setAttribute('y',my-(p.n?17:6));
          p.ls.setAttribute('y',my-(p.n?17:6));p.lt.setAttribute('y',my-(p.n?36:26))}
        else if(side==='b'){p.lt.setAttribute('x',tx);p.ls.setAttribute('x',tx);p.lt.setAttribute('y',my+(p.n?34:24));p.ls.setAttribute('y',my+(p.n?52:42))}
        else{p.lt.setAttribute('x',tx);p.ls.setAttribute('x',tx);p.lt.setAttribute('y',my-2);p.ls.setAttribute('y',my+16)}
      });
    }else{
      s=MS;var W=600,carCx=300,carCy=118;
      var rows=[];P.forEach(function(p){if(p.stat)return;(rows[p.row]=rows[p.row]||[]).push(p)});
      var y=carCy+s*134+66;
      var tx0=carCx-s*500,ty0=carCy-s*268;
      rows.forEach(function(r){
        r.sort(function(a,b){return (a.col||0)-(b.col||0)});
        var rh=0;r.forEach(function(p){rh=Math.max(rh,p.b.h*s)});
        r.forEach(function(p,i){
          var cx=W*(i+.5)/r.length,cy=y+rh/2;
          p.s=s;p.tx0=tx0;p.ty0=ty0;
          p.tx1=cx-s*p.b.cx;p.ty1=cy-s*p.b.cy;
          p.home=[tx0+s*p.b.cx,ty0+s*p.b.cy];
          p.mk.setAttribute('cx',cx);p.mk.setAttribute('cy',y+rh+16);p.mk.setAttribute('r',p.n?0:0);
          if(p.ln)p.ln.setAttribute('x',-99);
          p.call.setAttribute('d','M '+cx+' '+(cy+rh/2+2)+' L '+cx+' '+(y+rh+8));
          p.lt.setAttribute('text-anchor','middle');p.lt.setAttribute('x',cx);p.lt.setAttribute('y',y+rh+30);
          p.lt.textContent=(p.n?p.n+' \u00b7 ':'')+(p.mt||p.t);
          p.ls.style.display='none';
        });
        y+=rh+30+36;
      });
      P.forEach(function(p){if(p.stat){p.s=s;p.tx0=tx0;p.ty0=ty0;p.tx1=tx0;p.ty1=ty0}});
      datum.setAttribute('x1',carCx-s*540);datum.setAttribute('x2',carCx+s*540);datum.setAttribute('y1',ty0+s*400);datum.setAttribute('y2',ty0+s*400);
      svg.setAttribute('viewBox','0 0 600 '+Math.round(y+10));
    }
    if(mode==='d')P.forEach(function(p){if(!p.stat){p.lt.textContent=p.t}});
    fit(svg);
    render(curP);
  }

  function render(p){
    curP=p;
    var q=clamp((p-.04)/.9,0,1);
    P.forEach(function(o){
      var e=o.stat?0:ease(clamp((q-o.d)/.7,0,1));
      var tx=lerp(o.tx0,o.tx1,e),ty=lerp(o.ty0,o.ty1,e);
      o.g.setAttribute('transform','translate('+f1(tx)+' '+f1(ty)+')'+(o.s!==1?' scale('+o.s+')':''));
      if(o.stat)return;
      if(o.spin){var a=CENTER[o.k],ang=e*(o.k==='wheelF'?540:-540);o.spin.setAttribute('transform','translate('+a[0]+' '+a[1]+') rotate('+f1(ang)+')')}
      var cx=tx+o.s*o.b.cx,cy=ty+o.s*o.b.cy;
      o.lead.setAttribute('x1',o.home[0]);o.lead.setAttribute('y1',o.home[1]);o.lead.setAttribute('x2',cx);o.lead.setAttribute('y2',cy);
      o.lead.style.opacity=f1(clamp(e*6,0,1)*.9);
      var lo=clamp((e-.78)/.22,0,1);
      o.lg.style.opacity=f1(lo);
      o.call.style.strokeDasharray='1 2';o.call.style.strokeDashoffset=f1(1-lo);
    });
    var pc=Math.round(clamp((p-.04)/.9,0,1)*100);
    if(hud.pct)hud.pct.textContent=('00'+pc).slice(-3);
    if(hud.bar)hud.bar.style.transform='scaleX('+f1(pc/100)+')';
    if(hud.st)hud.st.textContent=pc<=2?'ASSEMBLED':pc>=98?'EXPLODED \u00b7 ALL SYSTEMS':'DISASSEMBLING';
    if(p>0.001&&!drawn)intro();
  }

  var tr=null,proxy={p:0};
  function setup(){
    if(tr){tr.scrollTrigger&&tr.scrollTrigger.kill(true);tr.kill();tr=null}
    proxy.p=0;
    layout();
    if(!ANIM){render(1);return}
    var onUpdate=function(){render(proxy.p)};
    if(mode==='d'){
      tr=gsap.to(proxy,{p:1,ease:'none',onUpdate:onUpdate,scrollTrigger:{trigger:stage,start:'top top',end:'+=3400',pin:true,scrub:.7,anticipatePin:1,invalidateOnRefresh:true}});
    }else{
      tr=gsap.to(proxy,{p:1,ease:'none',onUpdate:onUpdate,scrollTrigger:{trigger:svg,start:'top 62%',end:'bottom 78%',scrub:.7,invalidateOnRefresh:true}});
    }
    render(0);
  }
  function intro(){
    if(drawn)return;drawn=true;
    var els=P.map(function(o){return o.g});
    drawIn(els,{dur:1.5,stagger:.05});
  }
  if(ANIM){
    ScrollTrigger.create({trigger:stage,start:'top 88%',once:true,onEnter:intro});
    html.classList.add('xv-ready');
  }
  measure();
  setup();
  var rt;
  window.addEventListener('resize',function(){
    clearTimeout(rt);rt=setTimeout(function(){
      if(window.innerWidth===layoutW)return;
      setup();if(HAS)ScrollTrigger.refresh();
      $$('.diag').forEach(fit);var h=$('#heroSvg');if(h)fit(h);
    },220);
  });
  return {render:function(v){render(v)},P:P,mode:function(){return mode}};
})();
window.__xv=XV;

/* ---------- service diagrams ---------- */
var CALL={
  'engine,oil':[[880,283,.1,.14,'Valve cover','l'],[836,330,.1,.86,'Engine block','l'],[894,342,.62,.92,'Oil filter','l'],[955,322,.9,.3,'Drive pulley','r']],
  'brakeF':[[795,356,.1,.84,'Rotor','l'],[868,297,.9,.14,'Caliper','r'],[830,330,.9,.84,'Hub','r']],
  'suspF,wheelF':[[893,378,.9,.88,'Tire','r'],[790,330,.1,.62,'Rim','l'],[829,285,.12,.14,'Strut','l'],[770,345,.1,.9,'Control arm','l']],
  'exhaust':[[728,340,.86,.14,'Catalytic converter','r'],[337,335,.4,.14,'Muffler','l'],[146,342,.06,.86,'Tailpipe','l'],[540,342,.6,.86,'Pipe & hangers','l']],
  'ac':[[983,320,.92,.84,'Condenser','r'],[956,291,.62,.12,'Compressor','l'],[713,250,.1,.14,'HVAC box','l'],[850,281,.4,.88,'Lines','l']],
  'battery':[[749,265,.14,.14,'+ Terminal','l'],[785,265,.86,.14,'\u2212 Terminal','r'],[767,285,.12,.84,'Battery','l'],[790,257,.86,.9,'Cables','r']],
  'engine':[[880,274,.1,.14,'Valve cover','l'],[880,298,.1,.88,'Cylinder head','l'],[850,326,.58,.92,'Block','l'],[952,322,.9,.14,'Pulley','r']],
  'trans':[[350,332,.18,.12,'Driveshaft','l'],[690,334,.5,.9,'Gearbox','l'],[790,325,.88,.14,'Bell housing','r'],[272,332,.06,.88,'U-joint','l']]
};
function buildDiag(svg){
  var keys=svg.getAttribute('data-parts').split(',');
  var x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
  keys.forEach(function(k){var b=bbox(k);x0=Math.min(x0,b.x);y0=Math.min(y0,b.y);x1=Math.max(x1,b.x+b.w);y1=Math.max(y1,b.y+b.h)});
  var B={x:x0,y:y0,w:x1-x0,h:y1-y0},cx=B.x+B.w/2,cy=B.y+B.h/2;
  var asp=clamp(B.w/B.h*.62,1.45,2.4);
  var vw=B.w*1.62,vh=B.h*2.3;
  if(vw/vh>asp)vh=vw/asp;else vw=vh*asp;
  var vx=cx-vw/2,vy=cy-vh/2;
  svg.setAttribute('viewBox',f1(vx)+' '+f1(vy)+' '+f1(vw)+' '+f1(vh));
  svg.style.aspectRatio=f1(asp)+' / 1';
  var fs=vw*.024,u=vw*.01;
  var h='';
  /* parts */
  h+='<g class="dgp">'+keys.map(function(k){return '<g class="dr">'+useMk(k)+'</g>'}).join('')+'</g>';
  /* frame marks */
  var m1=vw*.035,L=vw*.045,ax=vx+m1,ay=vy+m1,bx=vx+vw-m1,by=vy+vh-m1;
  h+='<g class="dr">'
   +'<path class="an acc" d="M '+f1(ax)+' '+f1(ay+L)+' L '+f1(ax)+' '+f1(ay)+' L '+f1(ax+L)+' '+f1(ay)+' M '+f1(bx-L)+' '+f1(ay)+' L '+f1(bx)+' '+f1(ay)+' L '+f1(bx)+' '+f1(ay+L)+' M '+f1(bx)+' '+f1(by-L)+' L '+f1(bx)+' '+f1(by)+' L '+f1(bx-L)+' '+f1(by)+' M '+f1(ax+L)+' '+f1(by)+' L '+f1(ax)+' '+f1(by)+' L '+f1(ax)+' '+f1(by-L)+'"/>'
   +'<path class="an" stroke-dasharray="none" d="M '+f1(B.x-B.w*.28)+' '+f1(cy)+' L '+f1(B.x+B.w*1.28)+' '+f1(cy)+' M '+f1(cx)+' '+f1(B.y-B.h*.4)+' L '+f1(cx)+' '+f1(B.y+B.h*1.4)+'" opacity=".45"/>'
   +'</g>';
  /* dimension lines */
  var mb=(vy+vh)-(B.y+B.h),mr=(vx+vw)-(B.x+B.w);
  var dy=B.y+B.h+mb*.5,dx=B.x+B.w+mr*.5,t=u*1.1;
  h+='<g class="dr">'
   +'<path class="an" d="M '+f1(B.x)+' '+f1(B.y+B.h+u*1.2)+' L '+f1(B.x)+' '+f1(dy+t)+' M '+f1(B.x+B.w)+' '+f1(B.y+B.h+u*1.2)+' L '+f1(B.x+B.w)+' '+f1(dy+t)+' M '+f1(B.x)+' '+f1(dy)+' L '+f1(B.x+B.w)+' '+f1(dy)
   +' M '+f1(B.x-t)+' '+f1(dy+t)+' L '+f1(B.x+t)+' '+f1(dy-t)+' M '+f1(B.x+B.w-t)+' '+f1(dy+t)+' L '+f1(B.x+B.w+t)+' '+f1(dy-t)+'"/>'
   +'<path class="an" d="M '+f1(B.x+B.w+u*1.2)+' '+f1(B.y)+' L '+f1(dx+t)+' '+f1(B.y)+' M '+f1(B.x+B.w+u*1.2)+' '+f1(B.y+B.h)+' L '+f1(dx+t)+' '+f1(B.y+B.h)+' M '+f1(dx)+' '+f1(B.y)+' L '+f1(dx)+' '+f1(B.y+B.h)
   +' M '+f1(dx-t)+' '+f1(B.y+t)+' L '+f1(dx+t)+' '+f1(B.y-t)+' M '+f1(dx-t)+' '+f1(B.y+B.h+t)+' L '+f1(dx+t)+' '+f1(B.y+B.h-t)+'"/>'
   +'<text class="atx" font-size="'+f1(fs)+'" x="'+f1(cx)+'" y="'+f1(dy-fs*.5)+'" text-anchor="middle">A</text>'
   +'<text class="atx" font-size="'+f1(fs)+'" x="'+f1(dx+fs*.7)+'" y="'+f1(cy+fs*.35)+'" text-anchor="start">B</text>'
   +'</g>';
  /* callouts */
  var cl=CALL[svg.getAttribute('data-parts')]||[];
  h+='<g class="dr">';
  cl.forEach(function(c){
    var lx=vx+c[2]*vw,ly=vy+c[3]*vh,right=c[5]==='r';
    h+='<path class="an" d="M '+c[0]+' '+c[1]+' L '+f1(lx)+' '+f1(ly)+'"/>'
      +'<circle class="adot" cx="'+c[0]+'" cy="'+c[1]+'" r="'+f1(fs*.2)+'"/>'
      +'<text class="atx" style="fill:#e6f1fb" font-size="'+f1(fs)+'" x="'+f1(lx+(right?-fs*.6:fs*.6))+'" y="'+f1(ly+fs*.35)+'" text-anchor="'+(right?'end':'start')+'">'+c[4].toUpperCase()+'</text>';
  });
  h+='</g>';
  svg.innerHTML=h;
  $$('.an',svg).forEach(function(e){e.setAttribute('pathLength','1')});
  fit(svg);
}
$$('.diag').forEach(buildDiag);
if(ANIM){
  drawDiag=function(row){
    var d=$('.diag',row);if(!d||d.__d)return;d.__d=1;
    drawIn($$('.dr',d),{dur:1.6,stagger:.18,delay:.35});
  };
}

/* ---------- scroll-driven bits ---------- */
var prog=$('#prog'),grid=$('#gridbg');
var tick=false;
function onScroll(){
  tick=false;
  var sy=window.scrollY||0,vh=window.innerHeight,max=html.scrollHeight-vh;
  prog.style.transform='scaleX('+(max>0?clamp(sy/max,0,1):0).toFixed(4)+')';
  hdr.classList.toggle('solid',sy>24);
  if(ANIM){
    grid.style.setProperty('--gy',(-((sy*.22)%120)).toFixed(1)+'px');
    if(window.__heroSpin&&sy<vh*1.3)window.__heroSpin(sy*.35);
  }
}
window.addEventListener('scroll',function(){if(!tick){tick=true;requestAnimationFrame(onScroll)}},{passive:true});
onScroll();

/* counters */
$$('[data-count]').forEach(function(b){
  var end=parseFloat(b.getAttribute('data-count')),dec=+(b.getAttribute('data-dec')||0),suf=b.getAttribute('data-suffix')||'';
  var fmt=function(v){return v.toFixed(dec)+suf};
  if(!ANIM){b.textContent=fmt(end);return}
  b.textContent=fmt(0);
  var o={v:0};
  ScrollTrigger.create({trigger:b,start:'top 88%',once:true,onEnter:function(){
    gsap.to(o,{v:end,duration:1.9,ease:'power2.out',onUpdate:function(){b.textContent=fmt(o.v)},onComplete:function(){b.textContent=fmt(end)}});
  }});
});

if(ANIM){
  var mm=gsap.matchMedia();
  /* hero moves out as the exploded view takes over */
  gsap.to('#heroFig',{xPercent:14,opacity:.05,ease:'none',scrollTrigger:{trigger:'#hero',start:'top top',end:'bottom 15%',scrub:.5}});
  gsap.to('#heroCopy',{y:-70,opacity:0,ease:'none',scrollTrigger:{trigger:'#hero',start:'top top',end:'bottom 25%',scrub:.5}});
  /* spec cards slide in from alternating directions */
  $$('.spec-c').forEach(function(c,i){
    var from=c.getAttribute('data-from');
    gsap.fromTo(c,{x:from==='l'?-90:from==='r'?90:0,y:from==='b'?70:0,opacity:0},{x:0,y:0,opacity:1,duration:1.1,ease:'power3.out',delay:i*.08,scrollTrigger:{trigger:'.spec',start:'top 82%',once:true}});
  });
  mm.add({d:'(min-width: 981px)',s:'(max-width: 980px)'},function(ctx){
    var big=ctx.conditions.d;
    /* service rows slide out toward the side they came from */
    $$('.srow').forEach(function(r){
      var dir=r.getAttribute('data-dir')==='l'?-1:1;
      gsap.to($('.srow-in',r),{x:dir*(big?120:40),opacity:0,ease:'none',scrollTrigger:{trigger:r,start:'bottom 34%',end:'bottom -4%',scrub:.4}});
    });
    /* sheets slide up and out as you leave them */
    $$('.sec-leave').forEach(function(w){
      gsap.to(w,{y:big?-70:-30,opacity:.0,ease:'none',scrollTrigger:{trigger:w,start:'bottom 42%',end:'bottom 4%',scrub:.4}});
    });
  });
}
})();
