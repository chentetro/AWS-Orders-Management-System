class OrderService:
    def __init__(self, order_repository):
        self._order_repository = order_repository

    def list_orders(self):
        return self._order_repository.list_all_by_creation_date()
