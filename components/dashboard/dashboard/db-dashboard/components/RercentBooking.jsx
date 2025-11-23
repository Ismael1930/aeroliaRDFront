"use client";
import { useEffect, useState } from "react";
import reservaService from "@/api/reservaService";

const RercentBooking = () => {
  const [reservas, setReservas] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const resp = await reservaService.getAll();
        let items = Array.isArray(resp) ? resp : (resp.items || resp.data || []);
        if (!Array.isArray(items)) items = [];
        // take the first 5 (assuming API returns newest first); otherwise adjust later
        const last5 = items.slice(0, 5);
        setReservas(last5);
      } catch (err) {
        console.error("Error loading reservas for Recent Booking", err);
      }
    };
    load();
  }, []);

  const formatTotal = (r) => {
    return (
      r.precioTotal ?? r.precio ?? r.monto ?? r.Monto ?? r.factura?.monto ?? "$0"
    );
  };

  const getStatus = (r) => {
    const s = (r.estado || r.estadoReserva || r.status || "").toString().toLowerCase();
    if (s.includes("pend")) return { color: "yellow-4", text: "yellow-3", label: r.estado || "Pending" };
    if (s.includes("confirm") || s.includes("confir")) return { color: "blue-1-05", text: "blue-1", label: r.estado || "Confirmed" };
    if (s.includes("cancel") || s.includes("rech")) return { color: "red-3", text: "red-2", label: r.estado || "Cancelled" };
    return { color: "gray-2", text: "dark", label: r.estado || "Unknown" };
  };

  return (
    <div className="overflow-scroll scroll-bar-1 pt-30">
      <table className="table-2 col-12">
        <thead>
          <tr>
            <th>#</th>
            <th>Item</th>
            <th>Total</th>
            <th>Paid</th>
            <th>Status</th>
            <th>Created At</th>
          </tr>
        </thead>
        <tbody>
          {reservas.map((row, index) => {
            const itemLabel = row.codigoReserva || row.codigo || `${row.origen?.nombre || row.origen || "-"} → ${row.destino?.nombre || row.destino || "-"}`;
            const total = formatTotal(row);
            const status = getStatus(row);
            const createdAt = row.fechaReserva || row.createdAt || row.created || "-";

            return (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>
                  {itemLabel}
                  <br /> {row.clase || row.claseVuelo || row.clasePasajero || ""}
                </td>
                <td className="fw-500">{total}</td>
                <td>{row.paid ? row.paid : (row.factura?.pagado ? "Sí" : "No")}</td>
                <td>
                  <div
                    className={`rounded-100 py-4 text-center col-12 text-14 fw-500 bg-${status.color} text-${status.text}`}
                  >
                    {status.label}
                  </div>
                </td>
                <td>{createdAt}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default RercentBooking;
