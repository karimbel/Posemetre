<script lang="ts">
  import { tick, onMount } from 'svelte';
  import OuverturesSimulator from './lib/components/OuverturesSimulator.svelte';
  type Lesson = { id: string; short: string; title: string; kicker: string; image: string; insight: string; task: string; question: string; options: string[]; answer: number; feedback: string; action: string };
  const lessons: Lesson[] = [
    { id:'incident',short:'Incidente',title:'Mesurer la lumière incidente',kicker:'Mission 01 · la mesure indépendante du sujet',image:'/assets/incident.png',insight:'La mesure incidente évalue la lumière qui tombe sur le sujet, sans être influencée par sa couleur ou son vêtement.',task:'Place la cellule près du visage et oriente-la vers la source.',question:'Dans quelle direction regardent la cellule et la lumisphère du posemètre ?',options:['Vers le sujet','Vers la source de lumière','Vers l’appareil photo'],answer:1,feedback:'Exact. La cellule reçoit la lumière dans le même axe que le sujet : elle doit regarder la source.',action:'Régler en lumière continue · symbole soleil'},
    { id:'reflected',short:'Réfléchie',title:'Mesurer la lumière réfléchie',kicker:'Mission 02 · ce que voit l’appareil',image:'/assets/reflected.png',insight:'La mesure réfléchie relève uniquement la lumière qui rebondit sur le sujet vers la cellule.',task:'Place-toi du côté de l’appareil, vise le sujet et évite de viser la source.',question:'Que mesure-t-on ici ?',options:['La source directement','La lumière renvoyée par le sujet','La lumière derrière le sujet'],answer:1,feedback:'Bien vu. La lumière réfléchie dépend de l’albédo : un sujet clair et un sujet sombre ne renvoient pas la même quantité.',action:'Régler le mode réfléchi puis viser le sujet'},
    { id:'albedo',short:'Albédo',title:'Comprendre l’albédo',kicker:'Mission 03 · un même éclairage, des lectures différentes',image:'/assets/albedo.png',insight:'Un sujet clair renvoie davantage de lumière qu’un sujet sombre. En mesure réfléchie, la lecture change donc avec le sujet.',task:'Compare les lectures des quatre sujets sous le même éclairage.',question:'Quel sujet donne la lecture la plus élevée en lumière réfléchie ?',options:['Sujet clair / vêtement clair','Sujet moyen','Sujet sombre / vêtement sombre'],answer:0,feedback:'Oui. Plus l’albédo est élevé, plus la cellule reçoit de lumière réfléchie.',action:'Ne confonds pas lecture réfléchie et lumière réellement reçue'},
    { id:'conditions',short:'Conditions',title:'Préparer une mesure fiable',kicker:'Mission 04 · cinq repères avant de déclencher',image:'/assets/conditions.png',insight:'Réglage continu, bon type de mesure, sphère orientée vers la source, proximité de la zone et recherche du climax : ce sont les cinq repères.',task:'Cherche la zone la plus éclairée, sans toucher le sujet.',question:'Où placer la cellule pour une mesure précise ?',options:['Au plus près de la zone à mesurer','À côté de l’appareil, quelle que soit la scène','Face au fond'],answer:0,feedback:'C’est cela. On mesure au plus près de la zone voulue, idéalement à l’emplacement du sujet.',action:'Préparer la cellule avant toute lecture'},
    { id:'climax',short:'Climax',title:'Protéger la zone-climax',kicker:'Mission 05 · préserver les hautes lumières',image:'/assets/climax.png',insight:'Le climax est la zone la plus proche de la source et la plus éclairée : cheveux, front ou haut du visage dans ce cas.',task:'Mesure la partie haute éclairée avant de reporter les valeurs sur l’appareil.',question:'Pourquoi mesure-t-on le climax ?',options:['Pour rendre les ombres noires','Pour conserver du détail dans les hautes lumières','Pour augmenter automatiquement l’ISO'],answer:1,feedback:'Parfait. La mesure au climax sert à éviter de brûler les zones lumineuses importantes.',action:'Relever vitesse, ouverture et ISO au point le plus éclairé'},
    { id:'sphere',short:'Lumisphère',title:'Sortie ou rentrée ?',kicker:'Mission 06 · choisir l’information utile',image:'/assets/sphere.png',insight:'Lumisphère sortie : lumière incidente à 180°, utile pour l’ambiance et les contrastes. Rentrée : mesure directionnelle d’une source.',task:'Choisis la position qui correspond à une source studio unique.',question:'Avec une source principale unique, quelle position aide à isoler sa contribution ?',options:['Lumisphère sortie','Lumisphère rentrée','La position ne change rien'],answer:1,feedback:'Exact. La lumisphère rentrée mesure la lumière qui arrive directement sur la cellule : pratique pour isoler une source.',action:'Adapter la lumisphère à l’intention de mesure'},
    { id:'values',short:'Valeurs',title:'Lire et ajuster les valeurs',kicker:'Mission 07 · transformer la mesure en exposition',image:'/assets/values.png',insight:'La cellule affiche un couple vitesse / ouverture pour un ISO donné. Les tiers de diaphragme permettent un réglage précis.',task:'La cellule indique 1/125 · f/5.6 · ISO 100 : reporte ce trio sur l’appareil.',question:'Pour passer de f/8 à f/4, que fais-tu ?',options:['Tu retires 4 tiers de diaphragme','Tu ajoutes 4 tiers de diaphragme','Tu ne changes rien'],answer:0,feedback:'Oui. f/4 laisse entrer davantage de lumière que f/8 : cela correspond à 4 tiers de diaphragme.',action:'Mission terminée · régler l’appareil et déclencher'}
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
  const albedoScenes=[
    {file:'albedo-mugs-v2.png',tones:{camera:'dark',subject:'clear',source:'neutral'}},
    {file:'albedo-shirts-v2.png',tones:{camera:'neutral',subject:'dark',source:'clear'}},
    {file:'albedo-sneakers-v2.png',tones:{camera:'clear',subject:'dark',source:'neutral'}},
    {file:'albedo-books-v2.png',tones:{camera:'dark',subject:'neutral',source:'clear'}},
    {file:'albedo-plants.png',tones:{camera:'clear',subject:'neutral',source:'dark'}},
    {file:'albedo-lamps.png',tones:{camera:'clear',subject:'neutral',source:'dark'}}
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
  type AnswerResult={selected:number|null;correct:boolean|null};
  let current=0, selected:number|null=null, answered=false, configured=false, configChoice:string|null=null, attempts=0, score=0, done=new Set<number>(), showGuide=true, started=false, showResults=false, answerResults:Record<number,AnswerResult>={}, referenceEl:HTMLDetailsElement, albedoSceneIndex=0, albedoQuestionIndex=0, sphereScenarioIndex=Math.floor(Math.random()*sphereScenarios.length), apertureRun=0, zoomSrc:string|null=null, hoverZone:string|null=null, meterFollowed=false, meterLocked=false, apertureDone:Record<'subie'|'choisie',boolean>={subie:false,choisie:false}, touchDevice=false;
  const CLIMAX_ZONES: Record<string, [number, number][]> = {
    subject: [[51,4],[58,3],[61,8],[62,16],[60,23],[56,22],[51,17],[49,10]],
    f1: [[0,7],[10,5],[21,7],[32,5],[42,1],[51,0],[49,10],[44,18],[40,29],[37,42],[34,55],[30,70],[25,82],[15,91],[5,98],[0,98]],
    f2: [[51,5],[58,4],[61,9],[62,17],[61,27],[64,35],[63,46],[60,56],[57,67],[49,73],[40,72],[34,63],[31,52],[33,42],[39,31],[43,20],[47,11]],
    f3: [[65,0],[100,0],[100,100],[65,100],[62,72],[67,53],[64,31]]
  };
  function closeZoom(){zoomSrc=null}
  function zoneId(el:Element){return el.classList.contains('subject-zone')?'subject':el.classList.contains('f1')?'f1':el.classList.contains('f2')?'f2':el.classList.contains('f3')?'f3':null}
  function lockMeterTo(selector:string){
    const scene=document.querySelector('.scene') as HTMLElement|null;
    const token=document.querySelector('.meter-token') as HTMLElement|null;
    const zone=scene?scene.querySelector(selector):null;
    if(!scene||!token||!zone)return;
    const s=scene.getBoundingClientRect(), z=zone.getBoundingClientRect();
    const tw=token.offsetWidth||116, th=token.offsetHeight||122;
    token.style.left=(z.left-s.left+(z.width-tw)/2)+'px';
    token.style.top=(z.top-s.top+(z.height-th)/2)+'px';
    token.style.pointerEvents='';
    meterLocked=true;meterFollowed=true;hoverZone=null;
  }
  function resetMeterFollow(){
    hoverZone=null;meterLocked=false;
    if(!meterFollowed)return;
    meterFollowed=false;
    const token=document.querySelector('.meter-token') as HTMLElement|null;
    if(token){token.style.left='';token.style.top='';token.style.pointerEvents=''}
  }
  function updateZonePeek(e:PointerEvent){
    if(lesson.id!=='climax'){resetMeterFollow();return}
    if(meterLocked){hoverZone=null;return}
    const scene=document.querySelector('.scene') as HTMLElement|null;
    const token=document.querySelector('.meter-token') as HTMLElement|null;
    if(!scene||!token){hoverZone=null;return}
    const s=scene.getBoundingClientRect();
    if(e.clientX<s.left||e.clientX>s.right||e.clientY<s.top||e.clientY>s.bottom){resetMeterFollow();return}
    meterFollowed=true;
    const tw=token.offsetWidth||116, th=token.offsetHeight||122;
    token.style.left=Math.min(Math.max(e.clientX-s.left-tw/2,0),Math.max(0,s.width-tw))+'px';
    token.style.top=Math.min(Math.max(e.clientY-s.top-th/2-16,0),Math.max(0,s.height-th))+'px';
    const x=((e.clientX-s.left)/s.width)*100, y=((e.clientY-s.top)/s.height)*100;
    const found=Object.entries(CLIMAX_ZONES).find(([,points])=>{
      let inside=false;
      for(let i=0,j=points.length-1;i<points.length;j=i++){
        const [xi,yi]=points[i], [xj,yj]=points[j];
        if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)inside=!inside;
      }
      return inside;
    })?.[0]??null;
    hoverZone=found;
    token.style.pointerEvents=found?'none':'';
  }
  function onWindowKeydown(e:KeyboardEvent){if(e.key==='Escape'&&zoomSrc)closeZoom()}
  $: if(typeof document!=='undefined'&&lesson&&lesson.image)queueMicrotask(()=>{const im=new Image();im.src=lesson.image;im.decode().catch(()=>{})})
  $: wrongHint=ZONE_HINTS[configChoice||'']||'En lumière incidente avec le posemètre, la mesure ne se prend pas sur cette zone. Réessayez !'; $: lesson=lessons[current]; $: progress=Math.round((done.size/lessons.length)*100); $: sceneImage=lesson.id==='reflected'?'/assets/reflected-interactive-scene.png':lesson.id==='albedo'?`/assets/${albedoScenes[albedoSceneIndex].file}`:lesson.id==='conditions'?'/assets/conditions-interactive-scene.png':lesson.id==='climax'?'/assets/climax-interactive-scene.png':lesson.id==='sphere'?'/assets/lumisphere-interactive-scene.png':'/assets/studio-game-scene-v2.png'; $: albedoSelected=lesson.id==='albedo'&&configChoice?albedoScenes[albedoSceneIndex].tones[configChoice as keyof typeof albedoScenes[number]['tones']]||'':''; $: if(typeof document!=='undefined'){document.documentElement.style.setProperty('--interactive-scene',`url('${sceneImage}')`);document.documentElement.dataset.lesson=lesson.id;document.documentElement.dataset.albedoQuestion=String(albedoQuestionIndex);document.documentElement.dataset.albedoSelected=albedoSelected;document.documentElement.dataset.configured=String(configured);document.documentElement.dataset.missionDone=String(done.has(current));document.documentElement.dataset.started=String(started);document.documentElement.dataset.zoom=String(!!zoomSrc)}
  $: if(typeof document!=='undefined')document.documentElement.dataset.sphereScenario=sphereScenarios[sphereScenarioIndex].id;
  $: if(typeof document!=='undefined')document.documentElement.dataset.results=String(showResults);
  $: if(typeof document!=='undefined'&&sceneImage){const displayedScene=sceneImage;requestAnimationFrame(()=>document.documentElement.style.setProperty('--interactive-scene',`url('${assetUrl(displayedScene)}')`))}
  $: if(typeof document!=='undefined')queueMicrotask(()=>{
    document.documentElement.dataset.meterPlaced=String(configured);
    document.querySelectorAll<HTMLElement>('.meter-token,.meter-placed').forEach((meter)=>{
      meter.style.backgroundImage=`url('${assetUrl('/assets/posemetre-draggable.png')}')`;
    });
  });
  $: if(typeof document!=='undefined')queueMicrotask(()=>{const counter=document.querySelector('.points');if(counter)counter.textContent=`✦ ${score} / ${lessons.length} ${score===1?'point':'points'}`});
  $: if(typeof document!=='undefined'&&started&&lesson.id==='conditions')queueMicrotask(()=>{const scene=document.querySelector('.scene');if(!scene)return;scene.querySelector('.conditions-zones')?.remove();const zones=document.createElement('div');zones.className='conditions-zones';[['camera','Appareil'],['meter','Posemètre'],['dome','Lumisphère'],['softbox','Source'],['mug','Tasse']].forEach(([id,label])=>{const button=document.createElement('button');button.className=`condition-zone ${id}`;button.setAttribute('aria-label',label);button.onclick=()=>conditionClick(id);zones.append(button)});scene.append(zones)});
  $: if(typeof document!=='undefined'&&lesson.id!=='conditions')queueMicrotask(()=>document.querySelector('.conditions-zones')?.remove());
  $: if(typeof document!=='undefined'&&started&&lesson.id==='sphere')queueMicrotask(()=>{const scene=document.querySelector('.scene');if(!scene)return;scene.querySelector('.sphere-zones')?.remove();const zones=document.createElement('div');zones.className='sphere-zones';[['sortie','Lumisphère sortie'],['rentree','Lumisphère rentrée']].forEach(([id,label])=>{const button=document.createElement('button');button.className=`sphere-zone ${id}`;button.setAttribute('aria-label',label);button.onclick=()=>sphereClick(id);zones.append(button)});scene.append(zones)});
  $: if(typeof document!=='undefined'&&lesson.id!=='sphere')queueMicrotask(()=>document.querySelector('.sphere-zones')?.remove());
  function choose(index:number){if(answered)return;selected=index;answered=true;const correct=index===lesson.answer;answerResults={...answerResults,[current]:{selected:index,correct}};if(correct){done=new Set(done).add(current);score+=1}}
  async function openMemo(){await tick();if(referenceEl){referenceEl.open=true;referenceEl.scrollIntoView({behavior:'smooth',block:'start'})}}
  function randomizeAlbedo(){albedoSceneIndex=Math.floor(Math.random()*albedoScenes.length);albedoQuestionIndex=Math.floor(Math.random()*albedoQuestions.length)}
  function dropMeter(zone:string){if(configured||attempts>=2)return;const expected=lesson.id==='albedo'?albedoQuestions[albedoQuestionIndex].answer:dropTargets[lesson.id];configChoice=zone;const choice=lesson.id==='albedo'?albedoScenes[albedoSceneIndex].tones[zone as keyof typeof albedoScenes[number]['tones']]:zone;if(choice===expected){configured=true;if(lesson.id==='climax'&&zone==='subject')lockMeterTo('.subject-zone');openMemo();return}attempts+=1;if(attempts===2)openMemo()}
  function conditionClick(item:string){if(configured||attempts>=2)return;configChoice=item;if(item==='meter'){configured=true;openMemo();return}attempts+=1;if(attempts===2)openMemo()}
  function sphereClick(item:string){if(configured||attempts>=2)return;configChoice=item;if(item===sphereScenarios[sphereScenarioIndex].answer){configured=true;openMemo();return}attempts+=1;if(attempts===2)openMemo()}
  const GUIDE_TEXTS:Record<string,string>={albedo:"La fiche mémo de la mission détaille la réflectance d’un sujet.",conditions:"La fiche mémo de la mission détaille les conditions préalables à une bonne mesure.",climax:"La fiche mémo de la mission détaille la mesure au climax.",sphere:"La fiche mémo de la mission détaille l’utilisation de la lumisphère.",values:"La fiche mémo de la mission détaille l’ajustement des valeurs d’une mesure."};
  const STAGE_TEXTS:Record<string,string>={incident:'Mise en situation · glisser déposer',reflected:'Mise en situation · glisser déposer',climax:'Mise en situation · glisser déposer',albedo:'Mise en situation · cliquer sur l’objet',conditions:'Mise en situation · cliquer sur l’objet',sphere:'Mise en situation · cliquer sur la source',values:'Mise en situation · cliquer sur l’ouverture'};
  const STAGE_TEXTS_TOUCH:Record<string,string>={incident:'Mise en situation · cliquer sur la zone',reflected:'Mise en situation · cliquer sur la zone',climax:'Mise en situation · toucher le visuel'};
  STAGE_TEXTS.sphere='Mise en situation · cliquer sur un posemètre';
  function readDeviceMode(){touchDevice=typeof matchMedia!=='undefined'&&matchMedia('(max-width:600px), (hover:none)').matches}
  const warmedVisuals=new Set<string>();
  function sceneSources(id:string){
    if(id==='albedo')return albedoScenes.map(({file})=>`/assets/${file}`);
    if(id==='reflected')return ['/assets/reflected-interactive-scene.png'];
    if(id==='conditions')return ['/assets/conditions-interactive-scene.png'];
    if(id==='climax')return ['/assets/climax-interactive-scene.png'];
    if(id==='sphere')return ['/assets/lumisphere-interactive-scene.png'];
    return id==='values'?[]:['/assets/studio-game-scene-v2.png'];
  }
  function warmVisual(src:string){
    if(warmedVisuals.has(src))return;
    warmedVisuals.add(src);
    const image=new Image();
    image.src=src;
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
  onMount(()=>{readDeviceMode();window.addEventListener('resize',readDeviceMode);return()=>window.removeEventListener('resize',readDeviceMode)});
  $: if(started&&lesson)preloadNextVisuals();
  $: guideCopy=GUIDE_TEXTS[lesson.id]??'La fiche mémo de la mission détaille le placement du posemètre et la direction de la mesure.';
  $: stageCopy=STAGE_TEXTS_TOUCH[lesson.id]&&touchDevice?STAGE_TEXTS_TOUCH[lesson.id]:STAGE_TEXTS[lesson.id]??'Mise en situation · glisser déposer';
  $: coachTaskCopy=!configured?'Réalise d’abord toutes les missions':lesson.id!=='values'?lesson.task:apertureDone.subie&&apertureDone.choisie?"Les deux corrections d’ouverture sont validées. Réponds à la question pour consolider ta compétence.":apertureDone.subie?"Lumière subie validée. Reprends le même réglage en mode « Lumière choisie » pour comparer l’autre correction d’ouverture.":"Lumière choisie validée. Reprends le même réglage en mode « Lumière subie » pour préserver les hautes lumières.";
  $: coachActionCopy=!configured?'Le défi se débloque après le bon réglage':lesson.id!=='values'?lesson.action:apertureDone.subie&&apertureDone.choisie?lesson.action:apertureDone.subie?'Reste en mode Lumière choisie':'Reste en mode Lumière subie';
  $: if(lesson.id==='sphere'){coachTaskCopy=sphereScenarios[sphereScenarioIndex].coachTask;coachActionCopy=sphereScenarios[sphereScenarioIndex].coachAction}
  function apertureRight(mode:'subie'|'choisie'){if(apertureDone[mode])return;apertureDone={...apertureDone,[mode]:true};if(!configured&&apertureDone.subie&&apertureDone.choisie)configured=true;openMemo()}
  function apertureWrong(){if(configured||attempts>=2)return;attempts+=1;if(attempts===2)openMemo()}
  function randomizeSphere(){sphereScenarioIndex=Math.floor(Math.random()*sphereScenarios.length)}
  function resetAttempts(){configured=false;configChoice=null;attempts=0;apertureRun+=1;if(referenceEl)referenceEl.open=false;if(lesson.id==='albedo')randomizeAlbedo();if(lesson.id==='sphere')randomizeSphere();apertureDone={subie:false,choisie:false};resetMeterFollow()}
  $: correctAnswers=Object.values(answerResults).filter((result)=>result.correct).length;
  $: revisionLessons=lessons.filter((_,index)=>answerResults[index]?.correct!==true);
  function move(index:number){showResults=false;current=index;selected=null;answered=false;configured=false;configChoice=null;attempts=0;if(referenceEl)referenceEl.open=false;if(lessons[index].id==='albedo')randomizeAlbedo();if(lessons[index].id==='sphere')randomizeSphere();apertureDone={subie:false,choisie:false};resetMeterFollow()}
  function finishCourse(){showResults=true;window.scrollTo({top:0,behavior:'smooth'})}
  function restartCourse(){answerResults={};score=0;done=new Set();move(0)}
  function next(){if(current===lessons.length-1)finishCourse();else move(current+1)}
</script>
<style>
  :global(:root[data-lesson='values'][data-results='false']) .next{font-size:0}:global(:root[data-lesson='values'][data-results='false']) .next::before{content:'Voir mon bilan';font-size:.86rem}:global(:root[data-lesson='values'][data-results='false']) .next span{font-size:1rem}
  :global(:root[data-results='true']) .lesson-grid{display:none}.results-panel{max-width:960px;margin:35px auto 0;padding:clamp(24px,4vw,48px);border:1px solid #52646b;border-radius:22px;background:linear-gradient(145deg,#13242b,#0c171c);box-shadow:0 24px 70px #0006}.results-panel h1{margin:9px 0 14px;font-family:Outfit,sans-serif;font-size:clamp(2.5rem,5vw,4.5rem);line-height:.95;letter-spacing:-.055em}.results-intro{max-width:720px;margin:0;color:#cbd9da;font-size:1.02rem;line-height:1.5}.results-score{display:inline-grid;gap:2px;margin:27px 0 20px;padding:18px 23px;border:1px solid #765d28;border-radius:16px;background:#241e10}.results-score b{color:#ffd15a;font:800 clamp(2.3rem,5vw,4rem)/.9 Outfit,sans-serif}.results-score b small{font-size:.48em}.results-score span{color:#e8d8a4;font-size:.72rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase}.revision-summary{margin:0 0 25px;padding:15px 18px;border-left:3px solid #e9b745;border-radius:0 12px 12px 0;background:#282112;color:#eadfbe}.revision-summary.success{border-color:#80bc8d;background:#183027;color:#d2ebd6}.revision-summary p{margin:5px 0 0}.results-list{display:grid;gap:13px}.result-card{display:grid;grid-template-columns:1fr auto;gap:10px 18px;padding:18px;border:1px solid #42545b;border-radius:14px;background:#101c21}.result-card.correct{border-color:#4d8060}.result-card.needs-review{border-color:#80624b}.result-card h2{margin:4px 0 0;font:700 1.15rem/1.1 Outfit,sans-serif}.result-card p{grid-column:1/-1;margin:0;color:#c7d4d5;font-size:.87rem;line-height:1.45}.result-card p b{color:#f3d88a}.result-status{align-self:start;padding:6px 9px;border-radius:99px;background:#253a42;color:#d4e2e3;font-size:.72rem;font-weight:800;white-space:nowrap}.correct .result-status{background:#193527;color:#c6efcd}.needs-review .result-status{background:#3a2b20;color:#f2c184}.result-feedback{padding-top:8px;border-top:1px solid #34464c}.review-button{justify-self:start;padding:8px 11px;border:1px solid #687b80;border-radius:8px;background:#1a2b31;color:#edf4f2;font-size:.78rem;font-weight:800}.restart{max-width:310px;margin-top:25px}:global(.coach){position:sticky;top:24px;max-height:calc(100dvh - 48px);overflow:auto}:global(.guide){z-index:90}@media(max-width:900px){:global(.coach){position:static;max-height:none;overflow:visible}.results-panel{margin-top:24px}}@media(max-width:600px){.result-card{grid-template-columns:1fr}.result-status{justify-self:start}.results-panel{padding:24px 18px}}
</style>
<svelte:window onkeydown={onWindowKeydown} onpointermove={updateZonePeek} /><svelte:head><title>Posemètre · Atelier lumière</title><meta name="description" content="Un module eLearning interactif sur le posemètre et le flashmètre." /></svelte:head>
{#if !started}<section class="intro" aria-label="Présentation du module"><div class="intro-panel"><span class="eyebrow">Module eLearning · photographie</span><h1>Le posemètre/<em>flashmètre</em></h1><p class="intro-objective"><b>Objectif</b> Apprendre à manipuler le posemètre/flashmètre pour mesurer la lumière dans des mises en situations pratiques.</p><div class="intro-skills"><h2>À la fin du module, vous serez capable de :</h2><ul><li>Distinguer les différentes mesures</li><li>Différencier l’albédo et la réflectance des sujets</li><li>Différencier la mesure au climax des reflets d’éclairage</li><li>Positionner la lumisphère selon les types d’environnements</li><li>Distinguer les valeurs affichées par la cellule</li></ul></div><p class="intro-method"><b>Missions</b> Observer, manipuler, répondre ; deux essais par situation.</p><button class="intro-start" onclick={()=>started=true}>Commencer la mission <span>→</span></button></div></section>{/if}
<main>
  <aside class="rail" aria-label="Parcours"><div class="brand"><span>◐</span><b>Atelier<br />lumière</b></div><nav>{#each lessons as item,i}<button class:active={i===current} class:visited={done.has(i)} onclick={()=>move(i)} aria-label={`Mission ${i+1} : ${item.short}`}><span>{done.has(i)?'✓':i+1}</span><small>{item.short}</small></button>{/each}</nav><button class="guide-trigger" onclick={()=>showGuide=!showGuide} aria-expanded={showGuide}>?</button></aside>
  <section class="workspace"><header><div><span class="eyebrow">{showResults?'Bilan de parcours':lesson.kicker}</span><strong>Posemètre / flashmètre</strong></div><div class="score"><span>Progression</span><b>{showResults?'100%':progress+'%'}</b><div class="bar"><i style={`width:${showResults?100:progress}%`}></i></div></div><div class="points">✦ {score} / {lessons.length} justes</div></header>
    {#if showResults}<section class="results-panel" aria-labelledby="results-title"><span class="eyebrow">Parcours terminé</span><h1 id="results-title">Votre bilan lumière</h1><p class="results-intro">Vous avez obtenu <b>{correctAnswers} réponse{correctAnswers>1?'s':''} juste{correctAnswers>1?'s':''}</b> sur {lessons.length}. Retrouvez ci-dessous vos réponses et les notions à consolider.</p><div class="results-score"><b>{correctAnswers}<small>/{lessons.length}</small></b><span>réponses justes</span></div>{#if revisionLessons.length}<div class="revision-summary"><b>À réviser en priorité</b><p>{revisionLessons.map((item)=>item.short).join(' · ')}</p></div>{:else}<div class="revision-summary success"><b>Parcours parfaitement maîtrisé</b><p>Toutes vos réponses sont justes. Bravo !</p></div>{/if}<div class="results-list">{#each lessons as item,i}<article class:correct={answerResults[i]?.correct===true} class:needs-review={answerResults[i]?.correct!==true} class="result-card"><div><span class="chapter">Mission {String(i+1).padStart(2,'0')}</span><h2>{item.title}</h2></div><span class="result-status">{answerResults[i]?.correct===true?'✓ Acquis':'↗ À revoir'}</span><p><b>Votre réponse :</b> {answerResults[i]?.selected===undefined||answerResults[i]?.selected===null?'Non répondue':item.options[answerResults[i].selected!]}</p>{#if answerResults[i]?.correct!==true}<p><b>Réponse attendue :</b> {item.options[item.answer]}</p>{/if}<p class="result-feedback">{answerResults[i]?.correct===true?item.feedback:item.insight}</p>{#if answerResults[i]?.correct!==true}<button class="review-button" onclick={()=>move(i)}>Revoir cette mission →</button>{/if}</article>{/each}</div><button class="next restart" onclick={restartCourse}>Recommencer le parcours <span>↻</span></button></section>{/if}
    <div class="lesson-grid"><section class="content"><div class="title-row"><div><span class="chapter">{String(current+1).padStart(2,'0')}</span><h1>{lesson.title}</h1></div><span class="status">{done.has(current)?'Mission validée':'En exploration'}</span></div><section class="stage photo-stage" style={`background-image:linear-gradient(90deg,#0d171bdd,#0d171b44),url('${lesson.image}')`}><div class="stage-top"><span class="eyebrow">{stageCopy}</span><div class="attempt-control"><span class="attempt-counter">Essais {attempts}/2</span>{#if attempts>=2&&!configured}<button class="retry-button" onclick={resetAttempts}>↻ Réessayer</button>{:else}<span class:ready={configured} class="live">{configured?'Mesure validée':'À vous de jouer'}</span>{/if}</div></div><p class="drag-instruction">{activities[lesson.id].prompt}</p><div class="scene" aria-label="Scène de prise de vue">{#if lesson.id==='values'}{#key apertureRun}<OuverturesSimulator validated={configured} exhausted={attempts>=2&&!configured} oncorrect={apertureRight} onwrong={apertureWrong} />{/key}{:else}<span class="ray ray-one"></span><span class="ray ray-two"></span>{#if lesson.id!=='climax'}<button class="drop-zone source-zone" class:target={dropTargets[lesson.id]==='source'} class:hit={configChoice==='source'} ondragover={(e)=>e.preventDefault()} ondrop={(e)=>{e.preventDefault();dropMeter('source')}} onclick={()=>dropMeter('source')}><b>☀</b><small>Source</small></button>{/if}<button class="drop-zone subject-zone" class:peek={hoverZone==='subject'} class:target={dropTargets[lesson.id]==='subject'} class:hit={configChoice==='subject'} ondragover={(e)=>e.preventDefault()} ondrop={(e)=>{e.preventDefault();dropMeter('subject')}} onclick={()=>dropMeter('subject')}><b>●</b><small>{lesson.id==='climax'?'Climax':'Sujet'}</small></button>{#if lesson.id==='climax'}<button class="drop-zone false-zone f1" class:peek={hoverZone==='f1'} class:hit={configChoice==='f1'} ondragover={(e)=>e.preventDefault()} ondrop={(e)=>{e.preventDefault();dropMeter('f1')}} onclick={()=>dropMeter('f1')}><small>Cheveux</small></button><button class="drop-zone false-zone f2" class:peek={hoverZone==='f2'} class:hit={configChoice==='f2'} ondragover={(e)=>e.preventDefault()} ondrop={(e)=>{e.preventDefault();dropMeter('f2')}} onclick={()=>dropMeter('f2')}><small>Visage</small></button><button class="drop-zone false-zone f3" class:peek={hoverZone==='f3'} class:hit={configChoice==='f3'} ondragover={(e)=>e.preventDefault()} ondrop={(e)=>{e.preventDefault();dropMeter('f3')}} onclick={()=>dropMeter('f3')}><small>Paysage</small></button>{/if}<button class="drop-zone climax-zone" class:target={dropTargets[lesson.id]==='climax'} class:hit={configChoice==='climax'} ondragover={(e)=>e.preventDefault()} ondrop={(e)=>{e.preventDefault();dropMeter('climax')}} onclick={()=>dropMeter('climax')}><b>✦</b><small>Climax</small></button>{#if lesson.id!=='climax'}<button class="drop-zone camera-zone" class:target={dropTargets[lesson.id]==='camera'} class:hit={configChoice==='camera'} ondragover={(e)=>e.preventDefault()} ondrop={(e)=>{e.preventDefault();dropMeter('camera')}} onclick={()=>dropMeter('camera')}><b>▣</b><small>Appareil</small></button>{/if}{#if !configured}<div class="meter-token" class:following={meterFollowed} draggable="true" ondragstart={(e)=>e.dataTransfer?.setData('text/plain','meter')}><span>◉</span><small>Glissez le posemètre</small></div>{:else}<div class="meter-placed">◉ <span>posemètre placé</span></div>{/if}{/if}</div><p class="tap-hint">{attempts>=2&&!configured?'Deux essais effectués : le mémo est ouvert pour vous guider.':lesson.id==='values'?'Cliquer sur la bonne ouverture de l’appareil ?':'Glissez le posemètre vers la zone à mesurer — sur mobile, touchez une zone.'}</p>{#if configChoice!==null}<div class:success={configured} class:final-attempt={attempts>=2&&!configured} class="feedback"><b>{configured?'Bonne mesure.':attempts>=2?'Deux essais effectués.':'Mauvais choix'}</b><p>{configured?activities[lesson.id].feedback:attempts>=2?'Consultez le mémo visuel ouvert juste en dessous pour comprendre la bonne mesure.':wrongHint}</p>{#if attempts>=2&&!configured}<button class="memo-link" onclick={openMemo}>↓ Consulter le mémo visuel</button>{/if}</div>{/if}</section><details bind:this={referenceEl} class:attention={attempts>=2&&!configured} class="reference"><summary>Voir le mémo visuel de cette mission</summary><button class="memo-zoom" onclick={()=>zoomSrc=lesson.image} aria-label="Agrandir la planche de la mission"><img src={lesson.image} alt="Planche explicative de la mission" /></button></details><div class="insight"><span>✦</span><p>{lesson.insight}</p></div></section>
      <aside class="coach"><div class="coach-head"><span class="orb">◉</span><div><span class="eyebrow">Coach lumière</span><strong>On avance pas à pas.</strong></div></div><div class="task"><span>À faire maintenant</span><p>{coachTaskCopy}</p><b>{coachActionCopy}</b></div><section class:locked={!configured} class="quiz" aria-live="polite"><span class="eyebrow">Défi dans l’action</span><h2>{lesson.question}</h2><div class="answers">{#each lesson.options as option,i}<button class:correct={answered&&i===lesson.answer} class:wrong={answered&&selected===i&&i!==lesson.answer} onclick={()=>choose(i)} disabled={answered||!configured}><span>{String.fromCharCode(65+i)}</span>{option}</button>{/each}</div>{#if !configured}<p class="lock-note">Débloquez d’abord la situation à gauche.</p>{/if}{#if answered}<div class:success={selected===lesson.answer} class="feedback"><b>{selected===lesson.answer?'Bien joué.':'Pas tout à fait.'}</b><p>{lesson.feedback}</p></div>{/if}</section><button class="next" onclick={next}>{current===lessons.length-1?'Recommencer le parcours':'Continuer la mission'} <span>→</span></button></aside></div>
  </section>
  {#if showGuide}<div class="guide"><button onclick={()=>showGuide=false} aria-label="Fermer">×</button><span class="eyebrow">Fiche mémo</span><b>Besoin d’un rappel ?</b><p>{guideCopy}</p><button class="guide-memo-link" onclick={openMemo}>↓ Voir la fiche mémo</button></div>{/if}
</main>
{#if zoomSrc}<div class="zoom-backdrop" role="dialog" aria-modal="true" aria-label="Planche agrandie"><button class="zoom-dismiss" onclick={closeZoom} aria-label="Fermer la planche agrandie"></button><img src={zoomSrc} alt="Planche explicative de la mission" /><button class="zoom-close" onclick={closeZoom} aria-label="Fermer">×</button></div>{/if}
