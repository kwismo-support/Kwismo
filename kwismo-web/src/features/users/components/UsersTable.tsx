import { useState } from 'react';
import { Icon } from '@iconify/react';

export interface UserItem {
  id: string;
  name: string;
  phone: string;
  role: 'admin' | 'partner' | 'user';
  status: 'active' | 'suspended' | 'pending';
  lastActive: string;
}

const mockUsers: UserItem[] = [
  { id: '1', name: 'Jean-Marc Nkoa', phone: '+237 698 44 43 88', role: 'admin', status: 'active', lastActive: 'Il y a 5 min' },
  { id: '2', name: 'Alain Tchakounte', phone: '+237 655 12 34 56', role: 'partner', status: 'active', lastActive: 'Il y a 1h' },
  { id: '3', name: 'Béatrice Mbarga', phone: '+237 677 88 99 00', role: 'user', status: 'suspended', lastActive: 'Il y a 3j' },
  { id: '4', name: 'Orange Cameroun API', phone: '+237 699 00 11 22', role: 'partner', status: 'active', lastActive: 'En ligne' },
  { id: '5', name: 'Paul Etoundi', phone: '+237 680 11 22 33', role: 'user', status: 'pending', lastActive: 'Jamais' },
];

interface UsersTableProps {
  onSelectUser: (user: UserItem) => void;
}

export default function UsersTable({ onSelectUser }: UsersTableProps) {
  const [search, setSearch] = useState('');

  const filtered = mockUsers.filter(
    (u) => u.name.toLowerCase().includes(search.toLowerCase()) || u.phone.includes(search)
  );

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Search & Filter Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-xs">
          <Icon icon="solar:magnifer-linear" className="absolute left-3 top-3 text-slate-400 text-base" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher nom ou téléphone..."
            className="w-full h-10 pl-9 pr-4 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-brand-navy text-xs font-body focus:outline-none focus:border-brand-green"
          />
        </div>

        <button className="flex items-center gap-2 h-10 px-4 rounded-xl bg-brand-green text-white text-xs font-semibold shadow hover:bg-[#2aa072] transition">
          <Icon icon="solar:user-plus-bold" className="text-base" />
          <span>Nouvel Utilisateur</span>
        </button>
      </div>

      {/* Data Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-brand-navy shadow-sm">
        <table className="w-full text-left border-collapse font-body">
          <thead>
            <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0F1626] text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <th className="p-4">Utilisateur</th>
              <th className="p-4">Téléphone</th>
              <th className="p-4">Rôle</th>
              <th className="p-4">Statut</th>
              <th className="p-4">Activité</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-white/10 text-xs text-slate-800 dark:text-slate-200">
            {filtered.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition">
                <td className="p-4 font-semibold text-slate-900 dark:text-white">{user.name}</td>
                <td className="p-4 font-mono text-xs">{user.phone}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                    user.role === 'admin'
                      ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                      : user.role === 'partner'
                      ? 'bg-brand-orange/10 text-brand-orange'
                      : 'bg-slate-500/10 text-slate-600 dark:text-slate-300'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                    user.status === 'active'
                      ? 'bg-brand-green/10 text-brand-green'
                      : user.status === 'suspended'
                      ? 'bg-danger/10 text-danger'
                      : 'bg-yellow-500/10 text-yellow-600'
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="p-4 text-slate-500">{user.lastActive}</td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => onSelectUser(user)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition"
                  >
                    <Icon icon="solar:eye-linear" className="text-base" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
