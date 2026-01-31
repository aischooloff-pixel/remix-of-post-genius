import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface AIProvider {
  api_key: string;
  endpoint_url: string;
  model_id: string;
  provider_type: string;
}

async function getDefaultProvider(supabase: any): Promise<AIProvider | null> {
  const { data, error } = await supabase
    .from("ai_providers")
    .select("api_key, endpoint_url, model_id, provider_type")
    .eq("is_default", true)
    .eq("is_active", true)
    .single();

  if (error || !data) {
    const { data: anyProvider } = await supabase
      .from("ai_providers")
      .select("api_key, endpoint_url, model_id, provider_type")
      .eq("is_active", true)
      .limit(1)
      .single();
    
    return anyProvider || null;
  }

  return data;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { text, instruction } = await req.json();
    
    // Get user's auth token
    const authHeader = req.headers.get("Authorization");
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader || "" } },
    });

    // Get user's AI provider
    const provider = await getDefaultProvider(supabase);
    
    let apiKey: string;
    let endpoint: string;
    let model: string;
    let extraHeaders: Record<string, string> = {};

    if (provider) {
      apiKey = provider.api_key;
      endpoint = provider.endpoint_url;
      model = provider.model_id;
      
      if (provider.provider_type === "openrouter") {
        extraHeaders = {
          "HTTP-Referer": "https://lovable.dev",
          "X-Title": "Telegram Post Editor",
        };
      }
      console.log("Using user's AI provider:", provider.provider_type, model);
    } else {
      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      if (!LOVABLE_API_KEY) {
        throw new Error("Нет настроенного AI провайдера. Добавьте API ключ в настройках.");
      }
      apiKey = LOVABLE_API_KEY;
      endpoint = "https://ai.gateway.lovable.dev/v1/chat/completions";
      model = "google/gemini-3-flash-preview";
      console.log("Using fallback Lovable AI");
    }

    console.log("Editing text with instruction:", instruction);

    const systemPrompt = `Ты — редактор постов для Telegram. Твоя задача — отредактировать текст согласно инструкции пользователя.

Правила:
1. Сохраняй общий смысл и структуру текста
2. Применяй ТОЛЬКО те изменения, которые запрошены
3. Результат должен быть совместим с Telegram MarkdownV2
4. Максимум 3 эмодзи
5. Не добавляй информацию, которой не было в оригинале

Верни ТОЛЬКО отредактированный текст в формате JSON:
{
  "text": "текст без форматирования",
  "textMarkdown": "текст с MarkdownV2",
  "textHtml": "текст с HTML"
}`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        ...extraHeaders,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Оригинальный текст:\n${text}\n\nИнструкция для редактирования:\n${instruction}` }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 401) {
        return new Response(JSON.stringify({ error: "Неверный API ключ. Проверьте настройки AI провайдера." }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse JSON from response
    let jsonContent = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonContent = jsonMatch[1];
    }
    
    let result;
    try {
      result = JSON.parse(jsonContent.trim());
    } catch {
      // If JSON parsing fails, treat the content as plain text
      result = {
        text: content.trim(),
        textMarkdown: content.trim(),
        textHtml: content.trim(),
      };
    }

    console.log("Successfully edited text");

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in edit-by-ai:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
