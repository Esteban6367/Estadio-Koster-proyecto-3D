import * as T from './three.module.min.js';
// A compact molded silhouette at middle distance, shared across all sectors.
function simpleSeat(){
 const parts=[];for(const[w,h,d,y,z]of[[.49,.075,.43,.4,-.04],[.49,.30,.06,.56,-.24]]){const g=new T.BoxGeometry(w,h,d).toNonIndexed();g.translate(0,y,z);parts.push(g);}
 const g=new T.BufferGeometry();for(const name of['position','normal','uv'])g.setAttribute(name,new T.Float32BufferAttribute(parts.flatMap(p=>Array.from(p.attributes[name].array)),name==='uv'?2:3));return g;
}
export function prepareDetails(scene,model){
 const lowSeats=[],simple=simpleSeat();
 for(const high of model.seatGroups){const low=new T.InstancedMesh(simple,high.material,high.count);low.instanceMatrix.copy(high.instanceMatrix);if(high.instanceColor)low.instanceColor=high.instanceColor.clone();low.receiveShadow=true;low.castShadow=false;low.userData.seatLod=true;low.userData.bakeSource=high;low.visible=false;low.computeBoundingSphere();scene.add(low);lowSeats.push(low);}
 const distances=new Map();const bounded=[];
 scene.traverse(o=>{if(!o.isMesh&&!o.isLineSegments)return;const tag=o.userData.detail;if(tag||model.detailMeshes.includes(o)){if(o.isInstancedMesh){o.computeBoundingSphere();bounded.push({o,sphere:o.boundingSphere.clone(),tag:tag||'seatDetail'});}else{const sphere=new T.Box3().setFromObject(o).getBoundingSphere(new T.Sphere());bounded.push({o,sphere,tag});}}});
 let last=-Infinity;let changed=false;
 function update(camera,quality,mode,time,force=false){
  if(!force&&time-last<.16)return false;last=time;changed=false;
  const near=quality==='low'?18:quality==='medium'?36:70;
  model.seatGroups.forEach((m,i)=>{const d=camera.position.distanceTo(m.boundingSphere.center)-m.boundingSphere.radius;const cut=near+(m.visible?5:0);const active=mode==='walk'?d<cut:quality==='high'&&d<90;if(m.visible!==active)changed=true;m.visible=active;lowSeats[i].visible=!active;});
  for(const{o,sphere,tag}of bounded){const distance=camera.position.distanceTo(sphere.center)-sphere.radius;const cut=tag==='cityFine'?(quality==='low'?80:quality==='medium'?130:240):tag==='roomDetail'?70:near+7;const show=distance<cut+(o.visible?12:0);o.visible=show;distances.set(o,distance);}
  model.neighborhood.update?.(camera,quality);
  model.nets.children.forEach(o=>{if(!o.geometry.boundingSphere)o.geometry.computeBoundingSphere();o.visible=quality!=='low'||camera.position.distanceTo(o.geometry.boundingSphere.center)<45;});
  return changed;
 }
 return{lowSeats,update};
}
