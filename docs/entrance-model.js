import {planBand} from './plan-geometry.js';
import {fittedBox,tierAngle} from './stadium-layout.js';
import {whiteGate,addWhiteGate} from './white-gate.js';
import {addSecretariaFacade,addSecretariaApproach} from './secretaria-facade.js';
import {northwestWalls} from './northwest-enclosure.js';
import {soffitStart,soffitEnd,soffitCuts,exteriorSoffit} from './exterior-soffit.js';
import {addPublicInterior} from './public-interior.js';
import * as T from './three.module.min.js';
import {stands,world,bend,local,spanAt} from './stadium-layout.js';
import {entrance as E,entryFloor,entryHalf,facadeRibs,facadeActiveRibs,facadeEndRibs,facade as F,perimeterReturn,publicGateSegments,publicGateState,entryObstacles} from './entrance-layout.js';
import {refineGround} from './ground-surfaces.js';
import {floorHeight} from './physics.js';

// Original procedural surfaces; colour contains no photographic shadows.
function finish(base,color,pattern){
 const m=base.clone();m.color.setHex(color);m.roughness=.94;m.metalness=0;
 if(!pattern)return m;
 const n=256,data=new Uint8Array(n*n*4),normal=new Uint8Array(n*n*4),rough=new Uint8Array(n*n*4);
 for(let y=0;y<n;y++)for(let x=0;x<n;x++){
  // Decorrelated grain avoids the concentric interference patterns that the
  // old modulo-product noise revealed under grazing light.
  let hash=Math.imul(x+1,374761393)^Math.imul(y+1,668265263);hash=Math.imul(hash^(hash>>>13),1274126177);
  const i=(y*n+x)*4,noise=((hash^(hash>>>16))>>>0)/4294967295;
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
 const materials={turquoise:finish(mats.concrete,0x20abb9,'paintedBrick'),cream:finish(mats.concrete,0xdaddd8,'paintedBrick'),navy:finish(mats.concrete,0x294361,'plaster'),tile:finish(mats.paving,0xc1bfb3,'tile'),asphalt:finish(mats.paving,0x8d8178,'asphalt'),gate:finish(mats.metal,0x16a5b1),rail:finish(mats.steel,0x219ca6)};
 // Exterior painted masonry is calibrated against the videos; interior finishes stay separate.
 materials.insideTeal=finish(mats.concrete,0x188e9b,'paintedBrick');
 materials.insideWhite=finish(mats.concrete,0xd4d8d1,'plaster');
 materials.insideBlue=finish(mats.concrete,0x304966,'paintedBrick');
 for(const m of[materials.insideBlue])for(const key of['map','normalMap','roughnessMap']){m[key].dispose();m[key]=materials.insideTeal[key];}
 materials.insideTile=finish(mats.paving,0xa8ada8,'smallTile');
 materials.insideConcrete=finish(mats.concrete,0xa2aaa8);materials.insideConcrete.normalScale.set(.12,.12);
 materials.groove=finish(mats.concrete,0x777f7f);
 materials.doorMetal=finish(mats.metal,0x6b7d80);materials.doorMetal.metalness=.30;materials.doorMetal.roughness=.74;
 materials.doorFrame=finish(mats.steel,0x85918f);materials.doorFrame.metalness=.45;
 materials.gate.metalness=.38;materials.gate.roughness=.76;materials.rail.metalness=.45;materials.rail.roughness=.64;
 for(const key of['map','normalMap','roughnessMap']){materials.cream[key].dispose();materials.cream[key]=materials.turquoise[key];}
 const at=(u,d,y,w,h,t,m)=>fittedBox(s,box,u,d,y,w,h,t,m);
 const geometryGroups=new Map(),floors=[],shell=[];
 function block(d0,d1,bottom,top0,top1,u0,u1,m,role='shell',fitEdge=false){
  if(Math.max(top0,top1)<=bottom||u1<=u0)return;
  // Metric floor cells provide samples inside the passage for the light bake.
  if(role==='floor'&&d1-d0>1.51){const n=Math.ceil((d1-d0)/1.5);for(let i=0;i<n;i++)block(d0+(d1-d0)*i/n,d0+(d1-d0)*(i+1)/n,bottom,top0+(top1-top0)*i/n,top0+(top1-top0)*(i+1)/n,u0,u1,m,role,fitEdge);return;}
  const g=curvedBlock(s,d0,d1,bottom,top0,top1,u0,u1),uv=g.attributes.uv;
  if(fitEdge){const p=g.attributes.position;for(let i=0;i<p.count;i++){const q=local(s,p.getX(i),p.getZ(i)),half=spanAt(s,q.d)/2-.28,u=Math.max(-half,Math.min(half,q.u)),[x,z]=world(s,u,q.d);p.setXYZ(i,x,p.getY(i),z);}g.computeVertexNormals();}
  if(m.userData.tile)for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*3/m.userData.tile,uv.getY(i)*3/m.userData.tile);
  const key=m.uuid+role;if(!geometryGroups.has(key))geometryGroups.set(key,{m,role,parts:[]});geometryGroups.get(key).parts.push(g);
 }
 function band(u0,u1,front,back,bottom,top,m,role='shell'){
  const g=planBand(u0,u1,front,back,bottom,top),uv=g.attributes.uv;
  if(m.userData.tile)for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*3/m.userData.tile,uv.getY(i)*3/m.userData.tile);
  const key=m.uuid+role;if(!geometryGroups.has(key))geometryGroups.set(key,{m,role,parts:[]});geometryGroups.get(key).parts.push(g);
 }
 // Recessed masonry has actual openings. Individual bays follow the curved plan.
 setScope('main');
 for(let k=0;k<facadeRibs.length-1;k++){
  const a=facadeRibs[k]+.25,b=facadeRibs[k+1]-.25,u=(a+b)/2;
  const left=E.axis-E.half-.24,right=E.axis+E.half+.24;
  if(a<right&&b>left){
   for(const[l,r]of[[a,Math.min(b,left)],[Math.max(a,right),b]].filter(([l,r])=>r>l)){
    block(F.wallFront,F.wallBack,0,2.48,2.48,l,r,materials.turquoise);
    block(F.wallFront,F.wallBack,2.48,3.3,3.3,l,r,materials.navy);
    block(F.wallFront,F.wallBack,3.3,F.whiteTop,F.whiteTop,l,r,materials.cream);
    block(F.wallFront,F.wallBack,F.whiteTop,F.wallTop,F.wallTop,l,r,materials.navy);
   }
   continue;
  }
  if(k===9||k===10){addSecretariaFacade({k,a,b,at,pt,block,beam,mesh,scene,materials,mats,F});continue;}
  const endBay=k===0||k===facadeRibs.length-2,door=!endBay&&k%3===0,opening=door?1.05:1.05,lower=door?0:.95,upper=door?2.22:2.10;
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
  // estadio1 starts with a cropped bay; estadio3 00:00 confirms three openings.
  const count=3,step=(b-a)/count;
  for(let j=0;j<count;j++){const l=a+j*step,r=l+step;block(30.3,30.6,2.63,3.12,3.12,l,l+.18,materials.navy);at((l+r+.18)/2,30.34,2.875,step-.3,.49,.055,mats.glass);at((l+r+.18)/2,30.58,2.64,step-.25,.055,.21,materials.navy);}
  // Wall and lintel meet the existing gallery underside at +11.96 m.
  // Former +8.10 m stopping line left an accidental open strip above the wall.
  block(F.wallFront,F.wallBack,3.3,F.whiteTop,F.whiteTop,a,b,materials.cream);
  block(F.wallFront,F.wallBack,F.whiteTop,F.wallTop,F.wallTop,a,b,materials.navy);
 }
 // Fill the former slots behind the offset facade columns.
 for(const u of facadeActiveRibs)for(const[lo,hi,mat]of[[0,2.48,materials.turquoise],[2.48,3.3,materials.navy],[3.3,F.whiteTop,materials.cream],[F.whiteTop,F.wallTop,materials.navy]])block(F.wallFront,F.wallBack,lo,hi,hi,u-.25,u+.25,mat);
 // Entrance bay: flanking masonry leaves a 5.40 m opening through the wall.
 for(const side of[-1,1]){const a=E.axis+(side<0?-2.94:2.7),b=a+.24;block(30.3,33,0,3.3,3.3,a,b,materials.turquoise);}
 const sectionBeam=(a,b,w,d,m)=>{const v=new T.Vector3(...a),end=new T.Vector3(...b),dir=end.clone().sub(v),g=new T.BoxGeometry(w,dir.length(),d);g.applyQuaternion(new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),dir.normalize()));g.translate(...v.add(end).multiplyScalar(.5).toArray());const key=m.uuid+'shell';if(!geometryGroups.has(key))geometryGroups.set(key,{m,role:'shell',parts:[]});geometryGroups.get(key).parts.push(g);};

 // Ribs meet each underside tread instead of crossing a flat soffit.
 const steppedRib=(u,w)=>{for(let i=0;i<6;i++){const a=soffitCuts[i],b=soffitCuts[i+1],y=exteriorSoffit((a+b)/2);block(a,b,y-.24,y,y,u-w/2,u+w/2,materials.navy);}};
 for(const u of [...facadeActiveRibs,...facadeEndRibs]){
  at(u,F.columnD,F.kneeY/2,F.columnWidth,F.kneeY,F.columnDepth,materials.navy);
  at(u,F.columnD,.16,.83,.32,1.04,materials.navy);
  sectionBeam(pt(u,F.columnD,F.kneeY-.12),pt(u,F.corniceD,F.corniceY),.50,.60,materials.navy);
  // These rafters reach both the masonry head and the cornice. The old
  // diagonal ending freely beyond the wall is removed, including its mesh collider.
  steppedRib(u,.34);
 }
 // Secondary concrete ribs are volumetric, tucked against the existing slab;
 // they are not a second skin. Leave the central entrance and cabin route clear.
 for(let k=0;k<facadeRibs.length-1;k++){
  const a=facadeRibs[k],b=facadeRibs[k+1];if(a<E.axis+E.half&&b>E.axis-E.half)continue;
  for(const t of[.25,.5,.75]){const u=a+(b-a)*t;steppedRib(u,.20);}
 }
 // The short returns terminate on the retained tapered side walls. The outer
 // edge meets the inner face of the 0.28 m side shell at both depths; it
 // does not duplicate that shell's visible exterior face.
 for(const side of[-1,1])for(const[bottom,top,mat]of[[0,2.48,materials.turquoise],[2.48,3.3,materials.navy],[3.3,F.whiteTop,materials.cream],[F.whiteTop,F.wallTop,materials.navy]]){
  const g=curvedBlock(s,F.wallFront,F.wallBack,bottom,top,top,side<0?-(spanAt(s,F.wallFront)/2-.28):F.half,side<0?-F.half:spanAt(s,F.wallFront)/2-.28),p=g.attributes.position;
  for(let i=0;i<p.count;i++){const q=local(s,p.getX(i),p.getZ(i));if(Math.abs(q.u)>F.half+.001){const t=(Math.abs(q.u)-F.half)/(spanAt(s,F.wallFront)/2-.28-F.half),u=side*(F.half+t*(spanAt(s,q.d)/2-.28-F.half)),[x,z]=world(s,u,q.d);p.setXYZ(i,x,p.getY(i),z);}}
  g.computeVertexNormals();const key=mat.uuid+'shell';if(!geometryGroups.has(key))geometryGroups.set(key,{m:mat,role:'shell',parts:[]});geometryGroups.get(key).parts.push(g);
 }
 // Replace the original slab underside; no second panel or overlapping skin.
 const slabCuts=[32.5,...soffitCuts.filter(d=>d>32.5&&d<33.3),33.3];
 for(let i=0;i<slabCuts.length-1;i++){const a=slabCuts[i],b=slabCuts[i+1];block(a,b,exteriorSoffit((a+b)/2),12.18,12.18,-spanAt(s,s.depth)/2,spanAt(s,s.depth)/2,mats.concrete);}
 block(33.12,33.4,11.53,12.27,12.27,-spanAt(s,s.depth)/2,spanAt(s,s.depth)/2,materials.navy);
 // The retained +12.18 m gallery railing sits above the historical-style fascia.
 const label=sign('ESTADIO LUIS KÖSTER',14,.65);label.geometry=new T.PlaneGeometry(14,.65,40,1);const lp=label.geometry.attributes.position;for(let i=0;i<lp.count;i++){const u=-lp.getX(i),y=11.93+lp.getY(i),p=pt(u,33.45,y);lp.setXYZ(i,...p);}label.geometry.computeVertexNormals();label.userData.scope='main';label.name='Fachada · nombre sobre frente curvo';scene.add(label);
 for(const u of[-12,0,12])beam(pt(u,32.6,12.18),pt(u,32.6,16.5),.026,mats.steel);
 // Lightweight, static folded Uruguayan flag: original vector-like geometry.
 const flagMat=[mats.white,mats.blue,mats.yellow],flagParts=[[],[],[]];
 for(let row=0;row<9;row++){const g=new T.PlaneGeometry(1.75,.12,8,1),p=g.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i)+.875;p.setXYZ(i,x,16.35-row*.12+p.getY(i),.11*Math.sin(x*4));}flagParts[row%2].push(g);}
 const canton=new T.PlaneGeometry(.62,.60);canton.translate(.31,16.11,.13);flagParts[0].push(canton);
 const sun=new T.CircleGeometry(.105,16);sun.translate(.31,16.11,.145);flagParts[2].push(sun);
 for(let i=0;i<3;i++){const o=mesh(merge(flagParts[i]),flagMat[i].clone(),false);o.material.side=T.DoubleSide;o.position.set(...pt(0,32.6,0));o.rotation.y=-Math.PI/2;o.name='Bandera uruguaya · propuesta';}
 const rake=(u0,u1,d0,d1,bottom,h0,h1,m)=>{const top=Math.max(h0,h1),g=curvedBlock(s,d0,d1,bottom,top,top,u0,u1),p=g.attributes.position;for(let i=0;i<p.count;i++)if(p.getY(i)>bottom+.001){const u=local(s,p.getX(i),p.getZ(i)).u;p.setY(i,h0+(h1-h0)*(u-u0)/(u1-u0));}g.computeVertexNormals();const key=m.uuid+'shell';if(!geometryGroups.has(key))geometryGroups.set(key,{m,role:'shell',parts:[]});geometryGroups.get(key).parts.push(g);};
 addPublicInterior({block,band,edgeBlock:(...args)=>{while(args.length<9)args.push('shell');block(...args,true);},rake,at,pt,materials,mats,beam,sign,scene,gradeHeight:d=>floorHeight(s,d)});
 // Static corridor lighting participates in the existing stand bake/control.
 const corridorEmitter=new T.MeshStandardMaterial({color:0xe4e8e9,emissive:0xe4eef0,emissiveIntensity:0,roughness:.7});corridorEmitter.userData.emitterGain=.38;standEmitters.push(corridorEmitter);
 for(const u of[-41,-35,-26,-4,4,26,41]){at(u,12.39,2.8,1.25,.14,.20,materials.navy);at(u,12.27,2.78,1.12,.06,.035,corridorEmitter);for(const du of[-.45,.45])beam(pt(u+du,12.49,2.8),pt(u+du,12.32,2.8),.016,mats.steel);const light=new T.PointLight(0xe1e9ee,0,20,2);light.position.set(...pt(u,11.95,2.62));scene.add(light);standLights.push({light,power:70,stand:'main'});}
 const warm=corridorEmitter.clone();warm.color.setHex(0xffe6b5);warm.emissive.setHex(0xffd89a);warm.userData.emitterGain=.26;standEmitters.push(warm);
 for(const u of[-5,0,5,10,14]){at(u,12.31,2.98,1.2,.11,.12,materials.doorFrame);at(u,12.23,2.95,1.10,.06,.08,warm);const l=new T.PointLight(0xffdfaa,0,9,2);l.position.set(...pt(u,12.10,2.78));scene.add(l);standLights.push({light:l,power:7,stand:'main'});}
 // Two opaque steel leaves, shown open by default. Hinges and collision share pivots.
 const leaves=publicGateSegments(0).map(({a,side,width,closedAngle})=>{const group=new T.Group();group.name='Entrada principal · hoja móvil';group.userData.dynamicTransform=true;group.position.set(a[0],0,a[1]);scene.add(group);
  const parts=[{x:width/2,y:1.65,w:width-.04,h:3.18,d:.055},{x:.04,y:1.65,w:.08,h:3.22,d:.11},{x:width-.06,y:1.65,w:.08,h:3.22,d:.11},...[.08,1.15,3.22].map(y=>({x:E.half/2,y,w:width,h:.085,d:.11}))];
  const g=merge(parts.map(p=>{const q=new T.BoxGeometry(p.w,p.h,p.d);q.translate(p.x,p.y,0);return q;}));const o=new T.Mesh(g,materials.gate);o.castShadow=true;o.receiveShadow=true;group.add(o);
  for(const y of[.35,1.65,2.95]){at(E.axis+side*E.half,E.portalD,y,.13,.22,.16,mats.steel);beam(pt(E.axis+side*E.half,33,y),pt(E.axis+side*E.half,E.portalD,y),.028,mats.steel);}
  const handle=new T.Mesh(new T.BoxGeometry(.06,.32,.12),mats.steel);handle.position.set(width-.35,1.15,-.1);group.add(handle);return{group,side,closedAngle};
 });
 function update(){whitePortal.update();for(const{group,side,closedAngle}of leaves){group.rotation.y=closedAngle-side*publicGateState.progress*Math.PI/2;group.updateMatrix();}}
 // A broad aggregate forecourt, cropped at the actual curved entrance threshold.
 // Walk the boundary in order; reversing it would make a self-crossing apron
 // and leave a second ground surface below the bowed facade.
 const shape=new T.Shape();shape.moveTo(E.forecourtWest,-E.forecourtZ);shape.lineTo(E.forecourtWest,E.forecourtZ);shape.lineTo(-86,E.forecourtZ);for(let u=57.5;u>=-57.5;u-=2.5){const[x,z]=world(s,u,33.01);shape.lineTo(x,-z);}shape.lineTo(-86,-E.forecourtZ);shape.closePath();
 let ground=new T.ShapeGeometry(shape);ground.rotateX(-Math.PI/2);ground=refineGround(ground,1.8,false);const p=ground.attributes.position,uv=ground.attributes.uv;for(let i=0;i<p.count;i++)uv.setXY(i,p.getX(i)/6,p.getZ(i)/6);
 const apron=mesh(ground,materials.asphalt,false);apron.position.y=-.009;apron.name='Explanada · asfalto envejecido';apron.userData.walkingSurface=true;
 // Pale boundary wall and white barred service gate at one end (placement proposed).
 const wall=entryObstacles[0],gapX=whiteGate.x;
 for(const[a,b]of[[-106.3,gapX-1.5],[gapX+1.5,whiteGate.wallEnd]])box((a+b)/2,1.52,wall.z,b-a,3.04,.28,materials.cream);
 for(const x of[-106.3,gapX-1.65,gapX+1.65,-96.2,-92.3,whiteGate.wallEnd])box(x,1.61,wall.z,.31,3.22,.38,materials.cream);
 const whitePortal=addWhiteGate(scene,mats,merge);
 const ret=perimeterReturn,dx=ret.b[0]-ret.a[0],dz=ret.b[1]-ret.a[1],len=Math.hypot(dx,dz),ang=Math.atan2(-dz,dx);
 const g=new T.BoxGeometry(len,ret.height,ret.thickness);g.rotateY(ang);g.translate((ret.a[0]+ret.b[0])/2,ret.height/2,(ret.a[1]+ret.b[1])/2);const returned=mesh(g,materials.cream);returned.name='Fachada · retorno unido al muro perimetral';returned.userData.scope='main';returned.userData.bakeOccluder=true;shell.push(returned);
 // Coping stops at the column and follows the same return; no freestanding remnant.
 box((ret.a[0]+ret.b[0])/2,ret.height+.035,(ret.a[1]+ret.b[1])/2,len,.07,.34,materials.cream,ang);
 // Continuous local closure: same cream masonry and 0.28 m wall thickness.
 for(const w of northwestWalls){
  const width=w.x1-w.x0,depth=w.z1-w.z0,top=Math.max(w.h0,w.h1);
  const g=new T.BoxGeometry(width,top,depth,Math.max(1,Math.ceil(width/3)),1,Math.max(1,Math.ceil(depth/3)));
  g.translate((w.x0+w.x1)/2,top/2,(w.z0+w.z1)/2);
  const positions=g.attributes.position;
  for(let i=0;i<positions.count;i++)if(positions.getY(i)>.001)positions.setY(i,w.h0+(w.h1-w.h0)*(positions.getX(i)-w.x0)/width);
  g.computeVertexNormals();const wallMesh=mesh(g,materials.cream);wallMesh.name='Cerramiento noroeste · '+w.id;wallMesh.userData.bakeOccluder=true;shell.push(wallMesh);
 }
 addSecretariaApproach({at,block,pt,beam,materials,mats});
 const planter=entryObstacles[1];for(const z of[planter.z-1.6,planter.z+1.6])box(planter.x,.23,z,6,.46,.18,materials.turquoise);for(const x of[planter.x-3,planter.x+3])box(x,.23,planter.z,.18,.46,3.2,materials.turquoise);
 box(planter.x,.18,planter.z,5.8,.30,3,mats.grass);beam([planter.x,0,planter.z],[planter.x,6.5,planter.z],.29,mats.trunk);
 const crown=new T.IcosahedronGeometry(1,1);for(let i=0;i<7;i++){const a=i*2.4,x=planter.x+Math.cos(a)*2.4,z=planter.z+Math.sin(a)*2.1;beam([planter.x,3.5,planter.z],[x,7,z],.11,mats.trunk);const tree=new T.Mesh(crown,i%2?mats.leaf:mats.leaf2);tree.position.set(x,7.8+(i%3)*.35,z);tree.scale.set(3,2.2,2.8);tree.castShadow=true;scene.add(tree);}
 for(const{m,role,parts}of geometryGroups.values()){const o=mesh(merge(parts),m);o.name='Entrada principal · '+role;o.userData.scope='main';if(role==='floor'){o.userData.walkingSurface=true;floors.push(o);}if(role==='shell'){o.userData.bakeOccluder=true;shell.push(o);}if(role==='groove')o.userData.detail='entryFine';}
 update();
 return{materials,whitePortal,leaves:leaves.map(v=>v.group),floors,shell,apron,update};
}
