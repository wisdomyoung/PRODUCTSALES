'use client';

import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { Order, Product } from '@/types';

type CartState = Record<string, number>;

type CheckoutForm = {
  name: string;
  phone: string;
  address: string;
  note: string;
};

type TextChangeEvent = {
  target: {
    value: string;
  };
};

const initialForm: CheckoutForm = {
  name: '',
  phone: '',
  address: '',
  note: ''
};

const RECENT_ORDER_IDS_KEY = 'agro-sale-recent-order-ids';

const currency = (value: number) => `¥${value.toFixed(2)}`;

const datetime = (value: string) =>
  new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value));

export function StoreFront() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartState>({});
  const [form, setForm] = useState<CheckoutForm>(initialForm);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await api.listProducts();
      setProducts(data);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '产品加载失败');
    } finally {
      setLoading(false);
    }
  };

  const loadRecentOrders = async () => {
    if (typeof window === 'undefined') {
      return;
    }

    const raw = window.localStorage.getItem(RECENT_ORDER_IDS_KEY);
    if (!raw) {
      return;
    }

    const orderIds = JSON.parse(raw) as string[];
    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return;
    }

    const orders = await Promise.all(
      orderIds.map(async (orderId) => {
        try {
          return await api.getOrder(orderId);
        } catch {
          return null;
        }
      })
    );

    setRecentOrders(orders.filter((order): order is Order => order !== null));
  };

  useEffect(() => {
    void loadProducts();
    void loadRecentOrders();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const orderIds = recentOrders.map((order) => order.id);
    window.localStorage.setItem(RECENT_ORDER_IDS_KEY, JSON.stringify(orderIds));
  }, [recentOrders]);

  const cartItems = useMemo(() => {
    return products
      .filter((product) => cart[product.id] > 0)
      .map((product) => ({
        ...product,
        quantity: cart[product.id],
        subtotal: product.price * cart[product.id]
      }));
  }, [cart, products]);

  const total = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.subtotal, 0),
    [cartItems]
  );

  const updateCart = (productId: string, delta: number) => {
    setCart((current) => {
      const nextQuantity = Math.max(0, (current[productId] ?? 0) + delta);
      return { ...current, [productId]: nextQuantity };
    });
  };

  const handleCheckout = async () => {
    if (!cartItems.length) {
      setMessage('请先选择商品');
      return;
    }
    if (!form.name || !form.phone || !form.address) {
      setMessage('请填写完整的收货信息');
      return;
    }

    try {
      setSubmitting(true);
      setMessage('');
      const order = await api.createOrder({
        items: cartItems.map((item) => ({ productId: item.id, quantity: item.quantity })),
        customer: form
      });
      setRecentOrders((current) => [order, ...current]);
      setCart({});
      setForm(initialForm);
      setMessage('下单成功，已生成物流单。');
      await loadProducts();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '下单失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (orderId: string) => {
    try {
      await api.cancelOrder(orderId);
      setRecentOrders((current) =>
        current.map((order) =>
          order.id === orderId ? { ...order, status: 'CANCELLED' } : order
        )
      );
      setMessage('订单已删除');
      await loadProducts();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '删除订单失败');
    }
  };

  const handleSign = async (orderId: string) => {
    try {
      const updated = await api.signOrder(orderId);
      setRecentOrders((current) => current.map((order) => (order.id === orderId ? updated : order)));
      setMessage('已完成签收');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '签收失败');
    }
  };

  return (
    <div className="page-grid">
      <section>
        <div className="hero">
          <div>
            <span className="chip">源头农场直供</span>
            <h2>支持商品展示、下单、删除订单、物流查看与签收</h2>
            <p>
              这是一个可直接二次开发的农产品商城前台，适合部署到服务器后对外提供访问。
            </p>
          </div>
          <div className="hero-card">
            <strong>核心能力</strong>
            <ul>
              <li>商品展示与库存</li>
              <li>购物车与下单</li>
              <li>订单删除</li>
              <li>物流状态查看</li>
              <li>签收确认</li>
            </ul>
          </div>
        </div>

        <div className="section-title">
          <h3>精选农产品</h3>
          <p>前台商城模块</p>
        </div>

        {loading ? (
          <div className="empty-card">正在加载商品...</div>
        ) : (
          <div className="product-grid">
            {products.map((product) => (
              <article className="product-card" key={product.id}>
                <img src={product.imageUrl} alt={product.name} />
                <div className="product-body">
                  <div className="product-topline">
                    <span className="tag">{product.category}</span>
                    {product.featured ? <span className="tag highlight">热销</span> : null}
                  </div>
                  <h4>{product.name}</h4>
                  <p>{product.description}</p>
                  <div className="product-meta">
                    <strong>{currency(product.price)}</strong>
                    <span>库存 {product.stock} {product.unit}</span>
                  </div>
                  <div className="stepper">
                    <button onClick={() => updateCart(product.id, -1)}>-</button>
                    <span>{cart[product.id] ?? 0}</span>
                    <button onClick={() => updateCart(product.id, 1)} disabled={product.stock <= (cart[product.id] ?? 0)}>
                      +
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="section-title spaced">
          <h3>最近订单</h3>
          <p>用户侧订单与物流模块</p>
        </div>

        <div className="orders-list">
          {recentOrders.length === 0 ? (
            <div className="empty-card">下单后将在这里显示订单、物流和签收操作。</div>
          ) : (
            recentOrders.map((order) => (
              <div className="order-card" key={order.id}>
                <div className="order-head">
                  <div>
                    <h4>订单 {order.id.slice(0, 8)}</h4>
                    <p>{datetime(order.createdAt)}</p>
                  </div>
                  <span className="status-badge">{order.status}</span>
                </div>
                <div className="mini-list">
                  {order.items.map((item) => (
                    <div key={item.productId}>
                      <span>{item.productName} × {item.quantity}</span>
                      <strong>{currency(item.subtotal)}</strong>
                    </div>
                  ))}
                </div>
                <div className="logistics-box">
                  <strong>物流：{order.shipment.carrier}</strong>
                  <span>单号：{order.shipment.trackingNumber}</span>
                  <span>状态：{order.shipment.status}</span>
                  <ul>
                    {order.shipment.events.map((event, index) => (
                      <li key={`${event.time}-${index}`}>{datetime(event.time)} - {event.message}</li>
                    ))}
                  </ul>
                </div>
                <div className="actions">
                  <button className="secondary" onClick={() => handleCancel(order.id)} disabled={order.status === 'SIGNED' || order.status === 'CANCELLED'}>
                    删除订单
                  </button>
                  <button onClick={() => handleSign(order.id)} disabled={order.shipment.status !== 'DELIVERED'}>
                    确认签收
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <aside className="sidebar-card">
        <div className="section-title compact">
          <h3>购物车</h3>
          <p>{cartItems.length} 件商品</p>
        </div>

        <div className="cart-list">
          {cartItems.length === 0 ? (
            <div className="empty-card small">购物车为空</div>
          ) : (
            cartItems.map((item) => (
              <div className="cart-item" key={item.id}>
                <div>
                  <strong>{item.name}</strong>
                  <p>{item.quantity} × {currency(item.price)}</p>
                </div>
                <strong>{currency(item.subtotal)}</strong>
              </div>
            ))
          )}
        </div>

        <div className="total-row">
          <span>合计</span>
          <strong>{currency(total)}</strong>
        </div>

        <div className="form-grid">
          <input
            placeholder="收货人"
            value={form.name}
            onChange={(event: TextChangeEvent) => setForm((current) => ({ ...current, name: event.target.value }))}
          />
          <input
            placeholder="联系电话"
            value={form.phone}
            onChange={(event: TextChangeEvent) => setForm((current) => ({ ...current, phone: event.target.value }))}
          />
          <textarea
            placeholder="收货地址"
            value={form.address}
            onChange={(event: TextChangeEvent) => setForm((current) => ({ ...current, address: event.target.value }))}
          />
          <textarea
            placeholder="备注信息"
            value={form.note}
            onChange={(event: TextChangeEvent) => setForm((current) => ({ ...current, note: event.target.value }))}
          />
        </div>

        <button className="full-btn" onClick={handleCheckout} disabled={submitting}>
          {submitting ? '提交中...' : '立即下单'}
        </button>

        {message ? <p className="message">{message}</p> : null}
      </aside>
    </div>
  );
}
