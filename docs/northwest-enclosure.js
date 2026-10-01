import {whiteGate} from './white-gate.js';
// Local perimeter extension only; existing stand geometry remains untouched.
export const northwestWalls=[
 {id:'extension-porton',x0:-109.94,x1:-106.455,z0:whiteGate.z-.14,z1:whiteGate.z+.14,h0:3.04,h1:3.04},
 {id:'muro-lateral-norte',x0:-109.94,x1:-109.66,z0:-114.86,z1:whiteGate.z-.14,h0:3.04,h1:3.04},
 {id:'union-muro-norte',x0:-109.94,x1:-104,z0:-115.14,z1:-114.86,h0:3.04,h1:3.04},
 {id:'transicion-muro-norte',x0:-104,x1:-100,z0:-115.14,z1:-114.86,h0:3.04,h1:1.80}
];
export const northwestObstacles=northwestWalls.map(w=>({x:(w.x0+w.x1)/2,z:(w.z0+w.z1)/2,w:w.x1-w.x0,d:w.z1-w.z0}));
