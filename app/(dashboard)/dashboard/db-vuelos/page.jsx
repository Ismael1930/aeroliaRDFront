import React from "react";
import GestionVuelos from "@/components/dashboard/dashboard/db-vuelos";

export const metadata = {
  title: "Gestión de Vuelos || AerolineaRD",
  description: "Panel de administración de vuelos",
};

export default function Page() {
  return <GestionVuelos />;
}
