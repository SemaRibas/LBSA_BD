"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Table } from "@/components/ui/Table";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Colecao } from "@/types";
import { Search, Plus, Download } from "lucide-react";

export default function ChannelsPage() {
  const [colecoes, setColecoes] = useState<Colecao[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedColecao, setSelectedColecao] = useState<Colecao | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("");

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
    fetchColecoes();
  }, []);

  const fetchColecoes = async () => {
    try {
      const res = await fetch("/api/colecoes");
      if (res.ok) {
        setColecoes(await res.json());
      }
    } catch (error) {
      console.error("Erro ao buscar colecoes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredColecoes = colecoes.filter((colecao) => {
    const matchesSearch =
      colecao.numeroTombo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      colecao.identificacaoBasica.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = !filterStatus || colecao.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "LIQUIDO_TURVO":
        return <Badge variant="info">Liquido Turvo</Badge>;
      case "TRANSPARENTE":
        return <Badge variant="success">Transparente</Badge>;
      case "SECO":
        return <Badge variant="warning">Seco</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getCondicaoBadge = (condicao: string) => {
    switch (condicao) {
      case "CRITICO":
        return <Badge variant="danger">Critico</Badge>;
      case "RAZOAVEL":
        return <Badge variant="warning">Razoavel</Badge>;
      case "BOM":
        return <Badge variant="success">Bom</Badge>;
      default:
        return <Badge>{condicao}</Badge>;
    }
  };

  const columns = [
    { key: "numeroTombo", label: "N. Tombo", sortable: true },
    { key: "identificacaoBasica", label: "Identificacao", sortable: true },
    { key: "filo", label: "Filo", sortable: true },
    { key: "classe", label: "Classe", sortable: true },
    { key: "localidade", label: "Localidade", render: (item: Colecao) => (
      <span className="truncate max-w-[150px] block">{item.localidade}</span>
    )},
    { key: "coletor", label: "Coletor" },
    { key: "dataColeta", label: "Data" },
    {
      key: "condicaoFrasco",
      label: "Condicao Frasco",
      render: (item: Colecao) => getCondicaoBadge(item.condicaoFrasco),
    },
    {
      key: "status",
      label: "Status",
      render: (item: Colecao) => getStatusBadge(item.status),
    },
    {
      key: "actions",
      label: "",
      render: (item: Colecao) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleEdit(item);
          }}
        >
          Editar
        </Button>
      ),
    },
  ];

  const handleEdit = (item: Colecao) => {
    setSelectedColecao(item);
    setFormData({
      numeroTombo: item.numeroTombo,
      identificacaoBasica: item.identificacaoBasica,
      clado: item.clado,
      filo: item.filo,
      subfilo: item.subfilo,
      classe: item.classe,
      determinador: item.determinador,
      numeroExemplares: item.numeroExemplares,
      localidade: item.localidade,
      coletor: item.coletor,
      dataColeta: item.dataColeta,
      fonte: item.fonte,
      condicaoFrasco: item.condicaoFrasco,
      observacoes: item.observacoes,
      estagiarioResponsavel: item.estagiarioResponsavel,
      status: item.status,
      condicaoRecipiente: item.condicaoRecipiente,
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
        }
      }
    } catch (error) {
      console.error("Erro ao salvar colecao:", error);
    }
  };

  const handleDelete = async () => {
    if (!selectedColecao) return;

    try {
      const res = await fetch(`/api/colecoes?id=${selectedColecao.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await fetchColecoes();
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Erro ao deletar colecao:", error);
    }
  };

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

        {/* Filters and actions */}
        <Card className="mb-6 animate-slide-up" style={{ animationDelay: "400ms" }}>
          <div className="flex flex-col sm:flex-row gap-4">
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
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button onClick={handleNew}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Colecao
            </Button>
          </div>
        </Card>

        {/* Table */}
        <Card className="animate-slide-up" style={{ animationDelay: "500ms" }}>
          <div className="overflow-x-auto">
            <Table
              data={filteredColecoes}
              columns={columns}
              onRowClick={handleEdit}
            />
          </div>
        </Card>

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

            <Input
              label="Localidade"
              placeholder="Ex: Criciuma, SC"
              value={formData.localidade}
              onChange={(e) => setFormData({ ...formData, localidade: e.target.value })}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Coletor"
                placeholder="Ex: Gabriela"
                value={formData.coletor}
                onChange={(e) => setFormData({ ...formData, coletor: e.target.value })}
              />
              <Input
                label="Data da Coleta"
                type="date"
                value={formData.dataColeta}
                onChange={(e) => setFormData({ ...formData, dataColeta: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Condicao do Frasco"
                options={[
                  { value: "CRITICO", label: "Critico" },
                  { value: "RAZOAVEL", label: "Razoavel" },
                  { value: "BOM", label: "Bom" },
                ]}
                value={formData.condicaoFrasco}
                onChange={(value) => setFormData({ ...formData, condicaoFrasco: value })}
              />
              <Select
                label="Status"
                options={[
                  { value: "LIQUIDO_TURVO", label: "Liquido Turvo" },
                  { value: "TRANSPARENTE", label: "Transparente" },
                  { value: "SECO", label: "Seco" },
                ]}
                value={formData.status}
                onChange={(value) => setFormData({ ...formData, status: value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Condicao do Recipiente"
                options={[
                  { value: "FAVORAVEL", label: "Favoravel" },
                  { value: "REGULAR", label: "Regular" },
                  { value: "DESFAVORAVEL", label: "Desfavoravel" },
                ]}
                value={formData.condicaoRecipiente}
                onChange={(value) => setFormData({ ...formData, condicaoRecipiente: value })}
              />
              <Input
                label="Estagiario Responsavel"
                placeholder="Ex: Bianca dos Santos Silva"
                value={formData.estagiarioResponsavel}
                onChange={(e) => setFormData({ ...formData, estagiarioResponsavel: e.target.value })}
              />
            </div>

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
                  className="text-red-600 border-red-200 hover:bg-red-50"
                  onClick={handleDelete}
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
      </main>
    </div>
  );
}
