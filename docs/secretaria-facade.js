import {stands,world,tierAngle} from './stadium-layout.js';
import * as T from './three.module.min.js';
import {sector as S} from './secretaria-sector.js';
export function addSecretariaFacade({k,a,b,at,pt,block,beam,mesh,scene,materials:M,mats,F}){
 const y=S.floor;
 if(k===10){
  // Opaque turquoise double gate and recessed opening under the existing stepped concrete.
  block(30.30,30.60,0,y,y,a,b,M.turquoise);
  at((a+b)/2,30.43,y+1.23,b-a,2.46,.10,M.gate);
  for(const u of[a+.045,(a+b)/2,b-.045])at(u,30.52,y+1.23,.055,2.46,.06,M.rail);
  block(30.30,30.60,y+2.64,y+3.38,y+3.38,a,b,M.navy);
 }else{
  const door0=34.90,door1=36.15,win0=29.35,win1=34.25,low=y+.64,high=y+2.08;
  block(30.30,30.60,0,y,y,a,b,M.turquoise);
  block(30.30,30.60,y,y+2.25,y+2.25,a,door0,M.turquoise);
  // Closed shutter on opaque backing; the photograph does not establish the interior.
  at((door0+door1)/2,30.66,y+1.10,door1-door0,2.20,.08,mats.white);
  for(const u of[door0,door1])at(u,30.71,y+1.11,.065,2.24,.12,mats.white);
  for(let u=door0+.13;u<door1;u+=.18)beam(pt(u,30.73,y+.95),pt(u,30.73,y+2.12),.010,mats.steel);
  at(door0+.12,30.78,y+.93,.035,.20,.055,mats.steel);
  at((win0+win1)/2,30.67,(low+high)/2,win1-win0,high-low,.075,mats.white);
  for(let yy=low+.08;yy<high;yy+=.115)at((win0+win1)/2,30.725,yy,win1-win0,.020,.027,M.doorFrame);
  for(const yy of[low,high])at((win0+win1)/2,30.79,yy,win1-win0+.14,.055,.055,mats.white);
  for(let u=win0;u<win1+.01;u+=.41)beam(pt(u,30.79,low),pt(u,30.79,high),.014,mats.white);
  block(30.30,30.60,y,y+2.25,y+2.25,door1,b,M.turquoise);
  block(30.30,30.60,y+2.25,y+2.90,y+2.90,a,b,M.turquoise);
  block(30.30,30.60,y+2.90,y+3.06,y+3.06,a,b,M.navy);
  for(let j=0;j<3;j++){
   const l=a+j*(b-a)/3,r=a+(j+1)*(b-a)/3;
   at((l+r)/2,30.40,y+3.34,r-l-.24,.48,.06,mats.glass);
   block(30.30,30.60,y+3.06,y+3.64,y+3.64,l,l+.15,M.navy);
  }
  block(30.30,30.60,y+3.64,F.whiteTop,F.whiteTop,a,b,M.cream);
  block(30.30,30.60,F.whiteTop,F.wallTop,F.wallTop,a,b,M.navy);
  const c=document.createElement('canvas');c.width=1536;c.height=192;const ctx=c.getContext('2d');
  ctx.fillStyle='#eef0e8';ctx.fillRect(0,0,c.width,c.height);ctx.fillStyle='#193e50';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='bold 56px Arial';ctx.fillText('SECRETARÍA DE DEPORTES',850,69,1300);ctx.font='bold 46px Arial';ctx.fillText('Y RECREACIÓN',850,132,1200);ctx.font='bold 32px Arial';ctx.fillText('SORIANO',160,105,260);
  const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;
  const sign=new T.Mesh(new T.PlaneGeometry(b-a-.10,.78),new T.MeshStandardMaterial({map:tex,roughness:.85}));sign.position.set(...pt((a+b)/2,30.96,y+2.63));sign.rotation.y=tierAngle(stands[0],(a+b)/2,30.81)+Math.PI;sign.name='Secretaría · cartel blanco';scene.add(sign);
 }
}
export function addSecretariaApproach({at,block,pt,beam,materials:M,mats}){
 block(S.front,S.landingEnd,0,S.floor,S.floor,S.u0,S.u1,mats.concrete,'floor');
 for(let i=0;i<S.steps;i++){
  const d0=S.landingEnd+i*S.tread,d1=d0+S.tread,h=(S.steps-i)*S.rise;
  block(d0,d1,0,h,h,S.stepU0,S.stepU1,mats.concrete,'floor');
 }
 // Low planter touches the landing; no detached trough or raised obstruction at the door.
 block(34.10,34.28,0,.58,.58,28.80,35.90,M.turquoise);
 block(35.92,36.10,0,.58,.58,28.80,35.90,M.turquoise);
 for(const [a,b] of [[28.80,28.98],[35.72,35.90]])block(34.28,35.92,0,.58,.58,a,b,M.turquoise);
 block(34.28,35.92,0,.43,.43,28.98,35.72,mats.grass);
 for(let u=29.3;u<35.6;u+=.75)for(const off of[-.10,.10])beam(pt(u,35.1,.43),pt(u+off,35.1+off,.72),.015,mats.leaf);
}
