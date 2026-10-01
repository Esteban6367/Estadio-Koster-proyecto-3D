import * as T from './three.module.min.js';
import {stands,world} from './stadium-layout.js';
import {fieldAccess as f,hatchState} from './field-access-layout.js';
export function addFieldAccess(scene,{mats,box,beam,mesh,merge,curvedBlock}){
 const s=stands[0],pt=(u,d,y)=>{const[x,z]=world(s,u,d);return[x,y,z];};
 const concrete=mats.concrete.clone();concrete.color.setHex(0xb4bab8);concrete.roughness=1;concrete.normalScale.set(.13,.13);
 const blue=new T.MeshStandardMaterial({color:0x153b63,roughness:.87});
 const teal=mats.metal.clone();teal.color.setHex(0x0096a7);teal.metalness=.35;teal.roughness=.65;teal.normalScale.set(.07,.07);
 const rect=(r,y0,y1)=>curvedBlock(s,r.d0,r.d1,y0,y1,y1,r.u0,r.u1),w={...f.well,d0:f.railPocket.d0},d=f.dry;
 const tiles=[{u0:-57.5,u1:57.5,d0:-1.52,d1:0},
  {...d,u1:w.u0},{...d,u0:w.u1},{u0:w.u0,u1:w.u1,d0:d.d0,d1:w.d0},{u0:w.u0,u1:w.u1,d0:w.d1,d1:d.d1}];
 const floor=mesh(merge(tiles.map(r=>rect(r,-.035,0))),concrete);floor.name='Frente principal · pasillo y plataforma seca';floor.userData.walkingSurface=true;
 const curb=mesh(merge([
  rect({u0:6.73,u1:7,d0:-7.81,d1:-5.29},0,.1),
  rect({u0:7,u1:11.52,d0:-7.93,d1:f.railPocket.d0},0,.1),
  rect({u0:7,u1:11.52,d0:-5.53,d1:-5.29},0,.1)
 ]),concrete);curb.name='Boca de jugadores · bordes de hormigón';curb.userData.bakeOccluder=true;
 for(const b of f.benches){
  box(...pt(b.u,b.d,.48),b.w,.10,b.t,concrete,s.angle);
  for(const offset of[-1.15,0,1.15])box(...pt(b.u+offset,b.d,.22),.17,.44,.46,blue,s.angle);
 }
 // Guides lie outside the cover ends. The end guard posts also avoid its sweep.
 for(const u of[6.77,11.76])box(...pt(u,-5.34,.095),.07,.04,5.0,mats.dark,s.angle);
 const c=f.cover,lid=new T.Group();lid.name='Tapa del túnel · corredera propuesta';lid.userData.dynamicTransform=true;scene.add(lid);
 const skin=new T.Mesh(rect(c,c.bottom,c.top),teal);skin.castShadow=true;skin.receiveShadow=true;lid.add(skin);
 // Shallow ribs are grouped once; they remain below the low guard's lower rail.
 const ribs=[];for(let u=c.u0+.25;u<c.u1-.15;u+=.28)ribs.push(rect({u0:u,u1:u+.022,d0:c.d0+.09,d1:c.d1-.09},c.top,c.top+.006));
 const ribMesh=new T.Mesh(merge(ribs),teal);ribMesh.castShadow=false;ribMesh.receiveShadow=true;lid.add(ribMesh);
 // Pipe visible above the proposed water level. Its hydraulic function is unknown.
 const pipe=new T.Mesh(new T.CylinderGeometry(.055,.055,.22,10,1,true),concrete);pipe.rotation.z=Math.PI/2;pipe.position.set(...pt(-12,-3.39,-.16));pipe.castShadow=true;scene.add(pipe);
 const rim=new T.Mesh(new T.RingGeometry(.043,.056,10),concrete);rim.rotation.y=Math.PI/2;rim.position.set(...pt(-12,-3.28,-.16));scene.add(rim);
 function update(){lid.position.set(-c.travel*hatchState.progress*Math.sin(s.angle),0,-c.travel*hatchState.progress*Math.cos(s.angle));lid.updateMatrix();}
 update();return{floors:[floor],blocks:[curb],lid,skin,update,visibleProgress:()=>-lid.matrix.elements[12]/(c.travel*Math.sin(s.angle)),materials:{concrete,blue,teal}};
}
