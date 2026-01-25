# Guide de configuration rapide

## 📋 Étape 1 : Créer le fichier .env

Copiez le fichier d'exemple vers `.env` :

**Sur Windows (PowerShell) :**
```powershell
Copy-Item env.example .env
```

**Sur Windows (CMD) :**
```cmd
copy env.example .env
```

**Sur Linux/Mac :**
```bash
cp env.example .env
```

## 📋 Étape 2 : Configurer Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Allez dans **Settings > API**
4. Copiez :
   - `Project URL` → `SUPABASE_URL`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`
   - `anon` key → `SUPABASE_ANON_KEY`

5. Allez dans **SQL Editor**
6. Copiez-collez le contenu de `database/schema.sql`
7. Exécutez le script

## 📋 Étape 3 : Configurer Moneroo

1. Créez un compte sur Moneroo
2. Accédez à votre dashboard
3. Récupérez :
   - `API Key` → `MONEROO_API_KEY`
   - `API Secret` → `MONEROO_API_SECRET`
   - `Webhook Secret` → `MONEROO_WEBHOOK_SECRET`

4. Configurez le webhook dans Moneroo :
   - URL : `https://votre-domaine.com/api/payments/moneroo/webhook`
   - Méthode : POST

## 📋 Étape 4 : Générer JWT_SECRET

Générez une clé secrète forte :

**Sur Windows (PowerShell) :**
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | % {[char]$_})
```

**Sur Linux/Mac :**
```bash
openssl rand -base64 32
```

Ou utilisez un générateur en ligne : https://randomkeygen.com/

## 📋 Étape 5 : Vérifier la configuration

Votre fichier `.env` devrait ressembler à ceci :

```env
PORT=3000
NODE_ENV=development
API_BASE_URL=http://localhost:3000

SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

JWT_SECRET=votre_secret_64_caracteres
JWT_EXPIRES_IN=7d

MONEROO_API_KEY=votre_cle_api
MONEROO_API_SECRET=votre_secret
MONEROO_WEBHOOK_SECRET=votre_webhook_secret
MONEROO_BASE_URL=https://api.moneroo.io

CORS_ORIGIN=http://localhost:5173
LOG_LEVEL=info
```

## 📋 Étape 6 : Installer et démarrer

```bash
npm install
npm run dev
```

Le serveur devrait démarrer sur `http://localhost:3000`

## ✅ Vérification

Testez l'endpoint de santé :
```bash
curl http://localhost:3000/api/health
```

Vous devriez recevoir :
```json
{
  "status": "ok",
  "timestamp": "2024-...",
  "service": "starlink-tickets-api"
}
```

## 🐛 Problèmes courants

### Erreur : "Missing Supabase environment variables"
→ Vérifiez que toutes les variables Supabase sont remplies dans `.env`

### Erreur : "Invalid token"
→ Vérifiez que `JWT_SECRET` est bien défini et assez long (minimum 32 caractères)

### Erreur de connexion à Supabase
→ Vérifiez que `SUPABASE_URL` est correct et que le projet est actif

### Erreur CORS
→ Vérifiez que `CORS_ORIGIN` correspond à l'URL de votre frontend

