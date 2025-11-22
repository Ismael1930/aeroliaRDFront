'use client'

import { useState } from "react";
import Sidebar from "../common/Sidebar";
import Header from "@/components/header/dashboard-header";
import Footer from "../common/Footer";

const GestionTickets = () => {
  const [filtro, setFiltro] = useState('');

  return (
    <>
      <div className="header-margin"></div>
      <Header />

      <div className="dashboard">
        <div className="dashboard__sidebar bg-white scroll-bar-1">
          <Sidebar />
        </div>

        <div className="dashboard__main">
          <div className="dashboard__content bg-light-2">
            <div className="row y-gap-20 justify-between items-end pb-30">
              <div className="col-auto">
                <h1 className="text-30 lh-14 fw-600">Tickets de Soporte</h1>
                <div className="text-15 text-light-1">
                  Administrar tickets de soporte de clientes
                </div>
              </div>
            </div>

            {/* Filtros */}
            <div className="py-30 px-30 rounded-4 bg-white shadow-3 mb-30">
              <div className="row y-gap-20">
                <div className="col-12">
                  <input
                    type="text"
                    placeholder="Buscar por número de ticket, cliente o asunto..."
                    className="form-control"
                    value={filtro}
                    onChange={(e) => setFiltro(e.target.value)}
                    style={{
                      width: '100%',
                      height: '50px',
                      padding: '0 20px',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Contenido */}
            <div className="py-30 px-30 rounded-4 bg-white shadow-3">
              <div className="text-center py-40">
                <i className="icon-help-circle text-60 text-light-1 mb-20"></i>
                <h4 className="text-20 fw-600 mb-10">Módulo en Desarrollo</h4>
                <p className="text-15 text-light-1">
                  El sistema de tickets de soporte estará disponible próximamente.
                </p>
              </div>
            </div>

            <Footer />
          </div>
        </div>
      </div>
    </>
  );
};

export default GestionTickets;
