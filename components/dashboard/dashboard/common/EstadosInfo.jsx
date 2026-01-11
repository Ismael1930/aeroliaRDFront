'use client'

const EstadosInfo = () => {
  return (
    <div className="rounded-4 bg-blue-1-05 px-20 py-15 mb-20">
      <div className="d-flex items-start">
        <i className="icon-info-circle text-blue-1 text-20 mr-10 mt-5"></i>
        <div>
          <div className="text-15 fw-500 text-blue-1 mb-5">Estados Automáticos del Sistema</div>
          <div className="text-13 text-dark-1">
            <strong>Vuelos:</strong> Los estados cambian automáticamente según la hora actual.
            <br />
            <strong>Aeronaves:</strong> Pasan automáticamente a "En Mantenimiento" (2h) después de completar un vuelo.
            <br />
            <strong>Equipos y Personal:</strong> Entran en "Descanso" (12h) automáticamente después de completar un vuelo.
          </div>
        </div>
      </div>
    </div>
  );
};

export default EstadosInfo;
