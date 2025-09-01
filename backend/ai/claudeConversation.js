const smartSearch = require("./smartSearch");
const pricePredictor = require("./pricePredictor");
const { searchAllPlatforms } = require("../scrapers");
const pool = require("../db");

class ClaudeConversationEngine {
  constructor() {
    this.conversationHistory = new Map();
    this.contextWindow = 10;

    this.responseTemplates = {
      greeting: [
        "Bonjour ! Je suis votre assistant shopping intelligent. Comment puis-je vous aider à trouver les meilleurs prix aujourd'hui ?",
        "Salut ! Prêt à dénicher de bonnes affaires ? Que recherchez-vous ?",
        "Hello ! Je suis là pour vous aider à économiser. Quel produit vous intéresse ?",
      ],

      search_start: [
        "Parfait ! Je vais chercher '{query}' sur toutes les plateformes...",
        "Excellente idée ! Laissez-moi analyser les prix pour '{query}'...",
        "Je lance ma recherche multi-plateformes pour '{query}'...",
      ],

      price_analysis: [
        "D'après mon analyse, voici ce que je recommande :",
        "Après avoir étudié les tendances, voici mes conseils :",
        "Mes algorithmes d'analyse suggèrent :",
      ],

      no_results: [
        "Hmm, je n'ai pas trouvé de résultats pour '{query}'. Essayons avec des termes plus génériques ?",
        "Pas de résultats pour '{query}'. Voulez-vous que je cherche quelque chose de similaire ?",
        "Aucun produit trouvé pour '{query}'. Reformulons la recherche ?",
      ],
    };
  }

  async processConversation(userId, message) {
    try {
      this.addToHistory(userId, "user", message);

      const intent = this.classifyIntent(message);
      let response;

      switch (intent.type) {
        case "greeting":
          response = this.handleGreeting();
          break;
        case "search":
          response = await this.handleSearch(intent.query);
          break;
        case "price_inquiry":
          response = await this.handlePriceInquiry(intent.productId);
          break;
        case "recommendation":
          response = await this.handleRecommendation(intent.criteria);
          break;
        case "help":
          response = this.handleHelp();
          break;
        default:
          response = await this.handleGeneral(message);
      }

      this.addToHistory(userId, "assistant", response.text);
      return response;
    } catch (error) {
      console.error("Conversation processing error:", error);
      return {
        text: "Désolé, j'ai rencontré une erreur. Pouvez-vous reformuler votre demande ?",
        type: "error",
      };
    }
  }

  classifyIntent(message) {
    if (/bonjour|salut|hello|hey|hi/i.test(message)) {
      return { type: "greeting" };
    }

    if (/aide|help|comment|how/i.test(message)) {
      return { type: "help" };
    }

    if (/prix|price|coût|cost.*produit|product.*\d+/i.test(message)) {
      const productIdMatch = message.match(/produit\s*(\d+)|product\s*(\d+)/i);
      return {
        type: "price_inquiry",
        productId: productIdMatch
          ? parseInt(productIdMatch[1] || productIdMatch[2])
          : null,
      };
    }

    if (
      /recommand|conseil|suggér|que choisir|what.*buy|should.*get/i.test(
        message,
      )
    ) {
      return {
        type: "recommendation",
        criteria: this.extractCriteria(message),
      };
    }

    if (/cherche|trouve|search|find|veux|want|besoin|need/i.test(message)) {
      return {
        type: "search",
        query: this.extractSearchQuery(message),
      };
    }

    return { type: "general", message };
  }

  extractSearchQuery(message) {
    let query = message;

    const searchIndicators =
      /(?:cherche|trouve|search|find|veux|want|besoin|need)\s+(?:un|une|des|a|an|some)?\s*/gi;
    query = query.replace(searchIndicators, "");

    const priceIndicators = /(?:sous|under|moins de|max|maximum)\s*\$?\d+/gi;

    query = query.replace(priceIndicators, "").trim();

    return query.length > 0 ? query : message;
  }

  extractCriteria(message) {
    return smartSearch.parseNaturalQuery(message);
  }

  handleGreeting() {
    const template = this.getRandomTemplate("greeting");
    return {
      text: template,
      type: "greeting",
      suggestions: [
        "Chercher des produits",
        "Voir mes produits suivis",
        "Configurer des alertes",
        "Analyser les tendances",
      ],
    };
  }

