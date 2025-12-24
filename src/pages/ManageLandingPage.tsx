import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { LandingSectionCard } from "@/components/admin/LandingSectionCard";
import { LandingSectionForm } from "@/components/admin/LandingSectionForm";
import { Plus, Layout, Loader2, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LandingSection } from "@/types";
import { Link } from "react-router-dom";

export default function ManageLandingPage() {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<LandingSection | null>(null);
  const [deletingSection, setDeletingSection] = useState<LandingSection | null>(null);

  // Fetch sections
  const { data: sections = [], isLoading } = useQuery({
    queryKey: ["landing-sections-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("landing_sections")
        .select("*")
        .order("order_index", { ascending: true });
      
      if (error) throw error;
      return data as LandingSection[];
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: Partial<LandingSection>) => {
      const { error } = await supabase.from("landing_sections").insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["landing-sections-admin"] });
      setIsFormOpen(false);
      toast.success("Seção criada com sucesso!");
    },
    onError: (error: any) => {
      toast.error("Erro ao criar seção: " + error.message);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<LandingSection> }) => {
      const { error } = await supabase.from("landing_sections").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["landing-sections-admin"] });
      setEditingSection(null);
      toast.success("Seção atualizada com sucesso!");
    },
    onError: (error: any) => {
      toast.error("Erro ao atualizar seção: " + error.message);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("landing_sections").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["landing-sections-admin"] });
      setDeletingSection(null);
      toast.success("Seção excluída com sucesso!");
    },
    onError: (error: any) => {
      toast.error("Erro ao excluir seção: " + error.message);
    },
  });

  const activeSections = sections.filter(s => s.is_active).length;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-cinzel font-bold text-primary">
              Gerenciar Página Inicial
            </h1>
            <p className="text-muted-foreground mt-1">
              Configure as seções da página inicial pública
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/" target="_blank">
                <Eye className="h-4 w-4 mr-2" />
                Visualizar
              </Link>
            </Button>
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Seção
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Layout className="h-4 w-4" />
              <span className="text-sm">Total de Seções</span>
            </div>
            <p className="text-2xl font-bold text-primary mt-1">{sections.length}</p>
          </div>
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Eye className="h-4 w-4" />
              <span className="text-sm">Seções Ativas</span>
            </div>
            <p className="text-2xl font-bold text-accent mt-1">{activeSections}</p>
          </div>
        </div>

        {/* Sections Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : sections.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-lg border">
            <Layout className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="mt-4 font-semibold text-primary">Nenhuma seção criada</h3>
            <p className="text-muted-foreground mt-1">
              Comece adicionando a primeira seção da página inicial
            </p>
            <Button className="mt-4" onClick={() => setIsFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeira Seção
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sections.map((section) => (
              <LandingSectionCard
                key={section.id}
                section={section}
                onEdit={() => setEditingSection(section)}
                onDelete={() => setDeletingSection(section)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-cinzel text-primary">
              Nova Seção
            </DialogTitle>
          </DialogHeader>
          <LandingSectionForm
            onSubmit={(data) => createMutation.mutate(data)}
            onCancel={() => setIsFormOpen(false)}
            isLoading={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingSection} onOpenChange={() => setEditingSection(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-cinzel text-primary">
              Editar Seção
            </DialogTitle>
          </DialogHeader>
          {editingSection && (
            <LandingSectionForm
              initialData={editingSection}
              onSubmit={(data) => updateMutation.mutate({ id: editingSection.id, data })}
              onCancel={() => setEditingSection(null)}
              isLoading={updateMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={!!deletingSection} onOpenChange={() => setDeletingSection(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Seção?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A seção será permanentemente removida.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingSection && deleteMutation.mutate(deletingSection.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Excluir"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
