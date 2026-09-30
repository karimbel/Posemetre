import {
  ALBEDOS,
  SPHERE_LABEL,
  TONES,
  evFor,
  gaugeFor,
  previewFor,
  type CardTone,
  type GaugeState,
  type MeterMode,
  type PreviewState,
  type SphereState
} from './exposure';

export type SceneId = 1 | 2 | 3 | 4 | 5 | 6;
export type Lever = 'camera' | 'source';

export type Step = { id: string; label: string; done: boolean };
export type NextAction = { target: string; label: string; reason: string };

const emptyReadings = (): Record<CardTone, number | null> => ({ noir: null, gris: null, blanc: null });

class GameStore {
  scene = $state<SceneId>(1);
  /** Position physique de la domine. Source unique du mode : sphère rentrée = mesure incidente. */
  sphere = $state<SphereState>('out');
  selectedCard = $state<CardTone>('noir');
  activeLever = $state<Lever>('camera');
  readings = $state<Record<CardTone, number | null>>(emptyReadings());
  soundMuted = $state(false);
  /** Le verrou reste ouvert une fois acquis : explorer après ne retire rien. */
  unlocked = $state(false);
  /** Première observation obligatoire : constater que les cartons ne renvoient pas pareil. */
  reflectionObserved = $state(false);
  /** Vrai juste après un changement de position qui a effacé des mesures. */
  erased = $state(false);

  get mode(): MeterMode {
    return this.sphere === 'in' ? 'incident' : 'reflected';
  }

  get measuredCount() {
    return TONES.filter((tone) => this.readings[tone] !== null).length;
  }

  get complete() {
    return this.measuredCount === TONES.length;
  }

  get pendingTone(): CardTone | null {
    return TONES.find((tone) => this.readings[tone] === null) ?? null;
  }

  get measuredValues() {
    return TONES.map((tone) => this.readings[tone]).filter((value): value is number => value !== null);
  }

  get spread(): number | null {
    const values = this.measuredValues;
    if (values.length < 2) return null;
    return Number((Math.max(...values) - Math.min(...values)).toFixed(2));
  }

  get allSame() {
    const values = this.measuredValues;
    return values.length === TONES.length && new Set(values.map((value) => value.toFixed(2))).size === 1;
  }

  get preview(): PreviewState {
    return previewFor(this.readings[this.selectedCard]);
  }

  get gauge(): GaugeState {
    return gaugeFor(this.readings);
  }

  get selectedLabel() {
    return ALBEDOS[this.selectedCard].long;
  }

  get reading() {
    return this.readings[this.selectedCard];
  }

  /** Le constat à faire remarquer, ou null s'il n'y a rien de nouveau à voir. */
  get insight(): string | null {
    if (!this.complete) return null;
    if (this.mode === 'reflected') {
      return `Trois valeurs différentes alors que la lumière n’a pas bougé d’un cheveu. Ce n’est donc pas la lumière que tu as mesurée : c’est ce que chaque carton renvoie.`;
    }
    if (this.allSame) {
      return `Trois fois exactement la même valeur. La position rentrée mesure la lumière qui arrive, et elle ne s'occupe plus du carton que tu vises.`;
    }
    return null;
  }

  /** Vrai quand l'état gagnant est sous les yeux du joueur. */
  get winning() {
    return this.reflectionObserved && this.complete && this.mode === 'incident' && this.allSame;
  }

  /** Le but, et où tu en es par rapport à lui. Toujours affichable. */
  get scoreboard(): { values: string; met: boolean; verdict: string } {
    const values = TONES.map((tone) => this.readings[tone])
      .filter((value): value is number => value !== null)
      .map((value) => value.toFixed(1).replace('.', ','));
    const list = values.length ? values.join(' / ') : '—';
    if (!this.complete) {
      return {
        values: list,
        met: false,
        verdict: `${this.measuredCount} valeur${this.measuredCount > 1 ? 's' : ''} sur 3. Il en faut 3, et il faut qu'elles soient identiques.`
      };
    }
    if (this.winning) {
      return { values: list, met: true, verdict: `Même valeur sur les 3 cartons : tu mesures la lumière qui arrive. C’est une mesure incidente.` };
    }
    return { values: list, met: false, verdict: `Les valeurs changent avec le carton : tu mesures ce qu’il renvoie. C’est une mesure réfléchie.` };
  }

