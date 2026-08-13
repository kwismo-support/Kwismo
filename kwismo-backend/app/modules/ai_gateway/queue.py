"""Envoi asynchrone des signalements vers l'IA (apprentissage continu). / Asynchronous report submission to the AI (continuous learning).

FR — File RQ : ne bloque jamais la reponse utilisateur en attendant l'IA.
EN — RQ queue: never blocks the user's response while waiting on the AI.
"""

from redis import Redis
from rq import Queue

from app.core.config import get_settings
from app.modules.ai_gateway.client import send_feedback
from app.modules.ai_gateway.schemas import FeedbackIn

settings = get_settings()
_redis = Redis.from_url(settings.redis_url)
feedback_queue = Queue("ai-feedback", connection=_redis)


def enqueue_feedback(payload: FeedbackIn) -> None:
    feedback_queue.enqueue(send_feedback, payload)
