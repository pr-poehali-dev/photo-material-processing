import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { TarImages } from '@/utils/tarParser';
import { PhotoMaterial } from './ViolationCodesManager';

interface PhotoGalleryProps {
  images?: TarImages;
  fileName: string;
  photoMaterials?: PhotoMaterial[];
}

export default function PhotoGallery({ images, fileName, photoMaterials }: PhotoGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  const getImageByPattern = (pattern: string): string | undefined => {
    if (!images) return undefined;
    
    const patternKey = pattern
      .replace('*_0.jpg', 'collage')
      .replace('*_1.jpg', 'time1')
      .replace('*_2.jpg', 'time2')
      .replace('*_3.jpg', 'fix1')
      .replace('*_4.jpg', 'fix2')
      .replace('*_grz.jpg', 'plate')
      .replace('*.jpg', 'general')
      .replace('*.mp4', 'video');
    
    return images[patternKey as keyof TarImages];
  };

  const photoCards = photoMaterials
    ? photoMaterials
        .filter(m => m.type === 'photo')
        .map(material => ({
          key: material.id,
          image: getImageByPattern(material.pattern),
          title: material.title,
          description: material.pattern,
          icon: material.icon as const,
          color: material.color,
        }))
    : [];

  const videoMaterial = photoMaterials?.find(m => m.type === 'video');

  const availablePhotos = photoCards.filter(card => card.image);

  useEffect(() => {
    if (selectedImageIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && selectedImageIndex > 0) {
        setSelectedImageIndex(selectedImageIndex - 1);
      }
      if (e.key === 'ArrowRight' && selectedImageIndex < availablePhotos.length - 1) {
        setSelectedImageIndex(selectedImageIndex + 1);
      }
      if (e.key === 'Escape') {
        setSelectedImageIndex(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImageIndex, availablePhotos.length]);

  if (!images || Object.keys(images).length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        <Icon name="ImageOff" size={48} className="mx-auto mb-3 opacity-50" />
        <p>Фотоматериалы не найдены в архиве</p>
        <p className="text-sm mt-1">Убедитесь, что TAR-архив содержит изображения</p>
      </div>
    );
  }

  const selectedPhoto = selectedImageIndex !== null ? availablePhotos[selectedImageIndex] : null;

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

          const index = availablePhotos.findIndex(p => p.key === card.key);

          return (
            <Card 
              key={card.key} 
              className="bg-slate-800/50 border-slate-700 overflow-hidden hover:border-slate-600 transition-all group cursor-pointer"
              onClick={() => setSelectedImageIndex(index)}
            >
              <div className="relative aspect-video bg-slate-900">
                <img
                  src={card.image}
                  alt={card.title}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                />
                <div className={`absolute top-3 left-3 px-2 py-1 bg-gradient-to-r ${card.color} rounded-md flex items-center gap-1.5 shadow-lg`}>
                  <Icon name={card.icon} size={14} className="text-white" />
                  <span className="text-white text-xs font-medium">{card.description}</span>
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/10 backdrop-blur-sm rounded-full p-3">
                    <Icon name="ZoomIn" size={24} className="text-white" />
                  </div>
                </div>
              </div>
              <div className="p-3">
                <h4 className="text-white text-sm font-medium">{card.title}</h4>
              </div>
            </Card>
          );
        })}
      </div>

      {videoMaterial && getImageByPattern(videoMaterial.pattern) && (
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-3">
            <div className={`p-2 bg-gradient-to-br ${videoMaterial.color} rounded-lg`}>
              <Icon name={videoMaterial.icon} className="text-white" size={18} />
            </div>
            <div>
              <h3 className="text-white font-semibold">{videoMaterial.title}</h3>
              <p className="text-xs text-slate-400">{videoMaterial.pattern}</p>
            </div>
          </div>
          <Card className="bg-slate-800/50 border-slate-700 overflow-hidden">
            <video 
              src={getImageByPattern(videoMaterial.pattern)} 
              controls 
              className="w-full"
              preload="metadata"
            >
              Ваш браузер не поддерживает видео
            </video>
          </Card>
        </div>
      )}

      {Object.keys(images).length === 0 && (
        <div className="text-center py-6 text-slate-500">
          <Icon name="AlertCircle" size={24} className="mx-auto mb-2" />
          <p className="text-sm">Изображения не обнаружены в TAR-архиве</p>
        </div>
      )}

      {selectedPhoto && (
        <div 
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
          onClick={() => setSelectedImageIndex(null)}
        >
          <div className="relative w-full h-full flex flex-col">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedImageIndex(null)}
              className="absolute top-2 right-2 text-white hover:bg-white/10 z-10 bg-black/50 backdrop-blur-sm"
            >
              <Icon name="X" size={24} />
            </Button>

            {selectedImageIndex !== null && selectedImageIndex > 0 && (
              <Button
                variant="ghost"
                size="lg"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImageIndex(selectedImageIndex - 1);
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 bg-black/50 backdrop-blur-sm h-14 w-14 rounded-full z-10"
              >
                <Icon name="ChevronLeft" size={32} />
              </Button>
            )}

            {selectedImageIndex !== null && selectedImageIndex < availablePhotos.length - 1 && (
              <Button
                variant="ghost"
                size="lg"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImageIndex(selectedImageIndex + 1);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 bg-black/50 backdrop-blur-sm h-14 w-14 rounded-full z-10"
              >
                <Icon name="ChevronRight" size={32} />
              </Button>
            )}

            <div className="absolute inset-0 flex items-center justify-center">
              <img
                src={selectedPhoto.image}
                alt={selectedPhoto.title}
                className="max-w-[calc(100vw-100px)] max-h-[calc(100vh-20px)] w-auto h-auto object-contain"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-6 pt-12">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-semibold text-lg drop-shadow-lg">{selectedPhoto.title}</h3>
                  <p className="text-slate-300 text-sm mt-1 drop-shadow-lg">{fileName}</p>
                </div>
                <div className="text-slate-200 text-sm font-medium drop-shadow-lg">
                  {selectedImageIndex !== null && `${selectedImageIndex + 1} / ${availablePhotos.length}`}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}