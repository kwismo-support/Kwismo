import { Icon } from '@iconify/react';
import { DetailDrawer } from '@/shared/components/DetailDrawer';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/ui/tabs';
import type { NumeroDTO } from '@/shared/mock';

interface NumberHistoryModalProps {
  numero: NumeroDTO | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function NumberHistoryModal({ numero, isOpen, onClose }: NumberHistoryModalProps) {
  if (!numero) return null;

  return (
    <DetailDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={`Numéro ${numero.valeur}`}
      subtitle={`Détails, réputation IA et historique du numéro (${numero.operatorName} - ${numero.countryCode})`}
      icon="solar:phone-calling-bold-duotone"
      width="lg"
      footerActions={
        <div className="flex items-center justify-between w-full font-body">
          <span className="text-xs text-slate-500">Dernière vérification: {new Date(numero.dateDerniereVerification).toLocaleDateString('fr-FR')}</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-200 transition"
          >
            Fermer
          </button>
        </div>
      }
    >
      <div className="space-y-6 font-body">
        {}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-brand-darkBg/80 border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-navy/10 dark:bg-white/10 text-brand-orange text-2xl font-mono">
              <Icon icon="solar:phone-bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-lg font-bold text-slate-900 dark:text-white">
                  {numero.valeur}
                </span>
                <StatusBadge status={numero.statut} size="xs" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Opérateur: <strong className="text-slate-800 dark:text-slate-200">{numero.operatorName}</strong> ({numero.countryCode})
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end shrink-0 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-200 dark:border-white/10">
            <span className="text-[11px] text-slate-500 uppercase tracking-wider mb-1 font-semibold">
              Score de risque IA
            </span>
            <div className="flex items-center gap-2">
              <span className={`text-lg font-bold font-mono ${numero.scoreRisque >= 80 ? 'text-rose-500' : 'text-brand-green'}`}>
                {numero.scoreRisque} / 100
              </span>
            </div>
          </div>
        </div>

        {}
        <Tabs defaultValue="overview" variant="segmented">
          <TabsList>
            <TabsTrigger value="overview" icon="solar:info-circle-bold">Vue Générale</TabsTrigger>
            <TabsTrigger value="history" icon="solar:history-bold" badge={numero.reportsCount}>
              Signalements
            </TabsTrigger>
            <TabsTrigger value="logs" icon="solar:code-square-bold">Logs OTP</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-brand-darkBg/60 border border-slate-100 dark:border-white/5">
                <span className="text-xs text-slate-500 block mb-1">Nombre de signalements</span>
                <span className="font-bold text-base text-slate-900 dark:text-white font-mono">
                  {numero.reportsCount} signalement(s)
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-brand-darkBg/60 border border-slate-100 dark:border-white/5">
                <span className="text-xs text-slate-500 block mb-1">Statut du Numéro</span>
                <StatusBadge status={numero.statut} size="sm" />
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-brand-navy space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Analyse de risque IA Kwismo
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Ce numéro a été vérifié par l'algorithme Kwismo AI. Le score de risque est calculé en analysant la fréquence des SMS recus, la réputation de la plage d'IP de l'opérateur et les signalements d'usurpation d'identité (Vishing / SIM Swapping).
              </p>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-3">
            {numero.reportsCount === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                <Icon icon="solar:shield-check-bold-duotone" className="text-4xl text-brand-green mx-auto mb-2" />
                <p>Aucun signalement suspect enregistré sur ce numéro.</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="p-3.5 rounded-xl border border-rose-500/20 bg-rose-500/5 flex items-start justify-between text-xs gap-3">
                  <div className="flex items-start gap-2.5">
                    <Icon icon="solar:danger-triangle-bold" className="text-rose-500 text-lg shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">Tentative d'usurpation d'identité (Vishing)</p>
                      <p className="text-slate-500 mt-0.5">Signalé par le partenaire Orange CI Bank</p>
                    </div>
                  </div>
                  <span className="font-mono text-[11px] text-slate-400 shrink-0">
                    {new Date(numero.dateDerniereVerification).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="logs">
            <div className="p-4 rounded-xl bg-slate-950 text-slate-200 font-mono text-xs space-y-2 overflow-x-auto">
              <p className="text-emerald-400">[SYSTEM] 2026-09-07 14:22:01 - OTP Request received for {numero.valeur}</p>
              <p className="text-slate-400">[INFO] Verification code sent via {numero.operatorName} Gateway</p>
              <p className="text-amber-400 font-bold">[AI_SHIELD] Fraud score calculated: {numero.scoreRisque}/100</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DetailDrawer>
  );
}
