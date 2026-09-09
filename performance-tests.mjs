import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as T from './dist/three.module.min.js';
import {buildModel} from './dist/model.js';
import {prepareDetails} from './dist/render-detail.js';
import {installBake,bakeMeshes,lightGroups} from './dist/baked-lighting.js';
import {PerformanceMeter,AdaptiveResolution} from './dist/performance.js';
import {allowed} from './dist/physics.js';
T.TextureLoader.prototype.loadAsync=async()=>new T.DataTexture(new Uint8Array([170,170,170,255]),1,1);
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},fillText(){}})})};
const scene=new T.Scene(),model=await buildModel(scene,{capabilities:{getMaxAnisotropy:()=>8}},()=>{}),detail=prepareDetails(scene,model);
const meta=JSON.parse(fs.readFileSync('./dist/lighting-bake.json')),bytes=fs.readFileSync('./dist/lighting-bake.bin');
const bake=installBake(scene,model,meta,bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength));
let live=()=>{let n=0;scene.traverseVisible(o=>{if(o.isLight)n++;});return n;};
bake.set('low',true,true,160);assert.equal(live(),5);assert.equal(bake.count,lightGroups(model).flat().length);assert.equal(bake.uniforms.kBakeStand.value,1.6);
bake.set('low',true,false,160);assert.equal(live(),5);assert.equal(bake.uniforms.kBakeStand.value,0);
bake.set('low',false,true,200);assert.equal(live(),5);assert.equal(bake.uniforms.kBakeNight.value,0);
bake.set('low',true,true,200);assert.equal(bake.uniforms.kBakeStand.value,2);
bake.set('high',true,true,160);assert.equal(live(),50);assert.equal(bake.uniforms.kBakeOn.value,0);assert(lightGroups(model)[0].every(x=>!x.light.visible),'exterior is baked at every quality');
bake.set('low',true,true,160,false);assert.equal(live(),5);assert.equal(bake.uniforms.kBakeExterior.value,0);assert.equal(bake.uniforms.kBakeStand.value,1.6);assert.equal(bake.uniforms.kBakeNight.value,1);
bake.set('low',false,true,160,true);assert.equal(bake.uniforms.kBakeExterior.value,1);assert.equal(bake.uniforms.kBakeNight.value,0);
console.log('PASS:',bake.count,'lights baked in mobile; five model lights remain. High quality keeps exterior baked; independent exterior/night/stand/interior controls.');
const mats=new Set();for(const o of bakeMeshes(scene)){const count=o.isInstancedMesh?o.count:o.geometry.attributes.position.count;for(const n of['kNight','kStand','kInterior']){const a=o.geometry.getAttribute(n);assert.equal(a.count,count);for(const v of a.array)assert(v>=0&&v<=65535);}const attributes=Object.keys(o.geometry.attributes).length+(o.isInstancedMesh?4:0)+(o.instanceColor?1:0);assert(attributes<=16,'WebGL2 vertex attribute limit');mats.add(o.material);}
for(const m of mats){const shader={vertexShader:T.ShaderLib.standard.vertexShader,fragmentShader:T.ShaderLib.standard.fragmentShader,uniforms:{}};m.onBeforeCompile(shader,{});assert(shader.vertexShader.includes('vKStand=kStand*24.'));assert(shader.fragmentShader.includes('irradiance+=kBakeOn'));assert(shader.fragmentShader.includes('#include <lights_fragment_end>'));assert(shader.uniforms.kBakeStand);}
assert(detail.lowSeats.every((m,i)=>m.geometry.getAttribute('kStand')===model.seatGroups[i].geometry.getAttribute('kStand')));
const camera=new T.PerspectiveCamera();camera.position.set(0,160,210);detail.update(camera,'low','air',0,true);
const city=model.neighborhood.cityMeshes,farHidden=city.filter(o=>o.userData.detail==='cityFine'&&!o.visible).length;assert(farHidden>10);assert(city.filter(o=>!o.userData.detail).every(o=>o.visible),'urban silhouettes preserved');assert(model.seatGroups.every(o=>!o.visible));
const c=city.find(o=>o.userData.detail==='cityFine');c.geometry.computeBoundingSphere();camera.position.copy(c.geometry.boundingSphere.center);detail.update(camera,'low','walk',1,true);assert(c.visible,'near house detail returns');
camera.position.copy(model.seatGroups[0].boundingSphere.center);detail.update(camera,'low','walk',2,true);assert(model.seatGroups[0].visible,'molded seats visible nearby');assert(!detail.lowSeats[0].visible);
console.log('PASS: coefficient dimensions, available WebGL2 attribute slots, shader hook construction (no GPU compilation), seat/urban LOD and close detail restored.');
const renderer={info:{render:{calls:123,triangles:456,lines:12},memory:{textures:5,geometries:10},programs:[],reset(){}},domElement:{width:390,height:844}};
const meter=new PerformanceMeter(renderer);let stat;
for(let i=0;i<=60;i++){meter.begin(10000+i*1000/30);const s=meter.end(10000+i*1000/30,{});if(s)stat=s;}
assert(Math.abs(stat.fps-30)<.2);assert.equal(stat.drawCalls,123);assert.equal(stat.triangles,456);assert.equal(stat.gpuMs,null);meter.reset();meter.begin(100000);assert.equal(meter.end(100000,{}),null,'background gap excluded');
const adaptive=new AdaptiveResolution();for(let i=0;i<20;i++)adaptive.sample(60,true);assert.equal(adaptive.scale,.8);for(let i=0;i<25;i++)adaptive.sample(20,true);assert.equal(adaptive.scale,1);adaptive.sample(100,false);assert.equal(adaptive.scale,1);
console.log('PASS: real interval FPS arithmetic, renderer counters, missing GPU timing explicit, background reset and bounded adaptive resolution.');
// Environment geometry intentionally changed in v10. Compare the spatial index
// to the same new obstacle set, and exercise all retained routes in their suites.
