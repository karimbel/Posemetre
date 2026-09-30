<script lang="ts">
  import ObjectivePanel from './ObjectivePanel.svelte';
  import GameCanvas from './GameCanvas.svelte';
  import ControlDeck from './ControlDeck.svelte';
  import { game } from '../gameStore.svelte';
</script>

<div class="game-layout">
  <ObjectivePanel />
  <GameCanvas inactive />
  <ControlDeck />
</div>

<p class="stub-note">
  Le plateau est prêt pour cette scène. Les règles propres à cette compétence arrivent ici, sur le même posemètre.
</p>
