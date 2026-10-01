import {mainBend,ellipticalPlan} from './main-plan.js';
import {dimensions as D} from './dimensions.js';
import {publicSolidCuts,publicLayout as PL} from './public-layout.js';
// Academic model, metres. Shared by architecture and collision geometry.
export const stands=[
 {id:'main',name:'Tribuna principal',x:D.main.baseX,z:0,angle:Math.PI/2,length:D.main.lowerFront,facadeLength:D.main.facadeLength,baseDepth:22,depth:D.main.upperStart+D.main.upperDepth,curve:D.main.curve,accessU:PL.axis},
 {id:'south',name:'Tribuna sur',x:0,z:D.end.centreZ,angle:Math.PI,length:D.end.lowerWidth,baseDepth:D.end.baseDepth,depth:D.end.depth,curve:D.end.curve,accessU:34}
];
const clamp=x=>Math.max(0,Math.min(1,x));
export function spanAt(s,d){
 if(s.id!=='main')return D.end.lowerWidth+(D.end.upperWidth-D.end.lowerWidth)*clamp(d/s.depth);
 if(d<=D.main.lowerDepth)return D.main.lowerFront+(D.main.lowerRear-D.main.lowerFront)*clamp(d/D.main.lowerDepth);
 if(d<D.main.upperStart)return D.main.lowerRear+(D.main.upperFront-D.main.lowerRear)*(d-D.main.lowerDepth)/(D.main.upperStart-D.main.lowerDepth);
 return D.main.upperFront+(D.main.upperRear-D.main.upperFront)*clamp((d-D.main.upperStart)/D.main.upperDepth);
}
// Reference-driven plan, metres; shape proportions are interpreted from the user's CAD images.
// The front row stays straight; lower rows meet the bowed rear circulation.
// Both sides of every corridor share the same bend: never consume corridor width
// as a transition zone. Heights are never warped.
export {ellipticalPlan} from './main-plan.js';

export function bend(s,u,d=33){
 if(s.id==='main')return mainBend(u,d);
 const q=Math.max(-10,d),a=ellipticalPlan.southA+q,b=ellipticalPlan.southB+q;
 return 10+b*(Math.sqrt(Math.max(.015,1-(u/a)**2))-1);
}
const cardinal=x=>Math.abs(x)<1e-12?0:x;
export function world(s,u,d){const c=cardinal(Math.cos(s.angle)),a=cardinal(Math.sin(s.angle)),v=d+bend(s,u,d);return[s.x+u*c-v*a,s.z-u*a-v*c];}
export function local(s,x,z){
 const dx=x-s.x,dz=z-s.z,c=cardinal(Math.cos(s.angle)),a=cardinal(Math.sin(s.angle)),u=dx*c-dz*a,v=-dx*a-dz*c;
 let lo=v-40,hi=v+200,d=v-bend(s,u,v);
 for(let i=0;i<48;i++){
  const e=d+bend(s,u,d)-v;if(Math.abs(e)<1e-9)break;
  if(e>0)hi=d;else lo=d;
  const slope=1+(bend(s,u,d+.0001)-bend(s,u,d-.0001))/.0002,next=d-e/Math.max(.1,slope);
  d=next>lo&&next<hi?next:(lo+hi)/2;
 }
 return{u,d};
}
// Tangent-aligned rigid fittings; stretch only a linear wall/trim to its actual chord.
export function fittedBox(s,box,u,d,y,w,h,t,m){
 const depth=t>w,[a,b]=depth?[world(s,u,d-t/2),world(s,u,d+t/2)]:[world(s,u-w/2,d),world(s,u+w/2,d)];
 const length=Math.hypot(b[0]-a[0],b[1]-a[1]),angle=depth?Math.atan2(b[0]-a[0],b[1]-a[1])+Math.PI:Math.atan2(-(b[1]-a[1]),b[0]-a[0]);
 box((a[0]+b[0])/2,y,(a[1]+b[1])/2,depth?w:length,h,depth?length:t,m,angle);
}
// Rear supports follow the corrected upper-tier width; the facade retains its own bays.
export const supportSpan=s=>spanAt(s,s.depth);
export const tierAngle=(s,u,d)=>{const a=world(s,u-.01,d),b=world(s,u+.01,d);return Math.atan2(-(b[1]-a[1]),b[0]-a[0]);};

