import assert from 'node:assert/strict';
import * as T from './dist/three.module.min.js';
import {stands,world,local,ground,move,floorHeight} from './dist/physics.js';
import {entrance as E,entryFloor,publicGateState as state,publicGateSegments,publicGateBlocked,togglePublicGate,advancePublicGate,entrySpawn} from './dist/entrance-layout.js';
import {buildModel} from './dist/model.js';
import {publicStairs,publicLayout as P,publicAt,vestibuleSections} from './dist/public-layout.js';
const s=stands[0],body=(u,d,h)=>{const[x,z]=world(s,u,d);return{x,z,floor:ground(x,z,h)};};
function follow(p,points,speed,dt){for(const[u,d]of points){const a=local(s,p.x,p.z),n=Math.ceil(Math.hypot(u-a.u,d-a.d)/(speed*dt));for(let i=1;i<=n;i++){const[x,z]=world(s,a.u+(u-a.u)*i/n,a.d+(d-a.d)*i/n);move(p,x-p.x,z-p.z);assert(Math.hypot(p.x-x,p.z-z)<.025,JSON.stringify({u,d,speed,dt,actual:local(s,p.x,p.z),floor:p.floor}));}}}
// The old branches and connectors are absent from the actual walkable footprint.
for(const u of[-6.6,6.6])for(const d of[15,20,25])assert(!publicAt(u,d),'obsolete branch/connector still exists');
for(const u of[-4,0,4])assert(publicAt(u,11.35)&&entryFloor(u,11.35)===0,'lateral turn must precede any rise');
assert(P.rampStart<P.passBack&&P.rampStart<=P.passFront,'crossing is after ramp');
let routes=0,blocks=0;
for(const speed of[6,12,24,36])for(const dt of[1/60,.1,.12])for(const lane of[-1,1]){
 state.progress=state.target=1;const p=body(lane,39,0);
 const front=[[lane,32],[lane,25],[lane,11.35],[lane,8],[lane,4],[lane,1],[8,1]];
 follow(p,front,speed,dt);assert.equal(p.floor,0);follow(p,[...front].reverse(),speed,dt);follow(p,[[lane,39]],speed,dt);routes++;
 for(const st of publicStairs){
  const side=st.dir,mid=st.top+side,q=body(lane,39,0);
  const path=[[lane,25],[lane,11.35],[side*4,11.35],[st.foot-side*.8,11.35],[mid,11.35],[mid,13.35],[0,13.35],[0,21],[0,23.4]];
  follow(q,path,speed,dt);assert(Math.abs(q.floor-7.98)<1e-6,'cabina via lateral landing turn');follow(q,[...path].reverse(),speed,dt);follow(q,[[lane,39]],speed,dt);assert.equal(q.floor,0);routes++;
  const by=body(lane,25,0),pass=[[lane,11.35],[side*4,11.35],[side*4,9.2],[side*49,9.2],[side*4,9.2],[lane,9.2],[lane,25]];
  follow(by,pass,speed,dt);assert.equal(by.floor,0,'bypass returns without climbing stair');routes++;
 }
 state.progress=state.target=0;
 for(const side of[-1,1]){const b=body(lane,E.portalD+side*5,0),[x,z]=world(s,lane,E.portalD-side*5);for(let t=0;t<3;t+=dt){const len=Math.hypot(x-b.x,z-b.z)||1;move(b,(x-b.x)/len*speed*dt,(z-b.z)/len*speed*dt);}const d=local(s,b.x,b.z).d;assert(side>0?d>E.portalD+.30:d<E.portalD-.30,'closed public gate crossed');blocks++;}
 state.progress=state.target=1;
 for(const d of[7,16,20,31]){const b=body(lane,d,entryFloor(lane,d)),[x,z]=world(s,lane>0?5:-5,d);move(b,x-b.x,z-b.z);assert(Math.abs(local(s,b.x,b.z).u)<2.5,'axial side wall crossed');blocks++;}
 const b=body(-1,7,0),[x,z]=world(s,1,7);move(b,x-b.x,z-b.z);assert(local(s,b.x,b.z).u<-.3,'central rail crossed');blocks++;
 for(const st of publicStairs){
  const u=st.foot+st.dir*3,by=body(u,9.2,0),[x,z]=world(s,u,11.5);move(by,x-by.x,z-by.z);assert(local(s,by.x,by.z).d<9.75,'bypass crossed stair stringer');blocks++;
  const guard=body(st.top+st.dir,11.35,4.2),[gx,gz]=world(s,st.end+st.dir*3,11.35);move(guard,gx-guard.x,gz-guard.z);assert((local(s,guard.x,guard.z).u-st.foot)*st.dir<P.stairSteps*P.stairTread+1.69,'landing end guard crossed');assert(Math.abs(guard.floor-4.2)<1e-9);blocks++;
 }
 for(const u of[-32,32]){const by=body(u,9.2,0),[x,z]=world(s,u,7);move(by,x-by.x,z-by.z);assert(local(s,by.x,by.z).d>8.79,'field-side wall crossed');blocks++;}
 for(const u of[-32,32]){const top=body(u,13.35,4.2),[x,z]=world(s,u,11.35);move(top,x-top.x,z-top.z);assert(local(s,top.x,top.z).d>=13.05,'upper parapet must include body radius');assert(Math.abs(top.floor-4.2)<1e-9);blocks++;}
 const door=body(-1,29.2,0);const end=world(s,-6,29.2);move(door,end[0]-door.x,end[1]-door.z);assert(local(s,door.x,door.z).u> -2.53,'closed right leaf crossed');blocks++;
}
// An obstruction midway through the angular sweep must stop either gate leaf.
let sweeps=0;
for(const direction of[0,1])for(const side of[-1,1]){
 state.progress=direction?0:1;state.target=direction;state.blocked=false;
 const seg=publicGateSegments(.5).find(g=>g.side===side),b={x:(seg.a[0]+seg.b[0])/2,z:(seg.a[1]+seg.b[1])/2,floor:0};
 for(let i=0;i<200;i++)advancePublicGate(.04,b);
 assert(state.blocked&&state.progress!==state.target,'swept collision failed');assert(!publicGateBlocked(b.x,b.z,b.floor),'gate hit visitor');
 for(let i=0;i<200;i++)advancePublicGate(.04,{...entrySpawn,x:entrySpawn.x-3});assert.equal(state.progress,state.target,'cleared gate resumes');sweeps++;
}
state.progress=state.target=1;togglePublicGate();assert.equal(state.target,0);togglePublicGate();assert.equal(state.target,1);
const upper=body(17,31,floorHeight(s,31));follow(upper,[[-17,31],[17,31]],36,.12);assert.equal(upper.floor,floorHeight(s,31),'short facade ribs must not obstruct the upper gallery');
T.TextureLoader.prototype.loadAsync=async()=>new T.DataTexture(new Uint8Array([170,170,170,255]),1,1);
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},fillText(){}})})};
const scene=new T.Scene(),model=await buildModel(scene,{capabilities:{getMaxAnisotropy:()=>8}},()=>{});scene.updateMatrixWorld(true);
const ray=new T.Raycaster(),samples=[];let minimumHeadroom=Infinity;
for(const u of[-1,1])for(let d=.2;d<32.9;d+=.3)samples.push([u,d]);
for(const st of publicStairs){for(let i=0;i<P.stairSteps;i++)samples.push([st.foot+st.dir*(i+.5)*.30,11.35]);samples.push([st.top+st.dir,11.35]);}
for(const side of[-1,1]){for(let u=4;u<50;u+=1.7)samples.push([side*u,9.2]);}
samples.push([-2.2,29.2]);
for(const[u,d]of samples){const[x,z]=world(s,u,d),h=entryFloor(u,d);ray.set(new T.Vector3(x,h+.06,z),new T.Vector3(0,-1,0));const hit=ray.intersectObjects(model.publicEntrance.floors,false)[0];assert(hit&&Math.abs(hit.point.y-h)<.016,'rendered entry floor mismatch '+u+','+d);
 ray.set(new T.Vector3(x,h+.01,z),new T.Vector3(0,1,0));const roof=ray.intersectObjects(scene.children,true).find(r=>!r.object.material.transparent);if(roof){const clearance=roof.point.y-h;minimumHeadroom=Math.min(minimumHeadroom,clearance);assert(clearance>=2.6-1e-5,'headroom '+u+','+d+' = '+clearance);}
}
// Sample a patch of visible pitch; retained fence rods can occlude individual rays.
let viewRays=0,viewSamples=0;const sightlineResults=[];
for(const d of[31,27,24]){const[x,z]=world(s,1,d),origin=new T.Vector3(x,1.7,z);let clear=0,total=0;const visibleColumns=new Set();for(const tx of[-5,0,5,10,15,20,25])for(const tz of[-2,-1.5,-1,-.5,0]){const target=new T.Vector3(tx,.04,tz),dir=target.clone().sub(origin);ray.far=dir.length()-.3;ray.set(origin,dir.normalize());const obstruction=ray.intersectObjects(scene.children,true).find(h=>!h.object.material?.transparent&&h.object.material?.opacity!==0);if(!obstruction){clear++;visibleColumns.add(tx);}total++;}assert(visibleColumns.size>=3,'no distributed pitch view from '+d); sightlineResults.push({distance:d,clear,total});viewRays+=clear;viewSamples+=total;}
// The former bridge guard must not cross the retained upper central stair exit.
for(const offset of[.55,1.1]){const a=world(s,0,19.8),b=world(s,0,21.8),origin=new T.Vector3(a[0],7.98+offset,a[1]),target=new T.Vector3(b[0],7.98+offset,b[1]),dir=target.clone().sub(origin);ray.far=dir.length();ray.set(origin,dir.normalize());assert(!ray.intersectObjects(scene.children,true).find(h=>!h.object.material?.transparent),'obsolete guard across upper landing');}
// Actual longitudinal slot: middle of each landing and an open bypass segment see sky.
for(const[u,d]of[[20.2,11.35],[-16.2,11.35],[28,9.2],[-25,9.2]]){const[x,z]=world(s,u,d),h=entryFloor(u,d);ray.far=50;ray.set(new T.Vector3(x,h+.06,z),new T.Vector3(0,1,0));const hit=ray.intersectObjects(scene.children,true).find(h=>!h.object.material?.transparent);assert(!hit,'passage daylight opening blocked '+hit?.object.name);}
// Landing turns are open between eye and shin level; end protection remains modelled.
for(const st of publicStairs)for(const offset of[.55,1.0]){const a=world(s,st.top+st.dir,11.35),b=world(s,st.top+st.dir,13.35),origin=new T.Vector3(a[0],4.2+offset,a[1]),target=new T.Vector3(b[0],4.2+offset,b[1]),dir=target.clone().sub(origin);ray.far=dir.length();ray.set(origin,dir.normalize());assert(!ray.intersectObjects(scene.children,true).find(h=>!h.object.material?.transparent),'stair turn blocked by actual mesh');}
ray.far=Infinity;
for(const progress of[0,.25,.5,.75,1]){state.progress=progress;model.publicEntrance.update();scene.updateMatrixWorld(true);const segments=publicGateSegments();model.publicEntrance.leaves.forEach((leaf,i)=>{const tip=leaf.localToWorld(new T.Vector3(E.half,0,0));assert(Math.hypot(tip.x-segments[i].b[0],tip.z-segments[i].b[1])<1e-7,'gate mesh/collision disagree');});}
// The entire gate sweep stays clear of masonry, including leaf/frame thickness.
let gateWallClearanceSamples=0;
for(let step=0;step<=20;step++){state.progress=step/20;model.publicEntrance.update();scene.updateMatrixWorld(true);
 for(const leaf of model.publicEntrance.leaves)for(const a of[.20,.70,1.35,2.2,2.5])for(const h of[.15,1.15,2.1,3.2]){
  const origin=leaf.localToWorld(new T.Vector3(a,h,-.061)),target=leaf.localToWorld(new T.Vector3(a,h,.061)),direction=target.clone().sub(origin);ray.set(origin,direction.normalize());ray.far=.122;
  assert(!ray.intersectObjects(model.publicEntrance.shell,false).length,'moving entrance leaf intersects masonry');gateWallClearanceSamples++;
 }
}
// Walls extend to the stepped soffit on both sides, including above the right doorway.
let soffitJunctionSamples=0;
for(const q of vestibuleSections)for(const side of[-1,1]){
 const d=(q.d0+q.d1)/2,[x,z]=world(s,side*2.4,d),[xx,zz]=world(s,side*3.15,d);
 ray.set(new T.Vector3(x,q.top-.04,z),new T.Vector3(xx-x,0,zz-z).normalize());ray.far=.75;
 assert(ray.intersectObjects(model.publicEntrance.shell,false).length,'wall stops below soffit '+d);soffitJunctionSamples++;
}
// Both partial gate leaves still block fast movement using the same swept movement solver.
for(const speed of[6,12,24,36])for(const progress of[.25,.5,.75])for(const side of[-1,1]){
 state.progress=state.target=progress;const leaf=publicGateSegments(progress).find(l=>l.side===side),u=side*1.4,b=body(u,39,0);
 for(let i=0;i<90;i++){const tx=(leaf.a[0]+leaf.b[0])/2,tz=(leaf.a[1]+leaf.b[1])/2,l=Math.hypot(tx-b.x,tz-b.z)||1;move(b,(tx-b.x)/l*speed*.12,(tz-b.z)/l*speed*.12);assert(!publicGateBlocked(b.x,b.z,b.floor),'partial gate crossed at '+speed);}
}
// A single exposed ground layer: samples extend across all three former base rings.
let pavementRays=0;
for(const x of[-109.7,-107.3,-105.4,-101.1,-97.3])for(const z of[-43.7,-12.2,11.7,39.3]){ray.set(new T.Vector3(x,.2,z),new T.Vector3(0,-1,0));const hits=ray.intersectObjects(scene.children,true).filter(h=>h.point.y<.04&&h.point.y>-.21&&!h.object.material.transparent),objects=[...new Set(hits.map(h=>h.object))];assert.equal(objects.length,1,'overlapping forecourt '+x+','+z+' '+objects.map(o=>o.name));assert.equal(objects[0],model.publicEntrance.apron);pavementRays++;}
state.progress=state.target=1;
console.log(JSON.stringify({kind:'CPU route logic and rays against actual Three.js meshes; no GPU rendering',returnRoutes:routes,collisionCases:blocks,sweptGateCases:sweeps,floorAndCeilingSamples:samples.length,minimumSampledHeadroom:minimumHeadroom,forecourtSingleLayerSamples:pavementRays,publicGateTransforms:10,gateWallClearanceSamples,soffitJunctionSamples,partialGateCases:24,fieldSightlines:{clear:viewRays,total:viewSamples,origins:sightlineResults}}));
