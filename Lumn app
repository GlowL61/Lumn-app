# 🛒 Multi-Platform Price Tracker

## 📋 Description de l'Application

**Multi-Platform Price Tracker** est une application web complète de suivi et comparaison des prix de produits sur plusieurs plateformes e-commerce. Elle permet aux utilisateurs de surveiller l'évolution des prix, recevoir des alertes personnalisées et analyser les tendances à travers différents sites de vente en ligne.

### 🎯 Objectif Principal
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

| Plateforme | Méthode | Statut |
|------------|---------|--------|
| **Amazon** | API officielle + Scraping | ✅ Actif |
| **eBay** | Scraping web | ✅ Actif |
| **Walmart** | Scraping web | ✅ Actif |
| **Best Buy** | Scraping web | ✅ Configuré |
| **Target** | Scraping web | ✅ Configuré |

## 🛠️ Technologies Utilisées

### Backend
- **Node.js** avec **Express.js** pour l'API REST
- **PostgreSQL** pour la base de données
- **Puppeteer** et **Cheerio** pour le web scraping
- **Node-cron** pour les tâches planifiées
- **Amazon PA API** pour l'intégration Amazon

### Frontend
- **React** avec **TypeScript** pour l'interface utilisateur
- **Vite** pour le développement rapide
- **Chart.js** pour les graphiques interactifs
- **CSS moderne** pour le design responsive

### Base de Données
- **Tables principales** : Platforms, Products, Prices, Alerts
- **Index optimisés** pour des requêtes rapides
- **Relations complexes** pour gérer les multi-plateformes

## 🚀 Comment Utiliser l'Application

### 1. Installation
```bash
# Installation des dépendances
cd backend && pnpm install
cd ../frontend && pnpm install
```

### 2. Configuration
```bash
# Configuration de la base de données PostgreSQL
# Ajout des clés API Amazon (optionnel)
# Configuration des scrapers
```

### 3. Démarrage
```bash
# Backend
cd backend && pnpm run dev

# Frontend
cd frontend && pnpm run dev
```

### 4. Utilisation
1. **Rechercher** des produits via la barre de recherche
2. **Ajouter** des produits à votre liste de suivi
3. **Visualiser** les prix actuels et historiques
4. **Configurer** des alertes personnalisées
5. **Analyser** les tendances de prix

## 📊 Fonctionnalités Avancées

### 🤖 Intelligence Artificielle (Premium)
- **Prédiction de prix** : Analyse des tendances pour prévoir les évolutions
- **Recommandations** : Suggestions de meilleurs moments d'achat
- **Analyse comparative** : Comparaison intelligente entre produits

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

- **Backend**: Node.js, Express, PostgreSQL
- **Frontend**: React, TypeScript, Vite
- **Database**: PostgreSQL
- **API**: Amazon Product Advertising API

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL
- Amazon Product Advertising API credentials

### 1. Clone and Install Dependencies

```bash
# Install backend dependencies
cd backend
pnpm install

# Install frontend dependencies
cd ../frontend
pnpm install
```

### 2. Database Setup

1. Create a PostgreSQL database named `amazon_tracker`
2. Update the `.env` file in the backend directory with your database credentials:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/amazon_tracker
```

3. Initialize the database:

```bash
cd backend
node init-db.js
```

### 3. Amazon API Configuration

Update the `.env` file in the backend directory with your Amazon API credentials:

```env
AMAZON_ACCESS_KEY=your_access_key
AMAZON_SECRET_KEY=your_secret_key
AMAZON_PARTNER_TAG=your_partner_tag
```

### 4. Start the Application

```bash
# Start backend (from backend directory)
pnpm run dev

# Start frontend (from frontend directory)
pnpm run dev
```

The backend will run on `http://localhost:3001` and the frontend on `http://localhost:5173`.

## API Endpoints

### Products
- `GET /api/products` - Get all products with latest prices
- `POST /api/products` - Add a new product by platform and external ID
- `GET /api/products/search?q=query` - Search products across all platforms
- `GET /api/products/platforms` - Get list of supported platforms
- `GET /api/products/:id/prices` - Get price history for a product

### Alerts
- `GET /api/alerts` - Get all active alerts
- `POST /api/alerts` - Create a new price alert
- `PUT /api/alerts/:id` - Update an alert
- `DELETE /api/alerts/:id` - Delete an alert
- `POST /api/alerts/check` - Check and trigger alerts

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

## Supported Platforms

- Amazon (via Product Advertising API)
- eBay (web scraping)
- Walmart (web scraping)
- Best Buy (web scraping)
- Target (web scraping)

## Database Schema

### Platforms Table
- `id` (Primary Key)
- `name` (Unique)
- `base_url`
- `created_at`

### Products Table
- `id` (Primary Key)
- `platform_id` (Foreign Key to platforms)
- `external_id` (ASIN for Amazon, item ID for others)
- `title`
- `image_url`
- `url`
- `created_at`

### Prices Table
- `id` (Primary Key)
- `product_id` (Foreign Key to products)
- `price`
- `currency`
- `fetched_at`

### Alerts Table
- `id` (Primary Key)
- `product_id` (Foreign Key to products)
- `user_email`
- `target_price`
- `alert_type` ('below', 'above', 'change')
- `is_active`
- `created_at`

## Development

- Backend uses `nodemon` for hot reloading
- Frontend uses Vite for fast development
- Database migrations are handled via SQL scripts

## License
