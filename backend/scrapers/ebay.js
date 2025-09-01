const axios = require("axios");
const cheerio = require("cheerio");

async function searchEbayProducts(query, limit = 5) {
  try {
    const searchUrl = `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(query)}&_sacat=0&_sop=12`;
    const response = await axios.get(searchUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    const $ = cheerio.load(response.data);
    const products = [];

    $(".s-item").each((index, element) => {
      if (index >= limit) return false;

      const $item = $(element);
      const title =
        $item.find('.s-item__title span[role="heading"]').text().trim() ||
        $item.find(".s-item__title").text().trim();
      const priceText = $item.find(".s-item__price").text().trim();
      const imageUrl =
        $item.find(".s-item__image img").attr("src") ||
        $item.find(".s-item__image img").attr("data-src");
      const itemUrl = $item.find(".s-item__link").attr("href");
      const itemId = itemUrl ? itemUrl.match(/\/itm\/([^?]+)/)?.[1] : null;

      if (title && priceText && itemId) {
        // Extract price
        const priceMatch = priceText.match(/\$([0-9,]+\.?[0-9]*)/);
        const price = priceMatch
          ? parseFloat(priceMatch[1].replace(",", ""))
          : null;

        if (price) {
          products.push({
            external_id: itemId,
            title: title.replace("New Listing", "").trim(),
            price: price,
            currency: "USD",
            image_url: imageUrl,
            url: itemUrl,
            platform: "eBay",
          });
        }
      }
    });

    return products;
  } catch (error) {
    console.error("Error scraping eBay:", error);
    return [];
  }
}

async function getEbayProductById(itemId) {
  try {
    const productUrl = `https://www.ebay.com/itm/${itemId}`;
    const response = await axios.get(productUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    const $ = cheerio.load(response.data);

    const title =
      $("#x-refine__group__0 h1").text().trim() ||
      $("#CenterPanelInternal h1").text().trim() ||
      $('h1[id*="title"]').text().trim();

    const priceText =
      $(".notranslate").first().text().trim() ||
      $("#prcIsum").text().trim() ||
      $("#mm-saleDscPrc").text().trim();

    const imageUrl =
      $("#icThumbs img").first().attr("src") ||
      $("#icThumbs img").first().attr("data-src") ||
      $("#icImg").attr("src");

    const priceMatch = priceText.match(/\$([0-9,]+\.?[0-9]*)/);
    const price = priceMatch
      ? parseFloat(priceMatch[1].replace(",", ""))
      : null;

    if (title && price) {
      return {
        external_id: itemId,
        title: title,
        price: price,
        currency: "USD",
        image_url: imageUrl,
        url: productUrl,
        platform: "eBay",
      };
    }

    return null;
  } catch (error) {
    console.error("Error scraping eBay product:", error);
    return null;
  }
}

module.exports = {
  searchEbayProducts,
  getEbayProductById,
};
