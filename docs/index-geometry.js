import * as T from './three.module.min.js';
// Weld only identical complete vertices: hard normals, UV seams and colors remain.
export function indexGeometry(g){
 if(g.index||g.attributes.position.count<48)return g;
 const names=Object.keys(g.attributes),map=new Map(),indices=[],values=Object.fromEntries(names.map(n=>[n,[]]));let count=0;
 for(let i=0;i<g.attributes.position.count;i++){
  let key='';for(const name of names){const a=g.attributes[name];for(let j=0;j<a.itemSize;j++)key+=Math.round(a.array[i*a.itemSize+j]*1e5)+',';}
  let index=map.get(key);if(index===undefined){index=count++;map.set(key,index);for(const name of names){const a=g.attributes[name];for(let j=0;j<a.itemSize;j++)values[name].push(a.array[i*a.itemSize+j]);}}indices.push(index);
 }
 if(count>=g.attributes.position.count*.94)return g;
 const out=new T.BufferGeometry();for(const name of names)out.setAttribute(name,new T.Float32BufferAttribute(values[name],g.attributes[name].itemSize));out.setIndex(indices);out.groups=g.groups.map(o=>({...o}));return out;
}
