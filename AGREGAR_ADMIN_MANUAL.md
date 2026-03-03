# ✅ Solución: Agregar usuario a admin_users

Tu cuenta de Supabase está confirmada, pero falta agregarla a la tabla de administradores.

## 🔧 Solución rápida (1 minuto):

### Ejecuta este SQL en Supabase:

1. Ve a **SQL Editor** en tu dashboard de Supabase
2. Click en **+ New Query**
3. Copia y pega este código:

```sql
-- Agrega tu usuario actual a la tabla admin_users
INSERT INTO public.admin_users (user_id)
SELECT id FROM auth.users 
WHERE email = 'jocanevarom01@gmail.com'
ON CONFLICT DO NOTHING;
```

4. Click en **Run** (botón azul)
5. ✅ Ahora vuelve al login e inicia sesión

---

## 🎯 Verificar que funcionó:

```sql
-- Ejecuta esto para confirmar
SELECT * FROM public.admin_users;
```

Deberías ver tu `user_id` en la tabla.

---

## 💡 ¿Por qué pasó esto?

Cuando activas la confirmación de email en Supabase, el usuario se crea pero el código de registro no puede insertar en `admin_users` hasta que se confirme. Por eso hay que hacerlo manualmente la primera vez.

---

## 🚀 Después de ejecutar el SQL:

1. Ve a `/login`
2. Ingresa `jocanevarom01@gmail.com` y tu contraseña
3. Click en "Ingresar"
4. ✅ ¡Accederás al panel administrativo!
