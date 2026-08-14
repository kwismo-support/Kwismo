import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useState } from 'react';

/**
 * Layout principal de l'espace protégé.
 * Sidebar fixe à gauche + Topbar + zone de contenu (Outlet).
 */
export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-bg)]">
      {/* Sidebar desktop (toujours visible) */}
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Contenu principal */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main
          id="main-content"
          className="flex-1 overflow-y-auto p-4 sm:p-6 animate-fade-in"
          tabIndex={-1}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
