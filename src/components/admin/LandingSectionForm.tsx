import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Upload, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LandingSection } from "@/types";

interface LandingSectionFormProps {
  initialData?: Partial<LandingSection>;
  onSubmit: (data: Partial<LandingSection>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function LandingSectionForm({ 
  initialData, 
  onSubmit, 
  onCancel,
  isLoading 
}: LandingSectionFormProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [imageUrl, setImageUrl] = useState(initialData?.image_url || "");
  const [orderIndex, setOrderIndex] = useState(initialData?.order_index ?? 0);
  const [isCta, setIsCta] = useState(initialData?.is_cta || false);
  const [ctaText, setCtaText] = useState(initialData?.cta_text || "");
  const [ctaLink, setCtaLink] = useState(initialData?.cta_link || "/login");
  const [isActive, setIsActive] = useState(initialData?.is_active ?? true);
  const [uploading, setUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('landing-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('landing-images')
        .getPublicUrl(fileName);

      setImageUrl(publicUrl);
      toast.success("Imagem enviada com sucesso!");
    } catch (error: any) {
      toast.error("Erro ao enviar imagem: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSubmit({
      title: title || null,
      content: content || null,
      image_url: imageUrl || null,
      order_index: orderIndex,
      is_cta: isCta,
      cta_text: isCta ? ctaText : null,
      cta_link: isCta ? ctaLink : null,
      is_active: isActive,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Image Upload */}
      <div className="space-y-2">
        <Label>Imagem da Seção</Label>
        <div className="flex items-start gap-4">
          {imageUrl ? (
            <div className="relative w-40 h-24 rounded-lg overflow-hidden border">
              <img
                src={imageUrl}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <Button
                type="button"
                size="icon"
                variant="destructive"
                className="absolute top-1 right-1 h-6 w-6"
                onClick={() => setImageUrl("")}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-40 h-24 rounded-lg border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
            >
              {uploading ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              ) : (
                <>
                  <Upload className="h-6 w-6 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground mt-1">Upload</span>
                </>
              )}
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Título (opcional)</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título da seção"
        />
      </div>

      {/* Content */}
      <div className="space-y-2">
        <Label>Conteúdo</Label>
        <RichTextEditor
          value={content}
          onChange={setContent}
          placeholder="Escreva o conteúdo da seção..."
        />
      </div>

      {/* Order */}
      <div className="space-y-2">
        <Label htmlFor="order">Ordem de Exibição</Label>
        <Input
          id="order"
          type="number"
          min="0"
          value={orderIndex}
          onChange={(e) => setOrderIndex(parseInt(e.target.value) || 0)}
          className="w-24"
        />
        <p className="text-xs text-muted-foreground">
          Seções são exibidas em ordem crescente (0, 1, 2...)
        </p>
      </div>

      {/* Active Toggle */}
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div>
          <Label htmlFor="active">Seção Ativa</Label>
          <p className="text-sm text-muted-foreground">
            Seções inativas não aparecem na página pública
          </p>
        </div>
        <Switch
          id="active"
          checked={isActive}
          onCheckedChange={setIsActive}
        />
      </div>

      {/* CTA Toggle */}
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div>
          <Label htmlFor="cta">Call-to-Action (CTA)</Label>
          <p className="text-sm text-muted-foreground">
            Adicionar botão de chamada para ação
          </p>
        </div>
        <Switch
          id="cta"
          checked={isCta}
          onCheckedChange={setIsCta}
        />
      </div>

      {/* CTA Fields */}
      {isCta && (
        <div className="space-y-4 pl-4 border-l-2 border-accent">
          <div className="space-y-2">
            <Label htmlFor="ctaText">Texto do Botão</Label>
            <Input
              id="ctaText"
              value={ctaText}
              onChange={(e) => setCtaText(e.target.value)}
              placeholder="Ex: Começar Agora"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ctaLink">Link do Botão</Label>
            <Input
              id="ctaLink"
              value={ctaLink}
              onChange={(e) => setCtaLink(e.target.value)}
              placeholder="/login ou /registro"
            />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {initialData?.id ? "Salvar Alterações" : "Criar Seção"}
        </Button>
      </div>
    </form>
  );
}
