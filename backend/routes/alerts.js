const express = require("express");
const pool = require("../db");
const smartAlerts = require("../ai/smartAlerts");

const router = express.Router();

// Get all alerts
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.*, p.title as product_title, p.external_id, pl.name as platform_name
      FROM alerts a
      JOIN products p ON a.product_id = p.id
      JOIN platforms pl ON p.platform_id = pl.id
      WHERE a.is_active = true
      ORDER BY a.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Create alert
router.post("/", async (req, res) => {
  const { productId, targetPrice, alertType, userEmail } = req.body;

  if (!productId || !targetPrice || !alertType) {
    return res
      .status(400)
      .json({ error: "Product ID, target price, and alert type are required" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO alerts (product_id, target_price, alert_type, user_email) VALUES ($1, $2, $3, $4) RETURNING *",
      [productId, targetPrice, alertType, userEmail || null],
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Update alert
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { targetPrice, alertType, userEmail, isActive } = req.body;

  try {
    const result = await pool.query(
      "UPDATE alerts SET target_price = $1, alert_type = $2, user_email = $3, is_active = $4 WHERE id = $5 RETURNING *",
      [targetPrice, alertType, userEmail, isActive, id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Alert not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete alert
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM alerts WHERE id = $1 RETURNING *",
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Alert not found" });
    }

    res.json({ message: "Alert deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Check alerts (for cron job)
router.post("/check", async (req, res) => {
  try {
    // Get all active alerts with current prices
    const alerts = await pool.query(`
      SELECT a.*, p.title, p.external_id, pr.price, pr.currency, pl.name as platform_name
      FROM alerts a
      JOIN products p ON a.product_id = p.id
      JOIN platforms pl ON p.platform_id = pl.id
      LEFT JOIN prices pr ON p.id = pr.product_id AND pr.fetched_at = (
        SELECT MAX(fetched_at) FROM prices WHERE product_id = p.id
      )
      WHERE a.is_active = true
    `);

    const triggeredAlerts = [];

    for (const alert of alerts.rows) {
      let triggered = false;

      if (
        alert.alert_type === "below" &&
        alert.price &&
        alert.price <= alert.target_price
      ) {
        triggered = true;
      } else if (
        alert.alert_type === "above" &&
        alert.price &&
        alert.price >= alert.target_price
      ) {
        triggered = true;
      }

      if (triggered) {
        triggeredAlerts.push(alert);
        // In a real application, you would send email notifications here
        console.log(
          `Alert triggered for ${alert.title}: Current price ${alert.currency}${alert.price} ${alert.alert_type} target ${alert.currency}${alert.target_price}`,
        );
      }
    }

    res.json({ triggeredAlerts, totalChecked: alerts.rows.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Claude Smart Alerts Analysis
router.get("/smart", async (req, res) => {
  const { limit = 10 } = req.query;

  try {
    const smartAlertsResult = await smartAlerts.getActiveSmartAlerts(
      parseInt(limit),
    );
    res.json(smartAlertsResult);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Smart alerts generation failed" });
  }
});

// Create contextual alert with Claude AI
router.post("/smart", async (req, res) => {
  const { productId, userBehavior = {} } = req.body;

  if (!productId) {
    return res.status(400).json({ error: "Product ID is required" });
  }

  try {
    const smartAlert = await smartAlerts.createContextualAlert(
      productId,
      userBehavior,
    );

    if (smartAlert.error) {
      return res.status(400).json(smartAlert);
    }

    const result = await pool.query(
      "INSERT INTO alerts (product_id, target_price, alert_type, user_email, is_active) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [productId, smartAlert.targetPrice, smartAlert.alertType, null, true],
    );

    res.status(201).json({
      alert: result.rows[0],
      claudeAnalysis: smartAlert,
      generated_by: "Claude AI",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Smart alert creation failed" });
  }
});

// Get personalized insights
router.get("/insights/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const insights = await smartAlerts.getPersonalizedInsights(userId);
    res.json(insights);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Insights generation failed" });
  }
});

module.exports = router;
