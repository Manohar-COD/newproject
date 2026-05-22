import { useState, useEffect } from 'react';
import { Package, Search, Plus, AlertCircle, DollarSign, Edit2, Trash2, X } from 'lucide-react';
import './index.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/products';

function App() {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [formData, setFormData] = useState({ name: '', quantity: '', price: '' });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const productData = {
      name: formData.name,
      quantity: parseInt(formData.quantity),
      price: parseFloat(formData.price)
    };

    try {
      if (currentProduct) {
        // Update
        await fetch(`${API_URL}/${currentProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData)
        });
      } else {
        // Add new
        await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData)
        });
      }
      fetchProducts();
      closeModal();
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const openModal = (product = null) => {
    if (product) {
      setCurrentProduct(product);
      setFormData({
        name: product.name,
        quantity: product.quantity.toString(),
        price: product.price.toString()
      });
    } else {
      setCurrentProduct(null);
      setFormData({ name: '', quantity: '', price: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentProduct(null);
    setFormData({ name: '', quantity: '', price: '' });
  };

  // Derived calculations
  const totalValue = products.reduce((sum, p) => sum + (p.quantity * p.price), 0);
  const lowStockCount = products.filter(p => p.quantity < 5).length;
  
  // Filtering
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.id.toString() === searchQuery
  );

  return (
    <div>
      <div className="header">
        <h1>Inventory Manager Pro</h1>
        <p>Manage your stock beautifully and efficiently.</p>
      </div>

      <div className="dashboard-metrics">
        <div className="glass-panel metric-card">
          <Package size={32} />
          <h3>Total Products</h3>
          <div className="value">{products.length}</div>
        </div>
        <div className="glass-panel metric-card">
          <DollarSign size={32} />
          <h3>Total Inventory Value</h3>
          <div className="value">${totalValue.toFixed(2)}</div>
        </div>
        <div className={`glass-panel metric-card ${lowStockCount > 0 ? 'low-stock' : ''}`}>
          <AlertCircle size={32} />
          <h3>Low Stock Alerts (&lt; 5 items)</h3>
          <div className="value">{lowStockCount}</div>
        </div>
      </div>

      <div className="glass-panel">
        <div className="flex-between">
          <h2>Product Inventory</h2>
          <button onClick={() => openModal()}>
            <Plus size={20} /> Add Product
          </button>
        </div>

        <div className="search-bar">
          <input 
            type="text" 
            placeholder="Search by ID or Name..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                    No products found.
                  </td>
                </tr>
              ) : (
                filteredProducts.map(product => (
                  <tr key={product.id}>
                    <td>#{product.id}</td>
                    <td>{product.name}</td>
                    <td>{product.quantity}</td>
                    <td>${product.price.toFixed(2)}</td>
                    <td>
                      <span className={`badge ${product.quantity < 5 ? 'low' : 'good'}`}>
                        {product.quantity < 5 ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>
                    <td>
                      <button className="icon-btn edit" onClick={() => openModal(product)} title="Edit">
                        <Edit2 size={18} />
                      </button>
                      <button className="icon-btn delete" onClick={() => handleDelete(product.id)} title="Delete">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={(e) => e.target.className === 'modal-overlay' && closeModal()}>
          <div className="glass-panel modal-content">
            <div className="modal-header">
              <h2>{currentProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button className="icon-btn" onClick={closeModal}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Product Name</label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleInputChange} 
                  required 
                  placeholder="e.g. Wireless Mouse"
                />
              </div>
              <div className="form-group">
                <label>Quantity</label>
                <input 
                  type="number" 
                  name="quantity" 
                  value={formData.quantity} 
                  onChange={handleInputChange} 
                  required 
                  min="0"
                />
              </div>
              <div className="form-group">
                <label>Price ($)</label>
                <input 
                  type="number" 
                  name="price" 
                  value={formData.price} 
                  onChange={handleInputChange} 
                  required 
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={closeModal}>Cancel</button>
                <button type="submit">{currentProduct ? 'Save Changes' : 'Add Product'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
