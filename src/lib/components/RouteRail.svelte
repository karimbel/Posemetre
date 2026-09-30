<script lang="ts">
  import { game, type SceneId } from '../gameStore.svelte';
  import { SCENES } from '../routes';
</script>

<nav aria-label="Compétences" class="rail">
  {#each SCENES as item}
    <button
      class:active={game.scene === item.id}
      onclick={() => game.setScene(item.id as SceneId)}
      aria-current={game.scene === item.id ? 'true' : undefined}
      aria-label={`Compétence ${item.id} : ${item.title}`}
    >
      <span aria-hidden="true">{item.id}</span>
      <small>{item.title}</small>
    </button>
  {/each}
</nav>
