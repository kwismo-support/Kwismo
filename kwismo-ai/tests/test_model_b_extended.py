"""Suite de tests étendue à 50+ cas réels pour le Modèle B (NLP & Auto-Catégorisation).

Vérifie la robustesse de la catégorisation sans étiquettes forcées dans les descriptions d'entrée.
"""

from src.models.model_b.preprocess import categorize_description, process_report_batch

# 52 Scénarios de test variés (Faux SMS, Faux Agents, Loteries, SIM Swap, Emplois, Légitimes)
TEST_SCENARIOS = [
    # --- Faux SMS de Transfert (10 cas) ---
    ("sig_01", "Mobile Money, vous avez reçu 50 000 FCFA de Paul. Nouveau solde 50 200 FCFA.", "fake_transfer_sms"),
    ("sig_02", "Transfert effectué : vous avez recu 100000 F CFA de Orange Money.", "fake_transfer_sms"),
    ("sig_03", "Orange Money: 25000 FCFA recu par erreur. Merci de renvoyer l'argent au 699000000.", "fake_transfer_sms"),
    ("sig_04", "Notification de transfert : 15 000 FCFA crédités sur votre compte MoMo.", "fake_transfer_sms"),
    ("sig_05", "SMS bancaire : vous avez reçu un dépôt de 200 000 FCFA.", "fake_transfer_sms"),
    ("sig_06", "Mobile Money: Erreur de destinataire, transfert effectue sur votre numéro.", "fake_transfer_sms"),
    ("sig_07", "Faux SMS annonçant un reçu par erreur de 45 000 FCFA.", "fake_transfer_sms"),
    ("sig_08", "Vous avez reçu 30 000 FCFA via MoMo. Tapez *126# pour vérifier le solde.", "fake_transfer_sms"),
    ("sig_09", "Orange Money notification: +80 000 FCFA ajoutés à votre solde.", "fake_transfer_sms"),
    ("sig_10", "Faux SMS de transfert stipulant un versement reçu de 12 000 FCFA.", "fake_transfer_sms"),

    # --- Faux Agents & Demandes de Code OTP/PIN (10 cas) ---
    ("sig_11", "Bonjour je suis agent MTN Mobile Money. Votre compte est bloqué, donnez votre code secret.", "fake_agent_otp"),
    ("sig_12", "Appel du service client Orange Money demandant mon code PIN pour corriger une anomalie.", "fake_agent_otp"),
    ("sig_13", "Tapez le code *126*1# et donnez votre mot de passe secret pour annuler la transaction.", "fake_agent_otp"),
    ("sig_14", "Agent Orange se présentant au téléphone pour réclamer le code OTP reçu par SMS.", "fake_agent_otp"),
    ("sig_15", "Compte bloqué : veuillez communiquer votre code PIN à l'agent de maintenance MTN.", "fake_agent_otp"),
    ("sig_16", "Demande suspecte de composition du code secret par un prétendu technicien télécom.", "fake_agent_otp"),
    ("sig_17", "Un agent du service client exige mon code secret pour réactiver la puce SIM.", "fake_agent_otp"),
    ("sig_18", "Anomalie sur votre compte MoMo : veuillez fournir votre code PIN immédiatement.", "fake_agent_otp"),
    ("sig_19", "Un faux agent MTN me demande de taper mon code secret sur le clavier.", "fake_agent_otp"),
    ("sig_20", "Service client Orange : merci d'envoyer votre mot de passe secret par SMS.", "fake_agent_otp"),

    # --- Loteries & Faux Gains de Promo (10 cas) ---
    ("sig_21", "Félicitations ! Votre numéro a été tiré au sort, vous avez gagné 500 000 FCFA.", "lotto_winner_scam"),
    ("sig_22", "Promo Orange 2026 : vous avez gagné un lot et un séjour à Kribi. Frais de dossier 10 000 FCFA.", "lotto_winner_scam"),
    ("sig_23", "Tirage au sort MTN MoMo : bravo vous êtes le grand gagnant de la prime promo.", "lotto_winner_scam"),
    ("sig_24", "Vous avez été désigné gagnant de la loterie annuelle. Envoyez les frais de traitement.", "lotto_winner_scam"),
    ("sig_25", "Bravo ! Retirer votre lot de 300 000 F CFA en payant les frais de dossier.", "lotto_winner_scam"),
    ("sig_26", "Félicitations, vous avez gagné une voiture lors de la promo officielle.", "lotto_winner_scam"),
    ("sig_27", "Message de loterie réclamant 15 000 FCFA de frais pour débloquer les gains.", "lotto_winner_scam"),
    ("sig_28", "Prime Promo MTN : numéro gagnant sélectionné pour recevoir la somme de 400 000 F.", "lotto_winner_scam"),
    ("sig_29", "Vous avez gagné 1 000 000 FCFA. Contactez le standard pour payer les frais de dossier.", "lotto_winner_scam"),
    ("sig_30", "Félicitations ! Gagné un voyage gratuit, envoyez les frais de traitement par MoMo.", "lotto_winner_scam"),

    # --- SIM Swap & Piratage de Cartes SIM (7 cas) ---
    ("sig_31", "Alerte SIM Swap : tentative de piratage de la carte SIM de la victime.", "sim_swap_scam"),
    ("sig_32", "Usurpation par reconduction de SIM et swap non autorisé.", "sim_swap_scam"),
    ("sig_33", "Mon numéro a été dupliqué par une attaque SIM swap chez l'opérateur.", "sim_swap_scam"),
    ("sig_34", "Piratage de puce SIM et piratage du compte Mobile Money associé.", "sim_swap_scam"),
    ("sig_35", "Ma carte SIM ne répond plus, piratage suspect via SIM swap.", "sim_swap_scam"),
    ("sig_36", "Interruption brutale du réseau suite à une reconduction de SIM frauduleuse.", "sim_swap_scam"),
    ("sig_37", "Attaque par swap de carte SIM ayant permis de vider le compte.", "sim_swap_scam"),

    # --- Faux Emplois & Concours de Recrutement (8 cas) ---
    ("sig_38", "Offre d'emploi fictive demandant 25 000 FCFA de frais de dossier pour un entretien à Douala.", "recruitment_fee_scam"),
    ("sig_39", "Faux recrutement d'ONG exigeant des frais d'inscription via Mobile Money.", "recruitment_fee_scam"),
    ("sig_40", "Annonce de concours administratif demandant de payer des frais de dossier par MoMo.", "recruitment_fee_scam"),
    ("sig_41", "Fausse bourse d'étude internationale réclamant des frais de dossier préalable.", "recruitment_fee_scam"),
    ("sig_42", "Faux recruteur me réclamant 15 000 F CFA pour réserver ma place à l'entretien.", "recruitment_fee_scam"),
    ("sig_43", "Arnaque aux offres d'emploi avec paiement obligatoire de frais d'inscription.", "recruitment_fee_scam"),
    ("sig_44", "Avis de recrutement truqué demandant l'envoi de frais de dossier au 677000000.", "recruitment_fee_scam"),
    ("sig_45", "Fausse agence d'embauche réclamant des frais d'inscription par Orange Money.", "recruitment_fee_scam"),

    # --- Informations Officielle & Sensibilisation Anti-Fraude (7 cas) ---
    ("sig_46", "Sensibilisation officielle de l'ANTIC : ne communiquez jamais votre code secret.", "legitimate_info"),
    ("sig_47", "Règle d'or de sécurité du CIRT-CM : aucun agent ne vous demandera votre PIN.", "legitimate_info"),
    ("sig_48", "Conseils de sécurité : vérifiez toujours le numéro officiel du service client.", "legitimate_info"),
    ("sig_49", "Communiqué d'Orange Cameroun rappelant les consignes de prudence anti-arnaque.", "legitimate_info"),
    ("sig_50", "Sensibilisation MTN MoMo : numéros officiels d'assistance et règles de sécurité.", "legitimate_info"),
    ("sig_51", "Le CIRT-CM rappelle aux abonnés de ne jamais cliquer sur un lien SMS suspect.", "legitimate_info"),
    ("sig_52", "Conseils pratiques pour protéger son compte Mobile Money contre les piratages.", "legitimate_info"),
]


def test_52_scenarios_categorization() -> None:
    """Vérifie la catégorisation automatique sur les 52 scénarios de test."""
    batch_input = [{"id_signalement": item[0], "description": item[1]} for item in TEST_SCENARIOS]
    cache = {}
    
    results = process_report_batch(batch_input, cache)
    
    correct_count = 0
    total_count = len(TEST_SCENARIOS)

    for item in TEST_SCENARIOS:
        sig_id, text, expected_cat = item
        detected_cat = results.get(sig_id)
        if detected_cat == expected_cat:
            correct_count += 1
        else:
            print(f"Mismatch [{sig_id}] -> Détecté: {detected_cat} | Attendu: {expected_cat}")

    accuracy = correct_count / total_count
    print(f"\n📊 Précision de la suite étendue (52 cas) : {accuracy * 100:.1f}% ({correct_count}/{total_count})")
    assert accuracy >= 0.90, f"Précision insuffisante sur la suite étendue : {accuracy * 100:.1f}% < 90%"
