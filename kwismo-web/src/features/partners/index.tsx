// Partners management page rendering partner directory table and affiliation rules editor.
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '@/shared/lib/api';
import type { PartnerDTO } from '@/shared/mock';
import PartnersTable from './components/PartnersTable';
import PartnerForm from './components/PartnerForm';
import AffiliationRulesEditor from './components/AffiliationRulesEditor';

export default function PartnersPage() {
  const { t } = useTranslation('partner');
  const [partners, setPartners] = useState<PartnerDTO[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<PartnerDTO | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api.getPartners()
      .then((data) => { if (mounted) setPartners(data); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const handleSavePartner = (partnerData: Partial<PartnerDTO>) => {
    if (selectedPartner) {
      setPartners((prev) =>
        prev.map((p) => (p.id === selectedPartner.id ? { ...p, ...partnerData } : p)),
      );
    } else {
      const newPartner: PartnerDTO = {
        id: `part-${Date.now()}`,
        nomEntreprise: partnerData.nomEntreprise ?? '',
        typePartenariat: partnerData.typePartenariat ?? 'telco',
        statut: 'active',
        dateAdhesion: new Date().toISOString(),
        apiKeyCount: 1,
        webhookUrl: partnerData.webhookUrl,
        prefixes: [],
      };
      setPartners((prev) => [newPartner, ...prev]);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 font-body">
      <div>
        <h1 className="font-title text-2xl font-bold text-slate-900 dark:text-white">
          {t('pageTitle')}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t('pageSubtitle')}
        </p>
      </div>

      <PartnersTable
        partners={partners}
        isLoading={loading}
        onEditPartner={(p) => { setSelectedPartner(p); setIsFormOpen(true); }}
        onAddPartner={() => { setSelectedPartner(null); setIsFormOpen(true); }}
      />

      <AffiliationRulesEditor />

      <PartnerForm
        partner={selectedPartner}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSavePartner}
      />
    </div>
  );
}
