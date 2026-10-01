import {stairSoffit,playerLevel} from './underground-layout.js';
// Proposed player facilities, in the main stand's curved u/d coordinates (metres).
export const facilities={floor:playerLevel,ceiling:2.8,roomCeiling:3.05,tunnelHalf:1.6,portalD:2,backD:14.6};
export const voids=[{u0:-1.84,u1:1.84,d0:2,d1:12.5},{u0:-17.25,u1:17.25,d0:12.5,d1:14.8},...[-1,1].map(side=>({u0:side<0?-17.25:4.75,u1:side<0?-4.75:17.25,d0:14.8,d1:28.25}))];
export const within=(r,u,d,pad=0)=>u>=r.u0-pad&&u<=r.u1+pad&&d>=r.d0-pad&&d<=r.d1+pad;
export function interiorAt(u,d){return voids.slice(1).some(r=>within(r,u,d));}
export {stairSoffit};
export function hollowRanges(u0,u1,d0,d1){const cuts=voids.filter(r=>d0<r.d1-1e-5&&d1>r.d0+1e-5);let ranges=[{a:u0,b:u1,hollow:false}];for(const cut of cuts)ranges=ranges.flatMap(r=>r.b<=cut.u0||r.a>=cut.u1?[r]:[{a:r.a,b:Math.min(r.b,cut.u0),hollow:r.hollow},{a:Math.max(r.a,cut.u0),b:Math.min(r.b,cut.u1),hollow:true},{a:Math.max(r.a,cut.u1),b:r.b,hollow:r.hollow}].filter(v=>v.b-v.a>1e-5));return ranges;}
export const interiorWalls=[],interiorFurniture=[];
function wall(u0,d0,u1,d1,height=2.8,thickness=.16){interiorWalls.push({u0,d0,u1,d1,height,thickness});}
// Tunnel sides; their heads meet the intermediate circulation above.
// The former at-grade passage is now a private descending stair below public steps.
wall(-17.16,12.58,-1.84,12.58);wall(1.84,12.58,17.16,12.58);
wall(-17.16,12.58,-17.16,28.16,3.05);wall(17.16,12.58,17.16,28.16,3.05);
wall(-4.84,14.72,4.84,14.72);
for(const side of[-1,1]){
 const w=(a,d,b,e,h=3.05,t=.16)=>wall(side*a,d,side*b,e,h,t);
 w(4.84,14.72,4.84,28.16);w(4.84,28.16,17.16,28.16);
 // Main dressing-room doorway and the wet-room doorway align on a clear aisle.
 for(const[a,b]of[[4.84,6.5],[8.5,17.16]]){w(a,14.9,b,14.9);w(a,22.9,b,22.9);}
 // Showers and toilet cubicles open toward the central wet-area passage.
 for(const u of[9.3,11.1,12.9,14.7,16.4])w(u,25.5,u,28.05,2.15,.10);
 w(5.05,25.5,6.0,25.5,2.2,.10);w(7.4,25.5,8.3,25.5,2.2,.10);w(8.3,25.5,8.3,28.05,2.2,.10);
 w(6.5,14.9,6.5,16.3,2.35,.07);w(6.5,22.9,6.5,24.3,2.35,.07);
 // Perimeter benches/lockers, island bench and sanitary equipment.
 const add=(u,d,w,t,h=.8)=>interiorFurniture.push({u:side*u,d,w,t,h});
 add(5.55,19.1,.60,6.6,2.1);add(16.45,19.1,.60,6.6,2.1);add(11.8,21.9,7.7,.65,2.1);
 add(11.0,18.8,2.7,.72,.5);add(16.55,24.2,.65,1.8,.9);
 add(6.6,27.45,.7,.95,.8);
}
const segmentDistance=(u,d,w)=>{const x=w.u1-w.u0,z=w.d1-w.d0,t=Math.max(0,Math.min(1,((u-w.u0)*x+(d-w.d0)*z)/(x*x+z*z||1)));return Math.hypot(u-w.u0-t*x,d-w.d0-t*z);};
export function interiorBlocked(u,d,r=.3){return interiorWalls.some(w=>segmentDistance(u,d,w)<r+w.thickness/2)||interiorFurniture.some(o=>Math.abs(u-o.u)<o.w/2+r&&Math.abs(d-o.d)<o.t/2+r);}
