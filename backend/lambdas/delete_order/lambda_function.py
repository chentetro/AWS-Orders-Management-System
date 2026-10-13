import logging

from publishers.order_deleted_publisher import OrderDeletedPublisher
from repositories.order_repository import OrderNotFoundError, OrderRepository
from response import build_response
from services.order_service import OrderService

logger = logging.getLogger()
logger.setLevel(logging.INFO)

_service = OrderService(OrderRepository(), OrderDeletedPublisher())


def lambda_handler(event, context):
    try:
        order = _service.delete_order(_order_id(event))
    except OrderNotFoundError:
        return build_response(404, {"message": "Order not found"})
    except ValueError as error:
        return build_response(400, {"message": str(error)})
    except Exception:
        logger.exception("Failed to delete order")
        return build_response(500, {"message": "Could not delete order"})
    return build_response(200, order)


def _order_id(event):
    order_id = (event.get("pathParameters") or {}).get("orderId")
    if not order_id:
        raise ValueError("orderId is required")
    return order_id
