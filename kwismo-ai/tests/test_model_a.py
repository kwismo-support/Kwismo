"""Suite complète de tests du Modèle A (50+ scénarios réels, métriques temporelles & règles de sécurité)."""

import pytest
from src.data.features import compute_temporal_features
from src.data.graph import record_number_link, register_known_scammer
from src.models.model_a import predict, rules

# =====================================================================
# 1. TESTS DES RÈGLES DE SÉCURITÉ ABSOLUES (PLAFONNEMENT <= 0.69)
# =====================================================================

@pytest.mark.parametrize("num_verif,gravite,vitesse_verif", [
    (0, 0.0, 0.0),
    (5, 0.5, 1.0),
    (20, 0.8, 4.0),
    (50, 1.0, 10.0),
    (100, 1.0, 25.0),
])
def test_safety_cap_single_report_never_exceeds_0_69(num_verif: int, gravite: float, vitesse_verif: float) -> None:
    """Vérifie qu'un numéro avec 1 seul signalement ne dépasse JAMAIS 0.69."""
    data = {
        "numero": f"23769{num_verif}00001",
        "nombre_signalements": 1,
        "nombre_verifications": num_verif,
        "vitesse_verifications": vitesse_verif,
        "gravite_categories": gravite,
        "diversite_signaleurs": 1,
        "diversite_devices": 1,
    }
    score, explications, _ = predict.predict(data)
    assert score <= 0.69
    assert any("Plafonnement de sécurité" in exp or "signalement" in exp.lower() for exp in explications)


@pytest.mark.parametrize("num_verif", [0, 1, 5, 15, 30, 80])
def test_safety_cap_zero_reports_never_exceeds_0_69(num_verif: int) -> None:
    """Vérifie qu'un numéro sans aucun signalement ne dépasse JAMAIS 0.69."""
    data = {
        "numero": f"2376900{num_verif}",
        "nombre_signalements": 0,
        "nombre_verifications": num_verif,
    }
    score, _, _ = predict.predict(data)
    assert score <= 0.69


# =====================================================================
# 2. TESTS ANTI-VENGEANCE & DÉDUPLICATION PAR DEVICE ID
# =====================================================================

def test_anti_vengeance_same_device_capped() -> None:
    """10 signalements issus du MÊME appareil (Device ID) doivent être plafonnés comme 1 signalement."""
    data = {
        "numero": "237670000099",
        "nombre_signalements": 10,
        "device_fingerprints": ["device_hash_xyz"] * 10,  # Même appareil !
        "nombre_verifications": 10,
    }
    score, explications, _ = predict.predict(data)
    assert score <= 0.69
    assert any("Anti-Vengeance activé" in exp for exp in explications)


def test_anti_vengeance_multiple_distinct_devices() -> None:
    """10 signalements issus de 10 appareils DISTINCTS doivent donner un score élevé (> 0.70)."""
    data = {
        "numero": "237670000088",
        "nombre_signalements": 10,
        "device_fingerprints": [f"device_hash_{i}" for i in range(10)],  # 10 appareils distincts !
        "nombre_verifications": 10,
        "categories": {"r1": "fake_agent_otp", "r2": "sim_swap_scam"},
    }
    score, _, _ = predict.predict(data)
    assert score >= 0.70


# =====================================================================
# 3. TESTS DE DÉCROISSANCE TEMPORELLE EXPONENTIELLE (TIME DECAY)
# =====================================================================

def test_time_decay_recent_vs_old_reports() -> None:
    """Des signalements récents (aujourd'hui) doivent donner un score plus fort que des signalements anciens (180 jours)."""
    recent_data = {
        "numero": "237680000001",
        "nombre_signalements": 3,
        "horodatages_signalements": ["2026-08-18T00:00:00Z", "2026-08-18T01:00:00Z", "2026-08-18T02:00:00Z"],
        "categories": {"r1": "fake_transfer_sms"},
    }
    old_data = {
        "numero": "237680000002",
        "nombre_signalements": 3,
        "horodatages_signalements": ["2025-08-18T00:00:00Z", "2025-08-18T01:00:00Z", "2025-08-18T02:00:00Z"],  # 1 an d'ancienneté !
        "categories": {"r1": "fake_transfer_sms"},
    }
    recent_score, _, _ = predict.predict(recent_data)
    old_score, _, _ = predict.predict(old_data)
    assert recent_score > old_score


