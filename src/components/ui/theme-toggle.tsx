import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';

export function ThemeToggle({ className }: { className?: string }) {
  const { tema, toggle } = useTheme();
  const label = tema === 'oscuro' ? 'Activar modo claro' : 'Activar modo oscuro';

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={label}
      title={label}
      onClick={toggle}
      className={className}
    >
      {tema === 'oscuro' ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  );
}
