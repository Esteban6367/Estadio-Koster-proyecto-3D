import * as T from './three.module.min.js';
import {stands,world,galleries,flights,flightStep,solidRanges} from './stadium-layout.js';
import {floorHeight,supportUs,inRearAccess,surfaceHeight} from './physics.js';
import {equipment} from './site-equipment.js';
export function addCloseDetails(scene,{box,beam,mats,sign,setScope}){
 // One shared number atlas instead of a texture/material for every row.
 const sheet=document.createElement('canvas');sheet.width=512;sheet.height=256;const ctx=sheet.getContext('2d');ctx.fillStyle='#153f65';ctx.fillRect(0,0,512,256);ctx.fillStyle='#eef4f5';ctx.font='bold 22px Arial';ctx.textAlign='center';ctx.textBaseline='middle';for(let n=0;n<64;n++)ctx.fillText(String(n+1),n%8*64+32,Math.floor(n/8)*32+17);
 const atlas=new T.CanvasTexture(sheet);atlas.colorSpace=T.SRGBColorSpace;const rowMat=new T.MeshStandardMaterial({map:atlas,roughness:.8,emissive:0xffffff,emissiveMap:atlas,emissiveIntensity:.08});
 for(const s of stands){setScope(s.id,'fixtureDetail');const pt=(u,d,y)=>{const[x,z]=world(s,u,d);return[x,y,z];};const at=(u,d,y,w,h,t,m)=>{const p=pt(u,d,y);box(p[0],p[1],p[2],w,h,t,m,s.angle);};
  let row=0;const positions=[],uv=[];for(const[a,b]of flights(s))for(let d=a+2*flightStep(s,a);d<=b+.001;d+=2*flightStep(s,a)){const n=row++,y=floorHeight(s,d)-.10,dep=d-flightStep(s,a)-.006;for(const u of[-32.1,32.1]){if(!solidRanges(s,d).some(([l,r])=>u>l&&u<r))continue;
   const points=[pt(u-.16,dep,y-.07),pt(u+.16,dep,y-.07),pt(u+.16,dep,y+.07),pt(u-.16,dep,y+.07)],c=n%8/8,v=1-Math.floor(n/8)/8,coords=[[c,v-.125],[c+.125,v-.125],[c+.125,v],[c,v]];
   for(const i of[0,1,2,0,2,3]){positions.push(...points[i]);uv.push(...coords[i]);}
  }}
  const rows=new T.BufferGeometry();rows.setAttribute('position',new T.Float32BufferAttribute(positions,3));rows.setAttribute('uv',new T.Float32BufferAttribute(uv,2));rows.computeVertexNormals();const rowMesh=new T.Mesh(rows,rowMat);rowMesh.userData.scope=s.id;rowMesh.userData.detail='fixtureDetail';rowMesh.name='Filas propuestas · '+s.id;scene.add(rowMesh);
  for(const u of supportUs(s)){
   const y=floorHeight(s,s.depth)+3.8-.37;at(u,4,y,.49,.48,.045,mats.steel);
   for(const du of[-.15,.15])for(const dy of[-.14,.14])at(u+du,3.965,y+dy,.043,.045,.05,mats.dark);
  }
  for(let u=Math.ceil(-s.length/2/17)*17;u<s.length/2;u+=17)for(const side of[-1,1]){
   const uu=u+side*1.55;
   for(const[a,b]of flights(s)){
    if(s.id==='main'&&u===0&&a<12.5)continue;
    for(let d=a+.2;d<(s.id==='main'&&a===2?8.5:b);d+=2){const y=s.id==='main'?floorHeight(s,d):surfaceHeight(s,uu,d);at(uu,d,y+.018,.12,.036,.13,mats.steel);}
    for(const d of[a,s.id==='main'&&a===2?8.5:b]){const y=(s.id==='main'?floorHeight(s,d):surfaceHeight(s,uu,d))+1.05;beam(pt(uu,d,y),pt(uu,d,y-.16),.035,mats.steel);}
   }
  }
  // Existing gutters and downpipes are retained; these add foot plates and joints.
  for(const u of supportUs(s))for(const d of[4,s.depth-.6]){const h=d===4?floorHeight(s,d):0;at(u,d,h+.055,.45,.11,.45,mats.steel);for(const du of[-.15,.15])for(const dd of[-.15,.15])at(u+du,d+dd,h+.13,.035,.045,.035,mats.dark);}
  for(const[a,b]of galleries(s)){
   const y=floorHeight(s,a),d=(a+b)/2;
   for(let u=-s.length/2+4;u<s.length/2-2;u+=8.5){if(inRearAccess(s,u,d)||(s.id==='main'&&Math.abs(u)<4.5&&d>22))continue;
    at(u,d,y+.004,.016,.006,b-a-.06,mats.dark);
   }
  }
  // Directions correspond to real stairs; ground-front drains stay flush to the floor.
  for(const u of[-34,-17,17,34]){
   // Plaque entirely outside the 3.10 m stair aisle, attached to the first handrail.
   const label=sign((u<0?'A':'B')+Math.abs(u/17)+(s.id==='main'?' · SECTOR INFERIOR':' · NIVELES 1–3'),.98,.24),p=pt(u+2.10,2.12,1.24);label.position.set(...p);label.rotation.y=s.angle;label.name='Sector visible · '+s.id+' '+u;label.userData.scope=s.id;label.userData.detail='fixtureDetail';scene.add(label);
   at(u+2.10,2.15,1.24,1.04,.30,.035,mats.blue);
   for(const y of[1.15,1.30])beam(pt(u+1.55,2.2,y),pt(u+2.10,2.15,y),.018,mats.steel);
   // One recessed tray, frame and closely fitted crossbars in local coordinates.
   at(u,.55,-.019,.76,.02,.36,mats.dark);
   for(const du of[-.36,.36])at(u+du,.55,.002,.04,.024,.36,mats.steel);
   for(const dd of[-.16,.16])at(u,.55+dd,.002,.72,.024,.04,mats.steel);
   for(let j=0;j<8;j++)at(u-.29+j*.083,.55,.002,.022,.024,.29,mats.steel);
  }
 }
 setScope('site','fixtureDetail');
 for(const e of equipment){const{x,z}=e;
  if(e.kind==='bench'){
   for(const dx of[-.72,.72]){box(x+dx,.22,z,.12,.44,.55,mats.steel);box(x+dx,.03,z,.27,.06,.62,mats.dark);}
   for(let j=0;j<5;j++)box(x,.49,z-.25+j*.12,2,.055,.085,mats.blue);
   for(const dx of[-.85,.85])beam([x+dx,.4,z-.3],[x+dx,.94,z-.3],.023,mats.steel);
   for(let j=0;j<3;j++)box(x,.69+j*.1,z-.3,2,.07,.035,mats.blue);
  }else if(e.kind==='bin'){
   box(x,.46,z,.48,.92,.48,mats.dark);box(x,.96,z,.50,.08,.50,mats.steel);box(x,1.01,z,.31,.025,.2,mats.dark);for(const dx of[-.18,.18])box(x+dx,.46,z+.249,.016,.78,.009,mats.steel);
  }else{
   box(x,.48,z,.32,.96,.38,mats.concrete);box(x,.99,z,.48,.06,.5,mats.steel);box(x,1.025,z,.30,.025,.3,mats.dark);beam([x,1,z-.18],[x,1.2,z-.18],.023,mats.steel);beam([x,1.2,z-.18],[x,1.2,z-.03],.023,mats.steel);
  }
 }
}
