import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { dateLabel, moneyLabel, timeLabel } from '../lib/management';
import './Management.css';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError('');
    api('/api/management/dashboard', { signal: controller.signal }).then(setData)
      .catch(error => { if (!controller.signal.aborted) setError(error.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [revision]);
  return <main className="gym-management"><div className="mg-container">
    <header className="mg-heading mg-heading-row"><div><p>PRIMAL STRENGTH</p><h1>Resumen de recepción</h1><span>{data ? dateLabel(data.date) : 'Estado del gimnasio'}</span></div><button disabled={loading} onClick={() => setRevision(value => value + 1)} className="mg-button">{loading ? 'Actualizando…' : 'Actualizar'}</button></header>
    {error && <p role="alert" className="mg-error">{error}</p>}
    {!data && loading && <p role="status">Consultando el resumen…</p>}
    {data && <>
      <div className="mg-stats">{[
        ['Socios vigentes', data.counts.active], ['Vencen en 7 días', data.counts.expiring], ['Pausados', data.counts.paused], ['Pases vencidos', data.counts.expired],
        ['Ingresos hoy', data.today.entries], ['Socios que vinieron', data.today.unique_members], ['Pagos hoy', data.today.payments], ['Cobrado hoy', moneyLabel(data.today.total_amount)],
      ].map(([label, value]) => <article className="mg-stat" key={label}><span>{label}</span><strong>{value}</strong></article>)}</div>
      <div className="mg-columns">
        <section className="mg-panel"><div className="mg-panel-heading"><div><h2>Últimos ingresos de hoy</h2><p>{data.counts.total} socios registrados.</p></div><Link to="/asistencias">Ver historial</Link></div><div className="mg-table-wrap"><table><thead><tr><th>Socio</th><th>Ingreso</th></tr></thead><tbody>{data.entries.map(entry => <tr key={entry.id}><td><Link to={`/socios/${entry.client_id}`}>{entry.name}</Link></td><td>{timeLabel(entry.scanned_at)}</td></tr>)}{!data.entries.length && <tr><td colSpan={2} className="mg-empty">Todavía no hay ingresos hoy.</td></tr>}</tbody></table></div></section>
        <section className="mg-panel"><div className="mg-panel-heading"><div><h2>Próximos vencimientos</h2><p>Socios con pase activo, sin pausa.</p></div><Link to="/clientes">Ver socios</Link></div><div className="mg-table-wrap"><table><thead><tr><th>Socio</th><th>Vencimiento</th></tr></thead><tbody>{data.expiring.map(client => <tr key={client.id}><td><Link to={`/socios/${client.id}`}>{client.name}</Link></td><td>{dateLabel(client.end_date)}</td></tr>)}{!data.expiring.length && <tr><td colSpan={2} className="mg-empty">Sin vencimientos en los próximos 7 días.</td></tr>}</tbody></table></div></section>
      </div>
    </>}
  </div></main>;
}
