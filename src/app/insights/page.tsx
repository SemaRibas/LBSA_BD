"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Table } from "@/components/ui/Table";
import { Modal } from "@/components/ui/Modal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Select } from "@/components/ui/Select";
import { Material, UserWithoutPassword } from "@/types";
import { MaterialCard } from "@/components/ui/MaterialCard";
import { Search, Plus, Download, Layers, Table as TableIcon, Edit, Trash2, Box, LayoutGrid, Upload } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";
import Smooth3DSlideshow, { Slide } from "@/components/ui/Smooth3DSlideshow";
import { materiaisToSlides } from "@/lib/slideAdapters";

import { useAuth } from "@/contexts/AuthContext";
import { ExportModal } from "@/components/ui/ExportModal";
import { ImportModal } from "@/components/ui/ImportModal";
import { ImageUploadInput } from "@/components/ui/ImageUploadInput";

export default function InsightsPage() {
  const router = useRouter();
  const toast = useToast();
  const { user: authUser, isLoading: authLoading } = useAuth();
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [activeMaterialFromSlide, setActiveMaterialFromSlide] = useState<Material | null>(null);
  const [filterEstado, setFilterEstado] = useState<string>("");
  const [viewMode, setViewMode] = useState<"cards" | "coverflow" | "table">("cards");
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const materiaisExportColumns = [
    { key: "material", header: "Material / Reagente" },
    { key: "quantidade", header: "Quantidade" },
    { key: "estado", header: "Estado / Condição" },
    { key: "validade", header: "Validade" },
    { key: "observacoes", header: "Observações" },
    { key: "creatorName", header: "Cadastrado Por" },
  ];

  const materiaisRequiredHeaders = [
    { key: "material", label: "Material / Reagente" },
    { key: "quantidade", label: "Quantidade" },
    { key: "estado", label: "Estado" },
    { key: "validade", label: "Validade" },
  ];

  const handleBatchImportMateriais = async (rows: Record<string, any>[]) => {
    const res = await fetch("/api/materiais", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rows),
    });

    if (!res.ok) {
      throw new Error("Falha ao salvar materiais no banco de dados.");
    }
    await fetchMateriais();
  };

  const currentUser = authUser;

  // Form state
  const [formData, setFormData] = useState({
    material: "",
    quantidade: "",
    estado: "Conservado",
    validade: "",
    observacoes: "",
    imagemUrl: "",
  });

  useEffect(() => {
    if (authLoading) return;
    if (!authUser) {
      router.replace("/login");
      return;
    }
    fetchMateriais();

    const handleAIRegistration = () => fetchMateriais();
    window.addEventListener("lbsa_data_registered", handleAIRegistration);
    return () => window.removeEventListener("lbsa_data_registered", handleAIRegistration);
  }, [authUser, authLoading, router]);

  const fetchMateriais = async () => {
    try {
      const res = await fetch("/api/materiais");
      if (res.ok) {
        const data = await res.json();
        setMateriais(data);
        if (data.length > 0) {
          setActiveMaterialFromSlide(data[0]);
        }
      }
    } catch (error) {
      console.error("Erro ao buscar materiais:", error);
      toast.error("Erro ao carregar", "Não foi possível carregar os materiais.");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMateriais = materiais.filter((material) => {
    const matchesSearch =
      material.material.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.observacoes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEstado = !filterEstado || material.estado === filterEstado;
    return matchesSearch && matchesEstado;
  });

  const slides = materiaisToSlides(filteredMateriais.length > 0 ? filteredMateriais : materiais);

  const columns = [
    {
      key: "material",
      label: "Material",
      sortable: true,
      render: (row: Material) => (
        <span className="font-semibold text-surface-900 dark:text-surface-100">
          {row.material}
        </span>
      ),
    },
    {
      key: "quantidade",
      label: "Quantidade",
      sortable: true,
    },
    {
      key: "estado",
      label: "Estado",
      sortable: true,
      render: (row: Material) => {
        const variants: Record<string, "success" | "warning" | "danger" | "info"> = {
          Conservado: "success",
          "Não consta": "warning",
          Danificado: "danger",
          Bom: "info",
        };
        return (
          <Badge variant={variants[row.estado] || "default"}>
            {row.estado}
          </Badge>
        );
      },
    },
    {
      key: "validade",
      label: "Validade",
    },
    {
      key: "observacoes",
      label: "Observações",
      render: (row: Material) => (
        <span className="text-surface-600 dark:text-surface-400 truncate max-w-xs block">
          {row.observacoes || "-"}
        </span>
      ),
    },
  ];

  const handleEdit = (material: Material) => {
    setSelectedMaterial(material);
    setFormData({
      material: material.material,
      quantidade: material.quantidade,
      estado: material.estado,
      validade: material.validade || "",
      observacoes: material.observacoes || "",
      imagemUrl: material.imagemUrl || "",
    });
    setIsModalOpen(true);
  };

  const handleNew = () => {
    setSelectedMaterial(null);
    setFormData({
      material: "",
      quantidade: "",
      estado: "Conservado",
      validade: "",
      observacoes: "",
      imagemUrl: "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (selectedMaterial) {
        const res = await fetch("/api/materiais", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: selectedMaterial.id, ...formData }),
        });

        if (res.ok) {
          await fetchMateriais();
          setIsModalOpen(false);
          toast.success("Material Atualizado!", `Material "${formData.material}" foi alterado com sucesso.`);
        } else {
          toast.error("Erro ao salvar", "Não foi possível atualizar o material.");
        }
      } else {
        const res = await fetch("/api/materiais", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (res.ok) {
          await fetchMateriais();
          setIsModalOpen(false);
          toast.success("Material Cadastrado!", `Material "${formData.material}" adicionado ao inventário.`);
        } else {
          toast.error("Erro ao cadastrar", "Não foi possível cadastrar o material.");
        }
      }
    } catch (error) {
      console.error("Erro ao salvar material:", error);
      toast.error("Erro no Servidor", "Ocorreu uma falha ao salvar os dados.");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedMaterial) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/materiais?id=${selectedMaterial.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await fetchMateriais();
        setIsConfirmOpen(false);
        setIsModalOpen(false);
        toast.success("Material Excluído!", `Material "${selectedMaterial.material}" removido com sucesso.`);
      } else {
        toast.error("Erro ao excluir", "Não foi possível excluir o material.");
      }
    } catch (error) {
      console.error("Erro ao deletar material:", error);
      toast.error("Erro no Servidor", "Falha ao processar a exclusão.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExport = () => {
    toast.info("Exportação em Andamento", "Gerando arquivo de inventário em planilha...");
  };

  const currentItem = activeMaterialFromSlide || (filteredMateriais.length > 0 ? filteredMateriais[0] : null);



  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
      <Sidebar />
      
      <main className="lg:ml-20 p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8">
        <Header title="Inventários" activeTab="Insights" />

        {/* Mobile Page Title */}
        <div className="lg:hidden mb-4 animate-fade-in">
          <h1 className="text-xl sm:text-2xl font-black text-surface-900 dark:text-surface-100 uppercase tracking-wider">
            Inventários
          </h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card className="animate-slide-up">
            <p className="text-sm text-surface-600 dark:text-surface-400">Total de Materiais</p>
            <p className="text-3xl font-bold text-surface-900 dark:text-surface-100">{materiais.length}</p>
          </Card>
          <Card className="animate-slide-up" style={{ animationDelay: "100ms" }}>
            <p className="text-sm text-surface-600 dark:text-surface-400">Conservados</p>
            <p className="text-3xl font-bold text-green-600">
              {materiais.filter((m) => m.estado === "Conservado").length}
            </p>
          </Card>
          <Card className="animate-slide-up" style={{ animationDelay: "200ms" }}>
            <p className="text-sm text-surface-600 dark:text-surface-400">Não Cadastrados</p>
            <p className="text-3xl font-bold text-amber-600">
              {materiais.filter((m) => m.estado === "Não consta").length}
            </p>
          </Card>
        </div>

        {/* Controls, Filters & View Toggle */}
        <Card className="mb-6 animate-slide-up" style={{ animationDelay: "300ms" }}>
          <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3.5 sm:gap-4">
            {/* Search & Filter Group */}
            <div className="flex-1 w-full flex flex-col sm:flex-row gap-2.5 sm:gap-3">
              <div className="flex-1">
                <Input
                  placeholder="Buscar material..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon={<Search className="h-4 w-4" />}
                />
              </div>
              <div className="w-full sm:w-48">
                <Select
                  placeholder="Filtrar por estado"
                  options={[
                    { value: "", label: "Todos os estados" },
                    { value: "Conservado", label: "Conservado" },
                    { value: "Não consta", label: "Não consta" },
                    { value: "Danificado", label: "Danificado" },
                  ]}
                  value={filterEstado}
                  onChange={setFilterEstado}
                />
              </div>
            </div>

            {/* View Mode Selector & Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:w-auto">
              {/* Mode Selector */}
              <div className="grid grid-cols-3 sm:flex items-center justify-center bg-surface-100/90 dark:bg-surface-800/90 p-1 rounded-2xl border border-surface-200/80 dark:border-surface-700/80 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setViewMode("cards")}
                  className={`flex items-center justify-center gap-1.5 px-2 xs:px-3 py-2 sm:py-1.5 text-[11px] xs:text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                    viewMode === "cards"
                      ? "bg-teal-600 text-white shadow-sm"
                      : "text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white"
                  }`}
                >
                  <LayoutGrid className="h-3.5 w-3.5 shrink-0" />
                  <span>Cards</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("coverflow")}
                  className={`flex items-center justify-center gap-1.5 px-2 xs:px-3 py-2 sm:py-1.5 text-[11px] xs:text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                    viewMode === "coverflow"
                      ? "bg-teal-600 text-white shadow-sm"
                      : "text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white"
                  }`}
                >
                  <Layers className="h-3.5 w-3.5 shrink-0" />
                  <span>Carrossel 3D</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  className={`flex items-center justify-center gap-1.5 px-2 xs:px-3 py-2 sm:py-1.5 text-[11px] xs:text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                    viewMode === "table"
                      ? "bg-teal-600 text-white shadow-sm"
                      : "text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white"
                  }`}
                >
                  <TableIcon className="h-3.5 w-3.5 shrink-0" />
                  <span>Tabela</span>
                </button>
              </div>

              {/* Action Buttons Grid on Mobile */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                <div className="grid grid-cols-2 gap-2 w-full sm:w-auto">
                  <Button variant="outline" onClick={() => setIsImportModalOpen(true)} size="sm" className="w-full justify-center h-10 sm:h-9 font-semibold">
                    <Upload className="h-4 w-4 mr-1.5 shrink-0" />
                    <span className="truncate">Importar</span>
                  </Button>
                  <Button variant="outline" onClick={() => setIsExportModalOpen(true)} size="sm" className="w-full justify-center h-10 sm:h-9 font-semibold">
                    <Download className="h-4 w-4 mr-1.5 shrink-0" />
                    <span className="truncate">Exportar</span>
                  </Button>
                </div>
                <Button onClick={handleNew} size="sm" className="w-full sm:w-auto justify-center h-10.5 sm:h-9 font-bold shadow-sm">
                  <Plus className="h-4 w-4 mr-1.5 shrink-0" />
                  <span className="whitespace-nowrap">Novo Material</span>
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Display Mode Switcher */}
        {viewMode === "cards" ? (
          filteredMateriais.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6 animate-fade-in">
              {filteredMateriais.map((material, idx) => (
                <MaterialCard
                  key={material.id}
                  material={material}
                  index={idx}
                  currentUser={currentUser}
                  onEdit={handleEdit}
                  onDelete={(item) => {
                    setSelectedMaterial(item);
                    setIsConfirmOpen(true);
                  }}
                  onSelect3D={(item) => {
                    setActiveMaterialFromSlide(item);
                    setViewMode("coverflow");
                  }}
                />
              ))}
            </div>
          ) : (
            <Card className="py-12 text-center text-surface-500">
              Nenhum material encontrado.
            </Card>
          )
        ) : viewMode === "coverflow" ? (
          <div className="space-y-6 animate-fade-in">
            {/* 3D Coverflow Slideshow Container */}
            <Card className="p-3.5 sm:p-6 bg-gradient-to-br from-surface-100 via-teal-50/20 to-surface-50 dark:from-surface-900 dark:via-surface-950 dark:to-surface-900 border border-teal-500/20 shadow-xl dark:shadow-2xl overflow-hidden relative">
              <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2 px-1 mb-3 sm:mb-4">
                <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400">
                  <Box className="h-4.5 w-4.5 shrink-0" />
                  <h2 className="text-sm xs:text-base sm:text-xl font-bold text-surface-900 dark:text-white tracking-wide">Visão 3D Coverflow do Inventário</h2>
                </div>
                <span className="text-[10px] xs:text-xs font-semibold px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-teal-500/10 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-500/30 whitespace-nowrap">
                  {slides.length} itens
                </span>
              </div>

              {slides.length > 0 ? (
                <Smooth3DSlideshow
                  slides={slides}
                  cardWidth={420}
                  cardHeight={380}
                  autoplay={false}
                  tilt={12}
                  sideTilt={8}
                  gap={8}
                  onSlideChange={(_, slide: Slide) => {
                    if (slide.itemData) {
                      setActiveMaterialFromSlide(slide.itemData);
                    }
                  }}
                  onSlideSelect={(slide: Slide) => {
                    if (slide.itemData) {
                      handleEdit(slide.itemData);
                    }
                  }}
                />
              ) : (
                <div className="py-16 text-center text-surface-400">Nenhum material encontrado.</div>
              )}
            </Card>

            {/* Active Item Quick Detail Card */}
            {currentItem && (
              <Card className="p-4 sm:p-6 border border-teal-500/20 bg-white dark:bg-surface-900 text-surface-900 dark:text-white animate-slide-up shadow-lg">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="text-lg sm:text-2xl font-bold text-teal-600 dark:text-teal-300 truncate">{currentItem.material}</h3>
                      <Badge variant={currentItem.estado === "Conservado" ? "success" : "warning"}>
                        {currentItem.estado}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-surface-600 dark:text-surface-300 pt-0.5">
                      <span><strong>Qtd:</strong> {currentItem.quantidade}</span>
                      <span className="hidden xs:inline">•</span>
                      <span><strong>Validade:</strong> {currentItem.validade || "Não consta"}</span>
                      <span className="hidden xs:inline">•</span>
                      <span><strong>Obs:</strong> {currentItem.observacoes || "Nenhuma"}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:flex items-center gap-2 sm:gap-3 w-full md:w-auto shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-teal-600 dark:text-teal-300 border-teal-500/30 hover:bg-teal-50 dark:hover:bg-teal-950/50 justify-center"
                      onClick={() => handleEdit(currentItem)}
                    >
                      <Edit className="h-4 w-4 mr-1.5 shrink-0" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 dark:text-red-400 border-red-500/30 hover:bg-red-50 dark:hover:bg-red-950/50 justify-center"
                      onClick={() => {
                        setSelectedMaterial(currentItem);
                        setIsConfirmOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-1.5 shrink-0" />
                      Excluir
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>
        ) : (
          /* Table View Mode */
          <Card className="animate-fade-in">
            <Table
              data={filteredMateriais}
              columns={columns}
              onRowClick={handleEdit}
            />
          </Card>
        )}

        {/* Modal Editar/Novo */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={selectedMaterial ? "Editar Material" : "Novo Material"}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nome do Material"
              placeholder="Ex: Álcool Etílico"
              value={formData.material}
              onChange={(e) => setFormData({ ...formData, material: e.target.value })}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Quantidade"
                placeholder="Ex: 5CX"
                value={formData.quantidade}
                onChange={(e) => setFormData({ ...formData, quantidade: e.target.value })}
                required
              />
              <Select
                label="Estado"
                options={[
                  { value: "Conservado", label: "Conservado" },
                  { value: "Não consta", label: "Não consta" },
                  { value: "Danificado", label: "Danificado" },
                  { value: "Bom", label: "Bom" },
                ]}
                value={formData.estado}
                onChange={(value) => setFormData({ ...formData, estado: value })}
              />
            </div>
            <Input
              label="Validade"
              placeholder="Ex: 12/2025"
              value={formData.validade}
              onChange={(e) => setFormData({ ...formData, validade: e.target.value })}
            />
            <ImageUploadInput
              label="Imagem do Material / Reagente (Upload ou URL)"
              value={formData.imagemUrl}
              onChange={(val) => setFormData({ ...formData, imagemUrl: val })}
            />
            <Input
              label="Observações"
              placeholder="Observações adicionais"
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
            />
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={() => setIsModalOpen(false)}
              >
                Cancelar
              </Button>
              {selectedMaterial && (
                <Button
                  type="button"
                  variant="outline"
                  className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-950/30"
                  onClick={() => setIsConfirmOpen(true)}
                >
                  Excluir
                </Button>
              )}
              <Button type="submit" className="flex-1">
                {selectedMaterial ? "Salvar" : "Cadastrar"}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Modal de Confirmação de Exclusão */}
        <ConfirmModal
          isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={handleDeleteConfirm}
          title="Excluir Material?"
          description={`Tem certeza que deseja excluir "${selectedMaterial?.material}"? Esta ação removerá o item do inventário do laboratório.`}
          confirmText="Sim, Excluir"
          cancelText="Cancelar"
          variant="danger"
          isLoading={isDeleting}
        />

        {/* Modal de Exportação (PDF / Excel) */}
        <ExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          title="Inventário de Materiais LBSA"
          data={filteredMateriais.length > 0 ? filteredMateriais : materiais}
          columns={materiaisExportColumns}
          defaultFilename="LBSA_Relatorio_Materiais"
        />

        {/* Modal de Importação (Excel) */}
        <ImportModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          title="Inventário de Materiais"
          requiredHeaders={materiaisRequiredHeaders}
          onImportSuccess={handleBatchImportMateriais}
        />
      </main>
    </div>
  );
}
