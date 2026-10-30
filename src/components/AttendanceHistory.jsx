import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { calendarDate, timeLabel } from '../lib/management';

export default function AttendanceHistory({ clientId }) {
  const end = calendarDate();
  const initial = new Date(`${end}T12:00:00Z`);
  initial.setUTCDate(initial.getUTCDate() - 29);
  const [range, setRange] = useState({ from: initial.toISOString().slice(0, 10), to: end });
  const [applied, setApplied] = useState(range);
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ data: [], total: 0, limit: 25 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError('');
    const query = new URLSearchParams({ ...applied, page });
    if (clientId) query.set('client_id', clientId);
    api(`/api/management/checkins?${query}`, { signal: controller.signal })
      .then(setResult).catch(error => { if (!controller.signal.aborted) setError(error.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [applied, page, clientId, revision]);
  return (
    <section className="mg-panel">
      <div className="mg-panel-heading"><div><h2>Historial de asistencias</h2><p>Ingresos permitidos. Horarios de Argentina.</p></div><button onClick={() => setRevision(value => value + 1)} disabled={loading} className="mg-button">Actualizar</button></div>
      <form className="mg-filters" onSubmit={event => { event.preventDefault(); setApplied({ ...range }); setPage(1); }}>
        <label>Desde<input type="date" required value={range.from} max={range.to} onChange={event => setRange({ ...range, from: event.target.value })} /></label>
        <label>Hasta<input type="date" required value={range.to} min={range.from} max={end} onChange={event => setRange({ ...range, to: event.target.value })} /></label>
        <button className="mg-button mg-button-primary" disabled={loading}>Consultar</button>
      </form>
      {error && <p role="alert" className="mg-error">{error}</p>}
      {loading ? <p role="status" className="mg-empty">Consultando asistencias…</p> : error ? null : <>
        <div className="mg-table-wrap"><table><thead><tr><th>Fecha y hora</th><th>Socio</th><th>DNI</th></tr></thead><tbody>
          {result.data.map(entry => <tr key={entry.id}><td>{timeLabel(entry.scanned_at)}</td><td><Link to={`/socios/${entry.client_id}`}>{entry.name}</Link></td><td>{entry.dni}</td></tr>)}
          {!result.data.length && <tr><td colSpan={3} className="mg-empty">No hay ingresos en este período.</td></tr>}
        </tbody></table></div>
        <div className="mg-pagination"><span>{result.total} ingresos · Página {page}</span><div><button className="mg-button" disabled={page === 1} onClick={() => setPage(value => value - 1)}>Anterior</button><button className="mg-button" disabled={page * result.limit >= result.total} onClick={() => setPage(value => value + 1)}>Siguiente</button></div></div>
      </>}
    </section>
  );
}