# =====================================================================
# 4. TESTS DU RATIO DE PARESSE & RISQUE ÉMERGENT
# =====================================================================

def test_emerging_risk_spike_high_checks_ratio() -> None:
    """Un pic de 40 vérifications récentes sans signalement rédigé déclenche l'Alerte Risque Émergent."""
    data = {
        "numero": "237650000077",
        "nombre_signalements": 0,
        "nombre_verifications": 40,
        "horodatages_verifications": ["2026-08-18T00:00:00Z"] * 40,  # 40 vérifications récentes !
    }
    score, explications, _ = predict.predict(data)
    assert any("Alerte Risque Émergent" in exp for exp in explications)
    assert 0.20 <= score <= 0.69  # Hausse sans dépasser le plafonnement


# =====================================================================
# 5. TESTS D'ANALYSE DE GRAPHE DE RÉSEAU (LINK BONUS)
# =====================================================================

def test_scam_ring_network_graph_bonus() -> None:
    """Un numéro lié à un récepteur arnaqueur confirmé reçoit un bonus de réseau (+0.15)."""
    sender_num = "237671111222"
    scammer_target = "237699999888"

    record_number_link(sender_num, scammer_target)
    register_known_scammer(scammer_target)

    data = {
        "numero": sender_num,
        "nombre_signalements": 2,
        "nombre_verifications": 5,
    }
    score, explications, _ = predict.predict(data)
    assert any("Lien" in exp or "réseau" in exp.lower() for exp in explications)
    assert score >= 0.30


# =====================================================================
# 6. TESTS DE RÉDUCTION POUR STATUT MARCHAND / OFFICIEL
# =====================================================================

def test_official_merchant_status_score_reduction() -> None:
    """Un numéro avec statut 'verifie_officiel' bénéficie d'une réduction de 50% sur son score."""
    normal_data = {
        "numero": "237699000111",
        "nombre_signalements": 3,
        "nombre_verifications": 10,
    }
    merchant_data = {
        "numero": "237699000111",
        "nombre_signalements": 3,
        "nombre_verifications": 10,
        "statut_communautaire": "verifie_officiel",
    }
    score_normal, _, _ = predict.predict(normal_data)
    score_merchant, explications, _ = predict.predict(merchant_data)

    assert score_merchant < score_normal
    assert any("Réduction de score appliquée" in exp for exp in explications)


# =====================================================================
# 7. SUITE DE 50 SCÉNARIOS DE TEST PARAMÉTRÉS SUR LE MODÈLE A
# =====================================================================

