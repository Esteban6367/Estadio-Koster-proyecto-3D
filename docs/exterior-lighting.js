import * as T from './three.module.min.js';
import {stands,world} from './stadium-layout.js';
import {publicLayout as P} from './public-layout.js';
// Proposed visual lighting only; every source is baked, including in high quality.
export function addExteriorLighting(scene,{box,beam,mats,setScope}){
 const emitter=new T.MeshStandardMaterial({color:0xe1e6db,emissive:0xffedce,emissiveIntensity:0,roughness:.45});
 const lights=[],facadeFixtures=[];
 function fixture(x,y,z,dx,dz,power=190){
  const yaw=Math.atan2(dx,dz);box(x,y,z,.48,.16,.32,mats.dark,yaw);box(x,y-.09,z,.39,.025,.25,emitter,yaw);
  beam([x-dx*.45,y+.08,z-dz*.45],[x,y+.08,z],.025,mats.steel);
  const light=new T.SpotLight(0xffe5bf,0,26,1.03,.9,2);light.position.set(x,y-.12,z);light.target.position.set(x+dx*5,.05,z+dz*5);light.castShadow=false;light.userData.bakePower=power;scene.add(light,light.target);lights.push({light,power});
 }
 setScope('exterior');
 for(const s of stands)for(const fraction of[-.4,-.2,.2,.4]){
  const main=s.id==='main',d=main?31.6:s.depth+.75;
  let u=s.length*fraction;
  // The mounting point must remain on masonry when the entrance moves.
  if(main&&Math.abs(u-P.axis)<P.half+1.15)u=P.axis+Math.sign(u-P.axis||1)*(P.half+1.15);
  const[x,z]=world(s,u,d);fixture(x,main?5.1:4,z,-Math.sin(s.angle),-Math.cos(s.angle),220);
  if(main){const[a,b]=world(s,u,30.62);beam([a,3.75,b],[x,5.15,z],.035,mats.steel);box(a,3.75,b,.18,.25,.1,mats.dark,s.angle);facadeFixtures.push({u,d,anchor:[a,3.75,b]});}
 }
 for(const z of[-51,-38,-25,-12,2,13])fixture(63.7,4.1,z,-1,0,150);
 for(const x of[70,87])fixture(x,3.8,17.9,0,1,150);
 setScope('site');return{lights,emitter,facadeFixtures};
}
