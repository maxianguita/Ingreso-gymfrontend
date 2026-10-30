import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { calendarDate, dateLabel, moneyLabel, paymentMethods, timeLabel } from '../lib/management';
import Badge from '../components/Badge';
import AttendanceHistory from '../components/AttendanceHistory';
import './Management.css';

export default function MemberDetails() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');
  const [revision, setRevision] = useState(0);
  const [tab, setTab] = useState(() => {
    const value = new URLSearchParams(window.location.search).get('tab');
    return ['profile','payments','attendance','cards'].includes(value) ? value : 'profile';
  });
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError('');
    api(`/api/management/clients/${id}`, { signal: controller.signal }).then(setData)
      .catch(error => { if (!controller.signal.aborted) setError(error.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [id, revision]);
  return <main className="gym-management"><div className="mg-container">
    <Link to="/clientes" className="mg-back">← Volver a socios</Link>
    {notice && <p role="status" className="mg-success">{notice}</p>}
    {error && <p role="alert" className="mg-error">{error} <button className="mg-button" onClick={() => setRevision(value => value + 1)}>Reintentar</button></p>}
    {loading ? <p role="status" className="mg-empty">Consultando la ficha…</p> : data && !error && <MemberWorkspace key={`${id}-${revision}`} data={data} tab={tab} setTab={setTab} updated={message => { setNotice(message); setRevision(value => value + 1); }} />}
  </div></main>;
}

function MemberWorkspace({ data, updated, tab, setTab }) {
  const c = data.client;
  const [form, setForm] = useState(Object.fromEntries(['name','dni','email','phone','address'].map(key => [key, c[key] || ''])));
  const [payment, setPayment] = useState(() => {
    const requested = new URLSearchParams(window.location.search).get('renew');
    const days = requested === '30' ? 30 : requested === '0' || (!data.payments.length && c.days_left >= 0) ? 0 : 30;
    return { amount: '', method: 'cash', paid_on: calendarDate(), renewal_days: days, notes: '' };
  });
  const [uid, setUid] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const busyRef = useRef(false);
  const [requestId] = useState(() => crypto.randomUUID());
  async function perform(path, options, message) {
    if (busyRef.current) return;
    busyRef.current = true; setBusy(true); setError('');
    try { await api(`/api/management/clients/${c.id}${path}`, options); updated(message); }
    catch (error) { setError(error.message); }
    finally { busyRef.current = false; setBusy(false); }
  }
  return <>
    <header className="mg-heading"><p>FICHA DEL SOCIO</p><h1>{c.name}</h1><div className="mg-member-status"><span>DNI {c.dni}</span><Badge status={c.is_paused ? 'paused' : c.status} /><span>Vence el {dateLabel(c.end_date)}</span></div></header>
    <nav aria-label="Secciones de la ficha" className="mg-tabs">{[['profile','Datos y membresía'],['payments','Pagos'],['attendance','Asistencias'],['cards','Llavero']].map(([value, label]) => <button key={value} type="button" aria-current={tab === value ? 'page' : undefined} className={tab === value ? 'active' : ''} onClick={() => { setTab(value); setError(''); }}>{label}</button>)}</nav>
    {error && <p role="alert" className="mg-error">{error}</p>}
    {tab === 'profile' && <div className="mg-columns">
      <section className="mg-panel"><h2>Datos personales</h2><form className="mg-form" onSubmit={event => { event.preventDefault(); perform('', { method: 'PATCH', body: form }, 'Datos del socio actualizados.'); }}>
        <label>Nombre completo<input required maxLength={120} value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} /></label>
        <label>DNI<input required pattern="[0-9]{7,9}" inputMode="numeric" maxLength={9} value={form.dni} onChange={event => setForm({ ...form, dni: event.target.value })} /></label>
        <label>Email<input type="email" maxLength={254} value={form.email} onChange={event => setForm({ ...form, email: event.target.value })} /></label>
        <label>Teléfono<input type="tel" maxLength={40} value={form.phone} onChange={event => setForm({ ...form, phone: event.target.value })} /></label>
        <label>Dirección / notas<textarea maxLength={500} rows={3} value={form.address} onChange={event => setForm({ ...form, address: event.target.value })} /></label>
        <button disabled={busy} className="mg-button mg-button-primary">{busy ? 'Guardando…' : 'Guardar cambios'}</button>
      </form></section>
      <section className="mg-panel"><h2>Membresía</h2><dl className="mg-facts"><div><dt>Inicio</dt><dd>{dateLabel(c.start_date)}</dd></div><div><dt>Vencimiento</dt><dd>{dateLabel(c.end_date)}</dd></div><div><dt>Días restantes</dt><dd>{Math.max(0, c.days_left ?? 0)}</dd></div></dl>
        <p className="mg-muted">Pausar bloquea el ingreso. Los días siguen corriendo y la fecha de vencimiento no cambia. Reactivar no renueva un pase vencido.</p>
        <button type="button" disabled={busy} className="mg-button" onClick={() => perform('/state', { method: 'POST', body: { paused: !c.is_paused } }, c.is_paused ? 'Membresía reactivada; se conserva su vencimiento.' : 'Membresía pausada.')}>{busy ? 'Guardando…' : c.is_paused ? 'Reactivar membresía' : 'Pausar membresía'}</button>
        <button type="button" className="mg-button mg-button-primary" onClick={() => { setPayment({ ...payment, renewal_days: 30 }); setTab('payments'); }}>Registrar pago y renovar</button>
      </section>
    </div>}
    {tab === 'payments' && <div className="mg-columns">
      <section className="mg-panel"><h2>Registrar pago recibido</h2><p className="mg-muted">Este registro no cobra al socio. Anotá un pago que ya recibiste. Una renovación reactiva la membresía y levanta su pausa.</p>
        {!data.payments.length && c.days_left >= 0 && <p className="mg-muted">El alta del socio ya incluye su primer período. Para anotar ese primer pago sin sumar otro mes, dejá los días en 0.</p>}
        <form className="mg-form" onSubmit={event => { event.preventDefault(); perform('/payments', { method: 'POST', body: { ...payment, renewal_days: Number(payment.renewal_days), request_id: requestId } }, 'Pago registrado correctamente.'); }}>
          <label>Monto en pesos argentinos<input type="number" min="0.01" max="9999999999.99" step="0.01" required inputMode="decimal" value={payment.amount} onChange={event => setPayment({ ...payment, amount: event.target.value })} /></label>
          <label>Medio de pago<select value={payment.method} onChange={event => setPayment({ ...payment, method: event.target.value })}>{Object.entries(paymentMethods).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <label>Fecha de pago<input type="date" required max={calendarDate()} value={payment.paid_on} onChange={event => setPayment({ ...payment, paid_on: event.target.value })} /></label>
          <label>Días a agregar al pase<input type="number" min="0" max="365" step="1" required value={payment.renewal_days} onChange={event => setPayment({ ...payment, renewal_days: event.target.value })} /><small>Usá 0 para registrar el pago sin modificar el vencimiento.</small></label>
          <label>Notas / referencia<textarea maxLength={500} rows={2} value={payment.notes} onChange={event => setPayment({ ...payment, notes: event.target.value })} /></label>
          <button disabled={busy} className="mg-button mg-button-primary">{busy ? 'Registrando…' : 'Confirmar pago recibido'}</button>
        </form>
      </section>
      <section className="mg-panel"><h2>Últimos 25 pagos</h2><div className="mg-table-wrap"><table><thead><tr><th>Fecha / medio</th><th>Monto</th><th>Registró</th></tr></thead><tbody>{data.payments.map(item => <tr key={item.id}><td>{dateLabel(item.paid_on)}<small>{paymentMethods[item.method]} · +{item.renewal_days} días</small>{item.notes && <small>{item.notes}</small>}</td><td>{moneyLabel(item.amount)}</td><td>{item.recorded_by}</td></tr>)}{!data.payments.length && <tr><td colSpan={3} className="mg-empty">No hay pagos registrados.</td></tr>}</tbody></table></div></section>
    </div>}
    {tab === 'attendance' && <AttendanceHistory clientId={c.id} />}
    {tab === 'cards' && <div className="mg-columns">
      <section className="mg-panel"><h2>Llavero de ingreso</h2><p className="mg-muted">Código actual</p><code className="mg-card-code">{c.nfc_uid || 'Sin llavero vinculado'}</code>
        <form className="mg-form" onSubmit={event => { event.preventDefault(); if (c.nfc_uid && c.nfc_uid !== uid.trim().toUpperCase() && !window.confirm('El llavero anterior quedará bloqueado y no podrá reutilizarse. ¿Reemplazarlo?')) return; perform('/cards', { method: 'POST', body: { uid } }, 'Llavero vinculado. El anterior queda bloqueado si fue reemplazado.'); }}>
          <label>Vincular un llavero nuevo<input required minLength={4} maxLength={40} pattern="[0-9a-fA-F]+" autoComplete="off" spellCheck={false} value={uid} onChange={event => setUid(event.target.value)} placeholder="Seleccioná y acercá el llavero" /></label>
          <button disabled={busy} className="mg-button mg-button-primary">{busy ? 'Guardando…' : c.nfc_uid ? 'Reemplazar llavero' : 'Vincular llavero'}</button>
        </form>
        {c.nfc_uid && <button type="button" disabled={busy} className="mg-button mg-button-danger" onClick={() => { if (window.confirm('¿Bloquear este llavero? Dejará de permitir el ingreso y no podrá reutilizarse.')) perform('/cards', { method: 'DELETE' }, 'Llavero bloqueado. Podés vincular uno nuevo.'); }}>Bloquear llavero perdido</button>}
      </section>
      <section className="mg-panel"><h2>Llaveros bloqueados</h2><p className="mg-muted">Los códigos anteriores no pueden asignarse a otro socio.</p><ul className="mg-card-list">{data.blocked_cards.map(card => <li key={card.uid}><code>{card.uid}</code><p>{card.reason}</p><small>{timeLabel(card.blocked_at)} · {card.blocked_by}</small></li>)}</ul>{!data.blocked_cards.length && <p className="mg-empty">Sin llaveros bloqueados.</p>}</section>
    </div>}
  </>;
}
