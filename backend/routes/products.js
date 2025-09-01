const express = require("express");
const pool = require("../db");
const {
  searchAllPlatforms,
  getProductFromPlatform,
  getProductPriceHistory,
  scrapers,
} = require("../scrapers");
const smartSearch = require("../ai/smartSearch");
const pricePredictor = require("../ai/pricePredictor");
const claudeConversation = require("../ai/claudeConversation");

const router = express.Router();

// Get all products with latest prices
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        p.*,
        pl.name as platform_name,
        pl.base_url as platform_url,
        pr.price,
        pr.currency,
        pr.fetched_at
      FROM products p
      JOIN platforms pl ON p.platform_id = pl.id
      LEFT JOIN prices pr ON p.id = pr.product_id
      WHERE pr.fetched_at = (
        SELECT MAX(fetched_at) FROM prices WHERE product_id = p.id
      ) OR pr.id IS NULL
      ORDER BY p.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Add product by platform and external ID
router.post("/", async (req, res) => {
  const { platform, externalId } = req.body;
  if (!platform || !externalId) {
    return res
      .status(400)
      .json({ error: "Platform and external ID are required" });
  }

  try {
    // Get platform ID
    const platformResult = await pool.query(
      "SELECT id FROM platforms WHERE name = $1",
      [platform],
    );
    if (platformResult.rows.length === 0) {
      return res.status(400).json({ error: "Invalid platform" });
    }
    const platformId = platformResult.rows[0].id;

    // Check if product already exists
    const existing = await pool.query(
      "SELECT * FROM products WHERE platform_id = $1 AND external_id = $2",
      [platformId, externalId],
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: "Product already exists" });
    }

    // Fetch product data from the platform
    const productData = await getProductFromPlatform(platform, externalId);
    if (!productData) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Insert product
    const insertProduct = await pool.query(
      "INSERT INTO products (platform_id, external_id, title, image_url, url) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [
        platformId,
        externalId,
        productData.title,
        productData.image_url,
        productData.url,
      ],
    );

    const product = insertProduct.rows[0];

    // Insert price if available
    if (productData.price) {
      await pool.query(
        "INSERT INTO prices (product_id, price, currency) VALUES ($1, $2, $3)",
        [product.id, productData.price, productData.currency],
      );
    }

    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get product prices
