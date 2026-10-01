# Posemètre / flashmètre

Module e-learning interactif en français pour apprendre à utiliser un posemètre et un flashmètre en photographie.

L’apprenant observe des situations de prise de vue, choisit une zone ou un posemètre, reçoit un retour contextualisé, puis consolide son choix avec une question.

## Aperçu

![Aperçu d’une scène interactive du module](public/assets/reflected-interactive-scene.png)

## Objectifs pédagogiques

- Distinguer mesure incidente et mesure réfléchie.
- Comprendre l’albédo et la réflectance.
- Identifier une zone-climax pour préserver les hautes lumières.
- Choisir une lumisphère sortie ou rentrée.
- Lire et reporter les valeurs d’exposition.

## Parcours

1. Mesure de lumière incidente
2. Mesure de lumière réfléchie
3. Albédo et réflectance
4. Conditions d’une mesure fiable
5. Protection de la zone-climax
6. Lumisphère : sortie ou rentrée
7. Lecture et ajustement des valeurs
8. Bilan personnalisé de fin de parcours

La mission « Lumisphère » tire aléatoirement une situation :

- lumière naturelle sans contraste : lumisphère sortie ;
- lumière de studio : lumisphère rentrée.

À la fin du parcours, une page de résultats détaille les réponses de l’apprenant, indique les bonnes réponses et leurs explications, puis met en évidence les missions à revoir. Chaque point à réviser permet de revenir directement à la mission correspondante.

## Technologies

- [Svelte 5](https://svelte.dev/)
- [Vite](https://vite.dev/)
- TypeScript

## Installation

Prérequis : Node.js 20 ou une version plus récente.

```bash
npm install
npm run dev
```

Le module est alors disponible sur `http://localhost:8080`.

## Produire une version statique

```bash
npm run build
```

Les fichiers prêts à publier sont générés dans `dist/`.

## Crédits

- Conception et contenu pédagogique : [KarimBel](https://www.linkedin.com/in/karimbelkacem/)
- Contenu pédagogique librement inspiré de [Nath Sakura Channel](https://www.youtube.com/@NathSakuraChannel)
- Développement : KarimBel, avec l’assistance d’OpenAI
- Visuels : générés avec OpenAI

## Contribution

Avant de proposer une modification, vérifiez le parcours concerné sur ordinateur et mobile, puis exécutez `npm run build`.

## Licence

Ce projet est distribué sous licence [Creative Commons Attribution — Utilisation non commerciale — Partage dans les mêmes conditions 4.0 International (CC BY-NC-SA 4.0)](LICENSE).

Vous pouvez partager et adapter le projet à condition de créditer [KarimBel](https://www.linkedin.com/in/karimbelkacem/), de ne pas en faire un usage commercial et de diffuser les adaptations sous la même licence.

Avant toute diffusion, vérifiez que vous possédez les droits nécessaires sur chaque ressource ajoutée au projet.
