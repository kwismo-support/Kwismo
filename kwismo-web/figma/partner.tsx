/* ═══════════════════════════════════════════════════════════════════════════
   KWISMO — Espace Partenaire
   Conforme au Cahier des charges Web v1.0 (§9)
   Périmètre strictement cloisonné aux données affiliées à l'entreprise.
   ═══════════════════════════════════════════════════════════════════════════ */

import { useState, useRef, useMemo } from "react";
import type { ElementType } from "react";
import {
  LayoutDashboard, Hash, Users, BarChart2, User, Bell, LogOut,
  ChevronLeft, ChevronRight, Sun, Moon, Camera, Check, Menu, X,
  RefreshCw, Eye, Pencil, Phone, Mail, MapPin, Calendar, Smartphone,
  ShieldCheck, AlertTriangle, Radio, Network, Inbox, KeyRound,
  Building2, Flag, Link2, FileText, TrendingUp,
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  BLUE, ORANGE, GREEN, RED,
  partnerKpis, numbersData, allUsers, weeklyAll, notificationsInit,
  affiliationRules, countriesData, statutsData, opData,
  NUMBER_RISK_STATUSES, ACCOUNT_STATUSES, PERIODS,
  fullName, hasCompromised, fmtNum,
  type PartnerSection, type PhoneNumber, type AppUser,
  type Notification, type Period, type FormMode,
} from "./data";
import {
  Btn, Modal, ConfirmDialog, ToastContainer, Pagination, FilterToolbar,
  StatusBadge, ScoreBadge, CountBadge, KPICard, PageHeader, SectionHeader,
  TableWrapper, RowActions, RowBtn, Field, FieldGrid, FormCard, FormPage,
  Callout, SegmentedControl, ExportDropdown, Avatar, Drawer, EmptyState,
  CardSkeleton, Logo, useToast, useConfirm, useDataTable, useFormState, fieldCls,
} from "./components";

/* ═══════════════════════════════════════════════════════════════════════════
   IDENTITÉ DU PARTENAIRE CONNECTÉ
   Dans une intégration réelle, ces valeurs proviennent de la session.
   ═══════════════════════════════════════════════════════════════════════════ */
const PARTNER_NAME = "Orange Cameroun";
const PARTNER_COUNTRY = "Cameroun";
const PARTNER_TYPE = "Opérateur télécoms";
const PARTNER_SINCE = "15/01/2023";
const PARTNER_COLOR = ORANGE;

/** Numéros affiliés au périmètre — jamais au-delà (§8.4 cloisonnement) */
const myNumbers = numbersData.filter(n => n.partenaire === PARTNER_NAME);

/** Comptes ayant au moins un numéro dans le périmètre affilié (§9.1) */
const myNumberSet = new Set(myNumbers.map(n => n.num.replace(/\s/g, "")));
const myUsers = allUsers.filter(u =>
  u.numeros.some(n => myNumberSet.has(n.num.replace(/\s/g, ""))),
);

/** Règles d'affiliation du partenaire — en lecture seule */
const myRules = affiliationRules.filter(r => r.partenaire === PARTNER_NAME);

/* ═══════════════════════════════════════════════════════════════════════════
   NAVIGATION — modules admin masqués
   ═══════════════════════════════════════════════════════════════════════════ */
