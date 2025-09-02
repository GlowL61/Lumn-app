const cron = require("node-cron");
const pool = require("./db");
const { getProductFromPlatform } = require("./scrapers");
const smartAlerts = require("./ai/smartAlerts");
const pricePredictor = require("./ai/pricePredictor");

async function fetchAllPrices() {
  try {
    console.log("Starting hourly price fetch...");
    const result = await pool.query(`
      SELECT p.*, pl.name as platform_name
      FROM products p
      JOIN platforms pl ON p.platform_id = pl.id
    `);
    const products = result.rows;

    for (const product of products) {
      try {
        const productData = await getProductFromPlatform(
          product.platform_name,
          product.external_id,
        );
        if (productData && productData.price) {
          await pool.query(
            "INSERT INTO prices (product_id, price, currency) VALUES ($1, $2, $3)",
            [product.id, productData.price, productData.currency],
          );
          console.log(
            `Updated price for ${product.title}: $${productData.price}`,
          );
        }
      } catch (error) {
        console.error(`Error fetching price for ${product.title}:`, error);
      }
    }
    console.log("Hourly price fetch completed");
  } catch (error) {
    console.error("Error in fetchAllPrices:", error);
  }
}

async function runClaudeAnalysis() {
  try {
    console.log("🤖 Starting Claude AI analysis...");

    const smartAlertsResult = await smartAlerts.analyzeAndCreateSmartAlerts();
    console.log(
      `Claude generated ${smartAlertsResult.alertsGenerated} smart alerts`,
    );

    const productsNeedingAttention = await pool.query(`
      SELECT p.id, p.title, pr.price
      FROM products p 
      LEFT JOIN prices pr ON p.id = pr.product_id 
      WHERE pr.fetched_at = (
        SELECT MAX(fetched_at) FROM prices WHERE product_id = p.id
      )
      ORDER BY pr.fetched_at ASC
      LIMIT 5
    `);

    for (const product of productsNeedingAttention.rows) {
      try {
        const prediction = await pricePredictor.predictPriceRange(
          product.id,
          7,
        );
        if (!prediction.error && prediction.recommendation.urgency === "high") {
          console.log(
            `🚨 Claude Alert: ${product.title} - ${prediction.recommendation.action}`,
          );
        }
      } catch (error) {
        console.error(
          `Claude analysis error for product ${product.id}:`,
          error,
        );
      }
    }

    console.log("🤖 Claude AI analysis completed");
  } catch (error) {
    console.error("Error in Claude analysis:", error);
  }
}

// Schedule to run every hour
cron.schedule("0 * * * *", fetchAllPrices);

// Schedule Claude AI analysis every 6 hours
cron.schedule("0 */6 * * *", runClaudeAnalysis);

// Schedule smart alerts check every 2 hours
cron.schedule("0 */2 * * *", async () => {
  try {
    console.log("🔔 Checking smart alerts...");
    const alerts = await smartAlerts.getActiveSmartAlerts(50);
    if (alerts.alerts) {
      const criticalAlerts = alerts.alerts.filter(
        (a) => a.urgency === "critical",
      );
      if (criticalAlerts.length > 0) {
        console.log(
          `🚨 ${criticalAlerts.length} critical price alerts detected!`,
        );
        criticalAlerts.forEach((alert) => {
          console.log(`   - ${alert.productTitle}: ${alert.message}`);
        });
      }
    }
  } catch (error) {
    console.error("Smart alerts check error:", error);
  }
});

console.log("🤖 Claude-powered cron jobs scheduled:");
console.log("   📊 Price fetch: Every hour");
console.log("   🧠 AI analysis: Every 6 hours");
console.log("   🔔 Smart alerts: Every 2 hours");

module.exports = { fetchAllPrices, runClaudeAnalysis };
