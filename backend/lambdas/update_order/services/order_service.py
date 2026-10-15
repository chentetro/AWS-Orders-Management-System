from datetime import datetime, timezone
from decimal import Decimal, InvalidOperation

from repositories.order_repository import OrderRepository


class OrderService:
    def __init__(self, repository: OrderRepository):
        self.repository = repository

    def update_order(self, order_id: str, payload: dict) -> dict:
        if "price" not in payload and "description" not in payload:
            raise ValueError("price or description is required")

        changes = {"lastModifiedAt": _utc_now()}
        if "price" in payload:
            changes["price"] = _require_price(payload)
        if "description" in payload:
            changes["description"] = _require_description(payload)
        return self.repository.update_order(order_id, changes)


def _require_description(payload: dict) -> str:
    if payload["description"] is None:
        raise ValueError("description is required")
    description = payload["description"]
    if not isinstance(description, str) or not description.strip():
        raise ValueError("description must be a non-empty string")
    return description.strip()


def _require_price(payload: dict) -> str:
    if payload["price"] is None or payload["price"] == "":
        raise ValueError("price is required")
    return _price_as_decimal_string(payload["price"])


def _price_as_decimal_string(value) -> str:
    # A string keeps every decimal digit. The shared response helper would turn a
    # non-whole Decimal into a float and change the price.
    if isinstance(value, bool):
        raise ValueError("price must be a positive number")
    try:
        if isinstance(value, str):
            amount = Decimal(value.strip())
        elif isinstance(value, (int, Decimal)):
            amount = Decimal(value)
        elif isinstance(value, float):
            amount = Decimal(str(value))
        else:
            raise ValueError("price must be a positive number")
    except InvalidOperation:
        raise ValueError("price must be a positive number") from None
    if not amount.is_finite() or amount <= 0:
        raise ValueError("price must be a positive number")
    return format(amount, "f")


def _utc_now() -> str:
    return (
        datetime.now(timezone.utc)
        .isoformat(timespec="milliseconds")
        .replace("+00:00", "Z")
    )
