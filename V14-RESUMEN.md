# Entrada y circulaciones públicas · v14

Se modifica la última versión publicada v13 (`06047d81fd455d0423fad6406b994519626a7464`). Se conservan la fachada, la explanada y los portones aprobados. La distribución interior sustituye el ascenso largo axial por un vestíbulo, un cruce lateral y ascensos a ambos lados.

## Referencias y alcance

Se revisaron las ocho fotografías del usuario: IMG_5547(1), IMG_5548(1), IMG_5549, IMG_5550, IMG_5553, IMG_5552(1), IMG_5555 e IMG_5556. El video IMG_5551.mp4 dura 3,77 s; se inspeccionaron cuatro fotogramas del barrido del vestíbulo. No permite reconstruir los baños ni el extremo completo del pasillo.

Las fotos respaldan los portones turquesa, el pavimento cuadriculado, el intradós claro, la puerta lateral, el conjunto frontal de rampa y escalera corta y los espacios contiguos a escaleras laterales. La puerta a la derecha, la bifurcación previa y la continuidad hacia los baños también se apoyan en la descripción personal del usuario. Los «10 metros o más» no son una medición. La ubicación exacta de cada fotografía lateral respecto del conjunto no queda completamente resuelta: los dos ascensos del modelo son una adaptación propuesta, no una afirmación de simetría del edificio real.

Los materiales son los recursos propios ya incluidos. No se incorporan personas, motos, contenedores ni herramientas como obstáculos permanentes. Las fotos y el video se emplean como referencias, no como texturas con sombras grabadas.

## Planta y cotas propuestas

La izquierda y la derecha se definen entrando por los portones hacia el campo. [Planta](dist/entrada-planta.svg) y [corte](dist/entrada-corte.svg) son diagramas esquemáticos del modelo, no planos de relevamiento ni capturas 3D.

| Elemento | Dimensión o nivel del modelo |
| --- | --- |
| Vestíbulo | Ancho 5,40 m; piso ±0,00 m |
| Portón → inicio de rampa | 10,00 m |
| Portón → pie de escalera frontal | 14,24 m |
| Rampa izquierda | Desarrollo 6,00 m; ascenso 0,72 m; pendiente propuesta 12 % |
| Escalera frontal derecha | 4 contrahuellas de 0,18 m; huellas de 0,44 m |
| Descanso frontal | +0,72 m; retorno a galería pública ±0,00 mediante cuatro escalones |
| Cruce longitudinal previo | Ancho 3,00 m, siguiendo la curvatura de la principal |
| Escaleras laterales | Ancho 3,00 m; 20 contrahuellas de 0,21 m; huellas de 0,475 m |
| Desembarco lateral | Galería +4,20 m, conectada con circulaciones y ascensos existentes |
| Pasos contiguos a escaleras | Ancho propuesto 2,58 m, piso ±0,00 m |
| Puerta derecha | Hueco con profundidad, marco y hoja cerrada; función no confirmada |
| Vestuarios | Piso propuesto −3,60 m; distribución interior conservada |
| Conexión privada al túnel | 6 contrahuellas de 0,20 m; huellas de 0,32 m |
| Túnel | Piso existente −4,80 m |

La rampa no se declara accesible ni homologada. Estas proporciones adaptan el acceso real a la ampliación académica; no constituyen dimensionamiento estructural, certificación normativa ni medidas comprobadas del estadio.

El pasillo longitudinal llega hasta las coordenadas locales ±51 m y termina con cerramientos ajustables. Se reserva la continuación sin inventar puertas de baños, interiores ni escaleras del extremo. Los pasos al lado de las escaleras permiten avanzar sin subir, pero sus prolongaciones todavía no fotografiadas no se dan por terminadas.

## Separación de recorridos y estructura

Se eliminan el ascenso central posterior, sus barandas transversales obsoletas y las colisiones que lo acompañaban. Se corrigen las cotas de pasamanos y fijaciones de las escaleras superiores para que no sigan por error el piso bajo del vestíbulo. La galería +4,20 m conserva una losa delgada sobre el paso bajo; se abre el cuerpo macizo que antes obstruía ese espacio. Se mantienen los ascensos centrales de los niveles superiores que conducen a la cabina.

Los dos ascensos laterales tienen barandas y desembarcos abiertos. Se incorporan dos aberturas de aproximadamente 3,60 × 9,50 m en las cubiertas sobre sus tramos; las correas se interrumpen y sus bordes se enmarcan. Se conserva el resto de las tres cubiertas y los tres niveles. Los apoyos posteriores de la cabina se desplazan localmente hasta dejar libre el cruce inferior y se vinculan con una viga de transferencia propuesta.

Para evitar que el vestíbulo público invada recintos privados, los vestuarios y su mobiliario se trasladan conjuntamente a −3,60 m, conservando la planta. Se conectan al túnel −4,80 m mediante una bajada más corta. La losa entre ambos usos mantiene separación física; el público no puede entrar al túnel por el acceso nuevo.

La parte opaca del cerramiento de salida del túnel se ajusta a 0,80 m para mejorar la visual baja; se conserva la protección metálica hasta 2,22 m y los soportes de su marquesina. Las fosas, su nivel de agua, el cerramiento público y el portón de jugadores permanecen separados. Ver el campo desde el vestíbulo no habilita acceso público al césped.

