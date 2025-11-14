# Instrucciones para Implementar Autenticación

## ✅ Archivos creados:

1. **api/sessionUtils.js** - Gestión de tokens y localStorage
2. **api/authService.js** - Servicios de autenticación (login, register, logout, etc.)
3. **context/AuthContext.jsx** - Context API para gestión global de autenticación
4. **components/common/ProtectedRoute.jsx** - HOC para proteger rutas privadas
5. **components/common/UserProfile.jsx** - Componente de perfil de usuario
6. **.env.local** - Variables de entorno

## 📝 Configuración:

### 1. Actualiza la URL de tu API en .env.local:
```env
NEXT_PUBLIC_BACKEND_URL=https://localhost:5001/api
```
Cambia la URL por la de tu API .NET Core

### 2. Endpoints esperados en tu API .NET Core:

```csharp
POST /api/auth/login
Body: { "email": "user@example.com", "password": "password" }
Response: { "token": "jwt_token", "user": { "id": 1, "name": "User", "email": "..." } }

POST /api/auth/register
Body: { "name": "...", "email": "...", "password": "..." }
Response: { "token": "jwt_token", "user": { ... } }

POST /api/auth/logout
Headers: Authorization: Bearer {token}

GET /api/auth/profile
Headers: Authorization: Bearer {token}
Response: { "id": 1, "name": "User", "email": "..." }

GET /api/auth/verify
Headers: Authorization: Bearer {token}
Response: { "valid": true }
```

## 🔐 Uso en componentes:

### Hook useAuth:
```jsx
'use client';
import { useAuth } from '@/context/AuthContext';

const MyComponent = () => {
  const { user, isAuth, login, logout, loading } = useAuth();
  
  // user: datos del usuario
  // isAuth: boolean si está autenticado
  // login(email, password): función para login
  // logout(): función para logout
  // loading: boolean si está cargando
  
  return <div>...</div>;
};
```

### Proteger una ruta:
```jsx
import ProtectedRoute from '@/components/common/ProtectedRoute';

const DashboardPage = () => {
  return (
    <ProtectedRoute>
      <div>Contenido protegido</div>
    </ProtectedRoute>
  );
};
```

### Hacer peticiones autenticadas:
```javascript
import api from '@/api/index';

// El token se envía automáticamente en todas las peticiones
const fetchData = async () => {
  const response = await api.get('/tours');
  return response.data;
};
```

## 🎯 Ejemplo de uso en dashboard:

Edita `app/(dashboard)/dashboard/page.jsx`:
```jsx
'use client';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  
  return (
    <ProtectedRoute>
      <div>
        <h1>Dashboard</h1>
        <p>Bienvenido, {user?.name}</p>
      </div>
    </ProtectedRoute>
  );
};

export default Dashboard;
```

## 📌 Agregar botón de usuario al header:

Importa y usa el componente `UserProfile` en tu header:
```jsx
import UserProfile from '@/components/common/UserProfile';

// En tu header
<UserProfile />
```

## 🔄 Configuración CORS en .NET Core:

Asegúrate de configurar CORS en tu API:

```csharp
// Program.cs o Startup.cs
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowNextJS",
        policy =>
        {
            policy.WithOrigins("http://localhost:3000")
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        });
});

app.UseCors("AllowNextJS");
```

## ✨ Listo para usar!

Reinicia el servidor:
```bash
yarn dev
```
