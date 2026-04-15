import { ExternalLink, Star } from 'lucide-react';
import type { ViewSize } from '@/features/links/components/ViewSizeSelector';

const sizeClasses: Record<ViewSize, { container: string; text: string; desc: string; icon: string }> = {
  compact: { container: 'min-h-[3rem] px-4 py-2',    text: 'text-xs',   desc: 'text-[10px]', icon: 'h-3.5 w-3.5' },
  normal:  { container: 'min-h-[4.25rem] px-5 py-4', text: 'text-sm',   desc: 'text-xs',     icon: 'h-4 w-4'     },
  large:   { container: 'min-h-[5rem] px-6 py-5',    text: 'text-base', desc: 'text-sm',     icon: 'h-5 w-5'     },
};

interface LinkButtonProps {
  name: string;
  url: string;
  description?: string | null;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  size?: ViewSize;
}

export function LinkButton({ name, url, description, isFavorite, onToggleFavorite, size = 'normal' }: LinkButtonProps) {
  const sc = sizeClasses[size];

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFavorite?.();
  };

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block w-full"
    >
      <div className={`relative flex items-center gap-3 ${sc.container} rounded-2xl border border-link-button-border bg-link-button transition-all duration-200 hover:border-primary/50 hover:bg-link-button-hover hover:shadow-md hover:shadow-primary/8 hover:-translate-y-0.5`}>
        {/* Amber left accent bar */}
        <div className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

        <div className="flex-1 min-w-0">
          <span className={`block font-display font-700 tracking-wider text-link-button-text uppercase truncate ${sc.text}`}>
            {name}
          </span>
          {description && size !== 'compact' && (
            <span className={`mt-0.5 block text-muted-foreground truncate ${sc.desc}`}>
              {description}
            </span>
          )}
        </div>

        <ExternalLink className={`shrink-0 text-muted-foreground/40 group-hover:text-primary transition-colors duration-200 ${sc.icon}`} />

        {onToggleFavorite && (
          <button
            type="button"
            onClick={handleFavoriteClick}
            className={`absolute top-2.5 right-9 p-1 rounded-lg transition-opacity hover:bg-muted ${
              isFavorite ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}
            aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          >
            <Star
              className={`transition-colors ${sc.icon} ${
                isFavorite ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/50 hover:text-amber-400'
              }`}
            />
          </button>
        )}
      </div>
    </a>
  );
}