  async handleSearch(query) {
    const template = this.getRandomTemplate("search_start").replace(
      "{query}",
      query,
    );

    try {
      const smartAnalysis = smartSearch.parseNaturalQuery(query);
      const searchResults = await searchAllPlatforms(
        smartAnalysis.enhancedQuery,
        8,
      );

      if (searchResults.length === 0) {
        return {
          text: this.getRandomTemplate("no_results").replace("{query}", query),
          type: "no_results",
          suggestions: [
            "Essayer des mots-clés différents",
            "Recherche plus générale",
            "Voir les produits populaires",
          ],
        };
      }

      const smartResults = smartSearch.generateSmartSuggestions(
        query,
        searchResults,
      );

      let responseText = template + "\n\n";
      responseText += `🎯 **Analyse intelligente :**\n`;
      responseText += `- Intent détecté : ${smartResults.analysis.intent.join(", ")}\n`;

      if (smartResults.analysis.priceFilter) {
        responseText += `- Budget analysé : ${JSON.stringify(smartResults.analysis.priceFilter)}\n`;
      }

      responseText += `\n📊 **${searchResults.length} produits trouvés** (classés par pertinence Claude)\n\n`;

      smartResults.enhancedResults.slice(0, 5).forEach((result, index) => {
        responseText += `**${index + 1}. ${result.title}**\n`;
        responseText += `   💰 ${result.currency} ${result.price} sur ${result.platform}\n`;
        responseText += `   🧠 Score Claude: ${result.claudeScore} (${result.reasoning})\n\n`;
      });

      if (smartResults.suggestions.length > 0) {
        responseText += `💡 **Suggestions intelligentes :**\n`;
        smartResults.suggestions.forEach((suggestion) => {
          responseText += `- ${suggestion.title}: ${suggestion.description || suggestion.count + " options"}\n`;
        });
      }

      return {
        text: responseText,
        type: "search_results",
        data: {
          results: smartResults.enhancedResults,
          analysis: smartResults.analysis,
          suggestions: smartResults.suggestions,
        },
      };
    } catch (error) {
      console.error("Search error:", error);
      return {
        text: "Oups ! Une erreur s'est produite lors de la recherche. Réessayons ?",
        type: "error",
      };
    }
  }

  async handlePriceInquiry(productId) {
    if (!productId) {
      return {
        text: "De quel produit voulez-vous connaître l'analyse de prix ? Donnez-moi l'ID du produit.",
        type: "clarification",
      };
    }

    try {
      const prediction = await pricePredictor.predictPriceRange(productId);
      const bestTime = await pricePredictor.getBestTimeToCheck(productId);

      if (prediction.error) {
        return {
          text: `Je n'ai pas assez de données pour analyser ce produit (${prediction.currentData}/${prediction.minData} points requis). Ajoutez-le à votre suivi pour commencer l'analyse !`,
          type: "insufficient_data",
        };
      }

      let responseText = this.getRandomTemplate("price_analysis") + "\n\n";
      responseText += `📊 **Analyse du Produit #${productId}**\n\n`;
      responseText += `💰 **Prix actuel :** ${prediction.currency} ${prediction.currentPrice}\n`;
      responseText += `🔮 **Prédiction (${prediction.daysAhead} jours) :** ${prediction.currency} ${prediction.predictedPrice}\n`;
      responseText += `📈 **Fourchette attendue :** ${prediction.priceRange.min} - ${prediction.priceRange.max}\n`;
      responseText += `🎯 **Confiance :** ${Math.round(prediction.confidence * 100)}%\n\n`;

      responseText += `🧠 **Facteurs d'analyse :**\n`;
      responseText += `- Tendance : ${prediction.factors.trend}\n`;
      responseText += `- Saisonnalité : ${prediction.factors.seasonality}\n`;
      responseText += `- Volatilité : ${prediction.factors.volatility}\n`;
      responseText += `- Catégorie : ${prediction.factors.category}\n\n`;

      responseText += `💡 **Recommandation Claude :**\n`;
      responseText += `🎬 **Action :** ${prediction.recommendation.action.toUpperCase()}\n`;
      responseText += `📝 **Raison :** ${prediction.recommendation.reason}\n`;
      responseText += `⏰ **Timing :** ${prediction.recommendation.timing}\n`;
      responseText += `🚨 **Urgence :** ${prediction.recommendation.urgency}\n\n`;

      if (bestTime.bestHour !== undefined) {
        responseText += `⏰ **Meilleur moment pour vérifier :** ${bestTime.bestHour}:00\n`;
        responseText += `📊 ${bestTime.analysis}`;
      }

      return {
        text: responseText,
        type: "price_analysis",
        data: {
          prediction,
          bestTime,
        },
      };
    } catch (error) {
      console.error("Price inquiry error:", error);
      return {
        text: "Erreur lors de l'analyse des prix. Réessayez plus tard.",
        type: "error",
      };
    }
  }

