import {mainV,mainD} from './main-plan.js';
import {platform,platformAt,platformNeckAtV,platformBlocked,platformBenchVs,platformBenchRanges,platformFloor} from './central-platform-layout.js';
import {passageAt,passageRanges} from './passage-profile.js';
import {dimensions as D} from './dimensions.js';
// Proposed metres. +u = left entering toward the field; d increases toward the street.
// The photographed corridor stops before the lower seating wings, without widening.
const passageEnd=D.main.upperFront/2-.28;
export const publicLayout={half:2.7,portalD:33.18,rampStart:8.5,rampTop:4.5,frontY:.72,shortRise:.18,shortTread:.44,endU:passageEnd,passFront:8.5,passBack:12.5,passY:0,stairFront:10.5,stairBack:12.5,stairSteps:24,stairRise:.175,stairTread:.30,galleryY:4.2,galleryFront:12.5,galleryBack:D.main.upperStart,doorD:29.2,doorWidth:1.1,doorDepth:.30};
// Off-centre access interpreted from the violet photo annotation (not surveyed).
publicLayout.axis=-20;
const P=publicLayout;
// Inner face of the new end returns, shared by floor and navigation.
export const passageEndAt=()=>P.endU;
export const publicStairs=[{id:'izquierda',foot:P.axis+3.25,dir:1},{id:'derecha',foot:P.axis-3.25,dir:-1}].map(s=>({...s,top:s.foot+s.dir*P.stairSteps*P.stairTread,end:s.foot+s.dir*(P.stairSteps*P.stairTread+2)}));
export const stairAt=(u,d)=>d>=P.stairFront&&d<=P.stairBack?publicStairs.find(s=>{const t=(u-s.foot)*s.dir;return t>=0&&t<=P.stairSteps*P.stairTread+2;}):null;
export const stairHeight=(s,u)=>P.passY+Math.min(P.stairSteps,Math.max(0,Math.floor(((u-s.foot)*s.dir+1e-6)/P.stairTread)+1))*P.stairRise;
export const publicRects=[{u0:P.axis-P.half,u1:P.axis+P.half,d0:0,d1:P.portalD+.15},{u0:-P.endU,u1:P.endU,d0:P.passFront,d1:P.passBack},{u0:P.axis-P.half-P.doorDepth,u1:P.axis-P.half,d0:P.doorD-P.doorWidth/2,d1:P.doorD+P.doorWidth/2}];
export const publicAt=(u,d,pad=0)=>passageAt(u,d,pad)||publicRects.filter((r,i)=>i!==1).some(r=>u>=r.u0-pad&&u<=r.u1+pad&&d>=r.d0-pad&&d<=r.d1+pad);
export function publicFloor(u,d){
 const stair=stairAt(u,d);if(stair)return stairHeight(stair,u);
 if(d>=P.passFront&&d<=P.passBack)return P.passY;
 if(Math.abs(u-P.axis)>P.half+.01)return 0;
 // Retained transition to the existing lower public ring (not an opening to the field).
 if(d<2)return 0;if(d<3.76)return Math.min(P.frontY,(Math.floor((d-2+1e-6)/P.shortTread)+1)*P.shortRise);
 if(d<=P.rampTop)return P.frontY;
 if(u>=P.axis)return Math.max(0,P.frontY*(P.rampStart-d)/(P.rampStart-P.rampTop));
 return Math.max(0,P.frontY-Math.floor((d-P.rampTop+1e-6)/P.shortTread)*P.shortRise);
}
export function publicBlocked(u,d){
 if(!publicAt(u,d))return true;const h=publicFloor(u,d);if(d<1.65)return false;
 for(const[du,dd]of[[.3,0],[-.3,0],[0,.3],[0,-.3]]){
  const a=u+du,b=d+dd;if(b<0||b>P.portalD+.14)continue;
  if(b>P.passBack&&b<P.galleryBack&&publicStairs.some(s=>{const t=(a-s.top)*s.dir;return t>.32&&t<1.68;})&&h>P.galleryY-.01)continue;
  if(!publicAt(a,b))return true;
 }
 if(d>P.rampTop+.05&&d<P.rampStart-.03&&Math.abs(u-P.axis)<.34)return true;
 // Unconfirmed room: a real jamb and closed leaf, not a deep box.
 if(u<P.axis-P.half+.19&&Math.abs(d-P.doorD)<.85)return true;
 for(const s of publicStairs){const t=(u-s.foot)*s.dir,L=P.stairSteps*P.stairTread+2;
  if(t>-.12&&t<L+.3&&Math.abs(d-(P.stairFront-.10))<.38)return true;
  if(t>L-.32&&t<L+.35&&d>P.stairFront-.35)return true;
 }
 return false;
}
export function upperPassageBlocked(u,d,h){
 if(h<P.galleryY-.01||h>5.25||d<=12.2||d>=13.06||Math.abs(u)>passageEndAt(d)+.3)return false;
 if(Math.abs(u)<platform.stairHalf-.30&&Math.abs(h-P.galleryY)<.03)return false;
 return !publicStairs.some(s=>{const t=(u-s.top)*s.dir;return t>.30&&t<1.70;});
}
// Red annotation: central horizontal platform, with the public passage beneath.
// The previous sloping cover at u=22..44 is removed; these remain model dimensions.
export const coveredPassage={u0:-platform.neckHalf,u1:platform.neckHalf,d0:8.5,d1:12.5,slab:.22,top:platform.top,soffitFront:3.14,soffitBack:3.14,proposed:true};
export const coveredPassageAt=(u,d)=>platformNeckAtV(u,mainV(u,d));
// The flat central deck is a separate slab, never the old generic stepped tier.
export function passageCuts(d,pad=0){return passageRanges(d,pad);}
export function publicGradeCuts(d){const out=[];if(d<10.5)out.push([P.axis-P.half,P.axis+P.half]);if(d>=8.5&&d<12.5)out.push(...passageCuts(d));return out;}
export const deckOpenings=publicStairs.map(s=>({u0:Math.min(s.foot,s.end)-.25,u1:Math.max(s.foot,s.end)+.25,d0:P.stairFront-.22,d1:P.passBack}));
export const deckOpeningAt=(u,d,pad=0)=>deckOpenings.some(r=>u>r.u0-pad&&u<r.u1+pad&&d>r.d0-pad&&d<r.d1+pad);
export const centralDeckAt=platformAt;
export const centralDeckFloor=platformFloor;
export const centralBenchDepths=platformBenchVs.map(v=>mainD(0,v));
export const centralBenchRanges=d=>platformBenchRanges(mainV(0,d));
export const centralDeckBlocked=platformBlocked;
export const mainMiddleStep=(D.main.upperStart+D.main.upperDepth-2-D.main.upperStart)/D.main.upperSteps;
export const publicRoofSlot={d0:8.3,d1:12.8,u0:-50.944,u1:50.944};
export const inPublicRoofSlot=(u,d)=>d>=8.3&&d<12.8&&Math.abs(u)<50.944;
export function vestibuleSoffit(d){
 if(Math.abs(P.axis)<4&&d>=D.main.cabinFront&&d<=D.main.cabinBack+.15)return D.main.cabinFloor-.22;
 const rise=(a,b,step)=>Math.max(0,Math.ceil((Math.max(0,Math.min(d-a,b-a))-1e-6)/step))*.21;
 return rise(2,10.5,.425)+rise(D.main.upperStart,D.main.upperStart+D.main.upperDepth-2,mainMiddleStep)-.22;
}
export const vestibuleSections=(()=>{const points=[12.76,D.main.upperStart,D.main.cabinFront,D.main.cabinBack,D.main.cabinBack+.15,30.5,32.5,33];for(let i=0;i<=D.main.upperSteps;i++)points.push(D.main.upperStart+i*mainMiddleStep);const a=[...new Set(points.map(d=>+d.toFixed(6)))].sort((a,b)=>a-b);return a.slice(0,-1).map((d,i)=>({d0:d,d1:a[i+1],top:vestibuleSoffit((d+a[i+1])/2)}));})();

// v18: reserve actual masonry thickness, instead of embedding it in the tiers.
export function publicSolidCuts(d){
 const cuts=[];
 if(d<10.5){const h=d<2?P.half:2.94;cuts.push([P.axis-h,P.axis+h]);}
 if(d>=8.26&&d<12.5)cuts.push(...passageCuts(d,.24));
 if(d>=12.5&&d<12.76){
  let ranges=[[-P.endU-.24,P.endU+.24]];
  for(const stair of publicStairs){const a=Math.min(stair.top,stair.end),b=Math.max(stair.top,stair.end);ranges=ranges.flatMap(([l,r])=>b<=l||a>=r?[[l,r]]:[[l,Math.max(l,a)],[Math.min(r,b),r]].filter(([x,y])=>y>x));}
  cuts.push(...ranges);
 }
 return cuts;
}
// Opaque raised side panels are removed. Only tier containment remains here.
export const frontRetaining={u0:P.axis+2.7,u1:P.axis+2.94,d0:2,d1:8.26};

export const coveredSoffit=d=>coveredPassage.soffitFront+(coveredPassage.soffitBack-coveredPassage.soffitFront)*(d-coveredPassage.d0)/(coveredPassage.d1-coveredPassage.d0);
