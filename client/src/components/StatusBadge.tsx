import { cn } from '../lib/utils';

interface Props {
  texto: string;
  estilo: string;
  className?: string;
}

export default function StatusBadge({ texto, estilo, className }: Props) {
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', estilo, className)}>
      {texto}
    </span>
  );
}
