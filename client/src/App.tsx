import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastProvider';
import LoginPage from './pages/LoginPage';
import MainLayout from './layouts/MainLayout';
import DashboardPage from './pages/dashboard/DashboardPage';
// Personal
import TrabajadoresPage from './pages/personal/TrabajadoresPage';
import ContratosPage from './pages/personal/ContratosPage';
import AsignacionesPage from './pages/personal/AsignacionesPage';
import EventoHojaVidaPage from './pages/personal/EventoHojaVidaPage';
// Clientes y proyectos
import ClientesPage from './pages/clientes/ClientesPage';
import ProyectosPage from './pages/proyectos/ProyectosPage';
// Asistencia
import AsistenciaDiarioPage from './pages/asistencia/AsistenciaDiarioPage';
import AsistenciaTokenPage from './pages/asistencia/AsistenciaTokenPage';
import AsistenciaRegistrarPage from './pages/asistencia/AsistenciaRegistrarPage';
import LicenciasPage from './pages/asistencia/LicenciasPage';
import AsistenciaReportesPage from './pages/asistencia/AsistenciaReportesPage';
// Inventario
import InventarioResumenPage from './pages/inventario/InventarioResumenPage';
import InventarioStockPage from './pages/inventario/InventarioStockPage';
import InventarioCatalogoPage from './pages/inventario/InventarioCatalogoPage';
import InventarioMovimientosPage from './pages/inventario/InventarioMovimientosPage';
import InventarioSolicitudesPage from './pages/inventario/InventarioSolicitudesPage';
import InventarioEquipamientoPage from './pages/inventario/InventarioEquipamientoPage';
import InventarioReportesPage from './pages/inventario/InventarioReportesPage';
import { useAuth } from './hooks/useAuth';

function RutaProtegida({ children }: { children: React.ReactNode }) {
  const { usuario, cargando } = useAuth();
  if (cargando) return null;
  if (!usuario) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { usuario } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={usuario ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        path="/"
        element={
          <RutaProtegida>
            <MainLayout />
          </RutaProtegida>
        }
      >
        <Route index element={<DashboardPage />} />
        {/* Personal */}
        <Route path="personal/trabajadores" element={<TrabajadoresPage />} />
        <Route path="personal/contratos" element={<ContratosPage />} />
        <Route path="personal/asignaciones" element={<AsignacionesPage />} />
        <Route path="personal/hoja-vida" element={<EventoHojaVidaPage />} />
        {/* Clientes y proyectos */}
        <Route path="clientes" element={<ClientesPage />} />
        <Route path="proyectos" element={<ProyectosPage />} />
        {/* Asistencia */}
        <Route path="asistencia/diario" element={<AsistenciaDiarioPage />} />
        <Route path="asistencia/token" element={<AsistenciaTokenPage />} />
        <Route path="asistencia/registrar" element={<AsistenciaRegistrarPage />} />
        <Route path="asistencia/licencias" element={<LicenciasPage />} />
        <Route path="asistencia/reportes" element={<AsistenciaReportesPage />} />
        {/* Inventario */}
        <Route path="inventario/resumen" element={<InventarioResumenPage />} />
        <Route path="inventario/stock" element={<InventarioStockPage />} />
        <Route path="inventario/catalogo" element={<InventarioCatalogoPage />} />
        <Route path="inventario/movimientos" element={<InventarioMovimientosPage />} />
        <Route path="inventario/solicitudes" element={<InventarioSolicitudesPage />} />
        <Route path="inventario/equipamiento" element={<InventarioEquipamientoPage />} />
        <Route path="inventario/reportes" element={<InventarioReportesPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
