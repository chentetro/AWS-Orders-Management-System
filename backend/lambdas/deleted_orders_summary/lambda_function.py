import logging

from repositories.summary_repository import SummaryRepository
from response import build_response
from services.summary_service import SummaryService

logger = logging.getLogger()
logger.setLevel(logging.INFO)

_service = SummaryService(SummaryRepository())


def lambda_handler(event, context):
    try:
        summary = _service.create_summary()
    except Exception:
        logger.exception("Failed to create deleted orders summary")
        return build_response(500, {"message": "Could not create the summary"})
    return build_response(200, summary)
