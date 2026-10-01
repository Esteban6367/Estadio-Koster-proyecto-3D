// Freeze only static transforms. Every animated root opts out explicitly.
export function freezeStaticTransforms(scene){scene.traverse(o=>{o.updateMatrix();o.matrixAutoUpdate=!!o.userData.dynamicTransform;});}
