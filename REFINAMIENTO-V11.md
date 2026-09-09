# Estadio Luis Köster · refinamiento arquitectónico v11

6 de septiembre de 2026. Actualización sobre la versión 10 publicada, conservando la ampliación académica y el perfil móvil. El trabajo se limita a arquitectura, terminaciones, representación de materiales e interfaz; no desarrolla una instalación eléctrica.

## Diagnóstico de las diez capturas

Las capturas aportadas muestran la aplicación en un iPhone. Las fotografías reales y la imagen de la ampliación aprobada se usan como referencias de aspecto y proporciones. No se deducen medidas de obra de las perspectivas. La fecha de captura de estas imágenes no fue verificada. Las consultas del entorno realizadas en la etapa anterior permanecen en `REFERENCIAS-ENTORNO.md`; esta etapa no realizó un nuevo relevamiento de Maps.

| Captura | Observación y diagnóstico | Cambio implementado |
|---|---|---|
| IMG_5475(1), campo | Las curvas aparecen entrecortadas. El código anterior dibujaba bandas trianguladas independientes sobre el césped. La captura no prueba si existe parpadeo ni cuál es su causa. | Pintura analítica sobre la misma superficie del césped, con filtrado por tamaño de píxel; se retiran las superposiciones de geometría del campo. |
| IMG_5478, vista desde principal/cabina | Se repite la irregularidad de las curvas; el CDM resulta muy plano y repetitivo. | La misma corrección de marcas; CDM con sus cuatro volúmenes, cubiertas y aberturas diferenciadas. |
| IMG_5481, pasillo | Franja azul fragmentada. El código sí permite confirmar que sus caras coincidían exactamente con las caras de los muros. | Separación de 4 mm entre caras; zócalos, marcos y umbrales. 74 rayos contra ambos lados de las paredes comprueban que la franja queda delante del muro. |
| IMG_5484, escalera norte | Amarillo excesivamente dominante. El material anterior ya no era emisivo, pero cubría casi toda la huella. | Franja de 55 mm en el borde, amarillo mate y textura de rugosidad; se reduce la concentración de iluminación difusa. |
| IMG_5476, escalera principal | Las gradas y el techo se leen poco diferenciados. | Frentes de galerías, pasamanos con bases y retornos, perfiles de cubierta y asientos moldeados. |
| IMG_5474, lateral de principal | Columnas y estructura de cubierta con poca jerarquía visual. | Cordones, montantes y diagonales de cerchas, correas, conexiones y bases de columnas; se conservan las curvas y los apoyos existentes. |
| IMG_5486, CDM | Grandes paños salmón, ventanas planas y bandas repetitivas. | Paños inferiores claros, revestimiento superior azul, cubiertas oscuras a dos aguas, hastiales, marcos, alféizares, puertas y bajadas pluviales. |
| IMG_5480, cabina | Carpinterías y encuentros poco definidos. | Ajuste de vidrio, dintel, antepecho, zócalos y dos sillas; se conservan las mesas existentes y la puerta central. |
| IMG_5483, túnel | Encuentros del techo y barandas poco terminados. | Remates siguiendo el techo escalonado, fijaciones de pasamanos y retornos, con las mismas cotas y alturas de paso. |
| IMG_5477, fosa | Agua de lectura uniforme y malla visualmente densa. | Variación suave entre borde y centro, transparencia según ángulo, reflejo moderado y malla distante filtrada con transparencia. |

Estas son correcciones de geometría y materiales verificadas en código. La mejora visual de cada fila y la ausencia de parpadeos siguen pendientes de renderizado con GPU.

## Arquitectura y terminaciones

Se mantienen las tres tribunas con tres niveles, 7.932 asientos y galerías; campo de 105 × 68 m, pista abierta al cielo, cuatro torres, pantalla posterior, cabina, fosas, vestuarios y túnel. El CDM permanece independiente y ese lateral sigue libre de tribunas. El barrio conserva sus 560 volúmenes y el detalle por distancia.

Las cubiertas conservan su envolvente. La estructura ahora distingue columnas, cordón superior e inferior, montantes y diagonales; las correas siguen la curva. Los frentes de las galerías evitan cortar los huecos de acceso. Las placas y anclajes pequeños conservan descarte por distancia. Los asientos cercanos tienen curvatura de asiento/respaldo y placa de fijación; siguen instanciados y usan la misma versión sencilla a distancia.

