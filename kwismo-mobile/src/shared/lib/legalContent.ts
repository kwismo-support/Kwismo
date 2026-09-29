export interface LegalSection {
  title: string;
  content: string;
}

export interface LegalDocument {
  title: string;
  lastUpdated: string;
  sections: LegalSection[];
}

export const getPrivacyPolicy = (lang: string = 'fr'): LegalDocument => {
  const isEn = lang.toLowerCase().startsWith('en');

  if (isEn) {
    return {
      title: 'Privacy Policy & Data Protection',
      lastUpdated: 'September 29, 2026',
      sections: [
        {
          title: 'Article 1. Preamble and Scope of Application',
          content:
            'KWISMO is committed to respecting your privacy and protecting your personal data in accordance with applicable cybersecurity, digital rights, and data protection legislation. This Privacy Policy specifies the nature of the information collected through our mobile application, web services, and backend APIs, as well as the purposes, storage protocols, legal bases, and security measures governing its processing.',
        },
        {
          title: 'Article 2. Nature of Collected Data',
          content:
            'KWISMO collects and processes only the minimum data strictly necessary for anti-scam prevention, financial fraud detection, and identity verification:\n\n' +
            '• Identity & Account Data: Full name, primary email address, telephone number, user language preference, and authentication credentials.\n' +
            '• Technical & Telephony Event Data: Incoming and outgoing call metadata (timestamps, call state duration, phone number formatting, and threat risk classification scores).\n' +
            '• Address Book & Device Contacts: Device contacts are accessed exclusively on the client-side device to cross-reference and differentiate known trusted contacts from unknown callers. KWISMO does NOT upload, sell, or commercialize your private contact lists to external third parties.',
        },
        {
          title: 'Article 3. System Permissions and Justification',
          content:
            'To deliver real-time cyber protection, KWISMO requests specific mobile operating system permissions:\n\n' +
            '• READ_CALL_LOG & READ_PHONE_STATE (Android): Strictly required to intercept unknown incoming/outgoing calls and analyze potential scam signatures in real-time.\n' +
            '• READ_CONTACTS: Required exclusively to prevent false alarms by ignoring calls originating from your verified address book.\n' +
            '• POST_NOTIFICATIONS: Required to dispatch immediate critical threat alerts upon detecting fraudulent or suspicious call activity.',
        },
        {
          title: 'Article 4. Offline Processing and Deferred Synchronization',
          content:
            'In case of network connectivity loss or offline operational status, KWISMO preserves privacy and continuity by processing call logs locally on your device. Call metadata is securely queued in encrypted local storage and automatically synchronized with KWISMO verification servers as soon as network connectivity is restored.',
        },
        {
          title: 'Article 5. Data Security and Encryption Standards',
          content:
            'All data transmitted between the KWISMO application and backend servers is encrypted using TLS 1.3 and AES-256 protocols. Authentication secrets and passwords are stored using high-entropy Argon2id cryptographic hashing.',
        },
        {
          title: 'Article 6. Third-Party Sharing and Law Enforcement Disclosure',
          content:
            'KWISMO does not rent, sell, or disclose personal data to third-party advertisers. Data may only be shared with law enforcement authorities or judicial entities pursuant to formal legal requisitions or court orders in connection with financial crime investigations.',
        },
        {
          title: 'Article 7. User Rights and Data Deletion Requests',
          content:
            'Under applicable regulations, you retain full rights of access, rectification, portability, and complete erasure (right to be forgotten) regarding your personal data. You may request account closure and total data deletion by contacting our Data Protection Officer at privacy@kwismo.com.',
        },
        {
          title: 'Article 8. Complaints and Contact Information',
          content:
            'For any questions or formal privacy disputes, please contact our Legal & Compliance Department at privacy@kwismo.com or support@kwismo.com.',
        },
      ],
    };
  }

  return {
    title: 'Politique de Confidentialité et Protection des Données',
    lastUpdated: '29 Septembre 2026',
    sections: [
      {
        title: 'Article 1. PRÉAMBULE ET CHAMP D’APPLICATION',
        content:
          'La présente Politique de Confidentialité définit les engagements de KWISMO concernant la collecte, l’utilisation, le stockage, le traitement et la protection des données à caractère personnel des utilisateurs de la plateforme KWISMO (application mobile, services web et API partenaires). KWISMO s’engage formellement à respecter la vie privée de ses utilisateurs conformément aux lois et réglementations nationales et internationales en matière de cybersécurité, de protection des données et du droit du numérique.',
      },
      {
        title: 'Article 2. NATURE DES DONNÉES COLLECTÉES ET TRAITÉES',
        content:
          'KWISMO applique le principe de minimisation des données et ne collecte que les informations strictement nécessaires à la fourniture de ses services de prévention contre les fraudes financières et les menaces téléphoniques :\n\n' +
          '1. Données d’Identité et de Compte : Nom, prénom, adresse e-mail, numéro de téléphone principal, langue d’usage et paramètres de sécurité du compte.\n' +
          '2. Données Techniques et Métadonnées d’Appels : Numéros de téléphone des appels entrants et sortants hors carnet d’adresses, horodatage, durée d’appel, score de risque attribué et catégorie de menace.\n' +
          '3. Carnet d’Adresses et Contacts du Téléphone : L’accès aux contacts du répertoire est effectué EXCLUSIVEMENT en local sur l’appareil de l’utilisateur pour distinguer les contacts connus des numéros inconnus. Aucune liste de contacts personnels n’est vendue, louée ou cédée à des tiers.',
      },
      {
        title: 'Article 3. AUTORISATIONS ET PERMISSIONS SYSTÈME',
        content:
          'Afin d’assurer une protection en temps réel contre les tentatives d’escroquerie et d’ingénierie sociale, KWISMO requiert des autorisations spécifiques auprès du système d’exploitation :\n\n' +
          '• READ_CALL_LOG et READ_PHONE_STATE (Android) : Nécessaires à l’interception et à l’analyse de sécurité des numéros entrants/sortants inconnus.\n' +
          '• READ_CONTACTS : Nécessaire pour éviter les fausses alertes sur les appels provenant de vos contacts de confiance.\n' +
          '• POST_NOTIFICATIONS : Nécessaire pour diffuser immédiatement des alertes de menace critique et des notifications d’enquête post-appel.',
      },
      {
        title: 'Article 4. TRAITEMENT HORS LIGNE ET SYNCHRONISATION DIFFÉRÉE',
        content:
          'En cas d’absence ou d’interruption de la connexion Internet, KWISMO préserve l’intégrité du service en effectuant un enregistrement et un prétraitement en local sur l’appareil. Les éléments d’analyse sont stockés de manière chiffrée dans la file d’attente hors-ligne de l’appareil et automatiquement synchronisés avec les serveurs KWISMO dès le rétablissement du réseau.',
      },
      {
        title: 'Article 5. SÉCURITÉ ET CHIFFREMENT DES DONNÉES',
        content:
          'Toutes les communications entre l’application KWISMO et les serveurs d’analyse sont sécurisées par des chiffrements de pointe (TLS 1.3, AES-256). Les mots de passe et données sensibles sont hachés de manière irréversible à l’aide du protocole cryptographique Argon2id.',
      },
      {
        title: 'Article 6. PARTAGE AVEC DES TIERS ET REQUISITIONS LÉGALES',
        content:
          'KWISMO s’interdit formellement de commercialiser ou de diffuser les données personnelles à des fins publicitaires. Les données ne pourront être communiquées qu’aux autorités judiciaires ou régulatrices compétentes dans le strict cadre d’une réquisition légale relative à des enquêtes pour fraude financière ou cybercriminalité.',
      },
      {
        title: 'Article 7. DROITS DES UTILISATEURS ET SUPPRESSION DES DONNÉES',
        content:
          'Conformément à la réglementation sur la protection des données, chaque utilisateur dispose d’un droit d’accès, de rectification, de portabilité et de suppression intégrale de ses données (droit à l’oubli). Vous pouvez exercer ces droits ou demander la clôture définitive de votre compte en écrivant à privacy@kwismo.com.',
      },
      {
        title: 'Article 8. RÉCLAMATIONS ET CONTACTS LÉGAUX',
        content:
          'Pour toute question, réclamation ou contestation relative à la gestion de vos données personnelles, veuillez contacter le Délégué à la Protection des Données (DPO) par e-mail à privacy@kwismo.com ou support@kwismo.com.',
      },
    ],
  };
};

