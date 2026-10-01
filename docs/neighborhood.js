import * as T from './three.module.min.js';
import {houses,cars,roads,streetNames,urbanPoles,urbanTrees,houseFences} from './surroundings.js';
export function addNeighborhood(scene,{box,beam,plane,terrainPlane,batch,mats,setScope,sign}){
 setScope('city','cityFine');
 const plaster=[0xb2b2a2,0xc7b59e,0xc8cdcc,0x987f6b,0xa39786,0xabaaa4,0x94ada2,0xbc8b88,0xc3ba9e].map(color=>new T.MeshStandardMaterial({color,roughness:.95}));
 const nearPlaster=plaster.map(m=>{const n=mats.concrete.clone();n.color.copy(m.color);return n;});
 const roofMats=[0x67584c,0x7a6155,0x778087].map(color=>new T.MeshStandardMaterial({color,roughness:.75,metalness:.12}));
 const asphalt=mats.concrete.clone();asphalt.color.setHex(0x53595c);asphalt.roughness=.95;
 const darkGlass=new T.MeshStandardMaterial({color:0x253541,roughness:.32,metalness:.2});
 const warmWindow=new T.MeshStandardMaterial({color:0xb9a986,emissive:0xffcf84,emissiveIntensity:0,roughness:.5});
 const streetEmitter=new T.MeshStandardMaterial({color:0xe1d4b8,emissive:0xffd49b,emissiveIntensity:0});
 const bollard=new T.MeshStandardMaterial({color:0x444b50,roughness:.6,metalness:.5});
 const terrain=mats.grass.clone();terrain.color.setHex(0x768069);terrainPlane(10,-200,1100,1100,terrain,-.19);
 const paving=mats.paving.clone();paving.color.setHex(0xb4b4b0);
 // Road/sidewalk surfaces are merged by cell below. Street branches stop at the site.
 const roofGeo=new T.BufferGeometry();const p=[-.5,0,-.5,.5,0,-.5,0,.5,-.5,-.5,0,.5,0,.5,.5,.5,0,.5,-.5,0,-.5,0,.5,-.5,0,.5,.5,-.5,0,-.5,0,.5,.5,-.5,0,.5,0,.5,-.5,.5,0,-.5,.5,0,.5,0,.5,-.5,.5,0,.5,0,.5,.5];roofGeo.setAttribute('position',new T.Float32BufferAttribute(p,3));roofGeo.computeVertexNormals();
 // Merge each urban cell by surface type; distant detail can be culled independently.
 const cityCells=new Map(),unit=new T.BoxGeometry(1,1,1).toNonIndexed(),matrix=new T.Matrix4();
 const bodyMat=mats.concrete.clone();bodyMat.color.setHex(0xffffff);bodyMat.vertexColors=true;
 const roofBody=mats.metal.clone();roofBody.color.setHex(0xffffff);roofBody.vertexColors=true;roofBody.roughness=.8;
 const windowColor=warmWindow.color.clone(),glassColor=darkGlass.color.clone();warmWindow.color.setHex(0xffffff);darkGlass.color.setHex(0xffffff);warmWindow.vertexColors=darkGlass.vertexColors=true;
 let cityDetail=false;
 function cityPiece(geometry,mat,pos,scale){
  const material=mat===warmWindow?warmWindow:mat===darkGlass?darkGlass:mat===asphalt?asphalt:mat===paving?paving:roofMats.includes(mat)?roofBody:bodyMat;
  const cell=cityDetail?96:(mat===asphalt||mat===paving?384:192);const key=Math.floor(pos[0]/cell)+','+Math.floor(pos[2]/cell)+'|'+(cityDetail?'fine':'body')+'|'+material.uuid;
  if(!cityCells.has(key))cityCells.set(key,{material,fine:cityDetail,p:[],n:[],uv:[],c:[]});const data=cityCells.get(key),g=geometry.index?geometry.toNonIndexed():geometry;
  matrix.compose(new T.Vector3(...pos),new T.Quaternion(),new T.Vector3(...scale));const nm=new T.Matrix3().getNormalMatrix(matrix),v=new T.Vector3(),n=new T.Vector3(),color=mat===warmWindow?windowColor:mat===darkGlass?glassColor:mat.color;
  for(let i=0;i<g.attributes.position.count;i++){v.fromBufferAttribute(g.attributes.position,i).applyMatrix4(matrix);n.fromBufferAttribute(g.attributes.normal,i).applyMatrix3(nm).normalize();data.p.push(v.x,v.y,v.z);data.n.push(n.x,n.y,n.z);data.c.push(color.r,color.g,color.b);data.uv.push((Math.abs(n.x)>.5?v.z:v.x)/3,(Math.abs(n.y)>.5?v.z:v.y)/3);}
 }
 const hbox=(x,y,z,w,h,d,mat)=>cityPiece(unit,mat,[x,y,z],[w,h,d]);
 // Clip curbs at every actual junction; remove the old invented zebra crossings.
 const roadPlane=new T.PlaneGeometry(1,1,16,10),farRoad=new T.PlaneGeometry(1,1);roadPlane.rotateX(-Math.PI/2);farRoad.rotateX(-Math.PI/2);
 for(const r of roads){cityDetail=false;const horizontal=r.axis==='x',length=r.b-r.a,middle=(r.a+r.b)/2;
  // Tiles supply local light samples and retain cell-level culling along long roads.
  const place=(width,y,mat,cross=r.at,start=r.a,end=r.b)=>{for(let a=start;a<end;a+=24){const b=Math.min(end,a+24),mid=(a+b)/2,x=horizontal?mid:cross,z=horizontal?cross:mid,near=Math.abs(x)<160&&Math.abs(z)<165;cityPiece(near?roadPlane:farRoad,mat,[x,y,z],horizontal?[b-a,1,width]:[width,1,b-a]);}};
  const cuts=roads.filter(q=>q.axis!==r.axis&&q.at>r.a&&q.at<r.b&&r.at>=q.a-.01&&r.at<=q.b+.01).map(q=>[q.at-q.width/2-.5,q.at+q.width/2+.5]).sort((a,b)=>a[0]-b[0]);
  // Horizontal asphalt owns the intersections. Sidewalks have physical street gaps.
  if(horizontal)place(r.width,-.046,asphalt);
  let finish=r.a;for(const[a,b]of[...cuts,[r.b,r.b]]){if(a>finish){if(!horizontal)place(r.width,-.046,asphalt,r.at,finish,a);for(const side of[-1,1]){
   const cross=r.at+side*(r.width/2+2);
   if(!horizontal&&r.at===-116&&side===1){
    if(finish< -62)place(4,-.09,paving,cross,finish,Math.min(a,-62));
    if(a>62)place(4,-.09,paving,cross,Math.max(finish,62),a);
    if(a> -62&&finish<62)place(.1,-.09,paving,-110.45,Math.max(finish,-62),Math.min(a,62));
   }else place(4,-.09,paving,cross,finish,a);
  }}finish=Math.max(finish,b);}
  let end=r.a;for(const[a,b]of[...cuts,[r.b,r.b]]){if(a>end)for(const side of[-1,1]){const at=r.at+side*(r.width/2+.15),mid=(end+a)/2;box(horizontal?mid:at,.005,horizontal?at:mid,horizontal?a-end:.28,.15,horizontal?.28:a-end,mats.concrete);}end=Math.max(end,b);}
 }
 for(const h of houses){
  const a=h.axis==='x',frontLength=a?h.d:h.w,depth=a?h.w:h.d;
  const at=(u,v,y,w,ht,d,mat)=>hbox(h.x+(a?h.front*v:u),y,h.z+(a?u:h.front*v),a?d:w,ht,a?w:d,mat);
  cityDetail=false;const wall=(h.near?nearPlaster:plaster)[h.color],roof=roofMats[h.roof];hbox(h.x,h.h/2,h.z,h.w,h.h,h.d,wall);
  if(h.roof===0){hbox(h.x,h.h+.16,h.z,h.w+.45,.32,h.d+.45,roof);if(h.near){hbox(h.x-h.w*.2,h.h+.65,h.z,1.35,.9,1.35,mats.wall);hbox(h.x-h.w*.2,h.h+1.2,h.z,1.4,.2,1.4,bollard);}}
  else cityPiece(roofGeo,roof,[h.x,h.h,h.z],[h.w+.5,1.65,h.d+.5]);
  // Distant houses have just body + roof. Close glazing and frames return by sector.
  if(!h.near)continue;cityDetail=true;
  const v=depth/2+.036,windowMat=h.lit?warmWindow:darkGlass;
  const count=Math.min(5,Math.max(2,Math.floor(frontLength/3.4)));
  for(let k=0;k<count;k++){
   const u=-frontLength/2+(k+.5)*frontLength/count;if(k===0)continue;
   at(u,v,1.8,1.2,1.2,.06,k%3===0?darkGlass:windowMat);
   for(const du of[-.64,.64])at(u+du,v+.04,1.8,.07,1.32,.1,mats.white);
   at(u,v+.07,1.17,1.38,.1,.18,mats.concrete);at(u,v+.045,2.44,1.38,.08,.1,mats.white);
   if(h.setback&&k%2===0)for(const du of[-.38,0,.38])at(u+du,v+.09,1.8,.025,1.25,.025,bollard);
   if(h.h>5.5)at(u,v,4.65,1.25,1.2,.06,windowMat);
  }
  at(-frontLength*.34,v+.04,1.08,.98,2.16,.08,bollard);at(-frontLength*.34+.31,v+.11,1.05,.05,.25,.04,mats.steel);
  at(0,v,h.h-.17,frontLength,.20,.24,mats.white);
  // Garden walls have a real gap aligned with each entrance. Paint varies by parcel.
  if(h.setback>1.4){const f=depth/2+h.setback-.35;
   for(const[u,w]of[[-frontLength*.28,frontLength*.44],[frontLength*.30,frontLength*.40]]){
    at(u,f,.43,w,.86,.16,wall);at(u,f,.9,w+.05,.12,.22,mats.concrete);
    if(h.color===6){for(let j=0;j<Math.floor(w/.5);j++)at(u-w/2+.25+j*.5,f,1.11,.10,.36,.15,mats.concrete);at(u,f,1.32,w,.07,.18,mats.concrete);}
    else{at(u,f,1.22,w,.045,.04,bollard);for(let j=0;j<Math.floor(w/.4);j++)at(u-w/2+.2+j*.4,f,1.11,.022,.40,.022,bollard);}
   }
  }
  // Fine brick courses on selected exposed upper walls, visible close to the street.
  if(h.color===3||h.color===8)for(let y=2.65;y<h.h-.2;y+=.27)at(0,v+.006,y,frontLength,.009,.01,darkGlass);
 }
 cityDetail=true;for(const f of houseFences)if(Math.min(f.w,f.d)<.15)hbox(f.x,.55,f.z,f.w,1.1,f.d,mats.concrete);
 const cityMeshes=[];
 for(const cell of cityCells.values()){const g=new T.BufferGeometry();for(const[name,data,n]of[['position',cell.p,3],['normal',cell.n,3],['uv',cell.uv,2],['color',cell.c,3]])g.setAttribute(name,new T.Float32BufferAttribute(data,n));g.computeBoundingSphere();const o=new T.Mesh(g,cell.material);o.castShadow=!cell.fine;o.receiveShadow=true;o.userData.bakeOccluder=cell.material===bodyMat||cell.material===roofBody;o.userData.scope='city';o.userData.detail=cell.fine?'cityFine':'';o.name=cell.fine?'Barrio · detalles cercanos':'Barrio · volúmenes';scene.add(o);cityMeshes.push(o);}
 setScope('city','cityFine');
 for(const n of streetNames){beam([n.x,0,n.z],[n.x,2.9,n.z],.035,bollard);box(n.x,2.8,n.z,3.1,.48,.08,mats.blue,n.angle);const label=sign(n.text,3,.39);label.position.set(n.x+Math.sin(n.angle)*.055,2.8,n.z+Math.cos(n.angle)*.055);label.rotation.y=n.angle;label.userData.scope='city';label.userData.detail='cityFine';label.material.emissiveIntensity=.10;scene.add(label);}
 const carMats=[0xb9c1c3,0x44606b,0xa6a6a1,0x7d4441,0x4b5552].map(color=>new T.MeshStandardMaterial({color,roughness:.28,metalness:.55}));const wheel=new T.CylinderGeometry(.32,.32,.18,10);wheel.rotateZ(Math.PI/2);const tyre=new T.MeshStandardMaterial({color:0x242728,roughness:.94});
 for(const c of cars){box(c.x,.65,c.z,1.8,.8,4.3,carMats[c.color],c.angle);box(c.x,1.2,c.z-.1,1.65,.6,2.25,darkGlass,c.angle);box(c.x,1.54,c.z-.1,1.64,.08,1.8,carMats[c.color],c.angle);for(const x of[-.88,.88])for(const z of[-1.35,1.35])batch(wheel,tyre,[c.x+x*Math.cos(c.angle)+z*Math.sin(c.angle),.35,c.z-x*Math.sin(c.angle)+z*Math.cos(c.angle)],[1,1,1],c.angle);}
 const glowmat=new T.MeshBasicMaterial({color:0xe8bc75,transparent:true,opacity:0,depthWrite:false});
 const halos=[];const streetLights=[];setScope('city');
 for(const p of urbanPoles){
  const {x,z,dx,dz}=p,h=8,headX=x+dx*2.4,headZ=z+dz*2.4,angle=Math.atan2(dx,dz);
  beam([x,.10,z],[x,h,z],.075,bollard);box(x,.08,z,.30,.16,.30,mats.concrete);
  beam([x,h-.25,z],[headX,h+.12,headZ],.05,bollard);
  box(headX,h+.12,headZ,.38,.14,.86,bollard,angle);
  box(headX,h+.035,headZ,.28,.025,.70,streetEmitter,angle);
  const l=new T.SpotLight(0xffe9cf,0,33,1.16,.8,2);
  l.position.set(headX,h-.01,headZ);l.target.position.set(x+dx*6,-.04,z+dz*6);
  l.userData.bakePower=260;l.name='Alumbrado público · '+p.street;l.castShadow=false;
  scene.add(l,l.target);streetLights.push(l);
 }
 setScope('city','cityFine');
 // Lightweight sagging aerial cables, grouped spatially and hidden at distance.
 const wires=new Map();for(const x of[-108,120])for(let i=0;i<8;i++)for(const offset of[-.24,.24]){
  const z0=-112+i*28,z1=z0+28,key=Math.floor(x/96)+','+Math.floor(z0/96);if(!wires.has(key))wires.set(key,[]);const list=wires.get(key);
  for(let j=0;j<6;j++){const t=j/6,v=(j+1)/6;list.push(x+offset,6.4-.6*Math.sin(Math.PI*t),z0+(z1-z0)*t,x+offset,6.4-.6*Math.sin(Math.PI*v),z0+(z1-z0)*v);}
 }
 const wireMat=new T.LineBasicMaterial({color:0x383e40});for(const p of wires.values()){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));const o=new T.LineSegments(g,wireMat);o.userData.scope='city';o.userData.detail='cityFine';scene.add(o);cityMeshes.push(o);}
 const leaf=new T.IcosahedronGeometry(1,1);
 function tree(x,z,seed){
  beam([x,0,z],[x,3.7,z],.15,mats.trunk);
  for(let j=0;j<6;j++){const a=j*Math.PI/3+seed*.3,r=j===0?0:1.05;const px=x+Math.cos(a)*r,pz=z+Math.sin(a)*r,y=3.8+(j%3)*.5;
   batch(leaf,j%2?mats.leaf:mats.leaf2,[px,y,pz],[1.2+(j%2)*.35,1.55,1.15+(j%3)*.18],a);
   if(j%2)beam([x,2.6,z],[px,y-.4,pz],.055,mats.trunk);
  }
 }
 for(const t of urbanTrees)tree(t.x,t.z,t.seed);

 return{windows:warmWindow,streetEmitter,glowmat,halos,streetLights,cityMeshes,housesCount:houses.length};
}
