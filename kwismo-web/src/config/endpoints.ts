export const ENDPOINTS = {
  
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

  
  users: {
    me:     '/users/me',
    list:   '/users',
    detail: (id: string) => `/users/${id}`,
    update: (id: string) => `/users/${id}`,
    status: (id: string) => `/users/${id}/status`,
  },

  
  myPhones: {
    list:   '/users/me/phones',
    add:    '/users/me/phones',
    verify: (phoneId: string) => `/users/me/phones/${phoneId}/verify`,
    delete: (phoneId: string) => `/users/me/phones/${phoneId}`,
  },

  
  numbers: {
    list:   '/numbers',
    detail: (id: string) => `/numbers/${id}`,
    verify: '/numbers/verify',
    report: '/numbers/report',
  },

  
  partners: {
    list:       '/partners',
    detail:     (id: string) => `/partners/${id}`,
    create:     '/partners',
    update:     (id: string) => `/partners/${id}`,
    delete:     (id: string) => `/partners/${id}`,
    users:      (id: string) => `/partners/${id}/users`,
    scope:      (id: string) => `/partners/${id}/scope`,
  },

  
  ussd: {
    countries:       '/ussd/countries',
    country:         (id: string) => `/ussd/countries/${id}`,
    operators:       '/ussd/operators',
    operator:        (id: string) => `/ussd/operators/${id}`,
    actions:         '/ussd/actions',
    action:          (id: string) => `/ussd/actions/${id}`,
  },

  
  dashboard: {
    kpi:     '/dashboard/kpi',
    trend:   '/dashboard/trend',
    byOp:    '/dashboard/by-operator',
  },

  
  reports: {
    list:   '/reports',
    export: '/reports/export',
  },

  
  access: {
    roles:       '/access/roles',
    role:        (id: string) => `/access/roles/${id}`,
    permissions: '/access/permissions',
  },
} as const;
