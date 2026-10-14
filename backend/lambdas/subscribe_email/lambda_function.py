import base64
import binascii
import json
import logging
from json import JSONDecodeError

from repositories.subscription_repository import SubscriptionRepository
from response import build_response
from services.subscription_service import SubscriptionService

logger = logging.getLogger()
logger.setLevel(logging.INFO)

_service = SubscriptionService(SubscriptionRepository())


def lambda_handler(event, context):
    try:
        result = _service.subscribe(_email(event))
    except JSONDecodeError:
        return build_response(400, {"message": "Request body must be valid JSON"})
    except ValueError as error:
        return build_response(400, {"message": str(error)})
    except Exception:
        logger.exception("Failed to subscribe email")
        return build_response(500, {"message": "Could not subscribe email"})
    return build_response(201, result)


def _email(event):
    body = _parse_body(event)
    if "email" not in body or body["email"] is None:
        raise ValueError("email is required")
    return body["email"]


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

    parsed = json.loads(body)
    if not isinstance(parsed, dict):
        raise ValueError("Request body must be a JSON object")
    return parsed
