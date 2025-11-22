// src/app/api/bus-status/route.ts

import { NextResponse } from 'next/server';

interface Bus {
  id: string;
  meters_distance: number;
  min_arrival_time: number;
  max_arrival_time: number;
}

interface Service {
  id: string;
  valid: boolean;
  status_description: string;
  buses: Bus[];
}

interface BusStopApiResponse {
  id: string;
  name: string;
  services: Service[];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const stopIds = searchParams.get('stopIds');
  const routeId = searchParams.get('routeId');

  if (!stopIds || !routeId) {
    return NextResponse.json({ error: 'Faltan los parámetros stopIds o routeId.' }, { status: 400 });
  }

  const stopIdArray = stopIds.split(',');
  const API_URL = 'https://spb82m8sd209.share.zrok.io/bus-stop/';

  try {
    const responses = await Promise.all(
      stopIdArray.map(id =>
        fetch(`${API_URL}${id}`).then(apiRes => {
          if (!apiRes.ok) {
            throw new Error(`Error al obtener datos del paradero ${id}`);
          }
          return apiRes.json();
        })
      )
    );

    const result = responses.map((data: BusStopApiResponse) => { // Usamos la nueva interfaz
      const relevantService = data.services.find(
        (service: Service) => service.id === routeId
      );
      return {
        stopId: data.id,
        stopName: data.name,
        buses: relevantService ? relevantService.buses : [],
      };
    });

    return NextResponse.json(result);
    
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'Error en el servidor.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
