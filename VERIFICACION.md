# Verificación · versión 12

8 de septiembre de 2026. Las 13 suites de `npm test` terminaron correctamente después de regenerar el precálculo. Resultados completos en `V12-PRUEBAS.txt`; cambios, referencias, dimensiones y límites en `V12-RESUMEN.md`.

- Se repiten las comprobaciones de todos los recorridos, portón, fosas y colisiones hasta 36 m/s. Se añaden 40 proyecciones de encuadre, siete rayos de superficies contiguas, orientación de cuatro parrillas y 80 carcasas, 12 carteles y los grupos de 22 fuentes de calle y 20 de fachadas.
- Se verifica la independencia del interruptor Exterior, su preferencia día/noche, la cámara al cambiar de modo y el precálculo de 93 fuentes. En perfiles móvil y equilibrado se mantienen ocho luces activas contando las generales de la aplicación.
- Las nuevas variantes de audio pasan 12 combinaciones de velocidad/frecuencia, silencio en reposo y separación de muestras. Web Audio real en Chrome remoto decodificó los tres WAV y produjo 12 pasos; comprobó suspensión, retorno, apagado y cero voces restantes. No se evaluó auditivamente el timbre.
- La vista previa falla al iniciar WebGL: `GL_VENDOR = Disabled`, `GL_RENDERER = Disabled`, `BindToCurrentSequence failed`, a las 18:25:20 UTC. No hay capturas 3D de esta versión, comparación visual ni FPS medidos. `V12-NAVEGADOR.json` conserva el resultado.
- `V12-MEDICIONES.json` registra inventario y tiempos de colisión en Node/Linux. `V12-VISTAS-ANTES.json` y `V12-VISTAS-DESPUES.json` comparan candidatos por CPU desde cámaras equivalentes; no son dibujos de GPU ni rendimiento del iPhone.

Quedan pendientes las comparativas aéreas y de torres, carteles, CDM y calles de día/noche, los shaders sobre GPU, el comportamiento visual durante zoom/rotación, la escucha final y la medición sostenida en iPhone 13. El diagnóstico y las capturas desde el dispositivo permanecen disponibles.

Los apartados siguientes son el historial de versiones anteriores.

# Verificación · versión 11

6 de septiembre de 2026. Pasó `npm test` después de regenerar la iluminación del modelo refinado. Salida completa en `REFINAMIENTO-PRUEBAS.txt`; rendimiento y límites en `REFINAMIENTO-RENDIMIENTO.md`.

- Se volvieron a ejecutar todas las pruebas de escaleras, niveles, fosas, portón, ambos vestuarios, túnel, cabina, barrio y controles de la versión anterior.
- Se añaden 74 rayos para comprobar que la franja azul queda delante de la pared; puntos de control del campo, montaje de los shaders de pintura/agua, colisión de las sillas y pruebas del módulo de interfaz.
- Precálculo actualizado: 1.068 mallas, 490.097 muestras y 1.288.255 rayos; mantiene los tres canales y 55 fuentes sustituidas. Se verifica compatibilidad de atributos y LOD. No hubo compilación de GPU.
- Interfaz de producción probada en Chrome con marcos CSS de 390 × 650 y 844 × 350 px: menú, ayuda, temporizador, flechas, ocultar, recuperar y Escape en la prueba de lógica. Captura DOM rotulada en `dist/verification/interfaz-v11.jpg`. No representa el estadio renderizado ni un iPhone físico.
- El intento gráfico vuelve a fallar por `GL_VENDOR = Disabled` y `GL_RENDERER = Disabled` (registro 20:52:33 UTC). Las diez comparativas 3D, apariencia de día/noche, antialias/transparencias en movimiento, compilación real de shaders y FPS sostenidos en iPhone siguen pendientes. El diagnóstico del dispositivo permanece disponible.

Los registros siguientes documentan la etapa anterior y sus recorridos, que se conservaron y volvieron a comprobar en v11.

# Verificación · versión 10

6 de septiembre de 2026. Entorno, materiales, fachada curva, equipamiento, acceso público y sonido opcional sobre la versión móvil optimizada. Informes: REFERENCIAS-ENTORNO.md y ENTORNO-RENDIMIENTO.md.

