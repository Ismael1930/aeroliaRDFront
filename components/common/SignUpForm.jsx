'use client';

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/api/authService";

const SignUpForm = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validar contraseñas
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    // Validar longitud mínima
    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }

    try {
      const result = await authService.register(
        formData.email, 
        formData.password
      );
      
      setSuccess(result.message || 'Usuario registrado exitosamente');
      
      // Redirigir al login después de 2 segundos
      setTimeout(() => {
        router.push('/login');
      }, 2000);
      
    } catch (err) {
      // Manejar errores del backend
      if (err.errors && Array.isArray(err.errors)) {
        setError(err.errors.map(e => e.description || e).join(', '));
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Error al registrar usuario. Por favor, intente nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="row y-gap-20" onSubmit={handleSubmit}>
      <div className="col-12">
        <h1 className="text-22 fw-500">Crear Cuenta</h1>
        <p className="mt-10">
          ¿Ya tiene una cuenta?{" "}
          <Link href="/login" className="text-blue-1">
            Inicie sesión
          </Link>
        </p>
      </div>
      {/* End .col */}

      {error && (
        <div className="col-12">
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        </div>
      )}
      {/* End error message */}

      {success && (
        <div className="col-12">
          <div className="alert alert-success" role="alert">
            {success}
          </div>
        </div>
      )}
      {/* End success message */}

      <div className="col-12">
        <div className="form-input ">
          <input 
            type="email" 
            name="email"
            value={formData.email}
            onChange={handleChange}
            required 
          />
          <label className="lh-1 text-14 text-light-1">Email</label>
        </div>
      </div>
      {/* End .col */}

      <div className="col-12">
        <div className="form-input ">
          <input 
            type="password" 
            name="password"
            value={formData.password}
            onChange={handleChange}
            minLength={6}
            required 
          />
          <label className="lh-1 text-14 text-light-1">Contraseña</label>
        </div>
      </div>
      {/* End .col */}

      <div className="col-12">
        <div className="form-input ">
          <input 
            type="password" 
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            minLength={6}
            required 
          />
          <label className="lh-1 text-14 text-light-1">Confirmar Contraseña</label>
        </div>
      </div>
      {/* End .col */}

      <div className="col-12">
        <button
          type="submit"
          disabled={loading}
          className="button py-20 -dark-1 bg-blue-1 text-white w-100"
        >
          {loading ? 'Registrando...' : 'Registrarme'} 
          {!loading && <div className="icon-arrow-top-right ml-15" />}
        </button>
      </div>
      {/* End .col */}
    </form>
  );
};

export default SignUpForm;
