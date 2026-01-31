import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const WELCOME_MESSAGE = `🚀 *Добро пожаловать в TelePost\\!*

Автоматизируйте создание постов для Telegram с помощью AI:

✨ Генерация текстов постов
🎨 Создание изображений
📅 Планирование публикаций
📊 Управление каналами

Нажмите кнопку ниже, чтобы открыть приложение 👇`;

const APP_URL = "https://t.me/Ai_TelePost_Bot/app";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");
    
    if (!BOT_TOKEN) {
      console.error("TELEGRAM_BOT_TOKEN not configured");
      return new Response(JSON.stringify({ error: "Bot token not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const update = await req.json();
    console.log("Received update:", JSON.stringify(update));

    // Handle /start command
    if (update.message?.text === "/start") {
      const chatId = update.message.chat.id;
      const userName = update.message.from?.first_name || "друг";

      const personalizedMessage = `👋 Привет, *${userName.replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&')}*\\!\n\n${WELCOME_MESSAGE}`;

      const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: personalizedMessage,
          parse_mode: "MarkdownV2",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "🚀 Открыть приложение",
                  url: APP_URL,
                }
              ]
            ]
          }
        }),
      });

      const result = await response.json();
      console.log("Send message result:", result);

      if (!response.ok) {
        console.error("Telegram API error:", result);
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
