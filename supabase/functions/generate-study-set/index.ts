import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const MODEL = "gemini-flash-latest";
const API_KEY = Deno.env.get("GEMINI_API_KEY") ?? "";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (!API_KEY) {
    return jsonResponse(
      { error: "Gemini API key is not configured. Set GEMINI_API_KEY as an edge function secret." },
      500
    );
  }

  try {
    const { topic, inputText } = await req.json();
    if (!topic || typeof topic !== "string") {
      return jsonResponse({ error: "Missing 'topic' field." }, 400);
    }
    const notes = typeof inputText === "string" ? inputText.trim() : "";

    const prompt = `You are an expert study tutor. The user is studying the topic: "${topic}".
${notes ? `They provided these notes:\n"""\n${notes}\n"""\n` : "They did not provide notes — generate content from your own knowledge of the topic."}

Create a study set with TWO parts.

PART 1 — FLASHCARDS
Generate 8 flashcards. Each flashcard has a "front" (a concise question, term, or prompt) and a "back" (a clear, accurate answer or explanation, 1-3 sentences).

PART 2 — QUIZ
Generate 5 multiple-choice quiz questions. Each question has:
- "question": the question text
- "options": an array of exactly 4 options
- "answerIndex": the 0-based index of the correct option
- "explanation": a short explanation of why the answer is correct

Return ONLY a JSON object with this exact shape, no markdown, no commentary:
{
  "flashcards": [{"id": "f1", "front": "...", "back": "..."}],
  "quiz": [{"id": "q1", "question": "...", "options": ["a","b","c","d"], "answerIndex": 0, "explanation": "..."}]
}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;
    const geminiRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.4, responseMimeType: "application/json" },
      }),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      return jsonResponse({ error: `Gemini API error (${geminiRes.status}): ${errText}` }, 502);
    }

    const geminiJson = await geminiRes.json();
    const text =
      geminiJson?.candidates?.[0]?.content?.parts?.[0]?.text ??
      geminiJson?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join("") ??
      "";

    let parsed: { flashcards?: any[]; quiz?: any[] };
    try {
      parsed = JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) return jsonResponse({ error: "Could not parse AI response as JSON." }, 502);
      parsed = JSON.parse(match[0]);
    }

    const flashcards = Array.isArray(parsed.flashcards) ? parsed.flashcards : [];
    const quiz = Array.isArray(parsed.quiz) ? parsed.quiz : [];

    if (flashcards.length === 0 && quiz.length === 0) {
      return jsonResponse({ error: "AI response contained no flashcards or quiz." }, 502);
    }

    return jsonResponse({ flashcards, quiz });
  } catch (err) {
    return jsonResponse({ error: err.message ?? "Unknown error" }, 500);
  }
});
