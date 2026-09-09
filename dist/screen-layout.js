import {stands,world} from './stadium-layout.js';
// Rear of the north stand, below the roof's sightline envelope; proposed dimensions.
export const screenLayout={d:30.2,y:13.18,width:10.6,height:3.0,tilt:.025};
export const screenPosition=world(stands[1],0,screenLayout.d);
export const screenPosts=[-5.65,5.65].map(u=>{const[x,z]=world(stands[1],u,screenLayout.d);return{x,z,r:.25};});
