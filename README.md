# Postgen AI - SaaS de Génération de Contenu

Postgen AI est une plateforme SaaS qui transforme une simple idée ou un sujet en contenus de communication multicanaux (posts, visuels, articles, emails, carrousels, etc.), adaptés à chaque plateforme, ton, cible et objectif.

## 🚀 Fonctionnalités

### MVP (Minimum Viable Product)
- **🎯 Génération de contenu multicanal** : Posts LinkedIn, légendes Instagram, tweets, emails courts
- **🎨 Génération de carrousels** : Slides structurés avec design automatique
- **✍️ Articles de blog** : Contenu long structuré pour le SEO
- **🧠 Choix du ton** : Professionnel, amical, inspirant, décontracté
- **📤 Export simple** : Copier-coller ou téléchargement

### Fonctionnalités SaaS
- **👤 Authentification** : Inscription/connexion avec Appwrite
- **🏢 Multi-organisations** : Gestion de plusieurs organisations par utilisateur
- **📊 Dashboard** : Vue d'ensemble des contenus et projets
- **💾 Sauvegarde** : Historique des contenus générés
- **🎨 Branding** : Personnalisation des couleurs et du ton

## 🛠️ Technologies

- **Frontend** : Next.js 15, React 19, TypeScript
 - **UI** : Tailwind CSS, shadcn/ui, Framer Motion
- **Backend** : Appwrite (BaaS)
- **IA** : API Copilot locale
- **Images** : Pexels API

## 📦 Installation

1. **Cloner le projet**
```bash
git clone <repository-url>
cd postgen-ai
```

2. **Installer les dépendances**
```bash
npm install
```


3. **Configuration Appwrite**
   - Créer un projet sur [Appwrite Cloud](https://cloud.appwrite.io)
   - Créer une base de données
   - Créer les collections suivantes :
     - `users` (utilisateurs)
     - `organizations` (organisations)
     - `projects` (projets)
     - `content` (contenus générés)
    - `usage` (suivi de consommation)

4. **Variables d'environnement**
```bash
cp .env.example .env.local
```
Remplir les variables avec vos clés Appwrite et Pexels.

Ajouter également les clés Stripe :
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRICE_PRO=price_pro_id
STRIPE_PRICE_ENTERPRISE=price_enterprise_id
```

5. **Lancer le projet**
```bash
npm run dev
```

## 🏗️ Structure du projet

```
├── app/                    # Pages Next.js
│   ├── auth/              # Page d'authentification
│   ├── dashboard/         # Dashboard principal
│   ├── generate/          # Générateur de contenu
│   └── api/               # API routes
├── components/            # Composants React
│   ├── auth/             # Composants d'authentification
│   ├── dashboard/        # Composants du dashboard
│   └── ui/               # Composants UI réutilisables
├── contexts/             # Contextes React
├── lib/                  # Utilitaires et configuration
└── hooks/                # Hooks personnalisés
```

## 🔧 Configuration Appwrite

### Collections à créer :

1. **users**
   - `name` (string)
   - `email` (string)
   - `organizations` (array)
   - `currentOrganization` (string)
   - `createdAt` (datetime)

2. **organizations**
   - `name` (string)
   - `logo` (string, optional)
   - `plan` (enum: starter, pro, enterprise)
   - `ownerId` (string)
   - `members` (array)
   - `createdAt` (datetime)

3. **projects**
   - `name` (string)
   - `description` (string)
   - `organizationId` (string)
   - `createdBy` (string)
   - `status` (enum: active, paused, completed)
   - `createdAt` (datetime)

4. **content**
   - `organizationId` (string)
   - `projectId` (string, optional)
   - `topic` (string)
   - `content` (json)
   - `type` (enum: social, article, email, carousel)
   - `createdBy` (string)
   - `createdAt` (datetime)
5. **usage**
   - `organizationId` (string)
   - `month` (string, format YYYY-MM)
   - `count` (number)

## 🎯 Roadmap

### Phase 1 - MVP ✅
- [x] Génération de contenu de base
- [x] Interface utilisateur
- [x] Authentification
- [x] Multi-organisations
- [x] Dashboard

### Phase 2 - Fonctionnalités avancées
- [ ] Gestion des projets
- [ ] Historique des contenus
- [ ] Templates personnalisés
- [ ] Collaboration en équipe
- [ ] Analytics de performance

### Phase 3 - Monétisation
- [x] Plans d'abonnement
- [x] Paiements Stripe
- [x] Limites d'usage
- [ ] Fonctionnalités premium

## 🤝 Contribution

Les contributions sont les bienvenues ! Veuillez ouvrir une issue avant de soumettre une pull request.

## 📄 Licence

Ce projet est sous licence MIT.