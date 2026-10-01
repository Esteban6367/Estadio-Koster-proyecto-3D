import {spanAt,world} from './stadium-layout.js';

// Shared proposed geometry for rendering and collisions. Only the canopy extends.
export const canopyFront=4;
export const canopyEndExtension=2.6;
export function canopyHalf(s,d){
 if(s.id==='main'){const front=spanAt(s,canopyFront)/2+canopyEndExtension,back=spanAt(s,s.depth)/2,t=Math.max(0,Math.min(1,(d-canopyFront)/(s.depth+1-canopyFront)));return front+(back-front)*t;}
 const t=Math.max(0,Math.min(1,(d-canopyFront)/10));
 return spanAt(s,d)/2+canopyEndExtension*(1-t*t*(3-2*t));
}
// Ground-reaching end supports removed at the user's request.
export function canopyEndSupports(s){return [];}
