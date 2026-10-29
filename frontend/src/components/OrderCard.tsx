import { useEffect, useState, type ChangeEvent } from "react";
import { deleteOrder, updateOrder } from "../services/orderService";
import type { Order } from "../types/order";
import { formatDate } from "../utils/formatDate";
import { validateDescription, validatePrice } from "../utils/orderValidation";
import Input from "./Input";
import OrderActions from "./OrderActions";

type OrderCardProps = {
  order: Order;
  onOrderUpdated: (updatedOrder: Order) => void;
  onOrderDeleted: (orderId: string) => void;
};

export default function OrderCard({
  order,
  onOrderUpdated,
  onOrderDeleted,
}: OrderCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [price, setPrice] = useState(order.price);
  const [description, setDescription] = useState(order.description);
  const [priceError, setPriceError] = useState<string | undefined>();
  const [descriptionError, setDescriptionError] = useState<
    string | undefined
  >();
  const [actionError, setActionError] = useState<string | undefined>();

  useEffect(() => {
    if (!isEditing) {
      setPrice(order.price);
      setDescription(order.description);
    }
  }, [order, isEditing]);

  function resetEditFields() {
    setPrice(order.price);
    setDescription(order.description);
    setPriceError(undefined);
    setDescriptionError(undefined);
  }

  function handleToggleEdit() {
    if (isEditing) {
      resetEditFields();
    }

    setActionError(undefined);
    setIsEditing((current) => !current);
  }

  function handlePriceChange(event: ChangeEvent<HTMLInputElement>) {
    setPrice(event.target.value);
    setPriceError(undefined);
    setActionError(undefined);
  }

  function handleDescriptionChange(event: ChangeEvent<HTMLInputElement>) {
    setDescription(event.target.value);
    setDescriptionError(undefined);
    setActionError(undefined);
  }

  async function handleSaveEdit() {
    const nextPriceError = validatePrice(price);
    const nextDescriptionError = validateDescription(description);

    setPriceError(nextPriceError);
    setDescriptionError(nextDescriptionError);

    if (nextPriceError || nextDescriptionError) {
      return;
    }

    setActionError(undefined);

    const updatedOrder = await updateOrder(order.orderId, {
      price: price.trim(),
      description: description.trim(),
    });

    onOrderUpdated(updatedOrder);
    setPrice(updatedOrder.price);
    setDescription(updatedOrder.description);
    setIsEditing(false);
  }

  async function handleDelete() {
    setActionError(undefined);
    await deleteOrder(order.orderId);
    onOrderDeleted(order.orderId);
  }

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
              Order ID
            </p>
            <p className="mt-1 break-all font-mono text-sm text-slate-800">
              {order.orderId}
            </p>
          </div>

          {isEditing ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(8rem,10rem)_1fr]">
              <Input
                id={`order-price-${order.orderId}`}
                label="Price USD"
                inputMode="decimal"
                value={price}
                onChange={handlePriceChange}
                error={priceError}
              />
              <Input
                id={`order-description-${order.orderId}`}
                label="Description"
                value={description}
                onChange={handleDescriptionChange}
                error={descriptionError}
              />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
                    Price
                  </p>
                  <p className="mt-1 text-base font-semibold text-slate-900">
                    ${order.price}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
                    Last modified
                  </p>
                  <p className="mt-1 text-sm text-slate-700">
                    {formatDate(order.lastModifiedAt)}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
                  Description
                </p>
                <p className="mt-1 text-sm leading-relaxed text-slate-700">
                  {order.description}
                </p>
              </div>
            </>
          )}

          <div>
            <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
              Created
            </p>
            <p className="mt-1 text-sm text-slate-700">
              {formatDate(order.createdAt)}
            </p>
          </div>
        </div>

        <OrderActions
          isEditing={isEditing}
          onToggleEdit={handleToggleEdit}
          onSave={handleSaveEdit}
          onDelete={handleDelete}
          onError={setActionError}
        />
      </div>

      {actionError && (
        <p
          className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          role="alert"
        >
          {actionError}
        </p>
      )}
    </article>
  );
}
