"""Suite de tests étendue à 52 scénarios réels sans catégorie imposée pour le Modèle B (NLP & NER).

Évalue la capacité du Modèle B à détecter en toute autonomie si un texte est une arnaque
et à lui attribuer une catégorie ainsi que d'extraire les entités (NER).
"""

from src.models.model_b.preprocess import categorize_description, extract_entities, process_report_batch

# 52 Scénarios réels sans catégorie prédéfinie dans la description :
# Structure : (id_signalement, texte_brut, est_arnaque_attendu)
TEST_SCENARIOS = [
    # --- Faux SMS de Transfert (10 cas d'escroquerie) ---
    ("sig_01", "Mobile Money, vous avez reçu 50 000 FCFA de Paul. Nouveau solde 50 200 FCFA.", True),
    ("sig_02", "Transfert effectué : vous avez recu 100000 F CFA de Orange Money.", True),
    ("sig_03", "Orange Money: 25000 FCFA recu par erreur. Merci de renvoyer l'argent au 699000000.", True),
    ("sig_04", "Notification de transfert : 15 000 FCFA crédités sur votre compte MoMo.", True),
    ("sig_05", "SMS bancaire : vous avez reçu un dépôt de 200 000 FCFA.", True),
    ("sig_06", "Mobile Money: Erreur de destinataire, transfert effectue sur votre numéro.", True),
    ("sig_07", "Faux SMS annonçant un reçu par erreur de 45 000 FCFA.", True),
    ("sig_08", "Vous avez reçu 30 000 FCFA via MoMo. Tapez *126# pour vérifier le solde.", True),
    ("sig_09", "Orange Money notification: +80 000 FCFA ajoutés à votre solde.", True),
    ("sig_10", "Faux SMS de transfert stipulant un versement reçu de 12 000 FCFA.", True),

    # --- Faux Agents & Demandes de Code OTP/PIN (10 cas d'escroquerie) ---
    ("sig_11", "Bonjour je suis agent MTN Mobile Money. Votre compte est bloqué, donnez votre code secret.", True),
    ("sig_12", "Appel du service client Orange Money demandant mon code PIN pour corriger une anomalie.", True),
    ("sig_13", "Tapez le code *126*1# et donnez votre mot de passe secret pour annuler la transaction.", True),
    ("sig_14", "Agent Orange se présentant au téléphone pour réclamer le code OTP reçu par SMS.", True),
    ("sig_15", "Compte bloqué : veuillez communiquer votre code PIN à l'agent de maintenance MTN.", True),
    ("sig_16", "Demande suspecte de composition du code secret par un prétendu technicien télécom.", True),
    ("sig_17", "Un agent du service client exige mon code secret pour réactiver la puce SIM.", True),
    ("sig_18", "Anomalie sur votre compte MoMo : veuillez fournir votre code PIN immédiatement.", True),
    ("sig_19", "Un faux agent MTN me demande de taper mon code secret sur le clavier.", True),
    ("sig_20", "Service client Orange : merci d'envoyer votre mot de passe secret par SMS.", True),

    # --- Loteries & Faux Gains de Promo (10 cas d'escroquerie) ---
    ("sig_21", "Félicitations ! Votre numéro a été tiré au sort, vous avez gagné 500 000 FCFA.", True),
    ("sig_22", "Promo Orange 2026 : vous avez gagné un lot et un séjour à Kribi. Frais de dossier 10 000 FCFA.", True),
    ("sig_23", "Tirage au sort MTN MoMo : bravo vous êtes le grand gagnant de la prime promo.", True),
    ("sig_24", "Vous avez été désigné gagnant de la loterie annuelle. Envoyez les frais de traitement.", True),
    ("sig_25", "Bravo ! Retirer votre lot de 300 000 F CFA en payant les frais de dossier.", True),
    ("sig_26", "Félicitations, vous avez gagné une voiture lors de la promo officielle.", True),
    ("sig_27", "Message de loterie réclamant 15 000 FCFA de frais pour débloquer les gains.", True),
    ("sig_28", "Prime Promo MTN : numéro gagnant sélectionné pour recevoir la somme de 400 000 F.", True),
    ("sig_29", "Vous avez gagné 1 000 000 FCFA. Contactez le standard pour payer les frais de dossier.", True),
    ("sig_30", "Félicitations ! Gagné un voyage gratuit, envoyez les frais de traitement par MoMo.", True),

    # --- SIM Swap & Piratage de Cartes SIM (7 cas d'escroquerie) ---
    ("sig_31", "Alerte SIM Swap : tentative de piratage de la carte SIM de la victime.", True),
    ("sig_32", "Usurpation par reconduction de SIM et swap non autorisé.", True),
    ("sig_33", "Mon numéro a été dupliqué par une attaque SIM swap chez l'opérateur.", True),
    ("sig_34", "Piratage de puce SIM et piratage du compte Mobile Money associé.", True),
    ("sig_35", "Ma carte SIM ne répond plus, piratage suspect via SIM swap.", True),
    ("sig_36", "Interruption brutale du réseau suite à une reconduction de SIM frauduleuse.", True),
    ("sig_37", "Attaque par swap de carte SIM ayant permis de vider le compte.", True),

    # --- Faux Emplois & Concours de Recrutement (8 cas d'escroquerie) ---
    ("sig_38", "Offre d'emploi fictive demandant 25 000 FCFA de frais de dossier pour un entretien à Douala.", True),
    ("sig_39", "Faux recrutement d'ONG exigeant des frais d'inscription via Mobile Money.", True),
    ("sig_40", "Annonce de concours administratif demandant de payer des frais de dossier par MoMo.", True),
    ("sig_41", "Fausse bourse d'étude internationale réclamant des frais de dossier préalable.", True),
    ("sig_42", "Faux recruteur me réclamant 15 000 F CFA pour réserver ma place à l'entretien.", True),
    ("sig_43", "Arnaque aux offres d'emploi avec paiement obligatoire de frais d'inscription.", True),
    ("sig_44", "Avis de recrutement truqué demandant l'envoi de frais de dossier au 677000000.", True),
    ("sig_45", "Fausse agence d'embauche réclamant des frais d'inscription par Orange Money.", True),

    # --- Informations Officielle & Sensibilisation Anti-Fraude (7 cas légitimes / non-fraude) ---
    ("sig_46", "Sensibilisation officielle de l'ANTIC : ne communiquez jamais votre code secret.", False),
    ("sig_47", "Règle d'or de sécurité du CIRT-CM : aucun agent ne vous demandera votre PIN.", False),
    ("sig_48", "Conseils de sécurité : vérifiez toujours le numéro officiel du service client.", False),
    ("sig_49", "Communiqué d'Orange Cameroun rappelant les consignes de prudence anti-arnaque.", False),
    ("sig_50", "Sensibilisation MTN MoMo : numéros officiels d'assistance et règles de sécurité.", False),
    ("sig_51", "Le CIRT-CM rappelle aux abonnés de ne jamais cliquer sur un lien SMS suspect.", False),
    ("sig_52", "Conseils pratiques pour protéger son compte Mobile Money contre les piratages.", False),
]


