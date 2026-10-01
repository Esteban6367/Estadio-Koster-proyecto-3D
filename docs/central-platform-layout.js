import {mainV,mainD} from './main-plan.js';
import {passageFrontV,passageRearV} from './passage-profile.js';
// Photo/video revision: seven shallow terraces descend toward the pitch.
// Four wide rows occupy the lower stand; only the narrow rear neck spans the passage.
export const platform={half:16,neckHalf:6.4,frontV:12.9,frontLevel:2.52,top:4.20,slab:.22,soffit:3.14,wall:.22,guard:.90,stairHalf:1.4,stairFootV:11.48,stairRun:1.42,stairSteps:5,stairRise:.21,stairBase:1.47};
const C=platform;
export const platformBenchVs=[14.10,15.30,16.50,17.70,19.00,20.30,21.60];
export const platformRowEdges=platformBenchVs.slice(1).map((v,i)=>(v+platformBenchVs[i])/2);
export const platformRowIndex=v=>platformRowEdges.filter(b=>v>=b-1e-7).length;
export const platformRowLevel=v=>C.frontLevel+.28*platformRowIndex(v);
export function platformFloorV(u,v){
 const i=platformRowIndex(v),edge=platformRowEdges[i];
 return C.frontLevel+.28*i+(Math.abs(u)<=C.stairHalf&&edge!==undefined&&v>=edge-.30-1e-7?.14:0);
}
export const platformFloor=(u,d)=>platformFloorV(u,mainV(u,d));
export const platformBodyAtV=(u,v,pad=0)=>Math.abs(u)<=C.half+pad&&v>=C.frontV-pad&&v<=passageFrontV(u)+pad;
export const platformNeckAtV=(u,v,pad=0)=>Math.abs(u)<=C.neckHalf+pad&&v>=passageFrontV(u)-pad&&v<=passageRearV(u)+pad;
export const platformAtV=(u,v)=>platformBodyAtV(u,v)||platformNeckAtV(u,v);
export const platformAt=(u,d)=>platformAtV(u,mainV(u,d));
export const platformAccessAt=(u,d)=>Math.abs(u)<=C.stairHalf&&mainV(u,d)>=C.stairFootV&&mainV(u,d)<C.frontV;
export function platformAccessFloor(u,d){const n=Math.max(0,Math.min(C.stairSteps,Math.floor((mainV(u,d)-C.stairFootV+1e-7)/(C.stairRun/C.stairSteps))+1));return C.stairBase+n*C.stairRise;}
export function platformBenchRanges(v){
 const half=platformRowIndex(v)>=4?C.neckHalf-.85:C.half-.85;
 return[[-half,-1.4],[1.4,half]];
}
export function platformBlocked(u,d){
 const v=mainV(u,d);
 for(const[du,dv]of[[-.54,0],[.54,0],[0,.54],[0,-.54]]){
  const a=u+du,b=v+dv;
  if(Math.abs(a)<C.stairHalf-.05&&(b<C.frontV||b>passageRearV(a)))continue;
  if(!platformAtV(a,b))return true;
 }
 return platformBenchVs.some(vv=>v-vv>-.58&&v-vv<.56&&platformBenchRanges(vv).some(([a,b])=>u>a-.30&&u<b+.30));
}
export const platformAccessD=mainD(0,C.stairFootV);
