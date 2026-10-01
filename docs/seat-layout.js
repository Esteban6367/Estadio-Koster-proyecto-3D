import {flights,flightStep,spanAt,world,aisleUs} from './stadium-layout.js';
// Keep every upper bay's seat count and its two aisle setbacks consistent.
// Rigid seats follow the fan; their shells are never stretched to fill a row.
function upperBay(s,d,j){const half=spanAt(s,d)/2,axes=[-half,...aisleUs(s,d),half];return[axes[j]+(j===0?.85:1.98),axes[j+1]-(j===5?.85:1.98)];}
function arc(s,d,l,r){const out=[{u:l,length:0}],n=Math.ceil((r-l)/.15);let length=0,p=world(s,l,d);for(let i=1;i<=n;i++){const u=l+(r-l)*i/n,q=world(s,u,d);length+=Math.hypot(q[0]-p[0],q[1]-p[1]);out.push({u,length});p=q;}return out;}
export function rowSeatUs(s,d){
 if(s.id==='main'&&d<13.5){
  const bay=(dep,j)=>{const half=spanAt(s,dep)/2,axes=[-half,...aisleUs(s,dep),half],gap=k=>k===0||k===6?.85:k===2?3.24:1.98;return[axes[j]+gap(j),axes[j+1]-gap(j+1)];};
  const points=[];for(let j=0;j<6;j++){const [l,r]=bay(d-.3,j),min=Math.min(...[2.25,10.2].map(dep=>{const[a,b]=bay(dep,j);return b-a;})),count=Math.floor(min/.68)+1;
   for(let i=0;i<count;i++)points.push(l+(r-l)*i/(count-1));
  }return points;
 }
 if(s.id==='main'&&d>=13.5){const depth=d-.3,points=[];for(let j=0;j<6;j++){
  const bounds=upperBay(s,depth,j),path=arc(s,depth,...bounds),total=path.at(-1).length;
  const min=Math.min(...[13.6,18,23,28,30.2].map(q=>arc(s,q,...upperBay(s,q,j)).at(-1).length));
  const count=Math.floor(min/.68)+1;
  for(let i=0,k=1;i<count;i++){const target=total*i/(count-1);while(k<path.length-1&&path[k].length<target)k++;const a=path[k-1],b=path[k];points.push(a.u+(b.u-a.u)*(target-a.length)/(b.length-a.length));}
 }return points;}
 const depth=d-.3,half=Math.min(spanAt(s,depth-.27),spanAt(s,depth+.29))/2-.67,points=[0];let last=0;while(last<half){let lo=last,hi=Math.min(half,last+.68);const p=world(s,last,depth);if(Math.hypot(...world(s,hi,depth).map((v,i)=>v-p[i]))<.68-1e-7)break;for(let j=0;j<20;j++){const mid=(lo+hi)/2,q=world(s,mid,depth);if(Math.hypot(q[0]-p[0],q[1]-p[1])<.68)lo=mid;else hi=mid;}last=(lo+hi)/2;points.push(last);}return [...points.slice(1).reverse().map(u=>-u),...points];
}
// Preserve the empty front tread of each pair for lateral circulation. This is a
// centreline navigation corridor, not a measured accessibility certification.
export function rowWalkingLane(s,d){return flights(s).some(([a,b])=>{const step=flightStep(s,a),t=(d-a)/(2*step),phase=t-Math.floor(t);return d>a+.02&&d<b&&phase>.025&&phase<.29;});}

// Metric depth of the warped curved slab, projected perpendicular to each row.
export function seatDepthScale(s,u,d){const a=world(s,u-.001,d),b=world(s,u+.001,d),c=world(s,u,d-.001),e=world(s,u,d+.001),ux=(b[0]-a[0])/.002,uz=(b[1]-a[1])/.002,dx=(e[0]-c[0])/.002,dz=(e[1]-c[1])/.002;return Math.min(1,Math.abs(ux*dz-uz*dx)/Math.hypot(ux,uz));}
