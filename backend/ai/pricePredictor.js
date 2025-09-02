const pool = require("../db");

class ClaudePricePredictor {
  constructor() {
    this.seasonalFactors = {
      electronics: {
        q4: 0.85, // Black Friday/Holiday discounts
        q1: 1.15, // Post-holiday price increases
        q2: 0.95, // Spring sales
        q3: 1.05, // Back-to-school premium
      },
      fashion: {
        q1: 0.7, // Winter clearance
        q2: 1.1, // Spring collections
        q3: 0.9, // Summer sales
        q4: 1.2, // Holiday collections
      },
      default: {
        q1: 1.0,
        q2: 0.98,
        q3: 0.95,
        q4: 0.9,
      },
    };
  }

  analyzeCategory(title) {
    const electronics =
      /laptop|phone|tablet|computer|gaming|tech|electronics|cpu|gpu|monitor/i;
    const fashion =
      /shirt|dress|shoes|clothing|fashion|jacket|pants|accessories/i;

    if (electronics.test(title)) return "electronics";
    if (fashion.test(title)) return "fashion";
    return "default";
  }

  calculateTrendSlope(prices) {
    if (prices.length < 2) return 0;

    const n = prices.length;
    let sumX = 0,
      sumY = 0,
      sumXY = 0,
      sumXX = 0;

    prices.forEach((price, index) => {
      sumX += index;
      sumY += price.price;
      sumXY += index * price.price;
      sumXX += index * index;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    return slope;
  }

  calculateVolatility(prices) {
    if (prices.length < 2) return 0;

    const priceValues = prices.map((p) => p.price);
    const mean =
      priceValues.reduce((sum, price) => sum + price, 0) / priceValues.length;
    const variance =
      priceValues.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) /
      priceValues.length;

    return Math.sqrt(variance) / mean;
  }

  getCurrentQuarter() {
    const month = new Date().getMonth() + 1;
    if (month <= 3) return "q1";
    if (month <= 6) return "q2";
    if (month <= 9) return "q3";
    return "q4";
  }

  async predictPriceRange(productId, daysAhead = 30) {
    try {
      const priceHistory = await pool.query(
        `SELECT price, currency, fetched_at 
         FROM prices 
         WHERE product_id = $1 
         ORDER BY fetched_at ASC`,
        [productId],
      );

      const productInfo = await pool.query(
        `SELECT title FROM products WHERE id = $1`,
        [productId],
      );

      if (priceHistory.rows.length < 3) {
        return {
          error: "Insufficient data for prediction",
          minData: 3,
          currentData: priceHistory.rows.length,
        };
      }

      const prices = priceHistory.rows;
      const product = productInfo.rows[0];
      const category = this.analyzeCategory(product.title);
      const currentQuarter = this.getCurrentQuarter();

      const trend = this.calculateTrendSlope(prices);
      const volatility = this.calculateVolatility(prices);
      const currentPrice = prices[prices.length - 1].price;

      const seasonalFactor = this.seasonalFactors[category][currentQuarter];

      const trendProjection = trend * daysAhead;
      const seasonalAdjustment = currentPrice * (seasonalFactor - 1) * 0.3;

      const basePrediction =
        currentPrice + trendProjection + seasonalAdjustment;

      const confidenceRange =
        volatility * currentPrice * Math.sqrt(daysAhead / 30);

      const prediction = {
        currentPrice: parseFloat(currentPrice.toFixed(2)),
        predictedPrice: parseFloat(basePrediction.toFixed(2)),
        priceRange: {
          min: parseFloat((basePrediction - confidenceRange).toFixed(2)),
          max: parseFloat((basePrediction + confidenceRange).toFixed(2)),
        },
        confidence: Math.max(0.3, Math.min(0.95, 1 - volatility)),
        factors: {
          trend: trend > 0 ? "increasing" : trend < 0 ? "decreasing" : "stable",
          seasonality: seasonalFactor > 1 ? "premium" : "discount",
          volatility:
            volatility > 0.2 ? "high" : volatility > 0.1 ? "medium" : "low",
          category,
        },
        recommendation: this.generateRecommendation(
          trend,
          seasonalFactor,
          volatility,
          currentPrice,
          basePrediction,
        ),
        daysAhead,
        currency: prices[0].currency || "USD",
      };

      return prediction;
    } catch (error) {
      console.error("Error predicting price:", error);
      return { error: "Prediction failed" };
    }
  }

  generateRecommendation(
    trend,
    seasonalFactor,
    volatility,
    currentPrice,
    predictedPrice,
  ) {
    const priceChange = ((predictedPrice - currentPrice) / currentPrice) * 100;

    if (priceChange < -10) {
      return {
        action: "wait",
        reason: "Prix susceptible de baisser significativement",
        timing: "Attendez quelques semaines pour un meilleur prix",
        urgency: "low",
      };
    } else if (priceChange > 10) {
      return {
        action: "buy_now",
        reason: "Prix susceptible d'augmenter",
        timing: "Achetez maintenant avant la hausse",
        urgency: "high",
      };
    } else if (volatility > 0.15) {
      return {
        action: "monitor",
        reason: "Prix très volatile, surveillez de près",
        timing: "Configurez des alertes pour les bonnes opportunités",
        urgency: "medium",
      };
    } else {
      return {
        action: "neutral",
        reason: "Prix stable, achetez selon vos besoins",
        timing: "Pas de timing particulier requis",
        urgency: "low",
      };
    }
  }

  async getBestTimeToCheck(productId) {
    try {
      const priceHistory = await pool.query(
        `SELECT EXTRACT(hour FROM fetched_at) as hour, 
                EXTRACT(dow FROM fetched_at) as day_of_week,
                price
         FROM prices 
         WHERE product_id = $1 
         AND fetched_at >= NOW() - INTERVAL '30 days'
         ORDER BY fetched_at`,
        [productId],
      );

      if (priceHistory.rows.length < 10) {
        return {
          recommendation: "Plus de données nécessaires",
          suggestedTimes: ["9:00", "15:00", "21:00"],
        };
      }

      const hourlyData = {};
      priceHistory.rows.forEach((row) => {
        const hour = parseInt(row.hour);
        if (!hourlyData[hour]) {
          hourlyData[hour] = [];
        }
        hourlyData[hour].push(parseFloat(row.price));
      });

      let bestHour = 0;
      let lowestAverage = Infinity;

      Object.entries(hourlyData).forEach(([hour, prices]) => {
        const average =
          prices.reduce((sum, price) => sum + price, 0) / prices.length;
        if (average < lowestAverage) {
          lowestAverage = average;
          bestHour = parseInt(hour);
        }
      });

      return {
        bestHour,
        recommendation: `Meilleur moment pour vérifier: ${bestHour}:00`,
        analysis: `Prix généralement plus bas à ${bestHour}h00`,
        confidence: hourlyData[bestHour]
          ? hourlyData[bestHour].length / 30
          : 0.1,
      };
    } catch (error) {
      console.error("Error analyzing best check time:", error);
      return {
        error: "Analysis failed",
        suggestedTimes: ["9:00", "15:00", "21:00"],
      };
    }
  }
}

module.exports = new ClaudePricePredictor();
