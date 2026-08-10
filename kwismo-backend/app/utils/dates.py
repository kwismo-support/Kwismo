"""Helpers de dates. / Date helpers."""

from datetime import UTC, datetime, timedelta


def utcnow() -> datetime:
    return datetime.now(UTC)


def minutes_from_now(minutes: int) -> datetime:
    return utcnow() + timedelta(minutes=minutes)


def is_expired(expires_at: datetime) -> bool:
    return utcnow() >= expires_at
