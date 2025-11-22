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
      const result = await login(formData.email, formData.password);
      
      // Obtener el rol del usuario desde el objeto user construido
      const userRole = result.user?.rol;
      
      // Si es admin, redirigir al dashboard
      if (userRole === 'Admin') {
        router.push('/dashboard/db-dashboard');
        return;
      }
      
      // Si es cliente, verificar si hay una URL de retorno guardada
      const redirectUrl = localStorage.getItem('redirectAfterLogin');
      if (redirectUrl) {
        localStorage.removeItem('redirectAfterLogin');
        router.push(redirectUrl);
      } else {
        router.push('/home_10'); // Redirigir al home del cliente
      }
    } catch (err) {
      console.error('Login error:', err);
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
          {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'} 
          {!loading && <div className="icon-arrow-top-right ml-15" />}
        </button>
      </div>
      {/* End .col */}
    </form>
  );
};

export default LoginForm;
