import { API_BASE, authenticatedFetch as fetch } from "../lib/api";
import { Link } from 'react-router-dom';
// src/pages/Clients.jsx
import { useEffect, useRef, useState } from "react";
import logo from "../assets/Logo.jpg";
import { Search, UserMinus, RefreshCcw, Trash2, Users, Calendar } from "lucide-react";

/* ---------------------- Helpers de formato ---------------------- */
function fmtHard(dateStr) {
  if (!dateStr || typeof dateStr !== "string") return "-";
  const iso = dateStr.includes("T") ? dateStr.slice(0, 10) : dateStr;
  const [y, m, d] = iso.split("-");
  if (y && m && d) return `${d}/${m}/${y}`;
  return iso;
}

function daysLeftFromISO(iso) {
  if (!iso || typeof iso !== "string") return null;
  const d = new Date(iso.slice(0, 10));
  const today = new Date();
  d.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((d - today) / (1000 * 60 * 60 * 24));
  return diff;
}

function toneFromDays(left) {
  if (left == null) return "default";
  if (left < 0) return "off";
  if (left <= 7) return "warn";
  return "ok";
}

function useDebounced(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

/* ---------------------- Estilos utilitarios ---------------------- */
const rowTone = {
  ok: "border-l-4 border-emerald-500",
  warn: "border-l-4 border-amber-500",
  off: "border-l-4 border-rose-600",
  default: "border-l-4 border-slate-500",
};

const chipTone = {
  ok: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  warn: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  off: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
  default: "bg-slate-500/10 text-slate-400 border border-slate-500/20",
};

function Chip({ tone = "default", className = "", children }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-black uppercase tracking-widest ${chipTone[tone] || chipTone.default} ${className}`}>
      {children}
    </span>
  );
}

/* ---------------------- UI: SearchBar con filtros ---------------------- */
function SearchBar({ value, onChange, loading, filter, setFilter, onClear, results }) {
  const inputRef = useRef(null);

  return (
    <div className="space-y-4">
      <div className="relative w-full">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          <Search size={18} className={loading ? "animate-pulse" : ""} />
        </div>
        <input
          ref={inputRef}
          className="w-full rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md pl-12 pr-12 py-4 text-sm text-white outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all placeholder:text-gray-400 font-medium"
          placeholder="Buscar socio por DNI o nombre..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {value && (
          <button type="button" aria-label="Limpiar búsqueda" onClick={onClear} className="absolute right-2 top-1/2 -translate-y-1/2 min-h-11 min-w-11 text-gray-400 hover:text-white transition-colors">
            ✕
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <FilterPill active={filter === "all"} onClick={() => setFilter("all")}>Todos ({results?.all ?? 0})</FilterPill>
        <FilterPill tone="ok" active={filter === "ok"} onClick={() => setFilter("ok")}>Vigentes</FilterPill>
        <FilterPill tone="warn" active={filter === "warn"} onClick={() => setFilter("warn")}>Por vencer</FilterPill>
        <FilterPill tone="off" active={filter === "off"} onClick={() => setFilter("off")}>Vencidos</FilterPill>
        <FilterPill active={filter === 'paused'} onClick={() => setFilter('paused')}>Pausados</FilterPill>
      </div>
    </div>
  );
}

function FilterPill({ active = false, onClick, children, tone = "all" }) {
  const tones = {
    all: active ? "bg-white text-black" : "bg-white/5 text-gray-400 border-white/5",
    ok: active ? "bg-emerald-600 text-white" : "bg-emerald-600/10 text-emerald-500 border-emerald-600/20",
    warn: active ? "bg-amber-600 text-white" : "bg-amber-600/10 text-amber-500 border-amber-600/20",
    off: active ? "bg-rose-600 text-white" : "bg-rose-600/10 text-rose-500 border-rose-600/20",
  };

  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border transition-all active:scale-95 ${tones[tone]}`}
    >
      {children}
    </button>
  );
}

