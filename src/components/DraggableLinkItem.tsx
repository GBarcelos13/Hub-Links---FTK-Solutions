import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Trash2, ExternalLink, GripVertical } from 'lucide-react';
import { Link } from '@/hooks/useLinks';

interface DraggableLinkItemProps {
  link: Link;
  canEdit: boolean;
  onRemove: (id: string, name: string) => void;
}

export function DraggableLinkItem({ link, canEdit, onRemove }: DraggableLinkItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border"
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing flex-shrink-0"
        >
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>
        <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-foreground truncate">
            {link.name}
          </p>
          <p className="text-sm text-muted-foreground truncate">
            {link.url}
          </p>
        </div>
      </div>
      {canEdit && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(link.id, link.name)}
          className="flex-shrink-0 ml-2 text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
