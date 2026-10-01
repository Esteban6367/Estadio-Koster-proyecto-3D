import {dimensions as D} from './dimensions.js';
import {mainV,mainD} from './main-plan.js';
// Photographic plan: bowed back, two uninterrupted diagonal fronts and short tips.
// Values fit the retained model; the photograph supplies proportions, not a survey.
export const passageEnd=D.main.upperFront/2-.28;
export const passageShoulder=16;
export const passageTipWidth=1.30;
export const passageRearV=u=>mainV(u,12.5);
export function passageFrontV(u){
 const q=Math.abs(u);
 if(q<=passageShoulder)return mainV(u,8.5);
 const t=Math.min(1,(q-passageShoulder)/(passageEnd-passageShoulder));
 return mainV(passageShoulder,8.5)*(1-t)+(passageRearV(passageEnd)-passageTipWidth)*t;
}
export const passageFrontD=u=>mainD(u,passageFrontV(u));
export function passageAt(u,d,pad=0){return Math.abs(u)<=passageEnd+pad&&mainV(u,d)>=passageFrontV(u)-pad&&d<=12.5+pad;}
export function passageRanges(d,pad=0){
 if(d<8.5-pad)return [];
 let lo=0,hi=passageEnd;
 for(let i=0;i<35;i++){const m=(lo+hi)/2;if(mainV(m,d)>=passageFrontV(m)-pad)lo=m;else hi=m;}
 const end=lo>passageEnd-1e-6?passageEnd+pad:lo;
 return [[-end,end]];
}
