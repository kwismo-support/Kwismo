# Lancer KWISMO IA sur Kaggle Notebooks

Ce guide explique comment charger le dépôt KWISMO dans un notebook Kaggle, l'exécuter sur GPU T4/P100 (gratuit jusqu'à 30h par semaine) et sauvegarder les résultats.

---

## 1. Prérequis

- Un compte Kaggle (gratuit sur [kaggle.com](https://www.kaggle.com)).
- Le dépôt GitHub public : `https://github.com/newtonachonduh46/kwismo.git`.

---

## 2. Créer et configurer un Kaggle Notebook

1. Connectez-vous sur Kaggle et cliquez sur **Create > New Notebook**.
2. Dans le panneau de droite **Notebook options** :
   - **Accelerator** : Choisissez **GPU T4 x2** (ou **GPU P100**).
   - **Internet** : Activez l'option **Internet On** (nécessaire pour cloner le dépôt et installer les dépendances).

---

## 3. Cellule d'initialisation pour Kaggle Notebooks

Collez cette cellule au début de votre notebook :

```python
import os
import sys
from pathlib import Path

# Cloner le dépôt dans le dossier de travail Kaggle
PROJECT_DIR = Path("/kaggle/working/kwismo/kwismo-ai")
if not PROJECT_DIR.exists():
    !git clone https://github.com/newtonachonduh46/kwismo.git /kaggle/working/kwismo

os.chdir(PROJECT_DIR)
print("Dossier de travail :", PROJECT_DIR)

# Installer Python 3.13 et créer l'environnement virtuel .venv313
VENV_DIR = PROJECT_DIR / ".venv313"
if not (VENV_DIR / "bin" / "python").exists():
    print("⚡ Installation de Python 3.13...")
    !apt-get update -y > /dev/null
    !apt-get install -y software-properties-common > /dev/null
    !add-apt-repository -y ppa:deadsnakes/ppa > /dev/null 2>&1
    !apt-get update -y > /dev/null
    !apt-get install -y python3.13 python3.13-venv python3.13-dev > /dev/null
    !python3.13 -m venv {VENV_DIR}
    !{VENV_DIR}/bin/pip install -q --upgrade pip
    !{VENV_DIR}/bin/pip install -q -r requirements.txt
    !{VENV_DIR}/bin/python -m playwright install --with-deps chromium

PYTHON_BIN = str(VENV_DIR / "bin" / "python")
print("Interprète Python 3.13 configuré :", PYTHON_BIN)
```

---

## 4. Exécution des notebooks

Vous pouvez exécuter directement les scripts Python du projet via `PYTHON_BIN` :

```python
import subprocess

def run_module(module: str):
    res = subprocess.run([PYTHON_BIN, "-m", module], cwd=PROJECT_DIR, capture_output=True, text=True)
    if res.returncode != 0:
        print("Erreur :", res.stderr)
    else:
        print(res.stdout)

# Exemple : Nettoyage des données
run_module("src.data.clean")

# Exemple : Entraînement du Modèle B
run_module("src.models.model_b.train")
```

---

## 5. Exporter et télécharger les résultats

Les artefacts générés dans `models/model_b/` et `data/processed/` peuvent être téléchargés depuis le panneau **Output** de Kaggle à droite de l'écran, ou enregistrés dans un Kaggle Dataset.
