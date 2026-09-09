import {facilities} from './dist/interior-layout.js';
import assert from 'node:assert/strict';
import * as T from './dist/three.module.min.js';
import {buildModel} from './dist/model.js';
T.TextureLoader.prototype.loadAsync=async()=>new T.DataTexture(new Uint8Array([170,170,170,255]),1,1);
globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>({fillRect(){},fillText(){}})})};
const scene=new T.Scene();const model=await buildModel(scene,{capabilities:{getMaxAnisotropy:()=>8}},()=>{});
let meshes=0,instances=0,triangles=0;
scene.traverse(o=>{if(!o.isMesh)return;meshes++;const p=o.geometry.attributes.position;assert(p&&p.count>0);for(const v of p.array)assert(Number.isFinite(v),'non-finite vertex');assert(o.material);if(o.isInstancedMesh){instances+=o.count;assert(o.count>0);for(const v of o.instanceMatrix.array)assert(Number.isFinite(v));}triangles+=(o.geometry.index?o.geometry.index.count:p.count)/3*(o.count||1);});
assert.equal(model.lamps.length,4);assert.equal(model.roofs.length,3);assert(model.seatGroups.length>=12);assert(instances>12000);assert.equal(model.failures.length,0);
console.log(JSON.stringify({meshes,instances,triangles,seats:model.seatGroups.reduce((n,m)=>n+m.count,0),projectors:model.lamps.length,roofs:model.roofs.length}));
const {stands,world,floorHeight,ground}=await import('./dist/physics.js');scene.updateMatrixWorld(true);const floors=[];scene.traverse(o=>{if(o.isMesh&&o.material===model.mats.concrete)floors.push(o);});floors.push(...model.playerFacilities.floors,...model.publicEntrance.floors);const ray=new T.Raycaster();
for(const s of stands)for(const d of[.5,2.2,3.1,10.7,13.5,s.depth-1]){const[x,z]=world(s,1,d);ray.set(new T.Vector3(x,ground(x,z)+.3,z),new T.Vector3(0,-1,0));const hit=ray.intersectObjects(floors,false)[0];assert(hit,`${s.id} missing floor at ${d}`);assert(Math.abs(hit.point.y-ground(x,z))<.02,`${s.id} rendered stairs disagree with collision surface at ${d}: ${hit.point.y}`);}console.log('PASS: actual mesh raycasts agree with all staircase and gallery heights.');

assert(model.neighborhood.housesCount>150);assert(model.scoreMesh);model.setScreen(false,true);assert.equal(model.scoreMesh.material.emissiveIntensity,0);assert.equal(model.scoreMesh.material.map,null);model.setScreen(true,true);assert(model.scoreMesh.material.map);assert(model.architecturalLights.length>=4);console.log('PASS: neighbourhood, architecture lighting and independent scoreboard. Houses:',model.neighborhood.housesCount);

const {moat,moats,at,gateState,gate,bridgeLevel}=await import('./dist/boundaries.js');
const surfaces=scene.children;
for(const m of moats)for(const u of[m.start+.5,m.start*.7,-5,5,m.end*.7,m.end-.5]){
 const[x,z]=world(m.s,u,(m.innerD+m.outerD)/2);ray.set(new T.Vector3(x,.5,z),new T.Vector3(0,-1,0));const hits=ray.intersectObjects(surfaces,true),water=model.boundaries.waters.find(w=>w.userData.moat===m.id);
 assert(hits.length&&hits[0].object===water,'water hidden at '+m.id+' '+u);
 assert(Math.abs(hits[0].point.y-m.water)<.001);assert(hits.some(h=>Math.abs(h.point.y-m.bottom)<.001),'channel bottom missing');
 for(const sign of[-1,1]){ray.set(new T.Vector3(x,-.8,z),new T.Vector3(-Math.sin(m.s.angle)*sign,0,-Math.cos(m.s.angle)*sign));const side=ray.intersectObjects(model.boundaries.blocks,false)[0];assert(side&&side.distance<1,'channel wall missing');}
}
const bp=at(0,-2.7,0);ray.set(new T.Vector3(bp[0],.5,bp[2]),new T.Vector3(0,-1,0));assert.equal(ray.intersectObjects(surfaces,true)[0].object,model.boundaries.water,'continuous water where the bridge used to be');assert.equal(model.boundaries.bridge,null);
const layout=await import('./dist/stadium-layout.js');for(const water of model.boundaries.waters){const m=moats.find(m=>m.id===water.userData.moat),p=water.geometry.attributes.position;for(let i=0;i<p.count;i++){const q=layout.local(m.s,p.getX(i),p.getZ(i));assert(q.d>m.innerD+m.wall&&q.d<m.outerD-m.wall);assert(p.getY(i)+water.userData.maxWaveHeight<m.crest);}}
for(const s of stands)for(const u of[s.id==='main'?34:17,s.accessU])for(const d of[s.baseDepth-1,s.depth-1]){const[x,z]=world(s,u,d),h=floorHeight(s,d);ray.set(new T.Vector3(x,h+.3,z),new T.Vector3(0,-1,0));const hit=ray.intersectObjects(floors,false)[0];assert(hit&&Math.abs(hit.point.y-h)<.02,'upper gallery deck missing '+s.id);}
const booth=model.architectureDetails.find(x=>x.booth).booth;assert.equal(model.architectureDetails.filter(x=>x.booth).length,1);const cabinP=world(stands[0],0,layout.cabin.front+1);ray.set(new T.Vector3(cabinP[0],booth.floor+.3,cabinP[1]),new T.Vector3(0,-1,0));assert.equal(ray.intersectObjects(surfaces,true)[0].object,booth.slab,'accessible cabin floor');
for(const s of stands)for(const d of[s.baseDepth-1,s.depth-1]){const[x,z]=world(s,s.accessU+(s.id==='main'?1:0),d),h=ground(x,z);ray.set(new T.Vector3(x,h+.05,z),new T.Vector3(0,1,0));const ceiling=ray.intersectObjects(surfaces,true)[0];assert(!ceiling||ceiling.distance>2.0,'low ceiling in lower access '+s.id);}
model.setStandLights(true,true,100);assert(model.standLights.every(x=>x.light.intensity===x.power));model.setStandLights(false,true);assert(model.standLights.every(x=>x.light.intensity===0));model.setStandLights(true,false);assert(model.standLights.every(x=>x.light.intensity===0));
const camera=new T.PerspectiveCamera();camera.position.set(-55,1.7,0);gateState.progress=1;model.boundaries.update(20,camera,'high');assert.equal(model.boundaries.leaf.position.z,gate.z);assert.equal(model.boundaries.leaf.rotation.y,-Math.PI/2);assert(model.boundaries.lod.some(l=>l.near.visible&&!l.flat.visible));camera.position.set(0,160,190);model.boundaries.update(21,camera,'low');assert(model.boundaries.lod.every(l=>!l.near.visible&&l.flat.visible));model.boundaries.setNight(true);assert(model.boundaries.accessLights.every(l=>l.intensity===9));model.boundaries.setNight(false);assert(model.boundaries.accessLights.every(l=>l.intensity===0));gateState.progress=0;
console.log('PASS: actual raycasts through terrain holes onto water and bottom, containment walls, removed bridge, gate mesh transform, close/distant chain-link LOD and access lights.');

