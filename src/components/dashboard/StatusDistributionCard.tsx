"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { Colecao } from "@/types";
import { AlertTriangle, CheckCircle2, Droplets, Box, ArrowRight, Activity, ShieldCheck } from "lucide-react";
import Link from "next/link";

interface StatusDistributionCardProps {
  colecoes: Colecao[];
}

export function StatusDistributionCard({ colecoes }: StatusDistributionCardProps) {
  const [activeTab, setActiveTab] = useState<"todos" | "liquido" | "recipiente">("todos");

  const stats = useMemo(() => {
    const total = colecoes.length;

    // Status do Líquido
    const transparente = colecoes.filter((c) => c.status === "TRANSPARENTE").length;
    const turvo = colecoes.filter((c) => c.status === "LIQUIDO_TURVO").length;
    const seco = colecoes.filter((c) => c.status === "SECO").length;

    // Condição do Frasco / Recipiente
    const frascoBom = colecoes.filter((c) => c.condicaoRecipiente === "FAVORAVEL" || c.condicaoFrasco === "BOM").length;
    const frascoRazoavel = colecoes.filter((c) => c.condicaoRecipiente === "REGULAR" || c.condicaoFrasco === "RAZOAVEL").length;
    const frascoCritico = colecoes.filter((c) => c.condicaoRecipiente === "DESFAVORAVEL" || c.condicaoFrasco === "CRITICO").length;

    // Urgentes / Atenção
    const itensCriticos = colecoes.filter(
      (c) => c.condicaoFrasco === "CRITICO" || c.condicaoRecipiente === "DESFAVORAVEL" || c.status === "SECO"
    ).length;

    const taxaPreservacao = total > 0 ? Math.round(((transparente + frascoBom) / (total * 2)) * 100) : 100;

    return {
      total,
      transparente,
      turvo,
      seco,
      frascoBom,
      frascoRazoavel,
      frascoCritico,
      itensCriticos,
      taxaPreservacao,
    };
  }, [colecoes]);

  // Percentage calculations
  const getPercent = (count: number) => {
    if (!stats.total || stats.total === 0) return 0;
    return Math.round((count / stats.total) * 100);
  };

  const statusItems = [
    {
      id: "transparente",
      category: "liquido",
      label: "Líquido Transparente",
      description: "Solvente limpo em perfeito estado de conservação",
      count: stats.transparente,
      percent: getPercent(stats.transparente),
      color: "#10b981",
      bgColor: "bg-emerald-500",
      textColor: "text-emerald-600 dark:text-emerald-400",
      pillBg: "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800",
      statusBadge: "Ideal",
      icon: CheckCircle2,
    },
    {
      id: "turvo",
      category: "liquido",
      label: "Líquido Turvo",
      description: "Requer filtragem ou renovação periódica do meio",
      count: stats.turvo,
      percent: getPercent(stats.turvo),
      color: "#0284c7",
      bgColor: "bg-sky-500",
      textColor: "text-sky-600 dark:text-sky-400",
      pillBg: "bg-sky-50 dark:bg-sky-950/50 border-sky-200 dark:border-sky-800",
      statusBadge: "Atenção",
      icon: Droplets,
    },
    {
      id: "seco",
      category: "liquido",
      label: "Sem Líquido / Seco",
      description: "Coleção desidratada ou sem meio preservativo",
      count: stats.seco,
      percent: getPercent(stats.seco),
      color: "#f59e0b",
      bgColor: "bg-amber-500",
      textColor: "text-amber-600 dark:text-amber-400",
      pillBg: "bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800",
      statusBadge: "Manutenção",
      icon: AlertTriangle,
    },
    {
      id: "frasco_bom",
      category: "recipiente",
      label: "Frasco Excelente / Favorável",
      description: "Recipiente de vidro/acrílico vedado e íntegro",
      count: stats.frascoBom,
      percent: getPercent(stats.frascoBom),
      color: "#0d9488",
      bgColor: "bg-teal-500",
      textColor: "text-teal-600 dark:text-teal-400",
      pillBg: "bg-teal-50 dark:bg-teal-950/50 border-teal-200 dark:border-teal-800",
      statusBadge: "Íntegro",
      icon: Box,
    },
    {
      id: "frasco_razoavel",
      category: "recipiente",
      label: "Frasco Regular / Razoável",
      description: "Recipiente com desgaste moderado ou tampa frágil",
      count: stats.frascoRazoavel,
      percent: getPercent(stats.frascoRazoavel),
      color: "#d97706",
      bgColor: "bg-amber-600",
      textColor: "text-amber-700 dark:text-amber-400",
      pillBg: "bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800",
      statusBadge: "Monitorar",
      icon: Activity,
    },
    {
      id: "frasco_critico",
      category: "recipiente",
      label: "Frasco Crítico / Riscos",
      description: "Frasco trincado ou risco imediato de evaporação",
      count: stats.frascoCritico,
      percent: getPercent(stats.frascoCritico),
      color: "#e11d48",
      bgColor: "bg-rose-600",
      textColor: "text-rose-600 dark:text-rose-400",
      pillBg: "bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800",
      statusBadge: "Urgente",
      icon: AlertTriangle,
    },
  ];

  const filteredItems = useMemo(() => {
    if (activeTab === "liquido") return statusItems.filter((i) => i.category === "liquido");
    if (activeTab === "recipiente") return statusItems.filter((i) => i.category === "recipiente");
    return statusItems;
  }, [activeTab, statusItems]);

  return (
    <Card className="animate-slide-up bg-white dark:bg-surface-900 border border-surface-200 dark:border-teal-500/20 p-6 shadow-xl" style={{ animationDelay: "600ms" }}>
      {/* Header with Title & Interactive Category Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            <h3 className="text-lg font-black text-surface-900 dark:text-surface-100 tracking-tight">
              Análise de Conservação das Coleções
            </h3>
          </div>
          <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">
            Métricas detalhadas sobre a qualidade dos solventes e integridade dos frascos ({stats.total} tombos avaliados)
          </p>
        </div>

        {/* Tab Filter Pills */}
        <div className="flex items-center gap-1.5 bg-surface-100 dark:bg-surface-800/80 p-1 rounded-2xl border border-surface-200/80 dark:border-surface-700/80 shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab("todos")}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
              activeTab === "todos"
                ? "bg-white dark:bg-surface-700 text-teal-700 dark:text-teal-300 shadow-sm"
                : "text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white"
            }`}
          >
            Visão Geral
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("liquido")}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
              activeTab === "liquido"
                ? "bg-white dark:bg-surface-700 text-teal-700 dark:text-teal-300 shadow-sm"
                : "text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white"
            }`}
          >
            Meio Líquido
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("recipiente")}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
              activeTab === "recipiente"
                ? "bg-white dark:bg-surface-700 text-teal-700 dark:text-teal-300 shadow-sm"
                : "text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white"
            }`}
          >
            Frascos
          </button>
        </div>
      </div>

      {/* Summary KPI Banner */}
      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        <div className="p-3.5 rounded-2xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200/60 dark:border-teal-900/40 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase text-teal-700 dark:text-teal-400 tracking-wider">
              Índice de Preservação
            </span>
            <p className="text-xl font-black text-teal-900 dark:text-teal-100 mt-0.5">
              {stats.taxaPreservacao}%
            </p>
          </div>
          <div className="h-9 w-9 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-xs border border-teal-500/20">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase text-amber-700 dark:text-amber-400 tracking-wider">
              Requerem Manutenção
            </span>
            <p className="text-xl font-black text-amber-900 dark:text-amber-100 mt-0.5">
              {stats.turvo + stats.frascoRazoavel} tombos
            </p>
          </div>
          <div className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs border border-amber-500/20">
            <Activity className="h-5 w-5" />
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/40 flex items-center justify-between xs:col-span-2 md:col-span-1">
          <div>
            <span className="text-[10px] font-extrabold uppercase text-rose-700 dark:text-rose-400 tracking-wider">
              Atenção Crítica
            </span>
            <p className="text-xl font-black text-rose-900 dark:text-rose-100 mt-0.5">
              {stats.itensCriticos} frasco(s)
            </p>
          </div>
          <div className="h-9 w-9 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-xs border border-rose-500/20">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Multi-segmented GitHub/Apple style Continuous Progress Bar */}
      <div className="mb-6 space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-surface-700 dark:text-surface-300 px-1">
          <span>Distribuição Proporcional</span>
          <span className="text-surface-500 dark:text-surface-400 font-mono text-[11px]">{stats.total} total</span>
        </div>
        <div className="w-full h-4 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden flex p-0.5 border border-surface-200/60 dark:border-surface-700/60 shadow-inner">
          {statusItems.map((item) => {
            if (item.percent === 0) return null;
            return (
              <div
                key={`segment-${item.id}`}
                className={`h-full ${item.bgColor} transition-all duration-700 first:rounded-l-full last:rounded-r-full hover:brightness-110 relative group`}
                style={{ width: `${item.percent}%` }}
                title={`${item.label}: ${item.count} (${item.percent}%)`}
              />
            );
          })}
        </div>
      </div>

      {/* Modern Grid of Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredItems.map((item) => {
          const IconComponent = item.icon;

          return (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-surface-50/80 dark:bg-surface-800/50 border border-surface-200/80 dark:border-surface-700/70 hover:border-teal-500/40 dark:hover:border-teal-500/40 transition-all duration-300 shadow-xs hover:shadow-md flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`p-2 rounded-xl ${item.bgColor}/10 ${item.textColor} shrink-0`}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <span className="font-extrabold text-xs text-surface-900 dark:text-surface-100 truncate">
                      {item.label}
                    </span>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${item.pillBg} ${item.textColor} shrink-0`}>
                    {item.statusBadge}
                  </span>
                </div>

                <p className="text-[11px] text-surface-500 dark:text-surface-400 line-clamp-2 mb-3 leading-tight">
                  {item.description}
                </p>
              </div>

              {/* Progress Bar & Numeric Percentage Count */}
              <div className="space-y-1.5 pt-2 border-t border-surface-200/40 dark:border-surface-700/40">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-surface-500 dark:text-surface-400 text-[11px]">Quantidade</span>
                  <span className="font-black text-surface-900 dark:text-surface-100">
                    {item.count} <span className="text-[10px] text-surface-500 font-normal">({item.percent}%)</span>
                  </span>
                </div>

                <div className="w-full h-2 bg-surface-200/60 dark:bg-surface-700/60 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.bgColor} rounded-full transition-all duration-700`}
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Action Footer */}
      <div className="mt-6 pt-4 border-t border-surface-100 dark:border-surface-800 flex items-center justify-between flex-wrap gap-3">
        <span className="text-xs text-surface-500 dark:text-surface-400 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
          Sincronizado automaticamente com o banco de dados LBSA
        </span>

        <Link
          href="/channels"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-extrabold shadow-md hover:shadow-teal-500/30 transition-all active:scale-95"
        >
          <span>Gerenciar Coleções no Acervo</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </Card>
  );
}
