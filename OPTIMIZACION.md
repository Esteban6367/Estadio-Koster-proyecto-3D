# Optimización móvil · versión 9

Fecha: 6 de septiembre de 2026. Problema informado por el usuario: aproximadamente 6 FPS en iPhone 13. Objetivo: 30 FPS sostenidos, pendiente de medición en ese dispositivo.

## Qué se pudo medir antes de cambiar

La versión 8 tenía 60 luces locales: 38 puntuales y 22 focos, además de tres luces generales del controlador. El perfil Móvil reducía resolución y algunos detalles, pero conservaba las luces en las listas del renderizador. Contenía 7.932 asientos y 588 viviendas. Los totales de triángulos incluían representaciones de detalle alternativas: no eran triángulos enviados en un fotograma.

El navegador Chrome remoto falló antes de crear WebGL, tanto al inicio como al final de esta etapa. Por eso no se dispone de tiempos GPU, llamadas de dibujo reales ni capturas antes/después. No se pudo demostrar con un perfil de GPU cuál era el cuello de botella del iPhone. La cantidad de luces, los lotes que abarcaban toda la escena y el detalle urbano distante fueron costos concretos identificados en el código.

Los informes `PERF-ANTES.json` y `PERF-DESPUES.json` contienen inventario y microtiempos del controlador en Node v24.19.0, Linux, AMD EPYC 9V74 80-Core Processor. Texturas y canvas 2D se sustituyeron para construir la geometría sin GPU. No son mediciones de Safari ni una simulación de su rendimiento.

## Cambios implementados

**Iluminación.** Móvil y Equilibrada reemplazan 55 luces locales: 22 de tribunas/cabina, 17 de interiores y 16 de accesos/fachadas/alumbrado. Quedan cuatro focos del campo, una luz de pantalla y tres fuentes generales: ocho luces en las listas del renderizador. Las 55 se excluyen mediante visibilidad, no solo bajando su intensidad. Las fuentes originales se conservan para Alta.

Un proceso fuera del navegador precalcula irradiancia difusa por vértice y por instancia. Usa un árbol espacial para comprobar oclusión contra gradas, cubiertas, pisos y muros principales. Tiene tres canales: noche, tribunas y luz interior permanente. El interruptor y regulador de tribunas cambian el canal correspondiente, sin modificar campo o pantalla ni recompilar por cada sector visitado.

La aproximación de las instancias usa una dirección dominante de luz y una pequeña componente difusa; no equivale a iluminación global completa. El brillo especular local de todas las fuentes originales no se reproduce exactamente en los perfiles optimizados. Se mantienen los reflejos PBR del entorno. La apariencia final necesita revisión con GPU.

Los coeficientes están cuantizados a 16 bits: 11,968,956 bytes residentes antes de asignar atributos y 1,633,805 bytes para su descarga gzip. Hay alternativa sin gzip si no existe descompresión nativa. El teléfono carga el resultado y no ejecuta el trazado de rayos. Generador: `npm run bake`; debe repetirse al cambiar arquitectura o luces.

**Sombras y reflejos.** Una sombra solar de 1024 en móvil durante el día; el sol apagado deja de generar sombras nocturnas. Alta conserva hasta dos sombras de torres y una solar diurna de 2048. El mapa solar está almacenado entre cambios; la actualización del portón se limita en móvil. La reflexión del entorno ya era estática: se conserva, y el regulador no crea una reflexión nueva en cada arrastre. Agua, fosas y su onda suave permanecen.

**Geometría y contexto.** Se conservan dimensiones, siluetas, los 7.932 asientos y las 588 viviendas. Los cuerpos urbanos se agrupan en celdas de 256 m; los detalles, en celdas de 96 m. Ventanas, cordones, postes, vehículos y vegetación pequeña se muestran por cercanía; se retiran algunos árboles lejanos. Los techos conservan colores y material metálico. Las escaleras exteriores y el portón se agrupan por material. Los vértices idénticos se comparten sin modificar normales, UV o posiciones. Los asientos cercanos conservan su geometría moldeada; a distancia usan asiento y respaldo simplificados. Patas, sombras de contacto, interiores pequeños y mallas se gestionan por distancia con márgenes para evitar cambios repetidos al cruzar un umbral.

**Texturas.** Se comparten carteles repetidos y se ajusta la resolución de rótulos pequeños. El inventario de texturas pasa de 83 a 61; no corresponde necesariamente a texturas residentes en GPU al mismo tiempo. Se conservan los 15 JPEG PBR de 1024 y sus mipmaps. JPEG comprime la descarga, no la memoria GPU. Esta versión no incorpora KTX2/ASTC; las reducciones principales están en iluminación, selección de detalle, carteles y envío de geometría.