router.get("/:id/prices", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM prices WHERE product_id = $1 ORDER BY fetched_at DESC",
      [id],
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get product price history from the platform (for Qwen Coder and other platforms)
router.get("/:id/price-history", async (req, res) => {
  const { id } = req.params;
  try {
    // Get product details
    const productResult = await pool.query(
      `SELECT p.*, pl.name as platform_name 
       FROM products p 
       JOIN platforms pl ON p.platform_id = pl.id 
       WHERE p.id = $1`,
      [id],
    );

    if (productResult.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    const product = productResult.rows[0];

    // Get price history from the platform
    const priceHistory = await getProductPriceHistory(
      product.platform_name,
      product.external_id,
    );

    res.json(priceHistory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Smart search with Claude AI
router.get("/search", async (req, res) => {
  const { q: query, limit = 5, smart = false } = req.query;
  if (!query) {
    return res.status(400).json({ error: "Search query is required" });
  }

  try {
    if (smart === "true") {
      const smartAnalysis = smartSearch.parseNaturalQuery(query);
      const results = await searchAllPlatforms(
        smartAnalysis.enhancedQuery,
        parseInt(limit),
      );
      const enhancedResults = smartSearch.generateSmartSuggestions(
        query,
        results,
      );

      res.json({
        originalQuery: query,
        enhancedQuery: smartAnalysis.enhancedQuery,
        analysis: smartAnalysis,
        results: enhancedResults.enhancedResults,
        suggestions: enhancedResults.suggestions,
        totalFound: results.length,
      });
    } else {
      const results = await searchAllPlatforms(query, parseInt(limit));
      res.json(results);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get platforms
router.get("/platforms", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM platforms ORDER BY name");
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Claude AI Price Prediction
router.get("/:id/predict", async (req, res) => {
  const { id } = req.params;
  const { days = 30 } = req.query;

  try {
    const prediction = await pricePredictor.predictPriceRange(
      parseInt(id),
      parseInt(days),
    );
    const bestTime = await pricePredictor.getBestTimeToCheck(parseInt(id));

    res.json({
      prediction,
      bestTime,
      generated_by: "Claude AI Analysis",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Prediction failed" });
  }
});

// Claude Conversation Interface
router.post("/chat", async (req, res) => {
  const { message, userId = "default" } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    const response = await claudeConversation.processConversation(
      userId,
      message,
    );
    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Conversation processing failed" });
  }
});

// Smart insights for dashboard
router.get("/insights", async (req, res) => {
  try {
    const recentProducts = await pool.query(`
      SELECT p.*, pl.name as platform_name, pr.price, pr.currency, pr.fetched_at
      FROM products p 
      JOIN platforms pl ON p.platform_id = pl.id 
      LEFT JOIN prices pr ON p.id = pr.product_id 
      WHERE pr.fetched_at = (
        SELECT MAX(fetched_at) FROM prices WHERE product_id = p.id
      )
      ORDER BY pr.fetched_at DESC 
      LIMIT 20
    `);

    const insights = [];
    const productData = recentProducts.rows;

    for (const product of productData.slice(0, 5)) {
      if (product.price) {
        const prediction = await pricePredictor.predictPriceRange(
          product.id,
          14,
        );
        if (!prediction.error) {
          insights.push({
            productId: product.id,
            title: product.title,
            currentPrice: product.price,
            platform: product.platform_name,
            prediction: prediction.recommendation,
            confidence: prediction.confidence,
            trend: prediction.factors.trend,
          });
        }
      }
    }

    const summary = {
      totalProducts: productData.length,
      avgPrice:
        productData.reduce((sum, p) => sum + (p.price || 0), 0) /
        productData.length,
      buyNowCount: insights.filter((i) => i.prediction.action === "buy_now")
        .length,
      waitCount: insights.filter((i) => i.prediction.action === "wait").length,
      monitorCount: insights.filter((i) => i.prediction.action === "monitor")
        .length,
    };

    res.json({
      insights,
      summary,
      generated_by: "Claude AI Analysis",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Insights generation failed" });
  }
});

// Anthropic AI Market Insights (Surprise Feature!)
router.get("/anthropic-insights", async (req, res) => {
  try {
    if (
      scrapers["Anthropic AI"] &&
      scrapers["Anthropic AI"].getMarketInsights
    ) {
      const marketInsights = await scrapers["Anthropic AI"].getMarketInsights();
      res.json({
        ...marketInsights,
        surprise: "🎉 Marketplace IA secret débloqué !",
        message:
          "Claude a ajouté un accès exclusif au marketplace Anthropic AI",
        generated_by: "Claude Secret Feature",
      });
    } else {
      res.status(404).json({ error: "Anthropic marketplace not available" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Market insights failed" });
  }
});

// Enhanced search with Claude intelligence
router.get("/claude-search", async (req, res) => {
  const { q: query } = req.query;

  if (!query) {
    return res.status(400).json({ error: "Search query is required" });
  }

  try {
    const smartAnalysis = smartSearch.parseNaturalQuery(query);
    const results = await searchAllPlatforms(smartAnalysis.enhancedQuery, 12);
    const enhancedResults = smartSearch.generateSmartSuggestions(
      query,
      results,
    );

    const claudeResponse = await claudeConversation.processConversation(
      "api-user",
      `Recherche: ${query}`,
    );

    res.json({
      query: {
        original: query,
        enhanced: smartAnalysis.enhancedQuery,
        analysis: smartAnalysis,
      },
      results: enhancedResults.enhancedResults,
      suggestions: enhancedResults.suggestions,
      claudeInsights: claudeResponse.data || {},
      totalFound: results.length,
      powered_by: "🤖 Claude AI Analysis",
      surprise_feature: results.some((r) => r.platform === "Anthropic AI")
        ? "🎉 Produits IA exclusifs trouvés !"
        : null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Claude search failed" });
  }
});

module.exports = router;
