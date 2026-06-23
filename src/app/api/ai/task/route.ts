import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const GROK_API_URL = "https://api.x.ai/v1/chat/completions";

const MAX_MESSAGES = 20;
const MAX_MESSAGE_LENGTH = 2000;

function getSystemPrompt() {
  const now = new Date();
  const dateStr = now.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  return `Ты помощник в приложении-планировщике Rotes. Извлеки из сообщения пользователя информацию о задаче.

Сегодня: ${dateStr}. Текущий месяц: ${month}, год: ${year}.

Правила определения дедлайна:
- "до 22-го" — ближайшее 22-е число. Если текущее число <= 22, то ${year}-${String(month).padStart(2,"0")}-22. Иначе следующий месяц.
- "до конца месяца" — последний день текущего месяца
- Если дата прошла в текущем месяце — берём следующий месяц
- Формат даты всегда YYYY-MM-DD

Правила определения категории:
- "work" — работа, бизнес, проект, монтаж, съёмка, клиент, заказ, фриланс
- "personal" — личное, семья, здоровье, покупки, дом
- Иначе — напиши категорию одним словом по-русски

Правила приоритета:
- "high" — срочно, горит, важно, сегодня/завтра
- "low" — когда-нибудь, не срочно
- "medium" — всё остальное

Верни ТОЛЬКО валидный JSON, без markdown, без объяснений, без backticks:
{"title":"...","category":"...","priority":"...","deadline":"YYYY-MM-DD или null","description":"...или null","ready":true}

Если информации совсем не хватает — верни:
{"question":"Уточни: ...","ready":false}`;
}

function sanitizeString(value: unknown, maxLen = 500): string {
  if (typeof value !== "string") return "";
  return value.slice(0, maxLen).trim();
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body || typeof body !== "object" || !Array.isArray((body as Record<string, unknown>).messages)) {
    return NextResponse.json({ error: "messages must be an array" }, { status: 400 });
  }

  const rawMessages = (body as { messages: unknown[] }).messages;

  if (rawMessages.length > MAX_MESSAGES) {
    return NextResponse.json({ error: "Too many messages" }, { status: 400 });
  }

  const messages = rawMessages
    .filter(
      (m): m is { role: string; content: string } =>
        typeof m === "object" &&
        m !== null &&
        (m as Record<string, unknown>).role === "user" &&
        typeof (m as Record<string, unknown>).content === "string"
    )
    .map((m) => ({
      role: "user" as const,
      content: sanitizeString(m.content, MAX_MESSAGE_LENGTH),
    }));

  if (messages.length === 0) {
    return NextResponse.json({ error: "No valid user messages" }, { status: 400 });
  }

  let grokResponse: Response;
  try {
    grokResponse = await fetch(GROK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "grok-3-mini",
        messages: [
          { role: "system", content: getSystemPrompt() },
          ...messages,
        ],
        temperature: 0,
        max_tokens: 512,
      }),
    });
  } catch (err) {
    console.error("Grok fetch error:", err);
    return NextResponse.json({ error: "AI service unavailable" }, { status: 502 });
  }

  if (!grokResponse.ok) {
    console.error("Grok API error status:", grokResponse.status);
    return NextResponse.json({ error: "AI service error" }, { status: 502 });
  }

  let data: unknown;
  try {
    data = await grokResponse.json();
  } catch {
    return NextResponse.json({ error: "AI service returned invalid response" }, { status: 502 });
  }

  const raw = (data as { choices?: { message?: { content?: string } }[] })
    ?.choices?.[0]?.message?.content ?? "";

  const cleaned = raw
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  try {
    const parsed = JSON.parse(cleaned) as Record<string, unknown>;

    const safe = {
      ready: Boolean(parsed.ready),
      title: sanitizeString(parsed.title, 200),
      category: sanitizeString(parsed.category, 50),
      priority: ["high", "medium", "low"].includes(String(parsed.priority))
        ? String(parsed.priority)
        : "medium",
      deadline: typeof parsed.deadline === "string" && /^\d{4}-\d{2}-\d{2}$/.test(parsed.deadline)
        ? parsed.deadline
        : null,
      description: parsed.description ? sanitizeString(parsed.description, 500) : null,
      question: parsed.question ? sanitizeString(parsed.question as string, 300) : undefined,
    };

    return NextResponse.json(safe);
  } catch {
    console.error("JSON parse failed. Cleaned:", cleaned);
    return NextResponse.json({ question: "Не смог разобрать задачу. Попробуй описать иначе.", ready: false });
  }
}