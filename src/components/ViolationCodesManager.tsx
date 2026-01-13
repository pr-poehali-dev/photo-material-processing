import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';

export interface ViolationCode {
  code: string;
  description: string;
}

interface ViolationCodesManagerProps {
  isOpen: boolean;
  onClose: () => void;
  codes: ViolationCode[];
  onCodesChange: (codes: ViolationCode[]) => void;
}

export default function ViolationCodesManager({
  isOpen,
  onClose,
  codes,
  onCodesChange,
}: ViolationCodesManagerProps) {
  const [newCode, setNewCode] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const handleAddCode = () => {
    if (!newCode.trim() || !newDescription.trim()) {
      alert('Заполните код и описание нарушения');
      return;
    }

    if (codes.some(c => c.code === newCode)) {
      alert('Такой код уже существует');
      return;
    }

    onCodesChange([...codes, { code: newCode, description: newDescription }]);
    setNewCode('');
    setNewDescription('');
  };

  const handleDeleteCode = (code: string) => {
    onCodesChange(codes.filter(c => c.code !== code));
  };

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
              <div className="space-y-2">
                {codes.map((item) => (
                  <div
                    key={item.code}
                    className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 flex items-center justify-between hover:border-slate-600 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="bg-amber-500/20 text-amber-400 px-3 py-1 rounded-md font-mono text-sm font-semibold">
                        {item.code}
                      </div>
                      <div className="text-slate-300">{item.description}</div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteCode(item.code)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <Icon name="Trash2" size={16} />
                    </Button>
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