export const flights=s=>s.id==='main'?[[2,10.5],[D.main.upperStart,s.depth-2]]:[[2,10.5],[12.5,s.baseDepth-2],[s.baseDepth,s.depth-2]];
export const flightStep=(s,a)=>s.id==='main'&&a===D.main.upperStart?(s.depth-2-D.main.upperStart)/D.main.upperSteps:.425;
export const galleries=s=>s.id==='main'?[[0,2],[10.5,D.main.upperStart],[s.depth-2,s.depth]]:[[0,2],[10.5,12.5],[s.baseDepth-2,s.baseDepth],[s.depth-2,s.depth]];
export const cabin={stand:'main',halfWidth:4,front:D.main.cabinFront,back:D.main.cabinBack,floor:D.main.cabinFloor,height:2.85,doorHalf:.85};
// Six proposed access treads connect the central aisle to the coronation booth.
export const cabinAccess={u0:-1.4,u1:1.4,d0:27.7,d1:29.2,floor:10.92,tread:.25,rise:.21,steps:6};
export const cabinAccessAt=(s,u,d)=>s.id==='main'&&u>=cabinAccess.u0&&u<=cabinAccess.u1&&d>=cabinAccess.d0&&d<cabinAccess.d1;
export const cabinAccessFloor=d=>cabinAccess.floor+Math.max(0,Math.min(6,Math.ceil((d-cabinAccess.d0-1e-6)/cabinAccess.tread)))*cabinAccess.rise;
export function cabinAt(s,u,d){return s.id==='main'&&Math.abs(u)<=cabin.halfWidth&&d>=cabin.front&&d<=cabin.back;}
// Reserve the shell as well as its interior; generic tier fittings stop before it.
export const cabinReservation={u0:-cabin.halfWidth-.15,u1:cabin.halfWidth+.15,d0:cabin.front,d1:cabin.back+.15};
export function cabinDetailAt(s,u,d,padding=.20){const r=cabinReservation;return cabinAccessAt(s,u,d)||(s.id==='main'&&u>=r.u0-padding&&u<=r.u1+padding&&d>=r.d0-padding&&d<=r.d1+padding); }
export function cabinRailRanges(s,u,a,b){if(s.id!=='main'||u<cabinReservation.u0-.20||u>cabinReservation.u1+.20)return[[a,b]];return[[a,Math.min(b,Math.abs(u)<1.8?cabinAccess.d0-.20:cabinReservation.d0-.20)],[Math.max(a,cabinReservation.d1+.20),b]].filter(([a,b])=>b>a);}
export function solidRanges(s,d,exactLower=false){
 const half=s.id==='main'&&d>=20.1?2.7:1.7;
 const cuts=s.id==='main'?(exactLower&&d<12.5?(d<10.5?[[PL.axis-(d<2?PL.half:2.94),PL.axis+(d<2?PL.half:2.94)]]:[]):publicSolidCuts(d)):[];if(d>=12.5&&s.id!=='main')cuts.push([s.accessU-half,s.accessU+half]);
 if(s.id==='main'&&d>=cabinReservation.d0-1e-6&&d<cabinReservation.d1-1e-6)cuts.push([cabinReservation.u0,cabinReservation.u1]);
 if(s.id==='main'&&d>=cabinAccess.d0-1e-6&&d<cabinAccess.d1-1e-6)cuts.push([cabinAccess.u0,cabinAccess.u1]);
 let ranges=[[-spanAt(s,d)/2,spanAt(s,d)/2]];for(const[a,b]of cuts)ranges=ranges.flatMap(([l,r])=>b<=l||a>=r?[[l,r]]:[[l,Math.max(l,a)],[Math.min(r,b),r]].filter(([x,y])=>y>x));return ranges;
}

// Radial gangways follow the widening tiers. The same axes drive seats, nosings and walking.
export function aisleUs(s,d){if(s.id==='main'&&d<13.5)return[-34,PL.axis,0,17,34];return [-2,-1,0,1,2].map(i=>s.id==='south'?(ellipticalPlan.southA+Math.max(0,d))*Math.sin(i*ellipticalPlan.southHalfAngle/3):i*17*spanAt(s,d)/95);}

export const supportUAt=(s,u,d)=>s.id==='south'?u*(ellipticalPlan.southA+d)/(ellipticalPlan.southA+s.depth-.6):u;
