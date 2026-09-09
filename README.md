# Estadio Luis Köster · Recorrido 3D

Versión 16 · vestíbulo continuo y cruce único antes de la rampa. Base remota verificada: v15, commit `e9e586b554e53a02276475943cd683fba9f9fcd2`. [Cambios, dimensiones y pruebas de esta etapa](V16-RESUMEN.md). Se conservan la fachada, explanada y ampliación aprobadas.

Se sustituye el pasillo posterior por una circulación baja entre las gradas, con escaleras longitudinales, descansos que desembarcan de lado y pasos de continuación. El vestíbulo, puerta derecha y conjunto frontal se conectan mediante ramificaciones laterales. Las cotas de vestuarios y túnel permanecen a −3,60 y −4,80 m. Las distancias y las posiciones de ascensos se documentan como propuestas, apoyadas en las cinco fotos nuevas, todo el recorrido visual del video IMG_5623 y las referencias anteriores.

[Planta](dist/entrada-planta.svg) · [Corte transversal](dist/entrada-corte.svg) · [Corte longitudinal](dist/pasillo-corte-longitudinal.svg) · [Cambios, dimensiones y pruebas](V15-RESUMEN.md). Los informes anteriores se conservan como registro histórico; sus cotas o cantidades no sustituyen este informe. Baños y extremos todavía sin referencias completas quedan pendientes.

WebGL 2 no está disponible en el navegador de esta sesión. Las pruebas geométricas y de lógica no sustituyen capturas 3D, mediciones de GPU ni pruebas con un iPhone físico. Estado de esa comprobación: `V15-VERIFICACION-GRAFICA.json`.

## Mejoras de v12 conservadas

Campo, pista y pavimentos se organizan en regiones contiguas, con vacíos reales para fosas y túnel. La cámara aérea adapta encuadre y plano cercano. Las cuatro parrillas permanecen verticales y sostienen 80 proyectores orientables con carcasa, ópticas y soporte. Se añaden 20 luminarias exteriores y se completan 22 de calle, con iluminación precalculada y control independiente. Los carteles quedan fuera de los escalones; se corrigen rejillas y el filtrado de las marcas del campo. Los pasos tienen cuatro variantes por superficie, ataque suave y cadencia limitada. Cambios, mediciones y límites en `V12-RESUMEN.md`; salida de las 13 suites en `V12-PRUEBAS.txt`.

## Optimización para celular

En dispositivos táctiles comienza con «Móvil optimizada». Reemplaza 99 luces locales por coeficientes de iluminación difusa precalculados, con controles independientes. Conserva en tiempo real las cuatro torres, la pantalla y las tres luces generales: ocho fuentes. «Equilibrada» también utiliza iluminación precalculada; «Alta» conserva las luces originales de gradas e interiores, pero mantiene precalculadas las 54 exteriores.

Se conservan el estadio y 560 volúmenes de viviendas. La apertura del pasillo y los encuentros con divisiones inferiores deja 7.596 objetos de asiento en v15 (306 menos que v14). No es un aforo validado. Se mantienen instancias, niveles de detalle, agrupación por sectores y colisiones. La resolución móvil automática varía entre el 80% y el 100% de la resolución CSS; «Fija» permite desactivarla. Los controles HTML permanecen nítidos.

Menú → Diagnóstico de rendimiento → Medir 3 minutos. Después de 10 segundos iniciales, registra el recorrido en ese navegador. Cerrá el panel para caminar; podés descargar un JSON desde el mismo panel. No transmite datos a un servidor. Informa FPS, tiempos, resolución, dibujos, triángulos, luces y consultas de GPU cuando la extensión esté disponible.

El objetivo de 30 FPS en iPhone 13 requiere comprobación en ese teléfono. No se realizó una medición con iPhone físico; el navegador remoto sigue sin WebGL. Consultar `V15-RESUMEN.md`, `V15-CPU-ANTES.json`, `V15-CPU-DESPUES.json`, `V15-VISTAS-ANTES.json` y `V15-VISTAS-DESPUES.json` para resultados y límites actuales. Los candidatos de visibilidad calculados por CPU no son llamadas de dibujo medidas ni FPS.

## Entorno, detalles y sonido

