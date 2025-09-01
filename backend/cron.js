const cron = require('node-cron');
const pool = require('./db');
const { getProductFromPlatform } = require('./scrapers');

async function fetchAllPrices() {
  try {
    console.log('Starting hourly price fetch...');
    const result = await pool.query(`
      SELECT p.*, pl.name as platform_name
      FROM products p
      JOIN platforms pl ON p.platform_id = pl.id
    `);
    const products = result.rows;

    for (const product of products) {
      try {
        const productData = await getProductFromPlatform(product.platform_name, product.external_id);
        if (productData && productData.price) {
          await pool.query(
            'INSERT INTO prices (product_id, price, currency) VALUES ($1, $2, $3)',
            [product.id, productData.price, productData.currency]
          );
          console.log(`Updated price for ${product.title}: $${productData.price}`);
        }
      } catch (error) {
        console.error(`Error fetching price for ${product.title}:`, error);
      }
    }
    console.log('Hourly price fetch completed');
  } catch (error) {
    console.error('Error in fetchAllPrices:', error);
  }
}

// Schedule to run every hour
cron.schedule('0 * * * *', fetchAllPrices);

console.log('Cron job scheduled: Fetch prices every hour');

module.exports = { fetchAllPrices };