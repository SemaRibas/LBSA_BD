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
import { Colecao } from "@/types";
import { Search, Plus, Download, Layers, Table as TableIcon, Edit, Trash2, Box } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";
import Smooth3DSlideshow, { Slide } from "@/components/ui/Smooth3DSlideshow";
import { colecoesToSlides } from "@/lib/slideAdapters";

export default function ChannelsPage() {
  const router = useRouter();
  const toast = useToast();
  const [colecoes, setColecoes] = useState<Colecao[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedColecao, setSelectedColecao] = useState<Colecao | null>(null);
  const [activeColecaoFromSlide, setActiveColecaoFromSlide] = useState<Colecao | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [viewMode, setViewMode] = useState<"coverflow" | "table">("coverflow");

  // Form state
  const [formData, setFormData] = useState({
    numeroTombo: "",
    identificacaoBasica: "",
    clado: "",
    filo: "",
    subfilo: "",
    classe: "",
    determinador: "",
    numeroExemplares: "",
    localidade: "",
    coletor: "",
    dataColeta: "",
    fonte: "",
    condicaoFrasco: "RAZOAVEL",
    observacoes: "",
    estagiarioResponsavel: "",
    status: "TRANSPARENTE",
    condicaoRecipiente: "FAVORAVEL",
  });

  useEffect(() => {
    const checkAuth = async () => {
      const res = await fetch("/api/auth/check");
      if (!res.ok) {
        router.replace("/login");
        return false;
      }
      return true;
    };
    checkAuth().then((ok) => { if (ok !== false) fetchColecoes(); });
  }, [router]);

  const fetchColecoes = async () => {
    try {
      const res = await fetch("/api/colecoes");
      if (res.ok) {
        const data = await res.json();
        setColecoes(data);
        if (data.length > 0) {
          setActiveColecaoFromSlide(data[0]);
        }
      }
    } catch (error) {
      console.error("Erro ao buscar colecoes:", error);
      toast.error("Erro ao carregar", "Não foi possível carregar o acervo de coleções.");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredColecoes = colecoes.filter((colecao) => {
    const matchesSearch =
      colecao.numeroTombo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      colecao.identificacaoBasica.toLowerCase().includes(searchTerm.toLowerCase()) ||
      colecao.localidade.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || colecao.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const slides = colecoesToSlides(filteredColecoes.length > 0 ? filteredColecoes : colecoes);

  const columns = [
    {
      key: "numeroTombo",
      label: "Tombo",
      sortable: true,
      render: (row: Colecao) => (
        <span className="font-bold text-teal-600 dark:text-teal-400">
          {row.numeroTombo}
        </span>
      ),
    },
    {
      key: "identificacaoBasica",
      label: "Identificação",
      sortable: true,
      render: (row: Colecao) => (
        <span className="font-semibold text-surface-900 dark:text-surface-100">
          {row.identificacaoBasica}
        </span>
      ),
    },
    {
      key: "filo",
      label: "Taxonomia",
      render: (row: Colecao) => (
        <span className="text-xs text-surface-600 dark:text-surface-400">
          {[row.filo, row.classe].filter(Boolean).join(" > ") || "-"}
        </span>
      ),
    },
    {
      key: "numeroExemplares",
      label: "Exemplares",
    },
    {
      key: "localidade",
      label: "Localidade",
    },
    {
      key: "status",
      label: "Status",
      render: (row: Colecao) => {
        const variants: Record<string, "success" | "warning" | "danger" | "info"> = {
          TRANSPARENTE: "success",
          LIQUIDO_TURVO: "warning",
          SECO: "danger",
        };
        return (
          <Badge variant={variants[row.status] || "default"}>
            {row.status}
          </Badge>
        );
      },
    },
  ];

  const handleEdit = (colecao: Colecao) => {
    setSelectedColecao(colecao);
    setFormData({
      numeroTombo: colecao.numeroTombo,
      identificacaoBasica: colecao.identificacaoBasica,
      clado: colecao.clado || "",
      filo: colecao.filo || "",
      subfilo: colecao.subfilo || "",
      classe: colecao.classe || "",
      determinador: colecao.determinador || "",
      numeroExemplares: colecao.numeroExemplares || "",
      localidade: colecao.localidade || "",
      coletor: colecao.coletor || "",
      dataColeta: colecao.dataColeta || "",
      fonte: colecao.fonte || "",
      condicaoFrasco: colecao.condicaoFrasco || "RAZOAVEL",
      observacoes: colecao.observacoes || "",
      estagiarioResponsavel: colecao.estagiarioResponsavel || "",
      status: colecao.status || "TRANSPARENTE",
      condicaoRecipiente: colecao.condicaoRecipiente || "FAVORAVEL",
    });
    setIsModalOpen(true);
  };

  const handleNew = () => {
    setSelectedColecao(null);
    setFormData({
      numeroTombo: "",
      identificacaoBasica: "",
      clado: "",
      filo: "",
      subfilo: "",
      classe: "",
      determinador: "",
      numeroExemplares: "",
      localidade: "",
      coletor: "",
      dataColeta: "",
      fonte: "",
      condicaoFrasco: "RAZOAVEL",
      observacoes: "",
      estagiarioResponsavel: "",
      status: "TRANSPARENTE",
      condicaoRecipiente: "FAVORAVEL",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (selectedColecao) {
        const res = await fetch("/api/colecoes", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: selectedColecao.id, ...formData }),
        });

        if (res.ok) {
          await fetchColecoes();
          setIsModalOpen(false);
          toast.success("Coleção Atualizada!", `Coleção "${formData.numeroTombo}" foi alterada com sucesso.`);
        } else {
          toast.error("Erro ao salvar", "Não foi possível atualizar a coleção.");
        }
      } else {
        const res = await fetch("/api/colecoes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (res.ok) {
          await fetchColecoes();
          setIsModalOpen(false);
          toast.success("Coleção Cadastrada!", `Coleção "${formData.numeroTombo}" adicionada com sucesso.`);
        } else {
          toast.error("Erro ao cadastrar", "Não foi possível cadastrar a coleção.");
        }
      }
    } catch (error) {
      console.error("Erro ao salvar colecao:", error);
      toast.error("Erro no Servidor", "Ocorreu uma falha ao salvar a coleção.");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedColecao) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/colecoes?id=${selectedColecao.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await fetchColecoes();
        setIsConfirmOpen(false);
        setIsModalOpen(false);
        toast.success("Coleção Excluída!", `Coleção "${selectedColecao.numeroTombo}" removida com sucesso.`);
      } else {
        toast.error("Erro ao excluir", "Não foi possível excluir a coleção.");
      }
    } catch (error) {
      console.error("Erro ao deletar colecao:", error);
      toast.error("Erro no Servidor", "Falha ao processar a exclusão.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExport = () => {
    toast.info("Exportação em Andamento", "Gerando arquivo de acervo de coleções em planilha...");
  };

  const currentItem = activeColecaoFromSlide || (filteredColecoes.length > 0 ? filteredColecoes[0] : null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex items-center justify-center">
        <div className="animate-pulse text-surface-600">Carregando colecoes...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
      <Sidebar />
      
      <main className="lg:ml-20 p-4 sm:p-6 lg:p-8">
        <Header title="Colecoes" activeTab="Channels" />

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <Card className="animate-slide-up">
            <p className="text-sm text-surface-600 dark:text-surface-400">Total Colecoes</p>
            <p className="text-3xl font-bold text-surface-900 dark:text-surface-100">{colecoes.length}</p>
          </Card>
          <Card className="animate-slide-up" style={{ animationDelay: "100ms" }}>
            <p className="text-sm text-surface-600 dark:text-surface-400">Criticos</p>
            <p className="text-3xl font-bold text-red-600">
              {colecoes.filter((c) => c.condicaoFrasco === "CRITICO").length}
            </p>
          </Card>
          <Card className="animate-slide-up" style={{ animationDelay: "200ms" }}>
            <p className="text-sm text-surface-600 dark:text-surface-400">Transparentes</p>
            <p className="text-3xl font-bold text-green-600">
              {colecoes.filter((c) => c.status === "TRANSPARENTE").length}
            </p>
          </Card>
          <Card className="animate-slide-up" style={{ animationDelay: "300ms" }}>
            <p className="text-sm text-surface-600 dark:text-surface-400">Favoraveis</p>
            <p className="text-3xl font-bold text-teal-600">
              {colecoes.filter((c) => c.condicaoRecipiente === "FAVORAVEL").length}
            </p>
          </Card>
        </div>

        {/* Controls, Filters & View Toggle */}
        <Card className="mb-6 animate-slide-up" style={{ animationDelay: "400ms" }}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex-1 w-full flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Input
                  placeholder="Buscar por tombo ou identificacao..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon={<Search className="h-4 w-4" />}
                />
              </div>
              <div className="w-full sm:w-48">
                <Select
                  placeholder="Filtrar por status"
                  options={[
                    { value: "", label: "Todos" },
                    { value: "LIQUIDO_TURVO", label: "Liquido Turvo" },
                    { value: "TRANSPARENTE", label: "Transparente" },
                    { value: "SECO", label: "Seco" },
                  ]}
                  value={filterStatus}
                  onChange={setFilterStatus}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              {/* Mode Selector */}
              <div className="flex items-center bg-surface-100 dark:bg-surface-800 p-1 rounded-lg border border-surface-200 dark:border-surface-700">
                <button
                  type="button"
                  onClick={() => setViewMode("coverflow")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    viewMode === "coverflow"
                      ? "bg-teal-600 text-white shadow-md"
                      : "text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white"
                  }`}
                >
                  <Layers className="h-3.5 w-3.5" />
                  Carrossel 3D
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    viewMode === "table"
                      ? "bg-teal-600 text-white shadow-md"
                      : "text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white"
                  }`}
                >
                  <TableIcon className="h-3.5 w-3.5" />
                  Tabela
                </button>
              </div>

              <Button variant="outline" onClick={handleExport} size="sm">
                <Download className="h-4 w-4 mr-1.5" />
                Exportar
              </Button>
              <Button onClick={handleNew} size="sm">
                <Plus className="h-4 w-4 mr-1.5" />
                Nova Colecao
              </Button>
            </div>
          </div>
        </Card>

        {/* Display Mode Switcher */}
        {viewMode === "coverflow" ? (
          <div className="space-y-6 animate-fade-in">
            {/* 3D Coverflow Slideshow Container */}
            <Card className="p-6 bg-gradient-to-br from-surface-900 via-surface-950 to-surface-900 border border-teal-500/20 shadow-2xl overflow-hidden relative">
              <div className="flex items-center justify-between px-2 mb-4">
                <div className="flex items-center gap-2 text-teal-400">
                  <Box className="h-5 w-5" />
                  <h2 className="text-xl font-bold text-white tracking-wide">Acervo de Coleções — Visão 3D Coverflow</h2>
                </div>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  {slides.length} coleções
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
                      setActiveColecaoFromSlide(slide.itemData);
                    }
                  }}
                  onSlideSelect={(slide: Slide) => {
                    if (slide.itemData) {
                      handleEdit(slide.itemData);
                    }
                  }}
                />
              ) : (
                <div className="py-16 text-center text-surface-400">Nenhuma coleção encontrada.</div>
              )}
            </Card>

            {/* Active Item Quick Detail Card */}
            {currentItem && (
              <Card className="p-6 border border-teal-500/20 bg-surface-900 text-white animate-slide-up">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-2xl font-bold text-teal-300">
                        {currentItem.numeroTombo} - {currentItem.identificacaoBasica}
                      </h3>
                      <Badge variant={currentItem.status === "TRANSPARENTE" ? "success" : "warning"}>
                        {currentItem.status}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-surface-300 pt-1">
                      <span><strong>Taxonomia:</strong> {[currentItem.filo, currentItem.classe].filter(Boolean).join(" > ") || "-"}</span>
                      <span>•</span>
                      <span><strong>Exemplares:</strong> {currentItem.numeroExemplares || "1"}</span>
                      <span>•</span>
                      <span><strong>Frasco:</strong> {currentItem.condicaoFrasco}</span>
                      <span>•</span>
                      <span><strong>Localidade:</strong> {currentItem.localidade || "-"}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      className="text-teal-300 border-teal-500/30 hover:bg-teal-950/50"
                      onClick={() => handleEdit(currentItem)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar Coleção
                    </Button>
                    <Button
                      variant="outline"
                      className="text-red-400 border-red-500/30 hover:bg-red-950/50"
                      onClick={() => {
                        setSelectedColecao(currentItem);
                        setIsConfirmOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
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
              data={filteredColecoes}
              columns={columns}
              onRowClick={handleEdit}
            />
          </Card>
        )}

        {/* Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={selectedColecao ? "Editar Colecao" : "Nova Colecao"}
          className="max-w-2xl"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Numero de Tombo"
                placeholder="Ex: LBSA00009"
                value={formData.numeroTombo}
                onChange={(e) => setFormData({ ...formData, numeroTombo: e.target.value })}
                required
              />
              <Input
                label="Identificacao Basica"
                placeholder="Ex: Coleoptera"
                value={formData.identificacaoBasica}
                onChange={(e) => setFormData({ ...formData, identificacaoBasica: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Filo"
                placeholder="Ex: Arthropoda"
                value={formData.filo}
                onChange={(e) => setFormData({ ...formData, filo: e.target.value })}
              />
              <Input
                label="Subfilo"
                placeholder="Ex: Hexapoda"
                value={formData.subfilo}
                onChange={(e) => setFormData({ ...formData, subfilo: e.target.value })}
              />
              <Input
                label="Classe"
                placeholder="Ex: Insecta"
                value={formData.classe}
                onChange={(e) => setFormData({ ...formData, classe: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Determinador"
                placeholder="Nome do especialista"
                value={formData.determinador}
                onChange={(e) => setFormData({ ...formData, determinador: e.target.value })}
              />
              <Input
                label="Numero de Exemplares"
                placeholder="Ex: 5"
                value={formData.numeroExemplares}
                onChange={(e) => setFormData({ ...formData, numeroExemplares: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Localidade"
                placeholder="Ex: Florianopolis - SC"
                value={formData.localidade}
                onChange={(e) => setFormData({ ...formData, localidade: e.target.value })}
              />
              <Input
                label="Coletor"
                placeholder="Nome do coletor"
                value={formData.coletor}
                onChange={(e) => setFormData({ ...formData, coletor: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Data da Coleta"
                type="date"
                value={formData.dataColeta}
                onChange={(e) => setFormData({ ...formData, dataColeta: e.target.value })}
              />
              <Input
                label="Fonte/Origem"
                placeholder="Ex: Projeto X"
                value={formData.fonte}
                onChange={(e) => setFormData({ ...formData, fonte: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Select
                label="Condicao do Frasco"
                options={[
                  { value: "BOM", label: "Bom" },
                  { value: "RAZOAVEL", label: "Razoavel" },
                  { value: "CRITICO", label: "Critico" },
                ]}
                value={formData.condicaoFrasco}
                onChange={(value) => setFormData({ ...formData, condicaoFrasco: value })}
              />
              <Select
                label="Status do Liquido"
                options={[
                  { value: "TRANSPARENTE", label: "Transparente" },
                  { value: "LIQUIDO_TURVO", label: "Liquido Turvo" },
                  { value: "SECO", label: "Seco" },
                ]}
                value={formData.status}
                onChange={(value) => setFormData({ ...formData, status: value })}
              />
              <Select
                label="Condicao Recipiente"
                options={[
                  { value: "FAVORAVEL", label: "Favoravel" },
                  { value: "ATENCAO", label: "Atencao" },
                ]}
                value={formData.condicaoRecipiente}
                onChange={(value) => setFormData({ ...formData, condicaoRecipiente: value })}
              />
            </div>

            <Input
              label="Estagiario Responsavel"
              placeholder="Nome do estagiario"
              value={formData.estagiarioResponsavel}
              onChange={(e) => setFormData({ ...formData, estagiarioResponsavel: e.target.value })}
            />

            <Input
              label="Observacoes"
              placeholder="Observacoes adicionais"
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
              {selectedColecao && (
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
                {selectedColecao ? "Salvar" : "Cadastrar"}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Modal de Confirmação de Exclusão */}
        <ConfirmModal
          isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={handleDeleteConfirm}
          title="Excluir Coleção?"
          description={`Tem certeza que deseja excluir a coleção tombo "${selectedColecao?.numeroTombo}" (${selectedColecao?.identificacaoBasica})? Esta ação removerá o registro permanentemente.`}
          confirmText="Sim, Excluir"
          cancelText="Cancelar"
          variant="danger"
          isLoading={isDeleting}
        />
      </main>
    </div>
  );
}
