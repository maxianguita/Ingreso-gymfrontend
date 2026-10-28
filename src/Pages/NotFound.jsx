// src/pages/NotFound.jsx
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] grid place-items-center">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-extrabold">404</h1>
        <p className="text-slate-600">La página que buscás no existe.</p>

        <div className="flex flex-wrap gap-2 justify-center">
          <Link to="/" className="px-4 py-2 rounded-xl bg-black text-white">Ir al inicio</Link>
          <Link to="/admin/create" className="px-4 py-2 rounded-xl border border-slate-200">Crear cliente</Link>
          <Link to="/admin/find" className="px-4 py-2 rounded-xl border border-slate-200">Buscar por DNI</Link>
          <Link to="/pases" className="px-4 py-2 rounded-xl border border-slate-200">Mi Pase</Link>
        </div>
      </div>
    </div>
  );
}
