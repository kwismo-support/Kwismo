import RolesList from './components/RolesList';
import PermissionsMatrix from './components/PermissionsMatrix';

export default function AccessControlPage() {
  return (
    <div className="flex flex-col gap-6 p-6 font-body">
      <div>
        <h1 className="font-title text-2xl font-bold text-slate-900 dark:text-white">
          Contrôle d'Accès & Sécurité
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Configuration des rôles, permissions applicatives et habilitations RBAC.
        </p>
      </div>

      <RolesList />
      <PermissionsMatrix />
    </div>
  );
}
