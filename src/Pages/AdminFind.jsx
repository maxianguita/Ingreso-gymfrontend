import { API_BASE, authenticatedFetch as fetch } from "../lib/api";
import { useState } from "react";
import { Link } from 'react-router-dom';
import Badge from "../components/Badge";
import logo from "../assets/Logo.jpg";
import { Search, Calendar, User, Hash, Zap } from "lucide-react"; // Importa iconos si los tienes


function fmtHard(dateStr, humanStr) {
  if (humanStr && typeof humanStr === "string") return humanStr;
  if (!dateStr || typeof dateStr !== "string") return "-";
  const iso = dateStr.includes("T") ? dateStr.slice(0, 10) : dateStr;
  const [y, m, d] = iso.split("-");
  if (y && m && d) return `${d}/${m}/${y}`;
  return iso;
}

export default function AdminFind() {
  const [dniFind, setDniFind] = useState("");
  const [tag, setTag] = useState("");
  const [binding, setBinding] = useState(false);
  const [boundTag, setBoundTag] = useState("");
  const [found, setFound] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [renewing, setRenewing] = useState(false);

  async function onFind() {
    setTag(""); setBoundTag("");
    setErr(""); setFound(null); setLoading(true);
    try {
      const digits = (dniFind || "").replace(/\D/g, "");
      if (digits.length < 7) throw new Error("Ingresá un DNI válido");
      const url = `${API_BASE}/api/clients/by-dni?dni=${digits}`;
      const resp = await fetch(url, { method: "GET", mode: "cors" });
      const text = await resp.text();
      let data = {};
      try { data = JSON.parse(text); } catch { /* La operación opcional no impide continuar. */ }
      if (!resp.ok) throw new Error(data?.error || `HTTP ${resp.status}`);
      if (!data || !data.dni) throw new Error("No encontrado");
      setFound(data);
    } catch (e) {
      setErr(e.message || "No se pudo buscar");
    } finally {
      setLoading(false);
    }
  }

  async function onRenew() {
    if (!found?.id) return;
    setErr(""); setRenewing(true);
    try {
      window.location.assign(`/socios/${found.id}?tab=payments&renew=30`);
    } catch (e) {
      setErr(e.message || "No se pudo renovar");
    } finally {
      setRenewing(false);
    }
  }

  async function onBind(event) {
    event.preventDefault();
    if (!found?.id || binding) return;
    setErr(""); setBinding(true);
    try {
      const uid = tag.trim();
      if (!/^[0-9a-f]+$/i.test(uid)) throw new Error("Código de llavero inválido");
      const response = await fetch(`${API_BASE}/api/clients/${found.id}/bind-nfc`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No se pudo vincular");
      setBoundTag(data.nfc_uid); setTag("");
    } catch (error) {
      setErr(error.message);
    } finally {
      setBinding(false);
    }
  }

  return (
    <section className="relative min-h-screen bg-[#0a0a0a] flex items-center justify-center overflow-hidden">

      {/* Fondo con Mosaico Estilizado */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-700"
        style={{
          backgroundImage: `url(${logo})`,
          backgroundRepeat: "repeat",
          backgroundSize: "180px 180px",
          opacity: 0.15, // Bajamos la opacidad para un look más premium
          filter: "grayscale(100%) brightness(0.5)",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/60 to-black" />

      <div className="relative z-10 w-full max-w-xl px-4">
        {/* Contenedor Principal con Glassmorphism */}
        <div className="bg-white/10 backdrop-blur-xl rounded-[2.5rem] border border-white/10 shadow-2xl p-8 md:p-10">

          <div className="text-center mb-8">
            <h2 className="text-white text-3xl font-black uppercase italic tracking-tighter">
              Admin <span className="text-red-600">Panel</span>
            </h2>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Gestión de Membresías</p>
          </div>

          {/* Formulario de Búsqueda */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <input
                className="w-full bg-black/40 border-2 border-white/5 rounded-2xl p-4 text-white placeholder:text-gray-400 outline-none focus:border-red-600 transition-all text-lg font-bold"
                placeholder="Ingresar DNI..."
                value={dniFind}
                onChange={(e) => setDniFind(e.target.value)}
                inputMode="numeric"
                disabled={loading}
                onKeyDown={(e) => e.key === "Enter" && onFind()}
              />
            </div>
            <button
              className="rounded-2xl px-8 py-4 bg-red-700 text-white font-black uppercase tracking-widest text-sm hover:bg-red-600 active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-red-900/20 flex items-center justify-center gap-2"
              onClick={onFind}
              disabled={loading}
            >
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Search size={18} />}
              {loading ? "..." : "Buscar"}
            </button>
          </div>

          {err && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl p-3 text-sm text-center font-bold mb-6">
              ⚠️ {err}
            </div>
          )}

          {/* Ficha del Socio Encontrado */}
          {found && (
            <div className="mt-8 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Link to={`/socios/${found.id}`} className="block rounded-xl border border-white/20 p-4 text-center font-semibold text-white hover:bg-white/10">Abrir ficha: editar, pagos, asistencias y llavero</Link>
              <form onSubmit={onBind} className="rounded-2xl bg-black/40 p-4 space-y-3 text-white">
                <label htmlFor="rfid-tag" className="block font-bold">Vincular o reemplazar llavero RFID</label>
                <p className="text-sm text-gray-400">Seleccioná el campo y acercá el llavero al lector. Enter guarda la vinculación con {found.name}.</p>
                <input id="rfid-tag" value={tag} onChange={(event) => setTag(event.target.value)} disabled={binding} autoComplete="off" placeholder="Código del llavero" className="w-full rounded-xl bg-black/40 border border-white/20 p-3" />
                <button type="submit" disabled={binding || !tag.trim()} className="rounded-xl bg-red-700 px-4 py-3 disabled:opacity-50">{binding ? "Guardando..." : "Vincular llavero"}</button>
                {boundTag && <p role="status" className="text-emerald-400">Llavero {boundTag} vinculado a {found.name}.</p>}
              </form>

              <div className="bg-white/5 rounded-3xl p-6 border border-white/5">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-red-700 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-red-900/40 rotate-3">
                    <User size={28} />
                  </div>
                  <div className="text-left">
                    <h3 className="text-white text-2xl font-black uppercase italic leading-none">{found.name}</h3>
                    <p className="text-gray-400 text-sm font-bold mt-1 tracking-tight italic">DNI: {found.dni}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-black/20 rounded-2xl p-4 border border-white/5">
                    <p className="text-xs text-gray-400 uppercase font-black mb-1">Desde</p>
                    <p className="text-white font-bold">{fmtHard(found.start_date, found.start_date_human)}</p>
                  </div>
                  <div className="bg-black/20 rounded-2xl p-4 border border-white/5">
                    <p className="text-xs text-gray-400 uppercase font-black mb-1">Hasta</p>
                    <p className="text-white font-bold">{fmtHard(found.end_date, found.end_date_human)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-black/40 rounded-2xl p-4 border border-white/10">
                  <div className="flex items-center gap-2">
                    <Zap size={16} className="text-red-500" />
                    <span className="text-white font-black text-xl">{found.days_left} <span className="text-xs text-gray-400 uppercase italic">días</span></span>
                  </div>
                  <Badge status={found.status} />
                </div>
              </div>

              {/* Botón Renovación - Diseño Destacado */}
              {(found.days_left <= 7 || found.status === "inactive") && (
                <button
                  onClick={onRenew}
                  disabled={renewing}
                  className="w-full group relative overflow-hidden rounded-2xl bg-emerald-600 p-5 text-white font-black uppercase tracking-widest text-sm transition-all hover:bg-emerald-500 active:scale-95 disabled:opacity-60 shadow-xl shadow-emerald-900/20"
                >
                  <div className="relative flex items-center justify-center gap-2">
                    {renewing ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <RefreshCw size={18} />}
                    {renewing ? "Procesando..." : "Renovar Suscripción"}
                  </div>
                </button>
              )}
            </div>
          )}
        </div>
      </div>


    </section>
  );
}

// Icono Refresh por si no tienes lucide (aunque lo puse en el botón)
function RefreshCw(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>
  );
}
