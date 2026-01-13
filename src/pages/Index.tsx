import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import ViolationCodesManager, { ViolationCode } from '@/components/ViolationCodesManager';
import { parseTarFiles } from '@/utils/tarParser';

interface Material {
  id: string;
  fileName: string;
  timestamp: string;
  preview: string;
  violationType?: string;
  violationCode?: string;
  status: 'pending' | 'violation' | 'clean' | 'analytics';
}

const mockMaterials: Material[] = [
  {
    id: '1',
    fileName: 'CAM_001_20260113_143022.tar',
    timestamp: '2026-01-13 14:30:22',
    preview: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400',
    status: 'pending',
  },
  {
    id: '2',
    fileName: 'CAM_002_20260113_143145.tar',
    timestamp: '2026-01-13 14:31:45',
    preview: 'https://images.unsplash.com/photo-1486496146582-9ffcd0b2b2b7?w=400',
    violationType: 'Превышение скорости',
    violationCode: '12.9.2',
    status: 'violation',
  },
  {
    id: '3',
    fileName: 'CAM_003_20260113_143301.tar',
    timestamp: '2026-01-13 14:33:01',
    preview: 'https://images.unsplash.com/photo-1502161254066-6c74afbf07aa?w=400',
    status: 'clean',
  },
  {
    id: '4',
    fileName: 'CAM_004_20260113_143512.tar',
    timestamp: '2026-01-13 14:35:12',
    preview: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=400',
    violationType: 'Проезд на красный',
    violationCode: '12.12.1',
    status: 'violation',
  },
  {
    id: '5',
    fileName: 'CAM_005_20260113_143628.tar',
    timestamp: '2026-01-13 14:36:28',
    preview: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400',
    status: 'analytics',
  },
  {
    id: '6',
    fileName: 'CAM_006_20260113_143745.tar',
    timestamp: '2026-01-13 14:37:45',
    preview: 'https://images.unsplash.com/photo-1514924013411-cbf25faa35bb?w=400',
    status: 'pending',
  },
];

