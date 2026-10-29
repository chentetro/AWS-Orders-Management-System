import { useEffect, useState } from "react";
import { getOrders } from "../services/orderService";
import type { Order } from "../types/order";
import { getApiErrorMessage } from "../utils/getApiErrorMessage";
import CreateNewOrder from "./CreateNewOrder";
import OrderCard from "./OrderCard";

function LoadingSpinner() {
  return (
    <div
      className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500"
      role="status"
    >
      <span
        aria-hidden="true"
        className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-r-transparent"
      />
      Loading orders...
    </div>
  );
}

export default function OrdersContainer() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | undefined>();

  useEffect(() => {
    let isMounted = true;

    async function loadOrders() {
      setIsLoading(true);
      setLoadError(undefined);

      try {
        const nextOrders = await getOrders();

        if (isMounted) {
          setOrders(nextOrders);
        }
      } catch (error) {
        if (isMounted) {
          setLoadError(getApiErrorMessage(error));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadOrders();

    return () => {
      isMounted = false;
    };
  }, []);

  function handleOrderCreated(newOrder: Order) {
    setOrders((prev) => [newOrder, ...prev]);
  }

  function handleOrderUpdated(updatedOrder: Order) {
    setOrders((prev) =>
      prev.map((order) =>
        order.orderId === updatedOrder.orderId ? updatedOrder : order,
      ),
    );
  }

  function handleOrderDeleted(orderId: string) {
    setOrders((prev) => prev.filter((order) => order.orderId !== orderId));
  }

  return (
    <section className="flex flex-col gap-6 text-left">
      <CreateNewOrder onOrderCreated={handleOrderCreated} />

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-baseline justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Orders</h2>
            <p className="mt-0.5 text-xs font-semibold tracking-wide text-slate-400 uppercase">
              DynamoDB · API Gateway
            </p>
          </div>
          {!isLoading && !loadError && (
            <p className="text-sm text-slate-500">
              {orders.length} {orders.length === 1 ? "order" : "orders"}
            </p>
          )}
        </div>

        {isLoading && <LoadingSpinner />}

        {loadError && (
          <p
            className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
            role="alert"
          >
            {loadError}
          </p>
        )}

        {!isLoading && !loadError && orders.length === 0 && (
          <p className="mt-6 text-sm text-slate-500">
            No orders yet. Create one above to get started.
          </p>
        )}

        {!isLoading && !loadError && orders.length > 0 && (
          <ul className="mt-5 flex list-none flex-col gap-4 p-0">
            {orders.map((order) => (
              <li key={order.orderId}>
                <OrderCard
                  order={order}
                  onOrderUpdated={handleOrderUpdated}
                  onOrderDeleted={handleOrderDeleted}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
