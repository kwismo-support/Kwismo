import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';

interface EmailPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (recipientEmail: string, subject: string, body: string) => void;
  defaultRecipient: string;
  defaultSubject: string;
  defaultBody: string;
  type: 'approval' | 'rejection';
  companyName: string;
}

export default function EmailPreviewModal({
  isOpen,
  onClose,
  onSend,
  defaultRecipient,
  defaultSubject,
  defaultBody,
  type,
  companyName,
}: EmailPreviewModalProps) {
  const { t } = useTranslation(['admin', 'common']);
  const [recipient, setRecipient] = useState(defaultRecipient);
  const [subject, setSubject] = useState(defaultSubject);
  const [body, setBody] = useState(defaultBody);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('preview');

  if (!isOpen) return null;

  const handleSendSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSend(recipient, subject, body);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto font-body">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-white dark:bg-brand-navy p-6 shadow-2xl border border-slate-200 dark:border-white/10 text-left animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl ${
                  type === 'approval'
                    ? 'bg-brand-green/10 text-brand-green'
                    : 'bg-rose-500/10 text-rose-500'
                }`}
              >
                <Icon
                  icon={
                    type === 'approval'
                      ? 'solar:letter-opened-bold-duotone'
                      : 'solar:letter-unread-bold-duotone'
                  }
                />
              </div>
              <div>
                <h3 className="font-title text-lg font-bold text-slate-900 dark:text-white">
                  {type === 'approval'
                    ? t('admin:partners.emailModalTitleApproval')
                    : t('admin:partners.emailModalTitleRejection')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {companyName}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition"
            >
              <Icon icon="solar:close-circle-bold" className="text-lg" />
            </button>
          </div>

          <div className="flex items-center gap-2 mt-4 border-b border-slate-100 dark:border-white/10 pb-3">
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === 'preview'
                  ? 'bg-brand-navy dark:bg-brand-green text-white'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              <Icon icon="solar:eye-bold" className="text-sm" />
              <span>{t('admin:partners.previewTab')}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('editor')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === 'editor'
                  ? 'bg-brand-navy dark:bg-brand-green text-white'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              <Icon icon="solar:pen-bold" className="text-sm" />
              <span>{t('admin:partners.editorTab')}</span>
            </button>
          </div>

          <form onSubmit={handleSendSubmit} className="mt-4 space-y-4">
            <Input
              label={t('admin:partners.recipientEmail')}
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              leftIcon="solar:letter-bold"
              required
            />

            <Input
              label={t('admin:partners.emailSubject')}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              leftIcon="solar:document-text-bold"
              required
            />

            {activeTab === 'editor' ? (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {t('admin:partners.emailBody')}
                </label>
                <textarea
                  rows={8}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full p-4 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-brand-darkBg text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-brand-green transition resize-none"
                  required
                />
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {t('admin:partners.emailPreviewHeader')}
                </label>
                <div className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0F1626] p-5 text-slate-800 dark:text-slate-200 font-body text-xs shadow-inner space-y-3">
                  <div className="border-b border-slate-100 dark:border-white/10 pb-3 flex items-center justify-between">
                    <span className="font-bold text-brand-green flex items-center gap-1.5 text-sm">
                      <Icon icon="solar:shield-star-bold" className="text-base" />
                      KWISMO Platform
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      No-Reply Mail Client
                    </span>
                  </div>
                  <div className="whitespace-pre-wrap leading-relaxed">
                    {body}
                  </div>
                  <div className="border-t border-slate-100 dark:border-white/10 pt-3 text-[11px] text-slate-400">
                    © 2026 KWISMO — Security & Fraud Protection System.
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-white/10">
              <Button type="button" variant="outline" size="sm" onClick={onClose}>
                {t('common:actions.cancel')}
              </Button>
              <Button
                type="submit"
                variant={type === 'approval' ? 'primary' : 'danger'}
                size="sm"
                leftIcon="solar:plain-bold"
              >
                {type === 'approval'
                  ? t('admin:partners.sendApprovalEmail')
                  : t('admin:partners.sendRejectionEmail')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
