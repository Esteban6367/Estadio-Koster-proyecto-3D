import * as T from './three.module.min.js';
import {world,local,spanAt,fittedBox} from './stadium-layout.js';
import {canopyFront,canopyHalf,canopyEndSupports} from './main-canopy-layout.js';
import {floorHeight} from './physics.js';
import {publicLayout as P} from './public-layout.js';

// Architectural concept for the current model; dimensions are not structural sizing.
// Keep the existing rear supports, seating envelope and open longitudinal passage.
export function addMainCanopy(s,{box,beam,mesh,merge,curvedBlock,roofFront,roofBack,supports}){
 // Emirates Stadium (Populous): pale tubular trusses above a slender roof edge.
 // Adapted to this single stand; this is not a replica of its engineered structure.
 const steel=new T.MeshStandardMaterial({color:0xd8e0e2,roughness:.48,metalness:.45});
 const skin=new T.MeshStandardMaterial({color:0xbfc9ce,roughness:.76,metalness:.3});
 const fascia=new T.MeshStandardMaterial({color:0x244f70,roughness:.48,metalness:.45});
 const trim=new T.MeshStandardMaterial({color:0x9babb4,roughness:.46,metalness:.7});
 const front=canopyFront,back=s.depth+1,root=s.depth-.6;
 const y=d=>roofFront+(roofBack-roofFront)*(d-front)/(back-front)+.22*Math.sin(Math.PI*(d-front)/(back-front));
 const pt=(u,d,h)=>{const[x,z]=world(s,u,d);return[x,h,z];};
 const at=(u,d,h,w,t,dep,mat)=>fittedBox(s,box,u,d,h,w,t,dep,mat);
 const mark=(o,name)=>{o.name=name;o.userData.scope='main-canopy';return o;};
 const roofParts=[];
 for(let d=front;d<back-.001;){
  const e=Math.min(d+.5,back,...[8.3,12.8].filter(v=>v>d+.0001));
  const half=canopyHalf(s,(d+e)/2);
  const ranges=d>=8.3&&d<12.8?[[-half,-P.endU],[P.endU,half]]:[[-half,half]];
  for(const[a,b]of ranges)if(b>a){
   const g=curvedBlock(s,d,e,y(d)-.14,y(d),y(e),a,b,false,y(e)-.14),p=g.attributes.position;
   // Match the same continuous edge at both ends of every strip, with no overlap.
   for(let i=0;i<p.count;i++){
    const q=local(s,p.getX(i),p.getZ(i));
    if(Math.abs(Math.abs(q.u)-half)<.001){const[x,z]=world(s,Math.sign(q.u)*canopyHalf(s,q.d),q.d);p.setXYZ(i,x,p.getY(i),z);}
   }
   g.computeVertexNormals();roofParts.push(g);
  }
  d=e;
 }
 const roof=mark(mesh(merge(roofParts),skin),'Principal · cubierta del voladizo');
 // No independent columns or plinths on the exterior paving.
 const frontHalf=canopyHalf(s,front),chordY=y(front)+.18;
 // Continuous triangular edge girder: exposed, gently crowned and tied to every rib.
 const nodes=[...Array.from({length:49},(_,i)=>-frontHalf+2*frontHalf*i/48),...canopyEndSupports(s).map(p=>p.u),...supports.map(u=>u*canopyHalf(s,front)/canopyHalf(s,root))].sort((a,b)=>a-b).filter((u,i,a)=>i===0||u-a[i-1]>.05);
 const crown=u=>chordY+1.4+1.8*Math.cos(u/frontHalf*Math.PI/2)**2;
 for(let i=0;i<nodes.length-1;i++){
  const a=nodes[i],b=nodes[i+1];
  beam(pt(a,front,crown(a)),pt(b,front,crown(b)),.12,steel);
  for(const dd of[-.38,.38]){
   beam(pt(a,front+dd,chordY),pt(b,front+dd,chordY),.10,steel);
   beam(pt(a,front+dd,chordY),pt(b,front,crown(b)),.048,steel);
   beam(pt(a,front,crown(a)),pt(a,front+dd,chordY),.045,steel);
  }
  beam(pt(a,front-.38,chordY),pt(a,front+.38,chordY),.045,steel);
 }
 for(const dd of[-.38,.38])beam(pt(frontHalf,front,crown(frontHalf)),pt(frontHalf,front+dd,chordY),.045,steel);
 // Tapered paired Warren trusses sit ABOVE the roof: no webs in spectator views.
 for(const u of supports){
  const height=d=>.34+2.15*Math.pow(Math.min(1,(d-front)/(root-front)),1.22);
  const axis=d=>u*canopyHalf(s,d)/canopyHalf(s,root);
  const n=10;
  const base=floorHeight(s,root);
  beam(pt(u,root,base+.18),pt(u,root,y(root)+height(root)),.25,steel);
  at(u,root,base+.09,.72,.18,.72,steel);
  for(const du of[-.23,.23])for(const dd of[-.23,.23])at(u+du,root+dd,base+.20,.055,.06,.055,trim);
  for(const side of[-.18,.18]){
   for(let i=0;i<n;i++){
    const a=front+(root-front)*i/n,b=front+(root-front)*(i+1)/n;
    const ua=axis(a)+side,ub=axis(b)+side,loA=y(a)+.10,loB=y(b)+.10,hiA=y(a)+height(a),hiB=y(b)+height(b);
    beam(pt(ua,a,loA),pt(ub,b,loB),.065,steel);
    beam(pt(ua,a,hiA),pt(ub,b,hiB),.07,steel);
    beam(pt(ua,a,i%2?hiA:loA),pt(ub,b,i%2?loB:hiB),.036,steel);
    beam(pt(ua,a,loA),pt(ua,a,hiA),.032,steel);
   }
   beam(pt(axis(root)+side,root,y(root)+.1),pt(axis(root)+side,root,y(root)+height(root)),.055,steel);
  }
  for(let i=0;i<=n;i++){
   const d=front+(root-front)*i/n;
   beam(pt(axis(d)-.18,d,y(d)+height(d)),pt(axis(d)+.18,d,y(d)+height(d)),.034,steel);
   if(d<8.3||d>=12.8)at(axis(d),d,y(d)+.03,.58,.08,.30,steel);
  }
  // Short rear return and knee meet the existing rear column above the gallery.
  beam(pt(u,root,y(root)+.1),pt(axis(back),back,y(back)+.1),.09,steel);
  beam(pt(u,root,y(root)-2.0),pt(axis(root-3.2),root-3.2,y(root-3.2)+.1),.105,steel);
  at(u,root,y(root),.60,.8,.10,trim);
 }
 // Longitudinal purlins and roof-plane bracing connect all trusses.
 for(const d of[4.4,7.9,13.2,17,21,25,29,back-.25]){
  const half=canopyHalf(s,d);
  for(let u=-half;u<half;u+=2)beam(pt(u,d,y(d)-.175),pt(Math.min(u+2,half),d,y(d)-.175),.045,trim);
 }
 for(let i=0;i<supports.length-1;i++)if(i%2===0)for(const[a,b]of[[13.2,20],[25,root]]){
  const axis=(u,d)=>u*canopyHalf(s,d)/canopyHalf(s,root);
  beam(pt(axis(supports[i],a),a,y(a)+.12),pt(axis(supports[i+1],b),b,y(b)+.12),.025,steel);
  beam(pt(axis(supports[i+1],a),a,y(a)+.12),pt(axis(supports[i],b),b,y(b)+.12),.025,steel);
 }
 // Closed blue fascias, a fine drip edge and finished borders around the open slot.
 const fasciaParts=[];
 for(const d of[front,back,8.3,12.8]){
  const half=(d===8.3||d===12.8)?P.endU:canopyHalf(s,d);
  for(let u=-half;u<half;u+=2){const v=Math.min(u+2,half);
   fasciaParts.push(curvedBlock(s,d-.07,d+.07,y(d)-.33,y(d)+.06,y(d)+.06,u,v));
   beam(pt(u,d,y(d)+.075),pt(v,d,y(d)+.075),.025,trim);
  }
 }
 mark(mesh(merge(fasciaParts),fascia),'Principal · remates de cubierta');
 for(const side of[-1,1])for(let d=front;d<back;d+=.5){const e=Math.min(back,d+.5);beam(pt(side*canopyHalf(s,d),d,y(d)-.06),pt(side*canopyHalf(s,e),e,y(e)-.06),.08,fascia);}
 return roof;
}
