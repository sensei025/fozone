# Starlink Tickets - Plateforme de vente de tickets Wi-Fi

Plateforme complète pour la vente automatisée de tickets Wi-Fi avec paiements Mobile Money via Moneroo.

## 🎯 Vue d'ensemble

Cette plateforme permet de :
- Gérer plusieurs zones Wi-Fi
- Vendre des tickets Wi-Fi en ligne
- Recevoir des paiements via Mobile Money (MTN, Moov au Bénin)
- Suivre les statistiques et la comptabilité
- Importer des tickets depuis des fichiers CSV

## 🏗️ Architecture

### Backend
- **Node.js** avec Express
- **Supabase** (PostgreSQL) pour la base de données
- **Moneroo** pour les paiements Mobile Money
- **JWT** pour l'authentification

### Frontend
- **React 18** avec Vite
- **Tailwind CSS** pour le styling
- **React Router** pour la navigation
- Dark mode automatique

## 📋 Prérequis

- Node.js 18+
- Compte Supabase
- Clés API Moneroo
- npm ou yarn

## 🚀 Installation

### 1. Backend

```bash
cd backend
npm install
cp env.example .env
# Configurer les variables dans .env
npm run dev
```

Le backend démarre sur `http://localhost:3000`

### 2. Frontend

```bash
cd frontend
npm install
# Créer .env avec VITE_API_URL=http://localhost:3000/api
npm run dev
```

Le frontend démarre sur `http://localhost:5173`

### 3. Base de données

Exécuter le script SQL dans `backend/database/schema.sql` dans votre projet Supabase (SQL Editor).

## 📚 Documentation

- [Backend README](backend/README.md)
- [Frontend README](frontend/README.md)
- [Architecture Backend](backend/ARCHITECTURE.md)
- [Guide de configuration](backend/SETUP.md)

## 🔧 Configuration

### Variables d'environnement Backend

Voir `backend/env.example` pour la liste complète.

### Variables d'environnement Frontend

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:3000/api
```

## 📱 Fonctionnalités

### Dashboard Admin
- Vue d'ensemble des statistiques
- Chiffre d'affaires total
- Nombre de tickets vendus
- Recettes du jour
- Zones actives

### Gestion des zones Wi-Fi
- Création/modification/suppression
- Localisation GPS
- Adresse IP du routeur
- Numéro du gérant

### Gestion des tarifs
- Tarifs par zone Wi-Fi
- Montants personnalisables
- Durée de validité

### Gestion des tickets
- Import CSV
- Statuts (free, sold, expired)
- Attribution atomique (évite la double vente)

### Paiements
- Intégration Moneroo
- Support MTN et Moov (Bénin)
- Webhooks sécurisés
- Idempotence

## 🔒 Sécurité

- Authentification JWT
- Validation des entrées
- Rate limiting
- Protection CSRF
- Vérification des signatures webhook

## 📄 Licence

ISC

## 👥 Support

Pour toute question, contactez l'équipe de développement.


