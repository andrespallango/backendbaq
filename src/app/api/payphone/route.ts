import { NextRequest, NextResponse } from "next/server";

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function POST(req: NextRequest) {
  try {
    const { amount, phoneNumber, cedula } = await req.json();
    console.log('📤 Datos recibidos:', { amount, phoneNumber, cedula });

    // AUTENTICACIÓN
    const authRes = await fetch('https://pay.payphonetodoesposible.com/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user: 'gina.proanio@hotmail.com',
        password: 'Gsptb$19764975'
      })
    });

    const authData = await authRes.json();
    console.log('🔑 Respuesta de autenticación:', authData);

    const token = authData.token;
    if (!token) throw new Error('No se recibió token');

    // CREAR TRANSACCIÓN
    const transRes = await fetch('https://pay.payphonetodoesposible.com/api/Sale', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount,
        amountWithoutTax: amount,
        tax: 0,
        clientTransactionId: `txn_${Date.now()}`,
        phoneNumber,
        countryCode: '593',
        storeId: 13183,
        reference: `Donación CI ${cedula || 'no especificado'}`,
        responseUrl: 'http://localhost:4200/confirmacion'
      })
    });

    const result = await transRes.json();
    console.log('💰 Resultado de transacción:', result);

    if (!result.paymentUrl) {
      return NextResponse.json({ error: 'Error al generar transacción PayPhone' }, { status: 500, headers: CORS_HEADERS });
    }

    return NextResponse.json({ paymentUrl: result.paymentUrl }, { headers: CORS_HEADERS });

  } catch (err: any) {
    console.error('❌ Error en el backend PayPhone:', err);
    return NextResponse.json({ error: err.message || 'Error interno' }, {
      status: 500,
      headers: CORS_HEADERS
    });
  }
}
