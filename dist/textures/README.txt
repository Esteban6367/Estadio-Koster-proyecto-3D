Texturas originales del proyecto Estadio Luis Köster.
Generadas de forma determinista mediante scripts/materials.py, semilla 146.
No proceden de fotografías ni de bancos de imágenes externos. Se permite su reutilización, modificación y distribución como parte de este proyecto o por separado.

Mapas JPEG de 1024 × 1024: color sRGB, normal tangent-space y roughness (lineales). Repetición a escala métrica. Mipmaps y anisotropía gestionados por Three.js.
El motor Three.js r170 se distribuye bajo licencia MIT; ver THREE-LICENSE.txt.

Versión 4: ruido periódico sin costuras; hojas cortas de césped, áridos y poros, juntas y chapa nervada. Color, normal y rugosidad tienen el mismo tamaño. El césped usa rugosidad alta para evitar reflejos especulares blancos exagerados. Las cajas con instancias aplican UV a escala métrica; las superficies curvas proyectan las UV según la orientación de cada cara.

Versión 5: boundary-model.js genera localmente dos recursos originales de 128 × 128: una normal periódica para el agua y una trama RGBA para el LOD distante del alambrado. Incluyen mipmaps; la malla cercana usa geometría de hilos. No se descargan fotografías ni mapas adicionales. Se permite reutilizar, modificar y distribuir estos dos recursos y sus generadores dentro o fuera del proyecto. Las nuevas fotos se emplean como referencia arquitectónica, no como texturas distribuidas.

Versión 6: se reutilizan los mismos recursos originales en las tres fosas y la ampliación. No se añadieron fotos ni dependencias externas. Los permisos anteriores se conservan.

Versión 7: interiores, túnel y pantalla reutilizan los materiales originales. La numeración y señalización se dibujan localmente con fuentes del sistema; no se descargan imágenes de terceros. Los espejos usan una reflexión ambiental aproximada, sin captura planar en tiempo real.

Versión 10: mayor detalle de áridos y poros, juntas de pavimento y nervaduras de chapa de período 32 píxeles para cerrar correctamente la repetición en 1024. Mapas y resoluciones conservados; reutilización de mapas para rugosidad de asientos y acero. Recursos originales, mismos permisos. Las fotos de Maps se consultan sin distribuirlas. Véase REFERENCIAS-ENTORNO.md en el proyecto.
