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
import {gateState,gateInReach,toggleGate,advanceGate} from './boundaries.js';
import {cabin} from './stadium-layout.js';
import {interiorAt} from './interior-layout.js';
import {entrySpawn,entryAt,publicGateState,publicGateInReach,togglePublicGate,advancePublicGate} from './entrance-layout.js';
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
const pmrem=new T.PMREMGenerator(renderer);const envScene=new T.Scene();envScene.background=new T.Color(0xb8ceda);envScene.add(new T.HemisphereLight(0xe2eff7,0x546256,3));const envSky=new T.Mesh(new T.SphereGeometry(50,16,8),new T.MeshBasicMaterial({color:0xc9d9e3,side:T.BackSide}));envScene.add(envSky);const environment=pmrem.fromScene(envScene,.12);scene.environment=environment.texture;pmrem.dispose();
let model;try{model=await buildModel(scene,renderer,p=>{$('progress').style.width=Math.round(p*100)+'%';});}catch(e){loading.hidden=true;$('error').hidden=false;$('error').textContent='No se pudieron cargar los materiales del estadio. Recargá la página para reintentar.';console.error(e);throw e;}
const detail=prepareDetails(scene,model);let bake=null,bakeError='';
try{bake=await loadBake(scene,model);}catch(e){bakeError=e.message;console.warn('Iluminación optimizada no disponible:',e);}
loading.hidden=true;$('enter').disabled=false;$('aerialStart').disabled=false;
const coarse=()=>matchMedia('(pointer:coarse)').matches;let quality=coarse()?'low':'medium';$('quality').value=quality;
const ambience=new StadiumAmbience();
const meter=new PerformanceMeter(renderer),resolution=new AdaptiveResolution();let movementMs=0;
function applyBake(){bake?.set(quality,night,standsOn,$('standIntensity').value,exteriorOn);}
function pixelRatio(){return Math.min(devicePixelRatio||1,quality==='high'?2:quality==='medium'?1.5:1)*(quality==='low'&&$('resolution').value==='auto'?resolution.scale:1);}
function shadowPolicy(){sun.castShadow=!night;model.lamps.forEach((l,i)=>{l.castShadow=night&&quality==='high'&&i%2===0;});renderer.shadowMap.needsUpdate=true;}
function applyQuality(){quality=$('quality').value;resolution.reset();meter.reset();renderer.setPixelRatio(pixelRatio());const map=quality==='high'?2048:quality==='medium'?1536:1024;sun.shadow.mapSize.set(map,map);sun.shadow.map?.dispose();sun.shadow.map=null;model.seatGroups.forEach(m=>m.castShadow=quality!=='low');applyBake();shadowPolicy();detail.update(camera,quality,mode,elapsed,true);updateEnvironment();resize();}
let mode='air',started=false,night=true,screenOn=true,standsOn=true,exteriorOn=true,referenceActive=true,yaw=-Math.PI/2,pitch=0,last=0,elapsed=0;
const player={...entrySpawn};const orbit=referenceOrbit(innerWidth/innerHeight);let zoomTarget=orbit.r;const keys=new Set();let joystick={x:0,y:0},drag=null,joyId=null,activeSector='';
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
function resetMotion(){ambience.reset();meter?.reset();keys.clear();joystick={x:0,y:0};player.vx=player.vz=0;$('knob').style.transform='';}
function exitLock(){if(document.pointerLockElement===canvas)document.exitPointerLock();}
function setMode(m){resetMotion();mode=m;camera.fov=m==='walk'?66:43;camera.updateProjectionMatrix();if(m==='walk')referenceActive=false;$('mode').textContent=m==='air'?'Caminar':'Vista aérea';$('joystick').style.display=m==='walk'&&coarse()?'block':'none';$('zoom').style.display=m==='air'?'flex':'none';$('crosshair').style.display=m==='walk'?'block':'none';ui.hint(m,m==='air'?'Arrastrá para rotar · Rueda o + / − para acercar':coarse()?'Joystick para caminar · Deslizá para mirar':'WASD para moverse · Arrastrá para mirar · Shift: máxima velocidad');exitLock();}
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
 model.walkwayEmitter.emissiveIntensity=on?.7:0;model.exterior.emitter.emissiveIntensity=on?.7:0;model.neighborhood.streetEmitter.emissiveIntensity=on?.8:0;
 model.walkway.forEach(l=>l.intensity=on?70:0);model.architecturalLights.forEach(({light,power})=>light.intensity=on?power*.32:0);
 model.neighborhood.streetLights.forEach(l=>l.intensity=on?(l.userData.bakePower||38):0);model.exterior.lights.forEach(({light,power})=>light.intensity=on?power:0);
 model.boundaries.setNight(on);$('exteriorLight').textContent=exteriorOn?'Exterior encendido':'Exterior apagado';$('exteriorLight').setAttribute('aria-pressed',String(exteriorOn));
}
$('exteriorLight').onclick=()=>{exteriorOn=!exteriorOn;setExteriorVisual();applyBake();updateEnvironment();};
$('fieldLight').oninput=()=>{$('fieldLightValue').textContent=$('fieldLight').value+'%';model.lamps.forEach(l=>l.intensity=fieldIntensity(night,$('fieldLight').value));};
const destinations={locker:{s:'main',u:0,d:13.6,h:facilities.floor,a:Math.PI/2,label:'Vestuarios'},tunnel:{s:'main',u:0,d:0,h:tunnel.floor,a:-Math.PI/2,label:'Túnel de jugadores'},cabin:{s:'main',u:0,d:cabin.front+1.4,h:cabin.floor,a:-Math.PI/2,label:'Cabina de la principal'},moat:{s:'main',u:0,d:.65,a:-Math.PI/2,label:'Fosa de la principal'},field:{x:0,z:8,a:0,label:'Campo de fútbol'},main:{s:'main',u:34,d:13.35,h:4.2,a:Math.PI/2,label:'Tribuna principal'},north:{s:'north',u:0,d:1,a:0,label:'Tribuna norte'},south:{s:'south',u:0,d:1,a:Math.PI,label:'Tribuna sur'},cdm:{x:59,z:20,a:-1.9,label:'Exterior CDM'}};
function teleport(place){const p=destinations[place];let x=p.x,z=p.z;if(p.s)[x,z]=world(stands.find(s=>s.id===p.s),p.u,p.d);const floor=ground(x,z,p.h);Object.assign(player,{x,z,floor,y:floor+1.7,vx:0,vz:0});yaw=p.a;pitch=0;activeSector=place;begin('walk');document.querySelectorAll('[data-place]').forEach(b=>b.classList.toggle('active',b.dataset.place===place));}
$('enter').onclick=()=>begin('walk');$('aerialStart').onclick=()=>begin('air');$('mode').onclick=()=>begin(mode==='air'?'walk':'air');$('light').onclick=()=>setNight(!night);$('quality').onchange=applyQuality;
$('standLight').onclick=()=>{standsOn=!standsOn;model.setStandLights(standsOn,night,$('standIntensity').value);applyBake();$('standLight').textContent=standsOn?'Tribunas encendidas':'Tribunas apagadas';$('standLight').setAttribute('aria-pressed',String(standsOn));updateEnvironment();};
$('standIntensity').oninput=()=>{$('standIntensityValue').textContent=$('standIntensity').value+'%';model.setStandLights(standsOn,night,$('standIntensity').value);applyBake();};$('standIntensity').onchange=()=>{};
$('screen').onclick=()=>{screenOn=!screenOn;model.setScreen(screenOn,night);$('screen').textContent=screenOn?'Pantalla encendida':'Pantalla apagada';$('screen').setAttribute('aria-pressed',String(screenOn));};
function fitReference(){Object.assign(orbit,referenceOrbit(innerWidth/innerHeight));zoomTarget=orbit.r;}
function referenceView(){fitReference();begin('air');referenceActive=true;setNight(true);}
$('reference').onclick=referenceView;
function interactGate(){if(mode!=='walk')return;if(publicGateInReach(player))togglePublicGate();else if(gateInReach(player))toggleGate();}
$('gateAction').onclick=interactGate;
$('capture').onclick=()=>{
 renderer.render(scene,camera);
 canvas.toBlob(blob=>{if(!blob)return;const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='estadio-koster-'+(night?'noche':'dia')+'-'+mode+'.png';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);},'image/png');
};
$('reset').onclick=()=>{Object.assign(player,entrySpawn);yaw=-Math.PI/2;pitch=0;begin('walk');};$('help').onclick=()=>{resetMotion();exitLock();ui.openHelp();};
for(const b of document.querySelectorAll('[data-place]'))b.onclick=()=>teleport(b.dataset.place);
window.addEventListener('keydown',e=>{if(e.target.matches('select,input,textarea')||$('instructions').open||$('diagnosticDialog').open)return;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();if(e.key.toLowerCase()==='e'&&!e.repeat){e.preventDefault();interactGate();}keys.add(e.key.toLowerCase());});window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));window.addEventListener('blur',resetMotion);document.addEventListener('visibilitychange',()=>{resetMotion();last=0;ambience.setHidden(document.hidden).catch(()=>{});});
canvas.addEventListener('dblclick',()=>{if(mode==='walk'&&canvas.requestPointerLock)try{const promise=canvas.requestPointerLock();promise?.catch?.(()=>{});}catch{}});
function look(dx,dy){referenceActive=false;if(mode==='walk'){yaw-=dx*.003;pitch=T.MathUtils.clamp(pitch-dy*.003,-1.28,1.28);}else{orbit.a-=dx*.004;orbit.e=T.MathUtils.clamp(orbit.e+dy*.004,.18,1.48);}}
canvas.addEventListener('pointerdown',e=>{if(drag)return;drag={id:e.pointerId,x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);});canvas.addEventListener('pointermove',e=>{if(document.pointerLockElement===canvas)return;if(drag?.id===e.pointerId){look(e.clientX-drag.x,e.clientY-drag.y);drag.x=e.clientX;drag.y=e.clientY;}});for(const ev of['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(ev,e=>{if(drag?.id===e.pointerId)drag=null;});document.addEventListener('mousemove',e=>{if(document.pointerLockElement===canvas)look(e.movementX,e.movementY);});
canvas.addEventListener('wheel',e=>{e.preventDefault();referenceActive=false;if(mode==='air')zoomTarget=T.MathUtils.clamp(zoomTarget+e.deltaY*.2,45,850);},{passive:false});$('zoomIn').onclick=()=>{referenceActive=false;zoomTarget=Math.max(45,zoomTarget*.90);};$('zoomOut').onclick=()=>{referenceActive=false;zoomTarget=Math.min(850,zoomTarget*1.10);};
function updateJoystick(e){const r=$('joystick').getBoundingClientRect();let x=(e.clientX-r.left-r.width/2)/40,y=(e.clientY-r.top-r.height/2)/40,l=Math.max(1,Math.hypot(x,y));joystick={x:x/l,y:y/l};$('knob').style.transform=`translate(${joystick.x*32}px,${joystick.y*32}px)`;}
$('joystick').addEventListener('pointerdown',e=>{if(joyId!==null)return;joyId=e.pointerId;$('joystick').setPointerCapture(e.pointerId);updateJoystick(e);});$('joystick').addEventListener('pointermove',e=>{if(e.pointerId===joyId)updateJoystick(e);});for(const ev of['pointerup','pointercancel','lostpointercapture'])$('joystick').addEventListener(ev,e=>{if(e.pointerId!==joyId)return;joyId=null;joystick={x:0,y:0};$('knob').style.transform='';});
function resize(){if(referenceActive)fitReference();renderer.setSize(innerWidth,innerHeight,false);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();}window.addEventListener('resize',resize);
let fps=0,frames=0,gateShadowTime=-1;function tick(t){meter.begin(t);const movementStart=performance.now();const dt=Math.min(.12,(t-last)/1000||.016);last=t;elapsed+=dt;frames++;
 if(mode==='walk'){if(!$('instructions').open&&!$('diagnosticDialog').open){let f=(keys.has('w')||keys.has('arrowup')?1:0)-(keys.has('s')||keys.has('arrowdown')?1:0)-joystick.y,r=(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0)+joystick.x,len=Math.max(1,Math.hypot(f,r)),speed=keys.has('shift')?speeds.maximum:(Number($('speed').value)||speeds.initial);const vx=(-Math.sin(yaw)*f+Math.cos(yaw)*r)/len*speed,vz=(-Math.cos(yaw)*f-Math.sin(yaw)*r)/len*speed,a=1-Math.exp(-dt*14);player.vx+=(vx-player.vx)*a;player.vz+=(vz-player.vz)*a;move(player,player.vx*dt,player.vz*dt);}player.y+=(ground(player.x,player.z,player.floor)+1.7-player.y)*(1-Math.exp(-dt*(30+Math.hypot(player.vx,player.vz)*1.2)));camera.position.set(player.x,player.y,player.z);camera.rotation.set(pitch,yaw,0);const s=stands.find(s=>{const p=world(s,0,8);return Math.hypot(player.x-p[0],player.z-p[1])<s.length/2;});const ip=local(stands[0],player.x,player.z);$('location').textContent=routeName(player.x,player.z,player.floor)||(Math.abs(player.floor-facilities.floor)<.1&&interiorAt(ip.u,ip.d)?(ip.d>=14.8?(ip.u<0?'Vestuario local':'Vestuario visitante'):ip.d>12.5?'Circulación de jugadores':'Túnel de jugadores'):ground(player.x,player.z,player.floor)>.1?(s?.name||'Tribuna'):Math.abs(player.x)<34&&Math.abs(player.z)<52.5?'Campo de fútbol':(player.x<siteBounds.west||player.x>siteBounds.east||player.z<siteBounds.north||player.z>siteBounds.south?'Alrededores':'Recorrido a pie'));
 }else{orbit.r+=(zoomTarget-orbit.r)*(1-Math.exp(-dt*10));placeOrbit(camera,orbit);$('location').textContent=referenceActive?'Vista de referencia':'Vista aérea';}
 setDepthRange(camera,mode);
 const audioLocal=local(stands[0],player.x,player.z);ambience.update(dt,player,started&&mode==='walk'&&!$('instructions').open&&!$('diagnosticDialog').open,player.floor<-.3||(Math.abs(player.floor-facilities.floor)<.1&&interiorAt(audioLocal.u,audioLocal.d))||(entryAt(audioLocal.u,audioLocal.d)&&player.floor<5));
 if(mode==='walk'&&entryAt(audioLocal.u,audioLocal.d)&&player.floor>=0&&player.floor<5)$('location').textContent='Entrada principal';
 movementMs=performance.now()-movementStart;
 if(detail.update(camera,quality,mode,elapsed)&&quality!=='low')renderer.shadowMap.needsUpdate=true;
 if(advanceGate(dt,player)&&(!night||quality==='high')&&(quality!=='low'||elapsed-gateShadowTime>.12||Math.abs(gateState.progress-gateState.target)<.001)){renderer.shadowMap.needsUpdate=true;gateShadowTime=elapsed;}model.boundaries.update(elapsed,camera,quality);
 if(advancePublicGate(dt,player))renderer.shadowMap.needsUpdate=true;model.publicEntrance.update();
 if(frames%10===0){$('view').dataset.publicGate=publicGateState.progress.toFixed(3);$('view').dataset.publicGateBlocked=String(publicGateState.blocked);}
 const atEntrance=publicGateInReach(player),nearGate=started&&mode==='walk'&&(atEntrance||gateInReach(player));$('gateControl').hidden=!nearGate;
 if(nearGate){const state=atEntrance?publicGateState:gateState;$('gateAction').textContent=(state.target?'Cerrar ':'Abrir ')+(atEntrance?'entrada':'salida')+(coarse()?'':' · E');$('gateAction').setAttribute('aria-pressed',String(state.target===1));$('gateStatus').textContent=state.blocked?'Portón detenido: despejá su recorrido.':Math.abs(state.progress-state.target)>.001?(state.target?'Abriendo…':'Cerrando…'):state.progress===1?'Paso habilitado':'Portón cerrado';}
 sky.position.copy(camera.position);meter.beforeRender();renderer.render(scene,camera);
 const stats=meter.end(t,()=>({quality,night,mode,location:$('location').textContent,position:[player.x,player.y,player.z].map(v=>Number(v.toFixed(2))),speed:Number($('speed').value)||12,lights:activeLights(),bakedLights:bake?(quality!=='high'?bake.count:bake.exteriorCount):0,bakeReady:!!bake,audioEnabled:ambience.enabled,exteriorOn,cameraNear:camera.near,cameraFar:camera.far,shadowLights:(sun.castShadow?1:0)+model.lamps.filter(l=>l.castShadow).length,standPercent:Number($('standIntensity').value),fieldPercent:Number($('fieldLight').value)}),movementMs);
 if(stats){fps=stats.fps;$('performance').textContent=Math.round(fps)+' FPS';showDiagnostics(stats,t);if(resolution.sample(stats.frameMs,quality==='low'&&$('resolution').value==='auto')){renderer.setPixelRatio(pixelRatio());resize();}}
if(frames%10===0){$('view').dataset.position=`${player.x.toFixed(2)},${player.y.toFixed(2)},${player.z.toFixed(2)}`;$('view').dataset.gate=gateState.progress.toFixed(3);$('view').dataset.gateBlocked=String(gateState.blocked);$('view').dataset.mode=mode;$('view').dataset.yaw=yaw.toFixed(3);$('view').dataset.fps=String(fps);$('view').dataset.standLights=String(standsOn);$('view').dataset.standPercent=String(Number($('standIntensity').value)||160);$('view').dataset.standPower=String(model.standLights.reduce((sum,p)=>sum+p.light.intensity,0));$('view').dataset.screen=String(screenOn);$('view').dataset.night=String(night);$('view').dataset.exterior=String(exteriorOn);$('view').dataset.cameraNear=camera.near.toFixed(3);$('view').dataset.speed=String(Number($('speed').value)||speeds.initial);$('view').dataset.fieldIntensity=String(model.lamps[0].intensity);$('view').dataset.exposure=String(renderer.toneMappingExposure);}requestAnimationFrame(tick);
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
$('exportDiagnostics').onclick=()=>{const blob=new Blob([JSON.stringify(meter.report({bakeError,version:'15.0.0'}),null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='koster-diagnostico.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
$('resolution').onchange=()=>{resolution.reset();renderer.setPixelRatio(pixelRatio());resize();};
scene.traverse(o=>{if(o!==sky&&o!==model.boundaries.leaf&&!model.publicEntrance.leaves.includes(o)){o.updateMatrix();o.matrixAutoUpdate=false;}});
fitReference();setMode('air');setNight(true);applyQuality();resize();renderer.shadowMap.needsUpdate=true;requestAnimationFrame(tick);