  get steps(): Step[] {
    if (this.scene !== 1) {
      return [{ id: 'stub', label: 'Règles de cette compétence en cours de pose', done: false }];
    }
    return [
      { id: 'out-measure', label: '1 · Mesure réfléchie : observe les 3 cartons', done: this.reflectionObserved },
      { id: 'in-measure', label: '2 · Mesure incidente : mesure la lumière qui arrive', done: this.winning }
    ];
  }

  get activeStep(): Step | undefined {
    return this.steps.find((step) => !step.done);
  }

  /** L'action unique à faire maintenant, et pourquoi. */
  get nextAction(): NextAction {
    if (this.scene !== 1) {
      return { target: 'none', label: 'Règles à poser', reason: 'Cette compétence attend ses règles sur le même plateau.' };
    }
    if (this.winning && this.unlocked) {
      return { target: 'done', label: 'Verrou ouvert', reason: 'Tu as trouvé la valeur qui décrit la lumière, pas le carton.' };
    }
    if (!this.reflectionObserved && this.mode === 'incident') {
      return {
        target: 'sphere',
        label: 'Passe en mesure réfléchie',
        reason: 'Commence par le carton : sa couleur doit changer la valeur lue.'
      };
    }
    if (this.reflectionObserved && this.mode === 'reflected') {
      return {
        target: 'sphere',
        label: 'Passe en mesure incidente',
        reason: 'Tu as vu l’effet du carton. Maintenant, regarde la lumière qui arrive sur lui.'
      };
    }
    const pending = this.pendingTone;
    if (pending) {
      return this.mode === 'reflected'
        ? {
            target: `card:${pending}`,
            label: `Touche le carton ${ALBEDOS[pending].label} pour le mesurer`,
            reason: `Lumisphère sortie : elle mesure ce que ce carton renvoie, soit ${ALBEDOS[pending].share} de ce qu’il reçoit.`
          }
        : {
            target: `card:${pending}`,
            label: `Touche le carton ${ALBEDOS[pending].label} pour le mesurer`,
            reason: 'Lumisphère rentrée : elle mesure la lumière qui arrive. Le carton n’a plus son mot à dire.'
          };
    }
    if (this.mode === 'reflected') {
      return {
        target: 'sphere',
        label: 'Pousse la lumisphère vers l’intérieur',
        reason: `Tu as 3 valeurs différentes (${this.scoreboard.values} IL) pour une seule et même lumière. Le but, c’est 3 fois la même : il faut donc changer de position.`
      };
    }
    return { target: 'done', label: 'Verrou ouvert', reason: 'Tu as mesuré la lumière qui arrive, pas le carton.' };
  }

  measure(tone: CardTone = this.selectedCard) {
    if (this.mode === 'incident' && !this.reflectionObserved) return;
    this.selectedCard = tone;
    this.readings[tone] = evFor(this.mode, tone);
    this.erased = false;
    if (this.mode === 'reflected' && this.measuredCount === TONES.length) this.reflectionObserved = true;
    if (this.winning) this.unlocked = true;
  }

  select(tone: CardTone) {
    this.selectedCard = tone;
  }

  /** Changer de position remet la tentative à zéro : on le dit, on ne le fait pas en silence. */
  setSphere(next: SphereState) {
    if (next === this.sphere) return;
    const hadMeasures = this.measuredCount > 0;
    this.sphere = next;
    this.readings = emptyReadings();
    this.erased = hadMeasures;
  }

  resetScene() {
    this.readings = emptyReadings();
    this.reflectionObserved = false;
    this.erased = false;
  }

  setScene(id: SceneId) {
    this.scene = id;
    this.resetScene();
  }
}

export const game = new GameStore();
