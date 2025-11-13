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
      className="group relative w-full transform transition-all duration-200 hover:scale-[1.02]"
    >
      <div className="flex items-center justify-center gap-3 h-16 px-8 bg-link-button border-2 border-link-button-border rounded-2xl transition-all duration-200 hover:bg-link-button-hover hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10">
        <span className="text-sm font-bold tracking-widest text-link-button-text uppercase">
          {name}
        </span>
        <ExternalLink className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
    </a>
  );
}
