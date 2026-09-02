/**
 * Chemins des routes API backend.
 * Toujours préfixés par env.apiUrl (via l'instance axios).
 *
 * Aligné sur le schéma OpenAPI de https://api.kwismo.com/docs
 */
export const ENDPOINTS = {
  /* ── Auth ──────────────────────────────────────────── */
  auth: {
    register:       '/auth/register',
    emailVerify:    '/auth/email/verify',
    emailResend:    '/auth/email/resend',
    login:          '/auth/login',
    deviceVerify:   '/auth/device/verify',
    refresh:        '/auth/refresh',
    forgotPassword: '/auth/password/forgot',
    resetPassword:  '/auth/password/reset',
    logout:         '/auth/logout',
  },

  /* ── Utilisateurs ───────────────────────────────────── */
  users: {
    me:     '/users/me',
    list:   '/users',
    detail: (id: string) => `/users/${id}`,
    update: (id: string) => `/users/${id}`,
    status: (id: string) => `/users/${id}/status`,
  },

  /* ── Mes Numéros ─────────────────────────────────────── */
  myPhones: {
    list:   '/users/me/phones',
    add:    '/users/me/phones',
    verify: (phoneId: string) => `/users/me/phones/${phoneId}/verify`,
    delete: (phoneId: string) => `/users/me/phones/${phoneId}`,
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
