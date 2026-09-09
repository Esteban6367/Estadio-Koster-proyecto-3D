// Comparable camera/frustum budgets only: no renderer, GPU timings or FPS.
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const root=path.resolve(process.argv[2]||'.');
const mod=n=>import(pathToFileURL(path.join(root,'dist',n)));
const T=await mod('three.module.min.js');
T.TextureLoader.prototype.loadAsync=async()=>new T.DataTexture(new Uint8Array([170,170,170,255]),1,1);
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},fillText(){}})})};
const {buildModel}=await mod('model.js'),{world,stands}=await mod('physics.js'),{prepareDetails}=await mod('render-detail.js');
const scene=new T.Scene(),model=await buildModel(scene,{capabilities:{getMaxAnisotropy:()=>8}},()=>{}),details=prepareDetails(scene,model),rows=[];
const views=[['portones',1,35,-Math.PI/2],['vestíbulo',1,28,-Math.PI/2],['puerta derecha',0,29.2,Math.PI],['rampa frontal',1,24,-Math.PI/2],['lateral izquierdo',17,25,-Math.PI/2],['lateral derecho',-17,25,-Math.PI/2],['pie izquierdo',11,11.35,0,2.42],['pie derecho',-7,11.35,Math.PI,2.42],['paso contiguo',16,9.2,0,2.42],['descanso izquierdo',19,11.35,Math.PI,5.9,-.5],['descanso derecho',-15,11.35,0,5.9,-.5],['desde las filas',26,15.8,-Math.PI/2,7.16,-.5]];
for(const viewport of[[390,844],[1536,864]])for(const quality of['low','medium','high'])for(const[name,u,d,yaw,y=1.7,pitch=0]of views){
 const[x,z]=world(stands[0],u,d),camera=new T.PerspectiveCamera(66,viewport[0]/viewport[1],.12,1400);camera.rotation.order='YXZ';camera.position.set(x,y,z);camera.rotation.set(pitch,yaw,0);camera.updateMatrixWorld(true);
 details.update(camera,quality,'walk',1,true);model.boundaries.update(0,camera,quality);scene.updateMatrixWorld(true);
 const frustum=new T.Frustum().setFromProjectionMatrix(new T.Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse));let drawables=0,triangles=0;
 scene.traverseVisible(o=>{if(!o.isMesh||o.frustumCulled&&!frustum.intersectsObject(o))return;drawables++;triangles+=(o.geometry.index?.count||o.geometry.attributes.position.count)/3*(o.isInstancedMesh?o.count:1);});
 rows.push({view:name,position:[x,y,z],yaw,pitch,viewport,quality,candidateDrawables:drawables,candidateTriangles:triangles});
}
console.log(JSON.stringify({kind:'CPU frustum candidates, all instances in intersecting batches; not real draw calls or FPS. Identical cameras before/after. No dynamic shadow passes.',version:JSON.parse(fs.readFileSync(path.join(root,'package.json'))).version,rows},null,2));