  async handleRecommendation(criteria) {
    try {
      const recentProducts = await pool.query(
        `SELECT p.*, pl.name as platform_name, pr.price, pr.currency
         FROM products p 
         JOIN platforms pl ON p.platform_id = pl.id 
         LEFT JOIN prices pr ON p.id = pr.product_id 
         WHERE pr.fetched_at = (
           SELECT MAX(fetched_at) FROM prices WHERE product_id = p.id
         )
         ORDER BY pr.fetched_at DESC 
         LIMIT 10`,
      );

      let responseText = "🎯 **Mes recommandations personnalisées :**\n\n";

      if (recentProducts.rows.length === 0) {
        responseText +=
          "Vous n'avez pas encore de produits suivis. Commencez par rechercher des produits pour que je puisse vous faire des recommandations personnalisées !";
      } else {
        responseText +=
          "Basé sur vos produits suivis, voici ce que je suggère :\n\n";

        for (const product of recentProducts.rows.slice(0, 3)) {
          const prediction = await pricePredictor.predictPriceRange(
            product.id,
            14,
          );
          if (!prediction.error) {
            responseText += `📦 **${product.title}**\n`;
            responseText += `   💰 Prix actuel : ${product.currency} ${product.price}\n`;
            responseText += `   🔮 Tendance : ${prediction.factors.trend}\n`;
            responseText += `   💡 ${prediction.recommendation.action}: ${prediction.recommendation.reason}\n\n`;
          }
        }
      }

      responseText += `🌟 **Conseils généraux Claude :**\n`;
      responseText += `- Activez les alertes pour ne jamais rater une promo\n`;
      responseText += `- Vérifiez les prix le matin et le soir pour les meilleures offres\n`;
      responseText += `- Comparez toujours au moins 3 plateformes\n`;
      responseText += `- Surveillez les cycles saisonniers (ex: électronique en Q4)`;

      return {
        text: responseText,
        type: "recommendation",
        data: {
          trackedProducts: recentProducts.rows.length,
          criteria,
        },
      };
    } catch (error) {
      console.error("Recommendation error:", error);
      return {
        text: "Erreur lors de la génération de recommendations. Réessayez plus tard.",
        type: "error",
      };
    }
  }

  handleHelp() {
    return {
      text: `🤖 **Assistant Claude - Guide d'utilisation**\n\n**Je peux vous aider à :**\n- 🔍 "Trouve-moi des laptops gaming sous 1000€"\n- 📊 "Analyse le prix du produit 15"\n- 💡 "Recommande-moi des bonnes affaires"\n- ⚡ "Configure une alerte pour ce produit"\n- 📈 "Montre-moi les tendances de prix"\n\n**Exemples de questions :**\n- "Quel est le meilleur moment pour acheter ?"\n- "Compare les prix entre Amazon et eBay"\n- "Y a-t-il des promos prévues cette semaine ?"\n\n**💡 Astuce :** Parlez-moi naturellement, je comprends le contexte !`,
      type: "help",
      suggestions: [
        "Rechercher des produits",
        "Analyser un prix",
        "Voir les recommendations",
        "Configurer des alertes",
      ],
    };
  }

  async handleGeneral(message) {
    const smartAnalysis = smartSearch.parseNaturalQuery(message);

    if (smartAnalysis.extractedTerms.length > 0) {
      return await this.handleSearch(smartAnalysis.enhancedQuery);
    }

    return {
      text: "Je ne suis pas sûr de comprendre. Voulez-vous :\n- 🔍 Rechercher un produit\n- 📊 Analyser des prix\n- 💡 Obtenir des recommandations\n- ❓ Voir l'aide\n\nDites-moi simplement ce que vous cherchez !",
      type: "clarification",
      suggestions: [
        "Rechercher des produits",
        "Analyser les prix",
        "Voir l'aide",
        "Recommendations",
      ],
    };
  }

  addToHistory(userId, role, content) {
    if (!this.conversationHistory.has(userId)) {
      this.conversationHistory.set(userId, []);
    }

    const history = this.conversationHistory.get(userId);
    history.push({
      role,
      content,
      timestamp: new Date().toISOString(),
    });

    if (history.length > this.contextWindow) {
      history.shift();
    }
  }

  getRandomTemplate(type) {
    const templates = this.responseTemplates[type];
    return templates[Math.floor(Math.random() * templates.length)];
  }

  async generateContextualResponse(userId, products, query) {
    const history = this.conversationHistory.get(userId) || [];
    const recentQueries = history
      .filter((h) => h.role === "user")
      .slice(-3)
      .map((h) => h.content);

    const context = {
      hasRecentSearches: recentQueries.length > 0,
      previousTopics: recentQueries,
      productCount: products.length,
      query,
    };

    let contextualPrefix = "";

    if (context.hasRecentSearches) {
      const lastQuery = recentQueries[recentQueries.length - 1];
      if (
        lastQuery &&
        query.toLowerCase().includes(lastQuery.toLowerCase().split(" ")[0])
      ) {
        contextualPrefix =
          "Je vois que vous continuez à chercher des produits similaires. ";
      }
    }

    return contextualPrefix;
  }

  async getSmartInsights(searchResults) {
    if (searchResults.length === 0) return null;

    const platforms = [...new Set(searchResults.map((r) => r.platform))];
    const prices = searchResults.map((r) => r.price).filter((p) => p != null);

    if (prices.length === 0) return null;

    const avgPrice =
      prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceSpread = ((maxPrice - minPrice) / avgPrice) * 100;

    return {
      platformCount: platforms.length,
      priceRange: { min: minPrice, max: maxPrice, avg: avgPrice },
      priceSpread: Math.round(priceSpread),
      bestDeal: searchResults.find((r) => r.price === minPrice),
      insights: [
        priceSpread > 30
          ? "Écart de prix important entre plateformes"
          : "Prix relativement homogènes",
        platforms.includes("Amazon")
          ? "Amazon disponible pour livraison rapide"
          : null,
        minPrice < avgPrice * 0.8 ? "Excellente affaire détectée !" : null,
      ].filter(Boolean),
    };
  }
}

module.exports = new ClaudeConversationEngine();
