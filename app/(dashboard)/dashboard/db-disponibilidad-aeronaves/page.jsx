import DisponibilidadAeronaves from "@/components/dashboard/dashboard/db-disponibilidad-aeronaves";

export const metadata = {
  title: "Disponibilidad de Aeronaves || AerolineaRD",
  description: "Monitoreo de ocupación de asientos por aeronave",
};

export default function Page() {
  return <DisponibilidadAeronaves />;
}
