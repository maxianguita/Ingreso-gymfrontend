import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { api } from '../lib/api';
import logo from '../assets/Logo.jpg';

export default function RequireAccess({ role = 'admin' }) {
  const [session, setSession] = useState(null);
  const [checking, setChecking] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
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

  if (checking) return <p role="status" className="p-10 text-center">Comprobando acceso…</p>;
  if (session && (role === 'reception' || session.role === 'admin')) return <Outlet context={session} />;
  return (
    <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 text-white">
      <form onSubmit={login} className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#111] p-8 space-y-5">
        <img src={logo} alt="Primal Strength" className="w-24 mx-auto rounded-xl" />
        <h1 className="text-2xl font-bold">{role === 'admin' ? 'Administración' : 'Abrir recepción'}</h1>
        <p className="text-sm text-gray-400">{session?.role === 'reception' ? 'Ingresá nuevamente para administrar socios.' : 'Ingresá con tu usuario y contraseña.'}</p>
        <label className="block">Usuario<input autoComplete="username" required maxLength={40} value={username} onChange={e => setUsername(e.target.value)} className="block w-full mt-2 rounded-lg bg-black border border-white/20 p-3" /></label>
        <label className="block">Contraseña<input type="password" autoComplete="current-password" required maxLength={256} value={password} onChange={e => setPassword(e.target.value)} className="block w-full mt-2 rounded-lg bg-black border border-white/20 p-3" /></label>
        {error && <p role="alert" className="text-red-400">{error}</p>}
        <button disabled={busy} className="w-full rounded-lg bg-red-700 p-3 font-bold disabled:opacity-50">{busy ? 'Ingresando…' : 'Ingresar'}</button>
        <a href="/" className="block text-sm text-gray-400">Volver al inicio</a>
      </form>
    </main>
  );
}
