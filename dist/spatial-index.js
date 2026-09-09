// Conservative static broad phase. The original exact narrow-phase checks remain.
export function spatialIndex(objects,bounds,cell=12){
 const grid=new Map();
 for(const object of objects){const b=bounds(object);for(let x=Math.floor(b[0]/cell);x<=Math.floor(b[2]/cell);x++)for(let z=Math.floor(b[1]/cell);z<=Math.floor(b[3]/cell);z++){const key=x+','+z;if(!grid.has(key))grid.set(key,[]);grid.get(key).push(object);}}
 const empty=[];return(x,z)=>grid.get(Math.floor(x/cell)+','+Math.floor(z/cell))||empty;
}
