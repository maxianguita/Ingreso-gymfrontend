export function calendarDate(value = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Argentina/Buenos_Aires', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(value);
  return ['year', 'month', 'day'].map(type => parts.find(part => part.type === type).value).join('-');
}
export const dateLabel = value => value ? String(value).slice(0, 10).split('-').reverse().join('/') : '—';
export const timeLabel = value => new Intl.DateTimeFormat('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
export const moneyLabel = value => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(Number(value || 0));
export const paymentMethods = { cash: 'Efectivo', transfer: 'Transferencia', debit: 'Débito', credit: 'Crédito', other: 'Otro' };
