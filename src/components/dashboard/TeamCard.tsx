"use client";

import { useState, useMemo, useRef } from "react";
import { Card } from "@/components/ui/Card";
import { UserWithoutPassword, UserRole } from "@/types";
import {
  Shield,
  Eye,
  Microscope,
  UserCheck,
  ChevronRight,
  Mail,
  Calendar,
  Sparkles,
  Camera,
  Upload,
  Link as LinkIcon,
  Trash2,
  X,
  Check,
  User as UserIcon,
} from "lucide-react";
import { useToast } from "@/contexts/ToastContext";
import KlarnaCarousel, { CarouselItem } from "@/components/ui/KlarnaCarousel";
import { getFirstAndSurnameInitials } from "@/lib/userUtils";

interface TeamCardProps {
  users: UserWithoutPassword[];
  currentUser: UserWithoutPassword | null;
  onUserRoleChange?: (userId: string, newRole: UserRole) => void;
  onUserProfileUpdate?: (updatedUser: UserWithoutPassword) => void;
}

const DEFAULT_TEAM_MEMBERS: UserWithoutPassword[] = [
  { id: "1", name: "Dra. Sophia Benett", email: "sophia.benett@uesb.edu.br", role: "admin", createdAt: "2024-01-15" },
  { id: "2", name: "Dra. Isabella Foster", email: "isabella.foster@uesb.edu.br", role: "monitor", createdAt: "2024-02-10" },
  { id: "3", name: "Me. Grace Turner", email: "grace.turner@uesb.edu.br", role: "pesquisador", createdAt: "2024-03-01" },
  { id: "4", name: "Dr. Olivia Parker", email: "olivia.parker@uesb.edu.br", role: "admin", createdAt: "2024-03-12" },
  { id: "5", name: "Lucas Turner", email: "lucas.turner@uesb.edu.br", role: "pesquisador", createdAt: "2024-04-05" },
  { id: "6", name: "Emma Collins", email: "emma.collins@uesb.edu.br", role: "monitor", createdAt: "2024-04-20" },
  { id: "7", name: "Mia Carter", email: "mia.carter@uesb.edu.br", role: "pesquisador", createdAt: "2024-05-02" },
  { id: "8", name: "Ella Morgan", email: "ella.morgan@uesb.edu.br", role: "pesquisador", createdAt: "2024-05-18" },
];

