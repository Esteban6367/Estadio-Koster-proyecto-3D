import {stands,world,local} from './stadium-layout.js';
import {publicLayout,publicAt,publicFloor,publicBlocked} from './public-layout.js';
// Proposed metres fitted to the retained +4.20 m gallery, not a measured survey.
export const entrance={...publicLayout,gateHeight:3.3,wallD:30.45,galleryD:12.5,landingD:publicLayout.rampTop,splitD:publicLayout.rampTop,rampEnd:publicLayout.rampStart,landingY:.72,rise:.18,tread:.44,forecourtWest:-110.4,forecourtZ:62};
export const entryHalf=()=>2.7;
export const entryAt=publicAt;
export const entryFloor=publicFloor;
export const entryBreaks=()=>[0,2,3.76,4.5,6.26,8.5,12.5,20,22,30.5,33.18];
export const entryBlocked=(u,d,h)=>h>5?false:publicBlocked(u,d);
export const entrySpawn=(()=>{const[x,z]=world(stands[0],0,39);return{x,z,y:1.7,floor:0,vx:0,vz:0};})();
export const publicGateState={progress:1,target:1,blocked:false};
export function publicGateSegments(progress=publicGateState.progress){const a=progress*Math.PI/2,w=entrance.half;return[-1,1].map(side=>{const[x,z]=world(stands[0],side*w,entrance.portalD);return{a:[x,z],b:[x-w*Math.sin(a),z+side*w*Math.cos(a)],side};});}
export function segmentDistance(x,z,a,b){const dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz||1)));return Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t);}
export function publicGateBlocked(x,z,h=0,progress=publicGateState.progress){return h<entrance.gateHeight&&h+1.85>0&&publicGateSegments(progress).some(s=>segmentDistance(x,z,s.a,s.b)<.37);}
export function publicGateInReach(body){const{u,d}=local(stands[0],body.x,body.z);return body.floor<1&&Math.abs(u)<4.6&&Math.abs(d-entrance.portalD)<3.5;}
export function togglePublicGate(){publicGateState.target=publicGateState.target?0:1;publicGateState.blocked=false;}
export function advancePublicGate(dt,body){const s=publicGateState,next=s.progress+Math.sign(s.target-s.progress)*Math.min(Math.abs(s.target-s.progress),Math.min(.12,dt)/3.2);s.blocked=false;if(next===s.progress)return false;const count=Math.max(1,Math.ceil(Math.abs(next-s.progress)*Math.PI/2*entrance.half/.025));for(let i=1;i<=count;i++)if(publicGateBlocked(body.x,body.z,body.floor,s.progress+(next-s.progress)*i/count)){s.blocked=true;return false;}s.progress=next;return true;}
export const facadeRibs=Array.from({length:14},(_,i)=>(i-6.5)*8.5);
export const entryObstacles=[{x:-96.65,z:-62,w:19.3,d:.28},{x:-101,z:59,w:6,d:3.2}];
for(const u of[-3.35,3.35]){const[x,z]=world(stands[0],u,34.5);entryObstacles.push({x,z,w:2,d:.065});}
