"use client";

import { useState, useEffect, useCallback } from 'react'; // <-- Importa useCallback
import Head from 'next/head';
import { Bus, RefreshCw } from 'lucide-react';

// --- (El resto de tu código, como routesConfig y las interfaces, se mantiene igual) ---
const routesConfig = {
  "G38": {
    "IDA": [
      { id: "PG1790", name: "Mall Plaza Sur (IDA)"},
      { id: "PG1990", name: "Haras de Nos / Casas del Parque (IDA)" },
      { id: "PG374", name: "Hospital El Pino (IDA)" }
    ],
    "VUELTA": [
      { id: "PG2047", name: "Hospital El Pino (VUELTA)" },
      { id: "PG1981", name: "Haras de Nos / Casas del Parque (VUELTA)" },
      { id: "PG1790", name: "Mall Plaza Sur (VUELTA)" }
    ]
  },
  "G32": {
    "IDA": [
      { id: "PG1990", name: "Haras de Nos / Casas del Parque (IDA)" },
      { id: "PG741", name: "Estación San Bernardo (IDA)" }
    ],
    "VUELTA": [
      { id: "PG741", name: "Estación San Bernardo (VUELTA)" },
      { id: "PG1981", name: "Haras de Nos (VUELTA)" }
    ]
  },
  "G02": {
    "IDA": [
      { id: "PG1751", name: "Josefa Denos (Casa Nico) (IDA)" },
      { id: "PG728", name: "Estación Nos (IDA)" }
    ],
    "VUELTA": [
      { id: "PG1745", name: "Estación Nos (VUELTA)" },
      { id: "PG1752", name: "Josefa Denos (Casa Nico) (VUELTA)" }
    ]
  }
};
type RouteId = keyof typeof routesConfig;
type Direction = 'IDA' | 'VUELTA';
interface BusInfo {
  id: string;
  meters_distance: number;
  min_arrival_time: number;
  max_arrival_time: number;
}
interface BusStopData {
  stopId: string;
  stopName: string; 
  buses: BusInfo[];
}
// ------------------------------------------------------------------------------------

export default function HomePage() {
  const [selectedRoute, setSelectedRoute] = useState<RouteId>(Object.keys(routesConfig)[0] as RouteId);
  const [selectedDirection, setSelectedDirection] = useState<Direction>('IDA');
  const [busData, setBusData] = useState<BusStopData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // --- Envuelve fetchData en useCallback ---
  const fetchData = useCallback(async () => {
    const stopsToFetch = routesConfig[selectedRoute][selectedDirection];

    if (!stopsToFetch || stopsToFetch.length === 0) {
      setBusData([]);
      return;
    }

    const stopIds = stopsToFetch.map(stop => stop.id).join(',');
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/bus-status?stopIds=${stopIds}&routeId=${selectedRoute}`);
      if (!response.ok) {
        throw new Error('No se pudo obtener la información.');
      }
      const data = await response.json();
      setBusData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado.');
    } finally {
      setIsLoading(false);
    }
    // Agrega las dependencias de la función aquí
  }, [selectedRoute, selectedDirection]);

  // --- El useEffect ahora depende de la función fetchData ---
  useEffect(() => {
    fetchData();
  }, [fetchData]); // <-- Ahora fetchData es una dependencia estable

  const currentStops = routesConfig[selectedRoute][selectedDirection] || [];

  return (
    // --- (El resto de tu JSX se mantiene exactamente igual) ---
    <>
      <Head>
        <title>Cuando viene la micro?</title>
        <meta name="description" content="Cuando vienen las micros en San Bernardo?" />
      </Head>
      <main className="flex flex-col items-center min-h-screen bg-gray-100 dark:bg-black p-4 sm:p-8 font-sans transition-colors duration-300">
        <div className="w-full max-w-4xl mx-auto">
          <header className="relative text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 dark:text-gray-100">
              Cuando <span className="text-gray-600 dark:text-gray-400">viene</span> la <span className="text-gray-600 dark:text-gray-400">micro</span>?
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Selecciona un recorrido y sentido para ver su estado.
            </p>
          </header>
          <div className="p-4 bg-white dark:bg-gray-900/50 dark:border dark:border-gray-700 rounded-lg shadow-md mb-8 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="route-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Recorrido
                </label>
                <select
                  id="route-select"
                  value={selectedRoute}
                  onChange={(e) => {
                    const newRoute = e.target.value as RouteId;
                    setSelectedRoute(newRoute);
                    if (!routesConfig[newRoute][selectedDirection]) {
                      setSelectedDirection('IDA');
                    }
                  }}
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-gray-500 focus:border-gray-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                >
                  {Object.keys(routesConfig).map((route) => (
                    <option key={route} value={route}>{route}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Sentido
                </label>
                <div className="flex gap-2">
                  {(['IDA', 'VUELTA'] as Direction[]).map(dir => (
                    <button
                      key={dir}
                      onClick={() => setSelectedDirection(dir)}
                      disabled={!routesConfig[selectedRoute][dir]}
                      className={`w-full p-2 font-semibold rounded-md transition-colors ${selectedDirection === dir ? 'bg-black text-white dark:bg-gray-300 dark:text-black' : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'} disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50`}
                    >
                      {dir}
                    </button>
                  ))}
                </div>
              </div>
            </div>
             <button
                onClick={fetchData}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-black text-white font-semibold rounded-md shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-gray-300 dark:text-black dark:hover:bg-white disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Actualizando...' : 'Actualizar'}
              </button>
          </div>
          <div className="space-y-6">
            {isLoading ? (
              <p className="text-center text-gray-600 dark:text-gray-400">Cargando información...</p>
            ) : error ? (
              <p className="text-center text-red-500">{error}</p>
            ) : currentStops.length > 0 ? (
                currentStops.map((stopConfig) => {
                  const stopData = busData.find(data => data.stopId === stopConfig.id);
                  return (
                    <div key={stopConfig.id} className="bg-white dark:bg-gray-900/50 dark:border dark:border-gray-700 rounded-lg shadow-lg overflow-hidden">
                      <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white">{stopConfig.name}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Paradero: {stopConfig.id}</p>
                      </div>
                      <div className="p-4">
                        {stopData && stopData.buses.length > 0 ? (
                          <ul className="space-y-3">
                            {stopData.buses.map((bus) => (
                              <li key={bus.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-md">
                                <div className="flex items-center gap-3 mb-2 sm:mb-0">
                                  <Bus className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                                  <span className="font-mono text-lg text-gray-900 dark:text-white">{bus.id}</span>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 text-sm text-gray-600 dark:text-gray-300 w-full sm:w-auto">
                                  <span>Distancia:</span> <span className="font-semibold text-right sm:text-left">{bus.meters_distance} mts</span>
                                  <span>Llegada:</span> <span className="font-semibold text-right sm:text-left">{bus.min_arrival_time}-{bus.max_arrival_time} min</span>
                                </div>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-500 dark:text-gray-400">No hay buses del recorrido {selectedRoute} en camino a este paradero.</p>
                        )}
                      </div>
                    </div>
                  );
                })
            ) : (
                 <p className="text-center text-gray-500 dark:text-gray-400">No hay paraderos definidos para esta selección.</p>
            )}
          </div>
        </div>
        <footer className="w-full max-w-4xl mx-auto mt-12 py-4 border-t border-gray-200 dark:border-gray-800">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Desarrollado con NextJS por Vicente Pardo
          </p>
        </footer>
      </main>
    </>
  );
}