export function TeamCard({ users, currentUser, onUserRoleChange, onUserProfileUpdate }: TeamCardProps) {
  const toast = useToast();
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  // Local users state so avatar changes reflect instantly
  const [localUsers, setLocalUsers] = useState<UserWithoutPassword[]>([]);

  const displayUsers = useMemo(() => {
    if (localUsers.length > 0) return localUsers;
    if (users && users.length > 0) return users;
    return DEFAULT_TEAM_MEMBERS;
  }, [localUsers, users]);

  const isAdmin = currentUser?.role === "admin";
  const activeUser = displayUsers[activeIndex] || displayUsers[0];
  const canEditActiveUser = currentUser?.id === activeUser?.id || isAdmin;

  const handleRoleSelect = async (userId: string, targetRole: UserRole) => {
    setUpdatingUserId(userId);
    try {
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: targetRole }),
      });

      if (res.ok) {
        toast.success("Função Atualizada!", `A função de ${activeUser.name} foi alterada para "${getRoleLabel(targetRole)}".`);
        if (onUserRoleChange) onUserRoleChange(userId, targetRole);
        setLocalUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: targetRole } : u))
        );
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

  const handleSaveAvatar = async (userId: string, newImagemUrl: string | undefined) => {
    setUpdatingUserId(userId);
    try {
      const avatarValue = newImagemUrl || "";
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, imagemUrl: avatarValue, requesterId: currentUser?.id }),
      });

      if (res.ok) {
        const updated = await res.json();
        toast.success("Foto de Perfil Atualizada!", `A foto de ${activeUser.name} foi atualizada com sucesso.`);
        
        // Save local backup in localStorage
        try {
          if (avatarValue) {
            localStorage.setItem(`lbsa_user_avatar_${userId}`, avatarValue);
          } else {
            localStorage.removeItem(`lbsa_user_avatar_${userId}`);
          }
        } catch {}

        setLocalUsers((prev) => {
          const list = prev.length > 0 ? prev : displayUsers;
          return list.map((u) => (u.id === userId ? { ...u, imagemUrl: avatarValue } : u));
        });
        if (onUserProfileUpdate) onUserProfileUpdate(updated);
        setIsEditProfileOpen(false);
      } else {
        const data = await res.json();
        toast.error("Erro ao atualizar foto", data.error || "Não foi possível salvar a imagem.");
      }
    } catch {
      toast.error("Erro no Servidor", "Ocorreu uma falha ao enviar a imagem.");
    } finally {
      setUpdatingUserId(null);
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

  const getRoleBadgeConfig = (role: UserRole) => {
    switch (role) {
      case "admin":
        return {
          label: "Administrador",
          color: "#9333ea",
          bg: "rgba(147, 51, 234, 0.15)",
        };
      case "monitor":
        return {
          label: "Monitor(a)",
          color: "#0d9488",
          bg: "rgba(13, 148, 136, 0.15)",
        };
      case "pesquisador":
      default:
        return {
          label: "Pesquisador",
          color: "#d97706",
          bg: "rgba(217, 119, 6, 0.15)",
        };
    }
  };

  const carouselItems: CarouselItem[] = useMemo(() => {
    return displayUsers.map((user) => {
      let savedAvatar: string | null = null;
      if (typeof window !== "undefined") {
        try {
          savedAvatar = localStorage.getItem(`lbsa_user_avatar_${user.id}`);
        } catch {}
      }
      const avatarUrl = user.imagemUrl || savedAvatar || "";
      const roleConfig = getRoleBadgeConfig(user.role || "pesquisador");

      return {
        id: user.id,
        image: avatarUrl,
        buttonImage: avatarUrl,
        label: user.name,
        sublabel: user.email,
        badge: roleConfig.label,
        badgeBg: roleConfig.bg,
        badgeColor: roleConfig.color,
        data: user,
      };
    });
  }, [displayUsers]);

  const activeInitials = getFirstAndSurnameInitials(activeUser?.name || "");

  return (
    <Card className="animate-slide-up bg-white dark:bg-surface-900 text-surface-900 dark:text-white border border-surface-200 dark:border-teal-500/30 shadow-xl dark:shadow-2xl p-4 sm:p-6 lg:p-8 overflow-hidden relative transition-colors duration-300">
      {/* Background ambient lighting */}
      <div className="absolute -right-24 -top-24 w-96 h-96 bg-teal-500/10 dark:bg-teal-500/15 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute -left-24 -bottom-24 w-96 h-96 bg-purple-500/10 dark:bg-purple-500/15 rounded-full filter blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-surface-200 dark:border-surface-800">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-teal-50 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-500/30 shadow-xs">
              <UserCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-surface-900 dark:text-white tracking-tight">
                  Integrantes da Equipe & Funções
                </h3>
              </div>
              <p className="text-xs text-surface-500 dark:text-teal-100/70 mt-0.5">
                Membros ativos do LBSA
              </p>
            </div>
          </div>
        </div>

        {isAdmin && (
          <span className="self-start sm:self-center inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-purple-100 dark:bg-purple-500/20 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-500/40 shadow-2xs">
            <Shield className="h-4 w-4" />
            Modo Administrador
          </span>
        )}
      </div>

      {/* Main Interactive Button Carousel */}
      <div className="relative z-10 my-4 py-4 bg-gradient-to-b from-surface-100/80 via-surface-50/60 to-surface-100/80 dark:from-surface-950/80 dark:via-surface-900/90 dark:to-surface-950/80 rounded-3xl border border-surface-200/80 dark:border-surface-800 shadow-inner overflow-hidden">
        <KlarnaCarousel
          items={carouselItems}
          imageWidth={260}
          imageHeight={260}
          cardRadius={18}
          buttonCount={7}
          buttonSize={46}
          buttonRadius={20}
          curve={5}
          gap={24}
          labelShow={true}
          labelFont={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 700,
            fontSize: 22,
            lineHeight: "1.3em",
          }}
          backgroundColor="transparent"
          onSelectActive={(idx) => setActiveIndex(idx)}
        />
      </div>

      {/* Active Team Member Profile Space */}
      {activeUser && (
        <div className="relative z-10 mt-6 p-4 sm:p-5 rounded-2xl bg-surface-50 dark:bg-surface-800/80 border border-surface-200/90 dark:border-teal-500/30 backdrop-blur-md shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0 w-full md:w-auto">
            {/* Avatar or First & Surname Initials */}
            <div className="relative group shrink-0">
              {activeUser.imagemUrl ? (
                <img
                  src={activeUser.imagemUrl}
                  alt={activeUser.name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-teal-500/50 shadow-md"
                />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 via-teal-600 to-emerald-700 text-white font-black flex items-center justify-center text-lg border-2 border-teal-400/50 shadow-md tracking-wider">
                  {activeInitials}
                </div>
              )}

              {canEditActiveUser && (
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(true)}
                  title="Alterar Foto de Perfil"
                  className="absolute -bottom-1 -right-1 p-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow-md transition-transform duration-200 hover:scale-110 active:scale-95 border border-white/40"
                >
                  <Camera className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-base font-extrabold text-surface-900 dark:text-white truncate">
                  {activeUser.name}
                </h4>
                {currentUser?.id === activeUser.id && (
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-teal-600 dark:bg-teal-500 text-white dark:text-surface-950 shadow-2xs">
                    Você
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 text-xs text-surface-500 dark:text-surface-400 mt-1 flex-wrap">
                <span className="flex items-center gap-1 text-teal-700 dark:text-teal-300 font-medium">
                  <Mail className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                  {activeUser.email}
                </span>
                {activeUser.createdAt && (
                  <span className="flex items-center gap-1 text-surface-500 dark:text-surface-400">
                    <Calendar className="h-3.5 w-3.5" />
                    Desde {new Date(activeUser.createdAt).toLocaleDateString("pt-BR")}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons (Profile space & Role selector) */}
          <div className="shrink-0 w-full md:w-auto flex items-center justify-end gap-2 flex-wrap">
            {canEditActiveUser && (
              <button
                type="button"
                onClick={() => setIsEditProfileOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-extrabold bg-teal-50 dark:bg-teal-500/20 text-teal-800 dark:text-teal-200 border border-teal-300 dark:border-teal-500/40 hover:bg-teal-100 dark:hover:bg-teal-500/30 transition-all shadow-2xs active:scale-95"
              >
                <Camera className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                <span>Espaço de Perfil</span>
              </button>
            )}

            {isAdmin ? (
              <RoleSelectorDropdown
                currentRole={activeUser.role || "pesquisador"}
                disabled={updatingUserId === activeUser.id}
                onSelectRole={(targetRole) => handleRoleSelect(activeUser.id, targetRole)}
              />
            ) : (
              <RoleBadgeDisplay role={activeUser.role || "pesquisador"} />
            )}
          </div>
        </div>
      )}

      {/* Role Definitions Reference Cards */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-5 border-t border-surface-200 dark:border-surface-800">
        <div className="p-3.5 rounded-2xl bg-purple-50/80 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-500/30 text-xs">
          <div className="flex items-center gap-1.5 mb-1 text-purple-800 dark:text-purple-300 font-extrabold">
            <Shield className="h-4 w-4 shrink-0 text-purple-600 dark:text-purple-400" />
            <span>Administrador</span>
          </div>
          <p className="text-surface-600 dark:text-purple-200/70 leading-snug">
            Acesso total. Pode gerenciar e alterar permissões de todos os integrantes.
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-500/30 text-xs">
          <div className="flex items-center gap-1.5 mb-1 text-teal-800 dark:text-teal-300 font-extrabold">
            <Eye className="h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400" />
            <span>Monitor(a)</span>
          </div>
          <p className="text-surface-600 dark:text-teal-200/70 leading-snug">
            Supervisiona acervos. Edita e/ou exclui materiais de todos os pesquisadores.
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-500/30 text-xs">
          <div className="flex items-center gap-1.5 mb-1 text-amber-800 dark:text-amber-300 font-extrabold">
            <Microscope className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>Pesquisador</span>
          </div>
          <p className="text-surface-600 dark:text-amber-200/70 leading-snug">
            Cadastra espécimes. Edita e exclui somente os dados inseridos por ele próprio.
          </p>
        </div>
      </div>

      {/* Espaço de Perfil / Photo Upload Modal */}
      {isEditProfileOpen && activeUser && (
        <ProfileImageModal
          user={activeUser}
          isSaving={updatingUserId === activeUser.id}
          onClose={() => setIsEditProfileOpen(false)}
          onSave={(newImg) => handleSaveAvatar(activeUser.id, newImg)}
        />
      )}
    </Card>
  );
}

function RoleBadgeDisplay({ role }: { role: UserRole }) {
  switch (role) {
    case "admin":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold bg-purple-100 dark:bg-purple-500/20 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-500/40 shadow-2xs">
          <Shield className="h-4 w-4" />
          Administrador
        </span>
      );
    case "monitor":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold bg-teal-100 dark:bg-teal-500/20 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-500/40 shadow-2xs">
          <Eye className="h-4 w-4" />
          Monitor(a)
        </span>
      );
    case "pesquisador":
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/40 shadow-2xs">
          <Microscope className="h-4 w-4" />
          Pesquisador
        </span>
      );
  }
}

interface RoleDropdownProps {
  currentRole: UserRole;
  disabled?: boolean;
  onSelectRole: (role: UserRole) => void;
}

function RoleSelectorDropdown({ currentRole, disabled, onSelectRole }: RoleDropdownProps) {
  const [open, setOpen] = useState(false);

  const rolesList: Array<{ id: UserRole; label: string; icon: any; color: string; desc: string }> = [
    {
      id: "admin",
      label: "Administrador",
      icon: Shield,
      color: "bg-purple-100 dark:bg-purple-500/20 text-purple-900 dark:text-purple-300 border-purple-300 dark:border-purple-500/40",
      desc: "Acesso total e gestão de permissões",
    },
    {
      id: "monitor",
      label: "Monitor(a)",
      icon: Eye,
      color: "bg-teal-100 dark:bg-teal-500/20 text-teal-900 dark:text-teal-300 border-teal-300 dark:border-teal-500/40",
      desc: "Monitora e edita dados de todos",
    },
    {
      id: "pesquisador",
      label: "Pesquisador",
      icon: Microscope,
      color: "bg-amber-100 dark:bg-amber-500/20 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-500/40",
      desc: "Cadastra e gerencia acervo próprio",
    },
  ];

  const currentConfig = rolesList.find((r) => r.id === currentRole) || rolesList[2];
  const CurrentIcon = currentConfig.icon;

  return (
    <div className="relative w-full md:w-auto">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className={`w-full md:w-auto flex items-center justify-between gap-2.5 px-3.5 py-2 rounded-xl border text-xs font-extrabold transition-all shadow-2xs active:scale-95 ${currentConfig.color}`}
      >
        <div className="flex items-center gap-1.5">
          <CurrentIcon className="h-4 w-4 shrink-0" />
          <span>{currentConfig.label}</span>
        </div>
        <ChevronRight className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-90" : ""}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-72 p-2 bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-teal-500/30 shadow-2xl z-50 animate-slide-up space-y-1">
            <p className="text-[10px] uppercase font-black text-surface-400 dark:text-surface-500 px-2 py-1 tracking-wider">
              Alterar Função do Integrante
            </p>
            {rolesList.map((r) => {
              const Icon = r.icon;
              const isSelected = r.id === currentRole;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => {
                    onSelectRole(r.id);
                    setOpen(false);
                  }}
                  className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-all ${
                    isSelected
                      ? "bg-teal-50 dark:bg-teal-500/20 text-teal-900 dark:text-teal-200 font-extrabold border border-teal-300 dark:border-teal-500/40 shadow-2xs"
                      : "hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-800 dark:text-surface-200"
                  }`}
                >
                  <div className={`p-1.5 rounded-lg shrink-0 ${r.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-surface-900 dark:text-white">{r.label}</div>
                    <div className="text-[10px] text-surface-500 dark:text-surface-400 font-medium leading-snug">
                      {r.desc}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// Profile Image Upload & Link Modal
interface ProfileModalProps {
  user: UserWithoutPassword;
  isSaving: boolean;
  onClose: () => void;
  onSave: (newImg: string | undefined) => void;
}

function ProfileImageModal({ user, isSaving, onClose, onSave }: ProfileModalProps) {
  const [activeTab, setActiveTab] = useState<"upload" | "url" | "initials">("upload");
  const [imageUrlInput, setImageUrlInput] = useState(user.imagemUrl || "");
  const [selectedPreview, setSelectedPreview] = useState<string | undefined>(user.imagemUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initials = getFirstAndSurnameInitials(user.name);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("A imagem selecionada deve ser menor que 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const rawResult = reader.result as string;
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const size = 300;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const minDim = Math.min(img.width, img.height);
          const sx = (img.width - minDim) / 2;
          const sy = (img.height - minDim) / 2;
          ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);
          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.85);
          setSelectedPreview(compressedBase64);
          setImageUrlInput(compressedBase64);
        } else {
          setSelectedPreview(rawResult);
          setImageUrlInput(rawResult);
        }
      };
      img.onerror = () => {
        setSelectedPreview(rawResult);
        setImageUrlInput(rawResult);
      };
      img.src = rawResult;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-950/70 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-surface-900 rounded-3xl border border-surface-200 dark:border-teal-500/30 shadow-2xl overflow-hidden animate-slide-up">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-950/40">
          <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400">
            <Camera className="h-5 w-5" />
            <h3 className="font-extrabold text-base text-surface-900 dark:text-white">
              Espaço de Perfil • Foto do Integrante
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-surface-400 hover:text-surface-700 dark:hover:text-white hover:bg-surface-200/50 dark:hover:bg-surface-800 transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User preview header */}
        <div className="p-6 flex flex-col items-center justify-center text-center bg-gradient-to-b from-surface-100/40 to-transparent dark:from-surface-800/30">
          <div className="relative mb-3">
            {selectedPreview ? (
              <img
                src={selectedPreview}
                alt={user.name}
                className="w-24 h-24 rounded-3xl object-cover border-4 border-teal-500 shadow-xl"
              />
            ) : (
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-teal-500 via-teal-600 to-emerald-700 text-white font-black flex items-center justify-center text-3xl border-4 border-teal-400/50 shadow-xl tracking-wider">
                {initials}
              </div>
            )}
          </div>
          <h4 className="font-extrabold text-lg text-surface-900 dark:text-white">{user.name}</h4>
          <p className="text-xs text-surface-500 dark:text-surface-400">{user.email}</p>
        </div>

        {/* Tab Selection */}
        <div className="px-6 flex items-center justify-center gap-2 border-b border-surface-100 dark:border-surface-800 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab("upload")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "upload"
                ? "bg-teal-600 text-white shadow-md"
                : "bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700"
            }`}
          >
            <Upload className="h-3.5 w-3.5" />
            Upload Foto
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("url")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "url"
                ? "bg-teal-600 text-white shadow-md"
                : "bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700"
            }`}
          >
            <LinkIcon className="h-3.5 w-3.5" />
            Link URL
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("initials");
              setSelectedPreview(undefined);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "initials"
                ? "bg-teal-600 text-white shadow-md"
                : "bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700"
            }`}
          >
            <UserIcon className="h-3.5 w-3.5" />
            Usar Iniciais ({initials})
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6">
          {activeTab === "upload" && (
            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-teal-500/40 rounded-2xl bg-teal-50/40 dark:bg-teal-950/20 text-center">
              <Upload className="h-8 w-8 text-teal-600 dark:text-teal-400 mb-2 animate-bounce" />
              <p className="text-xs font-bold text-surface-800 dark:text-surface-200 mb-1">
                Carregar foto do computador ou celular
              </p>
              <p className="text-[10px] text-surface-500 dark:text-surface-400 mb-4">
                Suporta PNG, JPG, WEBP (máx. 5MB)
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-extrabold shadow-md transition-transform active:scale-95"
              >
                Selecionar Imagem...
              </button>
            </div>
          )}

          {activeTab === "url" && (
            <div className="space-y-3">
              <label className="block text-xs font-bold text-surface-700 dark:text-surface-300">
                Endereço da Imagem (URL)
              </label>
              <div className="relative">
                <input
                  type="url"
                  placeholder="https://exemplo.com/sua-foto.jpg"
                  value={imageUrlInput}
                  onChange={(e) => {
                    setImageUrlInput(e.target.value);
                    setSelectedPreview(e.target.value || undefined);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-surface-300 dark:border-surface-700 bg-white dark:bg-surface-800 text-xs font-medium text-surface-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-hidden"
                />
              </div>
              <p className="text-[10px] text-surface-500 dark:text-surface-400">
                Cole o link direto da imagem na web para aplicar no perfil.
              </p>
            </div>
          )}

          {activeTab === "initials" && (
            <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-center">
              <p className="text-xs font-extrabold text-amber-800 dark:text-amber-300 mb-1">
                Sem foto personalizada
              </p>
              <p className="text-[11px] text-surface-600 dark:text-surface-300">
                O sistema exibirá a inicial do nome e do primeiro sobrenome: <strong className="text-teal-600 dark:text-teal-400">&quot;{initials}&quot;</strong>.
              </p>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-surface-100 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-950/40">
          {user.imagemUrl ? (
            <button
              type="button"
              onClick={() => onSave(undefined)}
              disabled={isSaving}
              className="inline-flex items-center gap-1 text-xs font-extrabold text-red-600 hover:text-red-700 dark:text-red-400"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Remover Foto
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-surface-600 dark:text-surface-300 hover:bg-surface-200/60 dark:hover:bg-surface-800"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={() => onSave(selectedPreview)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-extrabold shadow-md transition-transform active:scale-95"
            >
              <Check className="h-4 w-4" />
              {isSaving ? "Salvando..." : "Salvar Foto"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
