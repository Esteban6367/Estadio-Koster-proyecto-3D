import assert from 'node:assert/strict';
import {houses,roads,houseFences,streetNames,urbanTrees,urbanPoles} from './dist/surroundings.js';
import {allowed,move,obstacles,columns,ground} from './dist/physics.js';
import {spatialIndex} from './dist/spatial-index.js';
import {equipment} from './dist/site-equipment.js';
for(const h of houses)for(const r of roads){const x=r.axis==='x',along=x?h.x:h.z,cross=x?h.z:h.x,ha=x?h.w/2:h.d/2,hc=x?h.d/2:h.w/2;assert(!(along+ha>r.a&&along-ha<r.b&&Math.abs(cross-r.at)<hc+r.width/2), 'building blocks road '+JSON.stringify(h));}
assert(roads.some(r=>r.at===20&&r.b===-116));assert(roads.some(r=>r.at===-20&&r.a===127));assert.equal(streetNames.length,6);assert(houses.filter(h=>h.reference).length>=30);
for(const p of [...urbanPoles,...streetNames,...urbanTrees])assert(columns.some(c=>c.x===p.x&&c.z===p.z),'shared rendered/collision position');
for(const o of [...equipment,...houseFences])assert(obstacles.includes(o));
let tested=0;for(const speed of[6,12,24,36])for(const dt of[1/60,.12])for(const axis of['x','z'])for(const side of[-1,1])for(const o of obstacles.filter(o=>o===equipment[0]||houses.includes(o)).slice(0,80)){
 const hx=axis==='x'?o.w/2:o.d/2,other=axis==='x'?'z':'x',b={x:o.x,z:o.z,floor:0};b[axis]+=side*(hx+.32);const origin=b[axis];move(b,axis==='x'?-side*speed*dt:0,axis==='z'?-side*speed*dt:0);assert(side*(b[axis]-o[axis])>=hx+.299,'no high-speed penetration');tested++;
}
// Perimeter sidewalks form a continuous loop, with existing portals reachable.
for(const[a,b]of[[[-108,-122],[114,-122]],[[114,-122],[114,123]],[[114,123],[-108,123]],[[-108,123],[-108,-122]]]){const body={x:a[0],z:a[1],floor:0},dx=b[0]-a[0],dz=b[1]-a[1],n=Math.ceil(Math.hypot(dx,dz)/.55);for(let i=0;i<n;i++)move(body,dx/n,dz/n);assert(Math.hypot(body.x-b[0],body.z-b[1])<.05,'continuous sidewalk '+JSON.stringify([a,b,body]));}
const access={x:-108,z:0,floor:0};move(access,15,0);assert(access.x>-94,'Varela public portal connects main exterior access');
// Broad phase must not miss a candidate: same data as the new visible environment.
const index=spatialIndex(obstacles,o=>[o.x-o.w/2-.3,o.z-o.d/2-.3,o.x+o.w/2+.3,o.z+o.d/2+.3]);let seed=5687;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};for(let i=0;i<12000;i++){const x=-240+random()*485,z=-245+random()*455,found=index(x,z);for(const o of obstacles)if(Math.abs(x-o.x)<o.w/2+.3&&Math.abs(z-o.z)<o.d/2+.3)assert(found.includes(o));}
console.log(`PASS: ${houses.length} buildings clear of roads, named T junctions, shared props, ${tested} impacts at 6/12/24/36 m/s, perimeter loop and 12,000 broad-phase queries.`);
