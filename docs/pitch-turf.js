import * as T from './three.module.min.js';
import {pitchDimensions as P} from './dimensions.js';
import {pitchPaintDistance} from './pitch-markings.js';

// Short maintained turf. Deterministic seamless fibres, not repeating painted noise.
export function createPitchMaterial(renderer){
 const n=1024,data=new Uint8Array(n*n*4),height=new Float32Array(n*n);let seed=87123;
 const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
 for(let i=0;i<n*n;i++){const v=random();height[i]=v*.16;data.set([43+v*13,65+v*18,25+v*9,255],i*4);}
 for(let i=0;i<115000;i++){
  const x=random()*n,y=random()*n,len=3+random()*15,angle=random()*Math.PI*2;
  const light=random(),r=51+light*37,g=77+light*42,b=27+light*20;
  for(let j=0;j<len;j++){const t=j/len,px=(Math.floor(x+Math.sin(angle)*j)+n)%n,py=(Math.floor(y+Math.cos(angle)*j)+n)%n,k=py*n+px;
   const tone=.78+.22*Math.sin(t*Math.PI);data.set([r*tone,g*tone,b*tone,255],k*4);height[k]=.30+.45*Math.sin(t*Math.PI);
  }
 }
 const normals=new Uint8Array(n*n*4),rough=new Uint8Array(n*n*4);
 for(let y=0;y<n;y++)for(let x=0;x<n;x++){const k=y*n+x,dx=height[y*n+(x+1)%n]-height[y*n+(x+n-1)%n],dy=height[((y+1)%n)*n+x]-height[((y+n-1)%n)*n+x];
  const v=new T.Vector3(-dx*.5,-dy*.5,1).normalize();normals.set([(v.x*.5+.5)*255,(v.y*.5+.5)*255,(v.z*.5+.5)*255,255],k*4);const r=218+height[k]*32;rough.set([r,r,r,255],k*4);
 }
 const texture=(bytes,color=false)=>{const t=new T.DataTexture(bytes,n,n);t.wrapS=t.wrapT=T.RepeatWrapping;t.colorSpace=color?T.SRGBColorSpace:T.NoColorSpace;t.magFilter=T.LinearFilter;t.minFilter=T.LinearMipmapLinearFilter;t.generateMipmaps=true;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());t.needsUpdate=true;return t;};
 const material=new T.MeshStandardMaterial({map:texture(data,true),normalMap:texture(normals),roughnessMap:texture(rough),normalScale:new T.Vector2(.42,.42),roughness:1});
 material.userData={tile:2,surface:'grass',pitchMarkings:true};return material;
}

export function addTurfFibres(scene){
 const chunks=[],mat=new T.MeshStandardMaterial({vertexColors:true,roughness:1,side:T.DoubleSide});let seed=68139;
 // Both sides inherit the lawn's upward lighting normal; reversed backs otherwise
 // become black flecks in short, thin leaves seen against the illuminated pitch.
 mat.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <normal_fragment_begin>','#include <normal_fragment_begin>\nnormal *= gl_FrontFacing ? 1.0 : -1.0;');};
 mat.customProgramCacheKey=()=> 'short-turf-upward-normal-v1';
 const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
 for(let iz=0;iz<12;iz++)for(let ix=0;ix<8;ix++){
  const pos=[],col=[],cx=-P.halfWidth+(ix+.5)*P.width/8,cz=-P.halfLength+(iz+.5)*P.length/12;
  for(let i=0;i<1550;i++){
   const x=cx+(random()-.5)*P.width/8,z=cz+(random()-.5)*P.length/12;if(pitchPaintDistance(x,z)<.09)continue;
   const angle=random()*Math.PI*2,w=.0015+random()*.002,h=.016+random()*.013,dx=Math.cos(angle)*w,dz=Math.sin(angle)*w,lean=(random()-.5)*.009;
   pos.push(x-dx,.038,z-dz,x+dx,.038,z+dz,x+lean,.038+h,z+lean);
   const v=.85+random()*.3,c=new T.Color().setRGB(.07*v,.14*v,.029*v);col.push(c.r*.88,c.g*.88,c.b*.88,c.r,c.g,c.b,c.r*1.12,c.g*1.12,c.b*1.12);
  }
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('color',new T.Float32BufferAttribute(col,3));const ns=new Float32Array(pos.length);for(let j=1;j<ns.length;j+=3)ns[j]=1;g.setAttribute('normal',new T.BufferAttribute(ns,3));g.computeBoundingSphere();
  const o=new T.Mesh(g,mat);o.name='Césped · hojas cortas próximas';o.userData.skipBake=true;o.userData.decorativeGrass=true;o.castShadow=false;o.receiveShadow=true;scene.add(o);chunks.push(o);
 }
 return{chunks,update(camera,quality){const limit=quality==='low'?0:quality==='medium'?10:18;for(const o of chunks)o.visible=limit>0&&camera.position.distanceTo(o.geometry.boundingSphere.center)<limit;}};
}
