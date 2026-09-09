import * as T from './three.module.min.js';
import {world,floorHeight,supportUs,rearAccessHeight,accessBreaks} from './physics.js';
import {cabin,galleries,solidRanges} from './stadium-layout.js';

// Details inferred from the supplied photos. The covered renovation remains the design target.
export function addStandDetails(scene,s,{box,beam,mesh,merge,curvedBlock,mats,sign,roofFront,roofBack,accentMaterials,standLights,standEmitters}){
 const pt=(u,d,y)=>{const[x,z]=world(s,u,d);return[x,y,z];};
 const at=(u,d,y,w,h,t,m)=>{const p=pt(u,d,y);box(p[0],p[1],p[2],w,h,t,m,s.angle);};
 const rear=floorHeight(s,s.depth);
 const painted=mats.concrete.clone();painted.color.setHex(s.id==='main'?0xe0ddc9:0xe2e3dc);
 const blue=mats.concrete.clone();blue.color.setHex(0x185582);
 const cyan=mats.concrete.clone();cyan.color.setHex(0x39b1bf);
 const dark=mats.concrete.clone();dark.color.setHex(0x657079);
 const plaster=painted;
 // A continuous external facade with an actual open central access in the main stand.
 const ranges=[[-s.length/2,s.accessU-1.8],[s.accessU+1.8,s.length/2]];
 const facade=[[],[],[]];
 if(s.id!=='main'){
 for(const[a,b]of ranges){
   // Curve the facade with its ribs; a straight half-length panel mismatched the supports.
   facade[0].push(curvedBlock(s,s.depth,s.depth+.24,0,2.5,2.5,a,b));
   facade[1].push(curvedBlock(s,s.depth-.01,s.depth+.21,2.65,rear,rear,a,b));
   facade[2].push(curvedBlock(s,s.depth+.16,s.depth+.38,0,.3,.3,a,b));
 }
 for(let i=0;i<3;i++)mesh(merge(facade[i]),[s.id==='main'?cyan:blue,plaster,dark][i]);
 for(let u=-s.length/2+3;u<s.length/2-2;u+=8.5){
   if(Math.abs(u-s.accessU)<4)continue;
   at(u,s.depth+.25,2.9,5.1,.68,.09,mats.glass);
   for(const k of[-2.5,0,2.5])at(u+k,s.depth+.32,2.9,.07,.8,.12,mats.blue);
   at(u,s.depth+.31,2.52,5.25,.09,.18,mats.white);
   at(u,s.depth+.28,1.1,1.1,2.2,.12,mats.dark);
   at(u+.36,s.depth+.36,1.04,.04,.35,.035,mats.steel);
 }
 // Blue ribs and slab returns carry the historical facade's rhythm.
 for(const u of supportUs(s)){
   at(u,s.depth+.35,rear/2,.48,rear+.15,.7,blue);
   at(u,s.depth+.45,.16,.85,.32,1.02,painted);
   at(u,s.depth+.35,rear+.32,.64,.28,1.1,blue);
   for(const d of[s.depth-.58,s.depth+.38]){
     const a=pt(u,d,roofBack-1.25),b=pt(u-.12,d,roofBack-1.02);
     beam(a,b,.045,mats.steel);
   }
   // Gutter/downpipe remain at the facade edge, outside the gallery.
   beam(pt(u,s.depth+1.13,.3),pt(u,s.depth+1.13,roofBack-.1),.055,mats.steel);
   at(u,s.depth+1.18,.13,.32,.11,.42,dark);
   for(const y of[2,4,6,8])if(y<roofBack)at(u,s.depth+1.1,y,.2,.06,.24,mats.steel);
   at(u,s.depth-.6,roofBack-1.35,.45,.5,.09,mats.steel);
   for(const du of[-.14,.14])for(const dy of[-.14,.14])at(u+du,s.depth-.66,roofBack-1.35+dy,.06,.06,.04,mats.dark);
 }
 }
 for(let u=-s.length/2;u<s.length/2;u+=2){
   const v=Math.min(u+2,s.length/2);
   beam(pt(u,s.depth+1.1,roofBack+.02),pt(v,s.depth+1.1,roofBack+.02),.095,mats.dark);
   // Two slimmer longitudinal purlins below each roof, with visible connections.
   for(const d of[7,12,s.depth-9,s.depth-4]){
     const y=roofFront+(roofBack-roofFront)*(d-4)/(s.depth-3)+.22*Math.sin(Math.PI*(d-4)/(s.depth-3))-.2;
     beam(pt(u,d,y),pt(v,d,y),.055,mats.steel);
   }
 }
 // Exposed ends: floor slab edges, joints and short returns rather than a solid blank wall.
 for(const u of[-s.length/2+.1,s.length/2-.1])for(let d=2;d<s.depth-2;d+=.85){
   at(u,d,floorHeight(s,d)-.16,.22,.16,.83,painted);
 }
 // Gallery slab lips sit on the existing concrete, clear of each actual stair opening.
 const lips=[];for(const[a,b]of galleries(s).flatMap(v=>s.id==='main'&&v[0]===10.5?[[10.5,12.5],[12.5,14]]:[v])){if(a<10)continue;const h=floorHeight(s,a);for(const[u0,u1]of solidRanges(s,a))lips.push(curvedBlock(s,a-.018,a+.045,h-.19,h-.035,h-.035,u0,u1));}
 const galleryLips=mesh(merge(lips),blue);galleryLips.name='Galerías · frentes y espesor de losa';
 // An exterior stair and sheltered landing lead to the first middle gallery.
 const stairPieces=[],stairEdges=[],breaks=accessBreaks(s);
 if(s.id!=='main'){
 for(let i=0;i<breaks.length-1;i++){const d=breaks[i],e=breaks[i+1];if(e-d<.001)continue;const h=rearAccessHeight(s,(d+e)/2);
  stairPieces.push(curvedBlock(s,d,e,s.id==='main'&&d<14.8?Math.min(h-.22,3.0):0,h,h,s.accessU-1.7,s.accessU+1.7));
  if(e-d<1)stairEdges.push(curvedBlock(s,d,Math.min(d+.06,e),h+.006,h+.012,h+.012,s.accessU-1.65,s.accessU+1.65));
  for(const u of[s.accessU-1.82,s.accessU+1.82]){const top=floorHeight(s,d)+.12;at(u,(d+e)/2,(top+h)/2,.22,Math.max(.1,top-h),e-d,painted);beam(pt(u,d,h+1.05),pt(u,e,h+1.05),.026,mats.steel);}
 }
 const stairs=mesh(merge(stairPieces),mats.concrete);stairs.userData.walkingSurface=true;mesh(merge(stairEdges),mats.yellow,false);
 }
 // Rails protect the upper gallery bridges above the exterior access passage.
 for(const d of(s.id==='main'?[]:[s.baseDepth-2,s.baseDepth,s.depth-2])){if(s.id==='main'&&d===cabin.front)continue;const h=floorHeight(s,d),w=s.id==='main'&&d>=20.1?2.65:1.65;for(const u of[s.accessU-w,s.accessU+w])beam(pt(u,d,h),pt(u,d,h+1.1),.027,mats.steel);for(const y of[.55,1.1])beam(pt(s.accessU-w,d,h+y),pt(s.accessU+w,d,h+y),.027,mats.steel);}
 if(s.id!=='main'){const access=sign('ACCESO '+s.name.toUpperCase(),3.25,.48);access.position.set(...pt(s.accessU,s.depth+.55,2.9));access.rotation.y=s.angle+Math.PI;scene.add(access);at(s.accessU,s.depth+.38,3,3.7,.7,.18,mats.blue);}
 const lamp=new T.MeshStandardMaterial({color:0xe0e7df,emissive:0xdce8ed,emissiveIntensity:0,roughness:.5});standEmitters.push(lamp);
 const roofY=d=>roofFront+(roofBack-roofFront)*(d-4)/(s.depth-3);
 for(const d of[6,s.baseDepth-1,s.depth-2.5])for(let u=-s.length/2+5;u<s.length/2;u+=8.5){if(s.id==='main'&&d>=8.3&&d<12.8&&Math.abs(u)<51)continue;const y=roofY(d)-.5;at(u,d,y,2.6,.09,.25,lamp);for(const du of[-1.1,1.1])beam(pt(u+du,d,y+.05),pt(u+du,d,roofY(d)-.13),.014,mats.steel);}
 for(const u of[-s.length/3,0,s.length/3])for(const upper of[false,true]){const d=upper?s.depth-3:7,y=roofY(d)-.6;const light=new T.SpotLight(0xe0ebef,0,52,upper?1.35:1.22,.95,2);light.position.set(...pt(u,d,y));light.target.position.set(...pt(u,d-1.7,upper?floorHeight(s,d-1.7):1.5));scene.add(light,light.target);standLights.push({light,power:upper?520:1200,stand:s.id});}
 for(const d of(s.id==='main'?[]:[14.5,s.depth-2])){const h=rearAccessHeight(s,d);at(s.accessU-(s.id==='main'&&d>20.1?2.55:1.58),d,h+1.4,.1,.10,1.4,lamp);}
 const accessLight=new T.PointLight(0xffdfad,0,18,2);accessLight.position.set(...pt(s.id==='main'?-2.45:s.accessU,s.id==='main'?27:18,s.id==='main'?2.8:3.65));if(s.id==='main'){const entryLamp=lamp.clone();entryLamp.userData.emitterGain=.38;standEmitters.push(entryLamp);at(-2.59,27,2.96,.20,.16,1.05,mats.steel);at(-2.47,27,2.94,.035,.07,.94,entryLamp);}scene.add(accessLight);standLights.push({light:accessLight,power:s.id==='main'?95:65,stand:s.id});
 let booth=null;
 if(s.id==='main'){
  // One accessible booth sits over the lower entrance route. Its floor is also in physics.
  const f=cabin.floor,front=cabin.front,back=cabin.back,w=cabin.halfWidth;
  const slab=mesh(curvedBlock(s,front,back,f-.22,f,f,-w,w),mats.concrete);slab.name='Cabina · suelo';slab.userData.walkingSurface=true;
  const roof=mesh(curvedBlock(s,front-.2,back+.2,f+cabin.height,f+cabin.height+.16,f+cabin.height+.16,-w-.2,w+.2),mats.metal);roof.name='Cabina · cubierta';
  at(0,back,f+cabin.height/2,w*2,cabin.height,.18,painted);
  for(const u of[-w,w]){at(u,(front+back)/2,f+cabin.height/2,.17,cabin.height,back-front,blue);for(const d of[front+.12,back+1.7])at(u,d,f/2,.25,f,.30,blue);at(u,back+.79,f-.24,.3,.45,1.94,blue);}
  const glass=mats.glass.clone();glass.transparent=true;glass.opacity=.18;glass.metalness=.05;glass.roughness=.20;glass.depthWrite=false;glass.side=T.DoubleSide;
  const glazing=[];for(const[a,b]of[[-w,-cabin.doorHalf],[cabin.doorHalf,w]]){
   at((a+b)/2,front,f+.43,b-a,.86,.13,blue);
   const pane=new T.Mesh(new T.BoxGeometry(b-a,1.7,.045),glass);pane.position.set(...pt((a+b)/2,front,f+1.72));pane.rotation.y=s.angle;pane.name='Cabina · vidrio al campo';scene.add(pane);glazing.push(pane);
   for(const u of[a,b,(a+b)/2])at(u,front-.04,f+1.7,.065,1.76,.09,mats.steel);
  }
  for(const[a,b]of[[-w,-cabin.doorHalf],[cabin.doorHalf,w]]){at((a+b)/2,front-.06,f+.9,b-a+.04,.07,.25,mats.steel);at((a+b)/2,front-.04,f+2.60,b-a+.04,.07,.13,mats.steel);}
  for(const u of[-w+.09,w-.09])at(u,(front+back)/2,f+.065,.065,.13,back-front,painted);
  at(0,front,f+2.7,w*2,.3,.16,blue);
  // Door is shown open along its jamb, leaving the centre accessible from the gallery.
  at(cabin.doorHalf,front+.64,f+1.16,.055,2.3,1.3,glass);at(cabin.doorHalf-.04,front+.97,f+1.1,.08,.3,.035,mats.steel);
  for(const u of[-cabin.doorHalf,cabin.doorHalf])at(u,front,f+1.25,.08,2.5,.18,mats.steel);
  const name=sign('CABINA',1.5,.3);name.position.set(...pt(0,front-.13,f+2.69));name.rotation.y=s.angle;scene.add(name);
  // A compact work surface sits at the rear, away from the visitor's central aisle.
  for(const u of[-2.7,2.7]){at(u,back-.45,f+.8,1.3,.08,.55,mats.dark);for(const du of[-.5,.5])at(u+du,back-.45,f+.4,.055,.8,.4,mats.steel);}
  // Two chairs face the existing rear worktops, outside the central entrance aisle.
  for(const u of[-2.7,2.7]){at(u,back-1.13,f+.47,.46,.075,.43,mats.dark);at(u,back-1.34,f+.78,.46,.56,.06,mats.dark);for(const du of[-.18,.18])for(const dd of[-.16,.16])at(u+du,back-1.13+dd,f+.22,.04,.44,.04,mats.steel);}
  at(0,(front+back)/2,f+2.7,2.0,.045,.25,lamp);const inside=new T.PointLight(0xffe0b5,0,7,2);inside.position.set(...pt(0,(front+back)/2,f+2.35));scene.add(inside);standLights.push({light:inside,power:16,stand:s.id});
  booth={slab,roof,glazing,floor:f};
 }
 return{stand:s.id,booth};
}