## Materiales, iluminación y controles

Se reutilizan hormigón, pintura turquesa/crema, pasamanos y pavimento cuadriculado. El intradós sigue la altura del graderío. Se conservan fachada, letras, explanada, portones, cámaras y controles existentes. El destino Principal se sitúa en una escalera continua a través de los niveles; Acceso permanece delante de los portones.

Se añaden seis luminarias discretas al pasillo longitudinal dentro del control existente de tribunas. Su contribución se precalcula: los perfiles móvil y equilibrado no suman luces dinámicas. Se regeneran 1.135 superficies de iluminación, con 521.567 muestras y 1.489.837 rayos; 99 luces locales precalculadas distribuidas en los canales exterior/tribunas/interiores (54/28/17). El perfil alto conserva esas seis fuentes de tribunas en tiempo real. No se modifica la exposición global.

Los parámetros y regiones del acceso están centralizados en `dist/public-layout.js`; la geometría está en `dist/public-interior.js`. Esto permite ajustar la continuación cuando lleguen más referencias. Los diagramas se regeneran con `node scripts/public-diagrams.mjs`.

## Verificación y límites

Las 14 suites de `npm test` finalizaron correctamente. Las salidas completas están en `V14-PRUEBAS.txt`; se entregan junto con el código. Se separan lógica, rayos contra geometría real y gráficos simulados de un renderizado WebGL.

- Recorridos nuevos: 120 pruebas de ida y vuelta, 240 casos de colisión, cuatro barridos de portones ocupados y diez comparaciones entre hojas y colisiones. Velocidades 6/12/24/36 m/s y pasos temporales de 1/60, 0,10 y 0,12 s.
- 315 muestras contrastan pisos renderizables y altura libre; mínimo muestreado 2,60 m. No equivale a una certificación de toda la circulación.
- Se verifican galerías, cabina, ambas instalaciones de jugadores, túnel, fosas y portones; se conservan pruebas de teclado, dos punteros simultáneos, destinos, iluminación y sonido mediante controladores simulados.
- La visual de césped se evalúa desde tres posiciones del vestíbulo, a 1,70 m, hacia 105 puntos. Se documenta la fracción libre, conservando la oclusión de barandas y mallas. Estos rayos no evalúan color, antialiasing ni apariencia nocturna.
- Resultado de esa muestra: 45/105 líneas libres; por posición, 10/35, 20/35 y 15/35. Cada posición permite ver al menos tres franjas longitudinales del césped. No se afirma que el campo completo resulte visible; barandas y cerramientos existentes siguen presentes.
- Las vistas de presupuesto usan seis cámaras idénticas antes/después, resoluciones 390 × 844 y 1536 × 864 y los tres perfiles. Son candidatos de visibilidad de CPU; no llamadas de dibujo medidas, tiempos de GPU ni FPS.
- El navegador de esta sesión muestra que no puede iniciar WebGL 2. No se obtuvieron capturas reales del 3D ni video con sonido. Quedan pendientes la comparación visual de día/noche, la apariencia del CDM desde la entrada, iluminación bajo las vigas, transiciones y fluidez en un iPhone 13 físico.

No se afirma que disponer de una PC permita renderizar en esta sesión. Las imágenes SVG entregadas representan la organización propuesta y no sustituyen las capturas solicitadas.

## Presupuesto comparado

Inventario completo: 1.153 → 1.154 mallas; 44.859 → 44.835 instancias; 3.943.213 → 3.939.951 triángulos contando todas las versiones de detalle; 7.914 → 7.902 asientos. No es un aforo ni geometría efectivamente dibujada en cada fotograma.

Cámaras equivalentes, perfil móvil, 390 × 844; candidatos de CPU:

| Vista | Objetos antes / después | Triángulos antes / después |
| --- | --- | --- |
| Portones | 241 / 241 | 894.603 / 891.339 |
| Vestíbulo | 219 / 218 | 939.583 / 936.317 |
| Puerta derecha | 154 / 152 | 766.690 / 773.684 |
| Rampa frontal | 216 / 215 | 1.007.913 / 1.004.647 |
| Lateral izquierdo | 218 / 219 | 938.477 / 935.965 |
| Lateral derecho | 208 / 209 | 930.189 / 938.957 |

Los lotes instanciados se cuentan completos cuando intersectan el encuadre. No se incluyen pasadas de sombras. Las 36 combinaciones de cámaras, resoluciones y calidad están en `V14-VISTAS-ANTES.json` y `V14-VISTAS-DESPUES.json`.

En el servidor Linux Xeon, las medianas de consulta de movimiento a 36 m/s fueron: campo 0,107 → 0,110 ms; perímetro 0,108 → 0,110 ms; túnel 0,014 → 0,015 ms. Son micropruebas de CPU, no un recorrido renderizado ni mediciones de teléfono. La construcción del modelo registró 3,669 → 3,734 s bajo carga variable del entorno; no se interpreta como diferencia de tiempo de carga en el iPhone. Los datos completos están en `V14-CPU-ANTES.json` y `V14-CPU-DESPUES.json`.

Modelo académico con dimensiones propuestas.
