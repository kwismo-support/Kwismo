import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '@/shared/lib/api';
import type { NumeroDTO } from '@/shared/mock';
import NumbersTable from './components/NumbersTable';
import NumberHistoryModal from './components/NumberHistoryModal';

export default function NumbersPage() {
  const { t } = useTranslation('admin');
  const [numbers, setNumbers] = useState<NumeroDTO[]>([]);
  const [selectedNumber, setSelectedNumber] = useState<NumeroDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api.getNumbers()
      .then((data) => { if (mounted) setNumbers(data); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  return (
    <div className="flex flex-col gap-6 p-6 font-body">
      <div>
        <h1 className="font-title text-2xl font-bold text-slate-900 dark:text-white">
          {t('numbers.title')}
        </h1>
      </div>

      <NumbersTable
        numbers={numbers}
        isLoading={loading}
        onSelectNumber={(num) => setSelectedNumber(num)}
      />

      <NumberHistoryModal
        numero={selectedNumber}
        isOpen={!!selectedNumber}
        onClose={() => setSelectedNumber(null)}
      />
    </div>
  );
}
