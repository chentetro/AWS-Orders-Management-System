import { useState } from "react";
import { getApiErrorMessage } from "../utils/getApiErrorMessage";
import Button from "./Button";

type OrderActionsProps = {
  isEditing: boolean;
  onToggleEdit: () => void;
  onSave: () => Promise<void>;
  onDelete: () => Promise<void>;
  onError?: (message: string) => void;
  disabled?: boolean;
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
  disabled = false,
}: OrderActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const isBusy = isDeleting || isSaving || disabled;

  async function handleDelete() {
    setIsDeleting(true);

    try {
      await onDelete();
    } catch (error) {
      onError?.(getApiErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  }

  async function handlePrimaryAction() {
    if (!isEditing) {
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
          onClick={onToggleEdit}
        >
          Cancel
        </Button>
      )}

      <Button
        type="button"
        variant="secondary"
        disabled={isBusy}
        onClick={() => void handleDelete()}
        className="border-red-200 text-red-700 hover:border-red-300 hover:bg-red-50"
      >
        {isDeleting ? (
          <>
            <Spinner />
            Deleting...
          </>
        ) : (
          "Delete"
        )}
      </Button>
    </div>
  );
}
