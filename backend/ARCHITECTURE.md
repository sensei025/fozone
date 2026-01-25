# Architecture du Backend

## 📁 Structure du projet

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js      # Configuration Supabase
│   │   └── logger.js         # Configuration Winston
│   │
│   ├── controllers/
│   │   ├── authController.js        # Authentification
│   │   ├── wifiZoneController.js    # Gestion zones Wi-Fi
│   │   ├── pricingController.js     # Gestion tarifs
│   │   ├── ticketController.js      # Gestion tickets
│   │   ├── paymentController.js     # Gestion paiements
│   │   └── dashboardController.js   # Statistiques dashboard
│   │
│   ├── middleware/
│   │   ├── auth.js           # Authentification JWT
│   │   ├── errorHandler.js   # Gestion erreurs
│   │   └── validator.js      # Validation des données
│   │
│   ├── routes/
│   │   ├── auth.js           # Routes authentification
│   │   ├── wifiZones.js      # Routes zones Wi-Fi
│   │   ├── pricings.js       # Routes tarifs
│   │   ├── tickets.js        # Routes tickets
│   │   ├── payments.js       # Routes paiements
│   │   ├── dashboard.js      # Routes dashboard
│   │   └── index.js          # Routeur principal
│   │
│   ├── services/
│   │   └── moneroo.js        # Intégration Moneroo
│   │
│   ├── utils/
│   │   ├── idempotency.js    # Gestion idempotence
│   │   └── ticketManager.js  # Gestion tickets atomiques
│   │
│   ├── app.js                # Configuration Express
│   └── server.js             # Point d'entrée
│
├── database/
│   └── schema.sql           # Schéma PostgreSQL
│
├── logs/                    # Fichiers de logs
├── package.json
├── .env.example
├── .gitignore
├── README.md
└── ARCHITECTURE.md
```

## 🔄 Flux de données

### 1. Authentification
```
Client → POST /api/auth/login
       → JWT Token
       → Headers: Authorization: Bearer <token>
```

### 2. Création d'une zone Wi-Fi
```
Admin → POST /api/wifi-zones (avec token)
     → Validation
     → Insertion DB
     → Retour zone créée
```

### 3. Import de tickets
```
Admin → POST /api/tickets/zone/:id/import (CSV)
     → Parsing CSV
     → Insertion batch en DB
     → Retour tickets importés
```

### 4. Workflow de paiement client
```
Client → POST /api/payments/intent
       → Création paiement Moneroo
       → Redirection vers Moneroo
       → Paiement Mobile Money
       → Webhook Moneroo → POST /api/payments/moneroo/webhook
       → Vérification idempotence
       → Attribution atomique ticket
       → Retour identifiants
```

## 🗄️ Modèle de données

### Tables principales

1. **users** : Utilisateurs (admin)
2. **wifi_zones** : Zones Wi-Fi
3. **pricings** : Tarifs par zone
4. **tickets** : Tickets Wi-Fi (username/password)
5. **payments** : Paiements
6. **payment_idempotency** : Clés d'idempotence

### Relations

```
users (1) ──→ (N) wifi_zones
wifi_zones (1) ──→ (N) pricings
wifi_zones (1) ──→ (N) tickets
wifi_zones (1) ──→ (N) payments
payments (1) ──→ (1) tickets
```

## 🔒 Sécurité

### Authentification
- JWT avec expiration (7 jours par défaut)
- Vérification du token sur chaque requête admin
- Vérification de l'existence de l'utilisateur en DB

### Validation
- `express-validator` pour toutes les entrées
- Validation des UUID, emails, IP, etc.

### Idempotence
- Table `payment_idempotency` pour éviter les doubles traitements
- Clé unique par webhook Moneroo

### Transactions atomiques
- Fonction SQL `assign_ticket_atomic` avec `FOR UPDATE SKIP LOCKED`
- Garantit qu'un ticket n'est vendu qu'une fois

## 🚀 Points d'attention

### Performance
- Index sur les colonnes fréquemment requêtées
- Pagination sur les listes
- Rate limiting (100 req/15min)

### Scalabilité
- Architecture modulaire
- Séparation des responsabilités
- Services réutilisables

### Maintenabilité
- Code commenté
- Structure claire
- Logging complet
- Gestion d'erreurs centralisée

## 🔧 Configuration

### Variables d'environnement requises

```env
# Server
PORT=3000
NODE_ENV=development

# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxx
SUPABASE_ANON_KEY=xxx

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d

# Moneroo
MONEROO_API_KEY=xxx
MONEROO_API_SECRET=xxx
MONEROO_WEBHOOK_SECRET=xxx
MONEROO_BASE_URL=https://api.moneroo.io

# CORS
CORS_ORIGIN=http://localhost:5173
```

## 📝 Prochaines étapes

1. ✅ Backend API complet
2. ⏳ Frontend React (Vite)
3. ⏳ Intégration Supabase Auth côté frontend
4. ⏳ Tests unitaires et d'intégration
5. ⏳ Déploiement Vercel

