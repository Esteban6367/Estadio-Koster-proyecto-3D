import * as T from './three.module.min.js';
import {stands,world,spanAt,tierAngle,aisleUs} from './stadium-layout.js';
import {floorHeight} from './physics.js';
import {canopyHalf} from './main-canopy-layout.js';
import {publicLayout as P} from './public-layout.js';

// Yellow CAD symbols are ceiling fixtures, NOT fittings on seating risers.
// Four rows over the lower bank; five over the upper bank, including the
// gallery edge. CAD proportions are visual references, not surveyed photometry.
export function fixtureRoofY(s,d){const front=floorHeight(s,s.depth)+3.8,back=front+.9,t=(d-4)/(s.depth-3);return front+(back-front)*t+.22*Math.sin(Math.PI*t);}
export const referenceRows={main:[4.45,5.55,6.65,7.75,13.25,17.45,21.65,25.85,30.05],south:[4.65,9.6,14.55,19.5]};
export function addReferenceFixtures(scene,{box,mesh,curvedBlock,mats,setScope,standLights,standEmitters}){
 const fixtures=[],housing=mats.steel.clone();housing.color.setHex(0x59646b);housing.roughness=.65;
 const diffuser=new T.MeshStandardMaterial({color:0xf4f2de,emissive:0xffecd1,emissiveIntensity:0,roughness:.72});standEmitters.push(diffuser);
 for(const s of stands){
  const scope=s.id+'-canopy';setScope(scope);
  for(const d of referenceRows[s.id]){
   const lower=s.id==='main'&&d<8.3,half=(s.id==='main'?canopyHalf(s,d):spanAt(s,d)/2)-2.6;
   let positions;
   if(lower){positions=Array.from({length:11},(_,i)=>-half+2*half*i/10);}
   else{const edge=spanAt(s,d)/2-1.8,breaks=[-edge,...aisleUs(s,s.id==='main'?Math.max(13.5,d):d),edge];positions=breaks.slice(0,-1).flatMap((a,j)=>[.28,.72].map(f=>a+(breaks[j+1]-a)*f));}
   for(const u of positions){
    const w=2.2,roof=fixtureRoofY(s,d),y=roof-.34,[x,z]=world(s,u,d),angle=tierAngle(s,u,d);
    // Rigid downward diffuser with two short brackets fixed to the roof skin.
    box(x,y,z,w,.105,.24,housing,angle);box(x,y-.06,z,w-.10,.024,.19,diffuser,angle);
    for(const side of[-1,1]){const a=x+side*.82*Math.cos(angle),b=z-side*.82*Math.sin(angle);box(a,roof-.215,b,.045,.15,.075,housing,angle);}
    const targetD=lower?d-1:s.id==='main'&&d<14?13.15:d-.55,target=world(s,u,targetD),targetY=floorHeight(s,targetD);
    const light=new T.SpotLight(0xffecd1,0,32,1.12,.85,2);light.position.set(x,y-.09,z);light.target.position.set(target[0],targetY+.04,target[1]);
    light.name='Voladizo · lineal CAD · '+s.id;light.userData.scope=scope;light.target.userData.scope=scope;light.userData.alwaysBaked=true;scene.add(light,light.target);
    // Renderer-space visual values only. All these sources are baked, even at high quality.
    const power=s.id==='main'?(lower?70:29):50;standLights.push({light,power,stand:s.id});
    fixtures.push({stand:s.id,scope,u,d,y,width:w,x,z,roofY:roof,target:[target[0],targetY,target[1]]});
   }
  }
 }
 setScope('main');const blue=mats.concrete.clone();blue.color.setHex(0x2365a0);blue.roughness=.91;blue.polygonOffset=true;blue.polygonOffsetFactor=-1;blue.polygonOffsetUnits=-1;
 const floor=mesh(curvedBlock(stands[0],12.76,13.5,4.199,4.206,4.206,-P.endU,P.endU),blue);
 floor.name='Pasillo azul · circulación curva superior';floor.userData.scope='main';floor.userData.walkingSurface=true;
 return{fixtures,passage:floor};
}
