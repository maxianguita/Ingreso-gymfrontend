import { API_BASE, authenticatedFetch as fetch } from "../lib/api";
import { Link } from 'react-router-dom';
// src/pages/AdminCreate.jsx
import { useEffect, useMemo, useState } from "react";
import logo from "../assets/Logo.jpg";
import { UserPlus, Hash, User, Mail, Phone, MapPin, Copy, Check, X, ShieldCheck } from "lucide-react";

const initial = { dni: "", name: "", email: "", phone: "", address: "" };
const emailOk = (s) => !s || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

export default function AdminCreate() {
  const [form, setForm] = useState(initial);
  const [created, setCreated] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const dniDigits = (form.dni || "").replace(/\D/g, "");
  const validDni = dniDigits.length >= 7 && dniDigits.length <= 9;
  const validName = (form.name || "").trim().length >= 3;
  const validEmail = emailOk(form.email);
  const canSubmit = validDni && validName && validEmail && !loading;

  const miPaseUrl = useMemo(
    () => (created?.qr_token ? `${window.location.origin}/pases?t=${created.qr_token}` : ""),
    [created]
  );

  function onChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function onSubmit(e) {
    e?.preventDefault();
    if (!canSubmit) return;
    setErr("");
    setCreated(null);
    setLoading(true);
    try {
      const payload = {
        dni: dniDigits,
        name: form.name.trim(),
        ...(form.email ? { email: form.email.trim() } : {}),
        ...(form.phone ? { phone: form.phone.trim() } : {}),
        ...(form.address ? { address: form.address.trim() } : {}),
      };

      const resp = await fetch(`${API_BASE}/api/clients`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await resp.text();
      let data;
      try { data = JSON.parse(text); } catch { data = null; }
      if (!resp.ok) throw new Error(data?.error || `HTTP ${resp.status}`);

      setCreated(data);
      setShowModal(true);
      setForm(initial);
    } catch (e2) {
      setErr(e2.message || "No se pudo crear el socio");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setShowModal(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  async function onCopyLink() {
    if (!miPaseUrl) return;
    try {
      await navigator.clipboard.writeText(miPaseUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* La operación opcional no impide continuar. */ }
  }

  return (
    <section className="relative min-h-screen bg-[#0a0a0a] pb-20 overflow-hidden">
      {/* Fondo Logo Mosaico */}
      <div className="absolute inset-0 pointer-events-none grayscale opacity-10"
        style={{ backgroundImage: `url(${logo})`, backgroundSize: "180px", backgroundRepeat: "repeat" }} />

      <div className="relative z-10 max-w-2xl mx-auto px-6 pt-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <div className="p-3 bg-red-600 rounded-2xl text-white shadow-lg shadow-red-600/20">
            <UserPlus size={24}/>
          </div>
          <div>
            <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">Nuevo Socio</h1>
            <p className="text-gray-400 font-medium text-sm">Registrá un nuevo socio en el sistema.</p>
          </div>
        </div>

        {/* Formulario Estilizado */}
        <div className="bg-[#111]/80 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative">

          <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* DNI */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">DNI (Obligatorio)</label>
                <div className="relative">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    name="dni" value={form.dni} onChange={onChange} inputMode="numeric"
                    placeholder="22333444"
                    className={`w-full bg-black/40 border rounded-2xl py-4 pl-12 pr-4 text-white outline-none transition-all placeholder:text-gray-700 font-bold
                      ${!form.dni ? "border-white/10" : validDni ? "border-emerald-500/50" : "border-rose-500/50"}`}
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Nombre */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Nombre Completo</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    name="name" value={form.name} onChange={onChange}
                    placeholder="JUAN PEREZ"
                    className={`w-full bg-black/40 border rounded-2xl py-4 pl-12 pr-4 text-white uppercase outline-none transition-all placeholder:text-gray-700 font-bold
                      ${!form.name ? "border-white/10" : validName ? "border-emerald-500/50" : "border-rose-500/50"}`}
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    name="email" value={form.email} onChange={onChange}
                    placeholder="socio@gym.com"
                    className={`w-full bg-black/40 border rounded-2xl py-4 pl-12 pr-4 text-white outline-none transition-all placeholder:text-gray-700 font-bold
                      ${!form.email ? "border-white/10" : validEmail ? "border-emerald-500/50" : "border-rose-500/50"}`}
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Teléfono */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Teléfono</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    name="phone" value={form.phone} onChange={onChange} inputMode="tel"
                    placeholder="+54 9..."
                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-white/30 transition-all placeholder:text-gray-700 font-bold"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Dirección */}
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Dirección / Notas</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    name="address" value={form.address} onChange={onChange}
                    placeholder="Av. Principal 123..."
                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-white/30 transition-all placeholder:text-gray-700 font-bold"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {err && (
              <div className="p-4 rounded-xl bg-rose-600/10 border border-rose-600/20 text-rose-500 text-xs font-bold uppercase tracking-widest text-center">
                {err}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-red-500 transition-all shadow-xl shadow-red-600/20 active:scale-95 disabled:opacity-30 flex items-center justify-center gap-2"
                disabled={!canSubmit}
              >
                {loading ? "Procesando..." : "Registrar Socio"}
              </button>
              <button
                type="button" onClick={() => setForm(initial)}
                className="px-8 py-4 bg-white/5 text-gray-400 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all"
                disabled={loading}
              >
                Limpiar
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal de Éxito Refinado */}
      {showModal && created && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-sm bg-[#111] border border-white/10 rounded-[3rem] p-8 text-center shadow-2xl animate-in fade-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-emerald-600/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/10">
              <ShieldCheck size={40} />
            </div>

            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-1">¡Registro Exitoso!</h2>
            <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-8">{created.name}</p>

            <div className="space-y-3">
              <Link to={`/socios/${created.id}?tab=payments&renew=0`} className="flex min-h-11 items-center justify-center rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white hover:bg-emerald-600">Registrar primer pago</Link>
              <button
                onClick={onCopyLink}
                className="w-full py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-gray-200 transition-all"
              >
                {copied ? <><Check size={14}/> Copiado</> : <><Copy size={14}/> Copiar Link de Acceso</>}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="w-full py-4 bg-white/5 text-gray-400 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all flex items-center justify-center gap-2"
              >
                <X size={14}/> Cerrar Ventana
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
