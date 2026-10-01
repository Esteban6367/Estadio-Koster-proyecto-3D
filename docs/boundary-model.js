import {trackDimensions as K} from './dimensions.js';
import {addFieldAccess} from './field-access-model.js';
import {fieldAccess} from './field-access-layout.js';
import {undergroundHoles,undergroundOutline} from './underground-layout.js';
import * as T from './three.module.min.js';
import {trackShape,pathHole,athleticsShape,refineGround} from './ground-surfaces.js';
import {cutForecourt} from './entrance-ground.js';
import {world} from './stadium-layout.js';
import {moat,moatChannels as moats,mainStand,at,moatOutline,boundarySegments,gate,gateState,serviceGate,serviceGateState,bridgeLevel} from './boundaries.js';

// Cut the same moat channels and stair mouth through every terrain/paving layer.
export function groundWithMoat(x,z,w,d,material,y,mesh){
 const shape=new T.Shape();shape.moveTo(x-w/2,-z-d/2);shape.lineTo(x+w/2,-z-d/2);shape.lineTo(x+w/2,-z+d/2);shape.lineTo(x-w/2,-z+d/2);shape.closePath();
 if(w>300||w===220&&d===240){
  // Each base layer owns only its exposed ring. The whole site already contains
  // the moats/tunnel holes, so adding nested holes here would be invalid topology.
  const width=w>300?220:212,depth=w>300?240:236,hole=new T.Path();hole.moveTo(2-width/2,-depth/2);hole.lineTo(2+width/2,-depth/2);hole.lineTo(2+width/2,depth/2);hole.lineTo(2-width/2,depth/2);hole.closePath();shape.holes.push(hole);
 }else{
  for(const m of moats){const hole=new T.Path();moatOutline(m).forEach(([px,pz],i)=>i?hole.lineTo(px,-pz):hole.moveTo(px,-pz));hole.closePath();shape.holes.push(hole);}
  for(const r of undergroundHoles){const hole=new T.Path();undergroundOutline(r).forEach(([px,pz],i)=>i?hole.lineTo(px,-pz):hole.moveTo(px,-pz));hole.closePath();shape.holes.push(hole);}
  shape.holes.push(pathHole(athleticsShape(K.width+.36)));
 }
 let g=new T.ShapeGeometry(shape);g.rotateX(-Math.PI/2);g=cutForecourt(g);g=refineGround(g,w>300?8:2.5,w>300);const p=g.attributes.position,uv=g.attributes.uv,tile=material.userData.tile||1;for(let i=0;i<p.count;i++)uv.setXY(i,p.getX(i)/tile,p.getZ(i)/tile);
 const o=mesh(g,material,false);o.position.y=y;o.name='Suelo con apertura real de la fosa';return o;
}

