"use client";

import { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { getAll } from "../../../../../api/facturaService";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export const options = {
  responsive: true,
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: false,
    },
    tooltip: {
      position: "nearest",
      mode: "index",
      intersect: false,
      yPadding: 10,
      xPadding: 10,
      caretSize: 4,
      backgroundColor: "#1967d2",
      borderColor: "rgba(0,0,0,1)",
      borderWidth: 2,
      callbacks: {
        label: function(context) {
          let label = context.dataset.label || '';
          if (label) {
            label += ': ';
          }
          if (context.parsed.y !== null) {
            label += new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'DOP' }).format(context.parsed.y);
          }
          return label;
        }
      }
    },
  },
  scales: {
    y: {
      ticks: {
        callback: function(value) {
          return '$' + value.toLocaleString();
        }
      }
    }
  }
};

const ChartMain = () => {
  const [chartData, setChartData] = useState({
    labels: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
    datasets: [
      {
        label: "Ingresos",
        data: Array(12).fill(0),
        borderColor: "#1967d2",
        backgroundColor: "#1967d2",
        fill: false,
      },
    ],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIngresos = async () => {
      try {
        const response = await getAll();
        const facturas = Array.isArray(response) ? response : (response?.data || []);
        
        // Inicializar array de ingresos por mes (12 meses)
        const ingresosPorMes = Array(12).fill(0);
        const currentYear = new Date().getFullYear();
        
        // Agrupar ingresos por mes
        if (Array.isArray(facturas)) {
          facturas.forEach((factura) => {
            // Intentar diferentes nombres de campos para la fecha
            const fechaCampo = factura.fechaEmision || factura.fecha || factura.fechaCreacion || factura.createdAt;
            // Intentar diferentes nombres de campos para el total
            const totalCampo = factura.total || factura.monto || factura.importe || factura.totalPagar;
            
            if (fechaCampo && totalCampo) {
              // Asegurar que la fecha se parsea correctamente
              const fecha = new Date(fechaCampo);
              const year = fecha.getFullYear();
              
              // Solo considerar facturas del año actual
              if (year === currentYear && !isNaN(fecha.getTime())) {
                const mes = fecha.getMonth(); // 0-11
                const total = parseFloat(totalCampo) || 0;
                ingresosPorMes[mes] += total;
              }
            }
          });
        }
        
        setChartData({
          labels: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
          datasets: [
            {
              label: "Ingresos",
              data: ingresosPorMes,
              borderColor: "#1967d2",
              backgroundColor: "#1967d2",
              fill: false,
            },
          ],
        });
        setLoading(false);
      } catch (error) {
        console.error("Error al cargar ingresos:", error);
        setLoading(false);
      }
    };

    fetchIngresos();
  }, []);

  if (loading) {
    return (
      <div className="widget-content">
        <div className="d-flex justify-center items-center" style={{ height: "300px" }}>
          Cargando datos...
        </div>
      </div>
    );
  }

  return (
    <div className="widget-content">
      <Line options={options} data={chartData} />
    </div>
  );
};

export default ChartMain;
