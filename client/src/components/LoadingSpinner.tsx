interface Props {
  mensaje?: string;
  tamaño?: 'sm' | 'md' | 'lg';
}

export default function LoadingSpinner({ mensaje, tamaño = 'md' }: Props) {
  const tamaños = { sm: 'h-5 w-5', md: 'h-8 w-8', lg: 'h-12 w-12' };

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <div
        className={`${tamaños[tamaño]} animate-spin rounded-full border-4 border-gray-200 border-t-blue-600`}
      />
      {mensaje && <p className="text-sm text-gray-500">{mensaje}</p>}
    </div>
  );
}
