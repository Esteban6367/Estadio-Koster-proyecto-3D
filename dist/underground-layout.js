// Academic proposed levels. Local u follows the principal; d increases outward.
import {stands,world,local} from './stadium-layout.js';
export const tunnel={floor:-4.8,ceiling:-1.85,roofTop:-1.65,half:1.6,wall:.24,topD:12.3,tread:.32,riser:4.8/26,landing:1.6,exitD:-6.55,exitStart:1.6,exitEnd:11.52,gateU:15.1};
export const playerLevel=-3.6;
export const descentBreaks=[12.3,10.38];
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export function descentFloor(d){return playerLevel-clamp(Math.floor((12.3-d+1e-6)/.32),0,6)*.2;}
export function exitFloor(u){const n1=clamp(Math.ceil((u-1.6-1e-6)/.32),0,13),n2=clamp(Math.ceil((u-7.36-1e-6)/.32),0,13);return tunnel.floor+(n1+n2)*tunnel.riser;}
export const undergroundRects=[{u0:-1.84,u1:1.84,d0:-8.39,d1:12.58},{u0:-1.84,u1:15.26,d0:-8.39,d1:-4.71}];
export const undergroundHoles=[{u0:-1.84,u1:1.84,d0:2.38,d1:12.5},{u0:-1.84,u1:15.26,d0:-8.39,d1:-4.71}];
export const insideRect=(r,u,d,p=0)=>u>=r.u0-p&&u<=r.u1+p&&d>=r.d0-p&&d<=r.d1+p;
export function undergroundAt(u,d){return undergroundRects.some(r=>insideRect(r,u,d));}
export function undergroundFloor(u,d){return d< -4.71&&u>1.6?exitFloor(u):descentFloor(d);}
export function undergroundCeiling(u,d){return d< -4.71?2.8:Math.max(tunnel.ceiling,descentFloor(d)+2.95);}
export function undergroundOutline(r){return [[r.u0,r.d0],[r.u0,r.d1],[r.u1,r.d1],[r.u1,r.d0]].map(([u,d])=>world(stands[0],u,d));}
export function stairSoffit(d){return Math.max(-.01,descentFloor(d)+3.18);}
export function routeName(x,z,floor){const p=local(stands[0],x,z);return undergroundAt(p.u,p.d)&&floor<-.01?(p.d< -4.71?'Salida de jugadores':p.d>2.38?'Descenso de jugadores':'Túnel subterráneo'):null;}
// Faces with physical extents; all are used by geometry and height-aware collision.
export const tunnelWalls=[
 {u0:-1.72,u1:-1.72,d0:-8.27,d1:12.5,bottom:-5.02,top:3.0},
 {u0:1.72,u1:1.72,d0:-4.83,d1:12.5,bottom:-5.02,top:3.0},
 {u0:-1.72,u1:15.1,d0:-8.27,d1:-8.27,bottom:-5.02,top:.80},
 {u0:1.72,u1:15.1,d0:-4.83,d1:-4.83,bottom:-5.02,top:.80}
];
export function distanceToWall(u,d,w){const a=w.u1-w.u0,b=w.d1-w.d0,t=clamp(((u-w.u0)*a+(d-w.d0)*b)/(a*a+b*b||1),0,1);return Math.hypot(u-w.u0-t*a,d-w.d0-t*b);}
export function undergroundBlocked(u,d,floor,r=.3){
 if(!undergroundAt(u,d))return floor<-.23;
 if(tunnelWalls.some(w=>distanceToWall(u,d,w)<r+.12))return true;
 return false;
}
export const routeWaypoints=[[0,13.6],[0,12.3],[0,8.14],[0,6.54],[0,2.38],[0,-6.55],[1.6,-6.55],[5.76,-6.55],[7.36,-6.55],[11.52,-6.55],[16,-6.55],[22,-6.55],[22,-28],[0,-60]];
