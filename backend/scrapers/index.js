const { searchEbayProducts, getEbayProductById } = require("./ebay");
const { searchWalmartProducts, getWalmartProductById } = require("./walmart");
const {
  searchQwenCoderProducts,
  getQwenCoderProductById,
  getQwenCoderPriceHistory,
} = require("./qwencoder");
const {
  searchAnthropicProducts,
  getAnthropicProductById,
  getAnthropicPriceHistory,
  getAnthropicMarketInsights,
} = require("./anthropicMarket");
const { getProductByAsin } = require("../amazon");

const scrapers = {
  eBay: {
    search: searchEbayProducts,
    getById: getEbayProductById,
  },
  Walmart: {
    search: searchWalmartProducts,
    getById: getWalmartProductById,
  },
  "Qwen Coder": {
    search: searchQwenCoderProducts,
    getById: getQwenCoderProductById,
    getPriceHistory: getQwenCoderPriceHistory,
  },
  "Anthropic AI": {
    search: searchAnthropicProducts,
    getById: getAnthropicProductById,
    getPriceHistory: getAnthropicPriceHistory,
    getMarketInsights: getAnthropicMarketInsights,
  },
  Amazon: {
    search: async (query, limit) => {
      // For Amazon, we'll use a simple search simulation since we have API
      try {
        // This is a placeholder - in real implementation you'd use Amazon search API
        const mockResults = [
          {
            external_id: "B08N5WRWNW", // Example ASIN
            title: `Amazon Search: ${query}`,
            price: 99.99,
            currency: "USD",
            image_url: null,
            url: `https://www.amazon.com/s?k=${encodeURIComponent(query)}`,
            platform: "Amazon",
          },
        ];
        return mockResults.slice(0, limit);
      } catch (error) {
        console.error("Error searching Amazon:", error);
        return [];
      }
    },
    getById: async (asin) => {
      try {
        const productData = await getProductByAsin(asin);
        if (productData) {
          return {
            external_id: asin,
            title: productData.ItemInfo?.Title?.DisplayValue || "Unknown",
            price: productData.Offers?.Listings?.[0]?.Price?.Amount
              ? productData.Offers.Listings[0].Price.Amount / 100
              : null,
            currency:
              productData.Offers?.Listings?.[0]?.Price?.CurrencyCode || "USD",
            image_url: productData.Images?.Primary?.Medium?.URL || null,
            url: `https://www.amazon.com/dp/${asin}`,
            platform: "Amazon",
          };
        }
        return null;
      } catch (error) {
        console.error("Error getting Amazon product:", error);
        return null;
      }
    },
  },
};

async function searchAllPlatforms(query, limit = 3) {
  const results = [];
  const platforms = Object.keys(scrapers);

  for (const platform of platforms) {
    try {
      const platformResults = await scrapers[platform].search(query, limit);
      results.push(...platformResults);
    } catch (error) {
      console.error(`Error searching ${platform}:`, error);
    }
  }

  return results;
}

async function getProductFromPlatform(platform, externalId) {
  if (!scrapers[platform]) {
    throw new Error(`Platform ${platform} not supported`);
  }

  return await scrapers[platform].getById(externalId);
}

async function getProductPriceHistory(platform, externalId) {
  if (!scrapers[platform] || !scrapers[platform].getPriceHistory) {
    // Default implementation for platforms without specific price history
    return [];
  }

  return await scrapers[platform].getPriceHistory(externalId);
}

async function getAllSupportedPlatforms() {
  return Object.keys(scrapers);
}

module.exports = {
  searchAllPlatforms,
  getProductFromPlatform,
  getProductPriceHistory,
  getAllSupportedPlatforms,
  scrapers,
};
