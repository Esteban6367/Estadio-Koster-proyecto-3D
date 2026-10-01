// Local academic coordinates, fitted to the enlarged stadium reservation.
// Street names/topology: Maps consulted 2026-09-06; facade references July 2015.
let seed=92741;function random(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;}
export const streetsX=[-358,-272,-186,-116,127,213,299,385];
export const streetsZ=[-602,-506,-410,-314,-218,-128,130,218,306];
export const roads=[];
for(const x of streetsX)roads.push({axis:'z',at:x,a:-625,b:325,width:x===-116?11:x===127?10:12});
for(const z of streetsZ)roads.push({axis:'x',at:z,a:-450,b:470,width:z===-128?15:z===130?10:12});
// Two offset T junctions, not a cross-road through the stadium.
roads.push({axis:'x',at:20,a:-450,b:-116,width:10},{axis:'x',at:-20,a:127,b:470,width:9});
export const streetNames=[
 {x:-124,z:-94,text:'José Pedro Varela',angle:Math.PI/2},
 {x:-85,z:-139,text:'Av. Clemente Fregeiro',angle:0},
 {x:-72,z:141,text:'Gral. José Garibaldi',angle:Math.PI},
 {x:139,z:98,text:'Manuel Herrero y Espinosa',angle:-Math.PI/2},
 {x:-147,z:30,text:'Rubén Taruselli',angle:Math.PI},
 {x:153,z:-30,text:'Pedro Hors',angle:0}
];
export const houses=[];
function lot(x,z,w,d,front,near,axis='z',patch={}){const height=3.1+Math.floor(random()*3)*2.6+random()*.4;houses.push({x,z,w,d,h:height,front,axis,roof:Math.floor(random()*3),color:Math.floor(random()*9),lit:random()>.28,near,seed:Math.floor(random()*1e6),...patch});}
for(let ix=0;ix<streetsX.length-1;ix++)for(let iz=0;iz<streetsZ.length-1;iz++){
 const x0=streetsX[ix]+13,x1=streetsX[ix+1]-13,z0=streetsZ[iz]+13,z1=streetsZ[iz+1]-13;
 if(x0<114&&x1> -90&&z0<117&&z1> -115)continue;
 // Immediate four fronts have individually placed parcels below.
 if((iz===5&&(ix===2||ix===4))||(ix===3&&(iz===4||iz===6)))continue;
 const near=Math.abs((x0+x1)/2)<245&&Math.abs((z0+z1)/2)<270,max=near?5:4,step=(x1-x0)/max;
 for(let k=0;k<max;k++)for(const side of[-1,1]){const w=step*(.67+random()*.25),d=12+random()*8,x=x0+(k+.5)*step,z=side<0?z0+d/2:z1-d/2;lot(x,z,w,d,side,near);}
 if(z1-z0>100)for(let k=0;k<6;k++)for(const side of[-1,1]){const w=13+random()*5,d=15+random()*8,x=side<0?x0+w/2:x1-w/2,z=z0+38+k*(z1-z0-60)/6;
  if(Math.abs(z-(ix<3?20:-20))<d/2+12)continue;lot(x,z,w,d,side,near,'x');}
}
// Distinct street-facing parcels; sizes and individual boundaries are proposed.
for(const side of[-1,1])for(let i=0;i<13;i++){
 const z=-104+i*17.2;if(Math.abs(z-(side<0?20:-20))<15)continue;
 const depth=12+(i%4)*1.5,frontWidth=12+(i%3)*1.2,setback=side<0?(i%3===0?3:1.2):(i%4===0?4:1.6);
 lot(side<0?-128-setback-depth/2:139+setback+depth/2,z,depth,frontWidth,-side,true,'x',{h:3.15+(i%6===4?2.9:0)+(i%3)*.15,roof:i%3,color:side<0?[2,1,6,7,0,8][i%6]:[1,3,2,8,0,6][i%6],setback,reference:side<0?'Varela 2015':'Hors / entorno CDM 2015'});
 // Back parcels face the next street, without filling the T junction.
 lot(side<0?-169:194,z,11,12,-side,true,'x',{h:3.3+(i%4===2?2.8:0),roof:(i+1)%3});
}
for(const side of[-1,1])for(let i=0;i<12;i++){
 const x=-97+i*18.2;if(Math.abs(x-23)<10)continue; // Gomensoro mouth, offset from corners.
 const d=13+(i%3)*2,setback=1+(i%4)*.6;
 lot(x,side<0?-141-setback-d/2:143+setback+d/2,14+(i%2)*1.5,d,-side,true,'z',{h:3.2+(i%5===2?2.65:0),roof:i%3,color:side<0?[7,2,1,6,0][i%5]:[6,1,8,2,0][i%5],setback,reference:side<0?'Fregeiro 2015':'Garibaldi 2015'});
 lot(x,side<0?-202:202,14,12,side,true,'z',{h:3.3+(i%5===1?2.7:0),roof:(i+1)%3});
}
// Gomensoro is interrupted by the stadium; continuation only beyond each cabecera.
roads.push({axis:'z',at:23,a:-218,b:-128,width:9},{axis:'z',at:23,a:130,b:218,width:9});
// Keep every building envelope clear of every modeled road, including branches.
for(let i=houses.length-1;i>=0;i--){const h=houses[i];if(roads.some(r=>{const along=r.axis==='x'?h.x:h.z,cross=r.axis==='x'?h.z:h.x,ha=r.axis==='x'?h.w/2:h.d/2,hc=r.axis==='x'?h.d/2:h.w/2;return along+ha>r.a-.5&&along-ha<r.b+.5&&Math.abs(cross-r.at)<hc+r.width/2+2;}))houses.splice(i,1);}
// Keep only the first street-facing parcels around the stadium. Filtering after
// generation preserves the exact seeded appearance of those retained houses.
export const originalHouseCount=houses.length;
for(let i=houses.length-1;i>=0;i--)if(!houses[i].reference)houses.splice(i,1);
export const houseFences=houses.filter(h=>h.near).flatMap(h=>{
 const a=h.axis==='x',f=h.front,l=a?h.d:h.w,depth=a?h.w:h.d;
 const at=(u,v,w,d)=>({x:h.x+(a?f*v:u),z:h.z+(a?u:f*v),w:a?d:w,d:a?w:d});
 const out=[at(-l/2,0,.14,depth),at(l/2,0,.14,depth)];
 if(h.setback>1.4){const v=depth/2+h.setback-.35;out.push(at(-l*.28,v,l*.44,.16),at(l*.30,v,l*.40,.16));}
 return out;
});
export const cars=[];
for(let i=0;i<22;i++){const west=i<8,east=i>=8&&i<15;const x=west?-112:east?123:-64+(i-15)*23,z=west?-85+i*25:east?-81+(i-8)*26:127;
 if((west&&Math.abs(z-20)<9)||(east&&Math.abs(z+20)<9))continue;
 cars.push({x,z,w:west||east?1.8:4.3,d:west||east?4.3:1.8,angle:west||east?0:Math.PI/2,color:i%5});}
