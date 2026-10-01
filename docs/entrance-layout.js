import {whiteGate} from './white-gate.js';
import {stands,world,local,spanAt} from './stadium-layout.js';
import {publicLayout,publicAt,publicFloor,publicBlocked} from './public-layout.js';
// Proposed metres fitted to the retained +4.20 m gallery, not a measured survey.
export const entrance={...publicLayout,gateHeight:3.3,wallD:30.45,galleryD:12.5,landingD:publicLayout.rampTop,splitD:publicLayout.rampTop,rampEnd:publicLayout.rampStart,landingY:.72,rise:.18,tread:.44,forecourtWest:-110.4,forecourtZ:62};
export const entryHalf=()=>2.7;
export const entryAt=publicAt;
export const entryFloor=publicFloor;
export const entryBreaks=()=>[0,2,3.76,4.5,6.26,8.5,12.5,20,22,30.5,33.18];
export const entryBlocked=(u,d,h)=>h>5?false:publicBlocked(u,d);
// Keep the arrival inside the forecourt, clear of the retained street lamp.
export const entrySpawn=(()=>{const[x,z]=world(stands[0],entrance.axis,37);return{x,z,y:1.7,floor:0,vx:0,vz:0};})();
export const publicGateState={progress:1,target:1,blocked:false};
// Both leaves close on the same chord midpoint, with no curved/deformed doors.
export function publicGateSegments(progress=publicGateState.progress){
 const hinges=[-1,1].map(side=>world(stands[0],entrance.axis+side*entrance.half,entrance.portalD));
 const mid=hinges[0].map((v,i)=>(v+hinges[1][i])/2);
 return[-1,1].map((side,i)=>{const a=hinges[i],dx=mid[0]-a[0],dz=mid[1]-a[1],width=Math.hypot(dx,dz),closedAngle=Math.atan2(-dz,dx),angle=closedAngle-side*progress*Math.PI/2;return{a,b:[a[0]+width*Math.cos(angle),a[1]-width*Math.sin(angle)],side,width,closedAngle,angle};});
}
export function segmentDistance(x,z,a,b){const dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz||1)));return Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t);}
export function publicGateBlocked(x,z,h=0,progress=publicGateState.progress,bodyHeight=1.85,margin=.37){return h<entrance.gateHeight&&h+bodyHeight>0&&publicGateSegments(progress).some(s=>segmentDistance(x,z,s.a,s.b)<margin);}
export function publicGateInReach(body){const{u,d}=local(stands[0],body.x,body.z);return body.floor<1&&Math.abs(u-entrance.axis)<4.6&&Math.abs(d-entrance.portalD)<2.8;}
export function togglePublicGate(){publicGateState.target=publicGateState.target?0:1;publicGateState.blocked=false;}
export function advancePublicGate(dt,body){const s=publicGateState,next=s.progress+Math.sign(s.target-s.progress)*Math.min(Math.abs(s.target-s.progress),Math.min(.12,dt)/3.2);s.blocked=false;if(next===s.progress)return false;const count=Math.max(1,Math.ceil(Math.abs(next-s.progress)*Math.PI/2*entrance.half/.025));for(let i=1;i<=count;i++)if(publicGateBlocked(body.x,body.z,body.floor,s.progress+(next-s.progress)*i/count,body.collisionHeight??1.85,body.collisionMargin??.37)){s.blocked=true;return false;}s.progress=next;return true;}
// Retain the original facade bays and openings. Only the end returns follow the wider rear tier.
export const facade={half:45,wallFront:30.3,wallBack:30.6,wallTop:11.96,whiteTop:11.70,kneeY:9.0,columnD:30.85,columnWidth:.50,columnDepth:.78,columnTop:9.0,corniceD:33.12,corniceY:11.94};
export const facadeRibs=[-44.75,-36.65,-28.55,-20.45,-12.35,-4.25,4.25,12.35,20.45,28.55,36.65,44.75];
export const facadeActiveRibs=facadeRibs.filter(u=>Math.abs(u-entrance.axis)>entrance.half+.6);
export const facadeEndRibs=[-1,1].map(side=>side*(spanAt(stands[0],facade.wallFront)/2-.53));
// A returned perimeter wall ends against the actual side shell, not in empty space.
export const perimeterReturn={a:[whiteGate.wallEnd,whiteGate.z],b:whiteGate.standEnd,height:3.04,thickness:.28};
export function exteriorWallBlocked(x,z,floor){
 if(floor<perimeterReturn.height&&floor+1.85>0&&segmentDistance(x,z,perimeterReturn.a,perimeterReturn.b)<.3+perimeterReturn.thickness/2)return true;
 return false;
}
export const entryObstacles=[{x:(-106.3+whiteGate.x-whiteGate.half)/2,z:whiteGate.z,w:whiteGate.x-whiteGate.half+106.3,d:.28},{x:-101,z:59,w:6,d:3.2},{x:(whiteGate.x+whiteGate.half+whiteGate.wallEnd)/2,z:whiteGate.z,w:whiteGate.wallEnd-whiteGate.x-whiteGate.half,d:.28}];
for(const du of[-3.35,3.35]){const[x,z]=world(stands[0],entrance.axis+du,34.5);entryObstacles.push({x,z,w:2,d:.065});}
