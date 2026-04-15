import { useEffect, useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  CATEGORY_COLORS, COLOR_CLASSES, SUGGESTED_EMOJIS,
  type CategoryColor, normalizeColor,
} from '@/features/categories/lib/category-palette';
import { cn } from '@/lib/utils';

export type CategoryDialogValue = {
  name: string;
  color: CategoryColor;
  emoji: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValue?: Partial<CategoryDialogValue>;
  onSubmit: (value: CategoryDialogValue) => Promise<void> | void;
  title?: string;
  description?: string;
  submitLabel?: string;
};

export function CategoryDialog({
  open, onOpenChange, initialValue, onSubmit,
  title = 'Nova categoria',
  description = 'Dê um nome, escolha uma cor e um emoji para identificar seus links.',
  submitLabel = 'Salvar',
}: Props) {
  const [name, setName] = useState('');
  const [color, setColor] = useState<CategoryColor>('slate');
  const [emoji, setEmoji] = useState('📁');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setName(initialValue?.name ?? '');
      setColor(normalizeColor(initialValue?.color));
      setEmoji(initialValue?.emoji?.trim() || '📁');
      setSaving(false);
    }
  }, [open, initialValue]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedEmoji = emoji.trim().slice(0, 4) || '📁';
    if (!trimmedName) return;
    setSaving(true);
    try {
      await onSubmit({ name: trimmedName, color, emoji: trimmedEmoji });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!saving) onOpenChange(v); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-3 rounded-lg border bg-muted/40 p-3">
            <div className={cn(
              'flex h-12 w-12 items-center justify-center rounded-lg text-2xl',
              COLOR_CLASSES[color].bg,
            )}>
              <span>{emoji}</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">
                {name.trim() || 'Prévia da categoria'}
              </div>
              <div className={cn('text-xs capitalize', COLOR_CLASSES[color].text)}>
                {color}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cat-name">Nome</Label>
            <Input
              id="cat-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={40}
              placeholder="Ex.: Produtividade"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label>Cor</Label>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_COLORS.map((c) => {
                const selected = c === color;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    aria-label={`Cor ${c}`}
                    aria-pressed={selected}
                    className={cn(
                      'h-8 w-8 rounded-full ring-offset-2 transition-all',
                      COLOR_CLASSES[c].solid,
                      selected
                        ? cn('ring-2 ring-offset-background', COLOR_CLASSES[c].ring)
                        : 'hover:scale-110',
                    )}
                  />
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cat-emoji">Emoji</Label>
            <Input
              id="cat-emoji"
              value={emoji}
              onChange={(e) => setEmoji(e.target.value.slice(0, 4))}
              maxLength={4}
              className="w-24 text-center text-lg"
            />
            <div className="flex flex-wrap gap-1">
              {SUGGESTED_EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-md text-lg transition-colors hover:bg-muted',
                    emoji === e && 'bg-muted ring-1 ring-ring',
                  )}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={saving || !name.trim()}>
              {saving ? 'Salvando...' : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
