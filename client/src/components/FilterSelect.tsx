interface Opcion {
  valor: string;
  etiqueta: string;
}

interface Props {
  opciones: Opcion[];
  valor: string;
  onChange: (valor: string) => void;
  placeholder?: string;
  className?: string;
}

export default function FilterSelect({ opciones, valor, onChange, placeholder = 'Todos', className }: Props) {
  return (
    <select
      value={valor}
      onChange={(e) => onChange(e.target.value)}
      className={`border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${className ?? ''}`}
    >
      <option value="">{placeholder}</option>
      {opciones.map((op) => (
        <option key={op.valor} value={op.valor}>
          {op.etiqueta}
        </option>
      ))}
    </select>
  );
}
