// CPU frustum candidates only. Actual driver submissions are available in the app.
import fs from 'node:fs';
import * as T from '../dist/three.module.min.js';
const old=process.argv.includes('--before');
const root=old?'/workspace/scratch/koster-v8-profile/dist/':new URL('../dist/',import.meta.url).pathname;
const output=process.argv.includes('--output')?process.argv[process.argv.indexOf('--output')+1]:old?'PRESUPUESTO-ANTES.json':'PRESUPUESTO-DESPUES.json';
const localT=await import(root+'three.module.min.js');
localT.TextureLoader.prototype.loadAsync=async()=>new localT.DataTexture(new Uint8Array([170,170,170,255]),1,1);
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},fillText(){}})})};
const {buildModel}=await import(root+'model.js'),{world,stands}=await import(root+'physics.js');
const scene=new localT.Scene(),model=await buildModel(scene,{capabilities:{getMaxAnisotropy:()=>8}},()=>{});
let details,low=[];
if(!old){const {prepareDetails}=await import(root+'render-detail.js');details=prepareDetails(scene,model);}
else for(const m of model.seatGroups){const g=new localT.BoxGeometry(.49,.6,.35);g.translate(0,.48,-.12);const o=new localT.InstancedMesh(g,m.material,m.count);o.instanceMatrix.copy(m.instanceMatrix);scene.add(o);low.push(o);}
const main=world(stands[0],17,1),tunnel=world(stands[0],0,0),views=[['referencia',5+Math.sin(.025)*210*Math.cos(.65),Math.sin(.65)*210,Math.cos(.025)*210*Math.cos(.65),0,'air'],['campo',0,1.7,8,0,'walk']];
views.push(['principal',main[0],1.7,main[1],-Math.PI/2,'walk'],['túnel',tunnel[0],-3.1,tunnel[1],-Math.PI/2,'walk'],['CDM',59,1.7,20,-1.9,'walk'],['calle',-109,1.7,30,Math.PI/2,'walk']);
const locker=world(stands[0],-8,18);
views.push(['norte exterior',0,1.7,-122,Math.PI,'walk'],['sur exterior',0,1.7,123,0,'walk'],['este exterior',114,1.7,0,-Math.PI/2,'walk'],['vestuario',locker[0],1.7,locker[1],Math.PI/2,'walk']);
const rows=[];
for(const[name,x,y,z,yaw,mode]of views){const camera=new localT.PerspectiveCamera(mode==='air'?43:66,1536/864,.12,1400);camera.rotation.order='YXZ';camera.position.set(x,y,z);if(mode==='air')camera.lookAt(5,-2,0);else camera.rotation.set(0,yaw,0);camera.updateMatrixWorld(true);
 if(details)details.update(camera,'low',mode,1,true);
 else{model.seatGroups.forEach((m,i)=>{const d=camera.position.distanceTo(m.boundingSphere.center)-m.boundingSphere.radius;m.visible=mode==='walk'&&d<20;low[i].visible=!m.visible;});model.detailMeshes.forEach(m=>m.visible=mode==='walk');model.nets.visible=mode==='walk';}
 model.boundaries.update(0,camera,'low');scene.updateMatrixWorld(true);const frustum=new localT.Frustum().setFromProjectionMatrix(new localT.Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse));let meshes=0,triangles=0,lines=0;
 scene.traverseVisible(o=>{if(!o.geometry||(!o.isMesh&&!o.isLine)||o.frustumCulled&&!frustum.intersectsObject(o))return;meshes++;const n=o.geometry.index?.count||o.geometry.attributes.position.count;if(o.isMesh)triangles+=n/3*(o.isInstancedMesh?o.count:1);else lines+=n/2;});rows.push({camera:name,candidateDrawables:meshes,candidateTriangles:triangles,candidateLines:lines});
}
const report={kind:'CPU frustum candidate estimates. Not rendered draw calls, not GPU timings, no shadows included.',profile:'low',version:old?8:JSON.parse(fs.readFileSync(new URL('../package.json',import.meta.url))).version,viewport:[1536,864],rows};fs.writeFileSync(output,JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
