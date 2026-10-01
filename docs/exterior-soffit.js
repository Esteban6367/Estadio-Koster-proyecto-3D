// Exterior underside, adapted from estadio2.mp4 00:04–00:08 and estadio3.mp4.
// Proposed local proportions; the existing gallery top stays at +12.18 m.
export const soffitStart=30.6,soffitEnd=33.12;
export const soffitCuts=Array.from({length:7},(_,i)=>soffitStart+i*.42);
export const exteriorSoffit=d=>10.89+.21*Math.max(0,Math.min(5,Math.floor((d-soffitStart+1e-7)/.42)));
