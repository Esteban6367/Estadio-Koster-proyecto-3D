import {equipment} from './site-equipment.js';
import {spatialIndex} from './spatial-index.js';
import {undergroundAt,undergroundFloor,undergroundBlocked,tunnelWalls,distanceToWall,undergroundCeiling} from './underground-layout.js';
import {houses,cars,fences,walkBounds,walkwayPosts,houseFences,urbanTrees,urbanPoles,streetNames} from './surroundings.js';
import {stands,world,local,flights,flightStep,galleries,cabin,cabinAt} from './stadium-layout.js';
import {interiorAt,interiorBlocked,facilities} from './interior-layout.js';
import {publicGradeCuts,upperPassageBlocked} from './public-layout.js';
import {screenPosts} from './screen-layout.js';
import {boundariesBlock,bridgeHeight,gate} from './boundaries.js';
import {entrance,entryAt,entryFloor,entryBreaks,entryBlocked,publicGateBlocked,facadeRibs,entryObstacles} from './entrance-layout.js';
export {stands,world,local,bend} from './stadium-layout.js';
export function floorHeight(s,d){return flights(s).reduce((h,[a,b])=>h+Math.max(0,Math.ceil((Math.max(0,Math.min(d-a,b-a))-1e-6)/flightStep(s,a)))*.21,0);}
export const inRearAccess=(s,u,d)=>s.id==='main'?entryAt(u,d):Math.abs(u-s.accessU)<1.7&&d>=12.5;
export function rearAccessHeight(s,d){if(s.id==='main')return entryFloor(-1,d);const n1=Math.max(0,Math.min(10,Math.floor((d-12.5+1e-6)/.475))),n2=Math.max(0,Math.min(10,Math.floor((d-(s.depth-4.75)+1e-6)/.475)));return Math.max(0,4.2-(n1+n2)*.21);}
export function accessBreaks(s){return s.id==='main'?entryBreaks():[...Array.from({length:11},(_,i)=>12.5+i*.475),...Array.from({length:11},(_,i)=>s.depth-4.75+i*.475)].sort((a,b)=>a-b);}
export const surfaceHeight=(s,u,d)=>inRearAccess(s,u,d)?(s.id==='main'?entryFloor(u,d):rearAccessHeight(s,d)):cabinAt(s,u,d)?cabin.floor:floorHeight(s,d);
export function aisle(u){return Math.abs(u-Math.round(u/17)*17)<1.20;}
export function gallery(s,d){return galleries(s).some(([a,b])=>d>=a&&d<=b);}
export function floorCandidates(x,z){
 const p=local(stands[0],x,z),under=undergroundAt(p.u,p.d),below=under?undergroundFloor(p.u,p.d):null;
 // The player exit is a real open stairwell. There is no walkable terrain over it.
 if(under&&p.d< -4.71)return[below];
 for(const s of stands){const{u,d}=local(s,x,z);if(Math.abs(u)<=s.length/2&&d>=0&&d<=s.depth){
  const h=surfaceHeight(s,u,d),out=[h];
  if(inRearAccess(s,u,d)&&d>=s.baseDepth-2&&(gallery(s,d)||cabinAt(s,u,d)))out.push(cabinAt(s,u,d)?cabin.floor:floorHeight(s,d));
  if(s.id==='main'&&entryAt(u,d)&&(!publicGradeCuts(d).some(([a,b])=>u>a&&u<b)||cabinAt(s,u,d))){const upper=cabinAt(s,u,d)?cabin.floor:floorHeight(s,d);if(!out.includes(upper))out.push(upper);}
  if(s.id==='main'&&interiorAt(u,d)&&!out.includes(facilities.floor))out.push(facilities.floor);
  if(s.id==='main'&&d>=entrance.wallD+.24&&!out.includes(0))out.push(0);
  if(under&&!out.includes(below))out.push(below);return out;
 }}return under?[0,below]:[0];
}
export function ground(x,z,hint){const a=floorCandidates(x,z);return Number.isFinite(hint)?a.reduce((best,h)=>Math.abs(h-hint)<Math.abs(best-hint)?h:best,a[0]):a[0];}
function cabinBlocked(s,u,d,h){if(s.id!=='main'||h<cabin.floor-.3||h>cabin.floor+cabin.height)return false;const r=.3,w=cabin.halfWidth;if(d<cabin.front-r||d>cabin.back+r||Math.abs(u)>w+r)return false;
 if(Math.abs(u)>w-r||d>cabin.back-r)return true;if(Math.abs(d-cabin.front)<r&&Math.abs(u)>cabin.doorHalf-r)return true;
 if(Math.abs(u-cabin.doorHalf)<r+.03&&d>cabin.front&&d<cabin.front+1.3+r)return true;
 if(Math.abs(d-(cabin.back-1.13))<.26+r&&[-2.7,2.7].some(x=>Math.abs(u-x)<.26+r))return true;
 if(Math.abs(d-(cabin.back-.45))<.28+r&&[-2.7,2.7].some(x=>Math.abs(u-x)<.65+r))return true;return false;}
