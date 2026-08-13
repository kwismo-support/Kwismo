"""Fine-tuning AfroXLMR (PEFT/LoRA) — a lancer sur Colab ou PC, jamais sur le serveur de production. / AfroXLMR fine-tuning (PEFT/LoRA) — run on Colab or a PC, never on the production server.

Usage: python -m src.models.model_b.train
"""

import json
from datetime import UTC, datetime
from pathlib import Path

from peft import LoraConfig, get_peft_model
from transformers import AutoModelForSequenceClassification, AutoTokenizer

from src.config import get_settings

settings = get_settings()


def load_base_model():
    tokenizer = AutoTokenizer.from_pretrained(settings.hf_model_name)
    model = AutoModelForSequenceClassification.from_pretrained(settings.hf_model_name, num_labels=2)
    return tokenizer, model


def apply_lora(model):
    lora_config = LoraConfig(task_type="SEQ_CLS", r=8, lora_alpha=16, lora_dropout=0.1)
    return get_peft_model(model, lora_config)


def save(version: str) -> None:
    model_dir = Path(settings.model_dir) / "model_b"
    model_dir.mkdir(parents=True, exist_ok=True)
    model_path = model_dir / version

    registry_path = Path(settings.model_dir) / "registry.json"
    registry = json.loads(registry_path.read_text(encoding="utf-8")) if registry_path.exists() else {}
    registry["model_b"] = {
        "version": version,
        "path": str(model_path),
        "trained_at": datetime.now(UTC).isoformat(),
    }
    registry_path.write_text(json.dumps(registry, indent=2), encoding="utf-8")


if __name__ == "__main__":
    raise SystemExit("Fournir un jeu de donnees annote avant de lancer l'entrainement (voir README §9 / notebooks/03).")
