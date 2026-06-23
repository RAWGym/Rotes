"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send, Bot } from "lucide-react";
import Link from "next/link";
import { useCreateTask } from "@/hooks/use-tasks";

type Message = { role: "user" | "assistant"; content: string };

type TaskDraft = {
  title?: string;
  category?: string;
  priority?: string;
  deadline?: string;
  description?: string;
};

export default function AssistantPage() {
  const router = useRouter();
  const createTask = useCreateTask();
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Привет! Опиши задачу — я разберу детали и добавлю её в список." },
  ]);
  const [input, setInput] = useState("");
  const [draft, setDraft] = useState<TaskDraft | null>(null);
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState(false);

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
          messages: newMessages.filter((m) => m.role === "user" || (m.role === "assistant" && m.content !== messages[0].content)),
        }),
      });

      const data = await res.json();

      if (data.ready) {
        setDraft(data);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `Понял! Создаю задачу:\n\n**${data.title}**\nКатегория: ${data.category}\nПриоритет: ${data.priority === "high" ? "Высокий" : data.priority === "low" ? "Низкий" : "Средний"}${data.deadline ? `\nДедлайн: ${new Date(data.deadline).toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}` : ""}${data.description ? `\n\n${data.description}` : ""}`,
          },
        ]);
      } else if (data.question) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.question }]);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: "Не смог разобрать. Попробуй описать задачу иначе." }]);
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
    <div className="flex h-screen flex-col">
      <div className="flex items-center gap-3 border-b border-foreground/10 px-4 py-4">
        <Link
          href="/"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-card shadow-sm shadow-foreground/5"
        >
          <ArrowLeft size={18} className="text-foreground/70" />
        </Link>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/20">
            <Bot size={16} className="text-accent" />
          </div>
          <span className="text-body font-medium">Помощник</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-2">
        <div className="flex flex-col gap-3">
          {messages.map((msg, i) => (
            <div key={i} className={msg.role === "user" ? "flex justify-end" : "flex justify-start"}>
              <div
                className={
                  msg.role === "user"
                    ? "max-w-[80%] rounded-2xl rounded-tr-sm bg-accent px-4 py-3 text-card"
                    : "max-w-[80%] rounded-2xl rounded-tl-sm bg-card px-4 py-3 text-foreground shadow-sm shadow-foreground/5"
                }
              >
                <p className="text-body whitespace-pre-line">{msg.content}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-tl-sm bg-card px-4 py-3 shadow-sm shadow-foreground/5">
                <div className="flex gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-accent/60" style={{ animationDelay: "0ms" }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-accent/60" style={{ animationDelay: "150ms" }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-accent/60" style={{ animationDelay: "300ms" }} />
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
                className="rounded-2xl bg-accent px-6 py-3 text-body font-medium text-card disabled:opacity-50"
              >
                {createTask.isPending ? "Добавляю..." : "Подтвердить и добавить"}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-foreground/10 p-4" style={{ paddingBottom: "max(1rem, calc(env(safe-area-inset-bottom) + 1rem))" }}>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder="Опиши задачу..."
            className="flex-1 rounded-xl border border-foreground/15 bg-card px-4 py-3 text-body outline-none focus:border-accent"
          />
          <button
            type="button"
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-card disabled:opacity-40"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}