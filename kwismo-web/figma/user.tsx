/* ═══════════════════════════════════════════════════════════════════════════
   KWISMO — Espace Utilisateur (substitut web de secours)
   Fonctionnalité prioritaire : déclarer un numéro compromis + alerter ses
   contacts, utile lorsque le téléphone est volé (cf. §9.5 du cahier mobile).
   ═══════════════════════════════════════════════════════════════════════════ */

import { useState, useRef } from "react";
import type { ElementType } from "react";
import {
  LayoutDashboard, Smartphone, ShieldAlert, Search, User, Bell, LogOut,
  ChevronLeft, ChevronRight, Sun, Moon, Camera, Check, Menu, X,
  Phone, Mail, MapPin, ShieldCheck, AlertTriangle, Send,
  KeyRound, Plus, Trash2, RefreshCw, Users, MessageCircle,
  ShieldOff, Zap, ArrowRight,
} from "lucide-react";
import {
  BLUE, ORANGE, GREEN, RED,
  currentUser, userContacts, alertTemplates, userKpis, userNotificationsInit,
  countriesData, numbersData, REPORT_REASONS,
  fullName, hasCompromised,
  type UserSection, type UserNumber, type Contact, type Notification,
} from "./data";
import {
  Btn, Modal, ConfirmDialog, ToastContainer, StatusBadge, ScoreBadge, KPICard,
  PageHeader, SectionHeader, Field, FieldGrid, FormCard, Callout, Avatar,
  Drawer, EmptyState, SegmentedControl, Logo,
  useToast, useConfirm, useFormState, fieldCls,
} from "./components";

/* ═══════════════════════════════════════════════════════════════════════════
   NAVIGATION
   ═══════════════════════════════════════════════════════════════════════════ */
const navItems: { key: UserSection; icon: ElementType; label: string }[] = [
  { key: "home", icon: LayoutDashboard, label: "Accueil" },
  { key: "compromised", icon: ShieldAlert, label: "Numéro compromis" },
  { key: "numbers", icon: Smartphone, label: "Mes numéros" },
  { key: "verify", icon: Search, label: "Vérifier" },
  { key: "report", icon: AlertTriangle, label: "Signaler" },
  { key: "profile", icon: User, label: "Mon profil" },
];

