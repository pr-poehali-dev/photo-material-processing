import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';

export interface ViolationParameter {
  id: string;
  name: string;
  type: 'text' | 'number' | 'select' | 'date' | 'time';
  label: string;
  options?: string[];
  required: boolean;
  unit?: string;
}

export interface ViolationParameterValue {
  parameterId: string;
  value: string | number;
}

interface ViolationParametersProps {
  violationCode: string;
  parameters: ViolationParameter[];
  initialValues?: ViolationParameterValue[];
  onValuesChange: (values: ViolationParameterValue[]) => void;
}

const ViolationParameters = ({
  violationCode,
  parameters,
  initialValues = [],
  onValuesChange
}: ViolationParametersProps) => {
  const [values, setValues] = useState<Map<string, string | number>>(
    new Map(initialValues.map(v => [v.parameterId, v.value]))
  );

  useEffect(() => {
    const valuesArray: ViolationParameterValue[] = Array.from(values.entries()).map(([parameterId, value]) => ({
      parameterId,
      value
    }));
    onValuesChange(valuesArray);
  }, [values, onValuesChange]);

  const handleValueChange = (parameterId: string, value: string | number) => {
    setValues(new Map(values.set(parameterId, value)));
  };

  const getViolationCodeName = (code: string) => {
    const codeMap: Record<string, string> = {
      '12.9.2': 'Превышение скорости',
      '12.12.1': 'Проезд на красный',
      '12.15.4': 'Остановка на пешеходном переходе',
      '12.16.1': 'Несоблюдение требований разметки',
      '12.18': 'Непредоставление преимущества пешеходам'
    };
    return codeMap[code] || 'Неизвестное нарушение';
  };

  const renderParameter = (param: ViolationParameter) => {
    const value = values.get(param.id) || '';

    switch (param.type) {
      case 'text':
        return (
          <Input
            value={value as string}
            onChange={(e) => handleValueChange(param.id, e.target.value)}
            placeholder={param.label}
            className="bg-slate-900 border-slate-700 text-slate-100"
            required={param.required}
          />
        );

      case 'number':
        return (
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={value as number}
              onChange={(e) => handleValueChange(param.id, parseFloat(e.target.value) || 0)}
              placeholder={param.label}
              className="bg-slate-900 border-slate-700 text-slate-100"
              required={param.required}
            />
            {param.unit && (
              <span className="text-slate-400 text-sm whitespace-nowrap">{param.unit}</span>
            )}
          </div>
        );

      case 'select':
        return (
          <Select value={value as string} onValueChange={(v) => handleValueChange(param.id, v)}>
            <SelectTrigger className="bg-slate-900 border-slate-700 text-slate-100">
              <SelectValue placeholder={param.label} />
            </SelectTrigger>
            <SelectContent>
              {param.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'date':
        return (
          <Input
            type="date"
            value={value as string}
            onChange={(e) => handleValueChange(param.id, e.target.value)}
            className="bg-slate-900 border-slate-700 text-slate-100"
            required={param.required}
          />
        );

      case 'time':
        return (
          <Input
            type="time"
            value={value as string}
            onChange={(e) => handleValueChange(param.id, e.target.value)}
            className="bg-slate-900 border-slate-700 text-slate-100"
            required={param.required}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Card className="p-4 bg-slate-800/50 border-slate-700">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Icon name="Settings" size={20} className="text-blue-400" />
          <h3 className="text-lg font-semibold text-slate-100">Параметры нарушения</h3>
        </div>

        <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <div className="flex items-center gap-2">
            <Icon name="AlertTriangle" size={16} className="text-blue-400" />
            <div>
              <div className="text-sm font-medium text-blue-400">Код: {violationCode}</div>
              <div className="text-xs text-slate-400">{getViolationCodeName(violationCode)}</div>
            </div>
          </div>
        </div>

        {parameters.length === 0 ? (
          <div className="text-center text-slate-500 py-6">
            <Icon name="Info" size={24} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">Параметры не определены для данного типа нарушения</p>
          </div>
        ) : (
          <div className="space-y-3">
            {parameters.map((param) => (
              <div key={param.id}>
                <Label className="text-slate-300 mb-1.5 flex items-center gap-1">
                  {param.label}
                  {param.required && <span className="text-red-400">*</span>}
                </Label>
                {renderParameter(param)}
              </div>
            ))}
          </div>
        )}

        <div className="pt-3 border-t border-slate-700">
          <div className="flex items-start gap-2 text-xs text-slate-400">
            <Icon name="Info" size={14} className="mt-0.5 flex-shrink-0" />
            <p>
              Заполните параметры нарушения для точной квалификации.
              Поля, отмеченные <span className="text-red-400">*</span>, обязательны для заполнения.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ViolationParameters;

export const defaultParametersByCode: Record<string, ViolationParameter[]> = {
  '12.9.2': [
    {
      id: 'speed-limit',
      name: 'speedLimit',
      type: 'number',
      label: 'Разрешенная скорость',
      required: true,
      unit: 'км/ч'
    },
    {
      id: 'actual-speed',
      name: 'actualSpeed',
      type: 'number',
      label: 'Фактическая скорость',
      required: true,
      unit: 'км/ч'
    },
    {
      id: 'overspeed',
      name: 'overspeed',
      type: 'number',
      label: 'Превышение',
      required: true,
      unit: 'км/ч'
    }
  ],
  '12.12.1': [
    {
      id: 'signal-color',
      name: 'signalColor',
      type: 'select',
      label: 'Цвет сигнала',
      options: ['Красный', 'Желтый', 'Красный с желтым'],
      required: true
    },
    {
      id: 'signal-duration',
      name: 'signalDuration',
      type: 'number',
      label: 'Время горения сигнала',
      required: false,
      unit: 'сек'
    }
  ],
  '12.15.4': [
    {
      id: 'stop-distance',
      name: 'stopDistance',
      type: 'number',
      label: 'Расстояние до перехода',
      required: true,
      unit: 'м'
    }
  ],
  '12.16.1': [
    {
      id: 'marking-type',
      name: 'markingType',
      type: 'select',
      label: 'Тип разметки',
      options: ['Сплошная линия', 'Двойная сплошная', 'Стоп-линия', 'Пешеходный переход', 'Другое'],
      required: true
    }
  ],
  '12.18': [
    {
      id: 'pedestrian-position',
      name: 'pedestrianPosition',
      type: 'select',
      label: 'Положение пешехода',
      options: ['На переходе', 'Вступает на переход', 'Завершает переход'],
      required: true
    },
    {
      id: 'vehicle-distance',
      name: 'vehicleDistance',
      type: 'number',
      label: 'Расстояние до пешехода',
      required: false,
      unit: 'м'
    }
  ]
};
