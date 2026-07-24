"use client";

import { Card } from "@/components/ui/Card";
import { Package, Archive, CheckCircle, AlertTriangle } from "lucide-react";

interface Metrics {
  totalMateriais: number;
  totalColecoes: number;
  materiaisConservados: number;
  colecoesAtivas: number;
}

interface MetricCardsProps {
  metrics: Metrics;
}

const MetricCards = ({ metrics }: MetricCardsProps) => {
  const metricItems = [
    {
      label: "Total de Materiais",
      value: metrics.totalMateriais,
      icon: Package,
      trend: `${metrics.totalMateriais} cadastrados`,
      color: "text-teal-600",
    },
    {
      label: "Total de Colecoes",
      value: metrics.totalColecoes,
      icon: Archive,
      trend: `${metrics.totalColecoes} especimes`,
      color: "text-blue-600",
    },
    {
      label: "Materiais Conservados",
      value: metrics.materiaisConservados,
      icon: CheckCircle,
      trend: `${metrics.totalMateriais > 0 ? Math.round((metrics.materiaisConservados / metrics.totalMateriais) * 100) : 0}% do total`,
      color: "text-green-600",
    },
    {
      label: "Colecoes Ativas",
      value: metrics.colecoesAtivas,
      icon: AlertTriangle,
      trend: `${metrics.totalColecoes > 0 ? Math.round((metrics.colecoesAtivas / metrics.totalColecoes) * 100) : 0}% favoraveis`,
      color: "text-amber-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metricItems.map((metric, index) => (
        <Card
          key={metric.label}
          hover
          className="animate-slide-up"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-surface-600 dark:text-surface-400 mb-1">
                {metric.label}
              </p>
              <p className="text-3xl font-bold text-surface-900 dark:text-surface-100">
                {metric.value}
              </p>
              <p className="text-xs text-surface-500 dark:text-surface-500 mt-1">
                {metric.trend}
              </p>
            </div>
            <div className={`p-3 rounded-xl bg-surface-50 dark:bg-surface-800 ${metric.color}`}>
              <metric.icon className="h-5 w-5" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export { MetricCards };
