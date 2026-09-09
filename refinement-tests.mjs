import {facilities} from './dist/interior-layout.js';
import assert from 'node:assert/strict';
import * as T from './dist/three.module.min.js';
import {buildModel} from './dist/model.js';
import {pitchPaintDistance} from './dist/pitch-markings.js';
import {stands,world,local,cabin} from './dist/stadium-layout.js';
import {allowed} from './dist/physics.js';
import {interiorWalls} from './dist/interior-layout.js';
import {initInterface} from './dist/interface.js';
// Independent football landmarks: full circle, both penalty arcs and clear turf.
for(let deg=0;deg<360;deg++){const a=deg*Math.PI/180;assert(Math.abs(pitchPaintDistance(Math.cos(a)*9.15,Math.sin(a)*9.15))<1e-9);}
for(const side of[-1,1]){
 for(const a of[-.8,-.4,0,.4,.8])assert(Math.abs(pitchPaintDistance(9.15*Math.sin(a),side*(41.5-9.15*Math.cos(a))))<1e-9);
 for(const[x,z]of[[20.16,45],[0,36],[9.16,50],[4,47]])assert(Math.abs(pitchPaintDistance(x,z*side))<1e-9);
 assert(pitchPaintDistance(0,side*41.5)<0);
}
for(const[x,z]of[[10,20],[25,35],[0,20],[5,45]])assert(pitchPaintDistance(x,z)>.3,'unpainted field remains clear');
console.log('PASS: continuous metric centre circle, both clipped penalty arcs, areas, spots and unpainted turf. No GPU aliasing claim.');
T.TextureLoader.prototype.loadAsync=async()=>new T.DataTexture(new Uint8Array([170,170,170,255]),1,1);
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},fillText(){}})})};
const scene=new T.Scene(),model=await buildModel(scene,{capabilities:{getMaxAnisotropy:()=>8}},()=>{});scene.updateMatrixWorld(true);
const stripe=scene.getObjectByName('Vestuarios · franja separada del muro'),wall=model.playerFacilities.walls[0],ray=new T.Raycaster();let samples=0;
for(const w of interiorWalls){
 const u=(w.u0+w.u1)/2,d=(w.d0+w.d1)/2,alongU=w.d0===w.d1;
 for(const side of[-1,1]){
  const a=world(stands[0],u+(alongU?0:side*.6),d+(alongU?side*.6:0)),b=world(stands[0],u,d);
  ray.set(new T.Vector3(a[0],facilities.floor+1.025,a[1]),new T.Vector3(b[0]-a[0],0,b[1]-a[1]).normalize());
  const paint=ray.intersectObject(stripe,false)[0],concrete=ray.intersectObject(wall,false)[0];
  assert(paint&&concrete,'stripe and wall exist');assert(paint.distance<concrete.distance-.002,'blue stripe must be in front of wall, not coplanar');samples++;
 }
}
assert.equal(model.mats.yellow.emissive.getHex(),0);assert(model.mats.yellow.roughness>.95);
let painted=0;scene.traverse(o=>{if(!o.material?.userData.pitchMarkings)return;painted++;const shader={vertexShader:T.ShaderLib.standard.vertexShader,fragmentShader:T.ShaderLib.standard.fragmentShader,uniforms:{}};o.material.onBeforeCompile(shader,{});assert(shader.fragmentShader.includes('fwidth(kSurfacePosition.xz)'));assert(shader.fragmentShader.includes('kPitchDistance(kSurfacePosition.xz)'));});assert.equal(painted,14);
for(const w of model.boundaries.waters){const a=w.geometry.getAttribute('kAcross');assert(a&&a.count===w.geometry.attributes.position.count);assert(a.array.every(n=>n>=0&&n<=1));const shader={vertexShader:T.ShaderLib.physical.vertexShader,fragmentShader:T.ShaderLib.physical.fragmentShader,uniforms:{}};w.material.onBeforeCompile(shader,{});assert(shader.fragmentShader.includes('float kDeep='));assert(shader.fragmentShader.includes('diffuseColor.a=clamp('));assert(shader.uniforms.waterTime);}
for(const u of[-2.7,2.7]){const[x,z]=world(stands[0],u,cabin.back-1.13);assert(!allowed(x,z,x,z,cabin.floor));}
console.log('PASS: '+samples+' wall-side rays verify stripe separation, non-emissive matte paint, pitch/water shader construction and cabin furniture collision. Shader compilation and appearance require GPU.');
// Isolated DOM helper: fake clock proves finite hint lifetime and input-independent UI.
const realSet=globalThis.setTimeout,realClear=globalThis.clearTimeout,timers=new Map();let next=0;
globalThis.setTimeout=(f,ms)=>{timers.set(++next,{f,ms});return next;};globalThis.clearTimeout=id=>timers.delete(id);
const elements=new Map(),events=new Map();const el=id=>{if(!elements.has(id)){const classes=new Set();elements.set(id,{hidden:false,open:false,textContent:'',disabled:false,scrollWidth:1200,clientWidth:290,scrollLeft:0,classList:{add:n=>classes.add(n),toggle:(n,on)=>on?classes.add(n):classes.delete(n),contains:n=>classes.has(n)},showModal(){this.open=true;},addEventListener(n,f){events.set(id+':'+n,f);},scrollBy({left}){this.scrollLeft=Math.max(0,Math.min(910,this.scrollLeft+left));events.get(id+':scroll')?.();}});}return elements.get(id);};
const doc={body:el('body'),getElementById:el,addEventListener:(n,f)=>events.set(n,f)},ui=initInterface(doc);
ui.begin();ui.hint('walk','Caminar');assert(!el('hint').hidden);assert.equal([...timers.values()][0].ms,5500);[...timers.values()][0].f();assert(el('hint').hidden);ui.hint('walk','Caminar');assert(el('hint').hidden,'a visited mode does not show the persistent hint again');
el('hideInterface').onclick();assert(doc.body.classList.contains('minimal-ui'));assert(!el('restoreInterface').hidden);el('restoreInterface').onclick();assert(!doc.body.classList.contains('minimal-ui'));
el('hideInterface').onclick();events.get('keydown')({key:'Escape'});assert(!ui.hidden);assert(el('restoreInterface').hidden);
assert(el('destPrev').disabled);assert(!el('destNext').disabled);for(let i=0;i<6;i++)el('destNext').onclick();assert(el('destNext').disabled);assert(!el('destPrev').disabled);el('destPrev').onclick();assert(!el('destNext').disabled);
el('menu').open=true;el('help').onclick();assert(el('instructions').open&&!el('menu').open);
globalThis.setTimeout=realSet;globalThis.clearTimeout=realClear;
console.log('PASS: hint expires, previous hints stay hidden, hide/restore/Escape, scroll arrows and help. DOM helper only.');
