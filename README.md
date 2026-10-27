# Posemètre / flashmètre

Module e-learning interactif en français pour apprendre à utiliser un posemètre et un flashmètre en photographie.

L’apprenant observe des situations de prise de vue, choisit une zone ou un posemètre, reçoit un retour contextualisé, puis consolide son choix avec une question.

## Aperçu

![Aperçu d’une scène interactive du module](public/assets/reflected-interactive-scene.webp)

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

Prérequis : Node.js 22 ou une version plus récente (la même version que celle utilisée par Docker et par le déploiement GitHub Pages).

```bash
npm install
npm run dev
```

Le module est alors disponible sur `http://localhost:8080`.

## Avec Docker

```bash
docker compose up --build
```

Le mode développement est disponible sur `http://localhost:8080` (le code est monté depuis le dossier du projet, les modifications s’affichent directement).

Pour tester la version de production servie par nginx :

```bash
docker compose --profile prod up --build prod
```

Elle est alors disponible sur `http://localhost:8081`. Pour l’arrêter : `docker compose --profile prod down`.

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

Le projet combine trois types d’éléments, soumis à des règles différentes :

| Élément | Licence |
|---|---|
| Code (application, configuration, Docker, scripts) | [MIT](LICENSE) |
| Textes pédagogiques (missions, questions, explications, bilan) | [CC BY-NC-SA 4.0](LICENSE-CONTENU) |
| Visuels (`public/assets`) | Aucune des deux, voir ci-dessous |

Les textes pédagogiques sont intégrés dans `src/App.svelte` : le code peut être réutilisé librement (MIT), mais reprendre les textes suppose de créditer [KarimBel](https://www.linkedin.com/in/karimbelkacem/), de ne pas en faire un usage commercial et de diffuser les adaptations sous la même licence.

Les visuels ont été générés avec OpenAI. Les images produites par une IA ne bénéficient pas nécessairement de la protection du droit d’auteur : elles ne sont couvertes par aucune des licences ci-dessus, et leur réutilisation se fait sans garantie.

Certaines planches pédagogiques montrent un posemètre portant le nom SEKONIC. Il s’agit d’illustrations générées par IA, pas de photographies du produit réel. SEKONIC est une marque de ses propriétaires respectifs ; ce projet n’est ni affilié à cette marque, ni approuvé par elle.

Avant toute diffusion, vérifiez que vous possédez les droits nécessaires sur chaque ressource ajoutée au projet.