def test_autonomous_detection_and_categorization() -> None:
    """Vérifie la détection autonome d'escroquerie et la catégorisation sans étiquette préalable."""
    reports_input = [{"id_signalement": item[0], "description": item[1]} for item in TEST_SCENARIOS]
    cache = {}
    
    # 1. Catégorisation autonome
    categories_map = process_report_batch(reports_input, cache)
    
    correct_detection = 0
    total = len(TEST_SCENARIOS)

    for sig_id, raw_text, expected_est_arnaque in TEST_SCENARIOS:
        detected_cat = categories_map.get(sig_id, "unknown_scam_pattern")
        entities = extract_entities(raw_text)
        
        # Un message est détecté comme arnaque s'il ne s'agit pas de sensibilisation officielle
        is_fraud = detected_cat != "legitimate_info" and detected_cat != "unknown_scam_pattern"
        
        if is_fraud == expected_est_arnaque:
            correct_detection += 1
        else:
            print(f"Mismatch [{sig_id}] -> Texte: '{raw_text[:40]}...' | Détecté: {detected_cat} (Fraude: {is_fraud}) | Attendu: {expected_est_arnaque}")

    accuracy = correct_detection / total
    print(f"\n📊 Précision de détection autonome (52 cas réels) : {accuracy * 100:.1f}% ({correct_detection}/{total})")
    assert accuracy >= 0.90, f"Précision autonome insuffisante : {accuracy * 100:.1f}% < 90%"
