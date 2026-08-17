"""Script d'augmentation synthétique de données pour le Modèle B (NLP).

Génère des variantes réalistes avec argot camerounais, fautes d'orthographe locales,
expressions en Pidgin et raccourcis SMS pour immuniser le Modèle B contre les fautes réelles.
"""

import json
import random
from pathlib import Path

CLEAN_INPUT_PATH = Path(__file__).resolve().parent.parent.parent / "data" / "processed" / "model_b_clean.jsonl"
AUGMENTED_OUTPUT_PATH = Path(__file__).resolve().parent.parent.parent / "data" / "processed" / "model_b_augmented.jsonl"

TYPO_RULES = {
    "vous avez": ["vouz avé", "vou ave", "vouz avez"],
    "gagné": ["gagne", "gagneee", "gagnéé"],
    "argent": ["moni", "l'argent", "les fonds"],
    "compte": ["kmpte", "compt", "compte"],
    "code": ["kod", "kode", "code"],
    "secret": ["skret", "secre", "secret"],
    "transfert": ["transfer", "transfert", "transfrt"],
    "reçu": ["recu", "reçue", "reçu"],
    "mobile money": ["momo", "mobilemoney", "mobile money"],
    "orange money": ["om", "orangemoney", "orange money"],
}

PIDGIN_PREFIXES = [
    "Mopao, ", "Waka fine, ", "Bros, ", "Boss, ", "URGENT : ", "Alerte : "
]

PIDGIN_SUFFIXES = [
    " sharp sharp!", " confirmation rapide.", " no waste time.", " stp fast."
]


def augment_text(text: str) -> list[str]:
    """Génère jusqu'à 3 variantes synthétiques d'un texte."""
    variants = [text]

    # Variante 1 : Remplacement par des raccourcis SMS / fautes courantes
    v1 = text
    for original, replacements in TYPO_RULES.items():
        if original in v1.lower() and random.random() > 0.3:
            chosen = random.choice(replacements)
            v1 = v1.replace(original, chosen)
    if v1 != text:
        variants.append(v1)

    # Variante 2 : Ajout de préfixes/suffixes Pidgin / Franglais
    prefix = random.choice(PIDGIN_PREFIXES)
    suffix = random.choice(PIDGIN_SUFFIXES)
    v2 = f"{prefix}{text}{suffix}"
    variants.append(v2)

    return list(dict.fromkeys(variants))


def run_augmentation() -> int:
    """Lit model_b_clean.jsonl et génère model_b_augmented.jsonl."""
    if not CLEAN_INPUT_PATH.exists():
        print(f"Jeu de données nettoyé introuvable : {CLEAN_INPUT_PATH}")
        return 0

    records = [json.loads(line) for line in CLEAN_INPUT_PATH.read_text(encoding="utf-8").splitlines() if line.strip()]
    augmented_records = []
    aug_counter = 1

    for rec in records:
        text = rec.get("texte", "")
        if not text:
            continue

        variants = augment_text(text)
        for var in variants:
            augmented_records.append({
                "id_signalement": f"aug_{aug_counter:05d}",
                "texte": var,
                "type_origine": rec.get("type_origine", "texte"),
                "source_origine": rec.get("source_origine", "augmentation_synthetique"),
            })
            aug_counter += 1

    AUGMENTED_OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with AUGMENTED_OUTPUT_PATH.open("w", encoding="utf-8") as f:
        for rec in augmented_records:
            f.write(json.dumps(rec, ensure_ascii=False) + "\n")

    print(f"Augmentation terminée : {len(augmented_records)} extraits sauvegardés dans {AUGMENTED_OUTPUT_PATH}")
    return len(augmented_records)


if __name__ == "__main__":
    run_augmentation()
