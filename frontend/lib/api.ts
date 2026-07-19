import { DashboardStats, Order, Product } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';

async function fetchJSON<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {})
    },
    cache: 'no-store'
  });

  if (!response.ok) {
    const text = await response.text();
    if (!text) {
      throw new Error('请求失败');
    }

    let parsedMessage = '';
    try {
      const parsed = JSON.parse(text) as { message?: string; error?: string };
      parsedMessage = parsed.message || parsed.error || '';
    } catch {
      // Fall back to raw text below.
    }

    throw new Error(parsedMessage || text);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  if (!text) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
}

function withAdminPassword(password: string): RequestInit {
  return {
    headers: {
      'X-Admin-Password': password
    }
  };
}

export const api = {
  listProducts: () => fetchJSON<Product[]>('/api/products'),
  getOrder: (orderId: string) => fetchJSON<Order>(`/api/orders/${orderId}`),
  createOrder: (payload: unknown) =>
    fetchJSON<Order>('/api/orders', { method: 'POST', body: JSON.stringify(payload) }),
  cancelOrder: (orderId: string) =>
    fetchJSON<void>(`/api/orders/${orderId}`, { method: 'DELETE' }),
  signOrder: (orderId: string) =>
    fetchJSON<Order>(`/api/orders/${orderId}/sign`, { method: 'POST' }),
  dashboard: (password: string) => fetchJSON<DashboardStats>('/api/admin/dashboard', withAdminPassword(password)),
  listOrders: (password: string) => fetchJSON<Order[]>('/api/admin/orders', withAdminPassword(password)),
  saveProduct: (payload: Product, password: string) =>
    fetchJSON<Product>('/api/admin/products', { method: 'POST', body: JSON.stringify(payload), ...withAdminPassword(password) }),
  deleteProduct: (productId: string, password: string) =>
    fetchJSON<void>(`/api/admin/products/${productId}`, { method: 'DELETE', ...withAdminPassword(password) }),
  shipOrder: (orderId: string, payload: { carrier: string; trackingNumber: string; message: string }, password: string) =>
    fetchJSON<Order>(`/api/admin/orders/${orderId}/ship`, { method: 'POST', body: JSON.stringify(payload), ...withAdminPassword(password) }),
  deliverOrder: (orderId: string, password: string) =>
    fetchJSON<Order>(`/api/admin/orders/${orderId}/deliver`, { method: 'POST', ...withAdminPassword(password) })
};
