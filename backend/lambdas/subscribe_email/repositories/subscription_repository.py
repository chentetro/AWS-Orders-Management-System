import os

import boto3

# Reused across warm invocations.
_sns = boto3.client("sns")


class SubscriptionRepository:
    def __init__(self, sns_client=None):
        self._sns = sns_client or _sns

    def subscribe(self, email: str) -> None:
        self._sns.subscribe(
            TopicArn=os.environ["ORDER_DELETED_TOPIC_ARN"],
            Protocol="email",
            Endpoint=email,
            ReturnSubscriptionArn=True,
        )
