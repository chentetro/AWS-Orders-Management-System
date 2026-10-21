import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { createOrder, extractOrderDocument } from "../services/orderService";
import { getApiErrorMessage } from "../utils/getApiErrorMessage";
import { readFileAsDataUrl } from "../utils/readFileAsDataUrl";
import Button from "./Button";
import Input from "./Input";

const ALLOWED_EXTENSIONS = new Set(["pdf", "png", "jpg", "jpeg"]);

type CreateNewOrderProps = {
  onOrderCreated?: () => void;
};

function PlusIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

function getFileExtension(file: File): string | undefined {
  if (file.name.includes(".")) {
    return file.name.split(".").pop()?.toLowerCase();
  }

  if (file.type === "application/pdf") {
    return "pdf";
  }

  if (file.type === "image/png") {
    return "png";
  }

  if (file.type === "image/jpeg") {
    return "jpg";
  }

  return undefined;
}

function validatePrice(value: string): string | undefined {
  const trimmed = value.trim();

  if (!trimmed) {
    return "Price is required";
  }

  const amount = Number(trimmed);
  if (!Number.isFinite(amount) || amount <= 0) {
    return "Price must be a positive number";
  }

  return undefined;
}

function validateDescription(value: string): string | undefined {
  if (!value.trim()) {
    return "Description is required";
  }

  return undefined;
}

export default function CreateNewOrder({
  onOrderCreated,
}: CreateNewOrderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [documentError, setDocumentError] = useState<string | undefined>();
  const [priceError, setPriceError] = useState<string | undefined>();
  const [descriptionError, setDescriptionError] = useState<
    string | undefined
  >();
  const [formError, setFormError] = useState<string | undefined>();
  const [successMessage, setSuccessMessage] = useState<string | undefined>();
  const [isExtracting, setIsExtracting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const isBusy = isExtracting || isCreating;

  function resetFileInput() {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setSelectedFile(null);
  }

  function resetForm() {
    setPrice("");
    setDescription("");
    setDocumentError(undefined);
    setPriceError(undefined);
    setDescriptionError(undefined);
    setFormError(undefined);
    resetFileInput();
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
    setDocumentError(undefined);
    setSuccessMessage(undefined);
  }

  function handlePriceChange(event: ChangeEvent<HTMLInputElement>) {
    setPrice(event.target.value);
    setPriceError(undefined);
    setFormError(undefined);
  }

  function handleDescriptionChange(event: ChangeEvent<HTMLInputElement>) {
    setDescription(event.target.value);
    setDescriptionError(undefined);
    setFormError(undefined);
  }

  async function handleFillFromDocument() {
    setSuccessMessage(undefined);
    setFormError(undefined);

    if (!selectedFile) {
      setDocumentError("Choose a PDF, PNG, or JPG file first");
      return;
    }

    const extension = getFileExtension(selectedFile);
    if (!extension || !ALLOWED_EXTENSIONS.has(extension)) {
      setDocumentError("Order document must be a PDF, PNG, or JPG");
      return;
    }

    setIsExtracting(true);
    setDocumentError(undefined);

    try {
      // Backend accepts a data URL and strips the "data:*;base64," prefix.
      const contentBase64 = await readFileAsDataUrl(selectedFile);
      const extracted = await extractOrderDocument(
        selectedFile.name,
        contentBase64,
      );

      setPrice(extracted.price);
      setDescription(extracted.description);
      setPriceError(undefined);
      setDescriptionError(undefined);
    } catch (error) {
      setDocumentError(getApiErrorMessage(error));
    } finally {
      setIsExtracting(false);
    }
  }

  async function handleCreateOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccessMessage(undefined);
    setDocumentError(undefined);

    const nextPriceError = validatePrice(price);
    const nextDescriptionError = validateDescription(description);

    setPriceError(nextPriceError);
    setDescriptionError(nextDescriptionError);

    if (nextPriceError || nextDescriptionError) {
      return;
    }

    setIsCreating(true);
    setFormError(undefined);

    try {
      await createOrder({
        price: price.trim(),
        description: description.trim(),
      });

      resetForm();
      setSuccessMessage("Order created successfully.");
      onOrderCreated?.();
    } catch (error) {
      setFormError(getApiErrorMessage(error));
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-500">
          <PlusIcon />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Create new order
          </h2>
          <p className="mt-0.5 text-xs font-semibold tracking-wide text-slate-400 uppercase">
            DynamoDB · Amazon Textract
          </p>
        </div>
      </div>

      {successMessage && (
        <p
          className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700"
          role="status"
        >
          {successMessage}
        </p>
      )}

      {formError && (
        <p
          className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          role="alert"
        >
          {formError}
        </p>
      )}

      <form className="mt-5 flex flex-col gap-5" onSubmit={handleCreateOrder}>
        <div className="rounded-lg border border-orange-100 bg-orange-50/70 p-4">
          <p className="text-xs font-semibold tracking-wide text-orange-500 uppercase">
            Amazon Textract
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Upload a single-page PDF, PNG, or JPG of the order. Textract fills
            description and price so you do not type them by hand.
          </p>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <label
                className="text-xs font-semibold text-slate-700"
                htmlFor="order-document"
              >
                Order document
              </label>
              <input
                ref={fileInputRef}
                id="order-document"
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
                disabled={isBusy}
                onChange={handleFileChange}
                className="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            <Button
              type="button"
              variant="secondary"
              disabled={isBusy}
              onClick={() => void handleFillFromDocument()}
              className="shrink-0"
            >
              {isExtracting ? "Filling..." : "Fill from document"}
            </Button>
          </div>

          {documentError && (
            <p className="mt-2 text-xs text-red-600">{documentError}</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(8rem,10rem)_1fr]">
          <Input
            id="order-price"
            label="Price USD"
            inputMode="decimal"
            placeholder="0.00"
            value={price}
            onChange={handlePriceChange}
            error={priceError}
            disabled={isBusy}
          />
          <Input
            id="order-description"
            label="Order description"
            placeholder="What was ordered?"
            value={description}
            onChange={handleDescriptionChange}
            error={descriptionError}
            disabled={isBusy}
          />
        </div>

        <Button type="submit" disabled={isBusy} className="w-full">
          {isCreating ? "Creating..." : "+ Create order"}
        </Button>
      </form>
    </section>
  );
}
