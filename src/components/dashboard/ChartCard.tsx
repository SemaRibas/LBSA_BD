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
  const maxValue = Math.max(...chartData.map((d) => Math.max(d.materiais, d.colecoes)), 1);

  return (
    <Card className="animate-slide-up" style={{ animationDelay: "400ms" }}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
          Visao Geral
        </h3>
        <span className="text-sm text-surface-500">Ultimos 6 meses</span>
      </div>

      <div className="h-48 flex items-end justify-between gap-2">
        {chartData.map((data) => (
          <div key={data.month} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex gap-1 items-end justify-center" style={{ height: "140px" }}>
              <div
                className="w-4 bg-teal-500 rounded-t-lg transition-all duration-500 hover:bg-teal-600"
                style={{ height: `${(data.materiais / maxValue) * 100}%` }}
                title={`${data.materiais} materiais`}
              />
              <div
                className="w-4 bg-peach-400 rounded-t-lg transition-all duration-500 hover:bg-peach-500"
                style={{ height: `${(data.colecoes / maxValue) * 100}%` }}
                title={`${data.colecoes} colecoes`}
              />
            </div>
            <span className="text-xs text-surface-500">{data.month}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-teal-500" />
          <span className="text-sm text-surface-600 dark:text-surface-400">Materiais</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-peach-400" />
          <span className="text-sm text-surface-600 dark:text-surface-400">Colecoes</span>
        </div>
      </div>
    </Card>
  );
};

export { ChartCard };
