import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import AIAccuracyStats from '@/components/AIAccuracyStats';

interface AnalyticsProps {
  refreshTrigger?: number;
}

const Analytics = ({ refreshTrigger = 0 }: AnalyticsProps) => {
  return (
    <div className="h-full overflow-y-auto space-y-6 p-6 bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      <div className="flex items-center gap-3 mb-6">
        <Icon name="LineChart" size={32} className="text-purple-400" />
        <h2 className="text-3xl font-bold text-white">Аналитика</h2>
      </div>

      <AIAccuracyStats refreshTrigger={refreshTrigger} />

      <Card className="bg-slate-800/50 border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Icon name="Activity" size={24} className="text-blue-400" />
          <h3 className="text-xl font-bold text-white">Общая статистика</h3>
        </div>
        <p className="text-slate-400">
          Дополнительные метрики и аналитика появятся здесь по мере работы системы.
        </p>
      </Card>
    </div>
  );
};

export default Analytics;