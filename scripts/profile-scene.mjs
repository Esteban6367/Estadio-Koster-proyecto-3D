// CPU scene inventory and collision timings. These are NOT GPU draw calls or FPS.
import fs from 'node:fs';
import os from 'node:os';
import * as T from '../dist/three.module.min.js';
import {buildModel} from '../dist/model.js';
import {move,ground,world,stands} from '../dist/physics.js';
T.TextureLoader.prototype.loadAsync=async()=>new T.DataTexture(new Uint8Array([170,170,170,255]),1,1);
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},fillText(){}})})};
const scene=new T.Scene(),start=performance.now();
const model=await buildModel(scene,{capabilities:{getMaxAnisotropy:()=>8}},()=>{});
const buildMs=performance.now()-start;
const inventory={meshes:0,instances:0,trianglesAllLods:0,lights:0,points:0,spots:0,materials:new Set(),textures:new Set()};
scene.traverse(o=>{if(o.isLight){inventory.lights++;if(o.isPointLight)inventory.points++;if(o.isSpotLight)inventory.spots++;}if(!o.isMesh)return;inventory.meshes++;inventory.instances+=o.isInstancedMesh?o.count:0;inventory.trianglesAllLods+=(o.geometry.index?.count||o.geometry.attributes.position.count)/3*(o.isInstancedMesh?o.count:1);for(const m of Array.isArray(o.material)?o.material:[o.material]){inventory.materials.add(m);for(const k of['map','normalMap','roughnessMap'])if(m[k])inventory.textures.add(m[k]);}});
inventory.materials=inventory.materials.size;inventory.textures=inventory.textures.size;
const cases=[['campo',0,8,0],['perímetro',-105,60,0],['túnel',...world(stands[0],0,0),-4.8]];
const collision=[];
for(const [sector,x,z,floor]of cases)for(const speed of[0,6,12,24,36]){
 const times=[];for(let j=0;j<2100;j++){const b={x,z,floor,y:floor+1.7},t=performance.now();move(b,speed/60,0);if(j>=100)times.push(performance.now()-t);}
 times.sort((a,b)=>a-b);collision.push({sector,speed,medianMs:times[1000],p95Ms:times[1900]});
}
const report={date:new Date().toISOString(),environment:{node:process.version,cpu:os.cpus()[0]?.model,platform:os.platform(),gpu:'Not available; no WebGL rendering'},buildMs,inventory,seats:model.seatGroups.reduce((n,m)=>n+m.count,0),houses:model.neighborhood.housesCount,collision,renderedCalls:null,renderedTriangles:null,gpuFrameMs:null,iphoneFps:null};
const path=process.argv[2];if(path)fs.writeFileSync(path,JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
