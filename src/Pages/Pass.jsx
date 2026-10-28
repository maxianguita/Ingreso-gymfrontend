import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api';
import Badge from '../components/Badge';
import { CheckCircle2, AlertCircle, RefreshCw, Ticket } from 'lucide-react';

export default function MyPass() {
  const [token, setToken] = useState('');
  const [resu, setResu] = useState(null);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setResu(null);
    setErr(null);
    try {
      const r = await api(`/api/clients/pass?token=${encodeURIComponent(token)}`);
      setResu(r);
      if (navigator.vibrate) navigator.vibrate(30);
    } catch (e) {
      setErr(e.data?.message || e.message);
      if (navigator.vibrate) navigator.vibrate([120,80,120]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    const url = new URL(window.location.href);
    const t = url.searchParams.get('t');
    if (t) { setToken(t); }
  }, []);

  useEffect(() => {
    if (token) { load(); }
  }, [token, load]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      {/* Contenedor Principal */}
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden border border-gray-100">

        {/* Header Decorativo */}
        <div className="bg-[#0f172a] p-8 text-center relative">
          <div className="absolute top-4 right-6 opacity-10">
            <Ticket size={80} color="white" />
          </div>
          <h2 className="text-white text-xs uppercase tracking-[0.3em] font-black opacity-60 mb-1">Pase Digital</h2>
          <h1 className="text-white text-2xl font-black italic uppercase tracking-tighter">Gym Pass</h1>
        </div>

        <div className="p-8">
          {!resu && !err && !loading && (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-gray-300">
                <Ticket className="text-gray-600" />
              </div>
              <p className="text-gray-500 text-sm mb-6">Ingresá tu código de acceso para verificar tu estado</p>
            </div>
          )}

          {/* Input Area - Más elegante */}
          <div className="flex flex-col gap-3 mb-8">
            <div className="relative">
              <input
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 text-sm font-mono focus:border-red-500 outline-none transition-all"
                placeholder="Pegar código de acceso..."
                value={token}
                onChange={e=>setToken(e.target.value)}
              />
            </div>
            <button
              className={`w-full rounded-2xl py-4 font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-2 ${
                loading ? 'bg-gray-400' : 'bg-red-600 hover:bg-red-700 active:scale-95 shadow-lg shadow-red-200'
              } text-white`}
              onClick={load}
              disabled={loading}
            >
              {loading ? <RefreshCw className="animate-spin" size={18} /> : 'Consultar membresía'}
            </button>
          </div>

          {/* Error State */}
          {err && (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center gap-3 text-red-700 animate-shake">
              <AlertCircle className="shrink-0" />
              <p className="text-sm font-bold uppercase tracking-tight">{err}</p>
            </div>
          )}

          {/* Result State - Aquí está la "onda" */}
          {resu && (
            <div className="mt-2 animate-in fade-in zoom-in duration-300">
              <div className="flex flex-col items-center text-center">
                {resu.valid ? (
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600">
                    <CheckCircle2 size={48} strokeWidth={2.5} />
                  </div>
                ) : (
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-600">
                    <AlertCircle size={48} strokeWidth={2.5} />
                  </div>
                )}

                <h3 className="text-3xl font-black text-slate-900 uppercase italic leading-none">{resu.name}</h3>

                <div className="mt-6 w-full flex flex-col gap-2">
                    <div className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <span className="text-gray-600 text-xs font-black uppercase tracking-widest">Días restantes</span>
                        <span className="text-xl font-black text-slate-800">{resu.days_left}</span>
                    </div>
                    <div className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <span className="text-gray-600 text-xs font-black uppercase tracking-widest">Estado</span>
                        <Badge status={resu.status}/>
                    </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 text-center">
          <p className="text-xs text-gray-600 uppercase tracking-widest font-medium">Presentá esta pantalla en recepción si tenés dudas</p>
        </div>
      </div>
    </div>
  );
}
