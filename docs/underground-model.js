import * as T from './three.module.min.js';
import {stands,world,fittedBox} from './stadium-layout.js';
import {tunnel,descentFloor,exitFloor,tunnelWalls,wallTop,fixedCeiling,playerLevel,descentBreaks,exitHandrail,exitHandrailHeight,exitRailFlights} from './underground-layout.js';
import {fieldAccess as access} from './field-access-layout.js';
export function addUnderground(scene,{mats,box,beam,mesh,merge,curvedBlock,sign}){
 const s=stands[0],pt=(u,d,y)=>{const[x,z]=world(s,u,d);return[x,y,z];};
 const at=(u,d,y,w,h,t,m)=>fittedBox(s,box,u,d,y,w,h,t,m);
 const wallMat=mats.concrete.clone();wallMat.color.setHex(0xd3dedc);wallMat.normalScale.set(.1,.1);
 const floorMat=mats.concrete.clone();floorMat.color.setHex(0xa1aaa9);floorMat.roughness=1;
 const blue=new T.MeshStandardMaterial({color:0x183f66,roughness:.84}),steel=mats.steel;
 const ceilingMat=new T.MeshStandardMaterial({color:0xc3cccd,roughness:.95});
 const lightMat=new T.MeshStandardMaterial({color:0xbac9cd,emissive:0xc9dcde,emissiveIntensity:.28,roughness:.65});
 const floors=[],ceilings=[],walls=[],lights=[],floorGeos=[],roofGeos=[],wallGeos=[],soilGeos=[];
 const rect=(r,bottom,top)=>{const g=curvedBlock(s,r.d0,r.d1,bottom,top,top,r.u0,r.u1),p=g.attributes.position;for(let i=0;i<p.count;i++){if(Math.abs(p.getX(i))<1e-9)p.setX(i,0);if(Math.abs(p.getZ(i))<1e-9)p.setZ(i,0);}return g;};
 // The exit is straight in this local zone. Give the channel a continuous sloped
 // section along u, independent of the treads. No thin overlay conceals the wall.
 const sloped=(r,lower,upper)=>{const g=rect(r,0,1),p=g.attributes.position;for(let i=0;i<p.count;i++){const u=-p.getZ(i);p.setY(i,p.getY(i)>.5?upper(u):lower(u));}g.computeVertexNormals();return g;};
 const unique=a=>a.sort((a,b)=>a-b).filter((x,i,a)=>!i||x-a[i-1]>.00001);
 const dc=unique([-7.57,-5.41,-3.65,-1.75,2.38,10.38,12.3,12.5,...Array.from({length:7},(_,i)=>12.3-i*.32)]);
 for(let i=0;i<dc.length-1;i++){
  const a=dc[i],b=dc[i+1],h=descentFloor((a+b)/2),c=fixedCeiling(0,(a+b)/2),r={u0:-1.6,u1:1.6,d0:a,d1:b};
  floorGeos.push(rect(r,-5.04,h));roofGeos.push(rect({...r,u0:-1.84,u1:1.84},c,c+.2));
  if(c+.2<-.04)soilGeos.push(rect({...r,u0:-1.84,u1:1.84},c+.2,-.04));
  if(a>=10.38&&a<12.3)at(0,a+.02,h+.006,3.12,.012,.04,mats.yellow);
 }
 const uc=unique([-1.72,1.6,5.76,7,7.36,11.52,11.64,...Array.from({length:14},(_,i)=>1.6+i*.32),...Array.from({length:14},(_,i)=>7.36+i*.32)]);
 for(let i=0;i<uc.length-1;i++){
  const a=uc[i],b=uc[i+1];if(a<1.6||a>=11.52)continue;
  const h=exitFloor((a+b)/2),r={u0:a,u1:b,d0:access.well.d0,d1:-5.53};floorGeos.push(rect(r,-5.04,h));
  if(a<7){const c=fixedCeiling((a+b)/2,-6.55);roofGeos.push(rect({...r,d0:-7.81,d1:-5.29},c,c+.2));if(c+.2<-.04)soilGeos.push(rect({...r,d0:-7.81,d1:-5.29},c+.2,-.04));}
  if(a<5.76||a>=7.36)at(a+.025,-6.55,h+.004,.035,.008,2.0,blue);
 }
 // Retaining wall volumes stop at ground. Recessed handrail only on the field side
 // of the final flight, outside the cover's complete sliding envelope.
 for(const w of tunnelWalls){
  const uFixed=w.u0===w.u1,cuts=uFixed?unique([w.d0,w.d1,...dc.filter(d=>d>w.d0&&d<w.d1)]):unique([w.u0,w.u1,...uc.filter(u=>u>w.u0&&u<w.u1)]);
  for(let i=0;i<cuts.length-1;i++){
   const a=cuts[i],b=cuts[i+1],u=uFixed?w.u0:(a+b)/2,d=uFixed?(a+b)/2:w.d0,top=wallTop(w,u,d);
   const r=uFixed?{u0:u-.12,u1:u+.12,d0:a,d1:b}:{u0:a,u1:b,d0:d-.12,d1:d+.12};
   if(!uFixed&&d< -6.55&&a>=tunnel.exitStart&&b<=tunnel.exitEnd){
    const outer=r.d0-exitHandrail.outerExtension,full={...r,d0:outer},backing={...r,d0:outer,d1:outer+exitHandrail.backThickness};
    const lo=u=>Math.min(top,exitHandrailHeight(u)-exitHandrail.halfSlot),hi=u=>Math.min(top,exitHandrailHeight(u)+exitHandrail.halfSlot);
    wallGeos.push(sloped(full,()=>w.bottom,lo));
    if(hi(a)>lo(a)||hi(b)>lo(b))wallGeos.push(sloped(backing,lo,hi));
    if(top>hi(a)||top>hi(b))wallGeos.push(sloped(backing,hi,()=>top));
   }else wallGeos.push(rect(r,w.bottom,top));
  }
 }
 // End wall below the top landing. No raised obstacle across the stair exit.
 wallGeos.push(rect({u0:11.52,u1:11.76,d0:-7.81,d1:-5.29},-5.04,-.04));
 const soilMat=mats.concrete.clone();soilMat.color.setHex(0x776e5c);
 const soil=mesh(merge(soilGeos),soilMat);soil.name='Terreno y relleno sobre el túnel';
 const f=mesh(merge(floorGeos),floorMat);f.name='Subterráneo · escaleras y piso';f.userData.walkingSurface=true;floors.push(f);
 const c=mesh(merge(roofGeos),ceilingMat);c.name='Subterráneo · losas enterradas sin marquesina';ceilings.push(c);
 const w=mesh(merge(wallGeos),wallMat);w.name='Subterráneo · muros de contención';walls.push(w);
 const light=(u,d,y,power=30,range=8)=>{const l=new T.PointLight(0xe1ebef,power,range,2);l.position.set(...pt(u,d,y));scene.add(l);lights.push(l);};
 const lamp=(u,d,y)=>{at(u,d,y+.045,.80,.09,.20,mats.dark);at(u,d,y-.012,.74,.022,.16,lightMat);};
 for(const d of[11.7,9,7.3,4.5,1,-2,-5.8]){const y=fixedCeiling(0,d)-.18;lamp(0,d,y);light(0,d,y-.10,32,8);}
 for(const u of[2.6,5.8]){const y=exitFloor(u)+1.25;at(u,-7.51,y,.64,.11,.08,mats.dark);at(u,-7.464,y,.58,.065,.014,lightMat);light(u,-7.28,y,27,6);}
 // Last-flight fixtures sit inside the wall, below the cover and out of headroom.
 for(const u of[8.1,10.2]){const y=exitFloor(u)+.32;at(u,-7.52,y,.42,.09,.065,mats.dark);at(u,-7.482,y,.36,.045,.014,lightMat);light(u,-7.28,y,14,4);}
 const dp=[...descentBreaks,2.38];
 for(const u of[-1.48,1.48])for(let i=0;i<dp.length-1;i++){const a=dp[i],b=dp[i+1];beam(pt(u,a,descentFloor(a)+.94),pt(u,b,descentFloor(b)+.94),.028,steel);for(const d of[a,b])beam(pt(u,d,descentFloor(d)+.94),pt(Math.sign(u)*1.61,d,descentFloor(d)+.94),.015,steel);}
 for(const[a,b]of exitRailFlights){beam(pt(a,exitHandrail.d,exitHandrailHeight(a)),pt(b,exitHandrail.d,exitHandrailHeight(b)),exitHandrail.radius,steel);}
 // Discrete brackets reach the thickened backing, avoiding duplicate joints.
 for(const u of[1.72,3.6,5.7,7.4,9.2]){const y=exitHandrailHeight(u);if(y<.07)beam(pt(u,exitHandrail.d,y),pt(u,-7.87,y),.015,steel);}
 const label=(text,u,d,y,width=2.8,angle=s.angle)=>{const p=sign(text,width,.27);p.position.set(...pt(u,d,y));p.rotation.y=angle;scene.add(p);return p;};
 label('JUGADORES · DESCENSO',0,12.45,playerLevel+2.49,3.0);label('VESTUARIOS',0,11.95,descentFloor(11.95)+2.35,2.4,s.angle+Math.PI);
 label('SALIDA AL CAMPO',0,2.25,-2.31,2.7,s.angle+Math.PI);
 return{floors,ceilings,walls,lights};
}
