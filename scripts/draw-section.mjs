import {writeFileSync} from 'node:fs';
import {tunnel,descentFloor,exitFloor,playerLevel} from '../dist/underground-layout.js';
import {moat} from '../dist/boundaries.js';
import {surfaceHeight,stands} from '../dist/physics.js';
const scale=33,x0=95,y0=420,turn=20.55,total=36.9;
const X=q=>x0+q*scale,Y=h=>y0-h*scale;
const num=n=>Number(n.toFixed(3)),pt=(q,h)=>`${num(X(q))},${num(Y(h))}`;
const floor=q=>q<=turn?descentFloor(14-q):exitFloor(q-turn);
const ceiling=q=>q<1.5?playerLevel+2.8:q<18.71?Math.max(tunnel.ceiling,descentFloor(14-q)+2.95):2.8;
const values=Array.from({length:1851},(_,i)=>total*i/1850);
const floorPts=values.map(q=>[q,floor(q)]),roofPts=values.map(q=>[q,ceiling(q)]);
const poly=(pts,fill,stroke='none',extra='')=>`<polygon points="${pts.map(p=>pt(...p)).join(' ')}" fill="${fill}" stroke="${stroke}" ${extra}/>`;
const path=(pts,color,width=1.5,extra='')=>`<polyline points="${pts.map(p=>pt(...p)).join(' ')}" fill="none" stroke="${color}" stroke-width="${width}" ${extra}/>`;
const txt=(x,y,text,size=18,color='#273f50',extra='')=>`<text x="${num(x)}" y="${num(y)}" font-size="${size}" fill="${color}" ${extra}>${text}</text>`;
const line=(x1,y1,x2,y2,color='#627681',extra='')=>`<line x1="${num(x1)}" y1="${num(y1)}" x2="${num(x2)}" y2="${num(y2)}" stroke="${color}" ${extra}/>`;
const leader=(q,h,x,y,text)=>line(X(q),Y(h),x,y+5)+txt(x,y,text,16);
let svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1480" height="920" viewBox="0 0 1480 920"><defs><pattern id="soil" width="12" height="12" patternUnits="userSpaceOnUse"><rect width="12" height="12" fill="#ecebe5"/><path d="M-3 3L3 -3 M0 12L12 0 M9 15L15 9" stroke="#cfcfc3" stroke-width=".65"/></pattern><marker id="arrow" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto"><path d="M0 0L6 3L0 6" fill="#167daf"/></marker></defs><rect width="1480" height="920" fill="#fff"/><g font-family="Arial, sans-serif">`;
svg+=txt(58,55,'LUIS KÖSTER · TÚNEL SUBTERRÁNEO',29,'#153f65','font-weight="700"');
svg+=txt(58,86,'Corte desarrollado del recorrido · Todas las dimensiones son propuestas académicas',17);
svg+=line(58,105,1422,105,'#c7d7df');
svg+=txt(95,143,'BAJO LA TRIBUNA PRINCIPAL',17,'#153f65','font-weight="700"');
svg+=txt(825,143,'ASCENSO PARALELO AL FRENTE',17,'#153f65','font-weight="700"');
// Ground mass and retained public stair outline, then the actual empty player volume.
svg+=poly([[0,0],[total,0],[total,-5.65],[0,-5.65]],'url(#soil)');
const publicPts=Array.from({length:501},(_,i)=>{const q=12*i/500;return[q,surfaceHeight(stands[0],0,14-q)];});
svg+=poly([...publicPts,[12,0],[0,0]],'#cbd3d5','#87979d');
svg+=poly([...floorPts,...roofPts.slice().reverse()],'white');
svg+=poly([...floorPts,...floorPts.slice().reverse().map(([q,h])=>[q,h-.22])],'#879aa4');
svg+=poly([...roofPts,...roofPts.slice().reverse().map(([q,h])=>[q,h+.20])],'#a8b8bf');
svg+=path(floorPts,'#334e5e',1.4)+path(roofPts,'#334e5e',1.2);
svg+=path(publicPts,'#455f70',1.8);
// The moat is continuous across the crossing; its slab is not cut.
const qa=14-moat.outerD,qb=14-moat.innerD;
svg+=poly([[qa,moat.crest],[qb,moat.crest],[qb,moat.slabBottom],[qa,moat.slabBottom]],'#8b9c9d','#526e72');
svg+=poly([[qa+.15,moat.water],[qb-.15,moat.water],[qb-.15,moat.bottom],[qa+.15,moat.bottom]],'#6cb2ae','#387e7d');
svg+=path([[qa+.15,moat.water],[qb-.15,moat.water]],'#167b88',2);
// Public path and protections above the crossing; clear gap from public step to fence.
svg+=path([[12,0],[qa-.1,0]],'#536c79',3);
for(const q of[qa-.08,qb+.09]){svg+=path([[q,0],[q,1.12]],'#486f78',2.3);svg+=path([[q-.12,.6],[q+.12,.6]],'#486f78',1.3);}
// The canopy sits on the retaining wall columns; end gate and landing stay outside the lanes.
for(const q of[turn,turn+4,turn+8,turn+12,turn+15.1])svg+=path([[q,0],[q,2.8]],'#8199a6',2);
svg+=path([[18.71,3.0],[total,3.0]],'#20699a',5);
const gateQ=turn+tunnel.gateU;svg+=path([[gateQ,0],[gateQ,2.35]],'#1c5a7c',5);
svg+=path([[gateQ-.5,2.47],[gateQ+.45,2.47]],'#1c5a7c',2);
// Walking routes are deliberately drawn at different levels.
svg+=path(floorPts.filter((_,i)=>i%18===0).map(([q,h])=>[q,h+.52]),'#1681b5',2,'marker-end="url(#arrow)"');
svg+=path([[12,.30],[15.3,.30]],'#596979',2);
// Break denotes a change in the direction of the section, not a construction joint.
svg+=line(X(turn),182,X(turn),654,'#d39932','stroke-dasharray="6 5"');
svg+=txt(X(turn)+10,639,'GIRO DE 90°',14,'#9d6517','font-weight="700"');
svg+=leader(1,.72,95,206,'Circulación pública sobre el recorrido privado');
svg+=leader(.4,playerLevel,83,358,'Desde vestuarios: −3,60 m');
svg+=leader(13.4,.1,450,336,'Pasillo público a cota 0,00');
svg+=leader((qa+qb)/2,moat.water,571,212,'Fosa llena · agua −0,02 m');
svg+=leader((qa+qb)/2,moat.slabBottom,586,253,'Losa de fondo: −1,40 m');
svg+=leader(18.3,tunnel.roofTop,709,290,'Techo del túnel: −1,65 m');
svg+=leader(26,2.94,890,206,'Marquesina y recinto protegido');
svg+=leader(gateQ,2.1,1220,257,'Portón de jugadores');
svg+=txt(X(total)-15,Y(0)-40,'A la pista y al campo',15,'#273f50','text-anchor="end"');
// Tunnel clear height and complete level change.
const dimX=X(15);svg+=line(dimX,Y(tunnel.floor),dimX,Y(tunnel.ceiling),'#506b7b');
for(const h of[tunnel.floor,tunnel.ceiling])svg+=line(dimX-5,Y(h),dimX+5,Y(h),'#506b7b');
svg+=txt(dimX-12,Y(-3.0),'2,95 m',18,'#153f65','text-anchor="end" font-weight="700"');
svg+=txt(dimX-12,Y(-3.6),'losa a piso',13,'#526b79','text-anchor="end"');
const dx=1393;svg+=line(dx,Y(0),dx,Y(tunnel.floor),'#506b7b');for(const h of[0,tunnel.floor])svg+=line(dx-5,Y(h),dx+5,Y(h),'#506b7b');
svg+=txt(dx+13,Y(-2.4),'4,80 m',16,'#153f65',`transform="rotate(-90 ${dx+13} ${Y(-2.4)})" text-anchor="middle"`);
svg+=txt(X(12.2),Y(tunnel.floor)+43,'Piso −4,80 m',16,'#153f65');
const dim=(a,b,y,label)=>line(X(a),y,X(b),y)+line(X(a),y-5,X(a),y+5)+line(X(b),y-5,X(b),y+5)+txt((X(a)+X(b))/2,y+23,label,14,'#3f5868','text-anchor="middle"');
svg+=dim(1.7,3.62,645,'Descenso: 1,92 m');
svg+=dim(turn+1.6,turn+11.52,645,'Ascenso: 9,92 m');
svg+=`<rect x="58" y="717" width="666" height="126" rx="7" fill="#edf4f7"/><rect x="744" y="717" width="678" height="126" rx="7" fill="#f2f4f3"/>`;
svg+=txt(80,745,'ESCALERAS Y PASO',16,'#153f65','font-weight="700"');
svg+=txt(80,773,'Descenso: 6 × 20 cm. Ascenso: 2 tramos de 13 × 18,46 cm.',16);
svg+=txt(80,799,'Huellas 32 cm · descanso del ascenso 1,60 m · ancho 3,20 m.',16);
svg+=txt(80,825,'Pasamanos en nichos · gálibo con luminarias ≥ 2,60 m.',16);
svg+=txt(766,745,'SEPARACIÓN BAJO LA FOSA',16,'#153f65','font-weight="700"');
svg+=txt(766,773,'Fondo interior −1,20 m · cara inferior de losa −1,40 m.',16);
svg+=txt(766,799,'Techo exterior −1,65 m: separación constructiva de 0,25 m.',16);
svg+=txt(766,825,'Agua continua; el antiguo puente superficial fue retirado.',16);
svg+=txt(58,880,'El giro se despliega para leer el recorrido. Cotas tomadas del modelo 3D; no constituyen un proyecto ejecutivo.',15,'#647580');
svg+=txt(1422,902,'Modelo académico con dimensiones propuestas',13,'#647580','text-anchor="end"');
svg+='</g></svg>';
writeFileSync(new URL('../dist/corte-tunel.svg',import.meta.url),svg);
console.log('Section generated from the model level and stair functions.');
