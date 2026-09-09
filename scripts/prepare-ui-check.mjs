// Temporary DOM-only fixture: uses the production HTML, CSS and interface module.
// It intentionally does not initialize WebGL or simulate a rendered stadium.
import fs from 'node:fs';
const root=new URL('../dist/',import.meta.url);
let html=fs.readFileSync(new URL('index.html',root),'utf8').replace('<script type="module" src="app.js"></script>','<script type="module" src="__qa-interface.js"></script>');
html=html.replace('</body>','<div style="position:fixed;top:40%;left:15%;width:70%;text-align:center;color:#a9bfca;font:16px/1.6 Arial;pointer-events:none">Prueba de interfaz<br>Sin renderizado 3D</div></body>');
fs.writeFileSync(new URL('__qa-mobile.html',root),html);
fs.writeFileSync(new URL('__qa-interface.js',root),`import {initInterface} from './interface.js';
const ui=initInterface();document.getElementById('loading').hidden=true;document.getElementById('welcome').hidden=true;document.getElementById('zoom').hidden=true;document.getElementById('joystick').style.display='block';ui.begin();ui.hint('walk','Joystick para caminar · Deslizá para mirar');
`);
fs.writeFileSync(new URL('__qa-ui.html',root),`<!doctype html><html lang="es"><meta charset="utf-8"><title>Verificación de interfaz v11</title><style>body{margin:20px;background:#eef2f4;color:#183142;font:15px Arial}h1{font-size:20px}main{display:flex;gap:22px}h2{font-size:16px}iframe{border:1px solid #7691a2;border-radius:8px;display:block}</style><h1>Controles del recorrido · comprobación DOM, sin renderizado 3D</h1><main><section><h2>Vertical · 390 × 650 px</h2><iframe id="portrait" title="Interfaz vertical" src="__qa-mobile.html" width="390" height="650"></iframe></section><section><h2>Horizontal · 844 × 350 px</h2><iframe id="landscape" title="Interfaz horizontal" src="__qa-mobile.html" width="844" height="350"></iframe><p>HTML, estilos y módulo de interfaz de la versión 11.</p><p>Estas vistas comprueban los controles; no representan imágenes del estadio.</p></section></main></html>`);
console.log('DOM-only QA fixture created. Remove __qa-* before packaging.');
