// components/NavBar.jsx
import { Link, NavLink, useNavigate } from "react-router-dom";
import Logo from "../assets/Logo.jpg"
import { api } from '../lib/api';
import { useEffect, useRef, useState } from 'react';
import { LoaderCircle, Menu, X } from 'lucide-react';

const navItem = ({ isActive }) =>
  `min-h-11 flex items-center px-3 py-2 rounded-lg text-sm font-medium transition
   ${isActive
     ? "bg-white/10 text-white"
     : "text-white/80 hover:text-white hover:bg-white/10"}`;

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState(undefined);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState('');
  const logoutBusy = useRef(false);
  const navigate = useNavigate();
  const toggleRef = useRef(null);
  useEffect(() => {
    let changed = false;
    let active = true;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);
    const update = event => { changed = true; setSession(event.detail); };
    const expired = () => { changed = true; setSession(null); };
    window.addEventListener('gym-session-changed', update);
    window.addEventListener('gym-session-expired', expired);
    api('/auth/me', { signal: controller.signal })
      .then(value => { if (active && !changed) setSession(value); })
      .catch(() => { if (active && !changed) setSession(null); })
      .finally(() => clearTimeout(timer));
    return () => {
      active = false;
      clearTimeout(timer);
      controller.abort();
      window.removeEventListener('gym-session-changed', update);
      window.removeEventListener('gym-session-expired', expired);
    };
  }, []);
  useEffect(() => {
    if (!open) return;
    const onKey = event => {
      if (event.key === 'Escape') { setOpen(false); toggleRef.current?.focus(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);
  async function logout() {
    if (logoutBusy.current) return;
    logoutBusy.current = true;
    setLoggingOut(true);
    setLogoutError('');
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);
    try {
      await api('/auth/logout', { method: 'POST', signal: controller.signal });
      setOpen(false);
      navigate('/');
    } catch { setLogoutError('No se pudo confirmar el cierre de sesión. Intentá nuevamente.'); }
    finally { clearTimeout(timer); logoutBusy.current = false; setLoggingOut(false); }
  }
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#3a0b15]">
      <div className="max-w-7xl mx-auto p-4 flex flex-wrap items-center gap-3 lg:gap-5">
        <Link to="/" onClick={() => setOpen(false)} className="flex items-center gap-3 min-w-0 font-bold text-white">
         <img
            src={Logo}
            alt="Primal Strength"
            className="h-10 w-10 rounded-full object-cover shadow-sm ring-1 ring-white/20"
            loading="eager"
          />
          <span>Primal Strength</span>
        </Link>
        <button ref={toggleRef} type="button" aria-controls="main-navigation" aria-expanded={open} aria-label={open ? 'Cerrar menú' : 'Abrir menú'} onClick={() => setOpen(value => !value)} className="ml-auto flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-white/20 text-white lg:hidden">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
        <nav id="main-navigation" aria-label="Navegación principal" className={`${open ? 'flex' : 'hidden'} w-full flex-col gap-1 border-t border-white/15 pt-3 lg:ml-auto lg:flex lg:w-auto lg:flex-row lg:border-0 lg:pt-0`}>
          <NavLink to="/admin/create" onClick={() => setOpen(false)} className={navItem}>Crear socio</NavLink>
          <NavLink to="/admin/find" onClick={() => setOpen(false)} className={navItem}>Buscar socio</NavLink>
          <NavLink to="/clientes" onClick={() => setOpen(false)} className={navItem}>Socios</NavLink>
          <a href="/nfc" target="primal-nfc" rel="noopener noreferrer" onClick={() => setOpen(false)} className="min-h-11 flex items-center px-3 py-2 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/10" title="Abrir el lector en una pestaña aparte para el monitor de recepción">Ingreso NFC ↗<span className="sr-only"> (abre en otra pestaña)</span></a>
          {loggingOut || session === undefined ? (
            <button type="button" disabled aria-busy="true" className="min-h-11 flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-white/70 cursor-wait">
              <LoaderCircle size={16} className="motion-safe:animate-spin" aria-hidden="true" /><span role="status">{loggingOut ? 'Cerrando…' : 'Comprobando…'}</span>
            </button>
          ) : session ? (
            <button type="button" onClick={logout} className="min-h-11 rounded-lg px-3 py-2 text-left text-sm font-medium text-white/90 hover:bg-white/10">Cerrar sesión</button>
          ) : (
            <NavLink to="/admin/create" onClick={() => setOpen(false)} className={navItem}>Iniciar sesión</NavLink>
          )}
        </nav>
        {logoutError && <p role="alert" className="w-full text-sm text-red-200">{logoutError}</p>}
      </div>
    </header>
  );
}
