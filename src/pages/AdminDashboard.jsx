import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import './AdminDashboard.css';

function AdminDashboard({ navigateTo }) {
  const { user, isAdmin, signOut } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [settings, setSettings] = useState({});
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [variants, setVariants] = useState([]);
  const [selectedParentProduct, setSelectedParentProduct] = useState(null);
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [editingVariant, setEditingVariant] = useState(null);

  useEffect(() => {
    if (!user || !isAdmin) {
      navigateTo('home');
      return;
    }
    loadData();
  }, [user, isAdmin]);

  const loadData = async () => {
    try {
      const [productsRes, ordersRes, reviewsRes, settingsRes, variantsRes] = await Promise.all([
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('orders').select('*, products(name)').order('created_at', { ascending: false }),
        supabase.from('reviews').select('*').order('created_at', { ascending: false }),
        supabase.from('site_settings').select('*'),
        supabase.from('product_variants').select('*, products(name)').order('sort_order')
      ]);

      if (productsRes.data) setProducts(productsRes.data);
      if (ordersRes.data) setOrders(ordersRes.data);
      if (reviewsRes.data) setReviews(reviewsRes.data);
      if (variantsRes.data) setVariants(variantsRes.data);

      if (settingsRes.data) {
        const settingsObj = {};
        settingsRes.data.forEach(setting => {
          settingsObj[setting.key] = setting.value;
        });
        setSettings(settingsObj);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { label: 'Out of Stock', color: '#ef4444' };
    if (stock < 10) return { label: 'Low Stock', color: '#fbbf24' };
    return { label: 'In Stock', color: '#10b981' };
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'in-stock') return matchesSearch && product.stock > 0;
    if (filterStatus === 'out-of-stock') return matchesSearch && product.stock === 0;
    if (filterStatus === 'featured') return matchesSearch && product.featured;

    return matchesSearch;
  });

  const handleLogout = async () => {
    await signOut();
    navigateTo('home');
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const productData = {
      name: formData.get('name'),
      category: formData.get('category'),
      description: formData.get('description'),
      price: parseFloat(formData.get('price')),
      sale_price: parseFloat(formData.get('sale_price')),
      stock: parseInt(formData.get('stock')),
      image: formData.get('image'),
      featured: formData.get('featured') === 'on',
      has_variants: formData.get('has_variants') === 'on',
      sellauth_product_id: formData.get('sellauth_product_id') || null,
      sellauth_variant_id: formData.get('sellauth_variant_id') || null,
      updated_at: new Date().toISOString()
    };

    try {
      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);
        if (error) throw error;
        showToast('Product updated successfully!');
      } else {
        const { error } = await supabase
          .from('products')
          .insert([productData]);
        if (error) throw error;
        showToast('Product added successfully!');
      }
      setShowProductModal(false);
      setEditingProduct(null);
      loadData();
    } catch (error) {
      showToast('Error saving product: ' + error.message, 'error');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      if (error) throw error;
      showToast('Product deleted successfully!');
      loadData();
    } catch (error) {
      showToast('Error deleting product: ' + error.message, 'error');
    }
  };

  const handleDeleteReview = async (id) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', id);
      if (error) throw error;
      showToast('Review deleted successfully!');
      loadData();
    } catch (error) {
      showToast('Error deleting review: ' + error.message, 'error');
    }
  };

  const updateProductStock = async (id, newStock) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ stock: newStock })
        .eq('id', id);
      if (error) throw error;
      showToast('Stock updated successfully!');
      loadData();
    } catch (error) {
      showToast('Error updating stock: ' + error.message, 'error');
    }
  };

  const toggleFeatured = async (product) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ featured: !product.featured })
        .eq('id', product.id);
      if (error) throw error;
      showToast(`Product ${!product.featured ? 'featured' : 'unfeatured'} successfully!`);
      loadData();
    } catch (error) {
      showToast('Error updating product: ' + error.message, 'error');
    }
  };

  const handleVariantSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const variantData = {
      parent_id: selectedParentProduct?.id,
      name: formData.get('name'),
      description: formData.get('description'),
      price: parseFloat(formData.get('price')),
      sale_price: parseFloat(formData.get('sale_price')),
      stock: parseInt(formData.get('stock')),
      image: formData.get('image'),
      sort_order: parseInt(formData.get('sort_order') || 0),
      sellauth_product_id: formData.get('sellauth_product_id') || null,
      sellauth_variant_id: formData.get('sellauth_variant_id') || null,
      updated_at: new Date().toISOString()
    };

    try {
      if (editingVariant) {
        const { error } = await supabase
          .from('product_variants')
          .update(variantData)
          .eq('id', editingVariant.id);
        if (error) throw error;
        showToast('Variant updated successfully!');
      } else {
        const { error } = await supabase
          .from('product_variants')
          .insert([variantData]);
        if (error) throw error;
        showToast('Variant added successfully!');
      }
      setShowVariantModal(false);
      setEditingVariant(null);
      loadData();
    } catch (error) {
      showToast('Error saving variant: ' + error.message, 'error');
    }
  };

  const handleDeleteVariant = async (id) => {
    if (!confirm('Are you sure you want to delete this variant?')) return;

    try {
      const { error } = await supabase
        .from('product_variants')
        .delete()
        .eq('id', id);
      if (error) throw error;
      showToast('Variant deleted successfully!');
      loadData();
    } catch (error) {
      showToast('Error deleting variant: ' + error.message, 'error');
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
      const updates = [
        { key: 'hero_image', value: formData.get('hero_image') },
        { key: 'discord_link', value: formData.get('discord_link') },
        { key: 'hero_heading', value: formData.get('hero_heading') },
        { key: 'hero_subheading', value: formData.get('hero_subheading') },
        { key: 'hero_paragraph', value: formData.get('hero_paragraph') }
      ];

      for (const update of updates) {
        const { error } = await supabase
          .from('site_settings')
          .update({ value: update.value, updated_at: new Date().toISOString() })
          .eq('key', update.key);
        if (error) throw error;
      }

      showToast('Settings saved successfully!');
      loadData();
    } catch (error) {
      showToast('Error saving settings: ' + error.message, 'error');
    }
  };

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="admin-dashboard">
      <div className={`toast ${toast.show ? 'show' : ''} ${toast.type}`}>
        {toast.message}
      </div>

      <aside className="admin-sidebar">
        <div className="sidebar-logo">AuroraServices</div>
        <ul className="sidebar-menu">
          <li>
            <a
              className={activeSection === 'dashboard' ? 'active' : ''}
              onClick={() => setActiveSection('dashboard')}
            >
              📊 Dashboard
            </a>
          </li>
          <li>
            <a
              className={activeSection === 'products' ? 'active' : ''}
              onClick={() => setActiveSection('products')}
            >
              📦 Products
            </a>
          </li>
          <li>
            <a
              className={activeSection === 'orders' ? 'active' : ''}
              onClick={() => setActiveSection('orders')}
            >
              🛒 Orders
            </a>
          </li>
          <li>
            <a
              className={activeSection === 'reviews' ? 'active' : ''}
              onClick={() => setActiveSection('reviews')}
            >
              ⭐ Reviews
            </a>
          </li>
          <li>
            <a
              className={activeSection === 'variants' ? 'active' : ''}
              onClick={() => setActiveSection('variants')}
            >
              🔄 Variants
            </a>
          </li>
          <li>
            <a
              className={activeSection === 'settings' ? 'active' : ''}
              onClick={() => setActiveSection('settings')}
            >
              ⚙️ Settings
            </a>
          </li>
          <li>
            <a onClick={handleLogout} style={{ color: '#ef4444' }}>
              🚪 Logout
            </a>
          </li>
        </ul>
      </aside>

      <main className="admin-main">
        {activeSection === 'dashboard' && (
          <div className="admin-section">
            <div className="admin-header">
              <h1 className="admin-title">Dashboard</h1>
            </div>
            <div className="stats-cards">
              <div className="stat-card-admin">
                <h3>Total Products</h3>
                <div className="number">{products.length}</div>
              </div>
              <div className="stat-card-admin">
                <h3>Total Orders</h3>
                <div className="number">{orders.length}</div>
              </div>
              <div className="stat-card-admin">
                <h3>Total Reviews</h3>
                <div className="number">{reviews.length}</div>
              </div>
              <div className="stat-card-admin">
                <h3>Pending Orders</h3>
                <div className="number">{orders.filter(o => o.status === 'pending').length}</div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'products' && (
          <div className="admin-section">
            <div className="admin-header">
              <h1 className="admin-title">Products Management</h1>
              <button
                className="btn-add"
                onClick={() => {
                  setEditingProduct(null);
                  setShowProductModal(true);
                }}
              >
                + Add New Product
              </button>
            </div>

            <div className="product-controls">
              <input
                type="text"
                className="search-input"
                placeholder="Search products by name or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select
                className="filter-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Products ({products.length})</option>
                <option value="in-stock">In Stock ({products.filter(p => p.stock > 0).length})</option>
                <option value="out-of-stock">Out of Stock ({products.filter(p => p.stock === 0).length})</option>
                <option value="featured">Featured ({products.filter(p => p.featured).length})</option>
              </select>
            </div>

            <div className="products-grid-admin">
              {filteredProducts.length > 0 ? (
                filteredProducts.map(product => {
                  const stockStatus = getStockStatus(product.stock);
                  return (
                    <div key={product.id} className="product-card-admin">
                      <div className="product-image-admin">
                        <img src={product.image} alt={product.name} />
                        <span className="stock-badge" style={{ backgroundColor: stockStatus.color }}>
                          {stockStatus.label}
                        </span>
                      </div>
                      <div className="product-info-admin">
                        <h3>{product.name}</h3>
                        <p className="category">{product.category}</p>
                        <div className="price-row">
                          <div className="price-info">
                            <span className="original-price">${product.price?.toFixed(2)}</span>
                            <span className="sale-price">${product.sale_price?.toFixed(2)}</span>
                          </div>
                          <span className={`featured-badge ${product.featured ? 'active' : ''}`}>
                            {product.featured ? '★ Featured' : 'Not Featured'}
                          </span>
                        </div>
                        <div className="stock-info">
                          <span>Stock: <strong>{product.stock}</strong></span>
                        </div>
                        <div className="quick-actions">
                          <button
                            className={`quick-btn featured-toggle ${product.featured ? 'active' : ''}`}
                            onClick={() => toggleFeatured(product)}
                            title={product.featured ? 'Remove from featured' : 'Add to featured'}
                          >
                            ★
                          </button>
                          <button
                            className="quick-btn stock-dec"
                            onClick={() => updateProductStock(product.id, Math.max(0, product.stock - 1))}
                            disabled={product.stock === 0}
                            title="Decrease stock"
                          >
                            -
                          </button>
                          <span className="stock-display">{product.stock}</span>
                          <button
                            className="quick-btn stock-inc"
                            onClick={() => updateProductStock(product.id, product.stock + 1)}
                            title="Increase stock"
                          >
                            +
                          </button>
                        </div>
                        <div className="product-actions">
                          <button
                            className="action-btn edit-btn"
                            onClick={() => {
                              setEditingProduct(product);
                              setShowProductModal(true);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            className="action-btn delete-btn"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="no-products">
                  <p>No products found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeSection === 'orders' && (
          <div className="admin-section">
            <div className="admin-header">
              <h1 className="admin-title">Orders Management</h1>
            </div>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order Number</th>
                  <th>Product</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id}>
                    <td>{order.order_number}</td>
                    <td>{order.products?.name}</td>
                    <td>{order.customer_email}</td>
                    <td>${order.amount?.toFixed(2)}</td>
                    <td>
                      <span className={`badge ${order.status === 'completed' ? 'badge-success' : 'badge-warning'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>{new Date(order.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeSection === 'reviews' && (
          <div className="admin-section">
            <div className="admin-header">
              <h1 className="admin-title">Reviews Management</h1>
            </div>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Author</th>
                  <th>Rating</th>
                  <th>Comment</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map(review => (
                  <tr key={review.id}>
                    <td>{review.author}</td>
                    <td>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</td>
                    <td>{review.comment}</td>
                    <td>{new Date(review.created_at).toLocaleDateString()}</td>
                    <td>
                      <button
                        className="action-btn"
                        onClick={() => handleDeleteReview(review.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeSection === 'variants' && (
          <div className="admin-section">
            <div className="admin-header">
              <h1 className="admin-title">Product Variants Management</h1>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label className="form-label">Select Parent Product</label>
              <select
                className="filter-select"
                value={selectedParentProduct?.id || ''}
                onChange={(e) => {
                  const product = products.find(p => p.id === e.target.value);
                  setSelectedParentProduct(product);
                }}
                style={{ marginBottom: '16px' }}
              >
                <option value="">Select a product with variants...</option>
                {products.filter(p => p.has_variants).map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>

              {selectedParentProduct && (
                <button
                  className="btn-add"
                  onClick={() => {
                    setEditingVariant(null);
                    setShowVariantModal(true);
                  }}
                  style={{ marginTop: '8px' }}
                >
                  + Add Variant to {selectedParentProduct.name}
                </button>
              )}
            </div>

            {selectedParentProduct ? (
              <div className="products-grid-admin">
                {variants
                  .filter(v => v.parent_id === selectedParentProduct.id)
                  .map(variant => {
                    const stockStatus = getStockStatus(variant.stock);
                    return (
                      <div key={variant.id} className="product-card-admin">
                        <div className="product-image-admin">
                          <img src={variant.image} alt={variant.name} />
                          <span className="stock-badge" style={{ backgroundColor: stockStatus.color }}>
                            {stockStatus.label}
                          </span>
                        </div>
                        <div className="product-info-admin">
                          <h3>{variant.name}</h3>
                          <p className="category">{variant.description || 'No description'}</p>
                          <div className="price-row">
                            <div className="price-info">
                              <span className="original-price">${variant.price?.toFixed(2)}</span>
                              <span className="sale-price">${variant.sale_price?.toFixed(2)}</span>
                            </div>
                          </div>
                          <div className="stock-info">
                            <span>Stock: <strong>{variant.stock}</strong></span>
                            <span style={{ marginLeft: '16px' }}>Sort: <strong>{variant.sort_order}</strong></span>
                          </div>
                          <div className="product-actions">
                            <button
                              className="action-btn edit-btn"
                              onClick={() => {
                                setEditingVariant(variant);
                                setShowVariantModal(true);
                              }}
                            >
                              Edit
                            </button>
                            <button
                              className="action-btn delete-btn"
                              onClick={() => handleDeleteVariant(variant.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                {variants.filter(v => v.parent_id === selectedParentProduct.id).length === 0 && (
                  <div className="no-products">
                    <p>No variants found for this product. Click "Add Variant" to create one.</p>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(255, 255, 255, 0.5)' }}>
                <p>Select a parent product to view and manage its variants</p>
              </div>
            )}
          </div>
        )}

        {activeSection === 'settings' && (
          <div className="admin-section">
            <div className="admin-header">
              <h1 className="admin-title">Site Settings</h1>
            </div>
            <div className="settings-form-container">
              <form onSubmit={handleSaveSettings}>
                <div className="form-group">
                  <label className="form-label">Hero Image URL</label>
                  <input
                    type="text"
                    className="form-input"
                    name="hero_image"
                    defaultValue={settings.hero_image}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Discord Server Link</label>
                  <input
                    type="text"
                    className="form-input"
                    name="discord_link"
                    defaultValue={settings.discord_link}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Hero Heading</label>
                  <input
                    type="text"
                    className="form-input"
                    name="hero_heading"
                    defaultValue={settings.hero_heading}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Hero Subheading</label>
                  <input
                    type="text"
                    className="form-input"
                    name="hero_subheading"
                    defaultValue={settings.hero_subheading}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Hero Paragraph</label>
                  <textarea
                    className="form-textarea"
                    name="hero_paragraph"
                    defaultValue={settings.hero_paragraph}
                    required
                  />
                </div>
                <button type="submit" className="btn-add">
                  Save Settings
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      {showProductModal && (
        <div className="modal active">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button
                className="close-btn"
                onClick={() => {
                  setShowProductModal(false);
                  setEditingProduct(null);
                }}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleProductSubmit}>
              <div className="form-group">
                <label className="form-label">Product Name</label>
                <input
                  type="text"
                  className="form-input"
                  name="name"
                  defaultValue={editingProduct?.name}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <input
                  type="text"
                  className="form-input"
                  name="category"
                  defaultValue={editingProduct?.category}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  name="description"
                  defaultValue={editingProduct?.description}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Price</label>
                <input
                  type="number"
                  className="form-input"
                  name="price"
                  step="0.01"
                  defaultValue={editingProduct?.price}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Sale Price</label>
                <input
                  type="number"
                  className="form-input"
                  name="sale_price"
                  step="0.01"
                  defaultValue={editingProduct?.sale_price}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Stock</label>
                <input
                  type="number"
                  className="form-input"
                  name="stock"
                  defaultValue={editingProduct?.stock}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Image URL</label>
                <input
                  type="text"
                  className="form-input"
                  name="image"
                  defaultValue={editingProduct?.image}
                  required
                />
              </div>
              <div className="form-group">
                <label style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                  <input
                    type="checkbox"
                    name="featured"
                    defaultChecked={editingProduct?.featured}
                    style={{ marginRight: '8px' }}
                  />
                  Featured Product
                </label>
              </div>
              <div className="form-group">
                <label style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                  <input
                    type="checkbox"
                    name="has_variants"
                    defaultChecked={editingProduct?.has_variants}
                    style={{ marginRight: '8px' }}
                  />
                  Has Variants (Multiple Sub-Products)
                </label>
              </div>
              <div className="form-group">
                <label className="form-label">SellAuth Product ID</label>
                <input
                  type="text"
                  className="form-input"
                  name="sellauth_product_id"
                  defaultValue={editingProduct?.sellauth_product_id}
                  placeholder="e.g., 12345"
                />
                <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', marginTop: '4px' }}>
                  Numeric Product ID from your SellAuth Dashboard at https://dash.sellauth.com under Products
                </p>
              </div>
              <div className="form-group">
                <label className="form-label">SellAuth Variant ID (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  name="sellauth_variant_id"
                  defaultValue={editingProduct?.sellauth_variant_id}
                  placeholder="e.g., 67890"
                />
                <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', marginTop: '4px' }}>
                  Numeric Variant ID from your SellAuth Dashboard. Use this for products without variants to specify a specific variant option.
                </p>
              </div>
              <button type="submit" className="btn-primary full-width">
                Save Product
              </button>
            </form>
          </div>
        </div>
      )}

      {showVariantModal && (
        <div className="modal active">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingVariant ? 'Edit Variant' : 'Add New Variant'}</h2>
              <button
                className="close-btn"
                onClick={() => {
                  setShowVariantModal(false);
                  setEditingVariant(null);
                }}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleVariantSubmit}>
              <div className="form-group">
                <label className="form-label">Variant Name</label>
                <input
                  type="text"
                  className="form-input"
                  name="name"
                  defaultValue={editingVariant?.name}
                  placeholder="e.g., Roblox 1000 Robux"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  name="description"
                  defaultValue={editingVariant?.description}
                  placeholder="Brief description of this variant"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Original Price</label>
                <input
                  type="number"
                  className="form-input"
                  name="price"
                  step="0.01"
                  defaultValue={editingVariant?.price}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Sale Price</label>
                <input
                  type="number"
                  className="form-input"
                  name="sale_price"
                  step="0.01"
                  defaultValue={editingVariant?.sale_price}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Stock Quantity</label>
                <input
                  type="number"
                  className="form-input"
                  name="stock"
                  defaultValue={editingVariant?.stock}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Image URL</label>
                <input
                  type="text"
                  className="form-input"
                  name="image"
                  defaultValue={editingVariant?.image}
                  placeholder="https://example.com/image.jpg"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Sort Order</label>
                <input
                  type="number"
                  className="form-input"
                  name="sort_order"
                  defaultValue={editingVariant?.sort_order || 0}
                  placeholder="0"
                />
              </div>
              <div className="form-group">
                <label className="form-label">SellAuth Product ID</label>
                <input
                  type="text"
                  className="form-input"
                  name="sellauth_product_id"
                  defaultValue={editingVariant?.sellauth_product_id}
                  placeholder="e.g., 12345"
                />
                <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', marginTop: '4px' }}>
                  Numeric Product ID from SellAuth Dashboard
                </p>
              </div>
              <div className="form-group">
                <label className="form-label">SellAuth Variant ID (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  name="sellauth_variant_id"
                  defaultValue={editingVariant?.sellauth_variant_id}
                  placeholder="e.g., 67890"
                />
                <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', marginTop: '4px' }}>
                  Numeric Variant ID from SellAuth Dashboard (if product has variants)
                </p>
              </div>
              <button type="submit" className="btn-primary full-width">
                Save Variant
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
