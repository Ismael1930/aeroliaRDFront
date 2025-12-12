import api from './index';
import { saveToken, saveUser, clearSession } from './sessionUtils';

/**
 * Registrar un nuevo usuario
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña
 * @param {string} role - Rol (Cliente, Admin, Operador) - default: Cliente
 */
export const register = async (email, password, extra = {}, role = 'Cliente') => {
  try {
    // Construir payload con campos adicionales permitidos
    const payload = {
      email,
      password,
      role
    };

    // Mapear campos adicionales a PascalCase esperados por el DTO del backend
    if (extra && typeof extra === 'object') {
      const map = {
        nombre: 'Nombre',
        Nombre: 'Nombre',
        apellido: 'Apellido',
        Apellido: 'Apellido',
        telefono: 'Telefono',
        Telefono: 'Telefono',
        pasaporte: 'Pasaporte',
        Pasaporte: 'Pasaporte'
      };
      Object.keys(extra).forEach(key => {
        const mapped = map[key];
        if (mapped && extra[key] != null) payload[mapped] = extra[key];
      });
    }

    // Debug: log payload to help debugging registration hangs
    try {
      // eslint-disable-next-line no-console
      console.debug('Register payload:', payload);
    } catch {}

    const response = await api.post('/auth/register', payload);
    return response.data;
  } catch (error) {
    console.error('Error en register:', error);
    throw error.response?.data || { message: 'Error al registrar usuario' };
  }
};

/**
 * Iniciar sesión
 * @param {string} email - Email
 * @param {string} password - Contraseña
 */
export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    
    // Guardar token
    if (response.data.token) {
      saveToken(response.data.token);
      
      // Construir objeto de usuario con la nueva estructura del backend
      const userData = {
        email: response.data.email,
        userName: response.data.userName,
        userId: response.data.userId,
        rol: response.data.roles && response.data.roles.length > 0 ? response.data.roles[0] : 'Cliente',
        roles: response.data.roles || ['Cliente']
      };
      
      saveUser(userData);
    }
    
    return response.data;
  } catch (error) {
    console.error('Error en login:', error);
    throw error.response?.data || { message: 'Error al iniciar sesión' };
  }
};

/**
 * Cerrar sesión
 */
export const logout = async () => {
  try {
    clearSession();
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
  }
};

// Objeto de compatibilidad con el código existente
export const authService = {
  login,
  register: (email, password, extra) => register(email, password, extra, 'Cliente'),
  logout,

  // Obtener perfil del usuario
  getProfile: async () => {
    try {
      const response = await api.get('/auth/profile');
      saveUser(response.data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener perfil' };
    }
  },

  // Verificar token
  verifyToken: async () => {
    try {
      const response = await api.get('/auth/verify');
      return response.data;
    } catch (error) {
      clearSession();
      return false;
    }
  },

  // Recuperar contraseña
  forgotPassword: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al solicitar recuperación' };
    }
  },

  // Reset contraseña
  resetPassword: async (token, newPassword) => {
    try {
      const response = await api.post('/auth/reset-password', {
        token,
        newPassword
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al restablecer contraseña' };
    }
  },

  // Cambiar contraseña
  cambiarContrasena: async (contrasenaActual, nuevaContrasena, confirmarContrasena) => {
    try {
      const response = await api.post('/auth/cambiar-contrasena', {
        contrasenaActual,
        nuevaContrasena,
        confirmarContrasena
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al cambiar contraseña' };
    }
  }
};
