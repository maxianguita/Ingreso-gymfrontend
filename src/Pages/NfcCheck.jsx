import "./NfcCheck.css";
import { Check, AlertTriangle, Radio, Volume2, VolumeX, ArrowRight, LoaderCircle } from "lucide-react";
import { API_BASE, api, authenticatedFetch as fetch } from "../lib/api";
import { useEffect, useRef, useState } from "react";
import { Link, useOutletContext } from 'react-router-dom';
import logo from "../assets/Logo.jpg";

// 🎵 SOLO DOS SONIDOS
import sfxOk from "../sound/success.mp3";
import sfxErr from "../sound/err.wav";


// Fecha dd/mm/yyyy determinista
function fmtDate(dateStr) {
  if (!dateStr || typeof dateStr !== "string") return "-";
  const iso = dateStr.includes("T") ? dateStr.slice(0, 10) : dateStr;
  const [y, m, d] = iso.split("-");
  if (y && m && d) return `${d}/${m}/${y}`;
  return iso;
}

export default function NfcCheck() {
  const session = useOutletContext();
  const [locking, setLocking] = useState(false);
  const [closing, setClosing] = useState(false);
  const closeBusy = useRef(false);
  const [uid, setUid] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [result, setResult] = useState(null);
  const inputRef = useRef(null);
  const scanBusy = useRef(false);

  // 🔊 refs de audio (solo ok y error)
  const okRef = useRef(null);
  const errRef = useRef(null);
  const [muted, setMuted] = useState(false);

  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => {
    if (loading || (!result && !err)) return;
    const timer = setTimeout(() => { setResult(null); setErr(""); }, 12000);
    return () => clearTimeout(timer);
  }, [loading, result, err]);

  // iOS/Safari: desbloquear audio en el primer gesto
  const unlockAudio = () => {
    [okRef, errRef].forEach(r => {
      const el = r.current;
      if (!el) return;
      try {
        el.muted = true;
        el.play().then(() => {
          el.pause();
          el.currentTime = 0;
          el.muted = muted;
        }).catch(() => {});
      } catch { /* La operación opcional no impide continuar. */ }
    });
  };

  async function onScan() {
    if (scanBusy.current) return;
    unlockAudio();
    setErr("");
    setResult(null);
    const clean = uid.trim().toUpperCase();
    if (!/^[0-9A-F]+$/.test(clean)) { setErr("Ingresá un código válido o acercá un llavero RFID"); playError(); return; }

    scanBusy.current = true;
    setLoading(true);
    try {
      const resp = await fetch(`${API_BASE}/api/clients/scan-nfc`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: clean }),
      });

      const data = await resp.json().catch(() => ({}));

      if (!resp.ok) {
        const msg = data?.message || data?.error || `HTTP ${resp.status}`;
        setErr(msg);
        // Si vino info (403 vencido), la mostramos igual
        if (resp.status === 403 && data?.client_id) setResult(data);
        playError();
        vibrate(120);
        return;
      }

      setResult(data);

      // 🔔 Mapeo de estado -> sonido
      if (["ok", "warning", "danger"].includes(data.status)) {
        playOk();            // éxito para ok y warning
        vibrate(60);
      } else {
        // danger / expired / desconocido -> error
        playError();
        vibrate(120);
      }

      setUid("");
    } catch (e) {
      setErr(e.message || "No se pudo escanear");
      playError();
      vibrate(120);
    } finally {
      scanBusy.current = false;
      setUid("");
      setLoading(false);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }

  function onKey(e) {
    if (e.key === "Enter") { e.preventDefault(); onScan(); }
  }

  // 🔊 helpers
  function playOk()   { play(okRef); }
  function playError(){ play(errRef); }
  function play(ref) {
    const el = ref.current;
    if (!el || muted) return;
    try { el.currentTime = 0; el.play().catch(()=>{}); } catch { /* La operación opcional no impide continuar. */ }
  }

  // 📳 vibración (opcional)
  function vibrate(ms) {
    if (navigator.vibrate) navigator.vibrate(ms);
  }

  async function closeReception() {
    if (closeBusy.current) return;
    closeBusy.current = true;
    setClosing(true);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);
    try { await api('/auth/logout', { method: 'POST', signal: controller.signal }); window.location.assign('/'); }
    catch { setErr('No se pudo confirmar el cierre de sesión. Intentá nuevamente.'); }
    finally { clearTimeout(timer); closeBusy.current = false; setClosing(false); }
  }

  async function lockAdministration() {
    setLocking(true);
    try {
      await api('/auth/reception', { method: 'POST' });
      window.location.replace('/nfc');
    } catch {
      setLocking(false);
      setErr('No se pudo bloquear la administración. Intentá nuevamente.');
    }
  }

  const denied = Boolean(err);
  const expiring = result && ["warning", "danger"].includes(result.status);
  const state = loading ? "loading" : denied ? "error" : result ? (expiring ? "warning" : "success") : "idle";
  const StatusIcon = loading ? LoaderCircle : denied ? AlertTriangle : result ? Check : Radio;

  return (
    <main className={`gym-entry gym-entry--${state}`} onPointerDown={unlockAudio}>
      <header className="entry-header">
        <div className="entry-brand"><img src={logo} alt="Primal Strength" /><div><strong>PRIMAL STRENGTH</strong><span>CONTROL DE INGRESO</span></div></div>
        <button type="button" className="entry-sound" aria-label={muted ? "Activar sonido" : "Silenciar sonido"} aria-pressed={!muted} onClick={() => { setMuted(m => !m); inputRef.current?.focus(); }}>
          {muted ? <VolumeX size={19} /> : <Volume2 size={19} />}<span>{muted ? "Sonido desactivado" : "Sonido activado"}</span>
        </button>
      </header>

      <section className="entry-content">
        <div className="entry-intro"><span className="entry-eyebrow">TU ENTRENAMIENTO EMPIEZA ACÁ</span><h1>Bienvenido a <em>Primal.</em></h1><p>Acercá tu llavero al lector para registrar tu ingreso.</p></div>
        <div className="entry-panel" role="status" aria-live="polite" aria-atomic="true" aria-busy={loading}>
          <div className="entry-state-label"><span />{loading ? "VERIFICANDO PASE" : denied ? "REVISIÓN NECESARIA" : result ? "LECTURA COMPLETADA" : "ESPERANDO TU LLAVERO"}</div>
          <div className={`entry-symbol ${loading ? "entry-spin" : ""}`}><StatusIcon size={44} strokeWidth={1.5} /></div>
          <h2>{loading ? "Un momento…" : denied ? (result?.status === "expired" ? "Tu pase está vencido" : "No pudimos registrar tu ingreso") : result ? "¡Buen entrenamiento!" : "Acercá tu llavero"}</h2>
          <p className="entry-message">{loading ? "Estamos consultando tu membresía." : denied ? "Acercate a recepción para que podamos ayudarte." : result ? "Tu ingreso quedó registrado." : "Mantenelo cerca del lector hasta que aparezca tu confirmación."}</p>
          {result && <div className="entry-member"><span>SOCIO</span><h3>{result.name}</h3><div className="entry-member-details"><div><span>ESTADO DEL PASE</span><strong>{denied ? (result.status === "expired" ? "Vencido" : "Inactivo") : expiring ? "Próximo a vencer" : "Vigente"}</strong></div><div><span>{denied ? "VENCIMIENTO" : "DÍAS RESTANTES"}</span><strong>{denied ? fmtDate(result.end_date) : result.days_left}</strong></div></div>{result.end_date && !denied && <p>Vigente hasta el {fmtDate(result.end_date)}</p>}{expiring && !denied && <p className="entry-reminder">Recordá renovar tu pase en recepción.</p>}</div>}
          {err && <p className="entry-error">{err}</p>}
          {!loading && !result && !err && <div className="entry-steps"><span>01 <b>Acercá</b></span><i /><span>02 <b>Confirmá</b></span><i /><span>03 <b>Entrená</b></span></div>}
        </div>

        <form className="entry-reader" onSubmit={e => { e.preventDefault(); onScan(); }}>
          <label htmlFor="entry-code">Lector de llaveros</label><div className="entry-reader-controls"><input id="entry-code" ref={inputRef} type="password" value={uid} onChange={e => setUid(e.target.value)} onKeyDown={onKey} disabled={loading} autoComplete="off" spellCheck={false} placeholder="Esperando lectura…" /><button type="submit" disabled={loading || !uid.trim()}>Registrar <ArrowRight size={17} /></button></div>
        </form>
      </section>
      <footer className="entry-footer">
        <span>PRIMAL STRENGTH</span>
        <p>{result || err ? "La pantalla se prepara automáticamente para el próximo ingreso." : "¿Necesitás ayuda con tu pase? Acercate a recepción."}</p>
        <Link to="/admin/find">Volver a administración</Link>
        {session?.role === 'admin' && <button type="button" disabled={locking || loading || closing} onClick={lockAdministration} title="Mantiene el lector activo y pide la contraseña para volver a administrar socios">{locking ? 'Bloqueando…' : 'Bloquear administración'}</button>}
        <button type="button" onClick={closeReception} disabled={closing || locking} aria-busy={closing}>{closing && <LoaderCircle size={16} className="motion-safe:animate-spin" aria-hidden="true" />}<span role="status">{closing ? 'Cerrando…' : 'Cerrar sesión'}</span></button>
      </footer>
      <audio ref={okRef} src={sfxOk} preload="auto" /><audio ref={errRef} src={sfxErr} preload="auto" />
    </main>
  );
}
