import {stands,world,flights,flightStep} from './stadium-layout.js';
// Existing LED transferred to the retained south stand, facing the playing field.
export const screenStand=stands.find(s=>s.id==='south');
const rear=flights(screenStand).reduce((h,[a,b])=>h+Math.ceil((b-a-1e-6)/flightStep(screenStand,a))*.21,0);
export const screenLayout={d:screenStand.depth+1.7,y:rear+2.89,width:10.6,height:3.0,tilt:.025};
export const screenPosition=world(screenStand,0,screenLayout.d);
export const screenPosts=[-5.65,5.65].map(u=>{const[x,z]=world(screenStand,u,screenLayout.d);return{x,z,r:.25};});