export const obstacles=[...equipment,...houses.filter(h=>h.near),...houseFences,...cars,...fences,{x:81.5,z:-31.5,w:35,d:52},{x:78.5,z:6,w:29,d:23},{x:95,z:9,w:4,d:17},{x:81.5,z:42.5,w:25,d:15},...[-1,1].flatMap(a=>[-1,1].map(b=>({x:a*49,z:b*68,w:3,d:3}))),{x:-37.4,z:-14,w:2.2,d:9},{x:-37.4,z:14,w:2.2,d:9}];
export const supportUs=s=>[-s.length/2+1.5,...Array.from({length:9},(_,i)=>(i-4)*17+8.5).filter(u=>Math.abs(u)<s.length/2-4),s.length/2-1.5];
export const columns=[];
obstacles.push(...entryObstacles);
for(const u of facadeRibs){const[x,z]=world(stands[0],u,30.85);columns.push({x,z,r:.45,top:6.5});}
for(const p of [...urbanPoles,...streetNames])columns.push({x:p.x,z:p.z,r:.09});
for(const t of urbanTrees)columns.push({x:t.x,z:t.z,r:.20});
columns.push(...screenPosts,{x:gate.x,z:gate.z,r:.085},{x:gate.x+gate.width,z:gate.z,r:.085});
for(const s of stands)for(const u of supportUs(s)){let[x,z]=world(s,u,s.depth-.6);columns.push({x,z,r:.48});const p=world(s,u,4);columns.push({x:p[0],z:p[1],r:.20});}
for(const s of stands.filter(s=>s.id!=='main'))for(const u of supportUs(s)){for(const[d,r]of[[s.depth+.35,.4],[s.depth+1.13,.07]]){const[x,z]=world(s,u,d);columns.push({x,z,r});}}
for(const{x,z}of walkwayPosts)columns.push({x,z,r:.09});
for(const z of[-52.5,52.5])for(const x of[-3.66,3.66])columns.push({x,z,r:.11});
const nearbyObstacles=spatialIndex(obstacles,o=>[o.x-o.w/2-.3,o.z-o.d/2-.3,o.x+o.w/2+.3,o.z+o.d/2+.3]);
const nearbyColumns=spatialIndex(columns,o=>[o.x-o.r-.3,o.z-o.r-.3,o.x+o.r+.3,o.z+o.r+.3]);
export function allowed(x,z,oldX,oldZ,hint){
 const radius=.3,oldH=Number.isFinite(hint)?hint:ground(oldX,oldZ),newH=ground(x,z,oldH),p=local(stands[0],x,z);
 if(x<walkBounds.minX||x>walkBounds.maxX||z<walkBounds.minZ||z>walkBounds.maxZ||Math.abs(newH-oldH)>.23)return false;
 if(publicGateBlocked(x,z,newH))return false;
 if(upperPassageBlocked(p.u,p.d,newH))return false;
 const under=undergroundAt(p.u,p.d)&&Math.abs(newH-undergroundFloor(p.u,p.d))<.01;
 const playerRoom=interiorAt(p.u,p.d)&&Math.abs(newH-facilities.floor)<.02;
 if(newH<-.23&&!under&&!playerRoom)return false;
 if(playerRoom&&interiorBlocked(p.u,p.d))return false;
 // Match each solid wall to its actual vertical interval, not only its footprint.
 for(const w of tunnelWalls){const top=w.top===3?(p.d< -4.71?.80:Math.max(-1.65,undergroundFloor(0,p.d)+3.15)):w.top;
  if(newH<top-.05&&newH+1.85>w.bottom&&distanceToWall(p.u,p.d,w)<radius+.12)return false;
 }
 if(under){if(undergroundBlocked(p.u,p.d,newH)||newH+1.9>undergroundCeiling(p.u,p.d))return false;}
 if(newH>-.5){for(const o of nearbyObstacles(x,z))if(Math.abs(x-o.x)<o.w/2+radius&&Math.abs(z-o.z)<o.d/2+radius)return false;for(const o of nearbyColumns(x,z))if((o.top===undefined||newH<o.top)&&Math.hypot(x-o.x,z-o.z)<o.r+radius)return false;}
 for(const s of stands){const{u,d}=local(s,x,z);if(Math.abs(u)<s.length/2+.3&&d>0&&d<s.depth+.35){
  if(s.id==='main'&&(under||playerRoom))continue;
  if(s.id==='main'&&entryAt(u,d)&&Math.abs(newH-entryFloor(u,d))<.02){if(entryBlocked(u,d,newH))return false;continue;}
  if(s.id==='main'&&newH<.3&&d>=entrance.wallD+.24)continue;
  if(d>s.depth-.38&&!(Math.abs(u-s.accessU)<1.2&&newH<1))return false;
  if(Math.abs(u)>s.length/2-.45&&d>2)return false;
  if(!gallery(s,d)&&!aisle(u)&&!cabinAt(s,u,d))return false;if(cabinBlocked(s,u,d,newH))return false;
 }}
 return !boundariesBlock(x,z,radius,newH);
}
export function move(body,dx,dz){if(Math.abs(dx)+Math.abs(dz)<1e-9)return body;body.floor=ground(body.x,body.z,body.floor);const n=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.08));for(let i=0;i<n;i++){if(allowed(body.x+dx/n,body.z,body.x,body.z,body.floor)){body.x+=dx/n;body.floor=ground(body.x,body.z,body.floor);}if(allowed(body.x,body.z+dz/n,body.x,body.z,body.floor)){body.z+=dz/n;body.floor=ground(body.x,body.z,body.floor);}}return body;}
