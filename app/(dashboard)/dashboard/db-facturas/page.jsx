import GestionFacturas from "@/components/dashboard/dashboard/db-facturas";

export const metadata = {
  title: "Gestión de Facturas || AerolineaRD",
  description: "Administrar facturas del sistema",
};

export default function Page() {
  return <GestionFacturas />;
}
