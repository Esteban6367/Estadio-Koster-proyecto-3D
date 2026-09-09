// Artistic scene values in the renderer's linear lighting space, not a certified lighting study.
export const lighting = {
  night: { exposure: .9, sun: 0, fill: .08, sky: .24, environment: .09, tower: 18000 },
  day: { exposure: .95, sun: 2.65, fill: .3, sky: .9, environment: .48, tower: 0 }
};
export function fieldIntensity(night, percent=100) {
  return night ? lighting.night.tower * Math.max(.3,Math.min(1.2,Number(percent)/100||1)) : 0;
}
export const speeds = { initial: 12, maximum: 36, presets: [6,12,24,36] };
