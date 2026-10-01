// Shared floors, roofs and walls. Only the final flight opens to the sky.
import {stands,world,local} from './stadium-layout.js';
import {fieldAccess,wellAt,coveredAt} from './field-access-layout.js';
export const tunnel={floor:-4.8,ceiling:-1.85,roofTop:-1.65,half:1.6,wall:.24,topD:12.3,tread:.32,riser:4.8/26,landing:1.6,exitD:-6.55,exitStart:1.6,exitEnd:11.52,gateU:12.6};
export const playerLevel=-3.6;
export const descentBreaks=[12.3,10.38];
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export function descentFloor(d){return playerLevel-clamp(Math.floor((12.3-d+1e-6)/.32),0,6)*.2;}
export function exitFloor(u){const n1=clamp(Math.ceil((u-1.6-1e-6)/.32),0,13),n2=clamp(Math.ceil((u-7.36-1e-6)/.32),0,13);return tunnel.floor+(n1+n2)*tunnel.riser;}
// Proposed continuous recessed handrail, unchanged axis outside the hatch sweep.
export const exitHandrail={d:-7.75,radius:.024,halfSlot:.15,outerExtension:.08,backThickness:.04};
export const exitRailFlights=[[1.6,5.76],[5.76,7.36],[7.36,11.52]];
export function exitHandrailHeight(u){const[a,b]=exitRailFlights.find(([a,b])=>u>=a&&u<=b)||exitRailFlights[u<1.6?0:2];const t=clamp((u-a)/(b-a),0,1);return exitFloor(a)+.94+(exitFloor(b)-exitFloor(a))*t;}
export const undergroundRects=[{u0:-1.84,u1:1.84,d0:-7.81,d1:12.58},{u0:1.6,u1:11.76,d0:-7.81,d1:-5.29}];
export const undergroundHoles=[{u0:-1.84,u1:1.84,d0:2.38,d1:12.5},{...fieldAccess.well,d0:fieldAccess.railPocket.d0}];
export const insideRect=(r,u,d,p=0)=>u>=r.u0-p&&u<=r.u1+p&&d>=r.d0-p&&d<=r.d1+p;
export function undergroundAt(u,d){return undergroundRects.some(r=>insideRect(r,u,d));}
export function undergroundFloor(u,d){return d< -5.29&&u>1.6?exitFloor(u):descentFloor(d);}
export function fixedCeiling(u,d){return d< -5.29&&u>1.6?Math.min(-.24,exitFloor(u)+2.65):Math.max(tunnel.ceiling,descentFloor(d)+2.95);}
export function undergroundCeiling(u,d){return wellAt(u,d)?coveredAt(u,d)?fieldAccess.cover.bottom:Infinity:fixedCeiling(u,d);}
export function undergroundOutline(r){return [[r.u0,r.d0],[r.u0,r.d1],[r.u1,r.d1],[r.u1,r.d0]].map(([u,d])=>world(stands[0],u,d));}
export function stairSoffit(d){return Math.max(-.01,descentFloor(d)+3.18);}
export function routeName(x,z,floor){const p=local(stands[0],x,z);return undergroundAt(p.u,p.d)&&floor<-.01?(p.d< -5.29?'Salida de jugadores':p.d>2.38?'Descenso de jugadores':'Túnel subterráneo'):null;}
export const tunnelWalls=[
 {u0:-1.72,u1:-1.72,d0:-7.69,d1:12.5,bottom:-5.04,kind:'central'},
 {u0:1.72,u1:1.72,d0:-5.41,d1:12.5,bottom:-5.04,kind:'central'},
 {u0:-1.72,u1:11.64,d0:-7.69,d1:-7.69,bottom:-5.04,kind:'exit'},
 {u0:1.72,u1:11.64,d0:-5.41,d1:-5.41,bottom:-5.04,kind:'exit'}
];
export function wallTop(w,u,d){return w.kind==='central'?Math.max(tunnel.roofTop,descentFloor(d)+3.15):u>=fieldAccess.well.u0?.1:Math.max(tunnel.roofTop,fixedCeiling(u,-6.55)+.2);}
export function distanceToWall(u,d,w){const a=w.u1-w.u0,b=w.d1-w.d0,t=clamp(((u-w.u0)*a+(d-w.d0)*b)/(a*a+b*b||1),0,1),base=Math.hypot(u-w.u0-t*a,d-w.d0-t*b);
 // Union with the outboard thickening. The stair-side collision face stays put.
 if(w.kind==='exit'&&w.d0<tunnel.exitD){const v=clamp(u,tunnel.exitStart,tunnel.exitEnd);return Math.min(base,Math.hypot(u-v,d-(w.d0-exitHandrail.outerExtension)));}return base;}
export function undergroundBlocked(u,d,floor,r=.3){
 if(!undergroundAt(u,d))return floor<-.23;
 return tunnelWalls.some(w=>floor<wallTop(w,u,d)-.05&&floor+1.9>w.bottom&&distanceToWall(u,d,w)<r+.12);
}
export const routeWaypoints=[[0,13.6],[0,12.3],[0,10.38],[0,2.38],[0,-6.55],[1.6,-6.55],[5.76,-6.55],[7.36,-6.55],[11.52,-6.55],[13.6,-6.55],[13.6,-10],[22,-10],[22,-28],[0,-60]];
