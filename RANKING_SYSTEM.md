# Système de Classement - Saint Valentin Event

## Vue d'ensemble

Le système de classement ajoute une dimension compétitive à l'événement Saint-Valentin en permettant aux participants de gagner des points en devinant l'identité de leur âme sœur et en échangeant des codes secrets via QR code.

## Fonctionnalités

### 1. Système de Devinettes

#### Points par Devinette
Les participants peuvent faire **une tentative par indice révélé**, soit jusqu'à **3 tentatives par jour**. Les points diminuent à chaque tentative :

- **Tentative sur indice 1** : 75 points
- **Tentative sur indice 2** : 50 points
- **Tentative sur indice 3** : 25 points

#### Règles
- **Une tentative par indice révélé** (jusqu'à 3 tentatives par jour)
- Chaque tentative est liée à un numéro d'indice spécifique
- Les points ne sont attribués que si la réponse est correcte
- Impossible de deviner après l'heure de révélation (15h15)
- Les candidats sont limités aux personnes de la même classe
- Interface avec **autocomplete** : tapez le prénom et sélectionnez dans la liste

#### Historique des Tentatives
L'interface affiche l'historique de toutes les tentatives avec :
- ✓ Icône verte pour les réponses correctes
- ✗ Icône rouge pour les réponses incorrectes
- Le numéro d'indice utilisé
- Les points gagnés

### 2. Codes d'Échange avec QR Code

#### Génération de Codes
Lorsque l'identité de l'âme sœur est révélée (après 15h15), chaque utilisateur reçoit :
- Un **code unique de 6 caractères** (ex: "A3BX9K")
- Un **QR code scannable** généré automatiquement

#### Échange de Codes
- Les deux partenaires doivent échanger leurs codes
- Le QR code peut être scanné pour faciliter l'échange
- Le code texte reste disponible pour saisie manuelle
- Chaque échange réussi rapporte **50 points bonus**
- L'échange doit être fait avec le véritable âme sœur
- Un seul échange par jour est autorisé

### 3. Classement

#### Page Classement
- Accessible via le lien "Voir le classement 🏆" sur la page de profil
- Affiche tous les participants classés par points totaux
- Actualisation automatique toutes les **2 minutes**

#### Affichage
- 🥇 **1ère place** : Fond doré
- 🥈 **2ème place** : Fond argenté
- 🥉 **3ème place** : Fond bronze
- L'utilisateur actuel est mis en évidence avec une bordure rose

#### Informations Affichées
- Rang
- Prénom et nom
- Classe
- Points totaux

## Architecture Technique

### Base de Données

#### Table `guesses`
```sql
CREATE TABLE guesses (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    day INTEGER NOT NULL,
    hint_number INTEGER NOT NULL,
    guessed_user_id TEXT NOT NULL,
    hints_revealed INTEGER NOT NULL,
    points_earned INTEGER NOT NULL,
    is_correct BOOLEAN NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, day, hint_number)
);
```
**Note**: La contrainte UNIQUE sur `(user_id, day, hint_number)` permet une tentative par indice révélé.

#### Table `scores`
```sql
CREATE TABLE scores (
    user_id TEXT PRIMARY KEY,
    total_points INTEGER DEFAULT 0,
    code_exchange_bonus INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Table `reveal_codes`
```sql
CREATE TABLE reveal_codes (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    day INTEGER NOT NULL,
    code TEXT NOT NULL,
    exchanged BOOLEAN DEFAULT FALSE,
    exchanged_with TEXT,
    exchanged_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, day)
);
```

### API Endpoints

#### `GET /candidates/{user_id}`
Récupère la liste des candidats possibles (même classe) pour un utilisateur.

**Réponse :**
```json
{
  "candidates": [
    {
      "id": "user123",
      "first_name": "Marie",
      "last_name": "Dupont",
      "currentClass": "Terminale A"
    }
  ]
}
```

#### `POST /guess`
Soumet une devinette sur l'identité de l'âme sœur pour un indice spécifique.

**Requête :**
```json
{
  "user_id": "user456",
  "day": 1,
  "hint_number": 1,
  "guessed_user_id": "user123"
}
```

**Réponse :**
```json
{
  "success": true,
  "is_correct": true,
  "points_earned": 75,
  "hint_number": 1,
  "message": "Correct! You guessed your soulmate!"
}
```

#### `GET /leaderboard`
Récupère le classement complet de tous les utilisateurs.

**Réponse :**
```json
{
  "leaderboard": [
    {
      "rank": 1,
      "user_id": "user123",
      "first_name": "Marie",
      "last_name": "Dupont",
      "currentClass": "Terminale A",
      "total_points": 125,
      "code_exchange_bonus": 50,
      "updated_at": "2026-02-12T15:30:00"
    }
  ]
}
```

#### `GET /reveal-code/{user_id}/{day}`
Récupère le code de révélation d'un utilisateur pour un jour donné.

**Réponse :**
```json
{
  "available": true,
  "code": "A3BX9K",
  "exchanged": false
}
```

#### `GET /reveal-code-qr/{user_id}/{day}`
Génère une image QR code pour le code de révélation.

**Réponse :** Image PNG (200x200px) contenant le QR code

**Content-Type:** `image/png`

**Utilisation:** Peut être affichée directement dans une balise `<img>` ou scannée avec un lecteur QR code.

#### `POST /exchange-code`
Échange un code avec l'âme sœur pour obtenir des points bonus.

**Requête :**
```json
{
  "user_id": "user456",
  "day": 1,
  "partner_code": "A3BX9K"
}
```

**Réponse :**
```json
{
  "success": true,
  "points_earned": 50,
  "message": "Code exchanged successfully! Bonus points awarded."
}
```

#### `GET /user-stats/{user_id}`
Récupère les statistiques d'un utilisateur (score total, historique des devinettes).

**Réponse :**
```json
{
  "user_id": "user456",
  "total_points": 125,
  "code_exchange_bonus": 50,
  "guesses": [
    {
      "day": 1,
      "hint_number": 1,
      "guessed_user_id": "user123",
      "hints_revealed": 1,
      "points_earned": 75,
      "is_correct": true,
      "created_at": "2026-02-12T11:30:00"
    }
  ]
}
```

## Interface Utilisateur

### Page de Profil

#### Section Score
Affiche le score total de l'utilisateur avec un lien vers le classement :
```
┌─────────────────────────────┐
│  Votre Score Total          │
│        125 pts              │
│  [Voir le classement 🏆]    │
└─────────────────────────────┘
```

#### Section Devinette
Affiche l'historique des tentatives et permet de deviner avec le prochain indice révélé :
```
┌─────────────────────────────────────┐
│ 🎯 Deviner mon âme sœur (Indice 1) │
│                                     │
│ Vos tentatives:                     │
│ ✗ Indice 1: Marie Dupont            │
│                                     │
│ Si vous devinez correctement avec   │
│ cet indice, vous gagnerez 50 pts!   │
│                                     │
│ [Tapez le prénom ou nom...]  🔽    │
│ └─ Jean Dubois                      │
│ └─ Jeanne Martin                    │
│                                     │
│ [Valider mon choix]                 │
└─────────────────────────────────────┘
```

**Fonctionnalités de l'autocomplete:**
- Tapez les premières lettres du prénom ou nom
- Liste filtrée en temps réel
- Cliquez sur un nom pour le sélectionner
- Validation impossible sans sélection

#### Section Code de Révélation
Apparaît après 15h15 lorsque l'identité est révélée, avec QR code :
```
┌─────────────────────────────────────┐
│ 🎁 Votre Code Secret                │
│                                     │
│ ┌───────────────┐                  │
│ │   ▄▄▄▄▄▄▄     │  QR Code         │
│ │   █ ▄▄▄ █     │  200x200px       │
│ │   █ ███ █     │                  │
│ │   █▄▄▄▄▄█     │                  │
│ └───────────────┘                  │
│      A3BX9K                         │
│                                     │
│ Scannez le QR code ou partagez le  │
│ code! Vous gagnerez 50 pts!        │
│                                     │
│ [Code de votre âme sœur]           │
│ [Échanger le code]                  │
└─────────────────────────────────────┘
```

### Page Classement

Format du classement :
```
🏆 Classement

Dernière mise à jour : 14h32

┌─────────────────────────────────────┐
│ 🥇  Marie Dupont                    │
│     Terminale A              125 pts│
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ 🥈  Jean Martin                     │
│     Terminale B              100 pts│
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ 🥉  Sophie Bernard                  │
│     Terminale A               75 pts│
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ #4  Thomas Petit (Vous)             │
│     Terminale C               50 pts│
└─────────────────────────────────────┘
```

## Sécurité

### Génération de Codes
- Les codes sont générés avec le module `secrets` de Python
- Garantit une sécurité cryptographique
- Codes uniques de 6 caractères (lettres majuscules et chiffres)

### Validation
- Vérification que le partenaire est le véritable âme sœur
- Une seule devinette par jour
- Un seul échange de code par jour
- Validation des horaires de révélation

## Améliorations Futures Possibles

1. **Codes QR** : Afficher les codes sous forme de QR codes pour faciliter le scan
2. **Statistiques détaillées** : Graphiques d'évolution des points
3. **Badges** : Récompenses spéciales (première place, échange rapide, etc.)
4. **Notifications** : Alertes quand le classement change
5. **Historique** : Voir l'évolution du classement dans le temps
