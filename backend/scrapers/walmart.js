const axios = require('axios');
const cheerio = require('cheerio');

async function searchWalmartProducts(query, limit = 5) {
  try {
    const searchUrl = `https://www.walmart.com/search?q=${encodeURIComponent(query)}`;
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const $ = cheerio.load(response.data);
    const products = [];

    $('[data-item-id]').each((index, element) => {
      if (index >= limit) return false;

      const $item = $(element);
      const itemId = $item.attr('data-item-id');
      const title = $item.find('[data-automation-id="product-title"]').text().trim() ||
                   $item.find('span[data-automation-id="product-title"]').text().trim() ||
                   $item.find('a[data-automation-id="product-title"]').text().trim();

      const priceText = $item.find('[data-automation-id="product-price"]').text().trim() ||
                       $item.find('.price-main .visuallyhidden').text().trim() ||
                       $item.find('.price .price-main').text().trim();

      const imageUrl = $item.find('img[data-automation-id="product-image"]').attr('src') ||
                      $item.find('img[data-automation-id="product-image"]').attr('data-src');

      const itemUrl = $item.find('a[data-automation-id="product-title"]').attr('href');

      if (title && priceText && itemId) {
        // Extract price
        const priceMatch = priceText.match(/\$([0-9,]+\.?[0-9]*)/);
        const price = priceMatch ? parseFloat(priceMatch[1].replace(',', '')) : null;

        if (price) {
          products.push({
            external_id: itemId,
            title: title,
            price: price,
            currency: 'USD',
            image_url: imageUrl,
            url: itemUrl ? `https://www.walmart.com${itemUrl}` : null,
            platform: 'Walmart'
          });
        }
      }
    });

    return products;
  } catch (error) {
    console.error('Error scraping Walmart:', error);
    return [];
  }
}

async function getWalmartProductById(itemId) {
  try {
    const productUrl = `https://www.walmart.com/ip/${itemId}`;
    const response = await axios.get(productUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const $ = cheerio.load(response.data);

    const title = $('h1[data-automation-id="product-title"]').text().trim() ||
                 $('h1[itemprop="name"]').text().trim();

    const priceText = $('[data-automation-id="product-price"]').text().trim() ||
                     $('.price-main .visuallyhidden').text().trim() ||
                     $('[itemprop="price"]').attr('content');

    const imageUrl = $('img[data-automation-id="product-image"]').attr('src') ||
                    $('img[data-image-index="0"]').attr('src');

    const priceMatch = priceText.match(/\$([0-9,]+\.?[0-9]*)/);
    const price = priceMatch ? parseFloat(priceMatch[1].replace(',', '')) :
                (priceText ? parseFloat(priceText.replace(',', '')) : null);

    if (title && price) {
      return {
        external_id: itemId,
        title: title,
        price: price,
        currency: 'USD',
        image_url: imageUrl,
        url: productUrl,
        platform: 'Walmart'
      };
    }

    return null;
  } catch (error) {
    console.error('Error scraping Walmart product:', error);
    return null;
  }
}

module.exports = {
  searchWalmartProducts,
  getWalmartProductById
};