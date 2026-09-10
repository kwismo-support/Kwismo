import { useState } from 'react';
import { Icon } from '@iconify/react';
import { DataTable, type Column } from '@/shared/components/DataTable';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
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

  const filtered = requests.filter(
    (r) =>
      r.nomEntreprise.toLowerCase().includes(search.toLowerCase()) ||
      r.nomContact.toLowerCase().includes(search.toLowerCase()) ||
      r.email.toLowerCase().includes(search.toLowerCase()) ||
      r.typePartenariat.toLowerCase().includes(search.toLowerCase()),
  );

  const columns: Column<PartnerRequestItem>[] = [
    {
      key: 'nomEntreprise',
      header: 'Entreprise / Structure',
      sortable: true,
      cell: (req) => (
        <div className="flex flex-col font-body">
          <span className="font-semibold text-slate-900 dark:text-white">
            {req.nomEntreprise}
          </span>
          <span className="text-xs text-slate-400">
            Demande du {new Date(req.dateDemande).toLocaleDateString('fr-FR')}
          </span>
        </div>
      ),
    },
    {
      key: 'typePartenariat',
      header: 'Type',
      sortable: true,
      cell: (req) => (
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-brand-orange/10 text-brand-orange">
          {req.typePartenariat}
        </span>
      ),
    },
    {
      key: 'nomContact',
      header: 'Contact & Coordonnées',
      cell: (req) => (
        <div className="flex flex-col text-xs font-body">
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {req.prenomContact} {req.nomContact}
          </span>
          <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
            {req.email} • {req.telephone}
          </span>
        </div>
      ),
    },
    {
      key: 'message',
      header: 'Message / Projet',
      cell: (req) => (
        <span className="text-xs text-slate-600 dark:text-slate-300 max-w-xs line-clamp-2 italic">
          "{req.message || 'Aucun message'}"
        </span>
      ),
    },
    {
      key: 'statut',
      header: 'Statut validation',
      sortable: true,
      cell: (req) => (
        <span
          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
            req.statut === 'pending'
              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
              : req.statut === 'validated'
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
          }`}
        >
          {req.statut === 'pending'
            ? 'En attente Super Admin'
            : req.statut === 'validated'
            ? 'Validé'
            : 'Rejeté'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Décision Admin',
      cell: (req) => (
        <div className="flex items-center justify-end gap-2">
          {req.statut === 'pending' ? (
            <>
              <Button
                size="xs"
                variant="primary"
                leftIcon="solar:check-circle-bold"
                onClick={() => onValidate(req)}
              >
                Valider
              </Button>
              <Button
                size="xs"
                variant="danger"
                leftIcon="solar:close-circle-bold"
                onClick={() => onReject(req)}
              >
                Rejeter
              </Button>
            </>
          ) : req.statut === 'validated' ? (
            <span className="text-xs text-brand-green font-semibold flex items-center gap-1">
              <Icon icon="solar:check-read-bold" className="text-sm" />
              Accès configuré
            </span>
          ) : (
            <span className="text-xs text-rose-500 font-semibold">
              Demande refusée
            </span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4 w-full font-body">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:max-w-xs">
          <Input
            sizeVariant="sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une demande..."
            leftIcon="solar:magnifer-linear"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        getRowKey={(req) => req.id}
        pageSize={10}
      />
    </div>
  );
}
