import sys

_REQUIRED_PYTHON = (3, 13)

if sys.version_info[:2] != _REQUIRED_PYTHON:
    _current = ".".join(str(part) for part in sys.version_info[:2])
    raise RuntimeError(
        "Python 3.13 est requis pour demarrer KWISMO Backend "
        f"(version detectee : Python {_current}).\n"
        "Installe Python 3.13 (https://www.python.org/downloads/), puis recree "
        "le venv :\n"
        "  Windows      : py -3.13 -m venv .venv\n"
        "  macOS/Linux  : python3.13 -m venv .venv"
    )
