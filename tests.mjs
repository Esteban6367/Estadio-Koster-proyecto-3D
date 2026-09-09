import assert from 'node:assert/strict';
import {stands,world,local,ground,allowed,move,floorHeight,columns,obstacles} from './dist/physics.js';
let checks=0;
for(const s of stands){
 for(const u of(s.id==='main'?[-51.7,51.7]:[-17,0,17])){
  let[x,z]=world(s,u,.1),h=0;
  for(const ds of[Array.from({length:Math.floor((s.depth-1.2)/.06)},(_,i)=>.1+i*.06),Array.from({length:Math.floor((s.depth-1.2)/.06)},(_,i)=>s.depth-1.3-i*.06)])for(const d of ds){const[nx,nz]=world(s,u,d);assert(allowed(nx,nz,x,z,h),`${s.id} aisle ${u} at ${d}`);const next=ground(nx,nz,h);assert(Math.abs(next-h)<=.23);h=next;x=nx;z=nz;checks++;}
 }
 for(const d of[1,s.id==='main'?13.35:11.5]){let[x,z]=world(s,-17,d),h=floorHeight(s,d);for(let u=-17;u<17;u+=.08){const[nx,nz]=world(s,u,d);assert(allowed(nx,nz,x,z,h),`${s.id} gallery ${d}, ${u}`);h=ground(nx,nz,h);x=nx;z=nz;}}
 let[a,b]=world(s,4,5);assert(!allowed(a,b,a,b),s.id+' seats');let[c,d]=world(s,s.length/2,7);assert(!allowed(c,d,c,d),s.id+' end rail');let[e,f]=world(s,17,s.depth);assert(!allowed(e,f,e,f),s.id+' rear rail');
 const p=world(s,8,9),inv=local(s,...p);assert(Math.abs(inv.u-8)<1e-6&&Math.abs(inv.d-9)<1e-6);
}
for(const o of obstacles)assert(!allowed(o.x,o.z,o.x-2,o.z),'obstacle');for(const o of columns)assert(!allowed(o.x,o.z,o.x-2,o.z,o.top===undefined?undefined:0),'column at its actual ground level');
const p={x:58,z:0};move(p,50,0);assert(p.x<64,'continuous CDM wall collision');assert(allowed(0,0,.1,0));assert(!allowed(246,0,244,0));
const fence={x:105,z:0};move(fence,30,0);assert(fence.x<107,'perimeter fence');const gate={x:44,z:106};move(gate,0,32);assert(gate.z>136,'south gate opens onto street');const closed={x:0,z:111};move(closed,0,25);assert(closed.z<115,'fence outside gate blocks');
console.log(`PASS: ${checks} stair steps, all three curved stands up/down, middle galleries, seating, rails, columns, CDM, benches, towers, boundaries.`);

const main=stands[0];let[ax,az]=world(main,1,main.depth+4),h=0;for(let d=main.depth+4;d>1;d-=.04){const[x,z]=world(main,1,d);assert(allowed(x,z,ax,az,h),'entry to front '+d);h=ground(x,z,h);ax=x;az=z;}assert.equal(h,0);console.log('PASS: public entry reaches the front circulation without the former central ascent.');