export const getTermsOfService = (lang: string = 'fr'): LegalDocument => {
  const isEn = lang.toLowerCase().startsWith('en');

  if (isEn) {
    return {
      title: 'Terms of Service & User Agreement',
      lastUpdated: 'September 29, 2026',
      sections: [
        {
          title: 'Article 1. Object and Acceptance',
          content:
            'These Terms of Service govern the access and use of the KWISMO security application, website, and associated fraud prevention services. By registering, installing, or utilizing KWISMO, you implicitly accept these terms in full without qualification.',
        },
        {
          title: 'Article 2. Service Description and Eligibility',
          content:
            'KWISMO provides digital decision-support services, threat intelligence, and call detection algorithms designed to prevent Mobile Money fraud, identity theft, and scam calls. Services are intended strictly for legal personal or corporate use by individuals aged 18 or older.',
        },
        {
          title: 'Article 3. User Rights and Obligations (Do’s and Don’ts)',
          content:
            'User Rights:\n' +
            '• Access real-time scam verification tools, Mobile Money transaction security checks, and public report submissions.\n' +
            '• Request dispute reviews or status corrections for flagged numbers.\n\n' +
            'User Obligations:\n' +
            '• Provide accurate and truthful information upon account registration.\n' +
            '• Maintain strict confidentiality of account credentials and device access.',
        },
        {
          title: 'Article 4. Strict Prohibitions, Abuse, and Legal Violations',
          content:
            'Users are strictly prohibited from:\n' +
            '1. Submitting false, malicious, defamatory, or abusive fraud reports against legitimate businesses or individuals.\n' +
            '2. Reverse engineering, decompiling, extracting, or disrupting the KWISMO artificial intelligence algorithms, API infrastructure, or databases.\n' +
            '3. Utilizing KWISMO for harassment, money laundering, extortion, or illegal financial activities.\n\n' +
            'Any violation will result in immediate permanent account termination, IP/device banning, and criminal prosecution before competent judicial authorities.',
        },
        {
          title: 'Article 5. Dispute Resolution and Number Flag Review',
          content:
            'Any individual or corporate legal entity wishing to dispute a threat label or scam rating associated with their phone number may submit a formal claim with proof of identity to legal@kwismo.com for rapid investigation.',
        },
        {
          title: 'Article 6. Limitation of Liability',
          content:
            'KWISMO acts as a preventative decision-support system. While KWISMO uses advanced analytical models with high accuracy, KWISMO cannot be held liable for financial losses resulting from voluntary transactions conducted by users despite issued threat warnings.',
        },
        {
          title: 'Article 7. Intellectual Property',
          content:
            'All trade names, logos, source code, UI elements, and proprietary algorithms are the exclusive property of KWISMO. Any unauthorized reproduction is strictly prohibited.',
        },
        {
          title: 'Article 8. Governing Law and Jurisdiction',
          content:
            'These Terms of Service are governed by applicable digital and commercial law. Any litigation shall be submitted to competent courts of jurisdiction.',
        },
      ],
    };
  }

  return {
    title: 'Conditions Générales d’Utilisation (CGU)',
    lastUpdated: '29 Septembre 2026',
    sections: [
      {
        title: 'Article 1. OBJET ET ACCEPTATION DES CONDITIONS',
        content:
          'Les présentes Conditions Générales d’Utilisation (CGU) régissent l’accès, l’inscription et l’utilisation des services de protection anti-fraude fournis par la plateforme KWISMO via son application mobile et son site web. L’accès et l’utilisation de la plateforme impliquent l’acceptation expresse, intégrale et sans réserve des présentes CGU par l’utilisateur.',
      },
      {
        title: 'Article 2. DESCRIPTION DES SERVICES ET ÉLIGIBILITÉ',
        content:
          'KWISMO est une solution d’aide à la décision et de cybersécurité financière conçue pour protéger les utilisateurs contre les fraudes Mobile Money, l’usurpation d’identité et le harcèlement téléphonique. Le service est réservé aux personnes physiques ou morales majeures bénéficiant de la pleine capacité juridique.',
      },
      {
        title: 'Article 3. DROITS ET OBLIGATIONS DE L’UTILISATEUR (CE QU’IL FAUT FAIRE ET NE PAS FAIRE)',
        content:
          'Droits de l’Utilisateur :\n' +
          '• Bénéficier des outils de vérification des numéros, de sécurisation des transferts et du système d’alerte de menace en temps réel.\n' +
          '• Effectuer des signalements citoyents de tentatives de fraude et demander la révision d’un statut en cas d’erreur.\n\n' +
          'Obligations de l’Utilisateur :\n' +
          '• Fournir des informations exactes, sincères et à jour lors de l’inscription.\n' +
          '• Préserver la confidentialité absolue de ses identifiants de connexion et sécuriser l’accès à son appareil mobile.',
      },
      {
        title: 'Article 4. INTERDICTIONS STRICTES, ABUS ET VIOLATIONS LÉGALES',
        content:
          'Il est strictly interdit sous peine de poursuites civiles et pénales de :\n' +
          '1. Effectuer de faux signalements abusifs, mensongers ou diffamatoires visant à nuire à la réputation d’un numéro ou d’un commerce légitime.\n' +
          '2. Tenter d’effectuer de l’ingénierie inverse (reverse engineering), de décompiler, d’extraire ou de perturber les algorithmes d’intelligence artificielle et les API de KWISMO.\n' +
          '3. Utiliser la plateforme à des fins de harcèlement, d’extorsion, de blanchiment d’argent ou de toute activité illégale.\n\n' +
          'Toute violation constatée entraînera la suspension immédiate et définitive du compte, le bannissement de l’appareil et la transmission du dossier aux autorités judiciaires compétentes.',
      },
      {
        title: 'Article 5. PROCÉDURE DE SIGNALEMENT ET CONTESTATION DE NUMÉRO',
        content:
          'Toute personne ou entité souhaitant contester l’étiquetage ou la note de risque attribuée à son numéro de téléphone peut soumettre un dossier de réclamation motivé accompagné d’une pièce d’identité valide à l’adresse legal@kwismo.com. Une vérification contradictoire sera menée sous 72 heures ouvrées.',
      },
      {
        title: 'Article 6. LIMITATION DE RESPONSABILITÉ',
        content:
          'KWISMO constitue un outil d’assistance préventive. Bien que nos modèles d’analyse affichent un taux de précision élevé, KWISMO ne saurait être tenu responsable des pertes financières directes ou indirectes subies lors de transactions librement effectuées par l’utilisateur malgré la présence d’avertissements d’alerte.',
      },
      {
        title: 'Article 7. PROPRIÉTÉ INTELLECTUELLE',
        content:
          'L’ensemble des marques, logos, graphismes, interfaces, algorithmes d’analyse et codes sources de KWISMO sont la propriété exclusive de KWISMO. Toute reproduction ou exploitation non autorisée est strictly interdite.',
      },
      {
        title: 'Article 8. DROIT APPLICABLE ET JURIDICTION COMPÉTENTE',
        content:
          'Les présentes CGU sont régies par le droit en vigueur en matière de services numériques et de commerce électronique. Tout litige relatif à leur interprétation ou leur exécution sera soumis aux tribunaux compétents.',
      },
    ],
  };
};
