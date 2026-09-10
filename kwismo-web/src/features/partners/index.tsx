import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { api } from '@/shared/lib/api';
import type { PartnerDTO } from '@/shared/mock';
import PartnersTable from './components/PartnersTable';
import PartnerForm from './components/PartnerForm';
import AffiliationRulesEditor from './components/AffiliationRulesEditor';
import PendingRequestsTable from './components/PendingRequestsTable';
import ValidatePartnerModal from './components/ValidatePartnerModal';
import { partnerRequestsStore, type PartnerRequestItem } from './services/partnerRequestsStore';
import { toast } from '@/shared/store/toastStore';

export default function PartnersPage() {
  const { t } = useTranslation('partner');
  const [activeTab, setActiveTab] = useState<'active' | 'pending'>('active');
  const [partners, setPartners] = useState<PartnerDTO[]>([]);
  const [requests, setRequests] = useState<PartnerRequestItem[]>(partnerRequestsStore.getRequests());
  const [selectedPartner, setSelectedPartner] = useState<PartnerDTO | null>(null);
  const [selectedRequestToValidate, setSelectedRequestToValidate] = useState<PartnerRequestItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api.getPartners()
      .then((data) => { if (mounted) setPartners(data); })
      .finally(() => { if (mounted) setLoading(false); });

    const unsubscribe = partnerRequestsStore.subscribe(() => {
      if (mounted) setRequests(partnerRequestsStore.getRequests());
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const pendingCount = requests.filter((r) => r.statut === 'pending').length;

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

  const handleConfirmValidateRequest = (
    requestId: string,
    emailConnexion: string,
    role: string,
    _initialPassword: string,
  ) => {
    const updatedReq = partnerRequestsStore.validateRequest(requestId, emailConnexion, role);
    if (updatedReq) {
      const newPartner: PartnerDTO = {
        id: `part-${Date.now()}`,
        nomEntreprise: updatedReq.nomEntreprise,
        typePartenariat: updatedReq.typePartenariat.toLowerCase().includes('telco') || updatedReq.typePartenariat.toLowerCase() === 'mno'
          ? 'telco'
          : updatedReq.typePartenariat.toLowerCase().includes('bank')
          ? 'bank'
          : 'fintech',
        statut: 'active',
        dateAdhesion: new Date().toISOString(),
        apiKeyCount: 2,
        webhookUrl: `https://api.${updatedReq.nomEntreprise.toLowerCase().replace(/[^a-z0-0]/g, '')}.cm/kwismo/webhook`,
        prefixes: [],
      };
      setPartners((prev) => [newPartner, ...prev]);
      toast.success(`Demande de ${updatedReq.nomEntreprise} validée avec succès ! Identifiants transmis à ${emailConnexion}`);
    }
  };

  const handleRejectRequest = (request: PartnerRequestItem) => {
    if (window.confirm(`Voulez-vous vraiment rejeter la demande de partenariat de ${request.nomEntreprise} ?`)) {
      partnerRequestsStore.rejectRequest(request.id);
      toast.info(`La demande de ${request.nomEntreprise} a été rejetée.`);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 font-body">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-title text-2xl font-bold text-slate-900 dark:text-white">
            {t('pageTitle')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Gestion des partenaires institutionnels, demandes d'adhésion et règles d'affiliation
          </p>
        </div>

        {}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-brand-navy border border-slate-200 dark:border-white/10 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('active')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === 'active'
                ? 'bg-white dark:bg-brand-green text-slate-900 dark:text-white shadow-sm font-bold'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Icon icon="solar:buildings-bold" className="text-sm" />
            <span>Partenaires Actifs ({partners.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('pending')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === 'pending'
                ? 'bg-white dark:bg-brand-green text-slate-900 dark:text-white shadow-sm font-bold'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Icon icon="solar:clock-circle-bold" className="text-sm" />
            <span>Demandes en attente</span>
            {pendingCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-orange text-white text-[10px] font-bold">
                {pendingCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {activeTab === 'active' ? (
        <>
          <PartnersTable
            partners={partners}
            isLoading={loading}
            onEditPartner={(p) => { setSelectedPartner(p); setIsFormOpen(true); }}
            onAddPartner={() => { setSelectedPartner(null); setIsFormOpen(true); }}
          />

          <AffiliationRulesEditor />
        </>
      ) : (
        <PendingRequestsTable
          requests={requests}
          onValidate={(req) => setSelectedRequestToValidate(req)}
          onReject={handleRejectRequest}
        />
      )}

      <PartnerForm
        partner={selectedPartner}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSavePartner}
      />

      <ValidatePartnerModal
        request={selectedRequestToValidate}
        isOpen={!!selectedRequestToValidate}
        onClose={() => setSelectedRequestToValidate(null)}
        onConfirmValidate={handleConfirmValidateRequest}
      />
    </div>
  );
}
