import json
import logging

from repositories.backup_repository import BackupRepository
from services.backup_service import BackupService

logger = logging.getLogger()
logger.setLevel(logging.INFO)

_service = BackupService(BackupRepository())


def lambda_handler(event, context):
    for record in event["Records"]:
        order = json.loads(record["Sns"]["Message"])
        _service.backup(order)
