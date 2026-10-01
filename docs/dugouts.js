import * as T from './three.module.min.js';
export const benchCenters=[-14,14];
export const benchObstacles=benchCenters.flatMap(z=>[
 {x:-38.38,z,w:.07,d:9},...[-1,1].map(s=>({x:-37.5,z:z+s*4.5,w:1.76,d:.07})),
 {x:-37.75,z,w:.6,d:8.35}
]);
export function benchFloor(x,z){return x>=-38.55&&x<=-36.35&&benchCenters.some(c=>Math.abs(z-c)<=4.65)?.12:null;}
// Curved transparent team shelters, inspired by Harrod's Premier shelter.
export function addDugouts({box,beam,batch,mesh,mats,seatGeo,seatFeet,sitTargets}){
 const clear=new T.MeshStandardMaterial({color:0xc2dce3,roughness:.24,metalness:.05,transparent:true,opacity:.24,depthWrite:false,side:T.DoubleSide});
 const profile=[[-38.38,.18],[-38.38,1.12]];
 for(let i=1;i<=16;i++){const a=Math.PI-i*Math.PI/32;profile.push([-36.62+1.76*Math.cos(a),1.12+1.13*Math.sin(a)]);}
 function panel(points){const g=new T.BufferGeometry(),p=[];for(let i=1;i<points.length-1;i++)p.push(...points[0],...points[i],...points[i+1]);g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.computeVertexNormals();const o=mesh(g,clear,false);o.name='Banco · policarbonato curvo';o.receiveShadow=false;}
 for(const z of benchCenters){
  box(-37.45,.06,z,2.2,.12,9.3,mats.concrete);
  for(let i=1;i<profile.length;i++){const a=profile[i-1],b=profile[i];panel([[...a,z-4.5],[...b,z-4.5],[...b,z+4.5],[...a,z+4.5]]);}
  for(const offset of[-4.5,-2.25,0,2.25,4.5]){for(let i=1;i<profile.length;i++)beam([...profile[i-1],z+offset],[...profile[i],z+offset],.027,mats.steel);box(-38.38,.15,z+offset,.18,.06,.20,mats.dark);}
  for(const i of[0,1,9,17])beam([...profile[i],z-4.5],[...profile[i],z+4.5],.025,mats.steel);
  for(const s of[-1,1]){const zz=z+s*4.5;panel([...profile.map(p=>[...p,zz]),[-36.62,.18,zz]]);beam([-36.62,.18,zz],[-36.62,2.25,zz],.027,mats.steel);beam([-38.38,.18,zz],[-36.62,.18,zz],.027,mats.steel);}
  for(let i=0;i<12;i++){const zz=z+(i-5.5)*.69,pos=[-37.72,.12,zz];batch(seatGeo,mats.seatBlue,pos,[1.12,1.15,1.12],Math.PI/2);batch(seatFeet,mats.dark,pos,[1,1.15,1],Math.PI/2);sitTargets.push({x:pos[0],z:zz,floor:.12,eye:1.39,angle:Math.PI/2,label:'Banco de suplentes'});}
 }
}
