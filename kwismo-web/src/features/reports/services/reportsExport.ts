import type { ReportItem } from './reports.api';

export function generateCSVReport(filenameTitle: string, items: ReportItem[]) {
  const headers = ['ID', 'User ID', 'Numero ID', 'Motif', 'Statut', 'Date Signalement'];
  const rows = items.map((item) => [
    item.id || '',
    item.user_id || '',
    item.numero_id || '',
    `"${(item.motif || '').replace(/"/g, '""')}"`,
    item.statut || '',
    item.date_signalement ? new Date(item.date_signalement).toLocaleString('fr-FR') : '',
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const cleanName = filenameTitle.toLowerCase().replace(/[^a-z0-9]/gi, '_');
  link.setAttribute('download', `kwismo_rapport_${cleanName}_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export interface PDFReportLabels {
  officialDoc?: string;
  generated?: string;
  at?: string;
  meta?: string;
  colId?: string;
  colMotif?: string;
  colStatut?: string;
  colDate?: string;
  footer?: string;
  empty?: string;
  lang?: string;
}

export function generatePDFReport(title: string, items: ReportItem[], labels: PDFReportLabels = {}) {
  const {
    officialDoc = 'Document Officiel Anti-Fraude',
    generated = 'Généré le',
    at = 'à',
    meta = "Rapport d'analyse de sécurité Mobile Money — KWISMO Platform",
    colId = 'Identifiant',
    colMotif = 'Motif du Signalement',
    colStatut = 'Statut',
    colDate = 'Date',
    footer = 'KWISMO Anti-Fraud Intelligence Platform — Document généré automatiquement pour contrôle d\'audit.',
    empty = 'Aucun signalement enregistré dans le rapport',
    lang = 'fr',
  } = labels;

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const rowsHtml = items.length === 0
    ? `<tr><td colspan="4" style="text-align:center; padding:12px; color:#888;">${empty}</td></tr>`
    : items.map((item, idx) => `
      <tr style="background-color: ${idx % 2 === 0 ? '#f9fafb' : '#ffffff'};">
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-size: 12px; font-family: monospace;">${item.id || '-'}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-size: 12px;">${item.motif || '-'}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-size: 12px; font-weight: bold; color: ${item.statut === 'validated' ? '#059669' : item.statut === 'rejected' ? '#dc2626' : '#d97706'};">${item.statut || '-'}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-size: 12px; font-family: monospace;">${item.date_signalement ? new Date(item.date_signalement).toLocaleString(lang === 'en' ? 'en-GB' : 'fr-FR') : '-'}</td>
      </tr>
    `).join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="${lang}">
    <head>
      <meta charset="UTF-8">
      <title>KWISMO — ${title}</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 40px; color: #161F33; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #32B07F; padding-bottom: 15px; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: 800; color: #161F33; letter-spacing: -0.5px; }
        .logo span { color: #FF9900; }
        .title { font-size: 18px; font-weight: 700; color: #161F33; margin-bottom: 5px; }
        .meta { font-size: 12px; color: #6b7280; margin-bottom: 25px; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th { background-color: #161F33; color: #ffffff; padding: 12px 10px; text-align: left; font-size: 12px; font-weight: 600; text-transform: uppercase; }
        .footer { margin-top: 50px; border-top: 1px solid #e5e7eb; padding-top: 15px; text-align: center; font-size: 11px; color: #9ca3af; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">KWISMO <span>SECURITY</span></div>
        <div style="font-size: 12px; text-align: right; color: #4b5563;">
          ${officialDoc}<br>
          ${generated} ${new Date().toLocaleDateString(lang === 'en' ? 'en-GB' : 'fr-FR')} ${at} ${new Date().toLocaleTimeString(lang === 'en' ? 'en-GB' : 'fr-FR')}
        </div>
      </div>
      <div class="title">${title}</div>
      <div class="meta">${meta}</div>
      <table>
        <thead>
          <tr>
            <th>${colId}</th>
            <th>${colMotif}</th>
            <th>${colStatut}</th>
            <th>${colDate}</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
      <div class="footer">
        ${footer}
      </div>
      <script>
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
