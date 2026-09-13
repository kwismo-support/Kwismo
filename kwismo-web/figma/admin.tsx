/* ═══════════════════════════════════════════════════════════════════════════
   KWISMO — Espace Admin
   Conforme au Cahier des charges Web v1.0 (§8)
   ═══════════════════════════════════════════════════════════════════════════ */

import { useState, useRef, useMemo } from "react";
import type { ElementType } from "react";
import {
  LayoutDashboard, Users, Briefcase, Hash, Globe, Shield, BarChart2, Bell,
  LogOut, ChevronLeft, ChevronRight, Search, Plus, Eye, Pencil, Ban, Trash2,
  Sun, Moon, Camera, RefreshCw, Check, X, Menu, Phone, Mail, MapPin,
  Building2, UserCog, ShieldCheck, Network, Radio, Smartphone, KeyRound,
  Calendar, AlertTriangle, ArrowRight, Inbox, Send, Link2, FileText,
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  BLUE, ORANGE, GREEN, RED, PURPLE, ROLE_COLORS,
  kpiCards, allUsers, pendingInvites, partnersData, numbersData, countriesData,
  rolesData, permModules, notificationsInit, recentActions, weeklyAll, opData,
  statutsData, affiliationRules, detectOverlaps, buildPerms, previewUssd,
  USER_ROLES, ACCOUNT_STATUSES, PARTNER_TYPES, PARTNER_STATUSES,
  NUMBER_RISK_STATUSES, PERIODS, fullName, initials, hasCompromised, fmtNum, nextId,
  type AdminSection, type AppUser, type Partner, type PhoneNumber,
  type Country, type Operator, type UssdAction, type Role, type Notification,
  type AffiliationRule, type Period, type FormMode,
} from "./data";
import {
  Btn, Modal, ConfirmDialog, ToastContainer, Pagination, FilterToolbar,
  StatusBadge, ScoreBadge, CountBadge, KPICard, PageHeader, SectionHeader,
  TableWrapper, RowActions, RowBtn, Field, FieldGrid, FormCard, FormPage,
  PermissionMatrix, RoleCard, TreeColumn, TreeItem, Callout, SegmentedControl,
  ExportDropdown, Avatar, Drawer, EmptyState, CardSkeleton, Logo,
  useToast, useConfirm, useDataTable, useFormState, fieldCls,
} from "./components";

/* ═══════════════════════════════════════════════════════════════════════════
   NAVIGATION
   ═══════════════════════════════════════════════════════════════════════════ */
