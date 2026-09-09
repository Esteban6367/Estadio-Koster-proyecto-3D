# Estadio Luis Köster · actualización 12

8 de septiembre de 2026. Correcciones sobre la versión 11 del mismo proyecto, conservando arquitectura, dimensiones, recorridos y controles. La publicación mantiene «Modelo académico con dimensiones propuestas».

## Vista aérea y superficies

Las capturas aportadas muestran franjas y triángulos cruzando campo y pista. El código contenía grandes superficies superpuestas y utilizaba el mismo plano cercano de 0,12 m al caminar y al alejar la cámara. Son condiciones que favorecen conflictos de profundidad; sin renderizado no se atribuye cada fragmento de las capturas a una causa única confirmada.

Se sustituyeron esas superficies por regiones contiguas: campo, césped interior, pista, borde y pavimentos. Los terrenos generales excluyen el cuenco del estadio. Calles y veredas se cortan en las intersecciones. Se conservan los huecos reales de fosas, descenso y salida subterránea. Siete rayos de control verifican una única superficie en los encuentros muestreados; otras pruebas verifican agua, fondo y paredes.

La referencia encuadra la reserva del estadio con ocho esquinas y márgenes, adaptando distancia e inclinación a la relación de aspecto. El centro de órbita incluye su altura. El zoom se interpola y limita. El plano cercano aumenta al elevarse sobre las estructuras; vuelve a 0,12 m al caminar. El lejano permanece en 1.400 m. Se comprobaron 40 proyecciones en cinco formatos y distintas posiciones de zoom. La separación mínima modelada de dos planos de prueba equivale a 41,1 niveles de profundidad de 24 bits; es una comprobación matemática, no una medición de GPU.

También se cambió el cálculo de suavizado de la pintura del campo para obtener su escala de las coordenadas sobre la superficie. La continuidad geométrica y el montaje del shader pasan las pruebas; su aspecto lejano y en movimiento requiere revisión gráfica.

## Cuatro torres y proyectores

Cada torre conserva su ubicación y tiene una parrilla vertical, con travesaños y apoyos separados de la orientación de los proyectores. Se modelaron 20 unidades por torre, 80 en total, con carcasa profunda, tres paneles ópticos, marco, horquilla, pivotes y disipadores simplificados. La parrilla queda adelantada respecto del fuste. Las ópticas apuntan hacia los mismos objetivos de las cuatro luces efectivas del campo.

