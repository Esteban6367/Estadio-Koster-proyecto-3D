import {passageFrontD} from './passage-profile.js';
import {aisleUs} from './stadium-layout.js';
import {createFlightWorld} from './flight-world.js';
import {flightVector,moveFlight,safeLanding,advanceLanding,editableTarget} from './flight-motion.js';
import {whiteGateState,whiteGateInReach,toggleWhiteGate,advanceWhiteGate} from './white-gate.js';
import {reviewViews} from './review-views.js';
import {pitchDimensions as P} from './dimensions.js';
import {freezeStaticTransforms} from './scene-transforms.js';
import {APP_VERSION} from './release.js';
import {facilities} from './interior-layout.js';
import {initInterface} from './interface.js';
import {referenceOrbit,placeOrbit,setDepthRange} from './aerial-camera.js';
import {StadiumAmbience} from './ambience.js';
import {prepareDetails} from './render-detail.js';
import {loadBake} from './baked-lighting.js';
import {PerformanceMeter,AdaptiveResolution} from './performance.js';
import {tunnel,routeName} from './underground-layout.js';
import * as T from './three.module.min.js';
import {buildModel} from './model.js';
import {lighting,fieldIntensity,speeds} from './lighting.js';
import {stands,world,local,ground,move} from './physics.js';
import {gateState,gateInReach,toggleGate,advanceGate,serviceGateState,serviceGateInReach,toggleServiceGate,advanceServiceGate} from './boundaries.js';
import {hatchState,hatchInReach,toggleHatch,advanceHatch} from './field-access-layout.js';
import {cabin} from './stadium-layout.js';
import {interiorAt} from './interior-layout.js';
import {entrySpawn,entryAt,publicGateState,publicGateInReach,togglePublicGate,advancePublicGate} from './entrance-layout.js';
import {publicLayout as publicPlan,coveredPassageAt,centralDeckAt,centralDeckFloor} from './public-layout.js';
import {siteBounds} from './surroundings.js';
const elements=new Map(),$=id=>{if(!elements.has(id))elements.set(id,document.getElementById(id));return elements.get(id);},canvas=$('view');
const ui=initInterface();const loading=$('loading');let renderer;
try{renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});}catch(e){$('error').hidden=false;$('error').textContent='No se pudo iniciar el recorrido 3D. Probá con un navegador compatible con WebGL 2.';loading.hidden=true;throw e;}
renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.shadowMap.autoUpdate=false;
const scene=new T.Scene();scene.background=new T.Color(0xaac8db);scene.fog=new T.FogExp2(0xb3cbd9,.0016);
const camera=new T.PerspectiveCamera(43,1,.12,1400);camera.rotation.order='YXZ';
const sun=new T.DirectionalLight(0xfff1dc,3.1);sun.position.set(-85,130,65);sun.castShadow=true;sun.shadow.camera.left=-125;sun.shadow.camera.right=125;sun.shadow.camera.top=135;sun.shadow.camera.bottom=-135;sun.shadow.camera.near=1;sun.shadow.camera.far=380;sun.shadow.mapSize.set(2048,2048);sun.shadow.bias=-.00006;sun.shadow.normalBias=.09;sun.shadow.radius=2;scene.add(sun,sun.target);
const hemi=new T.HemisphereLight(0xc4d9ec,0x778570,1.25);scene.add(hemi);
const fill=new T.DirectionalLight(0xb1cadc,.45);fill.position.set(80,30,-80);scene.add(fill);
// A procedural sky and environment provide soft reflections without remote assets.
const skyMat=new T.ShaderMaterial({side:T.BackSide,depthWrite:false,uniforms:{night:{value:0}},vertexShader:'varying vec3 v;void main(){v=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`varying vec3 v;uniform float night;void main(){vec3 d=normalize(v);float h=max(d.y,0.);vec3 day=mix(vec3(.75,.84,.87),vec3(.23,.48,.72),pow(h,.55));float sun=pow(max(dot(d,normalize(vec3(-85.,130.,65.))),0.),700.);day+=vec3(.9,.8,.6)*sun;vec3 dark=mix(vec3(.045,.064,.105),vec3(.008,.018,.044),h);gl_FragColor=vec4(mix(day,dark,night),1.);}`});const sky=new T.Mesh(new T.SphereGeometry(650,24,12),skyMat);scene.add(sky);
const pmrem=new T.PMREMGenerator(renderer);const envScene=new T.Scene();envScene.background=new T.Color(0xb8ceda);envScene.add(new T.HemisphereLight(0xe2eff7,0x546256,3));const envSky=new T.Mesh(new T.SphereGeometry(50,16,8),new T.MeshBasicMaterial({color:0xc9d9e3,side:T.BackSide}));envScene.add(envSky);const environment=pmrem.fromScene(envScene,0);scene.environment=environment.texture;pmrem.dispose();
let model;try{model=await buildModel(scene,renderer,p=>{$('progress').style.width=Math.round(p*100)+'%';});}catch(e){loading.hidden=true;$('error').hidden=false;$('error').textContent='No se pudieron cargar los materiales del estadio. Recargá la página para reintentar.';console.error(e);throw e;}
const detail=prepareDetails(scene,model);let bake=null,bakeError='';
try{bake=await loadBake(scene,model);}catch(e){bakeError=e.message;console.warn('Iluminación optimizada no disponible:',e);}
loading.hidden=true;$('enter').disabled=false;$('aerialStart').disabled=false;
const coarse=()=>matchMedia('(pointer:coarse)').matches;let quality=coarse()||new URLSearchParams(location.search).get('vista')==='secretaria'?'low':'medium';$('quality').value=quality;
const ambience=new StadiumAmbience();
const meter=new PerformanceMeter(renderer),resolution=new AdaptiveResolution();let movementMs=0;
function applyBake(){bake?.set(quality,night,standsOn,$('standIntensity').value,exteriorOn);}
function pixelRatio(){return Math.min(devicePixelRatio||1,quality==='high'?2:quality==='medium'?1.5:1)*(quality==='low'&&$('resolution').value==='auto'?resolution.scale:1);}
function shadowPolicy(){sun.castShadow=!night;model.lamps.forEach((l,i)=>{l.castShadow=night&&quality==='high'&&i%2===0;});renderer.shadowMap.needsUpdate=true;}
function applyQuality(){quality=$('quality').value;resolution.reset();meter.reset();renderer.setPixelRatio(pixelRatio());const map=quality==='high'?2048:quality==='medium'?1536:1024;sun.shadow.mapSize.set(map,map);sun.shadow.map?.dispose();sun.shadow.map=null;model.seatGroups.forEach(m=>m.castShadow=quality!=='low');applyBake();shadowPolicy();detail.update(camera,quality,mode,elapsed,true);updateEnvironment();resize();}
let mode='walk',started=false,night=true,screenOn=true,standsOn=true,exteriorOn=true,referenceActive=true,yaw=-Math.PI/2,pitch=0,last=0,elapsed=0;
const player={...entrySpawn};const orbit=referenceOrbit(innerWidth/innerHeight);let zoomTarget=orbit.r;const keys=new Set(),verticalTouches={up:new Set(),down:new Set()};let flightWorld=null,landing=null,lastWalkSpeed=12,lastWalkPose={...entrySpawn,yaw:-Math.PI/2,pitch:0};let joystick={x:0,y:0},drag=null,joyId=null,activeSector='';
let seated=null,nearestSeat=null,lastSeatCheck=-1;
const seatButton=$('sitAction');
function leaveSeat(restore=true){if(!seated)return;if(restore){Object.assign(player,seated.origin);yaw=seated.yaw;pitch=seated.pitch;}seated=null;resetMotion();}
function findSeat(checkSight=false){let best=null,distance=1.4;for(const target of model.sitTargets){const d=Math.hypot(player.x-target.x,player.z-target.z);if(d>=distance||Math.abs(player.floor-target.floor)>.45)continue;
 if(checkSight){const origin=new T.Vector3(player.x,player.y,player.z),end=new T.Vector3(target.x,target.eye,target.z),delta=end.clone().sub(origin),length=delta.length();const ray=new T.Raycaster(origin,delta.normalize(),.08,Math.max(.08,length-.32));
 if(ray.intersectObjects(scene.children,true).some(h=>h.object.visible&&h.object.isMesh&&!h.object.material?.transparent))continue;}
 best=target;distance=d;}return best;}
function toggleSeat(){if(mode!=='walk'||!started||motionSuspended())return;if(seated){leaveSeat();return;}const target=findSeat(true);if(!target)return;seated={origin:{...player},yaw,pitch,target};resetMotion();Object.assign(player,{x:target.x,z:target.z,y:target.eye,floor:target.floor});yaw=target.angle+Math.PI;pitch=0;}
seatButton.onclick=toggleSeat;
// Static local reflection probe; captured only on lighting/quality changes and cached.
const reflectedEnvironments=new Map();
function updateEnvironment(){
 if(quality==='low'){scene.environment=environment.texture;return;}
 const key=String(night)+quality+String(standsOn)+String(exteriorOn);
 if(!reflectedEnvironments.has(key)){
  const target=new T.WebGLCubeRenderTarget(quality==='high'?128:64,{type:T.HalfFloatType});
  const probe=new T.CubeCamera(.3,650,target);probe.position.set(54,7,0);
  const oldEnvironment=scene.environment,skyPosition=sky.position.clone();scene.environment=null;sky.position.set(0,0,0);
  try{probe.update(renderer,scene);const filter=new T.PMREMGenerator(renderer);const reflection=filter.fromCubemap(target.texture);reflectedEnvironments.set(key,reflection);while(reflectedEnvironments.size>6){const first=reflectedEnvironments.keys().next().value;reflectedEnvironments.get(first).dispose();reflectedEnvironments.delete(first);}filter.dispose();}
  finally{target.dispose();scene.environment=oldEnvironment;sky.position.copy(skyPosition);}
 }
 scene.environment=reflectedEnvironments.get(key).texture;
}
function resetMotion(){
 ambience.reset();meter?.reset();keys.clear();joystick={x:0,y:0};player.vx=player.vy=player.vz=0;
 const held=[['view',drag?.id],['joystick',joyId],...Array.from(verticalTouches.up,id=>['flightUp',id]),...Array.from(verticalTouches.down,id=>['flightDown',id])];
 drag=null;joyId=null;verticalTouches.up.clear();verticalTouches.down.clear();$('knob').style.transform='';
 for(const[id,pointer]of held)if(pointer!=null)try{if($(id).hasPointerCapture?.(pointer))$(id).releasePointerCapture(pointer);}catch{}
}
function exitLock(){if(document.pointerLockElement===canvas)document.exitPointerLock();}
function isPerson(){return mode==='walk'||mode==='flight';}
function flightNotice(text='',unsafe=false){$('flightMessage').textContent=text;$('flightReturn').hidden=!unsafe;$('flightStatus').hidden=mode!=='flight';}
function setMode(m){
 if(m!==mode)leaveSeat();
 if(mode==='walk'&&m!=='walk')lastWalkPose={...player,yaw,pitch};
 resetMotion();landing=null;mode=m;
 if(m!=='flight')camera.fov=m==='walk'?66:43;camera.updateProjectionMatrix();
 if(m!=='air')referenceActive=false;
 $('mode').textContent=m==='air'?'Caminar':'Vista aérea';
 $('flightToggle').hidden=!started;$('flightToggle').textContent=m==='flight'?'Caminar':'Volar';$('flightToggle').setAttribute('aria-pressed',String(m==='flight'));
 $('inspectionSpeed').hidden=m!=='flight';$('inspectionSpeed').disabled=m!=='flight';
 if(m!=='flight'&&Number($('speed').value)===2)$('speed').value=String(lastWalkSpeed);
 $('joystick').style.display=isPerson()&&coarse()?'block':'none';$('joystick').setAttribute('aria-label',m==='flight'?'Joystick para volar':'Joystick para caminar');
 $('flightVertical').hidden=m!=='flight'||!coarse();$('zoom').style.display=m==='air'?'flex':'none';$('crosshair').style.display=isPerson()?'block':'none';
 document.body.classList.toggle('flying',m==='flight');flightNotice(m==='flight'?'Vuelo activo':'');
 ui.hint(m,m==='air'?'Arrastrá para rotar · Rueda o + / − para acercar':m==='flight'?(coarse()?'Joystick y arrastre · Subir / Bajar':'WASD + mirada · Espacio: subir · C: bajar · Shift: 36 m/s'):coarse()?'Joystick para caminar · Deslizá para mirar':'WASD para moverse · Arrastrá para mirar · Shift: máxima velocidad');exitLock();
}
function returnToWalk(){Object.assign(player,lastWalkPose);yaw=lastWalkPose.yaw;pitch=lastWalkPose.pitch;begin('walk');}
function toggleFlight(){
 leaveSeat();
 if(mode==='flight'){
  if(landing){landing=null;resetMotion();flightNotice('Vuelo activo · descenso cancelado');return;}
  flightWorld.refresh();resetMotion();landing=safeLanding(player,flightWorld);
  flightNotice(landing?'Descendiendo · pulsá Caminar para cancelar':'No hay un aterrizaje seguro debajo. Seguí volando o volvé al acceso.',!landing);canvas.focus?.();return;
 }
 if(mode==='air'){Object.assign(player,{x:camera.position.x,y:camera.position.y,z:camera.position.z,floor:camera.position.y-1.7});yaw=camera.rotation.y;pitch=camera.rotation.x;}
 if(!flightWorld)flightWorld=createFlightWorld(scene,model,[sky]);flightWorld.refresh();
 begin('flight');canvas.focus?.();
}
function motionSuspended(){return !started||$('instructions').open||$('diagnosticDialog').open||$('menu').open||editableTarget(document.activeElement)||document.hidden;}
function begin(m){ui.begin();started=true;$('welcome').hidden=true;setMode(m);}
function setNight(value){
 night=value;const l=night?lighting.night:lighting.day;
 skyMat.uniforms.night.value=night?1:0;sun.intensity=l.sun;fill.intensity=l.fill;hemi.intensity=l.sky;scene.environmentIntensity=l.environment;
 scene.fog.color.setHex(night?0x101e32:0xb3cbd9);model.lamps.forEach(lamp=>lamp.intensity=fieldIntensity(night,$('fieldLight').value));
 model.walkway.forEach(lamp=>lamp.intensity=night?70:0);model.emissives.forEach(m=>m.emissiveIntensity=night?.7:0);
 model.accentMaterials.forEach((m,i)=>m.emissiveIntensity=night?(i<2?.8:.16):.015);
 model.architecturalLights.forEach(({light,power})=>light.intensity=night?power*.32:0);
 model.neighborhood.windows.emissiveIntensity=night?.45:0;model.neighborhood.streetEmitter.emissiveIntensity=night?1.1:0;
 model.neighborhood.glowmat.opacity=night?.035:0;model.neighborhood.streetLights.forEach(lamp=>lamp.intensity=night?38:0);
 model.setScreen(screenOn,night);model.boundaries.setNight(night);model.setStandLights(standsOn,night,$('standIntensity').value);renderer.toneMappingExposure=l.exposure;setExteriorVisual();applyBake();shadowPolicy();updateEnvironment();
 $('light').textContent=night?'☾ Noche':'☀ Día';$('light').setAttribute('aria-pressed',String(night));
}
function setExteriorVisual(){
 const on=night&&exteriorOn;
 model.exterior.circulation.setNight(on);
 model.walkwayEmitter.emissiveIntensity=on?.7:0;model.exterior.emitter.emissiveIntensity=on?.7:0;model.neighborhood.streetEmitter.emissiveIntensity=on?.8:0;
 model.walkway.forEach(l=>l.intensity=on?70:0);model.architecturalLights.forEach(({light,power})=>light.intensity=on?power*.32:0);
 model.neighborhood.streetLights.forEach(l=>l.intensity=on?(l.userData.bakePower||38):0);model.exterior.lights.forEach(({light,power})=>light.intensity=on?power:0);
 model.boundaries.setNight(on);$('exteriorLight').textContent=exteriorOn?'Exterior encendido':'Exterior apagado';$('exteriorLight').setAttribute('aria-pressed',String(exteriorOn));
}
$('exteriorLight').onclick=()=>{exteriorOn=!exteriorOn;setExteriorVisual();applyBake();updateEnvironment();};
$('fieldLight').oninput=()=>{$('fieldLightValue').textContent=$('fieldLight').value+'%';model.lamps.forEach(l=>l.intensity=fieldIntensity(night,$('fieldLight').value));};
const mainAisleStart=world(stands[0],aisleUs(stands[0],13.5)[4],13.5),mainAisleEnd=world(stands[0],aisleUs(stands[0],30)[4],30),mainAisleYaw=Math.atan2(mainAisleStart[0]-mainAisleEnd[0],mainAisleStart[1]-mainAisleEnd[1]);
const destinations={var:{x:-35.5,z:-2.7,h:0,a:2.08,label:'VAR'},bench:{x:-36.7,z:-14.345,h:.12,a:Math.PI/2,label:'Bancos'},passage:{s:'main',u:23,d:9.2,h:0,a:0,label:'Pasillo central'},understand:{s:'main',u:-6,d:10.7,h:0,a:0,label:'Paso bajo gradas'},uppergallery:{s:'main',u:6,d:31,h:12.18,a:Math.PI+.15,label:'Galería alta'},exit:{s:'main',u:12.2,d:-6.55,h:0,a:Math.PI,label:'Salida del túnel'},locker:{s:'main',u:0,d:13.6,h:facilities.floor,a:Math.PI/2,label:'Vestuarios'},tunnel:{s:'main',u:0,d:0,h:tunnel.floor,a:-Math.PI/2,label:'Túnel de jugadores'},cabin:{s:'main',u:0,d:cabin.front+.65,h:cabin.floor,a:-Math.PI/2,label:'Cabina de la principal'},moat:{s:'main',u:-14,d:.65,a:-Math.PI/2,label:'Fosa de la principal'},field:{x:0,z:8,a:0,label:'Campo de fútbol'},main:{s:'main',u:aisleUs(stands[0],13.5)[4],d:13.35,h:4.2,a:mainAisleYaw,label:'Tribuna principal'},north:{x:0,z:-90,h:0,a:Math.PI,label:'Explanada norte'},south:{s:'south',u:0,d:1,a:Math.PI,label:'Tribuna sur'},cdm:{x:59,z:20,a:-1.9,label:'Exterior CDM'}};
function teleport(place){leaveSeat();const p=destinations[place];let x=p.x,z=p.z;if(p.s)[x,z]=world(stands.find(s=>s.id===p.s),p.u,p.d);const floor=ground(x,z,p.h);Object.assign(player,{x,z,floor,y:floor+1.7,vx:0,vz:0});yaw=p.a;pitch=0;activeSector=place;begin('walk');document.querySelectorAll('[data-place]').forEach(b=>b.classList.toggle('active',b.dataset.place===place));}
for(const[id,v]of Object.entries(reviewViews)){const o=document.createElement('option');o.value=id;o.textContent=v.label;$('reviewView').append(o);}
 $('reviewView').onchange=()=>{leaveSeat();const v=reviewViews[$('reviewView').value];if(!v)return;const[x,z]=world(stands[0],v.u,v.d);referenceActive=false;resetMotion();
  if(v.air){begin('air');Object.assign(orbit,{a:v.a,e:v.e,r:v.r,target:new T.Vector3(x,v.y,z)});zoomTarget=v.r;}else{const floor=ground(x,z,v.h);Object.assign(player,{x,z,floor,y:floor+1.7});yaw=v.a;pitch=v.p;activeSector='';begin('walk');}
  $('menu').open=false;$('view').dataset.review=$('reviewView').value;
 };
$('enter').onclick=()=>begin('walk');$('aerialStart').onclick=()=>begin('air');$('mode').onclick=()=>mode==='air'?returnToWalk():begin('air');$('flightToggle').onclick=toggleFlight;$('flightReturn').onclick=()=>{Object.assign(player,entrySpawn);yaw=-Math.PI/2;pitch=0;begin('walk');};$('speed').onchange=()=>{if(Number($('speed').value)!==2)lastWalkSpeed=Number($('speed').value)||12;resetMotion();};$('light').onclick=()=>setNight(!night);$('quality').onchange=applyQuality;
$('standLight').onclick=()=>{standsOn=!standsOn;model.setStandLights(standsOn,night,$('standIntensity').value);applyBake();$('standLight').textContent=standsOn?'Tribunas encendidas':'Tribunas apagadas';$('standLight').setAttribute('aria-pressed',String(standsOn));updateEnvironment();};
$('standIntensity').oninput=()=>{$('standIntensityValue').textContent=$('standIntensity').value+'%';model.setStandLights(standsOn,night,$('standIntensity').value);applyBake();};$('standIntensity').onchange=()=>{};
$('screen').onclick=()=>{screenOn=!screenOn;model.setScreen(screenOn,night);$('screen').textContent=screenOn?'Pantalla encendida':'Pantalla apagada';$('screen').setAttribute('aria-pressed',String(screenOn));};
function fitReference(){Object.assign(orbit,referenceOrbit(innerWidth/innerHeight));zoomTarget=orbit.r;}
function referenceView(){fitReference();begin('air');referenceActive=true;setNight(true);}
$('reference').onclick=referenceView;
function nearAction(test,low=-.5,high=3.4){return isPerson()&&test(player)&&(mode==='walk'||(player.y>=low&&player.y<=high));}
function interactGate(){if(nearAction(whiteGateInReach))toggleWhiteGate();else if(nearAction(publicGateInReach))togglePublicGate();else if(nearAction(gateInReach))toggleGate();}
$('gateAction').onclick=()=>{if(nearAction(gateInReach))toggleGate();};
$('whiteGateAction').onclick=()=>{if(nearAction(whiteGateInReach))toggleWhiteGate();};
let canopiesVisible=true;
$('canopyToggle').onclick=()=>{canopiesVisible=!canopiesVisible;model.setCanopiesVisible(canopiesVisible);$('canopyToggle').textContent=canopiesVisible?'Ocultar voladizos e instalación':'Mostrar voladizos e instalación';$('canopyToggle').setAttribute('aria-pressed',String(!canopiesVisible));$('view').dataset.canopies=String(canopiesVisible);renderer.shadowMap.needsUpdate=true;};
$('entryAction').onclick=()=>{if(nearAction(publicGateInReach))togglePublicGate();};
$('rejaAction').onclick=()=>{if(nearAction(serviceGateInReach))toggleServiceGate();};
$('hatchAction').onclick=()=>{if(nearAction(hatchInReach,-1,3.4))toggleHatch();};
$('capture').onclick=()=>{
 renderer.render(scene,camera);
 canvas.toBlob(blob=>{if(!blob)return;const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='estadio-koster-'+(night?'noche':'dia')+'-'+mode+'.png';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);},'image/png');
};
$('reset').onclick=()=>{leaveSeat();Object.assign(player,entrySpawn);yaw=-Math.PI/2;pitch=0;begin('walk');};$('help').onclick=()=>{resetMotion();exitLock();ui.openHelp();};
for(const b of document.querySelectorAll('[data-place]'))b.onclick=()=>teleport(b.dataset.place);
window.addEventListener('keydown',e=>{
 if(e.isComposing||e.ctrlKey||e.altKey||e.metaKey||editableTarget(e.target)||motionSuspended())return;
 if(e.target.closest?.('button,summary,a')&&[' ','Enter'].includes(e.key))return;
 const key=e.key.toLowerCase();if(['arrowup','arrowdown','arrowleft','arrowright',' '].includes(key))e.preventDefault();
 if(key==='f'&&!e.repeat){e.preventDefault();toggleSeat();return;}
 if(key==='e'&&!e.repeat){e.preventDefault();interactGate();}
 if(key==='r'&&!e.repeat&&nearAction(serviceGateInReach)){e.preventDefault();toggleServiceGate();}
 if(key==='t'&&!e.repeat&&nearAction(hatchInReach,-1,3.4)){e.preventDefault();toggleHatch();}
 keys.add(key);
});
window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
window.addEventListener('blur',()=>{resetMotion();last=0;landing=null;});
document.addEventListener('visibilitychange',()=>{resetMotion();last=0;landing=null;ambience.setHidden(document.hidden).catch(()=>{});});
document.addEventListener('focusin',e=>{if(editableTarget(e.target)){resetMotion();landing=null;}});
$('menu').addEventListener('toggle',()=>{if($('menu').open){resetMotion();landing=null;}});
for(const[id,direction]of[['flightUp','up'],['flightDown','down']]){
 const b=$(id);b.addEventListener('pointerdown',e=>{if(mode!=='flight'||motionSuspended())return;e.preventDefault?.();verticalTouches[direction].add(e.pointerId);b.setPointerCapture(e.pointerId);landing=null;});
 for(const ev of['pointerup','pointercancel','lostpointercapture'])b.addEventListener(ev,e=>{verticalTouches[direction].delete(e.pointerId);});
 b.addEventListener('contextmenu',e=>e.preventDefault());
}
canvas.addEventListener('dblclick',()=>{if(isPerson()&&canvas.requestPointerLock)try{const promise=canvas.requestPointerLock();promise?.catch?.(()=>{});}catch{}});
function look(dx,dy){referenceActive=false;if(isPerson()){yaw-=dx*.003;pitch=T.MathUtils.clamp(pitch-dy*.003,-1.28,1.28);}else{orbit.a-=dx*.004;orbit.e=T.MathUtils.clamp(orbit.e+dy*.004,.18,1.48);}}
canvas.addEventListener('pointerdown',e=>{canvas.focus?.({preventScroll:true});if(drag)return;drag={id:e.pointerId,x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);});canvas.addEventListener('pointermove',e=>{if(document.pointerLockElement===canvas)return;if(drag?.id===e.pointerId){look(e.clientX-drag.x,e.clientY-drag.y);drag.x=e.clientX;drag.y=e.clientY;}});for(const ev of['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(ev,e=>{if(drag?.id===e.pointerId)drag=null;});document.addEventListener('mousemove',e=>{if(document.pointerLockElement===canvas)look(e.movementX,e.movementY);});
canvas.addEventListener('wheel',e=>{e.preventDefault();referenceActive=false;if(mode==='air')zoomTarget=T.MathUtils.clamp(zoomTarget+e.deltaY*.2,45,850);},{passive:false});$('zoomIn').onclick=()=>{referenceActive=false;zoomTarget=Math.max(45,zoomTarget*.90);};$('zoomOut').onclick=()=>{referenceActive=false;zoomTarget=Math.min(850,zoomTarget*1.10);};
function updateJoystick(e){const r=$('joystick').getBoundingClientRect();let x=(e.clientX-r.left-r.width/2)/40,y=(e.clientY-r.top-r.height/2)/40,l=Math.max(1,Math.hypot(x,y));joystick={x:x/l,y:y/l};$('knob').style.transform=`translate(${joystick.x*32}px,${joystick.y*32}px)`;}
$('joystick').addEventListener('pointerdown',e=>{if(joyId!==null)return;joyId=e.pointerId;$('joystick').setPointerCapture(e.pointerId);updateJoystick(e);});$('joystick').addEventListener('pointermove',e=>{if(e.pointerId===joyId)updateJoystick(e);});for(const ev of['pointerup','pointercancel','lostpointercapture'])$('joystick').addEventListener(ev,e=>{if(e.pointerId!==joyId)return;joyId=null;joystick={x:0,y:0};$('knob').style.transform='';});
function resize(){if(referenceActive)fitReference();renderer.setSize(innerWidth,innerHeight,false);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();}window.addEventListener('resize',resize);
let fps=0,frames=0,gateShadowTime=-1,hatchShadowTime=-1;function tick(t){meter.begin(t);const movementStart=performance.now();const frameDt=last?Math.min(.5,Math.max(0,(t-last)/1000)):.016,dt=Math.min(.12,frameDt);last=t;elapsed+=dt;frames++;
 if(mode==='walk'&&seated){camera.position.set(player.x,player.y,player.z);camera.rotation.set(pitch,yaw,0);$('location').textContent='Sentado · '+seated.target.label;}else if(mode==='walk'){if(!motionSuspended()){let f=(keys.has('w')||keys.has('arrowup')?1:0)-(keys.has('s')||keys.has('arrowdown')?1:0)-joystick.y,r=(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0)+joystick.x,len=Math.max(1,Math.hypot(f,r)),speed=keys.has('shift')?speeds.maximum:(Number($('speed').value)||speeds.initial);const vx=(-Math.sin(yaw)*f+Math.cos(yaw)*r)/len*speed,vz=(-Math.cos(yaw)*f-Math.sin(yaw)*r)/len*speed,a=1-Math.exp(-dt*14);player.vx+=(vx-player.vx)*a;player.vz+=(vz-player.vz)*a;move(player,player.vx*dt,player.vz*dt);}player.y+=(ground(player.x,player.z,player.floor)+1.7-player.y)*(1-Math.exp(-dt*(30+Math.hypot(player.vx,player.vz)*1.2)));camera.position.set(player.x,player.y,player.z);camera.rotation.set(pitch,yaw,0);const s=stands.find(s=>{const p=world(s,0,8);return Math.hypot(player.x-p[0],player.z-p[1])<s.length/2;});const ip=local(stands[0],player.x,player.z);$('location').textContent=routeName(player.x,player.z,player.floor)||(Math.abs(player.floor-facilities.floor)<.1&&interiorAt(ip.u,ip.d)?(ip.d>=14.8?(ip.u<0?'Vestuario local':'Vestuario visitante'):ip.d>12.5?'Circulación de jugadores':'Túnel de jugadores'):ground(player.x,player.z,player.floor)>.1?(s?.name||'Tribuna'):Math.abs(player.x)<P.halfWidth&&Math.abs(player.z)<P.halfLength?'Campo de fútbol':(player.x<siteBounds.west||player.x>siteBounds.east||player.z<siteBounds.north||player.z>siteBounds.south?'Alrededores':'Recorrido a pie'));
 }else if(mode==='flight'){
  flightWorld.refresh();
  if(!motionSuspended()){
   if(landing){const result=advanceLanding(player,landing,frameDt,flightWorld);if(result==='done'){setMode('walk');}else if(result==='blocked'){landing=null;resetMotion();flightNotice('Descenso detenido por un obstáculo. Seguí volando o volvé al acceso.',true);}}
   else{const f=(keys.has('w')||keys.has('arrowup')?1:0)-(keys.has('s')||keys.has('arrowdown')?1:0)-joystick.y,r=(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0)+joystick.x,v=(keys.has(' ')||verticalTouches.up.size?1:0)-(keys.has('c')||verticalTouches.down.size?1:0),speed=keys.has('shift')?36:([2,6,12,24,36].includes(Number($('speed').value))?Number($('speed').value):12);
    moveFlight(player,flightVector(yaw,pitch,f,r,v,speed),frameDt,flightWorld);
   }
  }
  camera.position.set(player.x,player.y,player.z);camera.rotation.set(pitch,yaw,0);$('location').textContent='Vuelo · '+player.y.toFixed(1)+' m';
 }else{orbit.r+=(zoomTarget-orbit.r)*(1-Math.exp(-dt*10));placeOrbit(camera,orbit);$('location').textContent=referenceActive?'Vista de referencia':'Vista aérea';}
 if(elapsed-lastSeatCheck>.25){lastSeatCheck=elapsed;nearestSeat=started&&mode==='walk'&&!seated&&!motionSuspended()?findSeat():null;seatButton.hidden=!(mode==='walk'&&started&&(seated||nearestSeat));seatButton.textContent=seated?'Levantarse · F':'Sentarse · F';seatButton.setAttribute('aria-pressed',String(!!seated));$('view').dataset.seated=String(!!seated);}
 setDepthRange(camera,mode);
 const audioLocal=local(stands[0],player.x,player.z);ambience.update(dt,player,started&&mode==='walk'&&!$('instructions').open&&!$('diagnosticDialog').open,player.floor<-.3||(Math.abs(player.floor-facilities.floor)<.1&&interiorAt(audioLocal.u,audioLocal.d))||(entryAt(audioLocal.u,audioLocal.d)&&player.floor<5));
 if(mode==='walk'&&!seated&&centralDeckAt(audioLocal.u,audioLocal.d)&&Math.abs(player.floor-centralDeckFloor(audioLocal.u,audioLocal.d))<.02)$('location').textContent='Sector central · bancos con respaldo';
 if(mode==='walk'&&!seated&&entryAt(audioLocal.u,audioLocal.d)&&player.floor>=0&&player.floor<5)$('location').textContent=coveredPassageAt(audioLocal.u,audioLocal.d)?(player.floor>3?'Sector central · bancos con respaldo':'Pasillo bajo gradas'):Math.abs(audioLocal.u-publicPlan.axis)<=publicPlan.half&&audioLocal.d>publicPlan.passBack?'Entrada principal':'Pasillo de la tribuna';
 movementMs=performance.now()-movementStart;
 const animatedBody=mode==='flight'?{...player,floor:player.y-1.65,collisionHeight:1.90,collisionMargin:.42}:player;
 if(advanceHatch(dt,animatedBody)&&(!night||quality==='high')&&(quality!=='low'||elapsed-hatchShadowTime>.12||Math.abs(hatchState.progress-hatchState.target)<.001)){renderer.shadowMap.needsUpdate=true;hatchShadowTime=elapsed;}
 if(detail.update(camera,quality,mode,elapsed)&&quality!=='low')renderer.shadowMap.needsUpdate=true;
 if(advanceGate(dt,mode==='flight'?(player.y-1.65>1.105||player.y+.25<0?null:{...animatedBody,floor:Math.max(-.39,animatedBody.floor)}):player)&&(!night||quality==='high')&&(quality!=='low'||elapsed-gateShadowTime>.12||Math.abs(gateState.progress-gateState.target)<.001)){renderer.shadowMap.needsUpdate=true;gateShadowTime=elapsed;}if(advanceServiceGate(dt,animatedBody)&&(!night||quality==='high'))renderer.shadowMap.needsUpdate=true;model.boundaries.update(elapsed,camera,quality);
 if(advanceWhiteGate(dt,animatedBody))renderer.shadowMap.needsUpdate=true;
 if(frames%10===0){$('view').dataset.whiteGate=whiteGateState.progress.toFixed(3);$('view').dataset.whiteGateBlocked=String(whiteGateState.blocked);}
 if(advancePublicGate(dt,animatedBody))renderer.shadowMap.needsUpdate=true;model.publicEntrance.update();
 if(frames%10===0){$('view').dataset.publicGate=publicGateState.progress.toFixed(3);$('view').dataset.publicGateBlocked=String(publicGateState.blocked);}
 const active=started&&isPerson(),nearWhite=active&&nearAction(whiteGateInReach),nearEntry=active&&nearAction(publicGateInReach),nearGate=active&&nearAction(gateInReach),nearReja=active&&nearAction(serviceGateInReach),nearHatch=active&&nearAction(hatchInReach,-1,3.4);
 $('gateControl').hidden=!(nearWhite||nearEntry||nearGate||nearReja||nearHatch);
 function action(id,near,state,label,key,actual=state.progress){
  $(id+'Action').hidden=!near;$(id+'Status').hidden=!near;if(!near)return;
  $(id+'Action').textContent=(state.target?'Cerrar ':'Abrir ')+label+(coarse()?'':' · '+key);
  $(id+'Action').setAttribute('aria-pressed',String(actual>=.999));
  $(id+'Status').textContent=state.blocked?'Movimiento detenido: despejá el recorrido.':Math.abs(actual-state.progress)>.005?'Movimiento pendiente.':Math.abs(actual-state.target)>.001?(state.target?'Abriendo…':'Cerrando…'):actual>=.999?'Abierto':actual<=.001?'Cerrado':'Apertura parcial';
 }
 action('whiteGate',nearWhite,whiteGateState,'portón blanco','E');
 action('entry',nearEntry,publicGateState,'portones de entrada','E');
 action('gate',nearGate,gateState,'portón de jugadores','E',model.boundaries.visibleGateProgress());
 action('reja',nearReja,serviceGateState,'puerta de reja','R',model.boundaries.visibleServiceProgress());
 action('hatch',nearHatch,hatchState,'tapa','T',model.boundaries.field.visibleProgress());
 if(frames%10===0){$('view').dataset.hatch=hatchState.progress.toFixed(3);$('view').dataset.hatchVisible=model.boundaries.field.visibleProgress().toFixed(3);$('view').dataset.hatchBlocked=String(hatchState.blocked);$('view').dataset.reja=serviceGateState.progress.toFixed(3);$('view').dataset.rejaBlocked=String(serviceGateState.blocked);}
 sky.position.copy(camera.position);meter.beforeRender();renderer.render(scene,camera);
 const stats=meter.end(t,()=>({quality,night,mode,location:$('location').textContent,position:[player.x,player.y,player.z].map(v=>Number(v.toFixed(2))),speed:Number($('speed').value)||12,lights:activeLights(),bakedLights:bake?(quality!=='high'?bake.count:bake.exteriorCount):0,bakeReady:!!bake,audioEnabled:ambience.enabled,exteriorOn,cameraNear:camera.near,cameraFar:camera.far,shadowLights:(sun.castShadow?1:0)+model.lamps.filter(l=>l.castShadow).length,standPercent:Number($('standIntensity').value),fieldPercent:Number($('fieldLight').value)}),movementMs);
 if(stats){fps=stats.fps;$('performance').textContent=Math.round(fps)+' FPS';showDiagnostics(stats,t);if(resolution.sample(stats.frameMs,quality==='low'&&$('resolution').value==='auto')){renderer.setPixelRatio(pixelRatio());resize();}}
if(frames%10===0){$('view').dataset.position=`${player.x.toFixed(2)},${player.y.toFixed(2)},${player.z.toFixed(2)}`;$('view').dataset.gate=gateState.progress.toFixed(3);$('view').dataset.gateBlocked=String(gateState.blocked);$('view').dataset.mode=mode;$('view').dataset.yaw=yaw.toFixed(3);$('view').dataset.pitch=pitch.toFixed(3);$('view').dataset.landing=String(!!landing);$('view').dataset.fps=String(fps);$('view').dataset.standLights=String(standsOn);$('view').dataset.standPercent=String(Number($('standIntensity').value)||lighting.stands.initialPercent);$('view').dataset.standPower=String(model.standLights.reduce((sum,p)=>sum+p.light.intensity,0));$('view').dataset.screen=String(screenOn);$('view').dataset.night=String(night);$('view').dataset.exterior=String(exteriorOn);$('view').dataset.cameraNear=camera.near.toFixed(3);$('view').dataset.speed=String(Number($('speed').value)||speeds.initial);$('view').dataset.fieldIntensity=String(model.lamps[0].intensity);$('view').dataset.exposure=String(renderer.toneMappingExposure);}requestAnimationFrame(tick);
}
function activeLights(){let n=0;scene.traverseVisible(o=>{if(o.isLight)n++;});return n;}
function showDiagnostics(s,t){
 $('diagValues').textContent=`${s.fps} FPS · ${s.frameMs} ms por imagen\nP95: ${s.p95FrameMs} ms · peor: ${s.worstFrameMs} ms\nCPU + envío: ${s.cpuAndSubmitMs} ms · pico: ${s.peakCpuMs} ms\nMovimiento: ${s.movementMs} ms\nGPU: ${s.gpuMs===null?'medición no disponible':s.gpuMs+' ms'}\nResolución 3D: ${s.resolution?.join(' × ')||'—'}\nDibujos: ${s.drawCalls??'—'} · triángulos: ${s.triangles??'—'}\nLuces procesadas: ${s.lights} · precalculadas: ${s.bakedLights}\nSombras: ${s.shadowLights} · materiales compilados: ${s.programs??'—'}\nTexturas residentes: ${s.textures??'—'}\n${s.location} · ${s.night?'noche':'día'} · ${s.quality}\n${bakeError?'Aviso: '+bakeError:''}`;
 $('diagStatus').textContent=meter.recording?(t<meter.warmEnd?'Preparando medición…':`Registrando: ${Math.min(180,Math.floor((t-meter.warmEnd)/1000))} / 180 s. Podés cerrar este panel y recorrer.`):meter.rows.length?'Medición disponible para descargar.':'Los datos pertenecen a este navegador.';
}
$('audioToggle').onclick=async()=>{const value=!ambience.enabled;$('audioToggle').disabled=true;try{await ambience.setEnabled(value);$('audioToggle').textContent=ambience.enabled?'Sonido activado':'Sonido desactivado';$('audioToggle').setAttribute('aria-pressed',String(ambience.enabled));$('audioStatus').textContent='';}catch(e){$('audioStatus').textContent=e.message;$('audioToggle').textContent='Sonido desactivado';$('audioToggle').setAttribute('aria-pressed','false');}finally{$('audioToggle').disabled=false;}};
$('audioVolume').oninput=()=>{ambience.setVolume($('audioVolume').value);$('audioVolumeValue').textContent=$('audioVolume').value+'%';};
$('diagnostics').onclick=()=>{ui.closeMenu();resetMotion();exitLock();meter.enableGpu();$('diagnosticDialog').showModal();};
$('measure').onclick=()=>{meter.start();$('diagStatus').textContent='Preparando 10 s y registrando 3 minutos. Cerrá este panel para recorrer.';};
$('exportDiagnostics').onclick=()=>{const blob=new Blob([JSON.stringify(meter.report({bakeError,version:APP_VERSION}),null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='koster-diagnostico.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
$('resolution').onchange=()=>{resolution.reset();renderer.setPixelRatio(pixelRatio());resize();};
sky.userData.dynamicTransform=true;freezeStaticTransforms(scene);
fitReference();setMode('walk');setNight(new URLSearchParams(location.search).get('vista')!=='secretaria');applyQuality();resize();if(new URLSearchParams(location.search).get('vista')==='secretaria'){$('reviewView').value='secretariaFoto';$('reviewView').onchange();}renderer.shadowMap.needsUpdate=true;requestAnimationFrame(tick);

if(new URLSearchParams(location.search).get('vista')==='bancos'){teleport('bench');Object.assign(player,{x:-32,z:-21,floor:0,y:1.7});yaw=2.48;setNight(false);}

if(new URLSearchParams(location.search).get('vista')==='pasillo'){teleport('passage');const [x,z]=world(stands[0],43,passageFrontD(43)+.6);Object.assign(player,{x,z,floor:0,y:1.7});yaw=0;pitch=0;setNight(false);}
if(new URLSearchParams(location.search).get('vista')==='voladizo'){$('reviewView').value='canopyField';$('reviewView').onchange();setNight(false);}

if(new URLSearchParams(location.search).get('vista')==='var'){$('reviewView').value='varReview';$('reviewView').onchange();setNight(false);}
if(new URLSearchParams(location.search).get('vista')==='alumbrado'){$('reviewView').value='lightingAbove';$('reviewView').onchange();setNight(true);}

if(['eliptica','acceso-pasillo'].includes(new URLSearchParams(location.search).get('vista'))){$('reviewView').value='ellipsePlan';$('reviewView').onchange();setNight(false);model.setCanopiesVisible(false);canopiesVisible=false;$('canopyToggle').textContent='Mostrar voladizos e instalación';$('canopyToggle').setAttribute('aria-pressed','true');$('view').dataset.canopies='false';renderer.shadowMap.needsUpdate=true;}
if(new URLSearchParams(location.search).get('vista')==='acabados-cad'){$('reviewView').value='acabadosCad';$('reviewView').onchange();setNight(true);}
if(['pasillo-inferior','grada-plana','grada-real'].includes(new URLSearchParams(location.search).get('vista'))){$('reviewView').value=new URLSearchParams(location.search).get('vista')!=='pasillo-inferior'?'gradaPlana':'pasilloInferior';$('reviewView').onchange();setNight(false);model.setCanopiesVisible(false);canopiesVisible=false;$('canopyToggle').textContent='Mostrar voladizos e instalación';$('canopyToggle').setAttribute('aria-pressed','true');$('view').dataset.canopies='false';renderer.shadowMap.needsUpdate=true;}
