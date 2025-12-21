import React from "react";
import GestionAeropuertos from "@/components/dashboard/dashboard/db-aeropuertos";

export const metadata = {
  title: "Gestión de Aeropuertos || AerolineaRD",
  description: "Panel de administración de aeropuertos y capacidad",
};

export default function Page() {
  return <GestionAeropuertos />;
}
