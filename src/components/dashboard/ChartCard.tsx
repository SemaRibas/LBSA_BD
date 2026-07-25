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

  return (
    <Card className="animate-slide-up bg-white dark:bg-surface-900 border border-surface-200 dark:border-teal-500/20" style={{ animationDelay: "400ms" }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-surface-900 dark:text-surface-100">
            Visão Geral
          </h3>
          <p className="text-xs text-surface-500 dark:text-surface-400">
            Movimentação e histórico do acervo
          </p>
        </div>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border border-teal-500/20 shadow-sm">
          Últimos 6 meses
        </span>
      </div>

      <div className="h-52 flex items-end justify-between gap-1 xs:gap-2 sm:gap-3 px-1 xs:px-2">
        {chartData.map((data) => {
          const matPercent = Math.max((data.materiais / maxValue) * 100, 4);
          const colPercent = Math.max((data.colecoes / maxValue) * 100, 4);

          return (
            <div key={data.month} className="flex-1 flex flex-col items-center gap-2 group relative">
              <div className="w-full flex gap-1 xs:gap-1.5 items-end justify-center" style={{ height: "150px" }}>
                {/* Materiais Bar */}
                <div className="relative flex flex-col items-center w-3.5 xs:w-4 sm:w-5 h-full justify-end">
                  <div
                    className="w-full bg-teal-500 hover:bg-teal-600 dark:bg-teal-500 dark:hover:bg-teal-400 rounded-t-md transition-all duration-700 shadow-sm"
                    style={{ height: `${matPercent}%` }}
                    title={`Materiais em ${data.month}: ${data.materiais}`}
                  />
                </div>

                {/* Colecoes Bar */}
                <div className="relative flex flex-col items-center w-3.5 xs:w-4 sm:w-5 h-full justify-end">
                  <div
                    className="w-full bg-amber-500 hover:bg-amber-600 dark:bg-amber-500 dark:hover:bg-amber-400 rounded-t-md transition-all duration-700 shadow-sm"
                    style={{ height: `${colPercent}%` }}
                    title={`Coleções em ${data.month}: ${data.colecoes}`}
                  />
                </div>
              </div>

              <span className="text-xs font-semibold text-surface-600 dark:text-surface-400">
                {data.month}
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-surface-100 dark:border-surface-800">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-teal-500" />
          <span className="text-xs font-semibold text-surface-700 dark:text-surface-300">
            Materiais
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <span className="text-xs font-semibold text-surface-700 dark:text-surface-300">
            Coleções
          </span>
        </div>
      </div>
    </Card>
  );
};

export { ChartCard };