Se eliminaron las caras interiores duplicadas entre segmentos contiguos de los bloques curvos. Se conservan las caras exteriores y las tapas de los extremos. Esta reducción compensa parte de los nuevos detalles y no cambia la superficie transitable.

El CDM conserva sus cuatro plantas y alturas base. Los huecos usan un plano de vidrio retrasado respecto del marco y del alféizar; el edificio sigue siendo un modelo exterior cerrado, sin interiores nuevos. El azul/blanco y los techos oscuros se interpretan de las fotografías reales aportadas; la distribución fina de las aberturas sigue siendo propuesta.

La cabina conserva las dos mesas y añade dos sillas junto a ellas, con colisión. El corredor mantiene sus vestuarios y puertas abiertas. El túnel continúa bajo el pasillo público y la losa de la fosa: no se restituyó ningún cruce de jugadores por el pasillo de hinchas.

## Dimensiones propuestas

| Elemento | Valor del modelo |
|---|---|
| Campo | 105 × 68 m; se conservan las dimensiones exteriores |
| Pintura del campo | Ancho 0,11 m; línea perimetral contenida dentro del rectángulo; círculo central y arcos de penal a radio 9,15 m; puntos en las posiciones existentes; cuartos de círculo de córner de radio 1 m |
| Señalización de escalón | Ancho 0,055 m, antes aproximadamente 0,425 m; pequeño espesor visual de 6 mm sobre la huella |
| Franja azul y zócalos | Caras desplazadas 0,004 m respecto de los muros |
| Columnas de cubierta | Diámetro frontal 0,36 m y posterior 0,44 m |
| Cerchas | Separación aproximada de 1,05 m entre cordones; perfiles y conexiones propuestos |
| Cabina | Ancho 8 m, profundidad aproximada 3,3 m, piso a +7,98 m y altura 2,85 m, conservados |
| CDM | Volúmenes base de 35 × 52 × 11,8 m; 29 × 23 × 9,2 m; 4 × 17 × 7,1 m; 25 × 15 × 6,2 m, conservados |
| Cubiertas CDM | Elevación de cumbrera sobre alero: 1,25 m en el volumen mayor, 0,30 m en oficinas y 0,55 m en servicios; interpretación académica |
| Fosas | Ancho interior 1,60 m; fondo −1,20 m, agua −0,02 m y coronación +0,10 m; lámina 12 cm bajo el borde, conservada |
| Túnel | Piso −4,80 m; techo exterior −1,65 m; losa de fosa por encima a −1,40 m: separación de 0,25 m, conservada |
| Remates del intradós | Perfil visual de 40 × 28 mm sobre los bordes superiores; no altera la altura libre central |

Los espesores y perfiles se proponen por coherencia visual. No constituyen cálculo estructural ni planos de construcción. Se mantiene la leyenda «Modelo académico con dimensiones propuestas».

## Materiales e iluminación

La pintura del campo comparte el césped: ya no depende de otra superficie casi coplanar. Mantiene dimensiones métricas, limita la intensidad visual de las líneas de menos de un píxel y conserva las bandas de corte. El césped y la exposición global mantienen sus ajustes.

Se reutilizan los mapas de color, normales y rugosidad del proyecto. Acero, chapa, hormigón, plástico y vidrio tienen respuestas diferenciadas. El agua conserva una ondulación máxima de 8 mm, nivel y contención, con variación sutil de color/transparencia y reflejos existentes. Se usa la ordenación habitual de superficies transparentes. Su aspecto, las superposiciones transparentes y las transiciones de la malla requieren revisión con GPU en movimiento.

Se regeneraron los tres canales de iluminación difusa precalculada después de los cambios geométricos. Se suavizan los valores más intensos, se redistribuye la contribución superior/inferior y se añade una contribución indirecta aproximada bajo las cubiertas. Es una aproximación visual de rebote, no una simulación física completa de iluminación global.

No se añadieron fuentes de luz en tiempo real: el modelo conserva 60 fuentes configuradas, de las que 55 se sustituyen en Móvil/Equilibrada por coeficientes. Las cinco del modelo y las tres generales de la aplicación permanecen activas. El perfil Alta conserva el sistema dinámico anterior. Continúan los reguladores independientes de tribunas/campo, interruptor de pantalla y día/noche. La instalación eléctrica se deja para una etapa posterior.

