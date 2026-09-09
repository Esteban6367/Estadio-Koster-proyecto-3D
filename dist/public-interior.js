import {publicLayout as P,publicStairs,publicFloor,vestibuleSections} from './public-layout.js';
export function addPublicInterior({block,rake,at,pt,materials:M,mats,beam,sign,scene,gradeHeight}){
 const white=M.insideWhite,concrete=M.insideConcrete;
 // Adjacent volumes, not nearly coplanar layers of different paint.
 const wall=(a,b,u0,u1,lo=0,hi=3.15,base=M.insideTeal)=>{const split=2.55;if(lo<split)block(a,b,lo,Math.min(hi,split),Math.min(hi,split),u0,u1,base);if(hi>split)block(a,b,Math.max(lo,split),hi,hi,u0,u1,white);};
 const rail=(u0,d0,h0,u1,d1,h1)=>{beam(pt(u0,d0,h0+1.03),pt(u1,d1,h1+1.03),.032,M.rail);const n=Math.ceil(Math.hypot(u1-u0,d1-d0)/1.5);for(let i=0;i<=n;i++){const f=i/n,u=u0+(u1-u0)*f,d=d0+(d1-d0)*f,h=h0+(h1-h0)*f;beam(pt(u,d,h),pt(u,d,h+1.03),.025,M.rail);at(u,d,h+.035,.14,.07,.14,M.navy);}};
 // Continuous zero-level vestibule, then one transverse passage. No hidden old branches.
 block(P.passBack,P.portalD+.15,-.18,0,0,-P.half,P.half,M.insideTile,'floor');
 block(P.passFront,P.passBack,-.18,0,0,-P.endU,P.endU,M.insideTile,'floor');
 block(P.rampTop,P.rampStart,-.18,P.frontY,0,.08,P.half,concrete,'floor');
 for(let i=0;i<4;i++){const d=P.rampTop+i*P.shortTread,h=P.frontY-i*P.shortRise;block(d,d+P.shortTread,-.18,h,h,-P.half,-.08,concrete,'floor');}
 block(P.rampTop+4*P.shortTread,P.rampStart,-.18,0,0,-P.half,-.08,M.insideTile,'floor');
 block(P.rampTop,P.rampStart,-.18,P.frontY,0,-.08,.08,concrete);
 block(3.76,P.rampTop,.50,.72,.72,-P.half,P.half,M.insideTile,'floor');
 // Existing connection to the lower public ring is retained; fences and moat remain separate.
 block(0,2,-.18,0,0,-P.half,P.half,M.insideTile,'floor');
 for(let i=0;i<4;i++){const d=2+i*.44,h=(i+1)*.18;block(d,d+.44,-.18,h,h,-P.half,P.half,concrete,'floor');}
 for(let d=P.rampTop+.12;d<P.rampStart-.05;d+=.22){const h=publicFloor(1,d);block(d,d+.014,h-.008,h+.002,h-.0005,.16,2.57,M.groove,'groove');}
 rail(0,P.rampTop,.72,0,P.rampStart,0);
 // Walls close against each seating slab (and the retained cabin floor).
 const doorA=P.doorD-P.doorWidth/2,doorB=P.doorD+P.doorWidth/2;
 for(const q of vestibuleSections){
  wall(q.d0,q.d1,2.7,2.94,0,q.top,q.d0<27?M.insideBlue:M.insideTeal);
  const cuts=[q.d0,...[doorA,doorB].filter(d=>d>q.d0&&d<q.d1),q.d1];
  for(let i=0;i<cuts.length-1;i++){const a=cuts[i],b=cuts[i+1],door=(a+b)/2>doorA&&(a+b)/2<doorB;wall(a,b,-2.94,-2.7,door?2.3:0,q.top,a<27?M.insideBlue:M.insideTeal);}
 }
 // Shallow reveal: sheet sits inside the actual wall thickness. Function unconfirmed.
 block(doorA,doorB,-.18,0,0,-3,-2.7,M.insideTile,'floor');
 for(const d of[doorA,doorB])at(-2.73,d,1.15,.08,2.3,.065,M.doorFrame);
 at(-2.73,P.doorD,2.325,.08,.065,1.16,M.doorFrame);
 at(-2.84,P.doorD,1.135,.045,2.25,1.025,M.doorMetal);
 at(-2.805,P.doorD+.32,1.05,.09,.055,.16,mats.steel);
 for(const h of[.28,1.12,2.0])at(-2.79,doorA+.04,h,.055,.09,.035,mats.steel);
 // Actual transverse beams below the continuous stepped slab; no metal-roof substitutes.
 for(let d=13.4;d<32.8;d+=1.7){const q=vestibuleSections.find(q=>d>=q.d0&&d<q.d1);if(q)block(d-.11,d+.11,q.top-.28,q.top,q.top,-2.94,2.94,concrete);}
 // Small structural closure of the cabin floor return, previously left open above the hall.
 block(25.3,25.45,7.76,7.98,7.98,-2.94,2.94,concrete);
 for(const side of[-1,1])wall(2,8.26,side<0?-2.94:2.7,side<0?-2.7:2.94,0,2.85,M.insideBlue);
 // Frontal opening: lintel above the short rise, not a tall axial staircase.
 block(8.26,8.5,2.85,3.23,3.23,-2.94,2.94,white);
 // Field-side wall and closed lateral leaves. No bathroom designation is inferred.
 for(const side of[-1,1]){
  const bounds=side<0?[-51,-2.7]:[2.7,51],door=side<0?-27:30;
  for(const[a,b]of[[bounds[0],door-.7],[door+.7,bounds[1]]])block(8.26,8.5,-.18,3.23,3.23,a,b,white);
  block(8.26,8.5,2.35,3.23,3.23,door-.7,door+.7,white);
  block(8.20,8.55,3.23,3.34,3.34,bounds[0],bounds[1],M.navy);
  at(door,8.32,1.16,1.32,2.28,.055,M.navy);for(const u of[door-.7,door+.7])at(u,8.46,1.18,.065,2.36,.12,M.doorFrame);at(door,8.46,2.39,1.46,.065,.12,M.doorFrame);at(door+.48,8.43,1.04,.05,.18,.1,mats.steel);
  beam(pt(door-1.3,8.57,2.51),pt(door+1.3,8.57,2.51),.023,mats.steel);
 }
 // Wall beneath the seats: only the central vestibule and genuine stair exits interrupt it.
 const cuts=[[-2.7,2.7],...publicStairs.map(s=>[Math.min(s.top,s.end),Math.max(s.top,s.end)])];
 let ranges=[[-51,51]];for(const[c,d]of cuts)ranges=ranges.flatMap(([a,b])=>d<=a||c>=b?[[a,b]]:[[a,Math.max(a,c)],[Math.min(b,d),b]].filter(([x,y])=>y-x>.01));
 for(const[a,b]of ranges){block(12.5,12.76,-.18,2.5,2.5,a,b,white);block(12.5,12.76,2.5,3.38,3.38,a,b,M.insideBlue);block(12.5,12.76,3.60,5.15,5.15,a,b,M.insideBlue);
  const count=Math.max(1,Math.floor((b-a)/2.4)),cell=(b-a)/count;for(let i=0;i<count;i++){const x=a+i*cell;block(12.5,12.76,3.38,3.60,3.60,x,x+cell-.62,M.insideBlue);block(12.71,12.77,3.36,3.62,3.62,x+cell-.62,x+cell,mats.dark);}
  block(12.46,12.81,5.15,5.25,5.25,a,b,M.navy);beam(pt(a,12.43,2.75),pt(b,12.43,2.75),.014,mats.steel);
 }
 block(12.5,12.76,3.67,5.15,5.15,-2.7,2.7,M.insideBlue);block(12.46,12.81,5.15,5.25,5.25,-2.7,2.7,M.navy);
 for(const s of publicStairs){
  for(let i=0;i<P.stairSteps;i++){const a=s.foot+s.dir*i*P.stairTread,b=a+s.dir*P.stairTread,h=(i+1)*P.stairRise;block(10.2,12.5,0,h,h,Math.min(a,b),Math.max(a,b),concrete,'floor');}
  const a=Math.min(s.top,s.end),b=Math.max(s.top,s.end);block(10.2,12.5,0,4.2,4.2,a,b,M.insideTile,'floor');
  const lo=Math.min(s.foot,s.top),hi=Math.max(s.foot,s.top),h0=s.dir>0?.18:4.38,h1=s.dir>0?4.38:.18;
  rake(lo,hi,10.0,10.2,-.18,h0,h1,M.navy);block(10.0,10.2,-.18,4.38,4.38,a,b,M.navy);
  rail(s.foot,10.1,0,s.top,10.1,4.2);rail(s.top,10.1,4.2,s.end,10.1,4.2);rail(s.end,10.1,4.2,s.end,12.5,4.2);
  beam(pt(s.foot,12.40,1.03),pt(s.top,12.40,5.23),.032,M.rail);
  for(let i=0;i<=P.stairSteps;i+=4){const u=s.foot+s.dir*i*P.stairTread,h=i*P.stairRise;beam(pt(u,12.40,h+1.03),pt(u,12.64,h+1.03),.013,mats.steel);}
 }
 for(const u of[-51.12,51.12])block(8.26,12.76,-.18,3.35,3.35,u-.12,u+.12,white);
 for(const u of[-42.5,-25.5,-8.5,8.5,25.5,42.5])for(let d=2;d<8.25;d+=.85){const e=Math.min(d+.85,8.25),h=gradeHeight(e);block(d,e,Math.max(0,h-.45),h+.55,h+.55,u-.09,u+.09,M.navy);block(d,e,h+.55,h+.60,h+.60,u-.11,u+.11,M.turquoise);}
 // Preserve approved threshold, exterior handrails and identifying sign.
 for(const side of[-1,1])rail(side*3.35,33.5,0,side*3.35,35.5,0);
 at(0,33,3.59,5.94,.58,.4,M.navy);const label=sign('ENTRADA PRINCIPAL',4.4,.28);label.position.set(...pt(0,33.23,3.62));label.rotation.y=Math.PI*1.5;scene.add(label);
}
