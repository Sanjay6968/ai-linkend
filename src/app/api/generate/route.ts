import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const stylePrompts: Record<string, string> = {
  story: `Archetype: Personal Narrative & Lived Lesson.
Structure:
- An immediate, compelling scene or specific moment (avoid abstract openings).
- The conflict, friction, or costly mistake made.
- The shift in perspective or breakthrough.
- The lasting takeaway for other professionals.
Rules: Do NOT use numbered lists. Do NOT sound corporate. Write in first-person with emotional resonance and authenticity.`,

  contrarian: `Archetype: Contrarian Hot Take.
Structure:
- A bold, punchy statement directly dismantling a common industry myth in line 1.
- Why conventional wisdom is failing people right now.
- The counter-intuitive reality backed by logic.
- A strong, decisive closing statement (do not end with a generic question).
Rules: Be assertive, sharp, and intellectually rigorous. Zero filler words.`,

  framework: `Archetype: Actionable Playbook & Framework.
Structure:
- Hook demonstrating a concrete problem or missed opportunity.
- 3 to 4 sequential, specific tactical steps with clear headings or numbers (1., 2., 3.).
- The operational outcome of executing this framework.
- An engaging closing thought or discussion prompt.
Rules: Actionable and practical. Avoid obvious generic advice.`,

  case_study: `Archetype: Mini Case Study & Breakdown.
Structure:
- The starting challenge and context (before).
- The specific test, model, or strategy implemented.
- The measurable outcome and lessons learned (after).
- The reproducible takeaway for the reader's own team.
Rules: Grounded in real scenarios, numbers, and operational mechanics.`,

  observation: `Archetype: Concise 4-Line Insight.
Structure:
- 3 to 5 short, diamond-sharp sentences with high signal-to-noise ratio.
- Minimalist formatting.
- Let the insight breathe with white space.
Rules: Absolutely zero corporate jargon or filler. Every single word must earn its place.`
};

export async function POST(req: Request) {
  try {
    const { prompt, apiKey, style = "framework" } = await req.json();
    const finalApiKey = apiKey || process.env.GROQ_API_KEY;

    if (!finalApiKey) {
      return NextResponse.json({ error: "No Groq API key provided." }, { status: 401 });
    }

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required." }, { status: 400 });
    }

    const groq = new Groq({ apiKey: finalApiKey });

    const selectedStyleGuide = stylePrompts[style] || stylePrompts.framework;

    const systemPrompt = `You are an elite LinkedIn ghostwriter known for crafting authentic, high-impact content that sounds human, diverse, and original.

${selectedStyleGuide}

Universal Rules:
1. BAN THESE OPENINGS: Never start with "X is not a buzzword...", "In today's fast-paced world...", "Stop doing X...", or "If you still think...".
2. Vary your hooks: use dialogue, unexpected data, a specific time/place, or an uncomfortable truth.
3. Keep paragraphs short (1-2 sentences max) to optimize for mobile readability.
4. Do NOT use emojis unless strictly necessary for numbering.
5. End naturally according to the selected archetype—do NOT force an artificial rhetorical question if a strong statement fits better.
6. Format as clean, ready-to-publish text.`;

    const candidateModels = ["openai/gpt-oss-120b", "openai/gpt-oss-20b", "qwen/qwen3.8-27b"];
    let generatedText = "";
    let lastError = null;

    for (const model of candidateModels) {
      try {
        const chatCompletion = await groq.chat.completions.create({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt },
          ],
          model,
          temperature: 0.8,
          max_tokens: 1024,
        });

        generatedText = chatCompletion.choices[0]?.message?.content || "";
        if (generatedText) break;
      } catch (err: any) {
        console.warn(`Model ${model} failed, trying next:`, err.message);
        lastError = err;
      }
    }

    if (!generatedText) {
      throw lastError || new Error("Failed to generate content with available models.");
    }

    return NextResponse.json({ content: generatedText });

  } catch (error: any) {
    console.error("Groq Generation Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate content." },
      { status: 500 }
    );
  }
}
