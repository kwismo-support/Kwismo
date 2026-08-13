"""Helpers de pagination. / Pagination helpers."""


def to_skip_take(page: int, page_size: int) -> tuple[int, int]:
    return (page - 1) * page_size, page_size


def total_pages(total: int, page_size: int) -> int:
    return max(1, -(-total // page_size))  # ceil sans import math / ceil without importing math
