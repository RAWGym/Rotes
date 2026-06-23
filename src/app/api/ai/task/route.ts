import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const GROK_API_URL = "https://api.x.ai/v1/chat/completions";

const SYSTEM_PROMPT = `Ты помощник в приложении-планировщике Rotes. Твоя задача — извлечь из сообщения пользователя информацию о задаче и вернуть JSON.

Текущая дата: ${new Date().toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}.

Правила:
- Определи title (название задачи, кратко)
- Определи category: "work" (работа, бизнес, проекты, фриланс), "personal" (личное, семья, здоровье, покупки), или другое слово на русском если очевидно другое
- Определи deadline: дата в формате YYYY-MM-DD если упомянута, иначе null. Если сказано "до 22-го" — это ближайшее 22-е число (текущего или следующего месяца).
- Определи priority: "high" если срочно/важно/горит, "low" если не срочно, иначе "medium"
- Определи description: краткое пояснение если есть детали, иначе null
- Если чего-то не хватает для создания задачи, задай ОДИН уточняющий вопрос в поле "question"
- Если всё понятно — верни поле "ready": true

Отвечай ТОЛЬКО валидным JSON без markdown, без пояснений. Формат:
{"title":"...","category":"...","priority":"...","deadline":"...","description":"...","ready":true}
или если нужно уточнить:
{"question":"Уточни, пожалуйста: ...","ready":false}`;

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
        { role: "system", content: SYSTEM_PROMPT },
        ...messages,
      ],
      temperature: 0.1,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    return NextResponse.json({ error }, { status: 500 });
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content ?? "{}";

  try {
    const parsed = JSON.parse(content);
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json({ error: "Invalid JSON from Grok", raw: content }, { status: 500 });
  }
}