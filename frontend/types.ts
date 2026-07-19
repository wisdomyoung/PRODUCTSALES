export type Product = {
  id: string;
  name: string;
  category: string;
  unit: string;
  price: number;
  imageUrl: string;
  description: string;
  stock: number;
  featured: boolean;
};

export type ShipmentEvent = {
  time: string;
  message: string;
};

export type Shipment = {
  orderId: string;
  trackingNumber: string;
  carrier: string;
  status: 'PENDING' | 'IN_TRANSIT' | 'DELIVERED' | 'SIGNED';
  events: ShipmentEvent[];
};

export type OrderItem = {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  subtotal: number;
};

export type CustomerInfo = {
  name: string;
  phone: string;
  address: string;
  note?: string;
};

export type Order = {
  id: string;
  items: OrderItem[];
  customer: CustomerInfo;
  status: 'CREATED' | 'SHIPPED' | 'SIGNED' | 'CANCELLED';
  totalAmount: number;
  createdAt: string;
  shipment: Shipment;
};

export type DashboardStats = {
  productCount: number;
  orderCount: number;
  pendingShipments: number;
  revenue: number;
};
