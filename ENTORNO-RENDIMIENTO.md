# Rendimiento de la ampliación del entorno · versión 10

6 de septiembre de 2026. Comparación con la versión 9 optimizada, que el usuario informó que funciona bien en su iPhone 13. Este informe no transforma esa experiencia en una medición del nuevo modelo.

## Qué se midió

Node v24.19.0, Linux, AMD EPYC 9V74. Se construye la geometría con texturas sustituidas por datos de prueba para contar recursos y consultar colisiones. Las cámaras por CPU comparten encuadre, perfil Móvil y tamaño de referencia 1536 × 864. No se dibuja ningún fotograma; no son llamadas reales a GPU, FPS de Safari ni una emulación de rendimiento de iPhone.

Los controles de iluminación mantienen exactamente la misma cantidad de luces en día y noche. Las métricas geométricas no incluyen pasadas de sombras ni tiempos de materiales y no comparan el coste gráfico día/noche. La medición sostenida de esos casos sigue pendiente con WebGL.

| Inventario total, incluidos objetos ocultables | Antes | Después |
|---|---:|---:|
| Mallas | 1.150 | 1.104 |
| Instancias | 41.092 | 41.596 |
| Triángulos incluyendo LOD alternativos | 3.838.921 | 3.824.345 |
| Materiales | 139 | 148 |
| Texturas detectadas | 61 | 70 |
| Luces definidas en el modelo | 60 | 60 |
| Asientos | 7.932 | 7.932 |
| Volúmenes de viviendas | 588 | 560 |

Se reduce el inventario global de mallas y triángulos, mientras aumentan los materiales de señalización y los objetos pequeños próximos. No se eliminó detalle del graderío. Se eliminaron ventanas lejanas y edificios que invadían los nuevos ramales. Las casas cercanas tienen más detalle. El atlas de filas comparte una sola textura entre todas las gradas.

## Candidatos por encuadre

Los objetos que están detrás de paredes también pueden ser candidatos: este recuento comprueba el frustum y LOD, no la oclusión final ni los píxeles dibujados.

| Cámara | Objetos antes → después | Triángulos antes → después |
|---|---:|---:|
| referencia | 439 → 438 | 647.715 → 651.289 |
| campo | 251 → 248 | 414.507 → 416.477 |
| principal | 296 → 297 | 637.731 → 643.025 |
| túnel | 299 → 301 | 641.759 → 647.113 |
| CDM | 116 → 106 | 102.901 → 110.851 |
| calle | 101 → 99 | 226.222 → 229.194 |
| norte exterior | 443 → 448 | 1.098.403 → 1.105.077 |
| sur exterior | 447 → 460 | 1.120.757 → 1.127.223 |
| este exterior | 85 → 75 | 45.458 → 49.778 |
| vestuario | 163 → 170 | 696.019 → 704.545 |

La carga candidata se mantiene cercana a la anterior en el campo, las gradas y el túnel. En CDM y en el este aumentan los triángulos por las fachadas próximas más detalladas, pero disminuyen los objetos. Las cabeceras exteriores muestran algunos objetos más. No se afirma una reducción en todos los casos ni una cifra de FPS sin medición real.

## Movimiento

Microtiempos por solicitud de desplazamiento a 36 m/s, mediana y percentil 95. Incluyen comprobaciones espaciales de colisión, no un fotograma completo. Son mediciones breves sujetas a variabilidad del equipo compartido.

| Sector | Mediana anterior → nueva (ms) | P95 anterior → nuevo (ms) |
|---|---:|---:|
| campo | 0.07716 → 0.07800 | 0.12434 → 0.12018 |
| perímetro | 0.07839 → 0.07915 | 0.10799 → 0.13616 |
| túnel | 0.00810 → 0.00823 | 0.01251 → 0.01001 |

## Iluminación y memoria

Las 55 luces locales siguen precalculadas en Móvil/Equilibrada. Quedan ocho luces de la aplicación en las listas visibles: cuatro torres, pantalla y tres generales. Se regeneraron todos los coeficientes contra las mallas modificadas. Los tres canales conservan los reguladores existentes, sin aumentar la exposición ni alterar las potencias del campo.

Iluminación: 11.292.192 bytes sin comprimir y 1.696.239 bytes de descarga gzip. Texturas PBR: quince mapas de 1024 px con mipmaps, sin ampliar su resolución. Los rótulos nuevos son pequeños y compartidos; no se incorporan texturas de Maps. JPEG reduce descarga, no memoria gráfica. No se añadió KTX2/ASTC.

Audio: 378.508 bytes de WAV, cargados una sola vez al activarlo; un ambiente y hasta dos pasos simultáneos. Apagado inicialmente. El contexto se suspende al desactivar u ocultar la página.

## Comprobaciones gráficas pendientes

El navegador remoto volvió a fallar al crear WebGL el 6/9/2026; al inicio se observó GL_VENDOR/GL_RENDERER = Disabled. El chequeo final del HTML a las 20:03:49 UTC volvió a mostrar el error de inicio. No hay capturas 3D antes/después desde ninguna cámara, comparación óptica con Maps, tiempo GPU, llamadas gráficas reales ni prueba térmica.

El audio sí se verificó por separado con Web Audio real en Chrome remoto: activación por botón, tres archivos decodificados, pasos, cambio de superficie, suspensión, retorno y apagado. No se hizo una escucha comparativa ni una prueba acústica en iPhone; la suspensión se activó desde el mismo método que usa visibilitychange.

En el teléfono: conservar Móvil optimizada, abrir Ajustes → Diagnóstico → Medir 3 minutos; cerrar el panel y repetir campo, tribunas, túnel y los cuatro lados, de día/noche. Descargar el JSON. Repetir con audio activado y desactivado para contrastar su coste. La aplicación no envía esas mediciones a un servidor. FPS estables y ausencia de calentamiento deben confirmarse en el iPhone físico.

Fuentes reproducibles: ENTORNO-PERF-ANTES/DESPUES.json, ENTORNO-VISTAS-ANTES/DESPUES.json; scripts/profile-scene.mjs y scripts/view-budget.mjs. El informe OPTIMIZACION.md conserva la comparación histórica de las versiones 8 y 9.
