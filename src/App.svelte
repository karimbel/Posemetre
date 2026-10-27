<script lang="ts">
  import { tick, onMount } from 'svelte';
  type Lesson = { id: string; short: string; title: string; kicker: string; image: string; insight: string; task: string; question: string; options: string[]; answer: number; feedback: string; action: string };
  const lessons: Lesson[] = [
    { id:'incident',short:'Incidente',title:'Mesurer la lumière incidente',kicker:'Mission 01 · la mesure indépendante du sujet',image:'/assets/incident.webp',insight:'La mesure incidente évalue la lumière qui tombe sur le sujet, sans être influencée par sa couleur ou son vêtement.',task:'Place la cellule près du visage et oriente-la vers la source.',question:'Dans quelle direction regardent la cellule et la lumisphère du posemètre ?',options:['Vers le sujet','Vers la source de lumière','Vers l’appareil photo'],answer:1,feedback:'Exact. La cellule reçoit la lumière dans le même axe que le sujet : elle doit regarder la source.',action:'Régler en lumière continue · symbole soleil'},
    { id:'reflected',short:'Réfléchie',title:'Mesurer la lumière réfléchie',kicker:'Mission 02 · ce que voit l’appareil',image:'/assets/reflected.webp',insight:'La mesure réfléchie relève uniquement la lumière qui rebondit sur le sujet vers la cellule.',task:'Place-toi du côté de l’appareil, vise le sujet et évite de viser la source.',question:'Que mesure-t-on ici ?',options:['La source directement','La lumière renvoyée par le sujet','La lumière derrière le sujet'],answer:1,feedback:'Bien vu. La lumière réfléchie dépend de l’albédo : un sujet clair et un sujet sombre ne renvoient pas la même quantité.',action:'Régler le mode réfléchi puis viser le sujet'},
    { id:'albedo',short:'Albédo',title:'Comprendre l’albédo',kicker:'Mission 03 · un même éclairage, des lectures différentes',image:'/assets/albedo.webp',insight:'Un sujet clair renvoie davantage de lumière qu’un sujet sombre. En mesure réfléchie, la lecture change donc avec le sujet.',task:'Compare les lectures des quatre sujets sous le même éclairage.',question:'Quel sujet donne la lecture la plus élevée en lumière réfléchie ?',options:['Sujet clair / vêtement clair','Sujet moyen','Sujet sombre / vêtement sombre'],answer:0,feedback:'Oui. Plus l’albédo est élevé, plus la cellule reçoit de lumière réfléchie.',action:'Ne confonds pas lecture réfléchie et lumière réellement reçue'},
    { id:'conditions',short:'Conditions',title:'Préparer une mesure fiable',kicker:'Mission 04 · cinq repères avant de déclencher',image:'/assets/conditions.webp',insight:'Réglage continu, bon type de mesure, sphère orientée vers la source, proximité de la zone et recherche du climax : ce sont les cinq repères.',task:'Cherche la zone la plus éclairée, sans toucher le sujet.',question:'Où placer la cellule pour une mesure précise ?',options:['Au plus près de la zone à mesurer','À côté de l’appareil, quelle que soit la scène','Face au fond'],answer:0,feedback:'C’est cela. On mesure au plus près de la zone voulue, idéalement à l’emplacement du sujet.',action:'Préparer la cellule avant toute lecture'},
    { id:'climax',short:'Climax',title:'Protéger la zone-climax',kicker:'Mission 05 · préserver les hautes lumières',image:'/assets/climax.webp',insight:'Le climax est la zone la plus proche de la source et la plus éclairée : cheveux, front ou haut du visage dans ce cas.',task:'Mesure la partie haute éclairée avant de reporter les valeurs sur l’appareil.',question:'Pourquoi mesure-t-on le climax ?',options:['Pour rendre les ombres noires','Pour conserver du détail dans les hautes lumières','Pour augmenter automatiquement l’ISO'],answer:1,feedback:'Parfait. La mesure au climax sert à éviter de brûler les zones lumineuses importantes.',action:'Relever vitesse, ouverture et ISO au point le plus éclairé'},
    { id:'sphere',short:'Lumisphère',title:'Sortie ou rentrée ?',kicker:'Mission 06 · choisir l’information utile',image:'/assets/sphere.webp',insight:'Lumisphère sortie : lumière incidente à 180°, utile pour l’ambiance et les contrastes. Rentrée : mesure directionnelle d’une source.',task:'Choisis la position qui correspond à une source studio unique.',question:'Avec une source principale unique, quelle position aide à isoler sa contribution ?',options:['Lumisphère sortie','Lumisphère rentrée','La position ne change rien'],answer:1,feedback:'Exact. La lumisphère rentrée mesure la lumière qui arrive directement sur la cellule : pratique pour isoler une source.',action:'Adapter la lumisphère à l’intention de mesure'},
    { id:'values',short:'Valeurs',title:'Lire et ajuster les valeurs',kicker:'Mission 07 · transformer la mesure en exposition',image:'/assets/values.webp',insight:'La cellule affiche un couple vitesse / ouverture pour un ISO donné. Les tiers de diaphragme permettent un réglage précis.',task:'Lumière subie : retire 4 tiers de diaphragme. Lumière contrôlée : ajoute 4 tiers. Reporte ensuite l’ouverture sur l’appareil.',question:'Pour passer de f/8 à f/4, que fais-tu ?',options:['Tu retires 4 tiers de diaphragme','Tu ajoutes 4 tiers de diaphragme','Tu ne changes rien'],answer:0,feedback:'Oui. En lumière subie, on retire 4 tiers de diaphragme ; en lumière contrôlée, on en ajoute 4.',action:'Mission terminée · régler l’appareil et déclencher'}
  ];
  const assetUrl = (path: string) => new URL(path.replace(/^\/+/, ''), window.location.href).toString();
  lessons.forEach((lesson) => { lesson.image = assetUrl(lesson.image); });
  const activities: Record<string,{label:string; prompt:string; options:string[]; answer:number; feedback:string}> = {
    incident:{label:'Réglage de la cellule',prompt:'Tu veux mesurer la lumière qui arrive sur le visage. Quel réglage choisis-tu ?',options:['Mode réfléchi · cellule vers le sujet','Mode incident · cellule vers la source','Mode flash · cellule vers l’appareil'],answer:1,feedback:'En lumière incidente avec le posemètre, la mesure se prend toujours du sujet vers la lumière. Vous pouvez en savoir plus sur la fiche mémo ou répondre à une dernière question.'},
    reflected:{label:'Positionnement',prompt:'Pour mesurer la lumière réfléchie, place le posemètre au point de vue de l’appareil, face au sujet.',options:['Près du sujet, face à la source','À l’emplacement de l’appareil, face au sujet','Derrière la source'],answer:1,feedback:'Tu mesures depuis le point de vue de l’appareil : la cellule reçoit ce que le sujet renvoie.'},
    albedo:{label:'Test de terrain',prompt:'Même lumière, deux vêtements. Quelle lecture évolue avec le vêtement ?',options:['La mesure incidente','La mesure réfléchie','Aucune lecture'],answer:1,feedback:'La mesure réfléchie varie avec l’albédo : elle répond à ce que le sujet renvoie.'},
    conditions:{label:'Check avant mesure',prompt:'Quelle action garantit une lecture exploitable ?',options:['Mesurer de loin pour avoir toute la scène','Placer la cellule au plus près de la zone utile','Viser le fond pour lisser la lumière'],answer:1,feedback:'La précision se gagne à l’emplacement du sujet, sur la zone que vous voulez réellement exposer.'},
    climax:{label:'Choisis la zone',prompt:'Place le posemètre sur le sujet, à hauteur de sa partie la plus éclairée : c’est le climax.',options:['Le fond sombre','La partie la plus éclairée du visage ou des cheveux','L’ombre sous le menton'],answer:1,feedback:'La zone de mesure au climax est la plus proche de la source de lumière du sujet et elle reçoit un maximum de lumière.'},
    sphere:{label:'Manipule la lumisphère',prompt:'Place le posemètre au niveau de la source principale, pour isoler sa contribution.',options:['Lumisphère rentrée','Lumisphère sortie','Sans lumisphère'],answer:0,feedback:'La lumisphère rentrée favorise une mesure directionnelle : elle isole la contribution de la source.'},
    values:{label:'Transfert sur l’appareil',prompt:'Choisis l’ouverture à reporter sur l’appareil.',options:['1/250 · f/8 · ISO 100','1/125 · f/5.6 · ISO 100','1/125 · f/2.8 · ISO 400'],answer:1,feedback:'C’est le trio lu sur la cellule. Vous pourrez ensuite le décaler consciemment en tiers de diaphragme.'}
  };
  const ZONE_HINTS:Record<string,string> = {
    f1:'Cette partie des cheveux est à contre-jour et elle n\'est pas dans la zone de mesure au Climax. Réessayez !',
    f2:'Cette partie du visage est la moins éclairée et elle n\'est pas dans la zone de mesure au Climax. Réessayez !',
    f3:'Le paysage et la source de lumière ne sont pas la zone de mesure au Climax. Réessayez !'
  };
  const dropTargets: Record<string,string>={incident:'subject',reflected:'camera',conditions:'subject',climax:'subject',sphere:'source',values:'camera'};
  const STUDIO_LAYERS=['fond','appareil','sujet','lumiere'];
  const LAYERED_SCENES: Record<string,{dir:string;layers:string[]}>={incident:{dir:'ex1',layers:STUDIO_LAYERS},reflected:{dir:'ex2',layers:STUDIO_LAYERS},climax:{dir:'ex5',layers:['fond']}};
  function layerSources(id:string){const scene=LAYERED_SCENES[id];return scene?scene.layers.map((n)=>`/assets/scenes/${scene.dir}/${n}.webp`):null}
  const STUDIO_ZONES=[null,'camera','subject','source'];
  const ZONE_MAPS: Record<string,{src:string;levels:(string|null)[]}>={incident:{src:'/assets/scenes/ex1/zones.webp',levels:STUDIO_ZONES},reflected:{src:'/assets/scenes/ex2/zones.webp',levels:STUDIO_ZONES},climax:{src:'/assets/scenes/ex5/zones.webp',levels:['f3','f1','f2','subject']}};
  const zoneMaps: Record<string,{w:number;h:number;data:Uint8ClampedArray}>={};
  const albedoScenes=[
    {file:'albedo-mugs-v2.webp',tones:{camera:'dark',subject:'clear',source:'neutral'}},
    {file:'albedo-shirts-v2.webp',tones:{camera:'neutral',subject:'dark',source:'clear'}},
    {file:'albedo-sneakers-v2.webp',tones:{camera:'clear',subject:'dark',source:'neutral'}},
    {file:'albedo-books-v2.webp',tones:{camera:'dark',subject:'neutral',source:'clear'}},
    {file:'albedo-plants.webp',tones:{camera:'clear',subject:'neutral',source:'dark'}},
    {file:'albedo-lamps.webp',tones:{camera:'clear',subject:'neutral',source:'dark'}}
  ];
  const albedoQuestions=[
    {prompt:'Quel objet renvoie le plus de lumière ?',answer:'clear'},
    {prompt:'Quel objet possède une réflectance intermédiaire ?',answer:'neutral'},
    {prompt:'Quel objet renvoie le moins de lumière ?',answer:'dark'}
  ];
  const sphereScenarios=[
    {id:'natural',answer:'sortie',prompt:'En lumière naturelle sans contraste, quel posemètre choisissez-vous ?',coachTask:'Choisissez le posemètre adapté à une lumière naturelle douce.',coachAction:'La lumisphère sortie intègre la lumière ambiante.'},
    {id:'studio',answer:'rentree',prompt:'En lumière de studio, quel posemètre choisissez-vous ?',coachTask:'Choisissez le posemètre adapté à une source de studio.',coachAction:'La lumisphère rentrée isole la source directionnelle.'}
  ];
  type ExposureSetting={speed:number;aperture:string;iso:number};
  const APERTURES=['1.4','1.6','1.8','2','2.2','2.5','2.8','3.2','3.5','4','4.5','5','5.6','6.3','7.1','8','9','10','11','13','14','16','18','20','22'];
  const LIGHT_SHIFT=6; // décalage de la correction sur l’échelle au tiers : f/8 → f/4 en lumière subie, f/4 → f/8 en lumière contrôlée
  function pick<T>(list:T[]){return list[Math.floor(Math.random()*list.length)]}
  function shuffle<T>(list:T[]){const copy=[...list];for(let i=copy.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]]}return copy}
  function makeValueScenario(subie:boolean){
    const from=APERTURES.indexOf(subie?'5.6':'2.8'), to=APERTURES.indexOf(subie?'11':'8'), index=from+Math.floor(Math.random()*(to-from+1)), shift=subie?-LIGHT_SHIFT:LIGHT_SHIFT;
    const reading:ExposureSetting={speed:pick([60,125,250,500]),aperture:APERTURES[index],iso:pick([100,200,400])}, target=APERTURES[index+shift], options=shuffle([target,APERTURES[index],APERTURES[index-shift]]);
    return subie
      ?{light:'Lumière subie',detail:'mesure de l’ambiance',reading,options,answer:options.indexOf(target),rule:'en lumière subie, on retire 4 tiers de diaphragme',success:'Bonne correction : en lumière subie, on retire 4 tiers de diaphragme pour préserver les hautes lumières.'}
      :{light:'Lumière contrôlée',detail:'éclairage ajouté',reading,options,answer:options.indexOf(target),rule:'en lumière contrôlée, on ajoute 4 tiers de diaphragme',success:'Bonne correction : en lumière contrôlée, on ajoute 4 tiers de diaphragme pour un rendu plus lumineux.'};
  }
  let valueScenarios=[makeValueScenario(true),makeValueScenario(false)];
  function randomizeValues(){valueScenarios=[makeValueScenario(true),makeValueScenario(false)]}
  type AnswerResult={selected:number|null;correct:boolean|null;detail?:string};
  let current=0, selected:number|null=null, answered=false, configured=false, configChoice:string|null=null, attempts=0, score=0, done=new Set<number>(), showGuide=true, started=false, showResults=false, answerResults:Record<number,AnswerResult>={}, referenceEl:HTMLDetailsElement, albedoSceneIndex=0, albedoQuestionIndex=0, sphereScenarioIndex=Math.floor(Math.random()*sphereScenarios.length), valuePhase=0, valueAnswers:(number|null)[]=[null,null], zoomSrc:string|null=null, triedZones:string[]=[], touchDevice=false;
  type DragState={el:HTMLElement;id:number;sx:number;sy:number;x:number;y:number;px:number;py:number;bounds:[number,number,number,number];moved:boolean;frame:number};
  const DRAG_THRESHOLD=6, DROP_MAGNET=28;
  let drag:DragState|null=null, dragging=false, dragZone:string|null=null;
  function closeZoom(){zoomSrc=null}
  function loadZoneMap(id:string,src:string){
    const image=new Image();
    image.onload=()=>{
      const canvas=document.createElement('canvas'), ctx=canvas.getContext('2d',{willReadFrequently:true});
      if(!ctx)return;
      canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;
      ctx.drawImage(image,0,0);
      zoneMaps[id]={w:canvas.width,h:canvas.height,data:ctx.getImageData(0,0,canvas.width,canvas.height).data};
    };
    image.src=assetUrl(src);
  }
  function mapZoneAt(x:number,y:number){
    const map=zoneMaps[lesson.id], scene=document.querySelector('.scene');
    if(!map||!scene)return null;
    const s=scene.getBoundingClientRect(), u=(x-s.left)/s.width, v=(y-s.top)/s.height;
    if(u<0||u>=1||v<0||v>=1)return null;
    return ZONE_MAPS[lesson.id].levels[Math.round(map.data[(Math.floor(v*map.h)*map.w+Math.floor(u*map.w))*4]/85)]??null;
  }
  function onWindowKeydown(e:KeyboardEvent){if(e.key!=='Escape')return;if(drag)cancelDrag();else if(zoomSrc)closeZoom()}
  $: if(typeof document!=='undefined'&&lesson&&lesson.image)queueMicrotask(()=>{const im=new Image();im.src=lesson.image;im.decode().catch(()=>{})})
  $: wrongHint=lesson.id==='values'?valueHint(configChoice):ZONE_HINTS[configChoice||'']||'En lumière incidente avec le posemètre, la mesure ne se prend pas sur cette zone. Réessayez !'; $: lesson=lessons[current]; $: progress=Math.round((done.size/lessons.length)*100); $: sceneImage=lesson.id==='reflected'?'/assets/reflected-interactive-scene.webp':lesson.id==='albedo'?`/assets/${albedoScenes[albedoSceneIndex].file}`:lesson.id==='conditions'?'/assets/conditions-interactive-scene.webp':lesson.id==='climax'?'/assets/climax-interactive-scene.webp':lesson.id==='sphere'?'/assets/lumisphere-interactive-scene.webp':'/assets/studio-game-scene-v2.webp'; $: albedoSelected=lesson.id==='albedo'&&configChoice?albedoScenes[albedoSceneIndex].tones[configChoice as keyof typeof albedoScenes[number]['tones']]||'':''; $: if(typeof document!=='undefined'){document.documentElement.style.setProperty('--interactive-scene',`url('${sceneImage}')`);document.documentElement.dataset.lesson=lesson.id;document.documentElement.dataset.albedoQuestion=String(albedoQuestionIndex);document.documentElement.dataset.albedoSelected=albedoSelected;document.documentElement.dataset.configured=String(configured);document.documentElement.dataset.missionDone=String(done.has(current));document.documentElement.dataset.started=String(started);document.documentElement.dataset.zoom=String(!!zoomSrc)}
  $: if(typeof document!=='undefined')document.documentElement.dataset.sphereScenario=sphereScenarios[sphereScenarioIndex].id;
  $: if(typeof document!=='undefined')document.documentElement.dataset.results=String(showResults);
  $: if(typeof document!=='undefined'&&sceneImage){const displayedScene=sceneImage;requestAnimationFrame(()=>document.documentElement.style.setProperty('--interactive-scene',`url('${assetUrl(displayedScene)}')`))}
  $: if(typeof document!=='undefined')queueMicrotask(()=>{
    document.documentElement.dataset.meterPlaced=String(configured);
    document.querySelectorAll<HTMLElement>('.meter-token,.meter-placed').forEach((meter)=>{
      meter.style.backgroundImage=`url('${assetUrl('/assets/posemetre-draggable.webp')}')`;
    });
  });
  $: if(typeof document!=='undefined')queueMicrotask(()=>{const counter=document.querySelector('.points');if(counter)counter.textContent=`✦ ${score} / ${lessons.length} ${score===1?'point':'points'}`});
  $: if(typeof document!=='undefined'&&started&&lesson.id==='conditions')queueMicrotask(()=>{const scene=document.querySelector('.scene');if(!scene)return;scene.querySelector('.conditions-zones')?.remove();const zones=document.createElement('div');zones.className='conditions-zones';[['camera','Appareil'],['meter','Posemètre'],['dome','Lumisphère'],['softbox','Source'],['mug','Tasse']].forEach(([id,label])=>{const button=document.createElement('button');button.className=`condition-zone ${id}`;button.dataset.zone=id;button.setAttribute('aria-label',label);button.onclick=()=>conditionClick(id);zones.append(button)});scene.append(zones)});
  $: if(typeof document!=='undefined'&&lesson.id!=='conditions')queueMicrotask(()=>document.querySelector('.conditions-zones')?.remove());
  $: if(typeof document!=='undefined'&&started&&lesson.id==='sphere')queueMicrotask(()=>{const scene=document.querySelector('.scene');if(!scene)return;scene.querySelector('.sphere-zones')?.remove();const zones=document.createElement('div');zones.className='sphere-zones';[['sortie','Lumisphère sortie'],['rentree','Lumisphère rentrée']].forEach(([id,label])=>{const button=document.createElement('button');button.className=`sphere-zone ${id}`;button.dataset.zone=id;button.setAttribute('aria-label',label);button.onclick=()=>sphereClick(id);zones.append(button)});scene.append(zones)});
  $: if(typeof document!=='undefined'&&lesson.id!=='sphere')queueMicrotask(()=>document.querySelector('.sphere-zones')?.remove());
  $: if(typeof document!=='undefined')queueMicrotask(()=>document.querySelectorAll<HTMLElement>('.sphere-zone,.condition-zone').forEach((zone)=>{const id=zone.dataset.zone??'';zone.classList.toggle('hit',triedZones.includes(id));zone.classList.toggle('correct',id===configChoice&&configured)}));
  $: maxAttempts=lesson.id==='sphere'?1:2;
  function choose(index:number){if(answered)return;selected=index;answered=true;const correct=index===quiz.answer;if(lesson.id==='values'){chooseValueAnswer(index);return}answerResults={...answerResults,[current]:{selected:index,correct}};if(correct&&!done.has(current)){done=new Set(done).add(current);score+=1}}
  async function openMemo(){await tick();if(referenceEl){referenceEl.open=true;referenceEl.scrollIntoView({behavior:'smooth',block:'start'})}}
  function randomizeAlbedo(){albedoSceneIndex=Math.floor(Math.random()*albedoScenes.length);albedoQuestionIndex=Math.floor(Math.random()*albedoQuestions.length)}
  function dropMeter(zone:string){if(configured||attempts>=maxAttempts)return;const expected=lesson.id==='albedo'?albedoQuestions[albedoQuestionIndex].answer:dropTargets[lesson.id];configChoice=zone;const choice=lesson.id==='albedo'?albedoScenes[albedoSceneIndex].tones[zone as keyof typeof albedoScenes[number]['tones']]:zone;if(choice===expected){configured=true;openMemo();return}attempts+=1;if(attempts===maxAttempts)openMemo()}
  function zoneClick(e:MouseEvent,zone:string){const keyboard=e.detail===0, pointer=(e as PointerEvent).pointerType, target=ZONE_MAPS[lesson.id]&&!keyboard?mapZoneAt(e.clientX,e.clientY):zone;if(target&&(!sceneLayers||touchDevice||keyboard||pointer==='touch'||pointer==='pen'))dropMeter(target)}
  function zoneAt(x:number,y:number,tolerance=DROP_MAGNET){
    if(ZONE_MAPS[lesson.id])return mapZoneAt(x,y);
    let best:string|null=null, bestDist=tolerance, bestArea=Infinity;
    for(const el of document.querySelectorAll<HTMLElement>('.scene .drop-zone[data-zone]')){
      const r=el.getBoundingClientRect();
      if(!r.width||!r.height||getComputedStyle(el).pointerEvents==='none')continue;
      const dist=Math.hypot(Math.max(r.left-x,0,x-r.right),Math.max(r.top-y,0,y-r.bottom)), area=r.width*r.height;
      if(dist<bestDist||(dist===bestDist&&area<bestArea)){best=el.dataset.zone??null;bestDist=dist;bestArea=area}
    }
    return best;
  }
  function startDrag(e:PointerEvent){
    if(drag||configured||attempts>=maxAttempts||e.button>0)return;
    const el=e.currentTarget as HTMLElement, scene=el.closest('.scene');
    if(!scene)return;
    const s=scene.getBoundingClientRect(), t=el.getBoundingClientRect();
    const [ox=0,oy=0]=getComputedStyle(el).translate.split(' ').map((v)=>parseFloat(v)||0);
    el.style.translate=`${ox}px ${oy}px`;
    try{el.setPointerCapture(e.pointerId)}catch{}
    drag={el,id:e.pointerId,sx:e.clientX,sy:e.clientY,x:e.clientX-ox,y:e.clientY-oy,px:e.clientX,py:e.clientY,bounds:[s.left-t.left+ox,s.right-t.right+ox,s.top-t.top+oy,s.bottom-t.bottom+oy],moved:false,frame:0};
    e.preventDefault();
  }
  function moveDrag(e:PointerEvent){
    if(!drag||e.pointerId!==drag.id)return;
    drag.px=e.clientX;drag.py=e.clientY;
    if(!drag.moved){
      if(Math.hypot(drag.px-drag.sx,drag.py-drag.sy)<DRAG_THRESHOLD)return;
      drag.moved=true;dragging=true;configChoice=null;
    }
    if(!drag.frame)drag.frame=requestAnimationFrame(renderDrag);
  }
  function renderDrag(){
    if(!drag)return;
    const [minX,maxX,minY,maxY]=drag.bounds;
    drag.frame=0;
    drag.el.style.translate=`${Math.min(Math.max(drag.px-drag.x,minX),maxX)}px ${Math.min(Math.max(drag.py-drag.y,minY),maxY)}px`;
    dragZone=zoneAt(drag.px,drag.py);
  }
  function endDrag(e:PointerEvent){
    if(!drag||e.pointerId!==drag.id)return;
    const tap=!drag.moved&&(!sceneLayers||touchDevice||e.pointerType!=='mouse');
    const zone=e.type==='pointerup'&&(drag.moved||tap)?zoneAt(e.clientX,e.clientY,drag.moved?DROP_MAGNET:0):null;
    cancelDrag();
    if(zone)dropMeter(zone);
  }
  function cancelDrag(){
    if(!drag)return;
    cancelAnimationFrame(drag.frame);
    if(drag.el.hasPointerCapture(drag.id))drag.el.releasePointerCapture(drag.id);
    drag.el.style.translate='';
    drag=null;dragging=false;dragZone=null;
  }
  function conditionClick(item:string){if(configured||attempts>=maxAttempts)return;configChoice=item;triedZones=[...triedZones,item];if(item==='meter'){configured=true;openMemo();return}attempts+=1;if(attempts===maxAttempts)openMemo()}
  function sphereClick(item:string){if(configured||attempts>=maxAttempts)return;configChoice=item;triedZones=[...triedZones,item];if(item===sphereScenarios[sphereScenarioIndex].answer){configured=true;openMemo();return}attempts+=1;if(attempts===maxAttempts)openMemo()}
  const GUIDE_TEXTS:Record<string,string>={albedo:"La fiche mémo de la mission détaille la réflectance d’un sujet.",conditions:"La fiche mémo de la mission détaille les conditions préalables à une bonne mesure.",climax:"La fiche mémo de la mission détaille la mesure au climax.",sphere:"La fiche mémo de la mission détaille l’utilisation de la lumisphère.",values:"La fiche mémo de la mission détaille l’ajustement des valeurs d’une mesure."};
  const STAGE_TEXTS:Record<string,string>={incident:'Mise en situation · glisser déposer',reflected:'Mise en situation · glisser déposer',climax:'Mise en situation · glisser déposer',albedo:'Mise en situation · cliquer sur l’objet',conditions:'Mise en situation · cliquer sur l’objet',sphere:'Mise en situation · cliquer sur la source',values:'Mise en situation · cliquer sur l’ouverture'};
  const STAGE_TEXTS_TOUCH:Record<string,string>={incident:'Mise en situation · cliquer sur la zone',reflected:'Mise en situation · cliquer sur la zone',climax:'Mise en situation · toucher le visuel'};
  STAGE_TEXTS.sphere='Mise en situation · cliquer sur un posemètre';
  function readDeviceMode(){touchDevice=typeof matchMedia!=='undefined'&&matchMedia('(max-width:600px), (hover:none)').matches}
  const warmedVisuals=new Set<string>();
  function sceneSources(id:string){
    const layers=layerSources(id);
    if(layers)return layers;
    if(id==='albedo')return albedoScenes.map(({file})=>`/assets/${file}`);
    if(id==='conditions')return ['/assets/conditions-interactive-scene.webp'];
    if(id==='sphere')return ['/assets/lumisphere-interactive-scene.webp'];
    return id==='values'?[]:['/assets/studio-game-scene-v2.webp'];
  }
  function warmVisual(src:string){
    if(warmedVisuals.has(src))return;
    warmedVisuals.add(src);
    const image=new Image();
    image.src=assetUrl(src);
    image.decode().catch(()=>{});
  }
  function preloadNextVisuals(){
    const next=lessons[(current+1)%lessons.length];
    window.setTimeout(()=>[next.image,...sceneSources(next.id)].forEach(warmVisual),250);
  }
  onMount(()=>{
    const root=document.documentElement;
    const fixScenePath=()=>{
      const source=root.style.getPropertyValue('--interactive-scene');
      const match=source.match(/url\(['"]?(\/assets\/[^'")]+)['"]?\)/);
      if(match)root.style.setProperty('--interactive-scene',`url('${assetUrl(match[1])}')`);
    };
    const observer=new MutationObserver(fixScenePath);
    observer.observe(root,{attributes:true,attributeFilter:['style']});
    fixScenePath();
    return()=>observer.disconnect();
  });
  onMount(()=>Object.entries(ZONE_MAPS).forEach(([id,{src}])=>loadZoneMap(id,src)));
  onMount(()=>{readDeviceMode();window.addEventListener('resize',readDeviceMode);return()=>window.removeEventListener('resize',readDeviceMode)});
  $: sceneLayers=layerSources(lesson.id)?.map((src)=>assetUrl(src))??null;
  $: if(started&&lesson)preloadNextVisuals();
  $: guideCopy=GUIDE_TEXTS[lesson.id]??'La fiche mémo de la mission détaille le placement du posemètre et la direction de la mesure.';
  $: stageCopy=STAGE_TEXTS_TOUCH[lesson.id]&&touchDevice?STAGE_TEXTS_TOUCH[lesson.id]:STAGE_TEXTS[lesson.id]??'Mise en situation · glisser déposer';
  $: coachTaskCopy=!configured?'Réalise d’abord toutes les missions':lesson.task;
  $: coachActionCopy=!configured?'Le défi se débloque après le bon réglage':lesson.id==='values'&&valuePhase===0?'Réponds au défi, puis passe à la lumière contrôlée':lesson.action;
  $: if(lesson.id==='sphere'){coachTaskCopy=sphereScenarios[sphereScenarioIndex].coachTask;coachActionCopy=sphereScenarios[sphereScenarioIndex].coachAction}
  const VALUE_EXPECTED='Lumière subie : Tu retires 4 tiers de diaphragme · Lumière contrôlée : Tu ajoutes 4 tiers de diaphragme';
  $: valueScenario=valueScenarios[valuePhase]; $: valueTarget=valueScenario.options[valueScenario.answer];
  $: quiz=lesson.id==='values'?{question:configured?`${valueScenario.light} : pour passer de f/${valueScenario.reading.aperture} à f/${valueTarget}, que fais-tu ?`:`${valueScenario.light} : pour passer de f/${valueScenario.reading.aperture} à l’ouverture à reporter, que fais-tu ?`,options:lesson.options,answer:valuePhase===0?0:1,feedback:`Oui. f/${valueTarget} laisse entrer ${valuePhase===0?'davantage':'moins'} de lumière que f/${valueScenario.reading.aperture} : cela correspond à 4 tiers de diaphragme.`}:{question:lesson.question,options:lesson.options,answer:lesson.answer,feedback:lesson.feedback};
  function valueClick(index:number){if(configured||attempts>=maxAttempts)return;configChoice=String(index);triedZones=[...triedZones,configChoice];if(index===valueScenario.answer){configured=true;openMemo();return}attempts+=1;if(attempts===maxAttempts)openMemo()}
  function valueHint(choice:string|null){const option=choice===null?null:valueScenario.options[Number(choice)];if(!option)return '';return option===valueScenario.reading.aperture?`Vous avez reporté la lecture sans correction : ${valueScenario.rule}. Réessayez !`:`Cette ouverture corrige dans le mauvais sens : ${valueScenario.rule}. Réessayez !`}
  function chooseValueAnswer(index:number){
    valueAnswers=valuePhase===0?[index,null]:[valueAnswers[0],index];
    const answerText=(answer:number|null)=>answer===null?'non répondue':lesson.options[answer], both=valueAnswers[0]===0&&valueAnswers[1]===1;
    answerResults={...answerResults,[current]:{selected:index,correct:both,detail:`Lumière subie : ${answerText(valueAnswers[0])} · Lumière contrôlée : ${answerText(valueAnswers[1])}`}};
    if(both&&!done.has(current)){done=new Set(done).add(current);score+=1}
  }
  function nextValuePhase(){valuePhase=1;configured=false;configChoice=null;triedZones=[];attempts=0;selected=null;answered=false;if(referenceEl)referenceEl.open=false;document.querySelector('.scene')?.scrollIntoView({behavior:'smooth',block:'center'})}
  function randomizeSphere(){sphereScenarioIndex=Math.floor(Math.random()*sphereScenarios.length)}
  function resetAttempts(){configured=false;configChoice=null;triedZones=[];attempts=0;if(referenceEl)referenceEl.open=false;if(lesson.id==='albedo')randomizeAlbedo();if(lesson.id==='sphere')randomizeSphere();if(lesson.id==='values')valueScenarios=valueScenarios.map((scenario,phase)=>phase===valuePhase?makeValueScenario(phase===0):scenario)}
  $: correctAnswers=Object.values(answerResults).filter((result)=>result.correct).length;
  $: revisionLessons=lessons.filter((_,index)=>answerResults[index]?.correct!==true);
  function move(index:number){showResults=false;current=index;selected=null;answered=false;configured=false;configChoice=null;triedZones=[];attempts=0;if(referenceEl)referenceEl.open=false;if(lessons[index].id==='albedo')randomizeAlbedo();if(lessons[index].id==='sphere')randomizeSphere();valuePhase=0;valueAnswers=[null,null];if(lessons[index].id==='values')randomizeValues()}
  function finishCourse(){showResults=true;window.scrollTo({top:0,behavior:'smooth'})}
  function restartCourse(){answerResults={};score=0;done=new Set();move(0)}
  function next(){if(current===lessons.length-1)finishCourse();else move(current+1)}
