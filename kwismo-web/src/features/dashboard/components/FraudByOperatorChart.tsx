import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const operatorData = [
  { name: 'Orange', fraudes: 420, color: '#FF9900' },
  { name: 'MTN', fraudes: 380, color: '#FACC15' },
  { name: 'Moov', fraudes: 190, color: '#3B82F6' },
  { name: 'Wave', fraudes: 120, color: '#06B6D4' },
  { name: 'Free', fraudes: 85, color: '#EF4444' },
];

export default function FraudByOperatorChart() {
  return (
    <div className="flex flex-col p-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-brand-navy shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-title text-base font-bold text-slate-900 dark:text-white">
            Signalements par Opérateur
          </h3>
          <p className="font-body text-xs text-slate-500 dark:text-slate-400">
            Répartition globale des tentatives de fraude
          </p>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={operatorData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
            <YAxis stroke="#94a3b8" fontSize={11} />
            <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
            <Bar dataKey="fraudes" radius={[8, 8, 0, 0]} name="Tentatives de Fraude">
              {operatorData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
