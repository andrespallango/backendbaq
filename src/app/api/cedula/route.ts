import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const identificacion = request.nextUrl.searchParams.get('identificacion');
  const tipo = request.nextUrl.searchParams.get('tipo'); // 'cedula' o 'ruc'

  if (!identificacion || !tipo) {
    return NextResponse.json(
      { error: 'Faltan parámetros: tipo o identificación' },
      {
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': 'http://localhost:4200'
        }
      }
    );
  }

  const endpoint =
    tipo === 'cedula'
      ? `https://webservices.ec/api/cedula/${identificacion}`
      : `https://webservices.ec/api/ruc/${identificacion}`;

  const token =
    tipo === 'cedula'
      ? 'l5tSaXEII9uF5crWVJTiUdQC1vF8horyQACdzUHq'
      : 'nF48JJ6ga1xCvqHCBlNHwT9GaLXEjLsqu3mFz3sT';

  try {
    const respuesta = await fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      }
    });

    const data = await respuesta.json();

    // Si es cédula
    if (tipo === 'cedula') {
      const resultado = data?.data?.response;

      if (!resultado) {
        return NextResponse.json(
          { error: 'No se encontraron datos para la cédula' },
          {
            status: 404,
            headers: { 'Access-Control-Allow-Origin': 'http://localhost:4200' }
          }
        );
      }

      return NextResponse.json(
        {
          tipo: 'cedula',
          nombre: resultado.nombres || '',
          apellido: resultado.apellidos || resultado.nombreCompleto || ''
        },
        {
          headers: { 'Access-Control-Allow-Origin': 'http://localhost:4200' }
        }
      );
    }

    // Si es RUC
    if (tipo === 'ruc') {
      const rucInfo = data?.data?.main?.[0];

      if (!rucInfo) {
        return NextResponse.json(
          { error: 'No se encontraron datos para el RUC' },
          {
            status: 404,
            headers: { 'Access-Control-Allow-Origin': 'http://localhost:4200' }
          }
        );
      }

      return NextResponse.json(
        {
          tipo: 'ruc',
          razonSocial: rucInfo.razonSocial,
          actividad: rucInfo.actividadEconomicaPrincipal,
          estado: rucInfo.estadoContribuyenteRuc,
          obligadoContabilidad: rucInfo.obligadoLlevarContabilidad,
          nombreFantasia: data?.data?.addit?.[0]?.nombreFantasiaComercial || ''
        },
        {
          headers: { 'Access-Control-Allow-Origin': 'http://localhost:4200' }
        }
      );
    }

    return NextResponse.json(
      { error: 'Tipo no soportado' },
      {
        status: 400,
        headers: { 'Access-Control-Allow-Origin': 'http://localhost:4200' }
      }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al contactar el servicio' },
      {
        status: 500,
        headers: { 'Access-Control-Allow-Origin': 'http://localhost:4200' }
      }
    );
  }
}
