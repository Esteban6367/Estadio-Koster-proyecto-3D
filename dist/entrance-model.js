import {addPublicInterior} from './public-interior.js';
import * as T from './three.module.min.js';
import {stands,world,bend,local} from './stadium-layout.js';
import {entrance as E,entryFloor,entryHalf,facadeRibs,publicGateSegments,publicGateState,entryObstacles} from './entrance-layout.js';
import {refineGround} from './ground-surfaces.js';
import {floorHeight} from './physics.js';

// Original procedural surfaces; colour contains no photographic shadows.
function finish(base,color,pattern){
 const m=base.clone();m.color.setHex(color);m.roughness=.94;m.metalness=0;
 if(!pattern)return m;
 const n=256,data=new Uint8Array(n*n*4),normal=new Uint8Array(n*n*4),rough=new Uint8Array(n*n*4);
 for(let y=0;y<n;y++)for(let x=0;x<n;x++){
  const i=(y*n+x)*4,noise=((x*137+y*251+(x*y)%71)%97)/96;
  const quiet=pattern==='paintedBrick'||pattern==='smallTile',row=Math.floor(y/(quiet?8:16)),joint=pattern==='paintedBrick'?(y%8<1||(x+(row%2)*16)%32<1):pattern==='smallTile'?(x%16<1||y%16<1):pattern==='brick'?(y%16<1||(x+(row%2)*16)%32<1):pattern==='tile'?(x%16<1||y%16<1):false;
  const broad=Math.sin(x*.046+Math.sin(y*.034)*1.8)*Math.cos(y*.029);
  const value=quiet?(joint?206:225+noise*9+broad*(pattern==='smallTile'?9:3)):pattern==='asphalt'?175+noise*25+broad*17:joint?130:211+noise*16+(pattern==='tile'?broad*13:0);
  data[i]=value+(pattern==='asphalt'?6:0);data[i+1]=value;data[i+2]=value-(pattern==='asphalt'?6:0);data[i+3]=255;
  normal[i]=128+Math.round((noise-.5)*8);normal[i+1]=joint?(quiet?125:117):128;normal[i+2]=254;normal[i+3]=255;
  rough[i]=rough[i+1]=rough[i+2]=joint?255:211+noise*35;rough[i+3]=255;
 }
 const tx=(a,srgb)=>{const t=new T.DataTexture(a,n,n);t.wrapS=t.wrapT=T.RepeatWrapping;t.generateMipmaps=true;t.minFilter=T.LinearMipmapLinearFilter;t.magFilter=T.LinearFilter;t.colorSpace=srgb?T.SRGBColorSpace:T.NoColorSpace;t.anisotropy=4;t.needsUpdate=true;return t;};
 m.map=tx(data,true);m.normalMap=tx(normal,false);m.roughnessMap=tx(rough,false);m.normalScale=new T.Vector2(.17,.17);m.userData={tile:pattern==='smallTile'?1:pattern==='paintedBrick'||pattern==='brick'||pattern==='tile'?2:6,surface:pattern};return m;
}

