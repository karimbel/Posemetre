<script lang="ts">
  import { onMount } from 'svelte';
  import Phaser from 'phaser';
  import { BasePlateauScene } from '../game/BasePlateauScene';
  import { game } from '../gameStore.svelte';

  let { inactive = false }: { inactive?: boolean } = $props();
  let host: HTMLDivElement;
  let phaser: Phaser.Game | undefined;
  let plateau: BasePlateauScene | undefined;

  onMount(() => {
    phaser = new Phaser.Game({
      type: Phaser.AUTO,
      parent: host,
      backgroundColor: 'transparent',
      transparent: true,
      scale: { mode: Phaser.Scale.RESIZE, width: '100%', height: '100%', autoCenter: Phaser.Scale.CENTER_BOTH },
      scene: [new BasePlateauScene(inactive)],
      render: { antialias: true, pixelArt: false }
    });
    phaser.events.once('ready', () => (plateau = phaser?.scene.getScene('plateau') as BasePlateauScene));
    return () => phaser?.destroy(true);
  });

  $effect(() => {
    game.sphere;
    game.readings;
    game.selectedCard;
    game.scene;
    game.unlocked;
    game.nextAction.target;
    queueMicrotask(() => plateau?.draw());
  });
</script>

<div class="canvas-shell" bind:this={host} aria-label="Plateau photo interactif"></div>
