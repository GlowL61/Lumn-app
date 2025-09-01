import React, { useState, useEffect } from 'react';

interface Alert {
  id: number;
  product_id: number;
  target_price: number;
  alert_type: string;
  user_email?: string;
  is_active: boolean;
  product_title: string;
  external_id: string;
  platform_name: string;
}

interface Product {
  id: number;
  title: string;
  platform_name: string;
  external_id: string;
}

interface AlertsProps {
  products: Product[];
}

const Alerts: React.FC<AlertsProps> = ({ products }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [alertType, setAlertType] = useState('below');
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/alerts');
      const data = await response.json();
      setAlerts(data);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const createAlert = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProductId || !targetPrice) return;

    try {
      const response = await fetch('http://localhost:3001/api/alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: parseInt(selectedProductId),
          targetPrice: parseFloat(targetPrice),
          alertType,
          userEmail: userEmail || undefined,
        }),
      });

      if (response.ok) {
        setShowCreateForm(false);
        setSelectedProductId('');
        setTargetPrice('');
        setUserEmail('');
        fetchAlerts();
      } else {
        alert('Error creating alert');
      }
    } catch (error) {
      console.error('Error creating alert:', error);
      alert('Error creating alert');
    }
  };

  const deleteAlert = async (alertId: number) => {
    try {
      const response = await fetch(`http://localhost:3001/api/alerts/${alertId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchAlerts();
      } else {
        alert('Error deleting alert');
      }
    } catch (error) {
      console.error('Error deleting alert:', error);
      alert('Error deleting alert');
    }
  };

  const toggleAlert = async (alertId: number, isActive: boolean) => {
    try {
      const response = await fetch(`http://localhost:3001/api/alerts/${alertId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: !isActive,
        }),
      });

      if (response.ok) {
        fetchAlerts();
      } else {
        alert('Error updating alert');
      }
    } catch (error) {
      console.error('Error updating alert:', error);
      alert('Error updating alert');
    }
  };

  return (
    <div className="alerts-section">
      <h2>Price Alerts</h2>

      <button
        onClick={() => setShowCreateForm(!showCreateForm)}
        className="create-alert-btn"
      >
        {showCreateForm ? 'Cancel' : 'Create New Alert'}
      </button>

      {showCreateForm && (
        <form onSubmit={createAlert} className="alert-form">
          <div className="form-group">
            <label>Product:</label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              required
            >
              <option value="">Select a product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.title} ({product.platform_name})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Alert Type:</label>
            <select
              value={alertType}
              onChange={(e) => setAlertType(e.target.value)}
            >
              <option value="below">Alert when price goes below</option>
              <option value="above">Alert when price goes above</option>
            </select>
          </div>

          <div className="form-group">
            <label>Target Price ($):</label>
            <input
              type="number"
              step="0.01"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Email (optional):</label>
            <input
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="your@email.com"
            />
          </div>

          <button type="submit" className="submit-btn">Create Alert</button>
        </form>
      )}

      <div className="alerts-list">
        {alerts.map((alert) => (
          <div key={alert.id} className="alert-item">
            <div className="alert-info">
              <h4>{alert.product_title}</h4>
              <p>{alert.platform_name} - {alert.external_id}</p>
              <p>
                Alert when price goes {alert.alert_type} ${alert.target_price}
              </p>
              {alert.user_email && <p>Email: {alert.user_email}</p>}
            </div>
            <div className="alert-actions">
              <button
                onClick={() => toggleAlert(alert.id, alert.is_active)}
                className={`toggle-btn ${alert.is_active ? 'active' : 'inactive'}`}
              >
                {alert.is_active ? 'Active' : 'Inactive'}
              </button>
              <button
                onClick={() => deleteAlert(alert.id)}
                className="delete-btn"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Alerts;