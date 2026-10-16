# Mi Menú Semanal

Aplicación web en React + TypeScript + Vite, con estilos CSS propios y una futura conexión a Supabase (autenticación y PostgreSQL).

## Requisitos
- Node.js 22 o una versión LTS compatible
- npm

## Ejecutar en tu computadora
1. Abrí esta carpeta en VS Code.
2. Abrí una terminal desde **Terminal → New Terminal**.
3. Instalá las dependencias:
   ```bash
   npm install
   ```
4. Iniciá el servidor de desarrollo:
   ```bash
   npm run dev
   ```
5. Abrí la dirección local que muestra Vite (normalmente `http://localhost:5173`).

## Estado actual
La primera pantalla es una maqueta funcional: podés navegar por los días y semanas, seleccionar artículos de ejemplo en la lista de compras y moverte entre las secciones. Por ahora, esos cambios son temporales y no se guardan.

## Próxima etapa: persistencia y acceso
1. Crear el proyecto Supabase.
2. Copiar `.env.example` como `.env.local` y completar `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
3. Configurar autenticación por correo y contraseña.
4. Crear las tablas para semanas, comidas planificadas, registro real y compras, con Row Level Security para que cada usuario solo pueda acceder a sus propios datos.
5. Conectar los formularios de la interfaz a PostgreSQL.

No pongas nunca una `service_role key` en el frontend. La clave pública/anon se puede usar en el cliente únicamente junto con políticas RLS bien configuradas.
