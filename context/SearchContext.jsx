'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const SearchContext = createContext();

const defaultSearchData = {
  maletas: 0,
  pasajeros: { adultos: 1, ninos: 0 },
  origen: null,
  destino: null,
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
          setSearchData(parsed);
        } catch (error) {
          console.error('Error al cargar datos de búsqueda:', error);
        }
      }
      setInitialized(true);
    }
  }, []);

  const updateSearchData = (newData) => {
    setSearchData(prev => {
      const updated = {
        ...prev,
        ...newData
      };
      
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
