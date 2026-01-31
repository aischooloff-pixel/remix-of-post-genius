import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScheduledPost {
  id: string;
  edited_text_markdown: string;
  media: Array<{ type: string; url: string }> | null;
  buttons: Array<{ text: string; type: string; payload: string; row: number }> | null;
  schedule_datetime: string;
  channels: {
    channel_id: string;
    bot_tokens: {
      encrypted_token: string;
    } | null;
  } | null;
}

function buildInlineKeyboard(buttons: ScheduledPost['buttons']) {
  if (!buttons || buttons.length === 0) return undefined;

  const rows: Record<number, Array<{ text: string; url?: string; callback_data?: string }>> = {};
  
  for (const btn of buttons) {
    if (!rows[btn.row]) rows[btn.row] = [];
    rows[btn.row].push({
      text: btn.text,
      ...(btn.type === 'url' ? { url: btn.payload } : { callback_data: btn.payload || btn.text }),
    });
  }

  const keyboard = Object.keys(rows)
    .sort((a, b) => Number(a) - Number(b))
    .map(key => rows[Number(key)]);

  return { inline_keyboard: keyboard };
}

// Convert markdown to Telegram HTML
function markdownToTelegramHtml(text: string): string {
  let result = text;
  
  // Links first
  result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  
  // Code blocks
  result = result.replace(/```([\s\S]+?)```/g, '<pre>$1</pre>');
  result = result.replace(/`([^`]+)`/g, '<code>$1</code>');
  
  // Spoiler
  result = result.replace(/\|\|([^|]+)\|\|/g, '<tg-spoiler>$1</tg-spoiler>');
  
  // Underline before italic
  result = result.replace(/__([^_]+)__/g, '<u>$1</u>');
  
  // Bold
  result = result.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
  result = result.replace(/\*([^*]+)\*/g, '<b>$1</b>');
  
  // Italic
  result = result.replace(/_([^_]+)_/g, '<i>$1</i>');
  
  // Strikethrough
  result = result.replace(/~([^~]+)~/g, '<s>$1</s>');
  
  return result;
}

async function sendTelegramMessage(
  botToken: string,
  chatId: string,
  text: string,
  media: ScheduledPost['media'],
  buttons: ScheduledPost['buttons']
): Promise<{ success: boolean; messageId?: number; error?: string }> {
  const htmlText = markdownToTelegramHtml(text);
  const replyMarkup = buildInlineKeyboard(buttons);

  try {
    let result;

    if (media && media.length > 0) {
      if (media.length === 1) {
        const m = media[0];
        const method = m.type === 'photo' ? 'sendPhoto' : m.type === 'video' ? 'sendVideo' : 'sendDocument';
        const mediaKey = m.type === 'photo' ? 'photo' : m.type === 'video' ? 'video' : 'document';
        
        const response = await fetch(`https://api.telegram.org/bot${botToken}/${method}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            [mediaKey]: m.url,
            caption: htmlText,
            parse_mode: 'HTML',
            reply_markup: replyMarkup,
          }),
        });
        result = await response.json();
      } else {
        // Media group
        const mediaGroup = media.map((m, i) => ({
          type: m.type === 'photo' ? 'photo' : 'video',
          media: m.url,
          ...(i === 0 ? { caption: htmlText, parse_mode: 'HTML' } : {}),
        }));

        const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMediaGroup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            media: mediaGroup,
          }),
        });
        result = await response.json();

        // Send buttons separately for media groups
        if (replyMarkup && result.ok) {
          await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: '👆 Кнопки к посту выше',
              reply_markup: replyMarkup,
            }),
          });
        }
      }
    } else {
      // Text only
      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: htmlText,
          parse_mode: 'HTML',
          reply_markup: replyMarkup,
        }),
      });
      result = await response.json();
    }

    if (!result.ok) {
      return { success: false, error: result.description || 'Telegram API error' };
    }

    const messageId = Array.isArray(result.result) 
      ? result.result[0]?.message_id 
      : result.result?.message_id;

    return { success: true, messageId };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all scheduled posts where schedule_datetime <= now
    const now = new Date().toISOString();
    
    console.log(`[CRON] Checking for scheduled posts at ${now}`);

    const { data: posts, error: fetchError } = await supabase
      .from('posts')
      .select(`
        id,
        edited_text_markdown,
        media,
        buttons,
        schedule_datetime,
        channels (
          channel_id,
          bot_tokens (
            encrypted_token
          )
        )
      `)
      .eq('status', 'scheduled')
      .lte('schedule_datetime', now);

    if (fetchError) {
      console.error('[CRON] Error fetching scheduled posts:', fetchError);
      throw fetchError;
    }

    if (!posts || posts.length === 0) {
      console.log('[CRON] No scheduled posts to send');
      return new Response(
        JSON.stringify({ message: 'No scheduled posts', count: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[CRON] Found ${posts.length} posts to send`);

    const results: Array<{ id: string; success: boolean; error?: string }> = [];

    for (const post of posts as unknown as ScheduledPost[]) {
      const channel = post.channels;
      const botToken = channel?.bot_tokens?.encrypted_token;
      const chatId = channel?.channel_id;
      const text = post.edited_text_markdown;

      if (!botToken || !chatId || !text) {
        console.error(`[CRON] Missing data for post ${post.id}:`, { 
          hasBotToken: !!botToken, 
          hasChatId: !!chatId, 
          hasText: !!text 
        });
        
        // Mark as failed
        await supabase
          .from('posts')
          .update({ 
            status: 'failed', 
            error_message: 'Missing bot token, channel, or text' 
          })
          .eq('id', post.id);
        
        results.push({ id: post.id, success: false, error: 'Missing required data' });
        continue;
      }

      console.log(`[CRON] Sending post ${post.id} to channel ${chatId}`);

      // Update status to sending
      await supabase
        .from('posts')
        .update({ status: 'sending' })
        .eq('id', post.id);

      const sendResult = await sendTelegramMessage(
        botToken,
        chatId,
        text,
        post.media,
        post.buttons
      );

      if (sendResult.success) {
        console.log(`[CRON] Successfully sent post ${post.id}, message_id: ${sendResult.messageId}`);
        
        await supabase
          .from('posts')
          .update({ 
            status: 'sent',
            telegram_message_id: sendResult.messageId,
            sent_at: new Date().toISOString(),
          })
          .eq('id', post.id);
        
        results.push({ id: post.id, success: true });
      } else {
        console.error(`[CRON] Failed to send post ${post.id}:`, sendResult.error);
        
        await supabase
          .from('posts')
          .update({ 
            status: 'failed',
            error_message: sendResult.error,
          })
          .eq('id', post.id);
        
        results.push({ id: post.id, success: false, error: sendResult.error });
      }
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`[CRON] Completed: ${successCount}/${results.length} posts sent successfully`);

    return new Response(
      JSON.stringify({ 
        message: `Processed ${results.length} posts`, 
        success: successCount,
        failed: results.length - successCount,
        results 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[CRON] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
