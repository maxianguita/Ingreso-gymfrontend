
import "./NfcCheck.css";
import DumbbellBackground from '../components/DumbbellBackground';
import {
  Check,
  AlertTriangle,
  Radio,
  ArrowRight,
  LoaderCircle,
} from "lucide-react";
import {
  API_BASE,
  authenticatedFetch as fetch,
} from "../lib/api";
import { useEffect, useRef, useState } from "react";

import sfxOk from "../sound/success.mp3";
import sfxErr from "../sound/err.wav";

function fmtDate(dateStr) {
  if (!dateStr || typeof dateStr !== "string") return "-";

  const iso = dateStr.includes("T")
    ? dateStr.slice(0, 10)
    : dateStr;

  const [y, m, d] = iso.split("-");

  if (y && m && d) return `${d}/${m}/${y}`;
  return iso;
}

export default function NfcCheck() {
  const [uid, setUid] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [result, setResult] = useState(null);

  const inputRef = useRef(null);
  const scanBusy = useRef(false);
  const okRef = useRef(null);
  const errRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (loading || (!result && !err)) return;

    const timer = setTimeout(() => {
      setResult(null);
      setErr("");
      inputRef.current?.focus();
    }, 12000);

    return () => clearTimeout(timer);
  }, [loading, result, err]);

  // Activa audio tras una interacción, si el navegador lo permite.
  function unlockAudio() {
    [okRef, errRef].forEach((ref) => {
      const el = ref.current;
      if (!el || el.dataset.unlocked === "true") return;

      try {
        el.muted = true;
        const playback = el.play();

        if (playback) {
          playback
            .then(() => {
              el.pause();
              el.currentTime = 0;
              el.muted = false;
              el.dataset.unlocked = "true";
            })
            .catch(() => {
              el.muted = false;
            });
        }
      } catch {
        el.muted = false;
      }
    });
  }

  function play(ref) {
    const el = ref.current;
    if (!el) return;

    try {
      el.muted = false;
      el.currentTime = 0;
      el.play().catch(() => {});
    } catch {
      // El bloqueo de audio no interrumpe el ingreso.
    }
  }

  function playOk() {
    play(okRef);
  }

  function playError() {
    play(errRef);
  }

  function vibrate(ms) {
    if (navigator.vibrate) navigator.vibrate(ms);
  }

  async function onScan() {
    if (scanBusy.current) return;

    unlockAudio();
    setErr("");
    setResult(null);

    const clean = uid.trim().toUpperCase();

    if (!/^[0-9A-F]+$/.test(clean)) {
      setErr("Ingresá un código válido o acercá un llavero RFID.");
      playError();
      return;
    }

    scanBusy.current = true;
    setLoading(true);

    try {
      const resp = await fetch(
        `${API_BASE}/api/clients/scan-nfc`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ uid: clean }),
        }
      );

      const data = await resp.json().catch(() => ({}));

      if (!resp.ok) {
        const msg =
          data?.message ||
          data?.error ||
          `Error HTTP ${resp.status}`;

        setErr(
          typeof msg === "string"
            ? msg
            : "No se pudo registrar el ingreso."
        );

        if (resp.status === 403 && data?.client_id) {
          setResult(data);
        }

        playError();
        vibrate(120);
        return;
      }

      setResult(data);

      if (["ok", "warning"].includes(data.status)) {
        playOk();
        vibrate(60);
      } else {
        playError();
        vibrate(120);
      }
    } catch (e) {
      setErr(e.message || "No se pudo escanear.");
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
    if (e.key === "Enter") {
      e.preventDefault();
      onScan();
    }
  }

  const denied =
    Boolean(err) ||
    Boolean(result && !["ok", "warning", "danger"].includes(result.status));

  const expiring =
    result && ["warning", "danger"].includes(result.status);

  const state = loading
    ? "loading"
    : denied
      ? "error"
      : result
        ? expiring
          ? "warning"
          : "success"
        : "idle";

  const StatusIcon = loading
    ? LoaderCircle
    : denied
      ? AlertTriangle
      : result
        ? Check
        : Radio;

  return (
    <main
      className={`gym-entry gym-entry--${state}`}
      onPointerDown={unlockAudio}
    >
      <DumbbellBackground state={state} />
      {/* ENCABEZADO PÚBLICO */}
      {/* <header className="entry-header">
        <div className="entry-brand">
          <img src={logo} alt="Primal Strength" />

          <div>
            <strong>PRIMAL STRENGTH</strong>
            <span>CONTROL DE INGRESO</span>
          </div>
        </div>
      </header> */}

      <section className="entry-content">
        <div className="entry-intro">
          <span className="entry-eyebrow">
            TU ENTRENAMIENTO EMPIEZA ACÁ
          </span>

          <h1>
            Bienvenido a <em>Primal Strength.</em>
          </h1>

          <p>
            Acercá tu llavero al lector para registrar tu ingreso.
          </p>
        </div>

        {/* PANEL DE ESTADO */}
        <div
          className="entry-panel"
          role="status"
          aria-live="polite"
          aria-atomic="true"
          aria-busy={loading}
        >
          <div className="entry-state-label">
            <span />
            {loading
              ? "VERIFICANDO PASE"
              : denied
                ? "REVISIÓN NECESARIA"
                : result
                  ? "LECTURA COMPLETADA"
                  : "ESPERANDO TU LLAVERO"}
          </div>

          <div
            className={`entry-symbol ${
              loading ? "entry-spin" : ""
            }`}
          >
            <StatusIcon size={44} strokeWidth={1.5} />
          </div>

          <h2>
            {loading
              ? "Un momento…"
              : denied
                ? result?.status === "expired"
                  ? "Tu pase está vencido"
                  : "No pudimos registrar tu ingreso"
                : result
                  ? "¡Buen entrenamiento!"
                  : "Acercá tu llavero"}
          </h2>

          <p className="entry-message">
            {loading
              ? "Estamos consultando tu membresía."
              : denied
                ? "Acercate a recepción para que podamos ayudarte."
                : result
                  ? "Tu ingreso quedó registrado."
                  : "Mantenelo cerca del lector hasta que aparezca tu confirmación."}
          </p>

          {result && (
            <div className="entry-member">
              <span>SOCIO</span>

              <h3>{result.name}</h3>

              <div className="entry-member-details">
                <div>
                  <span>ESTADO DEL PASE</span>
                  <strong>
                    {denied
                      ? result.status === "expired"
                        ? "Vencido"
                        : result.status === "paused" ? "Pausado" : "Inactivo"
                      : expiring
                        ? "Próximo a vencer"
                        : "Vigente"}
                  </strong>
                </div>

                <div>
                  <span>
                    {denied ? "VENCIMIENTO" : "DÍAS RESTANTES"}
                  </span>

                  <strong>
                    {denied
                      ? fmtDate(result.end_date)
                      : result.days_left}
                  </strong>
                </div>
              </div>

              {result.end_date && !denied && (
                <p>
                  Vigente hasta el {fmtDate(result.end_date)}
                </p>
              )}

              {expiring && !denied && (
                <p className="entry-reminder">
                  Recordá renovar tu pase en recepción.
                </p>
              )}
            </div>
          )}

          {err && (
            <p className="entry-error">{err}</p>
          )}

          {!loading && !result && !err && (
            <div className="entry-steps">
              <span>01 <b>Acercá</b></span>
              <i />
              <span>02 <b>Confirmá</b></span>
              <i />
              <span>03 <b>Entrená</b></span>
            </div>
          )}
        </div>

        {/* LECTOR NFC */}
        <form
          className="entry-reader"
          onSubmit={(e) => {
            e.preventDefault();
            onScan();
          }}
        >
          <label htmlFor="entry-code">
            Lector de llaveros
          </label>

          <div className="entry-reader-controls">
            <input
              id="entry-code"
              ref={inputRef}
              type="password"
              value={uid}
              onChange={(e) => setUid(e.target.value)}
              onKeyDown={onKey}
              disabled={loading}
              autoComplete="off"
              spellCheck={false}
              placeholder="Esperando lectura…"
            />

            <button
              type="submit"
              disabled={loading || !uid.trim()}
            >
              Ingresar
              <ArrowRight size={17} />
            </button>
          </div>
        </form>
      </section>

      {/* FOOTER PÚBLICO */}
      <footer className="entry-footer">
        <span>PRIMAL STRENGTH</span>
        <p>
          {result || err
            ? "La pantalla se prepara automáticamente para el próximo ingreso."
            : "¿Necesitás ayuda con tu pase? Acercate a recepción."}
        </p>
      </footer>

      {/* SONIDOS AUTOMÁTICOS, SIN CONTROL VISIBLE */}
      <audio ref={okRef} src={sfxOk} preload="auto" />
      <audio ref={errRef} src={sfxErr} preload="auto" />
    </main>
  );
}
