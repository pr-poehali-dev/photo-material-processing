import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { TarImages } from '@/utils/tarParser';

interface PhotoGalleryProps {
  images?: TarImages;
  fileName: string;
}

export default function PhotoGallery({ images, fileName }: PhotoGalleryProps) {
  if (!images || Object.keys(images).length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        <Icon name="ImageOff" size={48} className="mx-auto mb-3 opacity-50" />
        <p>Фотоматериалы не найдены в архиве</p>
        <p className="text-sm mt-1">Убедитесь, что TAR-архив содержит изображения</p>
      </div>
    );
  }

  const photoCards = [
    {
      key: 'collage',
      image: images.collage,
      title: 'Общий коллаж',
      description: '*_0.jpg',
      icon: 'LayoutGrid' as const,
      color: 'from-blue-500 to-cyan-600',
    },
    {
      key: 'violation',
      image: images.violation,
      title: 'Увеличенное фото нарушения',
      description: '*_1.jpg',
      icon: 'AlertCircle' as const,
      color: 'from-orange-500 to-red-600',
    },
    {
      key: 'plate',
      image: images.plate,
      title: 'Увеличенное фото ГРЗ',
      description: '*_grz.jpg',
      icon: 'RectangleHorizontal' as const,
      color: 'from-purple-500 to-pink-600',
    },
    {
      key: 'general',
      image: images.general,
      title: 'Общий кадр',
      description: '*.jpg',
      icon: 'Camera' as const,
      color: 'from-green-500 to-emerald-600',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
          <Icon name="Images" className="text-white" size={18} />
        </div>
        <div>
          <h3 className="text-white font-semibold">Фотоматериалы из архива</h3>
          <p className="text-xs text-slate-400">{fileName}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {photoCards.map((card) => {
          if (!card.image) return null;

          return (
            <Card key={card.key} className="bg-slate-800/50 border-slate-700 overflow-hidden hover:border-slate-600 transition-all group">
              <div className="relative aspect-video bg-slate-900">
                <img
                  src={card.image}
                  alt={card.title}
                  className="w-full h-full object-contain"
                />
                <div className={`absolute top-3 left-3 px-2 py-1 bg-gradient-to-r ${card.color} rounded-md flex items-center gap-1.5 shadow-lg`}>
                  <Icon name={card.icon} size={14} className="text-white" />
                  <span className="text-white text-xs font-medium">{card.description}</span>
                </div>
              </div>
              <div className="p-3">
                <h4 className="text-white text-sm font-medium">{card.title}</h4>
              </div>
            </Card>
          );
        })}
      </div>

      {Object.keys(images).length === 0 && (
        <div className="text-center py-6 text-slate-500">
          <Icon name="AlertCircle" size={24} className="mx-auto mb-2" />
          <p className="text-sm">Изображения не обнаружены в TAR-архиве</p>
        </div>
      )}
    </div>
  );
}
