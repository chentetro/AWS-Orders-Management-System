import logging

from repositories.order_repository import OrderRepository
from response import build_response
from services.order_service import OrderService

logger = logging.getLogger()
logger.setLevel(logging.INFO)

_service = OrderService(OrderRepository())


def lambda_handler(event, context):
    # This GET takes no parameters. API Gateway still passes event and context.
    try:
        orders = _service.list_orders()
    except Exception:
        logger.exception("Failed to list orders")
        return build_response(500, {"message": "Could not retrieve orders"})
    return build_response(200, orders)
