/* ═══════════════════════════════════════════════════════════════════════════
   KWISMO — Design System partagé
   Aucun fichier CSS externe : toutes les animations et classes utilitaires
   sont injectées dans le <head> au chargement du module.
   ═══════════════════════════════════════════════════════════════════════════ */

import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import type { ReactNode, ElementType, CSSProperties } from "react";
import {
  X, ChevronLeft, ChevronRight, ChevronDown, Shield, Search, Filter,
  Inbox, AlertCircle, RefreshCw, Loader2, Check, Pencil, Plus, Trash2,
  ArrowLeft, Eye, EyeOff, Info,
} from "lucide-react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import type { Lang, DataState, FormMode, PermModule, Role } from "./data";
import { BLUE, RED, ORANGE, GREEN, T } from "./data";

/* ═══════════════════════════════════════════════════════════════════════════
   0. INJECTION DES STYLES — remplace intégralement le fichier CSS
   ═══════════════════════════════════════════════════════════════════════════ */
const KWISMO_STYLES = `
/* ─── Keyframes ─────────────────────────────────────────────────────────── */
@keyframes kw-fade-up   { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:none; } }
@keyframes kw-fade-in   { from { opacity:0; } to { opacity:1; } }
@keyframes kw-slide-in  { from { opacity:0; transform:translateX(24px); } to { opacity:1; transform:none; } }
@keyframes kw-slide-left{ from { opacity:0; transform:translateX(-16px); } to { opacity:1; transform:none; } }
@keyframes kw-pop       { 0% { opacity:0; transform:scale(.8);} 60% { transform:scale(1.04);} 100% { opacity:1; transform:scale(1);} }
@keyframes kw-shake     { 0%,100% { transform:translateX(0);} 20% { transform:translateX(-7px);} 40% { transform:translateX(7px);} 60% { transform:translateX(-4px);} 80% { transform:translateX(4px);} }
@keyframes kw-float     { 0%,100% { transform:translateY(0);} 50% { transform:translateY(-9px);} }
@keyframes kw-pulse     { 0% { box-shadow:0 0 0 0 rgba(47,172,102,.45);} 70% { box-shadow:0 0 0 10px rgba(47,172,102,0);} 100% { box-shadow:0 0 0 0 rgba(47,172,102,0);} }
@keyframes kw-shimmer   { 0% { background-position:-500px 0; } 100% { background-position:500px 0; } }
@keyframes kw-spin      { to { transform:rotate(360deg); } }
@keyframes kw-scale-in  { from { opacity:0; transform:scale(.96) translateY(8px);} to { opacity:1; transform:none;} }
@keyframes kw-drawer    { from { transform:translateX(100%);} to { transform:translateX(0);} }

/* ─── Classes d'animation ───────────────────────────────────────────────── */
.kw-in        { animation: kw-fade-up .5s cubic-bezier(.22,1,.36,1) both; }
.kw-fade      { animation: kw-fade-in .35s ease both; }
.kw-slide     { animation: kw-slide-in .3s cubic-bezier(.22,1,.36,1) both; }
.kw-slide-l   { animation: kw-slide-left .35s cubic-bezier(.22,1,.36,1) both; }
.kw-pop       { animation: kw-pop .45s cubic-bezier(.34,1.56,.64,1) both; }
.kw-shake     { animation: kw-shake .45s ease-in-out; }
.kw-float     { animation: kw-float 6s ease-in-out infinite; }
.kw-pulse     { animation: kw-pulse 2.4s ease-out infinite; }
.kw-scale-in  { animation: kw-scale-in .25s cubic-bezier(.22,1,.36,1) both; }
.kw-drawer    { animation: kw-drawer .28s cubic-bezier(.22,1,.36,1) both; }

/* Retards en cascade pour les listes et grilles */
.kw-d1 { animation-delay:.04s } .kw-d2 { animation-delay:.08s }
.kw-d3 { animation-delay:.12s } .kw-d4 { animation-delay:.16s }
.kw-d5 { animation-delay:.20s } .kw-d6 { animation-delay:.24s }
.kw-d7 { animation-delay:.28s } .kw-d8 { animation-delay:.32s }

/* ─── Interactions ──────────────────────────────────────────────────────── */
.kw-card {
  transition: transform .3s cubic-bezier(.22,1,.36,1),
              box-shadow .3s cubic-bezier(.22,1,.36,1),
              border-color .25s ease;
}
.kw-card:hover { transform: translateY(-3px); box-shadow: 0 14px 32px -16px rgba(0,0,0,.26); }

.kw-btn { transition: transform .18s cubic-bezier(.22,1,.36,1), opacity .18s ease, background-color .18s ease, border-color .18s ease; }
.kw-btn:hover:not(:disabled)  { transform: translateY(-1px); }
.kw-btn:active:not(:disabled) { transform: translateY(0) scale(.97); }

.kw-row { transition: background-color .18s ease; }

/* Squelettes de chargement */
.kw-skel {
  background: linear-gradient(90deg, var(--secondary) 25%, var(--muted) 50%, var(--secondary) 75%);
  background-size: 500px 100%;
  animation: kw-shimmer 1.4s linear infinite;
  border-radius: 8px;
}

/* Champ en lecture seule : aspect input mais non éditable */
.kw-field-ro {
  background: var(--secondary);
  border-color: transparent;
  cursor: default;
  color: var(--foreground);
  opacity: 1;
  -webkit-text-fill-color: var(--foreground);
}

/* Barre de défilement discrète et harmonisée */
.kw-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
.kw-scroll::-webkit-scrollbar-track { background: transparent; }
.kw-scroll::-webkit-scrollbar-thumb { background: var(--border); border-radius: 99px; }
.kw-scroll::-webkit-scrollbar-thumb:hover { background: var(--muted-foreground); }
.kw-scroll { scrollbar-width: thin; scrollbar-color: var(--border) transparent; }

/* Focus visible conforme WCAG 2.1 AA */
.kw-focus:focus-visible {
  outline: 2px solid ${BLUE};
  outline-offset: 2px;
  border-radius: 8px;
}

/* Défilement sans barre visible */
.kw-scroll::-webkit-scrollbar { width: 0; height: 0; display: none; }
.kw-scroll { scrollbar-width: none; -ms-overflow-style: none; }

/* Applique la règle globalement, y compris aux conteneurs sans .kw-scroll */
*::-webkit-scrollbar { width: 0; height: 0; display: none; }
* { scrollbar-width: none; -ms-overflow-style: none; }

/* Masque la molette des inputs number */
.kw-no-spin::-webkit-outer-spin-button,
.kw-no-spin::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
.kw-no-spin { -moz-appearance: textfield; }

/* ─── Accessibilité : mouvement réduit ──────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  .kw-in,.kw-fade,.kw-slide,.kw-slide-l,.kw-pop,.kw-shake,.kw-float,
  .kw-pulse,.kw-scale-in,.kw-drawer,.kw-skel {
    animation: none !important; opacity: 1 !important; transform: none !important;
  }
  .kw-card:hover, .kw-btn:hover { transform: none; }
}
`;