Se reemplazan los frentes genéricos por parcelas orientadas hacia las cuatro calles del estadio, con cruces en T de Rubén Taruselli y Pedro Hors, muros, rejas, veredas, cubiertas variadas, cableado y rótulos de calles. El portal público de Varela conecta con la principal. Las imágenes de Street View consultadas son de julio de 2015; las fotos públicas del estadio incluyen capturas de diciembre de 2024 y diciembre de 2025. Los frentes, niveles del barrio y dimensiones siguen siendo aproximaciones adaptadas a la ampliación. No hay un levantamiento topográfico.

La fachada principal se actualizó en v13 con paños crema/turquesa, huecos profundos, apoyos oscuros inclinados y nuevos portones. Se conservan cabina, vestuarios, túnel y fosas. Las referencias anteriores del barrio siguen en `REFERENCIAS-ENTORNO.md`; las nuevas fotos y aproximaciones del acceso se documentan en `V13-RESUMEN.md`.

**Menú → Sonido activado/desactivado:** pasos por césped/pavimento y ambiente urbano suaves, cambio acústico dentro del túnel, volumen independiente. Comienza apagado y solo descarga los tres WAV al activarlo. Se pausa en segundo plano. Sonido original sintético, sin grabaciones del estadio real. Generador `scripts/audio.py` y permisos `dist/audio/README.txt`.

## Abrir el proyecto

```sh
python3 -m http.server 8080 --directory dist
```

Abrir http://localhost:8080 en un navegador con WebGL 2. Los módulos y texturas requieren HTTP; no abrir mediante file://. Desarrollo: `npm install` y `npm run dev`. Verificaciones: `npm test`.

## Corrección del recorrido

Se conservan los vestuarios modernos a cota 0, sus puertas abiertas, zonas húmedas, casilleros, bancos, materiales, iluminación y señalización azul y blanca.

Desde la circulación de equipos, una escalera reservada desciende en dos tramos hasta −4,80 m. El túnel cruza bajo el frente de la principal, el pasillo público y la fosa. Su techo exterior está a −1,65 m, separado 25 cm de la cara inferior de la losa de la fosa. El suelo, muros, techo, relleno superior y aberturas del terreno son geometría real.

Después de la fosa, el recorrido gira 90° y sube por una escalera paralela al frente de la tribuna. Termina en un descanso reservado, protegido por muros, barandas, rejas y una marquesina apoyada en columnas. El conjunto queda fuera del borde de hormigón de la pista: la marquesina mantiene aproximadamente 0,24 m en su punto más cercano; los carriles quedan más hacia el campo.

El portón de jugadores abre 90° hacia el recinto de salida. Se acciona con E o el botón contextual. La detección del visitante revisa todo el barrido de la hoja; si encuentra una ocupación, se detiene y continúa al despejarse. Puede invertirse la maniobra.

El antiguo puente y su portón superficial fueron retirados. El canal y los cerramientos vuelven a ser continuos allí. La escalera central frontal de la principal se restituyó para el público: queda por encima del descenso privado. El acceso exterior central, galerías y cabina siguen funcionando. Las cabeceras mantienen sus cerramientos sin pasos hacia el campo.

Los destinos rápidos permiten explorar ambos circuitos. «Vestuarios» lleva a la circulación de equipos a cota 0 y «Túnel de jugadores» al piso −4,80 m. Desde el campo también se puede regresar caminando por el portón, las escaleras y el túnel.

## Dimensiones propuestas

Unidades: metros. Cota 0 = circulación general del modelo. Son dimensiones de la visualización académica, no medidas relevadas.

