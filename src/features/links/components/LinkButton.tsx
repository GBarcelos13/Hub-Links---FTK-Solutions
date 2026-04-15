import { ExternalLink, Star } from 'lucide-react';

interface LinkButtonProps {
  name: string;
  url: string;
  description?: string | null;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export function LinkButton({ name, url, description, isFavorite, onToggleFavorite }: LinkButtonProps) {
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
      <div className="relative flex items-center gap-3 min-h-[4.25rem] px-5 py-4 rounded-2xl border border-link-button-border bg-link-button transition-all duration-200 hover:border-primary/50 hover:bg-link-button-hover hover:shadow-md hover:shadow-primary/8 hover:-translate-y-0.5">
        {/* Amber left accent bar */}
        <div className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

        <div className="flex-1 min-w-0">
          <span className="block text-sm font-display font-700 tracking-wider text-link-button-text uppercase truncate">
            {name}
          </span>
          {description && (
            <span className="mt-0.5 block text-xs text-muted-foreground truncate">
              {description}
            </span>
          )}
        </div>

        <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground/40 group-hover:text-primary transition-colors duration-200" />

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
              className={`h-3.5 w-3.5 transition-colors ${
                isFavorite ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/50 hover:text-amber-400'
              }`}
            />
          </button>
        )}
      </div>
    </a>
  );
}
