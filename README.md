# Ingreso-gym frontend

Frontend React/Vite de Primal Strength.

## Desarrollo

`npm ci`, configurar `.env` a partir de `.env.example` y ejecutar `npm run dev`.
Verificar con `npm run lint` y `npm run build`.

## Vercel

El archivo `vercel.json` envía `/api` y `/auth` al backend de Render y permite
abrir directamente las pantallas React, como `/nfc` y `/admin/find`.
En producción la API se consulta desde el mismo dominio de la página;
`VITE_API_URL` y `VITE_API_BASE` solo se utilizan durante el desarrollo local.

En Render configurar `FRONTEND_URL` con el origen exacto del frontend de Vercel
(por ejemplo, `https://mi-proyecto.vercel.app`, sin barra final),
`COOKIE_SECURE=true`, `ADMIN_USERNAME` y `ADMIN_PASSWORD`. No colocar contraseñas
en variables `VITE_*` ni en este repositorio.

Si cambia la dirección del backend, actualizar los destinos de `vercel.json`.
