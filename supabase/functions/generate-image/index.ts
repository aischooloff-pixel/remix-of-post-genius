import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Convert base64 to Uint8Array for upload
function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { prompt, style, count = 1 } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase configuration is missing");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    console.log("Generating image with prompt:", prompt.substring(0, 50) + "...");

    const fullPrompt = style 
      ? `${prompt}, ${style} style, high quality, suitable for Telegram post`
      : `${prompt}, high quality, suitable for Telegram post`;

    const images = [];
    
    for (let i = 0; i < Math.min(count, 4); i++) {
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image",
          messages: [
            { role: "user", content: fullPrompt }
          ],
          modalities: ["image", "text"],
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
      const imageDataUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      
      if (imageDataUrl) {
        // Extract base64 data from data URL
        const matches = imageDataUrl.match(/^data:image\/(\w+);base64,(.+)$/);
        
        if (matches) {
          const imageFormat = matches[1];
          const base64Data = matches[2];
          const imageBytes = base64ToUint8Array(base64Data);
          
          const imageId = crypto.randomUUID();
          const fileName = `${imageId}.${imageFormat}`;
          const filePath = `generated/${fileName}`;
          
          // Upload to Supabase Storage
          const { error: uploadError } = await supabase.storage
            .from('post-media')
            .upload(filePath, imageBytes, {
              contentType: `image/${imageFormat}`,
              upsert: false,
            });
          
          if (uploadError) {
            console.error("Storage upload error:", uploadError);
            throw new Error(`Failed to upload image: ${uploadError.message}`);
          }
          
          // Get public URL
          const { data: urlData } = supabase.storage
            .from('post-media')
            .getPublicUrl(filePath);
          
          console.log("Uploaded image to storage:", urlData.publicUrl);
          
          images.push({
            id: imageId,
            url: urlData.publicUrl,
            type: 'photo',
            generatedBy: 'lovable-ai',
          });
        } else {
          // If not a data URL, use as-is (might be an external URL)
          images.push({
            id: crypto.randomUUID(),
            url: imageDataUrl,
            type: 'photo',
            generatedBy: 'lovable-ai',
          });
        }
      }
    }

    if (images.length === 0) {
      throw new Error("Failed to generate any images");
    }

    console.log("Successfully generated", images.length, "images");

    return new Response(JSON.stringify({ images }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in generate-image:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
