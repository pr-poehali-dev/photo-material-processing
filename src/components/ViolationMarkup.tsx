import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { ViolationCode } from '@/components/ViolationCodesManager';

interface MarkupRegion {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  type: 'vehicle' | 'plate' | 'signal' | 'sign' | 'other';
}

interface ViolationMarkup {
  materialId: string;
  violationCode?: string;
  regions: MarkupRegion[];
  notes: string;
  confidence?: number;
  isTrainingData: boolean;
}

interface ViolationMarkupProps {
  materialId: string;
  imageUrl: string;
  violationCodes: ViolationCode[];
  existingMarkup?: ViolationMarkup;
  onSave: (markup: ViolationMarkup) => void;
  onCancel: () => void;
}

const ViolationMarkup = ({
  materialId,
  imageUrl,
  violationCodes,
  existingMarkup,
  onSave,
  onCancel
}: ViolationMarkupProps) => {
  const [regions, setRegions] = useState<MarkupRegion[]>(existingMarkup?.regions || []);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [drawingRegion, setDrawingRegion] = useState<MarkupRegion | null>(null);
  const [violationCode, setViolationCode] = useState<string>(existingMarkup?.violationCode || '');
  const [notes, setNotes] = useState<string>(existingMarkup?.notes || '');
  const [isTrainingData, setIsTrainingData] = useState<boolean>(existingMarkup?.isTrainingData || false);
  const [regionType, setRegionType] = useState<MarkupRegion['type']>('vehicle');

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setDrawingRegion({
      id: Date.now().toString(),
      x,
      y,
      width: 0,
      height: 0,
      label: '',
      type: regionType
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!drawingRegion) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const currentX = ((e.clientX - rect.left) / rect.width) * 100;
    const currentY = ((e.clientY - rect.top) / rect.height) * 100;

    setDrawingRegion({
      ...drawingRegion,
      width: currentX - drawingRegion.x,
      height: currentY - drawingRegion.y
    });
  };

  const handleMouseUp = () => {
    if (drawingRegion && Math.abs(drawingRegion.width) > 1 && Math.abs(drawingRegion.height) > 1) {
      setRegions([...regions, drawingRegion]);
      setSelectedRegion(drawingRegion.id);
    }
    setDrawingRegion(null);
  };

  const handleDeleteRegion = (id: string) => {
    setRegions(regions.filter(r => r.id !== id));
    if (selectedRegion === id) {
      setSelectedRegion(null);
    }
  };

  const handleUpdateRegionLabel = (id: string, label: string) => {
    setRegions(regions.map(r => r.id === id ? { ...r, label } : r));
  };

  const handleSave = () => {
    const markup: ViolationMarkup = {
      materialId,
      violationCode,
      regions,
      notes,
      isTrainingData
    };
    onSave(markup);
  };

  const getRegionColor = (type: MarkupRegion['type']) => {
    switch (type) {
      case 'vehicle': return 'rgb(239, 68, 68)';
      case 'plate': return 'rgb(59, 130, 246)';
      case 'signal': return 'rgb(34, 197, 94)';
      case 'sign': return 'rgb(251, 146, 60)';
      default: return 'rgb(168, 85, 247)';
    }
  };

  const getRegionTypeLabel = (type: MarkupRegion['type']) => {
    switch (type) {
      case 'vehicle': return 'ТС';
      case 'plate': return 'Номер';
      case 'signal': return 'Светофор';
      case 'sign': return 'Знак';
      default: return 'Другое';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-100">Разметка материала</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onCancel}>
            <Icon name="X" size={16} className="mr-1" />
            Отмена
          </Button>
          <Button size="sm" onClick={handleSave}>
            <Icon name="Save" size={16} className="mr-1" />
            Сохранить
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Card className="p-4 bg-slate-800/50 border-slate-700">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Label className="text-slate-300">Тип разметки:</Label>
                <div className="flex gap-2">
                  {(['vehicle', 'plate', 'signal', 'sign', 'other'] as const).map((type) => (
                    <Button
                      key={type}
                      variant={regionType === type ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setRegionType(type)}
                    >
                      {getRegionTypeLabel(type)}
                    </Button>
                  ))}
                </div>
              </div>

              <div
                className="relative w-full aspect-video bg-slate-900 rounded-lg overflow-hidden cursor-crosshair"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <img
                  src={imageUrl}
                  alt="Материал для разметки"
                  className="w-full h-full object-contain"
                  draggable={false}
                />

                {regions.map((region) => (
                  <div
                    key={region.id}
                    className={`absolute border-2 ${selectedRegion === region.id ? 'border-white' : ''}`}
                    style={{
                      left: `${Math.min(region.x, region.x + region.width)}%`,
                      top: `${Math.min(region.y, region.y + region.height)}%`,
                      width: `${Math.abs(region.width)}%`,
                      height: `${Math.abs(region.height)}%`,
                      borderColor: getRegionColor(region.type),
                      backgroundColor: `${getRegionColor(region.type)}20`
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedRegion(region.id);
                    }}
                  >
                    <div
                      className="absolute -top-6 left-0 px-2 py-0.5 rounded text-xs font-medium text-white"
                      style={{ backgroundColor: getRegionColor(region.type) }}
                    >
                      {getRegionTypeLabel(region.type)}
                      {region.label && `: ${region.label}`}
                    </div>
                  </div>
                ))}

                {drawingRegion && (
                  <div
                    className="absolute border-2 border-dashed"
                    style={{
                      left: `${Math.min(drawingRegion.x, drawingRegion.x + drawingRegion.width)}%`,
                      top: `${Math.min(drawingRegion.y, drawingRegion.y + drawingRegion.height)}%`,
                      width: `${Math.abs(drawingRegion.width)}%`,
                      height: `${Math.abs(drawingRegion.height)}%`,
                      borderColor: getRegionColor(regionType),
                      backgroundColor: `${getRegionColor(regionType)}20`
                    }}
                  />
                )}
              </div>

              <div className="text-xs text-slate-400">
                <Icon name="Info" size={14} className="inline mr-1" />
                Выберите тип разметки и выделите область на изображении
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-4 bg-slate-800/50 border-slate-700">
            <div className="space-y-3">
              <div>
                <Label className="text-slate-300">Код нарушения</Label>
                <Select value={violationCode} onValueChange={setViolationCode}>
                  <SelectTrigger className="bg-slate-900 border-slate-700 text-slate-100">
                    <SelectValue placeholder="Выберите код" />
                  </SelectTrigger>
                  <SelectContent>
                    {violationCodes.map((code) => (
                      <SelectItem key={code.id} value={code.code}>
                        {code.code} - {code.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-slate-300">Примечания</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Дополнительная информация о нарушении..."
                  className="bg-slate-900 border-slate-700 text-slate-100"
                  rows={4}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="training-data"
                  checked={isTrainingData}
                  onChange={(e) => setIsTrainingData(e.target.checked)}
                  className="rounded border-slate-700"
                />
                <Label htmlFor="training-data" className="text-slate-300 cursor-pointer">
                  Использовать для обучения ИИ
                </Label>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-slate-800/50 border-slate-700">
            <h4 className="text-sm font-medium text-slate-300 mb-3">Размеченные области ({regions.length})</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {regions.map((region) => (
                <div
                  key={region.id}
                  className={`p-2 rounded border ${
                    selectedRegion === region.id 
                      ? 'border-blue-500 bg-blue-500/10' 
                      : 'border-slate-700 bg-slate-900'
                  } cursor-pointer`}
                  onClick={() => setSelectedRegion(region.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge 
                      variant="outline" 
                      style={{ borderColor: getRegionColor(region.type), color: getRegionColor(region.type) }}
                    >
                      {getRegionTypeLabel(region.type)}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteRegion(region.id);
                      }}
                    >
                      <Icon name="Trash2" size={14} className="text-red-400" />
                    </Button>
                  </div>
                  <Input
                    value={region.label}
                    onChange={(e) => handleUpdateRegionLabel(region.id, e.target.value)}
                    placeholder="Описание области..."
                    className="bg-slate-800 border-slate-700 text-slate-100 text-xs"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              ))}

              {regions.length === 0 && (
                <div className="text-center text-slate-500 text-sm py-4">
                  Нет размеченных областей
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ViolationMarkup;
