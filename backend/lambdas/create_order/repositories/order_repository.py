import os

import boto3

# Reused across warm invocations.
_dynamodb = boto3.resource("dynamodb")

_DEFAULT_TABLE_NAME = "orders"


class OrderRepository:
    def __init__(self, dynamodb_resource=None):
        dynamodb = dynamodb_resource or _dynamodb
        table_name = os.environ.get("ORDERS_TABLE_NAME", _DEFAULT_TABLE_NAME)
        self._table = dynamodb.Table(table_name)

    def create_order(self, order_data: dict) -> dict:
        self._table.put_item(Item=order_data)
        return order_data
