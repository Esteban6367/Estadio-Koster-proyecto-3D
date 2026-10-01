import {floorCandidates,allowed,local,stands} from './physics.js';
import {moatChannels} from './boundaries.js';
import {coveredAt,wellAt} from './field-access-layout.js';
import {roads,walkBounds} from './surroundings.js';
import {stadiumBounds} from './aerial-camera.js';
const xs=[walkBounds.minX,walkBounds.maxX],zs=[walkBounds.minZ,walkBounds.maxZ];
for(const r of roads)(r.axis==='x'?xs:zs).push(r.a,r.b);
const span=Math.max(Math.max(...xs)-Math.min(...xs),Math.max(...zs)-Math.min(...zs)),margin=span*.06;
export const flightLimits={minX:Math.min(...xs)-margin,maxX:Math.max(...xs)+margin,minZ:Math.min(...zs)-margin,maxZ:Math.max(...zs)+margin,minY:-10,maxY:stadiumBounds.max[1]+span*.22};
export const flightSpeeds=[2,6,12,24,36];
export function flightVector(yaw,pitch,forward,right,vertical,speed){
 const cp=Math.cos(pitch),x=-Math.sin(yaw)*cp*forward+Math.cos(yaw)*right,y=Math.sin(pitch)*forward+vertical,z=-Math.cos(yaw)*cp*forward-Math.sin(yaw)*right;
 const n=Math.max(1,Math.hypot(x,y,z));return{x:x/n*speed,y:y/n*speed,z:z/n*speed};
}
export function inFlightBounds(p){const b=flightLimits;return p.x>=b.minX&&p.x<=b.maxX&&p.z>=b.minZ&&p.z<=b.maxZ&&p.y>=b.minY&&p.y<=b.maxY;}
function excess(p){const b=flightLimits;return Math.max(0,b.minX-p.x,p.x-b.maxX)+Math.max(0,b.minY-p.y,p.y-b.maxY)+Math.max(0,b.minZ-p.z,p.z-b.maxZ);}
// Existing orbit presets can start above the flight volume (especially portrait).
// Keep their exact pose and permit returning/tangential motion, never a forced jump.
function insideOrReturning(next,previous){return inFlightBounds(next)||(!inFlightBounds(previous)&&excess(next)<=excess(previous)+1e-9);}
// At most 6 cm per collision step, including at 36 m/s / low FPS. No inertia.
export function moveFlight(body,velocity,dt,world,{slide=true}={}){
 const distance=Math.hypot(velocity.x,velocity.y,velocity.z)*Math.max(0,dt),steps=Math.max(1,Math.ceil(distance/.06));
 if(distance<1e-10){body.vx=body.vy=body.vz=0;return true;}
 const delta={x:velocity.x*dt/steps,y:velocity.y*dt/steps,z:velocity.z*dt/steps};let clear=true;
 for(let i=0;i<steps;i++){
  const next={x:body.x+delta.x,y:body.y+delta.y,z:body.z+delta.z};
  if(insideOrReturning(next,body)&&!world.blocked(next,body)){Object.assign(body,next);continue;}
  clear=false;if(!slide)break;
  for(const axis of['y','x','z']){if(Math.abs(delta[axis])<1e-10)continue;const p={x:body.x,y:body.y,z:body.z};p[axis]+=delta[axis];if(insideOrReturning(p,body)&&!world.blocked(p,body))body[axis]=p[axis];}
 }
 body.floor=body.y-1.7;body.vx=body.vy=body.vz=0;return clear;
}
export function safeLanding(body,world){
 const{x,z}=body,p=local(stands[0],x,z);
 // Water channels, moving cover and mouth are never automatic landing targets.
 if(coveredAt(p.u,p.d,.3)||wellAt(p.u,p.d,.3))return null;
 if(moatChannels.some(m=>{const q=local(m.s,x,z);return q.u>=m.start-.3&&q.u<=m.end+.3&&q.d>=m.innerD-.3&&q.d<=m.outerD+.3;}))return null;
 const floors=floorCandidates(x,z).filter(h=>h+1.7<=body.y+.04).sort((a,b)=>b-a);
 for(const h of floors){
  if(!allowed(x,z,x,z,h)||!world.support(x,z,h))continue;
  if(![[.22,0],[-.22,0],[0,.22],[0,-.22]].every(([dx,dz])=>world.support(x+dx,z+dz,h)))continue;
  const target={x,y:h+1.7,z};if(world.blocked(target))continue;
  const probe={...body};if(!moveFlight(probe,{x:0,y:target.y-body.y,z:0},1,world,{slide:false}))continue;
  return{floor:h,y:target.y};
 }return null;
}
export function advanceLanding(body,target,dt,world){
 // A walking stair transition can start a few cm below the nominal eye height.
 // Resolve that small, prevalidated upward adjustment as well as descents.
 const dy=target.y-body.y,velocity={x:0,y:Math.max(-4,Math.min(4,dy/Math.max(dt,1e-8))),z:0};
 if(!moveFlight(body,velocity,dt,world,{slide:false}))return'blocked';
 if(Math.abs(body.y-target.y)<.006){body.y=target.y;body.floor=target.floor;return'done';}return'descending';
}
export function editableTarget(target){return !!(target?.isContentEditable||target?.closest?.('input,textarea,select,form,[contenteditable]:not([contenteditable="false"]),[role="textbox"]')||target?.matches?.('input,textarea,select'));}