/* ---------------------- Modal de confirmación ---------------------- */
function ConfirmDialog({ open, title, description, confirmText = "Eliminar", onCancel, onConfirm, busy = false }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-sm rounded-[2rem] bg-[#111] border border-white/10 p-8 text-center shadow-2xl">
        <div className="w-16 h-16 bg-rose-600/20 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trash2 size={32} />
        </div>
        <h2 className="text-xl font-black text-white uppercase italic tracking-tighter mb-2">{title}</h2>
        <p className="text-gray-400 text-sm mb-8 leading-relaxed">{description}</p>
        <div className="flex flex-col gap-2">
          <button
            onClick={onConfirm}
            disabled={busy}
            className="w-full py-4 rounded-xl bg-rose-600 text-white font-black uppercase tracking-widest text-xs hover:bg-rose-500 transition-colors disabled:opacity-50"
          >
            {busy ? "Procesando..." : confirmText}
          </button>
          <button
            onClick={onCancel}
            disabled={busy}
            className="w-full py-4 rounded-xl bg-white/5 text-gray-400 font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------- Página Principal ---------------------- */
export default function Clients() {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const debouncedQ = useDebounced(search, 300);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState({ all: 0, ok: 0, warn: 0, off: 0 });
  const [reload, setReload] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [toast, setToast] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [targetClient, setTargetClient] = useState(null);

  const limit = 12;
  const api = API_BASE;

  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    setErr("");
    (async () => {
      try {
        const url = new URL(`${api}/api/clients`);
        url.searchParams.set("page", page);
        url.searchParams.set("limit", limit);
        url.searchParams.set("filter", filter);
        if (debouncedQ) url.searchParams.set("q", debouncedQ);
        const res = await fetch(url, { signal: ctrl.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (ctrl.signal.aborted) return;
        const lastPage = Math.max(1, Math.ceil(Number(json.total ?? 0) / limit));
        if (page > lastPage) { setPage(lastPage); return; }
        setRows(Array.isArray(json.data) ? json.data : []);
        setTotal(Number(json.total ?? 0));
        setCounts(json.counts ?? { all: 0, ok: 0, warn: 0, off: 0 });
      } catch (e) {
        if (e.name !== 'AbortError') setErr("Error al conectar con el servidor.");
      } finally {
        if (!ctrl.signal.aborted) setLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, [api, page, debouncedQ, filter, reload]);

  useEffect(() => { setPage(1); }, [debouncedQ]);

  function renewClient(id) { window.location.assign(`/socios/${id}?tab=payments&renew=30`); }

  async function deleteClient(id) {
    try {
      setDeletingId(id);
      const res = await fetch(`${api}/api/clients/${id}`, { method: "DELETE" });
      if (!res.ok) { const error = await res.json(); throw new Error(error.error || "Error al eliminar"); }
      setRows(prev => prev.filter(r => r.id !== id));
      setTotal(t => Math.max(0, t - 1));
      setReload(value => value + 1);
      setToast(`Socio eliminado`);
      setTimeout(() => setToast(null), 2000);
    } catch (e) { setErr(e.message); } finally {
      setDeletingId(null);
      setConfirmOpen(false);
      setTargetClient(null);
    }
  }

  return (
    <section className="relative min-h-screen bg-[#0a0a0a] pb-20">
      {/* Fondo Logo Mosaico */}
      <div className="absolute inset-0 pointer-events-none grayscale opacity-10"
        style={{ backgroundImage: `url(${logo})`, backgroundSize: "180px", backgroundRepeat: "repeat" }} />

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-10 space-y-8">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-red-600 rounded-lg text-white"><Users size={20}/></div>
              <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">Socios</h1>
            </div>
            <p className="text-gray-400 font-medium">Panel central de gestión y control de estados.</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-3">
             <span className="text-white font-black text-2xl tracking-tighter">{counts.all}</span>
             <span className="text-gray-400 text-xs font-black uppercase tracking-widest ml-2">Registrados</span>
          </div>
        </div>

        <SearchBar
          value={search} onChange={setSearch} loading={loading}
          filter={filter} setFilter={value => { setFilter(value); setPage(1); }}
          onClear={() => { setSearch(""); setPage(1); }} results={counts}
        />

        {err && <p role="alert" className="text-rose-400">{err}</p>}
        {/* Tabla Estilizada */}
        <div className="rounded-3xl border border-white/10 bg-[#111]/80 backdrop-blur-xl shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 border-b border-white/10">
                  <th className="p-5 text-xs font-black uppercase tracking-widest text-gray-400">Socio / DNI</th>
                  <th className="p-5 text-xs font-black uppercase tracking-widest text-gray-400">Período</th>
                  <th className="p-5 text-xs font-black uppercase tracking-widest text-gray-400">Estado</th>
                  <th className="p-5 text-xs font-black uppercase tracking-widest text-gray-400 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={4} className="p-8 bg-white/[0.02]" />
                    </tr>
                  ))
                ) : rows.length === 0 ? (
                  <tr><td colSpan={4} className="p-8 text-center text-gray-400">No se encontraron socios.</td></tr>
                ) : rows.map((c) => {
                  const left = Number.isFinite(c.days_left) ? c.days_left : daysLeftFromISO(c.end_date);
                  const tone = c.is_paused ? 'default' : toneFromDays(left);
                  return (
                    <tr key={c.id} className={`hover:bg-white/[0.03] transition-colors ${rowTone[tone]}`}>
                      <td className="p-5">
                        <Link to={`/socios/${c.id}`} className="font-black text-white uppercase italic tracking-tight hover:underline">{c.name}</Link>
                        <div className="text-xs font-mono text-gray-400 mt-1">ID: {c.dni}</div>
                      </td>
                      <td className="p-5">
                        <div className="flex items-center gap-2 text-gray-300 text-xs font-bold">
                          <Calendar size={12} className="text-gray-600"/>
                          {fmtHard(c.start_date)} — {fmtHard(c.end_date)}
                        </div>
                      </td>
                      <td className="p-5">
                        <Chip tone={tone}>
                          {c.is_paused ? 'Pausado' : c.is_active === false && left >= 0 ? 'Inactivo' : tone === "ok" ? "Vigente" : tone === "warn" ? (left === 0 ? "Vence hoy" : `Vence en ${left} días`) : tone === "off" ? "Vencido" : "Sin información"}
                        </Chip>
                      </td>
                      <td className="p-5">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/socios/${c.id}`} className="inline-flex min-h-11 items-center rounded-xl border border-white/20 px-3 text-sm text-white hover:bg-white/10">Ver ficha</Link>
                          {tone !== "ok" && (
                            <button
                              onClick={() => renewClient(c.id)}

                              className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 p-2.5 rounded-xl bg-emerald-600/10 text-emerald-400 hover:bg-emerald-700 hover:text-white transition-all border border-emerald-500/20 disabled:opacity-50"
                              title="Registrar pago y renovar"
                              aria-label={`Renovar membresía de ${c.name} por 30 días`}
                            >
                              <RefreshCcw size={16}/>
                              <span className="hidden text-sm font-semibold lg:inline">Renovar</span>
                            </button>
                          )}
                          <button
                            onClick={() => { setTargetClient(c); setConfirmOpen(true); }}
                            className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 p-2.5 rounded-xl bg-rose-600/10 text-rose-400 hover:bg-rose-700 hover:text-white transition-all border border-rose-500/20"
                            title="Eliminar"
                            aria-label={`Eliminar socio ${c.name}`}
                          >
                            <Trash2 size={16}/>
                            <span className="hidden text-sm font-semibold lg:inline">Eliminar</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-6 bg-white/[0.02] flex items-center justify-between border-t border-white/5">
            <span className="text-xs font-black uppercase text-gray-400 tracking-widest">Página {page}</span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={loading || page === 1}
                className="px-4 py-2 rounded-xl bg-white/5 text-white text-xs font-bold border border-white/10 disabled:opacity-30 hover:bg-white/10 transition-all"
              >
                Anterior
              </button>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={loading || page * limit >= total}
                className="px-4 py-2 rounded-xl bg-white/5 text-white text-xs font-bold border border-white/10 disabled:opacity-30 hover:bg-white/10 transition-all"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Popups */}
      {toast && (
        <div className="fixed bottom-10 right-10 z-[100] bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl font-black uppercase italic tracking-widest text-xs animate-in slide-in-from-right-10">
          {toast}
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="Eliminar Socio"
        description={`¿Estás seguro de que deseas eliminar a ${targetClient?.name}? Se perderán todos sus registros de acceso.`}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => deleteClient(targetClient.id)}
        busy={!!deletingId}
      />
    </section>
  );
}
