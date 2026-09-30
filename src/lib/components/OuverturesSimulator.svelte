<script lang="ts">
  type Mode = 'subie' | 'choisie';

  let {
    validated = false,
    exhausted = false,
    oncorrect,
    onwrong
  }: {
    validated?: boolean;
    exhausted?: boolean;
    oncorrect?: (mode: Mode) => void;
    onwrong?: () => void;
  } = $props();

  const VALUES = ['2.8', '3.2', '4', '4.5', '5.6', '6.3', '7.1', '8', '9', '10', '11', '13', '14'];
  const REFERENCES: Record<Mode, string> = { subie: '8', choisie: '4' };
  const TARGETS: Record<Mode, string> = { subie: '4', choisie: '8' };
  const INSTRUCTIONS: Record<Mode, string> = {
    subie: 'Vous subissez la lumière, vous voulez préserver les hautes lumières.',
    choisie: 'Vous choisissez la lumière, vous visez un rendu plus lumineux.'
  };

  let mode = $state<Mode>('subie');
  let marks = $state<Record<string, 'correct' | 'wrong'>>({});
  let feedback = $state('');
  let tone = $state<'good' | 'bad' | ''>('');

  function pick(value: string) {
    const right = value === TARGETS[mode];
    marks = { ...marks, [value]: right ? 'correct' : 'wrong' };
    feedback = right
      ? 'Bon choix : vous avez appliqué la correction demandée.'
      : 'Pas encore : comparez la quantité de lumière que chaque ouverture laisse passer. La fiche mémo est à votre disposition si besoin.';
    tone = right ? 'good' : 'bad';
    if (validated) return;
    if (right) oncorrect?.(mode);
    else onwrong?.();
  }

  function setMode(next: Mode) {
    if (exhausted) return;
    mode = next;
    marks = {};
    feedback = '';
    tone = '';
  }
</script>

<div class="simulator">
  <p>La cellule indique <b>f/{REFERENCES[mode]}</b>. Quel réglage appliquez-vous ?</p>

  <div class="modes">
    <button class="mode" class:active={mode === 'subie'} onclick={() => setMode('subie')} disabled={exhausted}>
      Lumière subie<br /><small>préserver les hautes lumières</small>
    </button>
    <button class="mode" class:active={mode === 'choisie'} onclick={() => setMode('choisie')} disabled={exhausted}>
      Lumière choisie<br /><small>rendu plus lumineux</small>
    </button>
  </div>

  <div class="instruction">{INSTRUCTIONS[mode]}</div>

  <div class="scale">
    {#each VALUES as value (value)}
      <button
        class="stop"
        class:correct={marks[value] === 'correct'}
        class:wrong={marks[value] === 'wrong'}
        onclick={() => pick(value)}
        disabled={exhausted || value === REFERENCES[mode]}
      >f/{value}</button>
    {/each}
  </div>

  {#if feedback}
    <div class="feedback" class:good={tone === 'good'} class:bad={tone === 'bad'} aria-live="polite">{feedback}</div>
  {/if}
</div>

<style>
  .simulator {
    width: 100%;
    font-family: system-ui;
    background: #0b171b;
    color: #f7f4ec;
    border-radius: 20px;
    padding: 24px;
    max-width: 860px;
  }

  p {
    color: #c7d3d4;
  }

  p b {
    color: #fff;
  }

  .modes {
    display: flex;
    gap: 10px;
    margin: 20px 0;
  }

  .modes .mode {
    flex: 1;
    text-align: left;
  }

  .instruction {
    padding: 13px;
    background: #14252c;
    border-radius: 10px;
    color: #e9c45d;
  }

  .scale {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(54px, 1fr));
    gap: 6px;
    margin: 22px 0;
    white-space: nowrap;
  }

  .feedback {
    font-weight: 700;
  }

  .feedback.good {
    color: #a8df9b;
  }

  .feedback.bad {
    color: #ffc0b5;
  }

  .simulator button {
    font: inherit;
    cursor: pointer;
  }

  .simulator button:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  .mode {
    padding: 12px 15px;
    border: 1px solid #50656a;
    border-radius: 12px;
    background: #102025;
    color: #dce7e7;
  }

  .mode small {
    color: #9fb1b3;
  }

  .mode.active {
    background: #263722;
    border-color: #8cc57f;
    color: #fff;
  }

  .mode.active small {
    color: #bde3b6;
  }

  .stop {
    min-width: 54px;
    padding: 13px 8px;
    border: 1px solid #4d6165;
    border-radius: 9px;
    background: #122329;
    color: #f3f7f7;
    font-weight: 800;
  }

  .stop:hover {
    border-color: #efbd45;
  }

  .stop.correct {
    background: #244628;
    border-color: #89ce7c;
  }

  .stop.wrong {
    background: #4b2923;
    border-color: #ef7967;
  }
</style>
