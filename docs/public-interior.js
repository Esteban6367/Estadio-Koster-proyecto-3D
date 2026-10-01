import {mainV,mainD} from './main-plan.js';
import {platform as C} from './central-platform-layout.js';
import {passageFrontV,passageRearV,passageFrontD} from './passage-profile.js';
import {stands,tierAngle} from './stadium-layout.js';
import {publicLayout as P,publicStairs,publicFloor,vestibuleSections} from './public-layout.js';
export function addPublicInterior({block,band,rake,at,pt,materials:M,mats,beam,sign,scene,gradeHeight}){
 const A=u=>P.axis+u,white=M.insideWhite,concrete=M.insideConcrete;
 const axial=(a,b,lo,h0,h1,u0,u1,m,role)=>block(a,b,lo,h0,h1,A(u0),A(u1),m,role);
 const wall=(a,b,u0,u1,lo=0,hi=3.15,base=M.insideTeal)=>{
  if(lo<2.55)block(a,b,lo,Math.min(hi,2.55),Math.min(hi,2.55),u0,u1,base);
  if(hi>2.55)block(a,b,Math.max(lo,2.55),hi,hi,u0,u1,white);
 };
 const rail=(u0,d0,h0,u1,d1,h1)=>{
  const n=Math.max(1,Math.ceil(Math.hypot(u1-u0,d1-d0)/1.5));
  for(let i=0;i<=n;i++){const f=i/n,u=u0+(u1-u0)*f,d=d0+(d1-d0)*f,h=h0+(h1-h0)*f;
   beam(pt(u,d,h),pt(u,d,h+1.03),.025,M.rail);at(u,d,h+.035,.14,.07,.14,M.navy);
   if(i<n){const g=(i+1)/n;beam(pt(u,d,h+1.03),pt(u0+(u1-u0)*g,d0+(d1-d0)*g,h0+(h1-h0)*g+1.03),.032,M.rail);}
  }
 };
 // Four metres under the central deck, narrowing along the photographed diagonals; the lower stand continues past both passage ends.
 axial(P.passBack,P.portalD+.15,-.18,0,0,-P.half,P.half,M.insideTile,'floor');
 for(const[a,b]of[[-P.endU,A(-P.half)],[A(-P.half),A(P.half)],[A(P.half),P.endU]]){
  const entry=a===A(-P.half);
  band(a,b,u=>entry?Math.min(passageFrontV(u),mainV(u,P.passFront)):passageFrontV(u),passageRearV,-.18,0,M.insideTile,'floor');
 }
 axial(P.rampTop,P.rampStart,-.18,P.frontY,0,.08,P.half,concrete,'floor');
 for(let i=0;i<4;i++){const d=P.rampTop+i*P.shortTread,h=P.frontY-i*P.shortRise;axial(d,d+P.shortTread,-.18,h,h,-P.half,-.08,concrete,'floor');}
 axial(P.rampTop+4*P.shortTread,P.rampStart,-.18,0,0,-P.half,-.08,M.insideTile,'floor');
 axial(P.rampTop,P.rampStart,-.18,P.frontY,0,-.08,.08,concrete);
 axial(3.76,P.rampTop,.50,.72,.72,-P.half,P.half,M.insideTile,'floor');
 axial(0,2,-.18,0,0,-P.half,P.half,M.insideTile,'floor');
 for(let i=0;i<4;i++){const d=2+i*.44,h=(i+1)*.18;axial(d,d+.44,-.18,h,h,-P.half,P.half,concrete,'floor');}
 for(let d=P.rampTop+.12;d<P.rampStart-.05;d+=.22){const h=publicFloor(A(1),d);axial(d,d+.014,h-.008,h+.002,h-.0005,.16,2.57,M.groove,'groove');}
 rail(A(0),P.rampTop,.72,A(0),P.rampStart,0);
 const doorA=P.doorD-P.doorWidth/2,doorB=P.doorD+P.doorWidth/2;
 for(const q of vestibuleSections){
  wall(q.d0,q.d1,A(2.7),A(2.94),0,q.top,q.d0<27?M.insideBlue:M.insideTeal);
  const cuts=[q.d0,...[doorA,doorB].filter(d=>d>q.d0&&d<q.d1),q.d1];
  for(let i=0;i<cuts.length-1;i++){const a=cuts[i],b=cuts[i+1],door=(a+b)/2>doorA&&(a+b)/2<doorB;wall(a,b,A(-2.94),A(-2.7),door?2.3:0,q.top,a<27?M.insideBlue:M.insideTeal);}
 }
 axial(doorA,doorB,-.18,0,0,-3,-2.7,M.insideTile,'floor');
 for(const d of[doorA,doorB])at(A(-2.73),d,1.15,.08,2.3,.065,M.doorFrame);
 at(A(-2.73),P.doorD,2.325,.08,.065,1.16,M.doorFrame);at(A(-2.84),P.doorD,1.135,.045,2.25,1.025,M.doorMetal);
 at(A(-2.805),P.doorD+.32,1.05,.09,.055,.16,mats.steel);
 for(const h of[.28,1.12,2])at(A(-2.79),doorA+.04,h,.055,.09,.035,mats.steel);
 for(let d=13.4;d<32.8;d+=1.7){const q=vestibuleSections.find(q=>d>=q.d0&&d<q.d1);if(q)axial(d-.11,d+.11,q.top-.28,q.top,q.top,-2.94,2.94,concrete);}
 for(const side of[-1,1]){
  const u0=A(side<0?-2.94:2.7),u1=A(side<0?-2.7:2.94);
  for(let d=2;d<8.26-.001;d+=.425){const e=Math.min(d+.425,8.26),h=gradeHeight(e);block(d,e,-.18,h,h,u0,u1,concrete);}
  rail(A(side*2.82),4.5,gradeHeight(4.5),A(side*2.82),8.26,gradeHeight(8.26));
 }
 band(A(-2.94),A(2.94),u=>passageFrontV(u)-.24,passageFrontV,2.85,3.23,white);
 // Close the old central entrance with the same retaining wall and ordinary rows.
 for(const[a,b]of[[-P.endU,A(-P.half)],[A(P.half),P.endU]]){
  const levels=[a,b,...[-16,16].filter(u=>u>a&&u<b)];
  // Break cap height exactly where a tread meets the straight retaining line.
  for(let d=8.375;d<10.51;d+=.425){let lo=16,hi=P.endU;for(let i=0;i<40;i++){const u=(lo+hi)/2;if(mainD(u,passageFrontV(u)-.24)<d)lo=u;else hi=u;}for(const u of[-(lo+hi)/2,(lo+hi)/2])if(u>a+1e-5&&u<b-1e-5)levels.push(u);}
  levels.sort((a,b)=>a-b);
  for(let i=1;i<levels.length;i++){const l=levels[i-1],r=levels[i],u=(l+r)/2;
   const h=Math.abs(u)<C.half?C.soffit:Math.max(3.23,gradeHeight(mainD(u,passageFrontV(u)-.24)));
   band(l,r,u=>passageFrontV(u)-.24,passageFrontV,-.18,h,white);
   band(l,r,u=>passageFrontV(u)-.30,u=>passageFrontV(u)+.045,h,h+.11,M.navy);
  }
 }
 const cuts=[[-C.stairHalf,C.stairHalf],[A(-P.half),A(P.half)],...publicStairs.map(s=>[Math.min(s.top,s.end),Math.max(s.top,s.end)])];
 let ranges=[[-P.endU,P.endU]];
 for(const[c,d]of cuts)ranges=ranges.flatMap(([a,b])=>d<=a||c>=b?[[a,b]]:[[a,Math.max(a,c)],[Math.min(b,d),b]].filter(([x,y])=>y-x>.01));
 for(const[a,b]of ranges){
  block(12.5,12.76,-.18,2.5,2.5,a,b,white);block(12.5,12.76,2.5,5.15,5.15,a,b,M.insideBlue);
  block(12.46,12.81,5.15,5.25,5.25,a,b,M.navy);
 }
 block(12.5,12.76,-.18,2.5,2.5,-C.stairHalf,C.stairHalf,white);
 block(12.5,12.76,2.5,C.top-C.slab,C.top-C.slab,-C.stairHalf,C.stairHalf,M.insideBlue);
 axial(12.5,12.76,3.67,5.15,5.15,-P.half,P.half,M.insideBlue);
 axial(12.46,12.81,5.15,5.25,5.25,-P.half,P.half,M.navy);
 for(const s of publicStairs){
  for(let i=0;i<P.stairSteps;i++){const a=s.foot+s.dir*i*P.stairTread,b=a+s.dir*P.stairTread,h=(i+1)*P.stairRise;block(P.stairFront,P.stairBack,0,h,h,Math.min(a,b),Math.max(a,b),concrete,'floor');}
  const a=Math.min(s.top,s.end),b=Math.max(s.top,s.end);block(P.stairFront,P.stairBack,0,4.2,4.2,a,b,M.insideTile,'floor');
  const lo=Math.min(s.foot,s.top),hi=Math.max(s.foot,s.top),h0=s.dir>0?.18:4.38,h1=s.dir>0?4.38:.18;
  rake(lo,hi,P.stairFront-.2,P.stairFront,-.18,h0,h1,M.navy);block(P.stairFront-.2,P.stairFront,-.18,4.38,4.38,a,b,M.navy);
  rail(s.foot,P.stairFront-.1,0,s.top,P.stairFront-.1,4.2);rail(s.top,P.stairFront-.1,4.2,s.end,P.stairFront-.1,4.2);rail(s.end,P.stairFront-.1,4.2,s.end,12.5,4.2);
  beam(pt(s.foot,12.40,1.03),pt(s.top,12.40,5.23),.032,M.rail);
  for(let i=0;i<=P.stairSteps;i+=4){const u=s.foot+s.dir*i*P.stairTread,h=i*P.stairRise;beam(pt(u,12.40,h+1.03),pt(u,12.64,h+1.03),.013,mats.steel);}
 }
 // Proper end returns instead of a corridor extended into both end seating wings.
 for(const side of[-1,1]){
  const a=side<0?-P.endU-.24:P.endU,b=a+.24;
  band(a,b,u=>passageFrontV(u)-.24,u=>passageRearV(u)+.26,-.18,4.2,white);
  rail(side*(P.endU+.12),passageFrontD(side*P.endU),4.2,side*(P.endU+.12),13.5,4.2);
 }
 for(const side of[-1,1])rail(A(side*3.35),33.5,0,A(side*3.35),35.5,0);
 at(A(0),33,3.59,5.94,.58,.4,M.navy);
 const label=sign('ENTRADA PRINCIPAL',4.4,.28);
 label.position.set(...pt(A(0),33.23,3.62));label.rotation.y=tierAngle(stands[0],A(0),33.23)+Math.PI;
 label.name='Entrada principal · cartel en nuevo eje';scene.add(label);
}
