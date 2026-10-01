import {stands,world,local} from './stadium-layout.js';
// v17 academic proposals. Photos establish the low mouth, dry bay and fence types.
export const fieldAccess={bayU0:-6,bayU1:16,railD:-1.67,fenceD:-3.74,
 well:{u0:7,u1:11.52,d0:-7.57,d1:-5.53},
 // Open-topped masonry recess beside the well; outside the sliding lid sweep.
 // Its sloping floor/back are built by underground-model, not an unbounded void.
 railPocket:{u0:7,u1:11.52,d0:-7.89,d1:-7.57},
 dry:{u0:-6,u1:16,d0:-8.05,d1:-1.52},
 cover:{u0:6.86,u1:11.66,d0:-7.71,d1:-5.39,bottom:.14,top:.22,travel:2.44,duration:3.4},
 serviceGate:{u0:2.8,u1:3.9,d:-1.67,height:2.35},
 niche:{u:-10.5,half:.16,bottom:-1.2,spring:-.96,backD:-3.60},
 benches:[]};
export const hatchState={progress:0,target:0,blocked:false};
export const inRect=(r,u,d,p=0)=>u>=r.u0-p&&u<=r.u1+p&&d>=r.d0-p&&d<=r.d1+p;
export const wellAt=(u,d,p=0)=>inRect(fieldAccess.well,u,d,p);
export function coverRect(progress=hatchState.progress){const h=fieldAccess.cover,shift=h.travel*progress;return{u0:h.u0,u1:h.u1,d0:h.d0+shift,d1:h.d1+shift};}
export const coveredAt=(u,d,p=0)=>inRect(coverRect(),u,d,p);
export function resetHatch(open=false){Object.assign(hatchState,{progress:open?1:0,target:open?1:0,blocked:false});}
export function toggleHatch(){hatchState.target=hatchState.target?0:1;hatchState.blocked=false;}
export function hatchInReach(body){const p=local(stands[0],body.x,body.z);return p.d< -4.15&&p.d> -9&&p.u>4.9&&p.u<14.25&&(body.floor??0)>-2.65;}
export function advanceHatch(dt,body){
 const old=hatchState.progress,step=Math.max(0,Math.min(.12,dt))/fieldAccess.cover.duration;
 const next=old<hatchState.target?Math.min(hatchState.target,old+step):Math.max(hatchState.target,old-step);
 hatchState.blocked=false;if(next===old)return false;
 if(body){const p=local(stands[0],body.x,body.z),h=body.floor??0,c=fieldAccess.cover;
  if(h+1.9>c.bottom&&h<c.top+.25){const a=coverRect(old),b=coverRect(next),sweep={u0:a.u0,u1:a.u1,d0:Math.min(a.d0,b.d0),d1:Math.max(a.d1,b.d1)};
   if(inRect(sweep,p.u,p.d,.34)){hatchState.blocked=true;return false;}}
 }
 hatchState.progress=next;return true;
}
export function hatchBlocked(u,d,floor,r=.3){const h=fieldAccess.cover;return floor<h.top-.015&&floor+1.9>h.bottom&&coveredAt(u,d,r);}
export const fieldPoint=(u,d,y=0)=>{const[x,z]=world(stands[0],u,d);return[x,y,z];};
