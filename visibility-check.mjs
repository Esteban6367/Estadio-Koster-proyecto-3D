import assert from 'node:assert/strict';
import * as T from './dist/three.module.min.js';
import {buildModel} from './dist/model.js';
import {stands,world,floorHeight} from './dist/physics.js';
T.TextureLoader.prototype.loadAsync=async()=>new T.DataTexture(new Uint8Array([170,170,170,255]),1,1);
globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>({fillRect(){},fillText(){}})})};
const scene=new T.Scene(),model=await buildModel(scene,{capabilities:{getMaxAnisotropy:()=>8}},()=>{});scene.updateMatrixWorld(true);
const ray=new T.Raycaster(),screen=model.scoreMesh;
const all=scene.children.filter(o=>o!==screen&&!o.isLight&&!o.isLineSegments);
const extent=screen.geometry.parameters,targets=[[0,0],[-.40,-.4],[.40,-.4],[-.4,.4],[.4,.4]].map(([a,b])=>screen.localToWorld(new T.Vector3(a*extent.width,b*extent.height,0)));
const rows=[];
for(const s of stands)for(const d of s.id==='main'?[8,18,28.1]:[8,15.5,24.5])for(const u of[-34.8,-18.8,-3.3,14.2,31.3]){
 const[x,z]=world(s,u,d),eye=new T.Vector3(x,floorHeight(s,d)+1.2,z),clear=[];
 for(const target of targets){const delta=target.clone().sub(eye),len=delta.length();ray.set(eye,delta.normalize());ray.near=.04;ray.far=len-.08;const hits=ray.intersectObjects(all,true).filter(h=>h.object.isMesh&&!(h.object.material.transparent&&h.object.material.opacity<.5));clear.push(!hits.length);}
 rows.push({stand:s.id,u,d,clear:clear.filter(Boolean).length,centre:clear[0]});
}
const result={method:'CPU raycasts against actual model; seated eyes 1.20 m above rows; 5 screen targets per point. No people, GPU or legibility assertion.',screen:{position:screen.position.toArray(),width:extent.width,height:extent.height},sectors:stands.map(s=>{const r=rows.filter(r=>r.stand===s.id);return{id:s.id,samples:r.length,clearCentre:r.filter(x=>x.centre).length,allFiveClear:r.filter(x=>x.clear===5).length,clearRays:r.reduce((n,x)=>n+x.clear,0),rays:r.length*5}}),rows};
console.log(JSON.stringify(result.sectors));assert(result.sectors.every(s=>s.clearCentre>=10),'screen centre must remain visible in at least 10/15 selected views per stand');
if(process.argv.includes('--write')){const{writeFile}=await import('node:fs/promises');await writeFile('VISIBILIDAD.json',JSON.stringify(result,null,2)+'\n');}
console.log('PASS: 225 real-geometry sightline rays; any blocked samples are documented, not a guarantee for every seat.');
