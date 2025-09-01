const express = require('express');
const pool = require('../db');
const { searchAllPlatforms, getProductFromPlatform } = require('../scrapers');

const router = express.Router();

// Get all products with latest prices
router.get('/', async (req, res) => {
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
    res.status(500).json({ error: 'Server error' });
  }
});

// Add product by platform and external ID
router.post('/', async (req, res) => {
  const { platform, externalId } = req.body;
  if (!platform || !externalId) {
    return res.status(400).json({ error: 'Platform and external ID are required' });
  }

  try {
    // Get platform ID
    const platformResult = await pool.query('SELECT id FROM platforms WHERE name = $1', [platform]);
    if (platformResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid platform' });
    }
    const platformId = platformResult.rows[0].id;

    // Check if product already exists
    const existing = await pool.query(
      'SELECT * FROM products WHERE platform_id = $1 AND external_id = $2',
      [platformId, externalId]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Product already exists' });
    }

    // Fetch product data from the platform
    const productData = await getProductFromPlatform(platform, externalId);
    if (!productData) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Insert product
    const insertProduct = await pool.query(
      'INSERT INTO products (platform_id, external_id, title, image_url, url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [
        platformId,
        externalId,
        productData.title,
        productData.image_url,
        productData.url
      ]
    );

    const product = insertProduct.rows[0];

    // Insert price if available
    if (productData.price) {
      await pool.query(
        'INSERT INTO prices (product_id, price, currency) VALUES ($1, $2, $3)',
        [product.id, productData.price, productData.currency]
      );
    }

    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get product prices
router.get('/:id/prices', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM prices WHERE product_id = $1 ORDER BY fetched_at DESC',
      [id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Search products across all platforms
router.get('/search', async (req, res) => {
  const { q: query, limit = 5 } = req.query;
  if (!query) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  try {
    const results = await searchAllPlatforms(query, parseInt(limit));
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get platforms
router.get('/platforms', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM platforms ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;