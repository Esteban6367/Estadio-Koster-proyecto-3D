// Photo-supported exterior; dimensions are conservative model estimates, not survey data.
export const sector={u0:28.80,u1:44.50,stepU0:36.90,stepU1:44.50,front:30.60,landingEnd:34.10,stepsEnd:37.46,rise:.16,tread:.42,steps:8,floor:1.28};
export function sectorFloor(u,d){
 const s=sector;
 if(u>=s.u0&&u<=s.u1&&d>=s.front&&d<=s.landingEnd)return s.floor;
 if(u>=s.stepU0&&u<=s.stepU1&&d>s.landingEnd&&d<=s.stepsEnd)return Math.min(s.steps,Math.max(1,Math.ceil((s.stepsEnd-d-1e-7)/s.tread)))*s.rise;
 return null;
}
export function sectorBlocked(u,d){
 if(u>sector.u0-.3&&u<sector.u1+.3&&d>30.20&&d<30.98)return true; // Photo shows closed doors and gate.
 return u>28.80-.3&&u<35.90+.3&&d>34.10-.3&&d<36.10+.3; // Low planter, outside the landing.
}
