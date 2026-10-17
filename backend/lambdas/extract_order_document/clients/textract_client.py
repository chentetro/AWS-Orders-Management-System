import boto3
from botocore.exceptions import ClientError

# Reused across warm invocations.
_textract = boto3.client("textract")

# DetectDocumentText rejects a PDF that has more than one page.
_SINGLE_PAGE_ERRORS = {
    "UnsupportedDocumentException",
    "InvalidParameterException",
    "BadDocumentException",
    "DocumentTooLargeException",
}


class TextractClient:
    def __init__(self, textract_client=None):
        self._textract = textract_client or _textract

    def read_lines(self, bucket: str, key: str) -> list[str]:
        try:
            response = self._textract.detect_document_text(
                Document={"S3Object": {"Bucket": bucket, "Name": key}}
            )
        except ClientError as error:
            if error.response["Error"]["Code"] in _SINGLE_PAGE_ERRORS:
                raise ValueError(
                    "document must be a single-page PDF, PNG, or JPEG"
                ) from None
            raise
        return [
            block["Text"]
            for block in response.get("Blocks", [])
            if block.get("BlockType") == "LINE" and block.get("Text")
        ]
