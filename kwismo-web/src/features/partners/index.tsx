import { useState } from 'react';
import PartnersTable, { type PartnerItem } from './components/PartnersTable';
import PartnerForm from './components/PartnerForm';
import AffiliationRulesEditor from './components/AffiliationRulesEditor';

export default function PartnersPage() {
  const [selectedPartner, setSelectedPartner] = useState<PartnerItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6 p-6 font-body">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-title text-2xl font-bold text-slate-900 dark:text-white">
            Gestion des Partenaires API
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Suivi des accès API entreprise, quotas et règles de routage.
          </p>
        </div>

        <button
          onClick={() => { setSelectedPartner(null); setIsFormOpen(true); }}
          className="flex items-center gap-2 h-10 px-4 rounded-xl bg-brand-orange text-white text-xs font-semibold shadow hover:bg-[#e08700] transition"
        >
          Nouveau Partenaire
        </button>
      </div>

      <PartnersTable
        onEditPartner={(p) => { setSelectedPartner(p); setIsFormOpen(true); }}
      />

      <AffiliationRulesEditor />

      <PartnerForm
        partner={selectedPartner}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
      />
    </div>
  );
}
