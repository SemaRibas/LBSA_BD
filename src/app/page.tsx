"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MetricCards } from "@/components/dashboard/MetricCards";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { ActivityCard } from "@/components/dashboard/ActivityCard";
import { Card } from "@/components/ui/Card";
import { Material, Colecao } from "@/types";

export default function DashboardPage() {
  const router = useRouter();
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [colecoes, setColecoes] = useState<Colecao[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/check");
        if (!res.ok) {
          router.replace("/login");
          return;
        }
        return true;
      } catch {
        router.replace("/login");
        return false;
      }
    };

    checkAuth().then((ok) => {
      if (!ok) return;
      const fetchData = async () => {
        try {
          const [materiaisRes, colecoesRes] = await Promise.all([
            fetch("/api/materiais"),
            fetch("/api/colecoes"),
          ]);

          if (materiaisRes.ok) setMateriais(await materiaisRes.json());
          if (colecoesRes.ok) setColecoes(await colecoesRes.json());
        } catch (error) {
          console.error("Erro ao buscar dados:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    });
  }, [router]);

  const metrics = {
    totalMateriais: materiais.length,
    totalColecoes: colecoes.length,
    materiaisConservados: materiais.filter((m) => m.estado === "Conservado").length,
    colecoesAtivas: colecoes.filter((c) => c.condicaoRecipiente === "FAVORAVEL").length,
  };

  const chartData = [
    { month: "Jan", materiais: 12, colecoes: 8 },
    { month: "Fev", materiais: 15, colecoes: 10 },
    { month: "Mar", materiais: 18, colecoes: 12 },
    { month: "Abr", materiais: 14, colecoes: 11 },
    { month: "Mai", materiais: 20, colecoes: 15 },
    { month: "Jun", materiais: metrics.totalMateriais || 17, colecoes: metrics.totalColecoes || 8 },
  ];

  const recentActivity = [
    { id: 1, action: "Ultima atualizacao", item: new Date().toLocaleDateString("pt-BR"), time: "Hoje" },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex items-center justify-center">
        <div className="animate-pulse text-surface-600">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
      <Sidebar />
      
      <main className="lg:ml-20 p-4 sm:p-6 lg:p-8">
        <Header title="Dashboard" activeTab="Insights" />

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Main metric card */}
          <Card variant="gradient" className="lg:col-span-2 text-white">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-teal-100 text-sm mb-1">Materiais Cadastrados</p>
                <p className="text-5xl font-bold mb-2">{metrics.totalMateriais}</p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-400" />
                    {metrics.materiaisConservados} Conservados
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    {metrics.totalMateriais - metrics.materiaisConservados} Outros
                  </span>
                </div>
              </div>
              <div className="w-24 h-24 opacity-20">
                <svg viewBox="0 0 100 100" fill="currentColor">
                  <circle cx="50" cy="30" r="15" />
                  <path d="M25 85 C25 55 75 55 75 85" />
                  <rect x="35" y="60" width="30" height="25" rx="5" />
                </svg>
              </div>
            </div>
          </Card>

          {/* Score card */}
          <Card variant="accent">
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-surface-600 dark:text-surface-700 text-sm mb-2">Saude do Laboratorio</p>
              <div className="relative w-32 h-16 mb-2">
                <svg viewBox="0 0 100 50" className="w-full h-full">
                  <path
                    d="M 10 45 A 40 40 0 0 1 90 45"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 10 45 A 40 40 0 0 1 90 45"
                    fill="none"
                    stroke="#14b8a6"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray="126"
                    strokeDashoffset="16"
                  />
                </svg>
                <div className="absolute inset-0 flex items-end justify-center pb-1">
                  <span className="text-2xl font-bold text-surface-900 dark:text-surface-100">87</span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                <span>+2</span>
                <span className="text-surface-500">pontos</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Metric cards */}
        <div className="mb-6">
          <MetricCards metrics={metrics} />
        </div>

        {/* Charts and activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <ChartCard chartData={chartData} />
          </div>
          <ActivityCard activities={recentActivity} />
        </div>

        {/* Team */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-3">
            <Card className="animate-slide-up" style={{ animationDelay: "700ms" }}>
              <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-4">
                Colecoes por Status
              </h3>
              <div className="space-y-3">
                {[
                  { label: "Liquido Turvo", count: colecoes.filter(c => c.status === "LIQUIDO_TURVO").length, color: "bg-blue-500" },
                  { label: "Transparente", count: colecoes.filter(c => c.status === "TRANSPARENTE").length, color: "bg-green-500" },
                  { label: "Frasco Critico", count: colecoes.filter(c => c.condicaoFrasco === "CRITICO").length, color: "bg-red-500" },
                  { label: "Frasco Razoavel", count: colecoes.filter(c => c.condicaoFrasco === "RAZOAVEL").length, color: "bg-amber-500" },
                ].map((item) => {
                  const maxCount = Math.max(...colecoes.map(() => 1), 1);
                  const width = `${(item.count / maxCount) * 100}%`;
                  return (
                    <div key={item.label} className="flex items-center gap-4">
                      <span className="text-sm text-surface-600 dark:text-surface-400 w-32">
                        {item.label}
                      </span>
                      <div className="flex-1 h-2 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${item.color} rounded-full transition-all duration-1000`}
                          style={{ width: item.count > 0 ? width : "0%" }}
                        />
                      </div>
                      <span className="text-sm font-medium text-surface-900 dark:text-surface-100 w-8 text-right">
                        {item.count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
