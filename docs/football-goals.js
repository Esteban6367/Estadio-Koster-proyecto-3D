import * as T from './three.module.min.js';
import {pitchDimensions as P} from './dimensions.js';
export const goalSpec={width:P.goalWidth,height:P.goalHeight,radius:.06,ground:.038,depth:2.4,mesh:.12};
export const goalPosts=[-1,1].flatMap(s=>[-1,1].map(side=>({x:side*(P.goalWidth/2+.06),z:s*P.halfLength,r:.065})));
export function addFootballGoals(scene,{mesh,merge,box,mats}){
 const nets=new T.Group();nets.name='Arcos · redes con profundidad';scene.add(nets);
 const frameMaterial=new T.MeshStandardMaterial({color:0xf2f3ee,roughness:.33,metalness:.30});
 const ropeMaterial=new T.MeshStandardMaterial({color:0xe8e6dc,roughness:.95,side:T.DoubleSide,transparent:true,opacity:.94,depthWrite:false});
 const frames=[];
 for(const sign of[-1,1]){
  const z=sign*P.halfLength,H=P.goalHeight+.06+.038,X=P.goalWidth/2+.06,y0=.038;
  const pt=(x,y,d)=>new T.Vector3(x,y,z+sign*d);
  const pipe=(a,b,r,mat=frameMaterial,segments=20)=>{
   const delta=b.clone().sub(a),g=new T.CylinderGeometry(r,r,delta.length(),segments);
   g.applyQuaternion(new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize()));g.translate(...a.clone().add(b).multiplyScalar(.5).toArray());const o=mesh(g,mat);o.name='Arco · perfil de aluminio';frames.push(o);return o;
  };
  for(const x of[-X,X]){
   pipe(pt(x,y0,0),pt(x,H-.08,0),.06);
   const corner=new T.TorusGeometry(.08,.06,12,16,Math.PI/2);if(x<0)corner.rotateZ(Math.PI/2);corner.translate(x-Math.sign(x)*.08,H-.08,z);const joint=mesh(corner,frameMaterial);joint.name='Arco · unión curva soldada';frames.push(joint);
   // Low rear ground frame and slender external net tension posts.
   pipe(pt(x,y0+.025,.06),pt(x,y0+.025,2.4),.025);
   pipe(pt(x,H-.10,.09),pt(x,2.42,2.35),.014,mats.steel,10);
   pipe(pt(x,0,2.45),pt(x,2.65,2.45),.026,mats.steel,12);
   for(const y of[.28,.72,1.18,1.66,2.14])box(x,y, z+sign*.067,.032,.035,.024,frameMaterial);
  }
  pipe(pt(-X+.08,H,0),pt(X-.08,H,0),.06);
  pipe(pt(-X,y0+.025,2.4),pt(X,y0+.025,2.4),.025);
  // Each panel has a slight tension sag; its perimeter meets frame/support cords.
  const back=(u,v)=>pt((u-.5)*2*X,y0+v*(2.40-y0),2.4+.09*Math.sin(Math.PI*u)*Math.sin(Math.PI*v));
  const roof=(u,v)=>pt((u-.5)*2*X,H+(2.40-H)*v-.06*Math.sin(Math.PI*u)*Math.sin(Math.PI*v),.075+v*(2.4-.075));
  const side=(side,u,v)=>pt(side*(X+.04*Math.sin(Math.PI*u)*Math.sin(Math.PI*v)),y0+v*(H+(2.4-H)*u-y0),.075+u*(2.4-.075));
  const cords=[],linePositions=[];
  function cord(points){
   for(let i=1;i<points.length;i++)linePositions.push(...points[i-1].toArray(),...points[i].toArray());
   const path=new T.CatmullRomCurve3(points);cords.push(new T.TubeGeometry(path,Math.max(2,points.length-1),.0022,4,false));
  }
  function panel(fn,nu,nv){
   for(let i=0;i<=nu;i++)cord(Array.from({length:nv+1},(_,j)=>fn(i/nu,j/nv)));
   for(let j=0;j<=nv;j++)cord(Array.from({length:nu+1},(_,i)=>fn(i/nu,j/nv)));
  }
  const across=Math.round(2*X/.12),deep=20,high=20;
  panel(back,across,high);panel(roof,across,deep);for(const sideSign of[-1,1])panel((u,v)=>side(sideSign,u,v),deep,high);
  const detailed=new T.Mesh(merge(cords),ropeMaterial);cords.forEach(g=>g.dispose());detailed.name='Red · cordón tejido '+sign;detailed.userData.skipBake=true;detailed.userData.netLod='near';detailed.castShadow=false;detailed.receiveShadow=true;nets.add(detailed);
  const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(linePositions,3));
  const far=new T.LineSegments(geometry,new T.LineBasicMaterial({color:0xe1e3dc,transparent:true,opacity:.38}));far.name='Red · vista lejana '+sign;far.userData.netLod='far';far.visible=false;nets.add(far);
 }
 return{nets,frames,spec:goalSpec};
}
