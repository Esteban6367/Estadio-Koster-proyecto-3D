// Analytic paint shares the turf surface: no coplanar overlays or detached segments.
// Coordinates in metres; the outer field remains 68 × 105 m.
export const pitchMarkingGLSL = `
float kPitchDistance(vec2 p) {
  vec2 q=abs(p);
  float d=min(abs(q.x-33.945),abs(q.y-52.445));
  d=min(d,abs(p.y));
  d=min(d,abs(length(p)-9.15));
  d=min(d,length(p)-.12);
  d=min(d,max(abs(q.x-20.16),max(36.-q.y,0.)));
  d=min(d,max(abs(q.y-36.),max(q.x-20.16,0.)));
  d=min(d,max(abs(q.x-9.16),max(47.-q.y,0.)));
  d=min(d,max(abs(q.y-47.),max(q.x-9.16,0.)));
  float penalty=length(vec2(p.x,q.y-41.5));
  d=min(d,penalty-.14);
  d=min(d,max(abs(penalty-9.15),q.y-36.));
  d=min(d,abs(length(q-vec2(34.,52.5))-1.));
  return d;
}
`;
export function pitchPaintDistance(x,z){
 const qx=Math.abs(x),qz=Math.abs(z),p=Math.hypot(x,qz-41.5);
 return Math.min(Math.abs(qx-33.945),Math.abs(qz-52.445),Math.abs(z),Math.abs(Math.hypot(x,z)-9.15),Math.hypot(x,z)-.12,
 Math.max(Math.abs(qx-20.16),Math.max(36-qz,0)),Math.max(Math.abs(qz-36),Math.max(qx-20.16,0)),
 Math.max(Math.abs(qx-9.16),Math.max(47-qz,0)),Math.max(Math.abs(qz-47),Math.max(qx-9.16,0)),
 p-.14,Math.max(Math.abs(p-9.15),qz-36),Math.abs(Math.hypot(qx-34,qz-52.5)-1));
}
