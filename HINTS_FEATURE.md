# Système d'Indices pour Saint-Valentin

## Description

Ce système permet aux utilisateurs de découvrir progressivement leur âme sœur grâce à des indices révélés à des heures précises pendant l'événement Saint-Valentin.

## Calendrier des Révélations

### Jeudi 12 Février 2026
- **10h00** : Premier indice
- **12h00** : Deuxième indice
- **13h00** : Troisième indice
- **15h15** : Révélation complète du match

### Vendredi 13 Février 2026
- **10h00** : Premier indice
- **12h00** : Deuxième indice
- **13h00** : Troisième indice
- **15h15** : Révélation complète du match

## Types d'Indices

Les indices sont **asymétriques** - chaque personne reçoit des indices différents et personnalisés. Il existe trois niveaux de difficulté :

### 🟢 Facile
Indique la classe de la personne
- Exemple : "Il/Elle est dans la classe: Terminale A"

### 🟡 Moyen
Indique la première lettre du prénom
- Exemple : "Son prénom commence par: A"

### 🔴 Difficile
Indique le nombre de lettres dans le prénom
- Exemple : "Son prénom contient 7 lettres"

**Note** : L'ordre des indices (facile, moyen, difficile) est mélangé aléatoirement pour chaque utilisateur.

## Fonctionnalités de l'Interface

### Page de Profil

Lorsqu'un utilisateur se connecte, la page de profil affiche :

1. **Section des Indices pour chaque jour**
   - Jeudi 12 Février
   - Vendredi 13 Février

2. **Pour chaque indice** :
   - Si disponible : L'indice complet avec son niveau de difficulté et l'heure de révélation
   - Si verrouillé : Un cadenas 🔒 et un compte à rebours avant la prochaine révélation

3. **Section de Révélation**
   - Avant 15h15 : Affiche un compte à rebours
   - Après 15h15 : Révèle le nom complet et la classe du match

4. **Actualisation Automatique**
   - La page se rafraîchit toutes les 30 secondes pour mettre à jour les compteurs

## Architecture Technique

### Base de Données

#### Table `hints`
```sql
CREATE TABLE hints (
    id TEXT PRIMARY KEY,              -- Format: "user_id_day1" ou "user_id_day2"
    user_id TEXT,                     -- ID de l'utilisateur
    day INTEGER,                      -- 1 ou 2 (jeudi ou vendredi)
    hint1_type TEXT,                  -- Type: "easy", "medium", "hard"
    hint1_content TEXT,               -- Contenu de l'indice 1
    hint1_time TIMESTAMP,             -- Heure de révélation: 10:00
    hint2_type TEXT,                  -- Type: "easy", "medium", "hard"
    hint2_content TEXT,               -- Contenu de l'indice 2
    hint2_time TIMESTAMP,             -- Heure de révélation: 12:00
    hint3_type TEXT,                  -- Type: "easy", "medium", "hard"
    hint3_content TEXT,               -- Contenu de l'indice 3
    hint3_time TIMESTAMP,             -- Heure de révélation: 13:00
    reveal_time TIMESTAMP,            -- Heure de révélation complète: 15:15
    match_id TEXT                     -- ID du match pour ce jour
);
```

### API Endpoints

#### `GET /hints/{user_id}`
Récupère tous les indices pour un utilisateur avec leur statut de disponibilité.

**Réponse** :
```json
{
  "days": [
    {
      "day": 1,
      "date": "2026-02-12",
      "hints": [
        {
          "type": "easy",
          "content": "Il/Elle est dans la classe: Terminale A",
          "available": true,
          "drop_time": "2026-02-12T10:00:00"
        },
        {
          "type": "locked",
          "content": null,
          "available": false,
          "drop_time": "2026-02-12T12:00:00"
        },
        {
          "type": "locked",
          "content": null,
          "available": false,
          "drop_time": "2026-02-12T13:00:00"
        }
      ],
      "reveal_time": "2026-02-12T15:15:00",
      "match_revealed": false,
      "match_info": null
    }
  ]
}
```

### Génération des Indices

Les indices sont générés automatiquement après la création des matchs via l'endpoint `POST /createMatches`. La fonction `generate_hints_for_all_users()` :

1. Récupère tous les matchs de la base de données
2. Pour chaque utilisateur et chaque jour :
   - Identifie le match du jour
   - Génère 3 indices de difficulté différente
   - Mélange aléatoirement l'ordre des indices
   - Stocke les indices avec leurs horaires de révélation

## Personnalisation

Les indices sont **asymétriques** - chaque utilisateur reçoit des indices différents basés sur son match spécifique. Deux personnes ne verront jamais les mêmes indices, même si elles ont le même match.

## Sécurité et Performance

- Les horaires sont vérifiés côté serveur
- Les indices ne sont jamais envoyés au client avant leur heure de révélation
- La page se rafraîchit automatiquement toutes les 30 secondes
- Les requêtes sont optimisées pour minimiser la charge sur le serveur
