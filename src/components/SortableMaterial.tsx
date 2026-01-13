import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { PhotoMaterial } from './ViolationCodesManager';

interface SortableMaterialProps {
  material: PhotoMaterial;
  onDelete: (id: string) => void;
}

export default function SortableMaterial({ material, onDelete }: SortableMaterialProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: material.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-slate-800 rounded-lg p-3 border border-slate-700 flex items-center justify-between"
    >
      <div className="flex items-center gap-3 flex-1">
        <button
          className="cursor-grab active:cursor-grabbing text-slate-500 hover:text-slate-300 transition-colors"
          {...attributes}
          {...listeners}
        >
          <Icon name="GripVertical" size={16} />
        </button>
        <div className={`p-2 bg-gradient-to-br ${material.color} rounded-lg`}>
          <Icon name={material.icon} className="text-white" size={16} />
        </div>
        <div className="flex-1">
          <div className="text-white text-sm font-medium">{material.title}</div>
          <div className="text-slate-400 text-xs font-mono">{material.pattern}</div>
        </div>
        <div className="text-xs text-slate-500 px-2 py-1 bg-slate-700 rounded">
          {material.type === 'photo' ? 'Фото' : 'Видео'}
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onDelete(material.id)}
        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 ml-2"
      >
        <Icon name="X" size={14} />
      </Button>
    </div>
  );
}
