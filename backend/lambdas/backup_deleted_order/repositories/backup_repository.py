import os

import boto3

# Reused across warm invocations.
_s3 = boto3.client("s3")


class BackupRepository:
    def __init__(self, s3_client=None):
        self._s3 = s3_client or _s3

    def save(self, order_id: str, body: str) -> None:
        self._s3.put_object(
            Bucket=os.environ["DELETED_ORDERS_BUCKET"],
            Key=f"deleted-orders/{order_id}.txt",
            Body=body.encode("utf-8"),
            ContentType="text/plain",
        )
