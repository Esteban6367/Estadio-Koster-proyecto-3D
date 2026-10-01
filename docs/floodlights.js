import * as T from './three.module.min.js';
// +Z is the optical axis, local X stays horizontal. No inherited roll.
export function aimQuaternion(from,to){
 const z=to.clone().sub(from).normalize(),x=new T.Vector3().crossVectors(new T.Vector3(0,1,0),z).normalize(),y=new T.Vector3().crossVectors(z,x);
 return new T.Quaternion().setFromRotationMatrix(new T.Matrix4().makeBasis(x,y,z));
}
export function addFloodlightBank(x,z,{batch,beam,unitBox,mats,lampmat,setScope}){
 const target=new T.Vector3(0,0,z*.23),yaw=Math.atan2(-x,-z*.77),rackQ=new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),yaw);
 const shaft=new T.Vector3(x,29.6,z),center=new T.Vector3(0,0,1.25).applyQuaternion(rackQ).add(shaft),lights=[];
 const pt=(u,y,d=0)=>new T.Vector3(u,y,d).applyQuaternion(rackQ).add(center);
 const box=(p,size,mat,q=rackQ)=>batch(unitBox,mat,p.toArray(),size,0,q);
 setScope('towers');
 // Upright rack, open between luminaires, mounted ahead of the lattice shaft.
 for(const u of[-2.45,2.45])beam(pt(u,-1.95).toArray(),pt(u,1.95).toArray(),.065,mats.steel);
 for(const y of[-1.86,-.93,0,.93,1.86])beam(pt(-2.45,y).toArray(),pt(2.45,y).toArray(),.065,mats.steel);
 for(const u of[-1.65,1.65])for(const y of[-1.35,1.35]){
  const a=new T.Vector3(Math.sign(u)*.4,y,0).applyQuaternion(rackQ).add(shaft);
  beam(a.toArray(),pt(u,y,0).toArray(),.07,mats.steel);
  beam(a.clone().add(new T.Vector3(0,-.65,0)).toArray(),pt(u,y,0).toArray(),.045,mats.steel);
 }
 if(!lampmat.userData.optics){
  const data=new Uint8Array(64*64*4);for(let y=0;y<64;y++)for(let x=0;x<64;x++){
   const i=(y*64+x)*4,dx=(x%8-3.5)/4,dy=(y%8-3.5)/4,r=dx*dx+dy*dy,v=r<.40?238:r<.8?188:142;data.set([v,v,Math.round(v*.96),255],i);
  }
  const t=new T.DataTexture(data,64,64);t.colorSpace=T.SRGBColorSpace;t.generateMipmaps=true;t.minFilter=T.LinearMipmapLinearFilter;t.needsUpdate=true;
  lampmat.map=t;lampmat.emissiveMap=t;lampmat.roughness=.35;lampmat.metalness=.12;lampmat.userData.optics=true;
 }
 for(let row=0;row<4;row++)for(let col=0;col<5;col++){
  const u=(col-2)*.96,y=(row-1.5)*.93,p=pt(u,y,.35),q=aimQuaternion(p,target),part=(dx,dy,dz)=>new T.Vector3(dx,dy,dz).applyQuaternion(q).add(p);
  box(p,[.735,.765,.18],mats.steel,q);
  for(const dy of[-.245,0,.245]){box(part(0,dy,.105),[.66,.207,.045],lampmat,q);box(part(0,dy+.115,.10),[.695,.025,.06],mats.dark,q);}
  // Fixed yoke meets the horizontal pivot axis; body pitch is independent.
  for(const side of[-1,1]){beam(pt(u+side*.41,y,-.025).toArray(),part(side*.41,0,0).toArray(),.04,mats.steel);beam(part(side*.35,0,0).toArray(),part(side*.44,0,0).toArray(),.065,mats.dark);}
  beam(pt(u-.41,y,-.025).toArray(),pt(u+.41,y,-.025).toArray(),.04,mats.steel);
  setScope('tower-detail-'+x+'-'+z,'fixtureDetail');
  for(const dx of[-.24,-.12,0,.12,.24])box(part(dx,0,-.125),[.018,.69,.07],mats.steel,q);
  setScope('towers');lights.push({position:p,quaternion:q,target:target.clone()});
 }
 setScope('site');return{center,target,rackQuaternion:rackQ,lights};
}