- Se conservaron las pruebas de geometría, escaleras, fosas, interiores, portón y controles enumeradas a continuación.
- 560 edificios comprobados contra las calzadas; cruces en T; correspondencia entre postes, árboles, mobiliario y sus colisiones. 2.560 impactos en edificios/equipamiento a 6/12/24/36 m/s y pasos de tiempo de hasta 120 ms.
- Recorrido continuo de las cuatro veredas y portal de Varela a la principal; 12.000 consultas del índice espacial contrastadas con búsqueda completa. La comparación antigua con el barrio anterior se sustituye por esta comprobación del mismo conjunto nuevo de obstáculos; la distribución cambió intencionalmente.
- Coeficientes de las 55 luces regenerados, tres canales y reguladores, correspondencia de mallas/LOD, límite de 16 atributos y montaje de shaders comprobados por código. No se compiló GLSL con GPU.
- Audio: apagado inicial, carga diferida de tres WAV, volumen, dos tipos de pasos, tratamiento interior, límite de voces, pausa, retorno, teletransportes, caché y errores comprobados con nodos simulados. Prueba aislada adicional con Web Audio real en Chrome remoto: 3 archivos decodificados, pasos producidos, cambio de superficie, estado suspended sin bucle/voces, retorno running y apagado. La página temporal de prueba se retiró.
- Se mantiene el diagnóstico y el cálculo de FPS por intervalos reales. Los ensayos con renderizador simulado no se presentan como mediciones gráficas.
- Capturas 3D y comprobación visual: pendientes en su totalidad por WebGL deshabilitado. Chrome abrió el HTML al inicio y al final, pero no construyó el renderizador. Último chequeo 20:03:49 UTC. No hay iPhone físico disponible ni medición de FPS sostenida/calor. No se generaron imágenes para sustituir capturas.

# Recorridos y geometría conservados

6 de septiembre de 2026. Three.js r170 y Node.js 24 en Linux; intento gráfico en Chrome remoto. Sin dispositivo móvil físico.

## Corrección implementada

Los vestuarios permanecen a cota 0. El descenso central reservado tiene dos tramos de 13 contrahuellas, un descanso de 1,60 m y un desarrollo total de 9,92 m. Llega a −4,80 m. El túnel pasa bajo las circulaciones públicas y bajo la fosa; techo exterior a −1,65 m y cara inferior de losa de fosa a −1,40 m, con 0,25 m de separación y relleno superior.

La escalera de salida gira 90° y asciende paralela a la pista, dentro de un recinto reservado con muros, rejas, pasamanos en nichos y marquesina apoyada. Su descanso superior está a cota 0 y tiene portón abatible funcional. Los carriles no fueron modificados; la cubierta queda unos 0,24 m fuera del borde exterior de hormigón de la pista.

La antigua salida al pasillo público se elimina. Se retiran el puente y el portón superficiales; el canal, agua y cerramientos son continuos en ese lugar. Se restaura la escalera frontal central para el público. Galerías superiores, acceso exterior y cabina se conservan.

Son propuestas académicas; no se dispone de planos relevados de un túnel real. Vestuarios, muebles, puertas interiores abiertas, colores y materiales se conservan. El corte desarrollado muestra las cotas del modelo y despliega el giro de salida; no es una captura 3D ni un plano de obra.

## Pruebas de lógica y geometría

Comando reproducible: `npm test`. Los raycasts usan geometría real de Three.js, con texturas sustituidas por muestras de 1 píxel durante la construcción de la escena. El ensayo de controles usa DOM, renderizador y eventos simulados. No se compilan shaders ni se generan imágenes con GPU en estas pruebas.

