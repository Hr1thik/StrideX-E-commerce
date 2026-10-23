"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, Send, X } from "lucide-react";

const STORE_NAME = process.env.NEXT_PUBLIC_STORE_NAME ?? "StrideX";

type ChatProduct = {
  title: string;
  brand: string;
  price: number;
  originalPrice: number | null;
  image: string;
  slug: string;
};

type Message = {
  id: number;
  role: "user" | "model";
  text: string;
  products?: ChatProduct[];
};

const SUGGESTIONS = [
  "Running shoes under 5000",
  "Show me women's sneakers",
  "What's trending?",
];

let messageCounter = 0;

function createMessageId() {
  messageCounter += 1;
  return messageCounter;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // `messages` state is only used for rendering. The ref is the source of
  // truth for what we send, so two quick sends can't build a request from
  // a stale snapshot.
  const messagesRef = useRef<Message[]>([]);
  const isSendingRef = useRef(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, isOpen]);

  function appendMessage(message: Message) {
    const next = [...messagesRef.current, message];
    messagesRef.current = next;
    setMessages(next);
  }

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isSendingRef.current) return;

    isSendingRef.current = true;

    const userMessage: Message = {
      id: createMessageId(),
      role: "user",
      text: trimmed,
    };

    const nextMessages = [...messagesRef.current, userMessage];
    messagesRef.current = nextMessages;
    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({ role: m.role, text: m.text })),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Chat failed");
      }

      appendMessage({
        id: createMessageId(),
        role: "model",
        text: data.reply,
        products: (data.products ?? []).slice(0, 3),
      });
    } catch (error) {
      console.error(error);
      appendMessage({
        id: createMessageId(),
        role: "model",
        text:
          error instanceof Error && error.message
            ? error.message
            : "Sorry, something went wrong. Please try again in a moment.",
      });
    } finally {
      isSendingRef.current = false;
      setIsLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-3 bottom-24 z-70 flex h-[70vh] max-h-155 flex-col overflow-hidden rounded-3xl border border-(--color-stone-light) bg-(--color-ivory) shadow-2xl sm:inset-x-auto sm:right-6 sm:w-95"
          >
            <div className="flex items-center justify-between bg-(--color-ink) px-5 py-4">
              <div>
                <p className="text-sm font-semibold tracking-[0.15em] text-(--color-ivory)">
                  {STORE_NAME.toUpperCase()} ASSISTANT
                </p>
                <p className="mt-0.5 text-xs text-(--color-stone)">
                  Ask me about shoes, sizes &amp; prices
                </p>
              </div>
              <button
                type="button"
                aria-label="Close chat"
                onClick={() => setIsOpen(false)}
                className="text-(--color-ivory) transition-colors duration-300 hover:text-(--color-champagne)"
              >
                <X size={20} strokeWidth={1.5} />
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5">
              <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-(--color-stone-light) px-4 py-3 text-sm text-(--color-ink)">
                Hi! I&apos;m the {STORE_NAME} assistant. Tell me what kind of shoes
                you&apos;re looking for.
              </div>

              {messages.length === 0 && (
                <div className="flex flex-wrap gap-2">
                  {SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => sendMessage(suggestion)}
                      className="rounded-full border border-(--color-stone-light) px-3 py-1.5 text-xs text-(--color-ink) transition-colors duration-300 hover:border-(--color-ink)"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex flex-col gap-2 ${
                    message.role === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm ${
                      message.role === "user"
                        ? "rounded-tr-sm bg-(--color-ink) text-(--color-ivory)"
                        : "rounded-tl-sm bg-(--color-stone-light) text-(--color-ink)"
                    }`}
                  >
                    {message.text}
                  </div>

                  {message.products && message.products.length > 0 && (
                    <div className="w-full space-y-2">
                      {message.products.map((product) => (
                        <Link
                          key={product.slug}
                          href={`/products/${product.slug}`}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-3 rounded-2xl border border-(--color-stone-light) bg-white p-2 transition-colors duration-300 hover:border-(--color-ink)"
                        >
                          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-(--color-stone-light)">
                            <Image
                              src={product.image}
                              alt={product.title}
                              fill
                              sizes="64px"
                              className="object-contain p-1"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-(--color-ink)">
                              {product.title}
                            </p>
                            <div className="mt-0.5 flex items-center gap-2 text-xs">
                              <span className="font-semibold text-(--color-ink)">
                                ₹{product.price.toLocaleString("en-IN")}
                              </span>
                              {product.originalPrice != null && (
                                <span className="text-(--color-stone) line-through">
                                  ₹{product.originalPrice.toLocaleString("en-IN")}
                                </span>
                              )}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex w-fit items-center gap-1 rounded-2xl rounded-tl-sm bg-(--color-stone-light) px-4 py-3">
                  {[0, 1, 2].map((dot) => (
                    <motion.span
                      key={dot}
                      className="h-1.5 w-1.5 rounded-full bg-(--color-stone)"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: dot * 0.2,
                      }}
                    />
                  ))}
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-2 border-t border-(--color-stone-light) p-3"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                maxLength={300}
                placeholder="Type your message..."
                className="h-11 flex-1 rounded-full border border-(--color-stone-light) bg-white px-4 text-sm text-(--color-ink) outline-none focus:border-(--color-ink)"
              />
              <button
                type="submit"
                aria-label="Send message"
                disabled={isLoading || !input.trim()}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-(--color-ink) text-(--color-ivory) transition-colors duration-300 hover:bg-(--color-champagne) disabled:opacity-40"
              >
                <Send size={16} strokeWidth={1.5} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        aria-label={isOpen ? "Close chat" : "Open chat"}
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-6 right-4 z-70 flex h-14 w-14 items-center justify-center rounded-full bg-(--color-ink) text-(--color-ivory) shadow-xl transition-colors duration-300 hover:bg-(--color-champagne) sm:right-6"
      >
        {isOpen ? (
          <X size={22} strokeWidth={1.5} />
        ) : (
          <MessageCircle size={22} strokeWidth={1.5} />
        )}
      </button>
    </>
  );
}
