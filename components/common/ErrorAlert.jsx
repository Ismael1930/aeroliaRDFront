'use client'

import { useState, useEffect } from 'react';

/**
 * Componente para mostrar errores de validación del backend
 * Soporta el formato: { success, message, errors: [{ campo, tipo, mensaje, detalles }] }
 */
const ErrorAlert = ({ error, onClose, autoClose = false, autoCloseTime = 10000 }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (error) {
      setVisible(true);
    }
  }, [error]);

  useEffect(() => {
    if (autoClose && visible && error) {
      const timer = setTimeout(() => {
        handleClose();
      }, autoCloseTime);
      return () => clearTimeout(timer);
    }
  }, [autoClose, visible, error, autoCloseTime]);

  const handleClose = () => {
    setVisible(false);
    if (onClose) onClose();
  };

  if (!error || !visible) return null;

  // Debug detallado
  console.log('=== ErrorAlert Debug ===');
  console.log('error:', error);
  console.log('typeof error:', typeof error);
  console.log('error.response:', error?.response);
  console.log('error.response?.data:', error?.response?.data);
  console.log('error.response?.data?.errors:', error?.response?.data?.errors);
  console.log('error.response?.data?.errors?.[0]:', error?.response?.data?.errors?.[0]);
  console.log('error.response?.data?.errors?.[0]?.mensaje:', error?.response?.data?.errors?.[0]?.mensaje);
  console.log('========================');

  // Extraer información del error
  const getMessage = () => {
    if (typeof error === 'string') return error;
    
    // Priorizar mensaje del backend cuando success: false
    // Formato: { success: false, message: "..." }
    if (error.response?.data?.message) return error.response.data.message;
    
    // Priorizar mensaje específico de errores del backend (response.data.errors[0].mensaje)
    if (error.errors?.[0]?.mensaje) return error.errors[0].mensaje;
    if (error.data?.errors?.[0]?.mensaje) return error.data.errors[0].mensaje;
    // También revisar response.data directamente (para AxiosError completo)
    if (error.response?.data?.errors?.[0]?.mensaje) return error.response.data.errors[0].mensaje;
    // Luego mensaje general
    if (error.message) return error.message;
    if (error.data?.message) return error.data.message;
    return 'Ha ocurrido un error';
  };

  const getErrors = () => {
    if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) return error.response.data.errors;
    if (error.errors && Array.isArray(error.errors)) return error.errors;
    if (error.data?.errors && Array.isArray(error.data.errors)) return error.data.errors;
    return [];
  };

  const message = getMessage();
  const errors = getErrors();

  console.log('message a mostrar:', message);
  console.log('errors a mostrar:', errors);

  // Estilos del contenedor principal
  const containerStyle = {
    display: 'block',
    width: '100%',
    backgroundColor: '#ffebee',
    border: '2px solid #f44336',
    borderRadius: '8px',
    marginBottom: '20px',
    padding: '16px',
    boxSizing: 'border-box'
  };

  // Estilos del header
  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: message ? '12px' : '0'
  };

  // Estilos del título
  const titleStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#c62828',
    fontWeight: '600',
    fontSize: '16px'
  };

  // Estilos del botón cerrar
  const closeButtonStyle = {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#c62828',
    fontSize: '18px',
    cursor: 'pointer',
    padding: '4px 8px'
  };

  // Estilos del mensaje
  const messageStyle = {
    color: '#b71c1c',
    fontSize: '14px',
    margin: '0',
    lineHeight: '1.5',
    wordWrap: 'break-word'
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div style={titleStyle}>
          <span>⚠️</span>
          <span>{errors.length > 0 ? 'Errores de Validación' : 'Error'}</span>
        </div>
        <button onClick={handleClose} style={closeButtonStyle} type="button">
          ✕
        </button>
      </div>
      {message && (
        <p style={messageStyle}>{message}</p>
      )}
    </div>
  );
};

// Función para formatear las keys de los detalles
const formatKey = (key) => {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
};

/**
 * Componente para mostrar mensajes de éxito
 */
export const SuccessAlert = ({ message, onClose, autoClose = true, autoCloseTime = 5000 }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (message) {
      setVisible(true);
    }
  }, [message]);

  useEffect(() => {
    if (autoClose && visible && message) {
      const timer = setTimeout(() => {
        handleClose();
      }, autoCloseTime);
      return () => clearTimeout(timer);
    }
  }, [autoClose, visible, message, autoCloseTime]);

  const handleClose = () => {
    setVisible(false);
    if (onClose) onClose();
  };

  if (!message || !visible) return null;

  return (
    <div 
      className="rounded-4 mb-30 py-15 px-20 d-flex justify-between items-center"
      style={{
        backgroundColor: '#e8f5e9',
        border: '1px solid #a5d6a7'
      }}
    >
      <div className="d-flex items-center gap-10">
        <i className="icon-check text-20" style={{ color: '#2e7d32' }}></i>
        <span className="text-14 fw-500" style={{ color: '#1b5e20' }}>{message}</span>
      </div>
      <button 
        onClick={handleClose}
        className="flex-center size-30 rounded-full"
        style={{ backgroundColor: 'rgba(46, 125, 50, 0.1)' }}
      >
        <i className="icon-close text-14" style={{ color: '#2e7d32' }}></i>
      </button>
    </div>
  );
};

/**
 * Hook para manejar errores de API
 */
export const useApiError = () => {
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleError = (err) => {
    // Extraer el error de diferentes formatos de respuesta
    if (err.response?.data) {
      setError(err.response.data);
    } else if (err.data) {
      setError(err.data);
    } else if (typeof err === 'string') {
      setError({ message: err });
    } else {
      setError(err);
    }
    setSuccess(null);
  };

  const handleSuccess = (msg) => {
    setSuccess(msg);
    setError(null);
  };

  const clearError = () => setError(null);
  const clearSuccess = () => setSuccess(null);
  const clearAll = () => {
    setError(null);
    setSuccess(null);
  };

  return {
    error,
    success,
    handleError,
    handleSuccess,
    clearError,
    clearSuccess,
    clearAll
  };
};

export default ErrorAlert;
