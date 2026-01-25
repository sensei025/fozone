# Guide de débogage - Erreur "Invalid token"

## Problème
Vous obtenez l'erreur "Invalid token" lors de la création d'une zone Wi-Fi.

## Solutions à essayer

### 1. Vérifier que le backend est démarré
```bash
cd backend
npm run dev
```
Le serveur doit être accessible sur `http://localhost:3000`

### 2. Vérifier votre connexion
1. Ouvrez la console du navigateur (F12)
2. Allez dans l'onglet "Application" > "Local Storage"
3. Vérifiez que `auth_token` existe et contient un token

### 3. Se reconnecter
Si le token est expiré ou invalide :
1. Déconnectez-vous
2. Reconnectez-vous avec vos identifiants
3. Essayez à nouveau de créer une zone

### 4. Vérifier les variables d'environnement du backend
Assurez-vous que votre fichier `backend/.env` contient :
```env
JWT_SECRET=votre_secret_ici
SUPABASE_URL=https://votre-projet.supabase.co
SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key
```

### 5. Vérifier la console du navigateur
Ouvrez la console (F12) et regardez les erreurs dans l'onglet "Console" ou "Network" :
- Si vous voyez une erreur 401, le token est invalide ou expiré
- Si vous voyez une erreur 500, il y a un problème côté serveur

### 6. Tester manuellement le token
Dans la console du navigateur, exécutez :
```javascript
// Vérifier le token
const token = localStorage.getItem('auth_token');
console.log('Token:', token ? token.substring(0, 50) + '...' : 'Aucun token');

// Tester une requête
fetch('http://localhost:3000/api/wifi-zones', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(data => console.log('Réponse:', data))
.catch(err => console.error('Erreur:', err));
```

### 7. Redémarrer le backend
Parfois, un redémarrage du backend résout les problèmes :
1. Arrêtez le backend (Ctrl+C)
2. Redémarrez-le : `npm run dev`

## Si le problème persiste

1. Vérifiez les logs du backend dans le terminal
2. Vérifiez que vous êtes bien connecté (le token existe dans localStorage)
3. Essayez de vous déconnecter et reconnecter
4. Vérifiez que le backend et le frontend utilisent le même JWT_SECRET

