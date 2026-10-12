import os

import boto3

# Reused across warm invocations. The table is resolved on first use so a
# missing ORDERS_TABLE_NAME fails on the request, not at import.
_dynamodb = boto3.resource("dynamodb")


class OrderRepository:
    def __init__(self, dynamodb_resource=None):
        self._dynamodb = dynamodb_resource or _dynamodb
        self._table = None

    def create_order(self, order_data: dict) -> dict:
        self._orders_table().put_item(
            Item=order_data,
            ConditionExpression="attribute_not_exists(orderId)",
        )
        return order_data

    def _orders_table(self):
        if self._table is None:
            self._table = self._dynamodb.Table(os.environ["ORDERS_TABLE_NAME"])
        return self._table
