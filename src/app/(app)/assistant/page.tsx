"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Send, Bot, Brain } from "lucide-react";
import { useCreateTask } from "@/hooks/use-tasks";

type Message = { role: "user" | "assistant"; content: string };
type TaskDraft = {
  title?: string; category?: string;
  priority?: string; deadline?: string; description?: string;
};

function formatAnalysis(text: string) {
  return text.split("\n").map((line, i) => {
    if (!line.trim()) return <div key={i} className="h-2" />;
    const bold = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    return (
      <p
        key={i}
        className="text-[15px] leading-relaxed"
        style={{ color: "#2A2A2A" }}
        dangerouslySetInnerHTML={{ __html: bold }}
      />
    );
  });
}

export default function AssistantPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");
  const isAnalyzeMode = mode === "analyze";
  const createTask = useCreateTask();
  const bottomRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [draft, setDraft] = useState<TaskDraft | null>(null);
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);

  useEffect(() => {
    if (isAnalyzeMode && !analyzed) {
      setAnalyzed(true);
      runAnalysis();
    } else if (!isAnalyzeMode && messages.length === 0) {
      setMessages([{ role: "assistant", content: "Привет! Опиши задачу — я разберу детали и добавлю её в список." }]);
    }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function runAnalysis() {
    setLoading(true);
    setMessages([{ role: "assistant", content: "Анализирую ваши задачи..." }]);

    try {
      const res = await fetch("/api/ai/analyze", { method: "POST" });
      const data = await res.json();

      if (data.analysis) {
        setMessages([{ role: "assistant", content: data.analysis }]);
      } else {
        setMessages([{ role: "assistant", content: "Не удалось получить анализ. Попробуй ещё раз." }]);
      }
    } catch {
      setMessages([{ role: "assistant", content: "Что-то пошло не так. Попробуй позже." }]);
    } finally {
      setLoading(false);
    }
  }

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
      style={{ background: "#F8F4EF", paddingTop: "env(safe-area-inset-top)" }}
    >
      {/* Header */}
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
            style={{ background: isAnalyzeMode ? "rgba(199,187,232,0.3)" : "rgba(217,179,140,0.2)" }}
          >
            {isAnalyzeMode
              ? <Brain size={15} color="#9B8EC4" />
              : <Bot size={15} color="#D9B38C" />
            }
          </div>
          <div>
            <p className="text-[16px] font-semibold leading-tight" style={{ color: "#2A2A2A" }}>
              {isAnalyzeMode ? "Анализ задач" : "Помощник"}
            </p>
            <p className="text-[11px]" style={{ color: "#8A847D" }}>Rotes AI · Groq</p>
          </div>
        </div>
        {isAnalyzeMode && !loading && (
          <button
            type="button"
            onClick={runAnalysis}
            className="ml-auto rounded-full px-3 py-1.5 text-[13px] font-medium"
            style={{ background: "rgba(199,187,232,0.3)", color: "#9B8EC4" }}
          >
            Обновить
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="flex flex-col gap-3">
          {messages.map((msg, i) => (
            <div key={i} className={msg.role === "user" ? "flex justify-end" : "flex justify-start"}>
              <div
                className="max-w-[88%] rounded-2xl px-4 py-3"
                style={
                  msg.role === "user"
                    ? {
                        background: "#D9B38C",
                        borderBottomRightRadius: 6,
                        boxShadow: "0 2px 8px rgba(217,179,140,0.3)",
                      }
                    : {
                        background: "rgba(255,255,255,0.75)",
                        backdropFilter: "blur(20px)",
                        borderBottomLeftRadius: 6,
                        boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                        border: "0.5px solid rgba(255,255,255,0.9)",
                      }
                }
              >
                {msg.role === "assistant" && isAnalyzeMode && i === messages.length - 1 && !loading ? (
                  <div className="flex flex-col gap-1">{formatAnalysis(msg.content)}</div>
                ) : (
                  <p
                    className="text-[15px] whitespace-pre-line leading-relaxed"
                    style={{ color: msg.role === "user" ? "white" : "#2A2A2A" }}
                  >
                    {msg.content}
                  </p>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div
                className="rounded-2xl px-4 py-3"
                style={{
                  background: "rgba(255,255,255,0.75)",
                  backdropFilter: "blur(20px)",
                  borderBottomLeftRadius: 6,
                  border: "0.5px solid rgba(255,255,255,0.9)",
                }}
              >
                <div className="flex gap-1 py-1">
                  {[0, 150, 300].map((delay) => (
                    <span
                      key={delay}
                      className="h-2 w-2 rounded-full animate-bounce"
                      style={{ background: isAnalyzeMode ? "#9B8EC4" : "#D9B38C", opacity: 0.7, animationDelay: `${delay}ms` }}
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
                className="rounded-2xl px-6 py-3 text-[16px] font-semibold text-white disabled:opacity-50"
                style={{ background: "#D9B38C", boxShadow: "0 4px 12px rgba(217,179,140,0.35)" }}
              >
                {createTask.isPending ? "Добавляю..." : "Подтвердить и добавить"}
              </button>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input — только в режиме создания задачи */}
      {!isAnalyzeMode && (
        <div
          className="px-4 py-3 border-t"
          style={{
            borderColor: "rgba(42,42,42,0.08)",
            background: "rgba(248,244,239,0.95)",
            paddingBottom: "max(0.75rem, calc(env(safe-area-inset-bottom) + 0.75rem))",
          }}
        >
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              placeholder="Опиши задачу..."
              className="flex-1 rounded-2xl px-4 py-3 text-[16px] outline-none"
              style={{
                background: "rgba(255,255,255,0.75)",
                backdropFilter: "blur(20px)",
                border: "0.5px solid rgba(255,255,255,0.9)",
                color: "#2A2A2A",
              }}
            />
            <button
              type="button"
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl disabled:opacity-40"
              style={{ background: "#D9B38C", boxShadow: "0 4px 12px rgba(217,179,140,0.3)" }}
            >
              <Send size={18} color="white" />
            </button>
          </div>
        </div>
      )}

      {/* В режиме анализа — кнопка "Создать задачу" внизу */}
      {isAnalyzeMode && !loading && messages.length > 0 && (
        <div
          className="px-4 py-3 border-t"
          style={{
            borderColor: "rgba(42,42,42,0.08)",
            paddingBottom: "max(0.75rem, calc(env(safe-area-inset-bottom) + 0.75rem))",
          }}
        >
          <button
            type="button"
            onClick={() => router.push("/assistant?mode=task")}
            className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-[16px] font-semibold"
            style={{ background: "rgba(255,255,255,0.75)", backdropFilter: "blur(20px)", border: "0.5px solid rgba(255,255,255,0.9)", color: "#2A2A2A" }}
          >
            <Bot size={17} color="#D9B38C" />
            Создать задачу с ИИ
          </button>
        </div>
      )}
    </div>
  );
}