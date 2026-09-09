import assert from 'node:assert/strict';
import {stands,world,local,move,ground,floorHeight} from './dist/physics.js';
import {cabin} from './dist/stadium-layout.js';
import {moats,resetGate} from './dist/boundaries.js';
const bodyAt=(s,u,d,h)=>{const[x,z]=world(s,u,d);return{x,z,floor:ground(x,z,h)};};
function follow(s,p,u,d){
 const a=local(s,p.x,p.z),n=Math.ceil(Math.hypot(u-a.u,d-a.d)/.055);
 for(let i=1;i<=n;i++){const[x,z]=world(s,a.u+(u-a.u)*i/n,a.d+(d-a.d)*i/n);move(p,x-p.x,z-p.z);assert(Math.hypot(p.x-x,p.z-z)<.015,`${s.id} route blocked at u=${u}, d=${d}, actual ${JSON.stringify(local(s,p.x,p.z))}`);}
 return p;
}
// The lower exterior passage and the deck above must remain distinct walkable levels.
for(const s of stands){
 const lane=s.accessU+(s.id==='main'?1:0),p=bodyAt(s,lane,s.depth+4);
 if(s.id==='main'){for(const[u,d]of[[lane,25],[lane,11.35],[6.6,11.35],[11,11.35],[20.2,11.35],[20.2,13.35]])follow(s,p,u,d);assert(Math.abs(p.floor-4.2)<.001,'main exterior ascent');for(const[u,d]of[[20.2,11.35],[11,11.35],[6.6,11.35],[lane,11.35],[lane,25],[lane,s.depth+4]])follow(s,p,u,d);}else{follow(s,p,lane,11.5);assert(Math.abs(p.floor-4.2)<.001,s.id+' exterior ascent');follow(s,p,lane,s.depth+4);}assert.equal(p.floor,0,s.id+' exterior descent');
 const upper=bodyAt(s,s.id==='main'?0:17,s.baseDepth-1,floorHeight(s,s.baseDepth-1));
 follow(s,upper,s.accessU,s.baseDepth-1);assert(Math.abs(upper.floor-floorHeight(s,s.baseDepth-1))<.001,s.id+' upper gallery stays over passage');
 if(s.id==='main'){follow(s,upper,0,13.35);follow(s,upper,34,13.35);follow(s,upper,34,s.baseDepth-1);}else follow(s,upper,17,s.baseDepth-1);follow(s,upper,s.id==='main'?34:17,s.depth-1.2);
 assert(Math.abs(upper.floor-floorHeight(s,s.depth))<.001,s.id+' new tier ascent');
 if(s.id==='main'){follow(s,upper,34,13.35);follow(s,upper,51.7,13.35);follow(s,upper,51.7,1);}else follow(s,upper,17,1);assert.equal(upper.floor,0,s.id+' new tier descent');
}
const main=stands[0],p=bodyAt(main,0,21,cabin.floor);
follow(main,p,0,21);follow(main,p,0,23.4);assert.equal(p.floor,cabin.floor,'enter cabin through gallery doorway');
const wall={...p};const[x,z]=world(main,0,28);move(wall,x-wall.x,z-wall.z);assert(local(main,wall.x,wall.z).d<cabin.back-.25,'cabin rear wall');assert.equal(wall.floor,cabin.floor);
const glass=bodyAt(main,-2,23.4,cabin.floor),front=world(main,-2,20);move(glass,front[0]-glass.x,front[1]-glass.z);assert(local(main,glass.x,glass.z).d>cabin.front+.25,'glazed front blocks outside doorway');
follow(main,p,0,21);follow(main,p,0,13.35);follow(main,p,20.2,13.35);follow(main,p,20.2,11.35);follow(main,p,11,11.35);follow(main,p,6.6,11.35);follow(main,p,1,11.35);follow(main,p,1,25);follow(main,p,1,39);assert.equal(p.floor,0,'leave cabin via public stairs');
// Every moat: both edges and both end returns, including the newly extended extremities.
let runs=0;resetGate();
for(const speed of[6,12,24,36])for(const dt of[1/60,.1,.12])for(const m of moats){
 const s=m.s;
 for(const u of[m.start+.65,m.start*.7,-5,5,m.end*.7,m.end-.65])for(const side of[1,-1]){
  const p=bodyAt(s,u,side===1?.5:-5.2),d0=local(s,p.x,p.z).d;
  const sign=side===1?-1:1,dx=-Math.sin(s.angle)*sign*speed*dt,dz=-Math.cos(s.angle)*sign*speed*dt;
  for(let t=0;t<1.5;t+=dt)move(p,dx,dz);
  const d=local(s,p.x,p.z).d;assert(side===1?d>m.outerD:d<m.innerD,`${s.id} moat edge at ${speed}, dt=${dt}, u=${u}, from ${d0} to ${d}`);runs++;
 }
 for(const end of[-1,1]){
  const u=end*(s.length/2+1.2),p=bodyAt(s,u,-.5),targetU=end*(s.length/2-3),[tx,tz]=world(s,targetU,-.5),len=Math.hypot(tx-p.x,tz-p.z),vx=(tx-p.x)/len*speed*dt,vz=(tz-p.z)/len*speed*dt;
  for(let t=0;t<1;t+=dt)move(p,vx,vz);
  assert(Math.abs(local(s,p.x,p.z).u)>s.length/2,'moat end return '+s.id);runs++;
 }
 if(s.id!=='main'){
  const p=bodyAt(s,0,.5),[tx,tz]=world(s,0,-8);move(p,tx-p.x,tz-p.z);
  assert(local(s,p.x,p.z).d>m.outerD,'no central crossing in '+s.id);runs++;
 }
}
console.log(`PASS: three exterior entries, separate lower/upper circulation, new tiers up/down, cabin door/glazing/wall/return; ${runs} new moat edge/end tests at 6/12/24/36 m/s.`);
