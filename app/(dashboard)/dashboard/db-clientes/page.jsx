import GestionClientes from "@/components/dashboard/dashboard/db-clientes";

export const metadata = {
  title: "Gestión de Clientes || Aerolia",
  description: "Administrar clientes del sistema",
};

export default function DbClientes() {
  return <GestionClientes />;
}
