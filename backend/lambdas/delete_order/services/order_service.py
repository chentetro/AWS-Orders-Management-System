from repositories.order_repository import OrderRepository
from publishers.order_deleted_publisher import OrderDeletedPublisher


class OrderService:
    def __init__(self, repository: OrderRepository, publisher: OrderDeletedPublisher):
        self.repository = repository
        self.publisher = publisher

    def delete_order(self, order_id: str) -> dict:
        order = self.repository.delete_order(order_id)
        self.publisher.publish(order)
        return order
