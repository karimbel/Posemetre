<script lang="ts">
  import { game } from '../gameStore.svelte';
  import { MODE_LABEL, SPHERE_LABEL, stops } from '../exposure';
</script>

<header class="hud">
  <div class="hud-title">
    <span class="eyebrow">Posemètre · studio</span>
    <strong>Le plateau</strong>
  </div>

  <div class="hud-meter" aria-live="polite">
    <span class="hud-mode">{MODE_LABEL[game.mode]} · sphère {SPHERE_LABEL[game.sphere]}</span>
    <span class="hud-reading">
      {game.reading === null ? '—' : stops(game.reading)}
      <small>{game.reading === null ? 'aucune mesure' : game.selectedLabel.toLowerCase()}</small>
    </span>
  </div>

  <div class="hud-actions">
    <button
      class="icon-button"
      onclick={() => (game.soundMuted = !game.soundMuted)}
      aria-pressed={game.soundMuted}
    >
      {game.soundMuted ? 'Son coupé' : 'Son actif'}
    </button>
  </div>
</header>