if (typeof document !== "undefined" && !document.getElementById("kwismo-design-system")) {
  const el = document.createElement("style");
  el.id = "kwismo-design-system";
  el.textContent = KWISMO_STYLES;
  document.head.appendChild(el);
}

/* ═══════════════════════════════════════════════════════════════════════════
   1. CONTEXTE LANGUE
   ═══════════════════════════════════════════════════════════════════════════ */
export const LangCtx = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({
  lang: "fr",
  setLang: () => {},
});
export const useLang = () => useContext(LangCtx);

/* ═══════════════════════════════════════════════════════════════════════════
   2. JETONS DE STYLE PARTAGÉS
   Une seule source de vérité : tous les champs du projet utilisent ces classes.
   ═══════════════════════════════════════════════════════════════════════════ */
export const FIELD_BASE =
  "w-full rounded-xl text-sm border transition-all focus:outline-none focus:ring-2 focus:ring-offset-0";

export const FIELD_SIZES = {
  sm: "px-3 py-2 text-xs",
  md: "px-3.5 py-2.5 text-sm",
  lg: "px-4 py-3 text-sm",
} as const;

/** Classe d'un champ éditable */
export function fieldCls(opts?: { error?: boolean; size?: keyof typeof FIELD_SIZES; readOnly?: boolean }) {
  const { error, size = "md", readOnly } = opts ?? {};
  if (readOnly) return `${FIELD_BASE} ${FIELD_SIZES[size]} kw-field-ro`;
  return [
    FIELD_BASE,
    FIELD_SIZES[size],
    "bg-card text-foreground placeholder:text-muted-foreground",
    error ? "border-red-500 focus:ring-red-500/40" : "border-border focus:ring-primary/40 hover:border-primary/40",
  ].join(" ");
}

/** Hauteur unifiée des contrôles de barre d'outils — évite le désalignement */
export const CONTROL_H = "h-[42px]";

/* ═══════════════════════════════════════════════════════════════════════════
   3. BOUTON
   ═══════════════════════════════════════════════════════════════════════════ */
export type BtnVariant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "success";
export type BtnSize = "sm" | "md" | "lg" | "icon" | "iconSm";