const navItems: { key: PartnerSection; icon: ElementType; label: string }[] = [
  { key: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { key: "numbers", icon: Hash, label: "Mes numéros" },
  { key: "users", icon: Users, label: "Utilisateurs" },
  { key: "reports", icon: BarChart2, label: "Rapports" },
  { key: "profile", icon: User, label: "Mon profil" },
];

function SidebarContent({
  section, setSection, collapsed, onLogout, onClose,
}: {
  section: PartnerSection; setSection: (s: PartnerSection) => void;
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
                background: active ? (collapsed ? PARTNER_COLOR : `${PARTNER_COLOR}16`) : "transparent",
                color: active ? (collapsed ? "#fff" : PARTNER_COLOR) : "var(--muted-foreground)",
              }}
            >
              {!collapsed && active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full"
                  style={{ background: PARTNER_COLOR }} />
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

/** Marque du partenaire dans la barre latérale */
function PartnerBrand({ compact }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5 min-w-0 select-none">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-black text-white text-[10px]"
        style={{ background: PARTNER_COLOR }}>
        OM
      </div>
      {!compact && (
        <div className="min-w-0">
          <p className="font-bold text-sm text-foreground truncate leading-tight">{PARTNER_NAME}</p>
          <p className="text-[10px] text-muted-foreground truncate">Espace partenaire</p>
        </div>
      )}
    </div>
  );
}

function Sidebar({
  section, setSection, collapsed, setCollapsed, onLogout,
}: {
  section: PartnerSection; setSection: (s: PartnerSection) => void;
  collapsed: boolean; setCollapsed: (v: boolean) => void; onLogout: () => void;
}) {
  return (
    <aside
      className="hidden lg:flex flex-col border-r border-border bg-sidebar shrink-0 transition-all duration-300 ease-in-out"
      style={{ width: collapsed ? 72 : 248 }}
    >
      <div className="h-16 flex items-center justify-between border-b border-border shrink-0 px-3">
        {collapsed ? (
          <div className="flex-1 flex justify-center"><PartnerBrand compact /></div>
        ) : (
          <div className="min-w-0 flex-1"><PartnerBrand /></div>
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
            style={{ color: PARTNER_COLOR }}>
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
  section: PartnerSection; darkMode: boolean; toggleDark: () => void; unread: number;
  setSection: (s: PartnerSection) => void;
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  onMenu: () => void;
}) {
  const label = navItems.find(n => n.key === section)?.label
    ?? (section === "notifications" ? "Notifications" : "");
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <header className="h-16 flex items-center gap-3 border-b border-border bg-card px-4 sm:px-6 shrink-0">
      <button onClick={onMenu} aria-label="Ouvrir le menu"
        className="kw-btn kw-focus lg:hidden p-2 rounded-xl text-muted-foreground hover:bg-secondary">
        <Menu className="w-5 h-5" />
      </button>

      <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0"
        style={{ background: `${PARTNER_COLOR}1F`, color: PARTNER_COLOR }}>
        <Building2 className="w-3 h-3" />
        Partenaire
      </span>

      <div className="flex items-center gap-2 min-w-0">
        <ChevronRight className="hidden md:block w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
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
          <Avatar name="Diallo Kouyaté" size={34} color={PARTNER_COLOR} />
        </button>
      </div>
    </header>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   BANDEAU DE PÉRIMÈTRE (§5.2)
   ═══════════════════════════════════════════════════════════════════════════ */
function ScopeBanner() {
  return (
    <div className="kw-in rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4"
      style={{
        background: `linear-gradient(135deg, ${PARTNER_COLOR}18, ${PARTNER_COLOR}06)`,
        border: `1px solid ${PARTNER_COLOR}30`,
      }}>
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 font-black text-white text-sm"
        style={{ background: PARTNER_COLOR }}>
        OM
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-foreground text-lg truncate">{PARTNER_NAME}</p>
        <p className="text-sm text-muted-foreground">
          {PARTNER_TYPE} · {PARTNER_COUNTRY} · partenaire depuis le {PARTNER_SINCE}
        </p>
      </div>
      <div className="flex items-center gap-6 shrink-0">
        <div className="text-right">
          <p className="text-2xl font-bold tabular-nums" style={{ color: PARTNER_COLOR }}>
            {fmtNum(myNumbers.length)}
          </p>
          <p className="text-xs text-muted-foreground">numéros affiliés</p>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-2xl font-bold tabular-nums text-foreground">{myUsers.length}</p>
          <p className="text-xs text-muted-foreground">comptes rattachés</p>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   §9.2 — DASHBOARD PARTENAIRE
   ═══════════════════════════════════════════════════════════════════════════ */
const chartTooltip = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  fontSize: 12,
  boxShadow: "0 8px 24px -12px rgba(0,0,0,.25)",
};

function PartnerDashboard() {
  const [period, setPeriod] = useState<Period>("30 jours");
  const [loading, setLoading] = useState(false);

  const chartData = useMemo(() => {
    if (period === "7 jours") return weeklyAll.slice(-4);
    if (period === "90 jours") return weeklyAll.slice(-8);
    return weeklyAll;
  }, [period]);

  const onPeriod = (p: Period) => {
    setPeriod(p);
    setLoading(true);
    window.setTimeout(() => setLoading(false), 650);
  };

  /** Répartition des statuts limitée au périmètre */
  const myStatuts = useMemo(() => {
    const count = (s: string) => myNumbers.filter(n => n.statut === s).length;
    return [
      { name: "Sécurisé", value: count("Sécurisé"), color: GREEN },
      { name: "À signaler", value: count("À signaler"), color: ORANGE },
      { name: "Frauduleux", value: count("Frauduleux"), color: RED },
    ].filter(s => s.value > 0);
  }, []);

  const alerts = notificationsInit.filter(n => n.type === "danger" || n.type === "warning");

  return (
    <div className="space-y-6">
      <PageHeader title="Vue d'ensemble" desc="Indicateurs de votre périmètre affilié">
        <SegmentedControl options={PERIODS} value={period} onChange={onPeriod} size="sm" />
      </PageHeader>

      <ScopeBanner />

      <Callout tone="info" title="Périmètre de données">
        Les indicateurs et listes de cet espace sont restreints aux numéros couverts par vos plages
        de préfixes affiliées. Les données hors périmètre ne sont jamais accessibles.
      </Callout>

      {/* KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-4">
        {loading
          ? <CardSkeleton count={6} />
          : partnerKpis.map((k, i) => <KPICard key={k.label} {...k} delay={Math.min(i + 1, 8)} />)}
      </div>

      {/* Graphiques */}
      <div className="grid xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 bg-card rounded-2xl border border-border p-5 kw-in">
          <SectionHeader title={`Activité — ${period}`} desc="Signalements et fraudes de votre périmètre" icon={BarChart2} />
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chartData} margin={{ top: 5, right: 8, bottom: 0, left: -12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="w" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={chartTooltip} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} iconType="circle" />
              <Line type="monotone" dataKey="sig" stroke={PARTNER_COLOR} strokeWidth={2.5} dot={false} name="Signalements" />
              <Line type="monotone" dataKey="fra" stroke={RED} strokeWidth={2.5} dot={false} name="Fraudes" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-2xl border border-border p-5 kw-in kw-d2">
          <SectionHeader title="Mes numéros par statut" icon={ShieldCheck} />
          {myStatuts.length === 0 ? (
            <EmptyState icon={Hash} title="Aucun numéro" desc="Aucun numéro dans votre périmètre." />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={myStatuts} dataKey="value" cx="50%" cy="45%" innerRadius={52} outerRadius={82} paddingAngle={3}>
                  {myStatuts.map(s => <Cell key={s.name} fill={s.color} stroke="none" />)}
                </Pie>
                <Tooltip contentStyle={chartTooltip} />
                <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid xl:grid-cols-3 gap-5">
        <div className="bg-card rounded-2xl border border-border p-5 kw-in">
          <SectionHeader title="Consommation API" desc="Appels facturés à 0,001 $" icon={Network} />
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyAll.slice(-6)} margin={{ top: 5, right: 8, bottom: 0, left: -18 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="w" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={chartTooltip} cursor={{ fill: "var(--secondary)" }} />
              <Bar dataKey="sig" fill={PARTNER_COLOR} radius={[6, 6, 0, 0]} name="Appels API" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="xl:col-span-2 bg-card rounded-2xl border border-border p-5 kw-in kw-d2">
          <SectionHeader title="Dernières alertes" desc="Événements nécessitant votre attention" icon={AlertTriangle} />
          {alerts.length === 0 ? (
            <EmptyState icon={ShieldCheck} title="Aucune alerte" desc="Votre périmètre ne présente aucune alerte active." />
          ) : (
            <div className="space-y-0 max-h-[280px] overflow-y-auto kw-scroll -mx-1 px-1">
              {alerts.map((n, i) => (
                <div key={n.id}
                  className={`flex items-start gap-3 py-3 ${i < alerts.length - 1 ? "border-b border-border" : ""}`}>
                  <span className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                    style={{ background: n.type === "danger" ? RED : ORANGE }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground leading-snug">{n.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{n.desc}</p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0 whitespace-nowrap">{n.time}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Plages affiliées — lecture seule */}
      <div className="bg-card rounded-2xl border border-border p-5 kw-in">
        <SectionHeader title="Vos plages affiliées" desc="Définies par l'équipe KWISMO — consultation uniquement" icon={Link2} />
        {myRules.length === 0 ? (
          <EmptyState icon={Link2} title="Aucune plage affiliée"
            desc="Contactez l'équipe KWISMO pour définir votre périmètre." />
        ) : (
          <div className="space-y-2.5">
            {myRules.map(r => (
              <div key={r.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl border border-border bg-secondary/40">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{r.pays}</p>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {r.prefixes.map(p => (
                      <code key={p} className="text-xs px-2 py-0.5 rounded font-mono"
                        style={{ background: `${PARTNER_COLOR}14`, color: PARTNER_COLOR }}>{p}</code>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-muted-foreground whitespace-nowrap tabular-nums">
                    {fmtNum(r.numerosConcernes)} numéros
                  </span>
                  <StatusBadge status={r.actif ? "Actif" : "Inactif"} dot />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   §9.3 — NUMÉROS DU PARTENAIRE
   Consultation, changement de statut et signalement. Pas de création ni
   de suppression : le référentiel appartient à l'admin.
   ═══════════════════════════════════════════════════════════════════════════ */
function NumberFormPage({
  item, startMode, onBack, onSave, toast,
}: {
  item: PhoneNumber; startMode: FormMode; onBack: () => void;
  onSave: (n: PhoneNumber) => void; toast: never;
}) {
  const f = useFormState<PhoneNumber>(item, startMode);
  const editable = f.mode !== "view";

  const save = async () => {
    f.setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    f.setSaving(false);
    onSave(f.draft);
    f.commit();
    (toast as never as Function)("success", "Numéro mis à jour.");
  };

  return (
    <FormPage
      title={f.draft.num}
      desc={`${f.draft.op} · ${f.draft.pays} · dernière vérification ${f.draft.verif}`}
      mode={f.mode}
      onModeChange={f.setMode}
      onBack={onBack}
      backLabel="Retour à mes numéros"
      onSave={save}
      saving={f.saving}
      dirty={f.dirty}
      headerExtra={
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-card rounded-2xl border border-border p-5">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: `${PARTNER_COLOR}16` }}>
            <Phone className="w-6 h-6" style={{ color: PARTNER_COLOR }} />
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
      }
      footerExtra={
        <div className="flex flex-wrap gap-2">
          <Btn variant="outline" icon={RefreshCw}
            onClick={() => (toast as never as Function)("info", `Réanalyse lancée pour ${f.draft.num}.`)}>
            Forcer une réanalyse
          </Btn>
          <Btn variant="outline" icon={AlertTriangle}
            onClick={() => (toast as never as Function)("warning", "Signalement transmis à l'équipe KWISMO.")}>
            Signaler ce numéro
          </Btn>
          <Btn variant="outline" icon={FileText}
            onClick={() => (toast as never as Function)("info", "Historique (démo).")}>
            Consulter l'historique
          </Btn>
        </div>
      }
    >
      <Callout tone="info" title="Champs modifiables">
        En tant que partenaire, vous pouvez ajuster le statut d'un numéro de votre périmètre.
        Les informations d'identification relèvent du référentiel KWISMO.
      </Callout>

      <FormCard title="Identification" icon={Smartphone}>
        <FieldGrid>
          <Field label="Numéro" value={f.draft.num} editable={false} mono icon={Phone} />
          <Field label="Opérateur" value={f.draft.op} editable={false} icon={Radio} />
          <Field label="Pays" value={f.draft.pays} editable={false} icon={MapPin} />
          <Field label="Compte propriétaire" value={f.draft.compte ?? ""} editable={false} icon={Mail}
            renderRead={
              f.draft.compte
                ? <span className="text-sm text-foreground truncate">{f.draft.compte}</span>
                : <span className="text-sm text-muted-foreground italic">Aucun compte</span>
            } />
        </FieldGrid>
      </FormCard>

      <FormCard title="Analyse de risque" icon={ShieldCheck}>
        <FieldGrid>
          <Field label="Score de risque" value={String(f.draft.score)} editable={false}
            renderRead={<ScoreBadge score={Number(f.draft.score)} />}
            hint="Score calculé par le moteur d'analyse KWISMO." />
          <Field label="Statut" value={f.draft.statut} onChange={f.set("statut") as never} editable={editable}
            type="select" options={NUMBER_RISK_STATUSES}
            renderRead={<StatusBadge status={f.draft.statut} dot />} />
          <Field label="Partenaire affilié" value={f.draft.partenaire} editable={false} icon={Building2} />
          <Field label="Dernière vérification" value={f.draft.verif} editable={false} icon={Calendar} />
        </FieldGrid>
      </FormCard>
    </FormPage>
  );
}

function NumbersSection({ toast }: { toast: never }) {
  const [nums, setNums] = useState<PhoneNumber[]>(myNumbers);
  const [page, setPage] = useState<{ mode: FormMode; item: PhoneNumber } | null>(null);

  const t = useDataTable<PhoneNumber>(
    nums,
    (n, q, fl) =>
      (!q || n.num.replace(/\s/g, "").includes(q.replace(/\s/g, "")) || n.op.toLowerCase().includes(q) || (n.compte ?? "").toLowerCase().includes(q)) &&
      (!fl.statut || n.statut === fl.statut) &&
      (!fl.op || n.op === fl.op),
    10,
  );

  if (page) {
    return (
      <NumberFormPage
        item={page.item}
        startMode={page.mode}
        onBack={() => setPage(null)}
        onSave={n => setNums(ns => ns.map(x => (x.id === n.id ? n : x)))}
        toast={toast}
      />
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Mes numéros" desc={`${nums.length} numéros couverts par vos plages affiliées`} />

      <FilterToolbar
        search={t.search}
        onSearch={t.setSearch}
        placeholder="Numéro, opérateur ou compte…"
        filters={[
          { key: "statut", label: "Statut", options: [...NUMBER_RISK_STATUSES] },
          { key: "op", label: "Opérateur", options: Array.from(new Set(nums.map(n => n.op))) },
        ]}
        values={t.filters}
        onFilterChange={t.setFilters}
        resultCount={t.filtered.length}
        actions={<ExportDropdown onExport={f => (toast as never as Function)("success", `Export ${f.toUpperCase()} généré.`)} />}
      />

      <TableWrapper
        columns={["Numéro", "Opérateur", "Pays", "Score", "Statut", "Compte", "Vérifié le", "Actions"]}
        state={t.isEmpty ? "empty" : "success"}
        emptyTitle={t.hasQuery ? "Aucun résultat" : "Aucun numéro affilié"}
        emptyDesc={
          t.hasQuery
            ? "Aucun numéro ne correspond à votre recherche."
            : "Votre périmètre ne contient encore aucun numéro. Contactez l'équipe KWISMO."
        }
        emptyAction={
          t.hasQuery
            ? <Btn variant="outline" icon={X} onClick={() => { t.setSearch(""); t.setFilters({}); }}>Effacer les filtres</Btn>
            : undefined
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
              <td className="px-4 py-3 text-sm truncate max-w-[180px]">
                {n.compte
                  ? <span className="text-muted-foreground">{n.compte}</span>
                  : <span className="text-muted-foreground/50 italic text-xs">Aucun</span>}
              </td>
              <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{n.verif}</td>
              <td className="px-4 py-3">
                <RowActions>
                  <RowBtn icon={Eye} title="Consulter" tone="primary" onClick={() => setPage({ mode: "view", item: n })} />
                  <RowBtn icon={Pencil} title="Modifier le statut" tone="warn" onClick={() => setPage({ mode: "edit", item: n })} />
                  <RowBtn icon={RefreshCw} title="Forcer une réanalyse" tone="success"
                    onClick={() => (toast as never as Function)("info", `Réanalyse lancée pour ${n.num}.`)} />
                  <RowBtn icon={AlertTriangle} title="Signaler" tone="danger"
                    onClick={() => (toast as never as Function)("warning", `${n.num} signalé à l'équipe KWISMO.`)} />
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
   §9.4 — UTILISATEURS DU PARTENAIRE
   Consultation seule : le partenaire ne gère pas les comptes KWISMO.
   ═══════════════════════════════════════════════════════════════════════════ */
function UserDetailPage({ user, onBack }: { user: AppUser; onBack: () => void }) {
  /** Seuls les numéros du périmètre sont affichés (§8.4 cloisonnement) */
  const scoped = user.numeros.filter(n => myNumberSet.has(n.num.replace(/\s/g, "")));
  const hidden = user.numeros.length - scoped.length;

  return (
    <div className="kw-in space-y-6 max-w-4xl">
      <PageHeader
        title={fullName(user)}
        desc={`Inscrit le ${user.date} · ${scoped.length} numéro${scoped.length !== 1 ? "s" : ""} dans votre périmètre`}
        onBack={onBack}
        backLabel="Retour aux utilisateurs"
      />

      <div className="flex items-center gap-4 bg-card rounded-2xl border border-border p-5">
        <Avatar name={fullName(user)} size={56} color={PARTNER_COLOR} alert={hasCompromised(user)} />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-foreground truncate">{fullName(user)}</p>
          <p className="text-sm text-muted-foreground truncate">{user.email}</p>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <StatusBadge status={user.statut} dot />
            {user.emailVerifie
              ? <span className="text-xs inline-flex items-center gap-1" style={{ color: GREEN }}><Check className="w-3 h-3" />Email vérifié</span>
              : <span className="text-xs inline-flex items-center gap-1" style={{ color: ORANGE }}><AlertTriangle className="w-3 h-3" />Email non vérifié</span>}
          </div>
        </div>
      </div>

      <FormCard title="Informations du compte" icon={User}>
        <FieldGrid>
          <Field label="Prénom" value={user.prenom} editable={false} />
          <Field label="Nom" value={user.nom} editable={false} />
          <Field label="Adresse email" value={user.email} editable={false} icon={Mail} className="sm:col-span-2" />
          <Field label="Statut du compte" value={user.statut} editable={false}
            renderRead={<StatusBadge status={user.statut} dot />} />
          <Field label="Date d'inscription" value={user.date} editable={false} icon={Calendar} />
        </FieldGrid>
      </FormCard>

      <FormCard>
        <SectionHeader
          title="Numéros dans votre périmètre"
          desc="Seuls les numéros couverts par vos plages affiliées sont visibles"
          icon={Smartphone}
        />
        {scoped.length === 0 ? (
          <EmptyState icon={Smartphone} title="Aucun numéro visible"
            desc="Aucun numéro de ce compte n'appartient à votre périmètre." />
        ) : (
          <div className="space-y-2.5">
            {scoped.map(n => (
              <div key={n.id}
                className="kw-card flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl border border-border bg-secondary/40">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: `${PARTNER_COLOR}16` }}>
                    <Phone className="w-4 h-4" style={{ color: PARTNER_COLOR }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-mono font-medium text-foreground truncate">{n.num}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {n.op} · {n.pays} ({n.indicatif}) · Vérifié le {n.verif}
                    </p>
                  </div>
                </div>
                <StatusBadge status={n.statut} dot />
              </div>
            ))}
          </div>
        )}

        {hidden > 0 && (
          <div className="mt-4">
            <Callout tone="info">
              {hidden} numéro{hidden !== 1 ? "s" : ""} de ce compte {hidden !== 1 ? "sont" : "est"} hors de
              votre périmètre affilié et n'{hidden !== 1 ? "y sont" : "y est"} pas visible{hidden !== 1 ? "s" : ""}.
            </Callout>
          </div>
        )}
      </FormCard>
    </div>
  );
}

function UsersSection({ toast }: { toast: never }) {
  const [detail, setDetail] = useState<AppUser | null>(null);

  const t = useDataTable<AppUser>(
    myUsers,
    (u, q, fl) =>
      (!q ||
        fullName(u).toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.numeros.some(n => n.num.replace(/\s/g, "").includes(q.replace(/\s/g, "")))) &&
      (!fl.statut || u.statut === fl.statut),
    10,
  );

  if (detail) return <UserDetailPage user={detail} onBack={() => setDetail(null)} />;

  const scopedCount = (u: AppUser) =>
    u.numeros.filter(n => myNumberSet.has(n.num.replace(/\s/g, ""))).length;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Utilisateurs"
        desc={`${myUsers.length} comptes possédant au moins un numéro de votre périmètre`}
      />

      <Callout tone="info" title="Consultation seule">
        La gestion des comptes KWISMO relève de l'équipe centrale. Vous pouvez consulter
        les comptes rattachés à vos numéros affiliés.
      </Callout>

      <FilterToolbar
        search={t.search}
        onSearch={t.setSearch}
        placeholder="Nom, email ou numéro…"
        filters={[{ key: "statut", label: "Statut", options: [...ACCOUNT_STATUSES] }]}
        values={t.filters}
        onFilterChange={t.setFilters}
        resultCount={t.filtered.length}
        actions={<ExportDropdown onExport={f => (toast as never as Function)("success", `Export ${f.toUpperCase()} généré.`)} />}
      />

      <TableWrapper
        columns={["Compte", "Email", "Numéros affiliés", "Statut", "Inscrit le", "Actions"]}
        state={t.isEmpty ? "empty" : "success"}
        emptyTitle={t.hasQuery ? "Aucun résultat" : "Aucun compte rattaché"}
        emptyDesc={
          t.hasQuery
            ? "Aucun compte ne correspond à votre recherche."
            : "Aucun compte ne possède de numéro dans votre périmètre."
        }
        emptyAction={
          t.hasQuery
            ? <Btn variant="outline" icon={X} onClick={() => { t.setSearch(""); t.setFilters({}); }}>Effacer les filtres</Btn>
            : undefined
        }
        footer={<Pagination total={t.filtered.length} page={t.page} setPage={t.setPage} pageSize={t.pageSize} setPageSize={t.setPageSize} />}
      >
        <tbody className="divide-y divide-border">
          {t.items.map(u => (
            <tr key={u.id} className="kw-row hover:bg-secondary/40">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar name={fullName(u)} size={34} color={PARTNER_COLOR} alert={hasCompromised(u)} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{fullName(u)}</p>
                    <p className="text-xs text-muted-foreground truncate sm:hidden">{u.email}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  {u.email}
                  {!u.emailVerifie && (
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" style={{ color: ORANGE }} aria-label="Email non vérifié" />
                  )}
                </span>
              </td>
              <td className="px-4 py-3">
                <CountBadge count={scopedCount(u)} label="numéro" alert={hasCompromised(u)} />
              </td>
              <td className="px-4 py-3"><StatusBadge status={u.statut} dot /></td>
              <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">{u.date}</td>
              <td className="px-4 py-3">
                <RowActions>
                  <RowBtn icon={Eye} title="Consulter" tone="primary" onClick={() => setDetail(u)} />
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
   §9.5 — RAPPORTS DU PARTENAIRE
   ═══════════════════════════════════════════════════════════════════════════ */
function ReportsSection({ toast }: { toast: never }) {
  const [period, setPeriod] = useState<Period>("30 jours");
  const doExport = (label: string) => (f: "pdf" | "csv") =>
    (toast as never as Function)("success", `Rapport « ${label} » exporté en ${f.toUpperCase()}.`);

  const reports = [
    { title: "Synthèse fraude", desc: "Fraudes détectées sur votre périmètre", icon: AlertTriangle, color: RED },
    { title: "Consommation API", desc: "Détail des appels et coût estimé", icon: Network, color: PARTNER_COLOR },
    { title: "Numéros signalés", desc: "Liste des numéros à risque affiliés", icon: Hash, color: BLUE },
    { title: "Évolution du score", desc: "Score de risque moyen de votre parc", icon: TrendingUp, color: GREEN },
  ];

  const myOpData = useMemo(
    () => opData.filter(o => myNumbers.some(n => n.op === o.op)),
    [],
  );

  return (
    <div className="space-y-5">
      <PageHeader title="Mes rapports" desc={`Analyses limitées au périmètre ${PARTNER_NAME}`}>
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
        <SectionHeader title={`Évolution — ${period}`} desc="Signalements et fraudes de votre périmètre" icon={BarChart2}>
          <ExportDropdown onExport={doExport("Évolution")} size="sm" />
        </SectionHeader>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={weeklyAll} margin={{ top: 5, right: 8, bottom: 0, left: -12 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="w" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={chartTooltip} />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} iconType="circle" />
            <Line type="monotone" dataKey="sig" stroke={PARTNER_COLOR} strokeWidth={2.5} dot={false} name="Signalements" />
            <Line type="monotone" dataKey="fra" stroke={RED} strokeWidth={2.5} dot={false} name="Fraudes" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {myOpData.length > 0 && (
        <div className="bg-card rounded-2xl border border-border p-5">
          <SectionHeader title="Répartition par opérateur" desc="Numéros de votre périmètre" icon={Radio}>
            <ExportDropdown onExport={doExport("Par opérateur")} size="sm" />
          </SectionHeader>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={myOpData} margin={{ top: 5, right: 8, bottom: 0, left: -12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="op" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={chartTooltip} cursor={{ fill: "var(--secondary)" }} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} iconType="circle" />
              <Bar dataKey="n" fill={PARTNER_COLOR} radius={[6, 6, 0, 0]} name="Numéros" />
              <Bar dataKey="fraudes" fill={RED} radius={[6, 6, 0, 0]} name="Fraudes" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   PROFIL
   ═══════════════════════════════════════════════════════════════════════════ */
function ProfileSection({ toast }: { toast: never }) {
  const [photo, setPhoto] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const f = useFormState({
    nom: "Kouyaté", prenom: "Diallo", email: "dkouyate@mtn.com",
    phone: "+237 699 123 456", entreprise: PARTNER_NAME, poste: "Directeur Sécurité",
    langue: "Français", tz: "Africa/Douala",
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
          <Btn variant="primary" icon={Pencil} style={{ background: PARTNER_COLOR }} onClick={() => f.setMode("edit")}>
            Modifier
          </Btn>
        ) : (
          <>
            <Btn variant="outline" onClick={() => f.setMode("view")} disabled={f.saving}>Annuler</Btn>
            <Btn variant="primary" icon={Check} style={{ background: PARTNER_COLOR }}
              onClick={save} loading={f.saving} disabled={!f.dirty}>
              Enregistrer
            </Btn>
          </>
        )}
      </PageHeader>

      <FormCard>
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 pb-6 border-b border-border">
          <div className="relative shrink-0">
            <Avatar name={`${f.draft.prenom} ${f.draft.nom}`} src={photo} size={84} color={PARTNER_COLOR} />
            <button onClick={() => fileRef.current?.click()} title="Changer la photo" aria-label="Changer la photo"
              className="kw-btn kw-focus absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center text-white shadow-md"
              style={{ background: BLUE }}>
              <Camera className="w-4 h-4" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPhoto} />
          </div>
          <div className="text-center sm:text-left min-w-0">
            <p className="font-semibold text-foreground text-lg">{f.draft.prenom} {f.draft.nom}</p>
            <p className="text-sm text-muted-foreground truncate">{f.draft.entreprise}</p>
            <div className="mt-2">
              <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium"
                style={{ background: `${PARTNER_COLOR}1F`, color: PARTNER_COLOR }}>
                Partenaire
              </span>
            </div>
          </div>
        </div>

        <div className="pt-6">
          <FieldGrid>
            <Field label="Prénom" value={f.draft.prenom} onChange={f.set("prenom")} editable={editable} required />
            <Field label="Nom" value={f.draft.nom} onChange={f.set("nom")} editable={editable} required />
            <Field label="Email" value={f.draft.email} onChange={f.set("email")} editable={editable} type="email" icon={Mail} required />
            <Field label="Téléphone" value={f.draft.phone} onChange={f.set("phone")} editable={editable} type="tel" icon={Phone} mono />
            <Field label="Entreprise" value={f.draft.entreprise} editable={false} icon={Building2}
              hint="Rattachement défini par l'équipe KWISMO." />
            <Field label="Poste" value={f.draft.poste} onChange={f.set("poste")} editable={editable} />
            <Field label="Langue" value={f.draft.langue} onChange={f.set("langue")} editable={editable}
              type="select" options={["Français", "English"]} />
            <Field label="Fuseau horaire" value={f.draft.tz} onChange={f.set("tz")} editable={editable}
              type="select" options={["Africa/Douala", "Africa/Abidjan", "Africa/Dakar", "Africa/Lagos", "Africa/Nairobi"]} />
          </FieldGrid>
        </div>
      </FormCard>

      <FormCard title="Périmètre affilié" icon={Link2}>
        {myRules.length === 0 ? (
          <EmptyState icon={Link2} title="Aucune plage affiliée" />
        ) : (
          <div className="space-y-2.5">
            {myRules.map(r => (
              <div key={r.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl border border-border bg-secondary/40">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Flag className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                    {r.pays}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {r.prefixes.map(p => (
                      <code key={p} className="text-xs px-2 py-0.5 rounded font-mono"
                        style={{ background: `${PARTNER_COLOR}14`, color: PARTNER_COLOR }}>{p}</code>
                    ))}
                  </div>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap tabular-nums shrink-0">
                  {fmtNum(r.numerosConcernes)} numéros
                </span>
              </div>
            ))}
          </div>
        )}
      </FormCard>

      <FormCard title="Sécurité" icon={KeyRound}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">Mot de passe</p>
            <p className="text-xs text-muted-foreground mt-0.5">Dernière modification il y a 2 mois</p>
          </div>
          <Btn variant="outline" icon={KeyRound}
            onClick={() => (toast as never as Function)("info", "Un email de réinitialisation vous a été envoyé.")}>
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
          onClick={() => {
            setNotifications(n => n.map(x => ({ ...x, read: true })));
            (toast as never as Function)("info", "Toutes les notifications sont marquées comme lues.");
          }}>
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
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${colors[n.type]}18` }}>
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
   ESPACE PARTENAIRE
   ═══════════════════════════════════════════════════════════════════════════ */
export function PartnerSpace({
  darkMode, toggleDark, onLogout, supervising, onExitSupervision,
}: { darkMode: boolean; toggleDark: () => void; onLogout: () => void; supervising?: string; onExitSupervision?: () => void; }) {
  const [section, setSection] = useState<PartnerSection>("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(notificationsInit);

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
          <PartnerBrand />
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
        {supervising && onExitSupervision && (
          <div className="flex items-center gap-3 px-4 sm:px-6 py-2.5 shrink-0"
            style={{ background: ORANGE, color: "#fff" }}>
            <Eye className="w-4 h-4 shrink-0" />
            <p className="text-sm font-medium flex-1 min-w-0 truncate">
              Vous consultez l'espace de {supervising} — Mode supervision
            </p>
            <button onClick={onExitSupervision}
              className="kw-btn kw-focus text-xs font-semibold px-3 py-1.5 rounded-lg shrink-0"
              style={{ background: "rgba(255,255,255,.22)", color: "#fff" }}>
              Quitter
            </button>
          </div>
        )}
        
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
            {section === "dashboard" && <PartnerDashboard />}
            {section === "numbers" && <NumbersSection toast={toast as never} />}
            {section === "users" && <UsersSection toast={toast as never} />}
            {section === "reports" && <ReportsSection toast={toast as never} />}
            {section === "profile" && <ProfileSection toast={toast as never} />}
            {section === "notifications" && (
              <NotificationsSection
                notifications={notifications}
                setNotifications={setNotifications}
                toast={toast as never}
              />
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