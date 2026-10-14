import re

from repositories.subscription_repository import SubscriptionRepository

_EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


class SubscriptionService:
    def __init__(self, repository: SubscriptionRepository):
        self.repository = repository

    def subscribe(self, email: str) -> dict:
        address = _require_email(email)
        self.repository.subscribe(address)
        return {
            "email": address,
            "message": (
                "Confirmation email sent. The address receives delete notices "
                "only after it is confirmed."
            ),
        }


def _require_email(email: str) -> str:
    if not isinstance(email, str):
        raise ValueError("email must be a valid email address")
    address = email.strip().lower()
    if not _EMAIL_PATTERN.fullmatch(address):
        raise ValueError("email must be a valid email address")
    return address
