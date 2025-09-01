const express = require('express');
const cors = require('cors');
const pool = require('./db');
const { getProductByAsin } = require('./amazon');
require('./cron'); // Start cron jobs
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/products', require('./routes/products'));
app.use('/api/alerts', require('./routes/alerts'));

app.get('/', (req, res) => {
  res.json({ message: 'Amazon Price Tracker API' });
});

// Manual price fetch endpoint
app.post('/api/fetch-prices', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products');
    const products = result.rows;
    
    for (const product of products) {
      try {
        const productData = await getProductByAsin(product.asin);
        const price = productData.Offers?.Listings?.[0]?.Price?.Amount;
        if (price) {
          await pool.query(
            'INSERT INTO prices (product_id, price, currency) VALUES ($1, $2, $3)',
            [product.id, price / 100, productData.Offers.Listings[0].Price.CurrencyCode]
          );
        }
      } catch (error) {
        console.error(`Error fetching price for ${product.asin}:`, error);
      }
    }
    
    res.json({ message: 'Prices fetched successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});