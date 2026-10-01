import * as T from './three.module.min.js';
import {mainD} from './main-plan.js';
import {passageFrontV,passageRearV} from './passage-profile.js';
import {platform as C,platformBenchVs,platformBenchRanges,platformRowEdges,platformRowLevel,platformFloorV} from './central-platform-layout.js';
import {planBand} from './plan-geometry.js';
import {stairSoffit} from './interior-layout.js';

function plaster(base,color){
 const m=base.clone();m.color.setHex(color);m.roughness=.96;m.metalness=0;
 const n=128,pixels=new Uint8Array(n*n*4),normals=new Uint8Array(n*n*4);
 for(let i=0;i<n*n;i++){let q=Math.imul(i+31,374761393);q=Math.imul(q^(q>>>13),1274126177);const t=((q^(q>>>16))>>>0)/4294967295,j=i*4,c=223+Math.round(t*23);pixels.set([c,c,c,255],j);normals.set([126+Math.round(t*4),127+Math.round(t*3),254,255],j);}
 const tx=(data,srgb)=>{const t=new T.DataTexture(data,n,n);t.wrapS=t.wrapT=T.RepeatWrapping;t.generateMipmaps=true;t.minFilter=T.LinearMipmapLinearFilter;t.colorSpace=srgb?T.SRGBColorSpace:T.NoColorSpace;t.needsUpdate=true;return t;};
 m.map=tx(pixels,true);m.normalMap=tx(normals,false);m.normalScale=new T.Vector2(.14,.14);m.roughnessMap=null;return m;
}
export function addCentralDeck({mesh,merge,box,beam,mats,sitTargets,setScope}){
 setScope('main');
 const pt=(u,v,h)=>[-56-v,h,-u],flat=v=>()=>v,benches=[],parts=[],walls=[],steps=[],shells=[];
 // Match the upper stand wall's insideBlue paint; keep the photographed plaster finish.
 const wall=plaster(mats.wall,0x304966),seat=plaster(mats.wall,0x12a5b5),concrete=plaster(mats.concrete,0xa4aaa7);
 const handrail=mats.blue.clone();handrail.color.setHex(0x079ca7);
 const surface=(geos,mat,name,walk=false)=>{const o=mesh(Array.isArray(geos)?merge(geos):geos,mat);o.name=name;o.userData.scope='main';o.userData.bakeOccluder=true;if(walk)o.userData.walkingSurface=true;return o;};
 function clipped(a,b,front,back,lo,hi,bottom,top){
  const f=u=>Math.min(back(u),Math.max(lo,front(u))),g=u=>Math.max(f(u),Math.min(hi,back(u)));
  return planBand(a,b,f,g,bottom,top);
 }
 const boundaries=[C.frontV,...platformRowEdges,C.top+100];
 // Solid terrace rows; a central stair uses two 0.14 m steps at each 0.28 m rise.
 for(let i=0;i<7;i++){
  const lo=boundaries[i],hi=boundaries[i+1],h=C.frontLevel+i*.28;
  for(const[a,b]of[[-C.half,-C.stairHalf],[C.stairHalf,C.half]]){
   parts.push(clipped(a,b,flat(C.frontV),passageFrontV,lo,hi,Math.min(h-C.slab,C.soffit),h));
  }
  for(const[a,b]of[[-C.neckHalf,-C.stairHalf],[C.stairHalf,C.neckHalf]])
   parts.push(clipped(a,b,passageFrontV,passageRearV,lo,hi,C.soffit,h));
  const breaks=i<6?[lo,hi-.30,hi]:[lo,hi];
  for(let j=1;j<breaks.length;j++){
   const v0=breaks[j-1],v1=breaks[j],level=h+(j===2?.14:0);
   // Continuous structural underside above the existing private tunnel.
   parts.push(clipped(-C.stairHalf,C.stairHalf,flat(C.frontV),passageFrontV,v0,v1,(u,v)=>Math.min(level-C.slab,stairSoffit(mainD(u,v))),level));
   parts.push(clipped(-C.stairHalf,C.stairHalf,passageFrontV,passageRearV,v0,v1,C.soffit,level));
  }
 }
 const slab=surface(parts,concrete,'Sector central · terrazas descendentes',true);
 // Base blocks leave the complete private tunnel opening, not just the central stair.
 // Trim the inner 0.44 m of each base where the protected tunnel is wider than the aisle.
 const baseParts=[];
 for(let i=0;i<7;i++){const lo=boundaries[i],hi=boundaries[i+1],h=C.frontLevel+i*.28;
  for(const[a,b]of[[-C.half,-1.84],[1.84,C.half]])
   baseParts.push(clipped(a,b,flat(C.frontV),u=>passageFrontV(u)-.24,lo,hi,-.01,Math.min(h-C.slab,C.soffit)));
 }
 surface(baseParts,concrete,'Sector central · apoyo sobre tribuna inferior');
 const wallTop=(u,v)=>C.frontLevel+C.guard+(C.top-C.frontLevel)*Math.max(0,Math.min(1,(v-C.frontV)/(passageRearV(0)-C.frontV)));
 // Each wall starts on its own terrace: no blue face coplanar with the concrete fascia.
 function guard(a,b,front,back){for(let i=0;i<7;i++)walls.push(clipped(a,b,front,back,boundaries[i],boundaries[i+1],C.frontLevel+i*.28,wallTop));}
 for(const[a,b]of[[-C.half,-C.stairHalf],[C.stairHalf,C.half]])guard(a,b,flat(C.frontV),flat(C.frontV+C.wall));
 for(const[a,b]of[[-C.half,-C.half+C.wall],[C.half-C.wall,C.half]])guard(a,b,flat(C.frontV),passageFrontV);
 for(const[a,b]of[[-C.half,-C.neckHalf],[C.neckHalf,C.half]])guard(a,b,u=>passageFrontV(u)-C.wall,passageFrontV);
 for(const[a,b]of[[-C.neckHalf,-C.neckHalf+C.wall],[C.neckHalf-C.wall,C.neckHalf]])guard(a,b,passageFrontV,passageRearV);
 for(const[a,b]of[[-C.neckHalf,-C.stairHalf],[C.stairHalf,C.neckHalf]])guard(a,b,u=>passageRearV(u)-C.wall,passageRearV);
 const guardMesh=surface(walls,wall,'Sector central · muros revocados azules');
 const tread=C.stairRun/C.stairSteps;
 for(let i=0;i<C.stairSteps;i++){
  const a=C.stairFootV+i*tread,b=a+tread,h=C.stairBase+(i+1)*C.stairRise;
  steps.push(planBand(-C.stairHalf,C.stairHalf,flat(a),flat(b),(u,v)=>Math.min(h-.22,stairSoffit(mainD(u,v))),h));
 }
 const stair=surface(steps,concrete,'Sector central · acceso inferior',true);
 // Teal handrails follow the exterior approach, outside the clear central aisle.
 for(const u of[-C.stairHalf-.08,C.stairHalf+.08]){
  beam(pt(u,C.stairFootV,C.stairBase+1.02),pt(u,C.frontV,C.frontLevel+1.02),.025,handrail);
  for(const i of[0,2,5]){const v=C.stairFootV+i*tread,h=C.stairBase+i*C.stairRise;beam(pt(u,v,h),pt(u,v,h+1.02),.02,handrail);}
 }
 // Solid concrete plinths, horizontal seats and tall gently reclined backrests.
 const plinths=[];
 for(const v of platformBenchVs)for(const[a,b]of platformBenchRanges(v)){
  const y=platformRowLevel(v),n=Math.ceil((b-a)/2.6),len=(b-a)/n;
  plinths.push(planBand(a,b,flat(v-.26),flat(v+.15),y,y+.36));
  for(let i=0;i<n;i++){
   const left=a+i*len+.007,w=len-.014,u=left+w/2;
   const shape=new T.Shape();shape.moveTo(-.28,.44);shape.lineTo(.11,.44);shape.lineTo(.205,1.07);shape.lineTo(.26,1.07);shape.lineTo(.17,.36);shape.lineTo(-.28,.36);shape.closePath();
   const g=new T.ExtrudeGeometry(shape,{depth:w,bevelEnabled:true,bevelThickness:.007,bevelSize:.007,bevelSegments:1,steps:1,curveSegments:1});
   const p=g.attributes.position;for(let j=0;j<p.count;j++){const x=p.getX(j),yy=p.getY(j),z=p.getZ(j);p.setXYZ(j,-56-v-x,y+yy,-left-z);}g.computeVertexNormals();shells.push(g);
   benches.push({u,d:mainD(u,v),v,width:w,floor:y,height:y+.44,backTop:y+1.077});
  }
  for(let u=a+.4;u<b-.2;u+=.7){const[x,,z]=pt(u,v-.04,0);sitTargets.push({x,z,floor:y,eye:y+1.22,angle:Math.PI/2,label:'Bancos con respaldo · sector central'});}
 }
 const benchMesh=surface(shells,seat,'Sector central · bancos con respaldo');
 const plinthMesh=surface(plinths,concrete,'Sector central · bases macizas de bancos');
 return{slab,benches,stair,guardMesh,benchMesh,plinthMesh,top:C.top,soffit:C.soffit};
}
