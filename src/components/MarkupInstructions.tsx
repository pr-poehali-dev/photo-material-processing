import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface MarkupInstructionsProps {
  onClose: () => void;
}

const MarkupInstructions = ({ onClose }: MarkupInstructionsProps) => {
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
          <Button variant="outline" onClick={onClose} className="border-slate-600 text-slate-300 hover:bg-slate-800">
            <Icon name="X" size={16} />
          </Button>
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

          {/* Примеры хорошей разметки */}
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
