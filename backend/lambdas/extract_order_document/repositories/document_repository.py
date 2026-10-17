import os
import uuid

import boto3

# Reused across warm invocations.
_s3 = boto3.client("s3")

_CONTENT_TYPES = {
    "pdf": "application/pdf",
    "png": "image/png",
    "jpg": "image/jpeg",
}


class DocumentRepository:
    def __init__(self, s3_client=None):
        self._s3 = s3_client or _s3

    def save(self, document: bytes, extension: str) -> dict:
        bucket = os.environ["TEXTRACT_BUCKET"]
        key = f"textract-uploads/{uuid.uuid4()}.{extension}"
        self._s3.put_object(
            Bucket=bucket,
            Key=key,
            Body=document,
            ContentType=_CONTENT_TYPES[extension],
        )
        return {"bucket": bucket, "key": key}