export function addBoundaries(scene,{mats,box,beam,mesh,merge,curvedBlock,sign,renderer}){
 const concrete=mats.concrete.clone();concrete.normalScale.set(.15,.15);concrete.color.setHex(0xc1c6bb);
 const submerged=mats.concrete.clone();submerged.color.setHex(0x687466);submerged.roughness=.85;
 const damp=mats.concrete.clone();damp.color.setHex(0x758374);damp.roughness=.83;
 const teal=new T.MeshStandardMaterial({color:0x548c89,roughness:.62,metalness:.3});
 const iron=new T.MeshStandardMaterial({color:0x384b50,roughness:.56,metalness:.65});
 const yellow=new T.MeshStandardMaterial({color:0xb69e56,roughness:.65,metalness:.28});
 const mainConcrete=concrete.clone();mainConcrete.color.setHex(0xe0e6e3);
 const coping=new T.MeshStandardMaterial({color:0x153b63,roughness:.88});
 const photoTeal=new T.MeshStandardMaterial({color:0x008f9e,roughness:.66,metalness:.28});
 const field=addFieldAccess(scene,{mats,box,beam,mesh,merge,curvedBlock});
 const blocks=[...field.blocks,...field.floors],wetGeometry=[];
 const channelBlock=(m,d0,d1,bottom,top,u0=m.start,u1=m.end,mat=concrete)=>{const cap=mat===concrete&&m.s.id==='main'&&top===m.crest?top-.08:top;const g=curvedBlock(m.s,d0,d1,bottom,cap,cap,u0,u1);if(mat===damp){wetGeometry.push(g);return;}const o=mesh(g,mat===concrete&&m.s.id==='main'?mainConcrete:mat);o.name='Fosa '+m.id+' · hormigón';o.userData.moat=m.id;blocks.push(o);return o;};
 for(const m of moats){
  channelBlock(m,m.innerD,m.outerD,m.slabBottom,m.bottom,m.start,m.end,submerged);
  if(m.id==='main-norte'){
   // Visible low arched recess; the unseen connection is not invented. A closed
   // backing is a proposed water-retaining integration, not a surveyed drain.
   const n=fieldAccess.niche,a=n.u-n.half,b=n.u+n.half,geos=[];
   channelBlock(m,m.innerD,m.innerD+m.wall,m.slabBottom,m.crest,m.start,a);
   channelBlock(m,m.innerD,m.innerD+m.wall,m.slabBottom,m.crest,b,m.end);
   geos.push(curvedBlock(m.s,m.innerD,n.backD,m.slabBottom,m.crest-.08,m.crest-.08,a,b));
   geos.push(curvedBlock(m.s,n.backD,m.innerD+m.wall,m.slabBottom,n.bottom,n.bottom,a,b));
   for(let i=0;i<16;i++){const u0=a+(b-a)*i/16,u1=a+(b-a)*(i+1)/16,top=n.spring+Math.sqrt(Math.max(0,n.half*n.half-((u0+u1)/2-n.u)**2));geos.push(curvedBlock(m.s,n.backD,m.innerD+m.wall,top,m.crest-.08,m.crest-.08,u0,u1));}
   const recess=mesh(merge(geos),mainConcrete);recess.name='Fosa · hueco bajo con cierre interior propuesto';recess.userData.moat=m.id;blocks.push(recess);
  }else channelBlock(m,m.innerD,m.innerD+m.wall,m.slabBottom,m.crest);
  channelBlock(m,m.outerD-m.wall,m.outerD,m.slabBottom,m.crest);
  for(const u of[m.start,m.end-m.wall])channelBlock(m,m.innerD,m.outerD,m.slabBottom,m.crest,u,u+m.wall);
  if(m.s.id==='main'){
   channelBlock(m,m.innerD,m.innerD+m.wall,m.crest-.08,m.crest,m.start,m.end,coping);
   channelBlock(m,m.outerD-m.wall,m.outerD,m.crest-.08,m.crest,m.start,m.end,coping);
   for(const u of[m.start,m.end-m.wall])channelBlock(m,m.innerD+m.wall,m.outerD-m.wall,m.crest-.08,m.crest,u,u+m.wall,coping);
  }
  for(let u=m.start+.15;u<m.end-.2;u+=2){const end=Math.min(u+1.96,m.end-.15),top=Math.min(m.crest-.02,m.water+.08+.02*Math.sin(u*2.17));
   const n=fieldAccess.niche,wetParts=m.id==='main-norte'&&u<n.u+n.half&&end>n.u-n.half?[[u,Math.min(end,n.u-n.half)],[Math.max(u,n.u+n.half),end]]:[[u,end]];
   for(const[a,b]of wetParts)if(b>a)channelBlock(m,m.innerD+m.wall,m.innerD+m.wall+.007,m.bottom,top,a,b,damp);
   channelBlock(m,m.outerD-m.wall-.007,m.outerD-m.wall,m.bottom,top,u,end,damp);
  }
  for(let u=m.start+.3;u<m.end;u+=3){if(m.bridge&&Math.abs(u)<2.2)continue;for(const d of[m.innerD+.075,m.outerD-.075]){const[x,z]=world(m.s,u,d);box(x,.105,z,.014,.007,.14,iron,m.s.angle);}}
 }
 const wetMesh=mesh(merge(wetGeometry),damp);wetMesh.name='Fosas · bandas de humedad';blocks.push(wetMesh);
 const bridge=null,ramps=[]; // Main channels terminate at the dry player enclosure.

 // Locally generated tileable normal map: original resource, no network fetch.
 const n=128,normalData=new Uint8Array(n*n*4);for(let y=0;y<n;y++)for(let x=0;x<n;x++){const i=(y*n+x)*4,a=2*Math.PI*x/n,b=2*Math.PI*y/n;normalData[i]=128+Math.round(19*Math.cos(a*3+b*2)+8*Math.sin(a-b*4));normalData[i+1]=128+Math.round(14*Math.cos(b*3-a*2));normalData[i+2]=253;normalData[i+3]=255;}
 const waterNormal=new T.DataTexture(normalData,n,n);waterNormal.wrapS=waterNormal.wrapT=T.RepeatWrapping;waterNormal.generateMipmaps=true;waterNormal.minFilter=T.LinearMipmapLinearFilter;waterNormal.magFilter=T.LinearFilter;waterNormal.needsUpdate=true;
 const waterMat=new T.MeshPhysicalMaterial({color:0x48685c,roughness:.37,metalness:0,clearcoat:.25,clearcoatRoughness:.32,normalMap:waterNormal,normalScale:new T.Vector2(.2,.2),transparent:true,opacity:.76,envMapIntensity:.75,depthWrite:false});
 const time={value:0};waterMat.customProgramCacheKey=()=> 'moat-water-v6';
 waterMat.onBeforeCompile=shader=>{
  shader.uniforms.waterTime=time;
  shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nuniform float waterTime; attribute float kAcross; varying float vAcross;');
  shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvAcross=kAcross;transformed.y+=.005*sin(position.z*2.1+waterTime*.55)+.003*sin(position.x*4.2-position.z*.8+waterTime*.37);');
  shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying float vAcross;');
  shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
   float kDeep=smoothstep(0.,.30,min(vAcross,1.-vAcross));
   diffuseColor.rgb*=mix(1.10,.86,kDeep);`);
  shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',`diffuseColor.a=clamp(.58+.16*kDeep+.16*pow(1.-abs(dot(normalize(vViewPosition),normal)),3.),.58,.90);
   #include <opaque_fragment>`);
 };
 const waters=[];
 for(const m of moats){const waterGeometry=new T.PlaneGeometry(1,1,6,Math.ceil((m.end-m.start)*2)),wp=waterGeometry.attributes.position,uv=waterGeometry.attributes.uv;
  const across=new Float32Array(wp.count);for(let i=0;i<wp.count;i++){across[i]=uv.getX(i);const u=m.start+m.wall+.012+uv.getY(i)*(m.end-m.start-2*m.wall-.024),d=m.innerD+m.wall+.012+uv.getX(i)*(m.outerD-m.innerD-2*m.wall-.024),[x,z]=world(m.s,u,d);wp.setXYZ(i,x,m.water,z);uv.setXY(i,x/1.4,z/1.4);}
  waterGeometry.setAttribute('kAcross',new T.BufferAttribute(across,1));const wi=waterGeometry.index;for(let i=0;i<wi.count;i+=3){const b=wi.getX(i+1);wi.setX(i+1,wi.getX(i+2));wi.setX(i+2,b);}waterGeometry.computeVertexNormals();const water=mesh(waterGeometry,waterMat,false);water.name='Agua '+m.id+' · nivel propuesto';water.renderOrder=0;water.userData.maxWaveHeight=.008;water.userData.moat=m.id;waters.push(water);
 }
 const water=waters[0];

 // A transparent chain-link tile is the distant LOD; close wires are real cylinders.
 const mask=new Uint8Array(128*128*4);for(let y=0;y<128;y++)for(let x=0;x<128;x++){const i=(y*128+x)*4,d1=Math.abs(((x+y)%128)-64),d2=Math.abs(((x-y+128)%128)-64),edge=Math.min(d1,d2);mask[i]=125;mask[i+1]=143;mask[i+2]=145;mask[i+3]=edge<2?255:edge<3?110:0;}
 const wireTile=new T.DataTexture(mask,128,128);wireTile.wrapS=wireTile.wrapT=T.RepeatWrapping;wireTile.colorSpace=T.SRGBColorSpace;wireTile.generateMipmaps=true;wireTile.minFilter=T.LinearMipmapLinearFilter;wireTile.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());wireTile.needsUpdate=true;
 const wireMat=new T.MeshStandardMaterial({color:0xb0c1bf,roughness:.55,metalness:.72});
 const distantMat=new T.MeshStandardMaterial({map:wireTile,roughness:.68,metalness:.45,side:T.DoubleSide,transparent:true,opacity:.75,depthWrite:false,alphaTest:.003,forceSinglePass:true});
 const wireGeo=new T.CylinderGeometry(.0025,.0025,1,4),up=new T.Vector3(0,1,0),dummy=new T.Object3D(),lod=[];
 function wirePanel(a,b,bottom,top){
  const width=Math.hypot(b[0]-a[0],b[1]-a[1]),height=top-bottom,dx=(b[0]-a[0])/width,dz=(b[1]-a[1])/width;
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute([a[0],bottom,a[1],b[0],bottom,b[1],b[0],top,b[1],a[0],top,a[1]],3));g.setAttribute('uv',new T.Float32BufferAttribute([0,0,width/.14,0,width/.14,height/.14,0,height/.14],2));g.setIndex([0,1,2,0,2,3]);g.computeVertexNormals();
  const flat=mesh(g,distantMat,false);flat.name='Alambrado · LOD';
  const lines=[];for(const slope of[-1,1])for(let c=-height-width;c<height+width;c+=.14){const points=[];for(const x of[0,width]){const y=slope*x+c;if(y>=0&&y<=height)points.push([x,y]);}for(const y of[0,height]){const x=(y-c)/slope;if(x>0&&x<width)points.push([x,y]);}if(points.length>=2)lines.push(points.slice(0,2));}
  const near=new T.InstancedMesh(wireGeo,wireMat,lines.length);lines.forEach(([p,q],i)=>{const v=new T.Vector3(a[0]+p[0]*dx,p[1]+bottom,a[1]+p[0]*dz),w=new T.Vector3(a[0]+q[0]*dx,q[1]+bottom,a[1]+q[0]*dz),delta=w.clone().sub(v);dummy.position.copy(v.add(w).multiplyScalar(.5));dummy.scale.set(1,delta.length(),1);dummy.quaternion.setFromUnitVectors(up,delta.normalize());dummy.updateMatrix();near.setMatrixAt(i,dummy.matrix);});near.instanceMatrix.needsUpdate=true;near.computeBoundingSphere();near.receiveShadow=true;near.castShadow=false;near.visible=false;near.name='Alambrado · hilos tridimensionales';scene.add(near);lod.push({near,flat,center:new T.Vector3((a[0]+b[0])/2,1,(a[1]+b[1])/2)});
 }
 const postKeys=new Set();
 for(const s of boundarySegments){const[a,b]=[s.a,s.b],height=s.height,rail=s.type==='rail',bar=s.type==='bars';
  if(s.id==='main'){
   const length=Math.hypot(b[0]-a[0],b[1]-a[1]),angle=-Math.atan2(b[1]-a[1],b[0]-a[0]),isMesh=s.type==='mesh',guard=s.type==='guard',service=s.type==='service';
   const barBox=(y,h,t,mat)=>box((a[0]+b[0])/2,y,(a[1]+b[1])/2,length,h,t,mat,angle);
   for(const p of[a,b]){const key=p.map(v=>v.toFixed(4)).join(',')+(s.type==='service'?'bars':s.type);if(postKeys.has(key))continue;postKeys.add(key);
    box(p[0],height/2,p[1],isMesh?.14:.065,height,isMesh?.14:.065,isMesh?mainConcrete:photoTeal);
    box(p[0],.025,p[1],.14,.05,.14,isMesh?mainConcrete:photoTeal);
    if(isMesh){beam([p[0],height,p[1]],[p[0]+.27,height+.34,p[1]],.033,mats.dark);}
   }
   if(service){barBox(height+.12,.065,.07,photoTeal);for(const y of[.35,1.8])box(a[0],y,a[1],.10,.12,.10,iron);continue;}
   if(rail){for(const y of[.14,.46,.78,1.10])barBox(y,.055,.05,photoTeal);}
   else if(isMesh){
    wirePanel(a,b,.18,height-.03);
    for(const y of[.2,height-.04])barBox(y,.025,.025,iron);
    for(const t of[0,.5,1])beam([a[0]+.27*t,height+.34*t,a[1]],[b[0]+.27*t,height+.34*t,b[1]],.004,iron);
   }else{
    if(!guard)barBox(.35,.70,.10,coping);
    for(const y of guard?[.30,height]:[.74,1.55,height-.09])barBox(y,.035,.035,photoTeal);
    const count=Math.ceil(length/.145),bottom=guard?.30:.70;
    for(let i=1;i<count;i++){const t=i/count;beam([a[0]+(b[0]-a[0])*t,bottom,a[1]+(b[1]-a[1])*t],[a[0]+(b[0]-a[0])*t,height+(guard?0:.14),a[1]+(b[1]-a[1])*t],.009,photoTeal);}
   }
   continue;
  }
  for(const p of[a,b]){const key=p.map(v=>v.toFixed(4)).join(',')+(s.type==='service'?'bars':s.type);if(postKeys.has(key))continue;postKeys.add(key);const radius=rail?.027:bar?.042:.044;beam([p[0],0,p[1]],[p[0],height+.06,p[1]],radius,rail?teal:bar?iron:mats.wall);box(p[0],.035,p[1],.17,.07,.17,concrete);box(p[0],height+.075,p[1],.11,.04,.11,rail?teal:iron);}
  for(const y of rail?[.12,.62,height]:bar?[.66,height]:[.22,1.2,height])beam([a[0],y,a[1]],[b[0],y,b[1]],rail?.022:.023,rail?teal:iron);
  if(rail)continue;
  const length=Math.hypot(b[0]-a[0],b[1]-a[1]),count=Math.ceil(length/.12),angle=-Math.atan2(b[1]-a[1],b[0]-a[0]);
  box((a[0]+b[0])/2,bar?.33:.12,(a[1]+b[1])/2,length,bar?.66:.24,.09,bar?teal:mats.wall,angle);
  if(bar){for(let i=1;i<count;i++){const t=i/count,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;beam([x,.67,z],[x,height,z],.009,iron);}}
  else{wirePanel(a,b,.26,height-.025);const dx=(b[0]-a[0])/length,dz=(b[1]-a[1])/length;for(const h of[.3,height-.15]){beam([a[0]+dx*.09,h,a[1]+dz*.09],[a[0]+dx*.30,h,a[1]+dz*.30],.028,iron);}}
 }
 // Independent hinged leaves; static fence panels stop at their actual jambs.
 const leaf=new T.Group();leaf.name='Portón bajo de jugadores · hoja móvil';leaf.userData.dynamicTransform=true;scene.add(leaf);
 const parts=[];
 for(const x of[0,gate.width])parts.push({x,y:.54,w:.06,h:1.08,d:.06});
 for(const y of[.12,gate.height])parts.push({x:gate.width/2,y,w:gate.width,h:.05,d:.05});
 for(let x=.15;x<gate.width;x+=.15)parts.push({x,y:.6,w:.018,h:.92,d:.018});
 const pieces=parts.map(p=>{const g=new T.BoxGeometry(p.w,p.h,p.d);g.translate(p.x,p.y,0);return g;});
 const o=new T.Mesh(merge(pieces),photoTeal);o.castShadow=true;leaf.add(o);
 for(const x of[gate.x,gate.x+gate.width])box(x,.56,gate.z,.065,1.12,.065,photoTeal);
 const latch=new T.Mesh(new T.BoxGeometry(.12,.08,.09),iron);latch.position.set(gate.width-.13,.96,-.05);leaf.add(latch);
 const serviceLeaf=new T.Group();serviceLeaf.name='Puerta de reja alta · hoja móvil';serviceLeaf.userData.dynamicTransform=true;scene.add(serviceLeaf);
 const sg=serviceGate,sgParts=[];
 const sgBox=(x,y,w,h,d=.035)=>{const g=new T.BoxGeometry(w,h,d);g.translate(x,y,0);sgParts.push(g);};
 for(const x of[.045,sg.width-.045])sgBox(x,sg.height/2,.035,sg.height-.07);
 for(const y of[.10,1.05,sg.height-.045])sgBox(sg.width/2,y,sg.width-.065,.035);
 for(let x=.16;x<sg.width-.1;x+=.14)sgBox(x,sg.height/2,.018,sg.height-.14,.018);
 const sgMesh=new T.Mesh(merge(sgParts),photoTeal);sgMesh.castShadow=true;sgMesh.receiveShadow=true;serviceLeaf.add(sgMesh);
 const sgLatch=new T.Mesh(new T.BoxGeometry(.12,.07,.095),iron);sgLatch.position.set(sg.width-.13,1.02,.035);serviceLeaf.add(sgLatch);
 for(const y of[.35,1.8]){const pin=new T.Mesh(new T.CylinderGeometry(.025,.025,.13,8),iron);pin.position.set(.025,y,0);serviceLeaf.add(pin);}
 // Low access lamps support the emissive strips without bleaching the field.
 const lampMat=new T.MeshStandardMaterial({color:0xe4e5d6,emissive:0xffdb9f,emissiveIntensity:0,roughness:.6});
 const accessLights=[];for(const [u,d]of[[8.9,-2.0],[12.85,-7.95]]){const p=at(u,d,.10);box(p[0],p[1],p[2],.12,.07,.28,lampMat);const light=new T.PointLight(0xffd4a0,0,6,2);light.position.set(p[0],.25,p[2]);scene.add(light);accessLights.push(light);}
 // Proposed sector labels and drainage grilles on the public side of the channel.
 // Sector plaques and flush grates are assembled once in close-details.js.
 function sync(){leaf.position.set(gate.x,0,gate.z);leaf.rotation.y=-gate.swing*gateState.progress*Math.PI/2;leaf.updateMatrix();serviceLeaf.position.set(serviceGate.x,0,serviceGate.z);serviceLeaf.rotation.y=-(serviceGate.angle+serviceGateState.progress*Math.PI/2);serviceLeaf.updateMatrix();field.update();}
 sync();const visibleGateProgress=()=>Math.atan2(-leaf.matrix.elements[2],leaf.matrix.elements[0])/(Math.PI/2);const visibleServiceProgress=()=> (Math.atan2(serviceLeaf.matrix.elements[2],serviceLeaf.matrix.elements[0])-serviceGate.angle)/(Math.PI/2);return{visibleGateProgress,visibleServiceProgress,field,water,waters,waterMat,waterNormal,wireTile,leaf,serviceLeaf,bridge,ramps,blocks,lod,accessLights,
  update(elapsed,camera,quality){time.value=elapsed;waterNormal.offset.set(elapsed*.004,elapsed*.0015);sync();const range=quality==='high'?14:quality==='medium'?9:5;for(const l of lod){const near=camera.position.distanceTo(l.center)<range+(l.near.visible?1.5:0);l.near.visible=near;l.flat.visible=!near;}},
  setNight(night){lampMat.emissiveIntensity=night?.6:0;accessLights.forEach(l=>l.intensity=night?9:0);}
 };
}
