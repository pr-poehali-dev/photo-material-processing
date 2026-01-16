import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';

interface AIMetrics {
  id: number;
  model_version: string;
  accuracy: number;
  precision_score: number;
  recall_score: number;
  f1_score: number;
  training_samples_count: number;
  training_date: string;
  notes: string;
}

interface TrainingDataItem {
  material_id: string;
  file_name: string;
  violation_code: string;
  notes: string;
  is_training_data: boolean;
  regions_count: number;
}

interface AITrainingPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const AITrainingPanel = ({ isOpen, onClose }: AITrainingPanelProps) => {
  const [metrics, setMetrics] = useState<AIMetrics[]>([]);
  const [trainingData, setTrainingData] = useState<TrainingDataItem[]>([]);
  const [datasetStats, setDatasetStats] = useState<any>(null);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);

  const loadMetrics = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/f988916a-a0b1-4821-8408-f7732ad49548?action=metrics');
      const data = await response.json();
      setMetrics(data.metrics || []);
    } catch (error) {
      console.error('Ошибка загрузки метрик:', error);
    }
  };

  const loadTrainingData = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/f988916a-a0b1-4821-8408-f7732ad49548?action=training-data');
      const data = await response.json();
      setTrainingData(data.training_data || []);
    } catch (error) {
      console.error('Ошибка загрузки обучающих данных:', error);
    }
  };

  const loadDatasetStats = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/f988916a-a0b1-4821-8408-f7732ad49548?action=dataset-stats');
      const data = await response.json();
      setDatasetStats(data.stats || {});
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error);
    }
  };

  const trainModel = async () => {
    if (!confirm('Запустить переобучение модели на исправленных данных? Это может занять некоторое время.')) {
      return;
    }

    setIsTraining(true);
    setTrainingProgress(0);

    const progressInterval = setInterval(() => {
      setTrainingProgress(prev => Math.min(prev + 10, 90));
    }, 500);

    try {
      const response = await fetch('https://functions.poehali.dev/f988916a-a0b1-4821-8408-f7732ad49548', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'train-model' })
      });

      clearInterval(progressInterval);
      setTrainingProgress(100);

      const data = await response.json();
      
      if (response.ok) {
        alert(`✅ Модель успешно переобучена!\n\nВерсия: ${data.model_version}\nТочность: ${(data.metrics.accuracy * 100).toFixed(2)}%\nОбразцов: ${data.training_samples}\n\nМетрики:\n• Precision: ${(data.metrics.precision * 100).toFixed(2)}%\n• Recall: ${(data.metrics.recall * 100).toFixed(2)}%\n• F1-Score: ${(data.metrics.f1_score * 100).toFixed(2)}%`);
        await loadMetrics();
        await loadDatasetStats();
      } else {
        alert(`❌ Ошибка обучения: ${data.error}\n${data.message || ''}`);
      }
    } catch (error) {
      console.error('Ошибка обучения модели:', error);
      alert('❌ Ошибка обучения модели');
      clearInterval(progressInterval);
    } finally {
      setIsTraining(false);
      setTrainingProgress(0);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadMetrics();
      loadTrainingData();
      loadDatasetStats();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="bg-slate-800 border-slate-700 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon name="Brain" size={28} className="text-purple-400" />
              <h2 className="text-2xl font-bold text-white">Обучение ИИ модели</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <Icon name="X" size={20} />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-slate-900/50 border-slate-700 p-4">
              <div className="flex items-center gap-3 mb-2">
                <Icon name="Database" size={20} className="text-blue-400" />
                <h3 className="font-semibold text-white text-sm">Всего образцов</h3>
              </div>
              <p className="text-3xl font-bold text-blue-400">
                {datasetStats?.total_samples || 0}
              </p>
            </Card>

            <Card className="bg-slate-900/50 border-slate-700 p-4">
              <div className="flex items-center gap-3 mb-2">
                <Icon name="GraduationCap" size={20} className="text-green-400" />
                <h3 className="font-semibold text-white text-sm">Для обучения</h3>
              </div>
              <p className="text-3xl font-bold text-green-400">
                {datasetStats?.training_samples || 0}
              </p>
            </Card>

            <Card className="bg-slate-900/50 border-slate-700 p-4">
              <div className="flex items-center gap-3 mb-2">
                <Icon name="Tag" size={20} className="text-purple-400" />
                <h3 className="font-semibold text-white text-sm">Типов нарушений</h3>
              </div>
              <p className="text-3xl font-bold text-purple-400">
                {datasetStats?.violation_types || 0}
              </p>
            </Card>

            <Card className="bg-slate-900/50 border-slate-700 p-4">
              <div className="flex items-center gap-3 mb-2">
                <Icon name="CheckCircle" size={20} className="text-amber-400" />
                <h3 className="font-semibold text-white text-sm">Подтверждено</h3>
              </div>
              <p className="text-3xl font-bold text-amber-400">
                {trainingData.filter(d => d.is_training_data).length}
              </p>
            </Card>
          </div>

          <Card className="bg-slate-900/50 border-slate-700 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Обучение модели</h3>
              <Button
                onClick={trainModel}
                disabled={isTraining || (datasetStats?.training_samples || 0) < 10}
                className="bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:from-purple-600 hover:to-pink-700"
              >
                <Icon name="PlayCircle" size={16} className="mr-2" />
                {isTraining ? 'Обучается...' : 'Запустить обучение'}
              </Button>
            </div>

            {isTraining && (
              <div className="space-y-2">
                <Progress value={trainingProgress} className="h-2" />
                <p className="text-sm text-slate-400 text-center">
                  Обучение модели: {trainingProgress}%
                </p>
              </div>
            )}

            {!isTraining && (datasetStats?.training_samples || 0) < 10 && (
              <div className="flex items-start gap-2 text-sm text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded p-3">
                <Icon name="AlertTriangle" size={16} className="mt-0.5 flex-shrink-0" />
                <p>
                  Недостаточно данных для обучения. Необходимо минимум 10 размеченных образцов.
                  Текущее количество: {datasetStats?.training_samples || 0}
                </p>
              </div>
            )}
          </Card>

          <Card className="bg-slate-900/50 border-slate-700 p-4">
            <h3 className="text-lg font-semibold text-white mb-4">История обучения</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {metrics.length === 0 ? (
                <p className="text-center text-slate-400 py-8">
                  Модель ещё не обучалась
                </p>
              ) : (
                metrics.map((metric) => (
                  <Card key={metric.id} className="bg-slate-800/50 border-slate-700 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <Badge variant="outline" className="text-purple-400 border-purple-400">
                          {metric.model_version}
                        </Badge>
                        <p className="text-xs text-slate-400 mt-1">
                          {new Date(metric.training_date).toLocaleString('ru-RU')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-400">Образцов</p>
                        <p className="text-lg font-semibold text-white">
                          {metric.training_samples_count}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-3">
                      <div>
                        <p className="text-xs text-slate-400">Точность</p>
                        <p className="text-sm font-semibold text-green-400">
                          {(metric.accuracy * 100).toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Precision</p>
                        <p className="text-sm font-semibold text-blue-400">
                          {(metric.precision_score * 100).toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Recall</p>
                        <p className="text-sm font-semibold text-purple-400">
                          {(metric.recall_score * 100).toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">F1-Score</p>
                        <p className="text-sm font-semibold text-amber-400">
                          {(metric.f1_score * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>

                    {metric.notes && (
                      <p className="text-xs text-slate-400 mt-2">{metric.notes}</p>
                    )}
                  </Card>
                ))
              )}
            </div>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700 p-4">
            <h3 className="text-lg font-semibold text-white mb-4">
              Обучающие данные ({trainingData.length})
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {trainingData.length === 0 ? (
                <p className="text-center text-slate-400 py-8">
                  Нет размеченных данных для обучения
                </p>
              ) : (
                trainingData.map((item) => (
                  <div
                    key={item.material_id}
                    className="flex items-center justify-between p-3 bg-slate-800/50 border border-slate-700 rounded"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{item.file_name}</p>
                      <p className="text-xs text-slate-400">{item.notes || 'Без примечаний'}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-amber-400 border-amber-400">
                        {item.violation_code}
                      </Badge>
                      <div className="flex items-center gap-1 text-slate-400">
                        <Icon name="Tag" size={14} />
                        <span className="text-xs">{item.regions_count}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </Card>
    </div>
  );
};

export default AITrainingPanel;