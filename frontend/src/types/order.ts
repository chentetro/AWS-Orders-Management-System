export type Order = {
  orderId: string;
  createdAt: string;
  lastModifiedAt: string;
  price: string;
  description: string;
};

export type ExtractedOrderFields = {
  price: string;
  description: string;
};

export type CreateOrderPayload = {
  price: string | number;
  description: string;
};

export type UpdateOrderPayload = {
  price?: string | number;
  description?: string;
};
