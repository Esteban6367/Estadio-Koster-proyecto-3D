import {lighting,standGain} from './lighting.js';
import {BAKE_REVISION} from './release.js';
import * as T from './three.module.min.js';
// Three independently controlled irradiance channels. No per-frame local-light loop.
export const BAKE_RANGE=24;
export const bakeNames=['kNight','kStand','kInterior'];
export function bakeMeshes(scene){const out=[];scene.traverse(o=>{if(o.isMesh&&!o.userData.skipBake&&!o.userData.bakeSource&&!Array.isArray(o.material)&&o.material.isMeshStandardMaterial)out.push(o);});return out;}
export function lightGroups(model){return[
 [...model.walkway.map(light=>({light,power:70})),...model.architecturalLights.map(({light,power})=>({light,power:power*.32})),...model.neighborhood.streetLights.map(light=>({light,power:light.userData.bakePower||38})),...model.boundaries.accessLights.map(light=>({light,power:9})),...model.exterior.lights],
 model.standLights,
 model.playerFacilities.lights.map(light=>({light,power:light.intensity}))
 ];}
export function installBake(scene,model,meta,buffer){
 const objects=bakeMeshes(scene);
 if(meta.version!==1||meta.meshes.length!==objects.length)throw Error('La iluminación precalculada no corresponde a este modelo.');
 const data=new Uint16Array(buffer);let cursor=0;
 objects.forEach((o,i)=>{const entry=meta.meshes[i],count=o.isInstancedMesh?o.count:o.geometry.attributes.position.count;
  if(entry.count!==count||entry.instanced!==!!o.isInstancedMesh)throw Error('Geometría de iluminación desactualizada: '+i);
  // Geometry can be shared by other material/sector batches. Attributes cannot.
  o.geometry=o.geometry.clone();
  for(const name of bakeNames){const values=data.slice(cursor,cursor+count*3);cursor+=count*3;if(values.length!==count*3)throw Error('Datos de iluminación incompletos');const attr=o.isInstancedMesh?new T.InstancedBufferAttribute(values,3,true):new T.BufferAttribute(values,3,true);o.geometry.setAttribute(name,attr);}
  if(o.isInstancedMesh)for(const name of bakeNames){const values=data.slice(cursor,cursor+count*3);cursor+=count*3;o.geometry.setAttribute(name+'Dir',new T.InstancedBufferAttribute(values,3,true));}
 });
 if(cursor!==data.length)throw Error('Tamaño de iluminación inesperado');
 scene.traverse(o=>{if(o.userData.bakeSource){o.geometry=o.geometry.clone();for(const name of [...bakeNames,...bakeNames.map(n=>n+'Dir')])o.geometry.setAttribute(name,o.userData.bakeSource.geometry.getAttribute(name));}});
 const uniforms={kBakeOn:{value:1},kBakeNight:{value:1},kBakeStand:{value:lighting.stands.initialPercent/100},kBakeExterior:{value:1}};
 const materials=new Set(objects.map(o=>o.material));
 for(const mat of materials){const previous=mat.onBeforeCompile,previousKey=mat.customProgramCacheKey.bind(mat);
  const key=previousKey();mat.customProgramCacheKey=()=>key+'|koster-baked-v3';
  mat.onBeforeCompile=(shader,renderer)=>{previous.call(mat,shader,renderer);Object.assign(shader.uniforms,uniforms);
   const varyings='varying vec3 vKNight; varying vec3 vKStand; varying vec3 vKInterior;';
   shader.vertexShader=shader.vertexShader.replace('#include <common>',`#include <common>
    ${varyings}
    attribute vec3 kNight; attribute vec3 kStand; attribute vec3 kInterior;
    #ifdef USE_INSTANCING
     attribute vec3 kNightDir; attribute vec3 kStandDir; attribute vec3 kInteriorDir;
    #endif`);
   shader.vertexShader=shader.vertexShader.replace('#include <worldpos_vertex>',`#include <worldpos_vertex>
    vKNight=kNight*24.; vKStand=kStand*24.; vKInterior=kInterior*24.;
    #ifdef USE_INSTANCING
     vec3 kN=inverseTransformDirection(normalize(transformedNormal),viewMatrix);
     vKNight*=.16+.84*max(0.,dot(kN,kNightDir*2.-1.));
     vKStand*=.16+.84*max(0.,dot(kN,kStandDir*2.-1.));
     vKInterior*=.22+.78*max(0.,dot(kN,kInteriorDir*2.-1.));
    #endif`);
   shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`#include <common>\n${varyings}\nuniform float kBakeOn; uniform float kBakeNight; uniform float kBakeStand; uniform float kBakeExterior;`);
   shader.fragmentShader=shader.fragmentShader.replace('#include <lights_fragment_end>',`#if defined(RE_IndirectDiffuse)
    vec3 kSoftStand=vKStand/(vec3(1.)+vKStand/8.);
    vec3 kSoftInterior=vKInterior/(vec3(1.)+vKInterior/7.);
    irradiance+=kBakeNight*kBakeExterior*vKNight;
    irradiance+=kBakeNight*kBakeStand*kSoftStand+kBakeOn*kSoftInterior;
    #endif
    #include <lights_fragment_end>`);
  };mat.needsUpdate=true;
 }
 const groups=lightGroups(model),replaced=groups.flat().map(v=>v.light),outside=new Set([...groups[0],...groups[1]].map(v=>v.light));
 return{count:replaced.length,exteriorCount:outside.size,uniforms,set(quality,night,standsOn,percent,exteriorOn=true){const enabled=quality!=='high';uniforms.kBakeOn.value=enabled?1:0;uniforms.kBakeNight.value=night?1:0;uniforms.kBakeExterior.value=exteriorOn?1:0;uniforms.kBakeStand.value=standsOn?standGain(percent):0;for(const light of replaced)light.visible=!enabled&&!outside.has(light);}};
}
export async function loadBake(scene,model){
 const compressed=typeof DecompressionStream!=='undefined';
 const [metaResponse,dataResponse]=await Promise.all([fetch('./lighting-bake.json?v='+BAKE_REVISION),fetch((compressed?'./lighting-bake.bin.gz':'./lighting-bake.bin')+'?v='+BAKE_REVISION)]);
 if(!metaResponse.ok||!dataResponse.ok)throw Error('No se pudo cargar la iluminación optimizada');
 const raw=await dataResponse.arrayBuffer(),magic=new Uint8Array(raw,0,Math.min(2,raw.byteLength));
 // Some servers transparently decode Content-Encoding. Inspect bytes to avoid double decoding.
 const bytes=compressed&&magic[0]===31&&magic[1]===139?await new Response(new Blob([raw]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer():raw;
 return installBake(scene,model,await metaResponse.json(),bytes);
}
