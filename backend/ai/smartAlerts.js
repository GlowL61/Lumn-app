const pool = require("../db");
const pricePredictor = require("./pricePredictor");

class ClaudeSmartAlerts {
  constructor() {
    this.alertTypes = {
      price_drop: "Prix en baisse",
      price_surge: "Prix en hausse",
      best_time: "Meilleur moment d'achat",
      stock_alert: "Alerte stock",
      trend_change: "Changement de tendance",
      seasonal_opportunity: "Opportunité saisonnière",
    };

    this.urgencyLevels = {
      low: { priority: 1, color: "#28a745", delay: "24h" },
      medium: { priority: 2, color: "#ffc107", delay: "6h" },
      high: { priority: 3, color: "#dc3545", delay: "1h" },
      critical: { priority: 4, color: "#e83e8c", delay: "immediate" },
    };
  }

  async analyzeAndCreateSmartAlerts() {
    try {
      const products = await pool.query(`
        SELECT p.*, pl.name as platform_name, pr.price, pr.currency, pr.fetched_at
        FROM products p 
        JOIN platforms pl ON p.platform_id = pl.id 
        LEFT JOIN prices pr ON p.id = pr.product_id 
        WHERE pr.fetched_at = (
          SELECT MAX(fetched_at) FROM prices WHERE product_id = p.id
        )
        ORDER BY pr.fetched_at DESC
      `);

      const smartAlerts = [];

      for (const product of products.rows) {
        if (!product.price) continue;

        const prediction = await pricePredictor.predictPriceRange(
          product.id,
          7,
        );
        if (prediction.error) continue;

        const alerts = await this.generateProductAlerts(product, prediction);
        smartAlerts.push(...alerts);
      }

      return {
        alertsGenerated: smartAlerts.length,
        alerts: smartAlerts,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Smart alerts analysis error:", error);
      return { error: "Alert analysis failed" };
    }
  }

  async generateProductAlerts(product, prediction) {
    const alerts = [];
    const currentPrice = product.price;
    const predictedPrice = prediction.predictedPrice;
    const priceChange = ((predictedPrice - currentPrice) / currentPrice) * 100;

    if (priceChange < -15) {
      alerts.push({
        productId: product.id,
        productTitle: product.title,
        type: "price_drop",
        urgency: "high",
        message: `🚨 Baisse importante prévue pour "${product.title}" - ${Math.abs(priceChange).toFixed(1)}% de réduction attendue !`,
        details: {
          currentPrice: currentPrice,
          predictedPrice: predictedPrice,
          savings: currentPrice - predictedPrice,
          confidence: prediction.confidence,
          timeframe: "7 jours",
        },
        action: "ATTENDEZ avant d'acheter",
        reasoning: prediction.recommendation.reason,
      });
    }

    if (priceChange > 20) {
      alerts.push({
        productId: product.id,
        productTitle: product.title,
        type: "price_surge",
        urgency: "critical",
        message: `⚡ Hausse critique prévue pour "${product.title}" - +${priceChange.toFixed(1)}% ! Achetez MAINTENANT !`,
        details: {
          currentPrice: currentPrice,
          predictedPrice: predictedPrice,
          extraCost: predictedPrice - currentPrice,
          confidence: prediction.confidence,
          timeframe: "7 jours",
        },
        action: "ACHETEZ IMMÉDIATEMENT",
        reasoning: prediction.recommendation.reason,
      });
    }

    if (
      prediction.factors.trend === "decreasing" &&
      prediction.confidence > 0.7
    ) {
      alerts.push({
        productId: product.id,
        productTitle: product.title,
        type: "trend_change",
        urgency: "medium",
        message: `📉 Tendance baissière confirmée pour "${product.title}" (confiance: ${Math.round(prediction.confidence * 100)}%)`,
        details: {
          trend: prediction.factors.trend,
          confidence: prediction.confidence,
          category: prediction.factors.category,
        },
        action: "Surveillez de près",
        reasoning: "Opportunité d'achat potentielle",
      });
    }

    if (prediction.factors.seasonality === "discount") {
      alerts.push({
        productId: product.id,
        productTitle: product.title,
        type: "seasonal_opportunity",
        urgency: "low",
        message: `🍂 Période saisonnière favorable pour "${product.title}" dans la catégorie ${prediction.factors.category}`,
        details: {
          season: prediction.factors.seasonality,
          category: prediction.factors.category,
        },
        action: "Bon moment pour acheter",
        reasoning: "Facteurs saisonniers favorables",
      });
    }

    return alerts;
  }

  async getActiveSmartAlerts(limit = 10) {
    try {
      const analysisResult = await this.analyzeAndCreateSmartAlerts();
      if (analysisResult.error) return analysisResult;

      const sortedAlerts = analysisResult.alerts
        .sort(
          (a, b) =>
            this.urgencyLevels[b.urgency].priority -
            this.urgencyLevels[a.urgency].priority,
        )
        .slice(0, limit);

      return {
        alerts: sortedAlerts,
        summary: {
          total: analysisResult.alertsGenerated,
          critical: sortedAlerts.filter((a) => a.urgency === "critical").length,
          high: sortedAlerts.filter((a) => a.urgency === "high").length,
          medium: sortedAlerts.filter((a) => a.urgency === "medium").length,
          low: sortedAlerts.filter((a) => a.urgency === "low").length,
        },
        nextAnalysis: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
      };
    } catch (error) {
      console.error("Error getting smart alerts:", error);
      return { error: "Failed to generate smart alerts" };
    }
  }

  async createContextualAlert(productId, userBehavior = {}) {
    try {
      const product = await pool.query("SELECT * FROM products WHERE id = $1", [
        productId,
      ]);

      if (product.rows.length === 0) {
        return { error: "Product not found" };
      }

      const prediction = await pricePredictor.predictPriceRange(productId, 14);
      if (prediction.error) {
        return { error: "Cannot analyze product" };
      }

      const contextualRules = this.analyzeUserContext(userBehavior, prediction);

      const smartAlert = {
        productId,
        targetPrice: this.calculateOptimalPrice(prediction, contextualRules),
        alertType: contextualRules.recommendedAlertType,
        urgency: contextualRules.urgency,
        reasoning: contextualRules.reasoning,
        autoAdjust: true,
        claudeGenerated: true,
        context: contextualRules,
      };

      return smartAlert;
    } catch (error) {
      console.error("Contextual alert creation error:", error);
      return { error: "Alert creation failed" };
    }
  }

  analyzeUserContext(userBehavior, prediction) {
    const context = {
      urgency: "medium",
      recommendedAlertType: "below",
      reasoning: "",
      priceAdjustment: 0,
    };

    if (userBehavior.searchFrequency > 5) {
      context.urgency = "high";
      context.reasoning += "Recherches fréquentes détectées. ";
      context.priceAdjustment -= 0.05;
    }

    if (prediction.recommendation.urgency === "high") {
      context.urgency = "critical";
      context.reasoning += "Hausse de prix imminente. ";
    }

    if (prediction.factors.volatility === "high") {
      context.recommendedAlertType = "change";
      context.reasoning +=
        "Prix très volatile, surveillance accrue recommandée. ";
    }

    if (prediction.factors.seasonality === "discount") {
      context.priceAdjustment -= 0.1;
      context.reasoning += "Période saisonnière favorable. ";
    }

    return context;
  }

  calculateOptimalPrice(prediction, context) {
    let targetPrice = prediction.currentPrice;

    if (prediction.recommendation.action === "wait") {
      targetPrice = prediction.priceRange.min;
    } else if (prediction.recommendation.action === "buy_now") {
      targetPrice = prediction.currentPrice * 1.02;
    } else {
      targetPrice = prediction.currentPrice * 0.95;
    }

    targetPrice += targetPrice * context.priceAdjustment;

    return Math.max(0.01, parseFloat(targetPrice.toFixed(2)));
  }

  async getPersonalizedInsights() {
    try {
      const userProducts = await pool.query(`
        SELECT p.*, pl.name as platform_name, pr.price, pr.currency,
               COUNT(pr2.id) as price_history_count
        FROM products p 
        JOIN platforms pl ON p.platform_id = pl.id 
        LEFT JOIN prices pr ON p.id = pr.product_id 
        LEFT JOIN prices pr2 ON p.id = pr2.product_id
        WHERE pr.fetched_at = (
          SELECT MAX(fetched_at) FROM prices WHERE product_id = p.id
        )
        GROUP BY p.id, pl.name, pr.price, pr.currency
        ORDER BY pr.fetched_at DESC
      `);

      const insights = {
        totalSavingsOpportunity: 0,
        urgentActions: [],
        trends: {
          increasing: 0,
          decreasing: 0,
          stable: 0,
        },
        bestDeals: [],
        worstDeals: [],
      };

      for (const product of userProducts.rows) {
        if (product.price && product.price_history_count >= 3) {
          const prediction = await pricePredictor.predictPriceRange(
            product.id,
            30,
          );

          if (!prediction.error) {
            const savings = product.price - prediction.priceRange.min;
            if (savings > 0) {
              insights.totalSavingsOpportunity += savings;
            }

            insights.trends[prediction.factors.trend]++;

            if (prediction.recommendation.urgency === "high") {
              insights.urgentActions.push({
                productId: product.id,
                title: product.title,
                action: prediction.recommendation.action,
                reason: prediction.recommendation.reason,
              });
            }

            if (prediction.recommendation.action === "wait") {
              insights.bestDeals.push({
                productId: product.id,
                title: product.title,
                potentialSavings: savings,
                confidence: prediction.confidence,
              });
            }
          }
        }
      }

      insights.bestDeals.sort(
        (a, b) => b.potentialSavings - a.potentialSavings,
      );

      return {
        insights,
        totalProducts: userProducts.rows.length,
        analyzedProducts:
          insights.trends.increasing +
          insights.trends.decreasing +
          insights.trends.stable,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Personalized insights error:", error);
      return { error: "Insights generation failed" };
    }
  }
}

module.exports = new ClaudeSmartAlerts();
