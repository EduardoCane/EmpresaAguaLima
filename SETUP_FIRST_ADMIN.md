# ⚙️ Instrucciones para Crear el Primer Administrador

El error que ves (`violates row-level security policy`) ocurre porque necesitas crear una función RPC en tu base de datos Supabase para que maneje el registro del primer admin desde el servidor.

## 🔧 Pasos para arreglarlo:

### 1️⃣ Abre el SQL Editor de Supabase
- Ve a tu dashboard de Supabase
- Click en **SQL Editor** (lado izquierdo)
- Click en **+ New Query**

### 2️⃣ Copia y ejecuta el siguiente SQL:

```sql
create or replace function public.bootstrap_admin_user()
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.admin_users (user_id)
  values (auth.uid())
  on conflict do nothing;
$$;
```

### 3️⃣ Click en **Run** (botón azul arriba a la derecha)

✅ Una vez ejecutado, la función `bootstrap_admin_user()` estará disponible y el registro funcionará correctamente.

## 📝 Qué hace esta función:

- Se ejecuta **desde el servidor** (donde `auth.uid()` está disponible)
- Inserta automáticamente tu ID de usuario en la tabla `admin_users`
- Ignora el error si ya existe (no genera conflictos)

---

## 🚀 Ahora puedes registrarte:

1. Ve a http://localhost:5173/signup (o tu URL de desarrollo)
2. Llena el formulario con tu email y contraseña
3. Click en "Crear cuenta"
4. Serás redirigido al login
5. Inicia sesión con tus credenciales

¡Listo! Ya tendrás acceso al panel administrativo.
