export default async function handler(req: any, res: any) {
  // 1. Permitir solo método POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 2. Obtener API key exclusivamente desde el entorno del servidor
  const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;

  if (!apiKey) {
    console.error('SERVER ERROR: OPENAI_API_KEY no configurada en las variables de entorno del servidor.');
    return res.status(500).json({ error: 'OpenAI API Key is missing on the server' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Formato de mensajes inválido' });
    }

    // 3. Llamar a OpenAI API desde el servidor de forma segura
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages
      })
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error('Error de OpenAI API:', openaiResponse.status, errorText);
      return res.status(openaiResponse.status).json({ error: 'Error al comunicarse con OpenAI' });
    }

    const data = await openaiResponse.json();
    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Error interno en /api/chat:', error);
    return res.status(500).json({ error: error?.message || 'Internal Server Error' });
  }
}
