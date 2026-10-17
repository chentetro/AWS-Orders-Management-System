import base64
import binascii
import json
import logging
from json import JSONDecodeError

from clients.textract_client import TextractClient
from repositories.document_repository import DocumentRepository
from response import build_response
from services.extraction_service import ExtractionService

logger = logging.getLogger()
logger.setLevel(logging.INFO)

_service = ExtractionService(DocumentRepository(), TextractClient())


def lambda_handler(event, context):
    try:
        extracted = _service.extract(_parse_body(event))
    except JSONDecodeError:
        return build_response(400, {"message": "Request body must be valid JSON"})
    except ValueError as error:
        return build_response(400, {"message": str(error)})
    except Exception:
        logger.exception("Failed to extract order document")
        return build_response(500, {"message": "Could not extract the document"})
    return build_response(200, extracted)


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
