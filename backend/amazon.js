const amazonPaapi = require('amazon-paapi');
require('dotenv').config();

const commonParameters = {
  AccessKey: process.env.AMAZON_ACCESS_KEY,
  SecretKey: process.env.AMAZON_SECRET_KEY,
  PartnerTag: process.env.AMAZON_PARTNER_TAG,
  PartnerType: 'Associates',
  Marketplace: 'www.amazon.com'
};

async function getProductByAsin(asin) {
  try {
    const requestParameters = {
      ASIN: asin,
      Resources: [
        'ItemInfo.Title',
        'Images.Primary.Medium',
        'Offers.Listings.Price'
      ]
    };

    const data = await amazonPaapi.GetItems(commonParameters, requestParameters);
    return data.ItemsResult.Items[0];
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
}

async function searchProducts(keywords) {
  try {
    const requestParameters = {
      Keywords: keywords,
      SearchIndex: 'All',
      ItemCount: 5,
      Resources: [
        'ItemInfo.Title',
        'Images.Primary.Medium',
        'Offers.Listings.Price'
      ]
    };

    const data = await amazonPaapi.SearchItems(commonParameters, requestParameters);
    return data.SearchResult.Items;
  } catch (error) {
    console.error('Error searching products:', error);
    throw error;
  }
}

module.exports = {
  getProductByAsin,
  searchProducts
};