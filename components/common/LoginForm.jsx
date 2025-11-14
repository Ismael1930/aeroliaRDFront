'use client';

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const LoginForm = () => {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      router.push('/dashboard/db-dashboard'); // Redirigir al dashboard después del login
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="row y-gap-20" onSubmit={handleSubmit}>
      <div className="col-12">
        <h1 className="text-22 fw-500">Bienvenido de nuevo</h1>
        <p className="mt-10">
          No tienes una cuenta?{" "}
          <Link href="/signup" className="text-blue-1">
            Regístrate gratis
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
            required 
          />
          <label className="lh-1 text-14 text-light-1">Contraseña</label>
        </div>
      </div>
      {/* End .col */}

      <div className="col-12">
        <Link href="/help-center" className="text-14 fw-500 text-blue-1 underline">
          ¿Olvidaste tu contraseña?
        </Link>
      </div>
      {/* End .col */}

      <div className="col-12">
        <button
          type="submit"
          disabled={loading}
          className="button py-20 -dark-1 bg-blue-1 text-white w-100"
        >
          {loading ? 'Signing In...' : 'Sign In'} 
          {!loading && <div className="icon-arrow-top-right ml-15" />}
        </button>
      </div>
      {/* End .col */}
    </form>
  );
};

export default LoginForm;
