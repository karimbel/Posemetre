// Constantes et calculs d'exposition. Module unique : rien ici ne dépend de la scène de jeu.

/** Valeur incidente de la lumière du plateau, en IL (ISO 100). */
export const INCIDENT_EV = 9.0;

/** Gain habituel quand on optimise à partir d'une mesure incidente fiable. */
export const OPTIMISATION_EV = 1.33;

/** Vitesse de synchro du flash. Au-delà, sans HSS, la bande noire apparaît. */
export const SYNC_X = 1 / 200;

/**
 * Réflexion sur laquelle le posemètre est calibré (gris 18 %).
 * C'est ce qui rend la mesure réfléchie « juste » sur le carton gris.
 */
export const CALIBRATION_REFLECTANCE = 0.18;

/** Boîtier figé du plateau : il expose exactement INCIDENT_EV à ISO 100. */
export const BASE_CAMERA = { f: 2, shutterLabel: '1/125', iso: 100 } as const;

/** IL que le boîtier de référence expose à la lumière du plateau. */
export const EXPOSURE_EV = INCIDENT_EV;

/** Tolérance du JPEG avant qu'il ne paraisse vraiment cramé ou sombre. */
export const JPEG_TOLERANCE = 0.5;

/** Marges RAW disponibles avant que la matière ou la haute lumière ne soit perdue. */
export const RAW_SHADOW_STOPS = 3;
export const RAW_HIGHLIGHT_STOPS = 3;

export const ALBEDOS = {
  noir: { label: 'noir', long: 'Carton noir', reflectance: 0.08, share: '8 %', swatch: '#16191c', ink: '#c3ced1' },
  gris: { label: 'gris', long: 'Carton gris 18 %', reflectance: 0.18, share: '18 %', swatch: '#8e9599', ink: '#0d1214' },
  blanc: { label: 'blanc', long: 'Carton blanc', reflectance: 0.8, share: '80 %', swatch: '#e9e6dc', ink: '#14181a' }
} as const;

export type CardTone = keyof typeof ALBEDOS;
export const TONES: CardTone[] = ['noir', 'gris', 'blanc'];

export type MeterMode = 'incident' | 'reflected';
export type SphereState = 'out' | 'in';

export const MODE_LABEL: Record<MeterMode, string> = {
  incident: 'Incidente',
  reflected: 'Réfléchie'
};

export const SPHERE_LABEL: Record<SphereState, string> = {
  in: 'rentrée',
  out: 'sortie'
};

/** Ce que la lumisphère intègre, dans les mots du jeu. */
export const SPHERE_EFFECT: Record<SphereState, string> = {
  in: 'elle mesure la lumière qui arrive',
  out: 'elle mesure ce que le carton renvoie'
};

export const round2 = (value: number) => Number(value.toFixed(2));

/** Mesure réfléchie : la valeur suit l'albédo du carton. Mesure incidente : elle l'ignore. */
export function evFor(mode: MeterMode, tone: CardTone) {
  if (mode === 'incident') return INCIDENT_EV;
  return round2(INCIDENT_EV + Math.log2(ALBEDOS[tone].reflectance / CALIBRATION_REFLECTANCE));
}

/** Écart en IL entre une mesure et l'exposition correcte du plateau. */
export function exposureError(ev: number | null) {
  return ev === null ? null : round2(ev - EXPOSURE_EV);
}

export type PreviewState = {
  jpeg: 'sombre' | 'normale' | 'cramé' | '—';
  raw: 'pauvre' | 'riche' | '—';
  error: number | null;
  verdict: string;
};

/**
 * Ce que donnerait la photo si le joueur exposait à la valeur mesurée.
 * Sert à montrer qu'un JPEG cramé peut rester un RAW sain.
 */
export function previewFor(ev: number | null): PreviewState {
  const error = exposureError(ev);
  if (error === null) {
    return { jpeg: '—', raw: '—', error, verdict: 'Aucune mesure : il n’y a rien à juger.' };
  }
  if (error <= -RAW_SHADOW_STOPS) {
    return { jpeg: 'sombre', raw: 'pauvre', error, verdict: 'Trop sombre de plus de 3 IL : les ombres se referment, le RAW ne rattrape rien.' };
  }
  if (error <= -JPEG_TOLERANCE) {
    return { jpeg: 'sombre', raw: 'riche', error, verdict: 'Le JPEG est sombre, mais le RAW garde toute la matière : rien n’est perdu à l’impression.' };
  }
  if (error <= JPEG_TOLERANCE) {
    return { jpeg: 'normale', raw: 'riche', error, verdict: 'La valeur tombe juste : le carton gris renvoie exactement la mesure que le boîtier attend.' };
  }
  if (error <= RAW_HIGHLIGHT_STOPS) {
    return { jpeg: 'cramé', raw: 'riche', error, verdict: 'Le JPEG paraît cramé, mais le RAW garde la haute lumière : la photo reste récupérable.' };
  }
  return { jpeg: 'cramé', raw: 'pauvre', error, verdict: 'Trop de lumière de plus de 3 IL : la haute lumière est définitivement perdue.' };
}

export type GaugeState = { min: number; max: number; marks: { ev: number; tone: CardTone }[]; target: [number, number] };

/** Échelle de la jauge : borne la zone correcte et plaque chaque mesure. */
export function gaugeFor(readings: Record<CardTone, number | null>): GaugeState {
  const values = TONES.map((tone) => readings[tone]).filter((value): value is number => value !== null);
  return {
    min: Math.min(6, ...values.map((value) => Math.floor(value) - 1)),
    max: Math.max(12, ...values.map((value) => Math.ceil(value) + 1)),
    marks: TONES.filter((tone) => readings[tone] !== null).map((tone) => ({ ev: readings[tone]!, tone })),
    target: [EXPOSURE_EV - JPEG_TOLERANCE, EXPOSURE_EV + JPEG_TOLERANCE]
  };
}

export const stops = (ev: number) => `${ev.toFixed(1).replace('.', ',')} IL`;

/** Écart signé, formaté pour être lu d'un coup d'œil. */
export function ilDelta(error: number | null) {
  if (error === null) return '—';
  if (error === 0) return 'juste';
  const sign = error > 0 ? '+' : '−';
  return `${sign}${Math.abs(error).toFixed(1).replace('.', ',')} IL`;
}
