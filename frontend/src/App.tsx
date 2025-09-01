import { useState, useEffect } from 'react'
import PriceChart from './PriceChart'
import Alerts from './Alerts'
import './App.css'

interface Product {
  id: number;
  platform_id: number;
  external_id: string;
  title: string;
  image_url: string | null;
  url: string | null;
  platform_name: string;
  platform_url: string;
  price: number | null;
  currency: string;
  fetched_at: string;
}

interface Platform {
  id: number;
  name: string;
  base_url: string;
}

interface SearchResult {
  external_id: string;
  title: string;
  price: number;
  currency: string;
  image_url: string | null;
  url: string | null;
  platform: string;
}

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [externalId, setExternalId] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showCharts, setShowCharts] = useState<{[key: number]: boolean}>({});

  useEffect(() => {
    fetchProducts();
    fetchPlatforms();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlatforms = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/products/platforms');
      const data = await response.json();
      setPlatforms(data);
    } catch (error) {
      console.error('Error fetching platforms:', error);
    }
  };

  const searchProducts = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      const response = await fetch(`http://localhost:3001/api/products/search?q=${encodeURIComponent(searchQuery)}&limit=10`);
      const data = await response.json();
      setSearchResults(data);
      setShowSearch(true);
    } catch (error) {
      console.error('Error searching products:', error);
    }
  };

  const addProduct = async (platform: string, externalId: string) => {
    try {
      const response = await fetch('http://localhost:3001/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ platform, externalId }),
      });

      if (response.ok) {
        setSearchQuery('');
        setExternalId('');
        setShowSearch(false);
        fetchProducts();
      } else {
        alert('Error adding product');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Error adding product');
    }
  };

  const addProductManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlatform || !externalId.trim()) return;

    await addProduct(selectedPlatform, externalId);
  };

  const toggleChart = (productId: number) => {
    setShowCharts(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  const fetchPrices = async () => {
    try {
      await fetch('http://localhost:3001/api/fetch-prices', {
        method: 'POST',
      });
      fetchProducts();
    } catch (error) {
      console.error('Error fetching prices:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="app">
      <header>
        <h1>Multi-Platform Price Tracker</h1>
        <button onClick={fetchPrices} className="fetch-btn">
          Fetch Latest Prices
        </button>
      </header>

      {/* Search Form */}
      <form onSubmit={searchProducts} className="search-form">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search products across all platforms..."
          required
        />
        <button type="submit">Search</button>
      </form>

      {/* Manual Add Form */}
      <form onSubmit={addProductManual} className="add-product">
        <select
          value={selectedPlatform}
          onChange={(e) => setSelectedPlatform(e.target.value)}
          required
        >
          <option value="">Select Platform</option>
          {platforms.map((platform) => (
            <option key={platform.id} value={platform.name}>
              {platform.name}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={externalId}
          onChange={(e) => setExternalId(e.target.value)}
          placeholder="Enter Product ID"
          required
        />
        <button type="submit">Add Product</button>
      </form>

      {/* Search Results */}
      {showSearch && searchResults.length > 0 && (
        <div className="search-results">
          <h2>Search Results</h2>
          <div className="products">
            {searchResults.map((result, index) => (
              <div key={index} className="product-card search-result">
                {result.image_url && (
                  <img src={result.image_url} alt={result.title} />
                )}
                <div className="product-info">
                  <h3>{result.title}</h3>
                  <p className="platform">{result.platform}</p>
                  <p className="price">
                    {result.currency} {result.price}
                  </p>
                  <button
                    onClick={() => addProduct(result.platform, result.external_id)}
                    className="add-btn"
                  >
                    Add to Tracker
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tracked Products */}
      <div className="products">
        <h2>Your Tracked Products</h2>
        {products.map((product) => (
          <div key={product.id} className="product-card">
            {product.image_url && (
              <img src={product.image_url} alt={product.title} />
            )}
            <div className="product-info">
              <h3>{product.title}</h3>
              <p className="platform">{product.platform_name}</p>
              <p>ID: {product.external_id}</p>
              {product.price ? (
                <p className="price">
                  {product.currency} {product.price}
                </p>
              ) : (
                <p className="price">Price not available</p>
              )}
              <p className="date">
                Last updated: {new Date(product.fetched_at).toLocaleString()}
              </p>
              <button
                onClick={() => toggleChart(product.id)}
                className="chart-btn"
              >
                {showCharts[product.id] ? 'Hide Chart' : 'Show Price History'}
              </button>
            </div>
            {showCharts[product.id] && (
              <div className="chart-container">
                <PriceChart productId={product.id} productTitle={product.title} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Alerts Section */}
      <Alerts products={products} />
    </div>
  );
}

export default App