const navItems: { key: AdminSection; icon: ElementType; label: string }[] = [
  { key: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { key: "users", icon: Users, label: "Utilisateurs" },
  { key: "partners", icon: Briefcase, label: "Partenaires" },
  { key: "numbers", icon: Hash, label: "Numéros" },
  { key: "countries", icon: Globe, label: "Pays / USSD" },
  { key: "access", icon: Shield, label: "Droits d'accès" },
  { key: "reports", icon: BarChart2, label: "Rapports" },
];

function SidebarContent({
  section, setSection, collapsed, onLogout, onClose,
}: {
  section: AdminSection; setSection: (s: AdminSection) => void;
  collapsed: boolean; onLogout: () => void; onClose?: () => void;
}) {
  return (
    <>
      <nav className="flex-1 overflow-y-auto kw-scroll py-3 px-2">
        {navItems.map(({ key, icon: Icon, label }) => {
          const active = section === key;
          return (
            <button
              key={key}
              onClick={() => { setSection(key); onClose?.(); }}
              title={collapsed ? label : undefined}
              aria-current={active ? "page" : undefined}
              className="kw-btn kw-focus w-full flex items-center rounded-xl mb-1 relative"
              style={{
                gap: collapsed ? 0 : 12,
                padding: collapsed ? "11px 0" : "11px 12px",
                justifyContent: collapsed ? "center" : "flex-start",
                background: active ? (collapsed ? BLUE : `${BLUE}14`) : "transparent",
                color: active ? (collapsed ? "#fff" : BLUE) : "var(--muted-foreground)",
              }}
            >
              {!collapsed && active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full"
                  style={{ background: ORANGE }} />
              )}
              <Icon className="w-[18px] h-[18px] shrink-0" />
              {!collapsed && <span className="text-sm font-medium truncate">{label}</span>}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-border p-2 shrink-0">
        <button
          onClick={onLogout}
          title={collapsed ? "Déconnexion" : undefined}
          className="kw-btn kw-focus w-full flex items-center rounded-xl text-muted-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/25"
          style={{
            gap: collapsed ? 0 : 12,
            padding: collapsed ? "11px 0" : "11px 12px",
            justifyContent: collapsed ? "center" : "flex-start",
          }}
        >
          <LogOut className="w-[18px] h-[18px] shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Déconnexion</span>}
        </button>
      </div>
    </>
  );
}

function Sidebar({
  section, setSection, collapsed, setCollapsed, onLogout,
}: {
  section: AdminSection; setSection: (s: AdminSection) => void;
  collapsed: boolean; setCollapsed: (v: boolean) => void; onLogout: () => void;
}) {
  return (
    <aside
      className="hidden lg:flex flex-col border-r border-border bg-sidebar shrink-0 transition-all duration-300 ease-in-out"
      style={{ width: collapsed ? 72 : 248 }}
    >
      <div className="h-16 flex items-center justify-between border-b border-border shrink-0 px-3">
        {collapsed ? (
          <div className="flex-1 flex justify-center"><Logo compact /></div>
        ) : (
          <div className="min-w-0 flex-1"><Logo /></div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? "Agrandir le menu" : "Réduire le menu"}
          aria-label={collapsed ? "Agrandir le menu" : "Réduire le menu"}
          className="kw-btn kw-focus shrink-0 p-1.5 rounded-lg text-muted-foreground hover:bg-secondary"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
      <SidebarContent section={section} setSection={setSection} collapsed={collapsed} onLogout={onLogout} />
    </aside>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   TOPBAR
   ═══════════════════════════════════════════════════════════════════════════ */
function NotifDropdown({
  notifications, setNotifications, onViewAll, onClose,
}: {
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  onViewAll: () => void; onClose: () => void;
}) {
  const colors: Record<string, string> = { danger: RED, warning: ORANGE, info: BLUE, success: GREEN };
  const recent = notifications.slice(0, 5);

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="kw-scale-in absolute right-0 top-full mt-2 w-[min(92vw,340px)] bg-card border border-border rounded-2xl shadow-xl z-50 overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <span className="font-semibold text-sm text-foreground">Notifications</span>
          <button
            onClick={() => setNotifications(n => n.map(x => ({ ...x, read: true })))}
            className="kw-focus text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Tout marquer lu
          </button>
        </div>

        {recent.length === 0 ? (
          <div className="py-10"><EmptyState icon={Inbox} title="Aucune notification" /></div>
        ) : (
          <div className="divide-y divide-border max-h-[360px] overflow-y-auto kw-scroll">
            {recent.map(n => (
              <div
                key={n.id}
                onClick={() => setNotifications(ns => ns.map(x => (x.id === n.id ? { ...x, read: true } : x)))}
                className="kw-row flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-secondary"
                style={{ background: n.read ? "transparent" : `${colors[n.type]}08` }}
              >
                <span className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                  style={{ background: n.read ? "var(--border)" : colors[n.type] }} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground leading-snug">{n.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.desc}</p>
                  <p className="text-[10px] text-muted-foreground/60 mt-1">{n.time}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="px-4 py-2.5 border-t border-border">
          <button onClick={onViewAll}
            className="kw-focus w-full text-xs font-medium text-center transition-colors hover:opacity-70"
            style={{ color: BLUE }}>
            Voir toutes les notifications →
          </button>
        </div>
      </div>
    </>
  );
}

function Topbar({
  section, darkMode, toggleDark, unread, setSection, notifications, setNotifications, onMenu,
}: {
  section: AdminSection; darkMode: boolean; toggleDark: () => void; unread: number;
  setSection: (s: AdminSection) => void;
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  onMenu: () => void;
}) {
  const label = navItems.find(n => n.key === section)?.label
    ?? (section === "profile" ? "Mon profil" : section === "notifications" ? "Notifications" : "");
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <header className="h-16 flex items-center gap-3 border-b border-border bg-card px-4 sm:px-6 shrink-0">
      <button onClick={onMenu} aria-label="Ouvrir le menu"
        className="kw-btn kw-focus lg:hidden p-2 rounded-xl text-muted-foreground hover:bg-secondary">
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-2 min-w-0">
        <span className="hidden sm:inline text-xs text-muted-foreground">Admin</span>
        <ChevronRight className="hidden sm:block w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
        <h2 className="font-bold text-base text-foreground truncate">{label}</h2>
      </div>

      <div className="flex items-center gap-1 ml-auto shrink-0">
        <button onClick={toggleDark} title={darkMode ? "Thème clair" : "Thème sombre"}
          aria-label={darkMode ? "Thème clair" : "Thème sombre"}
          className="kw-btn kw-focus p-2 rounded-xl text-muted-foreground hover:bg-secondary">
          {darkMode ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
        </button>

        <div className="relative">
          <button onClick={() => setNotifOpen(o => !o)} title="Notifications" aria-label="Notifications"
            className="kw-btn kw-focus relative p-2 rounded-xl text-muted-foreground hover:bg-secondary">
            <Bell className="w-[18px] h-[18px]" />
            {unread > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full border-2 border-card text-[9px] font-bold text-white flex items-center justify-center"
                style={{ background: RED }}>
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </button>
          {notifOpen && (
            <NotifDropdown
              notifications={notifications}
              setNotifications={setNotifications}
              onClose={() => setNotifOpen(false)}
              onViewAll={() => { setSection("notifications"); setNotifOpen(false); }}
            />
          )}
        </div>

        <button onClick={() => setSection("profile")} title="Mon profil" aria-label="Mon profil"
          className="kw-btn kw-focus ml-1">
          <Avatar name="Alice Nguesso" size={34} />
        </button>
      </div>
    </header>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   §8.1 — DASHBOARD
   ═══════════════════════════════════════════════════════════════════════════ */
const chartTooltip = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  fontSize: 12,
  boxShadow: "0 8px 24px -12px rgba(0,0,0,.25)",
};

function AdminDashboard() {
  const [period, setPeriod] = useState<Period>("30 jours");
  const [pays, setPays] = useState("");
  const [operateur, setOperateur] = useState("");
  const [loading, setLoading] = useState(false);

  const chartData = useMemo(() => {
    if (period === "7 jours") return weeklyAll.slice(-4);
    if (period === "90 jours") return weeklyAll.slice(-8);
    return weeklyAll;
  }, [period]);

  const reload = () => {
    setLoading(true);
    window.setTimeout(() => setLoading(false), 700);
  };

  const onPeriod = (p: Period) => { setPeriod(p); reload(); };

  return (
    <div className="space-y-6">
      <PageHeader title="Vue d'ensemble" desc="Tableau de bord anti-fraude KWISMO">
        <ExportDropdown onExport={() => {}} />
      </PageHeader>

      {/* Filtres §8.1 */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        <SegmentedControl options={PERIODS} value={period} onChange={onPeriod} />
        <div className="flex items-center gap-2 lg:ml-auto">
          <div className="relative">
            <select value={pays} onChange={e => { setPays(e.target.value); reload(); }} aria-label="Filtrer par pays"
              className={`${fieldCls()} h-[42px] pr-9 appearance-none cursor-pointer`}
              style={pays ? { borderColor: BLUE, color: BLUE } : undefined}>
              <option value="">Tous les pays</option>
              {countriesData.map(c => <option key={c.id} value={c.pays}>{c.pays}</option>)}
            </select>
            <ChevronRight className="w-3.5 h-3.5 rotate-90 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
          <div className="relative">
            <select value={operateur} onChange={e => { setOperateur(e.target.value); reload(); }} aria-label="Filtrer par opérateur"
              className={`${fieldCls()} h-[42px] pr-9 appearance-none cursor-pointer`}
              style={operateur ? { borderColor: BLUE, color: BLUE } : undefined}>
              <option value="">Tous les opérateurs</option>
              {opData.map(o => <option key={o.op} value={o.op}>{o.op}</option>)}
            </select>
            <ChevronRight className="w-3.5 h-3.5 rotate-90 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Cartes KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-4">
        {loading
          ? <CardSkeleton count={6} />
          : kpiCards.map((k, i) => <KPICard key={k.label} {...k} delay={Math.min(i + 1, 8)} />)}
      </div>

      {/* Graphiques */}
      <div className="grid xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 bg-card rounded-2xl border border-border p-5 kw-in">
          <SectionHeader title={`Signalements et fraudes — ${period}`} icon={BarChart2} />
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chartData} margin={{ top: 5, right: 8, bottom: 0, left: -12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="w" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={chartTooltip} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} iconType="circle" />
              <Line type="monotone" dataKey="sig" stroke={BLUE} strokeWidth={2.5} dot={false} name="Signalements" />
              <Line type="monotone" dataKey="fra" stroke={RED} strokeWidth={2.5} dot={false} name="Fraudes" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-2xl border border-border p-5 kw-in kw-d2">
          <SectionHeader title="Répartition par statut" icon={ShieldCheck} />
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={statutsData} dataKey="value" cx="50%" cy="45%" innerRadius={52} outerRadius={82} paddingAngle={3}>
                {statutsData.map(s => <Cell key={s.name} fill={s.color} stroke="none" />)}
              </Pie>
              <Tooltip contentStyle={chartTooltip} formatter={(v: number) => fmtNum(v)} />
              <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid xl:grid-cols-3 gap-5">
        <div className="bg-card rounded-2xl border border-border p-5 kw-in">
          <SectionHeader title="Fraudes par opérateur" icon={Radio} />
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={opData} margin={{ top: 5, right: 8, bottom: 0, left: -18 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="op" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={chartTooltip} cursor={{ fill: "var(--secondary)" }} />
              <Bar dataKey="fraudes" fill={RED} radius={[6, 6, 0, 0]} name="Fraudes" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="xl:col-span-2 bg-card rounded-2xl border border-border p-5 kw-in kw-d2">
          <SectionHeader title="Dernières actions" desc="Journal d'activité de la plateforme" icon={Network} />
          <div className="space-y-0 max-h-[280px] overflow-y-auto kw-scroll -mx-1 px-1">
            {recentActions.map((a, i) => (
              <div key={a.id}
                className={`flex items-start gap-3 py-3 ${i < recentActions.length - 1 ? "border-b border-border" : ""}`}>
                <span className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: a.color }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground leading-snug">{a.action}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Par {a.user}</p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0 whitespace-nowrap">{a.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   §8.2 — UTILISATEURS
   Compte identifié par email, avec plusieurs numéros rattachés (multi-SIM).
   ═══════════════════════════════════════════════════════════════════════════ */
const EMPTY_USER: AppUser = {
  id: 0, nom: "", prenom: "", email: "", emailVerifie: false,
  statut: "Actif", role: "Analyste", date: "", numeros: [],
};

function UserFormPage({
  user, startMode, onBack, onSave, onDelete, toast,
}: {
  user: AppUser; startMode: FormMode; onBack: () => void;
  onSave: (u: AppUser) => void; onDelete?: (u: AppUser) => void; toast: (t: "success" | "error" | "info" | "warning", m: string) => void;
}) {
  const f = useFormState<AppUser>(user, startMode);
  const isCreate = f.mode === "create";
  const editable = f.mode !== "view";

  const validate = () => {
    const e: Record<string, string> = {};
    if (!f.draft.prenom.trim()) e.prenom = "Le prénom est requis.";
    if (!f.draft.nom.trim()) e.nom = "Le nom est requis.";
    if (!f.draft.email.trim()) e.email = "L'email est requis.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.draft.email)) e.email = "Format d'email invalide.";
    if (!f.draft.role) e.role = "Le rôle est requis.";
    f.setErrors(e as never);
    return Object.keys(e).length === 0;
  };

  const save = async () => {
    if (!validate()) { toast("error", "Corrigez les champs en erreur."); return; }
    f.setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    f.setSaving(false);
    const payload: AppUser = isCreate
      ? { ...f.draft, id: nextId(), date: new Date().toLocaleDateString("fr-FR") }
      : f.draft;
    onSave(payload);
    f.commit(payload);
    toast("success", isCreate ? "Compte créé avec succès." : "Compte mis à jour.");
    if (isCreate) onBack();
  };

  const liftCompromised = (numId: number) => {
    f.setDraft(d => ({
      ...d,
      numeros: d.numeros.map(n => (n.id === numId ? { ...n, statut: "Vérifié" as const } : n)),
    }));
    toast("success", "Statut « compromis » levé.");
  };

  const title = isCreate ? "Nouveau compte" : `${f.draft.prenom} ${f.draft.nom}`;
  const desc = isCreate
    ? "Renseignez les informations du nouveau compte."
    : `Inscrit le ${f.draft.date} · ${f.draft.numeros.length} numéro${f.draft.numeros.length !== 1 ? "s" : ""} rattaché${f.draft.numeros.length !== 1 ? "s" : ""}`;

  return (
    <FormPage
      title={title}
      desc={desc}
      mode={f.mode}
      onModeChange={f.setMode}
      onBack={onBack}
      backLabel="Retour aux utilisateurs"
      onSave={save}
      onDelete={onDelete && !isCreate ? () => onDelete(f.saved) : undefined}
      saving={f.saving}
      dirty={f.dirty}
      headerExtra={
        !isCreate && (
          <div className="flex items-center gap-4 bg-card rounded-2xl border border-border p-5">
            <Avatar name={`${f.draft.prenom} ${f.draft.nom}`} size={56} alert={hasCompromised(f.draft)} />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-foreground truncate">{f.draft.prenom} {f.draft.nom}</p>
              <p className="text-sm text-muted-foreground truncate">{f.draft.email}</p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <StatusBadge status={f.draft.statut} dot />
                <StatusBadge status={f.draft.role} />
                {f.draft.emailVerifie
                  ? <span className="text-xs inline-flex items-center gap-1" style={{ color: GREEN }}><Check className="w-3 h-3" />Email vérifié</span>
                  : <span className="text-xs inline-flex items-center gap-1" style={{ color: ORANGE }}><AlertTriangle className="w-3 h-3" />Email non vérifié</span>}
              </div>
            </div>
          </div>
        )
      }
    >
      <FormCard title="Informations du compte" icon={UserCog}>
        <FieldGrid>
          <Field label="Prénom" value={f.draft.prenom} onChange={f.set("prenom")} editable={editable}
            required error={f.errors.prenom as string} placeholder="Alice" />
          <Field label="Nom" value={f.draft.nom} onChange={f.set("nom")} editable={editable}
            required error={f.errors.nom as string} placeholder="Nguesso" />
          <Field label="Adresse email" value={f.draft.email} onChange={f.set("email")} editable={editable}
            type="email" required icon={Mail} error={f.errors.email as string} placeholder="alice@exemple.com"
            className="sm:col-span-2" />
          <Field label="Rôle" value={f.draft.role} onChange={f.set("role")} editable={editable}
            type="select" options={USER_ROLES} required error={f.errors.role as string}
            renderRead={<StatusBadge status={f.draft.role} />} />
          <Field label="Statut du compte" value={f.draft.statut} onChange={f.set("statut") as never} editable={editable}
            type="select" options={ACCOUNT_STATUSES}
            renderRead={<StatusBadge status={f.draft.statut} dot />} />
          {!isCreate && (
            <>
              <Field label="Vérification email" value={f.draft.emailVerifie ? "Vérifié" : "Non vérifié"} editable={false}
                renderRead={
                  <span className="inline-flex items-center gap-1.5 text-sm"
                    style={{ color: f.draft.emailVerifie ? GREEN : ORANGE }}>
                    {f.draft.emailVerifie ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                    {f.draft.emailVerifie ? "Vérifié" : "Non vérifié"}
                  </span>
                } />
              <Field label="Date d'inscription" value={f.draft.date} editable={false} icon={Calendar} />
            </>
          )}
        </FieldGrid>
      </FormCard>

      {/* §8.2 — Numéros associés */}
      {!isCreate && (
        <FormCard>
          <SectionHeader
            title="Numéros associés"
            desc="Numéros possédés et vérifiés par le titulaire du compte"
            icon={Smartphone}
          />
          {f.draft.numeros.length === 0 ? (
            <EmptyState icon={Smartphone} title="Aucun numéro rattaché"
              desc="Ce compte ne possède encore aucun numéro vérifié." />
          ) : (
            <div className="space-y-2.5">
              {f.draft.numeros.map(n => (
                <div key={n.id}
                  className="kw-card flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl border border-border bg-secondary/40">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: `${BLUE}12` }}>
                      <Phone className="w-4 h-4" style={{ color: BLUE }} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-mono font-medium text-foreground truncate">{n.num}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {n.op} · {n.pays} ({n.indicatif}) · Vérifié le {n.verif}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={n.statut} dot />
                    {n.statut === "Compromis" && editable && (
                      <Btn variant="outline" size="sm" icon={ShieldCheck} onClick={() => liftCompromised(n.id)}>
                        Lever
                      </Btn>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </FormCard>
      )}
    </FormPage>
  );
}

function UsersSection({ toast, confirm }: { toast: never; confirm: never }) {
  const [users, setUsers] = useState<AppUser[]>(allUsers);
  const [page, setPage] = useState<{ mode: FormMode; user: AppUser } | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [invite, setInvite] = useState({ email: "", role: "Analyste" });
  const [invites, setInvites] = useState(pendingInvites);

  const t = useDataTable<AppUser>(
    users,
    (u, q, fl) => {
      const matchQuery =
        !q ||
        fullName(u).toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.numeros.some(n => n.num.replace(/\s/g, "").includes(q.replace(/\s/g, "")));
      const matchStatut = !fl.statut || u.statut === fl.statut;
      const matchRole = !fl.role || u.role === fl.role;
      const matchPays = !fl.pays || u.numeros.some(n => n.pays === fl.pays);
      return matchQuery && matchStatut && matchRole && matchPays;
    },
    10,
  );

  if (page) {
    return (
      <UserFormPage
        user={page.user}
        startMode={page.mode}
        onBack={() => setPage(null)}
        onSave={u => setUsers(us => (us.some(x => x.id === u.id) ? us.map(x => (x.id === u.id ? u : x)) : [u, ...us]))}
        onDelete={u => (confirm as never as Function)(
          `Supprimer le compte de ${fullName(u)} ?`,
          "Cette action est irréversible et détachera tous ses numéros.",
          () => { setUsers(us => us.filter(x => x.id !== u.id)); setPage(null); (toast as never as Function)("success", "Compte supprimé."); },
          true,
        )}
        toast={toast as never}
      />
    );
  }

  const toggleStatus = (u: AppUser) => (confirm as never as Function)(
    u.statut === "Suspendu" ? `Réactiver ${fullName(u)} ?` : `Suspendre ${fullName(u)} ?`,
    u.statut === "Suspendu" ? "Le compte retrouvera un accès complet." : "Le compte perdra l'accès jusqu'à réactivation.",
    () => {
      setUsers(us => us.map(x => (x.id === u.id ? { ...x, statut: x.statut === "Suspendu" ? "Actif" : "Suspendu" } : x)));
      (toast as never as Function)("warning", `${fullName(u)} ${u.statut === "Suspendu" ? "réactivé" : "suspendu"}.`);
    },
    u.statut !== "Suspendu",
  );

  const sendInvite = async () => {
    setInviting(true);
    await new Promise(r => setTimeout(r, 700));
    setInviting(false);
    setInvites(iv => [...iv, { id: nextId(), email: invite.email, role: invite.role, by: "Alice Nguesso", date: new Date().toLocaleDateString("fr-FR") }]);
    (toast as never as Function)("success", `Invitation envoyée à ${invite.email}.`);
    setInviteOpen(false);
    setInvite({ email: "", role: "Analyste" });
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Utilisateurs" desc={`${users.length} comptes · un compte peut porter plusieurs numéros`}>
        <Btn variant="outline" icon={Send} onClick={() => setInviteOpen(true)}>Inviter</Btn>
        <Btn variant="primary" icon={Plus} onClick={() => setPage({ mode: "create", user: { ...EMPTY_USER } })}>
          Nouveau compte
        </Btn>
      </PageHeader>

      <FilterToolbar
        search={t.search}
        onSearch={t.setSearch}
        placeholder="Nom, email ou numéro…"
        filters={[
          { key: "statut", label: "Statut", options: [...ACCOUNT_STATUSES] },
          { key: "role", label: "Rôle", options: USER_ROLES },
          { key: "pays", label: "Pays", options: countriesData.map(c => c.pays) },
        ]}
        values={t.filters}
        onFilterChange={t.setFilters}
        resultCount={t.filtered.length}
        actions={<ExportDropdown onExport={f => (toast as never as Function)("success", `Export ${f.toUpperCase()} généré.`)} />}
      />

      <TableWrapper
        columns={["Compte", "Email", "Numéros", "Rôle", "Statut", "Inscrit le", "Actions"]}
        state={t.isEmpty ? "empty" : "success"}
        emptyTitle={t.hasQuery ? "Aucun résultat" : "Aucun compte"}
        emptyDesc={t.hasQuery ? "Aucun compte ne correspond à votre recherche." : "Créez le premier compte de la plateforme."}
        emptyAction={
          t.hasQuery
            ? <Btn variant="outline" icon={X} onClick={() => { t.setSearch(""); t.setFilters({}); }}>Effacer les filtres</Btn>
            : <Btn variant="primary" icon={Plus} onClick={() => setPage({ mode: "create", user: { ...EMPTY_USER } })}>Nouveau compte</Btn>
        }
        footer={<Pagination total={t.filtered.length} page={t.page} setPage={t.setPage} pageSize={t.pageSize} setPageSize={t.setPageSize} />}
      >
        <tbody className="divide-y divide-border">
          {t.items.map(u => (
            <tr key={u.id} className="kw-row hover:bg-secondary/40">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar name={fullName(u)} size={34} alert={hasCompromised(u)} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{fullName(u)}</p>
                    <p className="text-xs text-muted-foreground truncate sm:hidden">{u.email}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  {u.email}
                  {!u.emailVerifie && <AlertTriangle className="w-3.5 h-3.5 shrink-0" style={{ color: ORANGE }} aria-label="Email non vérifié" />}
                </span>
              </td>
              <td className="px-4 py-3">
                <CountBadge count={u.numeros.length} label="numéro" alert={hasCompromised(u)} />
              </td>
              <td className="px-4 py-3"><StatusBadge status={u.role} /></td>
              <td className="px-4 py-3"><StatusBadge status={u.statut} dot /></td>
              <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">{u.date}</td>
              <td className="px-4 py-3">
                <RowActions>
                  <RowBtn icon={Eye} title="Consulter" tone="primary" onClick={() => setPage({ mode: "view", user: u })} />
                  <RowBtn icon={Pencil} title="Modifier" tone="warn" onClick={() => setPage({ mode: "edit", user: u })} />
                  <RowBtn icon={Ban} title={u.statut === "Suspendu" ? "Réactiver" : "Suspendre"} tone="warn" onClick={() => toggleStatus(u)} />
                  <RowBtn icon={Trash2} title="Supprimer" tone="danger" onClick={() =>
                    (confirm as never as Function)(
                      `Supprimer ${fullName(u)} ?`, "Cette action est irréversible.",
                      () => { setUsers(us => us.filter(x => x.id !== u.id)); (toast as never as Function)("success", "Compte supprimé."); }, true,
                    )} />
                </RowActions>
              </td>
            </tr>
          ))}
        </tbody>
      </TableWrapper>

      {/* Invitations en attente */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <SectionHeader title="Invitations en attente" desc={`${invites.length} invitation(s) non acceptée(s)`} icon={Send} />
        </div>
        {invites.length === 0 ? (
          <EmptyState icon={Send} title="Aucune invitation en attente" />
        ) : (
          <div className="divide-y divide-border">
            {invites.map(inv => (
              <div key={inv.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{inv.email}</p>
                  <p className="text-xs text-muted-foreground">Rôle {inv.role} · invité par {inv.by} le {inv.date}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge status="En attente" dot />
                  <RowBtn icon={RefreshCw} title="Renvoyer" tone="primary"
                    onClick={() => (toast as never as Function)("info", `Invitation renvoyée à ${inv.email}.`)} />
                  <RowBtn icon={X} title="Annuler l'invitation" tone="danger"
                    onClick={() => { setInvites(iv => iv.filter(x => x.id !== inv.id)); (toast as never as Function)("info", "Invitation annulée."); }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title="Inviter un utilisateur"
        desc="Un email d'activation sera envoyé au destinataire."
        footer={
          <>
            <Btn variant="outline" onClick={() => setInviteOpen(false)}>Annuler</Btn>
            <Btn variant="primary" icon={Send} loading={inviting} disabled={!invite.email} onClick={sendInvite}>
              Envoyer
            </Btn>
          </>
        }
      >
        <FieldGrid cols={1}>
          <Field label="Adresse email" value={invite.email} onChange={v => setInvite(s => ({ ...s, email: v }))}
            editable type="email" required icon={Mail} placeholder="email@exemple.com" />
          <Field label="Rôle attribué" value={invite.role} onChange={v => setInvite(s => ({ ...s, role: v }))}
            editable type="select" options={USER_ROLES} required />
        </FieldGrid>
      </Modal>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   §8.3 — PARTENAIRES
   ═══════════════════════════════════════════════════════════════════════════ */
const EMPTY_PARTNER: Partner = {
  id: 0, name: "", type: "Opérateur", pays: "", statut: "Actif",
  date: "", contact: "", email: "", phone: "", numeros: 0,
};

function PartnerFormPage({
  partner, startMode, onBack, onSave, onDelete, toast, rules,
}: {
  partner: Partner; startMode: FormMode; onBack: () => void;
  onSave: (p: Partner) => void; onDelete?: (p: Partner) => void;
  toast: never; rules: AffiliationRule[];
}) {
  const f = useFormState<Partner>(partner, startMode);
  const isCreate = f.mode === "create";
  const editable = f.mode !== "view";
  const myRules = rules.filter(r => r.partenaire === f.saved.name);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!f.draft.name.trim()) e.name = "Le nom est requis.";
    if (!f.draft.pays) e.pays = "Le pays est requis.";
    if (!f.draft.contact.trim()) e.contact = "Le contact est requis.";
    if (!f.draft.email.trim()) e.email = "L'email est requis.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.draft.email)) e.email = "Format d'email invalide.";
    f.setErrors(e as never);
    return Object.keys(e).length === 0;
  };

  const save = async () => {
    if (!validate()) { (toast as never as Function)("error", "Corrigez les champs en erreur."); return; }
    f.setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    f.setSaving(false);
    const payload: Partner = isCreate
      ? { ...f.draft, id: nextId(), date: new Date().toLocaleDateString("fr-FR") }
      : f.draft;
    onSave(payload);
    f.commit(payload);
    (toast as never as Function)("success", isCreate ? "Partenaire créé." : "Partenaire mis à jour.");
    if (isCreate) onBack();
  };

  return (
    <FormPage
      title={isCreate ? "Nouveau partenaire" : f.draft.name}
      desc={isCreate ? "Renseignez les informations de l'entreprise partenaire." : `${f.draft.type} · ${f.draft.pays} · partenaire depuis le ${f.draft.date}`}
      mode={f.mode}
      onModeChange={f.setMode}
      onBack={onBack}
      backLabel="Retour aux partenaires"
      onSave={save}
      onDelete={onDelete && !isCreate ? () => onDelete(f.saved) : undefined}
      saving={f.saving}
      dirty={f.dirty}
      headerExtra={
        !isCreate && (
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { label: "Numéros affiliés", value: fmtNum(f.draft.numeros), icon: Hash, color: BLUE },
              { label: "Règles d'affiliation", value: String(myRules.length), icon: Link2, color: PURPLE },
              { label: "Statut", value: f.draft.statut, icon: ShieldCheck, color: f.draft.statut === "Actif" ? GREEN : ORANGE },
            ].map(({ label, value, icon: Icon, color }, i) => (
              <div key={label} className={`kw-in kw-d${i + 1} bg-card rounded-2xl border border-border p-4 flex items-center gap-3`}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}16` }}>
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <div className="min-w-0">
                  <p className="text-lg font-bold text-foreground truncate">{value}</p>
                  <p className="text-xs text-muted-foreground truncate">{label}</p>
                </div>
              </div>
            ))}
          </div>
        )
      }
    >
      <FormCard title="Informations de l'entreprise" icon={Building2}>
        <FieldGrid>
          <Field label="Nom de l'entreprise" value={f.draft.name} onChange={f.set("name")} editable={editable}
            required error={f.errors.name as string} placeholder="MTN Cameroun" />
          <Field label="Type de partenariat" value={f.draft.type} onChange={f.set("type") as never} editable={editable}
            type="select" options={PARTNER_TYPES} required renderRead={<StatusBadge status={f.draft.type} />} />
          <Field label="Pays" value={f.draft.pays} onChange={f.set("pays")} editable={editable}
            type="select" options={countriesData.map(c => c.pays)} required icon={MapPin} error={f.errors.pays as string} />
          <Field label="Statut" value={f.draft.statut} onChange={f.set("statut") as never} editable={editable}
            type="select" options={PARTNER_STATUSES} renderRead={<StatusBadge status={f.draft.statut} dot />} />
        </FieldGrid>
      </FormCard>

      <FormCard title="Contact référent" icon={UserCog}>
        <FieldGrid>
          <Field label="Nom du contact" value={f.draft.contact} onChange={f.set("contact")} editable={editable}
            required error={f.errors.contact as string} placeholder="Diallo Kouyaté" />
          <Field label="Email professionnel" value={f.draft.email} onChange={f.set("email")} editable={editable}
            type="email" required icon={Mail} error={f.errors.email as string} placeholder="contact@entreprise.com" />
          <Field label="Téléphone" value={f.draft.phone} onChange={f.set("phone")} editable={editable}
            type="tel" icon={Phone} placeholder="+237 6XX XXX XXX" mono />
          {!isCreate && <Field label="Date d'adhésion" value={f.draft.date} editable={false} icon={Calendar} />}
        </FieldGrid>
      </FormCard>

      {/* §8.3 — règles d'affiliation rattachées */}
      {!isCreate && (
        <FormCard>
          <SectionHeader title="Règles d'affiliation" desc="Plages de préfixes attribuées à ce partenaire" icon={Link2} />
          {myRules.length === 0 ? (
            <EmptyState icon={Link2} title="Aucune règle d'affiliation"
              desc="Définissez des plages de préfixes depuis le module Numéros." />
          ) : (
            <div className="space-y-2.5">
              {myRules.map(r => (
                <div key={r.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl border border-border bg-secondary/40">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">{r.pays}</p>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {r.prefixes.map(p => (
                        <code key={p} className="text-xs px-2 py-0.5 rounded font-mono"
                          style={{ background: `${BLUE}12`, color: BLUE }}>{p}</code>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{fmtNum(r.numerosConcernes)} numéros</span>
                    <StatusBadge status={r.actif ? "Actif" : "Inactif"} dot />
                  </div>
                </div>
              ))}
            </div>
          )}
        </FormCard>
      )}
    </FormPage>
  );
}

function PartnersSection({ toast, confirm, rules, onSupervise }: { toast: never; confirm: never; rules: AffiliationRule[]; onSupervise?: (partnerName: string) => void; }) {
  const [partners, setPartners] = useState<Partner[]>(partnersData);
  const [page, setPage] = useState<{ mode: FormMode; partner: Partner } | null>(null);

  const t = useDataTable<Partner>(
    partners,
    (p, q, fl) =>
      (!q || p.name.toLowerCase().includes(q) || p.pays.toLowerCase().includes(q) || p.contact.toLowerCase().includes(q)) &&
      (!fl.statut || p.statut === fl.statut) &&
      (!fl.type || p.type === fl.type) &&
      (!fl.pays || p.pays === fl.pays),
    10,
  );

  if (page) {
    return (
      <PartnerFormPage
        partner={page.partner}
        startMode={page.mode}
        rules={rules}
        onBack={() => setPage(null)}
        onSave={p => setPartners(ps => (ps.some(x => x.id === p.id) ? ps.map(x => (x.id === p.id ? p : x)) : [p, ...ps]))}
        onDelete={p => (confirm as never as Function)(
          `Supprimer ${p.name} ?`,
          "Les règles d'affiliation associées seront également supprimées.",
          () => { setPartners(ps => ps.filter(x => x.id !== p.id)); setPage(null); (toast as never as Function)("success", "Partenaire supprimé."); },
          true,
        )}
        toast={toast}
      />
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Partenaires" desc={`${partners.length} entreprises intégrées à la plateforme`}>
        <Btn variant="primary" icon={Plus} onClick={() => setPage({ mode: "create", partner: { ...EMPTY_PARTNER } })}>
          Nouveau partenaire
        </Btn>
      </PageHeader>

      <FilterToolbar
        search={t.search}
        onSearch={t.setSearch}
        placeholder="Nom, pays ou contact…"
        filters={[
          { key: "statut", label: "Statut", options: [...PARTNER_STATUSES] },
          { key: "type", label: "Type", options: [...PARTNER_TYPES] },
          { key: "pays", label: "Pays", options: countriesData.map(c => c.pays) },
        ]}
        values={t.filters}
        onFilterChange={t.setFilters}
        resultCount={t.filtered.length}
        actions={<ExportDropdown onExport={f => (toast as never as Function)("success", `Export ${f.toUpperCase()} généré.`)} />}
      />

      <TableWrapper
        columns={["Partenaire", "Type", "Pays", "Numéros affiliés", "Contact", "Statut", "Actions"]}
        state={t.isEmpty ? "empty" : "success"}
        emptyTitle={t.hasQuery ? "Aucun résultat" : "Aucun partenaire"}
        emptyAction={
          t.hasQuery
            ? <Btn variant="outline" icon={X} onClick={() => { t.setSearch(""); t.setFilters({}); }}>Effacer les filtres</Btn>
            : <Btn variant="primary" icon={Plus} onClick={() => setPage({ mode: "create", partner: { ...EMPTY_PARTNER } })}>Nouveau partenaire</Btn>
        }
        footer={<Pagination total={t.filtered.length} page={t.page} setPage={t.setPage} pageSize={t.pageSize} setPageSize={t.setPageSize} />}
      >
        <tbody className="divide-y divide-border">
          {t.items.map(p => (
            <tr key={p.id} className="kw-row hover:bg-secondary/40">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold text-white text-[11px]"
                    style={{ background: BLUE }}>
                    {p.name.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-foreground truncate">{p.name}</span>
                </div>
              </td>
              <td className="px-4 py-3"><StatusBadge status={p.type} /></td>
              <td className="px-4 py-3 text-sm text-muted-foreground">{p.pays}</td>
              <td className="px-4 py-3 text-sm font-semibold text-foreground tabular-nums">{fmtNum(p.numeros)}</td>
              <td className="px-4 py-3">
                <p className="text-sm text-foreground truncate">{p.contact}</p>
                <p className="text-xs text-muted-foreground truncate">{p.email}</p>
              </td>
              <td className="px-4 py-3"><StatusBadge status={p.statut} dot /></td>
              <td className="px-4 py-3">
                <RowActions>
                  <RowBtn icon={Eye} title="Consulter" tone="primary" onClick={() => setPage({ mode: "view", partner: p })} />
                  <RowBtn icon={Pencil} title="Modifier" tone="warn" onClick={() => setPage({ mode: "edit", partner: p })} />
                  <RowBtn icon={ArrowRight} title="Consulter l'espace partenaire" tone="success"
                    onClick={() => (confirm as never as Function)(
                      `Superviser ${p.name} ?`,
                      "Vous accéderez à l'espace de ce partenaire en lecture. Un bandeau vous permettra d'en sortir.",
                      () => onSupervise?.(p.name),
                      false,
                      "Ouvrir l'espace",
                    )} 
                  />
                  <RowBtn icon={Trash2} title="Supprimer" tone="danger" onClick={() =>
                    (confirm as never as Function)(`Supprimer ${p.name} ?`, "Cette action est irréversible.",
                      () => { setPartners(ps => ps.filter(x => x.id !== p.id)); (toast as never as Function)("success", "Partenaire supprimé."); }, true)} />
                </RowActions>
              </td>
            </tr>
          ))}
        </tbody>
      </TableWrapper>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   §8.4 — NUMÉROS & AFFILIATION
   ═══════════════════════════════════════════════════════════════════════════ */
const EMPTY_NUMBER: PhoneNumber = {
  id: 0, num: "", op: "", pays: "", score: 50, statut: "Sécurisé",
  partenaire: "—", compte: null, verif: "",
};

function NumberHistoryModal({
  number, open, onClose,
}: { number: PhoneNumber | null; open: boolean; onClose: () => void }) {
  if (!number) return null;

  const events = [
    { date: number.verif, label: "Dernière analyse automatique", detail: `Score recalculé : ${number.score}/100`, color: BLUE },
    { date: "21/07/2026 16:22", label: "Changement de statut", detail: `Statut porté à « ${number.statut} »`, color: ORANGE },
    { date: "20/07/2026 11:47", label: "Signalement communautaire", detail: "3 signalements reçus en 24 h", color: RED },
    { date: "18/07/2026 09:15", label: "Affiliation", detail: `Rattaché à ${number.partenaire}`, color: PURPLE },
    { date: "15/07/2026 08:00", label: "Première vérification", detail: "Numéro ajouté à la base", color: GREEN },
  ];

  return (
    <Modal open={open} onClose={onClose} title={`Historique — ${number.num}`}
      desc="Événements enregistrés sur ce numéro" size="lg"
      footer={<Btn variant="outline" onClick={onClose}>Fermer</Btn>}>
      <div className="relative pl-6">
        <span className="absolute left-[7px] top-2 bottom-2 w-px" style={{ background: "var(--border)" }} />
        {events.map((e, i) => (
          <div key={i} className={`kw-in kw-d${Math.min(i + 1, 8)} relative pb-6 last:pb-0`}>
            <span className="absolute -left-[23px] top-1 w-3.5 h-3.5 rounded-full border-2 border-card"
              style={{ background: e.color }} />
            <p className="text-xs text-muted-foreground">{e.date}</p>
            <p className="text-sm font-semibold text-foreground mt-0.5">{e.label}</p>
            <p className="text-sm text-muted-foreground mt-0.5">{e.detail}</p>
          </div>
        ))}
      </div>
    </Modal>
  );
}

function NumberFormPage({
  item, startMode, onBack, onSave, onDelete, toast,
}: {
  item: PhoneNumber; startMode: FormMode; onBack: () => void;
  onSave: (n: PhoneNumber) => void; onDelete?: (n: PhoneNumber) => void; toast: never;
}) {
  const f = useFormState<PhoneNumber>(item, startMode);
  const isCreate = f.mode === "create";
  const editable = f.mode !== "view";
  const [historyOpen, setHistoryOpen] = useState(false);

  const allOperators = useMemo(
    () => Array.from(new Set(countriesData.flatMap(c => c.operateurs.map(o => o.nom.split(" ")[0])))),
    [],
  );

  const validate = () => {
    const e: Record<string, string> = {};
    if (!f.draft.num.trim()) e.num = "Le numéro est requis.";
    if (!f.draft.pays) e.pays = "Le pays est requis.";
    if (!f.draft.op) e.op = "L'opérateur est requis.";
    const s = Number(f.draft.score);
    if (Number.isNaN(s) || s < 0 || s > 100) e.score = "Le score doit être compris entre 0 et 100.";
    f.setErrors(e as never);
    return Object.keys(e).length === 0;
  };

  const save = async () => {
    if (!validate()) { (toast as never as Function)("error", "Corrigez les champs en erreur."); return; }
    f.setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    f.setSaving(false);
    const payload: PhoneNumber = isCreate
      ? { ...f.draft, id: nextId(), score: Number(f.draft.score), verif: new Date().toLocaleString("fr-FR") }
      : { ...f.draft, score: Number(f.draft.score) };
    onSave(payload);
    f.commit(payload);
    (toast as never as Function)("success", isCreate ? "Numéro ajouté." : "Numéro mis à jour.");
    if (isCreate) onBack();
  };

  return (
    <FormPage
      title={isCreate ? "Nouveau numéro" : f.draft.num}
      desc={isCreate ? "Renseignez les informations du numéro à surveiller." : `${f.draft.op} · ${f.draft.pays} · dernière vérification ${f.draft.verif}`}
      mode={f.mode}
      onModeChange={f.setMode}
      onBack={onBack}
      backLabel="Retour aux numéros"
      onSave={save}
      onDelete={onDelete && !isCreate ? () => onDelete(f.saved) : undefined}
      saving={f.saving}
      dirty={f.dirty}
      headerExtra={
        !isCreate && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-card rounded-2xl border border-border p-5">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${BLUE}12` }}>
              <Phone className="w-6 h-6" style={{ color: BLUE }} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-mono font-semibold text-foreground text-lg truncate">{f.draft.num}</p>
              <p className="text-sm text-muted-foreground truncate">
                {f.draft.compte ? `Rattaché à ${f.draft.compte}` : "Aucun compte propriétaire"}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <ScoreBadge score={Number(f.draft.score)} />
              <StatusBadge status={f.draft.statut} dot />
            </div>
          </div>
        )
      }
      footerExtra={
        !isCreate && (
          <div className="flex flex-wrap gap-2">
            <Btn variant="outline" icon={RefreshCw} onClick={() => (toast as never as Function)("info", "Réanalyse lancée.")}>
              Forcer une réanalyse
            </Btn>
            <Btn variant="outline" icon={FileText} onClick={() => setHistoryOpen(true)}>
              Consulter l'historique
            </Btn>
          </div>
        )
      }
    >
      <FormCard title="Identification" icon={Smartphone}>
        <FieldGrid>
          <Field label="Numéro" value={f.draft.num} onChange={f.set("num")} editable={editable}
            required mono icon={Phone} error={f.errors.num as string} placeholder="+237 6XX XXX XXX" />
          <Field label="Opérateur" value={f.draft.op} onChange={f.set("op")} editable={editable}
            type="select" options={allOperators} required error={f.errors.op as string} />
          <Field label="Pays" value={f.draft.pays} onChange={f.set("pays")} editable={editable}
            type="select" options={countriesData.map(c => c.pays)} required icon={MapPin} error={f.errors.pays as string} />
          <Field label="Compte propriétaire" value={f.draft.compte ?? ""} onChange={v => f.set("compte")(v || null as never)}
            editable={editable} type="select" options={allUsers.map(u => u.email)} icon={Mail}
            hint={editable ? "Laissez vide si le numéro n'appartient à aucun compte." : undefined}
            renderRead={
              f.draft.compte
                ? <span className="text-sm text-foreground truncate">{f.draft.compte}</span>
                : <span className="text-sm text-muted-foreground italic">Aucun compte</span>
            } />
        </FieldGrid>
      </FormCard>

      <FormCard title="Analyse de risque" icon={ShieldCheck}>
        <FieldGrid>
          <Field label="Score de risque (0–100)" value={String(f.draft.score)} onChange={f.set("score") as never}
            editable={editable} type="number" error={f.errors.score as string}
            renderRead={<ScoreBadge score={Number(f.draft.score)} />} />
          <Field label="Statut" value={f.draft.statut} onChange={f.set("statut") as never} editable={editable}
            type="select" options={NUMBER_RISK_STATUSES} renderRead={<StatusBadge status={f.draft.statut} dot />} />
          <Field label="Partenaire affilié" value={f.draft.partenaire} onChange={f.set("partenaire")} editable={editable}
            type="select" options={["—", ...partnersData.map(p => p.name)]} icon={Briefcase}
            hint={editable ? "L'affiliation est normalement déduite des règles de préfixes." : undefined} />
          {!isCreate && <Field label="Dernière vérification" value={f.draft.verif} editable={false} icon={Calendar} />}
        </FieldGrid>
      </FormCard>

      <NumberHistoryModal number={f.saved} open={historyOpen} onClose={() => setHistoryOpen(false)} />
    </FormPage>
  );
}

/** Éditeur de règles d'affiliation (§8.4) */
function AffiliationRulesPanel({
  rules, setRules, toast, confirm,
}: {
  rules: AffiliationRule[];
  setRules: React.Dispatch<React.SetStateAction<AffiliationRule[]>>;
  toast: never; confirm: never;
}) {
  const [editing, setEditing] = useState<AffiliationRule | null>(null);
  const [draft, setDraft] = useState({ partenaire: "", pays: "", prefixes: "" });
  const overlaps = useMemo(() => detectOverlaps(rules), [rules]);

  const open = (r?: AffiliationRule) => {
    if (r) { setEditing(r); setDraft({ partenaire: r.partenaire, pays: r.pays, prefixes: r.prefixes.join(", ") }); }
    else { setEditing({ ...({} as AffiliationRule), id: 0 }); setDraft({ partenaire: "", pays: "", prefixes: "" }); }
  };

  const parsePrefixes = (s: string) =>
    s.split(",").map(x => x.trim()).filter(Boolean);

  const preview = useMemo(() => {
    const list = parsePrefixes(draft.prefixes);
    if (!list.length || !draft.pays) return 0;
    return numbersData.filter(n => {
      if (n.pays !== draft.pays) return false;
      const digits = n.num.replace(/[^\d]/g, "").slice(-9);
      return list.some(p => {
        const [a, b] = p.split("-");
        if (b) {
          const v = parseInt(digits.slice(0, a.length), 10);
          return v >= parseInt(a, 10) && v <= parseInt(b, 10);
        }
        return digits.startsWith(a);
      });
    }).length;
  }, [draft]);

  const save = () => {
    const list = parsePrefixes(draft.prefixes);
    if (!draft.partenaire || !draft.pays || !list.length) {
      (toast as never as Function)("error", "Partenaire, pays et préfixes sont requis.");
      return;
    }
    if (editing && editing.id) {
      setRules(rs => rs.map(r => (r.id === editing.id ? { ...r, partenaire: draft.partenaire, pays: draft.pays, prefixes: list } : r)));
      (toast as never as Function)("success", "Règle mise à jour.");
    } else {
      setRules(rs => [...rs, { id: nextId(), partenaire: draft.partenaire, pays: draft.pays, prefixes: list, numerosConcernes: preview, actif: true }]);
      (toast as never as Function)("success", "Règle créée.");
    }
    setEditing(null);
  };

  return (
    <div className="space-y-4">
      {overlaps.length > 0 && (
        <Callout tone="warn" title="Chevauchement de préfixes détecté" icon={AlertTriangle}>
          {overlaps.map((o, i) => (
            <p key={i}>
              Le préfixe <strong>{o.prefix}</strong> est revendiqué par <strong>{o.a.partenaire}</strong> et <strong>{o.b.partenaire}</strong> en {o.a.pays}.
            </p>
          ))}
        </Callout>
      )}

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <SectionHeader title="Règles d'affiliation" desc="Un numéro est rattaché au partenaire dont il satisfait une plage de préfixes" icon={Link2}>
            <Btn variant="primary" size="sm" icon={Plus} onClick={() => open()}>Nouvelle règle</Btn>
          </SectionHeader>
        </div>

        {rules.length === 0 ? (
          <EmptyState icon={Link2} title="Aucune règle définie"
            desc="Créez une règle pour rattacher automatiquement des numéros à un partenaire."
            action={<Btn variant="primary" icon={Plus} onClick={() => open()}>Nouvelle règle</Btn>} />
        ) : (
          <div className="divide-y divide-border">
            {rules.map(r => (
              <div key={r.id} className="flex flex-col lg:flex-row lg:items-center gap-3 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-foreground">{r.partenaire}</p>
                    <span className="text-xs text-muted-foreground">·</span>
                    <p className="text-sm text-muted-foreground">{r.pays}</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {r.prefixes.map(p => (
                      <code key={p} className="text-xs px-2 py-0.5 rounded font-mono"
                        style={{ background: `${BLUE}12`, color: BLUE }}>{p}</code>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-muted-foreground whitespace-nowrap tabular-nums">
                    {fmtNum(r.numerosConcernes)} numéros
                  </span>
                  <StatusBadge status={r.actif ? "Actif" : "Inactif"} dot />
                  <RowActions>
                    <RowBtn icon={Pencil} title="Modifier" tone="warn" onClick={() => open(r)} />
                    <RowBtn icon={Trash2} title="Supprimer" tone="danger" onClick={() =>
                      (confirm as never as Function)("Supprimer cette règle ?",
                        `Les numéros de ${r.pays} ne seront plus rattachés à ${r.partenaire}.`,
                        () => { setRules(rs => rs.filter(x => x.id !== r.id)); (toast as never as Function)("success", "Règle supprimée."); }, true)} />
                  </RowActions>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id ? "Modifier la règle" : "Nouvelle règle d'affiliation"}
        desc="Les numéros correspondants seront automatiquement rattachés."
        footer={
          <>
            <Btn variant="outline" onClick={() => setEditing(null)}>Annuler</Btn>
            <Btn variant="primary" icon={Check} onClick={save}>{editing?.id ? "Enregistrer" : "Créer"}</Btn>
          </>
        }
      >
        <FieldGrid cols={1}>
          <Field label="Partenaire" value={draft.partenaire} onChange={v => setDraft(d => ({ ...d, partenaire: v }))}
            editable type="select" options={partnersData.map(p => p.name)} required icon={Briefcase} />
          <Field label="Pays" value={draft.pays} onChange={v => setDraft(d => ({ ...d, pays: v }))}
            editable type="select" options={countriesData.map(c => c.pays)} required icon={MapPin} />
          <Field label="Préfixes" value={draft.prefixes} onChange={v => setDraft(d => ({ ...d, prefixes: v }))}
            editable mono required placeholder="69, 651-654, 68"
            hint="Valeurs simples ou plages, séparées par des virgules." />
        </FieldGrid>

        <div className="mt-4">
          <Callout tone="info" title="Aperçu en direct">
            <strong>{preview}</strong> numéro{preview !== 1 ? "s" : ""} de la base correspond{preview !== 1 ? "ent" : ""} à ces préfixes.
          </Callout>
        </div>
      </Modal>
    </div>
  );
}

function NumbersSection({
  toast, confirm, rules, setRules,
}: {
  toast: never; confirm: never;
  rules: AffiliationRule[]; setRules: React.Dispatch<React.SetStateAction<AffiliationRule[]>>;
}) {
  const [nums, setNums] = useState<PhoneNumber[]>(numbersData);
  const [tab, setTab] = useState<"Numéros" | "Affiliation">("Numéros");
  const [page, setPage] = useState<{ mode: FormMode; item: PhoneNumber } | null>(null);

  const t = useDataTable<PhoneNumber>(
    nums,
    (n, q, fl) =>
      (!q || n.num.replace(/\s/g, "").includes(q.replace(/\s/g, "")) || n.op.toLowerCase().includes(q) || (n.compte ?? "").toLowerCase().includes(q)) &&
      (!fl.statut || n.statut === fl.statut) &&
      (!fl.op || n.op === fl.op) &&
      (!fl.pays || n.pays === fl.pays) &&
      (!fl.partenaire || n.partenaire === fl.partenaire),
    10,
  );

  if (page) {
    return (
      <NumberFormPage
        item={page.item}
        startMode={page.mode}
        onBack={() => setPage(null)}
        onSave={n => setNums(ns => (ns.some(x => x.id === n.id) ? ns.map(x => (x.id === n.id ? n : x)) : [n, ...ns]))}
        onDelete={n => (confirm as never as Function)(`Supprimer ${n.num} ?`, "Cette action est irréversible.",
          () => { setNums(ns => ns.filter(x => x.id !== n.id)); setPage(null); (toast as never as Function)("success", "Numéro supprimé."); }, true)}
        toast={toast}
      />
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Numéros" desc={`${nums.length} numéros analysés · affiliation par plages de préfixes`}>
        <Btn variant="primary" icon={Plus} onClick={() => setPage({ mode: "create", item: { ...EMPTY_NUMBER } })}>
          Nouveau numéro
        </Btn>
      </PageHeader>

      <SegmentedControl options={["Numéros", "Affiliation"] as const} value={tab} onChange={setTab} />

      {tab === "Affiliation" ? (
        <AffiliationRulesPanel rules={rules} setRules={setRules} toast={toast} confirm={confirm} />
      ) : (
        <>
          <FilterToolbar
            search={t.search}
            onSearch={t.setSearch}
            placeholder="Numéro, opérateur ou compte…"
            filters={[
              { key: "statut", label: "Statut", options: [...NUMBER_RISK_STATUSES] },
              { key: "op", label: "Opérateur", options: Array.from(new Set(nums.map(n => n.op))) },
              { key: "pays", label: "Pays", options: countriesData.map(c => c.pays) },
              { key: "partenaire", label: "Partenaire", options: partnersData.map(p => p.name) },
            ]}
            values={t.filters}
            onFilterChange={t.setFilters}
            resultCount={t.filtered.length}
            actions={<ExportDropdown onExport={f => (toast as never as Function)("success", `Export ${f.toUpperCase()} généré.`)} />}
          />

          <TableWrapper
            columns={["Numéro", "Opérateur", "Pays", "Score", "Statut", "Partenaire", "Compte", "Actions"]}
            state={t.isEmpty ? "empty" : "success"}
            emptyTitle={t.hasQuery ? "Aucun résultat" : "Aucun numéro"}
            emptyAction={
              t.hasQuery
                ? <Btn variant="outline" icon={X} onClick={() => { t.setSearch(""); t.setFilters({}); }}>Effacer les filtres</Btn>
                : <Btn variant="primary" icon={Plus} onClick={() => setPage({ mode: "create", item: { ...EMPTY_NUMBER } })}>Nouveau numéro</Btn>
            }
            footer={<Pagination total={t.filtered.length} page={t.page} setPage={t.setPage} pageSize={t.pageSize} setPageSize={t.setPageSize} />}
          >
            <tbody className="divide-y divide-border">
              {t.items.map(n => (
                <tr key={n.id} className="kw-row hover:bg-secondary/40">
                  <td className="px-4 py-3 font-mono text-sm text-foreground whitespace-nowrap">{n.num}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{n.op}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{n.pays}</td>
                  <td className="px-4 py-3"><ScoreBadge score={n.score} /></td>
                  <td className="px-4 py-3"><StatusBadge status={n.statut} dot /></td>
                  <td className="px-4 py-3 text-sm text-muted-foreground truncate max-w-[160px]">{n.partenaire}</td>
                  <td className="px-4 py-3 text-sm truncate max-w-[180px]">
                    {n.compte
                      ? <span className="text-muted-foreground">{n.compte}</span>
                      : <span className="text-muted-foreground/50 italic text-xs">Aucun</span>}
                  </td>
                  <td className="px-4 py-3">
                    <RowActions>
                      <RowBtn icon={Eye} title="Consulter" tone="primary" onClick={() => setPage({ mode: "view", item: n })} />
                      <RowBtn icon={Pencil} title="Modifier" tone="warn" onClick={() => setPage({ mode: "edit", item: n })} />
                      <RowBtn icon={RefreshCw} title="Forcer une réanalyse" tone="success"
                        onClick={() => (toast as never as Function)("info", `Réanalyse lancée pour ${n.num}.`)} />
                      <RowBtn icon={Trash2} title="Supprimer" tone="danger" onClick={() =>
                        (confirm as never as Function)(`Supprimer ${n.num} ?`, "Cette action est irréversible.",
                          () => { setNums(ns => ns.filter(x => x.id !== n.id)); (toast as never as Function)("success", "Numéro supprimé."); }, true)} />
                    </RowActions>
                  </td>
                </tr>
              ))}
            </tbody>
          </TableWrapper>
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   §8.5 — PAYS / OPÉRATEURS / CODES USSD
   ═══════════════════════════════════════════════════════════════════════════ */
type EditTarget =
  | { kind: "country"; data: Partial<Country> }
  | { kind: "operator"; data: Partial<Operator>; countryId: number }
  | { kind: "ussd"; data: Partial<UssdAction>; countryId: number; operatorId: number };

function CountriesSection({ toast, confirm }: { toast: never; confirm: never }) {
  const [countries, setCountries] = useState<Country[]>(countriesData);
  const [selCountry, setSelCountry] = useState<number>(countriesData[0]?.id ?? 0);
  const [selOperator, setSelOperator] = useState<number>(countriesData[0]?.operateurs[0]?.id ?? 0);
  const [edit, setEdit] = useState<EditTarget | null>(null);
  const [draft, setDraft] = useState<Record<string, string>>({});

  const country = countries.find(c => c.id === selCountry) ?? null;
  const operator = country?.operateurs.find(o => o.id === selOperator) ?? null;

  const openCountry = (c?: Country) => {
    setEdit({ kind: "country", data: c ?? {} });
    setDraft({ pays: c?.pays ?? "", code: c?.code ?? "", indicatif: c?.indicatif ?? "", isDefault: String(c?.isDefault ?? false) });
  };

  const openOperator = (o?: Operator) => {
    if (!country) return;
    setEdit({ kind: "operator", data: o ?? {}, countryId: country.id });
    setDraft({ nom: o?.nom ?? "", prefixes: o?.prefixes.join(", ") ?? "" });
  };

  const openUssd = (u?: UssdAction) => {
    if (!country || !operator) return;
    setEdit({ kind: "ussd", data: u ?? {}, countryId: country.id, operatorId: operator.id });
    setDraft({ label: u?.label ?? "", code: u?.code ?? "" });
  };

  const save = () => {
    if (!edit) return;

    if (edit.kind === "country") {
      if (!draft.pays?.trim() || !draft.indicatif?.trim()) {
        (toast as never as Function)("error", "Le nom et l'indicatif sont requis."); return;
      }
      const isDefault = draft.isDefault === "true";
      if (edit.data.id) {
        setCountries(cs => cs.map(c => {
          if (c.id === edit.data.id) return { ...c, pays: draft.pays, code: draft.code.toUpperCase(), indicatif: draft.indicatif, isDefault };
          return isDefault ? { ...c, isDefault: false } : c;
        }));
        (toast as never as Function)("success", "Pays mis à jour.");
      } else {
        const nc: Country = { id: nextId(), pays: draft.pays, code: draft.code.toUpperCase(), indicatif: draft.indicatif, isDefault, operateurs: [] };
        setCountries(cs => [...(isDefault ? cs.map(c => ({ ...c, isDefault: false })) : cs), nc]);
        setSelCountry(nc.id);
        (toast as never as Function)("success", "Pays ajouté.");
      }
    }

    if (edit.kind === "operator") {
      if (!draft.nom?.trim()) { (toast as never as Function)("error", "Le nom de l'opérateur est requis."); return; }
      const prefixes = draft.prefixes.split(",").map(s => s.trim()).filter(Boolean);
      setCountries(cs => cs.map(c => {
        if (c.id !== edit.countryId) return c;
        if (edit.data.id) {
          return { ...c, operateurs: c.operateurs.map(o => (o.id === edit.data.id ? { ...o, nom: draft.nom, prefixes } : o)) };
        }
        const no: Operator = { id: nextId(), nom: draft.nom, prefixes, ussd: [] };
        setSelOperator(no.id);
        return { ...c, operateurs: [...c.operateurs, no] };
      }));
      (toast as never as Function)("success", edit.data.id ? "Opérateur mis à jour." : "Opérateur ajouté.");
    }

    if (edit.kind === "ussd") {
      if (!draft.label?.trim() || !draft.code?.trim()) {
        (toast as never as Function)("error", "Le libellé et le code sont requis."); return;
      }
      setCountries(cs => cs.map(c => {
        if (c.id !== edit.countryId) return c;
        return {
          ...c,
          operateurs: c.operateurs.map(o => {
            if (o.id !== edit.operatorId) return o;
            if (edit.data.id) {
              return { ...o, ussd: o.ussd.map(u => (u.id === edit.data.id ? { ...u, label: draft.label, code: draft.code } : u)) };
            }
            return { ...o, ussd: [...o.ussd, { id: nextId(), label: draft.label, code: draft.code }] };
          }),
        };
      }));
      (toast as never as Function)("success", edit.data.id ? "Code USSD mis à jour." : "Code USSD ajouté.");
    }

    setEdit(null);
  };

  const delCountry = (c: Country) => (confirm as never as Function)(
    `Supprimer ${c.pays} ?`, `${c.operateurs.length} opérateur(s) et leurs codes USSD seront supprimés.`,
    () => {
      setCountries(cs => cs.filter(x => x.id !== c.id));
      if (selCountry === c.id) setSelCountry(countries.find(x => x.id !== c.id)?.id ?? 0);
      (toast as never as Function)("success", "Pays supprimé.");
    }, true,
  );

  const delOperator = (o: Operator) => (confirm as never as Function)(
    `Supprimer ${o.nom} ?`, `${o.ussd.length} code(s) USSD seront supprimés.`,
    () => {
      setCountries(cs => cs.map(c => (c.id === selCountry ? { ...c, operateurs: c.operateurs.filter(x => x.id !== o.id) } : c)));
      if (selOperator === o.id) setSelOperator(0);
      (toast as never as Function)("success", "Opérateur supprimé.");
    }, true,
  );

  const delUssd = (u: UssdAction) => (confirm as never as Function)(
    `Supprimer « ${u.label} » ?`, "Ce code USSD sera définitivement retiré.",
    () => {
      setCountries(cs => cs.map(c => (c.id !== selCountry ? c : {
        ...c,
        operateurs: c.operateurs.map(o => (o.id !== selOperator ? o : { ...o, ussd: o.ussd.filter(x => x.id !== u.id) })),
      })));
      (toast as never as Function)("success", "Code USSD supprimé.");
    }, true,
  );

  const modalTitle =
    !edit ? ""
    : edit.kind === "country" ? (edit.data.id ? "Modifier le pays" : "Ajouter un pays")
    : edit.kind === "operator" ? (edit.data.id ? "Modifier l'opérateur" : "Ajouter un opérateur")
    : (edit.data.id ? "Modifier le code USSD" : "Ajouter un code USSD");

  return (
    <div className="space-y-5">
      <PageHeader title="Pays et codes USSD" desc="Hiérarchie Pays → Opérateurs → Actions USSD">
        <Btn variant="primary" icon={Plus} onClick={() => openCountry()}>Nouveau pays</Btn>
      </PageHeader>

      <Callout tone="info" title="Navigation en arborescence">
        Sélectionnez un pays pour afficher ses opérateurs, puis un opérateur pour gérer ses codes USSD.
      </Callout>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Colonne 1 — Pays */}
        <TreeColumn title="Pays" count={countries.length} onAdd={() => openCountry()} addLabel="Ajouter un pays">
          {countries.length === 0 ? (
            <EmptyState icon={Globe} title="Aucun pays" desc="Ajoutez le premier pays." />
          ) : countries.map(c => (
            <TreeItem
              key={c.id}
              label={c.pays}
              sub={`${c.indicatif} · ${c.operateurs.length} opérateur${c.operateurs.length !== 1 ? "s" : ""}`}
              active={c.id === selCountry}
              onClick={() => { setSelCountry(c.id); setSelOperator(c.operateurs[0]?.id ?? 0); }}
              onEdit={() => openCountry(c)}
              onDelete={() => delCountry(c)}
              badge={c.isDefault
                ? <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0"
                    style={{ background: `${GREEN}18`, color: GREEN }}>Défaut</span>
                : undefined}
            />
          ))}
        </TreeColumn>

        {/* Colonne 2 — Opérateurs */}
        <TreeColumn
          title="Opérateurs"
          count={country?.operateurs.length}
          onAdd={country ? () => openOperator() : undefined}
          addLabel="Ajouter un opérateur"
          active={!!country}
        >
          {!country ? (
            <EmptyState icon={Radio} title="Sélectionnez un pays" />
          ) : country.operateurs.length === 0 ? (
            <EmptyState icon={Radio} title="Aucun opérateur"
              desc={`Ajoutez un opérateur pour ${country.pays}.`}
              action={<Btn variant="outline" size="sm" icon={Plus} onClick={() => openOperator()}>Ajouter</Btn>} />
          ) : country.operateurs.map(o => (
            <TreeItem
              key={o.id}
              label={o.nom}
              sub={`Préfixes ${o.prefixes.join(", ") || "—"} · ${o.ussd.length} code${o.ussd.length !== 1 ? "s" : ""}`}
              active={o.id === selOperator}
              onClick={() => setSelOperator(o.id)}
              onEdit={() => openOperator(o)}
              onDelete={() => delOperator(o)}
            />
          ))}
        </TreeColumn>

        {/* Colonne 3 — Codes USSD */}
        <TreeColumn
          title="Actions USSD"
          count={operator?.ussd.length}
          onAdd={operator ? () => openUssd() : undefined}
          addLabel="Ajouter un code USSD"
          active={!!operator}
        >
          {!operator ? (
            <EmptyState icon={KeyRound} title="Sélectionnez un opérateur" />
          ) : operator.ussd.length === 0 ? (
            <EmptyState icon={KeyRound} title="Aucun code USSD"
              desc={`Ajoutez une action pour ${operator.nom}.`}
              action={<Btn variant="outline" size="sm" icon={Plus} onClick={() => openUssd()}>Ajouter</Btn>} />
          ) : operator.ussd.map(u => (
            <div key={u.id} className="group px-4 py-3 border-b border-border last:border-b-0 hover:bg-secondary/60 kw-row">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">{u.label}</p>
                  <code className="inline-block mt-1.5 text-xs px-2 py-1 rounded font-mono break-all"
                    style={{ background: `${BLUE}10`, color: BLUE }}>{u.code}</code>
                  <p className="text-[11px] text-muted-foreground mt-1.5 font-mono truncate">
                    Aperçu : {previewUssd(u.code)}
                  </p>
                </div>
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity shrink-0">
                  <RowBtn icon={Pencil} title="Modifier" tone="warn" onClick={() => openUssd(u)} />
                  <RowBtn icon={Trash2} title="Supprimer" tone="danger" onClick={() => delUssd(u)} />
                </div>
              </div>
            </div>
          ))}
        </TreeColumn>
      </div>

      <Modal
        open={!!edit}
        onClose={() => setEdit(null)}
        title={modalTitle}
        footer={
          <>
            <Btn variant="outline" onClick={() => setEdit(null)}>Annuler</Btn>
            <Btn variant="primary" icon={Check} onClick={save}>Enregistrer</Btn>
          </>
        }
      >
        {edit?.kind === "country" && (
          <FieldGrid cols={1}>
            <Field label="Nom du pays" value={draft.pays ?? ""} onChange={v => setDraft(d => ({ ...d, pays: v }))}
              editable required icon={Globe} placeholder="Cameroun" />
            <Field label="Code ISO" value={draft.code ?? ""} onChange={v => setDraft(d => ({ ...d, code: v }))}
              editable mono placeholder="CM" hint="Code à deux lettres." />
            <Field label="Indicatif" value={draft.indicatif ?? ""} onChange={v => setDraft(d => ({ ...d, indicatif: v }))}
              editable required mono placeholder="+237" />
            <Field label="Pays par défaut" value={draft.isDefault === "true" ? "Oui" : "Non"}
              onChange={v => setDraft(d => ({ ...d, isDefault: String(v === "Oui") }))}
              editable type="select" options={["Oui", "Non"]}
              hint="Un seul pays peut être défini par défaut." />
          </FieldGrid>
        )}

        {edit?.kind === "operator" && (
          <FieldGrid cols={1}>
            <Field label="Nom de l'opérateur" value={draft.nom ?? ""} onChange={v => setDraft(d => ({ ...d, nom: v }))}
              editable required icon={Radio} placeholder="MTN Cameroun" />
            <Field label="Préfixes" value={draft.prefixes ?? ""} onChange={v => setDraft(d => ({ ...d, prefixes: v }))}
              editable mono placeholder="67, 68, 650-654"
              hint="Valeurs simples ou plages, séparées par des virgules." />
          </FieldGrid>
        )}

        {edit?.kind === "ussd" && (
          <>
            <FieldGrid cols={1}>
              <Field label="Nom de l'action" value={draft.label ?? ""} onChange={v => setDraft(d => ({ ...d, label: v }))}
                editable required icon={KeyRound} placeholder="Transfert" />
              <Field label="Format du code USSD" value={draft.code ?? ""} onChange={v => setDraft(d => ({ ...d, code: v }))}
                editable required mono placeholder="*126*{numero}*{montant}#"
                hint="Jetons disponibles : {numero}, {montant}, {code}" />
            </FieldGrid>
            {draft.code && (
              <div className="mt-4">
                <Callout tone="info" title="Prévisualisation">
                  <code className="font-mono text-foreground">{previewUssd(draft.code)}</code>
                </Callout>
              </div>
            )}
          </>
        )}
      </Modal>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   §8.6 — DROITS D'ACCÈS
   ═══════════════════════════════════════════════════════════════════════════ */
function AccessSection({ toast, confirm }: { toast: never; confirm: never }) {
  const [roles, setRoles] = useState<Role[]>(rolesData);
  const [activeId, setActiveId] = useState<number>(rolesData[0]?.id ?? 0);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [roleModal, setRoleModal] = useState<Role | null>(null);
  const [roleDraft, setRoleDraft] = useState({ role: "", desc: "", color: ROLE_COLORS[0] });
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignUser, setAssignUser] = useState("");

  const active = roles.find(r => r.id === activeId) ?? roles[0];

  const toggle = (modId: string, actId: string) => {
    setRoles(rs => rs.map(r =>
      r.id !== activeId ? r : {
        ...r,
        perms: { ...r.perms, [modId]: { ...r.perms[modId], [actId]: !r.perms[modId]?.[actId] } },
      }));
    setDirty(true);
  };

  const toggleModule = (modId: string, value: boolean) => {
    setRoles(rs => rs.map(r => {
      if (r.id !== activeId) return r;
      const mod = permModules.find(m => m.id === modId);
      if (!mod) return r;
      const next: Record<string, boolean> = {};
      for (const a of mod.actions) next[a.id] = value;
      return { ...r, perms: { ...r.perms, [modId]: next } };
    }));
    setDirty(true);
  };

  const save = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 700));
    setSaving(false);
    setDirty(false);
    (toast as never as Function)("success", `Droits du rôle « ${active?.role} » enregistrés.`);
  };

  const openRole = (r?: Role) => {
    setRoleModal(r ?? ({ id: 0 } as Role));
    setRoleDraft({ role: r?.role ?? "", desc: r?.desc ?? "", color: r?.color ?? ROLE_COLORS[0] });
  };

  const saveRole = () => {
    if (!roleDraft.role.trim()) { (toast as never as Function)("error", "Le nom du rôle est requis."); return; }
    if (roleModal?.id) {
      setRoles(rs => rs.map(r => (r.id === roleModal.id ? { ...r, role: roleDraft.role, desc: roleDraft.desc, color: roleDraft.color } : r)));
      (toast as never as Function)("success", "Rôle mis à jour.");
    } else {
      const nr: Role = {
        id: nextId(), role: roleDraft.role, desc: roleDraft.desc || "Rôle personnalisé",
        color: roleDraft.color, systeme: false, count: 0, perms: buildPerms(false),
      };
      setRoles(rs => [...rs, nr]);
      setActiveId(nr.id);
      (toast as never as Function)("success", `Rôle « ${nr.role} » créé. Définissez ses permissions.`);
    }
    setRoleModal(null);
  };

  const delRole = (r: Role) => (confirm as never as Function)(
    `Supprimer le rôle « ${r.role} » ?`,
    r.count > 0
      ? `${r.count} utilisateur(s) devront être réaffectés à un autre rôle.`
      : "Ce rôle n'est attribué à aucun utilisateur.",
    () => {
      setRoles(rs => rs.filter(x => x.id !== r.id));
      if (activeId === r.id) setActiveId(roles.find(x => x.id !== r.id)?.id ?? 0);
      (toast as never as Function)("success", "Rôle supprimé.");
    }, true,
  );

  const assign = () => {
    if (!assignUser) return;
    setRoles(rs => rs.map(r => (r.id === activeId ? { ...r, count: r.count + 1 } : r)));
    (toast as never as Function)("success", `${assignUser} rattaché au rôle « ${active?.role} ».`);
    setAssignOpen(false);
    setAssignUser("");
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Droits d'accès" desc="Rôles et matrice de permissions par module">
        <Btn variant="outline" icon={Plus} onClick={() => openRole()}>Nouveau rôle</Btn>
        <Btn variant="primary" icon={Check} onClick={save} loading={saving} disabled={!dirty}>
          Enregistrer
        </Btn>
      </PageHeader>

      {/* Liste des rôles */}
      <div>
        <SectionHeader title="Rôles" desc="Sélectionnez un rôle pour éditer ses permissions" icon={UserCog}>
          <Btn variant="ghost" size="sm" icon={Plus} onClick={() => openRole()}>Ajouter</Btn>
        </SectionHeader>
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {roles.map(r => (
            <RoleCard
              key={r.id}
              role={r}
              active={r.id === activeId}
              onClick={() => setActiveId(r.id)}
              onEdit={!r.systeme ? () => openRole(r) : undefined}
              onDelete={!r.systeme ? () => delRole(r) : undefined}
            />
          ))}
        </div>
      </div>

      {/* Matrice */}
      {active && (
        <div className="space-y-4">
          <SectionHeader
            title={`Permissions — ${active.role}`}
            desc={active.systeme ? "Rôle système : les permissions restent modifiables, pas le rôle lui-même." : active.desc}
            icon={ShieldCheck}
          >
            <Btn variant="outline" size="sm" icon={Users} onClick={() => setAssignOpen(true)}>
              Rattacher un utilisateur
            </Btn>
          </SectionHeader>

          {dirty && (
            <Callout tone="warn" title="Modifications non enregistrées">
              Cliquez sur « Enregistrer » pour appliquer les changements de permissions.
            </Callout>
          )}

          <PermissionMatrix
            modules={permModules}
            perms={active.perms}
            onToggle={toggle}
            onToggleModule={toggleModule}
          />
        </div>
      )}

      {/* Modale rôle */}
      <Modal
        open={!!roleModal}
        onClose={() => setRoleModal(null)}
        title={roleModal?.id ? "Modifier le rôle" : "Nouveau rôle"}
        desc={roleModal?.id ? undefined : "Le rôle sera créé sans aucune permission."}
        footer={
          <>
            <Btn variant="outline" onClick={() => setRoleModal(null)}>Annuler</Btn>
            <Btn variant="primary" icon={Check} onClick={saveRole}>{roleModal?.id ? "Enregistrer" : "Créer"}</Btn>
          </>
        }
      >
        <FieldGrid cols={1}>
          <Field label="Nom du rôle" value={roleDraft.role} onChange={v => setRoleDraft(d => ({ ...d, role: v }))}
            editable required icon={UserCog} placeholder="Superviseur régional" />
          <Field label="Description" value={roleDraft.desc} onChange={v => setRoleDraft(d => ({ ...d, desc: v }))}
            editable type="textarea" rows={3} placeholder="Décrivez le périmètre de ce rôle…" />
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Couleur d'identification</label>
            <div className="flex flex-wrap gap-2">
              {ROLE_COLORS.map(c => (
                <button key={c} onClick={() => setRoleDraft(d => ({ ...d, color: c }))}
                  aria-label={`Couleur ${c}`}
                  className="kw-btn kw-focus w-9 h-9 rounded-xl border-2 flex items-center justify-center"
                  style={{ background: `${c}20`, borderColor: roleDraft.color === c ? c : "transparent" }}>
                  <span className="w-4 h-4 rounded-full" style={{ background: c }} />
                </button>
              ))}
            </div>
          </div>
        </FieldGrid>
      </Modal>

      {/* Modale rattachement */}
      <Modal
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        title={`Rattacher un utilisateur au rôle « ${active?.role} »`}
        footer={
          <>
            <Btn variant="outline" onClick={() => setAssignOpen(false)}>Annuler</Btn>
            <Btn variant="primary" icon={Check} disabled={!assignUser} onClick={assign}>Rattacher</Btn>
          </>
        }
      >
        <Field label="Utilisateur" value={assignUser} onChange={setAssignUser}
          editable type="select" options={allUsers.map(u => `${fullName(u)} — ${u.email}`)} required icon={Users} />
      </Modal>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   §8.7 — RAPPORTS
   ═══════════════════════════════════════════════════════════════════════════ */
function ReportsSection({ toast }: { toast: never }) {
  const [period, setPeriod] = useState<Period>("30 jours");
  const doExport = (label: string) => (f: "pdf" | "csv") =>
    (toast as never as Function)("success", `Rapport « ${label} » exporté en ${f.toUpperCase()}.`);

  const reports = [
    { title: "Tendances de fraude", desc: "Évolution des fraudes détectées sur la période", icon: AlertTriangle, color: RED },
    { title: "Campagnes détectées", desc: "Campagnes coordonnées identifiées par la plateforme", icon: Network, color: ORANGE },
    { title: "Cartographie par opérateur", desc: "Répartition régionale et par opérateur", icon: Radio, color: BLUE },
    { title: "Activité partenaires", desc: "Consommation API par entreprise partenaire", icon: Briefcase, color: PURPLE },
  ];

  return (
    <div className="space-y-5">
      <PageHeader title="Rapports stratégiques" desc="Analyses approfondies et exports">
        <SegmentedControl options={PERIODS} value={period} onChange={setPeriod} size="sm" />
      </PageHeader>

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {reports.map(({ title, desc, icon: Icon, color }, i) => (
          <div key={title} className={`kw-in kw-d${i + 1} kw-card bg-card rounded-2xl border border-border p-5 flex flex-col`}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: `${color}16` }}>
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <h3 className="font-semibold text-foreground mb-1.5">{title}</h3>
            <p className="text-sm text-muted-foreground mb-5 flex-1 leading-relaxed">{desc}</p>
            <ExportDropdown onExport={doExport(title)} size="sm" />
          </div>
        ))}
      </div>

      <div className="bg-card rounded-2xl border border-border p-5">
        <SectionHeader title={`Tendances — ${period}`} desc="Signalements et fraudes confirmées" icon={BarChart2}>
          <ExportDropdown onExport={doExport("Tendances")} size="sm" />
        </SectionHeader>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={weeklyAll} margin={{ top: 5, right: 8, bottom: 0, left: -12 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="w" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={chartTooltip} />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} iconType="circle" />
            <Line type="monotone" dataKey="sig" stroke={BLUE} strokeWidth={2.5} dot={false} name="Signalements" />
            <Line type="monotone" dataKey="fra" stroke={RED} strokeWidth={2.5} dot={false} name="Fraudes" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-card rounded-2xl border border-border p-5">
        <SectionHeader title="Numéros et fraudes par opérateur" icon={Radio}>
          <ExportDropdown onExport={doExport("Par opérateur")} size="sm" />
        </SectionHeader>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={opData} margin={{ top: 5, right: 8, bottom: 0, left: -12 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="op" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={chartTooltip} cursor={{ fill: "var(--secondary)" }} />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} iconType="circle" />
            <Bar dataKey="n" fill={BLUE} radius={[6, 6, 0, 0]} name="Numéros" />
            <Bar dataKey="fraudes" fill={RED} radius={[6, 6, 0, 0]} name="Fraudes" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   PROFIL
   ═══════════════════════════════════════════════════════════════════════════ */
function ProfileSection({ toast }: { toast: never }) {
  const [mode, setMode] = useState<FormMode>("view");
  const [photo, setPhoto] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const f = useFormState({
    nom: "Nguesso", prenom: "Alice", email: "alice.nguesso@kwismo.com",
    phone: "+237 691 234 567", role: "Admin", langue: "Français", tz: "Africa/Douala",
  }, "view");

  const editable = f.mode !== "view";

  const save = async () => {
    f.setSaving(true);
    await new Promise(r => setTimeout(r, 700));
    f.setSaving(false);
    f.commit();
    (toast as never as Function)("success", "Profil mis à jour.");
  };

  const onPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setPhoto(URL.createObjectURL(file)); (toast as never as Function)("success", "Photo mise à jour."); }
  };

  return (
    <div className="max-w-12xl space-y-6">
      <PageHeader title="Mon profil" desc="Gérez vos informations personnelles">
        {f.mode === "view" ? (
          <Btn variant="primary" icon={Pencil} onClick={() => f.setMode("edit")}>Modifier</Btn>
        ) : (
          <>
            <Btn variant="outline" onClick={() => f.setMode("view")} disabled={f.saving}>Annuler</Btn>
            <Btn variant="primary" icon={Check} onClick={save} loading={f.saving} disabled={!f.dirty}>Enregistrer</Btn>
          </>
        )}
      </PageHeader>

      <FormCard>
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 pb-6 border-b border-border">
          <div className="relative shrink-0">
            <Avatar name={`${f.draft.prenom} ${f.draft.nom}`} src={photo} size={84} />
            <button onClick={() => fileRef.current?.click()} title="Changer la photo" aria-label="Changer la photo"
              className="kw-btn kw-focus absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center text-white shadow-md"
              style={{ background: ORANGE }}>
              <Camera className="w-4 h-4" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPhoto} />
          </div>
          <div className="text-center sm:text-left min-w-0">
            <p className="font-semibold text-foreground text-lg">{f.draft.prenom} {f.draft.nom}</p>
            <p className="text-sm text-muted-foreground truncate">{f.draft.email}</p>
            <div className="mt-2"><StatusBadge status={f.draft.role} /></div>
          </div>
        </div>

        <div className="pt-6">
          <FieldGrid>
            <Field label="Prénom" value={f.draft.prenom} onChange={f.set("prenom")} editable={editable} required />
            <Field label="Nom" value={f.draft.nom} onChange={f.set("nom")} editable={editable} required />
            <Field label="Email" value={f.draft.email} onChange={f.set("email")} editable={editable} type="email" icon={Mail} required />
            <Field label="Téléphone" value={f.draft.phone} onChange={f.set("phone")} editable={editable} type="tel" icon={Phone} mono />
            <Field label="Langue" value={f.draft.langue} onChange={f.set("langue")} editable={editable}
              type="select" options={["Français", "English"]} />
            <Field label="Fuseau horaire" value={f.draft.tz} onChange={f.set("tz")} editable={editable}
              type="select" options={["Africa/Douala", "Africa/Abidjan", "Africa/Dakar", "Africa/Lagos", "Africa/Nairobi"]} />
          </FieldGrid>
        </div>
      </FormCard>

      <FormCard title="Sécurité" icon={KeyRound}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">Mot de passe</p>
            <p className="text-xs text-muted-foreground mt-0.5">Dernière modification il y a 3 mois</p>
          </div>
          <Btn variant="outline" icon={KeyRound} onClick={() => (toast as never as Function)("info", "Un email de réinitialisation vous a été envoyé.")}>
            Modifier le mot de passe
          </Btn>
        </div>
      </FormCard>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   NOTIFICATIONS
   ═══════════════════════════════════════════════════════════════════════════ */
function NotificationsSection({
  notifications, setNotifications, toast,
}: {
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  toast: never;
}) {
  const [filter, setFilter] = useState<"Toutes" | "Non lues">("Toutes");
  const colors: Record<string, string> = { danger: RED, warning: ORANGE, info: BLUE, success: GREEN };
  const unread = notifications.filter(n => !n.read).length;
  const shown = filter === "Non lues" ? notifications.filter(n => !n.read) : notifications;

  return (
    <div className="space-y-5 max-w-12xl">
      <PageHeader title="Notifications" desc={`${unread} non lue${unread !== 1 ? "s" : ""} sur ${notifications.length}`}>
        <Btn variant="outline" icon={Check} disabled={unread === 0}
          onClick={() => { setNotifications(n => n.map(x => ({ ...x, read: true }))); (toast as never as Function)("info", "Toutes les notifications sont marquées comme lues."); }}>
          Tout marquer lu
        </Btn>
      </PageHeader>

      <SegmentedControl options={["Toutes", "Non lues"] as const} value={filter} onChange={setFilter} />

      {shown.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border">
          <EmptyState icon={Inbox} title="Aucune notification"
            desc={filter === "Non lues" ? "Toutes vos notifications ont été lues." : "Vous n'avez aucune notification."} />
        </div>
      ) : (
        <div className="space-y-2.5">
          {shown.map((n, i) => (
            <div
              key={n.id}
              onClick={() => setNotifications(ns => ns.map(x => (x.id === n.id ? { ...x, read: true } : x)))}
              className={`kw-in kw-d${Math.min(i + 1, 8)} kw-card flex items-start gap-4 px-5 py-4 rounded-2xl border cursor-pointer`}
              style={{
                background: n.read ? "var(--card)" : `${colors[n.type]}08`,
                borderColor: n.read ? "var(--border)" : `${colors[n.type]}35`,
              }}
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${colors[n.type]}18` }}>
                <AlertTriangle className="w-4 h-4" style={{ color: colors[n.type] }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2">
                  <p className="text-sm font-semibold text-foreground flex-1">{n.title}</p>
                  {!n.read && <span className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: colors[n.type] }} />}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{n.desc}</p>
                <p className="text-xs text-muted-foreground/60 mt-1.5">{n.time}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ESPACE ADMIN
   ═══════════════════════════════════════════════════════════════════════════ */
export function AdminSpace({
  darkMode, toggleDark, onLogout, onSupervise,
}: { darkMode: boolean; toggleDark: () => void; onLogout: () => void; onSupervise?: (partnerName: string) => void; }) {
  const [section, setSection] = useState<AdminSection>("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(notificationsInit);
  const [rules, setRules] = useState<AffiliationRule[]>(affiliationRules);

  const unread = notifications.filter(n => !n.read).length;
  const { toasts, toast, remove } = useToast();
  const { state: confirmState, confirm, close: closeConfirm } = useConfirm();

  const handleLogout = () =>
    confirm("Déconnexion", "Voulez-vous vraiment vous déconnecter ?", onLogout, false, "Se déconnecter");

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar
        section={section}
        setSection={setSection}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        onLogout={handleLogout}
      />

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          <Logo />
          <Btn icon={X} variant="ghost" size="iconSm" title="Fermer" onClick={() => setDrawerOpen(false)} />
        </div>
        <div className="flex flex-col h-[calc(100%-64px)]">
          <SidebarContent
            section={section}
            setSection={setSection}
            collapsed={false}
            onLogout={handleLogout}
            onClose={() => setDrawerOpen(false)}
          />
        </div>
      </Drawer>

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar
          section={section}
          darkMode={darkMode}
          toggleDark={toggleDark}
          unread={unread}
          setSection={setSection}
          notifications={notifications}
          setNotifications={setNotifications}
          onMenu={() => setDrawerOpen(true)}
        />

        <main className="flex-1 overflow-y-auto kw-scroll p-4 sm:p-6" style={{ background: "var(--background)" }}>
          <div key={section} className="kw-in">
            {section === "dashboard" && <AdminDashboard />}
            {section === "users" && <UsersSection toast={toast as never} confirm={confirm as never} />}
            {section === "partners" && <PartnersSection toast={toast as never} confirm={confirm as never} rules={rules} onSupervise={onSupervise} />}
            {section === "numbers" && <NumbersSection toast={toast as never} confirm={confirm as never} rules={rules} setRules={setRules} />}
            {section === "countries" && <CountriesSection toast={toast as never} confirm={confirm as never} />}
            {section === "access" && <AccessSection toast={toast as never} confirm={confirm as never} />}
            {section === "reports" && <ReportsSection toast={toast as never} />}
            {section === "profile" && <ProfileSection toast={toast as never} />}
            {section === "notifications" && (
              <NotificationsSection notifications={notifications} setNotifications={setNotifications} toast={toast as never} />
            )}
          </div>
        </main>
      </div>

      <ToastContainer toasts={toasts} remove={remove} />
      <ConfirmDialog
        open={confirmState.open}
        onClose={closeConfirm}
        onConfirm={confirmState.cb}
        title={confirmState.title}
        desc={confirmState.desc}
        danger={confirmState.danger}
        confirmLabel={confirmState.label}
      />
    </div>
  );
}