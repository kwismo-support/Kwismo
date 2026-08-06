-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "motDePasse" TEXT NOT NULL,
    "emailVerifie" BOOLEAN NOT NULL DEFAULT false,
    "statut" TEXT NOT NULL DEFAULT 'active',
    "dateInscription" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "roleId" TEXT NOT NULL,
    CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nomRole" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "AccessRight" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "roleId" TEXT NOT NULL,
    "permission" TEXT NOT NULL,
    "description" TEXT,
    CONSTRAINT "AccessRight_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OtpCode" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "userPhoneId" TEXT,
    "code" TEXT NOT NULL,
    "canal" TEXT NOT NULL,
    "cible" TEXT NOT NULL,
    "dateExpiration" DATETIME NOT NULL,
    "estUtilise" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OtpCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "OtpCode_userPhoneId_fkey" FOREIGN KEY ("userPhoneId") REFERENCES "UserPhone" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Device" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "identifiant" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "datePremiereConnexion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateDerniereConnexion" DATETIME NOT NULL,
    CONSTRAINT "Device_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserPhone" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "valeur" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "operatorId" TEXT,
    "numeroId" TEXT,
    "estVerifie" BOOLEAN NOT NULL DEFAULT false,
    "dateVerification" DATETIME,
    "estCompromis" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserPhone_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserPhone_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserPhone_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "Operator" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "UserPhone_numeroId_fkey" FOREIGN KEY ("numeroId") REFERENCES "Numero" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CompromiseIncident" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "userPhoneId" TEXT NOT NULL,
    "dateDeclaration" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statut" TEXT NOT NULL DEFAULT 'open',
    CONSTRAINT "CompromiseIncident_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CompromiseIncident_userPhoneId_fkey" FOREIGN KEY ("userPhoneId") REFERENCES "UserPhone" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Numero" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "valeur" TEXT NOT NULL,
    "scoreRisque" REAL NOT NULL DEFAULT 0,
    "statut" TEXT NOT NULL DEFAULT 'unknown',
    "dateDerniereVerification" DATETIME,
    "countryId" TEXT,
    "operatorId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Numero_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Numero_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "Operator" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "statut" TEXT,
    "numeroId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Contact_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Contact_numeroId_fkey" FOREIGN KEY ("numeroId") REFERENCES "Numero" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "numeroId" TEXT NOT NULL,
    "motif" TEXT NOT NULL,
    "dateSignalement" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statut" TEXT NOT NULL DEFAULT 'pending',
    CONSTRAINT "Report_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Report_numeroId_fkey" FOREIGN KEY ("numeroId") REFERENCES "Numero" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Country" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nom" TEXT NOT NULL,
    "codePays" TEXT NOT NULL,
    "estParDefaut" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "Operator" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nom" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    CONSTRAINT "Operator_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OperatorPrefix" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "operatorId" TEXT NOT NULL,
    "prefixe" TEXT NOT NULL,
    CONSTRAINT "OperatorPrefix_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "Operator" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UssdAction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "operatorId" TEXT NOT NULL,
    "nomAction" TEXT NOT NULL,
    "codeUSSD" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    CONSTRAINT "UssdAction_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "Operator" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Partner" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nomEntreprise" TEXT NOT NULL,
    "typePartenariat" TEXT NOT NULL,
    "dateAdhesion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "AffiliationRule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "partnerId" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AffiliationRule_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AffiliationRule_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AffiliationRulePrefix" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "affiliationRuleId" TEXT NOT NULL,
    "prefixe" TEXT NOT NULL,
    CONSTRAINT "AffiliationRulePrefix_affiliationRuleId_fkey" FOREIGN KEY ("affiliationRuleId") REFERENCES "AffiliationRule" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "numeroId" TEXT NOT NULL,
    "countryId" TEXT,
    "operatorId" TEXT,
    "ussdActionId" TEXT,
    "montant" REAL NOT NULL,
    "dateTransaction" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statut" TEXT NOT NULL DEFAULT 'prepared',
    "niveauRisque" TEXT,
    "codeUSSDGenere" TEXT,
    CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Transaction_numeroId_fkey" FOREIGN KEY ("numeroId") REFERENCES "Numero" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Transaction_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Transaction_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "Operator" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Transaction_ussdActionId_fkey" FOREIGN KEY ("ussdActionId") REFERENCES "UssdAction" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WhatsAppAlert" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "compromiseIncidentId" TEXT,
    "contenu" TEXT NOT NULL,
    "dateEnvoi" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statut" TEXT NOT NULL DEFAULT 'sent',
    CONSTRAINT "WhatsAppAlert_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "WhatsAppAlert_compromiseIncidentId_fkey" FOREIGN KEY ("compromiseIncidentId") REFERENCES "CompromiseIncident" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WhatsAppAlertRecipient" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "whatsAppAlertId" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "statutAccuse" TEXT,
    CONSTRAINT "WhatsAppAlertRecipient_whatsAppAlertId_fkey" FOREIGN KEY ("whatsAppAlertId") REFERENCES "WhatsAppAlert" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "WhatsAppAlertRecipient_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Survey" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "question" TEXT NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "dateCreation" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "SurveyResponse" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "surveyId" TEXT NOT NULL,
    "reponse" TEXT NOT NULL,
    "dateReponse" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SurveyResponse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SurveyResponse_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "Survey" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Kpi" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nomIndicateur" TEXT NOT NULL,
    "valeur" REAL NOT NULL,
    "periode" TEXT NOT NULL,
    "portee" TEXT NOT NULL DEFAULT 'global',
    "partnerId" TEXT,
    CONSTRAINT "Kpi_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "cible" TEXT,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip" TEXT,
    CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_roleId_idx" ON "User"("roleId");

