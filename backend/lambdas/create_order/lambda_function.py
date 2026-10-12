import base64
import binascii
import json
import logging
from decimal import Decimal
from json import JSONDecodeError

from repositories.order_repository import OrderRepository
from response import build_response
from services.order_service import OrderService

logger = logging.getLogger()
logger.setLevel(logging.INFO)

_service = OrderService(OrderRepository())


def lambda_handler(event, context):
    try:
        order = _service.create_order(_parse_body(event))
    except JSONDecodeError:
        return build_response(400, {"message": "Request body must be valid JSON"})
    except ValueError as error:
        return build_response(400, {"message": str(error)})
    except Exception:
        logger.exception("Failed to create order")
        return build_response(500, {"message": "Could not create order"})
    return build_response(201, order)


def _parse_body(event):
    if not isinstance(event, dict):
        raise ValueError("Request body is required")

    body = event.get("body")
    if body is None:
        raise ValueError("Request body is required")
    if isinstance(body, dict):
        return body

    if event.get("isBase64Encoded"):
        try:
            body = base64.b64decode(body).decode("utf-8")
        except (binascii.Error, UnicodeDecodeError):
            raise ValueError("Request body must be valid JSON") from None

    if not isinstance(body, str):
        raise ValueError("Request body must be valid JSON")

    # Keep JSON numbers as Decimal so a price like 19.90 is not turned into a binary float.
    parsed = json.loads(body, parse_float=Decimal)
    if not isinstance(parsed, dict):
        raise ValueError("Request body must be a JSON object")
    return parsed
