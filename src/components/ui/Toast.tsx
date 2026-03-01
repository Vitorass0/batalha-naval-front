// Sistema de Toast/Notificação para feedback de jogo
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

export interface ToastMessage {
  id: string;
  text: string;
  type: "hit" | "miss" | "sunk" | "info" | "victory" | "defeat";
  duration?: number;
}

interface ToastProps {
  messages: ToastMessage[];
  onRemove: (id: string) => void;
}

const toastStyles: Record<ToastMessage["type"], string> = {
  hit: "bg-red-600/90 border-red-400 text-white",
  miss: "bg-blue-600/90 border-blue-400 text-white",
  sunk: "bg-orange-600/90 border-orange-400 text-white animate-bounce",
  info: "bg-slate-700/90 border-slate-500 text-white",
  victory: "bg-emerald-600/90 border-emerald-400 text-white",
  defeat: "bg-red-800/90 border-red-600 text-white",
};

const toastIcons: Record<ToastMessage["type"], string> = {
  hit: "💥",
  miss: "💦",
  sunk: "🔥",
  info: "ℹ️",
  victory: "🎉",
  defeat: "💀",
};

const ToastItem: React.FC<{
  message: ToastMessage;
  onRemove: (id: string) => void;
}> = ({ message, onRemove }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const duration = message.duration ?? 3000;
    const exitTimer = setTimeout(() => setIsExiting(true), duration - 300);
    const removeTimer = setTimeout(() => onRemove(message.id), duration);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(removeTimer);
    };
  }, [message, onRemove]);

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-5 py-3 rounded-lg border-2 shadow-2xl backdrop-blur-sm",
        "transition-all duration-300 ease-in-out",
        isExiting
          ? "opacity-0 translate-x-12 scale-95"
          : "opacity-100 translate-x-0 scale-100 animate-slide-in",
        toastStyles[message.type],
      )}
    >
      <span className="text-2xl">{toastIcons[message.type]}</span>
      <span className="font-bold text-sm">{message.text}</span>
    </div>
  );
};

export const ToastContainer: React.FC<ToastProps> = ({
  messages,
  onRemove,
}) => {
  return (
    <div className="fixed top-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
      {messages.map((msg) => (
        <ToastItem key={msg.id} message={msg} onRemove={onRemove} />
      ))}
    </div>
  );
};

/** Hook para gerenciar toasts */
export function useToast() {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  const addToast = useCallback(
    (text: string, type: ToastMessage["type"], duration?: number) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      setMessages((prev) => [...prev, { id, text, type, duration }]);
    },
    [],
  );

  const removeToast = useCallback((id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  }, []);

  return { messages, addToast, removeToast };
}
