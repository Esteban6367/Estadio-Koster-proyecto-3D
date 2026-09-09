import {tunnel} from './underground-layout.js';
import {stands,world,local} from './stadium-layout.js';

// Three design channels; only the principal has a bridge and field gate.
export const mainStand=stands[0];
export const moat={start:-57.5,end:57.5,outerD:-1.75,innerD:-3.65,wall:.15,bottom:-1.2,slabBottom:-1.4,water:-.02,crest:.10,bridgeHalf:2};
export const moats=stands.map(s=>({...moat,id:s.id,s,start:-s.length/2,end:s.length/2,bridge:false}));
export const fenceD=-3.74,railD=-1.67,bridgeLevel=.25;
export const at=(u,d,y=0)=>{const[x,z]=world(mainStand,u,d);return[x,y,z];};
export function moatOutline(m=moats[0]){const p=[],n=Math.ceil(m.end-m.start);for(let i=0;i<=n;i++)p.push(world(m.s,m.start+(m.end-m.start)*i/n,m.outerD));for(let i=n;i>=0;i--)p.push(world(m.s,m.start+(m.end-m.start)*i/n,m.innerD));return p;}
export function bridgeProfile(d){if(d>0||d< -5.8)return 0;if(d>moat.outerD)return bridgeLevel*(-d)/(-moat.outerD);if(d<moat.innerD-.35)return bridgeLevel*(d+5.8)/(moat.innerD-.35+5.8);return bridgeLevel;}
export function bridgeHeight(){return 0;}
export const boundarySegments=[];
function add(a,b,type='mesh',height=2.25,id='main'){boundarySegments.push({a,b,type,height,id});}
function curved(m,u0,u1,d,type,height){const n=Math.ceil((u1-u0)/2.5);for(let i=0;i<n;i++)add(world(m.s,u0+(u1-u0)*i/n,d),world(m.s,u0+(u1-u0)*(i+1)/n,d),type,height,m.id);}
for(const m of moats){
 const ranges=m.bridge?[[m.start,-2],[2,m.end]]:[[m.start,m.end]];
 for(const[a,b]of ranges){curved(m,a,b,fenceD,'mesh',2.25);curved(m,a,b,railD,'rail',1.12);}
 for(const u of[m.start,m.end]){add(world(m.s,u,fenceD),world(m.s,u,2),'mesh',2.25,m.id);add(world(m.s,u,railD),world(m.s,u,fenceD),'rail',1.12,m.id);}
 if(m.bridge)for(const u of[-2,2])add(world(m.s,u,railD),world(m.s,u,fenceD),'bars',2.35,m.id);
}

// The old bridge/service gate was removed. This leaf protects the player stair exit.
const hinge=world(mainStand,tunnel.gateU,-4.88);
export const gate={x:hinge[0],z:hinge[1],width:3.30,travel:Math.PI/2,height:2.35,thickness:.12,duration:2.8,level:0};
export const gateState={progress:0,target:0,blocked:false};
export function resetGate(){Object.assign(gateState,{progress:0,target:0,blocked:false});}
export function gateSegment(progress=gateState.progress){const a=progress*Math.PI/2;return{a:[gate.x,gate.z],b:[gate.x+gate.width*Math.cos(a),gate.z+gate.width*Math.sin(a)]};}
export function segmentDistance(x,z,a,b){const dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz||1)));return Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz);}
export function toggleGate(){gateState.target=gateState.target?0:1;gateState.blocked=false;}
export function gateInReach(body){return (body.floor??0)>-.4&&Math.hypot(body.x-gate.x-gate.width/2,body.z-gate.z)<5.5;}
export function advanceGate(dt,body){
 const old=gateState.progress,delta=Math.min(Math.max(dt,0),.12)/gate.duration;
 const next=old<gateState.target?Math.min(gateState.target,old+delta):Math.max(gateState.target,old-delta);
 gateState.blocked=false;if(next===old)return false;
 // Sample the complete angular sweep at < 0.025 m tip spacing, including both ends.
 const n=Math.max(1,Math.ceil(Math.abs(next-old)*Math.PI/2*gate.width/.025));
 if(body&&(body.floor??0)>-.4)for(let i=0;i<=n;i++){const s=gateSegment(old+(next-old)*i/n);if(segmentDistance(body.x,body.z,s.a,s.b)<.3+gate.thickness+.025){gateState.blocked=true;return false;}}
 gateState.progress=next;return true;
}
export function boundariesBlock(x,z,radius=.3,floor=0){
 if(floor<-.5)return false; // The underground volume supplies its own walls and floor.
 for(const m of moats){const{u,d}=local(m.s,x,z);if(u>m.start-radius&&u<m.end+radius&&d>m.innerD-radius&&d<m.outerD+radius)return true;}
 for(const s of boundarySegments)if(segmentDistance(x,z,s.a,s.b)<radius+(s.type==='rail'?.06:.095))return true;
 const s=gateSegment();return segmentDistance(x,z,s.a,s.b)<radius+gate.thickness;
}
