import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// Extender dayjs con los plugins
dayjs.extend(utc);
dayjs.extend(timezone);

// Zona horaria de Argentina
const fechaDesdeBackend = '2025-03-24T20:59:00Z';
const fechaArgentina = dayjs.utc(fechaDesdeBackend).tz('America/Argentina/Buenos_Aires').format('DD/MM/YYYY HH:mm');

console.log(fechaArgentina); // "24/03/2025 17:59"
