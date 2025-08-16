# Application de Gestion de Points

Une application web complète pour gérer les points d'une équipe avec authentification, historique des modifications et interface moderne.

## 🚀 Fonctionnalités

### Authentification
- ✅ Inscription et connexion avec email/mot de passe
- ✅ Sessions sécurisées avec JWT
- ✅ Protection des routes

### Gestion des Personnes
- ✅ Créer une personne avec un nom
- ✅ Score initial de 0, maximum de 200 points
- ✅ Visualisation des scores avec barres de progression

### Système de Points
- ✅ Ajouter ou retirer des points avec commentaire obligatoire
- ✅ Historique complet des modifications
- ✅ Statistiques détaillées par personne
- ✅ Possibilité d'annuler une modification

### Interface Utilisateur
- ✅ Design moderne avec TailwindCSS
- ✅ Interface responsive (mobile/desktop)
- ✅ Thème noir et blanc élégant
- ✅ Animations et transitions fluides

## 🛠 Technologies Utilisées

### Backend
- **Node.js** avec Express.js
- **PostgreSQL** avec Prisma ORM
- **JWT** pour l'authentification
- **bcryptjs** pour le hashage des mots de passe
- **express-validator** pour la validation

### Frontend
- **React** 18 avec hooks
- **React Router** pour la navigation
- **TailwindCSS** pour le styling
- **React Hook Form** pour les formulaires
- **Axios** pour les requêtes API
- **React Hot Toast** pour les notifications

## 📁 Structure du Projet

```
/
├── backend/                 # API Express.js
│   ├── prisma/
│   │   └── schema.prisma   # Modèles de base de données
│   ├── routes/
│   │   ├── auth.js         # Routes d'authentification
│   │   ├── persons.js      # Routes de gestion des personnes
│   │   └── points.js       # Routes de gestion des points
│   ├── middleware/
│   │   └── auth.js         # Middleware JWT
│   ├── server.js           # Serveur principal
│   ├── package.json
│   └── .env                # Variables d'environnement
│
├── frontend/               # Application React
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/     # Composants réutilisables
│   │   ├── pages/          # Pages de l'application
│   │   ├── App.js          # Composant principal
│   │   └── index.js        # Point d'entrée
│   ├── package.json
│   └── tailwind.config.js
│
└── README-POINTS-APP.md    # Ce fichier
```

## 🚀 Installation et Démarrage

### Prérequis
- Node.js 18+
- PostgreSQL 12+
- npm ou yarn

### 1. Configuration de la Base de Données

```bash
# Installer PostgreSQL (Ubuntu/Debian)
sudo apt update
sudo apt install postgresql postgresql-contrib

# Créer la base de données
sudo -u postgres psql
CREATE DATABASE points_management;
CREATE USER points_user WITH PASSWORD 'votre_mot_de_passe';
GRANT ALL PRIVILEGES ON DATABASE points_management TO points_user;
\q
```

### 2. Installation du Backend

```bash
# Aller dans le dossier backend
cd backend

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos paramètres de base de données

# Générer le client Prisma et créer les tables
npx prisma generate
npx prisma migrate dev --name init

# Démarrer le serveur de développement
npm run dev
```

Le backend sera accessible sur `http://localhost:3001`

### 3. Installation du Frontend

```bash
# Aller dans le dossier frontend
cd frontend

# Installer les dépendances
npm install

# Démarrer l'application React
npm start
```

Le frontend sera accessible sur `http://localhost:3000`

## 🌐 Déploiement

### Backend sur Render

1. **Créer un compte sur [Render](https://render.com)**

2. **Créer une base de données PostgreSQL**
   - Aller dans "New" → "PostgreSQL"
   - Choisir un nom et une région
   - Noter l'URL de connexion fournie

3. **Déployer l'API**
   - Aller dans "New" → "Web Service"
   - Connecter votre repository GitHub
   - Configurer :
     - **Root Directory**: `backend`
     - **Build Command**: `npm install && npx prisma generate && npx prisma migrate deploy`
     - **Start Command**: `npm start`
   - Ajouter les variables d'environnement :
     ```
     DATABASE_URL=postgresql://...  (URL de votre base Render)
     JWT_SECRET=votre_cle_secrete_super_longue_et_securisee
     NODE_ENV=production
     FRONTEND_URL=https://votre-frontend.github.io
     ```

### Frontend sur GitHub Pages

1. **Préparer le build**
   ```bash
   cd frontend
   
   # Ajouter l'URL de l'API en production
   echo "REACT_APP_API_URL=https://votre-api.onrender.com/api" > .env.production
   
   # Créer le build de production
   npm run build
   ```

2. **Déployer sur GitHub Pages**
   ```bash
   # Installer gh-pages
   npm install --save-dev gh-pages
   
   # Ajouter dans package.json
   "homepage": "https://votre-username.github.io/votre-repo",
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d build"
   }
   
   # Déployer
   npm run deploy
   ```

### Alternative : Déploiement sur Vercel

```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer le frontend
cd frontend
vercel

# Déployer le backend
cd ../backend
vercel
```

## 🔧 Configuration Avancée

### Variables d'Environnement Backend

```env
# Base de données
DATABASE_URL="postgresql://user:password@localhost:5432/points_management"

# JWT
JWT_SECRET="cle_secrete_tres_longue_et_complexe_pour_jwt"

# Serveur
PORT=3001
NODE_ENV=development

# CORS
FRONTEND_URL="http://localhost:3000"
```

### Variables d'Environnement Frontend

```env
# URL de l'API
REACT_APP_API_URL=http://localhost:3001/api
```

## 📊 API Endpoints

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/verify` - Vérifier le token

### Personnes
- `GET /api/persons` - Liste des personnes
- `POST /api/persons` - Créer une personne
- `GET /api/persons/:id` - Détails d'une personne
- `PUT /api/persons/:id` - Modifier une personne
- `DELETE /api/persons/:id` - Supprimer une personne

### Points
- `POST /api/points` - Ajouter/retirer des points
- `GET /api/points/history/:personId` - Historique des points
- `GET /api/points/stats/:personId` - Statistiques
- `DELETE /api/points/:historyId` - Annuler une modification

## 🧪 Tests

### Tester l'API avec curl

```bash
# Test de santé
curl http://localhost:3001/api/health

# Inscription
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Connexion
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## 🔒 Sécurité

- ✅ Hashage des mots de passe avec bcrypt
- ✅ Tokens JWT avec expiration
- ✅ Validation des données d'entrée
- ✅ Protection CORS
- ✅ Rate limiting
- ✅ Headers de sécurité avec Helmet

## 🐛 Dépannage

### Erreurs Communes

1. **Erreur de connexion à la base de données**
   - Vérifier que PostgreSQL est démarré
   - Vérifier l'URL de connexion dans `.env`
   - Exécuter `npx prisma migrate dev`

2. **Erreur CORS**
   - Vérifier que `FRONTEND_URL` est correctement configuré
   - Vérifier que le frontend utilise la bonne URL d'API

3. **Token JWT invalide**
   - Vérifier que `JWT_SECRET` est identique entre les redémarrages
   - Effacer le localStorage du navigateur

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier LICENSE pour plus de détails.

## 👥 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📞 Support

Pour toute question ou problème, ouvrez une issue sur GitHub ou contactez l'équipe de développement.

---

**Développé avec ❤️ en utilisant React, Node.js et PostgreSQL**
