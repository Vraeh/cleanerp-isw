import { Wrench } from 'lucide-react';
import PageHeader from '../../components/PageHeader';

export default function AsistenciaTokenPage() {
  return (
    <div className="animate-fadeIn">
      <PageHeader
        titulo="Generar Token de Asistencia"
        migajas={[{ nombre: 'Dashboard', ruta: '/' }, { nombre: 'Asistencia', ruta: '/asistencia' }, { nombre: 'Generar Token de Asistencia' }]}
      />
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="bg-gray-100 rounded-full p-6 mb-4">
          <Wrench size={40} className="text-gray-400" />
        </div>
        <h2 className="text-xl font-semibold text-gray-600">Pendiente de implementar</h2>
        <p className="text-gray-400 text-sm mt-2">
          Estamos trabajando para usted :3
        </p>
      </div>
    </div>
  );
}
