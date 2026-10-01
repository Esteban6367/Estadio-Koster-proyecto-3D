import * as T from './three.module.min.js';
import {stands,world,spanAt} from './stadium-layout.js';

// The north closure starts at the existing stand, without moving its envelope.
const end=world(stands[0],spanAt(stands[0],30.3)/2,30.3);
export const whiteGate={x:-101.7,z:end[1],half:1.5,height:3.12,wallEnd:end[0]-.45,standEnd:end};
export const whiteGateState={progress:0,target:0,blocked:false};
export function whiteGateSegments(progress=whiteGateState.progress){
 const a=progress*Math.PI/2,g=whiteGate;
 return[-1,1].map(side=>({side,a:[g.x+side*g.half,g.z],b:[g.x+side*g.half-side*g.half*Math.cos(a),g.z+g.half*Math.sin(a)]}));
}
function distance(x,z,a,b){const dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz)));return Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t);}
export function whiteGateBlocked(x,z,h=0,progress=whiteGateState.progress,bodyHeight=1.85,margin=.37){
 return h<whiteGate.height&&h+bodyHeight>0&&whiteGateSegments(progress).some(s=>distance(x,z,s.a,s.b)<margin);
}
export const whiteGateInReach=body=>body.floor<1&&Math.abs(body.x-whiteGate.x)<2.8&&Math.abs(body.z-whiteGate.z)<3;
export function toggleWhiteGate(){whiteGateState.target=whiteGateState.target?0:1;whiteGateState.blocked=false;}
export function advanceWhiteGate(dt,body){
 const s=whiteGateState,next=s.progress+Math.sign(s.target-s.progress)*Math.min(Math.abs(s.target-s.progress),Math.min(.12,dt)/2.6);
 s.blocked=false;if(next===s.progress)return false;
 const count=Math.max(1,Math.ceil(Math.abs(next-s.progress)*Math.PI/2*whiteGate.half/.025));
 for(let i=1;i<=count;i++)if(whiteGateBlocked(body.x,body.z,body.floor,s.progress+(next-s.progress)*i/count,body.collisionHeight??1.85,body.collisionMargin??.37)){s.blocked=true;return false;}
 s.progress=next;return true;
}
export function addWhiteGate(scene,mats,merge){
 const leaves=whiteGateSegments(0).map(({a,side})=>{
  const group=new T.Group();group.name='Portón blanco · hoja móvil';group.userData.dynamicTransform=true;group.position.set(a[0],0,a[1]);scene.add(group);
  const parts=new Map();
  const box=(x,y,w,h,d,mat=mats.white,z=0)=>{const g=new T.BoxGeometry(w,h,d);g.translate(x,y,z);if(!parts.has(mat))parts.set(mat,[]);parts.get(mat).push(g);};
  box(.75,1.18,1.47,2.36,.08);
  for(const x of[.022,1.478])box(x,1.56,.035,3.12,.10);
  for(const y of[.04,2.36,3.10])box(.75,y,1.50,.045,.10);
  for(let x=.15;x<1.4;x+=.15)box(x,2.73,.018,.74,.018);
  box(1.40,1.20,.035,.24,.045,mats.steel,-side*.07);
  for(const[mat,geometries]of parts){const o=new T.Mesh(merge(geometries),mat);o.castShadow=o.receiveShadow=true;group.add(o);}
  return{group,side};
 });
 const update=()=>{const a=whiteGateState.progress*Math.PI/2;for(const{group,side}of leaves){group.rotation.y=Math.atan2(-Math.sin(a),-side*Math.cos(a));group.updateMatrix();}};
 update();return{leaves:leaves.map(v=>v.group),update};
}
