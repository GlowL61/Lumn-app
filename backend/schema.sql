-- Platforms table
CREATE TABLE IF NOT EXISTS platforms (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  base_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  platform_id INTEGER REFERENCES platforms(id) ON DELETE CASCADE,
  external_id VARCHAR(50) NOT NULL, -- ASIN for Amazon, item ID for others
  title VARCHAR(500),
  image_url VARCHAR(1000),
  url VARCHAR(1000),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(platform_id, external_id)
);

-- Prices table
CREATE TABLE IF NOT EXISTS prices (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  price DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'USD',
  fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Alerts table
CREATE TABLE IF NOT EXISTS alerts (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  user_email VARCHAR(255),
  target_price DECIMAL(10,2),
  alert_type VARCHAR(20) DEFAULT 'below', -- 'below', 'above', 'change'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default platforms
INSERT INTO platforms (name, base_url) VALUES
  ('Amazon', 'https://www.amazon.com'),
  ('eBay', 'https://www.ebay.com'),
  ('Walmart', 'https://www.walmart.com'),
  ('Best Buy', 'https://www.bestbuy.com'),
  ('Target', 'https://www.target.com'),
  ('Qwen Coder', 'https://www.qwencoder.com'),
  ('Anthropic AI', 'https://anthropic-marketplace.ai')
ON CONFLICT (name) DO NOTHING;

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_prices_product_id ON prices(product_id);
CREATE INDEX IF NOT EXISTS idx_prices_fetched_at ON prices(fetched_at);
CREATE INDEX IF NOT EXISTS idx_products_platform_external ON products(platform_id, external_id);
CREATE INDEX IF NOT EXISTS idx_alerts_product_id ON alerts(product_id);
CREATE INDEX IF NOT EXISTS idx_alerts_active ON alerts(is_active);