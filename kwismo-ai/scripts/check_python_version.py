"""Verifie que l'interpreteur Python utilise est bien la version 3.13."""

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
    print("ERREUR : Python 3.13 est requis pour demarrer KWISMO Modele IA.")
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
