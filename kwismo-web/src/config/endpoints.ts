/**
 * Chemins des routes API backend.
 * Toujours préfixés par env.apiUrl (via l'instance axios).
 */
export const ENDPOINTS = {
  /* ── Auth ──────────────────────────────────────────── */
  auth: {
    login:         '/auth/login',
    logout:        '/auth/logout',
    me:            '/auth/me',
    forgotPassword:'/auth/forgot-password',
    resetPassword: '/auth/reset-password',
  },

  /* ── Utilisateurs ───────────────────────────────────── */
  users: {
    list:   '/users',
    detail: (id: string) => `/users/${id}`,
    update: (id: string) => `/users/${id}`,
    ban:    (id: string) => `/users/${id}/ban`,
  },

  /* ── Numéros ────────────────────────────────────────── */
  numbers: {
    list:   '/numbers',
    detail: (id: string) => `/numbers/${id}`,
    verify: '/numbers/verify',
    report: '/numbers/report',
  },

  /* ── Partenaires ─────────────────────────────────────── */
  partners: {
    list:       '/partners',
    detail:     (id: string) => `/partners/${id}`,
    create:     '/partners',
    update:     (id: string) => `/partners/${id}`,
    delete:     (id: string) => `/partners/${id}`,
    users:      (id: string) => `/partners/${id}/users`,
    scope:      (id: string) => `/partners/${id}/scope`,
  },

  /* ── USSD / Pays / Opérateurs ────────────────────────── */
  ussd: {
    countries:       '/ussd/countries',
    country:         (id: string) => `/ussd/countries/${id}`,
    operators:       '/ussd/operators',
    operator:        (id: string) => `/ussd/operators/${id}`,
    actions:         '/ussd/actions',
    action:          (id: string) => `/ussd/actions/${id}`,
  },

  /* ── Dashboard / KPI ─────────────────────────────────── */
  dashboard: {
    kpi:     '/dashboard/kpi',
    trend:   '/dashboard/trend',
    byOp:    '/dashboard/by-operator',
  },

  /* ── Rapports ────────────────────────────────────────── */
  reports: {
    list:   '/reports',
    export: '/reports/export',
  },

  /* ── Contrôle d'accès ────────────────────────────────── */
  access: {
    roles:       '/access/roles',
    role:        (id: string) => `/access/roles/${id}`,
    permissions: '/access/permissions',
  },
} as const;
