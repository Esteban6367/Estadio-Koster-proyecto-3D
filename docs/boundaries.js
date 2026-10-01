import {tunnel} from './underground-layout.js';
import {stands,world,local} from './stadium-layout.js';
import {fieldAccess} from './field-access-layout.js';
export const mainStand=stands[0];
export const moat={start:-stands[0].length/2,end:stands[0].length/2,outerD:-1.75,innerD:-3.65,wall:.15,bottom:-1.2,slabBottom:-1.4,water:-.38,crest:.10,bridgeHalf:2};
export const moats=stands.map(s=>({...moat,id:s.id,s,start:-s.length/2,end:s.length/2,water:s.id==='main'?-.38:-.02,bridge:false}));
export const moatChannels=moats.flatMap(m=>m.id==='main'?[{...m,id:'main-norte',end:fieldAccess.bayU0},{...m,id:'main-sur',start:fieldAccess.bayU1}]:[m]);
export const fenceD=-3.74,railD=-1.67,bridgeLevel=.25;
export const at=(u,d,y=0)=>{const[x,z]=world(mainStand,u,d);return[x,y,z];};
export function moatOutline(m=moatChannels[0]){const p=[],n=Math.ceil(m.end-m.start);for(let i=0;i<=n;i++)p.push(world(m.s,m.start+(m.end-m.start)*i/n,m.outerD));for(let i=n;i>=0;i--)p.push(world(m.s,m.start+(m.end-m.start)*i/n,m.innerD));return p;}
export function bridgeProfile(){return 0;}
export function bridgeHeight(){return 0;}
export const boundarySegments=[];
function add(a,b,type='mesh',height=2.25,id='main',extra={}){boundarySegments.push({a,b,type,height,id,...extra});}
function curved(m,u0,u1,d,type,height,extra={}){const n=Math.ceil((u1-u0)/2.5);for(let i=0;i<n;i++)add(world(m.s,u0+(u1-u0)*i/n,d),world(m.s,u0+(u1-u0)*(i+1)/n,d),type,height,m.s.id,extra);}
for(const m of moatChannels){
 curved(m,m.start,m.end,fenceD,'mesh',2.25);curved(m,m.start,m.end,railD,'rail',1.12);
 for(const u of[m.start,m.end]){
  if(Math.abs(u)===m.s.length/2)add(world(m.s,u,fenceD),world(m.s,u,2),'mesh',2.25,m.s.id);
  add(world(m.s,u,railD),world(m.s,u,fenceD),'rail',1.12,m.s.id);
 }
}
const main=moats[0],access=fieldAccess.serviceGate;
curved(main,fieldAccess.bayU0,access.u0,railD,'bars',2.35);
curved(main,access.u1,fieldAccess.bayU1,railD,'bars',2.35);
add(world(main.s,access.u0,railD),world(main.s,access.u1,railD),'service',2.35,'main');
for(const u of[fieldAccess.bayU0,fieldAccess.bayU1])add(world(main.s,u,railD),world(main.s,u,fenceD),'bars',2.35,'main');
// Low guard around the mouth: cover slides under its raised lower rail.
for(const d of[-7.76,-5.34])add(world(main.s,6.73,d),world(main.s,tunnel.gateU,d),'guard',1.08,'main',{bottom:.30});
add(world(main.s,6.73,-7.76),world(main.s,6.73,-5.34),'guard',1.08,'main',{bottom:.30});
const hinge=world(mainStand,tunnel.gateU,-5.34);
export const gate={x:hinge[0],z:hinge[1],width:2.42,travel:Math.PI/2,swing:-1,height:1.08,thickness:.065,duration:2.8,level:0};
export const gateState={progress:0,target:0,blocked:false};
export function resetGate(){Object.assign(gateState,{progress:0,target:0,blocked:false});}
export function gateSegment(progress=gateState.progress){const a=progress*Math.PI/2;return{a:[gate.x,gate.z],b:[gate.x+gate.width*Math.cos(a),gate.z+gate.swing*gate.width*Math.sin(a)]};}
export function segmentDistance(x,z,a,b){const dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz||1)));return Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz);}
export function toggleGate(){gateState.target=gateState.target?0:1;gateState.blocked=false;}
export function gateInReach(body){return (body.floor??0)>-.4&&Math.hypot(body.x-gate.x-gate.width/2,body.z-gate.z)<3.5;}
export function advanceGate(dt,body){
 const old=gateState.progress,delta=Math.min(Math.max(dt,0),.12)/gate.duration;
 const next=old<gateState.target?Math.min(gateState.target,old+delta):Math.max(gateState.target,old-delta);
 gateState.blocked=false;if(next===old)return false;
 const n=Math.max(1,Math.ceil(Math.abs(next-old)*Math.PI/2*gate.width/.025));
 if(body&&(body.floor??0)>-.4)for(let i=0;i<=n;i++){const s=gateSegment(old+(next-old)*i/n);if(segmentDistance(body.x,body.z,s.a,s.b)<.3+gate.thickness+.025){gateState.blocked=true;return false;}}
 gateState.progress=next;return true;
}
export function boundariesBlock(x,z,radius=.3,floor=0){
 if(floor<-.5)return false;
 for(const m of moatChannels){const{u,d}=local(m.s,x,z);if(u>m.start-radius&&u<m.end+radius&&d>m.innerD-radius&&d<m.outerD+radius)return true;}
 for(const s of boundarySegments)if(s.type!=='service'&&floor<s.height&&segmentDistance(x,z,s.a,s.b)<radius+(s.type==='rail'||s.type==='guard'?.06:.095))return true;
 if(serviceGateBlocks(x,z,radius,floor))return true;
 const p=local(mainStand,x,z);for(const b of fieldAccess.benches)if(Math.abs(p.u-b.u)<b.w/2+radius&&Math.abs(p.d-b.d)<b.t/2+radius&&floor<.52)return true;
 const s=gateSegment();return floor<gate.height&&segmentDistance(x,z,s.a,s.b)<radius+gate.thickness+.03;
}

