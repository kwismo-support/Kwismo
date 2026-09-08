import { DetailDrawer } from '@/shared/components/DetailDrawer';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { UserAvatar } from '@/shared/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/ui/tabs';
import type { UserDTO } from '@/shared/mock';

interface UserDetailPanelProps {
  user: UserDTO | null;
  onClose: () => void;
  onToggleStatus?: (user: UserDTO) => void;
}

export default function UserDetailPanel({ user, onClose, onToggleStatus }: UserDetailPanelProps) {
  if (!user) return null;

  const role = user.role.nomRole.toLowerCase();
  const roleRing = role === 'admin' ? 'admin' : role === 'partner' ? 'partner' : 'user';

  return (
    <DetailDrawer
      isOpen={!!user}
      onClose={onClose}
      title={`${user.prenom} ${user.nom}`}
      subtitle={`Fiche utilisateur #${user.id} (${user.role.nomRole.toUpperCase()})`}
      icon="solar:user-bold-duotone"
      width="md"
      footerActions={
        <div className="flex items-center justify-between w-full font-body gap-2">
          {onToggleStatus && (
            <button
              onClick={() => onToggleStatus(user)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold text-white transition cursor-pointer ${
                user.statut === 'active' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-brand-green hover:bg-emerald-600'
              }`}
            >
              {user.statut === 'active' ? 'Suspendre le compte' : 'Réactiver le compte'}
            </button>
          )}

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-200 transition cursor-pointer"
          >
            Fermer
          </button>
        </div>
      }
    >
      <div className="space-y-6 font-body">
        {}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-brand-darkBg/80 border border-slate-200 dark:border-white/10 flex items-center gap-4">
          <UserAvatar
            name={`${user.prenom} ${user.nom}`}
            roleRing={roleRing}
            size="xl"
            statusDot={user.statut === 'active' ? 'active' : 'inactive'}
          />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-title text-lg font-bold text-slate-900 dark:text-white">
                {user.prenom} {user.nom}
              </h3>
              <StatusBadge status={user.statut} size="xs" />
            </div>
            <p className="font-mono text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
            <div className="mt-2 flex items-center gap-2">
              <StatusBadge status={user.role.nomRole} size="xs" showDot={false} />
            </div>
          </div>
        </div>

        {}
        <Tabs defaultValue="info" variant="segmented">
          <TabsList>
            <TabsTrigger value="info" icon="solar:info-circle-bold">Profil</TabsTrigger>
            <TabsTrigger value="permissions" icon="solar:shield-keyhole-bold">Permissions</TabsTrigger>
            <TabsTrigger value="activity" icon="solar:history-bold">Activité</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-3">
            <div className="grid grid-cols-1 gap-2.5 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-brand-darkBg/60 border border-slate-100 dark:border-white/5">
                <span className="text-slate-500">Identifiant système</span>
                <span className="font-bold font-mono text-slate-900 dark:text-white">#{user.id}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-brand-darkBg/60 border border-slate-100 dark:border-white/5">
                <span className="text-slate-500">Rôle attribué</span>
                <span className="font-bold text-slate-900 dark:text-white uppercase">{user.role.nomRole}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-brand-darkBg/60 border border-slate-100 dark:border-white/5">
                <span className="text-slate-500">Date d'inscription</span>
                <span className="font-bold text-slate-900 dark:text-white font-mono">
                  {new Date(user.dateInscription).toLocaleDateString('fr-FR')}
                </span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="permissions" className="space-y-2">
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-brand-navy text-xs space-y-2">
              <span className="font-bold text-slate-900 dark:text-white block">Permissions actives:</span>
              <ul className="space-y-1.5 text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-green" />
                  Lecture &amp; inspection des numéraux virtuels
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-green" />
                  Accès à la matrice de filtrage anti-fraude
                </li>
                {user.role.nomRole.toLowerCase() === 'admin' && (
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-orange" />
                    Administration complète et gestion des clés API
                  </li>
                )}
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="activity">
            <div className="p-4 text-center text-xs text-slate-400">
              <p>Dernière connexion active: Aujourd'hui à 14:32</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DetailDrawer>
  );
}
