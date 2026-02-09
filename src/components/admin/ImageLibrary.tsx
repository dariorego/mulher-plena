import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useStorageImages, StorageImage } from '@/hooks/useStorageImages';
import { Search, Upload, Loader2, ImageIcon, Check, Trash2, ZoomIn, Copy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ImageLibraryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (url: string) => void;
  bucket?: string;
  uploadBucket?: string;
}

export function ImageLibrary({ 
  open, 
  onOpenChange, 
  onSelect, 
  bucket,
  uploadBucket = 'landing-images'
}: ImageLibraryProps) {
  const { images, isLoading, refresh, deleteImage } = useStorageImages(bucket);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<StorageImage | null>(null);
  const [zoomImage, setZoomImage] = useState<StorageImage | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredImages = images.filter(img =>
    img.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = () => {
    if (selectedUrl) {
      onSelect(selectedUrl);
      setSelectedUrl(null);
      setSearchQuery('');
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, image: StorageImage) => {
    e.stopPropagation();
    setImageToDelete(image);
  };

  const confirmDelete = async () => {
    if (!imageToDelete) return;
    
    setDeleting(true);
    try {
      await deleteImage(imageToDelete.url, imageToDelete.bucket);
      
      // Clear selection if deleted image was selected
      if (selectedUrl === imageToDelete.url) {
        setSelectedUrl(null);
      }
      
      toast.success('Imagem excluída com sucesso!');
      refresh();
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error('Erro ao excluir imagem');
    } finally {
      setDeleting(false);
      setImageToDelete(null);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem válida');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5MB');
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from(uploadBucket)
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(uploadBucket)
        .getPublicUrl(fileName);

      toast.success('Imagem enviada com sucesso!');
      onSelect(publicUrl);
      setSearchQuery('');
      onOpenChange(false);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('Erro ao enviar imagem');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCopyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      toast.success('URL copiada!');
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch {
      toast.error('Erro ao copiar URL');
    }
  };

  const handleClose = () => {
    setSelectedUrl(null);
    setSearchQuery('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Galeria de Imagens</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="library" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="library">Biblioteca</TabsTrigger>
            <TabsTrigger value="upload">Upload Novo</TabsTrigger>
          </TabsList>

          <TabsContent value="library" className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Image Grid */}
            <ScrollArea className="h-[400px]">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredImages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <ImageIcon className="h-12 w-12 mb-2" />
                  <p>Nenhuma imagem encontrada</p>
                  {searchQuery && (
                    <p className="text-sm">Tente outro termo de busca</p>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-1">
                  {filteredImages.map((image) => (
                    <div
                      key={image.url}
                      className="group relative rounded-lg overflow-hidden border bg-muted flex items-center justify-center"
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedUrl(image.url)}
                        className={cn(
                          'relative w-full flex items-center justify-center p-2 min-h-[120px] border-2 rounded-lg transition-all',
                          selectedUrl === image.url
                            ? 'border-primary ring-2 ring-primary ring-offset-2'
                            : 'border-transparent hover:border-muted-foreground/30'
                        )}
                      >
                        <img
                          src={image.url}
                          alt={image.name}
                          className="max-w-full max-h-[160px] object-contain"
                          loading="lazy"
                        />
                        {selectedUrl === image.url && (
                          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center rounded-lg">
                            <div className="bg-primary text-primary-foreground rounded-full p-1">
                              <Check className="h-4 w-4" />
                            </div>
                          </div>
                        )}
                      </button>
                      {/* Overlay with actions on hover */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2 pointer-events-none rounded-lg">
                        <p className="text-white text-xs text-center truncate w-full">
                          {image.name}
                        </p>
                        <div className="flex gap-1 pointer-events-auto">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setZoomImage(image); }}
                            className="bg-secondary text-secondary-foreground rounded-md p-1.5 hover:bg-secondary/80 transition-colors"
                            title="Visualizar"
                          >
                            <ZoomIn className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleDeleteClick(e, image); }}
                            className="bg-destructive text-destructive-foreground rounded-md p-1.5 hover:bg-destructive/90 transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* Actions */}
            <div className="flex justify-between items-center pt-2 border-t">
              <Button type="button" variant="ghost" size="sm" onClick={refresh}>
                Atualizar lista
              </Button>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancelar
                </Button>
                <Button 
                  type="button" 
                  onClick={handleSelect} 
                  disabled={!selectedUrl}
                >
                  Selecionar
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="upload" className="space-y-4">
            <div className="flex flex-col items-center justify-center h-[400px] border-2 border-dashed border-muted-foreground/25 rounded-lg">
              {uploading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  <p className="text-muted-foreground">Enviando imagem...</p>
                </div>
              ) : (
                <label className="flex flex-col items-center cursor-pointer p-8 hover:bg-muted/50 rounded-lg transition-colors">
                  <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-1">Clique para selecionar</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    ou arraste e solte uma imagem aqui
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG, WEBP até 5MB
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!imageToDelete} onOpenChange={() => setImageToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir esta imagem? 
                Esta ação não pode ser desfeita. A imagem será removida permanentemente do armazenamento.
              </AlertDialogDescription>
            </AlertDialogHeader>
            {imageToDelete && (
              <div className="flex justify-center py-2">
                <img 
                  src={imageToDelete.url} 
                  alt={imageToDelete.name}
                  className="max-h-32 rounded-lg object-cover"
                />
              </div>
            )}
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmDelete}
                disabled={deleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Excluindo...
                  </>
                ) : (
                  'Excluir'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Zoom Image Dialog */}
        <Dialog open={!!zoomImage} onOpenChange={() => setZoomImage(null)}>
          <DialogContent className="max-w-[90vw] max-h-[90vh] p-2 overflow-hidden">
            {zoomImage && (
              <div className="flex flex-col items-center gap-3">
                <img
                  src={zoomImage.url}
                  alt={zoomImage.name}
                  className="max-w-full max-h-[75vh] object-contain"
                />
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="font-medium">{zoomImage.name}</span>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="ml-2"
                    onClick={() => handleCopyUrl(zoomImage.url)}
                  >
                    {copiedUrl === zoomImage.url ? (
                      <Check className="h-4 w-4 text-green-600 mr-1" />
                    ) : (
                      <Copy className="h-4 w-4 mr-1" />
                    )}
                    Copiar URL
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}
