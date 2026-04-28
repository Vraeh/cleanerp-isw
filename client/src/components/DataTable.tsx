import { useState } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

// TODO: agregar paginación cuando tengamos más datos

interface Columna<T> {
  clave: keyof T | string;
  titulo: string;
  render?: (fila: T) => React.ReactNode;
  ordenable?: boolean;
}

interface Props<T> {
  columnas: Columna<T>[];
  datos: T[];
  clavePrimaria: keyof T;
  mensajeVacio?: string;
  cargando?: boolean;
}

export default function DataTable<T extends object>({
  columnas,
  datos,
  clavePrimaria,
  mensajeVacio = 'No hay registros para mostrar',
  cargando = false,
}: Props<T>) {
  const [ordenClave, setOrdenClave] = useState<string | null>(null);
  const [ordenDir, setOrdenDir] = useState<'asc' | 'desc'>('asc');

  function manejarOrden(clave: string) {
    if (ordenClave === clave) {
      setOrdenDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setOrdenClave(clave);
      setOrdenDir('asc');
    }
  }

  const datosOrdenados = [...datos].sort((a, b) => {
    if (!ordenClave) return 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const va = (a as any)[ordenClave];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const vb = (b as any)[ordenClave];
    if (va === vb) return 0;
    const comp = String(va).localeCompare(String(vb), 'es');
    return ordenDir === 'asc' ? comp : -comp;
  });

  if (cargando) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columnas.map((col) => (
              <th
                key={String(col.clave)}
                scope="col"
                className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                {col.ordenable ? (
                  <button
                    className="flex items-center gap-1 hover:text-gray-900 transition-colors"
                    onClick={() => manejarOrden(String(col.clave))}
                  >
                    {col.titulo}
                    {ordenClave === col.clave ? (
                      ordenDir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                    ) : (
                      <ChevronsUpDown size={14} className="opacity-40" />
                    )}
                  </button>
                ) : (
                  col.titulo
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {datosOrdenados.length === 0 ? (
            <tr>
              <td colSpan={columnas.length} className="px-4 py-8 text-center text-sm text-gray-400">
                {mensajeVacio}
              </td>
            </tr>
          ) : (
            datosOrdenados.map((fila) => (
              <tr key={String((fila as any)[clavePrimaria])} className="hover:bg-gray-50 transition-colors">
                {columnas.map((col) => (
                  <td key={String(col.clave)} className="px-4 py-3 text-sm text-gray-700">
                    {col.render
                      ? col.render(fila)
                      : String((fila as any)[String(col.clave)] ?? '-')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
