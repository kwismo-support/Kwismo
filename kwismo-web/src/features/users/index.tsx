import { useState } from 'react';
import UsersTable, { type UserItem } from './components/UsersTable';
import UserDetailPanel from './components/UserDetailPanel';

export default function UsersPage() {
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);

  return (
    <div className="flex flex-col gap-6 p-6 font-body">
      <div>
        <h1 className="font-title text-2xl font-bold text-slate-900 dark:text-white">
          Gestion des Utilisateurs
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Supervision des comptes utilisateurs, partenaires et administrateurs.
        </p>
      </div>

      <UsersTable onSelectUser={(user) => setSelectedUser(user)} />
      
      <UserDetailPanel user={selectedUser} onClose={() => setSelectedUser(null)} />
    </div>
  );
}
