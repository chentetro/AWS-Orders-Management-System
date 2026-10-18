import base64
import binascii
import re
from decimal import Decimal, InvalidOperation

from clients.textract_client import TextractClient
from repositories.document_repository import DocumentRepository

_PRICE_WITH_AMOUNT = re.compile(
    r"^price\b\s*[:\-]?\s*(?:usd\s*)?\$?\s*(\d+(?:[.,]\d+)?)\s*\$?$",
    re.IGNORECASE,
)
_PRICE_LABEL_ONLY = re.compile(r"^price\b\s*[:\-]?\s*$", re.IGNORECASE)
_KEY_LINE = re.compile(r"^[A-Za-z][A-Za-z ]{0,30}:\s*\S")
_AMOUNT_ONLY = re.compile(r"^\$?\s*(\d+(?:[.,]\d+)?)\s*$")


class ExtractionService:
    def __init__(self, documents: DocumentRepository, textract: TextractClient):
        self.documents = documents
        self.textract = textract

    def extract(self, payload: dict) -> dict:
        file_name = payload.get("fileName")
        content = payload.get("contentBase64")
        extension = _extension(file_name)
        document = _decode_document(content)
        location = self.documents.save(document, extension)
        lines = self.textract.read_lines(location["bucket"], location["key"])
        return _fields_from_lines(lines)


def _extension(file_name) -> str:
    if not isinstance(file_name, str) or "." not in file_name:
        raise ValueError("fileName must be a PDF, PNG, or JPEG")
    extension = file_name.rsplit(".", 1)[-1].lower()
    if extension not in {"pdf", "png", "jpg", "jpeg"}:
        raise ValueError("fileName must be a PDF, PNG, or JPEG")
    return "jpg" if extension == "jpeg" else extension


def _decode_document(content) -> bytes:
    if not isinstance(content, str) or not content.strip():
        raise ValueError("contentBase64 is required")
    encoded = content.strip()
    if encoded.lower().startswith("data:") and "," in encoded:
        encoded = encoded.split(",", 1)[1]
    try:
        document = base64.b64decode(encoded, validate=True)
    except (binascii.Error, ValueError):
        raise ValueError("contentBase64 must be valid base64") from None
    if not document:
        raise ValueError("contentBase64 is required")
    # Synchronous DetectDocumentText accepts a document up to 5 MB.
    if len(document) > 5 * 1024 * 1024:
        raise ValueError("document must be 5 MB or smaller")
    return document


def _fields_from_lines(lines: list[str]) -> dict:
    price, price_index = _find_price(lines)
    description = _description_before_price(lines, price_index)
    if not description:
        raise ValueError("description was not found in the document")
    return {"price": price, "description": description}


def _find_price(lines: list[str]) -> tuple[str, int]:
    for index, line in enumerate(lines):
        match = _PRICE_WITH_AMOUNT.match(line.strip())
        if match:
            return _price_as_decimal_string(match.group(1)), index
        if not _PRICE_LABEL_ONLY.match(line.strip()):
            continue
        if index + 1 >= len(lines):
            continue
        amount = _AMOUNT_ONLY.match(lines[index + 1].strip())
        if amount:
            return _price_as_decimal_string(amount.group(1)), index
    raise ValueError("price was not found in the document")


def _description_before_price(lines: list[str], price_index: int) -> str:
    # The sentence is the paragraph before the first key. A number inside that
    # sentence is not the order price.
    parts = []
    for line in lines[:price_index]:
        text = line.strip()
        if _KEY_LINE.match(text) or _PRICE_LABEL_ONLY.match(text):
            break
        if text:
            parts.append(text)
    return " ".join(parts)


def _price_as_decimal_string(value: str) -> str:
    text = value.strip()
    if "," in text and "." not in text:
        text = text.replace(",", ".")
    else:
        text = text.replace(",", "")
    try:
        amount = Decimal(text)
    except InvalidOperation:
        raise ValueError("price was not found in the document") from None
    if not amount.is_finite() or amount <= 0:
        raise ValueError("price must be a positive number")
    return format(amount, "f")
