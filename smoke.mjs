import fs from 'node:fs';
globalThis.fetch=async url=>new Response(fs.readFileSync(new URL('./dist/'+String(url).replace(/^\.\//,''),import.meta.url)));
import assert from 'node:assert/strict';
const elements=new Map(),handlers=new Map(),windowHandlers=new Map();let frame,clock=0;
function el(id){if(elements.has(id))return elements.get(id);const e={id,style:{},dataset:{},hidden:false,disabled:false,open:false,value:'medium',textContent:'',scrollWidth:900,clientWidth:300,scrollLeft:0,scrollBy({left}){this.scrollLeft=Math.max(0,Math.min(600,this.scrollLeft+left));handlers.get(id+':scroll')?.();},classList:{toggle(){},add(){}},addEventListener(n,f){handlers.set(id+':'+n,f)},setAttribute(){},setPointerCapture(){},getBoundingClientRect:()=>({left:0,top:0,width:112,height:112}),getContext:()=>({fillRect(){},fillText(){}}),showModal(){this.open=true}};elements.set(id,e);return e;}
const buttons=['field','main','moat','cabin','locker','tunnel','north','south','cdm'].map(id=>{const b=el('place-'+id);b.dataset.place=id;return b;});
globalThis.document={body:el('body'),getElementById:el,querySelectorAll:()=>buttons,createElement:()=>el('offscreen-'+Math.random()),addEventListener(){},pointerLockElement:null};globalThis.window=globalThis;globalThis.addEventListener=(name,f)=>windowHandlers.set(name,f);globalThis.matchMedia=()=>({matches:true});globalThis.innerWidth=390;globalThis.innerHeight=844;globalThis.devicePixelRatio=2;globalThis.requestAnimationFrame=f=>frame=f;
await import('./dist/app.js');function tick(n=10){for(let i=0;i<n;i++){clock+=16.667;frame(clock);}}function position(){return el('view').dataset.position.split(',').map(Number);}function key(name,down=true){windowHandlers.get(down?'keydown':'keyup')({key:name,target:{matches:()=>false},preventDefault(){}});}
tick();assert.equal(el('view').dataset.night,'true');assert.equal(el('enter').disabled,false);assert(el('loading').hidden);el('enter').onclick();assert.equal(el('joystick').style.display,'block');el('place-field').onclick();tick();let p=position();key('w');tick(60);key('w',false);tick(20);assert(position()[2]<p[2]-11,'default movement is 12 m/s');
handlers.get('joystick:pointerdown')({pointerId:1,clientX:56,clientY:16});handlers.get('view:pointerdown')({pointerId:2,clientX:210,clientY:300});handlers.get('view:pointermove')({pointerId:2,clientX:255,clientY:310});p=position();tick(40);assert(position()[2]<p[2]-.5);assert.notEqual(el('view').dataset.yaw,'0.000','simultaneous touch look');handlers.get('view:pointerup')({pointerId:2});p=position();tick(30);assert(position()[2]<p[2]-.3,'look release preserves joystick');handlers.get('joystick:pointerup')({pointerId:1});tick(40);p=position();tick(30);assert(Math.abs(position()[2]-p[2])<.03,'stable stop');
for(const id of['main','north','south']){el('place-'+id).onclick();key('w');tick(500);key('w',false);tick(20);assert(position()[1]>7,id+' climb with actual app movement');key('s');tick(600);key('s',false);tick(20);assert(id==='main'?Math.abs(position()[1]-5.9)<.06:position()[1]<1.9,id+' descent onto connected gallery');}
for(const id of['field','cdm']){el('place-'+id).onclick();tick();assert.equal(el('view').dataset.mode,'walk');}el('light').onclick();tick();assert(el('light').textContent.includes('Día'));el('screen').onclick();tick();assert.equal(el('view').dataset.screen,'false');el('screen').onclick();tick();assert.equal(el('view').dataset.screen,'true');el('reference').onclick();tick();assert.equal(el('view').dataset.night,'true');assert.equal(el('view').dataset.mode,'air');el('quality').value='high';el('quality').onchange();el('mode').onclick();tick();assert.equal(el('view').dataset.mode,'walk');el('reset').onclick();tick();assert(Math.abs(position()[0]+99)<.1&&Math.abs(position()[2])<.1);assert.equal(el('view').dataset.yaw,(-Math.PI/2).toFixed(3));console.log('PASS: app initialization, WASD, simultaneous two-pointer movement/look, release and braking, three climbs/descents, destinations, lighting, quality, aerial and reset to new entry. Graphics mocked; no GPU/visual assertion.');
el('speed').value='6';key('w');tick(24);key('w',false);tick(30);assert.equal(el('gateControl').hidden,false);assert(el('gateAction').textContent.includes('entrada'));el('gateAction').onclick();tick(220);assert.equal(el('view').dataset.publicGate,'0.000');key('e');key('e',false);tick(220);assert.equal(el('view').dataset.publicGate,'1.000');console.log('PASS: public entrance gate through actual keyboard/button handlers; independent of player gate.');

for(const speed of[6,12,24,36]){el('speed').value=String(speed);el('place-field').onclick();tick();const p=position();key('w');tick(60);key('w',false);tick(30);const distance=p[2]-position()[2];assert(distance>speed*.92&&distance<speed*1.15,'selected speed '+speed);}
console.log('PASS: night reference view, independent screen control, 6/12/24/36 m/s presets.');

el('fieldLight').value='30';el('fieldLight').oninput();tick();assert.equal(Number(el('view').dataset.fieldIntensity),5400);el('fieldLight').value='120';el('fieldLight').oninput();tick();assert.equal(Number(el('view').dataset.fieldIntensity),21600);assert(Number(el('view').dataset.exposure)<1);el('light').onclick();tick();assert.equal(Number(el('view').dataset.fieldIntensity),0);el('light').onclick();tick();assert.equal(Number(el('view').dataset.fieldIntensity),21600);console.log('PASS: floodlight adjustment, bounded intensity, exposure and day/night independence.');
// The speed remains meaningful at 10 FPS instead of being halved by a 50 ms frame cap.
el('speed').value='12';el('place-field').onclick();tick();const slowStart=position();key('w');for(let i=0;i<10;i++){clock+=100;frame(clock);}key('w',false);tick(40);assert(slowStart[2]-position()[2]>11,'movement must retain real-time speed at 10 FPS');console.log('PASS: 12 m/s traversal remains stable with 100 ms frames.');

// Walk the real underground route through app handlers; no direct player-state mutation.
el('speed').value='6';el('place-moat').onclick();tick();assert.equal(el('gateControl').hidden,true,'public moat is not the player exit');
el('place-tunnel').onclick();tick(30);assert(Math.abs(position()[1]+3.1)<.03,'underground destination');
key('w');tick(63);key('w',false);tick(30);assert(position()[0]>-54.2&&position()[0]<-53.2,'cross under moat');
key('a');tick(110);key('a',false);tick(30);assert.equal(el('gateControl').hidden,false,'gate reached by reserved stair');assert(position()[1]>1.1,'climb from underground');
const beforeGate=position();key('e');key('e',false);tick(190);assert.equal(el('view').dataset.gate,'1.000','keyboard E opens the player gate');
key('a');tick(70);key('a',false);tick(30);assert(position()[2]<beforeGate[2]-6.5,'exit onto protected track side');assert(Math.abs(position()[1]-1.7)<.03);
el('gateAction').onclick();tick(190);assert.equal(el('view').dataset.gate,'0.000','touch/button closes from field side');el('gateAction').onclick();tick(190);assert.equal(el('view').dataset.gate,'1.000');
key('d');tick(70);key('d',false);tick(30);assert(Math.abs(position()[2]-beforeGate[2])<.2,'return through player gate');
el('reference').onclick();tick();assert.equal(el('gateControl').hidden,true,'gate interaction hidden in aerial mode');
console.log('PASS: below-ground destination, crossing under moat, exit stairs, contextual gate, keyboard E, touch/button opening/closing and return. Renderer simulated.');

// Stand lighting is independent and its selected state survives the day/night cycle.
const fieldPower=el('view').dataset.fieldIntensity,screenState=el('view').dataset.screen;
assert(Number(el('view').dataset.standPower)>0);el('standLight').onclick();tick();assert.equal(el('view').dataset.standLights,'false');assert.equal(Number(el('view').dataset.standPower),0);
assert.equal(el('view').dataset.fieldIntensity,fieldPower);assert.equal(el('view').dataset.screen,screenState);
el('light').onclick();tick();el('standLight').onclick();tick();assert.equal(Number(el('view').dataset.standPower),0,'stand lights remain off during daylight');
el('light').onclick();tick();assert(Number(el('view').dataset.standPower)>0,'selected stand lighting returns at night');assert.equal(el('view').dataset.fieldIntensity,fieldPower);
el('place-cabin').onclick();tick(30);assert(Math.abs(position()[1]-9.68)<.03,'cabin destination on upper floor');
key('w');tick(20);key('w',false);tick(30);assert(position()[0]>-82,'cross cabin door onto gallery');assert(Math.abs(position()[1]-9.68)<.03,'leave cabin onto upper gallery, above lower passage');
key('s');tick(20);key('s',false);tick(30);assert(position()[0]<-82,'reenter cabin');assert(Math.abs(position()[1]-9.68)<.03,'return through cabin doorway without falling to lower route');
el('speed').value='6';el('place-field').onclick();tick();const fastStart=position();key('shift');key('w');tick(60);key('w',false);key('shift',false);tick(30);assert(fastStart[2]-position()[2]>33,'Shift reaches 36 m/s');
console.log('PASS: independent stand lighting and retained day/night preference, cabin destination and doorway at the correct upper height, Shift at 36 m/s. Graphics still mocked.');

// V7 player facilities and independent stand dimmer through the application's controls.
el('standIntensity').value='50';el('standIntensity').oninput();tick();const dim=Number(el('view').dataset.standPower),fieldFixed=el('view').dataset.fieldIntensity;
el('standIntensity').value='200';el('standIntensity').oninput();tick();assert(Math.abs(Number(el('view').dataset.standPower)-dim*4)<.001);assert.equal(el('view').dataset.fieldIntensity,fieldFixed);
el('light').onclick();tick();assert.equal(Number(el('view').dataset.standPower),0);el('light').onclick();tick();assert(Math.abs(Number(el('view').dataset.standPower)-dim*4)<.001,'dimmer retained after day/night');
el('place-locker').onclick();tick(30);assert(Math.abs(position()[1]+1.9)<.02,'locker corridor on separate basement level');
el('place-tunnel').onclick();tick(30);assert(Math.abs(position()[1]+3.1)<.02,'tunnel destination stays on underground floor');
console.log('PASS: facilities and tunnel destinations, tunnel exit, stand dimmer ratio, unchanged field lighting and retained dimmer after day/night. Renderer simulated.');
const previousField=el('view').dataset.fieldIntensity,previousStand=el('view').dataset.standPercent;
el('exteriorLight').onclick();tick();assert.equal(el('view').dataset.exterior,'false');assert.equal(el('view').dataset.fieldIntensity,previousField);assert.equal(el('view').dataset.standPercent,previousStand);
el('light').onclick();tick();el('light').onclick();tick();assert.equal(el('view').dataset.exterior,'false','exterior choice survives day/night');el('exteriorLight').onclick();tick();assert.equal(el('view').dataset.exterior,'true');
el('reference').onclick();tick();assert(Number(el('view').dataset.cameraNear)>10,'reference uses distant depth range');el('mode').onclick();tick();assert.equal(Number(el('view').dataset.cameraNear),.12,'walk recovers near detail');
console.log('PASS: exterior switch independent of field/stands, retained night preference and walk/aerial depth transition through app handlers.');