export function Btn({
  children, icon: Icon, iconRight: IconRight, variant = "primary", size = "md",
  onClick, disabled, loading, className = "", type = "button", title, style, fullWidth,
}: {
  children?: ReactNode;
  icon?: ElementType;
  iconRight?: ElementType;
  variant?: BtnVariant;
  size?: BtnSize;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  type?: "button" | "submit";
  title?: string;
  style?: CSSProperties;
  fullWidth?: boolean;
}) {
  const base =
    "kw-btn kw-focus inline-flex items-center justify-center gap-2 font-medium shrink-0 cursor-pointer " +
    "disabled:opacity-50 disabled:pointer-events-none select-none whitespace-nowrap";

  const variants: Record<BtnVariant, string> = {
    primary: "text-white hover:opacity-90 shadow-sm",
    secondary: "bg-secondary text-foreground hover:bg-muted border border-border",
    outline: "border border-border text-foreground hover:bg-secondary hover:border-primary/40",
    ghost: "text-muted-foreground hover:text-foreground hover:bg-secondary",
    danger: "text-white hover:opacity-90 shadow-sm",
    success: "text-white hover:opacity-90 shadow-sm",
  };

  const sizes: Record<BtnSize, string> = {
    sm: "px-3 py-1.5 text-xs rounded-lg",
    md: `px-4 ${CONTROL_H} text-sm rounded-xl`,
    lg: "px-5 py-3 text-sm rounded-xl",
    icon: `w-[42px] ${CONTROL_H} rounded-xl`,
    iconSm: "w-8 h-8 rounded-lg",
  };

  const bg =
    variant === "primary" ? { background: BLUE }
    : variant === "danger" ? { background: RED }
    : variant === "success" ? { background: GREEN }
    : {};

  const iconSize = size === "sm" || size === "iconSm" ? 14 : 16;
  const Spinner = loading ? Loader2 : null;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      title={title}
      aria-label={title}
      style={{ ...bg, ...style }}
      className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? "w-full" : ""} ${className}`}
    >
      {Spinner ? (
        <Spinner style={{ width: iconSize, height: iconSize }} className="animate-spin shrink-0" />
      ) : Icon ? (
        <Icon style={{ width: iconSize, height: iconSize }} className="shrink-0" />
      ) : null}
      {children}
      {IconRight && !loading && <IconRight style={{ width: iconSize, height: iconSize }} className="shrink-0" />}
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   4. MODALE & DIALOGUE DE CONFIRMATION
   ═══════════════════════════════════════════════════════════════════════════ */
export function Modal({
  open, onClose, title, desc, children, size = "md", footer,
}: {
  open: boolean; onClose: () => void; title: string; desc?: string;
  children: ReactNode; size?: "sm" | "md" | "lg" | "xl"; footer?: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [open, onClose]);

  if (!open) return null;
  const w = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-4xl" };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm kw-fade" onClick={onClose} />
      <div className={`kw-scale-in kw-scroll relative bg-card rounded-t-2xl sm:rounded-2xl border border-border shadow-2xl w-full ${w[size]} max-h-[92vh] sm:max-h-[88vh] overflow-y-auto`}>
        <div className="flex items-start justify-between gap-4 px-5 sm:px-6 py-4 border-b border-border sticky top-0 bg-card rounded-t-2xl z-10">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-foreground">{title}</h2>
            {desc && <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>}
          </div>
          <Btn icon={X} variant="ghost" size="iconSm" onClick={onClose} title="Fermer" />
        </div>
        <div className="p-5 sm:p-6">{children}</div>
        {footer && <div className="px-5 sm:px-6 py-4 border-t border-border sticky bottom-0 bg-card flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}

export function ConfirmDialog({
  open, onClose, onConfirm, title, desc, danger = false, confirmLabel,
}: {
  open: boolean; onClose: () => void; onConfirm: () => void;
  title: string; desc: string; danger?: boolean; confirmLabel?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4" role="alertdialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm kw-fade" onClick={onClose} />
      <div className="kw-scale-in relative bg-card rounded-2xl border border-border shadow-2xl w-full max-w-sm p-6">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
          style={{ background: danger ? `${RED}18` : `${BLUE}15` }}>
          <AlertCircle className="w-5 h-5" style={{ color: danger ? RED : BLUE }} />
        </div>
        <h2 className="text-base font-bold text-foreground mb-2">{title}</h2>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{desc}</p>
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
          <Btn variant="outline" onClick={onClose}>Annuler</Btn>
          <Btn variant={danger ? "danger" : "primary"} onClick={() => { onConfirm(); onClose(); }}>
            {confirmLabel ?? "Confirmer"}
          </Btn>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   5. TOASTS
   ═══════════════════════════════════════════════════════════════════════════ */
type ToastType = "success" | "error" | "info" | "warning";
export type Toast = { id: number; type: ToastType; msg: string };

export function ToastContainer({ toasts, remove }: { toasts: Toast[]; remove: (id: number) => void }) {
  const colors: Record<ToastType, string> = { success: GREEN, error: RED, warning: ORANGE, info: BLUE };
  const icons: Record<ToastType, ElementType> = { success: Check, error: X, warning: AlertCircle, info: Info };

  return (
    <div className="fixed bottom-4 right-4 left-4 sm:left-auto z-[200] flex flex-col gap-2 pointer-events-none sm:max-w-[340px]">
      {toasts.map(t => {
        const Icon = icons[t.type];
        return (
          <div key={t.id}
            role="status"
            className="kw-slide flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg pointer-events-auto bg-card"
            style={{ borderColor: `${colors[t.type]}40` }}>
            <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
              style={{ background: `${colors[t.type]}20` }}>
              <Icon className="w-3 h-3" style={{ color: colors[t.type] }} />
            </div>
            <span className="text-sm font-medium text-foreground flex-1 leading-snug">{t.msg}</span>
            <button onClick={() => remove(t.id)} aria-label="Fermer"
              className="text-muted-foreground hover:text-foreground shrink-0 kw-focus">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   6. ÉTATS DE DONNÉES (§1.2) — Chargement / Vide / Erreur
   ═══════════════════════════════════════════════════════════════════════════ */
export function Skeleton({ className = "", w, h = 16 }: { className?: string; w?: number | string; h?: number }) {
  return <div className={`kw-skel ${className}`} style={{ width: w ?? "100%", height: h }} />;
}

export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <tbody className="divide-y divide-border">
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r}>
          {Array.from({ length: cols }).map((__, c) => (
            <td key={c} className="px-4 py-3.5">
              <Skeleton w={c === 0 ? "70%" : "50%"} h={14} />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}

export function CardSkeleton({ count = 6 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-card rounded-2xl border border-border p-5 space-y-3">
          <div className="flex justify-between">
            <Skeleton w={40} h={40} className="rounded-xl" />
            <Skeleton w={52} h={20} className="rounded-full" />
          </div>
          <Skeleton w="60%" h={26} />
          <Skeleton w="45%" h={12} />
          <Skeleton h={38} />
        </div>
      ))}
    </>
  );
}

export function EmptyState({
  icon: Icon = Inbox, title, desc, action,
}: { icon?: ElementType; title: string; desc?: string; action?: ReactNode }) {
  return (
    <div className="kw-in flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: `${BLUE}10` }}>
        <Icon className="w-6 h-6" style={{ color: BLUE }} />
      </div>
      <p className="font-semibold text-foreground">{title}</p>
      {desc && <p className="text-sm text-muted-foreground mt-1.5 max-w-sm leading-relaxed">{desc}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ desc, onRetry }: { desc?: string; onRetry?: () => void }) {
  const { lang } = useLang();
  const tx = T[lang].states;
  return (
    <div className="kw-in flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: `${RED}15` }}>
        <AlertCircle className="w-6 h-6" style={{ color: RED }} />
      </div>
      <p className="font-semibold text-foreground">{tx.error}</p>
      {desc && <p className="text-sm text-muted-foreground mt-1.5 max-w-sm">{desc}</p>}
      {onRetry && <Btn variant="outline" icon={RefreshCw} className="mt-5" onClick={onRetry}>{tx.retry}</Btn>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   7. BARRE D'OUTILS — recherche à gauche, filtres à droite, hauteurs alignées
   ═══════════════════════════════════════════════════════════════════════════ */
export interface FilterDef {
  key: string;
  label: string;
  options: string[];
}

export function FilterToolbar({
  search, onSearch, placeholder = "Rechercher…",
  filters = [], values = {}, onFilterChange,
  actions, resultCount,
}: {
  search: string;
  onSearch: (v: string) => void;
  placeholder?: string;
  filters?: FilterDef[];
  values?: Record<string, string>;
  onFilterChange?: (v: Record<string, string>) => void;
  actions?: ReactNode;
  resultCount?: number;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeCount = Object.values(values).filter(Boolean).length;
  const hasFilters = filters.length > 0;

  const selectCls =
    `${FIELD_BASE} ${CONTROL_H} pl-3.5 pr-9 bg-card border-border text-foreground cursor-pointer ` +
    "appearance-none hover:border-primary/40 focus:ring-primary/40";

  return (
    <div className="space-y-3">
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">

        {/* Recherche — à gauche, s'étire */}
        <div className="relative flex-1 min-w-0 lg:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            value={search}
            onChange={e => onSearch(e.target.value)}
            placeholder={placeholder}
            aria-label={placeholder}
            className={`${fieldCls()} ${CONTROL_H} pl-10 ${search ? "pr-10" : "pr-3.5"}`}
          />
          {search && (
            <button
              onClick={() => onSearch("")}
              aria-label="Effacer la recherche"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground kw-focus">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filtres + actions — à droite */}
        <div className="flex items-center gap-2 lg:ml-auto">

          {/* Bouton filtres sur mobile */}
          {hasFilters && (
            <Btn
              variant="outline"
              size="md"
              icon={Filter}
              className="lg:hidden"
              onClick={() => setMobileOpen(o => !o)}
              title="Filtres">
              Filtres
              {activeCount > 0 && (
                <span className="ml-0.5 w-5 h-5 rounded-full text-[10px] font-bold text-white flex items-center justify-center"
                  style={{ background: BLUE }}>
                  {activeCount}
                </span>
              )}
            </Btn>
          )}

          {/* Filtres sur desktop */}
          {hasFilters && (
            <div className="hidden lg:flex items-center gap-2">
              <div className={`${CONTROL_H} w-[42px] rounded-xl border border-border bg-card flex items-center justify-center shrink-0`}
                title="Filtrer" aria-hidden="true">
                <Filter className="w-4 h-4 text-muted-foreground" />
              </div>

              {filters.map(({ key, label, options }) => (
                <div key={key} className="relative">
                  <select
                    value={values[key] || ""}
                    onChange={e => onFilterChange?.({ ...values, [key]: e.target.value })}
                    aria-label={label}
                    className={selectCls}
                    style={values[key] ? { borderColor: BLUE, color: BLUE, fontWeight: 500 } : undefined}>
                    <option value="">{label}</option>
                    {options.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                </div>
              ))}

              {activeCount > 0 && (
                <Btn variant="ghost" size="icon" icon={X} title="Effacer les filtres"
                  onClick={() => onFilterChange?.({})} />
              )}
            </div>
          )}

          {actions}
        </div>
      </div>

      {/* Panneau de filtres mobile */}
      {hasFilters && mobileOpen && (
        <div className="lg:hidden kw-in bg-card border border-border rounded-2xl p-4 space-y-3">
          {filters.map(({ key, label, options }) => (
            <div key={key}>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">{label}</label>
              <div className="relative">
                <select
                  value={values[key] || ""}
                  onChange={e => onFilterChange?.({ ...values, [key]: e.target.value })}
                  className={`${selectCls} w-full`}>
                  <option value="">Tous</option>
                  {options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
                <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          ))}
          {activeCount > 0 && (
            <Btn variant="ghost" size="sm" icon={X} fullWidth onClick={() => onFilterChange?.({})}>
              Effacer les filtres
            </Btn>
          )}
        </div>
      )}

      {/* Puces de filtres actifs */}
      {activeCount > 0 && (
        <div className="hidden lg:flex flex-wrap items-center gap-2">
          {Object.entries(values).filter(([, v]) => v).map(([k, v]) => (
            <span key={k}
              className="kw-pop inline-flex items-center gap-1.5 pl-3 pr-2 py-1 rounded-full text-xs font-medium"
              style={{ background: `${BLUE}12`, color: BLUE }}>
              {v}
              <button onClick={() => onFilterChange?.({ ...values, [k]: "" })}
                aria-label={`Retirer le filtre ${v}`} className="hover:opacity-60">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {resultCount !== undefined && (
            <span className="text-xs text-muted-foreground ml-1">
              {resultCount} résultat{resultCount !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   8. PAGINATION
   ═══════════════════════════════════════════════════════════════════════════ */
export function Pagination({
  total, page, setPage, pageSize, setPageSize,
}: {
  total: number; page: number; setPage: (n: number) => void;
  pageSize: number; setPageSize: (n: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(page, totalPages);
  const windowSize = Math.min(5, totalPages);
  const start = Math.max(1, Math.min(current - 2, totalPages - windowSize + 1));
  const pages = Array.from({ length: windowSize }, (_, i) => start + i);

  const from = total === 0 ? 0 : (current - 1) * pageSize + 1;
  const to = Math.min(current * pageSize, total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground order-2 sm:order-1">
        <span className="hidden md:inline">Lignes :</span>
        <div className="flex items-center gap-1">
          {[5, 10, 25, 50].map(n => (
            <button key={n} onClick={() => { setPageSize(n); setPage(1); }}
              aria-label={`${n} lignes par page`}
              className="w-8 h-8 rounded-lg text-xs font-medium kw-btn kw-focus hover:bg-secondary"
              style={pageSize === n ? { background: BLUE, color: "#fff" } : { color: "var(--muted-foreground)" }}>
              {n}
            </button>
          ))}
        </div>
        <span className="opacity-40">·</span>
        <span className="whitespace-nowrap">{from}–{to} sur {total}</span>
      </div>

      <div className="flex items-center gap-1 order-1 sm:order-2">
        <button onClick={() => setPage(1)} disabled={current === 1} aria-label="Première page"
          className="w-8 h-8 rounded-lg text-xs text-muted-foreground hover:bg-secondary disabled:opacity-30 kw-btn kw-focus">«</button>
        <Btn icon={ChevronLeft} variant="ghost" size="iconSm" title="Page précédente"
          onClick={() => setPage(Math.max(1, current - 1))} disabled={current === 1} />
        {pages.map(p => (
          <button key={p} onClick={() => setPage(p)} aria-current={current === p ? "page" : undefined}
            className="w-8 h-8 rounded-lg text-xs font-semibold kw-btn kw-focus hover:bg-secondary"
            style={current === p ? { background: BLUE, color: "#fff" } : { color: "var(--muted-foreground)" }}>
            {p}
          </button>
        ))}
        <Btn icon={ChevronRight} variant="ghost" size="iconSm" title="Page suivante"
          onClick={() => setPage(Math.min(totalPages, current + 1))} disabled={current === totalPages} />
        <button onClick={() => setPage(totalPages)} disabled={current === totalPages} aria-label="Dernière page"
          className="w-8 h-8 rounded-lg text-xs text-muted-foreground hover:bg-secondary disabled:opacity-30 kw-btn kw-focus">»</button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   9. BADGES
   ═══════════════════════════════════════════════════════════════════════════ */
const BADGE_MAP: Record<string, { bg: string; fg: string }> = {
  // Statuts de compte
  "Actif":       { bg: "rgba(47,172,102,.14)", fg: GREEN },
  "Suspendu":    { bg: "rgba(243,146,0,.14)",  fg: ORANGE },
  "Inactif":     { bg: "rgba(120,130,150,.16)", fg: "#6B7280" },
  "En attente":  { bg: "rgba(45,46,131,.12)",  fg: BLUE },
  // Statuts de numéro — analyse
  "Sécurisé":    { bg: "rgba(47,172,102,.14)", fg: GREEN },
  "À signaler":  { bg: "rgba(243,146,0,.14)",  fg: ORANGE },
  "Frauduleux":  { bg: "rgba(228,72,59,.14)",  fg: RED },
  // Statuts de numéro — possession
  "Vérifié":     { bg: "rgba(47,172,102,.14)", fg: GREEN },
  "Compromis":   { bg: "rgba(228,72,59,.14)",  fg: RED },
  // Rôles
  "Admin":       { bg: "rgba(45,46,131,.12)",  fg: BLUE },
  "Partenaire":  { bg: "rgba(124,58,237,.14)", fg: "#7C3AED" },
  "Analyste":    { bg: "rgba(8,145,178,.14)",  fg: "#0891B2" },
  "Support":     { bg: "rgba(243,146,0,.14)",  fg: ORANGE },
  // Types de partenaire
  "Opérateur":   { bg: "rgba(79,70,229,.14)",  fg: "#4F46E5" },
  "Fintech":     { bg: "rgba(8,145,178,.14)",  fg: "#0891B2" },
  "Banque":      { bg: "rgba(45,46,131,.12)",  fg: BLUE },
  "Régulateur":  { bg: "rgba(219,39,119,.14)", fg: "#DB2777" },
};

export function StatusBadge({ status, dot = false }: { status: string; dot?: boolean }) {
  const c = BADGE_MAP[status] ?? { bg: "rgba(120,130,150,.16)", fg: "#6B7280" };
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap"
      style={{ background: c.bg, color: c.fg }}>
      {dot && <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: c.fg }} />}
      {status}
    </span>
  );
}

export function ScoreBadge({ score }: { score: number }) {
  const color = score >= 80 ? GREEN : score >= 50 ? ORANGE : RED;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
      style={{ background: `${color}1F`, color }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
      {score}
    </span>
  );
}

/** Compteur générique — utilisé pour « 3 numéros » avec pastille d'alerte (§8.2) */
export function CountBadge({ count, label, alert }: { count: number; label: string; alert?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="px-2 py-0.5 rounded-lg text-xs font-semibold"
        style={{ background: `${BLUE}12`, color: BLUE }}>
        {count} {label}{count !== 1 ? "s" : ""}
      </span>
      {alert && (
        <span className="w-2 h-2 rounded-full kw-pulse shrink-0" style={{ background: RED }}
          title="Un numéro est déclaré compromis" />
      )}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   10. LOGO & BOUTONS DE STORE
   ═══════════════════════════════════════════════════════════════════════════ */
export function Logo({ white = false, compact = false }: { white?: boolean; compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5 select-none">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: white ? "rgba(255,255,255,.22)" : BLUE }}>
        <Shield className="w-4 h-4 text-white" strokeWidth={2.5} />
      </div>
      {!compact && (
        <span className="font-bold text-[17px] tracking-tight" style={{ color: white ? "#fff" : BLUE }}>
          KWISMO
        </span>
      )}
    </div>
  );
}

export function AppleStoreBtn({ label }: { label: string }) {
  return (
    <button className="kw-btn flex items-center gap-3 px-5 py-3 rounded-[14px]" style={{ background: "#111", color: "#fff" }}>
      <svg viewBox="0 0 814 1000" className="w-6 h-6 fill-white shrink-0" aria-hidden="true">
        <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 790.9 0 663.4 0 541.8c0-207.2 135.4-316.5 268.7-316.5 71 0 130.1 46.4 174.4 46.4 42.7 0 109.2-49.9 190.5-49.9 30.8 0 112.9 2.6 168.4 80.1zm-198.3-224.5c34.3-41 57.2-98.4 57.2-155.7 0-8.4-.6-16.9-2-23.7-54.7 2-119.5 36.6-158.4 82.3-31.4 36.2-61.4 94.5-61.4 152.5 0 9 1.4 17.9 2.6 20.7 3.2.6 8.4 1.3 13.6 1.3 49.4 0 109.2-33 148.4-77.4z" />
      </svg>
      <span className="text-left leading-tight">
        <span className="block text-[10px] opacity-60 leading-none mb-0.5">{label}</span>
        <span className="block text-[14px] font-semibold">App Store</span>
      </span>
    </button>
  );
}

export function PlayStoreBtn({ label }: { label: string }) {
  return (
    <button className="kw-btn flex items-center gap-3 px-5 py-3 rounded-[14px]" style={{ background: "#111", color: "#fff" }}>
      <svg viewBox="0 0 512 512" className="w-6 h-6 shrink-0" aria-hidden="true">
        <defs>
          <linearGradient id="kwgp1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#00C2FF" /><stop offset="100%" stopColor="#0075F3" /></linearGradient>
          <linearGradient id="kwgp2" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#2EE858" /><stop offset="100%" stopColor="#00C2FF" /></linearGradient>
          <linearGradient id="kwgp3" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#FFD000" /><stop offset="100%" stopColor="#FF6D00" /></linearGradient>
          <linearGradient id="kwgp4" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#FF4B4B" /><stop offset="100%" stopColor="#BF004B" /></linearGradient>
        </defs>
        <path fill="url(#kwgp1)" d="M30 0C14 0 0 14 0 30v452c0 16 14 30 30 30l248-256L30 0z" />
        <path fill="url(#kwgp2)" d="M422 212l-74-42L30 0l248 256 114-44z" />
        <path fill="url(#kwgp3)" d="M422 300l-74 42-114 44 248 126c16 8 30 2 30-14V226l-90 74z" />
        <path fill="url(#kwgp4)" d="M30 512c16 0 218-110 248-126L30 256 0 482c0 16 14 30 30 30z" />
      </svg>
      <span className="text-left leading-tight">
        <span className="block text-[10px] opacity-60 leading-none mb-0.5">{label}</span>
        <span className="block text-[14px] font-semibold">Google Play</span>
      </span>
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   11. CARTE KPI
   ═══════════════════════════════════════════════════════════════════════════ */
export function KPICard({
  label, value, change, up, icon: Icon, color, spark, delay = 0,
}: {
  label: string; value: string; change: string; up: boolean;
  icon: ElementType; color: string; spark: { v: number }[]; delay?: number;
}) {
  const gid = `kwsg-${color.replace("#", "")}`;
  return (
    <div className={`kw-in kw-card bg-card rounded-2xl border border-border p-5 flex flex-col gap-3 ${delay ? `kw-d${delay}` : ""}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}18` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <span className="text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap"
          style={{ background: up ? `${GREEN}18` : `${RED}18`, color: up ? GREEN : RED }}>
          {change}
        </span>
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-foreground truncate" title={value}>{value}</p>
        <p className="text-xs text-muted-foreground mt-0.5 truncate" title={label}>{label}</p>
      </div>
      <div className="h-10 -mx-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={spark} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
            <defs>
              <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.32} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill={`url(#${gid})`} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   12. EN-TÊTES DE PAGE
   ═══════════════════════════════════════════════════════════════════════════ */
export function PageHeader({
  title, desc, children, onBack, backLabel,
}: {
  title: string; desc?: string; children?: ReactNode;
  onBack?: () => void; backLabel?: string;
}) {
  return (
    <div className="mb-6 space-y-4">
      {onBack && (
        <button onClick={onBack}
          className="kw-focus inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          {backLabel ?? "Retour"}
        </button>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">{title}</h1>
          {desc && <p className="text-sm text-muted-foreground mt-1">{desc}</p>}
        </div>
        {children && <div className="flex items-center gap-2 flex-wrap shrink-0">{children}</div>}
      </div>
    </div>
  );
}

/** En-tête de bloc à l'intérieur d'une page */
export function SectionHeader({
  title, desc, children, icon: Icon,
}: { title: string; desc?: string; children?: ReactNode; icon?: ElementType }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
      <div className="flex items-center gap-2.5 min-w-0">
        {Icon && (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${BLUE}12` }}>
            <Icon className="w-4 h-4" style={{ color: BLUE }} />
          </div>
        )}
        <div className="min-w-0">
          <h3 className="font-semibold text-foreground text-sm truncate">{title}</h3>
          {desc && <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>}
        </div>
      </div>
      {children && <div className="flex items-center gap-2 shrink-0">{children}</div>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   13. TABLEAU DE DONNÉES — avec états intégrés
   ═══════════════════════════════════════════════════════════════════════════ */
export function TableWrapper({
  columns, children, footer, state = "success",
  emptyTitle, emptyDesc, emptyAction, onRetry, skeletonRows = 5,
}: {
  columns: string[];
  children: ReactNode;
  footer?: ReactNode;
  state?: DataState;
  emptyTitle?: string;
  emptyDesc?: string;
  emptyAction?: ReactNode;
  onRetry?: () => void;
  skeletonRows?: number;
}) {
  const { lang } = useLang();
  const tx = T[lang].states;

  if (state === "error") {
    return (
      <div className="bg-card rounded-2xl border border-border">
        <ErrorState onRetry={onRetry} />
      </div>
    );
  }

  if (state === "empty") {
    return (
      <div className="bg-card rounded-2xl border border-border">
        <EmptyState title={emptyTitle ?? tx.empty} desc={emptyDesc ?? tx.emptySub} action={emptyAction} />
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      <div className="overflow-x-auto kw-scroll">
        <table className="w-full min-w-[640px]">
          <thead className="bg-secondary border-b border-border">
            <tr>
              {columns.map(c => (
                <th key={c} scope="col"
                  className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          {state === "loading" ? <TableSkeleton rows={skeletonRows} cols={columns.length} /> : children}
        </table>
      </div>
      {footer && state !== "loading" && <div className="px-4 py-3 border-t border-border">{footer}</div>}
    </div>
  );
}

/** Cellule d'actions — regroupe les boutons d'une ligne */
export function RowActions({ children }: { children: ReactNode }) {
  return <div className="flex items-center gap-0.5 justify-end">{children}</div>;
}

/** Bouton d'action de ligne, avec teinte sémantique */
export function RowBtn({
  icon: Icon, title, onClick, tone = "neutral",
}: {
  icon: ElementType; title: string; onClick: () => void;
  tone?: "neutral" | "primary" | "warn" | "danger" | "success";
}) {
  const tones: Record<string, string> = {
    neutral: "hover:bg-secondary hover:text-foreground",
    primary: "hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/25",
    warn: "hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-900/25",
    danger: "hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/25",
    success: "hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-900/25",
  };
  return (
    <button onClick={onClick} title={title} aria-label={title}
      className={`kw-btn kw-focus p-2 rounded-lg text-muted-foreground ${tones[tone]}`}>
      <Icon className="w-4 h-4" />
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   14. CHAMPS DE FORMULAIRE — aspect input constant, bascule lecture/édition
   ═══════════════════════════════════════════════════════════════════════════ */
export type FieldType = "text" | "email" | "tel" | "number" | "select" | "textarea" | "password" | "date";

export interface FieldProps {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  /** false = aspect input mais non modifiable */
  editable?: boolean;
  type?: FieldType;
  options?: string[];
  placeholder?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  icon?: ElementType;
  /** Contenu personnalisé en lecture seule (badge, lien…) */
  renderRead?: ReactNode;
  className?: string;
  rows?: number;
  mono?: boolean;
}

export function Field({
  label, value, onChange, editable = false, type = "text", options = [],
  placeholder, error, hint, required, icon: Icon, renderRead, className = "", rows = 4, mono,
}: FieldProps) {
  const [reveal, setReveal] = useState(false);
  const ro = !editable;
  const base = fieldCls({ error: !!error, readOnly: ro });
  const monoCls = mono ? "font-mono" : "";

  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        {Icon && <Icon className="w-3.5 h-3.5" />}
        {label}
        {required && editable && <span style={{ color: RED }}>*</span>}
      </label>

      {/* Lecture seule avec rendu personnalisé (badge, etc.) */}
      {ro && renderRead ? (
        <div className={`${base} flex items-center min-h-[42px]`}>{renderRead}</div>
      ) : type === "textarea" ? (
        <textarea
          value={value}
          onChange={e => onChange?.(e.target.value)}
          readOnly={ro}
          rows={rows}
          placeholder={editable ? placeholder : undefined}
          className={`${base} ${monoCls} resize-none`}
        />
      ) : type === "select" ? (
        ro ? (
          <div className={`${base} flex items-center min-h-[42px]`}>{value || "—"}</div>
        ) : (
          <div className="relative">
            <select
              value={value}
              onChange={e => onChange?.(e.target.value)}
              className={`${base} appearance-none pr-9 cursor-pointer`}>
              <option value="">Choisir…</option>
              {options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
        )
      ) : type === "password" ? (
        <div className="relative">
          <input
            type={reveal ? "text" : "password"}
            value={value}
            onChange={e => onChange?.(e.target.value)}
            readOnly={ro}
            placeholder={editable ? placeholder : undefined}
            className={`${base} pr-10`}
          />
          <button type="button" onClick={() => setReveal(r => !r)}
            aria-label={reveal ? "Masquer" : "Afficher"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground kw-focus">
            {reveal ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      ) : (
        <input
          type={type}
          value={value}
          onChange={e => onChange?.(e.target.value)}
          readOnly={ro}
          placeholder={editable ? placeholder : undefined}
          className={`${base} ${monoCls} ${type === "number" ? "kw-no-spin" : ""}`}
        />
      )}

      {error && <p className="text-xs flex items-center gap-1" style={{ color: RED }}>
        <AlertCircle className="w-3 h-3 shrink-0" />{error}
      </p>}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

/**
 * Page de formulaire unifiée — détail, édition inline et création.
 * En mode "view", les champs ont l'aspect d'inputs mais sont verrouillés.
 * « Annuler » repasse en lecture seule sans quitter la page.
 */
export function FormPage({
  title, desc, mode, onModeChange, onBack, backLabel,
  onSave, onDelete, saving, children, dirty, headerExtra, footerExtra,
}: {
  title: string;
  desc?: string;
  mode: FormMode;
  onModeChange: (m: FormMode) => void;
  onBack: () => void;
  backLabel?: string;
  onSave: () => void;
  onDelete?: () => void;
  saving?: boolean;
  children: ReactNode;
  dirty?: boolean;
  headerExtra?: ReactNode;
  footerExtra?: ReactNode;
}) {
  const isView = mode === "view";
  const isCreate = mode === "create";

  return (
    <div className="kw-in space-y-6 max-w-12xl">
      <PageHeader title={title} desc={desc} onBack={onBack} backLabel={backLabel}>
        {isView && (
          <>
            {onDelete && <Btn variant="outline" icon={Trash2} onClick={onDelete} title="Supprimer" />}
            <Btn variant="primary" icon={Pencil} onClick={() => onModeChange("edit")}>Modifier</Btn>
          </>
        )}
        {!isView && (
          <>
            <Btn variant="outline" onClick={() => (isCreate ? onBack() : onModeChange("view"))} disabled={saving}>
              Annuler
            </Btn>
            <Btn variant="primary" icon={Check} onClick={onSave} loading={saving} disabled={!isCreate && !dirty}>
              {isCreate ? "Créer" : "Enregistrer"}
            </Btn>
          </>
        )}
      </PageHeader>

      {headerExtra}

      {/* Bandeau d'état d'édition */}
      {!isView && (
        <div className="kw-in flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm"
          style={{ background: `${ORANGE}12`, border: `1px solid ${ORANGE}30`, color: "var(--foreground)" }}>
          <Pencil className="w-4 h-4 shrink-0" style={{ color: ORANGE }} />
          <span>{isCreate ? "Renseignez les champs puis validez la création." : "Les champs sont modifiables. Annulez pour revenir en lecture seule."}</span>
        </div>
      )}

      {children}

      {footerExtra}
    </div>
  );
}

/** Grille de champs responsive — 1 colonne sur mobile, 2 sur tablette+ */
export function FieldGrid({ children, cols = 2 }: { children: ReactNode; cols?: 1 | 2 | 3 }) {
  const map = { 1: "", 2: "sm:grid-cols-2", 3: "sm:grid-cols-2 lg:grid-cols-3" };
  return <div className={`grid gap-4 ${map[cols]}`}>{children}</div>;
}

/** Carte contenant un groupe de champs */
export function FormCard({ title, desc, children, icon }: { title?: string; desc?: string; children: ReactNode; icon?: ElementType }) {
  return (
    <div className="bg-card rounded-2xl border border-border p-5 sm:p-6">
      {title && <SectionHeader title={title} desc={desc} icon={icon} />}
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   15. MATRICE DE PERMISSIONS (§8.6) — actions variables par module
   ═══════════════════════════════════════════════════════════════════════════ */
export function PermissionMatrix({
  modules, perms, onToggle, onToggleModule, readOnly,
}: {
  modules: PermModule[];
  perms: Record<string, Record<string, boolean>>;
  onToggle: (modId: string, actId: string) => void;
  onToggleModule?: (modId: string, value: boolean) => void;
  readOnly?: boolean;
}) {
  return (
    <div className="space-y-3">
      {modules.map((mod, i) => {
        const modPerms = perms[mod.id] ?? {};
        const granted = mod.actions.filter(a => modPerms[a.id]).length;
        const all = granted === mod.actions.length;
        const some = granted > 0 && !all;

        return (
          <div key={mod.id} className={`kw-in kw-d${Math.min(i + 1, 8)} bg-card rounded-2xl border border-border overflow-hidden`}>
            {/* En-tête du module */}
            <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5 bg-secondary/60 border-b border-border">
              <div className="min-w-0">
                <p className="font-semibold text-sm text-foreground">{mod.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{mod.desc}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs font-medium tabular-nums"
                  style={{ color: all ? GREEN : some ? ORANGE : "var(--muted-foreground)" }}>
                  {granted}/{mod.actions.length}
                </span>
                {!readOnly && onToggleModule && (
                  <button
                    onClick={() => onToggleModule(mod.id, !all)}
                    className="kw-btn kw-focus text-xs font-medium px-2.5 py-1 rounded-lg border border-border hover:bg-card">
                    {all ? "Tout retirer" : "Tout accorder"}
                  </button>
                )}
              </div>
            </div>

            {/* Grille d'actions */}
            <div className="p-3 sm:p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {mod.actions.map(act => {
                const on = !!modPerms[act.id];
                return (
                  <button
                    key={act.id}
                    disabled={readOnly}
                    onClick={() => onToggle(mod.id, act.id)}
                    aria-pressed={on}
                    className="kw-btn kw-focus flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left disabled:cursor-default"
                    style={{
                      borderColor: on ? (act.critique ? `${RED}50` : `${GREEN}50`) : "var(--border)",
                      background: on ? (act.critique ? `${RED}0E` : `${GREEN}0E`) : "transparent",
                    }}>
                    <span className="w-4.5 h-4.5 rounded-md border flex items-center justify-center shrink-0 transition-all"
                      style={{
                        width: 18, height: 18,
                        borderColor: on ? "transparent" : "var(--border)",
                        background: on ? (act.critique ? RED : GREEN) : "transparent",
                      }}>
                      {on && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                    </span>
                    <span className="text-xs font-medium text-foreground truncate">{act.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Carte de rôle sélectionnable */
export function RoleCard({
  role, active, onClick, onEdit, onDelete,
}: {
  role: Role; active: boolean; onClick: () => void;
  onEdit?: () => void; onDelete?: () => void;
}) {
  const total = Object.values(role.perms).reduce(
    (acc, m) => acc + Object.values(m).filter(Boolean).length, 0
  );

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } }}
      className="kw-card kw-focus text-left rounded-2xl border p-4 cursor-pointer relative group"
      style={{
        borderColor: active ? role.color : "var(--border)",
        background: active ? `${role.color}0D` : "var(--card)",
        borderWidth: active ? 2 : 1,
      }}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: role.color }} />
          <p className="font-semibold text-sm text-foreground truncate">{role.role}</p>
        </div>
        {role.systeme && (
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded shrink-0"
            style={{ background: "var(--secondary)", color: "var(--muted-foreground)" }}>
            Système
          </span>
        )}
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-3">{role.desc}</p>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground">
          {role.count} membre{role.count !== 1 ? "s" : ""} · {total} droit{total !== 1 ? "s" : ""}
        </span>
        {!role.systeme && (onEdit || onDelete) && (
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            {onEdit && <RowBtn icon={Pencil} title="Renommer" tone="warn" onClick={() => { onEdit(); }} />}
            {onDelete && <RowBtn icon={Trash2} title="Supprimer" tone="danger" onClick={() => { onDelete(); }} />}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   16. NAVIGATION EN ARBORESCENCE (§8.5) — Pays → Opérateurs → Actions
   ═══════════════════════════════════════════════════════════════════════════ */
export function TreeColumn({
  title, count, onAdd, addLabel, children, active,
}: {
  title: string; count?: number; onAdd?: () => void; addLabel?: string;
  children: ReactNode; active?: boolean;
}) {
  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden flex flex-col"
      style={active ? { borderColor: `${BLUE}40` } : undefined}>
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border bg-secondary/60 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground truncate">{title}</span>
          {count !== undefined && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded"
              style={{ background: `${BLUE}12`, color: BLUE }}>{count}</span>
          )}
        </div>
        {onAdd && <RowBtn icon={Plus} title={addLabel ?? "Ajouter"} tone="primary" onClick={onAdd} />}
      </div>
      <div className="flex-1 overflow-y-auto kw-scroll max-h-[420px] lg:max-h-[560px]">{children}</div>
    </div>
  );
}

export function TreeItem({
  label, sub, active, onClick, onEdit, onDelete, badge,
}: {
  label: string; sub?: string; active?: boolean; onClick?: () => void;
  onEdit?: () => void; onDelete?: () => void; badge?: ReactNode;
}) {
  return (
    <div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={e => { if (onClick && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); onClick(); } }}
      className="kw-row kw-focus group flex items-center gap-2 px-4 py-3 border-b border-border last:border-b-0 cursor-pointer hover:bg-secondary/60"
      style={active ? { background: `${BLUE}0D`, boxShadow: `inset 3px 0 0 ${BLUE}` } : undefined}>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: active ? BLUE : "var(--foreground)" }}>{label}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5 truncate">{sub}</p>}
      </div>
      {badge}
      {(onEdit || onDelete) && (
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity shrink-0">
          {onEdit && <RowBtn icon={Pencil} title="Modifier" tone="warn" onClick={onEdit} />}
          {onDelete && <RowBtn icon={Trash2} title="Supprimer" tone="danger" onClick={onDelete} />}
        </div>
      )}
      {onClick && <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 group-hover:translate-x-0.5 transition-transform" />}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   17. DIVERS
   ═══════════════════════════════════════════════════════════════════════════ */

/** Bandeau d'information contextuel */
export function Callout({
  tone = "info", title, children, icon: Icon,
}: { tone?: "info" | "warn" | "danger" | "success"; title?: string; children: ReactNode; icon?: ElementType }) {
  const map = { info: BLUE, warn: ORANGE, danger: RED, success: GREEN };
  const c = map[tone];
  const I = Icon ?? (tone === "info" ? Info : AlertCircle);
  return (
    <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl text-sm"
      style={{ background: `${c}0E`, border: `1px solid ${c}30` }}>
      <I className="w-4 h-4 shrink-0 mt-0.5" style={{ color: c }} />
      <div className="min-w-0 flex-1">
        {title && <p className="font-semibold text-foreground mb-0.5">{title}</p>}
        <div className="text-muted-foreground leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

/** Groupe de segments — filtre de période, onglets courts */
export function SegmentedControl<T extends string>({
  options, value, onChange, size = "md",
}: { options: readonly T[]; value: T; onChange: (v: T) => void; size?: "sm" | "md" }) {
  const pad = size === "sm" ? "px-2.5 py-1.5 text-[11px]" : "px-3 py-2 text-xs";
  return (
    <div className="inline-flex items-center gap-1 bg-secondary rounded-xl p-1 overflow-x-auto kw-scroll max-w-full">
      {options.map(o => (
        <button key={o} onClick={() => onChange(o)}
          aria-pressed={value === o}
          className={`kw-btn kw-focus ${pad} rounded-lg font-medium whitespace-nowrap shrink-0`}
          style={value === o
            ? { background: "var(--card)", color: BLUE, boxShadow: "0 1px 3px rgba(0,0,0,.09)" }
            : { color: "var(--muted-foreground)" }}>
          {o}
        </button>
      ))}
    </div>
  );
}

/** Menu déroulant d'export */
export function ExportDropdown({ onExport, size = "md" }: { onExport: (f: "pdf" | "csv") => void; size?: BtnSize }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <Btn variant="outline" size={size} iconRight={ChevronDown} onClick={() => setOpen(o => !o)} title="Exporter">
        Exporter
      </Btn>
      {open && (
        <div className="kw-scale-in absolute right-0 mt-1.5 w-36 bg-card border border-border rounded-xl shadow-lg z-30 overflow-hidden">
          {(["pdf", "csv"] as const).map(f => (
            <button key={f} onClick={() => { onExport(f); setOpen(false); }}
              className="kw-focus w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors">
              <span className="w-6 h-6 rounded flex items-center justify-center text-[9px] font-bold"
                style={{ background: f === "pdf" ? `${RED}18` : `${GREEN}18`, color: f === "pdf" ? RED : GREEN }}>
                {f.toUpperCase()}
              </span>
              Format {f.toUpperCase()}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Avatar avec initiales ou photo */
export function Avatar({
  name, src, size = 40, color = BLUE, alert,
}: { name: string; src?: string | null; size?: number; color?: string; alert?: boolean }) {
  const init = name.split(" ").map(w => w.charAt(0)).slice(0, 2).join("").toUpperCase();
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div className="w-full h-full rounded-full flex items-center justify-center overflow-hidden text-white font-bold"
        style={{ background: color, fontSize: size * 0.36 }}>
        {src ? <img src={src} alt={name} className="w-full h-full object-cover" /> : init}
      </div>
      {alert && (
        <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card kw-pulse"
          style={{ background: RED }} />
      )}
    </div>
  );
}

/** Tiroir latéral responsive — utilisé pour la navigation mobile */
export function Drawer({ open, onClose, children, side = "left", width = 280 }: {
  open: boolean; onClose: () => void; children: ReactNode; side?: "left" | "right"; width?: number;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] lg:hidden">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm kw-fade" onClick={onClose} />
      <div className={`kw-drawer absolute top-0 bottom-0 ${side === "left" ? "left-0" : "right-0"} bg-card border-border shadow-2xl overflow-y-auto kw-scroll`}
        style={{ width, borderRightWidth: side === "left" ? 1 : 0, borderLeftWidth: side === "right" ? 1 : 0 }}>
        {children}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   18. HOOKS
   ═══════════════════════════════════════════════════════════════════════════ */
let _toastSeq = 0;

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: number) => {
    setToasts(t => t.filter(x => x.id !== id));
  }, []);

  const toast = useCallback((type: ToastType, msg: string) => {
    const id = ++_toastSeq;
    setToasts(t => [...t, { id, type, msg }]);
    window.setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4200);
  }, []);

  return { toasts, toast, remove };
}

export function useConfirm() {
  const [state, setState] = useState<{
    open: boolean; title: string; desc: string; danger: boolean; label?: string; cb: () => void;
  }>({ open: false, title: "", desc: "", danger: false, cb: () => {} });

  const confirm = useCallback((title: string, desc: string, cb: () => void, danger = false, label?: string) => {
    setState({ open: true, title, desc, danger, label, cb });
  }, []);

  const close = useCallback(() => setState(s => ({ ...s, open: false })), []);
  return { state, confirm, close };
}

/**
 * Gestion d'un formulaire à trois modes avec détection de modification.
 * Réinitialise l'ébauche quand on annule — sans quitter la page.
 */
export function useFormState<T extends Record<string, unknown>>(initial: T, startMode: FormMode = "view") {
  const [mode, setMode] = useState<FormMode>(startMode);
  const [draft, setDraft] = useState<T>(initial);
  const [saved, setSaved] = useState<T>(initial);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

  const set = useCallback(<K extends keyof T>(key: K) => (v: T[K]) => {
    setDraft(d => ({ ...d, [key]: v }));
    setErrors(e => (e[key] ? { ...e, [key]: undefined } : e));
  }, []);

  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);

  const changeMode = useCallback((m: FormMode) => {
    if (m === "view") { setDraft(saved); setErrors({}); }
    setMode(m);
  }, [saved]);

  const commit = useCallback((value?: T) => {
    const next = value ?? draft;
    setSaved(next);
    setDraft(next);
    setMode("view");
  }, [draft]);

  const reset = useCallback((value: T) => {
    setSaved(value); setDraft(value); setErrors({}); setMode("view");
  }, []);

  return { mode, setMode: changeMode, draft, setDraft, set, dirty, saving, setSaving, errors, setErrors, commit, reset, saved };
}

/** Recherche + filtres + pagination sur une liste locale */
export function useDataTable<T>(
  rows: T[],
  matcher: (row: T, search: string, filters: Record<string, string>) => boolean,
  initialPageSize = 10,
) {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const filtered = rows.filter(r => matcher(r, search.toLowerCase().trim(), filters));
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const items = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  useEffect(() => { setPage(1); }, [search, filters, pageSize]);

  return {
    search, setSearch,
    filters, setFilters,
    page: safePage, setPage,
    pageSize, setPageSize,
    filtered, items,
    isEmpty: filtered.length === 0,
    hasQuery: !!search || Object.values(filters).some(Boolean),
  };
}