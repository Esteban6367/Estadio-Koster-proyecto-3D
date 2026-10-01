import * as T from './three.module.min.js';

// Collision acceleration is independent of rendering visibility and LOD.
// Instances share a local triangle tree; only nearby triangles are transformed.
const treeCache=new WeakMap();
const boxOf=items=>{const b=new T.Box3();for(const item of items)b.union(item.box);return b;};
function tree(items){
 const box=boxOf(items);if(items.length<=12)return{box,items};
 const s=box.getSize(new T.Vector3()),axis=s.x>s.y?(s.x>s.z?'x':'z'):(s.y>s.z?'y':'z');
 items.sort((a,b)=>a.box.min[axis]+a.box.max[axis]-b.box.min[axis]-b.box.max[axis]);
 const mid=items.length>>1;return{box,left:tree(items.slice(0,mid)),right:tree(items.slice(mid))};
}
function visit(node,box,fn){if(!node||!node.box.intersectsBox(box))return false;if(node.items){for(const item of node.items)if(item.box.intersectsBox(box)&&fn(item))return true;return false;}return visit(node.left,box,fn)||visit(node.right,box,fn);}
function geometryTree(g){
 if(treeCache.has(g))return treeCache.get(g);
 const p=g.attributes.position,idx=g.index,items=[],v=new T.Vector3();
 for(let i=0;i<(idx?.count||p.count);i+=3){const box=new T.Box3();for(let k=0;k<3;k++)box.expandByPoint(v.fromBufferAttribute(p,idx?idx.getX(i+k):i+k));items.push({box,i});}
 const result=tree(items);treeCache.set(g,result);return result;
}
const v1=new T.Vector3(),v2=new T.Vector3(),v3=new T.Vector3(),v4=new T.Vector3();
const ray=new T.Ray(),tri=new T.Triangle(),closest=new T.Vector3();
// Exact minimum distance between two segments, including degenerate edges.
function segmentDistanceSq(p1,q1,p2,q2){
 const d1=v1.subVectors(q1,p1),d2=v2.subVectors(q2,p2),r=v3.subVectors(p1,p2);
 const a=d1.dot(d1),e=d2.dot(d2),f=d2.dot(r);let s=0,t=0;
 if(a<=1e-12&&e<=1e-12)return r.lengthSq();
 if(a<=1e-12)t=T.MathUtils.clamp(f/e,0,1);
 else{const c=d1.dot(r);if(e<=1e-12)s=T.MathUtils.clamp(-c/a,0,1);else{const b=d1.dot(d2),den=a*e-b*b;s=den?T.MathUtils.clamp((b*f-c*e)/den,0,1):0;t=(b*s+f)/e;if(t<0){t=0;s=T.MathUtils.clamp(-c/a,0,1);}else if(t>1){t=1;s=T.MathUtils.clamp((b-c)/a,0,1);}}}
 return v4.copy(r).addScaledVector(d1,s).addScaledVector(d2,-t).lengthSq();
}
function capsuleDistanceSq(bottom,top,triangle){
 const dir=new T.Vector3().subVectors(top,bottom),length=dir.length();
 if(length>1e-9){ray.set(bottom,dir.multiplyScalar(1/length));const hit=ray.intersectTriangle(triangle.a,triangle.b,triangle.c,false,closest);if(hit&&hit.distanceToSquared(bottom)<=length*length)return 0;}
 let d=Math.min(triangle.closestPointToPoint(bottom,closest).distanceToSquared(bottom),triangle.closestPointToPoint(top,closest).distanceToSquared(top));
 for(const[a,b]of[[triangle.a,triangle.b],[triangle.b,triangle.c],[triangle.c,triangle.a]])d=Math.min(d,segmentDistanceSq(bottom,top,a,b));return d;
}
// Walking floors use nominal elevations; turf/pavers are rendered up to 3.8 cm above them.
// Keep the collision sole 5 cm above that datum, while the camera remains at 1.70 m.
export const flightBody={radius:.25,eyeHeight:1.7,bottomOffset:1.40,topOffset:0};
function bodyEnds(p){return[new T.Vector3(p.x,p.y-flightBody.bottomOffset,p.z),new T.Vector3(p.x,p.y,p.z)];}
function bodyBox(p){const[a,b]=bodyEnds(p);return new T.Box3().setFromPoints([a,b]).expandByScalar(flightBody.radius);}
function triangleFor(entry,index){const p=entry.object.geometry.attributes.position,idx=entry.object.geometry.index;for(const[k,v]of[[0,tri.a],[1,tri.b],[2,tri.c]])v.fromBufferAttribute(p,idx?idx.getX(index+k):index+k).applyMatrix4(entry.matrix);return tri;}
function dynamicRoot(o){for(let p=o;p;p=p.parent)if(p.userData.dynamicTransform)return p;return null;}
function walkSurface(o,model){return !!o.userData.walkingSurface||model?.playerFacilities?.floors?.includes(o)||/^(Campo · franja|Césped exterior al campo|Pista ·|Suelo con apertura real|Terreno y relleno sobre el túnel)/.test(o.name);}
function excluded(o,ignore){
 if(!o.isMesh||!o.geometry?.attributes.position||ignore.has(o)||o.userData.seatLod||o.userData.decorativeGrass)return true;
 if(/^(Agua |Alambrado · hilos|Fosas · bandas de humedad)/.test(o.name))return true;
 // Glass and the canonical fence panel remain solid despite transparency.
 const materials=Array.isArray(o.material)?o.material:[o.material];
 return materials.every(m=>m?.transparent&&m.depthWrite===false)&&!/(vidrio|Alambrado · LOD)/i.test(o.name);
}
export function createFlightWorld(scene,model={},ignoreObjects=[]){
 scene.updateMatrixWorld(true);const ignore=new Set(ignoreObjects),staticEntries=[],dynamicEntries=[];
 const instance=new T.Matrix4();let geometryCount=0;const geometries=new Set();
 scene.traverse(o=>{
  if(excluded(o,ignore))return;const g=o.geometry;if(!g.boundingBox)g.computeBoundingBox();const dynamic=dynamicRoot(o);
  if(!geometries.has(g)){geometries.add(g);geometryCount++;}
  for(let i=0;i<(o.isInstancedMesh?o.count:1);i++){
   const matrix=o.matrixWorld.clone();if(o.isInstancedMesh){o.getMatrixAt(i,instance);matrix.multiply(instance);}
   const entry={object:o,index:o.isInstancedMesh?i:null,matrix,inverse:matrix.clone().invert(),box:g.boundingBox.clone().applyMatrix4(matrix),walk:walkSurface(o,model),dynamic};
   (dynamic?dynamicEntries:staticEntries).push(entry);
  }
 });
 const index=tree(staticEntries),stats={instances:staticEntries.length,dynamic:dynamicEntries.length,geometries:geometryCount,queries:0,triangles:0};
 function refresh(){for(const e of dynamicEntries){e.object.updateWorldMatrix(true,false);e.matrix.copy(e.object.matrixWorld);if(e.index!==null){e.object.getMatrixAt(e.index,instance);e.matrix.multiply(instance);}e.inverse.copy(e.matrix).invert();e.box.copy(e.object.geometry.boundingBox).applyMatrix4(e.matrix);}}
 function candidates(box,fn){if(visit(index,box,fn))return true;for(const e of dynamicEntries)if(e.box.intersectsBox(box)&&fn(e))return true;return false;}
 function triangles(entry,box,fn){const localBox=box.clone().applyMatrix4(entry.inverse);return visit(geometryTree(entry.object.geometry),localBox,t=>{stats.triangles++;return fn(triangleFor(entry,t.i),entry);});}
 function blocked(next,previous=null){
  stats.queries++;const box=bodyBox(next),[bottom,top]=bodyEnds(next),old=previous?bodyEnds(previous):null,r2=(flightBody.radius-.004)**2;
  return candidates(box,e=>triangles(e,box,t=>{const d=capsuleDistanceSq(bottom,top,t);if(d>=r2)return false;
   // A walk spawn can touch a riser. Allow retreat/ascent, never deeper entry.
   if(old&&d>=capsuleDistanceSq(old[0],old[1],t)-1e-10)return false;return true;
  }));
 }
 function support(x,z,h){
  const box=new T.Box3(new T.Vector3(x-.001,h-.13,z-.001),new T.Vector3(x+.001,h+.13,z+.001));
  const down=new T.Ray(new T.Vector3(x,h+.14,z),new T.Vector3(0,-1,0)),normal=new T.Vector3(),hit=new T.Vector3();
  return candidates(box,e=>e.walk&&!e.dynamic&&triangles(e,box,t=>{t.getNormal(normal);if(normal.y<.6)return false;return !!down.intersectTriangle(t.a,t.b,t.c,false,hit)&&Math.abs(hit.y-h)<.13;}));
 }
 return{blocked,support,refresh,stats,entries:staticEntries,dynamicEntries};
}
