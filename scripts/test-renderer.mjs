export * from '../dist/three.module.min.js';
import * as T from '../dist/three.module.min.js';
T.TextureLoader.prototype.loadAsync=async()=>new T.DataTexture(new Uint8Array([170,170,170,255]),1,1);
export class WebGLRenderer{constructor({canvas}={}){this.domElement=canvas||{};this.info={render:{calls:0,triangles:0,lines:0},memory:{geometries:0,textures:0},programs:[],reset(){}};this.shadowMap={};this.capabilities={getMaxAnisotropy:()=>8};this.frames=0;}setPixelRatio(){}setSize(w,h){this.domElement.width=w;this.domElement.height=h;}render(){this.frames++;}}
export class PMREMGenerator{fromScene(){return {texture:new T.Texture()};}fromCubemap(){return {texture:new T.Texture()};}dispose(){}}

export class CubeCamera extends T.Object3D{constructor(){super();}update(){}}
