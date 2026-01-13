import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import SortableMaterial from './SortableMaterial';

export interface PhotoMaterial {
  id: string;
  pattern: string;
  title: string;
  icon: string;
  color: string;
  type: 'photo' | 'video';
}

export interface ViolationCode {
  code: string;
  description: string;
  photoMaterials: PhotoMaterial[];
}

interface ViolationCodesManagerProps {
  isOpen: boolean;
  onClose: () => void;
  codes: ViolationCode[];
  onCodesChange: (codes: ViolationCode[]) => void;
}

const DEFAULT_PHOTO_MATERIALS: PhotoMaterial[] = [
  {
    id: 'collage',
    pattern: '*_0.jpg',
    title: 'Общий коллаж',
    icon: 'LayoutGrid',
    color: 'from-blue-500 to-cyan-600',
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
    id: 'plate',
    pattern: '*_grz.jpg',
    title: 'Увеличенное фото ГРЗ',
    icon: 'RectangleHorizontal',
    color: 'from-purple-500 to-pink-600',
    type: 'photo',
  },
];

export default function ViolationCodesManager({
  isOpen,
  onClose,
  codes,
  onCodesChange,
}: ViolationCodesManagerProps) {
  const [newCode, setNewCode] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [showAddMaterial, setShowAddMaterial] = useState<string | null>(null);
  const [newMaterial, setNewMaterial] = useState<Partial<PhotoMaterial>>({
    pattern: '',
    title: '',
    icon: 'Image',
    color: 'from-blue-500 to-cyan-600',
    type: 'photo',
  });

  const handleAddCode = () => {
    if (!newCode.trim() || !newDescription.trim()) {
      alert('Заполните код и описание нарушения');
      return;
    }

    if (codes.some(c => c.code === newCode)) {
      alert('Такой код уже существует');
      return;
    }

    onCodesChange([...codes, { 
      code: newCode, 
      description: newDescription,
      photoMaterials: [...DEFAULT_PHOTO_MATERIALS]
    }]);
    setNewCode('');
    setNewDescription('');
  };

  const handleDeleteCode = (code: string) => {
    onCodesChange(codes.filter(c => c.code !== code));
  };

  const handleAddMaterial = (codeValue: string) => {
    if (!newMaterial.pattern || !newMaterial.title) {
      alert('Заполните шаблон и название материала');
      return;
    }

    const updatedCodes = codes.map(c => {
      if (c.code === codeValue) {
        return {
          ...c,
          photoMaterials: [
            ...c.photoMaterials,
            {
              id: `material_${Date.now()}`,
              pattern: newMaterial.pattern!,
              title: newMaterial.title!,
              icon: newMaterial.icon || 'Image',
              color: newMaterial.color || 'from-blue-500 to-cyan-600',
              type: newMaterial.type || 'photo',
            },
          ],
        };
      }
      return c;
    });

    onCodesChange(updatedCodes);
    setNewMaterial({
      pattern: '',
      title: '',
      icon: 'Image',
      color: 'from-blue-500 to-cyan-600',
      type: 'photo',
    });
    setShowAddMaterial(null);
  };

  const handleDeleteMaterial = (codeValue: string, materialId: string) => {
    const updatedCodes = codes.map(c => {
      if (c.code === codeValue) {
        return {
          ...c,
          photoMaterials: c.photoMaterials.filter(m => m.id !== materialId),
        };
      }
      return c;
    });
    onCodesChange(updatedCodes);
  };

  const handleDragEnd = (event: DragEndEvent, codeValue: string) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const updatedCodes = codes.map(c => {
      if (c.code === codeValue) {
        const oldIndex = c.photoMaterials.findIndex(m => m.id === active.id);
        const newIndex = c.photoMaterials.findIndex(m => m.id === over.id);
        return {
          ...c,
          photoMaterials: arrayMove(c.photoMaterials, oldIndex, newIndex),
        };
      }
      return c;
    });

    onCodesChange(updatedCodes);
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-900 rounded-xl border border-slate-700 w-full max-w-3xl max-h-[80vh] flex flex-col shadow-2xl">
        <div className="p-6 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg">
              <Icon name="FileText" className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Управление кодами нарушений</h2>
              <p className="text-sm text-slate-400">Добавление и редактирование кодов КОАП</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <Icon name="X" size={20} />
          </Button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <h3 className="text-sm font-semibold text-white mb-4">Добавить новый код</h3>
            <div className="grid grid-cols-[120px_1fr_auto] gap-3">
              <Input
                placeholder="Код (34)"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                className="bg-slate-900 border-slate-700 text-white"
              />
              <Input
                placeholder="Описание нарушения (КОАП 12.6 - Ремни безопасности)"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="bg-slate-900 border-slate-700 text-white"
              />
              <Button
                onClick={handleAddCode}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700"
              >
                <Icon name="Plus" size={16} className="mr-2" />
                Добавить
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white">Настроенные коды ({codes.length})</h3>
            {codes.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Icon name="FileX" size={48} className="mx-auto mb-3 opacity-50" />
                <p>Нет добавленных кодов нарушений</p>
              </div>
            ) : (
              <div className="space-y-3">
                {codes.map((item) => (
                  <div
                    key={item.code}
                    className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden"
                  >
                    <div className="p-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="bg-amber-500/20 text-amber-400 px-3 py-1 rounded-md font-mono text-sm font-semibold">
                          {item.code}
                        </div>
                        <div className="text-slate-300">{item.description}</div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingCode(editingCode === item.code ? null : item.code)}
                          className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                        >
                          <Icon name={editingCode === item.code ? "ChevronUp" : "Settings"} size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCode(item.code)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <Icon name="Trash2" size={16} />
                        </Button>
                      </div>
                    </div>

                    {editingCode === item.code && (
                      <div className="p-4 border-t border-slate-700 bg-slate-900/50 space-y-3">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                            <Icon name="Images" size={16} className="text-blue-400" />
                            Фотоматериалы ({item.photoMaterials.length})
                          </h4>
                          <Button
                            size="sm"
                            onClick={() => setShowAddMaterial(item.code)}
                            className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30"
                          >
                            <Icon name="Plus" size={14} className="mr-1" />
                            Добавить материал
                          </Button>
                        </div>

                        {showAddMaterial === item.code && (
                          <div className="bg-slate-800 rounded-lg p-3 border border-slate-600 space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                              <Input
                                placeholder="Шаблон файла (*_0.jpg)"
                                value={newMaterial.pattern}
                                onChange={(e) => setNewMaterial({ ...newMaterial, pattern: e.target.value })}
                                className="bg-slate-900 border-slate-700 text-white text-sm"
                              />
                              <Input
                                placeholder="Название материала"
                                value={newMaterial.title}
                                onChange={(e) => setNewMaterial({ ...newMaterial, title: e.target.value })}
                                className="bg-slate-900 border-slate-700 text-white text-sm"
                              />
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <select
                                value={newMaterial.type}
                                onChange={(e) => setNewMaterial({ ...newMaterial, type: e.target.value as 'photo' | 'video' })}
                                className="bg-slate-900 border border-slate-700 text-white rounded-md px-3 py-2 text-sm"
                              >
                                <option value="photo">Фото</option>
                                <option value="video">Видео</option>
                              </select>
                              <Input
                                placeholder="Иконка (Camera)"
                                value={newMaterial.icon}
                                onChange={(e) => setNewMaterial({ ...newMaterial, icon: e.target.value })}
                                className="bg-slate-900 border-slate-700 text-white text-sm"
                              />
                              <select
                                value={newMaterial.color}
                                onChange={(e) => setNewMaterial({ ...newMaterial, color: e.target.value })}
                                className="bg-slate-900 border border-slate-700 text-white rounded-md px-3 py-2 text-sm"
                              >
                                <option value="from-blue-500 to-cyan-600">Синий</option>
                                <option value="from-green-500 to-emerald-600">Зелёный</option>
                                <option value="from-purple-500 to-pink-600">Фиолетовый</option>
                                <option value="from-orange-500 to-red-600">Оранжевый</option>
                                <option value="from-amber-500 to-orange-600">Янтарный</option>
                                <option value="from-red-500 to-rose-600">Красный</option>
                              </select>
                            </div>
                            <div className="flex gap-2 justify-end">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setShowAddMaterial(null);
                                  setNewMaterial({
                                    pattern: '',
                                    title: '',
                                    icon: 'Image',
                                    color: 'from-blue-500 to-cyan-600',
                                    type: 'photo',
                                  });
                                }}
                                className="text-slate-400 hover:text-white"
                              >
                                Отмена
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleAddMaterial(item.code)}
                                className="bg-green-500 text-white hover:bg-green-600"
                              >
                                Сохранить
                              </Button>
                            </div>
                          </div>
                        )}

                        <DndContext
                          sensors={sensors}
                          collisionDetection={closestCenter}
                          onDragEnd={(event) => handleDragEnd(event, item.code)}
                        >
                          <SortableContext
                            items={item.photoMaterials.map(m => m.id)}
                            strategy={verticalListSortingStrategy}
                          >
                            <div className="space-y-2">
                              {item.photoMaterials.map((material) => (
                                <SortableMaterial
                                  key={material.id}
                                  material={material}
                                  onDelete={(id) => handleDeleteMaterial(item.code, id)}
                                />
                              ))}
                            </div>
                          </SortableContext>
                        </DndContext>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-slate-700 flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            Закрыть
          </Button>
        </div>
      </div>
    </div>
  );
}