const states = {
  ok: { label: 'Vigente', style: 'bg-green-100 text-green-900' },
  active: { label: 'Vigente', style: 'bg-green-100 text-green-900' },
  warning: { label: 'Por vencer', style: 'bg-amber-100 text-amber-900' },
  danger: { label: 'Por vencer', style: 'bg-amber-100 text-amber-900' },
  expired: { label: 'Vencido', style: 'bg-red-100 text-red-900' },
  inactive: { label: 'Inactivo', style: 'bg-slate-200 text-slate-800' },
};

export default function Badge({ status }) {
  const state = states[status] || { label: 'Sin información', style: 'bg-slate-200 text-slate-800' };
  return <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${state.style}`}>{state.label}</span>;
}
