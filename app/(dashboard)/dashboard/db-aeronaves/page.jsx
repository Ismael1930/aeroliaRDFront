import GestionAeronaves from "@/components/dashboard/dashboard/db-aeronaves";

export const metadata = {
  title: "Gestión de Aeronaves || AerolineaRD",
  description: "Administrar aeronaves del sistema",
};

export default function Page() {
  return <GestionAeronaves />;
}
