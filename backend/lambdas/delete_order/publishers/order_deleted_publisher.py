import json
import os
from decimal import Decimal

import boto3

# Reused across warm invocations.
_sns = boto3.client("sns")


class OrderDeletedPublisher:
    def __init__(self, sns_client=None):
        self._sns = sns_client or _sns

    def publish(self, order: dict) -> None:
        order_id = order["orderId"]
        self._sns.publish(
            TopicArn=os.environ["ORDER_DELETED_TOPIC_ARN"],
            Subject=f"Order Deleted: {order_id}",
            Message=json.dumps(order, default=_to_json_value),
        )


def _to_json_value(value):
    # DynamoDB can return numbers as Decimal, which json.dumps cannot encode.
    if isinstance(value, Decimal):
        return format(value, "f")
    raise TypeError(f"Object of type {type(value).__name__} is not JSON serializable")
