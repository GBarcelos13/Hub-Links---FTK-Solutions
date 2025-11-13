import { ExternalLink } from 'lucide-react';

interface LinkButtonProps {
  name: string;
  url: string;
}

export function LinkButton({ name, url }: LinkButtonProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative w-full"
    >
      <div className="flex items-center justify-center gap-3 h-14 px-6 bg-link-button border-2 border-link-button-border rounded-xl transition-all duration-200 hover:bg-link-button-hover hover:border-primary/30 hover:shadow-md">
        <span className="text-sm font-semibold tracking-wide text-link-button-text uppercase">
          {name}
        </span>
        <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
    </a>
  );
}
