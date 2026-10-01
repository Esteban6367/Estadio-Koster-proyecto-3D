import * as T from './three.module.min.js';
import {dimensions as D} from './dimensions.js';
// Fit only the stadium reservation, not the distant city. Metres, academic model.
const endExtent=D.end.centreZ+D.end.curve+D.end.depth+5;
export const stadiumBounds={min:[-95,-1,-endExtent],max:[108,35,endExtent]};
export function referenceOrbit(aspect){
 const a=.025,e=aspect<.8?.93:.69,target=new T.Vector3(4,8,0);
 const dir=new T.Vector3(Math.sin(a)*Math.cos(e),Math.sin(e),Math.cos(a)*Math.cos(e));
 const right=new T.Vector3(Math.cos(a),0,-Math.sin(a)),up=new T.Vector3().crossVectors(dir,right);
 const ty=Math.tan(43*Math.PI/360),tx=ty*Math.max(.25,aspect);let r=80;
 for(const x of[stadiumBounds.min[0],stadiumBounds.max[0]])for(const y of[stadiumBounds.min[1],stadiumBounds.max[1]])for(const z of[stadiumBounds.min[2],stadiumBounds.max[2]]){
  const p=new T.Vector3(x,y,z).sub(target);
  r=Math.max(r,p.dot(dir)+Math.max(Math.abs(p.dot(right))/(tx*.88),Math.abs(p.dot(up))/(ty*.76)));
 }
 return{a,e,r,target};
}
export function placeOrbit(camera,orbit){
 camera.position.set(orbit.target.x+Math.sin(orbit.a)*orbit.r*Math.cos(orbit.e),orbit.target.y+Math.sin(orbit.e)*orbit.r,orbit.target.z+Math.cos(orbit.a)*orbit.r*Math.cos(orbit.e));camera.lookAt(orbit.target);
}
export function setDepthRange(camera,mode){
 // Everything in the modeled reservation is below 36 m. Keep a generous margin
 // below that height; increase near only when airborne above all structures.
 const near=mode!=='air'?.12:Math.min(100,Math.max(.2,(camera.position.y-36)*.25));
 const far=1400;if(mode!=='air'&&camera.near!==near||Math.abs(camera.near-near)>.05||camera.far!==far){camera.near=near;camera.far=far;camera.updateProjectionMatrix();}
}
