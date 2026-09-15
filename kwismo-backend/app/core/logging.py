"""Logs structures (JSON). / Structured (JSON) logging.

FR — A appeler une fois au demarrage (app/main.py). Format JSON pour rester
exploitable par un agrégateur de logs en production.
EN — Call once at startup (app/main.py). JSON format so it stays usable by
a log aggregator in production.
"""

import json
import logging
import sys


class DevFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        level_colors = {
            "DEBUG": "\x1b[36m",
            "INFO": "\x1b[32m",
            "WARNING": "\x1b[33m",
            "ERROR": "\x1b[31m",
            "CRITICAL": "\x1b[41m\x1b[37m",
        }
        reset = "\x1b[0m"
        color = level_colors.get(record.levelname, reset)
        time_str = self.formatTime(record, "%H:%M:%S")
        msg = f"{color}[{record.levelname}]{reset} {time_str} ({record.name}): {record.getMessage()}"
        if record.exc_info:
            msg += f"\n{self.formatException(record.exc_info)}"
        return msg


def configure_logging(level: int = logging.INFO) -> None:
    from app.core.config import get_settings
    settings = get_settings()

    handler = logging.StreamHandler(sys.stdout)
    if settings.is_dev:
        handler.setFormatter(DevFormatter())
        log_level = logging.DEBUG
    else:
        handler.setFormatter(JsonFormatter())
        log_level = level

    root = logging.getLogger()
    root.handlers = [handler]
    root.setLevel(log_level)
