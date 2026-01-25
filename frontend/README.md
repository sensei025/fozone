# Starlink Tickets - Frontend

Application React (Vite) pour la gestion de tickets Wi-Fi.

## 🚀 Technologies

- **React 18** avec Vite
- **React Router** pour la navigation
- **Tailwind CSS** pour le styling
- **Lucide React** pour les icônes
- **React Hot Toast** pour les notifications
- **Axios** pour les requêtes API

## 📋 Prérequis

- Node.js 18+
- npm ou yarn

## 🔧 Installation

1. **Installer les dépendances**
```bash
npm install
```

2. **Configurer les variables d'environnement**
Créer un fichier `.env` à la racine du dossier `frontend` :

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:3000/api
```

3. **Démarrer le serveur de développement**
```bash
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

## 📁 Structure du projet

```
frontend/
├── src/
│   ├── components/      # Composants réutilisables
│   ├── pages/         # Pages de l'application
│   ├── services/       # Services API
│   ├── config/         # Configuration
│   ├── App.jsx         # Composant principal
│   ├── main.jsx        # Point d'entrée
│   └── index.css       # Styles globaux
├── package.json
└── vite.config.js
```

## 🎨 Fonctionnalités

- ✅ Authentification (Login/Register)
- ✅ Dashboard avec statistiques
- ✅ Gestion des zones Wi-Fi
- ✅ Dark mode automatique
- ✅ Interface responsive
- ⏳ Gestion des tarifs (en développement)
- ⏳ Gestion des tickets (en développement)
- ⏳ Comptabilité (en développement)

## 🏗️ Build pour production

```bash
npm run build
```

Les fichiers seront générés dans le dossier `dist/`

## 📝 Notes

- Le dark mode est activé automatiquement selon les préférences système
- Les tokens JWT sont stockés dans le localStorage
- L'API backend doit être démarrée sur le port 3000 par défaut


