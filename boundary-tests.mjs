import assert from 'node:assert/strict';
import {move,allowed,world,local,stands,ground} from './dist/physics.js';
import {moats,gate,gateState,gateSegment,boundarySegments,segmentDistance,toggleGate,advanceGate,resetGate} from './dist/boundaries.js';
const s=stands[0],bodyAt=(u,d,h=0)=>{const[x,z]=world(s,u,d);return{x,z,floor:h};};
const animate=(body,seconds=4)=>{for(let t=0;t<seconds;t+=.02)advanceGate(.02,body);};
let cases=0;
for(const speed of[6,12,24,36])for(const dt of[1/60,.1,.12]){
 resetGate();for(const dir of[-1,1]){
  const p=bodyAt(dir===1?13:17,-6.55);for(let i=0;i<Math.ceil(1/dt);i++)move(p,0,-dir*speed*dt);
  const u=local(s,p.x,p.z).u;assert(dir===1?u<14.72:u>15.48,'closed player gate '+speed);cases++;
 }
 toggleGate();animate(null);assert.equal(gateState.progress,1);
 for(const dir of[-1,1]){const p=bodyAt(dir===1?13:17,-6.55);for(let i=0;i<Math.ceil(.8/dt);i++)move(p,0,-dir*speed*dt);assert(dir===1?local(s,p.x,p.z).u>16:local(s,p.x,p.z).u<14,'open player gate');cases++;}
 // Public route has no surface crossing, even exactly where the former bridge was.
 for(const m of moats){const[x,z]=world(m.s,0,.5),p={x,z,floor:0};move(p,Math.sin(m.s.angle)*speed,.0+Math.cos(m.s.angle)*speed);assert(local(m.s,p.x,p.z).d>m.outerD,'no surface crossing '+m.id);cases++;}
}
for(const q of boundarySegments){const x=(q.a[0]+q.b[0])/2,z=(q.a[1]+q.b[1])/2;assert(!allowed(x,z,x,z,0),'continuous railing/fence');}
// Occupancy protection throughout the full swing in both directions.
resetGate();toggleGate();const occupant={x:gate.x+1.5,z:gate.z+1.3,floor:0};animate(occupant);assert(gateState.blocked&&gateState.progress<1);let q=gateSegment();assert(segmentDistance(occupant.x,occupant.z,q.a,q.b)>=.42);
toggleGate();animate(occupant);assert.equal(gateState.progress,0,'reverse occupied opening');
toggleGate();animate(null);toggleGate();animate(occupant);assert(gateState.blocked&&gateState.progress>0);q=gateSegment();assert(segmentDistance(occupant.x,occupant.z,q.a,q.b)>=.42);
animate(null);assert.equal(gateState.progress,0,'resume closing when clear');
toggleGate();animate(null);toggleGate();const p=bodyAt(13,-6.55);for(let i=0;i<150;i++){move(p,0,-36*.016);advanceGate(.016,p);const q=gateSegment();assert(segmentDistance(p.x,p.z,q.a,q.b)>=.415,'moving visitor and leaf overlap');}
resetGate();console.log('PASS: '+cases+' gate / surface-separation runs at 6/12/24/36 m/s; all static fences; occupied swing stops, reverses and resumes; moving visitor at 36 m/s.');
