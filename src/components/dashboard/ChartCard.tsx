"use client";

import { Card } from "@/components/ui/Card";

interface ChartDataItem {
  month: string;
  materiais: number;
  colecoes: number;
}

interface ChartCardProps {
  chartData: ChartDataItem[];
}

const ChartCard = ({ chartData }: ChartCardProps) => {
  const maxValue = Math.max(
    ...chartData.map((d) => Math.max(d.materiais, d.colecoes)),
    1
  );

  const startLabel = chartData[0]?.month || "";
  const endLabel = chartData[chartData.length - 1]?.month || "";
  const periodBadge = startLabel === endLabel ? `Mês: ${startLabel}` : `${startLabel} a ${endLabel}`;

  return (
    <Card className="animate-slide-up bg-white dark:bg-surface-900 border border-surface-200 dark:border-teal-500/20" style={{ animationDelay: "400ms" }}>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <div>
          <h3 className="text-lg font-bold text-surface-900 dark:text-surface-100">
            Visão Geral
          </h3>
          <p className="text-xs text-surface-500 dark:text-surface-400">
            Movimentação real do acervo por mês e ano
          </p>
        </div>
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border border-teal-500/20 shadow-xs">
          {periodBadge}
        </span>
      </div>

      <div className="h-56 flex items-end justify-between gap-2 xs:gap-3 sm:gap-4 px-2">
        {chartData.map((data) => {
          const matPercent = Math.max((data.materiais / maxValue) * 100, 6);
          const colPercent = Math.max((data.colecoes / maxValue) * 100, 6);

          return (
            <div key={data.month} className="flex-1 flex flex-col items-center gap-2 group relative">
              <div className="w-full flex gap-1.5 sm:gap-2.5 items-end justify-center" style={{ height: "160px" }}>
                {/* Materiais Bar */}
                <div className="relative flex flex-col items-center w-5 xs:w-6 sm:w-8 h-full justify-end">
                  <span className="text-[10px] font-extrabold text-teal-600 dark:text-teal-400 mb-1 opacity-90 group-hover:opacity-100 transition-opacity">
                    {data.materiais}
                  </span>
                  <div
                    className="w-full bg-teal-500 hover:bg-teal-600 dark:bg-teal-500 dark:hover:bg-teal-400 rounded-t-lg transition-all duration-500 shadow-xs"
                    style={{ height: `${matPercent}%` }}
                    title={`Materiais em ${data.month}: ${data.materiais}`}
                  />
                </div>

                {/* Colecoes Bar */}
                <div className="relative flex flex-col items-center w-5 xs:w-6 sm:w-8 h-full justify-end">
                  <span className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400 mb-1 opacity-90 group-hover:opacity-100 transition-opacity">
                    {data.colecoes}
                  </span>
                  <div
                    className="w-full bg-amber-500 hover:bg-amber-600 dark:bg-amber-500 dark:hover:bg-amber-400 rounded-t-lg transition-all duration-500 shadow-xs"
                    style={{ height: `${colPercent}%` }}
                    title={`Coleções em ${data.month}: ${data.colecoes}`}
                  />
                </div>
              </div>

              <span className="text-xs font-bold text-surface-700 dark:text-surface-300 tracking-tight text-center truncate max-w-full">
                {data.month}
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-surface-100 dark:border-surface-800">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-teal-500" />
          <span className="text-xs font-bold text-surface-700 dark:text-surface-300">
            Materiais
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <span className="text-xs font-bold text-surface-700 dark:text-surface-300">
            Coleções
          </span>
        </div>
      </div>
    </Card>
  );
};

export { ChartCard };
