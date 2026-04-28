import Breadcrumb from './Breadcrumb';

interface ItemBreadcrumb {
  nombre: string;
  ruta?: string;
}

interface Props {
  titulo: string;
  descripcion?: string;
  migajas?: ItemBreadcrumb[];
  acciones?: React.ReactNode;
}

export default function PageHeader({ titulo, descripcion, migajas, acciones }: Props) {
  return (
    <div className="mb-6">
      {migajas && migajas.length > 0 && <Breadcrumb items={migajas} />}
      <div className="flex items-start justify-between mt-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{titulo}</h1>
          {descripcion && <p className="text-sm text-gray-500 mt-1">{descripcion}</p>}
        </div>
        {acciones && <div className="flex gap-2">{acciones}</div>}
      </div>
    </div>
  );
}