// Real mesh tests, with textures replaced by a 1 px sample; these do not render with a GPU.
const underground=await import('./dist/underground-layout.js');
const interiorSamples=[...[ [0,13.6],[-9,13.6],[9,13.6],[-7.5,18],[7.5,18],[-7.5,24.8],[7.5,24.8],[-6.8,26.4],[6.8,26.4]].map(([u,d])=>[u,d,facilities.floor]),...[11.5,9,7.3,4.6,1,0,-2.7].map(d=>[0,d,underground.undergroundFloor(0,d)]),...[0,3,6.5,9,13].map(u=>[u,-6.55,underground.undergroundFloor(u,-6.55)])];
for(let i=0;i<13;i++)for(const origin of[12.3,6.54]){const d=origin-(i+.5)*.32;interiorSamples.push([0,d,underground.undergroundFloor(0,d)]);}
for(let i=0;i<13;i++)for(const origin of[1.6,7.36]){const u=origin+(i+.5)*.32;interiorSamples.push([u,-6.55,underground.undergroundFloor(u,-6.55)]);}
for(const[u,d,h]of interiorSamples){
 const[x,z]=world(stands[0],u,d);ray.near=0;ray.far=20;ray.set(new T.Vector3(x,h+.12,z),new T.Vector3(0,-1,0));const floor=ray.intersectObjects(surfaces,true).find(h=>!h.object.material?.transparent);assert(floor&&Math.abs(floor.point.y-h)<.022,'floor '+u+','+d+' expected '+h+' actual '+floor?.point.y);
 ray.set(new T.Vector3(x,h+.025,z),new T.Vector3(0,1,0));const roof=ray.intersectObjects(surfaces,true).find(h=>!h.object.material?.transparent);assert(roof&&roof.point.y-h>=2.6,'headroom '+u+','+d+' '+(roof?.point.y-h));
}
const tunnelP=world(stands[0],0,0);for(const sign of[-1,1]){ray.set(new T.Vector3(tunnelP[0],underground.tunnel.floor+1.7,tunnelP[1]),new T.Vector3(0,0,sign));ray.far=3;const hit=ray.intersectObjects(surfaces,true)[0];assert(hit&&hit.distance>1.5&&hit.distance<1.9,'real underground wall');}
assert(Math.abs(underground.tunnel.roofTop-moat.slabBottom+.25)<1e-8,'construction separation below moat');
assert(model.playerFacilities.lights.length>=16&&model.playerFacilities.lights.every(l=>l.intensity>0));
// The exit retaining walls/canopy must stay strictly outside the track's x=-51 m edge.
for(const[u,d]of[[0,-8.47],[15.3,-8.47]])assert(world(stands[0],u,d)[0]<-51.2,'exit canopy invades track');
console.log('PASS: '+interiorSamples.length+' actual floor/headroom rays in rooms, descent, below moat and exit; 0.25 m separation below moat slab; real side walls and clear track. GPU appearance not tested.');
