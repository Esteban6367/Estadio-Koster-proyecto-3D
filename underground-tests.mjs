import {facilities,interiorAt} from './dist/interior-layout.js';
import assert from 'node:assert/strict';
import {stands,world,local,move,ground,allowed} from './dist/physics.js';
import {tunnel,routeWaypoints,undergroundAt,undergroundFloor,tunnelWalls,distanceToWall} from './dist/underground-layout.js';
import {moat,gate,gateState,gateSegment,toggleGate,advanceGate,resetGate} from './dist/boundaries.js';
const s=stands[0],at=(u,d,h)=>{const[x,z]=world(s,u,d);return{x,z,floor:ground(x,z,h)};};
let routes=0,moves=0;
function follow(p,points,speed,dt){for(const[u,d]of points){const a=local(s,p.x,p.z),length=Math.hypot(u-a.u,d-a.d),n=Math.ceil(length/(speed*dt));for(let i=1;i<=n;i++){const[x,z]=world(s,a.u+(u-a.u)*i/n,a.d+(d-a.d)*i/n);const before=p.floor;move(p,x-p.x,z-p.z);assert(Math.hypot(x-p.x,z-p.z)<.03,JSON.stringify({u,d,speed,dt,at:local(s,p.x,p.z),floor:p.floor}));if(p.floor<-.01)assert(undergroundAt(...Object.values(local(s,p.x,p.z)))||interiorAt(...Object.values(local(s,p.x,p.z))),'remains in private cavity');moves++;}}}
resetGate();toggleGate();for(let i=0;i<200;i++)advanceGate(.02,null);
for(const speed of[6,12,24,36])for(const dt of[1/60,.1,.12])for(const side of[-1,1]){
 const p=at(side*7.5,18,facilities.floor),room=[[side*7.5,13.6],[0,13.6]],path=[...room,...routeWaypoints];follow(p,path,speed,dt);assert(Math.hypot(p.x,p.z)<.04&&Math.abs(p.floor)<.001,'arrive at centre of field');follow(p,[...path].reverse(),speed,dt);follow(p,[[side*7.5,18]],speed,dt);assert(Math.abs(p.floor-facilities.floor)<.001,'return to dressing room');routes++;
}
// Same plan coordinates, separate vertical levels. No automatic lift to the public floor.
for(const d of[-3,-1,0,1,3,6,8,11]){const low=at(0,d,tunnel.floor),high=at(0,d);assert(low.floor<=high.floor);const initial=low.floor;move(low,.08,0);assert(Math.abs(low.floor-initial)<.24,'no layer jump');}
// Public central entry and front stairs remain walkable over the underground route.
for(const speed of[6,12,24,36])for(const dt of[1/60,.1,.12]){
 const p=at(1,s.depth+4,0);follow(p,[[1,11.5],[1,.5],[51.7,.5],[51.7,13.35],[20.2,13.35],[20.2,11.35],[11,11.35],[6.6,11.35],[1,11.35],[1,25],[1,s.depth+4]],speed,dt);assert.equal(p.floor,0);routes++;
}
// No falling through side walls into the exit well and no tunnelling out underground.
let wallRuns=0;
for(const speed of[6,12,24,36])for(const dt of[1/60,.1,.12])for(const [u,d,h,du,dd]of[[0,0,-4.8,5,0],[0,-2.7,-4.8,-5,0],[6.5,-6.55,-2.4,0,5],[6.5,-6.55,-2.4,0,-5],[6.5,-9,0,0,4],[6.5,-4.3,0,0,-4]]){
 const p=at(u,d,h),[tx,tz]=world(s,u+du,d+dd),len=Math.hypot(tx-p.x,tz-p.z),vx=(tx-p.x)/len*speed*dt,vz=(tz-p.z)/len*speed*dt;
 for(let t=0;t<1;t+=dt)move(p,vx,vz);const q=local(s,p.x,p.z);if(h>=0)assert(p.floor>=0,'public cannot fall into well');else assert(Math.abs(p.floor-h)<.23,'stay at underground level');assert(tunnelWalls.every(w=>distanceToWall(q.u,q.d,w)>=.4-.01),'do not cross wall');wallRuns++;
}
assert.equal(moat.water,-.02);assert.equal(moat.slabBottom,-1.4);assert.equal(tunnel.floor,-4.8);assert(Math.abs(moat.slabBottom-tunnel.roofTop-.25)<1e-8);
resetGate();console.log(`PASS: ${routes} complete return routes (24 both-room/field routes and 12 public routes), ${moves} controller requests, ${wallRuns} underground/well collision runs at 6/12/24/36 m/s and 60/10/8.3 FPS; stacked floors and moat levels.`);
