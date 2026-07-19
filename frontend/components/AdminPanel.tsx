'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { DashboardStats, Order, Product } from '@/types';

type ProductForm = {
  name: string;
  category: string;
  unit: string;
  price: string;
  imageUrl: string;
  description: string;
  stock: string;
  featured: boolean;
};

type ShipmentDrafts = Record<string, { carrier: string; trackingNumber: string; message: string }>;

type TextChangeEvent = {
  target: {
    value: string;
  };
};

type CheckboxChangeEvent = {
  target: {
    checked: boolean;
  };
};

const defaultProductForm: ProductForm = {
  name: '',
  category: '蔬菜',
  unit: '箱',
  price: '',
  imageUrl: '',
  description: '',
  stock: '',
  featured: true
};

const currency = (value: number) => `¥${value.toFixed(2)}`;

const isPasswordError = (error: unknown) =>
  error instanceof Error && /(unauthorized|后台密码错误|密码输入错误)/i.test(error.message);

export function AdminPanel() {
  const [adminPassword, setAdminPassword] = useState('');
  const [authorized, setAuthorized] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [productForm, setProductForm] = useState<ProductForm>(defaultProductForm);
  const [shipmentDrafts, setShipmentDrafts] = useState<ShipmentDrafts>({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [passwordPopupOpen, setPasswordPopupOpen] = useState(false);

  const closePasswordPopup = () => {
    setPasswordPopupOpen(false);
    setAdminPassword('');
  };

  const handleAdminError = (error: unknown, showPopup: boolean) => {
    if (isPasswordError(error)) {
      window.localStorage.removeItem('admin-password');
      setAuthorized(false);
      if (showPopup) {
        setPasswordPopupOpen(true);
      }
      return '密码输入错误';
    }

    return error instanceof Error ? error.message : '后台数据加载失败';
  };

  const loadAll = async (password: string, showPopup = false) => {
    try {
      setLoading(true);
      const [dashboard, productData, orderData] = await Promise.all([
        api.dashboard(password),
        api.listProducts(),
        api.listOrders(password)
      ]);
      setStats(dashboard);
      setProducts(productData);
      setOrders(orderData);
      setAuthorized(true);
      setMessage('');
    } catch (error) {
      setMessage(handleAdminError(error, showPopup));
      setAuthorized(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedPassword = window.localStorage.getItem('admin-password') ?? '';
    if (!savedPassword) {
      setLoading(false);
      return;
    }

    setAdminPassword(savedPassword);
    void loadAll(savedPassword);
  }, []);

  const handleLogin = async () => {
    if (!adminPassword) {
      setMessage('请输入后台密码');
      return;
    }

    window.localStorage.setItem('admin-password', adminPassword);
    setMessage('');
    await loadAll(adminPassword, true);
  };

  const handleLogout = () => {
    window.localStorage.removeItem('admin-password');
    setAdminPassword('');
    setAuthorized(false);
    setStats(null);
    setProducts([]);
    setOrders([]);
    setShipmentDrafts({});
    setMessage('已退出后台登录');
  };

  const handleCreateProduct = async () => {
    if (!productForm.name || !productForm.price || !productForm.stock || !productForm.imageUrl) {
      setMessage('请填写完整商品信息');
      return;
    }

    try {
      await api.saveProduct({
        id: '',
        name: productForm.name,
        category: productForm.category,
        unit: productForm.unit,
        price: Number(productForm.price),
        imageUrl: productForm.imageUrl,
        description: productForm.description,
        stock: Number(productForm.stock),
        featured: productForm.featured
      }, adminPassword);
      setProductForm(defaultProductForm);
      setMessage('商品已新增');
      await loadAll();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '商品新增失败');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await api.deleteProduct(productId, adminPassword);
      setMessage('商品已删除');
      await loadAll();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '商品删除失败');
    }
  };

  const handleShip = async (orderId: string) => {
    const draft = shipmentDrafts[orderId];
    if (!draft?.carrier || !draft.trackingNumber || !draft.message) {
      setMessage('请先填写物流信息');
      return;
    }

    try {
      await api.shipOrder(orderId, draft, adminPassword);
      setMessage('已更新物流信息');
      await loadAll();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '物流更新失败');
    }
  };

  const handleDeliver = async (orderId: string) => {
    try {
      await api.deliverOrder(orderId, adminPassword);
      setMessage('订单已更新为待签收');
      await loadAll();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '送达更新失败');
    }
  };

  return (
    <div className="admin-page">
      {passwordPopupOpen ? (
        <div className="modal-overlay" role="presentation">
          <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="password-popup-title">
            <h3 id="password-popup-title">密码输入错误</h3>
            <p>请输入正确的管理员密码后重试。</p>
            <div className="modal-actions">
              <button type="button" className="secondary" onClick={closePasswordPopup}>
                Cancel
              </button>
              <button type="button" onClick={closePasswordPopup}>
                OK
              </button>
            </div>
          </section>
        </div>
      ) : null}

      <section className="hero slim">
        <div>
          <span className="chip">后台管理</span>
          <h2>商品、订单、物流、签收四大管理模块</h2>
          <p>适合作为 MVP 或企业内网系统基础版本继续扩展。</p>
        </div>
      </section>

      {message ? <p className="message">{message}</p> : null}

      {!authorized && !loading ? (
        <section className="panel-card">
          <div className="section-title compact">
            <h3>管理员验证</h3>
            <p>请输入后台密码后访问管理页面</p>
          </div>
          <div className="form-grid">
            <input
              type="password"
              placeholder="后台密码"
              value={adminPassword}
              onChange={(event: TextChangeEvent) => setAdminPassword(event.target.value)}
            />
          </div>
          <button className="full-btn" onClick={handleLogin}>进入后台</button>
        </section>
      ) : null}

      {loading ? (
        <div className="empty-card">正在加载后台数据...</div>
      ) : authorized ? (
        <>
          <div className="admin-toolbar">
            <button className="secondary" onClick={handleLogout}>Logout</button>
          </div>

          <section className="stats-grid">
            <div className="stat-card">
              <span>商品总数</span>
              <strong>{stats?.productCount ?? 0}</strong>
            </div>
            <div className="stat-card">
              <span>订单总数</span>
              <strong>{stats?.orderCount ?? 0}</strong>
            </div>
            <div className="stat-card">
              <span>待发货</span>
              <strong>{stats?.pendingShipments ?? 0}</strong>
            </div>
            <div className="stat-card">
              <span>累计营收</span>
              <strong>{currency(stats?.revenue ?? 0)}</strong>
            </div>
          </section>

          <section className="admin-grid">
            <div className="panel-card">
              <div className="section-title compact">
                <h3>商品管理</h3>
                <p>新增 / 删除商品</p>
              </div>
              <div className="form-grid">
                <input placeholder="商品名称" value={productForm.name} onChange={(event: TextChangeEvent) => setProductForm((current) => ({ ...current, name: event.target.value }))} />
                <input placeholder="分类" value={productForm.category} onChange={(event: TextChangeEvent) => setProductForm((current) => ({ ...current, category: event.target.value }))} />
                <input placeholder="单位" value={productForm.unit} onChange={(event: TextChangeEvent) => setProductForm((current) => ({ ...current, unit: event.target.value }))} />
                <input placeholder="价格" value={productForm.price} onChange={(event: TextChangeEvent) => setProductForm((current) => ({ ...current, price: event.target.value }))} />
                <input placeholder="库存" value={productForm.stock} onChange={(event: TextChangeEvent) => setProductForm((current) => ({ ...current, stock: event.target.value }))} />
                <input placeholder="图片 URL" value={productForm.imageUrl} onChange={(event: TextChangeEvent) => setProductForm((current) => ({ ...current, imageUrl: event.target.value }))} />
                <textarea placeholder="商品描述" value={productForm.description} onChange={(event: TextChangeEvent) => setProductForm((current) => ({ ...current, description: event.target.value }))} />
                <label className="checkbox-row">
                  <input type="checkbox" checked={productForm.featured} onChange={(event: CheckboxChangeEvent) => setProductForm((current) => ({ ...current, featured: event.target.checked }))} />
                  设为热销商品
                </label>
              </div>
              <button className="full-btn" onClick={handleCreateProduct}>新增商品</button>

              <div className="table-list">
                {products.map((product) => (
                  <div className="table-row" key={product.id}>
                    <div>
                      <strong>{product.name}</strong>
                      <p>{product.category} / 库存 {product.stock}{product.unit}</p>
                    </div>
                    <div className="inline-actions">
                      <strong>{currency(product.price)}</strong>
                      <button className="secondary" onClick={() => handleDeleteProduct(product.id)}>删除</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel-card">
              <div className="section-title compact">
                <h3>订单与物流管理</h3>
                <p>发货 / 更新送达</p>
              </div>
              <div className="orders-list">
                {orders.length === 0 ? (
                  <div className="empty-card small">暂无订单</div>
                ) : (
                  orders.map((order) => {
                    const shipmentDraft = shipmentDrafts[order.id] ?? {
                      carrier: '',
                      trackingNumber: '',
                      message: ''
                    };

                    return (
                      <div className="order-card" key={order.id}>
                        <div className="order-head">
                          <div>
                            <h4>订单 {order.id.slice(0, 8)}</h4>
                            <p>{order.customer.name} / {order.customer.phone}</p>
                          </div>
                          <span className="status-badge">{order.shipment.status}</span>
                        </div>
                        <div className="mini-list">
                          {order.items.map((item) => (
                            <div key={item.productId}>
                              <span>{item.productName} × {item.quantity}</span>
                              <strong>{currency(item.subtotal)}</strong>
                            </div>
                          ))}
                        </div>
                        <div className="form-grid compact-grid">
                          <input
                            placeholder="物流公司"
                            value={shipmentDraft.carrier}
                            onChange={(event: TextChangeEvent) =>
                              setShipmentDrafts((current) => ({
                                ...current,
                                [order.id]: { ...shipmentDraft, carrier: event.target.value }
                              }))
                            }
                          />
                          <input
                            placeholder="物流单号"
                            value={shipmentDraft.trackingNumber}
                            onChange={(event: TextChangeEvent) =>
                              setShipmentDrafts((current) => ({
                                ...current,
                                [order.id]: { ...shipmentDraft, trackingNumber: event.target.value }
                              }))
                            }
                          />
                          <textarea
                            placeholder="物流备注，如：已从基地发出"
                            value={shipmentDraft.message}
                            onChange={(event: TextChangeEvent) =>
                              setShipmentDrafts((current) => ({
                                ...current,
                                [order.id]: { ...shipmentDraft, message: event.target.value }
                              }))
                            }
                          />
                        </div>
                        <div className="actions">
                          <button onClick={() => handleShip(order.id)} disabled={order.status === 'CANCELLED' || order.status === 'SIGNED'}>
                            发货/更新物流
                          </button>
                          <button className="secondary" onClick={() => handleDeliver(order.id)} disabled={order.shipment.status !== 'IN_TRANSIT'}>
                            标记送达
                          </button>
                        </div>
                        <div className="logistics-box muted">
                          <strong>{order.shipment.carrier} - {order.shipment.trackingNumber}</strong>
                          <ul>
                            {order.shipment.events.map((event, index) => (
                              <li key={`${event.time}-${index}`}>{event.time} - {event.message}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
