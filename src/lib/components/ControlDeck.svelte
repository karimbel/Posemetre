<script lang="ts">
  import { game } from '../gameStore.svelte';
  import { ALBEDOS, BASE_CAMERA, MODE_LABEL, SPHERE_EFFECT, TONES, ilDelta } from '../exposure';
  import type { SphereState } from '../exposure';

  let confirmSphere: SphereState | null = $state(null);
  const hasMeasures = $derived(game.measuredCount > 0);
  const canMeasure = $derived(game.mode === 'reflected' || game.reflectionObserved);

  function askSphere(next: SphereState) {
    if (next === game.sphere) return;
    if (hasMeasures) confirmSphere = next;
    else game.setSphere(next);
  }

  function applySphere() {
    if (confirmSphere) game.setSphere(confirmSphere);
    confirmSphere = null;
  }
</script>

<aside class="control-deck" aria-label="Commandes du plateau">
  <section class="do-now" aria-label="Action recommandée">
    <span class="label">Une action maintenant</span>
    {#if game.nextAction.target.startsWith('card:')}
      {@const tone = game.pendingTone!}
      <button class="primary-action" onclick={() => game.measure(tone)}>
        Mesurer le carton {ALBEDOS[tone].label}
        <small>mesure {game.measuredCount + 1} sur 3</small>
      </button>
    {:else if game.nextAction.target === 'sphere'}
      <button class="primary-action" onclick={() => askSphere(game.sphere === 'out' ? 'in' : 'out')}>
        {game.nextAction.label}
        <small>les mesures actuelles seront remises à zéro</small>
      </button>
    {:else}
      <div class="action-done">{game.nextAction.label}</div>
    {/if}
  </section>

  <section class="deck-block">
    <span class="label">Posemètre · mode <b>{MODE_LABEL[game.mode]}</b></span>
    <div class="segmented" role="group" aria-label="Position de la lumisphère">
      <button
        class:chosen={game.sphere === 'out'}
        aria-pressed={game.sphere === 'out'}
        onclick={() => askSphere('out')}
      >
        <b>Sortie</b>
        <small>elle mesure ce que le carton renvoie</small>
      </button>
      <button
        class:chosen={game.sphere === 'in'}
        aria-pressed={game.sphere === 'in'}
        onclick={() => askSphere('in')}
      >
        <b>Rentrée</b>
        <small>elle mesure la lumière qui arrive</small>
      </button>
    </div>

    {#if confirmSphere}
      <div class="confirm" role="alertdialog" aria-label="Confirmer le changement de position">
        <p>Tes {game.measuredCount} mesures vont être effacées.</p>
        <div>
          <button class="ghost" onclick={() => (confirmSphere = null)}>Annuler</button>
          <button class="solid" onclick={applySphere}>Changer quand même</button>
        </div>
      </div>
    {:else}
      <p class="deck-note">Lumisphère {game.sphere === 'out' ? 'sortie' : 'rentrée'} : {SPHERE_EFFECT[game.sphere]}.</p>
    {/if}
  </section>

  <section class="deck-block">
    <span class="label">Cartons à mesurer</span>
    <div class="carton-pad">
      {#each TONES as tone}
        {@const value = game.readings[tone]}
        <button
          class="carton-btn"
          class:measured={value !== null}
          class:next={game.nextAction.target === `card:${tone}`}
          aria-pressed={game.selectedCard === tone}
          disabled={!canMeasure}
          onclick={() => game.measure(tone)}
        >
          <i style={`background:${ALBEDOS[tone].swatch}`} aria-hidden="true"></i>
          <span class="carton-name">{ALBEDOS[tone].label}</span>
          <b class="carton-value">{value === null ? 'à mesurer' : value.toFixed(1).replace('.', ',')}</b>
        </button>
      {/each}
    </div>
    <p class="deck-note">Le contour ambre indique le prochain carton. Les autres restent disponibles pour recommencer une mesure.</p>
  </section>

  <section class="deck-block">
    <span class="label">Boîtier <b>figé sur cette scène</b></span>
    <div class="camera-readout" aria-label="Réglage du boîtier, non modifiable ici">
      <b>f/{BASE_CAMERA.f}</b><b>{BASE_CAMERA.shutterLabel}</b><b>ISO {BASE_CAMERA.iso}</b>
    </div>
    <p class="deck-note">
      Le boîtier ne bouge pas : ce sont les mesures qui changent. Ton exposition vaut
      <b>{ilDelta(game.preview.error)}</b> par rapport à la bonne valeur.
    </p>
  </section>

  <section class="deck-block">
    <span class="label">Preview</span>
    <p class="preview-verdict">{game.preview.verdict}</p>
    <div class="preview-tags">
      <span>JPEG <b>{game.preview.jpeg}</b></span>
      <span>RAW <b>{game.preview.raw}</b></span>
    </div>
  </section>
</aside>
