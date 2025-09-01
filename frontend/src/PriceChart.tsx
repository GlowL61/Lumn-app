import React, { useEffect, useState, useCallback } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

interface PriceData {
  fetched_at: string;
  price: number;
  currency: string;
}

interface PlatformPriceData {
  date: string;
  price: number;
  currency: string;
}

type ChartDataItem = PriceData | PlatformPriceData;

interface Product {
  id: number;
  platform_name: string;
  title: string;
  external_id: string;
  platform_id: number;
}

interface PriceChartProps {
  productId: number;
  productTitle: string;
}

const PriceChart: React.FC<PriceChartProps> = ({ productId, productTitle }) => {
  const [priceHistory, setPriceHistory] = useState<PriceData[]>([]);
  const [platformPriceHistory, setPlatformPriceHistory] = useState<
    PlatformPriceData[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [usePlatformData, setUsePlatformData] = useState(false);
  const [platformName, setPlatformName] = useState("");

  // Fetch price history from database
  const fetchDatabasePriceHistory = useCallback(async () => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/products/${productId}/prices`,
      );
      const data = await response.json();
      setPriceHistory(data);
      return data;
    } catch (error) {
      console.error("Error fetching database price history:", error);
      return [];
    }
  }, [productId]);

  // Fetch price history from platform
  const fetchPlatformPriceHistory = useCallback(async () => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/products/${productId}/price-history`,
      );
      const data = await response.json();
      setPlatformPriceHistory(data);
      return data;
    } catch (error) {
      console.error("Error fetching platform price history:", error);
      return [];
    }
  }, [productId]);

  // Get product platform to determine if we should use platform data
  const fetchProductPlatform = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:3001/api/products");
      const products = await response.json();
      const product = products.find((p: Product) => p.id === productId);
      if (product) {
        setPlatformName(product.platform_name);
        // Use platform data for Qwen Coder products
        setUsePlatformData(product.platform_name === "Qwen Coder");
      }
    } catch (error) {
      console.error("Error fetching product platform:", error);
    }
  }, [productId]);

  useEffect(() => {
    const fetchData = async () => {
      await fetchProductPlatform();
      if (platformName === "Qwen Coder") {
        await fetchPlatformPriceHistory();
      } else {
        await fetchDatabasePriceHistory();
      }
      setLoading(false);
    };

    fetchData();
  }, [
    fetchDatabasePriceHistory,
    fetchPlatformPriceHistory,
    fetchProductPlatform,
    platformName,
  ]);

  if (loading) {
    return <div className="chart-loading">Loading chart...</div>;
  }

  // Determine which data to use
  const dataToDisplay = usePlatformData ? platformPriceHistory : priceHistory;

  if (dataToDisplay.length === 0) {
    return <div className="no-data">No price history available</div>;
  }

  const chartData = {
    labels: dataToDisplay.map((item: ChartDataItem) =>
      new Date(
        "fetched_at" in item ? item.fetched_at : item.date,
      ).toLocaleDateString(),
    ),
    datasets: [
      {
        label: "Price",
        data: dataToDisplay.map((item: ChartDataItem) => item.price),
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: `Price History: ${productTitle}`,
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          callback: function (value: number | string) {
            return "$" + value;
          },
        },
      },
    },
  };

  return (
    <div className="price-chart">
      <div className="chart-controls">
        {platformName === "Qwen Coder" && (
          <button
            onClick={() => setUsePlatformData(!usePlatformData)}
            className="toggle-data-btn"
          >
            Use {usePlatformData ? "Database" : "Platform"} Data
          </button>
        )}
      </div>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default PriceChart;
