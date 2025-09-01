import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface PriceData {
  fetched_at: string;
  price: number;
  currency: string;
}

interface PriceChartProps {
  productId: number;
  productTitle: string;
}

const PriceChart: React.FC<PriceChartProps> = ({ productId, productTitle }) => {
  const [priceHistory, setPriceHistory] = useState<PriceData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPriceHistory();
  }, [productId]);

  const fetchPriceHistory = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/products/${productId}/prices`);
      const data = await response.json();
      setPriceHistory(data);
    } catch (error) {
      console.error('Error fetching price history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="chart-loading">Loading chart...</div>;
  }

  if (priceHistory.length === 0) {
    return <div className="no-data">No price history available</div>;
  }

  const chartData = {
    labels: priceHistory.map(item =>
      new Date(item.fetched_at).toLocaleDateString()
    ),
    datasets: [
      {
        label: 'Price',
        data: priceHistory.map(item => item.price),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
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
          callback: function(value: any) {
            return '$' + value;
          }
        }
      }
    }
  };

  return (
    <div className="price-chart">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default PriceChart;