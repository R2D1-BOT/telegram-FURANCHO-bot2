export default {
  async fetch(request, env, ctx) {
    try {
      const data = await request.json(); // Asumimos webhook JSON de Telegram/WhatsApp
      const { chatId, message } = data;

      // 1️⃣ Verificar agente libre
      const agent = await getAvailableAgent(env);

      if(agent) {
        // Si hay agente libre, procesar mensaje inmediatamente
        await processMessageWithAgent(env, agent, { chatId, message });
      } else {
        // Si no hay agente libre, agregar a cola
        await enqueueMessage(env, chatId, message);
      }

      return new Response(JSON.stringify({ status: 'received', agent: agent || null }), { status: 200 });

    } catch(err) {
      console.error(err);
      return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
  }
}

// -------------------- Funciones auxiliares -------------------- //

async function getAvailableAgent(env) {
  const bot1 = await env.AGENTS_KV.get('BOT1_STATUS');
  if(bot1 === 'free') return 'BOT1';
  const bot2 = await env.AGENTS_KV.get('BOT2_STATUS');
  if(bot2 === 'free') return 'BOT2';
  return null;
}

async function enqueueMessage(env, chatId, message) {
  const queueRaw = await env.AGENTS_KV.get('GLOBAL_QUEUE');
  const queue = queueRaw ? JSON.parse(queueRaw) : [];
  queue.push({ chatId, message, timestamp: Date.now() });
  await env.AGENTS_KV.put('GLOBAL_QUEUE', JSON.stringify(queue));
}

async function freeAgent(env, agentId) {
  await env.AGENTS_KV.put(agentId + '_STATUS', 'free');

  const queueRaw = await env.AGENTS_KV.get('GLOBAL_QUEUE');
  let queue = queueRaw ? JSON.parse(queueRaw) : [];
  if(queue.length === 0) return;

  const nextMessage = queue.shift();
  await env.AGENTS_KV.put('GLOBAL_QUEUE', JSON.stringify(queue));

  await processMessageWithAgent(env, agentId, nextMessage);
}

async function processMessageWithAgent(env, agentId, { chatId, message }) {
  await env.AGENTS_KV.put(agentId + '_STATUS', 'busy');

  // 🔹 Aquí va tu integración con Retell AI
  const response = await callRetellAgent(agentId, message);

  // 🔹 Envía respuesta a Telegram o WhatsApp
  await sendTelegramMessage(chatId, response);

  // Liberar agente después de responder
  await freeAgent(env, agentId);
}

// -------------------- Funciones de integración -------------------- //

async function callRetellAgent(agentId, message) {
  // Llama tu bot Retell AI con la información del agente
  // Devuelve respuesta en texto
  return `Respuesta simulada de ${agentId}: ${message}`;
}

async function sendTelegramMessage(chatId, text) {
  // Llama tu API de Telegram o WhatsApp para enviar mensaje
  console.log(`Enviando a ${chatId}: ${text}`);
}

