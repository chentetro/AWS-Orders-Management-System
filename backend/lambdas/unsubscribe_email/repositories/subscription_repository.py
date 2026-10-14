import os

import boto3

# Reused across warm invocations.
_sns = boto3.client("sns")


class SubscriptionNotFoundError(Exception):
    pass


class SubscriptionRepository:
    def __init__(self, sns_client=None):
        self._sns = sns_client or _sns

    def unsubscribe(self, email: str) -> None:
        topic_arn = os.environ["ORDER_DELETED_TOPIC_ARN"]
        normalized = email.lower()
        request = {"TopicArn": topic_arn}
        while True:
            page = self._sns.list_subscriptions_by_topic(**request)
            for subscription in page.get("Subscriptions", []):
                if subscription.get("Endpoint", "").lower() != normalized:
                    continue
                arn = subscription.get("SubscriptionArn", "")
                if arn == "PendingConfirmation":
                    raise ValueError(
                        "Confirm the subscription email before you can unsubscribe"
                    )
                self._sns.unsubscribe(SubscriptionArn=arn)
                return
            token = page.get("NextToken")
            if not token:
                raise SubscriptionNotFoundError(email)
            request["NextToken"] = token
