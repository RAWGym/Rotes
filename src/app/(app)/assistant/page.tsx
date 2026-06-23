"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Send, Bot } from "lucide-react";
import { useCreateTask } from "@/hooks/use-tasks";

type Message = { role: "user" | "assistant"; content: string };
type TaskDraft = {
  title?: string; category?: string;
  priority?: string; deadline?: string; description?: string;
};

export default function AssistantPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");
  const createTask = useCreateTask();
  const bottomRef = useRef<HTMLDivElement>(null);

  const initMsg = mode === "analyze"
    ? "Привет! Загружу твои задачи и проанализирую их — расставлю приоритеты и найду узкие места."
    : "Привет! Опиши задачу — я разберу детали и добавлю её в список.";

  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: initMsg },
  ]);
  const [input, setInput] = useState("");
  const [draft, setDraft] = useState<TaskDraft | null>(null);
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    const newMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.filter((m) => m.role === "user"),
        }),
      });
      const data = await res.json();

      if (data.ready) {
        setDraft(data);
        const priorityLabel: Record<string, string> = { high: "Высокий", medium: "Средний", low: "Низкий" };
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `Понял! Создаю задачу:\n\n**${data.title}**\nКатегория: ${data.category ?? "—"}\nПриоритет: ${priorityLabel[data.priority] ?? data.priority}${data.deadline ? `\nДедлайн: ${new Date(data.deadline).toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}` : ""}${data.description ? `\n\n${data.description}` : ""}`,
          },
        ]);
      } else if (data.question) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.question }]);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: "Попробуй описать задачу иначе." }]);
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Что-то пошло не так. Попробуй ещё раз." }]);
    } finally {
      setLoading(false);
    }
  }

  function confirmCreate() {
    if (!draft?.title) return;
    createTask.mutate(
      {
        title: draft.title,
        description: draft.description ?? null,
        priority: draft.priority ?? "medium",
        category: draft.category ?? "work",
        deadline: draft.deadline ?? null,
        time: null,
        projectId: null,
      },
      {
        onSuccess: () => {
          setCreated(true);
          setMessages((prev) => [...prev, { role: "assistant", content: "Готово! Задача добавлена в список." }]);
          setDraft(null);
          setTimeout(() => router.push("/"), 1500);
        },
      }
    );
  }

  return (
    <div
      className="fixed inset-0 flex flex-col"
      style={{ background: "var(--background)", paddingTop: "env(safe-area-inset-top)" }}
    >
      <div
        className="flex items-center gap-3 px-4 py-3 border-b"
        style={{ borderColor: "rgba(42,42,42,0.08)" }}
      >
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-full"
          style={{ background: "rgba(255,255,255,0.75)", boxShadow: "0 4px 12px rgba(0,0,0,0.04)" }}
        >
          <ArrowLeft size={18} color="#2A2A2A" />
        </button>
        <div className="flex items-center gap-2">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full"
            style={{ background: "rgba(217,179,140,0.2)" }}
          >
            <Bot size={16} color="var(--accent)" />
          </div>
          <div>
            <p className="text-body font-semibold text-foreground leading-tight">Помощник</p>
            <p className="text-[11px] text-foreground/40">Rotes AI</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="flex flex-col gap-3">
          {messages.map((msg, i) => (
            <div key={i} className={msg.role === "user" ? "flex justify-end" : "flex justify-start"}>
              <div
                className="max-w-[82%] rounded-2xl px-4 py-3"
                style={
                  msg.role === "user"
                    ? { background: "var(--accent)", borderBottomRightRadius: 6 }
                    : { background: "var(--card)", borderBottomLeftRadius: 6, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }
                }
              >
                <p
                  className="text-body whitespace-pre-line"
                  style={{ color: msg.role === "user" ? "#FCFAF7" : "var(--foreground)" }}
                >
                  {msg.content}
                </p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div
                className="rounded-2xl px-4 py-3"
                style={{ background: "var(--card)", borderBottomLeftRadius: 6 }}
              >
                <div className="flex gap-1 py-1">
                  {[0, 150, 300].map((delay) => (
                    <span
                      key={delay}
                      className="h-2 w-2 rounded-full animate-bounce"
                      style={{ background: "var(--accent)", opacity: 0.6, animationDelay: `${delay}ms` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
          {draft && !created && (
            <div className="flex justify-start">
              <button
                type="button"
                onClick={confirmCreate}
                disabled={createTask.isPending}
                className="rounded-2xl px-6 py-3 text-body font-medium text-card disabled:opacity-50"
                style={{ background: "var(--accent)" }}
              >
                {createTask.isPending ? "Добавляю..." : "Подтвердить и добавить"}
              </button>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      <div
        className="px-4 py-3 border-t"
        style={{
          borderColor: "rgba(42,42,42,0.08)",
          paddingBottom: "max(0.75rem, calc(env(safe-area-inset-bottom) + 0.75rem))",
        }}
      >
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder="Опиши задачу..."
            className="flex-1 rounded-2xl px-4 py-3 text-body outline-none"
            style={{
              background: "var(--card)",
              border: "1px solid rgba(42,42,42,0.08)",
              color: "var(--foreground)",
            }}
          />
          <button
            type="button"
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl disabled:opacity-40"
            style={{ background: "var(--accent)" }}
          >
            <Send size={18} color="#FCFAF7" />
          </button>
        </div>
      </div>
    </div>
  );
}