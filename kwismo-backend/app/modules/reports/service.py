"""Logique metier du module reports. / Business logic for the reports module."""

from app.core.exceptions import not_implemented
from app.db.repositories.report_repository import ReportRepository

_reports = ReportRepository()


async def create_report(user_id: str, payload):
    raise not_implemented()


async def list_reports(page: int, page_size: int):
    raise not_implemented()


async def validate_report(report_id: str, payload):
    raise not_implemented()
