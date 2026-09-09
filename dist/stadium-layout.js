import {publicGradeCuts} from './public-layout.js';
// Academic model, metres. Shared by architecture and collision geometry.
export const stands=[
 {id:'main',name:'Tribuna principal',x:-56,z:0,angle:Math.PI/2,length:115,baseDepth:22,depth:32.5,curve:4,accessU:0},
 {id:'north',name:'Tribuna norte',x:0,z:-74,angle:0,length:85,baseDepth:18,depth:28.5,curve:6,accessU:34},
 {id:'south',name:'Tribuna sur',x:0,z:74,angle:Math.PI,length:85,baseDepth:18,depth:28.5,curve:6,accessU:34}
];
export const bend=(s,u)=>s.curve*(1-(u/(s.length/2))**2);
export function world(s,u,d){let c=Math.cos(s.angle),a=Math.sin(s.angle),v=d+bend(s,u);return[s.x+u*c-v*a,s.z-u*a-v*c];}
export function local(s,x,z){let dx=x-s.x,dz=z-s.z,c=Math.cos(s.angle),a=Math.sin(s.angle),u=dx*c-dz*a;return{u,d:-dx*a-dz*c-bend(s,u)};}

export const flights=s=>[[2,10.5],[s.id==='main'?14:12.5,s.baseDepth-2],[s.baseDepth,s.depth-2]];
export const flightStep=(s,a)=>s.id==='main'&&a===14?1/3:.425;
export const galleries=s=>[[0,2],[10.5,s.id==='main'?14:12.5],[s.baseDepth-2,s.baseDepth],[s.depth-2,s.depth]];
export const cabin={stand:'main',halfWidth:4,front:22,back:25.3,floor:7.98,height:2.85,doorHalf:.85};
export function cabinAt(s,u,d){return s.id==='main'&&Math.abs(u)<=cabin.halfWidth&&d>=cabin.front&&d<=cabin.back;}
export function solidRanges(s,d){
 const half=s.id==='main'&&d>=20.1?2.7:1.7;
 const cuts=s.id==='main'?publicGradeCuts(d):[];if(d>=12.5&&s.id!=='main')cuts.push([s.accessU-half,s.accessU+half]);
 if(s.id==='main'&&d>=cabin.front&&d<cabin.back+.15)cuts.push([-4.15,4.15]);
 let ranges=[[-s.length/2,s.length/2]];for(const[a,b]of cuts)ranges=ranges.flatMap(([l,r])=>b<=l||a>=r?[[l,r]]:[[l,Math.max(l,a)],[Math.min(r,b),r]].filter(([x,y])=>y>x));return ranges;
}
