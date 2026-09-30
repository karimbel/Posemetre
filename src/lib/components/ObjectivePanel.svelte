<script lang="ts">
  import { game } from '../gameStore.svelte';
  import { SCENES } from '../routes';
  import { ALBEDOS, TONES, stops } from '../exposure';

  const scene = $derived(SCENES[game.scene - 1]);
  const board = $derived(game.scoreboard);
</script>

<div class="objective-column">
<section class="objective" aria-label="Objectif de la scène">
  <header>
    <span class="eyebrow">Compétence 0{game.scene} · {scene.title}</span>
    <h1>{scene.goal}</h1>
    <p class="consigne">{scene.why}</p>
  </header>

  <div class="mode-card" class:incident={game.mode === 'incident'}>
    <span class="mode-icon" aria-hidden="true">{game.mode === 'incident' ? '☀' : '◐'}</span>
    <div>
      <span class="label">Tu mesures maintenant</span>
      <strong>{game.mode === 'incident' ? 'la lumière qui arrive' : 'ce que le carton renvoie'}</strong>
      <small>{game.mode === 'incident' ? 'posemètre ← source' : 'posemètre ← carton'}</small>
    </div>
  </div>

  <div class="scoreboard" class:met={board.met} aria-live="polite">
    <span class="label">Le but, en un coup d'œil</span>
    <ul class="slots">
      {#each TONES as tone}
        <li class:filled={game.readings[tone] !== null}>
          <i style={`background:${ALBEDOS[tone].swatch}`} aria-hidden="true"></i>
          <span>{ALBEDOS[tone].label}</span>
          <b>{game.readings[tone] === null ? '—' : stops(game.readings[tone]!)}</b>
        </li>
      {/each}
    </ul>
    <p class="verdict">{board.verdict}</p>
  </div>

  {#if game.scene === 1}
    <ol class="steps" aria-label="Étapes">
      {#each game.steps as step}
        <li class:done={step.done} class:active={game.activeStep?.id === step.id}>
          <span class="mark" aria-hidden="true">{step.done ? '✓' : ''}</span>
          <span class="step-label">{step.label}</span>
          {#if step.done}<span class="sr-only">terminé</span>{/if}
        </li>
      {/each}
    </ol>
  {/if}

  <div class="next" aria-live="polite">
    <span class="label">À toi de jouer</span>
    <strong>{game.nextAction.label}</strong>
    <p>{game.nextAction.reason}</p>
  </div>

  {#if game.erased}
    <p class="notice" role="status">Position changée : tes mesures précédentes ont été effacées. On repart de zéro, à ton rythme.</p>
  {/if}

  {#if game.insight}
    <p class="insight" role="status">{game.insight}</p>
  {/if}

  <div class="lock" class:open={game.unlocked} aria-live="polite">
    <span class="lock-mark" aria-hidden="true"></span>
    <div>
      <span class="lock-title">{game.unlocked ? 'Verrou ouvert' : 'Verrou fermé'}</span>
      <p>
        {#if game.unlocked}
          « J’ai une valeur incidente. Je sais si je la subis ou si je la choisis. Je sais ce que j’en fais. Je sais si c’est possible. »
        {:else}
          Le verrou s’ouvre après avoir montré les deux choses : le carton fait varier une mesure réfléchie ; la lumière donne une mesure incidente stable.
        {/if}
      </p>
    </div>
  </div>

  {#if game.unlocked}
    <button class="goto" onclick={() => game.setScene(2)}>Passer à la compétence 02</button>
  {/if}
</section>

<section class="readings" aria-label="Relevé des mesures">
  <span class="label">Relevé · position {game.sphere === 'in' ? 'rentrée' : 'sortie'}</span>
  <table>
    <caption class="sr-only">Valeur mesurée sur chaque carton</caption>
    <thead>
      <tr><th scope="col">Carton</th><th scope="col">Renvoie</th><th scope="col">Mesure</th></tr>
    </thead>
    <tbody>
      {#each TONES as tone}
        <tr class:pending={game.pendingTone === tone}>
          <th scope="row">
            <i style={`background:${ALBEDOS[tone].swatch}`} aria-hidden="true"></i>{ALBEDOS[tone].label}
          </th>
          <td>{ALBEDOS[tone].share}</td>
          <td>{game.readings[tone] === null ? '—' : stops(game.readings[tone]!)}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</section>
</div>
