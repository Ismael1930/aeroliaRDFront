import GestionReservas from "@/components/dashboard/dashboard/db-reservas";

export const metadata = {
  title: "Gestión de Reservas || AerolineaRD",
  description: "Administrar reservas del sistema",
};

export default function Page() {
  return <GestionReservas />;
}
