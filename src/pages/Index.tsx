import { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import Icon from '@/components/ui/icon';
import ViolationCodesManager, { ViolationCode } from '@/components/ViolationCodesManager';
import { parseTarFiles, TarImages } from '@/utils/tarParser';
import { loadMaterials, saveMaterials } from '@/utils/materialsStorage';
import PhotoGallery from '@/components/PhotoGallery';
import ViolationMarkup from '@/components/ViolationMarkup';
import ViolationParameters, { defaultParametersByCode, ViolationParameterValue } from '@/components/ViolationParameters';
import AITrainingPanel from '@/components/AITrainingPanel';
import MarkupInstructions from '@/components/MarkupInstructions';
import SettingsPanel from '@/components/SettingsPanel';
import Analytics from '@/components/Analytics';

interface Material {
  id: string;
  fileName: string;
  timestamp: string;
  preview: string;
  violationType?: string;
  violationCode?: string;
  status: 'pending' | 'violation' | 'clean' | 'analytics' | 'processed';
  images?: TarImages;
  tarFile?: File;
  aiPrediction?: {
    hasViolation: boolean;
    confidence: number;
    violationCode?: string;
    violationType?: string;
    detectedObjects?: Array<{
      type: string;
      confidence: number;
      bbox: number[];
    }>;
  };
  isProcessingAI?: boolean;
  parameterValues?: ViolationParameterValue[];
  markupData?: any;
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

const STORAGE_KEY = 'trafficvision_violation_codes';
const SOURCE_PATH_KEY = 'trafficvision_source_path';
const OUTPUT_PATH_KEY = 'trafficvision_output_path';
const STATUS_FILTER_KEY = 'trafficvision_status_filter';
const SELECTED_MATERIALS_KEY = 'trafficvision_selected_materials';
const SELECTED_MATERIAL_KEY = 'trafficvision_selected_material';

const getStoredCodes = (): ViolationCode[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Ошибка загрузки кодов:', error);
  }
  return [
    { 
      code: '34', 
      description: 'КОАП 12.6 - Нарушение правил применения ремней безопасности',
      xmlTag: 'nNoSeatBelt',
      photoMaterials: [
        {
          id: 'collage',
          pattern: '*_0.jpg',
          title: 'Общий коллаж',
          icon: 'LayoutGrid',
          color: 'from-blue-500 to-cyan-600',
          type: 'photo',
        },
        {
          id: 'time1',
          pattern: '*_1.jpg',
          title: 'Время от момента включения сигнала (1)',
          icon: 'Clock',
          color: 'from-amber-500 to-orange-600',
          type: 'photo',
        },
        {
          id: 'time2',
          pattern: '*_2.jpg',
          title: 'Время от момента включения сигнала (2)',
          icon: 'Clock',
          color: 'from-amber-500 to-orange-600',
          type: 'photo',
        },
        {
          id: 'fix1',
          pattern: '*_3.jpg',
          title: 'Время первой фиксации',
          icon: 'Target',
          color: 'from-red-500 to-rose-600',
          type: 'photo',
        },
        {
          id: 'fix2',
          pattern: '*_4.jpg',
          title: 'Время второй фиксации',
          icon: 'Target',
          color: 'from-red-500 to-rose-600',
          type: 'photo',
        },
        {
          id: 'plate',
          pattern: '*_grz.jpg',
          title: 'Увеличенное фото ГРЗ',
          icon: 'RectangleHorizontal',
          color: 'from-purple-500 to-pink-600',
          type: 'photo',
        },
        {
          id: 'general',
          pattern: '*.jpg',
          title: 'Общий кадр',
          icon: 'Camera',
          color: 'from-green-500 to-emerald-600',
          type: 'photo',
        },
        {
          id: 'video',
          pattern: '*.mp4',
          title: 'Видеоматериал',
          icon: 'Video',
          color: 'from-red-500 to-pink-600',
          type: 'video',
        },
      ]
    },
    { 
      code: '12.12', 
      description: 'КОАП 12.12 - Проезд на запрещающий сигнал светофора или стоп-линию',
      xmlTag: 'nStopLine',
      photoMaterials: [
        {
          id: 'collage',
          pattern: '*_0.jpg',
          title: 'Общий коллаж',
          icon: 'LayoutGrid',
          color: 'from-blue-500 to-cyan-600',
          type: 'photo',
        },
        {
          id: 'time1',
          pattern: '*_1.jpg',
          title: 'Время до нарушения',
          icon: 'Clock',
          color: 'from-amber-500 to-orange-600',
          type: 'photo',
        },
        {
          id: 'time2',
          pattern: '*_2.jpg',
          title: 'Момент нарушения',
          icon: 'Clock',
          color: 'from-amber-500 to-orange-600',
          type: 'photo',
        },
        {
          id: 'fix1',
          pattern: '*_3.jpg',
          title: 'Фиксация нарушения (1)',
          icon: 'Target',
          color: 'from-red-500 to-rose-600',
          type: 'photo',
        },
        {
          id: 'fix2',
          pattern: '*_4.jpg',
          title: 'Фиксация нарушения (2)',
          icon: 'Target',
          color: 'from-red-500 to-rose-600',
          type: 'photo',
        },
        {
          id: 'plate',
          pattern: '*_grz.jpg',
          title: 'Увеличенное фото ГРЗ',
          icon: 'RectangleHorizontal',
          color: 'from-purple-500 to-pink-600',
          type: 'photo',
        },
        {
          id: 'video',
          pattern: '*.mp4',
          title: 'Видеоматериал',
          icon: 'Video',
          color: 'from-red-500 to-pink-600',
          type: 'video',
        },
      ]
    },
    { 
      code: '12.13', 
      description: 'КОАП 12.13 - Нарушение правил проезда перекрестков (приоритет)',
      xmlTag: 'tPPrior',
      photoMaterials: [
        {
          id: 'collage',
          pattern: '*_0.jpg',
          title: 'Общий коллаж',
          icon: 'LayoutGrid',
          color: 'from-blue-500 to-cyan-600',
          type: 'photo',
        },
        {
          id: 'time1',
          pattern: '*_1.jpg',
          title: 'Подъезд к перекрестку',
          icon: 'Clock',
          color: 'from-amber-500 to-orange-600',
          type: 'photo',
        },
        {
          id: 'time2',
          pattern: '*_2.jpg',
          title: 'Момент нарушения приоритета',
          icon: 'Clock',
          color: 'from-amber-500 to-orange-600',
          type: 'photo',
        },
        {
          id: 'fix1',
          pattern: '*_3.jpg',
          title: 'Фиксация (1)',
          icon: 'Target',
          color: 'from-red-500 to-rose-600',
          type: 'photo',
        },
        {
          id: 'fix2',
          pattern: '*_4.jpg',
          title: 'Фиксация (2)',
          icon: 'Target',
          color: 'from-red-500 to-rose-600',
          type: 'photo',
        },
        {
          id: 'plate',
          pattern: '*_grz.jpg',
          title: 'Увеличенное фото ГРЗ',
          icon: 'RectangleHorizontal',
          color: 'from-purple-500 to-pink-600',
          type: 'photo',
        },
        {
          id: 'video',
          pattern: '*.mp4',
          title: 'Видеоматериал',
          icon: 'Video',
          color: 'from-red-500 to-pink-600',
          type: 'video',
        },
      ]
    },
  ];
};



const getStoredStatusFilter = (): Set<Material['status']> => {
  try {
    const stored = localStorage.getItem(STATUS_FILTER_KEY);
    if (stored) {
      return new Set(JSON.parse(stored));
    }
  } catch (error) {
    console.error('Ошибка загрузки фильтра:', error);
  }
  return new Set(['pending', 'violation', 'clean', 'analytics', 'processed']);
};

export default function Index() {
  const [materials, setMaterials] = useState<Material[]>(mockMaterials);
  const [materialsLoaded, setMaterialsLoaded] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(() => {
    try {
      const stored = localStorage.getItem(SELECTED_MATERIAL_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [processingProgress, setProcessingProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isSyncingDB, setIsSyncingDB] = useState(false);
  const [isCodesManagerOpen, setIsCodesManagerOpen] = useState(false);
  const [violationCodes, setViolationCodes] = useState<ViolationCode[]>(getStoredCodes());
  const [sourcePath, setSourcePath] = useState<string>(() => localStorage.getItem(SOURCE_PATH_KEY) || '');
  const [outputPath, setOutputPath] = useState<string>(() => localStorage.getItem(OUTPUT_PATH_KEY) || '');
  const [statusFilter, setStatusFilter] = useState<Set<Material['status']>>(getStoredStatusFilter);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedMaterialIds, setSelectedMaterialIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(SELECTED_MATERIALS_KEY);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });
  const [showMarkup, setShowMarkup] = useState(false);
  const [showParameters, setShowParameters] = useState(false);
  const [parameterValues, setParameterValues] = useState<ViolationParameterValue[]>([]);
  const [isAITrainingOpen, setIsAITrainingOpen] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [aiRefreshTrigger, setAiRefreshTrigger] = useState(0);
  const [sessionToken, setSessionToken] = useState<string | null>(() => localStorage.getItem('session_token'));
  const [currentUser, setCurrentUser] = useState<any>(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(violationCodes));
    } catch (error) {
      console.error('Ошибка сохранения кодов:', error);
    }
  }, [violationCodes]);

  useEffect(() => {
    const initMaterials = async () => {
      try {
        const response = await fetch('https://functions.poehali.dev/3825a25a-1874-4f7f-89da-9e99f8a60190', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'list' })
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.materials && data.materials.length > 0) {
            setMaterials(data.materials);
            
            const storedSelectedMaterial = localStorage.getItem(SELECTED_MATERIAL_KEY);
            if (storedSelectedMaterial) {
              try {
                const parsed = JSON.parse(storedSelectedMaterial);
                const found = data.materials.find((m: Material) => m.id === parsed.id);
                if (found) {
                  setSelectedMaterial(found);
                  setParameterValues(found.parameterValues || []);
                }
              } catch (error) {
                console.error('Ошибка восстановления выбранного материала:', error);
              }
            }
          } else {
            const loaded = await loadMaterials();
            if (loaded.length > 0) {
              setMaterials(loaded);
            }
          }
        } else {
          const loaded = await loadMaterials();
          if (loaded.length > 0) {
            setMaterials(loaded);
          }
        }
      } catch (error) {
        console.error('Ошибка загрузки из БД:', error);
        const loaded = await loadMaterials();
        if (loaded.length > 0) {
          setMaterials(loaded);
        }
      }
      
      setMaterialsLoaded(true);
    };
    initMaterials();
  }, []);

  useEffect(() => {
    if (materialsLoaded) {
      saveMaterials(materials);
      
      const syncToDB = async () => {
        setIsSyncingDB(true);
        try {
          await fetch('https://functions.poehali.dev/3825a25a-1874-4f7f-89da-9e99f8a60190', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              action: 'bulk_create',
              materials: materials.map(m => ({
                id: m.id,
                fileName: m.fileName,
                timestamp: m.timestamp,
                preview: m.preview,
                status: m.status,
                violationType: m.violationType,
                violationCode: m.violationCode
              }))
            })
          });
        } catch (error) {
          console.error('Ошибка синхронизации с БД:', error);
        } finally {
          setIsSyncingDB(false);
        }
      };
      
      syncToDB();
    }
  }, [materials, materialsLoaded]);

  useEffect(() => {
    try {
      localStorage.setItem(SOURCE_PATH_KEY, sourcePath);
    } catch (error) {
      console.error('Ошибка сохранения пути:', error);
    }
  }, [sourcePath]);

  useEffect(() => {
    try {
      localStorage.setItem(OUTPUT_PATH_KEY, outputPath);
    } catch (error) {
      console.error('Ошибка сохранения пути:', error);
    }
  }, [outputPath]);

  useEffect(() => {
    try {
      localStorage.setItem(STATUS_FILTER_KEY, JSON.stringify(Array.from(statusFilter)));
    } catch (error) {
      console.error('Ошибка сохранения фильтра:', error);
    }
  }, [statusFilter]);

  useEffect(() => {
    try {
      if (sessionToken) {
        localStorage.setItem('session_token', sessionToken);
      } else {
        localStorage.removeItem('session_token');
      }
    } catch (error) {
      console.error('Ошибка сохранения токена:', error);
    }
  }, [sessionToken]);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('user');
      }
    } catch (error) {
      console.error('Ошибка сохранения пользователя:', error);
    }
  }, [currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem(SELECTED_MATERIALS_KEY, JSON.stringify(Array.from(selectedMaterialIds)));
    } catch (error) {
      console.error('Ошибка сохранения выбранных материалов:', error);
    }
  }, [selectedMaterialIds]);

  useEffect(() => {
    try {
      if (selectedMaterial) {
        localStorage.setItem(SELECTED_MATERIAL_KEY, JSON.stringify(selectedMaterial));
      } else {
        localStorage.removeItem(SELECTED_MATERIAL_KEY);
      }
    } catch (error) {
      console.error('Ошибка сохранения выбранного материала:', error);
    }
  }, [selectedMaterial]);

  const handleSelectSourcePath = async () => {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.webkitdirectory = true;
      input.multiple = true;
      
      input.onchange = async (e: any) => {
        const files = Array.from(e.target.files as FileList);
        if (files.length > 0) {
          const firstFile = files[0] as any;
          const path = firstFile.webkitRelativePath || firstFile.path || '';
          const folderPath = path.split('/')[0];
          setSourcePath(folderPath);

          const tarFiles = files.filter((file: File) => file.name.endsWith('.tar'));
          
          if (tarFiles.length === 0) {
            alert('В выбранной папке не найдено TAR-архивов');
            return;
          }

          setIsUploading(true);
          
          const parsedMetadata = await parseTarFiles(tarFiles, violationCodes);
          
          const newMaterials: Material[] = parsedMetadata.map((metadata, index) => {
            const violationCode = metadata.violationCode;
            const codeInfo = violationCode ? violationCodes.find(c => c.code === violationCode) : undefined;
            
            return {
              id: `uploaded-${Date.now()}-${index}`,
              fileName: metadata.fileName,
              timestamp: metadata.timestamp || new Date().toLocaleString('ru-RU'),
              preview: metadata.preview || 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400',
              violationCode: violationCode,
              violationType: codeInfo?.description,
              status: 'pending',
              images: metadata.images,
              tarFile: tarFiles[index],
            };
          });

          setMaterials(prev => [...newMaterials, ...prev]);
          setIsUploading(false);
          
          const violationsFound = newMaterials.filter(m => m.violationCode).length;
          alert(`Загружено ${tarFiles.length} TAR-архивов\nОбнаружено нарушений: ${violationsFound}`);
        }
      };
      
      input.click();
    } catch (error) {
      console.error('Ошибка выбора каталога:', error);
      setIsUploading(false);
    }
  };

  const handleSelectOutputPath = async () => {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.webkitdirectory = true;
      input.multiple = true;
      
      input.onchange = async (e: any) => {
        const files = Array.from(e.target.files as FileList);
        if (files.length > 0) {
          const firstFile = files[0] as any;
          const path = firstFile.webkitRelativePath || firstFile.path || '';
          const folderPath = path.split('/')[0];
          setOutputPath(folderPath);
        }
      };
      
      input.click();
    } catch (error) {
      console.error('Ошибка выбора каталога:', error);
    }
  };

  const handleTarUpload = async () => {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.tar';
      input.multiple = true;
      
      input.onchange = async (e: any) => {
        const files = Array.from(e.target.files as FileList);
        const tarFiles = files.filter(file => file.name.endsWith('.tar'));
        
        if (tarFiles.length === 0) {
          alert('Выберите TAR-архивы для загрузки');
          return;
        }

        setIsUploading(true);
        
        const parsedMetadata = await parseTarFiles(tarFiles, violationCodes);
        
        const newMaterials: Material[] = parsedMetadata.map((metadata, index) => {
          const violationCode = metadata.violationCode;
          const codeInfo = violationCode ? violationCodes.find(c => c.code === violationCode) : undefined;
          
          return {
            id: `uploaded-${Date.now()}-${index}`,
            fileName: metadata.fileName,
            timestamp: metadata.timestamp || new Date().toLocaleString('ru-RU'),
            preview: metadata.preview || 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400',
            violationCode: violationCode,
            violationType: codeInfo?.description,
            status: 'pending',
            images: metadata.images,
            tarFile: tarFiles[index],
            isProcessingAI: true,
          };
        });

        setMaterials(prev => [...newMaterials, ...prev]);
        setIsUploading(false);
        
        newMaterials.forEach(async (material) => {
          await processWithAI(material.id);
        });
        
        const violationsFound = newMaterials.filter(m => m.violationCode).length;
        alert(`Загружено ${tarFiles.length} TAR-архивов\nОбнаружено нарушений: ${violationsFound}`);
      };
      
      input.click();
    } catch (error) {
      console.error('Ошибка загрузки:', error);
      setIsUploading(false);
    }
  };



  const stats = useMemo(() => ({
    total: materials.length,
    violations: materials.filter(m => m.status === 'violation').length,
    clean: materials.filter(m => m.status === 'clean').length,
    analytics: materials.filter(m => m.status === 'analytics').length,
    pending: materials.filter(m => m.status === 'pending').length,
    processed: materials.filter(m => m.status === 'processed').length,
  }), [materials]);

  const exportProcessedMaterial = async (material: Material) => {
    if (!outputPath) {
      alert('Сначала выберите каталог для обработанных материалов');
      return;
    }

    if (!material.tarFile) {
      alert('TAR-файл недоступен для экспорта');
      return;
    }

    try {
      const link = document.createElement('a');
      const url = URL.createObjectURL(material.tarFile);
      link.href = url;
      link.download = material.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Ошибка экспорта:', error);
      alert('Ошибка при экспорте файла');
    }
  };

  const updateMaterialStatus = (id: string, status: Material['status'], violationCode?: string) => {
    const material = materials.find(m => m.id === id);
    
    const updatedMaterials = materials.map(m =>
      m.id === id
        ? {
            ...m,
            status,
            violationCode,
            violationType: violationCode
              ? violationCodes.find(v => v.code === violationCode)?.description
              : undefined,
            parameterValues: m.id === id ? parameterValues : m.parameterValues,
          }
        : m
    );
    
    setMaterials(updatedMaterials);
    
    if (selectedMaterial?.id === id) {
      setSelectedMaterial(prev => 
        prev ? {
          ...prev,
          status,
          violationCode,
          violationType: violationCode
            ? violationCodes.find(v => v.code === violationCode)?.description
            : undefined,
          parameterValues,
        } : null
      );
    }

    if (status === 'processed' && material && outputPath) {
      exportProcessedMaterial(material);
    }
  };

  const getStatusColor = (status: Material['status']) => {
    switch (status) {
      case 'violation':
        return 'bg-orange-500';
      case 'clean':
        return 'bg-emerald-500';
      case 'analytics':
        return 'bg-violet-500';
      case 'processed':
        return 'bg-blue-500';
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
      case 'processed':
        return 'Обработан';
      default:
        return 'Ожидает';
    }
  };

  const handleToggleSelection = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedMaterialIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    const filteredMaterials = materials.filter(m => statusFilter.has(m.status));
    setSelectedMaterialIds(new Set(filteredMaterials.map(m => m.id)));
  };

  const handleDeselectAll = () => {
    setSelectedMaterialIds(new Set());
  };

  const handleDeleteSelected = async () => {
    if (selectedMaterialIds.size === 0) return;
    
    if (confirm(`Удалить выбранные материалы (${selectedMaterialIds.size} шт.)?`)) {
      const idsToDelete = Array.from(selectedMaterialIds);
      
      try {
        await fetch('https://functions.poehali.dev/3825a25a-1874-4f7f-89da-9e99f8a60190', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            action: 'delete',
            ids: idsToDelete
          })
        });
      } catch (error) {
        console.error('Ошибка удаления из БД:', error);
      }
      
      setMaterials(prev => prev.filter(m => !selectedMaterialIds.has(m.id)));
      if (selectedMaterial && selectedMaterialIds.has(selectedMaterial.id)) {
        setSelectedMaterial(null);
      }
      setSelectedMaterialIds(new Set());
    }
  };

  const processWithAI = async (materialId: string) => {
    try {
      const response = await fetch('https://functions.poehali.dev/f988916a-a0b1-4821-8408-f7732ad49548', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'predict',
          material_id: materialId
        })
      });

      if (response.ok) {
        const data = await response.json();
        const prediction = data.prediction;

        setMaterials(prev => prev.map(m => {
          if (m.id === materialId) {
            const codeInfo = prediction.violation_code ? 
              violationCodes.find(c => c.code === prediction.violation_code) : undefined;

            return {
              ...m,
              isProcessingAI: false,
              aiPrediction: prediction,
              status: prediction.has_violation ? 'violation' : 'clean',
              violationCode: prediction.violation_code,
              violationType: codeInfo?.description || prediction.violation_type
            };
          }
          return m;
        }));
      } else {
        setMaterials(prev => prev.map(m => 
          m.id === materialId ? { ...m, isProcessingAI: false } : m
        ));
      }
    } catch (error) {
      console.error('Ошибка распознавания ИИ:', error);
      setMaterials(prev => prev.map(m => 
        m.id === materialId ? { ...m, isProcessingAI: false } : m
      ));
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
              <Button 
                variant="outline" 
                className="border-purple-500 text-purple-400 hover:bg-purple-500/10"
                onClick={() => setIsAITrainingOpen(true)}
              >
                <Icon name="Brain" size={16} className="mr-2" />
                Обучение ИИ
              </Button>
              <Button 
                variant="outline" 
                className="border-green-500 text-green-400 hover:bg-green-500/10"
                onClick={() => setIsAnalyticsOpen(true)}
              >
                <Icon name="LineChart" size={16} className="mr-2" />
                Аналитика
              </Button>
              <Button 
                variant="outline" 
                className="border-blue-500 text-blue-400 hover:bg-blue-500/10"
                onClick={() => setIsSettingsOpen(true)}
              >
                <Icon name="Settings" size={16} className="mr-2" />
                Настройки
              </Button>
              <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                <Icon name="FileCode" size={16} className="mr-2" />
                Импорт XML
              </Button>
              <Button className="bg-gradient-to-r from-sky-500 to-violet-600 text-white hover:from-sky-600 hover:to-violet-700">
                <Icon name="Download" size={16} className="mr-2" />
                Экспорт реестра
              </Button>
              {isSyncingDB && (
                <div className="flex items-center gap-2 px-3 py-2 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <Icon name="Database" size={16} className="text-blue-400 animate-pulse" />
                  <span className="text-blue-400 text-sm">Синхронизация с БД...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0 mr-3">
                <label className="text-slate-400 text-sm mb-2 block">Каталог с TAR-архивами</label>
                <div className="bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-white text-sm truncate">
                  {sourcePath || 'Не выбран'}
                </div>
              </div>
              <Button
                onClick={handleSelectSourcePath}
                className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white hover:from-blue-600 hover:to-cyan-700 flex-shrink-0"
              >
                <Icon name="FolderOpen" size={16} className="mr-2" />
                Выбрать
              </Button>
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0 mr-3">
                <label className="text-slate-400 text-sm mb-2 block">Каталог для обработанных материалов</label>
                <div className="bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-white text-sm truncate">
                  {outputPath || 'Не выбран'}
                </div>
              </div>
              <Button
                onClick={handleSelectOutputPath}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 flex-shrink-0"
              >
                <Icon name="FolderOutput" size={16} className="mr-2" />
                Выбрать
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-6 gap-4 mb-6 mt-6">
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

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm p-6 hover-scale">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Обработаны</p>
                <p className="text-3xl font-bold text-blue-500">{stats.processed}</p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <Icon name="CheckCheck" className="text-blue-500" size={24} />
              </div>
            </div>
          </Card>
        </div>

        <ResizablePanelGroup direction="horizontal" className="min-h-[600px]">
          <ResizablePanel defaultSize={65} minSize={40}>
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm p-6 h-full mr-3 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-white">Материалы для обработки</h2>
                  {selectedMaterialIds.size > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-400">Выбрано: {selectedMaterialIds.size}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleDeleteSelected}
                        className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-500"
                      >
                        <Icon name="Trash2" size={14} className="mr-1" />
                        Удалить
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleDeselectAll}
                        className="text-slate-400 hover:text-white"
                      >
                        <Icon name="X" size={14} className="mr-1" />
                        Отменить
                      </Button>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="border-slate-700 text-slate-300"
                      onClick={() => setIsFilterOpen(!isFilterOpen)}
                    >
                      <Icon name="Filter" size={14} className="mr-1" />
                      Фильтр ({statusFilter.size})
                    </Button>
                    {isFilterOpen && (
                      <div className="absolute top-full mt-2 right-0 bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-xl z-10 min-w-[200px]">
                        <div className="space-y-2">
                          {[
                            { status: 'pending' as const, label: 'Ожидает', color: 'bg-gray-400' },
                            { status: 'violation' as const, label: 'Нарушение', color: 'bg-orange-500' },
                            { status: 'clean' as const, label: 'Без нарушения', color: 'bg-emerald-500' },
                            { status: 'analytics' as const, label: 'Аналитика', color: 'bg-violet-500' },
                            { status: 'processed' as const, label: 'Обработан', color: 'bg-blue-500' },
                          ].map(({ status, label, color }) => (
                            <label key={status} className="flex items-center gap-2 cursor-pointer hover:bg-slate-700 p-2 rounded">
                              <input
                                type="checkbox"
                                checked={statusFilter.has(status)}
                                onChange={(e) => {
                                  setStatusFilter(prev => {
                                    const newFilter = new Set(prev);
                                    if (e.target.checked) {
                                      newFilter.add(status);
                                    } else {
                                      newFilter.delete(status);
                                    }
                                    return newFilter;
                                  });
                                }}
                                className="w-4 h-4"
                              />
                              <div className={`w-3 h-3 rounded-full ${color}`}></div>
                              <span className="text-white text-sm">{label}</span>
                            </label>
                          ))}
                        </div>
                        <div className="mt-3 pt-3 border-t border-slate-700 flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 text-xs border-slate-700 text-slate-300"
                            onClick={() => setStatusFilter(new Set(['pending', 'violation', 'clean', 'analytics', 'processed']))}
                          >
                            Все
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 text-xs border-slate-700 text-slate-300"
                            onClick={() => setStatusFilter(new Set())}
                          >
                            Очистить
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                  <Button size="sm" variant="outline" className="border-slate-700 text-slate-300">
                    <Icon name="ArrowUpDown" size={14} className="mr-1" />
                    Сортировка
                  </Button>
                  {selectedMaterialIds.size === 0 && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleSelectAll}
                      className="border-slate-700 text-slate-300"
                    >
                      <Icon name="CheckSquare" size={14} className="mr-1" />
                      Выбрать все
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto pr-2">
                {materials.filter(m => statusFilter.has(m.status)).map(material => (
                  <div
                    key={material.id}
                    onClick={() => {
                      setSelectedMaterial(material);
                      setParameterValues(material.parameterValues || []);
                    }}
                    className={`p-4 rounded-lg border transition-all cursor-pointer hover-scale ${
                      selectedMaterial?.id === material.id
                        ? 'bg-slate-700/50 border-sky-500'
                        : selectedMaterialIds.has(material.id)
                        ? 'bg-blue-900/30 border-blue-500'
                        : 'bg-slate-900/30 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <input
                          type="checkbox"
                          checked={selectedMaterialIds.has(material.id)}
                          onChange={(e) => handleToggleSelection(material.id, e)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-5 h-5 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer mt-1"
                        />
                      </div>
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
                        {material.isProcessingAI && (
                          <div className="mt-2 p-2 bg-purple-500/10 border border-purple-500/20 rounded flex items-center gap-2">
                            <Icon name="Loader2" size={14} className="text-purple-400 animate-spin" />
                            <p className="text-purple-400 text-sm">
                              Анализ ИИ...
                            </p>
                          </div>
                        )}
                        {material.aiPrediction && !material.isProcessingAI && (
                          <div className="mt-2 p-2 bg-blue-500/10 border border-blue-500/20 rounded">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Icon name="Brain" size={14} className="text-blue-400" />
                                <p className="text-blue-400 text-sm font-medium">
                                  ИИ: {material.aiPrediction.hasViolation ? 'Нарушение' : 'Чисто'}
                                </p>
                              </div>
                              <Badge variant="outline" className="text-blue-400 border-blue-400">
                                {(material.aiPrediction.confidence * 100).toFixed(0)}%
                              </Badge>
                            </div>
                          </div>
                        )}
                        {material.violationType && !material.aiPrediction && (
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
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={35} minSize={30}>
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm p-6 h-full overflow-y-auto ml-3">
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
                      {selectedMaterial.aiPrediction && (
                        <div className="p-3 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-lg space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Icon name="Brain" size={16} className="text-purple-400" />
                              <span className="text-sm font-semibold text-purple-400">Анализ ИИ</span>
                            </div>
                            <Badge variant="outline" className="text-purple-400 border-purple-400">
                              {(selectedMaterial.aiPrediction.confidence * 100).toFixed(1)}%
                            </Badge>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-300">Результат:</span>
                            <span className={selectedMaterial.aiPrediction.hasViolation ? "text-orange-400 font-medium" : "text-green-400 font-medium"}>
                              {selectedMaterial.aiPrediction.hasViolation ? 'Нарушение обнаружено' : 'Нарушений не обнаружено'}
                            </span>
                          </div>
                          {selectedMaterial.aiPrediction.detectedObjects && selectedMaterial.aiPrediction.detectedObjects.length > 0 && (
                            <div className="pt-2 border-t border-purple-500/20">
                              <p className="text-xs text-slate-400 mb-2">Обнаруженные объекты:</p>
                              <div className="space-y-1">
                                {selectedMaterial.aiPrediction.detectedObjects.map((obj, idx) => (
                                  <div key={idx} className="flex items-center justify-between text-xs">
                                    <span className="text-slate-300">
                                      {obj.type === 'vehicle' ? 'ТС' : obj.type === 'plate' ? 'Номер' : obj.type}
                                    </span>
                                    <span className="text-blue-400">{(obj.confidence * 100).toFixed(0)}%</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          <div className="pt-2 border-t border-purple-500/20 flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 border-green-500 text-green-400 hover:bg-green-500/10"
                              onClick={async () => {
                                try {
                                  const response = await fetch('https://functions.poehali.dev/9128cf27-3d45-4ac1-b0a2-0c2935594a9e', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                      material_id: selectedMaterial.id,
                                      violation_code: selectedMaterial.aiPrediction.violationCode,
                                      regions: [],
                                      notes: 'Результат ИИ подтвержден пользователем',
                                      is_training_data: true,
                                      parameters: []
                                    })
                                  });
                                  if (response.ok) {
                                    alert('Результат подтвержден и добавлен в обучающую выборку!');
                                  }
                                } catch (error) {
                                  console.error('Ошибка сохранения:', error);
                                }
                              }}
                            >
                              <Icon name="Check" size={14} className="mr-1" />
                              Верно
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 border-red-500 text-red-400 hover:bg-red-500/10"
                              onClick={() => {
                                setMaterials(prev => prev.map(m => 
                                  m.id === selectedMaterial.id 
                                    ? { ...m, aiPrediction: undefined, status: 'pending', violationCode: undefined, violationType: undefined }
                                    : m
                                ));
                                setSelectedMaterial({ ...selectedMaterial, aiPrediction: undefined, status: 'pending', violationCode: undefined, violationType: undefined });
                                alert('Результат ИИ отклонен. Вы можете разметить материал вручную.');
                              }}
                            >
                              <Icon name="X" size={14} className="mr-1" />
                              Неверно
                            </Button>
                          </div>
                        </div>
                      )}
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
                    <PhotoGallery 
                      images={selectedMaterial.images} 
                      fileName={selectedMaterial.fileName}
                      photoMaterials={violationCodes.find(v => v.code === selectedMaterial.violationCode)?.photoMaterials}
                    />
                  </div>

                  <div className="border-t border-slate-700 pt-4 space-y-4">
                    <Button
                      variant="outline"
                      className="w-full border-blue-500 text-blue-400 hover:bg-blue-500/10"
                      onClick={() => setShowMarkup(!showMarkup)}
                    >
                      <Icon name="Pencil" size={16} className="mr-2" />
                      {showMarkup ? 'Скрыть разметку' : 'Разметить нарушение'}
                    </Button>

                    {showMarkup && selectedMaterial.images?.main && (
                      <ViolationMarkup
                        materialId={selectedMaterial.id}
                        imageUrl={selectedMaterial.images.main}
                        violationCodes={violationCodes}
                        existingMarkup={selectedMaterial.markupData}
                        onSave={async (markup) => {
                          setMaterials(prev => prev.map(m => 
                            m.id === selectedMaterial.id 
                              ? { ...m, markupData: markup }
                              : m
                          ));
                          setSelectedMaterial(prev => prev ? { ...prev, markupData: markup } : null);
                          
                          try {
                            const response = await fetch('https://functions.poehali.dev/9128cf27-3d45-4ac1-b0a2-0c2935594a9e', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                material_id: markup.materialId,
                                violation_code: markup.violationCode,
                                regions: markup.regions,
                                notes: markup.notes,
                                is_training_data: markup.isTrainingData,
                                parameters: parameterValues
                              })
                            });
                            if (response.ok) {
                              alert('Разметка сохранена!');
                              setShowMarkup(false);
                            }
                          } catch (error) {
                            console.error('Ошибка сохранения разметки:', error);
                          }
                        }}
                        onCancel={() => setShowMarkup(false)}
                      />
                    )}

                    {selectedMaterial.violationCode && (
                      <Button
                        variant="outline"
                        className="w-full border-purple-500 text-purple-400 hover:bg-purple-500/10"
                        onClick={() => setShowParameters(!showParameters)}
                      >
                        <Icon name="Settings" size={16} className="mr-2" />
                        {showParameters ? 'Скрыть параметры' : 'Параметры нарушения'}
                      </Button>
                    )}

                    {showParameters && selectedMaterial.violationCode && (
                      <ViolationParameters
                        violationCode={selectedMaterial.violationCode}
                        parameters={defaultParametersByCode[selectedMaterial.violationCode] || []}
                        initialValues={parameterValues}
                        onValuesChange={setParameterValues}
                      />
                    )}
                  </div>

                  <div className="border-t border-slate-700 pt-4 space-y-4">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1 border-blue-500 text-blue-400 hover:bg-blue-500/10"
                        onClick={() => setShowMarkup(!showMarkup)}
                      >
                        <Icon name="Pencil" size={16} className="mr-2" />
                        {showMarkup ? 'Скрыть разметку' : 'Разметить нарушение'}
                      </Button>
                      <Button
                        variant="outline"
                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                        onClick={() => setShowInstructions(true)}
                        title="Инструкция для разметчика"
                      >
                        <Icon name="BookOpen" size={16} />
                      </Button>
                    </div>

                    {showMarkup && selectedMaterial.images?.main && (
                      <ViolationMarkup
                        materialId={selectedMaterial.id}
                        imageUrl={selectedMaterial.images.main}
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
                                is_training_data: markup.isTrainingData,
                                parameters: parameterValues
                              })
                            });
                            if (response.ok) {
                              alert('Разметка сохранена!');
                              setShowMarkup(false);
                            }
                          } catch (error) {
                            console.error('Ошибка сохранения разметки:', error);
                          }
                        }}
                        onCancel={() => setShowMarkup(false)}
                      />
                    )}

                    {selectedMaterial.violationCode && (
                      <Button
                        variant="outline"
                        className="w-full border-purple-500 text-purple-400 hover:bg-purple-500/10"
                        onClick={() => setShowParameters(!showParameters)}
                      >
                        <Icon name="Settings" size={16} className="mr-2" />
                        {showParameters ? 'Скрыть параметры' : 'Параметры нарушения'}
                      </Button>
                    )}

                    {showParameters && selectedMaterial.violationCode && (
                      <ViolationParameters
                        violationCode={selectedMaterial.violationCode}
                        parameters={defaultParametersByCode[selectedMaterial.violationCode] || []}
                        initialValues={parameterValues}
                        onValuesChange={setParameterValues}
                      />
                    )}
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

                  <div className="border-t border-slate-700 pt-4 space-y-3">
                    <Button 
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700"
                      onClick={() => updateMaterialStatus(selectedMaterial.id, 'processed', selectedMaterial.violationCode)}
                    >
                      <Icon name="CheckCheck" size={16} className="mr-2" />
                      Обработать материал
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
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      <ViolationCodesManager
        isOpen={isCodesManagerOpen}
        onClose={() => setIsCodesManagerOpen(false)}
        codes={violationCodes}
        onCodesChange={setViolationCodes}
      />

      <AITrainingPanel
        isOpen={isAITrainingOpen}
        onClose={() => setIsAITrainingOpen(false)}
        violationCodes={violationCodes}
      />

      {showInstructions && (
        <MarkupInstructions onClose={() => setShowInstructions(false)} />
      )}

      {isSettingsOpen && sessionToken && currentUser && (
        <SettingsPanel
          onClose={() => setIsSettingsOpen(false)}
          sessionToken={sessionToken}
          currentUser={currentUser}
        />
      )}

      {isAnalyticsOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6">
          <div className="w-full max-w-6xl h-[90vh] bg-slate-900 rounded-xl border border-slate-700 flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <Icon name="LineChart" size={28} className="text-purple-400" />
                <h2 className="text-2xl font-bold text-white">Аналитика</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAnalyticsOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <Icon name="X" size={20} />
              </Button>
            </div>
            <div className="flex-1 overflow-hidden">
              <Analytics refreshTrigger={aiRefreshTrigger} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}