"use client";

import { Card } from "@/components/ui/Card";
import { Clock } from "lucide-react";

interface Activity {
  id: number;
  action: string;
  item: string;
  time: string;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
}

interface ActivityCardProps {
  activities: Activity[];
}

interface TeamCardProps {
  teamMembers: TeamMember[];
}

const ActivityCard = ({ activities }: ActivityCardProps) => {
  return (
    <Card className="animate-slide-up" style={{ animationDelay: "500ms" }}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
          Atividade Recente
        </h3>
        <Clock className="h-5 w-5 text-surface-400" />
      </div>

      <div className="space-y-4">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start gap-3 p-3 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors"
          >
            <div className="w-2 h-2 rounded-full bg-teal-500 mt-2 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-surface-900 dark:text-surface-100 truncate">
                {activity.action}
              </p>
              <p className="text-sm text-surface-600 dark:text-surface-400">
                {activity.item}
              </p>
            </div>
            <span className="text-xs text-surface-500 whitespace-nowrap">
              {activity.time}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
};

const TeamCard = ({ teamMembers }: TeamCardProps) => {
  return (
    <Card className="animate-slide-up" style={{ animationDelay: "600ms" }}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
          Equipe
        </h3>
        <span className="text-sm text-teal-600 font-medium">Ver todos</span>
      </div>

      <div className="space-y-3">
        {teamMembers.map((member) => (
          <div
            key={member.id}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-semibold text-sm">
              {member.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-surface-900 dark:text-surface-100 truncate">
                {member.name}
              </p>
              <p className="text-xs text-surface-500">{member.role}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export { ActivityCard, TeamCard };
