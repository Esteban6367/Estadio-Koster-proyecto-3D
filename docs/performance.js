// Counts come from WebGLRenderer.info, not scene totals. CPU and GPU are distinct.
export class PerformanceMeter {
 constructor(renderer){this.renderer=renderer;this.previous=null;this.intervals=[];this.windowMs=0;this.windowFrames=0;this.rows=[];this.latest=null;this.recording=false;this.finished=false;this.gpu=null;this.pending=[];this.frame=0;this.cpuTotal=0;this.cpuPeak=0;this.moveTotal=0;this.cpuFrames=0;this.ext=null;this.gl=null;this.renderer.info&&(this.renderer.info.autoReset=false);}
 reset(){this.previous=null;this.intervals=[];this.windowMs=0;this.windowFrames=0;this.cpuTotal=this.cpuPeak=this.moveTotal=this.cpuFrames=0;}
 start(t=performance.now()){this.rows=[];this.finished=false;this.recording=true;this.recordStart=t;this.recordEnd=t+190000;this.warmEnd=t+10000;this.reset();}
 begin(t){this.cpuStart=performance.now();this.frame++;this.renderer.info?.reset();if(this.previous!==null){const ms=t-this.previous;if(ms>0){this.intervals.push(ms);this.windowMs+=ms;this.windowFrames++;}}this.previous=t;
  if(this.recording&&t>=this.recordEnd){this.recording=false;this.finished=true;}
  if(this.gl&&this.pending.length&&this.frame%15===0){const q=this.pending[0];if(this.gl.getQueryParameter(q,this.gl.QUERY_RESULT_AVAILABLE)){if(!this.gl.getParameter(this.ext.GPU_DISJOINT_EXT))this.gpu=this.gl.getQueryParameter(q,this.gl.QUERY_RESULT)/1e6;else this.gpu=null;this.gl.deleteQuery(q);this.pending.shift();}}
 }
 enableGpu(){try{this.gl=this.renderer.getContext?.();this.ext=this.gl?.getExtension('EXT_disjoint_timer_query_webgl2');if(!this.ext)this.gl=null;}catch{this.gl=null;}}
 beforeRender(){if(this.gl&&this.frame%30===0&&this.pending.length<3){this.query=this.gl.createQuery();this.gl.beginQuery(this.ext.TIME_ELAPSED_EXT,this.query);}}
 end(t,context,movementMs=0){if(this.query){this.gl.endQuery(this.ext.TIME_ELAPSED_EXT);this.pending.push(this.query);this.query=null;}
  const cpu=performance.now()-this.cpuStart;this.cpuTotal+=cpu;this.cpuPeak=Math.max(this.cpuPeak,cpu);this.moveTotal+=movementMs;this.cpuFrames++;
  if(this.windowMs<1000)return null;
  const sorted=this.intervals.slice().sort((a,b)=>a-b),info=this.renderer.info,canvas=this.renderer.domElement;
  this.latest={sampleFrames:this.windowFrames,sampleDurationMs:this.windowMs,seconds:Number((t/1000).toFixed(1)),fps:Number((this.windowFrames*1000/this.windowMs).toFixed(1)),frameMs:Number((this.windowMs/this.windowFrames).toFixed(2)),p95FrameMs:Number(sorted[Math.floor((sorted.length-1)*.95)].toFixed(2)),worstFrameMs:Number(sorted.at(-1).toFixed(2)),cpuAndSubmitMs:Number((this.cpuTotal/this.cpuFrames).toFixed(3)),peakCpuMs:Number(this.cpuPeak.toFixed(3)),movementMs:Number((this.moveTotal/this.cpuFrames).toFixed(3)),gpuMs:this.gpu===null?null:Number(this.gpu.toFixed(3)),drawCalls:info?.render.calls??null,triangles:info?.render.triangles??null,lines:info?.render.lines??null,geometries:info?.memory.geometries??null,textures:info?.memory.textures??null,programs:info?.programs?.length??null,resolution:canvas?[canvas.width,canvas.height]:null,...(typeof context==='function'?context():context)};
  if(this.recording&&t>=this.warmEnd)this.rows.push(this.latest);this.intervals=[];this.windowFrames=0;this.windowMs=0;this.cpuTotal=this.cpuPeak=this.moveTotal=this.cpuFrames=0;return this.latest;
 }
 report(context){const rows=this.rows;return{version:9,date:new Date().toISOString(),browser:typeof navigator==='undefined'?'test':navigator.userAgent,note:'Measurements from this browser only. CPU+submission is not GPU duration. Draw calls/triangles include any shadow passes in that frame. Warmup 10 s, target capture 180 s; export may be partial.',completed:this.finished,sampledSeconds:rows.reduce((n,r)=>n+r.sampleDurationMs,0)/1000,averageFps:rows.length?rows.reduce((n,r)=>n+r.sampleFrames,0)*1000/rows.reduce((n,r)=>n+r.sampleDurationMs,0):null,lowestSecondFps:rows.length?Math.min(...rows.map(r=>r.fps)):null,latest:this.latest,...context,samples:rows};}
}

export class AdaptiveResolution {
 constructor(){this.scale=1;this.slow=0;this.fast=0;}
 reset(){this.scale=1;this.slow=this.fast=0;}
 sample(ms,enabled){if(!enabled)return false;if(ms>40){this.slow++;this.fast=0;}else if(ms<25){this.fast++;this.slow=0;}else{this.slow=this.fast=0;}
  const old=this.scale;if(this.slow>=4){this.scale=Math.max(.8,Math.round((this.scale-.1)*10)/10);this.slow=0;}if(this.fast>=8){this.scale=Math.min(1,Math.round((this.scale+.1)*10)/10);this.fast=0;}return old!==this.scale;
 }
}
