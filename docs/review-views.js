import {mainD} from './main-plan.js';
import {platformFloor} from './central-platform-layout.js';
import {publicLayout as P} from './public-layout.js';
import {whiteGate} from './white-gate.js';
import {local,stands} from './stadium-layout.js';
const gateView=local(stands[0],whiteGate.x,whiteGate.z+2.5);
export const reviewViews={
 gradaPlana:{label:'Grada real · pendiente y separación',air:true,u:-5,d:14,y:2,r:70,a:Math.PI/2,e:1.30},
 pasilloInferior:{label:'Acabados CAD · pasillo y filas inferiores',air:true,u:0,d:16,y:2,r:116,a:Math.PI/2,e:1.32},
 acabadosCad:{label:'Acabados CAD · conjunto de la principal',air:true,u:0,d:18,y:7,r:92,a:Math.PI/2,e:.05},
 escaleraCad:{label:'Acabados CAD · escalera superior',u:-32.4,d:13.3,h:4.2,a:Math.PI/2,p:.23},
 lucesCad:{label:'Acabados CAD · luces bajo voladizo',u:0,d:18,h:6.51,a:Math.PI/2,p:.9},
 centralDeck:{label:'Sector central · bancos con respaldo',u:0,d:mainD(0,14.1),h:platformFloor(0,mainD(0,14.1)),a:-Math.PI/2,p:-.18},
 entryNew:{label:'Entrada principal · ubicación corregida',u:P.axis,d:39,h:0,a:-Math.PI/2,p:.2},
 ellipsePlan:{label:'Elíptica · principal, pasillo y sector central',air:true,u:0,d:22,y:0,r:103,a:Math.PI/2,e:1.48},
 ellipseNorth:{label:'Pasillo azul · remate norte',u:44,d:13.1,h:4.2,a:Math.PI,p:0},
 ellipseSouth:{label:'Pasillo azul · remate sur',u:-44,d:13.1,h:4.2,a:0,p:0},

 whiteGate:{label:'Portón blanco · abrir y cerrar',u:gateView.u,d:gateView.d,h:0,a:0,p:.05},
 stairJunction:{label:'Escaleras · junto al acceso principal',u:P.axis,d:16,h:0,a:-Math.PI/2,p:.05},
 varReview:{label:'VAR · monitor de revisión',u:2.7,d:-24.7,h:0,a:2.08,p:-.02},
 goalDetail:{label:'Arcos · red y tensores',u:49,d:-64,h:0,a:.62,p:-.03},
 turfDetail:{label:'Césped · detalle del campo',u:4,d:-58,h:0,a:.45,p:-.45},
 streetWest:{label:'Alumbrado · calle Varela',u:28,d:54,h:0,a:0,p:-.04},
 streetNorth:{label:'Alumbrado · Fregeiro',u:122,d:20,h:0,a:-1.57,p:-.04},
 lightingAbove:{label:'Alumbrado · calles circundantes',air:true,u:0,d:-65,y:0,r:230,a:2.4,e:.8},
 stairLighting:{label:'Alumbrado · escaleras del pasillo',u:P.axis+1.8,d:11.3,h:0,a:0,p:.18},
 exitLighting:{label:'Alumbrado · salida principal',u:P.axis,d:27,h:0,a:1.57,p:.10},

 passageNorth:{label:'Pasillo · remate norte',air:true,u:44.7,d:10,y:1,r:19,a:2.42,e:.65},
 passageSouth:{label:'Pasillo · remate sur',air:true,u:-44.7,d:10,y:1,r:19,a:.72,e:.65},
 entryClear:{label:'Entrada · banco retirado',u:7,d:-15,h:0,a:1.57,p:.05},
 canopyField:{label:'Voladizo · frente sin postes exteriores',u:0,d:-86,h:0,a:Math.PI/2,p:.10},
 canopyEnd:{label:'Voladizo · extremo norte',air:true,u:56.44,d:4,y:7,r:30,a:2.42,e:.15},
 canopyEndSouth:{label:'Voladizo · extremo sur',air:true,u:-56.44,d:4,y:7,r:30,a:.72,e:.15},
 canopyRestored:{label:'Butacas · huecos de columnas completados',u:25.5,d:3.76,h:1.05,a:-Math.PI/2,p:-.12},
 canopySeats:{label:'Voladizo · vista del espectador',u:25.5,d:22,h:8.4,a:-Math.PI/2,p:-.12},
 canopyAbove:{label:'Voladizo · estructura superior',air:true,u:0,d:18,y:12,r:110,a:1.05,e:.56},
 secretariaFoto:{label:'Secretaría y acceso secundario · foto real',u:41,d:46,h:0,a:-1.36,p:.24},
 northwestClosure:{label:'Cerramiento norte · unión de muros',air:true,u:87,d:47,y:1,r:64,a:-1.2,e:.85},
 facadeFront:{label:'Fachada · frente comparativo',u:0,d:49,h:0,a:-Math.PI/2,p:.33},
 facadeBay:{label:'Fachada · paños y pórticos',u:18,d:47,h:0,a:-1.72,p:.33},
 facadeEnd:{label:'Fachada · unión al perímetro',u:52,d:39,h:0,a:-2.28,p:.28},
 facadeUnder:{label:'Fachada · intradós del alero',u:24.5,d:34.4,h:0,a:-Math.PI/2,p:1.1},
 facadeAbove:{label:'Fachada · coronación',air:true,u:15,d:29,y:12,r:23,a:Math.PI,e:.50},
 northOutside:{label:'Principal norte · exterior',u:62,d:13,h:0,a:3.05,p:.32},
 southOutside:{label:'Principal sur · exterior',u:-62,d:13,h:0,a:.09,p:.32},
 northInside:{label:'Principal norte · desde campo',u:40,d:-1.4,h:0,a:1.15,p:.33},
 southInside:{label:'Principal sur · desde campo',u:-40,d:-1.4,h:0,a:1.99,p:.33},
 northAbove:{label:'Principal norte · desde arriba',air:true,u:43,d:16,y:5,r:64,a:.82,e:.62},
 southAbove:{label:'Principal sur · desde arriba',air:true,u:-43,d:16,y:5,r:64,a:2.32,e:.62},
 rowAccess:{label:'Butacas · acceso lateral',u:34,d:18.05,h:6.51,a:-.07224,p:-.20},
 leftStair:{label:'Escalera izquierda · antes del bajo gradas',u:P.axis+1.5,d:9.2,h:0,a:0,p:.15},
 covered:{label:'Bajo gradas · entrada',u:-6,d:10.7,h:0,a:0,p:.08},
 coveredBack:{label:'Bajo gradas · regreso',u:15,d:9.7,h:0,a:Math.PI,p:.08}
};
