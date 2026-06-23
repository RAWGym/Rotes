import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const GROK_API_URL = "https://api.x.ai/v1/chat/completions";

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

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { messages } = await request.json();

  const response = await fetch(GROK_API_URL, {
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
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Grok API error:", error);
    return NextResponse.json({ error }, { status: 500 });
  }

  const data = await response.json();
  const raw = data.choices?.[0]?.message?.content ?? "";

  console.log("Grok raw response:", raw);

  const cleaned = raw
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  try {
    const parsed = JSON.parse(cleaned);
    return NextResponse.json(parsed);
  } catch {
    console.error("JSON parse failed. Raw:", raw, "Cleaned:", cleaned);
    return NextResponse.json({ error: "parse_failed", raw }, { status: 500 });
  }
}