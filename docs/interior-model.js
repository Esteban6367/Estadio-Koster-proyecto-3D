import {fittedBox,tierAngle} from './stadium-layout.js';
import {addUnderground} from './underground-model.js';
import * as T from './three.module.min.js';
import {stands,world} from './stadium-layout.js';
import {voids,interiorWalls,facilities} from './interior-layout.js';
export function addPlayerFacilities(scene,{mats,box,beam,mesh,merge,curvedBlock:rawBlock,sign}){
 const curvedBlock=(s,a,b,lo,h0,h1,u0,u1)=>rawBlock(s,a,b,lo+facilities.floor,h0+facilities.floor,h1+facilities.floor,u0,u1);
 const s=stands[0],pt=(u,d,y)=>{const[x,z]=world(s,u,d);return[x,y+facilities.floor,z];};
 const at=(u,d,y,w,h,t,m)=>fittedBox(s,box,u,d,y+facilities.floor,w,h,t,m);
 const material=(c,r=.8,m=0)=>new T.MeshStandardMaterial({color:c,roughness:r,metalness:m});
 const wallMat=mats.concrete.clone();wallMat.color.setHex(0xd3dedc);wallMat.normalScale.set(.1,.1);
 const floorMat=mats.paving.clone();floorMat.color.setHex(0xa6b4b8);floorMat.userData.tile=1;
 const wetMat=mats.paving.clone();wetMat.color.setHex(0xc0cbc9);wetMat.roughness=1;wetMat.userData.tile=.7;
 const blue=material(0x1b6695,.84),white=material(0xe8edeb,.7),dark=material(0x293d4a),wood=material(0xb49a73,.73),metal=mats.steel;
 const ceilingMat=material(0xc3cccd,.95),lightMat=new T.MeshStandardMaterial({color:0xe5eded,emissive:0xe2edf0,emissiveIntensity:.9,roughness:.6});
 const mirrorMat=new T.MeshStandardMaterial({color:0xb7c9cf,metalness:1,roughness:.08,envMapIntensity:.35});
 const floors=[],ceilings=[],walls=[],lights=[];
 for(const r of voids.slice(1)){const f=mesh(curvedBlock(s,r.d0,r.d1,-.12,0,0,r.u0,r.u1),floorMat);f.name='Jugadores · suelo';floors.push(f);const h=r.d0>=14.8?facilities.roomCeiling:facilities.ceiling;const c=mesh(curvedBlock(s,r.d0,r.d1,h,h+.16,h+.16,r.u0,r.u1),ceilingMat);c.name='Jugadores · techo';ceilings.push(c);}
 const wallGeo=[],trimGeo=[],skirtingGeo=[];
 for(const w of interiorWalls){const t=w.thickness/2,u0=Math.min(w.u0,w.u1),u1=Math.max(w.u0,w.u1),d0=Math.min(w.d0,w.d1),d1=Math.max(w.d0,w.d1);const args=[s,d0===d1?d0-t:d0,d0===d1?d1+t:d1,0,w.height,w.height,u0===u1?u0-t:u0,u0===u1?u1+t:u1];wallGeo.push(curvedBlock(...args));args[1]-=.004;args[2]+=.004;args[6]-=.004;args[7]+=.004;args[3]=.95;args[4]=args[5]=1.1;trimGeo.push(curvedBlock(...args));args[3]=.008;args[4]=args[5]=.11;skirtingGeo.push(curvedBlock(...args));}
 const wm=mesh(merge(wallGeo),wallMat);wm.name='Jugadores · muros y puertas';walls.push(wm);const stripe=mesh(merge(trimGeo),blue);stripe.name='Vestuarios · franja separada del muro';const skirting=mesh(merge(skirtingGeo),dark);skirting.name='Vestuarios · zócalos lavables';
 const label=(text,u,d,y,w,h,rotation=s.angle)=>{const a=sign(text,w,h);a.position.set(...pt(u,d,y));a.rotation.y=rotation+tierAngle(s,u,d)-s.angle;a.material.emissiveIntensity=.08;scene.add(a);return a;};
 const lamp=(u,d,y,w=1.8)=>{at(u,d,y+.045,w,.11,.35,dark);at(u,d,y-.015,w-.08,.022,.28,lightMat);};
 const illuminate=(u,d,y,power,range)=>{const l=new T.PointLight(0xe1ebef,power,range,2);l.position.set(...pt(u,d,y));scene.add(l);lights.push(l);};
 for(const u of[-13,-7,0,7,13])lamp(u,13.6,2.65,1.6);
 illuminate(-9,13.6,2.45,48,15);illuminate(9,13.6,2.45,48,15);
 label('LOCAL  ←     →  VISITANTE',0,14.59,1.8,3.1,.26);
 for(const side of[-1,1]){
  const team=side<0?'LOCAL':'VISITANTE';
  label('VESTUARIO '+team,side*10.6,14.78,2.53,3.6,.28);
  label('DUCHAS Y SERVICIOS',side*11.8,22.77,2.48,3.4,.25);
  // Dark blue jambs frame doors shown open alongside their wall.
  for(const d of[14.9,22.9]){for(const u of[6.4,8.6])at(side*u,d,1.2,.10,2.4,.22,blue);at(side*7.5,d,2.42,2.3,.12,.22,blue);at(side*6.5,d+.70,1.17,.075,2.34,1.4,blue);at(side*6.42,d+1.13,1.05,.12,.18,.035,metal);}
  for(const d of[14.9,22.9]){at(side*7.5,d,0.012,2.02,.018,.18,metal);at(side*7.5,d+.025,2.53,2.30,.06,.25,white);}
  const wetFloor=mesh(curvedBlock(s,23,28.06,.001,.007,.007,side<0?-17.05:4.95,side<0?-4.95:17.05),wetMat,false);wetFloor.name='Vestuarios · pavimento húmedo';floors.push(wetFloor);
  for(let u=5.4;u<17;u+=.7)at(side*u,25.5,.011,.008,.007,5.05,dark);
  for(let d=23.35;d<28;d+=.7)at(side*11,d,.012,12,.007,.008,dark);
  // Individual open locker bays, hooks, benches and numbered back panels.
  let number=1;
  for(const edge of[5.5,16.5])for(let d=16.15;d<22.3;d+=1.03){
   const inward=edge<10?1:-1;at(side*edge,d,.28,.62,.56,.97,blue);at(side*(edge+inward*.05),d,.59,.7,.085,.97,wood);
   at(side*(edge-inward*.22),d,1.45,.12,1.65,.97,blue);for(const end of[-.5,.5])at(side*edge,d+end,1.65,.6,.04,.028,metal);
   at(side*(edge-inward*.12),d,1.6,.13,.06,.045,metal);at(side*edge,d,2.1,.6,.045,.97,white);
   label(String(number++).padStart(2,'0'),side*(edge+inward*.08),d,1.88,.27,.17,s.angle+(side*inward>0?Math.PI/2:-Math.PI/2));
  }
  for(let u=8.4;u<16.2;u+=1.02){at(side*u,21.94,.28,.97,.56,.6,blue);at(side*u,21.87,.6,.97,.08,.68,wood);at(side*u,22.18,1.45,.97,1.55,.12,blue);at(side*u,22.12,1.6,.055,.06,.13,metal);label(String(number++).padStart(2,'0'),side*u,22.10,1.9,.27,.17);}
  at(side*11,18.8,.46,2.7,.1,.72,wood);for(const u of[9.9,12.1])at(side*u,18.8,.23,.12,.46,.55,blue);
  // Wall basin and chrome tap; separate mirror above the wet-room circulation.
  at(side*16.55,24.2,.78,.65,.14,1.8,white);at(side*16.45,24.2,.865,.35,.022,1.25,dark);at(side*16.77,24.2,1.14,.22,.035,.035,metal);at(side*16.87,24.2,1.01,.035,.29,.035,metal);
  at(side*17.055,24.2,1.75,.035,1.2,1.85,mirrorMat);at(side*17.075,24.2,2.38,.06,.045,1.95,blue);
  // Shower trays, mixer valves, supply tubes and overhead heads.
  for(const u of[10.2,12,13.8,15.55]){at(side*u,27.05,.025,1.55,.05,1.7,white);at(side*u,27.5,.054,.16,.014,.16,metal);beam(pt(side*u,27.9,.9),pt(side*u,27.9,2.23),.018,metal);beam(pt(side*u,27.9,2.23),pt(side*u,27.55,2.23),.018,metal);at(side*u,27.53,2.21,.25,.035,.22,metal);at(side*u,27.84,1.05,.21,.10,.06,metal);}
  const bowl=new T.Mesh(new T.SphereGeometry(.32,16,10),white);bowl.scale.set(1,.7,1.4);bowl.position.set(...pt(side*6.6,27.35,.43));scene.add(bowl);at(side*6.6,27.76,.71,.52,.57,.2,white);at(side*6.6,27.36,.23,.32,.4,.4,white);
  label('WC',side*5.6,25.42,1.65,.4,.23);
  for(const d of[17.4,20.4,24.1,27])for(const u of[7.7,13.3])lamp(side*u,d,2.9,2.1);
  illuminate(side*10.8,18.7,2.72,130,17);illuminate(side*11.5,25.3,2.72,130,15);
 }
 const underground=addUnderground(scene,{mats,box,beam,mesh,merge,curvedBlock:rawBlock,sign});
 return{floors:[...floors,...underground.floors],ceilings:[...ceilings,...underground.ceilings],walls:[...walls,...underground.walls],lights:[...lights,...underground.lights],voids,underground};
}
