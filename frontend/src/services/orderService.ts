import axios from "axios";
import type {
  CreateOrderPayload,
  ExtractedOrderFields,
  Order,
  UpdateOrderPayload,
} from "../types/order";
import { API_BASE_URL } from "./apiBaseUrl";

export type {
  CreateOrderPayload,
  ExtractedOrderFields,
  Order,
  UpdateOrderPayload,
} from "../types/order";

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

export async function getOrders(): Promise<Order[]> {
  const { data } = await axios.get<Order[]>(`${API_BASE_URL}/orders`);
  return data;
}

export async function updateOrder(
  orderId: string,
  payload: UpdateOrderPayload,
): Promise<Order> {
  const { data } = await axios.put<Order>(
    `${API_BASE_URL}/orders/${orderId}`,
    payload,
  );
  return data;
}

export async function deleteOrder(orderId: string): Promise<Order> {
  const { data } = await axios.delete<Order>(
    `${API_BASE_URL}/orders/${orderId}`,
  );
  return data;
}
