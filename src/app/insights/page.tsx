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
import { Material } from "@/types";
import { Search, Plus, Download } from "lucide-react";

export default function InsightsPage() {
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [filterEstado, setFilterEstado] = useState<string>("");

  // Form state
  const [formData, setFormData] = useState({
    material: "",
    quantidade: "",
    estado: "Conservado",
    validade: "",
    observacoes: "",
  });

  useEffect(() => {
    fetchMateriais();
  }, []);

  const fetchMateriais = async () => {
    try {
      const res = await fetch("/api/materiais");
      if (res.ok) {
        setMateriais(await res.json());
      }
    } catch (error) {
      console.error("Erro ao buscar materiais:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMateriais = materiais.filter((material) => {
    const matchesSearch = material.material.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = !filterEstado || material.estado === filterEstado;
    return matchesSearch && matchesFilter;
  });

  const columns = [
    { key: "material", label: "Material", sortable: true },
    { key: "quantidade", label: "Quantidade", sortable: true },
    {
      key: "estado",
      label: "Estado",
      sortable: true,
      render: (item: Material) => (
        <Badge
          variant={
            item.estado === "Conservado"
              ? "success"
              : item.estado === "Danificado"
              ? "danger"
              : "warning"
          }
        >
          {item.estado}
        </Badge>
      ),
    },
    { key: "validade", label: "Validade" },
    { key: "observacoes", label: "Observacoes" },
    {
      key: "actions",
      label: "",
      render: (item: Material) => (
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

  const handleEdit = (item: Material) => {
    setSelectedMaterial(item);
    setFormData({
      material: item.material,
      quantidade: item.quantidade,
      estado: item.estado,
      validade: item.validade,
      observacoes: item.observacoes,
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
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (selectedMaterial) {
        // Atualizar
        const res = await fetch("/api/materiais", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: selectedMaterial.id, ...formData }),
        });

        if (res.ok) {
          await fetchMateriais();
          setIsModalOpen(false);
        }
      } else {
        // Criar
        const res = await fetch("/api/materiais", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (res.ok) {
          await fetchMateriais();
          setIsModalOpen(false);
        }
      }
    } catch (error) {
      console.error("Erro ao salvar material:", error);
    }
  };

  const handleDelete = async () => {
    if (!selectedMaterial) return;

    try {
      const res = await fetch(`/api/materiais?id=${selectedMaterial.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await fetchMateriais();
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Erro ao deletar material:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex items-center justify-center">
        <div className="animate-pulse text-surface-600">Carregando materiais...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
      <Sidebar />
      
      <main className="lg:ml-20 p-4 sm:p-6 lg:p-8">
        <Header title="Inventarios" activeTab="Insights" />

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
            <p className="text-sm text-surface-600 dark:text-surface-400">Nao Cadastrados</p>
            <p className="text-3xl font-bold text-amber-600">
              {materiais.filter((m) => m.estado === "Não consta").length}
            </p>
          </Card>
        </div>

        {/* Filters and actions */}
        <Card className="mb-6 animate-slide-up" style={{ animationDelay: "300ms" }}>
          <div className="flex flex-col sm:flex-row gap-4">
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
                  { value: "", label: "Todos" },
                  { value: "Conservado", label: "Conservado" },
                  { value: "Não consta", label: "Nao consta" },
                  { value: "Danificado", label: "Danificado" },
                ]}
                value={filterEstado}
                onChange={setFilterEstado}
              />
            </div>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button onClick={handleNew}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Material
            </Button>
          </div>
        </Card>

        {/* Table */}
        <Card className="animate-slide-up" style={{ animationDelay: "400ms" }}>
          <Table
            data={filteredMateriais}
            columns={columns}
            onRowClick={handleEdit}
          />
        </Card>

        {/* Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={selectedMaterial ? "Editar Material" : "Novo Material"}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nome do Material"
              placeholder="Ex: Alcool Etilico"
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
                  { value: "Não consta", label: "Nao consta" },
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
              {selectedMaterial && (
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
                {selectedMaterial ? "Salvar" : "Cadastrar"}
              </Button>
            </div>
          </form>
        </Modal>
      </main>
    </div>
  );
}
