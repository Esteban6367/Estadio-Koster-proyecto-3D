// Exterior interpretation of the supplied CDM photographs. Existing footprints retained.
export function addCdmVolume(v,{box,envelope=box,beam,sheet,gable,mats,roof,glass}){
 const {x,z,w,d,h,office=false,service=false}=v,west=x-w/2,east=x+w/2,south=z+d/2,north=z-d/2;
 const concrete=mats.cdmConcrete||mats.wall,blue=mats.cdmBlue||mats.blue;
 envelope(x,h/2,z,w,h,d,concrete);
 box(x,.23,z,w+.08,.46,d+.08,mats.dark);
 // Blue upper metal skin, with narrow light joints; low masonry remains visible.
 const bandBottom=office?4.5:service?3.5:5.0;
 envelope(x,(h+bandBottom)/2,z,w+.08,h-bandBottom,d+.08,blue);
 if(office){box(x,h-.8,south+.10,w,.95,.13,mats.dark);}
 else for(let zz=north+1.5,i=0;zz<south-1;zz+=4.7,i++){
  const color=i%4===1||i%5===3?mats.wall:mats.cdmMid;
  box(west-.072,(h+bandBottom)/2,zz,.065,h-bandBottom-.25,i%3===0?.33:.62,color);
 }
 // Folded ridge and two pitched roof slopes, standing seams at metre scale.
 const ridge=office?.30:service?.55:1.25,span=w/2+.42,angle=Math.atan2(ridge,span);
 for(const side of[-1,1]){
  sheet(x+side*span/2,h+.22+ridge/2,z,Math.hypot(span,ridge),.15,d+.85,roof,-side*angle);
 }
 for(const zz of[north,south]){
  box(x,h+.07,zz,w+.08,.16,.14,blue);
  gable(x,h+.14,zz,w+.08,ridge,.14,blue);
 }
 for(const zz of[north-.43,south+.43]){
  beam([west-.4,h+.2,zz],[x,h+.2+ridge,zz],.055,mats.dark);
  beam([x,h+.2+ridge,zz],[east+.4,h+.2,zz],.055,mats.dark);
 }
 beam([x,h+.25+ridge,north-.43],[x,h+.25+ridge,south+.43],.06,mats.dark);
 for(const xx of[west-.42,east+.42]){
  beam([xx,h+.16,north-.42],[xx,h+.16,south+.42],.075,mats.dark);
  for(const zz of[north+.7,south-.7]){beam([xx,h+.16,zz],[xx,.3,zz],.045,mats.steel);box(xx,.11,zz,.25,.07,.3,mats.dark);}
 }
 // Dark recessed reveals and a separate, restrained glass pane. The interior is closed.
 function opening(face,along,y,width,height,lit=false){
  const at=(a,b,ww,hh,depth,offset,mat)=>face==='west'?box(west-offset,b,a,depth,hh,ww,mat):box(a,b,south+offset,ww,hh,depth,mat);
  at(along,y,width+.24,height+.24,.04,.055,mats.dark);
  at(along,y,width,height,.035,.09,lit?glass:mats.glass);
  for(const sign of[-1,1]){at(along+sign*(width+.08)/2,y,.07,height+.17,.17,.13,mats.steel);at(along,y+sign*(height+.08)/2,width+.17,.065,.17,.13,mats.steel);}
  at(along,y-height/2-.1,width+.30,.10,.30,.18,concrete);
  if(width>1.8)at(along,y,.055,height,.10,.15,mats.steel);
 }
 if(!office){for(let zz=north+3.5;zz<south-2;zz+=5.5)opening('west',zz,2.15,.9,1.5);}
 else {for(let zz=north+2.3;zz<south-1;zz+=4.5)opening('west',zz,2.1,1.15,1.8);for(let xx=west+2;xx<east-1;xx+=3.3)opening('south',xx,6.35,2.7,1.15,true);}
 for(let xx=west+3;xx<east-1.5;xx+=6){if(Math.abs(xx-x)>2.5)opening('south',xx,2.1,1.15,1.65);}
 // Flush service door with a shallow canopy and pavement-clear supports fixed to wall.
 box(x,1.37,south+.08,2.65,2.74,.12,mats.dark);
 for(const dx of[-1.37,0,1.37])box(x+dx,1.4,south+.17,.07,2.85,.13,mats.steel);
 box(x,2.84,south+.17,2.81,.075,.15,mats.steel);
 for(const dx of[-.18,.18])box(x+dx,1.1,south+.23,.035,.28,.07,mats.steel);
 box(x,3.12,south+.60,3.2,.10,1.2,roof);
 for(const dx of[-1.35,1.35])beam([x+dx,2.6,south+.1],[x+dx,3.1,south+1.15],.032,mats.steel);
}
