import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface PublishRequest {
  botToken: string;
  chatId: string;
  text: string;
  parseMode?: 'MarkdownV2' | 'HTML';
  media?: Array<{
    type: 'photo' | 'video' | 'document';
    url: string;
  }>;
  buttons?: Array<{
    text: string;
    url?: string;
    callback_data?: string;
    row: number;
  }>;
  scheduleDatetime?: string;
}

function buildInlineKeyboard(buttons: PublishRequest['buttons']) {
  if (!buttons || buttons.length === 0) return undefined;

  // Group buttons by row
  const rows: Record<number, Array<{ text: string; url?: string; callback_data?: string }>> = {};
  
  for (const btn of buttons) {
    if (!rows[btn.row]) rows[btn.row] = [];
    rows[btn.row].push({
      text: btn.text,
      ...(btn.url ? { url: btn.url } : { callback_data: btn.callback_data || btn.text }),
    });
  }

  // Convert to array of arrays sorted by row number
  const keyboard = Object.keys(rows)
    .sort((a, b) => Number(a) - Number(b))
    .map(key => rows[Number(key)]);

  return { inline_keyboard: keyboard };
}

async function sendTelegramRequest(botToken: string, method: string, body: Record<string, unknown>) {
  const response = await fetch(`https://api.telegram.org/bot${botToken}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  
  if (!data.ok) {
    console.error('Telegram API error:', data);
    throw new Error(data.description || 'Telegram API error');
  }

  return data;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { botToken, chatId, text, parseMode, media, buttons, scheduleDatetime }: PublishRequest = await req.json();

    if (!botToken || !chatId || !text) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: botToken, chatId, text' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Publishing to Telegram:', { chatId, textLength: text.length, hasMedia: !!media?.length, hasButtons: !!buttons?.length });

    const replyMarkup = buildInlineKeyboard(buttons);
    
    // Calculate schedule_date if provided (must be 5+ minutes in future)
    let scheduleDate: number | undefined;
    if (scheduleDatetime) {
      const scheduleTime = new Date(scheduleDatetime).getTime() / 1000;
      const now = Date.now() / 1000;
      if (scheduleTime > now + 300) { // 5 minutes minimum
        scheduleDate = Math.floor(scheduleTime);
      }
    }

    let result;

    if (media && media.length > 0) {
      if (media.length === 1) {
        // Single media
        const m = media[0];
        const method = m.type === 'photo' ? 'sendPhoto' : m.type === 'video' ? 'sendVideo' : 'sendDocument';
        const mediaKey = m.type === 'photo' ? 'photo' : m.type === 'video' ? 'video' : 'document';
        
        result = await sendTelegramRequest(botToken, method, {
          chat_id: chatId,
          [mediaKey]: m.url,
          caption: text,
          parse_mode: parseMode,
          reply_markup: replyMarkup,
          ...(scheduleDate && { message_thread_id: undefined }), // schedule_date not available for media
        });
      } else {
        // Media group (album)
        const mediaGroup = media.map((m, i) => ({
          type: m.type === 'photo' ? 'photo' : 'video',
          media: m.url,
          ...(i === 0 ? { caption: text, parse_mode: parseMode } : {}),
        }));

        result = await sendTelegramRequest(botToken, 'sendMediaGroup', {
          chat_id: chatId,
          media: mediaGroup,
        });

        // Send buttons separately if present (media groups don't support inline keyboards)
        if (replyMarkup) {
          await sendTelegramRequest(botToken, 'sendMessage', {
            chat_id: chatId,
            text: '👆 Кнопки к посту выше',
            reply_markup: replyMarkup,
          });
        }
      }
    } else {
      // Text only message
      result = await sendTelegramRequest(botToken, 'sendMessage', {
        chat_id: chatId,
        text,
        parse_mode: parseMode,
        reply_markup: replyMarkup,
        ...(scheduleDate && { schedule_date: scheduleDate }),
      });
    }

    console.log('Successfully published, message_id:', result.result?.message_id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: result.result?.message_id,
        scheduled: !!scheduleDate,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error publishing:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
