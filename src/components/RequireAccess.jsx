import { useEffect, useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { api } from '../lib/api';
import logo from '../assets/Logo.jpg';
import './RequireAccess.css';

export default function RequireAccess({ role = 'admin' }) {
  const [session, setSession] = useState(null);
  const [checking, setChecking] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  useEffect(() => {
    let active = true;
    api('/auth/me').then(value => { if (active) setSession(value); })
      .catch(error => { if (active && error.status !== 401) setError('No se pudo conectar con el servidor.'); })
      .finally(() => { if (active) setChecking(false); });
    const expired = () => { setSession(null); setPassword(''); };
    window.addEventListener('gym-session-expired', expired);
    return () => { active = false; window.removeEventListener('gym-session-expired', expired); };
  }, []);

  async function login(event) {
    event.preventDefault();
    setError(''); setBusy(true);
    try {
      setSession(await api('/auth/login', { method: 'POST', body: { username, password, role } }));
      setPassword('');
    } catch (error) { setError(error.message); }
    finally { setBusy(false); }
  }

  if (checking) return <main className={`primal-login ${role === 'reception' ? 'primal-login--fullscreen' : ''}`}><p role="status" className="primal-login-loading"><LoaderCircle size={18} aria-hidden="true" />Comprobando acceso…</p></main>;
  if (session && (role === 'reception' || session.role === 'admin')) return <Outlet context={session} />;
  return (
    <main className={`primal-login ${role === 'reception' ? 'primal-login--fullscreen' : ''}`}>
      <section className="primal-login-card" aria-labelledby="login-title">
        <div className="primal-login-brand"><img src={logo} alt="" width="44" height="44" /><span>PRIMAL STRENGTH</span></div>
        <header className="primal-login-intro">
          <p className="primal-login-eyebrow">{role === 'admin' ? 'Administración' : 'Recepción'}</p>
          <h1 id="login-title">Bienvenido de nuevo.</h1>
          <p>{session?.role === 'reception' ? 'Ingresá nuevamente para administrar socios.' : role === 'admin' ? 'Ingresá para gestionar tu gimnasio.' : 'Ingresá para habilitar el control de acceso.'}</p>
        </header>
        <form onSubmit={login} className="primal-login-form" aria-busy={busy}>
          <div className="primal-login-field">
            <label htmlFor="login-username">Usuario</label>
            <input id="login-username" name="username" autoComplete="username" autoCapitalize="none" spellCheck={false} required maxLength={40} value={username} onChange={e => setUsername(e.target.value)} disabled={busy} placeholder="Tu usuario" />
          </div>
          <div className="primal-login-field">
            <label htmlFor="login-password">Contraseña</label>
            <div className="primal-login-password">
              <input id="login-password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required maxLength={256} value={password} onChange={e => setPassword(e.target.value)} disabled={busy} placeholder="Tu contraseña" aria-describedby={error ? 'login-error' : undefined} />
              <button type="button" className="primal-login-reveal" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'} aria-pressed={showPassword} aria-controls="login-password" disabled={busy}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
            </div>
          </div>
          {error && <p id="login-error" role="alert" className="primal-login-error">{error}</p>}
          <button type="submit" disabled={busy} className="primal-login-submit"><span>{busy ? 'Ingresando…' : 'Ingresar'}</span>{busy ? <LoaderCircle size={17} className="primal-login-spinner" aria-hidden="true" /> : <ArrowRight size={17} aria-hidden="true" />}</button>
        </form>
        <Link to="/" className="primal-login-back"><ArrowLeft size={15} aria-hidden="true" />Volver al inicio</Link>
      </section>
    </main>
  );
}