| Elemento | Dimensión o cota |
|---|---|
| Campo | 105 × 68, conservado |
| Principal / cabeceras | 115 × 32,50 / 85 × 28,50; tres niveles |
| Galerías de principal | +4,20 / +7,98 / +12,18 |
| Galerías de cabeceras | +4,20 / +6,09 / +10,29 |
| Fosas principal / norte / sur | 115 / 85 / 85 sobre los ejes; ligeramente más al seguir la curva |
| Fosas, ancho exterior / interior | 1,90 / 1,60 |
| Fondo interior / cara inferior de losa | −1,20 / −1,40 |
| Agua / coronación | −0,02 / +0,10; resguardo 0,12 y ondas de hasta 0,008 |
| Piso de vestuarios y circulación | 0,00 |
| Piso del túnel | −4,80 |
| Cara inferior / superior del techo bajo la fosa | −1,85 / −1,65; espesor 0,20 |
| Separación entre techo del túnel y losa de la fosa | 0,25; relleno contenido entre ambos elementos |
| Altura entre piso y losa del túnel | 2,95; gálibo bajo luminarias ≥ 2,60 en las muestras verificadas |
| Ancho libre del túnel y escaleras | Aproximadamente 3,20; pasamanos alojados en nichos en los muros |
| Cada escalera privada | 26 contrahuellas de 0,184615; dos tramos de 13 |
| Huellas / descanso intermedio | 0,32 / 1,60 |
| Desarrollo horizontal de cada escalera | 9,92 = 4,16 + 1,60 + 4,16 |
| Descanso superior de salida | Aproximadamente 3,58 de longitud |
| Marquesina de salida | Cara inferior +2,80; ancho aproximado 3,84 |
| Portón de jugadores | Hoja de 3,30 × 2,35; giro de 90° en unos 2,8 s |
| Cada vestuario | Envolvente de 12,50 × 13,45; techo +3,05 |
| Cabina | 8,00 × 3,30; piso +7,98 |
| Pantalla posterior | 10,60 × 3,00; centro Y = 13,18 y Z = −110,20 |
| Torres | Cuatro, de 30 m |

En coordenadas curvas de la principal, `u` sigue su frente y `d` aumenta hacia el exterior. El descenso va de d = 12,30 a 2,38 en u = 0. El túnel continúa hasta d = −6,55; el ascenso se desarrolla de u = 1,60 a 11,52 y el portón está en u = 15,10. La fosa ocupa d = −3,65/−1,75. Estas coordenadas no corresponden a una cartografía real.

El pasillo público frente a las gradas conserva aproximadamente 3,45–3,60 m libres. Los nuevos elementos se alojan debajo o del lado reservado de la pista. El lado del CDM continúa sin tribuna. La pista tiene un contorno aproximado de 100 × 142 m y no se presenta como una pista homologada de 400 m. Los asientos del modelo no constituyen un aforo autorizado; la cantidad actual está indicada en el informe v16.

## Corte del recorrido

`dist/corte-tunel.svg` y `dist/corte-tunel.png` muestran las cotas, el pasillo público, la fosa, el túnel y el ascenso. El corte está desarrollado: despliega el giro de 90° para mostrar el recorrido completo. Se genera a partir de las funciones de niveles y escaleras mediante `node scripts/draw-section.mjs`. Para regenerar el PNG: `inkscape dist/corte-tunel.svg --export-type=png --export-filename=dist/corte-tunel.png`.

Es un dibujo técnico esquemático del modelo; no una captura de la aplicación ni un plano ejecutivo.

## Controles e iluminación conservados

- WASD/flechas; arrastrar con el mouse para mirar. Doble clic captura el cursor; Escape lo libera.
- En celular, joystick y otro dedo para mirar simultáneamente.
- Cámara a 1,70 m, sin balanceo. Velocidad inicial 12 m/s; opciones 6/12/24/36 y Shift a 36.
- Destinos: Campo, Principal, Fosa, Cabina, Vestuarios, Túnel de jugadores, Norte, Sur y CDM; regreso al Acceso.
- Vista aérea con rotación/zoom, Vista de referencia nocturna y selector día/noche.
- Calidad Móvil optimizada/Equilibrada/Alta, resolución automática/fija, diagnóstico, FPS y exportación de capturas PNG del lienzo real.
- Pantalla independiente con marcador ficticio. Tribunas con interruptor y regulador 50–250%, inicialmente 160%; conserva el ajuste al alternar día/noche.
- Exterior encendido/apagado en Menú, independiente del campo, las tribunas y la pantalla; conserva su preferencia al alternar día/noche.
- Sonido opcional y volumen independiente, apagado inicialmente.
- Campo con regulador 30–120% y exposición nocturna 0,90, sin cambios en esta etapa. Las luces nuevas tienen alcance local.

