import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface ItemBreadcrumb {
  nombre: string;
  ruta?: string;
}

interface Props {
  items: ItemBreadcrumb[];
}

export default function Breadcrumb({ items }: Props) {
  return (
    <nav className="flex items-center gap-1 text-sm text-gray-500">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-1">
          {index > 0 && <ChevronRight size={14} className="text-gray-400" />}
          {item.ruta ? (
            <Link to={item.ruta} className="hover:text-blue-600 hover:underline transition-colors">
              {item.nombre}
            </Link>
          ) : (
            <span className="text-gray-900 font-medium">{item.nombre}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
