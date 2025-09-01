// Código del Worker Obrero (para Agente 1 y 2)
export default {
  async fetch(request, env, ctx) {
    // Un obrero solo acepta órdenes por POST.
    if (request.method !== "POST") {
      return new Response("OK. Worker is alive.", { status: 200 });
    }

    // 1. Recibir la tarea del Orquestador
    const { telegramPayload, agentId } = await request.json();
    const chatId = telegramPayload.message.chat.id;
    const text = telegramPayload.message.text;

    // 2. Ejecutar la lógica de Retell (simulada)
    // Aquí usarías env.RETELL_API_KEY y el agentId que te llega.
    const retellResponse = `Response from Agent ${agentId} for: "${text}"`;

    // 3. Responder al usuario a través de la API de Telegram
    const telegramApiUrl = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`;
    await fetch(telegramApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: retellResponse,
      } ),
    });

    // 4. Devolver una respuesta al Orquestador (aunque no la espere)
    return new Response("Task processed by " + agentId);
  }
};

