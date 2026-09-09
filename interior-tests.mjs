import {routeWaypoints,tunnel,undergroundFloor} from './dist/underground-layout.js';
import assert from 'node:assert/strict';
import {stands,world,local,move,ground,allowed} from './dist/physics.js';
import {interiorFurniture,interiorWalls,facilities} from './dist/interior-layout.js';
import {resetGate,toggleGate,advanceGate,gate} from './dist/boundaries.js';
const s=stands[0],at=(u,d)=>{const[x,z]=world(s,u,d);return{x,z,floor:facilities.floor};};
function follow(p,u,d){const a=local(s,p.x,p.z),n=Math.ceil(Math.hypot(u-a.u,d-a.d)/.05);for(let i=1;i<=n;i++){const[x,z]=world(s,a.u+(u-a.u)*i/n,a.d+(d-a.d)*i/n);move(p,x-p.x,z-p.z);assert(Math.hypot(p.x-x,p.z-z)<.025,'route blocked '+JSON.stringify({u,d,actual:local(s,p.x,p.z),floor:p.floor}));}return p;}
resetGate();toggleGate();for(let i=0;i<200;i++)advanceGate(.02,null);
for(const side of[-1,1]){
 const p=at(0,13.6);follow(p,side*7.5,13.6);follow(p,side*7.5,18.2);assert.equal(p.floor,facilities.floor);
 follow(p,side*7.5,24.8);follow(p,side*10.2,24.8);follow(p,side*10.2,26.7);follow(p,side*10.2,24.8);
 follow(p,side*6.8,24.8);follow(p,side*6.8,26.4);follow(p,side*6.8,24.8);follow(p,side*7.5,24.8);
 follow(p,side*7.5,13.6);follow(p,0,13.6);for(const[u,d]of routeWaypoints)follow(p,u,d);assert.equal(p.floor,0);
 for(const[u,d]of [...routeWaypoints].reverse())follow(p,u,d);
 follow(p,0,13.6);follow(p,side*7.5,13.6);follow(p,side*7.5,18.2);assert.equal(p.floor,facilities.floor,'return from field');
}
let cases=0;
for(const speed of[6,12,24,36])for(const dt of[1/60,.1,.12]){
 for(const side of[-1,1]){
  const p=at(side*7.5,19),t=world(s,side*19,19),len=Math.hypot(t[0]-p.x,t[1]-p.z),vx=(t[0]-p.x)/len*speed*dt,vz=(t[1]-p.z)/len*speed*dt;
  for(let i=0;i<Math.ceil(2/dt);i++)move(p,vx,vz);assert(Math.abs(local(s,p.x,p.z).u)<17,'no furniture/wall tunnelling');cases++;
 }
 const p=at(0,0);p.floor=tunnel.floor;const t=world(s,5,0),len=Math.hypot(t[0]-p.x,t[1]-p.z);for(let i=0;i<Math.ceil(1/dt);i++)move(p,(t[0]-world(s,0,0)[0])/len*speed*dt,(t[1]-world(s,0,0)[1])/len*speed*dt);assert(Math.abs(local(s,p.x,p.z).u)<1.6,'tunnel side wall');cases++;
}
for(const o of interiorFurniture){const p=at(o.u,o.d);assert.equal(ground(p.x,p.z,facilities.floor),facilities.floor);assert(!allowed(p.x,p.z,p.x,p.z,facilities.floor),'furniture collider');}
for(const w of interiorWalls){const p=at((w.u0+w.u1)/2,(w.d0+w.d1)/2);assert(!allowed(p.x,p.z,p.x,p.z,facilities.floor),'interior wall collider');}
console.log(`PASS: both dressing rooms, showers and toilet access, underground stairs/tunnel/exit/return; ${cases} collision runs through furniture and tunnel walls at 6/12/24/36 m/s.`);
