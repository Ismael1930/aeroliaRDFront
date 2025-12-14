'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const SearchContext = createContext();

const defaultSearchData = {
  maletas: 0,
  pasajeros: { adultos: 1, ninos: 0 },
  origen: null,
  destino: null,
  // Date ranges: start and end for departure and return
  fechaSalidaInicio: null,
  fechaSalidaFin: null,
  fechaRegresoInicio: null,
  fechaRegresoFin: null,
  // Backwards compatibility single-date fields (kept for legacy code)
  fechaSalida: null,
  fechaRegreso: null,
  clase: 'Economica',
  tipoViaje: 'IdaYVuelta'
};

export const SearchProvider = ({ children }) => {
  const [searchData, setSearchData] = useState(defaultSearchData);
  const [initialized, setInitialized] = useState(false);

  // Cargar datos guardados al iniciar (solo una vez)
  useEffect(() => {
    if (typeof window !== 'undefined' && !initialized) {
      const savedData = localStorage.getItem('searchData');
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          // Migrate old single-date fields to new range fields if needed
          const migrated = { ...parsed };
          if (!('fechaSalidaInicio' in migrated) && parsed?.fechaSalida) {
            migrated.fechaSalidaInicio = parsed.fechaSalida;
            migrated.fechaSalidaFin = null;
          }
          if (!('fechaRegresoInicio' in migrated) && parsed?.fechaRegreso) {
            migrated.fechaRegresoInicio = parsed.fechaRegreso;
            migrated.fechaRegresoFin = null;
          }
          // For backwards compat, also keep single-date fields in sync
          if (!migrated.fechaSalida && migrated.fechaSalidaInicio) {
            migrated.fechaSalida = migrated.fechaSalidaInicio;
          }
          if (!migrated.fechaRegreso && migrated.fechaRegresoInicio) {
            migrated.fechaRegreso = migrated.fechaRegresoInicio;
          }
          setSearchData(migrated);
        } catch (error) {
          console.error('Error al cargar datos de búsqueda:', error);
        }
      }
      setInitialized(true);
    }
  }, []);

  const updateSearchData = (newData) => {
    setSearchData(prev => {
      // Build updated object and keep backwards-compatible fields in sync
      const updated = {
        ...prev,
        ...newData
      };

      // If new range start dates are provided, keep fechaSalida/fechaRegreso aligned
      if (newData.fechaSalidaInicio !== undefined) {
        updated.fechaSalida = newData.fechaSalidaInicio;
      }
      if (newData.fechaRegresoInicio !== undefined) {
        updated.fechaRegreso = newData.fechaRegresoInicio;
      }

      // Guardar en localStorage inmediatamente
      if (typeof window !== 'undefined') {
        localStorage.setItem('searchData', JSON.stringify(updated));
      }

      return updated;
    });
  };

  const clearSearchData = () => {
    setSearchData(defaultSearchData);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('searchData');
    }
  };

  return (
    <SearchContext.Provider
      value={{
        searchData,
        updateSearchData,
        clearSearchData
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch debe ser usado dentro de un SearchProvider');
  }
  return context;
};
