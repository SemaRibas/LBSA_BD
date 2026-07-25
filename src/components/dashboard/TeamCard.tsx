"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { UserWithoutPassword, UserRole } from "@/types";
import { Shield, Eye, Microscope, UserCheck, ChevronRight } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";

interface TeamCardProps {
  users: UserWithoutPassword[];
  currentUser: UserWithoutPassword | null;
  onUserRoleChange?: (userId: string, newRole: UserRole) => void;
}

export function TeamCard({ users, currentUser, onUserRoleChange }: TeamCardProps) {
  const toast = useToast();
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const isAdmin = currentUser?.role === "admin";

  const handleRoleSelect = async (userId: string, targetRole: UserRole) => {
    setUpdatingUserId(userId);
    try {
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: targetRole }),
      });

      if (res.ok) {
        toast.success("Função Atualizada!", `A função do usuário foi alterada para "${getRoleLabel(targetRole)}".`);
        if (onUserRoleChange) onUserRoleChange(userId, targetRole);
      } else {
        const data = await res.json();
        toast.error("Erro na permissão", data.error || "Não foi possível alterar a função.");
      }
    } catch {
      toast.error("Erro no Servidor", "Ocorreu uma falha ao alterar a função.");
    } finally {
      setUpdatingUserId(null);
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case "admin":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-500/30 shadow-sm">
            <Shield className="h-3.5 w-3.5" />
            Administrador
          </span>
        );
      case "monitor":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border border-teal-500/30 shadow-sm">
            <Eye className="h-3.5 w-3.5" />
            Monitor(a)
          </span>
        );
      case "pesquisador":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-500/30 shadow-sm">
            <Microscope className="h-3.5 w-3.5" />
            Pesquisador
          </span>
        );
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case "admin":
        return "Administrador";
      case "monitor":
        return "Monitor(a)";
      case "pesquisador":
        return "Pesquisador";
    }
  };

  return (
    <Card className="animate-slide-up bg-white dark:bg-surface-900 border border-surface-200 dark:border-teal-500/20 shadow-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-4 border-b border-surface-100 dark:border-surface-800">
        <div>
          <div className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            <h3 className="text-lg font-bold text-surface-900 dark:text-surface-100">
              Integrantes da Equipe & Funções
            </h3>
          </div>
          <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">
            Membros ativos do LBSA e suas atribuições de controle
          </p>
        </div>

        {isAdmin && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-500/20">
            Você é Administrador (Gerenciando permissões)
          </span>
        )}
      </div>

      {/* Role Definitions Guide */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5 p-3 rounded-xl bg-surface-50 dark:bg-surface-950 border border-surface-200/60 dark:border-surface-800 text-xs">
        <div className="flex items-start gap-2">
          <Shield className="h-4 w-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-surface-900 dark:text-surface-100">Administrador:</strong>
            <p className="text-surface-500 dark:text-surface-400">Acesso total e altera a função de qualquer integrante.</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Eye className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-surface-900 dark:text-surface-100">Monitor(a):</strong>
            <p className="text-surface-500 dark:text-surface-400">Monitora os dados e pode modificar/excluir de todos os pesquisadores.</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Microscope className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-surface-900 dark:text-surface-100">Pesquisador:</strong>
            <p className="text-surface-500 dark:text-surface-400">Cadastra no acervo e só pode modificar/excluir seus próprios itens.</p>
          </div>
        </div>
      </div>

      {/* Team Member List */}
      <div className="divide-y divide-surface-100 dark:divide-surface-800">
        {users.map((member) => {
          const isMe = currentUser?.id === member.id;
          const role = member.role || "pesquisador";

          return (
            <div
              key={member.id}
              className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-surface-50/50 dark:hover:bg-surface-800/30 px-2 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 text-white font-bold flex items-center justify-center text-sm shadow-md shrink-0">
                  {member.name ? member.name.slice(0, 2).toUpperCase() : "U"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-surface-900 dark:text-surface-100">
                      {member.name}
                    </span>
                    {isMe && (
                      <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200 rounded">
                        Você
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-surface-500 dark:text-surface-400">
                    {member.email}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center">
                {/* Admin can change member role */}
                {isAdmin ? (
                  <div className="flex items-center gap-2">
                    <select
                      value={role}
                      disabled={updatingUserId === member.id}
                      onChange={(e) => handleRoleSelect(member.id, e.target.value as UserRole)}
                      className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-surface-100 dark:bg-surface-800 border border-surface-300 dark:border-surface-700 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="admin">Administrador</option>
                      <option value="monitor">Monitor(a)</option>
                      <option value="pesquisador">Pesquisador</option>
                    </select>
                  </div>
                ) : (
                  getRoleBadge(role)
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
