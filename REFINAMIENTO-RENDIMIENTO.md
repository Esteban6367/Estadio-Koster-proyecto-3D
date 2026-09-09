# Rendimiento · refinamiento v11

Comparación contra la versión 10. Entorno: Node v24.19.0, AMD EPYC 9V74 80-Core Processor, Linux. Construcción con texturas sustituidas por muestras de 1 píxel; el inventario cuenta recursos lógicos, no su memoria gráfica real.

**Sin GPU ni iPhone físico.** No hay mediciones nuevas de FPS, tiempo GPU, llamadas reales de dibujo o triángulos renderizados. Los campos correspondientes permanecen en null en los JSON.

## Inventario del modelo

| Dato | Antes | Después |
|---|---:|---:|
| Mallas | 1,104 | 1,099 |
| Instancias | 41,596 | 43,533 |
| Triángulos de todas las representaciones incluidas | 3,824,345 | 3,895,375 |
| Luces configuradas en el modelo | 60 | 60 |
| Materiales | 148 | 151 |
| Texturas lógicas inspeccionadas | 70 | 70 |

Los totales incluyen elementos ocultos y alternativas de malla. No son los triángulos renderizados en un fotograma. La iluminación móvil/Equilibrada sigue sustituyendo 55 fuentes locales; conserva ocho fuentes activas contando las tres generales de la app. Los 7.932 asientos y 560 edificios se mantienen.

Una construcción de control tardó 1627.0 ms antes y 1281.4 ms después. Es una muestra de CPU en este servidor, sin descarga/decodificación real de imágenes ni compilación de shaders; no predice el tiempo de carga en un iPhone.

## Cámaras repetibles y candidatos de dibujo

Perfil low, cámara 1536 × 864 px, mismo script y posiciones antes/después. Intersección de volúmenes con el frustum; no elimina superficies tapadas por otros objetos ni incluye pasadas de sombras. Un objeto instanciado que intersecta la cámara aporta aquí todo su lote. Los recuentos geométricos no diferencian día/noche; sus costos gráficos reales sí pueden diferir.

| Cámara | Objetos candidatos antes → después | Triángulos candidatos antes → después | Cambio |
|---|---:|---:|---:|
| referencia | 438 → 431 | 651,289 → 613,791 | -5.8% |
| campo | 248 → 246 | 416,477 → 396,535 | -4.8% |
| principal | 297 → 289 | 643,025 → 625,585 | -2.7% |
| túnel | 301 → 290 | 647,113 → 630,543 | -2.6% |
| CDM | 106 → 107 | 110,851 → 115,391 | +4.1% |
| calle | 99 → 101 | 229,194 → 218,990 | -4.5% |
| norte exterior | 448 → 442 | 1,105,077 → 1,085,843 | -1.7% |
| sur exterior | 460 → 454 | 1,127,223 → 1,110,725 | -1.5% |
| este exterior | 75 → 79 | 49,778 → 54,266 | +9.0% |
| vestuario | 170 → 172 | 704,545 → 720,573 | +2.3% |

La geometría general desciende en siete de las diez vistas de control. CDM, exterior este y vestuario suben moderadamente en cantidad absoluta por sus nuevos detalles: +4.540, +4.488 y +16.028 triángulos candidatos. El conjunto de todas las representaciones aumenta un 1,9 %, principalmente por fijaciones cercanas de asientos y estructura. Se evita añadir texturas o luces activas en móvil.

Estos diez controles abarcan sectores repetibles del modelo; no son una reconstrucción exacta de la posición de la cámara de cada foto del usuario. Las comparativas de las diez fotos, diurnas/nocturnas y caminando, quedan pendientes por ausencia de WebGL.

Se detectó inicialmente un aumento de 5–8 % en varias vistas tras añadir detalles. Se eliminaron 72.104 triángulos interiores duplicados de bloques curvos manteniendo las caras exteriores. El binario de iluminación pasó de 11.292.192 a 9.462.924 bytes (sin gzip), por una menor cantidad de vértices a iluminar. Se generaron 490.097 muestras y 1.288.255 rayos de precálculo. No se ejecutan esos rayos al recorrer el estadio.

## Colisiones a 36 m/s

| Sector | Mediana CPU antes | Mediana CPU después |
|---|---:|---:|
| campo | 0.07933 ms | 0.07809 ms |
| perímetro | 0.07885 ms | 0.07990 ms |
| túnel | 0.00817 ms | 0.00827 ms |

2.000 muestras después de calentamiento por sector/velocidad; desplazamiento de un intervalo de 1/60 s. Las pequeñas diferencias de tiempo pueden ser variación de ejecución. El cálculo de colisiones conserva su índice y subdivisión del movimiento. La suite recorre además escenarios de 100/120 ms y puertas móviles a 36 m/s.

## Reproducción

```sh
npm run bake
npm test
node scripts/profile-scene.mjs PERF-LOCAL.json
node scripts/view-budget.mjs --output VISTAS-LOCAL.json
```

Para datos del teléfono: abrir la versión publicada en el iPhone 13, elegir Móvil optimizada y Menú → Diagnóstico de rendimiento → Medir 3 minutos. Recorrer campo, principal, fosa, cabina, CDM, vestuarios y túnel, alternando día/noche; exportar el JSON. Registrar navegador, resolución CSS/interna y temperatura percibida. El objetivo de fluidez debe verificarse físicamente; esta entrega no afirma haber medido 30 FPS.
