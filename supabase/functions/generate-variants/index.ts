import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const TONE_LABELS: Record<string, string> = {
  drive: "Драйвовый",
  info: "Информативный", 
  promo: "Продающий",
  friendly: "Дружелюбный",
  formal: "Формальный",
};

const LENGTH_LABELS: Record<string, string> = {
  short: "Короткий (1-3 предложения)",
  medium: "Средний (4-6 предложений)",
  long: "Длинный (7+ предложений)",
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { idea, tone, length, goal, targetAudience, systemPrompt, template } = await req.json();
    
    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    if (!OPENROUTER_API_KEY) {
      throw new Error("OPENROUTER_API_KEY is not configured");
    }

    console.log("Generating variants for idea:", idea.substring(0, 50) + "...");
    if (template) {
      console.log("Using template:", template.substring(0, 100) + "...");
    }

    const templateInstruction = template 
      ? `

ОБЯЗАТЕЛЬНАЯ СТРУКТУРА ПОСТА:
Каждый вариант ДОЛЖЕН следовать этой структуре:
\`\`\`
${template}
\`\`\`

ПРАВИЛА ФОРМАТИРОВАНИЯ:
- **жирный текст** — используй для заголовков и ключевых слов
- _курсивный текст_ — для акцентов и выделений  
- [текст ссылки](URL) — для ссылок
- Сохраняй структуру шаблона (заголовок, пункты, вывод и т.д.)
- В textMarkdown используй Telegram MarkdownV2: *жирный*, _курсив_
- В textHtml используй HTML: <b>жирный</b>, <i>курсив</i>, <a href="url">ссылка</a>
`
      : '';

    const defaultSystemPrompt = `Ты — профессиональный автор постов для Telegram. Задача: по идее/бриффу сгенерировать 3 варианта поста.

Тон: ${TONE_LABELS[tone] || tone}
Длина: ${LENGTH_LABELS[length] || length}
${goal ? `Цель: ${goal}` : ''}
${targetAudience ? `Целевая аудитория: ${targetAudience}` : ''}${templateInstruction}

${!template ? `Стили вариантов:
1) Короткий крючок (hook) + практический совет, 1–3 предложения.
2) Развёрнутый гайд — 4–8 предложений, структурированные абзацы.
3) Продающий вариант с мягким CTA в конце.` : 'Все 3 варианта должны следовать указанной структуре, но с разными формулировками и акцентами.'}

Ограничения: максимум 3 эмодзи; не придумывай фактов.

ВАЖНО: Верни ТОЛЬКО валидный JSON массив без дополнительного текста. Формат:
[
  {"id": "v1", "style": "hook", "styleName": "${template ? 'Вариант A' : 'Крючок + совет'}", "text": "текст без форматирования", "textMarkdown": "текст с MarkdownV2: *жирный* _курсив_", "textHtml": "текст с HTML: <b>жирный</b> <i>курсив</i>"},
  {"id": "v2", "style": "guide", "styleName": "${template ? 'Вариант B' : 'Развёрнутый гайд'}", "text": "...", "textMarkdown": "...", "textHtml": "..."},
  {"id": "v3", "style": "promo", "styleName": "${template ? 'Вариант C' : 'Продающий'}", "text": "...", "textMarkdown": "...", "textHtml": "..."}
]`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://lovable.dev",
        "X-Title": "Telegram Post Generator",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.3-70b-instruct:free",
        messages: [
          { role: "system", content: systemPrompt || defaultSystemPrompt },
          { role: "user", content: `Идея для поста:\n\n${idea}` }
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
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("No content in AI response");
    }

    console.log("Raw AI response:", content.substring(0, 200) + "...");

    // Parse JSON from response (handle markdown code blocks)
    let jsonContent = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonContent = jsonMatch[1];
    }
    
    // Clean up the content
    jsonContent = jsonContent.trim();
    
    let variants;
    try {
      variants = JSON.parse(jsonContent);
    } catch (parseError) {
      console.error("Failed to parse JSON:", parseError);
      console.error("Content was:", jsonContent);
      throw new Error("Failed to parse AI response as JSON");
    }

    // Add labels and timestamps
    const labels = ['A', 'B', 'C'];
    const processedVariants = variants.map((v: any, i: number) => ({
      ...v,
      id: v.id || `v${i + 1}`,
      label: labels[i] || String.fromCharCode(65 + i),
      tokensUsed: data.usage?.completion_tokens ? Math.floor(data.usage.completion_tokens / 3) : 50,
      createdAt: new Date().toISOString(),
    }));

    console.log("Successfully generated", processedVariants.length, "variants");

    return new Response(JSON.stringify({ variants: processedVariants }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in generate-variants:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