export default function Index() {
  const [materials, setMaterials] = useState<Material[]>(mockMaterials);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isCodesManagerOpen, setIsCodesManagerOpen] = useState(false);
  const [violationCodes, setViolationCodes] = useState<ViolationCode[]>([
    { code: '34', description: 'КОАП 12.6 - Нарушение правил применения ремней безопасности' },
  ]);

  const handleTarUpload = async () => {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.webkitdirectory = true;
      input.multiple = true;
      
      input.onchange = async (e: any) => {
        const files = Array.from(e.target.files as FileList);
        const tarFiles = files.filter(file => file.name.endsWith('.tar'));
        
        if (tarFiles.length === 0) {
          alert('В выбранной папке не найдено TAR-архивов');
          return;
        }

        setIsUploading(true);
        
        const parsedMetadata = await parseTarFiles(tarFiles);
        
        const newMaterials: Material[] = parsedMetadata.map((metadata, index) => {
          const violationCode = metadata.violationCode;
          const codeInfo = violationCode ? violationCodes.find(c => c.code === violationCode) : undefined;
          
          return {
            id: `uploaded-${Date.now()}-${index}`,
            fileName: metadata.fileName,
            timestamp: metadata.timestamp || new Date().toLocaleString('ru-RU'),
            preview: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400',
            violationCode: violationCode,
            violationType: codeInfo?.description,
            status: violationCode ? 'violation' : 'clean',
          };
        });

        setMaterials(prev => [...newMaterials, ...prev]);
        setIsUploading(false);
        
        const violationsFound = newMaterials.filter(m => m.violationCode).length;
        alert(`Загружено ${tarFiles.length} TAR-архивов\nОбнаружено нарушений: ${violationsFound}`);
      };
      
      input.click();
    } catch (error) {
      console.error('Ошибка загрузки:', error);
      setIsUploading(false);
    }
  };



  const stats = {
    total: materials.length,
    violations: materials.filter(m => m.status === 'violation').length,
    clean: materials.filter(m => m.status === 'clean').length,
    analytics: materials.filter(m => m.status === 'analytics').length,
    pending: materials.filter(m => m.status === 'pending').length,
  };

  const updateMaterialStatus = (id: string, status: Material['status'], violationCode?: string) => {
    setMaterials(prev =>
      prev.map(m =>
        m.id === id
          ? {
              ...m,
              status,
              violationCode,
              violationType: violationCode
                ? violationCodes.find(v => v.code === violationCode)?.description
                : undefined,
            }
          : m
      )
    );
  };

  const getStatusColor = (status: Material['status']) => {
    switch (status) {
      case 'violation':
        return 'bg-orange-500';
      case 'clean':
        return 'bg-emerald-500';
      case 'analytics':
        return 'bg-violet-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusLabel = (status: Material['status']) => {
    switch (status) {
      case 'violation':
        return 'Нарушение';
      case 'clean':
        return 'Без нарушения';
      case 'analytics':
        return 'Аналитика';
      default:
        return 'Ожидает';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-sky-500 to-violet-600 rounded-lg">
                <Icon name="Camera" className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">TrafficVision AI</h1>
                <p className="text-sm text-slate-400">Система обработки фотоматериалов</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
                onClick={handleTarUpload}
                disabled={isUploading}
              >
                <Icon name={isUploading ? "Loader2" : "Upload"} size={16} className={`mr-2 ${isUploading ? 'animate-spin' : ''}`} />
                {isUploading ? 'Загрузка...' : 'Загрузить TAR'}
              </Button>
              <Button 
                variant="outline" 
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
                onClick={() => setIsCodesManagerOpen(true)}
              >
                <Icon name="Settings" size={16} className="mr-2" />
                Коды нарушений
              </Button>
              <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                <Icon name="FileCode" size={16} className="mr-2" />
                Импорт XML
              </Button>
              <Button className="bg-gradient-to-r from-sky-500 to-violet-600 text-white hover:from-sky-600 hover:to-violet-700">
                <Icon name="Download" size={16} className="mr-2" />
                Экспорт реестра
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-5 gap-4 mb-6">
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm p-6 hover-scale">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Всего материалов</p>
                <p className="text-3xl font-bold text-white">{stats.total}</p>
              </div>
              <div className="p-3 bg-slate-700/50 rounded-lg">
                <Icon name="Archive" className="text-sky-400" size={24} />
              </div>
            </div>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm p-6 hover-scale">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Нарушения</p>
                <p className="text-3xl font-bold text-orange-500">{stats.violations}</p>
              </div>
              <div className="p-3 bg-orange-500/10 rounded-lg">
                <Icon name="AlertTriangle" className="text-orange-500" size={24} />
              </div>
            </div>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm p-6 hover-scale">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Чистые</p>
                <p className="text-3xl font-bold text-emerald-500">{stats.clean}</p>
              </div>
              <div className="p-3 bg-emerald-500/10 rounded-lg">
                <Icon name="CheckCircle" className="text-emerald-500" size={24} />
              </div>
            </div>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm p-6 hover-scale">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Аналитика</p>
                <p className="text-3xl font-bold text-violet-500">{stats.analytics}</p>
              </div>
              <div className="p-3 bg-violet-500/10 rounded-lg">
                <Icon name="TrendingUp" className="text-violet-500" size={24} />
              </div>
            </div>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm p-6 hover-scale">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Ожидают</p>
                <p className="text-3xl font-bold text-gray-400">{stats.pending}</p>
              </div>
              <div className="p-3 bg-gray-700/50 rounded-lg">
                <Icon name="Clock" className="text-gray-400" size={24} />
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Материалы для обработки</h2>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="border-slate-700 text-slate-300">
                    <Icon name="Filter" size={14} className="mr-1" />
                    Фильтр
                  </Button>
                  <Button size="sm" variant="outline" className="border-slate-700 text-slate-300">
                    <Icon name="ArrowUpDown" size={14} className="mr-1" />
                    Сортировка
                  </Button>
                </div>
              </div>

              <div className="space-y-3 max-h-[calc(100vh-320px)] overflow-y-auto pr-2">
                {materials.map(material => (
                  <div
                    key={material.id}
                    onClick={() => setSelectedMaterial(material)}
                    className={`p-4 rounded-lg border transition-all cursor-pointer hover-scale ${
                      selectedMaterial?.id === material.id
                        ? 'bg-slate-700/50 border-sky-500'
                        : 'bg-slate-900/30 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex gap-4">
                      <img
                        src={material.preview}
                        alt={material.fileName}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-white font-semibold truncate mb-1">
                              {material.fileName}
                            </h3>
                            <p className="text-slate-400 text-sm">{material.timestamp}</p>
                          </div>
                          <Badge className={`${getStatusColor(material.status)} text-white ml-2`}>
                            {getStatusLabel(material.status)}
                          </Badge>
                        </div>
                        {material.violationType && (
                          <div className="mt-2 p-2 bg-orange-500/10 border border-orange-500/20 rounded">
                            <p className="text-orange-400 text-sm font-medium">
                              {material.violationCode}: {material.violationType}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="col-span-1">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm p-6 sticky top-6">
              {selectedMaterial ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-4">Детали материала</h3>
                    <img
                      src={selectedMaterial.preview}
                      alt={selectedMaterial.fileName}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-400 text-sm">Файл:</span>
                        <span className="text-white text-sm font-medium">
                          {selectedMaterial.fileName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 text-sm">Время:</span>
                        <span className="text-white text-sm">{selectedMaterial.timestamp}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 text-sm">Статус:</span>
                        <Badge className={`${getStatusColor(selectedMaterial.status)} text-white`}>
                          {getStatusLabel(selectedMaterial.status)}
                        </Badge>
                      </div>
                      {selectedMaterial.violationCode && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-slate-400 text-sm">Код нарушения:</span>
                            <span className="text-amber-400 font-mono font-semibold">
                              {selectedMaterial.violationCode}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400 text-sm">Тип нарушения:</span>
                            <span className="text-white text-sm">
                              {selectedMaterial.violationType || 'Неизвестно'}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-slate-700 pt-4">
                    <label className="text-white text-sm font-medium mb-2 block">
                      Код нарушения
                    </label>
                    <Select
                      value={selectedMaterial.violationCode || ''}
                      onValueChange={code =>
                        updateMaterialStatus(selectedMaterial.id, 'violation', code)
                      }
                    >
                      <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                        <SelectValue placeholder="Выберите код..." />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-700">
                        {violationCodes.map(v => (
                          <SelectItem key={v.code} value={v.code} className="text-white">
                            {v.code} - {v.description}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="border-t border-slate-700 pt-4">
                    <label className="text-white text-sm font-medium mb-3 block">
                      Присвоить статус
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                      <Button
                        onClick={() => updateMaterialStatus(selectedMaterial.id, 'violation')}
                        className="bg-orange-500 hover:bg-orange-600 text-white justify-start"
                      >
                        <Icon name="AlertTriangle" size={16} className="mr-2" />
                        Нарушение
                      </Button>
                      <Button
                        onClick={() => updateMaterialStatus(selectedMaterial.id, 'clean')}
                        variant="outline"
                        className="border-emerald-500 text-emerald-400 hover:bg-emerald-500/10 justify-start"
                      >
                        <Icon name="CheckCircle" size={16} className="mr-2" />
                        Без нарушения
                      </Button>
                      <Button
                        onClick={() => updateMaterialStatus(selectedMaterial.id, 'analytics')}
                        variant="outline"
                        className="border-violet-500 text-violet-400 hover:bg-violet-500/10 justify-start"
                      >
                        <Icon name="TrendingUp" size={16} className="mr-2" />
                        Для аналитики
                      </Button>
                    </div>
                  </div>

                  <div className="border-t border-slate-700 pt-4">
                    <Button className="w-full bg-gradient-to-r from-sky-500 to-violet-600 text-white">
                      <Icon name="Play" size={16} className="mr-2" />
                      Воспроизвести видео
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Icon name="MousePointerClick" size={48} className="text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">Выберите материал для просмотра деталей</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      <ViolationCodesManager
        isOpen={isCodesManagerOpen}
        onClose={() => setIsCodesManagerOpen(false)}
        codes={violationCodes}
        onCodesChange={setViolationCodes}
      />
    </div>
  );
}