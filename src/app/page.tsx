"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MetricCards } from "@/components/dashboard/MetricCards";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { ActivityCard } from "@/components/dashboard/ActivityCard";
import { TeamCard } from "@/components/dashboard/TeamCard";
import { StatusDistributionCard } from "@/components/dashboard/StatusDistributionCard";
import { Card } from "@/components/ui/Card";
import ElectricBorder from "@/components/ui/ElectricBorder";
import { Material, Colecao, UserWithoutPassword, UserRole } from "@/types";
import { Layers } from "lucide-react";
import Smooth3DSlideshow from "@/components/ui/Smooth3DSlideshow";
import { colecoesToSlides, materiaisToSlides } from "@/lib/slideAdapters";

import { useAuth } from "@/contexts/AuthContext";

export default function DashboardPage() {
  const router = useRouter();
  const { user: authUser, isLoading: authLoading } = useAuth();
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [colecoes, setColecoes] = useState<Colecao[]>([]);
  const [users, setUsers] = useState<UserWithoutPassword[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [galleryMode, setGalleryMode] = useState<"colecoes" | "inventario">("colecoes");

  const currentUser = authUser;

  useEffect(() => {
    if (authLoading) return;
    if (!authUser) {
      router.replace("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const [materiaisRes, colecoesRes, usersRes] = await Promise.all([
          fetch("/api/materiais"),
          fetch("/api/colecoes"),
          fetch("/api/users"),
        ]);

        if (materiaisRes.ok) setMateriais(await materiaisRes.json());
        if (colecoesRes.ok) setColecoes(await colecoesRes.json());
        if (usersRes.ok) setUsers(await usersRes.json());
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [authUser, authLoading, router]);

  const metrics = useMemo(() => {
    return {
      totalMateriais: materiais.length,
      totalColecoes: colecoes.length,
      materiaisConservados: materiais.filter((m) => m.estado === "Conservado").length,
      colecoesAtivas: colecoes.filter((c) => c.condicaoRecipiente === "FAVORAVEL" || c.status === "TRANSPARENTE").length,
    };
  }, [materiais, colecoes]);



  // Dynamic Laboratory Health Score calculation (0 - 100)
  const healthData = useMemo(() => {
    const totalM = materiais.length;
    const totalC = colecoes.length;
    const totalItems = totalM + totalC;

    if (totalItems === 0) {
      return { score: 100, status: "Excelente", color: "#14b8a6", delta: "+0" };
    }

    const conservadosM = materiais.filter((m) => m.estado === "Conservado").length;
    const mRatio = totalM > 0 ? conservadosM / totalM : 1;

    const favoraveisC = colecoes.filter(
      (c) => c.condicaoRecipiente === "FAVORAVEL" || c.status === "TRANSPARENTE"
    ).length;
    const cRatio = totalC > 0 ? favoraveisC / totalC : 1;

    const rawScore = Math.round((mRatio * 0.5 + cRatio * 0.5) * 100);
    const score = Math.max(0, Math.min(100, rawScore));

    let status = "Excelente";
    let color = "#14b8a6";
    let delta = "+2";

    if (score >= 85) {
      status = "Excelente";
      color = "#14b8a6";
      delta = "+2";
    } else if (score >= 70) {
      status = "Bom";
      color = "#10b981";
      delta = "+1";
    } else if (score >= 50) {
      status = "Razoável";
      color = "#f59e0b";
      delta = "0";
    } else {
      status = "Crítico";
      color = "#ef4444";
      delta = "-3";
    }

    return { score, status, color, delta };
  }, [materiais, colecoes]);

  // Helper to parse date strings safely
  const parseItemDate = (dateStr?: string) => {
    const now = new Date();
    if (!dateStr || typeof dateStr !== "string") {
      return { year: now.getFullYear(), month: now.getMonth() };
    }

    const str = dateStr.trim();
    if (!str) return { year: now.getFullYear(), month: now.getMonth() };

    const isoMatch = str.match(/^(\d{4})[-/](\d{1,2})([-/#].*)?$/);
    if (isoMatch) {
      const year = parseInt(isoMatch[1], 10);
      const month = parseInt(isoMatch[2], 10) - 1;
      if (year >= 2000 && year <= 2100 && month >= 0 && month <= 11) {
        return { year, month };
      }
    }

    const brMatch = str.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/);
    if (brMatch) {
      const year = parseInt(brMatch[3], 10);
      const month = parseInt(brMatch[2], 10) - 1;
      if (year >= 2000 && year <= 2100 && month >= 0 && month <= 11) {
        return { year, month };
      }
    }

    const parsedDate = new Date(str);
    if (!isNaN(parsedDate.getTime()) && parsedDate.getFullYear() >= 2000) {
      return { year: parsedDate.getFullYear(), month: parsedDate.getMonth() };
    }

    return { year: now.getFullYear(), month: now.getMonth() };
  };

  // Real chart data grouped by actual registration months starting from the first record month
  const chartData = useMemo(() => {
    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    if (colecoes.length === 0 && materiais.length === 0) {
      const label = `${monthNames[currentMonth]}/${currentYear}`;
      return [{ month: label, materiais: 0, colecoes: 0 }];
    }

    let earliestYear = currentYear;
    let earliestMonth = currentMonth;

    colecoes.forEach((c) => {
      const d = parseItemDate(c.dataColeta);
      if (d.year < earliestYear || (d.year === earliestYear && d.month < earliestMonth)) {
        earliestYear = d.year;
        earliestMonth = d.month;
      }
    });

    materiais.forEach((m) => {
      const d = parseItemDate(m.validade);
      if (d.year < earliestYear || (d.year === earliestYear && d.month < earliestMonth)) {
        earliestYear = d.year;
        earliestMonth = d.month;
      }
    });

    const timeline: { label: string; year: number; month: number }[] = [];
    let curY = earliestYear;
    let curM = earliestMonth;

    while (curY < currentYear || (curY === currentYear && curM <= currentMonth)) {
      timeline.push({
        label: `${monthNames[curM]}/${curY}`,
        year: curY,
        month: curM,
      });

      curM++;
      if (curM > 11) {
        curM = 0;
        curY++;
      }
    }

    return timeline.map(({ label, year, month }) => {
      const colCount = colecoes.filter((c) => {
        const d = parseItemDate(c.dataColeta);
        return d.year === year && d.month === month;
      }).length;

      const matCount = materiais.filter((m) => {
        const d = parseItemDate(m.validade);
        return d.year === year && d.month === month;
      }).length;

      const finalColCount = timeline.length === 1 && colCount === 0 ? colecoes.length : colCount;
      const finalMatCount = timeline.length === 1 && matCount === 0 ? materiais.length : matCount;

      return {
        month: label,
        materiais: finalMatCount,
        colecoes: finalColCount,
      };
    });
  }, [materiais, colecoes]);

  const recentActivity = useMemo(() => {
    return [
      {
        id: 1,
        action: "Última sincronização",
        item: `${materiais.length} materiais e ${colecoes.length} coleções`,
        time: "Hoje",
      },
    ];
  }, [materiais, colecoes]);

  const slides = galleryMode === "colecoes" ? colecoesToSlides(colecoes) : materiaisToSlides(materiais);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex items-center justify-center">
        <div className="animate-pulse text-surface-600 font-medium">Carregando dados do laboratório...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
      <Sidebar />

      <main className="lg:ml-20 p-4 sm:p-6 lg:p-8">
        <Header title="Dashboard" activeTab="Insights" />

        {/* Electric Hero Logo Banner */}
        <div className="mb-8 animate-slide-up overflow-hidden max-w-full rounded-[28px]">
          <ElectricBorder
            color="#FFFFFF"
            glowColor="#FFFFFF"
            bgColor="#090d16"
            speed={1}
            chaos={4}
            thickness={3.5}
            borderRadius={28}
            glowIntensity={9}
            className="shadow-2xl shadow-teal-500/20"
          >
            <div className="relative w-full py-6 sm:py-8 px-4 xs:px-6 sm:px-12 flex flex-col md:flex-row items-center justify-between gap-5 sm:gap-6 rounded-[28px] bg-gradient-to-r from-surface-950 via-teal-950/90 to-surface-900 overflow-hidden border border-teal-500/30">
              {/* Glow background accents */}
              <div className="absolute -left-20 -top-20 w-80 h-80 bg-teal-500/20 rounded-full filter blur-3xl pointer-events-none" />
              <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-emerald-500/20 rounded-full filter blur-3xl pointer-events-none" />

              {/* Text content */}
              <div className="flex-1 text-center md:text-left z-10">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] xs:text-xs font-extrabold bg-teal-500/20 text-teal-300 border border-teal-500/30 mb-2.5 sm:mb-3 shadow-sm">
                  LBSA • UNIVERSIDADE ESTADUAL DO SUDOESTE DA BAHIA
                </span>
                <h2 className="text-xl xs:text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                  Laboratório de Biossistemática Animal
                </h2>
                <p className="mt-2 text-xs xs:text-sm sm:text-base text-teal-100/80 max-w-xl">
                  Gerenciamento inteligente de acervos biológicos, inventário de materiais e coleções sistemáticas com alta precisão.
                </p>
              </div>

              {/* Large Hero Logo */}
              <div className="shrink-0 flex items-center justify-center p-1 sm:p-2 z-10">
                <img
                  src="/logo_white.png"
                  alt="LBSA Hero Logo"
                  className="h-32 xs:h-40 sm:h-52 md:h-64 w-auto object-contain filter drop-shadow-[0_12px_30px_rgba(255,255,255,0.3)] transition-transform duration-500 hover:scale-105"
                />
              </div>
            </div>
          </ElectricBorder>
        </div>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Main metric card */}
          <Card variant="gradient" className="lg:col-span-2 text-white relative overflow-hidden p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-white/15 backdrop-blur-md text-teal-100 border border-white/20 mb-2">
                  Acervo Biológico
                </span>
                <h3 className="text-teal-100 text-sm font-medium">Materiais Cadastrados</h3>
                <p className="text-4xl sm:text-5xl font-black text-white tracking-tight my-1">
                  {metrics.totalMateriais}
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0 shadow-inner">
                <Layers className="h-6 w-6 text-white" />
              </div>
            </div>

            {/* Organized Status Pill Badges */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 mt-4 pt-3 border-t border-white/15">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-bold text-white shadow-xs whitespace-nowrap">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                <span>{metrics.materiaisConservados} Conservados</span>
              </div>

              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-bold text-white shadow-xs whitespace-nowrap">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                <span>{metrics.totalMateriais - metrics.materiaisConservados} Outros</span>
              </div>
            </div>
          </Card>

          {/* Dynamic Score Card: Saúde do Laboratório */}
          <Card variant="accent" className="bg-amber-50/60 dark:bg-surface-900 border border-amber-200/50 dark:border-teal-500/20">
            <div className="flex flex-col items-center justify-center h-full p-2">
              <p className="text-surface-700 dark:text-surface-300 text-sm mb-2 font-semibold tracking-wide">
                Saúde do Laboratório
              </p>

              {/* Dynamic Semi-circle Gauge SVG */}
              <div className="relative w-36 h-20 mb-2">
                <svg viewBox="0 0 100 50" className="w-full h-full">
                  <path
                    d="M 10 45 A 40 40 0 0 1 90 45"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                    strokeLinecap="round"
                    className="dark:stroke-surface-700"
                  />
                  <path
                    d="M 10 45 A 40 40 0 0 1 90 45"
                    fill="none"
                    stroke={healthData.color}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray="126"
                    strokeDashoffset={126 - (126 * healthData.score) / 100}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex items-end justify-center pb-1">
                  <span className="text-3xl font-extrabold text-surface-900 dark:text-surface-100">
                    {healthData.score}
                  </span>
                </div>
              </div>

              {/* Score Differential and Status */}
              <div className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: healthData.color }}>
                <span>{healthData.delta}</span>
                <span className="text-surface-600 dark:text-surface-400 font-normal">pontos ({healthData.status})</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Integrantes da Equipe e Funções (Logo Abaixo do Hero) */}
        <div className="mb-6">
          <TeamCard
            users={users}
            currentUser={currentUser}
            onUserRoleChange={(userId, newRole) => {
              setUsers((prev) =>
                prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
              );
            }}
            onUserProfileUpdate={(updatedUser) => {
              setUsers((prev) =>
                prev.map((u) => (u.id === updatedUser.id ? { ...u, ...updatedUser } : u))
              );
            }}
          />
        </div>

        {/* Metric cards */}
        <div className="mb-6">
          <MetricCards metrics={metrics} />
        </div>

        {/* 3D Coverflow Showcase */}
        {slides.length > 0 && (
          <Card className="mb-6 p-4 bg-gradient-to-br from-surface-100 via-teal-50/20 to-surface-50 dark:from-surface-900 dark:via-surface-950 dark:to-surface-900 border border-teal-500/20 shadow-xl dark:shadow-2xl overflow-hidden animate-slide-up">
            <div className="flex flex-col sm:flex-row items-center justify-between px-4 pt-2 mb-2 gap-3">
              <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400">
                <Layers className="h-5 w-5" />
                <h2 className="text-lg font-bold text-surface-900 dark:text-white tracking-wide">
                  Destaques em 3D Coverflow
                </h2>
              </div>
              <div className="flex items-center gap-2 bg-surface-200/70 dark:bg-surface-800/80 p-1 rounded-lg border border-surface-300/50 dark:border-surface-700/50">
                <button
                  type="button"
                  onClick={() => setGalleryMode("colecoes")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    galleryMode === "colecoes"
                      ? "bg-teal-600 text-white shadow-md"
                      : "text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white"
                  }`}
                >
                  Coleções ({colecoes.length})
                </button>
                <button
                  type="button"
                  onClick={() => setGalleryMode("inventario")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    galleryMode === "inventario"
                      ? "bg-teal-600 text-white shadow-md"
                      : "text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white"
                  }`}
                >
                  Inventário ({materiais.length})
                </button>
              </div>
            </div>
            <Smooth3DSlideshow
              slides={slides}
              cardWidth={380}
              cardHeight={350}
              autoplay={false}
              tilt={10}
              sideTilt={6}
              gap={7}
              onSlideSelect={() => {
                if (galleryMode === "colecoes") {
                  router.push("/channels");
                } else {
                  router.push("/insights");
                }
              }}
            />
          </Card>
        )}

        {/* Charts and activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <ChartCard chartData={chartData} />
          </div>
          <ActivityCard activities={recentActivity} />
        </div>

        {/* Coleções por Status Breakdown */}
        <div className="mb-6">
          <StatusDistributionCard colecoes={colecoes} />
        </div>
      </main>
    </div>
  );
}
