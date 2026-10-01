import {pitchDimensions as P} from './dimensions.js';
// Original, local sounds. Nothing starts before the visitor enables audio.
export class StadiumAmbience {
 constructor(){this.enabled=false;this.volume=.3;this.context=null;this.buffers=null;this.loading=null;this.lastPosition=null;this.distance=0;this.lastStep=-1;this.steps=0;this.voices=new Set();this.hidden=false;this.seed=72931;this.previousVariant=[-1,-1];this.interval=.53;}
 random(){this.seed=(Math.imul(this.seed,1664525)+1013904223)>>>0;return this.seed/4294967296;}
 async setEnabled(value){
  this.enabled=Boolean(value);if(!this.enabled){this.stop();await this.context?.suspend();return false;}
  const Audio=globalThis.AudioContext||globalThis.webkitAudioContext;
  if(!Audio){this.enabled=false;throw new Error('Este navegador no permite iniciar el sonido.');}
  if(!this.context){this.context=new Audio();this.master=this.context.createGain();this.master.gain.value=this.volume;this.master.connect(this.context.destination);}
  if(!this.hidden)await this.context.resume();
  if(!this.loading)this.loading=Promise.all(['grass','paving','city'].map(async name=>{
   const response=await fetch('./audio/'+name+'.wav');if(!response.ok)throw new Error('No se pudo cargar el sonido.');return this.context.decodeAudioData(await response.arrayBuffer());
  })).then(buffers=>this.buffers=buffers).catch(e=>{this.loading=null;this.enabled=false;this.stop();throw e;});
  await this.loading;if(this.enabled&&!this.hidden)this.startLoop();return this.enabled;
 }
 setVolume(percent){this.volume=Math.max(0,Math.min(1,Number(percent)/100));if(this.master)this.master.gain.setTargetAtTime(this.volume,this.context.currentTime,.04);}
 startLoop(){if(this.loop||!this.buffers)return;const c=this.context;this.loop=c.createBufferSource();this.loop.buffer=this.buffers[2];this.loop.loop=true;this.outside=c.createGain();this.outside.gain.value=0;this.filter=c.createBiquadFilter();this.filter.type='lowpass';this.filter.frequency.value=1700;this.loop.connect(this.filter);this.filter.connect(this.outside);this.outside.connect(this.master);this.loop.start();}
 stop(){if(this.loop){this.loop.stop();this.loop.disconnect();this.loop=null;this.filter?.disconnect();this.outside?.disconnect();}for(const s of this.voices){try{s.stop();}catch{}}this.voices.clear();this.reset();}
 reset(){this.lastPosition=null;this.distance=0;}
 async setHidden(hidden){this.hidden=hidden;if(hidden){this.stop();await this.context?.suspend();}else if(this.enabled&&this.context){try{await this.context.resume();if(this.enabled&&!this.hidden)this.startLoop();}catch{}}}
 step(grass,inside){
  if(this.voices.size>=2||!this.buffers)return false;const c=this.context,s=c.createBufferSource(),gain=c.createGain(),filter=c.createBiquadFilter(),kind=grass?0:1;
  let variant=Math.floor(this.random()*4);if(variant===this.previousVariant[kind])variant=(variant+1)%4;this.previousVariant[kind]=variant;
  s.buffer=this.buffers[kind];s.playbackRate.value=.97+this.random()*.06;gain.gain.value=(inside?.40:.45)*(.90+this.random()*.18);
  filter.type='lowpass';filter.frequency.value=inside?1500:grass?2400:2000;s.connect(filter);filter.connect(gain);gain.connect(this.master);
  // No short slapback: it doubled every impact in the old tunnel treatment.
  this.voices.add(s);this.steps++;s.onended=()=>{this.voices.delete(s);s.disconnect();filter.disconnect();gain.disconnect();};s.start(0,variant*.5,.38);return true;
 }
 update(dt,player,walking,inside=false){
  if(!this.enabled||this.hidden||!this.buffers||this.context.state!=='running'){this.reset();return;}
  const c=this.context,exterior=Math.max(Math.abs(player.x)/100,Math.abs(player.z)/115);
  this.outside?.gain.setTargetAtTime(inside?.025:exterior>1?.30:.12,c.currentTime,.6);
  this.filter?.frequency.setTargetAtTime(inside?420:1700,c.currentTime,.5);
  if(!walking){this.reset();return;}
  
  let moved=0;if(this.lastPosition){const d=Math.hypot(player.x-this.lastPosition.x,player.z-this.lastPosition.z);if(d<Math.max(5,dt*40)){moved=d;this.distance=Math.min(1.1,this.distance+d);}else this.distance=0;}
  this.lastPosition={x:player.x,z:player.z};
  if(moved>.002&&this.distance>.78&&c.currentTime-this.lastStep>=this.interval){
   this.step(!inside&&Math.abs(player.x)<P.halfWidth&&Math.abs(player.z)<P.halfLength,inside);this.lastStep=c.currentTime;this.distance=0;
   const speed=moved/Math.max(dt,.001);this.interval=Math.max(.46,.57-Math.min(speed,36)*.002+(this.random()-.5)*.025);
  }
 }
}
