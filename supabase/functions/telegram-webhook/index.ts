import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

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
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const botTokenId = pathParts[pathParts.length - 1];

    if (!botTokenId || botTokenId === 'telegram-webhook') {
      return new Response(JSON.stringify({ error: "Bot token ID required in path" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get bot token from database
    const { data: botData, error: botError } = await supabase
      .from("bot_tokens")
      .select("encrypted_token")
      .eq("id", botTokenId)
      .single();

    if (botError || !botData) {
      console.error("Bot not found:", botError);
      return new Response(JSON.stringify({ error: "Bot not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const botToken = botData.encrypted_token;
    const update = await req.json();

    console.log("Received update:", JSON.stringify(update));

    // Handle /start command
    if (update.message?.text === "/start") {
      const chatId = update.message.chat.id;

      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: WELCOME_MESSAGE,
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
