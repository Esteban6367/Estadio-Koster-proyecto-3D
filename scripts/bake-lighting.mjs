// Offline diffuse baking. Binary coefficients are shipped; the phone never runs this.
import fs from 'node:fs';
import {gzipSync} from 'node:zlib';
import * as T from '../dist/three.module.min.js';
import {buildModel} from '../dist/model.js';
import {stands,local} from '../dist/stadium-layout.js';
import {floorHeight} from '../dist/physics.js';
import {bakeMeshes,lightGroups,BAKE_RANGE} from '../dist/baked-lighting.js';
T.TextureLoader.prototype.loadAsync=async()=>new T.DataTexture(new Uint8Array([170,170,170,255]),1,1);
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},fillText(){}})})};
const scene=new T.Scene(),model=await buildModel(scene,{capabilities:{getMaxAnisotropy:()=>8}},()=>{});scene.updateMatrixWorld(true);
const start=performance.now();
// Small spatial BVH for visibility to the static structural surfaces. No moving gate.
const occluders=new Set([...model.roofs,...model.playerFacilities.floors,...model.playerFacilities.ceilings,...model.playerFacilities.walls,...model.boundaries.blocks]);
scene.traverse(o=>{if(o.userData.walkingSurface||o.userData.bakeOccluder||o.name==='Terreno y relleno sobre el túnel')occluders.add(o);});
const triangles=[],v=new T.Vector3();
for(const o of occluders){const p=o.geometry.attributes.position,idx=o.geometry.index;for(let i=0;i<(idx?.count||p.count);i+=3){const xyz=[];for(let k=0;k<3;k++){v.fromBufferAttribute(p,idx?idx.getX(i+k):i+k).applyMatrix4(o.matrixWorld);xyz.push(v.x,v.y,v.z);}const a=xyz;const min=[Math.min(a[0],a[3],a[6]),Math.min(a[1],a[4],a[7]),Math.min(a[2],a[5],a[8])],max=[Math.max(a[0],a[3],a[6]),Math.max(a[1],a[4],a[7]),Math.max(a[2],a[5],a[8])];triangles.push({a,min,max});}}
function tree(items){const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];for(const t of items)for(let i=0;i<3;i++){min[i]=Math.min(min[i],t.min[i]);max[i]=Math.max(max[i],t.max[i]);}if(items.length<=12)return{min,max,items};const ext=max.map((n,i)=>n-min[i]),axis=ext.indexOf(Math.max(...ext));items.sort((a,b)=>(a.min[axis]+a.max[axis])-(b.min[axis]+b.max[axis]));const mid=items.length>>1;return{min,max,left:tree(items.slice(0,mid)),right:tree(items.slice(mid))};}
const bvh=tree(triangles);let rays=0;
function hitTriangle(a,o,d,far){const e1=[a[3]-a[0],a[4]-a[1],a[5]-a[2]],e2=[a[6]-a[0],a[7]-a[1],a[8]-a[2]],p=[d[1]*e2[2]-d[2]*e2[1],d[2]*e2[0]-d[0]*e2[2],d[0]*e2[1]-d[1]*e2[0]],det=e1[0]*p[0]+e1[1]*p[1]+e1[2]*p[2];if(Math.abs(det)<1e-9)return false;const t=[o[0]-a[0],o[1]-a[1],o[2]-a[2]],inv=1/det,u=(t[0]*p[0]+t[1]*p[1]+t[2]*p[2])*inv;if(u<0||u>1)return false;const q=[t[1]*e1[2]-t[2]*e1[1],t[2]*e1[0]-t[0]*e1[2],t[0]*e1[1]-t[1]*e1[0]],vv=(d[0]*q[0]+d[1]*q[1]+d[2]*q[2])*inv;if(vv<0||u+vv>1)return false;const distance=(e2[0]*q[0]+e2[1]*q[1]+e2[2]*q[2])*inv;return distance>.045&&distance<far-.12;}
function hits(node,o,d,far){let near=.045,end=far-.12;for(let i=0;i<3;i++){if(Math.abs(d[i])<1e-10){if(o[i]<node.min[i]-.005||o[i]>node.max[i]+.005)return false;continue;}const a=(node.min[i]-.005-o[i])/d[i],b=(node.max[i]+.005-o[i])/d[i];near=Math.max(near,Math.min(a,b));end=Math.min(end,Math.max(a,b));if(near>end)return false;}if(node.items)return node.items.some(t=>hitTriangle(t.a,o,d,far));return hits(node.left,o,d,far)||hits(node.right,o,d,far);}
const groups=lightGroups(model).map(list=>list.map(({light,power})=>{const pos=light.getWorldPosition(new T.Vector3());return{pos:pos.toArray(),power,color:light.color.toArray(),range:light.distance||100,dir:light.isSpotLight?light.target.getWorldPosition(new T.Vector3()).sub(pos).normalize().toArray():null,cone:Math.cos(light.angle||0),pen:Math.cos((light.angle||0)*(1-(light.penumbra||0)))};}));
function sample(pos,normal,group,instance){const rgb=[0,0,0],direction=[0,0,0];let energy=0;
 for(const l of group){const delta=l.pos.map((x,i)=>x-pos[i]),distance=Math.hypot(...delta);if(distance>=l.range||distance<.05)continue;const dir=delta.map(x=>x/distance);let cone=1;if(l.dir){const angle=-dir.reduce((a,x,i)=>a+x*l.dir[i],0),v=Math.max(0,Math.min(1,(angle-l.cone)/(l.pen-l.cone)));cone=v*v*(3-2*v);if(cone<.0001)continue;}
  const nd=instance?1:Math.max(0,normal.reduce((a,x,i)=>a+x*dir[i],0));
  let amount=l.power/Math.max(distance*distance,.1)*Math.pow(Math.max(0,1-Math.pow(distance/l.range,4)),2)*cone;
  if(amount<.0007)continue;
  const origin=pos.map((x,i)=>x+(instance?0:normal[i]*.025));rays++;const blocked=hits(bvh,origin,dir,distance);
  // 6% bounded diffuse fill approximates a local bounce inside, not a GI claim.
  amount*=blocked?.045:instance?1:(.06+.94*nd);
  for(let i=0;i<3;i++){rgb[i]+=l.color[i]*amount;direction[i]+=dir[i]*amount;}energy+=amount;
 }
 const length=Math.hypot(...direction)||1;return{rgb:rgb.map(v=>Math.min(BAKE_RANGE,v)),dir:direction.map(x=>x/length)};
}
const meshes=bakeMeshes(scene),chunks=[],meta={version:1,range:BAKE_RANGE,method:'Occlusion-aware offline vertex/instance diffuse irradiance; instanced dominant light direction; bounded approximate bounce and canopy indirect fill',meshes:[]};
const transform=new T.Matrix4(),normalMatrix=new T.Matrix3(),normal=new T.Vector3(),center=new T.Vector3();
let total=0;
for(let mi=0;mi<meshes.length;mi++){
 const o=meshes[mi],instance=!!o.isInstancedMesh,count=instance?o.count:o.geometry.attributes.position.count,colors=groups.map(()=>new Uint16Array(count*3)),dirs=instance?groups.map(()=>new Uint16Array(count*3)):null,cache=new Map();
 o.geometry.computeBoundingBox();o.geometry.boundingBox.getCenter(center);normalMatrix.getNormalMatrix(o.matrixWorld);
 for(let i=0;i<count;i++){
  if(instance){o.getMatrixAt(i,transform);v.copy(center).applyMatrix4(transform).applyMatrix4(o.matrixWorld);normal.set(0,1,0);}else{v.fromBufferAttribute(o.geometry.attributes.position,i).applyMatrix4(o.matrixWorld);normal.fromBufferAttribute(o.geometry.attributes.normal,i).applyMatrix3(normalMatrix).normalize();}
  const key=instance?'':v.toArray().map(x=>x.toFixed(3)).join(',')+'|'+normal.toArray().map(x=>x.toFixed(2)).join(',');let values=key?cache.get(key):null;
  if(!values){values=groups.map(group=>sample(v.toArray(),normal.toArray(),group,instance));
   // Bounded artistic indirect fill on the canopy/upper truss only. No extra live light.
   for(const stand of stands){const loc=local(stand,v.x,v.z),rear=floorHeight(stand,stand.depth);
    if(Math.abs(loc.u)<=stand.length/2+.1&&loc.d>=3.8&&loc.d<=stand.depth+1.2&&v.y>rear+1.8&&v.y<rear+5.5){
     const bounce=1.0;values[1].rgb=values[1].rgb.map(c=>Math.min(BAKE_RANGE,c+bounce));
    }
   }
   if(key)cache.set(key,values);
  }
  values.forEach((s,c)=>{for(let k=0;k<3;k++){colors[c][i*3+k]=Math.round(s.rgb[k]/BAKE_RANGE*65535);if(instance)dirs[c][i*3+k]=Math.round((s.dir[k]*.5+.5)*65535);}});
 }
 chunks.push(...colors,...(dirs||[]));total+=count;meta.meshes.push({count,instanced:instance});if(mi%100===0)console.log('Baked',mi,'/',meshes.length);
}
const packed=Buffer.concat(chunks.map(a=>Buffer.from(a.buffer)));meta.bytes=packed.byteLength;meta.samples=total;meta.rays=rays;meta.structureTriangles=triangles.length;meta.bakeMs=performance.now()-start;meta.lightChannels=groups.map(g=>g.length);
fs.writeFileSync(new URL('../dist/lighting-bake.bin',import.meta.url),packed);fs.writeFileSync(new URL('../dist/lighting-bake.json',import.meta.url),JSON.stringify(meta));
fs.writeFileSync(new URL('../dist/lighting-bake.bin.gz',import.meta.url),gzipSync(packed,{level:9}));
console.log(JSON.stringify({bytes:meta.bytes,meshes:meta.meshes.length,samples:total,rays,seconds:meta.bakeMs/1000,channels:meta.lightChannels}));
