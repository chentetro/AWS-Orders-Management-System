import { useState } from "react";
import { getApiErrorMessage } from "../utils/getApiErrorMessage";
import Button from "./Button";

type OrderActionsProps = {
  isEditing: boolean;
  onToggleEdit: () => void;
  onSave: () => Promise<void>;
  onDelete: () => Promise<void>;
  onError?: (message: string) => void;
};

function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"
    />
  );
}

export default function OrderActions({
  isEditing,
  onToggleEdit,
  onSave,
  onDelete,
  onError,
}: OrderActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const isBusy = isDeleting || isSaving;

  function handleCancelDelete() {
    setIsConfirmingDelete(false);
  }

  async function handleConfirmDelete() {
    setIsDeleting(true);

    try {
      await onDelete();
    } catch (error) {
      onError?.(getApiErrorMessage(error));
      setIsConfirmingDelete(false);
    } finally {
      setIsDeleting(false);
    }
  }

  async function handlePrimaryAction() {
    if (!isEditing) {
      setIsConfirmingDelete(false);
      onToggleEdit();
      return;
    }

    setIsSaving(true);

    try {
      await onSave();
    } catch (error) {
      onError?.(getApiErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  function handleToggleEdit() {
    setIsConfirmingDelete(false);
    onToggleEdit();
  }

  if (isConfirmingDelete) {
    return (
      <div className="flex flex-col items-stretch gap-2 sm:items-end">
        <p className="text-sm text-slate-600" role="status">
          Delete this order? This cannot be undone.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            disabled={isBusy}
            onClick={handleCancelDelete}
          >
            Keep order
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={isBusy}
            onClick={() => void handleConfirmDelete()}
            className="border-red-200 text-red-700 hover:border-red-300 hover:bg-red-50"
          >
            {isDeleting ? (
              <>
                <Spinner />
                Deleting...
              </>
            ) : (
              "Yes, delete"
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        variant={isEditing ? "primary" : "secondary"}
        disabled={isBusy}
        onClick={() => void handlePrimaryAction()}
      >
        {isSaving ? (
          <>
            <Spinner />
            Saving...
          </>
        ) : isEditing ? (
          "Save"
        ) : (
          "Edit"
        )}
      </Button>

      {isEditing && (
        <Button
          type="button"
          variant="secondary"
          disabled={isBusy}
          onClick={handleToggleEdit}
        >
          Cancel
        </Button>
      )}

      <Button
        type="button"
        variant="secondary"
        disabled={isBusy}
        onClick={() => setIsConfirmingDelete(true)}
        className="border-red-200 text-red-700 hover:border-red-300 hover:bg-red-50"
      >
        Delete
      </Button>
    </div>
  );
}
