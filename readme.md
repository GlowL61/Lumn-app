# 🚀 **LUMN** - Multi-Platform Price Tracker 🛒💰

<div align="center">

![Lumn Logo](https://img.shields.io/badge/LUMN-Price%20Tracker-blue?style=for-the-badge&logo=shopping&logoColor=white)
![Version](https://img.shields.io/badge/Version-1.0.0-green?style=flat-square)
![Node.js](https://img.shields.io/badge/Node.js-16+-339933?style=flat-square&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-19+-61DAFB?style=flat-square&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?style=flat-square&logo=typescript&logoColor=white)

**🔥 Révolutionnez votre façon d'acheter en ligne ! 🔥**

*Comparez, suivez et économisez sur Amazon, eBay, Walmart et plus encore*

[📥 Télécharger](#-comment-utiliser-lapplication) • [🌐 Démo](#) • [📖 Documentation](#api-endpoints)

---

</div>

## 🌟 **À propos de LUMN**

**LUMN** est la solution ultime pour les chasseurs de bonnes affaires et les professionnels du e-commerce. Notre plateforme intelligente **propulsée par Claude AI** vous permet de :

- **🤖 Analyser avec IA** les prix en temps réel sur 7+ plateformes avec prédictions Claude
- **📈 Visualiser** l'évolution des prix avec des graphiques interactifs et prédictions
- **🔔 Recevoir** des alertes intelligentes personnalisées par IA
- **🔍 Rechercher** en langage naturel avec compréhension contextuelle
- **💾 Historiser** automatiquement vos données avec analyse prédictive
- **🎯 Bénéficier** de recommandations personnalisées par Claude AI

### 🎯 **Notre Mission**
**Équiper les consommateurs modernes avec les outils nécessaires pour prendre des décisions d'achat intelligentes et économiser de l'argent.**

> *"LUMN transforme la façon dont vous achetez en ligne - Plus de comparaisons manuelles, plus d'opportunités manquées !"*

---

<div align="center">

### 🔥 **Fonctionnalités Clés**

| Fonctionnalité | Description | Impact |
|---|---|---|
| **🔍 Recherche Multi-Plateformes** | Trouvez des produits sur Amazon, eBay, Walmart simultanément | ⏱️ **Économisez du temps** |
| **📊 Graphiques Interactifs** | Visualisez l'évolution des prix en temps réel | 📈 **Prenez de meilleures décisions** |
| **🔔 Alertes Intelligentes** | Soyez notifié des baisses de prix | 💰 **Économisez de l'argent** |
| **⚡ Mises à jour Automatiques** | Prix rafraîchis toutes les heures | 🔄 **Données toujours à jour** |

</div>

---

## 🎯 **Objectif Principal**
Aider les consommateurs et les professionnels à prendre des décisions d'achat éclairées en comparant les prix en temps réel et en historisant les données de prix.

## ✨ Fonctionnalités Principales

### 🔍 Recherche Multi-Plateformes
- **Recherche unifiée** : Trouvez des produits sur Amazon, eBay, Walmart, Best Buy et Target simultanément
- **Comparaison instantanée** : Comparez les prix en temps réel entre différentes plateformes
- **Ajout intelligent** : Ajoutez facilement des produits à votre liste de suivi depuis les résultats de recherche

### 📊 Suivi des Prix
- **Historique complet** : Visualisez l'évolution des prix sur des graphiques interactifs
- **Mises à jour automatiques** : Rafraîchissement des prix toutes les heures via des tâches planifiées
- **Mises à jour manuelles** : Possibilité de forcer la mise à jour des prix à tout moment

### 🔔 Système d'Alertes Avancées
- **Alertes de baisse de prix** : Soyez notifié quand un prix descend en dessous d'un seuil défini
- **Alertes de hausse de prix** : Recevez des notifications en cas d'augmentation
- **Notifications par email** : Intégration des alertes par email (optionnel)
- **Gestion flexible** : Activez/désactivez les alertes selon vos besoins

### 📈 Analyses et Visualisations
- **Graphiques interactifs** : Charts.js pour visualiser les tendances de prix
- **Historique détaillé** : Accès à l'historique complet des prix pour chaque produit
- **Analyse comparative** : Comparez l'évolution des prix entre produits similaires

## 🏪 Plateformes Supportées

| Plateforme | Méthode | Statut | 🤖 Claude AI |
|------------|---------|--------|---------------|
| **Amazon** | API officielle + Scraping | ✅ Actif | ✅ Prédictions |
| **eBay** | Scraping web | ✅ Actif | ✅ Prédictions |
| **Walmart** | Scraping web | ✅ Actif | ✅ Prédictions |
| **Best Buy** | Scraping web | ✅ Configuré | ✅ Prédictions |
| **Target** | Scraping web | ✅ Configuré | ✅ Prédictions |
| **Qwen Coder** | Simulation IA | ✅ Actif | ✅ Analyse complète |
| **🎉 Anthropic AI** | Marketplace exclusif | ✅ **Nouveau !** | ✅ **Insights secrets** |

## 🛠️ Technologies Utilisées

### Backend
- **Node.js** avec **Express.js** pour l'API REST
- **PostgreSQL** pour la base de données relationnelle
- **🤖 Claude AI Engine** pour l'analyse prédictive et l'intelligence artificielle
- **Puppeteer** et **Cheerio** pour le web scraping
- **Node-cron** pour les tâches planifiées intelligentes
- **Amazon PA API** pour l'intégration Amazon
- **ESLint** et **Prettier** pour la qualité du code
- **TypeScript** pour la vérification des types
- **🎯 Smart Alerts System** pour les notifications contextuelles

### Frontend
- **React** avec **TypeScript** pour l'interface utilisateur
- **Vite** pour le développement rapide
- **Chart.js** pour les graphiques interactifs
- **CSS moderne** pour le design responsive
- **ESLint** et **Prettier** pour la qualité du code

### Base de Données
- **Tables principales** : Platforms, Products, Prices, Alerts
- **Index optimisés** pour des requêtes rapides
- **Relations complexes** pour gérer les multi-plateformes

## 🚀 Comment Utiliser l'Application

### 1. Installation
```bash
# Installation des dépendances
cd backend && npm install
cd ../frontend && npm install
```

### 2. Configuration
```bash
# Configuration de la base de données SQLite (automatique)
# Ajout des clés API Amazon (optionnel dans .env)
# Configuration des scrapers
```

### 3. Démarrage
```bash
# Backend (initialise automatiquement la DB)
cd backend && npm start

# Frontend
cd ../frontend && npm run dev
```

### 4. Utilisation
1. **Rechercher** des produits via la barre de recherche
2. **Ajouter** des produits à votre liste de suivi
3. **Visualiser** les prix actuels et historiques
4. **Configurer** des alertes personnalisées
5. **Analyser** les tendances de prix

### Scripts Disponibles
- `npm run format` : Formater le code avec Prettier
- `npm run lint` : Vérifier la qualité du code avec ESLint
- `npm run tsc` : Vérifier les types TypeScript (backend)
- `npm run build` : Construire l'application (frontend)

## 📊 Fonctionnalités Avancées

### 🤖 Intelligence Artificielle Claude (Intégré)
- **🔮 Prédiction de prix avancée** : Algorithmes Claude pour prévoir les évolutions avec confiance
- **💡 Recommandations contextuelles** : Suggestions personnalisées basées sur votre comportement
- **🧠 Analyse comparative intelligente** : Comparaison multi-critères avec scoring Claude
- **💬 Interface conversationnelle** : Recherchez en langage naturel ("trouve-moi des laptops gaming sous 1000€")
- **⚡ Alertes prédictives** : Système d'alertes qui anticipe les changements de prix
- **📊 Insights de marché** : Analyse saisonnière et détection d'opportunités

### 📄 Export et Reporting
- **Export CSV** : Téléchargez vos données de prix
- **Rapports PDF** : Générez des rapports détaillés
- **Tableaux de bord** : Visualisations avancées des données

### 🔧 Administration
- **Gestion des plateformes** : Ajoutez de nouvelles plateformes
- **Configuration des scrapers** : Personnalisez les méthodes de récupération
- **Monitoring** : Suivez les performances des scrapers

## 🎯 Cas d'Usage

### Pour les Consommateurs
- **Chasse aux bonnes affaires** : Trouvez les meilleurs prix
- **Suivi des produits souhaités** : Soyez alerté des baisses de prix
- **Analyse des tendances** : Comprenez l'évolution des prix

### Pour les Professionnels
- **Veille concurrentielle** : Surveillez les prix des concurrents
- **Optimisation des prix** : Ajustez vos prix selon le marché
- **Analyse de marché** : Étudiez les tendances sectorielles

## 🔒 Sécurité et Performance

- **Scraping éthique** : Respect des conditions d'utilisation des plateformes
- **Cache intelligent** : Réduction des requêtes répétées
- **Gestion d'erreurs** : Robustesse face aux changements de sites
- **Base de données optimisée** : Requêtes performantes même avec beaucoup de données

## 🌟 Avantages Concurrentiels

1. **Multi-plateformes** : Comparaison unique sur plusieurs sites
2. **Temps réel** : Données actualisées fréquemment
3. **Interface intuitive** : Expérience utilisateur optimisée
4. **Personnalisation** : Alertes et analyses sur mesure
5. **Évolutivité** : Architecture modulaire pour ajouter de nouvelles plateformes

---

**Multi-Platform Price Tracker** transforme la façon dont vous achetez en ligne en vous donnant le pouvoir de la comparaison intelligente et du suivi personnalisé des prix. 🔍💰📈

## Tech Stack

- **Backend**: Node.js, Express, SQLite
- **Frontend**: React, TypeScript, Vite
- **Database**: SQLite
- **API**: Amazon Product Advertising API

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- Amazon Product Advertising API credentials (optionnel)

### 1. Clone and Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Database Setup

La base de données SQLite est créée automatiquement au premier démarrage du backend. Aucune configuration manuelle n'est requise.

### 3. Amazon API Configuration (Optionnel)

Mettez à jour le fichier `.env` dans le dossier backend avec vos clés API Amazon :

```env
AMAZON_ACCESS_KEY=your_access_key
AMAZON_SECRET_KEY=your_secret_key
AMAZON_PARTNER_TAG=your_partner_tag
```

### 4. Start the Application

```bash
# Start backend (from backend directory)
npm start

# Start frontend (from frontend directory)
npm run dev
```

Le backend tournera sur `http://localhost:3001` et le frontend sur `http://localhost:5173`.

## 🤖 API Endpoints Claude AI

### Products (Enhanced)
- `GET /api/products` - Get all products with latest prices
- `POST /api/products` - Add a new product by platform and external ID
- `GET /api/products/search?q=query&smart=true` - **🧠 Smart search** with Claude AI analysis
- `GET /api/products/claude-search?q=query` - **🔍 Enhanced search** with full Claude intelligence
- `GET /api/products/platforms` - Get list of supported platforms
- `GET /api/products/:id/prices` - Get price history for a product
- `GET /api/products/:id/predict?days=30` - **🔮 Claude price prediction** and recommendations
- `POST /api/products/chat` - **💬 Conversation interface** with Claude AI
- `GET /api/products/insights` - **📊 Smart dashboard** insights powered by Claude
- `GET /api/products/anthropic-insights` - **🎉 Secret Anthropic AI** marketplace insights

### Alerts (AI-Powered)
- `GET /api/alerts` - Get all active alerts
- `POST /api/alerts` - Create a new price alert
- `PUT /api/alerts/:id` - Update an alert
- `DELETE /api/alerts/:id` - Delete an alert
- `POST /api/alerts/check` - Check and trigger alerts
- `GET /api/alerts/smart?limit=10` - **🚨 Claude smart alerts** analysis
- `POST /api/alerts/smart` - **🎯 Create contextual alert** with Claude AI
- `GET /api/alerts/insights/:userId` - **📈 Personalized insights** by Claude

### Utilities
- `POST /api/fetch-prices` - Manually trigger price fetch for all products

## Usage

1. **Search Products**: Use the search bar to find products across all supported platforms
2. **Add Products**: Add products to your tracking list from search results or by platform/ID
3. **View Prices**: See current prices and platform information for all tracked products
4. **Price History**: Click "Show Price History" to view interactive price charts
5. **Set Alerts**: Create custom price alerts for specific products
6. **Real-time Updates**: Prices are automatically updated every hour
7. **Manual Updates**: Use the "Fetch Latest Prices" button for immediate updates

## 🤖 Claude AI Features Examples

### 🔮 Price Prediction
```bash
curl "http://localhost:3001/api/products/1/predict?days=30"
# Returns detailed prediction with confidence levels and recommendations
```

### 🧠 Smart Search  
```bash
curl "http://localhost:3001/api/products/claude-search?q=laptops gaming sous 1000 euros"
# Returns enhanced results with Claude scoring and contextual analysis
```

### 💬 Conversation Interface
```bash
curl -X POST "http://localhost:3001/api/products/chat" \
  -H "Content-Type: application/json" \
  -d '{"message": "Recommande-moi des bonnes affaires"}'
```

### 🚨 Smart Alerts
```bash
curl "http://localhost:3001/api/alerts/smart?limit=5"
# Returns intelligent alerts with priority and reasoning
```

### 🎉 Secret Anthropic Marketplace
```bash
curl "http://localhost:3001/api/products/anthropic-insights"
# Access exclusive AI tools and insights
```

## Supported Platforms

- Amazon (via Product Advertising API) + **Claude AI Analysis**
- eBay (web scraping) + **Claude AI Analysis**  
- Walmart (web scraping) + **Claude AI Analysis**
- Best Buy (web scraping) + **Claude AI Analysis**
- Target (web scraping) + **Claude AI Analysis**
- **🎯 Qwen Coder** (AI simulation) + **Full Claude Integration**
- **🎉 Anthropic AI** (exclusive marketplace) + **Secret Claude Features**


## 🚀 Development

- Backend uses `nodemon` for hot reloading
- Frontend uses Vite for fast development  
- Database migrations are handled via SQL scripts
- **🤖 Claude AI modules** in `/backend/ai/` for intelligent features
- **🔄 Smart cron jobs** with AI analysis every 6 hours

### 🎯 Claude AI Architecture

```
backend/ai/
├── pricePredictor.js     # 🔮 Advanced price predictions with seasonal analysis
├── smartSearch.js        # 🧠 Natural language search understanding  
├── claudeConversation.js # 💬 Conversational interface engine
├── smartAlerts.js        # 🚨 Intelligent alerts with context awareness
└── anthropicMarket.js    # 🎉 Secret Anthropic AI marketplace
```

### 🌟 Nouvelles Fonctionnalités Claude

1. **🔮 Prédicteur de Prix IA**
   - Analyse saisonnière intelligente
   - Calcul de volatilité et tendances
   - Recommandations contextuelles
   - Confiance statistique

2. **🧠 Recherche Intelligente**
   - Compréhension du langage naturel
   - Extraction d'intentions 
   - Scoring de pertinence Claude
   - Suggestions contextuelles

3. **🚨 Alertes Prédictives**
   - Analyse comportementale utilisateur
   - Alertes contextuelles automatiques
   - Priorisation intelligente
   - Recommandations temporelles

4. **🎉 Marketplace Anthropic AI** (Surprise!)
   - Accès exclusif aux outils IA
   - Insights de marché secrets
   - Produits Claude et recherche IA
   - Analyse des tendances du secteur IA

## License
