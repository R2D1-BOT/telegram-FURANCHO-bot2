export default {
  async fetch(request, env, ctx) {
    if (request.method !== "POST") {
      return new Response("Agent worker is alive");
    }

    try {
      const { telegramPayload, agentId } = await request.json();
      const chatId = telegramPayload.message.chat.id;
      const text = telegramPayload.message.text;

      const retellResponse = `Response from Agent ${agentId} for: "${text}"`;

      const telegramApiUrl = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`;
      await fetch(telegramApiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: retellResponse,
        }),
      });

      const status_key = agentId === "agent_2034d1ed26b7511957e3168643" ? "AGENT1_STATUS" : "AGENT2_STATUS";
      await env.AGENTS_KV.put(status_key, "free");

      return new Response("Task processed by " + agentId);
    } catch (error) {
      return new Response("Error processed");
    }
  }
};

