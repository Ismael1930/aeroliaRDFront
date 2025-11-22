import GestionAeronaves from "@/components/dashboard/dashboard/db-aeronaves";

export const metadata = {
  title: "Gestión de Aeronaves || Aerolia",
  description: "Administrar aeronaves del sistema",
};

export default function DbAeronaves() {
  return <GestionAeronaves />;
}
