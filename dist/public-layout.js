// Proposed metres. +u = left entering toward the field; d increases toward the street.
// One level distributor only: the longitudinal passage precedes both frontal rises.
export const publicLayout={half:2.7,portalD:33.18,rampStart:8.5,rampTop:4.5,frontY:.72,shortRise:.18,shortTread:.44,endU:51,passFront:8.5,passBack:12.5,passY:0,stairFront:10.2,stairBack:12.5,stairSteps:24,stairRise:.175,stairTread:.30,galleryY:4.2,galleryFront:12.5,galleryBack:14,doorD:29.2,doorWidth:1.1,doorDepth:.30};
const P=publicLayout;
export const publicStairs=[{id:'izquierda',foot:12,dir:1},{id:'derecha',foot:-8,dir:-1}].map(s=>({...s,top:s.foot+s.dir*P.stairSteps*P.stairTread,end:s.foot+s.dir*(P.stairSteps*P.stairTread+2)}));
export const stairAt=(u,d)=>d>=P.stairFront&&d<=P.stairBack?publicStairs.find(s=>{const t=(u-s.foot)*s.dir;return t>=0&&t<=P.stairSteps*P.stairTread+2;}):null;
export const stairHeight=(s,u)=>P.passY+Math.min(P.stairSteps,Math.max(0,Math.floor(((u-s.foot)*s.dir+1e-6)/P.stairTread)+1))*P.stairRise;
export const publicRects=[{u0:-P.half,u1:P.half,d0:0,d1:P.portalD+.15},{u0:-P.endU,u1:P.endU,d0:P.passFront,d1:P.passBack},{u0:-P.half-P.doorDepth,u1:-P.half,d0:P.doorD-P.doorWidth/2,d1:P.doorD+P.doorWidth/2}];
export const publicAt=(u,d,pad=0)=>publicRects.some(r=>u>=r.u0-pad&&u<=r.u1+pad&&d>=r.d0-pad&&d<=r.d1+pad);
export function publicFloor(u,d){
 const stair=stairAt(u,d);if(stair)return stairHeight(stair,u);
 if(d>=P.passFront&&d<=P.passBack)return P.passY;
 if(Math.abs(u)>P.half+.01)return 0;
 // Retained transition to the existing lower public ring (not an opening to the field).
 if(d<2)return 0;if(d<3.76)return Math.min(P.frontY,(Math.floor((d-2+1e-6)/P.shortTread)+1)*P.shortRise);
 if(d<=P.rampTop)return P.frontY;
 if(u>=0)return Math.max(0,P.frontY*(P.rampStart-d)/(P.rampStart-P.rampTop));
 return Math.max(0,P.frontY-Math.floor((d-P.rampTop+1e-6)/P.shortTread)*P.shortRise);
}
export function publicBlocked(u,d){
 if(!publicAt(u,d))return true;const h=publicFloor(u,d);if(d<1.65)return false;
 for(const[du,dd]of[[.3,0],[-.3,0],[0,.3],[0,-.3]]){
  const a=u+du,b=d+dd;if(b<0||b>P.portalD+.14)continue;
  if(b>P.passBack&&b<P.galleryBack&&publicStairs.some(s=>{const t=(a-s.top)*s.dir;return t>.32&&t<1.68;})&&h>P.galleryY-.01)continue;
  if(!publicAt(a,b))return true;
 }
 if(d>P.rampTop+.05&&d<P.rampStart-.03&&Math.abs(u)<.34)return true;
 // Unconfirmed room: a real jamb and closed leaf, not a deep box.
 if(u< -P.half+.19&&Math.abs(d-P.doorD)<.85)return true;
 for(const s of publicStairs){const t=(u-s.foot)*s.dir,L=P.stairSteps*P.stairTread+2;
  if(t>-.12&&t<L+.3&&Math.abs(d-(P.stairFront-.10))<.38)return true;
  if(t>L-.32&&t<L+.35&&d>P.stairFront-.35)return true;
 }
 return false;
}
export function upperPassageBlocked(u,d,h){
 if(h<P.galleryY-.01||h>5.25||d<=12.2||d>=13.06||Math.abs(u)>51.3)return false;
 return !publicStairs.some(s=>{const t=(u-s.top)*s.dir;return t>.30&&t<1.70;});
}
export function publicGradeCuts(d){const out=[];if(d<10.5)out.push([-2.7,2.7]);if(d>=8.5&&d<12.5)out.push([-51,51]);return out;}
export const mainMiddleStep=1/3;
export const publicRoofSlot={d0:8.3,d1:12.8,u0:-51,u1:51};
export const inPublicRoofSlot=(u,d)=>d>=8.3&&d<12.8&&Math.abs(u)<51;
// Slab soffit shared by fitted vestibule walls and section drawings.
export function vestibuleSoffit(d){
 if(d>=22&&d<=25.45)return 7.76; // retained cabin floor
 const rise=(a,b,step)=>Math.max(0,Math.ceil((Math.max(0,Math.min(d-a,b-a))-1e-6)/step))*.21;
 return rise(2,10.5,.425)+rise(14,20,1/3)+rise(22,30.5,.425)-.22;
}
export const vestibuleSections=(()=>{const points=[12.76,14,20,22,25.3,25.45,30.5,32.5,33];for(let d=14;d<20-.001;d+=1/3)points.push(d);for(let d=22;d<30.5-.001;d+=.425)points.push(d);const a=[...new Set(points.map(d=>+d.toFixed(6)))].sort((a,b)=>a-b);return a.slice(0,-1).map((d,i)=>({d0:d,d1:a[i+1],top:vestibuleSoffit((d+a[i+1])/2)}));})();
