import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

export default function MainLayout() {
  const [sidebarMovilAbierto, setSidebarMovilAbierto] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar escritorio */}
      <aside className="hidden md:flex flex-col w-64 flex-shrink-0">
        <Sidebar onCerrar={() => setSidebarMovilAbierto(false)} />
      </aside>

      {/* Overlay móvil */}
      {sidebarMovilAbierto && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setSidebarMovilAbierto(false)}
        />
      )}

      {/* Sidebar móvil */}
      {sidebarMovilAbierto && (
        <aside className="fixed left-0 top-0 bottom-0 z-40 w-64 md:hidden">
          <Sidebar onCerrar={() => setSidebarMovilAbierto(false)} />
        </aside>
      )}

      {/* Contenido principal */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header onAbrirMenu={() => setSidebarMovilAbierto(true)} />
        <main className="flex-1 overflow-y-auto p-6 animate-fadeIn">
          <Outlet />
        </main>
        <footer className="text-center text-xs text-gray-400 py-2 border-t border-gray-200">
          CleanERP © {new Date().getFullYear()} - Vicente Aedo y Alanis Figueroa
        </footer>
      </div>
    </div>
  );
}