export function addPrincipalEntrance(scene,{box,beam,mesh,merge,curvedBlock,mats,sign,setScope,standLights,standEmitters}){
 const s=stands[0],pt=(u,d,y)=>{const[x,z]=world(s,u,d);return[x,y,z];};
 const materials={turquoise:finish(mats.concrete,0x159eaa,'brick'),cream:finish(mats.concrete,0xd9d4be,'brick'),navy:finish(mats.concrete,0x303f64),tile:finish(mats.paving,0xc1bfb3,'tile'),asphalt:finish(mats.paving,0x8d8178,'asphalt'),gate:finish(mats.metal,0x16a5b1),rail:finish(mats.steel,0x219ca6)};
 // Interior finishes are separate; the approved exterior retains its original maps and colours.
 materials.insideTeal=finish(mats.concrete,0x188e9b,'paintedBrick');
 materials.insideWhite=finish(mats.concrete,0xd4d8d1,'paintedBrick');
 materials.insideBlue=finish(mats.concrete,0x304966,'paintedBrick');
 for(const m of[materials.insideWhite,materials.insideBlue])for(const key of['map','normalMap','roughnessMap']){m[key].dispose();m[key]=materials.insideTeal[key];}
 materials.insideTile=finish(mats.paving,0xa8ada8,'smallTile');
 materials.insideConcrete=finish(mats.concrete,0xa2aaa8);materials.insideConcrete.normalScale.set(.12,.12);
 materials.groove=finish(mats.concrete,0x777f7f);
 materials.doorMetal=finish(mats.metal,0x6b7d80);materials.doorMetal.metalness=.30;materials.doorMetal.roughness=.74;
 materials.doorFrame=finish(mats.steel,0x85918f);materials.doorFrame.metalness=.45;
 materials.gate.metalness=.38;materials.gate.roughness=.76;materials.rail.metalness=.45;materials.rail.roughness=.64;
 for(const key of['map','normalMap','roughnessMap']){materials.cream[key].dispose();materials.cream[key]=materials.turquoise[key];}
 const at=(u,d,y,w,h,t,m)=>{const[x,yy,z]=pt(u,d,y);box(x,yy,z,w,h,t,m,s.angle);};
 const geometryGroups=new Map(),floors=[],shell=[];
 function block(d0,d1,bottom,top0,top1,u0,u1,m,role='shell'){
  if(Math.max(top0,top1)<=bottom||u1<=u0)return;
  // Metric floor cells provide samples inside the passage for the light bake.
  if(role==='floor'&&d1-d0>1.51){const n=Math.ceil((d1-d0)/1.5);for(let i=0;i<n;i++)block(d0+(d1-d0)*i/n,d0+(d1-d0)*(i+1)/n,bottom,top0+(top1-top0)*i/n,top0+(top1-top0)*(i+1)/n,u0,u1,m,role);return;}
  const g=curvedBlock(s,d0,d1,bottom,top0,top1,u0,u1),uv=g.attributes.uv;
  if(m.userData.tile)for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*3/m.userData.tile,uv.getY(i)*3/m.userData.tile);
  const key=m.uuid+role;if(!geometryGroups.has(key))geometryGroups.set(key,{m,role,parts:[]});geometryGroups.get(key).parts.push(g);
 }
 // Recessed masonry has actual openings. Individual bays follow the curved plan.
 setScope('main');
 for(let k=0;k<facadeRibs.length-1;k++){
  const a=facadeRibs[k]+.28,b=facadeRibs[k+1]-.28,u=(a+b)/2;
  if(Math.abs(u)<2.7)continue;
  const door=k%3===0,opening=door?1.25:1.55,lower=door?0:1.12,upper=door?2.22:1.94;
  block(30.3,30.6,0,lower,lower,a,b,materials.turquoise);
  block(30.3,30.6,lower,upper,upper,a,u-opening/2,materials.turquoise);
  block(30.3,30.6,lower,upper,upper,u+opening/2,b,materials.turquoise);
  block(30.3,30.6,upper,2.48,2.48,a,b,materials.turquoise);
  at(u,30.32,(lower+upper)/2,opening,upper-lower,.075,door?materials.gate:mats.glass);
  for(const du of[-opening/2,opening/2])at(u+du,30.55,(lower+upper)/2,.055,upper-lower+.1,.15,materials.navy);
  at(u,30.56,upper+.04,opening+.1,.07,.16,materials.navy);
  if(!door){at(u,30.61,lower-.035,opening+.16,.07,.32,materials.cream);for(let v=-opening/2+.15;v<opening/2;v+=.19)beam(pt(u+v,30.65,lower),pt(u+v,30.65,upper),.012,mats.steel);}
  else at(u+.4,30.45,1.05,.07,.27,.11,mats.steel);
  // Three clerestory windows, separated by solid masonry mullions, not decals.
  block(30.3,30.6,2.48,2.63,2.63,a,b,materials.navy);
  block(30.3,30.6,3.12,3.3,3.3,a,b,materials.navy);
  const step=(b-a)/3;
  for(let j=0;j<3;j++){const l=a+j*step,r=l+step;block(30.3,30.6,2.63,3.12,3.12,l,l+.18,materials.navy);at((l+r+.18)/2,30.34,2.875,step-.3,.49,.055,mats.glass);at((l+r+.18)/2,30.58,2.64,step-.25,.055,.21,materials.navy);}
  block(30.3,30.6,3.3,8.1,8.1,a,b,materials.cream);
 }
 // Entrance bay: flanking masonry leaves a 5.40 m opening through the wall.
 for(const side of[-1,1]){const a=side<0?-4.0:2.94,b=side<0?-2.94:4.0;block(30.3,33,0,3.3,3.3,a,b,materials.turquoise);}
 const sectionBeam=(a,b,w,d,m)=>{const v=new T.Vector3(...a),end=new T.Vector3(...b),dir=end.clone().sub(v),g=new T.BoxGeometry(w,dir.length(),d);g.applyQuaternion(new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),dir.normalize()));g.translate(...v.add(end).multiplyScalar(.5).toArray());const key=m.uuid+'shell';if(!geometryGroups.has(key))geometryGroups.set(key,{m,role:'shell',parts:[]});geometryGroups.get(key).parts.push(g);};
 for(const u of facadeRibs){
  at(u,30.85,3.25,.50,6.5,.78,materials.navy);at(u,30.85,.16,.83,.32,1.04,materials.navy);
  sectionBeam(pt(u,30.85,6.4),pt(u,33.12,11.95),.5,.60,materials.navy);
  // Grade support continues inward; the metal canopy remains a separate frame.
  sectionBeam(pt(u,22,7.57),pt(u,30.7,11.75),.34,.40,materials.navy);
  beam(pt(u,33.25,.24),pt(u,33.25,16.6),.046,mats.steel);
 }
 block(32.5,33.3,11.94,12.18,12.18,-57.5,57.5,mats.concrete);
 block(33.12,33.4,11.53,12.27,12.27,-57.5,57.5,materials.navy);
 // The retained +12.18 m gallery railing sits above the historical-style fascia.
 const label=sign('ESTADIO LUIS KÖSTER',14,.65);label.geometry=new T.PlaneGeometry(14,.65,20,1);const lp=label.geometry.attributes.position;for(let i=0;i<lp.count;i++)lp.setZ(i,-s.curve*(lp.getX(i)/(s.length/2))**2);label.geometry.computeVertexNormals();label.position.set(...pt(0,33.45,11.93));label.rotation.y=s.angle+Math.PI;label.userData.scope='main';label.name='Fachada · nombre sobre frente curvo';scene.add(label);
 for(const u of[-12,0,12])beam(pt(u,32.6,12.18),pt(u,32.6,16.5),.026,mats.steel);
 // Lightweight, static folded Uruguayan flag: original vector-like geometry.
 const flagMat=[mats.white,mats.blue,mats.yellow],flagParts=[[],[],[]];
 for(let row=0;row<9;row++){const g=new T.PlaneGeometry(1.75,.12,8,1),p=g.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i)+.875;p.setXYZ(i,x,16.35-row*.12+p.getY(i),.11*Math.sin(x*4));}flagParts[row%2].push(g);}
 const canton=new T.PlaneGeometry(.62,.60);canton.translate(.31,16.11,.13);flagParts[0].push(canton);
 const sun=new T.CircleGeometry(.105,16);sun.translate(.31,16.11,.145);flagParts[2].push(sun);
 for(let i=0;i<3;i++){const o=mesh(merge(flagParts[i]),flagMat[i].clone(),false);o.material.side=T.DoubleSide;o.position.set(...pt(0,32.6,0));o.rotation.y=-Math.PI/2;o.name='Bandera uruguaya · propuesta';}
 const rake=(u0,u1,d0,d1,bottom,h0,h1,m)=>{const top=Math.max(h0,h1),g=curvedBlock(s,d0,d1,bottom,top,top,u0,u1),p=g.attributes.position;for(let i=0;i<p.count;i++)if(p.getY(i)>bottom+.001){const u=local(s,p.getX(i),p.getZ(i)).u;p.setY(i,h0+(h1-h0)*(u-u0)/(u1-u0));}g.computeVertexNormals();const key=m.uuid+'shell';if(!geometryGroups.has(key))geometryGroups.set(key,{m,role:'shell',parts:[]});geometryGroups.get(key).parts.push(g);};
 addPublicInterior({block,rake,at,pt,materials,mats,beam,sign,scene,gradeHeight:d=>floorHeight(s,d)});
 // Static corridor lighting participates in the existing stand bake/control.
 const corridorEmitter=new T.MeshStandardMaterial({color:0xe4e8e9,emissive:0xe4eef0,emissiveIntensity:0,roughness:.7});corridorEmitter.userData.emitterGain=.38;standEmitters.push(corridorEmitter);
 for(const u of[-46,-30,-4,4,30,46]){at(u,12.39,2.8,1.25,.14,.20,materials.navy);at(u,12.27,2.78,1.12,.06,.035,corridorEmitter);for(const du of[-.45,.45])beam(pt(u+du,12.49,2.8),pt(u+du,12.32,2.8),.016,mats.steel);const light=new T.PointLight(0xe1e9ee,0,20,2);light.position.set(...pt(u,11.95,2.62));scene.add(light);standLights.push({light,power:90,stand:'main'});}
 // Two opaque steel leaves, shown open by default. Hinges and collision share pivots.
 const leaves=publicGateSegments(0).map(({a,side})=>{const group=new T.Group();group.name='Entrada principal · hoja móvil';group.position.set(a[0],0,a[1]);scene.add(group);
  const parts=[{x:E.half/2,y:1.65,w:E.half-.04,h:3.18,d:.055},{x:.04,y:1.65,w:.08,h:3.22,d:.11},{x:E.half-.06,y:1.65,w:.08,h:3.22,d:.11},...[.08,1.15,3.22].map(y=>({x:E.half/2,y,w:E.half,h:.085,d:.11}))];
  const g=merge(parts.map(p=>{const q=new T.BoxGeometry(p.w,p.h,p.d);q.translate(p.x,p.y,0);return q;}));const o=new T.Mesh(g,materials.gate);o.castShadow=true;o.receiveShadow=true;group.add(o);
  for(const y of[.35,1.65,2.95]){at(side*E.half,E.portalD,y,.13,.22,.16,mats.steel);beam(pt(side*E.half,33,y),pt(side*E.half,E.portalD,y),.028,mats.steel);}
  const handle=new T.Mesh(new T.BoxGeometry(.06,.32,.12),mats.steel);handle.position.set(E.half-.35,1.15,-.1);group.add(handle);return{group,side};
 });
 function update(){for(const{group,side}of leaves){group.rotation.y=-side*Math.PI/2-side*publicGateState.progress*Math.PI/2;group.updateMatrix();}}
 update();
 // A broad aggregate forecourt, cropped at the actual curved entrance threshold.
 const shape=new T.Shape();shape.moveTo(E.forecourtWest,-E.forecourtZ);shape.lineTo(E.forecourtWest,E.forecourtZ);shape.lineTo(-86,E.forecourtZ);for(let u=-57.5;u<=57.5;u+=2.5){const[x,z]=world(s,u,33.01);shape.lineTo(x,-z);}shape.lineTo(-86,-E.forecourtZ);shape.closePath();
 let ground=new T.ShapeGeometry(shape);ground.rotateX(-Math.PI/2);ground=refineGround(ground,3,false);const p=ground.attributes.position,uv=ground.attributes.uv;for(let i=0;i<p.count;i++)uv.setXY(i,p.getX(i)/6,p.getZ(i)/6);
 const apron=mesh(ground,materials.asphalt,false);apron.position.y=-.009;apron.name='Explanada · asfalto envejecido';apron.userData.walkingSurface=true;
 // Pale boundary wall and white barred service gate at one end (placement proposed).
 const wall=entryObstacles[0],gapX=-101.7;
 for(const[a,b]of[[-106.3,gapX-1.5],[gapX+1.5,-87]])box((a+b)/2,1.52,wall.z,b-a,3.04,.28,materials.cream);
 for(const x of[-106.3,gapX-1.65,gapX+1.65,-96.2,-92.3,-88.4,-87])box(x,1.61,wall.z,.31,3.22,.38,materials.cream);
 box(gapX,1.18,wall.z,2.97,2.36,.08,mats.white);for(let x=gapX-1.45;x<gapX+1.46;x+=.15)beam([x,2.36,wall.z],[x,3.12,wall.z],.009,mats.white);beam([gapX-1.5,3.12,wall.z],[gapX+1.5,3.12,wall.z],.023,mats.white);
 const planter=entryObstacles[1];for(const z of[planter.z-1.6,planter.z+1.6])box(planter.x,.23,z,6,.46,.18,materials.turquoise);for(const x of[planter.x-3,planter.x+3])box(x,.23,planter.z,.18,.46,3.2,materials.turquoise);
 box(planter.x,.18,planter.z,5.8,.30,3,mats.grass);beam([planter.x,0,planter.z],[planter.x,6.5,planter.z],.29,mats.trunk);
 const crown=new T.IcosahedronGeometry(1,1);for(let i=0;i<7;i++){const a=i*2.4,x=planter.x+Math.cos(a)*2.4,z=planter.z+Math.sin(a)*2.1;beam([planter.x,3.5,planter.z],[x,7,z],.11,mats.trunk);const tree=new T.Mesh(crown,i%2?mats.leaf:mats.leaf2);tree.position.set(x,7.8+(i%3)*.35,z);tree.scale.set(3,2.2,2.8);tree.castShadow=true;scene.add(tree);}
 for(const{m,role,parts}of geometryGroups.values()){const o=mesh(merge(parts),m);o.name='Entrada principal · '+role;o.userData.scope='main';if(role==='floor'){o.userData.walkingSurface=true;floors.push(o);}if(role==='shell'){o.userData.bakeOccluder=true;shell.push(o);}if(role==='groove')o.userData.detail='entryFine';}
 return{materials,leaves:leaves.map(v=>v.group),floors,shell,apron,update};
}
