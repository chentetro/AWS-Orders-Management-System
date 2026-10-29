const DECIMAL_PRICE_PATTERN = /^\d+(\.\d+)?$/;
const ZERO_PRICE_PATTERN = /^0+(\.0+)?$/;

export function validatePrice(value: string): string | undefined {
  const trimmed = value.trim();

  if (!trimmed) {
    return "Price is required";
  }

  // Keep price as a decimal string (same idea as the Lambda) — never use Number().
  if (
    !DECIMAL_PRICE_PATTERN.test(trimmed) ||
    ZERO_PRICE_PATTERN.test(trimmed)
  ) {
    return "Price must be a positive number";
  }

  return undefined;
}

export function validateDescription(value: string): string | undefined {
  if (!value.trim()) {
    return "Description is required";
  }

  return undefined;
}
