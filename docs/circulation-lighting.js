import * as T from './three.module.min.js';
import {stands,world,flights,flightStep,spanAt,cabinDetailAt,tierAngle,aisleUs} from './stadium-layout.js';
import {floorHeight,rearAccessHeight,inRearAccess} from './physics.js';
import {publicLayout as P,publicStairs,publicGradeCuts,publicSolidCuts,stairHeight} from './public-layout.js';
import {sector as S} from './secretaria-sector.js';
import {exitFloor} from './underground-layout.js';

// Proposed fixtures follow existing stairs and exits; they define no new route.
// All sources use the exterior bake channel, including the highest quality.
export function addCirculationLighting(scene,{box,beam,mats,setScope}){
 const lights=[],fixtures=[],signs=[];
 const emitter=new T.MeshStandardMaterial({color:0xe7ece6,emissive:0xffedcf,emissiveIntensity:0,roughness:.65});
 const casing=mats.dark.clone();casing.roughness=.8;
 const point=(s,u,d,y)=>{const[x,z]=world(s,u,d);return[x,y,z];};
 function lamp(s,u,d,y,target,power,kind,angle=tierAngle(s,u,d)){
  const position=point(s,u,d,y);
  box(...position,.30,.08,.06,casing,angle);
  const front=[Math.sin(angle)*.035,0,Math.cos(angle)*.035];
  box(position[0]+front[0],y-.008,position[2]+front[2],.23,.035,.018,emitter,angle);
  const light=new T.SpotLight(0xffead0,0,5,1.22,.85,2);
  light.position.set(position[0]+front[0]*2,y-.01,position[2]+front[2]*2);
  light.target.position.set(...point(s,...target));light.castShadow=false;
  light.name='Circulación · '+kind;scene.add(light,light.target);
  lights.push({light,power});fixtures.push({kind,stand:s.id,u,d,y,power});
 }
 for(const s of stands){
  setScope(s.id);
  for(const[a,b]of flights(s)){
   const step=flightStep(s,a);
   for(let i=2,d=a+step*2;d<b-.1;i+=4,d=a+step*i){
    const h=floorHeight(s,d+step*.5);
    for(const u of aisleUs(s,d)){
     if(Math.abs(u)>spanAt(s,d)/2-2||cabinDetailAt(s,u,d)||inRearAccess(s,u,d))continue;
     if(s.id==='main'&&publicSolidCuts(d).some(([l,r])=>u+1.6>l&&u-1.6<r))continue;
     // Flush in the existing riser, clear of foot and seat clearances.
     lamp(s,u+1.28,d-.025,h-.09,[u+.65,d-.70,floorHeight(s,Math.max(0,d-.7))+.015],1.7,'baliza de grada');
    }
   }
  }
  if(s.id!=='main'){
   for(const d of[13.2,15.1,18.9,21.0]){
    const h=rearAccessHeight(s,d);
    lamp(s,s.accessU-1.59,d,h+.48,[s.accessU,d+.4,Math.max(0,h-.2)],4,'escalera posterior',s.angle-Math.PI/2);
   }
  }
 }
 const s=stands[0];setScope('main');
 for(const stair of publicStairs)for(const i of[2,8,14,20]){
  const u=stair.foot+stair.dir*(i+.5)*P.stairTread,h=stairHeight(stair,u);
  lamp(s,u,12.44,h+.42,[u,11.35,h+.025],4,'escalera del pasillo');
 }
 // The broad exterior flight by the secondary access.
 for(const i of[1,3,5,7])for(const u of[S.stepU0+.55,S.stepU1-.55]){
  const d=S.landingEnd+(i+1)*S.tread,h=(S.steps-i)*S.rise;
  lamp(s,u,d+.025,h-.07,[u,d+.55,Math.max(0,h-2*S.rise)],2,'escalera de acceso secundario',s.angle+Math.PI);
 }
 for(const u of[2.5,4.4,6.5,8.3,10.3]){
  const h=exitFloor(u);
  lamp(s,u,-5.45,h+.46,[u,-6.55,h+.02],3,'escalera de jugadores');
 }
 // Small neutral downlights at existing main entrance and stair landings.
 for(const [u,d,y]of[[36.82,31,4.0],[P.axis-2.61,6.2,2.5]]){
  lamp(s,u,d,y,[u,d-.65,0],22,'descanso de acceso');
 }
 function exitSign(s,u,d,y,text,angle=s.angle){
  const c=document.createElement('canvas');c.width=512;c.height=128;const ctx=c.getContext('2d');
  ctx.fillStyle='#087b47';ctx.fillRect(0,0,512,128);
  ctx.fillStyle='#f0fff3';ctx.font='bold 66px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,256,66,474);
  const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;
  const material=new T.MeshStandardMaterial({map,emissiveMap:map,emissive:0xffffff,emissiveIntensity:.32,roughness:.75});
  const panel=new T.Mesh(new T.PlaneGeometry(1.24,.31),material);
  panel.position.set(...point(s,u,d,y));panel.rotation.y=angle;panel.name='Salida existente · '+text;panel.userData.scope=s.id;panel.userData.flightIgnore=true;scene.add(panel);
  box(...point(s,u,d+.045,y),1.30,.37,.075,casing,angle);
  signs.push(panel);
 }
 exitSign(s,P.axis+3.8,12.43,2.18,'← SALIDA',tierAngle(s,P.axis+3.8,12.43));
 exitSign(s,P.axis-3.8,12.43,2.18,'SALIDA →',tierAngle(s,P.axis-3.8,12.43));
 // Sign fixed across the top of the existing south rear access.
 const south=stands.find(v=>v.id==='south');setScope('south');
 exitSign(south,south.accessU,south.depth-.45,2.38,'SALIDA ↑');
 for(const u of[south.accessU-1.72,south.accessU+1.72])
  beam(point(south,u,south.depth-.42,0),point(south,u,south.depth-.42,2.65),.024,casing);
 beam(point(south,south.accessU-1.72,south.depth-.42,2.64),point(south,south.accessU+1.72,south.depth-.42,2.64),.024,casing);
 setScope('site');
 return{lights,fixtures,signs,emitter,setNight(on){emitter.emissiveIntensity=on?.65:0;for(const panel of signs)panel.material.emissiveIntensity=on?.65:.20;}};
}