function SidebarContent({
  section, setSection, collapsed, onLogout, onClose,
}: {
  section: UserSection; setSection: (s: UserSection) => void;
  collapsed: boolean; onLogout: () => void; onClose?: () => void;
}) {
  return (
    <>
      <nav className="flex-1 overflow-y-auto kw-scroll py-3 px-2">
        {navItems.map(({ key, icon: Icon, label }) => {
          const active = section === key;
          const danger = key === "compromised";
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
                background: active
                  ? (collapsed ? (danger ? RED : BLUE) : (danger ? `${RED}14` : `${BLUE}14`))
                  : "transparent",
                color: active
                  ? (collapsed ? "#fff" : (danger ? RED : BLUE))
                  : (danger ? RED : "var(--muted-foreground)"),
              }}
            >
              {!collapsed && active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full"
                  style={{ background: danger ? RED : ORANGE }} />
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
  section: UserSection; setSection: (s: UserSection) => void;
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
          <button onClick={() => setNotifications(n => n.map(x => ({ ...x, read: true })))}
            className="kw-focus text-xs text-muted-foreground hover:text-foreground transition-colors">
            Tout marquer lu
          </button>
        </div>

        {recent.length === 0 ? (
          <div className="py-10"><EmptyState title="Aucune notification" /></div>
        ) : (
          <div className="divide-y divide-border max-h-[360px] overflow-y-auto kw-scroll">
            {recent.map(n => (
              <div key={n.id}
                onClick={() => setNotifications(ns => ns.map(x => (x.id === n.id ? { ...x, read: true } : x)))}
                className="kw-row flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-secondary"
                style={{ background: n.read ? "transparent" : `${colors[n.type]}08` }}>
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
  section: UserSection; darkMode: boolean; toggleDark: () => void; unread: number;
  setSection: (s: UserSection) => void;
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

      <div className="flex items-center gap-2 min-w-0">
        <span className="hidden sm:inline text-xs text-muted-foreground">Mon espace</span>
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
            <NotifDropdown notifications={notifications} setNotifications={setNotifications}
              onClose={() => setNotifOpen(false)}
              onViewAll={() => { setSection("notifications"); setNotifOpen(false); }} />
          )}
        </div>

        <button onClick={() => setSection("profile")} title="Mon profil" aria-label="Mon profil"
          className="kw-btn kw-focus ml-1">
          <Avatar name={fullName(currentUser)} size={34} color={BLUE} alert={hasCompromised(currentUser)} />
        </button>
      </div>
    </header>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ACCUEIL — KPI personnels + accès rapide au signalement de compromission
   ═══════════════════════════════════════════════════════════════════════════ */
function UserHome({
  numbers, setSection,
}: { numbers: UserNumber[]; setSection: (s: UserSection) => void }) {
  const compromised = numbers.filter(n => n.statut === "Compromis");

  const quickActions = [
    { key: "compromised" as UserSection, icon: ShieldAlert, label: "Déclarer un numéro compromis", desc: "Téléphone volé, SIM détournée, WhatsApp piraté", color: RED, primary: true },
    { key: "verify" as UserSection, icon: Search, label: "Vérifier un numéro", desc: "Analyser un numéro avant d'agir", color: BLUE },
    { key: "numbers" as UserSection, icon: Smartphone, label: "Mes numéros", desc: "Gérer vos lignes rattachées", color: GREEN },
    { key: "report" as UserSection, icon: AlertTriangle, label: "Signaler une fraude", desc: "Alimenter la protection communautaire", color: ORANGE },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title={`Bonjour ${currentUser.prenom}`} desc="Votre espace de protection anti-fraude" />

      {/* Bandeau prioritaire : action de secours */}
      <div className="kw-in rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4"
        style={{ background: `linear-gradient(135deg, ${RED}14, ${RED}05)`, border: `1px solid ${RED}30` }}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" style={{ background: `${RED}18` }}>
          <ShieldAlert className="w-7 h-7" style={{ color: RED }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-foreground text-lg">Téléphone volé ou compte piraté ?</p>
          <p className="text-sm text-muted-foreground mt-0.5">
            Déclarez immédiatement votre numéro comme compromis et prévenez vos contacts, même sans votre téléphone.
          </p>
        </div>
        <Btn variant="danger" icon={ShieldAlert} className="shrink-0" onClick={() => setSection("compromised")}>
          Déclarer maintenant
        </Btn>
      </div>

      {compromised.length > 0 && (
        <Callout tone="danger" title={`${compromised.length} numéro(s) actuellement compromis`}>
          {compromised.map(n => n.num).join(", ")} — vos contacts ont été invités à la prudence.
        </Callout>
      )}

      {/* KPI personnels */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {userKpis.map((k, i) => <KPICard key={k.label} {...k} delay={Math.min(i + 1, 8)} />)}
      </div>

      {/* Actions rapides */}
      <div>
        <SectionHeader title="Que voulez-vous faire ?" icon={Zap} />
        <div className="grid sm:grid-cols-2 gap-4">
          {quickActions.map(({ key, icon: Icon, label, desc, color, primary }, i) => (
            <button key={key} onClick={() => setSection(key)}
              className={`kw-in kw-d${i + 1} kw-card text-left bg-card rounded-2xl border p-5 flex items-start gap-4`}
              style={{ borderColor: primary ? `${color}40` : "var(--border)", borderWidth: primary ? 2 : 1 }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}16` }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground">{label}</p>
                <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{desc}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   DÉCLARATION DE NUMÉRO COMPROMIS — parcours en 3 étapes (§9.5)
   1) Choisir le numéro · 2) Choisir les contacts + message · 3) Confirmation
   ═══════════════════════════════════════════════════════════════════════════ */
function CompromisedFlow({
  numbers, setNumbers, contacts, toast, confirm, goToNumbers,
}: {
  numbers: UserNumber[];
  setNumbers: React.Dispatch<React.SetStateAction<UserNumber[]>>;
  contacts: Contact[];
  toast: never; confirm: never;
  goToNumbers: () => void;
}) {
  const [step, setStep] = useState(1);
  const [selectedNum, setSelectedNum] = useState<UserNumber | null>(null);
  const [selectedContacts, setSelectedContacts] = useState<Set<number>>(new Set());
  const [templateId, setTemplateId] = useState(alertTemplates[0].id);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const verifiedNumbers = numbers.filter(n => n.statut === "Vérifié" || n.statut === "Compromis");

  /** Applique un modèle en injectant le numéro sélectionné */
  const applyTemplate = (id: string, num?: UserNumber | null) => {
    setTemplateId(id);
    const tpl = alertTemplates.find(t => t.id === id);
    const target = num ?? selectedNum;
    if (tpl && target) setMessage(tpl.text.replace(/\{numero\}/g, target.num));
  };

  const pickNumber = (n: UserNumber) => {
    setSelectedNum(n);
    applyTemplate(templateId, n);
  };

  const toggleContact = (id: number) =>
    setSelectedContacts(s => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const allSelected = selectedContacts.size === contacts.length;
  const toggleAll = () =>
    setSelectedContacts(allSelected ? new Set() : new Set(contacts.map(c => c.id)));

  /** Étape 1 → marque le numéro compromis puis passe à l'alerte */
  const declareCompromised = () => {
    if (!selectedNum) return;
    (confirm as never as Function)(
      `Déclarer ${selectedNum.num} comme compromis ?`,
      "Ce numéro sera marqué « Compromis » dans vos numéros. Vous pourrez ensuite alerter vos contacts. Action recommandée en cas de vol.",
      () => {
        setNumbers(ns => ns.map(x => (x.id === selectedNum.id ? { ...x, statut: "Compromis" as const } : x)));
        applyTemplate(templateId, selectedNum);
        setStep(2);
        (toast as never as Function)("warning", `${selectedNum.num} marqué comme compromis.`);
      },
      true,
      "Oui, déclarer compromis",
    );
  };

  const sendAlerts = async () => {
    if (selectedContacts.size === 0) { (toast as never as Function)("error", "Sélectionnez au moins un contact."); return; }
    if (!message.trim()) { (toast as never as Function)("error", "Le message ne peut pas être vide."); return; }
    setSending(true);
    await new Promise(r => setTimeout(r, 1200));
    setSending(false);
    setDone(true);
    setStep(3);
    (toast as never as Function)("success", `Alerte envoyée à ${selectedContacts.size} contact(s).`);
  };

  const restart = () => {
    setStep(1); setSelectedNum(null); setSelectedContacts(new Set());
    setTemplateId(alertTemplates[0].id); setMessage(""); setDone(false);
  };

  /* Cas : aucun numéro vérifié (§9.5) */
  if (verifiedNumbers.length === 0) {
    return (
      <div className="space-y-5">
        <PageHeader title="Déclarer un numéro compromis" desc="Signalez une ligne volée ou piratée" />
        <div className="bg-card rounded-2xl border border-border">
          <EmptyState icon={Smartphone} title="Aucun numéro vérifié"
            desc="Vous devez d'abord vérifier au moins un numéro pour pouvoir le déclarer compromis."
            action={<Btn variant="primary" icon={Plus} onClick={goToNumbers}>Aller à mes numéros</Btn>} />
        </div>
      </div>
    );
  }

  const steps = ["Numéro concerné", "Alerter les contacts", "Confirmation"];

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader title="Déclarer un numéro compromis" desc="Marquez la ligne et prévenez vos proches" />

      {/* Indicateur d'étapes */}
      <div className="flex items-center gap-2">
        {steps.map((label, i) => {
          const n = i + 1;
          const active = step === n;
          const doneStep = step > n;
          return (
            <div key={label} className="flex items-center gap-2 flex-1">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors"
                  style={{
                    background: doneStep ? GREEN : active ? BLUE : "var(--secondary)",
                    color: doneStep || active ? "#fff" : "var(--muted-foreground)",
                  }}>
                  {doneStep ? <Check className="w-3.5 h-3.5" /> : n}
                </span>
                <span className="text-xs font-medium truncate hidden sm:inline"
                  style={{ color: active ? BLUE : "var(--muted-foreground)" }}>
                  {label}
                </span>
              </div>
              {i < steps.length - 1 && <div className="flex-1 h-px" style={{ background: "var(--border)" }} />}
            </div>
          );
        })}
      </div>

      {/* ÉTAPE 1 — choix du numéro */}
      {step === 1 && (
        <div className="space-y-4 kw-in">
          <Callout tone="danger" title="En cas de vol de téléphone" icon={ShieldAlert}>
            Sélectionnez la ligne concernée. Elle sera marquée « Compromis » : vos contacts pourront être
            prévenus qu'aucune demande venant de ce numéro n'est fiable.
          </Callout>

          <FormCard>
            <SectionHeader title="Quel numéro est compromis ?" icon={Smartphone} />
            <div className="space-y-2.5">
              {verifiedNumbers.map(n => {
                const sel = selectedNum?.id === n.id;
                const already = n.statut === "Compromis";
                return (
                  <button key={n.id} onClick={() => pickNumber(n)}
                    className="kw-card w-full text-left flex items-center gap-3 p-4 rounded-xl border"
                    style={{ borderColor: sel ? RED : "var(--border)", borderWidth: sel ? 2 : 1, background: sel ? `${RED}08` : "transparent" }}>
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: sel ? `${RED}16` : `${BLUE}12` }}>
                      <Phone className="w-5 h-5" style={{ color: sel ? RED : BLUE }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-mono font-semibold text-foreground truncate">{n.num}</p>
                      <p className="text-xs text-muted-foreground truncate">{n.op} · {n.pays}</p>
                    </div>
                    {already && <StatusBadge status="Compromis" dot />}
                    <span className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0"
                      style={{ borderColor: sel ? RED : "var(--border)", background: sel ? RED : "transparent" }}>
                      {sel && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                    </span>
                  </button>
                );
              })}
            </div>
          </FormCard>

          <div className="flex justify-end">
            <Btn variant="danger" icon={ShieldAlert} disabled={!selectedNum} onClick={declareCompromised}>
              Déclarer compromis et continuer
            </Btn>
          </div>
        </div>
      )}

      {/* ÉTAPE 2 — contacts + message */}
      {step === 2 && selectedNum && (
        <div className="space-y-4 kw-in">
          <Callout tone="warn" title={`${selectedNum.num} est marqué compromis`}>
            Choisissez les contacts à prévenir et personnalisez le message d'alerte.
          </Callout>

          <FormCard>
            <SectionHeader title="Contacts à alerter" desc={`${selectedContacts.size} sélectionné(s) sur ${contacts.length}`} icon={Users}>
              <Btn variant="ghost" size="sm" onClick={toggleAll}>
                {allSelected ? "Tout retirer" : "Tout sélectionner"}
              </Btn>
            </SectionHeader>
            <div className="grid sm:grid-cols-2 gap-2.5">
              {contacts.map(c => {
                const sel = selectedContacts.has(c.id);
                return (
                  <button key={c.id} onClick={() => toggleContact(c.id)}
                    className="kw-btn flex items-center gap-3 p-3 rounded-xl border text-left"
                    style={{ borderColor: sel ? BLUE : "var(--border)", background: sel ? `${BLUE}08` : "transparent" }}>
                    <Avatar name={c.nom} size={34} color={BLUE} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{c.nom}</p>
                      <p className="text-xs text-muted-foreground font-mono truncate">{c.num}</p>
                    </div>
                    <span className="w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0"
                      style={{ borderColor: sel ? BLUE : "var(--border)", background: sel ? BLUE : "transparent" }}>
                      {sel && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                    </span>
                  </button>
                );
              })}
            </div>
          </FormCard>

          <FormCard>
            <SectionHeader title="Message d'alerte" desc="Choisissez un modèle puis personnalisez" icon={MessageCircle} />
            <div className="flex flex-wrap gap-2 mb-4">
              {alertTemplates.map(t => (
                <button key={t.id} onClick={() => applyTemplate(t.id)}
                  className="kw-btn px-3 py-1.5 rounded-lg text-xs font-medium border"
                  style={{
                    borderColor: templateId === t.id ? BLUE : "var(--border)",
                    background: templateId === t.id ? `${BLUE}12` : "transparent",
                    color: templateId === t.id ? BLUE : "var(--muted-foreground)",
                  }}>
                  {t.label}
                </button>
              ))}
            </div>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={5}
              placeholder="Rédigez votre message d'alerte…"
              className={`${fieldCls()} resize-none`}
            />
            <p className="text-xs text-muted-foreground mt-2">
              Le message mentionne automatiquement le numéro concerné ({selectedNum.num}).
            </p>
          </FormCard>

          <div className="flex flex-col-reverse sm:flex-row justify-between gap-2">
            <Btn variant="outline" icon={ChevronLeft} onClick={() => setStep(1)}>Retour</Btn>
            <Btn variant="primary" icon={Send} loading={sending}
              disabled={selectedContacts.size === 0 || !message.trim()} onClick={sendAlerts}>
              Diffuser l'alerte à {selectedContacts.size} contact(s)
            </Btn>
          </div>
        </div>
      )}

      {/* ÉTAPE 3 — confirmation */}
      {step === 3 && done && selectedNum && (
        <div className="kw-in">
          <FormCard>
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 kw-pop" style={{ background: `${GREEN}18` }}>
                <Check className="w-8 h-8" style={{ color: GREEN }} strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Alerte diffusée</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                Le numéro <span className="font-mono font-semibold text-foreground">{selectedNum.num}</span> est
                marqué compromis et {selectedContacts.size} contact(s) ont été prévenus.
              </p>

              <div className="mt-6 flex flex-col sm:flex-row gap-2 justify-center">
                <Btn variant="outline" icon={Smartphone} onClick={goToNumbers}>Voir mes numéros</Btn>
                <Btn variant="primary" icon={RefreshCw} onClick={restart}>Nouvelle déclaration</Btn>
              </div>
            </div>
          </FormCard>

          <div className="mt-4">
            <Callout tone="info" title="Et ensuite ?">
              Contactez votre opérateur pour bloquer la SIM, puis changez les mots de passe des services liés
              à ce numéro (Mobile Money, WhatsApp, email). Une fois la ligne récupérée, vous pourrez lever le
              statut « Compromis » depuis « Mes numéros ».
            </Callout>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MES NUMÉROS — liste, ajout, vérification, déclaration compromis, suppression
   ═══════════════════════════════════════════════════════════════════════════ */
function UserNumbers({
  numbers, setNumbers, toast, confirm, goToCompromised,
}: {
  numbers: UserNumber[];
  setNumbers: React.Dispatch<React.SetStateAction<UserNumber[]>>;
  toast: never; confirm: never;
  goToCompromised: () => void;
}) {
  const [addOpen, setAddOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ pays: "Cameroun", num: "", op: "" });

  const paysInfo = countriesData.find(c => c.pays === draft.pays);
  const operators = paysInfo?.operateurs.map(o => o.nom.split(" ")[0]) ?? [];

  const colorFor = (s: UserNumber["statut"]) => (s === "Vérifié" ? GREEN : s === "Compromis" ? RED : ORANGE);

  const verify = (n: UserNumber) => (confirm as never as Function)(
    `Vérifier ${n.num} ?`,
    "Un code OTP serait envoyé par SMS sur cette ligne. Dans cette démo, la vérification est simulée.",
    () => {
      setNumbers(ns => ns.map(x => (x.id === n.id ? { ...x, statut: "Vérifié" as const, verif: new Date().toLocaleDateString("fr-FR") } : x)));
      (toast as never as Function)("success", `${n.num} vérifié.`);
    },
    false,
    "Vérifier",
  );

  const liftCompromised = (n: UserNumber) => (confirm as never as Function)(
    `Lever le statut compromis de ${n.num} ?`,
    "À ne faire que si vous avez récupéré le contrôle de cette ligne.",
    () => {
      setNumbers(ns => ns.map(x => (x.id === n.id ? { ...x, statut: "Vérifié" as const } : x)));
      (toast as never as Function)("success", "Statut « compromis » levé.");
    },
  );

  const remove = (n: UserNumber) => (confirm as never as Function)(
    `Supprimer ${n.num} ?`,
    "Ce numéro ne sera plus surveillé au titre de votre compte.",
    () => { setNumbers(ns => ns.filter(x => x.id !== n.id)); (toast as never as Function)("success", "Numéro supprimé."); },
    true,
  );

  const addNumber = async () => {
    if (!draft.num.trim() || !draft.op) { (toast as never as Function)("error", "Numéro et opérateur requis."); return; }
    setAdding(true);
    await new Promise(r => setTimeout(r, 800));
    setAdding(false);
    const indicatif = paysInfo?.indicatif ?? "+237";
    const formatted = draft.num.startsWith("+") ? draft.num : `${indicatif} ${draft.num}`;
    setNumbers(ns => [
      ...ns,
      { id: Date.now(), num: formatted, op: draft.op, pays: draft.pays, indicatif, statut: "En attente", verif: "—" },
    ]);
    (toast as never as Function)("success", "Numéro ajouté. Vérifiez-le par OTP SMS.");
    setAddOpen(false);
    setDraft({ pays: "Cameroun", num: "", op: "" });
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Mes numéros" desc={`${numbers.length} ligne(s) rattachée(s) à votre compte`}>
        <Btn variant="danger" icon={ShieldAlert} onClick={goToCompromised}>Déclarer compromis</Btn>
        <Btn variant="primary" icon={Plus} onClick={() => setAddOpen(true)}>Ajouter un numéro</Btn>
      </PageHeader>

      <Callout tone="info" title="Un compte, plusieurs numéros">
        Votre identité est votre email. Vous pouvez rattacher toutes vos cartes SIM à ce compte unique et,
        en cas de vol, déclarer la ligne concernée comme compromise sans perdre l'accès aux autres.
      </Callout>

      {numbers.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border">
          <EmptyState icon={Smartphone} title="Aucun numéro rattaché"
            desc="Ajoutez votre premier numéro pour le faire surveiller."
            action={<Btn variant="primary" icon={Plus} onClick={() => setAddOpen(true)}>Ajouter un numéro</Btn>} />
        </div>
      ) : (
        <div className="space-y-3">
          {numbers.map((n, i) => (
            <div key={n.id}
              className={`kw-in kw-d${Math.min(i + 1, 8)} kw-card bg-card rounded-2xl border p-4 flex flex-col sm:flex-row sm:items-center gap-4`}
              style={{ borderColor: n.statut === "Compromis" ? `${RED}40` : "var(--border)" }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${colorFor(n.statut)}16` }}>
                <Phone className="w-5 h-5" style={{ color: colorFor(n.statut) }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-mono font-semibold text-foreground truncate">{n.num}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {n.op} · {n.pays} · {n.statut === "Vérifié" ? `vérifié le ${n.verif}` : n.statut === "Compromis" ? "compromis" : "en attente de vérification"}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <StatusBadge status={n.statut} dot />
                {n.statut === "En attente" && (
                  <Btn variant="outline" size="sm" icon={ShieldCheck} onClick={() => verify(n)}>Vérifier</Btn>
                )}
                {n.statut === "Vérifié" && (
                  <Btn variant="outline" size="sm" icon={ShieldAlert} onClick={goToCompromised}>Compromis</Btn>
                )}
                {n.statut === "Compromis" && (
                  <Btn variant="outline" size="sm" icon={ShieldCheck} onClick={() => liftCompromised(n)}>Lever</Btn>
                )}
                <button onClick={() => remove(n)} title="Supprimer" aria-label="Supprimer"
                  className="kw-btn kw-focus p-2 rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/25">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Ajouter un numéro"
        desc="Le numéro sera vérifié par un code OTP envoyé par SMS."
        footer={
          <>
            <Btn variant="outline" onClick={() => setAddOpen(false)}>Annuler</Btn>
            <Btn variant="primary" icon={Send} loading={adding} disabled={!draft.num || !draft.op} onClick={addNumber}>
              Envoyer l'OTP
            </Btn>
          </>
        }
      >
        <FieldGrid cols={1}>
          <Field label="Pays" value={draft.pays} onChange={v => setDraft(d => ({ ...d, pays: v, op: "" }))}
            editable type="select" options={countriesData.map(c => c.pays)} required icon={MapPin} />
          <Field label="Opérateur" value={draft.op} onChange={v => setDraft(d => ({ ...d, op: v }))}
            editable type="select" options={operators} required />
          <Field label={`Numéro (${paysInfo?.indicatif ?? "+237"})`} value={draft.num}
            onChange={v => setDraft(d => ({ ...d, num: v }))} editable required mono icon={Phone}
            placeholder="6XX XXX XXX" hint="Saisissez le numéro sans l'indicatif." />
        </FieldGrid>
      </Modal>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   VÉRIFIER UN NUMÉRO (§9.2)
   ═══════════════════════════════════════════════════════════════════════════ */
function VerifyNumber({ toast }: { toast: never }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ num: string; score: number; statut: string } | null>(null);

  const analyse = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResult(null);
    await new Promise(r => setTimeout(r, 900));
    setLoading(false);
    const digits = input.replace(/\s/g, "");
    const known = numbersData.find(n => n.num.replace(/\s/g, "").endsWith(digits.slice(-6)));
    if (known) setResult({ num: input, score: known.score, statut: known.statut });
    else {
      const score = 40 + (digits.length * 7) % 55;
      setResult({ num: input, score, statut: score >= 80 ? "Sécurisé" : score >= 50 ? "À signaler" : "Frauduleux" });
    }
  };

  const color = result ? (result.score >= 80 ? GREEN : result.score >= 50 ? ORANGE : RED) : BLUE;

  return (
    <div className="space-y-5 max-w-2xl">
      <PageHeader title="Vérifier un numéro" desc="Analysez un numéro avant d'envoyer de l'argent ou de répondre" />

      <FormCard>
        <SectionHeader title="Numéro à vérifier" icon={Search} />
        <div className="flex flex-col sm:flex-row gap-2">
          <input value={input} onChange={e => setInput(e.target.value)}
            placeholder="+237 6XX XXX XXX" className={`${fieldCls()} font-mono flex-1`}
            onKeyDown={e => { if (e.key === "Enter") analyse(); }} />
          <Btn variant="primary" icon={Search} loading={loading} disabled={!input.trim()} onClick={analyse}>
            Vérifier
          </Btn>
        </div>
      </FormCard>

      {!result && !loading && (
        <Callout tone="info" title="Conseil d'usage">
          Vérifiez systématiquement un numéro inconnu avant tout transfert Mobile Money. Un score faible
          signale un risque élevé de fraude.
        </Callout>
      )}

      {result && (
        <div className="kw-in rounded-2xl border p-6 text-center" style={{ borderColor: `${color}40`, background: `${color}08` }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: `${color}18` }}>
            {result.score >= 80 ? <ShieldCheck className="w-8 h-8" style={{ color }} />
              : result.score >= 50 ? <AlertTriangle className="w-8 h-8" style={{ color }} />
              : <ShieldOff className="w-8 h-8" style={{ color }} />}
          </div>
          <p className="font-mono font-semibold text-foreground text-lg">{result.num}</p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <StatusBadge status={result.statut} dot />
            <ScoreBadge score={result.score} />
          </div>
          <p className="text-sm text-muted-foreground mt-4 max-w-sm mx-auto leading-relaxed">
            {result.score >= 80 ? "Ce numéro paraît fiable. Restez néanmoins vigilant."
              : result.score >= 50 ? "Ce numéro présente un risque modéré. Vérifiez l'identité de votre interlocuteur."
              : "Ce numéro est à haut risque. Ne transférez aucun argent et signalez-le."}
          </p>
          <div className="mt-5 flex justify-center gap-2">
            <Btn variant="outline" icon={AlertTriangle} onClick={() => (toast as never as Function)("info", "Signalement pré-rempli (démo).")}>
              Signaler
            </Btn>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SIGNALER UNE FRAUDE (§9.7)
   ═══════════════════════════════════════════════════════════════════════════ */
function ReportFraud({ toast }: { toast: never }) {
  const [num, setNum] = useState("");
  const [reason, setReason] = useState("");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async () => {
    if (!num.trim() || !reason) { (toast as never as Function)("error", "Numéro et motif requis."); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    setLoading(false);
    setDone(true);
    (toast as never as Function)("success", "Signalement transmis. Merci !");
  };

  const reset = () => { setNum(""); setReason(""); setDesc(""); setDone(false); };

  if (done) {
    return (
      <div className="max-w-2xl">
        <PageHeader title="Signaler une fraude" desc="Aidez la communauté à se protéger" />
        <FormCard>
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 kw-pop" style={{ background: `${GREEN}18` }}>
              <Check className="w-8 h-8" style={{ color: GREEN }} strokeWidth={2.5} />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Merci pour votre signalement</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              Votre contribution renforce la protection de millions d'utilisateurs. Chaque signalement
              alimente notre détection communautaire.
            </p>
            <Btn variant="primary" icon={Plus} className="mt-6" onClick={reset}>Nouveau signalement</Btn>
          </div>
        </FormCard>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <PageHeader title="Signaler une fraude" desc="Aidez la communauté à se protéger" />

      <FormCard>
        <FieldGrid cols={1}>
          <Field label="Numéro concerné" value={num} onChange={setNum} editable required mono icon={Phone}
            placeholder="+237 6XX XXX XXX" />
          <Field label="Motif" value={reason} onChange={setReason} editable type="select"
            options={REPORT_REASONS} required icon={AlertTriangle} />
          <Field label="Description (optionnel)" value={desc} onChange={setDesc} editable type="textarea"
            rows={4} placeholder="Décrivez ce qui s'est passé…" />
        </FieldGrid>
        <div className="flex justify-end mt-4">
          <Btn variant="primary" icon={Send} loading={loading} onClick={submit}>Envoyer le signalement</Btn>
        </div>
      </FormCard>

      <Callout tone="info" title="Impact de votre signalement">
        Les signalements alimentent l'entraînement continu du modèle de détection et permettent d'alerter
        les autres utilisateurs plus rapidement.
      </Callout>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   PROFIL & SÉCURITÉ (§9.9)
   ═══════════════════════════════════════════════════════════════════════════ */
function UserProfile({ toast }: { toast: never }) {
  const [photo, setPhoto] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const f = useFormState({
    nom: currentUser.nom, prenom: currentUser.prenom, email: currentUser.email,
    langue: "Français", tz: "Africa/Douala",
  }, "view");
  const [biometric, setBiometric] = useState(false);
  const [remember, setRemember] = useState(true);
  const [callDetection, setCallDetection] = useState(true);

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

  const Toggle = ({ on, onToggle }: { on: boolean; onToggle: () => void }) => (
    <button onClick={onToggle} role="switch" aria-checked={on}
      className="kw-btn kw-focus relative w-11 h-6 rounded-full transition-colors shrink-0"
      style={{ background: on ? GREEN : "var(--border)" }}>
      <span className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform"
        style={{ transform: on ? "translateX(20px)" : "translateX(0)" }} />
    </button>
  );

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader title="Mon profil" desc="Gérez vos informations et votre sécurité">
        {f.mode === "view" ? (
          <Btn variant="primary" icon={User} onClick={() => f.setMode("edit")}>Modifier</Btn>
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
            <Avatar name={`${f.draft.prenom} ${f.draft.nom}`} src={photo} size={84} color={BLUE} />
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
            <div className="mt-2 inline-flex items-center gap-1.5 text-xs" style={{ color: GREEN }}>
              <Check className="w-3 h-3" />Email vérifié
            </div>
          </div>
        </div>

        <div className="pt-6">
          <FieldGrid>
            <Field label="Prénom" value={f.draft.prenom} onChange={f.set("prenom")} editable={editable} required />
            <Field label="Nom" value={f.draft.nom} onChange={f.set("nom")} editable={editable} required />
            <Field label="Email" value={f.draft.email} onChange={f.set("email")} editable={editable} type="email" icon={Mail} required className="sm:col-span-2" />
            <Field label="Langue" value={f.draft.langue} onChange={f.set("langue")} editable={editable}
              type="select" options={["Français", "English"]} />
            <Field label="Fuseau horaire" value={f.draft.tz} onChange={f.set("tz")} editable={editable}
              type="select" options={["Africa/Douala", "Africa/Abidjan", "Africa/Dakar", "Africa/Lagos"]} />
          </FieldGrid>
        </div>
      </FormCard>

      <FormCard title="Sécurité" icon={KeyRound}>
        <div className="space-y-4">
          {[
            { label: "Verrouillage biométrique", desc: "Empreinte ou reconnaissance faciale à l'ouverture", on: biometric, toggle: () => setBiometric(b => !b) },
            { label: "Se souvenir de moi", desc: "Rester connecté sur cet appareil", on: remember, toggle: () => setRemember(r => !r) },
            { label: "Détection d'appel suspect", desc: "Alerte lors d'un appel entrant frauduleux", on: callDetection, toggle: () => setCallDetection(c => !c) },
          ].map(row => (
            <div key={row.label} className="flex items-center justify-between gap-4 py-1">
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">{row.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{row.desc}</p>
              </div>
              <Toggle on={row.on} onToggle={row.toggle} />
            </div>
          ))}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-border">
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">Mot de passe</p>
              <p className="text-xs text-muted-foreground mt-0.5">Dernière modification il y a 2 mois</p>
            </div>
            <Btn variant="outline" icon={KeyRound}
              onClick={() => (toast as never as Function)("info", "Un email de réinitialisation vous a été envoyé.")}>
              Modifier le mot de passe
            </Btn>
          </div>
        </div>
      </FormCard>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   NOTIFICATIONS
   ═══════════════════════════════════════════════════════════════════════════ */
function UserNotifications({
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
    <div className="space-y-5 max-w-3xl">
      <PageHeader title="Notifications" desc={`${unread} non lue(s) sur ${notifications.length}`}>
        <Btn variant="outline" icon={Check} disabled={unread === 0}
          onClick={() => { setNotifications(n => n.map(x => ({ ...x, read: true }))); (toast as never as Function)("info", "Toutes marquées comme lues."); }}>
          Tout marquer lu
        </Btn>
      </PageHeader>

      <SegmentedControl options={["Toutes", "Non lues"] as const} value={filter} onChange={setFilter} />

      {shown.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border">
          <EmptyState title="Aucune notification"
            desc={filter === "Non lues" ? "Toutes vos notifications ont été lues." : "Vous n'avez aucune notification."} />
        </div>
      ) : (
        <div className="space-y-2.5">
          {shown.map((n, i) => (
            <div key={n.id}
              onClick={() => setNotifications(ns => ns.map(x => (x.id === n.id ? { ...x, read: true } : x)))}
              className={`kw-in kw-d${Math.min(i + 1, 8)} kw-card flex items-start gap-4 px-5 py-4 rounded-2xl border cursor-pointer`}
              style={{ background: n.read ? "var(--card)" : `${colors[n.type]}08`, borderColor: n.read ? "var(--border)" : `${colors[n.type]}35` }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${colors[n.type]}18` }}>
                {n.type === "danger" ? <ShieldAlert className="w-4 h-4" style={{ color: colors[n.type] }} />
                  : n.type === "success" ? <ShieldCheck className="w-4 h-4" style={{ color: colors[n.type] }} />
                  : <AlertTriangle className="w-4 h-4" style={{ color: colors[n.type] }} />}
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
   ESPACE UTILISATEUR
   ═══════════════════════════════════════════════════════════════════════════ */
export function UserSpace({
  darkMode, toggleDark, onLogout,
}: { darkMode: boolean; toggleDark: () => void; onLogout: () => void }) {
  const [section, setSection] = useState<UserSection>("home");
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [numbers, setNumbers] = useState<UserNumber[]>(currentUser.numeros);
  const [notifications, setNotifications] = useState<Notification[]>(userNotificationsInit);

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
          <SidebarContent section={section} setSection={setSection} collapsed={false}
            onLogout={handleLogout} onClose={() => setDrawerOpen(false)} />
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
            {section === "home" && <UserHome numbers={numbers} setSection={setSection} />}
            {section === "compromised" && (
              <CompromisedFlow
                numbers={numbers}
                setNumbers={setNumbers}
                contacts={userContacts}
                toast={toast as never}
                confirm={confirm as never}
                goToNumbers={() => setSection("numbers")}
              />
            )}
            {section === "numbers" && (
              <UserNumbers
                numbers={numbers}
                setNumbers={setNumbers}
                toast={toast as never}
                confirm={confirm as never}
                goToCompromised={() => setSection("compromised")}
              />
            )}
            {section === "verify" && <VerifyNumber toast={toast as never} />}
            {section === "report" && <ReportFraud toast={toast as never} />}
            {section === "profile" && <UserProfile toast={toast as never} />}
            {section === "notifications" && (
              <UserNotifications notifications={notifications} setNotifications={setNotifications} toast={toast as never} />
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