# 🔧 Habilitar Registro por Email en Supabase

## El error "Las suscripciones por correo electrónico están deshabilitadas"

Significa que necesitas activar los registros de nuevos usuarios en Supabase.

## ✅ Solución (2 minutos):

### 1️⃣ Ve a tu proyecto Supabase Dashboard

### 2️⃣ Navega a: **Authentication** → **Providers**

### 3️⃣ Busca **Email** en la lista de providers

### 4️⃣ Haz click en **Email** para expandir la configuración

### 5️⃣ Activa las siguientes opciones:
- ✅ **Enable Email provider** (debe estar activado)
- ✅ **Enable Email Signup** ← Esta es la clave
- ❌ **Confirm email** (desactiva esto para desarrollo)

### 6️⃣ Click en **Save**

---

## 🚀 Después de estos cambios:

1. Vuelve a `/signup`
2. Ingresa tu email y contraseña
3. Click en "Crear cuenta"
4. ✅ ¡Listo! Ya podrás registrarte

---

## 💡 Configuración recomendada para desarrollo:

```
✅ Enable Email provider: ON
✅ Enable Email Signup: ON
❌ Confirm email: OFF (para no tener que confirmar emails en desarrollo)
```

## 💡 Para producción:

```
✅ Enable Email provider: ON
✅ Enable Email Signup: ON
✅ Confirm email: ON (para seguridad)
```
