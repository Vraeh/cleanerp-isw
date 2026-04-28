import type { LucideIcon } from 'lucide-react';
import { cn } from '../lib/utils';

interface Props {
  titulo: string;
  valor: string | number;
  icono: LucideIcon;
  descripcion?: string;
  colorIcono?: string;
  colorFondo?: string;
}

export default function StatsCard({ titulo, valor, icono: Icono, descripcion, colorIcono = 'text-blue-600', colorFondo = 'bg-blue-50' }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{titulo}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{valor}</p>
          {descripcion && <p className="text-xs text-gray-400 mt-1">{descripcion}</p>}
        </div>
        <div className={cn('p-3 rounded-xl', colorFondo)}>
          <Icono size={22} className={colorIcono} />
        </div>
      </div>
    </div>
  );
}