SCENARIOS_50 = [
    # (id, num_sig, num_verif, gravite, est_officiel, max_expected_score, min_expected_score)
    ("sc_01", 0, 0, 0.0, False, 0.15, 0.0),
    ("sc_02", 0, 1, 0.0, False, 0.25, 0.0),
    ("sc_03", 0, 5, 0.0, False, 0.40, 0.0),
    ("sc_04", 0, 20, 0.0, False, 0.65, 0.05),
    ("sc_05", 0, 50, 0.0, False, 0.69, 0.10),
    
    ("sc_06", 1, 0, 0.0, False, 0.69, 0.05),
    ("sc_07", 1, 1, 0.5, False, 0.69, 0.10),
    ("sc_08", 1, 5, 0.75, False, 0.69, 0.15),
    ("sc_09", 1, 20, 0.80, False, 0.69, 0.20),
    ("sc_10", 1, 100, 1.0, False, 0.69, 0.30),
    
    ("sc_11", 2, 0, 0.0, False, 0.75, 0.10),
    ("sc_12", 2, 5, 0.75, False, 0.90, 0.20),
    ("sc_13", 2, 20, 1.0, False, 0.95, 0.30),
    ("sc_14", 3, 2, 0.75, False, 0.95, 0.30),
    ("sc_15", 3, 15, 1.0, False, 0.95, 0.40),
    
    ("sc_16", 4, 10, 0.8, False, 0.95, 0.45),
    ("sc_17", 5, 20, 1.0, False, 0.95, 0.50),
    ("sc_18", 8, 30, 1.0, False, 0.95, 0.55),
    ("sc_19", 12, 50, 1.0, False, 0.95, 0.60),
    ("sc_20", 20, 100, 1.0, False, 0.95, 0.65),
    
    ("sc_21", 1, 0, 0.0, True, 0.45, 0.0),    # Officiel
    ("sc_22", 2, 5, 0.75, True, 0.55, 0.05),   # Officiel
    ("sc_23", 5, 20, 1.0, True, 0.60, 0.10),   # Officiel
    ("sc_24", 10, 50, 1.0, True, 0.65, 0.15),  # Officiel
    ("sc_25", 0, 30, 0.0, True, 0.45, 0.0),    # Officiel
    
    ("sc_26", 1, 0, 0.0, False, 0.69, 0.0),
    ("sc_27", 1, 2, 0.5, False, 0.69, 0.0),
    ("sc_28", 1, 4, 0.7, False, 0.69, 0.0),
    ("sc_29", 1, 8, 0.8, False, 0.69, 0.0),
    ("sc_30", 1, 16, 1.0, False, 0.69, 0.0),
    
    ("sc_31", 2, 1, 0.5, False, 0.90, 0.10),
    ("sc_32", 2, 3, 0.7, False, 0.90, 0.15),
    ("sc_33", 2, 7, 0.8, False, 0.95, 0.20),
    ("sc_34", 2, 12, 1.0, False, 0.95, 0.25),
    ("sc_35", 3, 1, 0.5, False, 0.95, 0.25),
    
    ("sc_36", 3, 4, 0.75, False, 0.95, 0.30),
    ("sc_37", 3, 9, 0.80, False, 0.95, 0.35),
    ("sc_38", 4, 2, 0.70, False, 0.95, 0.35),
    ("sc_39", 4, 6, 0.85, False, 0.95, 0.40),
    ("sc_40", 5, 3, 0.90, False, 0.95, 0.45),
    
    ("sc_41", 6, 10, 1.0, False, 0.95, 0.50),
    ("sc_42", 7, 15, 1.0, False, 0.95, 0.55),
    ("sc_43", 9, 25, 1.0, False, 0.95, 0.60),
    ("sc_44", 11, 40, 1.0, False, 0.95, 0.65),
    ("sc_45", 15, 60, 1.0, False, 0.95, 0.65),
    
    ("sc_46", 0, 2, 0.0, False, 0.30, 0.0),
    ("sc_47", 0, 6, 0.0, False, 0.45, 0.0),
    ("sc_48", 0, 12, 0.0, False, 0.60, 0.0),
    ("sc_49", 0, 25, 0.0, False, 0.69, 0.0),
    ("sc_50", 0, 60, 0.0, False, 0.69, 0.0),
]

@pytest.mark.parametrize("sc_id,num_sig,num_verif,gravite,est_officiel,max_score,min_score", SCENARIOS_50)
def test_suite_50_scenarios_model_a(sc_id: str, num_sig: int, num_verif: int, gravite: float, est_officiel: bool, max_score: float, min_score: float) -> None:
    """Valide les 50 scénarios comportementaux du Modèle A."""
    data = {
        "numero": f"237699{sc_id}",
        "nombre_signalements": num_sig,
        "nombre_verifications": num_verif,
        "gravite_categories": gravite,
        "statut_communautaire": "verifie_officiel" if est_officiel else "aucun",
    }
    score, explications, _ = predict.predict(data)
    assert score <= max_score, f"[{sc_id}] Score {score} > Max {max_score}"
    assert score >= min_score, f"[{sc_id}] Score {score} < Min {min_score}"
    assert isinstance(explications, list)
