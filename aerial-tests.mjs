import assert from 'node:assert/strict';
import * as T from './dist/three.module.min.js';
import {referenceOrbit,placeOrbit,setDepthRange,stadiumBounds} from './dist/aerial-camera.js';
import {buildModel} from './dist/model.js';
import {world,local,stands} from './dist/stadium-layout.js';
// Project the actual reservation corners into several independent viewport sizes.
let projections=0,minSteps=Infinity;
for(const[w,h]of[[390,650],[390,844],[844,390],[1536,864],[1024,768]]){
 const c=new T.PerspectiveCamera(43,w/h,.12,1400),o=referenceOrbit(w/h);placeOrbit(c,o);setDepthRange(c,'air');c.updateMatrixWorld(true);
 for(const x of[stadiumBounds.min[0],stadiumBounds.max[0]])for(const y of[stadiumBounds.min[1],stadiumBounds.max[1]])for(const z of[stadiumBounds.min[2],stadiumBounds.max[2]]){
  const v=new T.Vector3(x,y,z).project(c);assert(Math.abs(v.x)<=.881&&Math.abs(v.y)<=.761&&Math.abs(v.z)<1,'stadium clipped by reference framing');projections++;
 }
 const a=new T.Vector3(0,.023,0).project(c).z,b=new T.Vector3(0,.038,0).project(c).z,steps=Math.abs(a-b)*.5*(2**24-1);assert(steps>6,'airborne depth precision');minSteps=Math.min(minSteps,steps);
 for(const r of[45,120,400,850])for(const e of[.18,.8,1.48]){o.r=r;o.e=e;placeOrbit(c,o);setDepthRange(c,'air');assert(c.position.y>0&&c.near>0&&c.near<c.far);}
 setDepthRange(c,'walk');assert.equal(c.near,.12,'nearby interiors keep walk clipping');
}
console.log('PASS:',projections,'reservation corner projections; portrait/landscape, bounded zoom, walk near reset. Min 24-bit modeled depth separation:',minSteps.toFixed(1),'steps. Mathematical projection, not GPU evidence.');
T.TextureLoader.prototype.loadAsync=async()=>new T.DataTexture(new Uint8Array([170,170,170,255]),1,1);
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},fillText(){}})})};
const scene=new T.Scene(),model=await buildModel(scene,{capabilities:{getMaxAnisotropy:()=>8}},()=>{});scene.updateMatrixWorld(true);const ray=new T.Raycaster();
// There must be exactly one opaque ground layer at unpainted field/track samples.
let groundRays=0;
for(const[x,z,kind]of[[3.23,21.47,'field'],[-25.21,29.11,'field'],[24.34,-39.12,'field'],[45.6,10.31,'track'],[-45.6,-12.13,'track'],[38.21,24.35,'grass'],[50.2,10.31,'curb']]){
 ray.set(new T.Vector3(x,.5,z),new T.Vector3(0,-1,0));const hits=ray.intersectObjects(scene.children,true).filter(h=>h.point.y>-.21&&h.point.y<.041&&!h.object.material.transparent),objects=[...new Set(hits.map(h=>h.object))];
 assert.equal(objects.length,1,'overlapping ground at '+x+','+z);const o=objects[0];if(kind==='field')assert(o.material.userData.pitchMarkings);if(kind==='track')assert.equal(o.material,model.mats.track);groundRays++;
}
for(const bank of model.floodlightBanks){
 assert(new T.Vector3(0,1,0).applyQuaternion(bank.rackQuaternion).distanceTo(new T.Vector3(0,1,0))<1e-9,'rack stays upright');assert.equal(bank.lights.length,20);
 for(const light of bank.lights){const dir=light.target.clone().sub(light.position).normalize(),optical=new T.Vector3(0,0,1).applyQuaternion(light.quaternion),right=new T.Vector3(1,0,0).applyQuaternion(light.quaternion);assert(optical.dot(dir)>.999999);assert(Math.abs(right.y)<1e-9,'projector has no optical roll');}
}
let signs=0;scene.traverse(o=>{if(!o.name.startsWith('Sector visible'))return;const s=stands.find(s=>s.id===o.userData.scope),p=local(s,o.position.x,o.position.z),aisle=Math.round(p.u/17)*17;assert(p.u-aisle-.52>1.55,'sign intrudes in aisle');const normal=new T.Vector3(0,0,1).applyQuaternion(o.quaternion);ray.set(o.position.clone().addScaledVector(normal,1.5),normal.negate());const hit=ray.intersectObjects(scene.children,true)[0];assert.equal(hit?.object,o,'plaque is occluded');signs++;});
assert.equal(signs,12);assert.equal(model.neighborhood.streetLights.length,22);assert.equal(model.exterior.lights.length,20);assert(model.neighborhood.streetLights.every(l=>!l.castShadow));
console.log('PASS:',groundRays,'single-layer ground rays, 4 upright banks / 80 aimed housings, 12 unobstructed plaques, 22 street and 20 facade sources. Appearance still needs WebGL.');
