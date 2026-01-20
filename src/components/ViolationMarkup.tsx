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
  type: 'vehicle' | 'plate' | 'signal' | 'sign' | 'seatbelt' | 'headlight' | 'other';
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
      const autoLabel = getRegionTypeLabel(drawingRegion.type) + ' ' + (regions.filter(r => r.type === drawingRegion.type).length + 1);
      const regionWithLabel = { ...drawingRegion, label: autoLabel };
      setRegions([...regions, regionWithLabel]);
      setSelectedRegion(regionWithLabel.id);
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
      case 'seatbelt': return 'rgb(236, 72, 153)';
      case 'headlight': return 'rgb(253, 224, 71)';
      default: return 'rgb(168, 85, 247)';
    }
  };

  const getRegionTypeLabel = (type: MarkupRegion['type']) => {
    switch (type) {
      case 'vehicle': return 'ТС';
      case 'plate': return 'Номер';
      case 'signal': return 'Светофор';
      case 'sign': return 'Знак';
      case 'seatbelt': return 'Ремень';
      case 'headlight': return 'Фары';
      default: return 'Другое';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-gradient-to-r from-slate-800 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Icon name="Pencil" size={20} className="text-purple-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Разметка нарушения</h3>
              <p className="text-sm text-slate-400">Выделите объекты и укажите параметры</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancel} className="border-slate-600 text-slate-300 hover:bg-slate-800">
              <Icon name="X" size={16} className="mr-2" />
              Отмена
            </Button>
            <Button onClick={handleSave} className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700">
              <Icon name="Save" size={16} className="mr-2" />
              Сохранить
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="p-6 bg-slate-800/50 border-slate-700">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-slate-100 text-base font-semibold">Инструменты разметки</Label>
                    <Badge variant="outline" className="bg-slate-700/50">
                      Регионов: {regions.length}
                    </Badge>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2">
                    <Label className="text-slate-300 text-sm">Тип объекта:</Label>
                    {(['vehicle', 'plate', 'signal', 'sign', 'seatbelt', 'headlight', 'other'] as const).map((type) => (
                      <Button
                        key={type}
                        variant={regionType === type ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setRegionType(type)}
                        className={regionType === type ? 'bg-gradient-to-r from-purple-500 to-pink-600 border-0' : 'border-slate-600'}
                      >
                        <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: getRegionColor(type) }} />
                        {getRegionTypeLabel(type)}
                      </Button>
                    ))}
                  </div>

                  <div
                    className="relative w-full aspect-video bg-slate-950 rounded-lg overflow-hidden cursor-crosshair border-2 border-slate-700 hover:border-purple-500/50 transition-colors"
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
                        className={`absolute border-2 transition-all ${selectedRegion === region.id ? 'border-white shadow-lg ring-2 ring-white/50' : 'hover:border-white/70'}`}
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
                          className="absolute -top-6 left-0 px-2 py-1 rounded-md text-xs font-semibold text-white shadow-lg"
                          style={{ backgroundColor: getRegionColor(region.type) }}
                        >
                          {getRegionTypeLabel(region.type)}
                          {region.label && `: ${region.label}`}
                        </div>
                      </div>
                    ))}

                    {drawingRegion && (
                      <div
                        className="absolute border-2 border-dashed animate-pulse"
                        style={{
                          left: `${Math.min(drawingRegion.x, drawingRegion.x + drawingRegion.width)}%`,
                          top: `${Math.min(drawingRegion.y, drawingRegion.y + drawingRegion.height)}%`,
                          width: `${Math.abs(drawingRegion.width)}%`,
                          height: `${Math.abs(drawingRegion.height)}%`,
                          borderColor: getRegionColor(regionType),
                          backgroundColor: `${getRegionColor(regionType)}30`
                        }}
                      />
                    )}
                  </div>

                  <div className="flex items-start gap-2 p-3 bg-slate-900/50 rounded-lg border border-slate-700">
                    <Icon name="Info" size={16} className="text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-slate-300">
                      <p className="font-medium mb-1">Как использовать:</p>
                      <ul className="space-y-0.5 text-slate-400">
                        <li>• Выберите тип объекта</li>
                        <li>• Зажмите ЛКМ и выделите область</li>
                        <li>• Кликните на регион для редактирования</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            <div className="space-y-4">
              <Card className="p-6 bg-slate-800/50 border-slate-700">
                <div className="space-y-4">
                  <Label className="text-slate-100 text-base font-semibold">Параметры нарушения</Label>
                  <div>
                    <Label className="text-slate-300 text-sm mb-2 block">Код нарушения</Label>
                    <Select value={violationCode} onValueChange={setViolationCode}>
                      <SelectTrigger className="bg-slate-900 border-slate-600 text-slate-100 h-10">
                        <SelectValue placeholder="Выберите код нарушения" />
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
                    <Label className="text-slate-300 text-sm mb-2 block">Примечания</Label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Дополнительная информация о нарушении..."
                      className="bg-slate-900 border-slate-600 text-slate-100 resize-none"
                      rows={4}
                    />
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg border border-slate-700">
                    <input
                      type="checkbox"
                      id="training-data"
                      checked={isTrainingData}
                      onChange={(e) => setIsTrainingData(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-600 text-purple-500 focus:ring-purple-500"
                    />
                    <Label htmlFor="training-data" className="text-slate-300 cursor-pointer text-sm flex-1">
                      <span className="font-medium">Использовать для обучения ИИ</span>
                      <p className="text-xs text-slate-500 mt-0.5">Разметка будет использована для улучшения модели</p>
                    </Label>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-slate-800/50 border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-base font-semibold text-slate-100">Размеченные области</h4>
                  <Badge variant="outline" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                    {regions.length} {regions.length === 1 ? 'регион' : 'регионов'}
                  </Badge>
                </div>
                
                <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                  {regions.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                      <Icon name="MousePointerClick" size={32} className="mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Нет размеченных областей</p>
                      <p className="text-xs mt-1">Выделите объекты на изображении</p>
                    </div>
                  ) : (
                    regions.map((region) => (
                      <div
                        key={region.id}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          selectedRegion === region.id 
                            ? 'border-purple-500 bg-purple-500/10 shadow-lg' 
                            : 'border-slate-700 bg-slate-900/50 hover:border-slate-600'
                        } cursor-pointer`}
                        onClick={() => setSelectedRegion(region.id)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Badge 
                            variant="outline"
                            className="font-semibold"
                            style={{ 
                              borderColor: getRegionColor(region.type), 
                              color: getRegionColor(region.type),
                              backgroundColor: `${getRegionColor(region.type)}20`
                            }}
                          >
                            <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: getRegionColor(region.type) }} />
                            {getRegionTypeLabel(region.type)}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteRegion(region.id);
                            }}
                            className="h-7 w-7 p-0 hover:bg-red-500/20 hover:text-red-400"
                          >
                            <Icon name="Trash2" size={14} />
                          </Button>
                        </div>
                        <Input
                          value={region.label}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleUpdateRegionLabel(region.id, e.target.value);
                          }}
                          placeholder="Метка области (например: 'А123ВС777')..."
                          className="bg-slate-800 border-slate-600 text-slate-100 text-sm h-9"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViolationMarkup;