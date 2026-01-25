# Starlink Tickets - Backend API

Backend Node.js pour la plateforme de vente de tickets Wi-Fi.

## 🚀 Technologies

- **Node.js** avec Express
- **Supabase** (PostgreSQL) pour la base de données
- **Moneroo** pour les paiements Mobile Money
- **JWT** pour l'authentification
- **Winston** pour le logging

## 📋 Prérequis

- Node.js 18+ 
- Compte Supabase
- Clés API Moneroo

## 🔧 Installation

1. **Installer les dépendances**
```bash
npm install
```

2. **Configurer les variables d'environnement**
```bash
cp .env.example .env
```

Remplir le fichier `.env` avec vos credentials :
- `SUPABASE_URL` : URL de votre projet Supabase
- `SUPABASE_SERVICE_ROLE_KEY` : Clé service role de Supabase
- `SUPABASE_ANON_KEY` : Clé anonyme de Supabase
- `JWT_SECRET` : Secret pour signer les tokens JWT
- `MONEROO_API_KEY` : Clé API Moneroo
- `MONEROO_API_SECRET` : Secret API Moneroo
- `MONEROO_WEBHOOK_SECRET` : Secret pour vérifier les webhooks
- `MONEROO_BASE_URL` : URL de l'API Moneroo (https://api.moneroo.io)

3. **Créer la base de données**
Exécuter le script SQL dans `database/schema.sql` dans votre projet Supabase (SQL Editor).

## 🏃 Démarrage

**Mode développement** (avec nodemon) :
```bash
npm run dev
```

**Mode production** :
```bash
npm start
```

Le serveur démarre sur `http://localhost:3000`

## 📚 Structure du projet

```
backend/
├── src/
│   ├── config/          # Configuration (DB, logger)
│   ├── controllers/     # Contrôleurs (logique métier)
│   ├── middleware/      # Middlewares (auth, validation, erreurs)
│   ├── routes/          # Routes API
│   ├── services/        # Services externes (Moneroo)
│   ├── utils/           # Utilitaires (tickets, idempotence)
│   ├── app.js           # Configuration Express
│   └── server.js        # Point d'entrée
├── database/
│   └── schema.sql       # Schéma de base de données
├── logs/                # Fichiers de logs
├── package.json
└── README.md
```

## 🔌 Endpoints API

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/profile` - Profil utilisateur

### Zones Wi-Fi
- `GET /api/wifi-zones` - Liste des zones
- `GET /api/wifi-zones/:id` - Détails d'une zone
- `POST /api/wifi-zones` - Créer une zone
- `PUT /api/wifi-zones/:id` - Mettre à jour une zone
- `DELETE /api/wifi-zones/:id` - Supprimer une zone

### Tarifs
- `GET /api/pricings/zone/:zoneId` - Tarifs d'une zone
- `POST /api/pricings/zone/:zoneId` - Créer un tarif
- `PUT /api/pricings/:id` - Mettre à jour un tarif
- `DELETE /api/pricings/:id` - Supprimer un tarif

### Tickets
- `GET /api/tickets/zone/:zoneId` - Tickets d'une zone
- `POST /api/tickets/zone/:zoneId/import` - Importer des tickets (CSV)
- `GET /api/tickets/zone/:zoneId/stats` - Statistiques de tickets

### Paiements
- `POST /api/payments/intent` - Créer une intention de paiement (public)
- `POST /api/payments/moneroo/webhook` - Webhook Moneroo (public)
- `GET /api/payments/:paymentId` - Statut d'un paiement (public)
- `GET /api/payments/zone/:zoneId` - Paiements d'une zone (admin)

### Dashboard
- `GET /api/dashboard/stats` - Statistiques globales
- `GET /api/dashboard/zone/:zoneId` - Statistiques d'une zone
- `GET /api/dashboard/zone/:zoneId/period` - Statistiques par période

## 🔒 Sécurité

- **Authentification JWT** : Toutes les routes admin nécessitent un token
- **Rate Limiting** : 100 requêtes par IP toutes les 15 minutes
- **Helmet** : Protection des en-têtes HTTP
- **Validation** : Toutes les entrées sont validées avec express-validator
- **Idempotence** : Protection contre les doubles traitements de webhooks

## 📝 Format CSV pour l'import de tickets

Le fichier CSV doit contenir les colonnes suivantes :
```csv
username,password,profile
user1,pass123,profile1
user2,pass456,profile2
```

## 🔄 Workflow de paiement

1. Client crée une intention de paiement via `POST /api/payments/intent`
2. Redirection vers Moneroo pour le paiement
3. Moneroo envoie un webhook à `POST /api/payments/moneroo/webhook`
4. Le système vérifie l'idempotence
5. Attribution atomique d'un ticket
6. Retour des identifiants au client

## 🐛 Logs

Les logs sont stockés dans le dossier `logs/` :
- `combined.log` : Tous les logs
- `error.log` : Erreurs uniquement

## 📦 Déploiement

Le backend peut être déployé sur :
- **Vercel** (recommandé)
- **Heroku**
- **Railway**
- **DigitalOcean**

Assurez-vous de configurer toutes les variables d'environnement sur la plateforme de déploiement.

## 🔧 Développement

### Ajouter une nouvelle route

1. Créer le contrôleur dans `src/controllers/`
2. Créer la route dans `src/routes/`
3. Ajouter la route dans `src/routes/index.js`

### Tests

```bash
npm test
```

## 📄 Licence

ISC

