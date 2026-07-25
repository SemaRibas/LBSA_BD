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
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-500/30 shadow-xs">
            <Shield className="h-4 w-4" />
            Administrador
          </span>
        );
      case "monitor":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border border-teal-500/30 shadow-xs">
            <Eye className="h-4 w-4" />
            Monitor(a)
          </span>
        );
      case "pesquisador":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-500/30 shadow-xs">
            <Microscope className="h-4 w-4" />
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

  const getSelectStyle = (role: UserRole) => {
    switch (role) {
      case "admin":
        return "bg-purple-50 dark:bg-purple-950/60 border-purple-300 dark:border-purple-700/60 text-purple-900 dark:text-purple-200 focus:ring-purple-500";
      case "monitor":
        return "bg-teal-50 dark:bg-teal-950/60 border-teal-300 dark:border-teal-700/60 text-teal-900 dark:text-teal-200 focus:ring-teal-500";
      case "pesquisador":
      default:
        return "bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700/60 text-amber-900 dark:text-amber-200 focus:ring-amber-500";
    }
  };

  return (
    <Card className="animate-slide-up bg-white dark:bg-surface-900 border border-surface-200 dark:border-teal-500/20 shadow-md p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-surface-100 dark:border-surface-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 border border-teal-500/20">
              <UserCheck className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-extrabold text-surface-900 dark:text-surface-100">
              Integrantes da Equipe & Funções
            </h3>
          </div>
          <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">
            Membros ativos do LBSA e suas permissões no sistema
          </p>
        </div>

        {isAdmin && (
          <span className="self-start sm:self-center inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-200 border border-purple-500/30 shadow-xs">
            <Shield className="h-3.5 w-3.5" />
            Modo Administrador
          </span>
        )}
      </div>

      {/* Role Definitions Guide Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="p-3 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-900/50 text-xs">
          <div className="flex items-center gap-1.5 mb-1 text-purple-800 dark:text-purple-300 font-extrabold">
            <Shield className="h-4 w-4 shrink-0" />
            <span>Administrador</span>
          </div>
          <p className="text-surface-600 dark:text-surface-400 leading-snug">
            Acesso total. Pode definir e alterar a função de qualquer integrante.
          </p>
        </div>

        <div className="p-3 rounded-2xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200/80 dark:border-teal-900/50 text-xs">
          <div className="flex items-center gap-1.5 mb-1 text-teal-800 dark:text-teal-300 font-extrabold">
            <Eye className="h-4 w-4 shrink-0" />
            <span>Monitor(a)</span>
          </div>
          <p className="text-surface-600 dark:text-surface-400 leading-snug">
            Monitora acervos. Pode editar e/ou excluir dados de todos os pesquisadores.
          </p>
        </div>

        <div className="p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 text-xs">
          <div className="flex items-center gap-1.5 mb-1 text-amber-800 dark:text-amber-300 font-extrabold">
            <Microscope className="h-4 w-4 shrink-0" />
            <span>Pesquisador</span>
          </div>
          <p className="text-surface-600 dark:text-surface-400 leading-snug">
            Cadastra itens. Pode editar/excluir somente os dados inseridos por ele próprio.
          </p>
        </div>
      </div>

      {/* Team Member List */}
      <div className="space-y-3">
        {users.map((member) => {
          const isMe = currentUser?.id === member.id;
          const role = member.role || "pesquisador";

          return (
            <div
              key={member.id}
              className="p-3.5 sm:p-4 flex flex-col xs:flex-row xs:items-center justify-between gap-3.5 bg-surface-50/80 dark:bg-surface-800/40 border border-surface-200/70 dark:border-surface-700/60 rounded-2xl hover:border-teal-500/40 transition-all shadow-2xs"
            >
              {/* Member Avatar & Details */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 text-white font-black flex items-center justify-center text-sm shadow-md shrink-0 border border-white/20">
                  {member.name ? member.name.slice(0, 2).toUpperCase() : "U"}
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-extrabold text-sm text-surface-900 dark:text-surface-100 truncate">
                      {member.name}
                    </span>
                    {isMe && (
                      <span className="text-[10px] uppercase font-black px-2 py-0.5 bg-teal-600 text-white rounded-lg shadow-2xs">
                        Você
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-surface-500 dark:text-surface-400 truncate mt-0.5">
                    {member.email}
                  </span>
                </div>
              </div>

              {/* Role Badge or Admin Selector */}
              <div className="shrink-0 self-start xs:self-center w-full xs:w-auto">
                {isAdmin ? (
                  <div className="relative w-full xs:w-auto">
                    <select
                      value={role}
                      disabled={updatingUserId === member.id}
                      onChange={(e) => handleRoleSelect(member.id, e.target.value as UserRole)}
                      className={`w-full xs:w-auto text-xs font-bold px-3 py-2 rounded-xl border transition-all cursor-pointer focus:outline-none focus:ring-2 shadow-2xs ${getSelectStyle(
                        role
                      )}`}
                    >
                      <option value="pesquisador" className="bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100 font-semibold py-2">
                        🔬 Pesquisador
                      </option>
                      <option value="monitor" className="bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100 font-semibold py-2">
                        👁️ Monitor(a)
                      </option>
                      <option value="admin" className="bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100 font-semibold py-2">
                        🛡️ Administrador
                      </option>
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
