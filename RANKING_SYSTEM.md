# Système de Classement - Saint Valentin Event

## Vue d'ensemble

Le système de classement ajoute une dimension compétitive à l'événement Saint-Valentin en permettant aux participants de gagner des points en devinant l'identité de leur âme sœur et en échangeant des codes secrets.

## Fonctionnalités

### 1. Système de Devinettes

#### Points par Devinette
Les participants peuvent deviner l'identité de leur âme sœur après avoir révélé au moins un indice. Les points diminuent à mesure que plus d'indices sont révélés :

- **1 indice révélé** : 75 points
- **2 indices révélés** : 50 points
- **3 indices révélés** : 25 points

#### Règles
- Un seul essai par jour autorisé
- Au moins un indice doit être révélé pour pouvoir deviner
- Les points ne sont attribués que si la réponse est correcte
- Impossible de deviner après l'heure de révélation (15h15)
- Les candidats sont limités aux personnes de la même classe

### 2. Codes d'Échange

#### Génération de Codes
Lorsque l'identité de l'âme sœur est révélée (après 15h15), chaque utilisateur reçoit un **code unique de 6 caractères** (ex: "A3BX9K").

#### Échange de Codes
- Les deux partenaires doivent échanger leurs codes
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
    guessed_user_id TEXT NOT NULL,
    hints_revealed INTEGER NOT NULL,
    points_earned INTEGER NOT NULL,
    is_correct BOOLEAN NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, day)
);
```

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
Soumet une devinette sur l'identité de l'âme sœur.

**Requête :**
```json
{
  "user_id": "user456",
  "day": 1,
  "guessed_user_id": "user123"
}
```

**Réponse :**
```json
{
  "success": true,
  "is_correct": true,
  "points_earned": 75,
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
Apparaît après avoir révélé au moins un indice :
```
┌─────────────────────────────────────┐
│ 🎯 Deviner mon âme sœur             │
│                                     │
│ Vous avez révélé 1 indice(s).      │
│ Si vous devinez correctement,       │
│ vous gagnerez 75 points!            │
│                                     │
│ [Choisir une personne ▼]           │
│ [Valider mon choix]                 │
└─────────────────────────────────────┘
```

#### Section Code de Révélation
Apparaît après 15h15 lorsque l'identité est révélée :
```
┌─────────────────────────────────────┐
│ 🎁 Votre Code Secret                │
│                                     │
│ ┌─────────────┐                    │
│ │   A3BX9K    │                    │
│ └─────────────┘                    │
│                                     │
│ Partagez ce code avec votre        │
│ âme sœur! Vous gagnerez 50 pts!    │
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
