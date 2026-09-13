import { useState, useMemo } from 'react';
import { Icon } from '@iconify/react';
import { DataTable, type Column } from '@/shared/components/DataTable';
import { FilterBar } from '@/shared/components/FilterBar';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { UserAvatar } from '@/shared/ui/avatar';
import type { PartnerRequestItem } from '../services/partnerRequestsStore';

interface PendingRequestsTableProps {
  requests: PartnerRequestItem[];
  onValidate: (request: PartnerRequestItem) => void;
  onReject: (request: PartnerRequestItem) => void;
}

export default function PendingRequestsTable({
  requests,
  onValidate,
  onReject,
}: PendingRequestsTableProps) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filtered = useMemo(() => {
    return requests.filter((r) => {
      const matchesSearch =
        r.nomEntreprise.toLowerCase().includes(search.toLowerCase()) ||
        r.nomContact.toLowerCase().includes(search.toLowerCase()) ||
        r.email.toLowerCase().includes(search.toLowerCase()) ||
        r.typePartenariat.toLowerCase().includes(search.toLowerCase());

      const matchesType =
        typeFilter === 'ALL' || r.typePartenariat.toUpperCase() === typeFilter.toUpperCase();

      const matchesStatus =
        statusFilter === 'ALL' || r.statut.toUpperCase() === statusFilter.toUpperCase();

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [requests, search, typeFilter, statusFilter]);

  const columns: Column<PartnerRequestItem>[] = [
    {
      key: 'nomEntreprise',
      header: 'Structure Demandeuse',
      sortable: true,
      cell: (req) => (
        <div className="flex items-center gap-3">
          <UserAvatar name={req.nomEntreprise} roleRing="partner" size="md" />
          <div>
            <span className="font-title font-bold text-sm text-slate-900 dark:text-white block">
              {req.nomEntreprise}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Reçu le {new Date(req.dateDemande).toLocaleDateString('fr-FR')}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'typePartenariat',
      header: 'Type de Partenariat',
      sortable: true,
      cell: (req) => <StatusBadge status={req.typePartenariat} size="xs" showDot={false} />,
    },
    {
      key: 'nomContact',
      header: 'Contact Référent',
      cell: (req) => (
        <div className="flex flex-col text-xs font-body">
          <span className="font-bold text-slate-800 dark:text-slate-200">
            {req.prenomContact} {req.nomContact}
          </span>
          <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
            {req.email} • {req.telephone}
          </span>
        </div>
      ),
    },
    {
      key: 'statut',
      header: 'Décision d\'Adhésion',
      sortable: true,
      cell: (req) => (
        <StatusBadge
          status={req.statut === 'pending' ? 'PENDING' : req.statut === 'validated' ? 'APPROVED' : 'REJECTED'}
          size="sm"
          showDot={true}
        />
      ),
    },
    {
      key: 'actions',
      header: 'Actions Super Admin',
      align: 'right',
      cell: (req) => (
        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
          {req.statut === 'pending' ? (
            <>
              <button
                onClick={() => onValidate(req)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-green text-white text-xs font-bold hover:bg-emerald-600 transition shadow-xs cursor-pointer"
              >
                <Icon icon="solar:check-circle-bold" className="text-sm" />
                <span>Valider</span>
              </button>
              <button
                onClick={() => onReject(req)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition shadow-xs cursor-pointer"
              >
                <Icon icon="solar:close-circle-bold" className="text-sm" />
                <span>Rejeter</span>
              </button>
            </>
          ) : req.statut === 'validated' ? (
            <span className="text-xs text-brand-green font-bold flex items-center gap-1 font-mono">
              <Icon icon="solar:check-read-bold" className="text-sm" />
              Accès configuré
            </span>
          ) : (
            <span className="text-xs text-rose-500 font-bold font-mono">
              Demande refusée
            </span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6 w-full font-body">
      <FilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Rechercher une demande par nom d'entreprise ou email..."
        onResetFilters={() => {
          setSearch('');
          setTypeFilter('ALL');
          setStatusFilter('ALL');
        }}
        selects={[
          {
            id: 'type',
            value: typeFilter,
            onChange: setTypeFilter,
            icon: 'solar:widget-linear',
            options: [
              { label: 'Tous les types', value: 'ALL' },
              { label: 'Opérateurs Telco', value: 'TELCO' },
              { label: 'Banques', value: 'BANK' },
              { label: 'Fintechs', value: 'FINTECH' },
            ],
          },
          {
            id: 'status',
            value: statusFilter,
            onChange: setStatusFilter,
            icon: 'solar:check-read-linear',
            options: [
              { label: 'Tous les statuts', value: 'ALL' },
              { label: 'En attente', value: 'PENDING' },
              { label: 'Validés', value: 'VALIDATED' },
              { label: 'Rejetés', value: 'REJECTED' },
            ],
          },
        ]}
      />

      <DataTable
        columns={columns}
        data={filtered}
        getRowKey={(req) => req.id}
        pageSize={10}
        emptyTitle="Aucune demande d'adhésion en attente"
        emptyDesc="Toutes les demandes de partenariat ont été traitées."
        emptyIcon="solar:clipboard-check-bold-duotone"
      />
    </div>
  );
}
