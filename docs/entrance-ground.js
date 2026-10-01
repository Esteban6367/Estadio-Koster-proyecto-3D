import * as T from './three.module.min.js';
import {world,stands} from './stadium-layout.js';
// Shared outline: the forecourt replaces the old terrain, rather than floating on it.
export const forecourtBands=(()=>{const edge=[[-62,-86]];for(let z=-57.5;z<=57.5;z+=2.5)edge.push([z,world(stands[0],-z,33.01)[0]]);edge.push([62,-86]);return edge.slice(1).map(([z,x],i)=>{const[a,b]=edge[i];return[[-110.4,a],[b,a],[x,z],[-110.4,z]];});})();
function clip(poly,a,b,keepInside){const side=p=>(b[0]-a[0])*(p[2]-a[1])-(b[1]-a[1])*(p[0]-a[0]),out=[];for(let i=0;i<poly.length;i++){const p=poly[i],q=poly[(i+1)%poly.length],dp=side(p),dq=side(q),ip=keepInside?dp>=-1e-9:dp<=1e-9,iq=keepInside?dq>=-1e-9:dq<=1e-9;if(ip)out.push(p);if(ip!==iq){const t=dp/(dp-dq);out.push(p.map((x,k)=>x+(q[k]-x)*t));}}return out;}
export function cutForecourt(g){const p=g.attributes.position,idx=g.index,out=[];
 for(let i=0;i<(idx?.count||p.count);i+=3){const triangle=[];for(let j=0;j<3;j++){const k=idx?idx.getX(i+j):i+j;triangle.push([p.getX(k),p.getY(k),p.getZ(k)]);}let fragments=[triangle];
  if(Math.max(...triangle.map(p=>p[0]))>-110.4&&Math.min(...triangle.map(p=>p[0]))<-86&&Math.max(...triangle.map(p=>p[2]))>-62&&Math.min(...triangle.map(p=>p[2]))<62){
   for(const quad of forecourtBands){const next=[];for(const polygon of fragments){if(Math.max(...polygon.map(p=>p[2]))<quad[0][1]||Math.min(...polygon.map(p=>p[2]))>quad[2][1]){next.push(polygon);continue;}let inside=polygon;for(let j=0;j<4&&inside.length>=3;j++){const outside=clip(inside,quad[j],quad[(j+1)%4],false);if(outside.length>=3)next.push(outside);inside=clip(inside,quad[j],quad[(j+1)%4],true);}}fragments=next;}
  }
  for(const f of fragments)for(let j=1;j<f.length-1;j++){const[a,b,c]=[f[0],f[j],f[j+1]],area=(b[0]-a[0])*(c[2]-a[2])-(b[2]-a[2])*(c[0]-a[0]);if(Math.abs(area)>1e-7)out.push(...a,...b,...c);}
 }
 const result=new T.BufferGeometry();result.setAttribute('position',new T.Float32BufferAttribute(out,3));result.setAttribute('uv',new T.Float32BufferAttribute(out.flatMap((v,i)=>i%3===1?[]:[v/4]),2));result.computeVertexNormals();g.dispose();return result;
}
