import {pitchMarkingGLSL} from './pitch-markings.js';
// Metric UVs on instanced boxes and a very gentle world-space variation on vegetation.
export function configureSurface(material){
 const tile=material.userData?.tile;if(!tile||!material.map)return;
 const grass=material.userData.surface==='grass',pitch=!!material.userData.pitchMarkings;
 material.customProgramCacheKey=()=>`metric-v6-${tile}-${grass}-${pitch}`;
 material.onBeforeCompile=shader=>{
   const metric=`
   #ifdef USE_INSTANCING
     vec3 kMeters=position*vec3(length(instanceMatrix[0].xyz),length(instanceMatrix[1].xyz),length(instanceMatrix[2].xyz));
     vec3 kNormal=abs(normal);
     vec2 kUv=(kNormal.y>.5?kMeters.xz:(kNormal.x>.5?kMeters.zy:kMeters.xy))/${Number(tile).toFixed(2)};
     #ifdef USE_MAP
       vMapUv=kUv;
     #endif
     #ifdef USE_NORMALMAP
       vNormalMapUv=kUv;
     #endif
     #ifdef USE_ROUGHNESSMAP
       vRoughnessMapUv=kUv;
     #endif
   #endif
   `;
   shader.vertexShader=shader.vertexShader.replace('#include <uv_vertex>','#include <uv_vertex>'+metric);
   if(grass){
     shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 kSurfacePosition;');
     shader.vertexShader=shader.vertexShader.replace('#include <worldpos_vertex>',`#include <worldpos_vertex>
       vec4 kSurface=vec4(transformed,1.);
       #ifdef USE_INSTANCING
         kSurface=instanceMatrix*kSurface;
       #endif
       kSurfacePosition=(modelMatrix*kSurface).xyz;`);
     shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 kSurfacePosition;');
     shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
       float kVariation=.97+.02*sin(kSurfacePosition.x*.53+kSurfacePosition.z*.24)+.012*sin(kSurfacePosition.x*1.43-kSurfacePosition.z*.63);
       diffuseColor.rgb*=kVariation;`);
     if(pitch){
       shader.vertexShader=shader.vertexShader.replace('kSurfacePosition=(modelMatrix*kSurface).xyz;',`kSurfacePosition=(modelMatrix*kSurface).xyz;
         vMapUv=kSurfacePosition.xz/2.;
         vNormalMapUv=kSurfacePosition.xz/2.;
         vRoughnessMapUv=kSurfacePosition.xz/2.;`);
       shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`#include <common>
         float kHash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
         float kNoise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(kHash(i),kHash(i+vec2(1.,0.)),f.x),mix(kHash(i+vec2(0.,1.)),kHash(i+vec2(1.,1.)),f.x),f.y);}`);
       shader.fragmentShader=shader.fragmentShader.replace('float kVariation=.97+.02*sin(kSurfacePosition.x*.53+kSurfacePosition.z*.24)+.012*sin(kSurfacePosition.x*1.43-kSurfacePosition.z*.63);',`float kVariation=.88+.15*kNoise(kSurfacePosition.xz*.21)+.075*kNoise(kSurfacePosition.xz*1.4);
         diffuseColor.rgb*=mix(vec3(.96,1.0,.92),vec3(1.07,1.015,.96),kNoise(kSurfacePosition.xz*.47));`);
       shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\n'+pitchMarkingGLSL);
       shader.fragmentShader=shader.fragmentShader.replace('diffuseColor.rgb*=kVariation;',`diffuseColor.rgb*=kVariation;
         float kDistance=kPitchDistance(kSurfacePosition.xz);
         float kAA=max(length(fwidth(kSurfacePosition.xz))*.65,.003);
         float kPaint=min(clamp(.5+(.055-kDistance)/kAA,0.,1.),min(1.,.11/kAA));
         diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.72,.74,.70),kPaint);`);
     }
   }
 };
}
