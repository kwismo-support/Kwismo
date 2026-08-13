#!/usr/bin/env bash
#
# merge_scrape.sh
#
# FR — Fusionne un ou plusieurs fichiers messages.jsonl (ex. recuperes
# depuis Colab ou tes Telechargements) dans le fichier principal
# data/raw/scraped/messages.jsonl, SANS JAMAIS L'ECRASER.
#
# Etapes :
#   1. Sauvegarde horodatee du fichier principal actuel
#   2. Validation JSON ligne par ligne des fichiers a fusionner (une ligne
#      invalide est ignoree et signalee, elle ne fait pas planter tout le
#      merge)
#   3. Fusion + dedoublonnage EXACT (ligne JSON strictement identique) --
#      le dedoublonnage plus fin sur le texte lui-meme reste le travail de
#      clean.py, pas de ce script
#   4. Ecriture finale, avec un resume avant/apres
#
# EN — Merges one or more messages.jsonl files (e.g. downloaded from
# Colab or your Downloads folder) into the main
# data/raw/scraped/messages.jsonl, WITHOUT EVER OVERWRITING IT.
#
# Steps:
#   1. Timestamped backup of the current main file
#   2. Line-by-line JSON validation of the files to merge (an invalid
#      line is skipped and reported, it doesn't crash the whole merge)
#   3. Merge + EXACT deduplication (strictly identical JSON line) --
#      finer text-level deduplication remains clean.py's job, not this
#      script's
#   4. Final write, with a before/after summary
#
# Usage:
#   ./merge_scrape.sh                    # merge tous les .jsonl de ~/Downloads
#   ./merge_scrape.sh fichier1.jsonl [fichier2.jsonl ...]
#   ./merge_scrape.sh ~/Downloads/*.jsonl
#
set -euo pipefail

MAIN_FILE="data/raw/scraped/messages.jsonl"
BACKUP_DIR="data/raw/scraped/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DOWNLOADS_DIR="$HOME/Downloads"
FILES=()

if [ "$#" -gt 0 ]; then
    FILES=("$@")
else
    if [ -d "$DOWNLOADS_DIR" ]; then
        while IFS= read -r -d '' fichier; do
            FILES+=("$fichier")
        done < <(find "$DOWNLOADS_DIR" -maxdepth 1 -type f -name '*.jsonl' -print0 | sort -z)
    fi

    if [ "${#FILES[@]}" -eq 0 ]; then
        echo "[error] aucun fichier .jsonl trouve dans $DOWNLOADS_DIR."
        echo "Usage: $0 [fichier1.jsonl ...]"
        exit 1
    fi
fi

if [ ! -f "$MAIN_FILE" ]; then
    echo "[error] $MAIN_FILE introuvable."
    echo "[error] es-tu bien a la racine de kwismo-ai/ ? (verifie avec: ls src/ data/)"
    exit 1
fi

# --------------------------------------------------------------------- #
# 1. Sauvegarde
# --------------------------------------------------------------------- #
mkdir -p "$BACKUP_DIR"
BACKUP_FILE="$BACKUP_DIR/messages_${TIMESTAMP}.jsonl"
cp "$MAIN_FILE" "$BACKUP_FILE"
echo "[ok] sauvegarde -> $BACKUP_FILE"

LIGNES_AVANT=$(wc -l < "$MAIN_FILE")

# --------------------------------------------------------------------- #
# 2. Validation JSON ligne par ligne de chaque fichier a fusionner
# --------------------------------------------------------------------- #
TMP_VALID=$(mktemp)
trap 'rm -f "$TMP_VALID"' EXIT

TOTAL_INVALIDES=0
for fichier in "${FILES[@]}"; do
    if [ ! -f "$fichier" ]; then
        echo "[warn] fichier introuvable, ignore : $fichier"
        continue
    fi
    echo "[info] validation de $fichier..."
    NB_LIGNES=$(wc -l < "$fichier")
    NB_VALIDES=0
    while IFS= read -r ligne; do
        [ -z "$ligne" ] && continue
        if echo "$ligne" | python3 -c "import json,sys; json.loads(sys.stdin.read())" 2>/dev/null; then
            echo "$ligne" >> "$TMP_VALID"
            NB_VALIDES=$((NB_VALIDES + 1))
        else
            TOTAL_INVALIDES=$((TOTAL_INVALIDES + 1))
        fi
    done < "$fichier"
    echo "[ok]   $NB_VALIDES/$NB_LIGNES ligne(s) valide(s) dans $fichier"
done

if [ "$TOTAL_INVALIDES" -gt 0 ]; then
    echo "[warn] $TOTAL_INVALIDES ligne(s) JSON invalide(s) au total, ignoree(s)."
fi

# --------------------------------------------------------------------- #
# 3. Fusion + dedoublonnage EXACT (ligne JSON strictement identique)
# --------------------------------------------------------------------- #
TMP_MERGED=$(mktemp)
trap 'rm -f "$TMP_VALID" "$TMP_MERGED"' EXIT

cat "$MAIN_FILE" "$TMP_VALID" | awk '!seen[$0]++' > "$TMP_MERGED"

# --------------------------------------------------------------------- #
# 4. Ecriture finale + resume
# --------------------------------------------------------------------- #
mv "$TMP_MERGED" "$MAIN_FILE"
LIGNES_APRES=$(wc -l < "$MAIN_FILE")
AJOUTEES=$((LIGNES_APRES - LIGNES_AVANT))

echo ""
echo "=== Resume ==="
echo "Avant  : $LIGNES_AVANT ligne(s)"
echo "Apres  : $LIGNES_APRES ligne(s)"
echo "Ajoute : $AJOUTEES ligne(s) nette(s) (apres dedoublonnage exact)"
echo ""
echo "Rappel : ce script dedoublonne seulement les lignes JSON strictement"
echo "identiques. Le dedoublonnage sur le TEXTE (deux articles differents"
echo "citant le meme SMS) reste fait par : python -m src.data.clean"