// Four immediate streets; shared by rendered fixtures and pedestrian collision.
export const urbanPoles=[
 ...[-108,120].flatMap(x=>Array.from({length:9},(_,i)=>({x,z:-112+i*28,dx:x<0?-1:1,dz:0,street:x<0?'Varela':'Herrero'}))),
 ...[-118,138].flatMap(z=>Array.from({length:8},(_,i)=>({x:-98+i*28,z,dx:0,dz:-1,street:z<0?'Fregeiro':'Garibaldi'})))
].filter(p=>!(p.z===-118&&Math.abs(p.x-43)<7));
export const urbanTrees=[...Array.from({length:12},(_,i)=>({x:-103,z:-95+i*17,seed:i})).filter(t=>Math.abs(t.z)>62),...Array.from({length:7},(_,i)=>({x:-68+i*25,z:-116,seed:i+15})),...houses.filter((h,i)=>i%8===0&&(h.near||i%24===0)).map(h=>({x:h.x+(h.axis==='x'?h.front*(h.w/2+2):h.w*.4),z:h.z+(h.axis==='x'?h.d*.3:h.front*(h.d/2+2)),seed:h.seed}))];
export const siteBounds={west:-100,east:107,north:-115,south:115};
export const fences=[{x:siteBounds.west,z:88.5,w:.28,d:53},{x:siteBounds.east,z:0,w:.28,d:230}];
for(const z of[siteBounds.north,siteBounds.south])for(const[a,b]of[[siteBounds.west,38],[48,siteBounds.east]])fences.push({x:(a+b)/2,z,w:b-a,d:.28});
export const walkBounds={minX:-240,maxX:245,minZ:-245,maxZ:210};
export const walkwayPosts=[-97,57].flatMap(x=>[-55,0,55].map(z=>({x,z:x<0&&z===0?-5:z})));
