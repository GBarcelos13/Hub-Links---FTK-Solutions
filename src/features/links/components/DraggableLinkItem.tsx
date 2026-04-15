import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, ExternalLink, GripVertical, Star } from 'lucide-react';
import type { Link } from '@/shared/types';
import type { Category } from '@/features/categories/hooks/useCategories';
import { COLOR_CLASSES } from '@/features/categories/lib/category-palette';
import { cn } from '@/lib/utils';

interface DraggableLinkItemProps {
  link: Link;
  canEdit: boolean;
  category?: Category;
  onRemove: (id: string, name: string) => void;
  onToggleFavorite: (id: string) => void;
}

export function DraggableLinkItem({
  link, canEdit, category, onRemove, onToggleFavorite,
}: DraggableLinkItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: link.id,
  });

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
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing flex-shrink-0">
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>
        <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-foreground truncate">{link.name}</p>
            {category && (
              <Badge
                variant="secondary"
                className={cn(
                  'gap-1 border-0 text-[10px]',
                  COLOR_CLASSES[category.color].bg,
                  COLOR_CLASSES[category.color].text,
                )}
              >
                <span>{category.emoji}</span>
                <span className="truncate max-w-[100px]">{category.name}</span>
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground truncate">{link.url}</p>
          {link.description && (
            <p className="text-xs text-muted-foreground/70 truncate mt-0.5">{link.description}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0 ml-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onToggleFavorite(link.id)}
          className="hover:bg-yellow-400/10"
        >
          <Star
            className={`h-4 w-4 ${
              link.is_favorite ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
            }`}
          />
        </Button>
        {canEdit && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(link.id, link.name)}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
