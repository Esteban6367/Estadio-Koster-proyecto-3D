// DOM-only controls are independent of WebGL, so help also works after a graphics error.
export function initInterface(doc=document){
 const $=id=>doc.getElementById(id),body=doc.body,menu=$('menu');let timer=0,hidden=false;
 const seen=new Set();
 function closeMenu(){menu.open=false;}
 function setHidden(value){hidden=!!value;body.classList.toggle('minimal-ui',hidden);$('restoreInterface').hidden=!hidden;closeMenu();}
 function begin(){body.classList.add('exploring');closeMenu();}
 function hint(mode,text){$('hint').textContent=text;clearTimeout(timer);if(seen.has(mode)){$('hint').hidden=true;return;}seen.add(mode);$('hint').hidden=false;timer=setTimeout(()=>{$('hint').hidden=true;},5500);}
 function openHelp(){closeMenu();$('instructions').showModal();}
 $('hideInterface').onclick=()=>setHidden(true);$('restoreInterface').onclick=()=>setHidden(false);$('help').onclick=openHelp;
 const nav=$('destinations');
 function updateArrows(){const max=Math.max(0,nav.scrollWidth-nav.clientWidth);$('destPrev').disabled=nav.scrollLeft<2;$('destNext').disabled=nav.scrollLeft>max-2;}
 $('destPrev').onclick=()=>nav.scrollBy({left:-Math.max(180,nav.clientWidth*.72),behavior:'smooth'});
 $('destNext').onclick=()=>nav.scrollBy({left:Math.max(180,nav.clientWidth*.72),behavior:'smooth'});
 nav.addEventListener('scroll',updateArrows,{passive:true});
 if(typeof ResizeObserver!=='undefined')new ResizeObserver(updateArrows).observe(nav);
 updateArrows();
 doc.addEventListener('keydown',e=>{if(e.key==='Escape'){setHidden(false);closeMenu();}});
 return{begin,hint,closeMenu,openHelp,setHidden,get hidden(){return hidden;}};
}