La referencia visual consultada es [ArenaVision LED gen3.5 de Signify](https://www.signify.com/global/prof/outdoor-luminaires/sports-and-area-floodlighting/high-end-sports-floodlighting/signify-arenavision-led-gen35/912300060894_EU/product), incluida su fotografía de carcasa y soporte. Se contrastó con las fotografías reales aportadas de las torres del Köster. La foto del fabricante se usó para consulta; no se incorpora al sitio ni se emplea como textura.

Las dimensiones representadas son propuestas: carcasa de aproximadamente 0,735 × 0,765 × 0,18 m, tres paneles de 0,66 × 0,207 m, centro de conjunto a 29,60 m y avance de 1,25 m respecto del eje de torre. No es una reproducción certificada de un producto ni un dimensionamiento estructural. La textura óptica de 64 × 64 píxeles es original. Se comparten geometrías y materiales; los detalles posteriores se ocultan a distancia. Las 80 unidades visibles utilizan las cuatro luces del campo existentes.

## Exterior, calles y señalización

Se añaden 20 luminarias en fachadas y accesos: 12 en las tres tribunas y ocho en el CDM. Se completan 22 postes de las calles existentes con brazo, carcasa y óptica inferior. Se conservan las demás luminarias de acceso y recorrido. Sus posiciones siguen las calles y las fachadas modeladas; alturas, intensidades y distribución son propuestas visuales, sin cálculo de instalación eléctrica ni garantía de iluminancia.

Las nuevas fuentes apuntan hacia pavimentos y fachadas y se integran en el precálculo. Se subdividieron selectivamente esas superficies para registrar la variación de luz, conservando geometría sencilla lejos del estadio. Se retiraron los discos luminosos planos del alumbrado anterior. El control «Exterior encendido/apagado» funciona en los tres perfiles y conserva su preferencia al cambiar día/noche, independientemente del campo, las gradas y la pantalla.

Los 12 carteles de sectores se ubican junto a los pasamanos, fuera del paso central de 3,10 m. Se verificó su lectura mediante rayos desde el pasillo. Las rejillas tienen bandeja, marco y travesaños integrados al pavimento. Las barandas y colisiones de circulación se conservan.

## Pasos

Se reemplazaron las muestras breves repetitivas por cuatro variantes originales por superficie. Se retiró el componente tonal percusivo del pavimento y el eco corto que duplicaba los golpes en el túnel. Los apoyos tienen ataque y caída suaves, filtrado y pequeñas variaciones; el interior conserva un ambiente más contenido.

La generación depende del desplazamiento real y tiene una cadencia limitada, aproximadamente dos pasos por segundo aun a 36 m/s. No acumula impactos para recuperarlos luego de una pausa. Se conserva el límite de dos voces, la activación voluntaria, el volumen y la suspensión en segundo plano.

En el pavimento, el pico normalizado de la señal pasó de 0,316 a 0,116 y el mayor salto entre muestras de 0,123 a 0,055. Estas medidas describen el archivo, no prueban que suene natural. Las 12 combinaciones de velocidad y frecuencia de actualización pasaron. Una prueba adicional con Web Audio real decodificó los tres archivos, generó 12 pasos y verificó final de voces, suspensión y reanudación. La escucha del resultado en altavoces o auriculares del iPhone queda pendiente.

## Rendimiento y pruebas

`npm test` terminó correctamente: 13 suites, con recorridos, escaleras, galerías, cabina, fosas, portón, vestuarios y túnel; impactos y desplazamientos hasta 36 m/s; controles de teclado y táctiles simulados. Registro completo en `V12-PRUEBAS.txt`.

La iluminación actual precalcula 93 fuentes: 54 exteriores, 22 de tribunas y 17 interiores. En Móvil y Equilibrada siguen activas ocho luces en tiempo real contando las tres generales de la aplicación. Alta mantiene precalculado el exterior y procesa 47 fuentes en total. No se aumentó la exposición global ni se añadieron sombras dinámicas a las luminarias nuevas.

Precálculo regenerado: 1.114 mallas, 509.087 muestras, 1.335.496 rayos y 9.832.212 bytes sin comprimir. El archivo gzip pasó de 1.522.938 a 1.621.156 bytes. Se conservan 7.932 asientos y 560 viviendas. El inventario total de geometría, incluyendo versiones de detalle, pasó de 3.895.375 a 3.947.906 triángulos (+1,35%). No es la cantidad que dibuja cada fotograma.

Comparación reproducible de candidatos por CPU, perfil Móvil, cámaras idénticas y tamaño 1.536 × 864. Incluye solo selección por visibilidad y detalle; no mide oclusión final, sombras, llamadas de GPU ni FPS:

| Cámara | Objetos candidatos antes → después | Triángulos candidatos antes → después |
|---|---:|---:|
| Referencia anterior | 431 → 457 | 613.791 → 660.000 |
| Campo | 246 → 266 | 396.535 → 439.436 |
| Principal | 289 → 316 | 625.585 → 671.752 |
| Túnel | 290 → 317 | 630.543 → 676.710 |
| CDM | 107 → 115 | 115.391 → 154.604 |
| Calle | 101 → 100 | 218.990 → 252.085 |
| Norte exterior | 442 → 466 | 1.085.843 → 1.131.526 |
| Sur exterior | 454 → 484 | 1.110.725 → 1.157.748 |
| Este exterior | 79 → 74 | 54.266 → 69.253 |
| Vestuario | 172 → 172 | 720.573 → 757.089 |

Hay un incremento geométrico, especialmente en pavimentos y fachadas próximos, para permitir la iluminación precalculada. Se redujo durante el ajuste mediante teselación selectiva y agrupación por sectores. Mantener ocho luces dinámicas no garantiza por sí solo los mismos FPS. Los JSON `V12-VISTAS-ANTES`, `V12-VISTAS-DESPUES` y `V12-MEDICIONES` contienen las cifras y el entorno Linux/Node del ensayo. No representan mediciones del iPhone.

## Comprobaciones pendientes

El 8 de septiembre, a las 18:25:20 UTC, la vista previa abrió el HTML pero no pudo crear WebGL: `GL_VENDOR = Disabled`, `GL_RENDERER = Disabled`, `BindToCurrentSequence failed`. La evidencia está en `V12-NAVEGADOR.json`.

Quedan pendientes la compilación gráfica real de los shaders, las capturas comparativas, el movimiento aéreo sin interferencias, el aspecto de ópticas/mallas/agua, la iluminación diurna y nocturna, y el encuadre visible con la interfaz en vertical y horizontal. No se fabricaron capturas ni video como sustitución. Tampoco hay una medición sostenida en iPhone 13 ni una comprobación auditiva del nuevo timbre.

El diagnóstico dentro de Menú permite medir tres minutos, ver resolución interna, FPS, tiempos, llamadas y triángulos realmente dibujados, luces activas y, cuando esté disponible, tiempo de GPU. Para comparar en el teléfono, usar el mismo perfil, horario y recorrido por campo, exterior, tribunas y túnel; repetir con Exterior apagado/encendido y guardar el JSON. Usar las capturas reales del botón del sitio para comprobar las vistas.

## Recursos y entrega

Geometría, ópticas, letreros, precálculo y sonidos son originales del proyecto. Los WAV mantienen permiso CC0 documentado en `dist/audio/README.txt`; Three.js mantiene su licencia MIT. Las fotos aportadas y las del fabricante son referencias de consulta, sin redistribución como materiales.

El ZIP completo `dist/koster-3d-proyecto.zip` contiene el código, recursos, generadores, pruebas, informes y manifiesto. Se regenera con `python3 scripts/package-source.py`. Para ejecutar: servir `dist` por HTTP en un navegador con WebGL 2. Para recalcular iluminación: `npm run bake`.
