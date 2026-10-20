import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

export async function subscribeToTopic(email: string): Promise<void> {
  await axios.post(`${API_BASE_URL}/subscriptions/subscribe`, { email });
}

export async function unsubscribeFromTopic(email: string): Promise<void> {
  await axios.post(`${API_BASE_URL}/subscriptions/unsubscribe`, { email });
}
