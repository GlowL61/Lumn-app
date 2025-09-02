class AnthropicMarketplace {
  constructor() {
    this.baseUrl = "https://anthropic-marketplace.ai";
    this.categories = {
      ai_tools: {
        name: "Outils IA",
        products: [
          { name: "Claude Pro Assistant", basePrice: 99.99, trend: -0.02 },
          { name: "Anthropic Research Suite", basePrice: 299.99, trend: 0.01 },
          { name: "AI Safety Toolkit", basePrice: 149.99, trend: -0.05 },
          {
            name: "Constitutional AI Framework",
            basePrice: 199.99,
            trend: 0.03,
          },
          { name: "Claude Enterprise API", basePrice: 999.99, trend: -0.01 },
        ],
      },
      ml_models: {
        name: "Modèles ML",
        products: [
          { name: "Claude-3 Haiku License", basePrice: 49.99, trend: -0.03 },
          { name: "Claude-3 Sonnet License", basePrice: 199.99, trend: 0.02 },
          { name: "Claude-3 Opus License", basePrice: 499.99, trend: -0.01 },
          { name: "Custom Model Training", basePrice: 1999.99, trend: 0.04 },
        ],
      },
      research: {
        name: "Recherche",
        products: [
          { name: "AI Safety Research Papers", basePrice: 29.99, trend: 0.0 },
          {
            name: "Constitutional AI Whitepaper",
            basePrice: 19.99,
            trend: -0.01,
          },
          { name: "Alignment Research Bundle", basePrice: 89.99, trend: 0.02 },
        ],
      },
    };
  }

  async searchAnthropicProducts(query, limit = 5) {
    try {
      const results = [];
      const queryLower = query.toLowerCase();

      for (const [categoryKey, category] of Object.entries(this.categories)) {
        for (const [index, product] of category.products.entries()) {
          if (results.length >= limit) break;

          const relevanceScore = this.calculateRelevance(
            queryLower,
            product.name.toLowerCase(),
            categoryKey,
          );

          if (relevanceScore > 0.3) {
            const currentPrice = this.simulateCurrentPrice(
              product.basePrice,
              product.trend,
            );

            results.push({
              external_id: `anthropic-${categoryKey}-${index}`,
              title: product.name,
              price: currentPrice,
              currency: "USD",
              image_url: `https://anthropic-marketplace.ai/images/${categoryKey}/${index}.jpg`,
              url: `https://anthropic-marketplace.ai/product/${categoryKey}/${index}`,
              platform: "Anthropic AI",
              description: this.generateDescription(product.name, categoryKey),
              category: category.name,
              relevanceScore,
              tags: this.generateTags(product.name, categoryKey),
            });
          }
        }
      }

      return results
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, limit);
    } catch (error) {
      console.error("Error searching Anthropic products:", error);
      return [];
    }
  }

  calculateRelevance(query, productName, category) {
    let score = 0;

    const queryWords = query.split(" ").filter((word) => word.length > 2);
    const productWords = productName
      .split(" ")
      .map((word) => word.toLowerCase());

    queryWords.forEach((queryWord) => {
      productWords.forEach((productWord) => {
        if (
          productWord.includes(queryWord) ||
          queryWord.includes(productWord)
        ) {
          score += 0.4;
        }
      });
    });

    if (
      query.includes("ai") ||
      query.includes("claude") ||
      query.includes("anthropic")
    ) {
      score += 0.6;
    }

    if (query.includes("research") && category === "research") score += 0.5;
    if (query.includes("model") && category === "ml_models") score += 0.5;
    if (query.includes("tool") && category === "ai_tools") score += 0.5;

    return Math.min(1.0, score);
  }

  simulateCurrentPrice(basePrice, trend) {
    const days = Math.floor(Math.random() * 30);
    const randomFluctuation = (Math.random() - 0.5) * 0.1;
    const trendEffect = trend * days;

    const price = basePrice * (1 + trendEffect + randomFluctuation);
    return parseFloat(Math.max(basePrice * 0.5, price).toFixed(2));
  }

  generateDescription(productName, category) {
    const descriptions = {
      ai_tools: `Outil d'intelligence artificielle avancé: ${productName}. Développé par Anthropic avec la technologie Constitutional AI.`,
      ml_models: `Modèle de machine learning de pointe: ${productName}. Licence commerciale pour intégration enterprise.`,
      research: `Publication de recherche en IA: ${productName}. Documentation scientifique approfondie par les experts Anthropic.`,
    };

    return descriptions[category] || `Produit Anthropic: ${productName}`;
  }

  generateTags(productName, category) {
    const baseTags = ["AI", "Anthropic", "Machine Learning"];

    const categoryTags = {
      ai_tools: ["Tools", "Assistant", "Productivity"],
      ml_models: ["Model", "License", "Enterprise"],
      research: ["Research", "Papers", "Academic"],
    };

    const productTags = [];

    if (productName.toLowerCase().includes("claude"))
      productTags.push("Claude");
    if (productName.toLowerCase().includes("safety"))
      productTags.push("AI Safety");
    if (productName.toLowerCase().includes("constitutional"))
      productTags.push("Constitutional AI");
    if (productName.toLowerCase().includes("enterprise"))
      productTags.push("Enterprise");

    return [...baseTags, ...(categoryTags[category] || []), ...productTags];
  }

  async getAnthropicProductById(productId) {
    try {
      const match = productId.match(/anthropic-([^-]+)-(\d+)/);
      if (!match) return null;

      const [, categoryKey, index] = match;
      const category = this.categories[categoryKey];

      if (!category || !category.products[parseInt(index)]) {
        return null;
      }

      const product = category.products[parseInt(index)];
      const currentPrice = this.simulateCurrentPrice(
        product.basePrice,
        product.trend,
      );

      return {
        external_id: productId,
        title: product.name,
        price: currentPrice,
        currency: "USD",
        image_url: `https://anthropic-marketplace.ai/images/${categoryKey}/${index}.jpg`,
        url: `https://anthropic-marketplace.ai/product/${categoryKey}/${index}`,
        platform: "Anthropic AI",
        description: this.generateDescription(product.name, categoryKey),
        category: category.name,
        tags: this.generateTags(product.name, categoryKey),
        aiGenerated: true,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error getting Anthropic product:", error);
      return null;
    }
  }

  async getAnthropicPriceHistory(productId) {
    try {
      const match = productId.match(/anthropic-([^-]+)-(\d+)/);
      if (!match) return [];

      const [, categoryKey, index] = match;
      const category = this.categories[categoryKey];
      const product = category.products[parseInt(index)];

      if (!product) return [];

      const history = [];
      const days = 60;

      for (let i = days; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);

        const trendEffect = product.trend * i;
        const randomFluctuation = (Math.random() - 0.5) * 0.08;
        const seasonalEffect = this.calculateSeasonalEffect(date, categoryKey);

        const price =
          product.basePrice *
          (1 + trendEffect + randomFluctuation + seasonalEffect);

        history.push({
          date: date.toISOString().split("T")[0],
          price: parseFloat(
            Math.max(product.basePrice * 0.6, price).toFixed(2),
          ),
          currency: "USD",
          volume: Math.floor(Math.random() * 100) + 50,
          source: "Anthropic AI Marketplace",
        });
      }

      return history;
    } catch (error) {
      console.error("Error getting Anthropic price history:", error);
      return [];
    }
  }

  calculateSeasonalEffect(date, category) {
    const month = date.getMonth() + 1;

    const seasonalPatterns = {
      ai_tools: {
        1: -0.1, // New Year promotions
        3: 0.05, // Q1 enterprise budgets
        6: -0.05, // Mid-year reviews
        9: 0.1, // Back-to-work season
        11: -0.15, // Black Friday
        12: -0.08, // End of year
      },
      ml_models: {
        1: 0.05,
        4: 0.1, // Conference season
        6: -0.05,
        9: 0.15, // Academic year start
        11: -0.1,
        12: 0.0,
      },
      research: {
        1: 0.0,
        3: 0.1, // Academic publications
        6: 0.05,
        9: 0.2, // Academic year
        11: -0.05,
        12: -0.1,
      },
    };

    return seasonalPatterns[category]?.[month] || 0;
  }

  async getMarketInsights() {
    try {
      const insights = {
        totalProducts: Object.values(this.categories).reduce(
          (sum, cat) => sum + cat.products.length,
          0,
        ),
        averagePrice: 0,
        trendingUp: [],
        trendingDown: [],
        hotDeals: [],
        marketSentiment: this.calculateMarketSentiment(),
        recommendations: [],
      };

      let totalPrice = 0;
      let productCount = 0;

      for (const [, category] of Object.entries(this.categories)) {
        for (const [, product] of category.products.entries()) {
          const currentPrice = this.simulateCurrentPrice(
            product.basePrice,
            product.trend,
          );
          totalPrice += currentPrice;
          productCount++;

          if (product.trend > 0.02) {
            insights.trendingUp.push({
              name: product.name,
              trend: `+${(product.trend * 100).toFixed(1)}%/jour`,
              category: category.name,
            });
          }

          if (product.trend < -0.02) {
            insights.trendingDown.push({
              name: product.name,
              trend: `${(product.trend * 100).toFixed(1)}%/jour`,
              category: category.name,
              savings: product.basePrice - currentPrice,
            });
          }

          if (currentPrice < product.basePrice * 0.8) {
            insights.hotDeals.push({
              name: product.name,
              originalPrice: product.basePrice,
              currentPrice: currentPrice,
              discount: `${((1 - currentPrice / product.basePrice) * 100).toFixed(1)}%`,
              category: category.name,
            });
          }
        }
      }

      insights.averagePrice = parseFloat(
        (totalPrice / productCount).toFixed(2),
      );
      insights.recommendations = this.generateMarketRecommendations(insights);

      return insights;
    } catch (error) {
      console.error("Error getting market insights:", error);
      return { error: "Market analysis failed" };
    }
  }

  calculateMarketSentiment() {
    const trends = Object.values(this.categories).flatMap((cat) =>
      cat.products.map((p) => p.trend),
    );

    const avgTrend =
      trends.reduce((sum, trend) => sum + trend, 0) / trends.length;

    if (avgTrend > 0.01) return { sentiment: "bullish", confidence: 0.8 };
    if (avgTrend < -0.01) return { sentiment: "bearish", confidence: 0.8 };
    return { sentiment: "neutral", confidence: 0.6 };
  }

  generateMarketRecommendations(insights) {
    const recommendations = [];

    if (insights.hotDeals.length > 0) {
      recommendations.push({
        type: "opportunity",
        title: "Bonnes affaires détectées",
        description: `${insights.hotDeals.length} produits IA en promotion`,
        urgency: "medium",
      });
    }

    if (insights.trendingUp.length > insights.trendingDown.length) {
      recommendations.push({
        type: "market_trend",
        title: "Marché en hausse",
        description: "Les prix des outils IA augmentent généralement",
        urgency: "low",
      });
    }

    if (insights.marketSentiment.sentiment === "bearish") {
      recommendations.push({
        type: "timing",
        title: "Bon moment pour acheter",
        description: "Tendance générale à la baisse sur le marché IA",
        urgency: "medium",
      });
    }

    return recommendations;
  }
}

const anthropicMarket = new AnthropicMarketplace();

module.exports = {
  searchAnthropicProducts:
    anthropicMarket.searchAnthropicProducts.bind(anthropicMarket),
  getAnthropicProductById:
    anthropicMarket.getAnthropicProductById.bind(anthropicMarket),
  getAnthropicPriceHistory:
    anthropicMarket.getAnthropicPriceHistory.bind(anthropicMarket),
  getAnthropicMarketInsights:
    anthropicMarket.getMarketInsights.bind(anthropicMarket),
};
