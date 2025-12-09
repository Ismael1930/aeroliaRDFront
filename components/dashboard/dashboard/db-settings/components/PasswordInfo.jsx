"use client";

import { useState } from "react";
import { authService } from "../../../../../api/authService";

const PasswordInfo = () => {
  const [formData, setFormData] = useState({
    contrasenaActual: "",
    nuevaContrasena: "",
    confirmarContrasena: ""
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar mensaje al editar
    if (message.text) setMessage({ type: "", text: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    // Validaciones
    if (!formData.contrasenaActual || !formData.nuevaContrasena || !formData.confirmarContrasena) {
      setMessage({ type: "error", text: "Todos los campos son obligatorios" });
      setLoading(false);
      return;
    }

    if (formData.nuevaContrasena !== formData.confirmarContrasena) {
      setMessage({ type: "error", text: "Las contraseñas nuevas no coinciden" });
      setLoading(false);
      return;
    }

    if (formData.nuevaContrasena.length < 6) {
      setMessage({ type: "error", text: "La nueva contraseña debe tener al menos 6 caracteres" });
      setLoading(false);
      return;
    }

    try {
      await authService.cambiarContrasena(
        formData.contrasenaActual,
        formData.nuevaContrasena,
        formData.confirmarContrasena
      );
      
      setMessage({ type: "success", text: "Contraseña cambiada exitosamente" });
      setFormData({
        contrasenaActual: "",
        nuevaContrasena: "",
        confirmarContrasena: ""
      });
    } catch (error) {
      setMessage({ 
        type: "error", 
        text: error.message || "Error al cambiar la contraseña" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      contrasenaActual: "",
      nuevaContrasena: "",
      confirmarContrasena: ""
    });
    setMessage({ type: "", text: "" });
  };

  return (
    <form className="col-xl-9" onSubmit={handleSubmit}>
      <div className="row x-gap-20 y-gap-20">
        {message.text && (
          <div className="col-12">
            <div className={`alert ${message.type === "success" ? "alert-success" : "alert-danger"}`} style={{
              padding: "15px",
              borderRadius: "4px",
              backgroundColor: message.type === "success" ? "#d4edda" : "#f8d7da",
              color: message.type === "success" ? "#155724" : "#721c24",
              border: `1px solid ${message.type === "success" ? "#c3e6cb" : "#f5c6cb"}`
            }}>
              {message.text}
            </div>
          </div>
        )}

        <div className="col-12">
          <div className="form-input">
            <input 
              type="password" 
              name="contrasenaActual"
              value={formData.contrasenaActual}
              onChange={handleChange}
              required 
            />
            <label className="lh-1 text-16 text-light-1">
              Contraseña Actual
            </label>
          </div>
        </div>
        {/* End col-12 */}

        <div className="col-12">
          <div className="form-input">
            <input 
              type="password" 
              name="nuevaContrasena"
              value={formData.nuevaContrasena}
              onChange={handleChange}
              required 
            />
            <label className="lh-1 text-16 text-light-1">Nueva Contraseña</label>
          </div>
        </div>
        {/* End col-12 */}

        <div className="col-12">
          <div className="form-input">
            <input 
              type="password" 
              name="confirmarContrasena"
              value={formData.confirmarContrasena}
              onChange={handleChange}
              required 
            />
            <label className="lh-1 text-16 text-light-1">
              Confirmar Nueva Contraseña
            </label>
          </div>
        </div>
        {/* End col-12 */}

        <div className="col-12">
          <div className="row x-gap-10 y-gap-10">
            <div className="col-auto">
              <button
                type="submit"
                disabled={loading}
                className="button h-50 px-24 -dark-1 bg-blue-1 text-white"
              >
                {loading ? "Guardando..." : "Guardar Cambios"} 
                {!loading && <div className="icon-arrow-top-right ml-15" />}
              </button>
            </div>
            <div className="col-auto">
              <button 
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="button h-50 px-24 -blue-1 bg-blue-1-05 text-blue-1"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
        {/* End col-12 */}
      </div>
    </form>
  );
};

export default PasswordInfo;
