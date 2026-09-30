export type { SceneId } from './gameStore.svelte';

import type { SceneId } from './gameStore.svelte';

export const SCENES: { id: SceneId; title: string; goal: string; why: string }[] = [
  {
    id: 1,
    title: 'Incidente ou réfléchie ?',
    goal: 'Distingue ce que le posemètre est en train de mesurer.',
    why: 'D’abord, il regarde le carton : la valeur change. Ensuite, il regarde la lumière qui arrive : la valeur reste la même.'
  },
  {
    id: 2,
    title: 'Mesure stable',
    goal: 'Trouve une mesure qui se répète à 1/3 d’IL près.',
    why: 'Une cellule qui bouge d’une prise à l’autre, c’est une mesure qui ne veut rien dire. Tant que la cellule clignote, rien ne se valide.'
  },
  {
    id: 3,
    title: 'Subie ou choisie',
    goal: 'Choisis le bon levier, et désactive l’autre.',
    why: 'Lumière subie, tu règles le boîtier. Lumière choisie, le boîtier est fixé et tu règles la source. Les deux leviers ensemble, tu ne sais plus ce qui agit.'
  },
  {
    id: 4,
    title: 'Garde de la matière',
    goal: 'Garde un RAW riche et la haute lumière intacte.',
    why: 'Le JPEG pâle n’est pas un échec : c’est souvent le RAW qui décide. Regarde ce que tu peux encore récupérer, pas ce que l’écran montre.'
  },
  {
    id: 5,
    title: 'Deux lumières',
    goal: 'Lis les deux chiffres, jamais leur moyenne.',
    why: 'En lumière mixte, exposer sur la moyenne surexpose une source et sous-expose l’autre. Ce qui compte, c’est le rapport entre les deux.'
  },
  {
    id: 6,
    title: 'La limite du flash',
    goal: 'Nomme le compromis quand la valeur est impossible.',
    why: 'Au-delà de la synchro, la bande noire apparaît et aucune mesure ne sauvera l’image. Le jeu te fera choisir ce que tu sacrifies, en le nommant.'
  }
];