La escena de calidad Alta conserva 17 fuentes locales interiores; Móvil y Equilibrada precalculan sus aportes: vestuarios, circulación, descenso, túnel y salida. Sus intensidades permanecen independientes de los controles de gradas, campo y pantalla. Las luminarias visibles acompañan esas fuentes. La imagen final requiere revisión con GPU; no se presenta como cálculo luminotécnico.

## Referencias y aproximaciones

Las fotografías aportadas guían la disposición del estadio, los asientos azules/blancos, accesos, hormigón, rejas y cabina. Corresponden a distintas etapas del estadio. Se conserva la ampliación cubierta de la referencia nocturna.

El túnel subterráneo, las escaleras, la salida, los vestuarios y su equipamiento son propuestas sin levantamiento interior. También son propuestas los terceros niveles, las fosas de cabeceras, la pantalla posterior y los detalles no visibles. El barrio de 560 volúmenes adapta el trazado observado en Maps y las fachadas consultadas a la ampliación; se incorporan seis nombres de calles realmente visibles en el mapa, sin direcciones domiciliarias. Ver `REFERENCIAS-ENTORNO.md` y sus fechas de captura. Las referencias no se distribuyen como texturas ni se reproducen personas o marcas de agua.

Las secciones, apoyos, rellenos e instalaciones representan el proyecto académico. No son cálculos estructurales, hidráulicos, luminotécnicos ni de evacuación para construirlo.

La visibilidad parcial de la pantalla posterior permanece documentada en `VISIBILIDAD.json`: centro libre en 42/45 posiciones y los cinco puntos muestreados libres en 21/45. No se garantiza visibilidad completa desde todos los asientos. La pantalla auxiliar sincronizada sigue siendo una propuesta, no un elemento construido.

## Verificación y límites

`VERIFICACION.md` detalla pruebas, resultados y pendientes. Se comprobaron por código los dos circuitos, pisos superpuestos, escaleras, agua, colisiones y portón a velocidades de hasta 36 m/s. Se usaron rayos sobre las mallas reales para comprobar pisos y alturas libres, y un renderizador simulado para los controles.

El navegador remoto abrió el HTML pero falló al crear WebGL: `GL_VENDOR = Disabled, GL_RENDERER = Disabled`. No se obtuvieron capturas 3D reales ni se comprobaron materiales, iluminación, reflejos, sombras, FPS o exportación gráfica con GPU. Los gestos táctiles se probaron mediante eventos simulados, sin teléfono físico.

## Archivos y recursos

- `dist/underground-layout.js`: cotas, escaleras, vacíos y paredes del paso subterráneo.
- `dist/underground-model.js`: geometría, rellenos, iluminación, pasamanos, salida y marquesina.
- `dist/interior-layout.js`, `dist/interior-model.js`: vestuarios conservados y conexión privada.
- `dist/boundaries.js`, `dist/boundary-model.js`: fosas, cerramientos y portón de jugadores.
- `dist/physics.js`: pisos superpuestos y colisiones con desplazamientos subdivididos en un máximo de 8 cm.
- `dist/app.js`: controles y destinos; `dist/lighting.js`: parámetros del campo y velocidades.
- `dist/model.js`, `dist/stadium-layout.js`, `dist/architecture.js`: estadio y cabina.
- `dist/screen-layout.js`: pantalla posterior; `dist/surroundings.js` y `dist/neighborhood.js`: contexto.
- Pruebas: `tests.mjs`, `boundary-tests.mjs`, `expansion-tests.mjs`, `interior-tests.mjs`, `underground-tests.mjs`, `geometry-check.mjs`, `visibility-check.mjs`, `smoke.mjs`.

Texturas originales y permisos: `dist/textures/README.txt`; generación con `scripts/materials.py`. Three.js r170: licencia MIT en `dist/THREE-LICENSE.txt`. Geometría nueva, materiales derivados, señalización y corte son recursos originales de este proyecto; no se incorporaron descargas externas. Se mantienen instancias, LOD y texturas JPEG locales con mipmaps. La iluminación difusa precalculada y su generador son originales del proyecto. `npm run bake` regenera `dist/lighting-bake.*` después de modificar geometría o luces. Los JPEG conservan mipmaps: su compresión reduce descarga, no memoria GPU; no se añadió KTX2/ASTC. El ZIP completo se regenera con `python3 scripts/package-source.py`.

Leyenda visible: «Modelo académico con dimensiones propuestas».
