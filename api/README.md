# API Services - Documentación

Este directorio contiene todos los servicios para comunicarse con el backend de la aplicación.

## Estructura

```
api/
├── index.js                  # Configuración de Axios y interceptores
├── services.js               # Exportación central de todos los servicios
├── sessionUtils.js           # Utilidades de manejo de sesión
├── authService.js            # Autenticación y autorización
├── vueloService.js           # Servicios de vuelos
├── aeropuertoService.js      # Servicios de aeropuertos
├── clienteService.js         # Servicios de clientes
├── reservaService.js         # Servicios de reservas
├── pasajeroService.js        # Servicios de pasajeros
├── facturaService.js         # Servicios de facturas y pagos
├── equipajeService.js        # Servicios de equipaje
├── estadoVueloService.js     # Servicios de estado de vuelos
├── notificacionService.js    # Servicios de notificaciones
└── ticketSoporteService.js   # Servicios de tickets de soporte
```

## Uso

### Importar todos los servicios

```javascript
import { 
  authService, 
  vueloService, 
  aeropuertoService 
} from '@/api/services';

// Usar los servicios
const vuelos = await vueloService.buscarVuelos(filtros);
const aeropuertos = await aeropuertoService.obtenerAeropuertos();
```

### Importar funciones específicas

```javascript
import { 
  login, 
  buscarVuelos, 
  obtenerAeropuertos 
} from '@/api/services';

// Usar directamente
const result = await login(email, password);
const vuelos = await buscarVuelos(filtros);
const aeropuertos = await obtenerAeropuertos();
```

## Autenticación

La API usa JWT (JSON Web Tokens). El token se guarda automáticamente en localStorage al hacer login y se incluye en todas las peticiones subsiguientes.

```javascript
import { login, register, logout } from '@/api/services';

// Registrar
await register('usuario@example.com', 'Password123!', 'Cliente');

// Login
const response = await login('usuario@example.com', 'Password123!');
// El token se guarda automáticamente

// Logout
await logout();
```

## Roles de Usuario

- **Cliente**: Usuarios normales, pueden ver vuelos y hacer reservas
- **Operador**: Puede gestionar vuelos y ver reportes
- **Admin**: Acceso completo a todas las funcionalidades

## Ejemplos de Uso

### Buscar Vuelos

```javascript
import { buscarVuelos } from '@/api/services';

const filtros = {
  origen: 'SDQ',
  destino: 'POP',
  fechaSalida: '2024-01-15',
  fechaRegreso: '2024-01-20',
  adultos: 2,
  ninos: 1,
  clase: 'Economica'
};

const vuelos = await buscarVuelos(filtros);
```

### Crear Reserva

```javascript
import { crearReserva } from '@/api/services';

const reservaData = {
  idPasajero: 1,
  idVuelo: 1,
  idCliente: 1,
  numAsiento: '12A',
  metodoPago: 'Tarjeta de Crédito'
};

const reserva = await crearReserva(reservaData);
console.log('Código de reserva:', reserva.codigo);
```

### Obtener Aeropuertos

```javascript
import { obtenerAeropuertos } from '@/api/services';

const aeropuertos = await obtenerAeropuertos();
```

### Gestionar Cliente

```javascript
import { 
  crearCliente, 
  obtenerClientePorId, 
  obtenerClienteConReservas 
} from '@/api/services';

// Crear cliente
const cliente = await crearCliente({
  nombre: 'Juan Pérez',
  email: 'juan@example.com',
  telefono: '809-555-1234',
  userId: 'user-id-123'
});

// Obtener cliente con reservas
const clienteConReservas = await obtenerClienteConReservas(cliente.id);
```

### Procesar Pago

```javascript
import { 
  obtenerFacturaPorReserva, 
  procesarPago 
} from '@/api/services';

// Obtener factura
const factura = await obtenerFacturaPorReserva('RES123456');

// Procesar pago
await procesarPago({
  codigoFactura: factura.codigo,
  metodoPago: 'Tarjeta de Crédito'
});
```

### Monitorear Estado de Vuelo

```javascript
import { obtenerEstadoVuelo } from '@/api/services';

const estado = await obtenerEstadoVuelo(1);
console.log('Estado del vuelo:', estado.estado);
console.log('Puerta:', estado.puerta);
```

### Gestionar Notificaciones

```javascript
import { 
  obtenerNotificacionesCliente, 
  marcarNotificacionLeida 
} from '@/api/services';

// Obtener notificaciones
const notificaciones = await obtenerNotificacionesCliente(1);

// Marcar como leída
await marcarNotificacionLeida(notificaciones[0].id);
```

### Crear Ticket de Soporte

```javascript
import { crearTicketSoporte } from '@/api/services';

const ticket = await crearTicketSoporte({
  idCliente: 1,
  asunto: 'Problema con reserva',
  descripcion: 'No puedo modificar mi reserva',
  prioridad: 'Alta'
});
```

## Manejo de Errores

Todos los servicios incluyen manejo de errores. Los errores se loguean en la consola y se propagan para que puedas manejarlos:

```javascript
try {
  const vuelos = await buscarVuelos(filtros);
} catch (error) {
  console.error('Error al buscar vuelos:', error);
  // Manejar el error (mostrar mensaje al usuario, etc.)
}
```

## Códigos de Estado HTTP

- **200 OK**: Solicitud exitosa
- **201 Created**: Recurso creado exitosamente
- **204 No Content**: Operación exitosa sin contenido
- **400 Bad Request**: Datos inválidos
- **401 Unauthorized**: No autenticado
- **403 Forbidden**: Sin permisos
- **404 Not Found**: Recurso no encontrado
- **500 Internal Server Error**: Error del servidor

## Configuración

La URL base del backend se configura en `.env.local`:

```env
NEXT_PUBLIC_BACKEND_URL=https://localhost:7165/api
```
