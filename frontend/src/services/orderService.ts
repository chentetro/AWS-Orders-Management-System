import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
if (!API_BASE_URL) {
  throw new Error("VITE_API_BASE_URL is not set");
}

export type ExtractedOrderFields = {
  price: string;
  description: string;
};

export type CreateOrderPayload = {
  price: string | number;
  description: string;
};

export type Order = {
  orderId: string;
  createdAt: string;
  lastModifiedAt: string;
  price: string;
  description: string;
};

export async function extractOrderDocument(
  fileName: string,
  contentBase64: string,
): Promise<ExtractedOrderFields> {
  const { data } = await axios.post<ExtractedOrderFields>(
    `${API_BASE_URL}/documents`,
    { fileName, contentBase64 },
  );
  return data;
}

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  const { data } = await axios.post<Order>(`${API_BASE_URL}/orders`, payload);
  return data;
}
