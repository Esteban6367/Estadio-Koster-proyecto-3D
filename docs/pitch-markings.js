import {pitchDimensions as P} from './dimensions.js';
// Analytic paint on the turf itself. The markings keep their metric dimensions.
const halfBox=P.penaltyWidth/2,boxZ=P.halfLength-P.penaltyDepth;
const halfGoal=P.goalAreaWidth/2,goalZ=P.halfLength-P.goalAreaDepth,spotZ=P.halfLength-P.penaltySpot;
const gl=n=>Number(n).toFixed(5);
export const pitchMarkingGLSL=`
float kPitchDistance(vec2 p) {
 vec2 q=abs(p);
 float d=min(abs(q.x-${gl(P.halfWidth-.055)}),abs(q.y-${gl(P.halfLength-.055)}));
 d=min(d,abs(p.y));
 d=min(d,abs(length(p)-${gl(P.centreRadius)}));d=min(d,length(p)-.12);
 d=min(d,max(abs(q.x-${gl(halfBox)}),max(${gl(boxZ)}-q.y,0.)));
 d=min(d,max(abs(q.y-${gl(boxZ)}),max(q.x-${gl(halfBox)},0.)));
 d=min(d,max(abs(q.x-${gl(halfGoal)}),max(${gl(goalZ)}-q.y,0.)));
 d=min(d,max(abs(q.y-${gl(goalZ)}),max(q.x-${gl(halfGoal)},0.)));
 float penalty=length(vec2(p.x,q.y-${gl(spotZ)}));
 d=min(d,penalty-.14);d=min(d,max(abs(penalty-${gl(P.centreRadius)}),q.y-${gl(boxZ)}));
 d=min(d,abs(length(q-vec2(${gl(P.halfWidth)},${gl(P.halfLength)}))-1.));return d;
}`;
export function pitchPaintDistance(x,z){const qx=Math.abs(x),qz=Math.abs(z),p=Math.hypot(x,qz-spotZ);
 return Math.min(Math.abs(qx-(P.halfWidth-.055)),Math.abs(qz-(P.halfLength-.055)),Math.abs(z),Math.abs(Math.hypot(x,z)-P.centreRadius),Math.hypot(x,z)-.12,
 Math.max(Math.abs(qx-halfBox),Math.max(boxZ-qz,0)),Math.max(Math.abs(qz-boxZ),Math.max(qx-halfBox,0)),
 Math.max(Math.abs(qx-halfGoal),Math.max(goalZ-qz,0)),Math.max(Math.abs(qz-goalZ),Math.max(qx-halfGoal,0)),
 p-.14,Math.max(Math.abs(p-P.centreRadius),qz-boxZ),Math.abs(Math.hypot(qx-P.halfWidth,qz-P.halfLength)-1));
}