## Interfaz móvil

La cabecera se reduce a marca, día/noche y Menú. Los ajustes secundarios y las vistas quedan dentro del panel desplazable. La ayuda inicial dura 5,5 segundos en cada modo y puede consultarse otra vez desde Menú → Controles.

Los destinos tienen flechas anterior/siguiente, desplazamiento horizontal y botones de al menos 44 × 44 píxeles CSS. Ocultar interfaz deja la vista despejada, con un control visible para recuperarla; Escape también restaura los controles. Se conserva la leyenda académica y el joystick discreto. Guardar captura continúa exportando solo el lienzo 3D. Se respetan las zonas seguras del dispositivo sin modificar barras de iOS ni del navegador.

Se comprobó el módulo real de interfaz con el HTML y CSS de producción en marcos de 390 × 650 y 844 × 350 px dentro de Chrome. Se probaron menú, ayuda, desaparición del aviso, desplazamiento de destinos y ocultar/recuperar. La captura `dist/verification/interfaz-v11.jpg` muestra esa prueba DOM sobre un fondo rotulado «Sin renderizado 3D»; no es una captura del estadio ni una prueba de iPhone físico. El generador reproducible es `scripts/prepare-ui-check.mjs`; sus tres archivos temporales `__qa-*` se retiraron de la publicación.

## Rendimiento y comprobaciones

Ver `REFINAMIENTO-RENDIMIENTO.md`, los cuatro JSON antes/después y `REFINAMIENTO-PRUEBAS.txt`. La suite completa de `npm test` pasó tras regenerar los coeficientes de iluminación.

Incluye 8.628 pasos de escaleras, conexiones de tres niveles, cabina, 528 pruebas de bordes de fosa, 84 ensayos de portón y separación, recorridos desde ambos vestuarios al campo, 73 rayos sobre suelos/alturas libres, controles simultáneos, velocidades 6/12/24/36 m/s y Shift, reguladores, calidad, diagnóstico y ciclo del sonido opcional. Las pruebas de controles y audio usan nodos o renderizador simulados; las pruebas de geometría sí intersecan las mallas reales. No son FPS ni renderizados.

El navegador de pruebas vuelve a informar `GL_VENDOR = Disabled`, `GL_RENDERER = Disabled` y `Error creating WebGL context` (registro 2026-09-06 20:52:33 UTC). No se dispone de iPhone físico. Por ello quedan pendientes:

- Compilación real de los shaders nuevos del campo y del agua.
- Comparativas 3D diurnas/nocturnas desde las diez cámaras de las capturas, con igual resolución y calidad, incluidas las dos vistas de cabina/CDM.
- Continuidad visual de las curvas al caminar; ausencia de parpadeos en la franja; antialias de mallas y transiciones de detalle.
- Aspecto del amarillo mate, asientos, cerchas, CDM, agua, vidrios y blancos del túnel después del ajuste de iluminación.
- FPS, tiempo de GPU, dibujos y triángulos realmente enviados por el navegador; estabilidad durante varios minutos, calentamiento y controles táctiles sobre iPhone 13.

El diagnóstico integrado permite registrar esa prueba: Menú → Diagnóstico de rendimiento → Medir 3 minutos. No se presentan estimaciones de presupuesto geométrico como FPS medidos ni se generaron imágenes para sustituir las capturas pendientes.

## Recursos y entrega

Geometría, GLSL, interfaz y detalles nuevos son originales del proyecto. Se reutilizan las 15 texturas PBR locales originales, el atlas de señalización y los tres WAV sintéticos con sus permisos existentes (`dist/textures/README.txt`, `dist/audio/README.txt`). Three.js r170 conserva su licencia MIT en `dist/THREE-LICENSE.txt`. No se incorporan fotografías de Maps como texturas ni archivos externos sin licencia.

El archivo `dist/koster-3d-proyecto.zip` contiene el proyecto completo, los módulos nuevos, generadores, pruebas, informes, datos de iluminación y la captura DOM disponible. Se mantiene el mismo proyecto de Sites y su audiencia actual.
