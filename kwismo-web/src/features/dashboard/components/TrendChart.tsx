import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const mockData = [
  { day: 'Lun', verifications: 1200, fraudes: 45 },
  { day: 'Mar', verifications: 1900, fraudes: 62 },
  { day: 'Mer', verifications: 1600, fraudes: 38 },
  { day: 'Jeu', verifications: 2100, fraudes: 85 },
  { day: 'Ven', verifications: 2800, fraudes: 110 },
  { day: 'Sam', verifications: 3400, fraudes: 140 },
  { day: 'Dim', verifications: 2900, fraudes: 95 },
];

export default function TrendChart() {
  return (
    <div className="flex flex-col p-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-brand-navy shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-title text-base font-bold text-slate-900 dark:text-white">
            Évolution des vérifications & fraudes
          </h3>
          <p className="font-body text-xs text-slate-500 dark:text-slate-400">
            Volume quotidien sur les 7 derniers jours
          </p>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={mockData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorVerif" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#32B07F" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#32B07F" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorFraude" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF9900" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#FF9900" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
            <YAxis stroke="#94a3b8" fontSize={11} />
            <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
            <Area
              type="monotone"
              dataKey="verifications"
              stroke="#32B07F"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorVerif)"
              name="Vérifications"
            />
            <Area
              type="monotone"
              dataKey="fraudes"
              stroke="#FF9900"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorFraude)"
              name="Fraudes Bloquées"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
