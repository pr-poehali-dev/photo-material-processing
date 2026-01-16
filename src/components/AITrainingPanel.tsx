import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import ViolationMarkup from '@/components/ViolationMarkup';
import { ViolationCode } from '@/components/ViolationCodesManager';

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
  violationCodes: ViolationCode[];
}

const AITrainingPanel = ({ isOpen, onClose, violationCodes }: AITrainingPanelProps) => {
  const [metrics, setMetrics] = useState<AIMetrics[]>([]);
  const [trainingData, setTrainingData] = useState<TrainingDataItem[]>([]);
  const [datasetStats, setDatasetStats] = useState<any>(null);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [activeTab, setActiveTab] = useState<'training' | 'samples'>('training');
  const [isUploading, setIsUploading] = useState(false);
  const [selectedSampleForMarkup, setSelectedSampleForMarkup] = useState<TrainingDataItem | null>(null);

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



          <div className="flex gap-2 border-b border-slate-700 mb-6">
            <Button
              variant="ghost"
              onClick={() => setActiveTab('training')}
              className={`px-6 py-3 rounded-t-lg border-b-2 transition-colors ${
                activeTab === 'training'
                  ? 'border-purple-500 text-purple-400 bg-slate-800/50'
                  : 'border-transparent text-slate-400 hover:text-slate-300'
              }`}
            >
              <Icon name="Brain" size={18} className="mr-2" />
              Обучение модели
            </Button>
            <Button
              variant="ghost"
              onClick={() => setActiveTab('samples')}
              className={`px-6 py-3 rounded-t-lg border-b-2 transition-colors ${
                activeTab === 'samples'
                  ? 'border-purple-500 text-purple-400 bg-slate-800/50'
                  : 'border-transparent text-slate-400 hover:text-slate-300'
              }`}
            >
              <Icon name="Database" size={18} className="mr-2" />
              Размеченные образцы
            </Button>
          </div>

          {activeTab === 'training' && (
            <>
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
            </>
          )}

          {activeTab === 'samples' && (
            <Card className="bg-slate-900/50 border-slate-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">
                  Размеченные образцы ({trainingData.length})
                </h3>
                <div className="flex gap-2">
                  <Button
                    onClick={async () => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*';
                      input.multiple = true;
                      input.onchange = async (e: any) => {
                        const files = Array.from(e.target.files as FileList);
                        if (files.length > 0) {
                          setIsUploading(true);
                          
                          try {
                            let successCount = 0;
                            for (const file of files) {
                              try {
                                const response = await fetch('https://functions.poehali.dev/f988916a-a0b1-4821-8408-f7732ad49548', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    action: 'upload-sample',
                                    file_name: file.name
                                  })
                                });
                                
                                if (response.ok) {
                                  successCount++;
                                }
                              } catch (error) {
                                console.error(`Ошибка загрузки ${file.name}:`, error);
                              }
                            }
                            
                            await loadTrainingData();
                            alert(`Загружено ${successCount} из ${files.length} файлов`);
                          } catch (error) {
                            console.error('Ошибка загрузки файлов:', error);
                            alert('Ошибка при загрузке файлов');
                          } finally {
                            setIsUploading(false);
                          }
                        }
                      };
                      input.click();
                    }}
                    disabled={isUploading}
                    className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700"
                  >
                    <Icon name={isUploading ? 'Loader2' : 'Upload'} size={16} className={`mr-2 ${isUploading ? 'animate-spin' : ''}`} />
                    {isUploading ? 'Загрузка...' : 'Загрузить образцы'}
                  </Button>
                </div>
              </div>
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {trainingData.length === 0 ? (
                  <div className="text-center py-12">
                    <Icon name="FolderOpen" size={48} className="mx-auto text-slate-600 mb-4" />
                    <p className="text-slate-400 mb-2 text-lg font-semibold">Нет загруженных образцов</p>
                    <p className="text-xs text-slate-500 mb-4">
                      Загрузите изображения нарушений для разметки и обучения ИИ модели
                    </p>
                    <div className="flex items-start gap-2 text-sm text-blue-400 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 max-w-md mx-auto">
                      <Icon name="Info" size={16} className="mt-0.5 flex-shrink-0" />
                      <div className="text-left">
                        <p className="font-medium mb-2">Как начать работу:</p>
                        <ol className="text-xs space-y-1.5 text-slate-300">
                          <li>1. Нажмите кнопку "Загрузить образцы" выше</li>
                          <li>2. Выберите изображения с нарушениями (JPG, PNG)</li>
                          <li>3. После загрузки нажмите "Разметить" на образце</li>
                          <li>4. Выделите объекты и укажите код нарушения</li>
                          <li>5. Отметьте "Использовать для обучения ИИ"</li>
                          <li>6. Соберите минимум 10 размеченных образцов</li>
                          <li>7. Запустите обучение модели на вкладке выше</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                ) : (
                  trainingData.map((item) => (
                    <div
                      key={item.material_id}
                      className="group p-4 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-purple-500/50 hover:bg-slate-800 transition-all"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Icon name="FileImage" size={16} className="text-purple-400 flex-shrink-0" />
                            <p className="text-sm font-medium text-white truncate">{item.file_name}</p>
                          </div>
                          <p className="text-xs text-slate-400 mb-2">{item.notes || 'Требуется разметка'}</p>
                          <div className="flex items-center gap-2">
                            {item.violation_code ? (
                              <Badge variant="outline" className="text-amber-400 border-amber-400 text-xs">
                                {item.violation_code}
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-slate-500 border-slate-600 text-xs">
                                Не размечен
                              </Badge>
                            )}
                            <div className="flex items-center gap-1 text-slate-400">
                              <Icon name="Tag" size={12} />
                              <span className="text-xs">{item.regions_count} регионов</span>
                            </div>
                            {item.is_training_data && (
                              <Badge variant="outline" className="text-green-400 border-green-400 text-xs">
                                <Icon name="CheckCircle" size={10} className="mr-1" />
                                Для обучения
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedSampleForMarkup(item)}
                            className="border-purple-500/50 text-purple-400 hover:text-purple-300 hover:bg-purple-500/20 hover:border-purple-500"
                            title="Разметить нарушение"
                          >
                            <Icon name="Pencil" size={14} className="mr-1" />
                            Разметить
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            title="Удалить"
                          >
                            <Icon name="Trash2" size={16} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {trainingData.length > 0 && (
                <div className="mt-6 pt-4 border-t border-slate-700">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-slate-800/50 rounded-lg">
                      <p className="text-xs text-slate-400 mb-1">Всего образцов</p>
                      <p className="text-2xl font-bold text-white">{trainingData.length}</p>
                    </div>
                    <div className="p-3 bg-slate-800/50 rounded-lg">
                      <p className="text-xs text-slate-400 mb-1">Регионов</p>
                      <p className="text-2xl font-bold text-purple-400">
                        {trainingData.reduce((sum, item) => sum + item.regions_count, 0)}
                      </p>
                    </div>
                    <div className="p-3 bg-slate-800/50 rounded-lg">
                      <p className="text-xs text-slate-400 mb-1">Для обучения</p>
                      <p className="text-2xl font-bold text-green-400">
                        {trainingData.filter(item => item.is_training_data).length}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>
      </Card>

      {selectedSampleForMarkup && (
        <ViolationMarkup
          materialId={selectedSampleForMarkup.material_id}
          imageUrl={`https://placeholder-image-url/${selectedSampleForMarkup.file_name}`}
          violationCodes={violationCodes}
          onSave={async (markup) => {
            try {
              const response = await fetch('https://functions.poehali.dev/9128cf27-3d45-4ac1-b0a2-0c2935594a9e', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  material_id: markup.materialId,
                  violation_code: markup.violationCode,
                  regions: markup.regions,
                  notes: markup.notes,
                  is_training_data: markup.isTrainingData
                })
              });
              if (response.ok) {
                alert('Разметка сохранена!');
                setSelectedSampleForMarkup(null);
                await loadTrainingData();
              }
            } catch (error) {
              console.error('Ошибка сохранения разметки:', error);
              alert('Ошибка сохранения');
            }
          }}
          onCancel={() => setSelectedSampleForMarkup(null)}
        />
      )}
    </div>
  );
};

export default AITrainingPanel;