| Comprobación | Resultado |
|---|---|
| Escaleras y galerías de las tres tribunas | 8.628 incrementos de subida/bajada; pasó |
| Acceso central exterior | Ida y vuelta desde calle a galería intermedia; pasó |
| Niveles superpuestos y cabina | Galerías sobre accesos, puerta, paredes y frente vidriado de cabina; pasó |
| Ambas habitaciones | Acceso a bancos, zonas húmedas, duchas y sanitario; conexión privada y retorno; pasó |
| Recorridos privados completos | 24 ensayos de ida y vuelta, desde ambos vestuarios hasta el centro del campo; pasó |
| Circuito público encima del túnel | 12 ensayos de ida y vuelta por acceso, escalera frontal y galerías; pasó |
| Velocidades de esos circuitos | 6/12/24/36 m/s, pasos de tiempo de 16,7/100/120 ms; 14.442 solicitudes al controlador; pasó |
| Portón y separación superficial | 84 ensayos a las cuatro velocidades; cerrado bloquea ambos sentidos, abierto deja pasar; pasó |
| Barrido del portón | Detención al ocupar trayectoria, inversión, continuación al despejarla y visitante moviéndose a 36 m/s; pasó |
| Fosas, extremos y cabeceras | 528 aproximaciones contra bordes y retornos; pasó |
| Mobiliario y paredes interiores | 36 ensayos de choque a las cuatro velocidades; pasó |
| Muros subterráneos y pozo de salida | 72 ensayos, incluidos intentos de entrar al pozo desde el terreno; no cae ni atraviesa; pasó |
| Pisos superpuestos del nuevo túnel | Mantiene el piso subterráneo debajo del pasillo y del graderío; pasó |
| Altura y piso sobre mallas reales | 73 posiciones, incluidos los centros de las huellas de ambos tramos de ambas escaleras, descansos, túnel y habitaciones; pasó |
| Gálibo | ≥ 2,60 m bajo geometría opaca, incluidas luminarias, en las 73 posiciones muestreadas; pasó |
| Fosa sobre el cruce | Agua visible a −0,02, fondo −1,20, losa continua y 0,25 de separación inferior; pasó |
| Recinto de salida | Paredes reales, marquesina fuera de la pista y coincidencia de escalones visibles con colisiones; pasó |
| Portón representado | Transformación de giro de la hoja coincide con su estado; pasó |
| UI del recorrido | Entrada, teclado, aceleración/freno, tres tribunas, nueve destinos, acceso, vistas y calidad; pasó en simulación |
| UI de jugadores | Destino subterráneo a Y de cámara −3,10; caminar bajo fosa, subir, abrir con E, cerrar con botón y regresar; pasó en simulación |
| Táctil simultáneo | Dos punteros, mirada y marcha simultáneas, liberación independiente; pasó en simulación |
| Velocidad / Shift | 6/12/24/36, Shift a 36 y desplazamiento correcto con cuadros de 100 ms; pasó |
| Luz y pantalla | Reguladores y estados independientes; conserva ajuste de tribunas tras día/noche y parámetros del campo; pasó |
| Iluminación interior | 17 fuentes locales con intensidad positiva; sin evaluación óptica con GPU |
| Visibilidad de pantalla | 225 rayos, mismos resultados y limitaciones que v7; pasó |

La lógica del desplazamiento subdivide las solicitudes en movimientos de hasta 8 cm. La colisión de muros distingue su intervalo vertical para no bloquear al público por un muro situado debajo. El portón verifica el barrido angular completo con separación de muestras menor de 2,5 cm en su extremo; pausa antes del contacto.

## Inventario y pruebas disponibles

El inventario actual completo está en ENTORNO-PERF-DESPUES.json. Incluye LOD alternativos, objetos ocultables y recursos de todos los sectores; no equivale a las llamadas de un fotograma. ENTORNO-VISTAS-DESPUES.json contiene candidatos CPU para diez cámaras. Los contadores reales se obtienen desde el diagnóstico del teléfono.

Se verifican localmente los JPEG y WAV, importaciones y sintaxis. npm test ejecuta las pruebas de recorridos, geometría, shaders, eventos táctiles simulados, entorno y audio. Los resultados de rayos son comprobaciones sobre mallas reales, sin rasterizado.

## Pendientes con GPU / dispositivo físico

- Todas las capturas comparativas: cuatro frentes, esquinas, referencia aérea, gradas, fosa, vestuarios y túnel.
- Percepción de texturas, juntas, iluminación regenerada, reflejos, sombras y ausencia de parpadeos.
- Compilación del shader PBR con atributos de irradiancia; transiciones de detalle vistas caminando.
- Controles táctiles y exportación PNG en Safari/iPhone, escucha del audio en ese dispositivo, pausa real al cambiar de aplicación y retorno bajo las políticas de iOS.
- Mediciones de día/noche, audio activado/desactivado y recorridos equivalentes durante varios minutos; FPS reales, resolución, llamadas, triángulos, GPU cuando esté disponible y calentamiento.

Las cotas del túnel y la ampliación se conservan en README.md. El corte-tunel.png/SVG previo sigue siendo un esquema técnico, no una captura del estadio. La documentación de Maps distingue referencias visibles y aproximaciones, fechas de captura y etiquetas de foto.

Modelo académico con dimensiones propuestas.
