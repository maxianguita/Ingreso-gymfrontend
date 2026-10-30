import AttendanceHistory from '../components/AttendanceHistory';
import './Management.css';

export default function Attendance() {
  return <main className="gym-management"><div className="mg-container"><header className="mg-heading"><p>RECEPCIÓN</p><h1>Asistencias</h1><span>Consultá los ingresos del gimnasio por fecha.</span></header><AttendanceHistory /></div></main>;
}
