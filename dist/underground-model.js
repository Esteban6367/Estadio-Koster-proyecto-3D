import * as T from './three.module.min.js';
import {stands,world} from './stadium-layout.js';
import {tunnel,descentFloor,exitFloor,tunnelWalls,playerLevel,descentBreaks} from './underground-layout.js';
export function addUnderground(scene,{mats,box,beam,mesh,merge,curvedBlock,sign}){
 const s=stands[0],pt=(u,d,y)=>{const[x,z]=world(s,u,d);return[x,y,z];};
 const at=(u,d,y,w,h,t,m)=>{box(...pt(u,d,y),w,h,t,m,s.angle);};
 const wallMat=mats.concrete.clone();wallMat.color.setHex(0xd3dedc);wallMat.normalScale.set(.1,.1);
 const floorMat=mats.paving.clone();floorMat.color.setHex(0xa6b4b8);floorMat.roughness=1;floorMat.userData.tile=1;
 const blue=new T.MeshStandardMaterial({color:0x1b6695,roughness:.84}),dark=mats.dark,steel=mats.steel;
 const ceilingMat=new T.MeshStandardMaterial({color:0xc3cccd,roughness:.95});
 const lightMat=new T.MeshStandardMaterial({color:0xe5eded,emissive:0xe2edf0,emissiveIntensity:.65,roughness:.6});
 const floors=[],ceilings=[],walls=[],lights=[],floorGeos=[],roofGeos=[],wallGeos=[],trimGeos=[],soilGeos=[];
 const rect=(r,bottom,top)=>curvedBlock(s,r.d0,r.d1,bottom,top,top,r.u0,r.u1);
 const wallWithSlot=(r,bottom,top,floor,axis,innerPositive)=>{
  const low=floor+.65,high=Math.min(top,floor+1.25),slot={...r};
  if(innerPositive)slot[axis+'1']-=.09;else slot[axis+'0']+=.09;
  wallGeos.push(rect(r,bottom,low),rect(slot,low,high),rect(r,high,top));
 };
 const dc=[-8.15,-4.71,-3.65,-1.75,2.38,6.54,8.14,12.3,12.5,...Array.from({length:13},(_,i)=>12.3-(i+1)*.32),...Array.from({length:13},(_,i)=>6.54-(i+1)*.32)].sort((a,b)=>a-b).filter((x,i,a)=>!i||x-a[i-1]>.0001);
 for(let i=0;i<dc.length-1;i++){
  const a=dc[i],b=dc[i+1],h=descentFloor((a+b)/2),r={u0:-1.6,u1:1.6,d0:a,d1:b};floorGeos.push(rect(r,-5.04,h));
  if(b> -4.71){const c=Math.max(tunnel.ceiling,h+2.95),start=Math.max(a,-4.71);roofGeos.push(rect({...r,d0:start,u0:-1.84,u1:1.84},c,c+.2));const soilTop=a>=-3.65&&b<=-1.75?-1.4:-.04;if(c+.2<soilTop-.001)soilGeos.push(rect({...r,d0:start,u0:-1.84,u1:1.84},c+.2,soilTop));
   // Small soffit edge trims follow the stepped ceiling, above the free headroom.
   for(const u of[-1.62,1.62])at(u,(start+b)/2,c-.014,.04,.028,b-start,steel);
   if([2.38,6.54,8.14,12.3].some(d=>Math.abs(b-d)<.001))at(0,b-.01,c-.008,3.24,.016,.02,steel);
  }
  // Subtle stair nosing stripes; below-ground flat passage has no stripes.
  if(b>10.38&&b<12.3){at(0,b-.02,h+.006,3.16,.012,.04,mats.yellow);}
 }
 const uc=[1.6,5.76,7.36,11.52,15.1,...Array.from({length:14},(_,i)=>1.6+i*.32),...Array.from({length:14},(_,i)=>7.36+i*.32)].sort((a,b)=>a-b).filter((x,i,a)=>!i||x-a[i-1]>.0001);
 for(let i=0;i<uc.length-1;i++){const a=uc[i],b=uc[i+1],h=exitFloor((a+b)/2);floorGeos.push(rect({u0:a,u1:b,d0:-8.15,d1:-4.95},-5.04,h));if(a<11.52)at(a+.02,-6.55,h+.006,.04,.012,3.16,mats.yellow);}
 // The main crossing stays below the continuous moat slab. No bridge or gate remains here.
 roofGeos.push(rect({u0:-1.84,u1:1.84,d0:-8.39,d1:-4.71},2.8,2.96));
 // Light metal canopy along the narrow exit stair; supported along both retaining walls.
 roofGeos.push(rect({u0:1.84,u1:15.3,d0:-8.47,d1:-4.63},2.8,2.94));
 for(const w of tunnelWalls){
  const uFixed=w.u0===w.u1;
  if(uFixed){const cuts=[w.d0,w.d1,...dc.filter(d=>d>w.d0&&d<w.d1),-4.71].filter(d=>d>=w.d0&&d<=w.d1).sort((a,b)=>a-b);
   for(let i=0;i<cuts.length-1;i++){const a=cuts[i],b=cuts[i+1];if(b-a<.0001)continue;const h=descentFloor((a+b)/2),top=b<=-4.71?.80:Math.max(tunnel.roofTop,h+3.15),r={u0:w.u0-.12,u1:w.u0+.12,d0:a,d1:b};wallWithSlot(r,w.bottom,top,h,'u',w.u0<0);trimGeos.push(rect({...r,u0:r.u0-.003,u1:r.u1+.003},h+.35,h+.5));}
  }else{const cuts=[w.u0,...uc.filter(u=>u>w.u0&&u<w.u1),w.u1];for(let i=0;i<cuts.length-1;i++){const a=cuts[i],b=cuts[i+1],h=exitFloor((a+b)/2),r={u0:a,u1:b,d0:w.d0-.12,d1:w.d0+.12};wallWithSlot(r,w.bottom,w.top,h,'d',w.d0<-6.55);trimGeos.push(rect({...r,d0:r.d0-.003,d1:r.d1+.003},h+.35,h+.5));}}
 }
 const soilMat=mats.concrete.clone();soilMat.color.setHex(0x776e5c);soilMat.roughness=1;const soil=mesh(merge(soilGeos),soilMat);soil.name='Terreno y relleno sobre el túnel';
 const f=mesh(merge(floorGeos),floorMat);f.name='Subterráneo · escaleras y piso';f.userData.walkingSurface=true;floors.push(f);
 const c=mesh(merge(roofGeos),ceilingMat);c.name='Subterráneo · losas y marquesina';ceilings.push(c);
 const w=mesh(merge(wallGeos),wallMat);w.name='Subterráneo · muros de contención';walls.push(w);mesh(merge(trimGeos),blue);
 const lamp=(u,d,floor,width=1.15)=>{const y=floor+2.72;at(u,d,y+.045,width,.09,.25,dark);at(u,d,y-.012,width-.06,.023,.21,lightMat);};
 const light=(u,d,y,power=43,range=8)=>{const l=new T.PointLight(0xe1ebef,power,range,2);l.position.set(...pt(u,d,y));scene.add(l);lights.push(l);};
 for(const d of[11.7,9,7.3,4.5]){const f=descentFloor(d);lamp(0,d,f);light(0,d,f+2.35,34,7);}
 for(const d of[1,-2,-4.1]){lamp(0,d,tunnel.floor);light(0,d,tunnel.floor+2.3,37,8);}
 // Continuous handrails, following the actual flights and landings.
 const dp=[...descentBreaks,2.38];
 for(const u of[-1.63,1.63])for(let i=0;i<dp.length-1;i++){const a=dp[i],b=dp[i+1];beam(pt(u,a,descentFloor(a)+.94),pt(u,b,descentFloor(b)+.94),.028,steel);for(const d of[a,b])beam(pt(u,d,descentFloor(d)+.94),pt(Math.sign(u)*1.76,d,descentFloor(d)+.94),.015,steel);}
 for(const d of[-8.18,-4.92])for(const[a,b]of[[0,1.6],[1.6,5.76],[5.76,7.36],[7.36,11.52],[11.52,14.8]]){beam(pt(a,d,exitFloor(a)+.94),pt(b,d,exitFloor(b)+.94),.028,steel);for(const u of[a,b])beam(pt(u,d,exitFloor(u)+.94),pt(u,d<-6.55?-8.29:-4.81,exitFloor(u)+.94),.015,steel);}
 for(const u of[-1.6,2,5.6,9.2,12.8,15.1])for(const d of[-8.27,-4.83]){beam(pt(u,d,.80),pt(u,d,2.8),.045,steel);for(const y of[1.65,2.22])if(u<15.1)beam(pt(u,d,y),pt(Math.min(u+3.6,15.1),d,y),.023,steel);}
 for(let u=-1.5;u<15.1;u+=.15)for(const d of[-8.27,-4.83])beam(pt(u,d,.81),pt(u,d,2.22),.009,steel);
 // Wall-mounted brackets follow the retained handrail and attach to the slot backing.
 for(const side of[-1,1])for(const d of[3.0,4.5,6.0,7.3,8.8,10.4,11.8]){
  const y=descentFloor(d)+.94;at(side*1.735,d,y,.035,.14,.10,steel);beam(pt(side*1.735,d,y),pt(side*1.63,d,y),.017,steel);
 }
 for(const d of[2.38,12.3])for(const u of[-1.63,1.63]){const y=descentFloor(d)+.94;beam(pt(u,d,y),pt(u,d,y-.13),.028,steel);}
 // End protection prevents accidental entry into the bottom of the stairwell.
 for(const d of[-8.27,-4.83])beam(pt(-1.72,d,.80),pt(-1.72,d,2.23),.03,steel);
 for(const y of[1.65,2.23])beam(pt(-1.72,-8.27,y),pt(-1.72,-4.83,y),.03,steel);
 for(let d=-8.1;d<-4.9;d+=.15)beam(pt(-1.72,d,.80),pt(-1.72,d,2.23),.009,steel);
 for(const d of[-8.44,-4.66])beam(pt(-1.84,d,2.94),pt(15.3,d,2.94),.055,blue);
 for(const u of[-.5,4,8.5,13]){at(u,-6.55,2.73,1.2,.10,2.8,dark);at(u,-6.55,2.67,1.13,.025,2.70,lightMat);light(u,-6.55,Math.min(2.3,exitFloor(u)+2.3),38,10);}
 const label=(text,u,d,y,width=2.8,angle=s.angle)=>{const p=sign(text,width,.27);p.position.set(...pt(u,d,y));p.rotation.y=angle;scene.add(p);return p;};
 label('JUGADORES · DESCENSO',0,12.45,playerLevel+2.49,3.0);label('VESTUARIOS',0,11.95,descentFloor(11.95)+2.35,2.4,s.angle+Math.PI);
 label('SALIDA AL CAMPO',0,2.25,-2.31,2.7,s.angle+Math.PI);
 label('ESTADIO LUIS KÖSTER',-1.58,-6.55,-2.3,3.0,Math.PI);
 const facade=label('ESTADIO LUIS KÖSTER',15.27,-6.55,2.96,3.3,Math.PI);facade.material.side=T.DoubleSide;
 return{floors,ceilings,walls,lights};
}
