class BackupService:
    def __init__(self, repository):
        self.repository = repository

    def backup(self, order: dict) -> None:
        body = "\n".join(
            [
                f"orderId: {order.get('orderId')}",
                f"createdAt: {order.get('createdAt')}",
                f"price: {order.get('price')}",
                f"description: {order.get('description')}",
                f"lastModifiedAt: {order.get('lastModifiedAt')}",
            ]
        )
        self.repository.save(order["orderId"], body)
