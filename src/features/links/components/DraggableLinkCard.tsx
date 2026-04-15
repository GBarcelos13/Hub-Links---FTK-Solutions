import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { LinkButton } from '@/features/links/components/LinkButton';
import { GripVertical, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export const LINK_DRAG_PREFIX = 'link:';

type Props = {
  id: string;
  name: string;
  url: string;
  description?: string | null;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onEdit?: () => void;
  onRemove?: () => void;
};

export function DraggableLinkCard({
  id, name, url, description, isFavorite, onToggleFavorite, onEdit, onRemove,
}: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `${LINK_DRAG_PREFIX}${id}`,
    data: { linkId: id },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="group/drag relative">
      {/* Drag handle */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label="Arrastar link"
        className={cn(
          'absolute left-2 top-1/2 -translate-y-1/2 z-10',
          'flex h-7 w-7 items-center justify-center rounded-md',
          'bg-background/80 backdrop-blur text-muted-foreground',
          'opacity-0 group-hover/drag:opacity-100 transition-opacity',
          'cursor-grab active:cursor-grabbing',
          'border shadow-sm',
        )}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <LinkButton
        name={name}
        url={url}
        description={description}
        isFavorite={isFavorite}
        onToggleFavorite={onToggleFavorite}
      />

      {/* Actions menu */}
      {(onEdit || onRemove) && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover/drag:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="Opções do link"
                className="flex h-7 w-7 items-center justify-center rounded-md bg-background/80 backdrop-blur text-muted-foreground border shadow-sm hover:text-foreground transition-colors"
                onClick={(e) => e.preventDefault()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && (
                <DropdownMenuItem onClick={onEdit}>
                  <Pencil className="mr-2 h-4 w-4" /> Editar
                </DropdownMenuItem>
              )}
              {onEdit && onRemove && <DropdownMenuSeparator />}
              {onRemove && (
                <DropdownMenuItem className="text-destructive" onClick={onRemove}>
                  <Trash2 className="mr-2 h-4 w-4" /> Excluir
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}
