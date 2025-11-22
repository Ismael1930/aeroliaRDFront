import GestionTickets from "@/components/dashboard/dashboard/db-tickets";

export const metadata = {
  title: "Tickets de Soporte || Aerolia",
  description: "Administrar tickets de soporte",
};

export default function DbTickets() {
  return <GestionTickets />;
}
