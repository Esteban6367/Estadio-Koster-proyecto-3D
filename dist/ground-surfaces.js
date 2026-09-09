import * as T from './three.module.min.js';
export function trackShape(rx,rz,r){
 const s=new T.Shape();s.moveTo(-rx+r,-rz);s.lineTo(rx-r,-rz);s.absarc(rx-r,-rz+r,r,-Math.PI/2,0);s.lineTo(rx,rz-r);s.absarc(rx-r,rz-r,r,0,Math.PI/2);s.lineTo(-rx+r,rz);s.absarc(-rx+r,rz-r,r,Math.PI/2,Math.PI);s.lineTo(-rx,-rz+r);s.absarc(-rx+r,-rz+r,r,Math.PI,Math.PI*1.5);return s;
}
export function pathHole(shape){return new T.Path(shape.getPoints(28));}
// Subdivide long planar triangles where baked pools of light need spatial samples.
// Preserve holes, winding and metric UVs. No change to collision footprints.
export function refineGround(g,maxEdge=5,localOnly=false){
 const p=g.attributes.position,idx=g.index,out=[],uv=[],limit=maxEdge*maxEdge;
 function tri(a,b,c,depth=0){
  const near=Math.min(a[0],b[0],c[0])<170&&Math.max(a[0],b[0],c[0])>-170&&Math.min(a[2],b[2],c[2])<180&&Math.max(a[2],b[2],c[2])>-180;
  const pts=[a,b,c],d=pts.map((v,i)=>v.reduce((n,x,k)=>n+(x-pts[(i+1)%3][k])**2,0)),edge=d.indexOf(Math.max(...d));
  const area=Math.abs((b[0]-a[0])*(c[2]-a[2])-(b[2]-a[2])*(c[0]-a[0]))*.5;
  const threshold=localOnly&&!near?1600:limit;
  if(d[edge]>threshold&&area>threshold*.28&&depth<22){const a=pts[edge],b=pts[(edge+1)%3],c=pts[(edge+2)%3],m=a.map((x,i)=>(x+b[i])/2);tri(a,m,c,depth+1);tri(m,b,c,depth+1);return;}
  for(const v of pts){out.push(...v);uv.push(v[0]/4,v[2]/4);}
 }
 for(let i=0;i<(idx?.count||p.count);i+=3){const v=[];for(let k=0;k<3;k++){const n=idx?idx.getX(i+k):i+k;v.push([p.getX(n),p.getY(n),p.getZ(n)]);}tri(...v);}
 const n=new T.BufferGeometry();n.setAttribute('position',new T.Float32BufferAttribute(out,3));n.setAttribute('uv',new T.Float32BufferAttribute(uv,2));n.computeVertexNormals();g.dispose();return n;
}
