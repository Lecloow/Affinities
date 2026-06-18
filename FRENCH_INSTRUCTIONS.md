# Personnalisation de l’event

Si tu veux créer ton propre event, tu devras probablement modifier plusieurs parties du projet. J'ai essayé de rendre tout cela le plus simple possible à personnaliser et de documenter les composants les plus importants.

Si tu as des questions, n’hésite pas à me contacter.  
Si tu rencontres un bug, ouvre une issue sur le dépôt GitHub.  
Si tu veux contribuer, tu peux forker le projet et proposer une pull request.


## 1. Créer tes formulaires d’inscription

Commence par forker ou cloner le dépôt.

Tu devras créer tes propres formulaires afin que les participants puissent s’inscrire. Tes formulaires doivent inclure :

* Un champ “classe” prédéfini (pas de champ libre, afin de garantir des valeurs cohérentes).
* Plusieurs questions à choix multiples sur la personnalité et les centres d’intérêt des participants.

Une fois tes formulaires prêts et que tu veux importer les données, tu devras modifier entièrement le fichier `backend-go/utils/answers.go` pour l’adapter à la structure de ton formulaire.

Assure-toi que tout fonctionne correctement avant d’importer les données, sinon tu risques de rencontrer de nombreux problèmes par la suite.


## 2. Configurer les règles de l’événement

Si tu veux modifier les règles de l’événement (nombre d’indices par jour, points attribués par guess, types d’indices, etc.), modifie le fichier suivant :

`backend-go/utils/rules.go`

N’oublie pas non plus de mettre à jour `eventStartDate`. Sinon, l’événement commencera en 2026. Fais attention aux fuseaux horaires (UTC, heure locale, etc.).


## 3. Hébergement

Tu devras déployer l’application sur un serveur.

Pour le backend, j’utilise personnellement [Render](https://render.com/). Le plan Starter ou Standard suffit largement. Dans mon expérience, le plan Standard a supporté environ 330 utilisateurs avec l’ancien backend Python (le backend Go est bien plus performant) tout en utilisant moins de 10 % des ressources disponibles.

> Remarque : pense à supprimer ou suspendre le service après l’événement si tu n’en as plus besoin. Render fonctionne en pay-as-you-go.

Pour le frontend, j’utilise GitHub Pages, qui est entièrement gratuit. Un workflow GitHub Actions est déjà inclus pour build et déployer automatiquement le frontend. Tu auras seulement besoin d’acheter un nom de domaine et de le configurer avec GitHub Pages.

Pour la base de données PostgreSQL, j’utilise également le plan gratuit de Render. Il est suffisant pour environ 500 utilisateurs, et probablement plus, même si je n’ai pas testé a plus de 330 utilisateurs.


## 4. Déploiement

Dev:
```bash
cd backend-go
cp .env.example .env
```
```bash
go run .
```

Tu devras configurer l'url de la base de données postgreSQL dans le fichier `.env`.
Tu peux aussi définir un `ADMIN_TOKEN` (Fortement recommandé). Si aucun token admin n'est défini, tous les utilisateurs auront les droits administrateur.

Pour le développement, définis :
```env
ENV=dev
```
Ça permet d'activer les logs détaillés.

Prod:
Build command
```bash
cd backend-go && go build
```
Start command
```bash
cd backend-go && ./backend
```

Pense à bien configurer tes identifiants de base de données et un `ADMIN_TOKEN` (très important) dans les variables d’environnement sur Render.

S’il n’y a pas de token admin, tout le monde devient administrateur, ce qui permet de réimporter les données ou de supprimer des utilisateurs.

Pour le frontend, les GitHub Actions buildent automatiquement l’application. Il te suffit de renseigner l’URL de ton backend Render dans les secrets et variables du dépôt.

## 5. Import des données

Une fois l'application lancée, ouvre [Bruno](https://usebruno.com) et exécute l'endpoint `importData`.
PS: Tu peux acceder a la doc Bruno (tous les endpoints) ici [Documentation](./Affinities-documentation.html)

Tu devras fournir :

- `baseUrl` (l’URL de ton backend Render)
- ton `ADMIN_TOKEN`

Le processus d’import peut être long selon le nombre d’utilisateurs.
Sur mon ordi, l’import local prend environ une seconde par utilisateur.

Une fois l'import terminé, tu peux utiliser [TablePlus](https://tableplus.com) (ou autre client PostgreSQL) pour inspecter la base de données.

Tu peux ensuite lancer l’endpoint `createMatches` pour générer les matchs entre utilisateurs.
Puis lancer `createHints` pour générer les indices.

Et voilà ! L’event peut commencer.

## Credits

Si tu utilises ce projet comme base pour ton propre event, tu dois conserver les crédits originaux de l'auteur (Thomas Conchon) dans :
- l'application UI
- la documentation / README
PS: C'est sous License donc t'es obligé de conserver les crédits.

## 6. Frontend (développement local)

Tu peux utiliser Tailscale (optionnel) si tu veux accéder au frontend depuis un autre appareil.

Assure-toi d’avoir installé Bun.
```bash
cd frontend
cp .env.example .env
```
Renseigne soit l’URL Render, soit ton URL Tailscale (ou IP).

```bash
bun install
bun run dev --host
```