-- CreateIndex
CREATE UNIQUE INDEX "Role_nomRole_key" ON "Role"("nomRole");

-- CreateIndex
CREATE INDEX "AccessRight_roleId_idx" ON "AccessRight"("roleId");

-- CreateIndex
CREATE UNIQUE INDEX "AccessRight_roleId_permission_key" ON "AccessRight"("roleId", "permission");

-- CreateIndex
CREATE INDEX "OtpCode_userId_idx" ON "OtpCode"("userId");

-- CreateIndex
CREATE INDEX "OtpCode_userPhoneId_idx" ON "OtpCode"("userPhoneId");

-- CreateIndex
CREATE UNIQUE INDEX "Device_userId_identifiant_key" ON "Device"("userId", "identifiant");

-- CreateIndex
CREATE UNIQUE INDEX "UserPhone_valeur_key" ON "UserPhone"("valeur");

-- CreateIndex
CREATE INDEX "UserPhone_userId_idx" ON "UserPhone"("userId");

-- CreateIndex
CREATE INDEX "UserPhone_countryId_idx" ON "UserPhone"("countryId");

-- CreateIndex
CREATE INDEX "UserPhone_operatorId_idx" ON "UserPhone"("operatorId");

-- CreateIndex
CREATE INDEX "UserPhone_numeroId_idx" ON "UserPhone"("numeroId");

-- CreateIndex
CREATE INDEX "CompromiseIncident_userId_idx" ON "CompromiseIncident"("userId");

-- CreateIndex
CREATE INDEX "CompromiseIncident_userPhoneId_idx" ON "CompromiseIncident"("userPhoneId");

-- CreateIndex
CREATE UNIQUE INDEX "Numero_valeur_key" ON "Numero"("valeur");

-- CreateIndex
CREATE INDEX "Numero_countryId_idx" ON "Numero"("countryId");

-- CreateIndex
CREATE INDEX "Numero_operatorId_idx" ON "Numero"("operatorId");

-- CreateIndex
CREATE INDEX "Contact_userId_idx" ON "Contact"("userId");

-- CreateIndex
CREATE INDEX "Contact_numeroId_idx" ON "Contact"("numeroId");

-- CreateIndex
CREATE INDEX "Report_userId_idx" ON "Report"("userId");

-- CreateIndex
CREATE INDEX "Report_numeroId_idx" ON "Report"("numeroId");

-- CreateIndex
CREATE UNIQUE INDEX "Country_codePays_key" ON "Country"("codePays");

-- CreateIndex
CREATE INDEX "Operator_countryId_idx" ON "Operator"("countryId");

-- CreateIndex
CREATE INDEX "OperatorPrefix_operatorId_idx" ON "OperatorPrefix"("operatorId");

-- CreateIndex
CREATE UNIQUE INDEX "OperatorPrefix_operatorId_prefixe_key" ON "OperatorPrefix"("operatorId", "prefixe");

-- CreateIndex
CREATE INDEX "UssdAction_operatorId_idx" ON "UssdAction"("operatorId");

-- CreateIndex
CREATE INDEX "AffiliationRule_partnerId_idx" ON "AffiliationRule"("partnerId");

-- CreateIndex
CREATE INDEX "AffiliationRule_countryId_idx" ON "AffiliationRule"("countryId");

-- CreateIndex
CREATE INDEX "AffiliationRulePrefix_affiliationRuleId_idx" ON "AffiliationRulePrefix"("affiliationRuleId");

-- CreateIndex
CREATE INDEX "Transaction_userId_idx" ON "Transaction"("userId");

-- CreateIndex
CREATE INDEX "Transaction_numeroId_idx" ON "Transaction"("numeroId");

-- CreateIndex
CREATE INDEX "WhatsAppAlert_userId_idx" ON "WhatsAppAlert"("userId");

-- CreateIndex
CREATE INDEX "WhatsAppAlert_compromiseIncidentId_idx" ON "WhatsAppAlert"("compromiseIncidentId");

-- CreateIndex
CREATE INDEX "WhatsAppAlertRecipient_whatsAppAlertId_idx" ON "WhatsAppAlertRecipient"("whatsAppAlertId");

-- CreateIndex
CREATE INDEX "WhatsAppAlertRecipient_contactId_idx" ON "WhatsAppAlertRecipient"("contactId");

-- CreateIndex
CREATE UNIQUE INDEX "WhatsAppAlertRecipient_whatsAppAlertId_contactId_key" ON "WhatsAppAlertRecipient"("whatsAppAlertId", "contactId");

-- CreateIndex
CREATE INDEX "SurveyResponse_userId_idx" ON "SurveyResponse"("userId");

-- CreateIndex
CREATE INDEX "SurveyResponse_surveyId_idx" ON "SurveyResponse"("surveyId");

-- CreateIndex
CREATE UNIQUE INDEX "SurveyResponse_userId_surveyId_key" ON "SurveyResponse"("userId", "surveyId");

-- CreateIndex
CREATE INDEX "Kpi_partnerId_idx" ON "Kpi"("partnerId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");