// The tall pedestrian gate is independent from the low player gate and hatch.
// It swings into the dry enclosure, away from the public front walk (proposal).
const serviceA=world(mainStand,access.u0,access.d),serviceB=world(mainStand,access.u1,access.d);
export const serviceGate={x:serviceA[0],z:serviceA[1],width:Math.hypot(serviceB[0]-serviceA[0],serviceB[1]-serviceA[1]),angle:Math.atan2(serviceB[1]-serviceA[1],serviceB[0]-serviceA[0]),height:access.height,thickness:.035,duration:2.2};
export const serviceGateState={progress:0,target:0,blocked:false};
export function resetServiceGate(){Object.assign(serviceGateState,{progress:0,target:0,blocked:false});}
export function serviceGateSegment(progress=serviceGateState.progress){const g=serviceGate,a=g.angle+progress*Math.PI/2;return{a:[g.x,g.z],b:[g.x+g.width*Math.cos(a),g.z+g.width*Math.sin(a)]};}
export function serviceGateInReach(body){const p=local(mainStand,body.x,body.z);return Math.abs(body.floor??0)<.4&&Math.abs(p.u-(access.u0+access.u1)/2)<1.8&&Math.abs(p.d-access.d)<2.2;}
export function toggleServiceGate(){serviceGateState.target=serviceGateState.target?0:1;serviceGateState.blocked=false;}
export function advanceServiceGate(dt,body){
 const s=serviceGateState,g=serviceGate,step=Math.max(0,Math.min(.12,dt))/g.duration;
 const next=s.progress+Math.sign(s.target-s.progress)*Math.min(Math.abs(s.target-s.progress),step);
 s.blocked=false;if(next===s.progress)return false;
 const n=Math.max(1,Math.ceil(Math.abs(next-s.progress)*Math.PI/2*g.width/.02));
 if(body&&(body.floor??0)<g.height&&(body.floor??0)+1.9>0)for(let i=0;i<=n;i++){const line=serviceGateSegment(s.progress+(next-s.progress)*i/n);if(segmentDistance(body.x,body.z,line.a,line.b)<.3+g.thickness+.02){s.blocked=true;return false;}}
 s.progress=next;return true;
}
export function serviceGateBlocks(x,z,r=.3,floor=0){
 if(floor>=serviceGate.height||floor+1.9<=0)return false;
 const closed=serviceGateSegment(0),line=serviceGateSegment();
 return [closed.a,closed.b].some(p=>Math.hypot(x-p[0],z-p[1])<r+.055)||segmentDistance(x,z,line.a,line.b)<r+serviceGate.thickness+.025;
}
