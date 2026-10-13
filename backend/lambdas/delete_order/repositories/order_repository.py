import os

import boto3
from botocore.exceptions import ClientError

# Reused across warm invocations. The table is resolved on first use so a
# missing ORDERS_TABLE_NAME fails on the request, not at import.
_dynamodb = boto3.resource("dynamodb")


class OrderNotFoundError(Exception):
    pass


class OrderRepository:
    def __init__(self, dynamodb_resource=None):
        self._dynamodb = dynamodb_resource or _dynamodb
        self._table = None

    def delete_order(self, order_id: str) -> dict:
        try:
            response = self._orders_table().delete_item(
                Key={"orderId": order_id},
                ConditionExpression="attribute_exists(orderId)",
                ReturnValues="ALL_OLD",
            )
        except ClientError as error:
            if error.response["Error"]["Code"] == "ConditionalCheckFailedException":
                raise OrderNotFoundError(order_id) from None
            raise
        return response["Attributes"]

    def _orders_table(self):
        if self._table is None:
            self._table = self._dynamodb.Table(os.environ["ORDERS_TABLE_NAME"])
        return self._table
