"use client"
import { useEffect, useState } from 'react';
import facturaService from '@/api/facturaService';
import * as vueloAdminService from '@/api/vueloAdminService';
import reservaService from '@/api/reservaService';
import * as aeronaveService from '@/api/aeronaveService';

const DashboardCard = () => {
  const [loading, setLoading] = useState(true);
  const [totalFacturas, setTotalFacturas] = useState(0);
  const [countVuelos, setCountVuelos] = useState(0);
  const [countReservas, setCountReservas] = useState(0);
  const [countAeronavesDisponibles, setCountAeronavesDisponibles] = useState(0);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // Reservas (cargar primero para usarlas en facturas)
        let reservasResp = await reservaService.getAll();
        let reservas = Array.isArray(reservasResp) ? reservasResp : (reservasResp.items || reservasResp.data || []);
        if (!Array.isArray(reservas)) reservas = [];
        
        // Contar solo reservas confirmadas (excluir canceladas)
        const reservasConfirmadas = reservas.filter(r => {
          const estado = (r.Estado || r.estado || '').toLowerCase();
          return estado !== 'cancelada';
        });
        setCountReservas(reservasConfirmadas.length);

        // Facturas - Solo sumar facturas de reservas NO canceladas
        let facturasResp = await facturaService.getAll();
        // facturaService.getAll may return array or wrapper
        let facturas = Array.isArray(facturasResp) ? facturasResp : (facturasResp.data || facturasResp.items || facturasResp || []);
        if (!Array.isArray(facturas)) facturas = [];
        
        // Obtener códigos de reservas canceladas
        const reservasCanceladas = reservas.filter(r => {
          const estado = (r.Estado || r.estado || '').toLowerCase();
          return estado === 'cancelada';
        }).map(r => r.Codigo || r.codigo);
        
        // Sumar solo facturas que NO correspondan a reservas canceladas
        const total = facturas.reduce((acc, f) => {
          const codReserva = f.CodReserva || f.codReserva || '';
          // Excluir facturas de reservas canceladas
          if (reservasCanceladas.includes(codReserva)) {
            return acc;
          }
          const monto = Number(f.Monto ?? f.monto ?? f.MontoFactura ?? 0) || 0;
          return acc + monto;
        }, 0);
        setTotalFacturas(total);

        // Vuelos (admin)
        let vuelosResp = await vueloAdminService.obtenerTodosLosVuelos();
        let vuelos = Array.isArray(vuelosResp) ? vuelosResp : (vuelosResp.data || vuelosResp.items || vuelosResp || []);
        if (!Array.isArray(vuelos)) vuelos = [];
        setCountVuelos(vuelos.length);

        // Aeronaves disponibles (manejar varios envoltorios: array, number, {count}, {items}, {data: [...]}, {data: {items,count}} )
        try {
          const aeronavesResp = await aeronaveService.obtenerAeronavesDisponibles();
          let avail = 0;

          const extractCount = (obj) => {
            if (obj == null) return 0;
            if (Array.isArray(obj)) return obj.length;
            if (typeof obj === 'number') return obj;
            if (typeof obj === 'object') {
              // common shapes
              if (typeof obj.count === 'number') return obj.count;
              if (Array.isArray(obj.items)) return obj.items.length;
              if (Array.isArray(obj.data)) return obj.data.length;
              // nested data wrapper
              if (obj.data && typeof obj.data === 'object') {
                if (typeof obj.data.count === 'number') return obj.data.count;
                if (Array.isArray(obj.data.items)) return obj.data.items.length;
                if (Array.isArray(obj.data.data)) return obj.data.data.length;
              }
            }
            return 0;
          };

          avail = extractCount(aeronavesResp);

          // Si no detectamos nada y estamos en desarrollo, loguear la respuesta para depuración
          if (avail === 0 && process && process.env && process.env.NODE_ENV !== 'production') {
            // eslint-disable-next-line no-console
            console.debug('DashboardCard: aeronaves disponibles response:', aeronavesResp);
          }

          setCountAeronavesDisponibles(avail);
        } catch (err) {
          console.warn('Error loading aeronaves disponibles', err);
        }
      } catch (err) {
        console.error('Error cargando datos del dashboard', err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const data = [
    {
      title: 'Total Facturas',
      amount: loading ? '...' : `${totalFacturas}`,
      description: 'Suma total de facturas',
      icon: '/img/dashboard/icons/2.svg',
      
    },
    {
      title: 'Vuelos',
      amount: loading ? '...' : `${countVuelos}`,
      description: 'Cantidad de vuelos',
      icon: '/img/dashboard/icons/1.svg',
    },
    {
      title: 'Reservas',
      amount: loading ? '...' : `${countReservas}`,
      description: 'Total reservas',
      icon: '/img/dashboard/icons/3.svg',
    },
    {
      title: 'Aeronaves Disponibles',
      amount: loading ? '...' : `${countAeronavesDisponibles}`,
      description: 'Aeronaves disponibles',
      icon: '/img/dashboard/icons/4.svg',
    },
  ];

  return (
    <div className="row y-gap-30">
      {data.map((item, index) => (
        <div key={index} className="col-xl-3 col-md-6">
          <div className="py-30 px-30 rounded-4 bg-white shadow-3">
            <div className="row y-gap-20 justify-between items-center">
              <div className="col-auto">
                <div className="fw-500 lh-14">{item.title}</div>
                <div className="text-26 lh-16 fw-600 mt-5">{item.amount}</div>
                <div className="text-15 lh-14 text-light-1 mt-5">{item.description}</div>
              </div>
              <div className="col-auto">
                <img src={item.icon} alt="icon" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardCard;
