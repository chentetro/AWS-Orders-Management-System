import os
from decimal import Decimal

import boto3
from boto3.dynamodb.conditions import Key

# Reused across warm invocations. The table is resolved on first use so a
# missing environment variable fails on the request, not at import.
_dynamodb = boto3.resource("dynamodb")

_ENTITY_TYPE = "ORDER"


class OrderRepository:
    def __init__(self, dynamodb_resource=None):
        self._dynamodb = dynamodb_resource or _dynamodb
        self._table = None

    def list_all_by_creation_date(self):
        table = self._orders_table()
        query = {
            "IndexName": os.environ["ORDERS_INDEX_NAME"],
            "KeyConditionExpression": Key("entityType").eq(_ENTITY_TYPE),
            # False returns newest createdAt first. ISO-8601 strings sort chronologically.
            "ScanIndexForward": False,
        }

        orders = []
        while True:
            response = table.query(**query)
            orders.extend(_to_order(item) for item in response.get("Items", []))
            last_key = response.get("LastEvaluatedKey")
            if not last_key:
                return orders
            query["ExclusiveStartKey"] = last_key

    def _orders_table(self):
        if self._table is None:
            self._table = self._dynamodb.Table(os.environ["ORDERS_TABLE_NAME"])
        return self._table


def _to_order(item):
    return {
        "orderId": item.get("orderId"),
        "createdAt": item.get("createdAt"),
        "price": _to_number(item.get("price")),
        "description": item.get("description"),
        "updatedAt": item.get("updatedAt"),
    }


def _to_number(value):
    if not isinstance(value, Decimal):
        return value
    if value == value.to_integral_value():
        return int(value)
    return float(value)
