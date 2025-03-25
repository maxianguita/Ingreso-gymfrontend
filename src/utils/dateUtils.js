import dayjs from 'dayjs';

const fecha = "2025-03-24T20:59:00";
const fechaFormateada = dayjs(fecha).format('DD/MM/YYYY HH:mm');

console.log(fechaFormateada); // "24/03/2025 20:59"
