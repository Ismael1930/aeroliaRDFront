'use client';

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/api/index";

const ForgotPasswordForm = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    nuevaContrasena: "",
    confirmarContrasena: ""
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar mensaje al editar
    if (message.text) setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setLoading(true);

    // Validaciones
    if (!formData.email || !formData.nuevaContrasena || !formData.confirmarContrasena) {
      setMessage({ type: 'error', text: 'Todos los campos son obligatorios' });
      setLoading(false);
      return;
    }

    if (formData.nuevaContrasena !== formData.confirmarContrasena) {
      setMessage({ type: 'error', text: 'Las contraseñas no coinciden' });
      setLoading(false);
      return;
    }

    if (formData.nuevaContrasena.length < 6) {
      setMessage({ type: 'error', text: 'La nueva contraseña debe tener al menos 6 caracteres' });
      setLoading(false);
      return;
    }

    try {
      // Llamar directamente sin JWT
      await api.post('/auth/reset-password', {
        email: formData.email,
        nuevaContrasena: formData.nuevaContrasena,
        confirmarContrasena: formData.confirmarContrasena
      });
      
      setMessage({ 
        type: 'success', 
        text: 'Contraseña restablecida exitosamente. Redirigiendo al inicio de sesión...' 
      });
      
      // Redirigir al login después de 2 segundos
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err) {
      console.error('Reset password error:', err);
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.message || err.message || 'Error al restablecer la contraseña' 
      });
      setLoading(false);
    }
  };

  return (
    <form className="row y-gap-20" onSubmit={handleSubmit}>
      <div className="col-12">
        <h1 className="text-22 fw-500">Restablecer Contraseña</h1>
        <p className="mt-10">
          Ingresa tu correo electrónico y tu nueva contraseña.
        </p>
      </div>
      {/* End .col */}

      {message.text && (
        <div className="col-12">
          <div 
            className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'}`}
            style={{
              padding: '15px',
              borderRadius: '4px',
              backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
              color: message.type === 'success' ? '#155724' : '#721c24',
              border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`
            }}
          >
            {message.text}
          </div>
        </div>
      )}
      {/* End message */}

      <div className="col-12">
        <div className="form-input">
          <input 
            type="email" 
            name="email"
            value={formData.email}
            onChange={handleChange}
            required 
          />
          <label className="lh-1 text-14 text-light-1">Correo Electrónico</label>
        </div>
      </div>
      {/* End .col */}

      <div className="col-12">
        <div className="form-input">
          <input 
            type="password" 
            name="nuevaContrasena"
            value={formData.nuevaContrasena}
            onChange={handleChange}
            required 
          />
          <label className="lh-1 text-14 text-light-1">Nueva Contraseña</label>
        </div>
      </div>
      {/* End .col */}

      <div className="col-12">
        <div className="form-input">
          <input 
            type="password" 
            name="confirmarContrasena"
            value={formData.confirmarContrasena}
            onChange={handleChange}
            required 
          />
          <label className="lh-1 text-14 text-light-1">Confirmar Nueva Contraseña</label>
        </div>
      </div>
      {/* End .col */}

      <div className="col-12">
        <button
          type="submit"
          disabled={loading}
          className="button py-20 -dark-1 bg-blue-1 text-white w-100"
        >
          {loading ? 'Restableciendo contraseña...' : 'Restablecer Contraseña'} 
          {!loading && <div className="icon-arrow-top-right ml-15" />}
        </button>
      </div>
      {/* End .col */}

      <div className="col-12">
        <div className="text-center">
          <Link href="/login" className="text-14 fw-500 text-blue-1 underline">
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
      {/* End .col */}
    </form>
  );
};

export default ForgotPasswordForm;
