import os
from decimal import Decimal

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

    def update_order(self, order_id: str, changes: dict) -> dict:
        names = {}
        values = {}
        assignments = []
        for index, (field, value) in enumerate(changes.items()):
            name_key = f"#field{index}"
            value_key = f":value{index}"
            names[name_key] = field
            values[value_key] = value
            assignments.append(f"{name_key} = {value_key}")

        try:
            response = self._orders_table().update_item(
                Key={"orderId": order_id},
                UpdateExpression="SET " + ", ".join(assignments),
                ExpressionAttributeNames=names,
                ExpressionAttributeValues=values,
                ConditionExpression="attribute_exists(orderId)",
                ReturnValues="ALL_NEW",
            )
        except ClientError as error:
            if error.response["Error"]["Code"] == "ConditionalCheckFailedException":
                raise OrderNotFoundError(order_id) from None
            raise
        return _to_order(response["Attributes"])

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
        "lastModifiedAt": item.get("lastModifiedAt"),
    }


def _to_number(value):
    if isinstance(value, Decimal):
        return format(value, "f")
    return value
