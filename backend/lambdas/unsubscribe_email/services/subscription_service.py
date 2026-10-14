import re

from repositories.subscription_repository import SubscriptionRepository

_EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


class SubscriptionService:
    def __init__(self, repository: SubscriptionRepository):
        self.repository = repository

    def unsubscribe(self, email: str) -> dict:
        address = _require_email(email)
        self.repository.unsubscribe(address)
        return {"email": address, "message": "Unsubscribed"}


def _require_email(email: str) -> str:
    if not isinstance(email, str) or not _EMAIL_PATTERN.fullmatch(email.strip()):
        raise ValueError("email must be a valid email address")
    return email.strip()
