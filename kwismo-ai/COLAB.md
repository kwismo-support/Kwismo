# Lancer KWISMO IA sur Google Colab

Guide pour récupérer les notebooks du dépôt dans son propre Google Colab, les exécuter, et récupérer/partager les résultats (modèles entraînés, jeux de données) avec le reste de l'équipe.

Référencé depuis [README.md §14](./README.md#14-collecte-de-données-scraping--entraînement-sur-google-colab).

---

## 1. Prérequis

- Un compte Google (pour Colab et, si tu veux garder les gros fichiers, Google Drive).
- Rien d'autre : le dépôt GitHub `kwismo` est **public**, pas besoin de jeton pour le cloner (seulement pour repousser des changements, voir §5).

---

## 2. Récupérer les notebooks dans Colab

Trois façons, de la plus simple à la plus flexible :

**A. Depuis Colab directement (le plus simple)**
`colab.research.google.com` → `File > Open notebook > GitHub` → coller `https://github.com/newtonachonduh46/kwismo` → choisir la branche `main` → ouvrir `kwismo-ai/notebooks/01_exploration.ipynb` (ou `02_train_model_a.ipynb` / `03_train_model_b.ipynb`).

> Colab ouvre le notebook mais ne clone pas le reste du dépôt (le code `src/`, les données…) — c'est pour ça que la première cellule de chaque notebook doit cloner le dépôt (étape 3 ci-dessous).

**B. Cloner tout le dépôt dans une session Colab (recommandé si tu veux enchaîner plusieurs notebooks)**
Ouvre un notebook Colab vide, puis :
```bash
!git clone https://github.com/newtonachonduh46/kwismo.git
```
Ensuite, dans le panneau de fichiers à gauche (icône dossier), navigue jusqu'à `kwismo/kwismo-ai/notebooks/` et ouvre le notebook voulu directement dans Colab (clic droit > Open with > Google Colaboratory).

**C. Google Drive** — si tu préfères garder une copie personnelle : télécharge le dossier `notebooks/` et dépose-le dans ton Drive, puis ouvre-le depuis `Drive > clic droit > Ouvrir avec > Google Colaboratory`. Moins pratique pour rester synchronisé avec les mises à jour du dépôt.

---

## 3. Première cellule à mettre dans CHAQUE notebook

```bash
# Runtime > Change runtime type > GPU (T4, gratuit) avant de lancer quoi que ce soit.
!nvidia-smi

!git clone https://github.com/newtonachonduh46/kwismo.git
%cd kwismo/kwismo-ai

# Colab fournit deja un torch avec CUDA : on installe le reste sans le reinstaller.
!grep -v '^torch' requirements.txt > /tmp/requirements-colab.txt
!pip install -q -r /tmp/requirements-colab.txt

import torch
print("CUDA disponible :", torch.cuda.is_available())
```

Si le notebook a besoin de Playwright (scraping) : ajoute `!playwright install chromium` après le `pip install`.

---

## 4. Configuration (`.env`)

`.env` n'est jamais versionné (secrets). Recrée-en un minimal pour la session :

```bash
%%writefile .env
MODEL_DIR="./models"
HF_MODEL_NAME="Davlan/afro-xlmr-base"
MODEL_B_VERSION="v1"
```

Les identifiants de scraping (`FACEBOOK_USERNAME`, etc.) ne sont nécessaires que pour `scrape_social.py` — inutile de les mettre si tu ne fais qu'entraîner.

---

## 5. Les données et les résultats — comment toute l'équipe y accède

### Les données d'entraînement (texte)

`data/raw/scraped/messages.jsonl` est **versionné sur Git**. Le `git clone` de l'étape 3 le récupère automatiquement, déjà à jour — pas d'upload manuel, pas de synchronisation séparée à faire.

### Les captures d'écran brutes

`data/raw/scraped/images/` n'est **pas** sur Git (trop volumineux pour un dépôt). Si un notebook en a besoin (par ex. pour vérifier une extraction OCR douteuse), monte le Drive partagé de l'équipe :

```python
from google.colab import drive
drive.mount('/content/drive')
# les images vivent dans un dossier partage, ex. /content/drive/MyDrive/KWISMO/scraped_images/
```

### Publier le modèle entraîné (pour que le backend et l'équipe en profitent)

Un adaptateur LoRA (Modèle B) fait quelques Mo — largement sous la limite GitHub (100 Mo) — donc on le renvoie directement sur Git :

```bash
# save(version="v1") (voir src/models/model_b/train.py) a deja ecrit l'artefact + models/registry.json

!git config user.email "toi@exemple.com"
!git config user.name "Ton Nom"
!git add models/
!git commit -m "Entrainement Modele B vX (Colab)"
```

Pour le `push`, il faut un jeton GitHub avec accès en écriture au dépôt (Settings GitHub > Developer settings > Personal access tokens) :

```bash
!git push https://<TOKEN>@github.com/newtonachonduh46/kwismo.git main
```

> Ne mets **jamais** le jeton en clair dans une cellule que tu partages/commits. Utilise plutôt les "Secrets" Colab (icône clé 🔑 dans le panneau de gauche) pour le stocker et le lire avec `from google.colab import userdata; token = userdata.get('GITHUB_TOKEN')`.

Une fois poussé, `git pull` sur le serveur du backend (ou un redéploiement) suffit pour que `src/api/loader.py` charge la nouvelle version.

---

## 6. Version gratuite vs payante — ce qui change concrètement

| | **Gratuit** | **Colab Pro / Pro+** |
| --- | --- | --- |
| GPU | T4 (partagé, dispo variable) | T4/V100/A100 selon dispo, priorité d'accès |
| Session max | ~12h | Jusqu'à 24h (Pro+) |
| Inactivité | Déconnexion après ~90 min sans interaction | Délai d'inactivité plus long |
| **Fermer l'onglet** | Risque de déconnexion (pas garanti de continuer) | **Exécution en arrière-plan** (Pro+ seulement) : le calcul continue même onglet/navigateur fermé — c'est le point qui répond directement à "lancer et ne pas rester devant" |
| RAM | Standard (~12 Go) | RAM haute mémoire disponible |
| Coût | 0 | Payant (abonnement mensuel ou à l'usage) |

**Pour un fine-tuning LoRA léger comme le Modèle B, le gratuit suffit largement** (c'est justement pourquoi PEFT/LoRA a été choisi — cahier IA §6.4). Le vrai avantage du payant ici, c'est l'**exécution en arrière-plan** si tu veux vraiment lancer un entraînement plus long et fermer le PC sans y penser. À défaut de Pro+, sur le gratuit : garder l'onglet ouvert (même en arrière-plan du navigateur) et sauvegarder l'artefact + pousser sur Git dès que l'entraînement se termine, pour ne rien perdre si Colab se déconnecte.

---

## 7. Checklist rapide

- [ ] Runtime GPU activé (`Runtime > Change runtime type > GPU`)
- [ ] `git clone` fait, `%cd kwismo/kwismo-ai`
- [ ] Dépendances installées **sans** réinstaller torch
- [ ] `torch.cuda.is_available()` renvoie `True`
- [ ] `.env` minimal créé
- [ ] Drive monté si besoin des images brutes
- [ ] Jeton GitHub en Secret Colab (pas en clair) si tu comptes pousser des résultats
- [ ] `models/registry.json` + artefact committés et poussés en fin d'entraînement
