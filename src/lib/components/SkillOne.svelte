<script lang="ts">
  import ObjectivePanel from './ObjectivePanel.svelte';
  import GameCanvas from './GameCanvas.svelte';
  import ControlDeck from './ControlDeck.svelte';
  import { game } from '../gameStore.svelte';
</script>

<div class="game-layout">
  <ObjectivePanel />
  <GameCanvas />
  <ControlDeck />
</div>
