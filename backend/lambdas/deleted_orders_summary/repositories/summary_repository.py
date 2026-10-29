import os
from datetime import datetime, timezone

import boto3
from botocore.config import Config

# Reused across warm invocations. SigV4 + virtual-hosted style avoids
# SignatureDoesNotMatch on presigned URLs outside us-east-1.
_s3 = boto3.client(
    "s3",
    region_name=os.environ.get("AWS_REGION", "eu-north-1"),
    config=Config(
        signature_version="s3v4",
        s3={"addressing_style": "virtual"},
    ),
)

_URL_EXPIRES_IN_SECONDS = 3600


class SummaryRepository:
    def __init__(self, s3_client=None):
        self._s3 = s3_client or _s3

    def list_order_texts(self) -> list[str]:
        bucket = os.environ["DELETED_ORDERS_BUCKET"]
        request = {"Bucket": bucket, "Prefix": os.environ["DELETED_ORDERS_PREFIX"]}
        texts = []
        while True:
            page = self._s3.list_objects_v2(**request)
            for item in page.get("Contents", []):
                key = item["Key"]
                if not key.endswith(".txt"):
                    continue
                body = self._s3.get_object(Bucket=bucket, Key=key)["Body"].read()
                texts.append(body.decode("utf-8"))
            token = page.get("NextContinuationToken")
            if not token:
                return texts
            request["ContinuationToken"] = token

    def save_pdf(self, pdf: bytes) -> str:
        bucket = os.environ["DELETED_ORDERS_BUCKET"]
        timestamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S%fZ")
        key = f"summaries/deleted-orders-{timestamp}.pdf"
        self._s3.put_object(
            Bucket=bucket,
            Key=key,
            Body=pdf,
            ContentType="application/pdf",
        )
        return self._s3.generate_presigned_url(
            "get_object",
            Params={"Bucket": bucket, "Key": key},
            ExpiresIn=_URL_EXPIRES_IN_SECONDS,
        )
