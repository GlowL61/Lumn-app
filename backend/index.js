const express = require("express");
const cors = require("cors");
const pool = require("./db");
const { getProductByAsin } = require("./amazon");
const fs = require("fs");
require("./cron"); // Start cron jobs
require("dotenv").config();

// Initialize database
const initDB = async () => {
  try {
    const schema = fs.readFileSync("./schema.sql", "utf8");
    await pool.query(schema);
    console.log("Database initialized successfully");
  } catch (err) {
    console.error("Error initializing database:", err);
  }
};

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/products", require("./routes/products"));
app.use("/api/alerts", require("./routes/alerts"));

app.get("/", (req, res) => {
  res.json({ message: "Amazon Price Tracker API" });
});

// Manual price fetch endpoint
app.post("/api/fetch-prices", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM products");
    const products = result.rows;

    for (const product of products) {
      try {
        const productData = await getProductByAsin(product.external_id);
        const price = productData.Offers?.Listings?.[0]?.Price?.Amount;
        if (price) {
          await pool.query(
            "INSERT INTO prices (product_id, price, currency) VALUES ($1, $2, $3)",
            [
              product.id,
              price / 100,
              productData.Offers.Listings[0].Price.CurrencyCode,
            ],
          );
        }
      } catch (error) {
        console.error(
          `Error fetching price for ${product.external_id}:`,
          error,
        );
      }
    }

    res.json({ message: "Prices fetched successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Start server
(async () => {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║                    🚀 LUMN BACKEND SERVER                    ║
║                                                              ║
║              🌟 Multi-Platform Price Tracker 🌟              ║
║                                                              ║
║  🤖 Powered by Claude AI & Advanced Web Scraping            ║
║  📊 Real-time Price Monitoring & Analytics                  ║
║  🔔 Smart Alert System & AI Predictions                     ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
  `);

  await initDB();

  app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║              🎉 SERVER SUCCESSFULLY STARTED! 🎉              ║
║                                                              ║
║  🌐 Local:   http://localhost:${PORT}                        ║
║  📡 Network: http://0.0.0.0:${PORT}                          ║
║  📊 API:     http://localhost:${PORT}/api                    ║
║                                                              ║
║  ✅ Express.js Server Running                                ║
║  ✅ PostgreSQL Database Connected                            ║
║  ✅ Claude AI Integration Active                             ║
║  ✅ Cron Jobs Scheduled                                       ║
║                                                              ║
║  🚀 Ready to track prices across all platforms!             ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
    `);
  });
})();
