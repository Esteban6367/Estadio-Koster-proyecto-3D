import {flightStep} from './stadium-layout.js';
import {publicGradeCuts,inPublicRoofSlot} from './public-layout.js';
import {addCdmVolume} from './cdm-detail.js';
import {addCloseDetails} from './close-details.js';
import {indexGeometry} from './index-geometry.js';
import * as T from './three.module.min.js';
import {stands,world,floorHeight,bend,supportUs,surfaceHeight,inRearAccess} from './physics.js';
import {flights,galleries,solidRanges,cabin,cabinAt} from './stadium-layout.js';
import {siteBounds,walkwayPosts} from './surroundings.js';
import {addNeighborhood} from './neighborhood.js';
import {addStandDetails} from './architecture.js';
import {configureSurface} from './material-detail.js';
import {trackShape,pathHole} from './ground-surfaces.js';
import {addFloodlightBank} from './floodlights.js';
import {addExteriorLighting} from './exterior-lighting.js';
import {addBoundaries,groundWithMoat} from './boundary-model.js';
import {hollowRanges,stairSoffit} from './interior-layout.js';
import {addPlayerFacilities} from './interior-model.js';
import {screenLayout,screenPosition,screenPosts} from './screen-layout.js';
import {addPrincipalEntrance} from './entrance-model.js';
import {entryHalf} from './entrance-layout.js';
export async function buildModel(scene,renderer,progress){
 const manager=new T.LoadingManager();const failures=[];manager.onError=u=>failures.push(u);const loader=new T.TextureLoader(manager);
 const mats={},pbr={},architecturalLights=[],accentMaterials=[],standLights=[],standEmitters=[],architectureDetails=[];let loaded=0;
 for(const [name,size]of[['concrete',3],['grass',2],['track',2],['paving',4],['metal',4]]){
  let maps=await Promise.all(['','-normal','-rough'].map(s=>loader.loadAsync('./textures/'+name+s+'.jpg')));maps.forEach((m,i)=>{m.wrapS=m.wrapT=T.RepeatWrapping;m.colorSpace=i===0?T.SRGBColorSpace:T.NoColorSpace;m.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());});
  const m=new T.MeshStandardMaterial({map:maps[0],normalMap:maps[1],roughnessMap:maps[2],normalScale:new T.Vector2(name==='grass'?.22:.22,name==='grass'?.22:.22),roughness:name==='metal'?.85:1,metalness:name==='metal'?.75:0});m.userData.tile=size;m.userData.surface=name;pbr[name]=m;progress(++loaded/5*.3);
 }
 const std=(color,roughness=.7,metalness=0)=>new T.MeshStandardMaterial({color,roughness,metalness});
 Object.assign(mats,pbr,{white:std(0xf1f3ed,.6),blue:std(0x175d96,.38),seatBlue:std(0x197eaf,.46),seatWhite:std(0xdde3df,.5),steel:std(0x9caeb7,.48,.8),dark:std(0x233340,.6,.45),yellow:std(0xd6bc62,.65),wall:std(0xd1d8d8,.9),glass:new T.MeshPhysicalMaterial({color:0x45647b,roughness:.16,metalness:.28,clearcoat:1,envMapIntensity:1.2}),net:std(0xc7d0d1,.95),trunk:std(0x605744,1),leaf:std(0x537651,1),leaf2:std(0x69845c,1)});
 // Shared maps retain bounded texture residency. Galvanized steel and painted seats differ.
 mats.steel.normalMap=pbr.concrete.normalMap;mats.steel.normalScale=new T.Vector2(.035,.035);mats.steel.roughnessMap=pbr.metal.roughnessMap;
 for(const m of[mats.seatBlue,mats.seatWhite]){m.roughnessMap=pbr.metal.roughnessMap;m.roughness=.64;}
 const signCache=new Map(),groups=new Map(),unitBox=new T.BoxGeometry(1,1,1),unitPipe=new T.CylinderGeometry(1,1,1,8),dummy=new T.Object3D(),up=new T.Vector3(0,1,0),tmp=new T.Vector3();
 let scope='',detail='';const setScope=(value,level='')=>{scope=value;detail=level;};
 let gid=0;function batch(geometry,material,pos,scale=[1,1,1],rotation=0,quaternion,bucket=''){const cell=scope==='city'?Math.floor(pos[0]/96)+','+Math.floor(pos[2]/96):'';const key=geometry.uuid+material.uuid+bucket+scope+detail+cell;if(!groups.has(key))groups.set(key,{geometry,material,matrices:[],scope,detail});dummy.position.set(...pos);dummy.scale.set(...scale);dummy.rotation.set(0,rotation,0);if(quaternion)dummy.quaternion.copy(quaternion);dummy.updateMatrix();groups.get(key).matrices.push(dummy.matrix.clone());}
 const box=(x,y,z,w,h,d,mat,angle=0)=>batch(unitBox,mat,[x,y,z],[w,h,d],angle);
 function beam(a,b,r,mat){const va=new T.Vector3(...a),vb=new T.Vector3(...b),delta=vb.clone().sub(va),q=new T.Quaternion().setFromUnitVectors(up,delta.clone().normalize());batch(unitPipe,mat,va.add(vb).multiplyScalar(.5).toArray(),[r,delta.length(),r],0,q);}
 function mesh(g,m,shadows=true){const o=new T.Mesh(g,m);o.castShadow=shadows;o.receiveShadow=true;scene.add(o);return o;}
 function plane(x,z,w,d,m,y=.01){const g=new T.PlaneGeometry(w,d);g.rotateX(-Math.PI/2);const uv=g.attributes.uv;const tile=m.userData.tile||1;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*w/tile,uv.getY(i)*d/tile);let o=mesh(g,m,false);o.position.set(x,y,z);return o;}
 function curvePath(rx,rz,r){const shape=new T.Shape();shape.moveTo(-rx+r,-rz);shape.lineTo(rx-r,-rz);shape.absarc(rx-r,-rz+r,r,-Math.PI/2,0);shape.lineTo(rx,rz-r);shape.absarc(rx-r,rz-r,r,0,Math.PI/2);shape.lineTo(-rx+r,rz);shape.absarc(-rx+r,rz-r,r,Math.PI/2,Math.PI);shape.lineTo(-rx,-rz+r);shape.absarc(-rx+r,-rz+r,r,Math.PI,Math.PI*1.5);return shape;}
 function surface(shape,mat,y){const g=new T.ShapeGeometry(shape,28);g.rotateX(-Math.PI/2);const p=g.attributes.position,uv=g.attributes.uv;for(let i=0;i<p.count;i++)uv.setXY(i,p.getX(i)/(mat.userData.tile||1),p.getZ(i)/(mat.userData.tile||1));const m=mesh(g,mat,false);m.position.y=y;return m;}
 function strip(points,y,width,mat,closed=false){let p=[],uv=[],idx=[];for(let i=0;i<points.length;i++){const a=points[Math.max(i-1,0)],b=points[Math.min(i+1,points.length-1)],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1;for(const sign of[-1,1]){p.push(points[i][0]+sign*dz/l*width/2,y,points[i][1]-sign*dx/l*width/2);uv.push(i,sign);}}for(let i=0;i<points.length-1;i++){const a=i*2;idx.push(a,a+2,a+1,a+1,a+2,a+3);}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();let o=mesh(g,mat,false);o.material.side=T.DoubleSide;return o;}
 const roofBlue=new T.MeshStandardMaterial({color:0x4395d0,emissive:0x3e92ec,emissiveIntensity:0,roughness:.35}),roofWhite=new T.MeshStandardMaterial({color:0xddeaff,emissive:0xd1e8ff,emissiveIntensity:0,roughness:.4});accentMaterials.push(roofBlue,roofWhite);
 mats.yellow.color.setHex(0xa99246);mats.yellow.roughness=1;mats.yellow.metalness=0;mats.yellow.roughnessMap=pbr.concrete.roughnessMap;
 const paint=mats.white.clone();paint.polygonOffset=true;paint.polygonOffsetFactor=-1;paint.polygonOffsetUnits=-4;paint.roughness=.95;
 const terrainPlane=(x,z,w,d,m,y)=>groundWithMoat(x,z,w,d,m,y,mesh);
 const grassBase=mats.grass.clone();grassBase.color.setHex(0x82947a);terrainPlane(2,0,220,240,grassBase,-.15);terrainPlane(2,0,212,236,mats.paving,-.035);
 const edge=trackShape(51,72,25);edge.holes.push(pathHole(trackShape(50,71,24)));surface(edge,mats.concrete,.002).name='Borde de pista · anillo';
 const track=trackShape(50,71,24);track.holes.push(pathHole(trackShape(40.24,61.24,14.24)));surface(track,mats.track,.013).name='Pista · anillo sin suelo bajo el campo';
 const infield=trackShape(40.24,61.24,14.24);const pitchHole=new T.Path();pitchHole.moveTo(-34,-52.5);pitchHole.lineTo(-34,52.5);pitchHole.lineTo(34,52.5);pitchHole.lineTo(34,-52.5);pitchHole.closePath();infield.holes.push(pitchHole);surface(infield,mats.grass,.023).name='Césped exterior al campo';
 for(let i=0;i<=8;i++){const r=14.24+i*1.22;const pts=curvePath(40.24+i*1.22,61.24+i*1.22,r).getPoints(28).map(v=>[v.x,-v.y]);strip(pts,.035,.085,paint);}
 const drains=curvePath(50.6,71.6,24.6).getPoints(100).map(v=>[v.x,-v.y]);strip(drains,.022,.25,mats.dark);for(let i=0;i<drains.length-1;i+=2){const a=drains[i],b=drains[i+1],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1;beam([a[0]-dz/l*.14,.035,a[1]+dx/l*.14],[a[0]+dz/l*.14,.035,a[1]-dx/l*.14],.016,mats.steel);}
 for(let i=0;i<14;i++){const mat=mats.grass.clone();mat.color.setHex(i%2?0xeff5e8:0xf9fcf3);mat.userData.pitchMarkings=true;plane(0,-52.5+(i+.5)*7.5,68,7.5,mat,.038);}
 const nets=new T.Group();scene.add(nets);
 for(const sign of[-1,1]){const z=sign*52.5;
 for(const x of[-3.66,3.66]){beam([x,0,z],[x,2.44,z],.06,mats.white);beam([x,2.44,z],[x,2.1,z+sign*2],.035,mats.white);beam([x,0,z+sign*2],[x,2.1,z+sign*2],.035,mats.white);}beam([-3.66,2.44,z],[3.66,2.44,z],.06,mats.white);
 const positions=[];const netline=(a,b)=>positions.push(...a,...b);
 for(let x=-3.66;x<=3.67;x+=.2){netline([x,0,z+sign*2],[x,2.1,z+sign*2]);netline([x,2.1,z+sign*2],[x,2.44,z]);}for(let y=0;y<=2.11;y+=.2)netline([-3.66,y,z+sign*2],[3.66,y,z+sign*2]);for(const x of[-3.66,3.66])for(let d=0;d<=2;d+=.2)netline([x,0,z+sign*d],[x,2.44-d*.17,z+sign*d]);for(const x of[-3.66,3.66])for(let y=.2;y<2.1;y+=.2)netline([x,y,z],[x,y,z+sign*2]);for(let d=.2;d<2;d+=.2)netline([-3.66,2.44-d*.17,z+sign*d],[3.66,2.44-d*.17,z+sign*d]);const ng=new T.BufferGeometry();ng.setAttribute('position',new T.Float32BufferAttribute(positions,3));nets.add(new T.LineSegments(ng,new T.LineBasicMaterial({color:0xd0dbde,transparent:true,opacity:.64})));
 for(const x of[-34,34]){beam([x,0,z],[x,1.5,z],.024,mats.white);box(x+.17,1.33,z,.34,.25,.02,mats.yellow);}
 }
 // Shaped seat: bevelled moulded shell with a curved, slightly reclining back.
 const shape=new T.Shape();shape.moveTo(-.19,-.2);shape.lineTo(.19,-.2);shape.quadraticCurveTo(.25,-.2,.25,-.14);shape.lineTo(.25,.14);shape.quadraticCurveTo(.25,.23,.16,.23);shape.lineTo(-.16,.23);shape.quadraticCurveTo(-.25,.23,-.25,.14);shape.lineTo(-.25,-.14);shape.quadraticCurveTo(-.25,-.2,-.19,-.2);
 const shell=new T.ExtrudeGeometry(shape,{depth:.045,bevelEnabled:true,bevelSize:.012,bevelThickness:.01,bevelSegments:2,steps:1,curveSegments:3});
 const bottom=shell.clone();bottom.rotateX(-Math.PI/2);bottom.translate(0,.39,-.05);const back=shell.clone();back.scale(1,.78,1);back.rotateX(-.15);back.translate(0,.57,-.24);const lowBack=shell.clone();lowBack.scale(1,.4,1);lowBack.rotateX(-.2);lowBack.translate(0,.46,-.24);
 function merge(geometries){let ps=[],ns=[],uvs=[];for(let g of geometries){if(g.index)g=g.toNonIndexed();ps.push(...g.attributes.position.array);ns.push(...g.attributes.normal.array);if(g.attributes.uv)uvs.push(...g.attributes.uv.array);}const out=new T.BufferGeometry();out.setAttribute('position',new T.Float32BufferAttribute(ps,3));out.setAttribute('normal',new T.Float32BufferAttribute(ns,3));if(uvs.length===ps.length/3*2)out.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));return out;}
 for(const g of[bottom,back,lowBack]){const a=g.attributes.position;for(let i=0;i<a.count;i++){const x=a.getX(i);if(g===bottom)a.setY(i,a.getY(i)+.022*(x*x/.0625+Math.pow((a.getZ(i)+.05)/.24,2)));else a.setZ(i,a.getZ(i)-.025*x*x/.0625);}g.computeVertexNormals();}
 const seatGeo=merge([bottom,back]),lowBackGeo=merge([bottom,lowBack]);const detailMeshes=[],roofs=[],roofMats=[];
 const footStem=new T.BoxGeometry(.075,.37,.3);footStem.translate(0,.185,-.065);const footPlate=new T.BoxGeometry(.22,.035,.34);footPlate.translate(0,.018,-.065);const seatFeet=merge([footStem,footPlate]);
 const contactData=new Uint8Array(64*64*4);for(let y=0;y<64;y++)for(let x=0;x<64;x++){const i=(y*64+x)*4,r=((x-31.5)/27)**2+((y-31.5)/24)**2;contactData[i+3]=Math.round(Math.exp(-r*2.7)*76);}
 const contactTx=new T.DataTexture(contactData,64,64);contactTx.needsUpdate=true;contactTx.minFilter=T.LinearFilter;contactTx.magFilter=T.LinearFilter;
 const contactMat=new T.MeshBasicMaterial({map:contactTx,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1});
 const contactGeo=new T.PlaneGeometry(.8,.65);contactGeo.rotateX(-Math.PI/2);contactGeo.translate(0,.025,-.06);
 function curvedBlock(s,d0,d1,bottomY,top0,top1,u0=-s.length/2,u1=s.length/2){const positions=[],uvs=[];const segments=Math.max(1,Math.ceil((u1-u0)/2));const put=(a,b,c)=>{for(const p of[a,b,c]){positions.push(...p);const n=new T.Vector3().subVectors(new T.Vector3(...b),new T.Vector3(...a)).cross(new T.Vector3().subVectors(new T.Vector3(...c),new T.Vector3(...a)));const ax=Math.abs(n.x),ay=Math.abs(n.y),az=Math.abs(n.z);if(ay>=ax&&ay>=az)uvs.push(p[0]/3,p[2]/3);else if(ax>=az)uvs.push(p[2]/3,p[1]/3);else uvs.push(p[0]/3,p[1]/3);}};const q=(a,b,c,d)=>{put(a,b,c);put(a,c,d);};for(let i=0;i<segments;i++){const u=u0+(u1-u0)*i/segments,v=u0+(u1-u0)*(i+1)/segments;const pt=(u,d,y)=>{const[x,z]=world(s,u,d);return[x,y,z];};const a=pt(u,d0,top0),b=pt(v,d0,top0),c=pt(v,d1,top1),d=pt(u,d1,top1),e=pt(u,d0,bottomY),f=pt(v,d0,bottomY),g=pt(v,d1,bottomY),h=pt(u,d1,bottomY);q(a,b,c,d);q(e,f,b,a);q(d,c,g,h);if(i===0)q(e,a,d,h);if(i===segments-1)q(b,f,g,c);q(h,g,f,e);}const out=new T.BufferGeometry();out.setAttribute('position',new T.Float32BufferAttribute(positions,3));out.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));out.computeVertexNormals();return out;}
 function standBlock(out,s,d0,d1,h,u0,u1){for(const r of s.id==='main'?hollowRanges(u0,u1,d0,d1):[{a:u0,b:u1,hollow:false}]){const bottom=s.id==='main'&&d0>=10.5?h-.22:r.hollow?Math.min(h-.22,d0<12.5?stairSoffit(d1):d0>=14.8?3.28:3.0):-.01;out.push(curvedBlock(s,d0,d1,bottom,h,h,r.a,r.b));}}
 for(const s of stands){setScope(s.id);const pt=(u,d,y)=>{const[x,z]=world(s,u,d);return[x,y,z];};const concrete=[],yellowGeo=[];
 // Four galleries separate the retained tiers and the new third tier.
 for(const[d0,d1]of galleries(s).flatMap(v=>s.id==='main'&&v[0]===10.5?[[10.5,12.5],[12.5,14]]:[v])){const h=floorHeight(s,d0);for(const[a,b]of solidRanges(s,d0))standBlock(concrete,s,d0,d1,h,a,b);
  if(d0>=s.baseDepth-2&&s.id!=='main'){const w=s.id==='main'?entryHalf(d0):1.7;concrete.push(curvedBlock(s,d0,d1,h-.22,h,h,s.accessU-w,s.accessU+w));}
 }
 for(const[a,b]of flights(s))for(let d=a;d<b-.01;d+=flightStep(s,a)){const end=Math.min(d+flightStep(s,a),b),h=floorHeight(s,end);const parts=s.id==='main'&&d<8.5&&end>8.5?[[d,8.5],[8.5,end]]:[[d,end]];for(const[da,db]of parts)for(const[u0,u1]of solidRanges(s,da))standBlock(concrete,s,da,db,h,u0,u1);}
 const stepsMesh=mesh(merge(concrete),mats.concrete);stepsMesh.name='Gradas · '+s.id;stepsMesh.userData.walkingSurface=true;
 for(const[a,b]of flights(s))for(let d=a+2*flightStep(s,a);d<=b+.001;d+=2*flightStep(s,a)){const y=floorHeight(s,d);for(let u=-s.length/2+1.8;u<s.length/2-1.8;u+=.68){if((s.id==='main'&&d<8.5&&Math.abs((u-8.5)-Math.round((u-8.5)/17)*17)<.55)||Math.abs(u-Math.round(u/17)*17)<1.8||(s.id==='north'&&Math.abs(u)<5.6&&d>7)||(s.id==='main'?publicGradeCuts(d).some(([a,b])=>u>a&&u<b):inRearAccess(s,u,d))||(s.id==='main'&&Math.abs(u)<4.4&&d>cabin.front-.5&&d<cabin.back+.65))continue;const angle=s.angle-Math.atan(-2*s.curve*u/(s.length/2)**2);const p=pt(u,d-.3,y);const white=s.id==='main'&&d>12.5?[1,3,5].includes(Math.floor((u+s.length/2)/17)):(Math.floor((u+s.length/2)/3)+Math.round(d))%6<2;batch(s.id==='main'&&d<10.5?lowBackGeo:seatGeo,white?mats.seatWhite:mats.seatBlue,p,[1,1,1],angle,undefined,s.id+':'+Math.floor((u+s.length/2)/17));batch(seatFeet,mats.dark,p,[1,1,1],angle,undefined,s.id+':'+Math.floor((u+s.length/2)/17));batch(contactGeo,contactMat,p,[1,1,1],angle,undefined,s.id+':'+Math.floor((u+s.length/2)/17));}}
 for(let u=Math.ceil(-s.length/2/17)*17;u<s.length/2;u+=17){for(const[a,b]of flights(s))for(let d=a;d<b-.01;d+=flightStep(s,a)){if(s.id==='main'?publicGradeCuts(d).some(([a,b])=>u>a&&u<b):inRearAccess(s,u,d))continue;let end=Math.min(d+flightStep(s,a),b),h=floorHeight(s,end);yellowGeo.push(curvedBlock(s,d,Math.min(d+.055,end),h+.002,h+.006,h+.006,u-1.45,u+1.45));}for(const side of[-1,1]){let uu=u+side*1.55;const railH=d=>s.id==='main'?floorHeight(s,d):surfaceHeight(s,uu,d);for(const[a,b]of flights(s)){if(s.id==='main'&&u===0&&a<12.5)continue;for(let d=a+.2;d<(s.id==='main'&&a===2?8.5:b);d+=2)beam(pt(uu,d,railH(d)),pt(uu,d,railH(d)+1.05),.025,mats.steel);beam(pt(uu,a,railH(a)+1.05),pt(uu,s.id==='main'&&a===2?8.5:b,railH(s.id==='main'&&a===2?8.5:b)+1.05),.035,mats.steel);}}}
 mesh(merge(yellowGeo),mats.yellow,false);
 const rearH=floorHeight(s,s.depth),roofFront=rearH+3.8,roofBack=rearH+4.7;
 const roofSlices=[];for(let d=4;d<s.depth+1;){const d1=Math.min(d+.5,s.depth+1,...(s.id==='main'?[8.3,12.8].filter(v=>v>d+.0001):[])),a=roofFront+(roofBack-roofFront)*(d-4)/(s.depth-3)+.22*Math.sin(Math.PI*(d-4)/(s.depth-3)),b=roofFront+(roofBack-roofFront)*(d1-4)/(s.depth-3)+.22*Math.sin(Math.PI*(d1-4)/(s.depth-3));for(const[u0,u1]of s.id==='main'&&d>=8.3&&d<12.8?[[-s.length/2,-51],[51,s.length/2]]:[[-s.length/2,s.length/2]])roofSlices.push(curvedBlock(s,d,d1,a-.14,a,b,u0,u1));d=d1;}const roof=mesh(merge(roofSlices),mats.metal);roofs.push(roof);
 // Hierarchy of columns, upper/lower chords, verticals and alternating open-web braces.
 const roofY=d=>roofFront+(roofBack-roofFront)*(d-4)/(s.depth-3)+.22*Math.sin(Math.PI*(d-4)/(s.depth-3));
 for(const u of supportUs(s)){
  beam(pt(u,4,floorHeight(s,4)),pt(u,4,roofFront-.14),.18,mats.steel);
  beam(pt(u,s.depth-.6,0),pt(u,s.depth-.6,roofY(s.depth-.6)-.14),.22,mats.steel);
  const count=Math.ceil((s.depth-3)/3.5);
  for(let i=0;i<count;i++){const d=4+(s.depth-3)*i/count,e=4+(s.depth-3)*(i+1)/count,topA=roofY(d)-.17,topB=roofY(e)-.17;
   beam(pt(u,d,topA),pt(u,e,topB),.105,mats.steel);
   beam(pt(u,d,topA-1.05),pt(u,e,topB-1.05),.075,mats.steel);
   beam(pt(u,d,topA),pt(u,d,topA-1.05),.045,mats.steel);
   beam(pt(u,d,topA-(i%2?1.05:0)),pt(u,e,topB-(i%2?0:1.05)),.043,mats.steel);
  }
  beam(pt(u,s.depth+1,roofBack-.17),pt(u,s.depth+1,roofBack-1.22),.045,mats.steel);
 }
 for(let u=-s.length/2;u<s.length/2;u+=3){for(const[a,b]of s.id==='main'&&Math.abs(u)<51?[[4,8.3],[12.8,s.depth+1]]:[[4,s.depth+1]])beam(pt(u,a,roofY(a)+.07),pt(u,b,roofY(b)+.07),.035,mats.steel);}
 if(s.id==='main')for(const d of[8.3,12.8]){for(let u=-51;u<51;u+=3)beam(pt(u,d,roofY(d)),pt(Math.min(51,u+3),d,roofY(d)),.095,mats.steel);}
 for(const d of[4,s.depth+1])for(let u=-s.length/2;u<s.length/2;u+=2){const y=d===4?roofFront:roofBack;beam(pt(u,d,y),pt(Math.min(u+2,s.length/2),d,y),.12,mats.blue);}
 // Blue edge profiles and white roof seams reproduce the reference at night.
 for(const d of[4,s.depth+1])for(let u=-s.length/2;u<s.length/2;u+=1.5){const y=(d===4?roofFront:roofBack)+.15;beam(pt(u,d,y),pt(Math.min(u+1.5,s.length/2),d,y),.055,roofBlue);}
 for(const u of supportUs(s)){beam(pt(u,4,roofFront+.16),pt(u,s.depth+1,roofBack+.16),.045,roofWhite);const lightPos=pt(u,s.depth-.15,Math.max(2,rearH-1.7));box(...[lightPos[0],lightPos[1],lightPos[2],.7,.1,.22,roofWhite,s.angle]);}
 if(s.id!=='main')for(let u=-s.length/2+3;u<s.length/2;u+=6){const a=pt(u,s.depth+.5,.12),b=pt(u,s.depth+.65,1.1);beam(a,b,.035,mats.steel);box(b[0],b[1],b[2],.18,.14,.18,roofWhite);}
 const wash=new T.PointLight(0xb7d6ff,0,70,2);const wp=pt(0,s.depth+4,3.7);wash.position.set(...wp);scene.add(wash);architecturalLights.push({light:wash,power:300});
 architectureDetails.push(addStandDetails(scene,s,{box,beam,mesh,merge,curvedBlock,mats,sign,roofFront,roofBack,accentMaterials,standLights,standEmitters}));
 // Back and end guardrails keep visitors on the galleries.
 const rearGuard=s.id==='main'?mats.steel.clone():mats.steel;if(s.id==='main'){rearGuard.color.setHex(0x229daa);rearGuard.metalness=.4;}
 for(let u=-s.length/2;u<s.length/2;u+=2){beam(pt(u,s.depth, rearH),pt(u,s.depth,rearH+1.1),.027,rearGuard);for(const h of[.55,1.1])beam(pt(u,s.depth,rearH+h),pt(Math.min(u+2,s.length/2),s.depth,rearH+h),.032,rearGuard);}
 for(const u of[-s.length/2,s.length/2])for(let d=2;d<s.depth;d+=1.7){beam(pt(u,d,floorHeight(s,d)),pt(u,d,floorHeight(s,d)+1.1),.03,mats.steel);beam(pt(u,d,floorHeight(s,d)+1.1),pt(u,Math.min(d+1.7,s.depth),floorHeight(s,Math.min(d+1.7,s.depth))+1.1),.033,mats.steel);}
 // Pale soffit and blue fascia, understated architectural lighting below.
 if(s.id!=='main')mesh(curvedBlock(s,s.depth-.1,s.depth+.15,rearH-1.4,rearH,rearH),mats.blue);
 progress(.3+(stands.indexOf(s)+1)*.1);
 }
 setScope('main');const publicEntrance=addPrincipalEntrance(scene,{box,beam,mesh,merge,curvedBlock,mats,sign,setScope,standLights,standEmitters});
 setScope('cdm');
 // CDM: distinct exterior volumes and dark ribbed roofs from the reference.
 const cdmRoof=mats.metal.clone();cdmRoof.color.setHex(0x515a62);const cdmWindow=mats.glass.clone();cdmWindow.emissive.setHex(0x6c6552);cdmWindow.emissiveIntensity=0;
 mats.cdmConcrete=mats.concrete.clone();mats.cdmConcrete.color.setHex(0xc4c9c8);mats.cdmConcrete.normalScale.set(.09,.09);
 mats.cdmBlue=mats.metal.clone();mats.cdmBlue.color.setHex(0x1d5680);mats.cdmBlue.metalness=.32;mats.cdmBlue.roughness=.83;
 mats.cdmMid=mats.cdmBlue.clone();mats.cdmMid.color.setHex(0x4386ab);
 const cdmSheet=(x,y,z,w,h,d,mat,tilt)=>{dummy.position.set(x,y,z);dummy.rotation.set(0,0,tilt);const q=dummy.quaternion.clone();batch(unitBox,mat,[x,y,z],[w,h,d],0,q);};
 const gableShape=new T.Shape();gableShape.moveTo(-.5,0);gableShape.lineTo(.5,0);gableShape.lineTo(0,1);gableShape.closePath();
 const gableGeometry=new T.ExtrudeGeometry(gableShape,{depth:1,bevelEnabled:false,steps:1});gableGeometry.translate(0,0,-.5);
 const cdmGable=(x,y,z,w,h,d,mat)=>batch(gableGeometry,mat,[x,y,z],[w,h,d]);
 const envelope=(x,y,z,w,h,d,mat)=>{const g=new T.BoxGeometry(w,h,d,Math.ceil(w/3),Math.ceil(h/2),Math.ceil(d/3));const p=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv,tile=mat.userData.tile||3;for(let i=0;i<p.count;i++)uv.setXY(i,(Math.abs(n.getX(i))>.5?p.getZ(i):p.getX(i))/tile,(Math.abs(n.getY(i))>.5?p.getZ(i):p.getY(i))/tile);const o=mesh(g,mat);o.position.set(x,y,z);o.userData.scope='cdm';o.userData.bakeOccluder=true;o.name='CDM · fachada con iluminación distribuida';};
 for(const v of[{x:81.5,z:-31.5,w:35,d:52,h:11.8},{x:78.5,z:6,w:29,d:23,h:9.2,office:true},{x:95,z:9,w:4,d:17,h:7.1,service:true},{x:81.5,z:42.5,w:25,d:15,h:6.2,service:true}])addCdmVolume(v,{box,envelope,beam,sheet:cdmSheet,gable:cdmGable,mats,roof:cdmRoof,glass:cdmWindow});
 function sign(text,w,h){const key=text+'|'+w+'|'+h;if(!signCache.has(key)){const c=document.createElement('canvas');const short=w<1&&text.length<5;c.width=short?192:w<4?512:1024;c.height=short?128:w<4?64:128;const ctx=c.getContext('2d');ctx.fillStyle='#153f65';ctx.fillRect(0,0,c.width,c.height);ctx.fillStyle='#f0f5f7';ctx.font='bold '+Math.round(c.height*.58)+'px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,c.width/2,c.height*.54,c.width*.94);const tx=new T.CanvasTexture(c);tx.colorSpace=T.SRGBColorSpace;const m=new T.MeshStandardMaterial({map:tx,roughness:.5,emissive:0xffffff,emissiveMap:tx,emissiveIntensity:.08});signCache.set(key,{geometry:new T.PlaneGeometry(w,h),material:m});}const cached=signCache.get(key);return new T.Mesh(cached.geometry,cached.material);}

 const cdmSign=sign('CDM',12,2);cdmSign.position.set(78.5,8,17.68);scene.add(cdmSign);
 box(78.5,7.6,17.57,29,.9,.24,mats.dark);const facadeLight=new T.PointLight(0x7cb5ff,0,35,2);facadeLight.position.set(76,4,23);scene.add(facadeLight);architecturalLights.push({light:facadeLight,power:320});
 for(let x=67;x<91;x+=4){box(x,1.7,17.7,.24,.5,.2,roofBlue);beam([x,0,19.7],[x,1.3,19.7],.03,mats.steel);}
 accentMaterials.push(cdmWindow,cdmSign.material);
 const ks=sign('ESTADIO LUIS KÖSTER',35,2.2);ks.position.set(0,5.1,109.3);scene.add(ks);accentMaterials.push(ks.material);
 box(0,5.1,109.15,35.6,2.5,.3,mats.dark);
 for(const x of[-16,16])beam([x,0,109.15],[x,6.4,109.15],.08,mats.steel);
 // North scoreboard: self-contained original display, hanging below the canopy.
 const north=stands.find(s=>s.id==='north'),screenCenter=screenPosition;
 const scoreCanvas=document.createElement('canvas');scoreCanvas.width=1272;scoreCanvas.height=360;const sc=scoreCanvas.getContext('2d');
 sc.fillStyle='#061d37';sc.fillRect(0,0,1272,360);sc.fillStyle='#1d75b4';sc.fillRect(0,0,1272,64);sc.fillStyle='#eef7ff';sc.textAlign='center';sc.textBaseline='middle';sc.font='bold 40px Arial';sc.fillText('ESTADIO LUIS KÖSTER',636,32);sc.font='24px Arial';sc.fillText('LOCAL',318,105);sc.fillText('VISITA',954,105);sc.font='bold 112px Arial';sc.fillText('0  –  0',636,202);sc.fillStyle='#acd9fc';sc.font='22px Arial';sc.fillText('DEMOSTRACIÓN  ·  MARCADOR FICTICIO',636,319);
 const scoreTexture=new T.CanvasTexture(scoreCanvas);scoreTexture.colorSpace=T.SRGBColorSpace;const scoreMat=new T.MeshStandardMaterial({map:scoreTexture,emissive:0xffffff,emissiveMap:scoreTexture,emissiveIntensity:.8,roughness:.45});
 const scoreMesh=new T.Mesh(new T.PlaneGeometry(screenLayout.width,screenLayout.height),scoreMat);scoreMesh.position.set(screenCenter[0],screenLayout.y,screenCenter[1]+.28);scoreMesh.rotation.x=screenLayout.tilt;scene.add(scoreMesh);box(screenCenter[0],screenLayout.y,screenCenter[1],screenLayout.width+.32,screenLayout.height+.32,.34,mats.dark);
 for(const p of screenPosts){box(p.x,.18,p.z,.9,.36,.9,mats.concrete);beam([p.x,0,p.z],[p.x,14.9,p.z],.15,mats.steel);beam([p.x,10.5,p.z],[p.x,14.4,screenCenter[1]],.08,mats.steel);}
 beam([screenPosts[0].x,14.85,screenCenter[1]],[screenPosts[1].x,14.85,screenCenter[1]],.1,mats.steel);beam([screenPosts[0].x,11.3,screenCenter[1]],[screenPosts[1].x,11.3,screenCenter[1]],.1,mats.steel);
 const screenLight=new T.PointLight(0x65b5ff,22,17,2);screenLight.position.set(0,screenLayout.y,screenCenter[1]+2.5);scene.add(screenLight);
 function setScreen(on,night=true){scoreMat.map=on?scoreTexture:null;scoreMat.emissiveMap=on?scoreTexture:null;scoreMat.color.setHex(on?0xffffff:0x07121e);scoreMat.emissiveIntensity=on?(night?.65:.25):0;scoreMat.needsUpdate=true;screenLight.intensity=on&&night?22:0;scoreMesh.userData.on=on;}
 setScreen(true,true);
 // Benches are between the touchline and the inside of the track.
 for(const z of[-14,14]){box(-37.4,.2,z,2.2,.4,9,mats.concrete);box(-38.1,1.25,z,.12,2.1,9,mats.glass);box(-37.5,2.3,z,2.5,.12,9.3,mats.blue);for(let zz=z-4;zz<z+4;zz+=.8)batch(seatGeo,mats.seatBlue,[-37.4,.1,zz],[1,1,1],Math.PI/2);}
 const lamps=[],emissives=[],floodlightBanks=[];const lampmat=new T.MeshStandardMaterial({color:0xf1f3dc,emissive:0xfff1ca,emissiveIntensity:0});emissives.push(lampmat);
 for(const x of[-49,49])for(const z of[-68,68]){box(x,.4,z,3,.8,3,mats.concrete);for(const a of[-1,1])for(const b of[-1,1])beam([x+a*1.1,0,z+b*1.1],[x+a*.55,30,z+b*.55],.095,mats.steel);for(let y=1;y<30;y+=2.5){const w=1.1-y*.018;for(const s of[-1,1]){beam([x-w,y,z+s*w],[x+w,y+2.5,z+s*w],.04,mats.steel);beam([x+s*w,y,z-w],[x+s*w,y+2.5,z+w],.04,mats.steel);}beam([x-w,y,z-w],[x+w,y,z-w],.06,mats.steel);}
 const bank=addFloodlightBank(x,z,{batch,beam,unitBox,mats,lampmat,setScope});floodlightBanks.push(bank);const {target,center}=bank;
 const spot=new T.SpotLight(0xe5efff,0,210,.85,.65,2);spot.position.copy(center);spot.target.position.copy(target);spot.shadow.mapSize.set(1024,1024);spot.shadow.bias=-.00008;spot.shadow.normalBias=.09;spot.shadow.camera.near=2;spot.shadow.camera.far=210;scene.add(spot,spot.target);lamps.push(spot);
 }
 const walkway=[],walkwayEmitter=lampmat.clone();
 for(const{x,z}of walkwayPosts){beam([x,0,z],[x,4,z],.045,mats.steel);box(x,4,z,.9,.08,.35,mats.dark);box(x,3.95,z,.75,.045,.24,walkwayEmitter);const l=new T.PointLight(0xffd4a4,0,18,2);l.position.set(x,3.7,z);scene.add(l);walkway.push(l);}
 // Perimeter, entry gates, kerbs and plantings outside the pedestrian paths.
 // Retaining-wall character follows street references; dimensions fit the academic site.
 for(const x of[siteBounds.west,siteBounds.east])for(const[a,b]of x===siteBounds.west?[[-115,-62],[62,115]]:[[-115,115]]){
  const h=x===siteBounds.east?1.55:.24;box(x,h/2,(a+b)/2,.28,h,b-a,mats.concrete);box(x,h+.025,(a+b)/2,.36,.05,b-a,mats.wall);
  for(let z=a;z<=b;z+=4)beam([x,0,z],[x,2.2,z],.045,mats.steel);
  for(let y=h+.14;y<2.3;y+=.3)beam([x,y,a],[x,y,b],.012,mats.steel);
 }
 for(const z of[siteBounds.north,siteBounds.south])for(const[a,b]of[[siteBounds.west,38],[48,siteBounds.east]]){
  box((a+b)/2,.90,z,b-a,1.80,.28,mats.concrete);box((a+b)/2,1.84,z,b-a,.08,.36,mats.wall);
  for(let x=a;x<b;x+=4){box(x,.94,z,.05,1.88,.34,mats.wall);beam([x,1.84,z],[x,2.2,z],.045,mats.steel);}beam([a,2.18,z],[b,2.18,z],.015,mats.steel);
 }
 // Public access from Varela is separate from the underground player route.
 // Small lawn panels frame the approaches, with paved breaks aligned to access routes.
 for(const z of[-112,112])for(const[a,b]of[[-78,-50],[-34,31],[53,96]])plane((a+b)/2,z,b-a,5.5,mats.grass,-.012);
 setScope('rooms','roomDetail');const facilityStart=scene.children.length;
 const playerFacilities=addPlayerFacilities(scene,{mats,box,beam,mesh,merge,curvedBlock,sign});
 scene.children.slice(facilityStart).forEach(o=>{if(o.isMesh&&!o.name&&!playerFacilities.floors.includes(o)&&!playerFacilities.ceilings.includes(o)&&!playerFacilities.walls.includes(o))o.userData.detail='roomDetail';});
 addCloseDetails(scene,{box,beam,mats,sign,setScope});
 setScope('city');const neighborhood=addNeighborhood(scene,{box,beam,plane,terrainPlane,batch,mats,setScope,sign});
 const exterior=addExteriorLighting(scene,{box,beam,mats,setScope});
 setScope('boundaries');
 const boundaries=addBoundaries(scene,{mats,box,beam,mesh,merge,curvedBlock,sign,renderer});
 // Contact darkening is geometry-local and supplements filtered shadows.
 const shadowmat=new T.MeshBasicMaterial({color:0x273137,transparent:true,opacity:.17,depthWrite:false});for(const s of stands.filter(s=>s.id!=='main')){const o=mesh(curvedBlock(s,0,s.depth,0,.004,.004),shadowmat,false);o.receiveShadow=false;}
 const seatGroups=[];for(const g of groups.values()){const ins=new T.InstancedMesh(g.geometry,g.material,g.matrices.length);g.matrices.forEach((m,i)=>ins.setMatrixAt(i,m));ins.instanceMatrix.needsUpdate=true;ins.userData.scope=g.scope;ins.userData.detail=g.detail;ins.castShadow=true;ins.receiveShadow=true;scene.add(ins);if(g.geometry===seatGeo||g.geometry===lowBackGeo){ins.computeBoundingSphere();seatGroups.push(ins);for(let i=0;i<ins.count;i++)ins.setColorAt(i,new T.Color().setScalar(.94+.06*((i*17%97)/96)));}if(g.geometry===contactGeo){ins.castShadow=false;ins.receiveShadow=false;}if(g.geometry===seatFeet||g.geometry===contactGeo)detailMeshes.push(ins);}
 function setStandLights(on,night,percent=160){const gain=Math.max(.5,Math.min(2.5,Number(percent)/100||1.6));standLights.forEach(({light,power})=>light.intensity=on&&night?power*gain:0);standEmitters.forEach(m=>m.emissiveIntensity=on&&night?.55*gain*(m.userData.emitterGain??1):0);}
 scene.traverse(o=>{if(o.isMesh&&!o.isInstancedMesh)o.geometry=indexGeometry(o.geometry);});
 const textured=new Set();scene.traverse(o=>{if(o.isMesh&&o.material)for(const m of(Array.isArray(o.material)?o.material:[o.material]))if(!textured.has(m)){textured.add(m);configureSurface(m);}});
 progress(1);return{mats,lamps,walkway,walkwayEmitter,emissives,floodlightBanks,exterior,publicEntrance,seatGroups,nets,roofs,failures,textureCount:15,detailMeshes,architecturalLights,accentMaterials,neighborhood,setScreen,scoreMesh,boundaries,standLights,standEmitters,setStandLights,architectureDetails,playerFacilities};
}