**Movimiento e interfaz.** Se usa una cuadrícula para consultar solo obstáculos cercanos, manteniendo las comprobaciones exactas y pasos de hasta 8 cm. En reposo se omite el trabajo redundante. La mediana del movimiento a 36 m/s pasó de 0.1732 a 0.0769 ms por llamada en el campo y de 0.1651 a 0.0787 ms en el perímetro, en ese equipo. No predice el tiempo del iPhone. Se eliminó el desenfoque de fondo de los botones táctiles. La cámara, velocidades, controles, accesos y niveles superpuestos se conservan.

## Comparación de candidatos visibles

Estimación por frustum en CPU, perfil Móvil, cámaras equivalentes, 1536 × 864. Incluye objetos que podrían llegar al renderizador aunque otros los oculten. No incluye sombras, no mide llamadas reales al controlador gráfico y no permite deducir FPS.

| Cámara | Objetos candidatos antes → después | Triángulos candidatos antes → después |
|---|---:|---:|
| referencia | 594 → 439 | 730,225 → 647,715 |
| campo | 269 → 251 | 693,205 → 414,507 |
| principal | 331 → 296 | 856,785 → 637,731 |
| túnel | 304 → 299 | 859,373 → 641,759 |
| CDM | 115 → 116 | 494,367 → 102,901 |
| calle | 96 → 101 | 579,178 → 226,222 |

En CDM y calle aumentan ligeramente los objetos candidatos por la división en sectores, mientras disminuye la geometría enviada potencialmente. En referencia, campo y principal disminuyen ambos. Se evita presentar una mejora uniforme donde no existe. Informes completos: `PRESUPUESTO-ANTES.json` y `PRESUPUESTO-DESPUES.json`.

## Diagnóstico dentro de la aplicación

Ajustes → Diagnóstico de rendimiento → Medir 3 minutos. Hay 10 segundos iniciales de preparación; se puede cerrar el panel y caminar. Alternar día/noche, visitar los mismos sectores y descargar el diagnóstico. El archivo permanece en el dispositivo hasta que el usuario lo descarga o decide compartirlo.

Se informa FPS por intervalos reales, promedio de tiempo, P95, peor intervalo, promedio y pico de CPU más envío, tiempo medio de movimiento, resolución del lienzo, llamadas/triángulos/líneas de `renderer.info`, luces activas, sombras y materiales compilados. El tiempo GPU se consulta de manera asíncrona únicamente si existe `EXT_disjoint_timer_query_webgl2`; en caso contrario figura como no disponible. CPU más envío no equivale a tiempo GPU. Las llamadas incluyen las pasadas de sombra de ese fotograma.

La resolución automática inicia al 100% de píxeles CSS en móvil y baja hasta el 80% solo ante lentitud sostenida, recuperándose cuando hay margen. Los controles HTML no se reducen. Se puede seleccionar Fija. Esta reducción puede afectar levemente la nitidez 3D; no se promete calidad idéntica bajo cualquier carga.

## Verificación y pendientes

`npm test` pasó: circuitos privados y públicos, escaleras, fosas, cabina, portón a 36 m/s, controles táctiles simultáneos simulados, 73 rayos de altura/piso, 225 líneas de visión de pantalla y pruebas de optimización. Se contrastaron 18.000 puntos de colisión con la implementación anterior. Las pruebas del shader comprueban su ensamblado y atributos, pero no su compilación con GPU.

Último intento de Chrome remoto: 2026-09-06 18:44:33 UTC, `GL_VENDOR = Disabled, GL_RENDERER = Disabled; Error creating WebGL context`. No se realizaron pruebas en iPhone 13 físico, mediciones gráficas sostenidas, revisión de calentamiento o capturas renderizadas comparativas. No se generaron imágenes para sustituir esas capturas.

La meta de 30 FPS se comprobará mediante el diagnóstico del teléfono. Si persiste lentitud, el archivo permitirá separar exceso de dibujos, costo GPU, resolución, compilaciones y movimiento antes de cambiar más calidad.

## Recursos y procedencia

Geometría de optimización, coeficientes de iluminación y generadores: originales del proyecto. Se mantienen las licencias de texturas en `dist/textures/README.txt` y Three.js MIT en `dist/THREE-LICENSE.txt`. No se descargaron recursos visuales externos. Referencias técnicas: [sombras e iluminación precalculada de Three.js](https://threejs.org/manual/en/shadows.html) y [atributos por instancia](https://threejs.org/docs/pages/InstancedBufferAttribute.html).

Modelo académico con dimensiones propuestas. La iluminación es una representación visual y no un cálculo luminotécnico certificado.
