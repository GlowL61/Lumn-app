# Qwen Coder Integration for Lumn Price Tracker

This document explains how the Qwen Coder integration works in the Lumn price tracking application.

## Overview

Qwen Coder is a fictional platform added to demonstrate how to extend the Lumn price tracker with new platforms. The integration includes:

1. A custom scraper for Qwen Coder products
2. Database schema updates to include Qwen Coder as a supported platform
3. API endpoints for fetching Qwen Coder product data and price history
4. Frontend updates to display Qwen Coder products

## Implementation Details

### Backend Components

1. **Scraper Module**: `/backend/scrapers/qwencoder.js`
   - Contains functions for searching Qwen Coder products
   - Provides product details fetching by ID
   - Simulates price history data

2. **Database Integration**: `/backend/schema.sql`
   - Added Qwen Coder to the platforms table
   - Maintains the same schema structure as other platforms

3. **API Routes**: Updated `/backend/routes/products.js`
   - Added `/api/products/:id/price-history` endpoint
   - Integrates with the Qwen Coder scraper for price history data

### Frontend Components

1. **Product Display**: Updated `/frontend/src/App.tsx`
   - Shows Qwen Coder products in search results
   - Displays product descriptions

2. **Price Charts**: Updated `/frontend/src/PriceChart.tsx`
   - Supports both database and platform-specific price data
   - Includes toggle for switching between data sources for Qwen Coder products

## How It Works

1. When searching for products, Qwen Coder products will appear alongside products from other platforms
2. When adding a Qwen Coder product to track, it gets stored in the database like other products
3. Price history for Qwen Coder products can be fetched from the platform directly (simulated)
4. The price chart component can display both database-stored prices and platform-fetched prices

## Extending to Other Platforms

To add support for another platform, follow these steps:

1. Create a new scraper file in `/backend/scrapers/`
2. Implement search and product fetching functions
3. Add the platform to the scrapers index file
4. Update the database schema if needed
5. Add any special handling in the frontend components

## Note

This is a demonstration implementation. In a real-world scenario, you would:
- Connect to actual Qwen Coder APIs
- Implement proper authentication if required
- Handle rate limiting and error cases
- Add proper data validation
- Implement caching for better performance