import * as T from './three.module.min.js';
// Pitchside review monitor inspired by the articulated Tottenham RRA equipment.
// Metric dimensions are a local adaptation; the display is an illustrative demo.
export const varStation={x:-38.65,z:0,w:1.16,d:1.18,screenY:1.64};
export const varObstacles=[{x:varStation.x,z:0,w:1.16,d:1.18}];
export function addVarStation(scene,{box,beam,mesh,mats,sign,setScope}){
 setScope('var');const v=varStation;
 const black=new T.MeshStandardMaterial({color:0x171e24,roughness:.57,metalness:.42});
 const rubber=new T.MeshStandardMaterial({color:0x15191b,roughness:.96});
 const metal=mats.steel.clone();metal.roughness=.36;
 // Stable low base, service cabinet and twin articulated mast.
 box(v.x,.075,0,1.05,.10,1.1,black);
 for(const x of[v.x-.40,v.x+.40])for(const z of[-.43,.43])box(x,.028,z,.16,.056,.16,rubber);
 box(v.x-.22,.39,0,.42,.55,.60,black);
 for(const z of[-.22,.22]){
  beam([v.x-.33,.18,z],[v.x-.14,1.12,z],.043,black);
  beam([v.x-.14,1.12,z],[v.x+.35,1.52,z],.032,metal);
 }
 for(const [x,y]of[[v.x-.14,1.12],[v.x+.35,1.52]]){
  beam([x,y,-.29],[x,y,.29],.052,black);
  for(const z of[-.30,.30]){const cap=new T.Mesh(new T.CylinderGeometry(.042,.042,.018,16),metal);cap.rotation.x=Math.PI/2;cap.position.set(x,y,z);scene.add(cap);}
 }
 const sx=v.x+.38;
 box(sx,v.screenY,0,.095,.70,1.13,black);
 box(sx-.075,v.screenY,0,.06,.50,.91,black);
 // Slim antiglare hood, ventilation and concealed cable conduit.
 box(sx+.10,v.screenY+.36,0,.31,.032,1.18,black);
 for(const z of[-.575,.575])box(sx+.095,v.screenY+.07,z,.29,.56,.025,black);
 for(let z=-.36;z<=.37;z+=.09)box(sx-.109,v.screenY-.05,z,.009,.25,.025,rubber);
 beam([sx-.15,1.54,0],[v.x-.27,.58,0],.016,rubber);
 const c=document.createElement('canvas');c.width=1024;c.height=576;const ctx=c.getContext('2d');
 ctx.fillStyle='#101c24';ctx.fillRect(0,0,1024,576);ctx.fillStyle='#225c36';ctx.fillRect(24,66,976,430);
 ctx.fillStyle='#337445';for(let i=0;i<10;i+=2)ctx.fillRect(24+i*97.6,66,97.6,430);
 ctx.fillStyle='#d7e2da';for(const [x,y,w,h]of[[62,104,900,3],[62,454,900,3],[62,104,3,350],[959,104,3,350],[510,104,3,350],[62,185,160,3],[220,185,3,190],[62,373,160,3],[800,185,160,3],[800,185,3,190],[800,373,160,3]])ctx.fillRect(x,y,w,h);
 for(const [x,y,col]of[[620,234,'#e8ecf1'],[665,277,'#2263c0'],[681,315,'#e8ecf1'],[452,363,'#2263c0']]){ctx.fillStyle=col;ctx.fillRect(x,y,12,21);}
 ctx.fillStyle='#eef4f8';ctx.textAlign='left';ctx.font='bold 25px Arial';ctx.fillText('VAR  /  REVISIÓN',28,40);ctx.font='20px Arial';ctx.fillText('VISTA ILUSTRATIVA · SIN SEÑAL EN VIVO',28,543);
 ctx.fillStyle='#91b2c6';ctx.fillRect(360,511,620,3);
 const tx=new T.CanvasTexture(c);tx.colorSpace=T.SRGBColorSpace;tx.anisotropy=4;
 const screen=mesh(new T.PlaneGeometry(1.02,.574),new T.MeshBasicMaterial({map:tx,toneMapped:false}),false);
 screen.position.set(sx+.050,v.screenY,0);screen.rotation.y=Math.PI/2;screen.name='VAR · monitor de revisión (demostración)';
 const label=sign('VAR',.43,.18);label.position.set(v.x+.008,.45,0);label.rotation.y=Math.PI/2;scene.add(label);
 // Painted review area outside the field and track, no raised platform or rails.
 const paint=new T.MeshStandardMaterial({color:0xe8ede9,roughness:.97});
 for(const z of[-1.45,1.45])box(-37.95,.049,z,2.9,.006,.055,paint);
 for(const x of[-39.4,-36.5])box(x,.049,0,.055,.006,2.9,paint);
 setScope('site');return{screen,position:v,obstacles:varObstacles};
}
