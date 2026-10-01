import {platform as C,platformBodyAtV} from './central-platform-layout.js';
import * as T from './three.module.min.js';
import {mainV} from './main-plan.js';
import {passageEnd,passageFrontV} from './passage-profile.js';
// Convex plan cells extruded vertically. All edges use the shared physical plan.
function geometry(cells,bottom,top){
 const ps=[],uv=[],put=(a,b,c)=>{const n=new T.Vector3().subVectors(new T.Vector3(...b),new T.Vector3(...a)).cross(new T.Vector3().subVectors(new T.Vector3(...c),new T.Vector3(...a)));
  for(const p of[a,b,c]){ps.push(...p);uv.push(Math.abs(n.y)>=Math.max(Math.abs(n.x),Math.abs(n.z))?p[0]/3:p[2]/3,Math.abs(n.y)>=Math.max(Math.abs(n.x),Math.abs(n.z))?p[2]/3:p[1]/3);}
 };
 for(let poly of cells){
  if(poly.length<3)continue;
  const area=poly.reduce((v,p,i)=>{const q=poly[(i+1)%poly.length];return v+p[0]*q[1]-q[0]*p[1];},0);
  if(Math.abs(area)<1e-8)continue;
  if(area<0)poly=poly.slice().reverse();
  const pt=(p,y)=>[-56-p[1],typeof y==='function'?y(p[0],p[1]):y,-p[0]],hi=poly.map(p=>pt(p,top)),lo=poly.map(p=>pt(p,bottom));
  for(let i=1;i<poly.length-1;i++){put(hi[0],hi[i],hi[i+1]);put(lo[0],lo[i+1],lo[i]);}
  for(let i=0;i<poly.length;i++){const j=(i+1)%poly.length;put(lo[i],lo[j],hi[j]);put(lo[i],hi[j],hi[i]);}
 }
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(ps,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.computeVertexNormals();return g;
}
const nodes=(a,b,extra=[])=>[a,...extra.filter(v=>v>a+1e-7&&v<b-1e-7),b].sort((a,b)=>a-b).flatMap((v,i,arr)=>{if(i===arr.length-1)return[v];const n=Math.max(1,Math.ceil((arr[i+1]-v)/.4));return Array.from({length:n},(_,j)=>v+(arr[i+1]-v)*j/n);});
export function planBand(a,b,front,back,bottom,top){
 const us=nodes(a,b,[-16,16]),cells=[];
 for(let i=1;i<us.length;i++){const l=us[i-1],r=us[i],depth=Math.max(back(l)-front(l),back(r)-front(r)),n=Math.max(1,Math.ceil(depth/1.25));
  for(let j=0;j<n;j++){const at=(u,t)=>[u,front(u)+(back(u)-front(u))*t];cells.push([at(l,j/n),at(r,j/n),at(r,(j+1)/n),at(l,(j+1)/n)]);}
 }return geometry(cells,bottom,top);
}
function clip(poly,fn){
 const out=[];for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],fa=fn(a),fb=fn(b);if(fa<=1e-9)out.push(a);if((fa<0)!==(fb<0)){const t=fa/(fa-fb);out.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]);}}return out;
}
function removeRectangle(cells,l,r,front,back){
 return cells.flatMap(poly=>{
  const middle=clip(clip(poly,p=>l-p[0]),p=>p[0]-r);
  return[clip(poly,p=>p[0]-l),clip(poly,p=>r-p[0]),clip(middle,p=>p[1]-front),clip(middle,p=>back-p[1])];
 });
}
export function lowerTierGeometry(d0,d1,bottom,top,a,b,edges){
 const us=nodes(a,b,[-passageEnd-.24,-passageEnd,-16,16,passageEnd,passageEnd+.24]),cells=[];
 const fit=(u,d)=>{
  const half=(d<=11?54+Math.min(1,Math.max(0,d/11)):55-4*(d-11))-.28;
  const l=edges?.left?-half:a,r=edges?.right?half:b;
  return l+(r-l)*(u-a)/(b-a);
 };
 for(let i=1;i<us.length;i++){
  const l=us[i-1],r=us[i],at=(u,d)=>{const v=fit(u,d);return[v,mainV(v,d)];};
  let poly=[at(l,d0),at(r,d0),at(r,d1),at(l,d1)];
  const end=passageEnd+.24;
  cells.push(clip(poly,p=>p[0]+end),clip(poly,p=>end-p[0]));
  const middle=clip(clip(poly,p=>p[0]-end),p=>-end-p[0]);
  cells.push(clip(middle,p=>p[1]-passageFrontV(p[0])+.24));
 }const withoutBody=removeRectangle(cells,-C.half,C.half,C.frontV,1000);
 return geometry(removeRectangle(withoutBody,-C.stairHalf,C.stairHalf,C.stairFootV,C.frontV),bottom,top);
}
export function lowerSeatFits(u,d,angle){
 const v=mainV(u,d),x=-56-v,z=-u,c=Math.cos(angle),s=Math.sin(angle);
 for(const a of[-.28,.28])for(const b of[-.29,.20]){
  const xx=x+a*c+b*s,zz=z-a*s+b*c,U=-zz,V=-xx-56;
  if(Math.abs(U)<=passageEnd+.24&&V>passageFrontV(U)-.31)return false;
  if(platformBodyAtV(U,V,.30))return false;
 }return true;
}
