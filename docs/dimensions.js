// Academic reference dimensions in metres, derived exclusively from the saved V18.
// These are proposed dimensions, not an official survey of Estadio Luis Köster.
export const dimensions=Object.freeze({
 pitch:Object.freeze({length:107,width:70,halfLength:53.5,halfWidth:35,goalWidth:7.32,goalHeight:2.44,penaltyDepth:16.5,penaltyWidth:40.32,goalAreaDepth:5.5,goalAreaWidth:18.32,penaltySpot:11,centreRadius:9.15}),
 track:Object.freeze({width:6,lateralClearance:6,curveStartFromGoal:20,headDepth:42,curveSamples:80,lanes:5}),
 main:Object.freeze({lowerFront:108,lowerRear:110,lowerDepth:11,publicHalf:46.5,upperFront:90,upperRear:100,upperStart:13.5,upperDepth:19,upperSteps:38,cabinFront:29.2,cabinBack:31.3,cabinFloor:12.18,facadeLength:115,baseX:-56,curve:4}),
 end:Object.freeze({lowerWidth:80,upperWidth:117.68099403729362,depth:23,baseDepth:17,curve:10,centreZ:77})
});
export const pitchDimensions=dimensions.pitch;
export const trackDimensions={...dimensions.track,innerHalfWidth:dimensions.pitch.halfWidth+dimensions.track.lateralClearance,straightEnd:dimensions.pitch.halfLength-dimensions.track.curveStartFromGoal};
// Interpretation: the bend starts 20 m BEFORE each goal line, measured along the field axis.
// A quintic transition has zero curvature at the straight; the outer edge is a normal offset.
function bezier(t,ps){const q=ps.map(p=>[...p]);for(let n=q.length-1;n>0;n--)for(let i=0;i<n;i++)for(let k=0;k<2;k++)q[i][k]=q[i][k]*(1-t)+q[i+1][k]*t;return q[0];}
export function trackQuarter(t,offset=0){const c=trackDimensions,w=c.innerHalfWidth,h=c.headDepth,z=c.straightEnd;
 const ps=[[w,z],[w,z+.35*h],[w,z+.66*h],[.64*w,z+.93*h],[.32*w,z+h],[0,z+h]];
 const p=bezier(t,ps),v=bezier(t,ps.slice(1).map((q,i)=>[5*(q[0]-ps[i][0]),5*(q[1]-ps[i][1])])),len=Math.hypot(...v);
 return[p[0]+offset*v[1]/len,p[1]-offset*v[0]/len];
}
export function trackPoints(offset=0){const n=trackDimensions.curveSamples,q=Array.from({length:n+1},(_,i)=>trackQuarter(i/n,offset));
 return [...q,...q.slice(0,-1).reverse().map(([x,z])=>[-x,z]),...q.map(([x,z])=>[-x,-z]),...q.slice(0,-1).reverse().map(([x,z])=>[x,-z])];
}