</script>
<style>
  :global(:root[data-lesson='values'][data-results='false']) .next{font-size:0}:global(:root[data-lesson='values'][data-results='false']) .next::before{content:'Voir mon bilan';font-size:.86rem}:global(:root[data-lesson='values'][data-results='false']) .next span{font-size:1rem}
  :global(:root[data-results='true']) .lesson-grid{display:none}.results-panel{max-width:960px;margin:35px auto 0;padding:clamp(24px,4vw,48px);border:1px solid #52646b;border-radius:22px;background:linear-gradient(145deg,#13242b,#0c171c);box-shadow:0 24px 70px #0006}.results-panel h1{margin:9px 0 14px;font-family:Outfit,sans-serif;font-size:clamp(2.5rem,5vw,4.5rem);line-height:.95;letter-spacing:-.055em}.results-intro{max-width:720px;margin:0;color:#cbd9da;font-size:1.02rem;line-height:1.5}.results-score{display:inline-grid;gap:2px;margin:27px 0 20px;padding:18px 23px;border:1px solid #765d28;border-radius:16px;background:#241e10}.results-score b{color:#ffd15a;font:800 clamp(2.3rem,5vw,4rem)/.9 Outfit,sans-serif}.results-score b small{font-size:.48em}.results-score span{color:#e8d8a4;font-size:.72rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase}.revision-summary{margin:0 0 25px;padding:15px 18px;border-left:3px solid #e9b745;border-radius:0 12px 12px 0;background:#282112;color:#eadfbe}.revision-summary.success{border-color:#80bc8d;background:#183027;color:#d2ebd6}.revision-summary p{margin:5px 0 0}.results-list{display:grid;gap:13px}.result-card{display:grid;grid-template-columns:1fr auto;gap:10px 18px;padding:18px;border:1px solid #42545b;border-radius:14px;background:#101c21}.result-card.correct{border-color:#4d8060}.result-card.needs-review{border-color:#80624b}.result-card h2{margin:4px 0 0;font:700 1.15rem/1.1 Outfit,sans-serif}.result-card p{grid-column:1/-1;margin:0;color:#c7d4d5;font-size:.87rem;line-height:1.45}.result-card p b{color:#f3d88a}.result-status{align-self:start;padding:6px 9px;border-radius:99px;background:#253a42;color:#d4e2e3;font-size:.72rem;font-weight:800;white-space:nowrap}.correct .result-status{background:#193527;color:#c6efcd}.needs-review .result-status{background:#3a2b20;color:#f2c184}.result-feedback{padding-top:8px;border-top:1px solid #34464c}.review-button{justify-self:start;padding:8px 11px;border:1px solid #687b80;border-radius:8px;background:#1a2b31;color:#edf4f2;font-size:.78rem;font-weight:800}.restart{max-width:310px;margin-top:25px}:global(.coach){position:sticky;top:24px;max-height:calc(100dvh - 48px);overflow:auto}:global(.guide){z-index:90}@media(max-width:900px){:global(.coach){position:static;max-height:none;overflow:visible}.results-panel{margin-top:24px}}@media(max-width:600px){.result-card{grid-template-columns:1fr}.result-status{justify-self:start}.results-panel{padding:24px 18px}}
</style>
<svelte:window onkeydown={onWindowKeydown} /><svelte:head><title>Posemètre · Atelier lumière</title><meta name="description" content="Un module eLearning interactif sur le posemètre et le flashmètre." /></svelte:head>
{#if !started}<section class="intro" aria-label="Présentation du module"><div class="intro-panel"><span class="eyebrow">Module eLearning · photographie</span><h1>Le posemètre/<em>flashmètre</em></h1><p class="intro-objective"><b>Objectif</b> Apprendre à manipuler le posemètre/flashmètre pour mesurer la lumière dans des mises en situations pratiques.</p><div class="intro-skills"><h2>À la fin du module, vous serez capable de :</h2><ul><li>Distinguer les différentes mesures</li><li>Différencier l’albédo et la réflectance des sujets</li><li>Différencier la mesure au climax des reflets d’éclairage</li><li>Positionner la lumisphère selon les types d’environnements</li><li>Distinguer les valeurs affichées par la cellule</li></ul></div><p class="intro-method"><b>Missions</b> Observer, manipuler, répondre ; deux essais par situation.</p><button class="intro-start" onclick={()=>started=true}>Commencer la mission <span>→</span></button></div></section>{/if}
<main>
  <aside class="rail" aria-label="Parcours"><div class="brand"><span>◐</span><b>Atelier<br />lumière</b></div><nav>{#each lessons as item,i}<button class:active={i===current} class:visited={done.has(i)} onclick={()=>move(i)} aria-label={`Mission ${i+1} : ${item.short}`}><span>{done.has(i)?'✓':i+1}</span><small>{item.short}</small></button>{/each}</nav><button class="guide-trigger" onclick={()=>showGuide=!showGuide} aria-expanded={showGuide}>?</button></aside>
  <section class="workspace"><header><div><span class="eyebrow">{showResults?'Bilan de parcours':lesson.kicker}</span><strong>Posemètre / flashmètre</strong></div><div class="score"><span>Progression</span><b>{showResults?'100%':progress+'%'}</b><div class="bar"><i style={`width:${showResults?100:progress}%`}></i></div></div><div class="points">✦ {score} / {lessons.length} justes</div></header>
    {#if showResults}<section class="results-panel" aria-labelledby="results-title"><span class="eyebrow">Parcours terminé</span><h1 id="results-title">Votre bilan lumière</h1><p class="results-intro">Vous avez obtenu <b>{correctAnswers} réponse{correctAnswers>1?'s':''} juste{correctAnswers>1?'s':''}</b> sur {lessons.length}. Retrouvez ci-dessous vos réponses et les notions à consolider.</p><div class="results-score"><b>{correctAnswers}<small>/{lessons.length}</small></b><span>réponses justes</span></div>{#if revisionLessons.length}<div class="revision-summary"><b>À réviser en priorité</b><p>{revisionLessons.map((item)=>item.short).join(' · ')}</p></div>{:else}<div class="revision-summary success"><b>Parcours parfaitement maîtrisé</b><p>Toutes vos réponses sont justes. Bravo !</p></div>{/if}<div class="results-list">{#each lessons as item,i}<article class:correct={answerResults[i]?.correct===true} class:needs-review={answerResults[i]?.correct!==true} class="result-card"><div><span class="chapter">Mission {String(i+1).padStart(2,'0')}</span><h2>{item.title}</h2></div><span class="result-status">{answerResults[i]?.correct===true?'✓ Acquis':'↗ À revoir'}</span><p><b>Votre réponse :</b> {answerResults[i]?.detail??(answerResults[i]?.selected===undefined||answerResults[i]?.selected===null?'Non répondue':item.options[answerResults[i].selected!])}</p>{#if answerResults[i]?.correct!==true}<p><b>Réponse attendue :</b> {item.id==='values'?VALUE_EXPECTED:item.options[item.answer]}</p>{/if}<p class="result-feedback">{answerResults[i]?.correct===true?item.feedback:item.insight}</p>{#if answerResults[i]?.correct!==true}<button class="review-button" onclick={()=>move(i)}>Revoir cette mission →</button>{/if}</article>{/each}</div><button class="next restart" onclick={restartCourse}>Recommencer le parcours <span>↻</span></button></section>{/if}
    <div class="lesson-grid"><section class="content"><div class="title-row"><div><span class="chapter">{String(current+1).padStart(2,'0')}</span><h1>{lesson.title}</h1></div><span class="status">{done.has(current)?'Mission validée':'En exploration'}</span></div><section class="stage photo-stage" style={`background-image:linear-gradient(90deg,#0d171bdd,#0d171b44)`}><div class="stage-top"><span class="eyebrow">{stageCopy}</span><div class="attempt-control"><span class="attempt-counter">{maxAttempts>1?'Essais':'Essai'} {attempts}/{maxAttempts}</span>{#if attempts>=maxAttempts&&!configured}<button class="retry-button" onclick={resetAttempts}>↻ Réessayer</button>{:else}<span class:ready={configured} class="live">{configured?'Mesure validée':'À vous de jouer'}</span>{/if}</div></div><p class="drag-instruction">{activities[lesson.id].prompt}</p><div class="scene" class:layered={!!sceneLayers} aria-label="Scène de prise de vue">{#if sceneLayers}{#each sceneLayers as src (src)}<img class="layer" {src} alt="" draggable="false" />{/each}{/if}{#if lesson.id==='values'}<div class="values-game"><section class="value-row" class:solved={configured} aria-label={valueScenario.light}><p class="light-situation"><span class="value-step">{configured?'✓':valuePhase+1}</span><span><b>{valueScenario.light}</b> · {valueScenario.detail}</span><small class="value-progress">Situation {valuePhase+1}/2</small></p><div class="lcd" role="img" aria-label={`Lecture de la cellule : 1/${valueScenario.reading.speed} s, f/${valueScenario.reading.aperture}, ISO ${valueScenario.reading.iso}`}><span><small>Tv</small><b>{valueScenario.reading.speed}</b></span><span><small>f</small><b>{valueScenario.reading.aperture}</b></span><span><small>ISO</small><b>{valueScenario.reading.iso}</b></span></div><div class="value-choices" role="group" aria-label={`Ouverture à reporter en ${valueScenario.light.toLowerCase()}`}>{#each valueScenario.options as option,i}<button class="value-choice" class:hit={triedZones.includes(String(i))} class:correct={configured&&i===valueScenario.answer} onclick={()=>valueClick(i)} disabled={configured||attempts>=maxAttempts}>f/{option}</button>{/each}</div></section></div>{:else}<span class="ray ray-one"></span><span class="ray ray-two"></span>{#if lesson.id!=='climax'}<button class="drop-zone source-zone" class:target={dropTargets[lesson.id]==='source'} class:hit={configChoice==='source'} data-zone="source" class:over={dragZone==='source'} onclick={(e)=>zoneClick(e,'source')}><b>☀</b><small>Source</small></button>{/if}<button class="drop-zone subject-zone" class:target={dropTargets[lesson.id]==='subject'} class:hit={configChoice==='subject'} data-zone="subject" class:over={dragZone==='subject'} onclick={(e)=>zoneClick(e,'subject')}><b>●</b><small>{lesson.id==='climax'?'Climax':'Sujet'}</small></button>{#if lesson.id==='climax'}<button class="drop-zone false-zone f1" class:hit={configChoice==='f1'} data-zone="f1" class:over={dragZone==='f1'} onclick={(e)=>zoneClick(e,'f1')}><small>Cheveux</small></button><button class="drop-zone false-zone f2" class:hit={configChoice==='f2'} data-zone="f2" class:over={dragZone==='f2'} onclick={(e)=>zoneClick(e,'f2')}><small>Visage</small></button><button class="drop-zone false-zone f3" class:hit={configChoice==='f3'} data-zone="f3" class:over={dragZone==='f3'} onclick={(e)=>zoneClick(e,'f3')}><small>Paysage</small></button>{/if}<button class="drop-zone climax-zone" class:target={dropTargets[lesson.id]==='climax'} class:hit={configChoice==='climax'} data-zone="climax" class:over={dragZone==='climax'} onclick={(e)=>zoneClick(e,'climax')}><b>✦</b><small>Climax</small></button>{#if lesson.id!=='climax'}<button class="drop-zone camera-zone" class:target={dropTargets[lesson.id]==='camera'} class:hit={configChoice==='camera'} data-zone="camera" class:over={dragZone==='camera'} onclick={(e)=>zoneClick(e,'camera')}><b>▣</b><small>Appareil</small></button>{/if}{#if !configured}<div class="meter-token" role="button" tabindex="0" aria-label="Posemètre : glissez-le vers la zone à mesurer, ou touchez directement une zone" class:dragging={dragging} onpointerdown={startDrag} onpointermove={moveDrag} onpointerup={endDrag} onpointercancel={endDrag} onlostpointercapture={endDrag}><span>◉</span><small>Glissez le posemètre</small></div>{:else}<div class="meter-placed">◉ <span>posemètre placé</span></div>{/if}{/if}</div><p class="tap-hint">{attempts>=maxAttempts&&!configured?`${maxAttempts>1?'Deux essais effectués':'Essai effectué'} : le mémo est ouvert pour vous guider.`:lesson.id==='values'?'Cliquez sur l’ouverture à reporter sur l’appareil.':'Glissez le posemètre vers la zone à mesurer — sur mobile, touchez une zone.'}</p>{#if configChoice!==null}<div class:success={configured} class:final-attempt={attempts>=maxAttempts&&!configured} class="feedback"><b>{configured?'Bonne mesure.':attempts>=maxAttempts?(maxAttempts>1?'Deux essais effectués.':'Essai effectué.'):'Mauvais choix'}</b><p>{configured?(lesson.id==='values'?valueScenario.success:activities[lesson.id].feedback):attempts>=maxAttempts?'Consultez le mémo visuel ouvert juste en dessous pour comprendre la bonne mesure.':wrongHint}</p>{#if attempts>=maxAttempts&&!configured}<button class="memo-link" onclick={openMemo}>↓ Consulter le mémo visuel</button>{/if}</div>{/if}</section><details bind:this={referenceEl} class:attention={attempts>=maxAttempts&&!configured} class="reference"><summary>Voir le mémo visuel de cette mission</summary><button class="memo-zoom" onclick={()=>zoomSrc=lesson.image} aria-label="Agrandir la planche de la mission"><img src={lesson.image} alt="Planche explicative de la mission" /></button></details><div class="insight"><span>✦</span><p>{lesson.insight}</p></div></section>
      <aside class="coach"><div class="coach-head"><span class="orb">◉</span><div><span class="eyebrow">Coach lumière</span><strong>On avance pas à pas.</strong></div></div><div class="task"><span>À faire maintenant</span><p>{coachTaskCopy}</p><b>{coachActionCopy}</b></div><section class:locked={!configured} class="quiz" aria-live="polite"><span class="eyebrow">Défi dans l’action</span><h2>{quiz.question}</h2><div class="answers">{#each quiz.options as option,i}<button class:correct={answered&&i===quiz.answer} class:wrong={answered&&selected===i&&i!==quiz.answer} onclick={()=>choose(i)} disabled={answered||!configured}><span>{String.fromCharCode(65+i)}</span>{option}</button>{/each}</div>{#if !configured}<p class="lock-note">Débloquez d’abord la situation à gauche.</p>{/if}{#if answered}<div class:success={selected===quiz.answer} class="feedback"><b>{selected===quiz.answer?'Bien joué.':'Pas tout à fait.'}</b><p>{quiz.feedback}</p></div>{#if lesson.id==='values'&&valuePhase===0}<button class="phase-next" onclick={nextValuePhase}>Passer à la lumière contrôlée <span>→</span></button>{/if}{/if}</section><button class="next" onclick={next}>{current===lessons.length-1?'Recommencer le parcours':'Continuer la mission'} <span>→</span></button></aside></div>
  </section>
  {#if showGuide}<div class="guide"><button onclick={()=>showGuide=false} aria-label="Fermer">×</button><span class="eyebrow">Fiche mémo</span><b>Besoin d’un rappel ?</b><p>{guideCopy}</p><button class="guide-memo-link" onclick={openMemo}>↓ Voir la fiche mémo</button></div>{/if}
</main>
{#if zoomSrc}<div class="zoom-backdrop" role="dialog" aria-modal="true" aria-label="Planche agrandie"><button class="zoom-dismiss" onclick={closeZoom} aria-label="Fermer la planche agrandie"></button><img src={zoomSrc} alt="Planche explicative de la mission" /><button class="zoom-close" onclick={closeZoom} aria-label="Fermer">×</button></div>{/if}
