import {dimensions as D} from './dimensions.js';
const clamp=x=>Math.max(0,Math.min(1,x));
export const ellipticalPlan={mainFrontSag:6.4,mainRearSag:9,mainRatio:.72,southHalfAngle:55*Math.PI/180,southA:40/Math.sin(55*Math.PI/180),southB:37};
function mainProfile(u,d){
 const t=clamp((d-D.main.upperStart)/D.main.upperDepth),half=(D.main.upperFront+(D.main.upperRear-D.main.upperFront)*t)/2;
 const ratio=ellipticalPlan.mainRatio,r=ratio*Math.min(1,Math.abs(u)/half);
 const base=(Math.sqrt(1-r*r)-Math.sqrt(1-ratio*ratio))/(1-Math.sqrt(1-ratio*ratio));
 // C1 termination of the lower wings. Clamping the ellipse at u=45 used to
 // put a visible corner through every lower row. Join its tangent at u=40
 // to the existing flat outer end at u=55, without folding/compressing rows.
 const blend=1-((q)=>q*q*(3-2*q))(clamp((d-D.main.upperStart)/4));
 if(!blend||Math.abs(u)<=40)return base;
 const x=clamp((Math.abs(u)-40)/15),r0=ratio*40/half,den=1-Math.sqrt(1-ratio*ratio);
 const y0=(Math.sqrt(1-r0*r0)-Math.sqrt(1-ratio*ratio))/den;
 const m0=-ratio*ratio*40/(half*half*Math.sqrt(1-r0*r0)*den);
 const lower=(2*x*x*x-3*x*x+1)*y0+(x*x*x-2*x*x+x)*15*m0;
 return base*(1-blend)+Math.max(0,lower)*blend;
}
export function mainBend(u,d=33){const t=clamp((d-2)/6.5),tier=clamp((d-D.main.upperStart)/D.main.upperDepth);return 4+t*(ellipticalPlan.mainFrontSag+(ellipticalPlan.mainRearSag-ellipticalPlan.mainFrontSag)*tier)*mainProfile(u,d);}
export const mainV=(u,d)=>d+mainBend(u,d);
export function mainD(u,v){let lo=v-40,hi=v+200;for(let i=0;i<48;i++){const mid=(lo+hi)/2;if(mainV(u,mid)<v)lo=mid;else hi=mid;}return(lo+hi)/2;}
