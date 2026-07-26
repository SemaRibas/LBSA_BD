"use client";

import React, { useState, useEffect, useRef } from "react";
import { Sparkles, X, Send, FileSpreadsheet, Bot, User as UserIcon, CheckCircle2, AlertCircle, RefreshCw, Zap, ChevronLeft } from "lucide-react";
import { parseExcelFile } from "@/lib/exportImportUtils";
import { getAIRateLimitStatus, incrementAIRateLimit, RateLimitResult } from "@/lib/rateLimiter";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";

interface Message {
  id: string;
  sender: "user" | "agent";
  text: string;
  timestamp: string;
  badge?: string;
  type?: "text" | "upload_success" | "error";
  fileName?: string;
  itemCount?: number;
}

interface AIAgentWidgetProps {
  isOpen?: boolean;
  onClose?: () => void;
  onDataRegistered?: () => void;
}

export function AIAgentWidget({ isOpen: externalIsOpen, onClose: externalOnClose, onDataRegistered }: AIAgentWidgetProps) {
  const toast = useToast();
  const { user } = useAuth();
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const [isHovered, setIsHovered] = useState(false);

  const [inputMessage, setInputMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [rateLimit, setRateLimit] = useState<RateLimitResult>({
    allowed: true,
    used: 0,
    remaining: 20,
    limit: 20,
    resetDate: "",
  });

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-1",
      sender: "agent",
      text: "Olá! Eu sou o **Agente de IA do LBSA**. Me entregue uma planilha Excel (`.xlsx`, `.csv`) com seus dados e eu irei **analisar, validar e cadastrar tudo de forma automática e em tempo real** no banco de dados do laboratório!",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync rate limit status
  useEffect(() => {
    const status = getAIRateLimitStatus(user?.id || "guest");
    setRateLimit(status);
  }, [user]);

  // Scroll chat to bottom
  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const toggleOpen = () => {
    if (externalOnClose && externalIsOpen !== undefined) {
      externalOnClose();
    } else {
      setInternalIsOpen(!internalIsOpen);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isProcessing) return;

    // Check Rate Limit
    const currentLimit = getAIRateLimitStatus(user?.id || "guest");
    if (!currentLimit.allowed) {
      toast.warning("Limite diário atingido", "Você atingiu o limite de 20 operações diárias do Agente IA.");
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          sender: "agent",
          text: "⚠️ **Limite diário de 20 usos atingido!** Seu limite de operações com IA será renovado à meia-noite.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          type: "error",
        },
      ]);
      return;
    }

    const userMsgText = inputMessage.trim();
    setInputMessage("");

    const newMsg: Message = {
      id: String(Date.now()),
      sender: "user",
      text: userMsgText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setIsProcessing(true);

    try {
      const res = await fetch("/api/ai-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "chat", prompt: userMsgText }),
      });

      // Increment rate limit count
      const updatedLimit = incrementAIRateLimit(user?.id || "guest");
      setRateLimit(updatedLimit);

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          {
            id: String(Date.now() + 1),
            sender: "agent",
            text: data.reply || "Mensagem processada com sucesso.",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      }
    } catch (err) {
      console.error("Erro na conversa com IA:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Check Rate Limit
    const currentLimit = getAIRateLimitStatus(user?.id || "guest");
    if (!currentLimit.allowed) {
      toast.warning("Limite diário atingido", "Você atingiu o limite de 20 cadastros/operações diárias do Agente IA.");
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          sender: "agent",
          text: "⚠️ **Limite diário excedido (20/20 usos)!** Por favor, aguarde a renovação do limite à meia-noite para cadastrar novas planilhas via IA.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          type: "error",
        },
      ]);
      return;
    }

    setIsProcessing(true);

    // Notify chat of file upload start
    setMessages((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        sender: "user",
        text: `📄 **Planilha enviada**: \`${file.name}\` (${(file.size / 1024).toFixed(1)} KB)`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
      {
        id: String(Date.now() + 1),
        sender: "agent",
        text: `⚡ **Lendo planilha \`${file.name}\`...**\nAnalisando estrutura de colunas e preparando o cadastro automático em tempo real no banco de dados LBSA...`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);

    try {
      // 2. Parse Excel file rows
      const parseResult = await parseExcelFile(file, []);

      if (!parseResult.rows || parseResult.rows.length === 0) {
        setMessages((prev) => [
          ...prev,
          {
            id: String(Date.now() + 2),
            sender: "agent",
            text: "❌ **Erro ao processar planilha**: O arquivo enviado parece estar vazio ou não possui linhas válidas de dados.",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            type: "error",
          },
        ]);
        setIsProcessing(false);
        return;
      }

      // 3. Call AI Agent auto registration endpoint
      const res = await fetch("/api/ai-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "auto_register",
          prompt: `Cadastre automaticamente os dados da planilha ${file.name}`,
          rows: parseResult.rows,
        }),
      });

      // Deduct 1 from daily rate limit
      const updatedLimit = incrementAIRateLimit(user?.id || "guest");
      setRateLimit(updatedLimit);

      if (res.ok) {
        const data = await res.json();
        const typeLabel = data.type === "colecoes" ? "Coleções Sistemáticas" : "Inventário de Materiais";

        setMessages((prev) => [
          ...prev,
          {
            id: String(Date.now() + 3),
            sender: "agent",
            text: data.summary,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            type: "upload_success",
            fileName: file.name,
            itemCount: data.count,
            badge: `${data.count} itens cadastrados (${typeLabel})`,
          },
        ]);

        toast.success("Cadastro Automático Concluído!", `${data.count} itens cadastrados no banco de dados via Agente IA.`);

        if (onDataRegistered) {
          onDataRegistered();
        }
      } else {
        const errData = await res.json();
        setMessages((prev) => [
          ...prev,
          {
            id: String(Date.now() + 3),
            sender: "agent",
            text: `❌ **Falha no Cadastro**: ${errData.error || "Não foi possível concluir o cadastro automático."}`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            type: "error",
          },
        ]);
      }
    } catch (err) {
      console.error("Erro na leitura da planilha via Agente IA:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 4),
          sender: "agent",
          text: "❌ **Erro Inesperado**: Ocorreu uma falha ao ler o arquivo Excel.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          type: "error",
        },
      ]);
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <>
      {/* Collapsible Floating Edge Tab (Fixed at Bottom-Right Edge) */}
      <div
        className="fixed bottom-6 right-0 z-50 flex items-center group cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <button
          type="button"
          onClick={toggleOpen}
          className={`flex items-center gap-2.5 py-3 px-3.5 rounded-l-2xl bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600 text-white font-extrabold shadow-2xl hover:shadow-teal-500/50 border-l-2 border-t-2 border-b-2 border-white/30 backdrop-blur-xl transition-all duration-300 transform active:scale-95 ${
            isHovered ? "translate-x-0 pr-4" : "translate-x-1.5 opacity-90 hover:opacity-100"
          }`}
          title="Agente de IA LBSA (Passe o mouse para abrir)"
        >
          {/* Edge Indicator Arrow & Sparkles Icon */}
          <div className="flex items-center gap-1.5 shrink-0">
            <ChevronLeft className={`h-4 w-4 text-amber-300 transition-transform duration-300 ${isHovered ? "rotate-180" : "animate-pulse"}`} />
            <Sparkles className="h-5 w-5 animate-pulse text-amber-300" />
          </div>

          {/* Expanded Label (Revealed on Hover) */}
          <div className={`flex items-center gap-2 overflow-hidden transition-all duration-300 whitespace-nowrap ${
            isHovered ? "max-w-[200px] opacity-100" : "max-w-0 opacity-0"
          }`}>
            <span className="text-xs font-black tracking-wide">Agente LBSA IA</span>
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-mono font-bold text-amber-200">
              {rateLimit.remaining}/20
            </span>
          </div>
        </button>
      </div>

      {/* Floating Panel / Drawer */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[92vw] sm:w-[440px] max-h-[640px] h-[82vh] bg-white dark:bg-surface-900 border border-surface-200 dark:border-teal-500/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slide-up">
          {/* Panel Header */}
          <div className="p-4 bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-700 text-white flex items-center justify-between shrink-0 shadow-md">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
                <Bot className="h-5 w-5 text-amber-300" />
              </div>
              <div className="min-w-0">
                <h3 className="font-extrabold text-sm flex items-center gap-1.5 truncate">
                  <span>Agente LBSA IA</span>
                  <span className="px-1.5 py-0.2 rounded-md bg-amber-400 text-teal-950 text-[9px] font-black uppercase">
                    PRO
                  </span>
                </h3>
                <p className="text-[10px] text-teal-100/90 truncate">
                  Cadastro automático via Excel e Análise Inteligente
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Rate Limit Badge */}
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/20 text-[10px] font-mono font-bold text-amber-200 border border-white/10" title="Limite Diário de Requisições">
                <Zap className="h-3 w-3 text-amber-400" />
                <span>{rateLimit.remaining}/20 hoje</span>
              </div>

              <button
                onClick={toggleOpen}
                className="p-1.5 rounded-full hover:bg-white/20 transition-colors text-white"
                title="Fechar Painel"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs bg-surface-50/50 dark:bg-surface-950/40">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.sender === "agent" && (
                  <div className="h-7 w-7 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                    <Bot className="h-4 w-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3 space-y-1.5 shadow-xs ${
                    msg.sender === "user"
                      ? "bg-teal-600 text-white rounded-br-none"
                      : msg.type === "error"
                      ? "bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-800 dark:text-red-200 rounded-bl-none"
                      : msg.type === "upload_success"
                      ? "bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-100 rounded-bl-none"
                      : "bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-800 dark:text-surface-100 rounded-bl-none"
                  }`}
                >
                  {msg.badge && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-200/80 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-100 font-extrabold text-[10px]">
                      <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                      {msg.badge}
                    </span>
                  )}

                  <div className="whitespace-pre-line leading-relaxed text-[11px]">
                    {msg.text}
                  </div>

                  <span className={`text-[9px] block text-right font-mono ${msg.sender === "user" ? "text-teal-100" : "text-surface-400"}`}>
                    {msg.timestamp}
                  </span>
                </div>

                {msg.sender === "user" && (
                  <div className="h-7 w-7 rounded-xl bg-surface-200 dark:bg-surface-700 text-surface-700 dark:text-surface-200 flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                    <UserIcon className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}

            {isProcessing && (
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-xs text-surface-600 dark:text-surface-300 animate-pulse">
                <RefreshCw className="h-4 w-4 text-teal-600 dark:text-teal-400 animate-spin" />
                <span>O Agente IA está analisando e cadastrando seus itens...</span>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Action Toolbar & Input */}
          <div className="p-3 border-t border-surface-100 dark:border-surface-800 bg-white dark:bg-surface-900 space-y-2 shrink-0">
            {/* Auto Register Excel Button */}
            <button
              type="button"
              disabled={isProcessing || !rateLimit.allowed}
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 border border-emerald-300/80 dark:border-emerald-800 text-xs font-extrabold transition-all group disabled:opacity-50"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
              <span>Entregar Planilha Excel para Cadastro Automático</span>
            </button>

            {/* Hidden Native File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileUpload}
              className="hidden"
            />

            {/* Text prompt form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder={rateLimit.allowed ? "Pergunte ao Agente IA..." : "Limite diário atingido (20/20)"}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={isProcessing || !rateLimit.allowed}
                className="flex-1 px-3.5 py-2 rounded-xl text-xs bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isProcessing || !rateLimit.allowed}
                className="p-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white disabled:opacity-50 transition-transform active:scale-95 shrink-0"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
