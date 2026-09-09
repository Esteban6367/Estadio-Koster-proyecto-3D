import assert from 'node:assert/strict';
import fs from 'node:fs';
import {StadiumAmbience} from './dist/ambience.js';
let contexts=0,fetches=0,started=0;
const parameter=v=>({value:v,setTargetAtTime(v){this.value=v;}});
const node=()=>({connect(){},disconnect(){},gain:parameter(1),frequency:parameter(0),delayTime:parameter(0),playbackRate:parameter(1)});
class Context{constructor(){contexts++;this.state='suspended';this.currentTime=0;this.destination={};}resume(){this.state='running';return Promise.resolve();}suspend(){this.state='suspended';return Promise.resolve();}createGain(){return node();}createBiquadFilter(){return node();}createDelay(){return node();}createBufferSource(){return{...node(),start(){started++;},stop(){this.onended?.();}};}decodeAudioData(b){return Promise.resolve({bytes:b.byteLength});}}
globalThis.AudioContext=Context;globalThis.fetch=async url=>{fetches++;const b=fs.readFileSync('./dist/'+url.replace('./',''));assert.equal(b.toString('ascii',0,4),'RIFF');assert.equal(b.readUInt16LE(22),1);assert.equal(b.readUInt32LE(24),22050);return new Response(b);};
const a=new StadiumAmbience();a.update(.1,{x:0,z:0},true);assert.equal(contexts,0);assert.equal(fetches,0,'no autoplay/download');
await a.setEnabled(true);assert.equal(contexts,1);assert.equal(fetches,3);assert(a.loop);assert.equal(started,1);
a.setVolume(65);assert.equal(a.master.gain.value,.65);a.setVolume(200);assert.equal(a.master.gain.value,1);
a.update(.1,{x:0,z:0},true);a.context.currentTime=1;a.update(.1,{x:1,z:0},true);assert.equal(a.voices.size,1);assert.equal([...a.voices][0].buffer,a.buffers[0]);
a.context.currentTime=2;a.update(.1,{x:2,z:0},true,true);assert.equal(a.voices.size,2);assert.equal([...a.voices][1].buffer,a.buffers[1]);a.context.currentTime=3;a.update(.1,{x:3,z:0},true);assert.equal(a.voices.size,2,'voice cap');
await a.setHidden(true);assert.equal(a.context.state,'suspended');assert.equal(a.loop,null);assert.equal(a.voices.size,0);
await a.setHidden(false);assert(a.loop);assert.equal(a.context.state,'running');const start=started;a.update(.1,{x:0,z:0},true);a.context.currentTime=5;a.update(.1,{x:100,z:100},true);assert.equal(started,start,'teleport silent');
await a.setEnabled(false);assert.equal(a.loop,null);assert.equal(a.context.state,'suspended');await a.setHidden(true);await a.setHidden(false);assert.equal(a.loop,null,'disabled remains silent');
await a.setEnabled(true);assert.equal(fetches,3,'assets decoded once');await a.setEnabled(false);
const b=new StadiumAmbience();globalThis.fetch=async()=>new Response('',{status:404});await assert.rejects(()=>b.setEnabled(true));assert.equal(b.enabled,false);assert.equal(b.loading,null,'failed loads retryable');
console.log('PASS: opt-in lifecycle, 3 local WAVs, separate volume, grass/pavement steps, tunnel routing, 2-voice cap, hidden suspension, return, no teleport step, cached assets and load failure. Web Audio nodes mocked.');
// Reuse decoded banks. Check actual movement cadence across slow/fast frame rates.
await a.setEnabled(true);let scenarios=0;
for(const fps of[10,30,60])for(const speed of[6,12,24,36]){
 a.reset();a.lastStep=-1;a.interval=.53;for(const v of [...a.voices])v.onended?.();const count=a.steps,base=a.context.currentTime+20;
 for(let i=0;i<=fps*10;i++){a.context.currentTime=base+i/fps;for(const v of [...a.voices])v.onended?.();a.update(1/fps,{x:i*speed/fps,z:90},true);}
 assert(a.steps-count>=15&&a.steps-count<=23,'footsteps should stay at human cadence even in turbo');
 const stopped=a.steps;for(let i=0;i<fps*3;i++){a.context.currentTime+=1/fps;a.update(1/fps,{x:speed*10,z:90},true);}assert.equal(a.steps,stopped,'wall/idle movement does not emit stored steps');scenarios++;
}
await a.setEnabled(false);
for(const name of['paving','grass']){const wav=fs.readFileSync('./dist/audio/'+name+'.wav');assert.equal(wav.readUInt32LE(40),22050*2*2,'four half-second slots');const hashes=[];for(let k=0;k<4;k++){const start=44+k*22050;assert.equal(wav.readInt16LE(start),0);hashes.push(wav.subarray(start,start+16758).toString('base64'));for(let n=start+16758;n<start+22050;n+=2)assert.equal(wav.readInt16LE(n),0,'silent seam');}assert.equal(new Set(hashes).size,4,'four distinct sole samples');}
console.log('PASS:',scenarios,'speed/frame-rate scenarios, 3 s stationary silence, four distinct WAV slots per surface with silent seams. Audible quality not evaluated by these tests.');
