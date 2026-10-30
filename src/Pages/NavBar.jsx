import { Link, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {
  Users, UserPlus, Search, ScanLine, LogOut, LogIn,
  Menu, X, LoaderCircle, ExternalLink,
} from "lucide-react";
import Logo from "../assets/Logo.jpg";
import { api } from "../lib/api";

const navigation = [
  { to: "/clientes", label: "Socios", icon: Users },
  { to: "/admin/find", label: "Buscar socio", icon: Search },
  { to: "/admin/create", label: "Nuevo socio", icon: UserPlus },
];

const navStyle = ({ isActive }) => [
  "flex min-h-11 items-center gap-2 rounded-lg px-3.5 py-2",
  "text-sm font-medium whitespace-nowrap transition-colors",
  isActive ? "bg-[#F8EEF1] text-[#78263D]" : "text-[#666666] hover:bg-[#F7F7F7] hover:text-[#222222]",
].join(" ");

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState(undefined);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const logoutBusy = useRef(false);
  const toggleRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    let changed = false;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);
    const onSessionChange = event => { changed = true; setSession(event.detail); };
    const onSessionExpired = () => { changed = true; setSession(null); };
    window.addEventListener("gym-session-changed", onSessionChange);
    window.addEventListener("gym-session-expired", onSessionExpired);
    api("/auth/me", { signal: controller.signal })
      .then(data => { if (active && !changed) setSession(data); })
      .catch(() => { if (active && !changed) setSession(null); })
      .finally(() => clearTimeout(timer));
    return () => {
      active = false;
      clearTimeout(timer);
      controller.abort();
      window.removeEventListener("gym-session-changed", onSessionChange);
      window.removeEventListener("gym-session-expired", onSessionExpired);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = event => {
      if (event.key === "Escape") { setOpen(false); toggleRef.current?.focus(); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  async function logout() {
    if (logoutBusy.current) return;
    logoutBusy.current = true;
    setLoggingOut(true);
    setLogoutError("");
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);
    try {
      // api publica el cambio de sesi?n solo cuando el servidor confirma el cierre.
      await api("/auth/logout", { method: "POST", signal: controller.signal });
      setOpen(false);
      navigate("/");
    } catch { setLogoutError("No se pudo confirmar el cierre de sesi?n. Intent? nuevamente."); }
    finally { clearTimeout(timer); logoutBusy.current = false; setLoggingOut(false); }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#EAEAEA] bg-white shadow-sm">
      <div className="mx-auto flex min-h-[76px] max-w-[1440px] flex-wrap items-center gap-4 px-5 lg:px-8">
        <Link to="/" onClick={() => setOpen(false)} className="flex shrink-0 items-center gap-3">
          <img src={Logo} alt="Primal Strength" className="h-11 w-11 rounded-xl object-cover" />
          <div className="flex flex-col">
            <span className="text-[13px] font-extrabold uppercase tracking-[0.08em] text-[#252525]">Primal Strength</span>
            <span className="mt-0.5 text-xs font-medium text-[#666666]">Panel de recepci?n</span>
          </div>
        </Link>
        <button ref={toggleRef} type="button" aria-controls="main-navigation" aria-expanded={open} aria-label={open ? "Cerrar men?" : "Abrir men?"} onClick={() => setOpen(value => !value)} className="ml-auto flex h-11 w-11 items-center justify-center rounded-lg border border-[#EAEAEA] text-[#333333] lg:hidden">
          {open ? <X size={21} /> : <Menu size={21} />}
        </button>
        <nav id="main-navigation" aria-label="Navegaci?n principal" className={[
          open ? "flex" : "hidden",
          "w-full flex-col gap-1 border-t border-[#EEEEEE] pb-4 pt-4",
          "lg:ml-auto lg:flex lg:w-auto lg:flex-row lg:items-center lg:gap-1 lg:border-none lg:pb-0 lg:pt-0",
        ].join(" ")}>
          {navigation.map(item => (
            <NavLink key={item.to} to={item.to} onClick={() => setOpen(false)} className={navStyle}>
              <item.icon size={17} strokeWidth={1.8} aria-hidden="true" />{item.label}
            </NavLink>
          ))}
          <div aria-hidden="true" className="my-2 h-px bg-[#EAEAEA] lg:mx-3 lg:my-0 lg:h-7 lg:w-px" />
          <a href="/nfc" target="primal-nfc" rel="noopener noreferrer" onClick={() => setOpen(false)} title="Abrir lector NFC de recepci?n en otra pesta?a" className="flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#78263D] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#622033]">
            <ScanLine size={18} strokeWidth={1.8} aria-hidden="true" />Ingreso NFC<ExternalLink size={13} className="opacity-70" aria-hidden="true" /><span className="sr-only"> (abre en otra pesta?a)</span>
          </a>
          <div aria-hidden="true" className="my-2 h-px bg-[#EAEAEA] lg:mx-2 lg:my-0 lg:h-7 lg:w-px" />
          {loggingOut || session === undefined ? (
            <button type="button" disabled role="status" aria-busy="true" className="flex min-h-11 items-center gap-2 px-3 text-sm text-[#666666] cursor-wait">
              <LoaderCircle size={17} className="motion-safe:animate-spin" aria-hidden="true" />{loggingOut ? "Cerrando..." : "Comprobando..."}
            </button>
          ) : session ? (
            <button type="button" onClick={logout} className="flex min-h-11 items-center gap-2 rounded-lg px-3 text-left text-sm font-medium text-[#666666] transition-colors hover:bg-[#FFF1F1] hover:text-[#A33444]">
              <LogOut size={18} strokeWidth={1.8} aria-hidden="true" />Salir
            </button>
          ) : (
            <NavLink to="/admin/create" onClick={() => setOpen(false)} className={navStyle}>
              <LogIn size={18} strokeWidth={1.8} aria-hidden="true" />Iniciar sesi?n
            </NavLink>
          )}
        </nav>
        {logoutError && <p role="alert" className="w-full pb-3 text-sm text-red-600">{logoutError}</p>}
      </div>
    </header>
  );
}
