import { LayoutGrid, Grid2X2, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type ViewSize = 'compact' | 'normal' | 'large';

interface Props {
  value: ViewSize;
  onChange: (value: ViewSize) => void;
}

export function ViewSizeSelector({ value, onChange }: Props) {
  return (
    <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
      <Button
        variant="ghost"
        size="sm"
        className={cn('h-8 w-8 p-0', value === 'compact' && 'bg-background shadow-sm')}
        onClick={() => onChange('compact')}
        title="Compacto (3 colunas)"
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className={cn('h-8 w-8 p-0', value === 'normal' && 'bg-background shadow-sm')}
        onClick={() => onChange('normal')}
        title="Normal (2 colunas)"
      >
        <Grid2X2 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className={cn('h-8 w-8 p-0', value === 'large' && 'bg-background shadow-sm')}
        onClick={() => onChange('large')}
        title="Grande (1 coluna)"
      >
        <List className="h-4 w-4" />
      </Button>
    </div>
  );
}
