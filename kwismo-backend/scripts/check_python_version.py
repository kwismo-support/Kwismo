"""Verifie que l'interpreteur Python utilise est bien la version 3.13.

KWISMO Backend impose Python 3.13. Ce script est volontairement independant
de toute dependance externe (aucun import du projet) pour pouvoir tourner
avec N'IMPORTE QUEL Python deja present sur la machine, avant meme la
creation du venv.

Usage :
    python scripts/check_python_version.py
    py -3.13 scripts/check_python_version.py     (Windows, verification ciblee)
    python3.13 scripts/check_python_version.py   (macOS / Linux)

Sur Windows, prefere check_python.bat (a la racine du projet) : il interroge
directement le lanceur `py -3.13`, donc il detecte Python 3.13 meme si la
commande `python` par defaut pointe vers une autre version.
"""

from __future__ import annotations

import sys

REQUIRED = (3, 13)


def main() -> int:
    current = sys.version_info[:2]

    if current == REQUIRED:
        print(f"Python {sys.version.split()[0]} detecte — OK.")
        return 0

    current_str = ".".join(str(part) for part in current)
    print("=" * 70)
    print("ERREUR : Python 3.13 est requis pour demarrer KWISMO Backend.")
    print(f"Version detectee par ce script : Python {current_str}")
    print()
    print("Installe Python 3.13 puis relance la verification :")
    print("  - Telechargement : https://www.python.org/downloads/")
    print("  - Windows        : py -3.13 scripts/check_python_version.py")
    print("  - macOS / Linux  : python3.13 scripts/check_python_version.py")
    print("=" * 70)
    return 1


if __name__ == "__main__":
    sys.exit(main())
