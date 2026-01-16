import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface MarkupInstructionsProps {
  onClose: () => void;
}

const MarkupInstructions = ({ onClose }: MarkupInstructionsProps) => {
  const handleDownload = () => {
    const content = `
ИНСТРУКЦИЯ ДЛЯ РАЗМЕТЧИКА
Правила разметки нарушений ПДД

═══════════════════════════════════════════════════════════════════════════════

ОБЩИЕ ПРАВИЛА РАЗМЕТКИ

✓ Выделяйте объекты как можно точнее, минимизируя фон
✓ Используйте соответствующий тип объекта для каждой области
✓ Добавляйте подписи к областям для уточнения деталей
✓ Указывайте код нарушения согласно КоАП РФ

═══════════════════════════════════════════════════════════════════════════════

РАЗМЕТКА РЕМНЕЙ БЕЗОПАСНОСТИ 🔒

Что размечать:
• Область водителя/пассажира где должен быть виден ремень безопасности
• Плечевую лямку ремня (диагональная полоса через грудь)
• Если ремень не виден — выделите область груди водителя/пассажира

Признаки нарушения:
✗ Ремень безопасности не виден на водителе
✗ Ремень не виден на пассажире переднего сидения
✗ Ремень заведён под руку или за спину
✗ Ремень виден, но не пристёгнут (висит свободно)

Рекомендации:
→ Выделяйте область от плеча до пояса водителя
→ Если видны несколько человек — размечайте каждого отдельно
→ В комментариях указывайте: "пристёгнут" или "не пристёгнут"
→ При плохом качестве фото — отмечайте "не определить"

Код нарушения КоАП РФ:
12.6 — Управление ТС без ремня безопасности

═══════════════════════════════════════════════════════════════════════════════

РАЗМЕТКА ФАР 💡

Что размечать:
• Передние фары автомобиля (левую и правую отдельно)
• Задние габаритные огни (если проверяется их работа)
• Дневные ходовые огни (ДХО)

Признаки нарушения:
✗ Одна или обе фары не горят в тёмное время суток
✗ ДХО не включены днём при движении
✗ Разный цвет свечения фар (одна белая, другая жёлтая)
✗ Треснутое или разбитое стекло фары
✗ Фара полностью отсутствует
✗ Дальний свет включён в населённом пункте при встречном движении

Рекомендации:
→ Выделяйте каждую фару отдельной областью
→ Оценивайте условия съёмки: день/ночь, туннель, сумерки
→ В комментариях указывайте: "не горит левая", "обе выключены" и т.д.
→ При съёмке днём ДХО должны быть включены
→ Если фары явно повреждены — отметьте "повреждение фары"

Коды нарушений КоАП РФ:
12.20 — Нарушение правил пользования внешними световыми приборами
12.5.1 — Управление ТС с неисправными световыми приборами

═══════════════════════════════════════════════════════════════════════════════

ТИПЫ ОБЪЕКТОВ ДЛЯ РАЗМЕТКИ

ТС (красный)           — Транспортное средство
Номер (синий)          — Государственный номер
Светофор (зелёный)     — Сигналы светофора
Знак (оранжевый)       — Дорожный знак
Ремень (розовый)       — Ремень безопасности
Фары (жёлтый)          — Световые приборы
Другое (фиолетовый)    — Прочие объекты

═══════════════════════════════════════════════════════════════════════════════

КАК ПРАВИЛЬНО ОБВОДИТЬ ОБЪЕКТЫ

Ключевое правило: область должна плотно охватывать объект, минимизируя фон
и не отрезая важные части.

Разметка ремня безопасности:
✓ Область охватывает зону от плеча до пояса водителя
✓ Включает область, где должен быть виден ремень
✓ Не захватывает лишние части салона

Разметка фар:
✓ Каждая фара выделена отдельной областью
✓ Область плотно охватывает блок фары
✓ Минимум фона вокруг фары

Разметка нескольких объектов:
✓ Используйте разные типы объектов (ТС, Номер, Фары)
✓ Области не перекрываются и не дублируются
✓ Каждый объект имеет подпись для уточнения

═══════════════════════════════════════════════════════════════════════════════

ЧАСТЫЕ ОШИБКИ ПРИ РАЗМЕТКЕ

ОШИБКА №1: Слишком большая область с лишним фоном
Проблема: Область захватывает много фона вокруг объекта
Решение: Обводите максимально плотно, оставляя минимум фона

ОШИБКА №2: Область обрезает важные части объекта
Проблема: Область слишком мала и обрезает части объекта
Решение: Убедитесь что весь объект полностью входит в область

Другие распространённые ошибки:
✗ Неправильный тип объекта (фары отмечены как "Светофор")
✗ Дублирование областей (один объект выделен несколько раз)
✗ Отсутствие подписей (область без пояснений)
✗ Пропуск важных объектов (на фото 2 фары, размечена только одна)
✗ Неточные границы (область косая, хотя объект ровный)
✗ Разметка нечёткого фото (пометьте "не определить" если объект не виден)

═══════════════════════════════════════════════════════════════════════════════

КРИТЕРИИ КАЧЕСТВЕННОЙ РАЗМЕТКИ

✓ Границы областей точно обводят объект без лишнего фона
✓ Каждый важный объект выделен отдельной областью
✓ Указан корректный тип объекта и добавлены подписи
✓ Код нарушения соответствует ситуации на изображении
✓ В комментариях есть пояснения о деталях нарушения

═══════════════════════════════════════════════════════════════════════════════

© TrafficVision - Система автоматизированной обработки нарушений ПДД
`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Инструкция_разметчика.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-gradient-to-r from-slate-800 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Icon name="BookOpen" size={20} className="text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Инструкция для разметчика</h3>
              <p className="text-sm text-slate-400">Правила разметки нарушений</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleDownload}
              className="border-green-600 text-green-400 hover:bg-green-500/10"
            >
              <Icon name="Download" size={16} className="mr-2" />
              Скачать
            </Button>
            <Button variant="outline" onClick={onClose} className="border-slate-600 text-slate-300 hover:bg-slate-800">
              <Icon name="X" size={16} />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Общие правила */}
          <Card className="p-6 bg-slate-800/50 border-slate-700">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Icon name="Info" size={20} className="text-purple-400" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">Общие правила разметки</h4>
                <ul className="space-y-2 text-slate-300">
                  <li className="flex items-start gap-2">
                    <Icon name="CheckCircle2" size={16} className="text-green-400 mt-1 flex-shrink-0" />
                    <span>Выделяйте объекты как можно точнее, минимизируя фон</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="CheckCircle2" size={16} className="text-green-400 mt-1 flex-shrink-0" />
                    <span>Используйте соответствующий тип объекта для каждой области</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="CheckCircle2" size={16} className="text-green-400 mt-1 flex-shrink-0" />
                    <span>Добавляйте подписи к областям для уточнения деталей</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="CheckCircle2" size={16} className="text-green-400 mt-1 flex-shrink-0" />
                    <span>Указывайте код нарушения согласно КоАП РФ</span>
                  </li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Ремни безопасности */}
          <Card className="p-6 bg-slate-800/50 border-slate-700">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-pink-500/20 rounded-lg">
                <span className="text-2xl">🔒</span>
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  Разметка ремней безопасности
                  <span className="px-2 py-0.5 bg-pink-500/20 text-pink-400 text-xs rounded-full">Ремень</span>
                </h4>
                
                <div className="space-y-4">
                  <div>
                    <h5 className="text-white font-medium mb-2">Что размечать:</h5>
                    <ul className="space-y-2 text-slate-300 ml-4">
                      <li className="flex items-start gap-2">
                        <span className="text-pink-400">•</span>
                        <span>Область водителя/пассажира где должен быть виден ремень безопасности</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-pink-400">•</span>
                        <span>Плечевую лямку ремня (диагональная полоса через грудь)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-pink-400">•</span>
                        <span>Если ремень не виден — выделите область груди водителя/пассажира</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                    <h5 className="text-white font-medium mb-2 flex items-center gap-2">
                      <Icon name="AlertTriangle" size={16} className="text-yellow-400" />
                      Признаки нарушения:
                    </h5>
                    <ul className="space-y-1.5 text-slate-300 ml-4 text-sm">
                      <li>✗ Ремень безопасности не виден на водителе</li>
                      <li>✗ Ремень не виден на пассажире переднего сидения</li>
                      <li>✗ Ремень заведён под руку или за спину</li>
                      <li>✗ Ремень виден, но не пристёгнут (висит свободно)</li>
                    </ul>
                  </div>

                  <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
                    <h5 className="text-white font-medium mb-2 flex items-center gap-2">
                      <Icon name="Lightbulb" size={16} className="text-blue-400" />
                      Рекомендации:
                    </h5>
                    <ul className="space-y-1.5 text-slate-300 ml-4 text-sm">
                      <li>→ Выделяйте область от плеча до пояса водителя</li>
                      <li>→ Если видны несколько человек — размечайте каждого отдельно</li>
                      <li>→ В комментариях указывайте: "пристёгнут" или "не пристёгнут"</li>
                      <li>→ При плохом качестве фото — отмечайте "не определить"</li>
                    </ul>
                  </div>

                  <div className="bg-slate-950 border border-slate-700 rounded-lg p-3">
                    <p className="text-xs text-slate-400 mb-1">Код нарушения КоАП РФ:</p>
                    <p className="text-white font-mono">12.6 — Управление ТС без ремня безопасности</p>
                  </div>

                  <div className="mt-4 space-y-3">
                    <h5 className="text-white font-medium flex items-center gap-2">
                      <Icon name="Image" size={16} className="text-pink-400" />
                      Примеры разметки:
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="border border-green-700/50 rounded-lg overflow-hidden bg-slate-900/50">
                        <img 
                          src="https://cdn.poehali.dev/projects/493f019c-4ec3-40c7-8ed7-f73fd0f42aa1/files/074bb021-2d92-4398-899e-bcb0ba8f3774.jpg" 
                          alt="Пример с ремнём"
                          className="w-full h-32 object-cover"
                        />
                        <div className="p-2 bg-green-900/20">
                          <p className="text-xs text-green-400 font-medium flex items-center gap-1">
                            <Icon name="Check" size={12} />
                            Ремень пристёгнут — нарушения нет
                          </p>
                        </div>
                      </div>
                      <div className="border border-red-700/50 rounded-lg overflow-hidden bg-slate-900/50">
                        <img 
                          src="https://cdn.poehali.dev/projects/493f019c-4ec3-40c7-8ed7-f73fd0f42aa1/files/798fa88d-0d59-43d9-9134-e5ba4d57295c.jpg" 
                          alt="Пример без ремня"
                          className="w-full h-32 object-cover"
                        />
                        <div className="p-2 bg-red-900/20">
                          <p className="text-xs text-red-400 font-medium flex items-center gap-1">
                            <Icon name="X" size={12} />
                            Ремень не виден — нарушение
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Фары */}
          <Card className="p-6 bg-slate-800/50 border-slate-700">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <span className="text-2xl">💡</span>
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  Разметка фар
                  <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">Фары</span>
                </h4>
                
                <div className="space-y-4">
                  <div>
                    <h5 className="text-white font-medium mb-2">Что размечать:</h5>
                    <ul className="space-y-2 text-slate-300 ml-4">
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-400">•</span>
                        <span>Передние фары автомобиля (левую и правую отдельно)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-400">•</span>
                        <span>Задние габаритные огни (если проверяется их работа)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-400">•</span>
                        <span>Дневные ходовые огни (ДХО)</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                    <h5 className="text-white font-medium mb-2 flex items-center gap-2">
                      <Icon name="AlertTriangle" size={16} className="text-yellow-400" />
                      Признаки нарушения:
                    </h5>
                    <ul className="space-y-1.5 text-slate-300 ml-4 text-sm">
                      <li>✗ Одна или обе фары не горят в тёмное время суток</li>
                      <li>✗ ДХО не включены днём при движении</li>
                      <li>✗ Разный цвет свечения фар (одна белая, другая жёлтая)</li>
                      <li>✗ Треснутое или разбитое стекло фары</li>
                      <li>✗ Фара полностью отсутствует</li>
                      <li>✗ Дальний свет включён в населённом пункте при встречном движении</li>
                    </ul>
                  </div>

                  <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
                    <h5 className="text-white font-medium mb-2 flex items-center gap-2">
                      <Icon name="Lightbulb" size={16} className="text-blue-400" />
                      Рекомендации:
                    </h5>
                    <ul className="space-y-1.5 text-slate-300 ml-4 text-sm">
                      <li>→ Выделяйте каждую фару отдельной областью</li>
                      <li>→ Оценивайте условия съёмки: день/ночь, туннель, сумерки</li>
                      <li>→ В комментариях указывайте: "не горит левая", "обе выключены" и т.д.</li>
                      <li>→ При съёмке днём ДХО должны быть включены</li>
                      <li>→ Если фары явно повреждены — отметьте "повреждение фары"</li>
                    </ul>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-slate-950 border border-slate-700 rounded-lg p-3">
                      <p className="text-xs text-slate-400 mb-1">Невключенные фары:</p>
                      <p className="text-white font-mono text-sm">12.20 — Нарушение правил пользования внешними световыми приборами</p>
                    </div>
                    <div className="bg-slate-950 border border-slate-700 rounded-lg p-3">
                      <p className="text-xs text-slate-400 mb-1">Неисправные фары:</p>
                      <p className="text-white font-mono text-sm">12.5.1 — Управление ТС с неисправными световыми приборами</p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    <h5 className="text-white font-medium flex items-center gap-2">
                      <Icon name="Image" size={16} className="text-yellow-400" />
                      Примеры разметки:
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="border border-green-700/50 rounded-lg overflow-hidden bg-slate-900/50">
                        <img 
                          src="https://cdn.poehali.dev/projects/493f019c-4ec3-40c7-8ed7-f73fd0f42aa1/files/bf8c4a01-83bc-4404-a840-a5f3bf695e93.jpg" 
                          alt="Обе фары включены"
                          className="w-full h-32 object-cover"
                        />
                        <div className="p-2 bg-green-900/20">
                          <p className="text-xs text-green-400 font-medium flex items-center gap-1">
                            <Icon name="Check" size={12} />
                            Обе фары работают — нарушения нет
                          </p>
                        </div>
                      </div>
                      <div className="border border-red-700/50 rounded-lg overflow-hidden bg-slate-900/50">
                        <img 
                          src="https://cdn.poehali.dev/projects/493f019c-4ec3-40c7-8ed7-f73fd0f42aa1/files/a150e48d-0a2a-4539-ad9c-36c8db8c0e60.jpg" 
                          alt="Одна фара не работает"
                          className="w-full h-32 object-cover"
                        />
                        <div className="p-2 bg-red-900/20">
                          <p className="text-xs text-red-400 font-medium flex items-center gap-1">
                            <Icon name="X" size={12} />
                            Одна фара не горит — нарушение
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Типы объектов */}
          <Card className="p-6 bg-slate-800/50 border-slate-700">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-cyan-500/20 rounded-lg">
                <Icon name="Layers" size={20} className="text-cyan-400" />
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-white mb-3">Все типы объектов для разметки</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center gap-3 p-3 bg-slate-900/50 border border-slate-700 rounded-lg">
                    <span className="w-4 h-4 rounded-full" style={{ backgroundColor: 'rgb(239, 68, 68)' }}></span>
                    <span className="text-white font-medium">ТС</span>
                    <span className="text-slate-400 text-sm ml-auto">Транспортное средство</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-900/50 border border-slate-700 rounded-lg">
                    <span className="w-4 h-4 rounded-full" style={{ backgroundColor: 'rgb(59, 130, 246)' }}></span>
                    <span className="text-white font-medium">Номер</span>
                    <span className="text-slate-400 text-sm ml-auto">Гос. номер</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-900/50 border border-slate-700 rounded-lg">
                    <span className="w-4 h-4 rounded-full" style={{ backgroundColor: 'rgb(34, 197, 94)' }}></span>
                    <span className="text-white font-medium">Светофор</span>
                    <span className="text-slate-400 text-sm ml-auto">Сигналы светофора</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-900/50 border border-slate-700 rounded-lg">
                    <span className="w-4 h-4 rounded-full" style={{ backgroundColor: 'rgb(251, 146, 60)' }}></span>
                    <span className="text-white font-medium">Знак</span>
                    <span className="text-slate-400 text-sm ml-auto">Дорожный знак</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-900/50 border border-slate-700 rounded-lg">
                    <span className="w-4 h-4 rounded-full" style={{ backgroundColor: 'rgb(236, 72, 153)' }}></span>
                    <span className="text-white font-medium">Ремень</span>
                    <span className="text-slate-400 text-sm ml-auto">Ремень безопасности</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-900/50 border border-slate-700 rounded-lg">
                    <span className="w-4 h-4 rounded-full" style={{ backgroundColor: 'rgb(253, 224, 71)' }}></span>
                    <span className="text-white font-medium">Фары</span>
                    <span className="text-slate-400 text-sm ml-auto">Световые приборы</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-900/50 border border-slate-700 rounded-lg">
                    <span className="w-4 h-4 rounded-full" style={{ backgroundColor: 'rgb(168, 85, 247)' }}></span>
                    <span className="text-white font-medium">Другое</span>
                    <span className="text-slate-400 text-sm ml-auto">Прочие объекты</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Примеры правильной разметки областей */}
          <Card className="p-6 bg-slate-800/50 border-slate-700">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-cyan-500/20 rounded-lg">
                <Icon name="Square" size={20} className="text-cyan-400" />
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-white mb-3">Как правильно обводить объекты</h4>
                <p className="text-slate-300 text-sm mb-4">
                  Ключевое правило: область должна плотно охватывать объект, минимизируя фон и не отрезая важные части
                </p>

                <div className="space-y-4">
                  {/* Пример 1: Ремень безопасности */}
                  <div className="border border-pink-700/50 rounded-lg overflow-hidden bg-slate-900/30">
                    <div className="p-3 bg-pink-900/20 border-b border-pink-700/30">
                      <p className="text-white font-medium text-sm flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-pink-500"></span>
                        Пример разметки ремня безопасности
                      </p>
                    </div>
                    <img 
                      src="https://cdn.poehali.dev/projects/493f019c-4ec3-40c7-8ed7-f73fd0f42aa1/files/edb2b437-ffba-454c-8fd9-a0f10bb7e1e9.jpg" 
                      alt="Разметка ремня"
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-3 space-y-2">
                      <div className="flex items-start gap-2 text-sm">
                        <Icon name="Check" size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-300">Область охватывает зону от плеча до пояса водителя</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <Icon name="Check" size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-300">Включает область, где должен быть виден ремень</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <Icon name="Check" size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-300">Не захватывает лишние части салона</span>
                      </div>
                    </div>
                  </div>

                  {/* Пример 2: Фары */}
                  <div className="border border-yellow-700/50 rounded-lg overflow-hidden bg-slate-900/30">
                    <div className="p-3 bg-yellow-900/20 border-b border-yellow-700/30">
                      <p className="text-white font-medium text-sm flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                        Пример разметки фар
                      </p>
                    </div>
                    <img 
                      src="https://cdn.poehali.dev/projects/493f019c-4ec3-40c7-8ed7-f73fd0f42aa1/files/493f87c1-8e1c-4960-acd6-19b89ef9ba03.jpg" 
                      alt="Разметка фар"
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-3 space-y-2">
                      <div className="flex items-start gap-2 text-sm">
                        <Icon name="Check" size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-300">Каждая фара выделена отдельной областью</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <Icon name="Check" size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-300">Область плотно охватывает блок фары</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <Icon name="Check" size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-300">Минимум фона вокруг фары</span>
                      </div>
                    </div>
                  </div>

                  {/* Пример 3: Несколько объектов */}
                  <div className="border border-purple-700/50 rounded-lg overflow-hidden bg-slate-900/30">
                    <div className="p-3 bg-purple-900/20 border-b border-purple-700/30">
                      <p className="text-white font-medium text-sm flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                        Разметка нескольких объектов
                      </p>
                    </div>
                    <img 
                      src="https://cdn.poehali.dev/projects/493f019c-4ec3-40c7-8ed7-f73fd0f42aa1/files/e5137b47-11fb-4fcb-a485-0120f5af7770.jpg" 
                      alt="Разметка нескольких объектов"
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-3 space-y-2">
                      <div className="flex items-start gap-2 text-sm">
                        <Icon name="Check" size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-300">Используйте разные типы объектов (ТС, Номер, Фары)</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <Icon name="Check" size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-300">Области не перекрываются и не дублируются</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <Icon name="Check" size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-300">Каждый объект имеет подпись для уточнения</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Частые ошибки при разметке */}
          <Card className="p-6 bg-gradient-to-br from-red-900/20 to-orange-900/20 border-red-700">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <Icon name="AlertTriangle" size={20} className="text-red-400" />
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-white mb-3">Частые ошибки при разметке</h4>
                <p className="text-slate-300 text-sm mb-4">
                  Избегайте этих распространённых ошибок для повышения качества обучающих данных
                </p>

                <div className="space-y-4">
                  {/* Ошибка 1: Слишком большая область */}
                  <div className="border border-red-700/50 rounded-lg overflow-hidden bg-slate-900/30">
                    <div className="p-3 bg-red-900/20 border-b border-red-700/30">
                      <p className="text-white font-medium text-sm flex items-center gap-2">
                        <Icon name="X" size={14} className="text-red-400" />
                        Ошибка №1: Слишком большая область с лишним фоном
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-0">
                      <div className="border-r border-red-700/30">
                        <img 
                          src="https://cdn.poehali.dev/projects/493f019c-4ec3-40c7-8ed7-f73fd0f42aa1/files/59190b1f-d76c-481c-9faf-9cb21f6e8257.jpg" 
                          alt="Неправильно - много фона"
                          className="w-full h-40 object-cover"
                        />
                        <div className="p-2 bg-red-900/30">
                          <p className="text-xs text-red-300 flex items-center gap-1">
                            <Icon name="X" size={10} />
                            Неправильно
                          </p>
                        </div>
                      </div>
                      <div>
                        <img 
                          src="https://cdn.poehali.dev/projects/493f019c-4ec3-40c7-8ed7-f73fd0f42aa1/files/493f87c1-8e1c-4960-acd6-19b89ef9ba03.jpg" 
                          alt="Правильно - плотно"
                          className="w-full h-40 object-cover"
                        />
                        <div className="p-2 bg-green-900/30">
                          <p className="text-xs text-green-300 flex items-center gap-1">
                            <Icon name="Check" size={10} />
                            Правильно
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 space-y-1">
                      <p className="text-sm text-slate-300">
                        <strong className="text-red-400">Проблема:</strong> Область захватывает много фона вокруг объекта
                      </p>
                      <p className="text-sm text-slate-300">
                        <strong className="text-green-400">Решение:</strong> Обводите максимально плотно, оставляя минимум фона
                      </p>
                    </div>
                  </div>

                  {/* Ошибка 2: Слишком маленькая область */}
                  <div className="border border-red-700/50 rounded-lg overflow-hidden bg-slate-900/30">
                    <div className="p-3 bg-red-900/20 border-b border-red-700/30">
                      <p className="text-white font-medium text-sm flex items-center gap-2">
                        <Icon name="X" size={14} className="text-red-400" />
                        Ошибка №2: Область обрезает важные части объекта
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-0">
                      <div className="border-r border-red-700/30">
                        <img 
                          src="https://cdn.poehali.dev/projects/493f019c-4ec3-40c7-8ed7-f73fd0f42aa1/files/e579f0b3-4ff5-403f-a4ee-ced15095060b.jpg" 
                          alt="Неправильно - обрезано"
                          className="w-full h-40 object-cover"
                        />
                        <div className="p-2 bg-red-900/30">
                          <p className="text-xs text-red-300 flex items-center gap-1">
                            <Icon name="X" size={10} />
                            Неправильно
                          </p>
                        </div>
                      </div>
                      <div>
                        <img 
                          src="https://cdn.poehali.dev/projects/493f019c-4ec3-40c7-8ed7-f73fd0f42aa1/files/493f87c1-8e1c-4960-acd6-19b89ef9ba03.jpg" 
                          alt="Правильно - полностью"
                          className="w-full h-40 object-cover"
                        />
                        <div className="p-2 bg-green-900/30">
                          <p className="text-xs text-green-300 flex items-center gap-1">
                            <Icon name="Check" size={10} />
                            Правильно
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 space-y-1">
                      <p className="text-sm text-slate-300">
                        <strong className="text-red-400">Проблема:</strong> Область слишком мала и обрезает части объекта
                      </p>
                      <p className="text-sm text-slate-300">
                        <strong className="text-green-400">Решение:</strong> Убедитесь что весь объект полностью входит в область
                      </p>
                    </div>
                  </div>

                  {/* Список других ошибок */}
                  <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                    <h5 className="text-white font-medium mb-3 text-sm">Другие распространённые ошибки:</h5>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2 text-sm">
                        <Icon name="X" size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="text-slate-200 font-medium">Неправильный тип объекта:</span>
                          <span className="text-slate-400 ml-1">Фары отмечены как "Светофор", ремень как "Знак"</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <Icon name="X" size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="text-slate-200 font-medium">Дублирование областей:</span>
                          <span className="text-slate-400 ml-1">Один объект выделен несколько раз</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <Icon name="X" size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="text-slate-200 font-medium">Отсутствие подписей:</span>
                          <span className="text-slate-400 ml-1">Область без пояснений "не горит", "пристёгнут"</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <Icon name="X" size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="text-slate-200 font-medium">Пропуск важных объектов:</span>
                          <span className="text-slate-400 ml-1">На фото 2 фары, размечена только одна</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <Icon name="X" size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="text-slate-200 font-medium">Неточные границы:</span>
                          <span className="text-slate-400 ml-1">Область косая, хотя объект ровный</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <Icon name="X" size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="text-slate-200 font-medium">Разметка нечёткого фото:</span>
                          <span className="text-slate-400 ml-1">Если объект не виден чётко — пометьте "не определить"</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Критерии качественной разметки */}
          <Card className="p-6 bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-700">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Icon name="ThumbsUp" size={20} className="text-green-400" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">Критерии качественной разметки</h4>
                <ul className="space-y-2 text-slate-200">
                  <li className="flex items-start gap-2">
                    <Icon name="Check" size={16} className="text-green-400 mt-1 flex-shrink-0" />
                    <span>Границы областей точно обводят объект без лишнего фона</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="Check" size={16} className="text-green-400 mt-1 flex-shrink-0" />
                    <span>Каждый важный объект выделен отдельной областью</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="Check" size={16} className="text-green-400 mt-1 flex-shrink-0" />
                    <span>Указан корректный тип объекта и добавлены подписи</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="Check" size={16} className="text-green-400 mt-1 flex-shrink-0" />
                    <span>Код нарушения соответствует ситуации на изображении</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="Check" size={16} className="text-green-400 mt-1 flex-shrink-0" />
                    <span>В комментариях есть пояснения о деталях нарушения</span>
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        </div>

        <div className="p-4 border-t border-slate-700 bg-slate-800/50">
          <Button onClick={onClose} className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700">
            <Icon name="CheckCircle2" size={16} className="mr-2" />
            Понятно, приступить к разметке
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MarkupInstructions;