import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function extractJson(text: string): Record<string, unknown> {
  let cleaned = text
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  const jsonStart = cleaned.search(/[\{\[]/);
  const jsonEnd = cleaned.lastIndexOf(jsonStart !== -1 && cleaned[jsonStart] === "[" ? "]" : "}");

  if (jsonStart === -1 || jsonEnd === -1) {
    throw new Error("No JSON found in response");
  }

  cleaned = cleaned.substring(jsonStart, jsonEnd + 1);

  try {
    return JSON.parse(cleaned);
  } catch {
    cleaned = cleaned
      .replace(/,\s*}/g, "}")
      .replace(/,\s*]/g, "]")
      .replace(/[\x00-\x1F\x7F]/g, "");
    return JSON.parse(cleaned);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { game_id, title, description } = await req.json();

    if (!game_id || !title) {
      return new Response(JSON.stringify({ error: "game_id and title are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if info already exists in DB
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: existing } = await supabase
      .from("game_info")
      .select("*")
      .eq("game_id", game_id)
      .maybeSingle();

    if (existing) {
      return new Response(JSON.stringify(existing), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch from AI
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("Missing LOVABLE_API_KEY");

    const cleanTitle = title.replace(/🟩TORRENT🟩/g, "").replace(/🟩/g, "").trim();

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a gaming encyclopedia. Given a game title, identify the game and return ONLY a valid JSON object (no markdown, no code blocks) with this structure:
{"detected_title":"string","developer":"string","publisher":"string","release_year":number,"genre":"string","file_size":"string","description_full":"A 2-3 sentence description in Portuguese BR","screenshots":["url1","url2","url3"],"req_min_os":"string","req_min_cpu":"string","req_min_ram":"string","req_min_gpu":"string","req_min_storage":"string","req_rec_os":"string","req_rec_cpu":"string","req_rec_ram":"string","req_rec_gpu":"string","req_rec_storage":"string"}
For screenshots use real Steam CDN URLs if known, otherwise empty array. Return ONLY raw JSON.`
          },
          {
            role: "user",
            content: `Game title: "${cleanTitle}"${description ? `\nDescription: "${description}"` : ""}`
          }
        ],
        temperature: 0.3,
      }),
    });

    if (response.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limited, please try again later." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (response.status === 402) {
      return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const rawText = await response.text();

    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      console.error("API response not JSON:", rawText.substring(0, 500));
      throw new Error("API returned invalid response");
    }

    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("No content from AI model");

    const parsed = extractJson(content) as Record<string, any>;

    // Save to DB
    const row = {
      game_id,
      detected_title: parsed.detected_title || cleanTitle,
      developer: parsed.developer || "",
      publisher: parsed.publisher || "",
      release_year: parsed.release_year || 0,
      genre: parsed.genre || "",
      file_size: parsed.file_size || "",
      description_full: parsed.description_full || "",
      screenshots: parsed.screenshots || [],
      req_min_os: parsed.req_min_os || parsed.requirements_min?.os || "",
      req_min_cpu: parsed.req_min_cpu || parsed.requirements_min?.cpu || "",
      req_min_ram: parsed.req_min_ram || parsed.requirements_min?.ram || "",
      req_min_gpu: parsed.req_min_gpu || parsed.requirements_min?.gpu || "",
      req_min_storage: parsed.req_min_storage || parsed.requirements_min?.storage || "",
      req_rec_os: parsed.req_rec_os || parsed.requirements_rec?.os || "",
      req_rec_cpu: parsed.req_rec_cpu || parsed.requirements_rec?.cpu || "",
      req_rec_ram: parsed.req_rec_ram || parsed.requirements_rec?.ram || "",
      req_rec_gpu: parsed.req_rec_gpu || parsed.requirements_rec?.gpu || "",
      req_rec_storage: parsed.req_rec_storage || parsed.requirements_rec?.storage || "",
    };

    const { error: insertError } = await supabase
      .from("game_info")
      .upsert(row, { onConflict: "game_id" });

    if (insertError) {
      console.error("Failed to save game info:", insertError.message);
    }

    return new Response(JSON.stringify(row), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Edge function error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
