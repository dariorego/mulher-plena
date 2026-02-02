import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { 
  Search, 
  Image, 
  Trash2, 
  Loader2, 
  FolderOpen,
  Copy,
  Check
} from 'lucide-react';
import { toast } from 'sonner';
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

interface StorageImage {
  name: string;
  url: string;
  bucket: string;
}

const BUCKETS = [
  { id: 'journey-covers', label: 'Capas de Jornadas' },
  { id: 'station-images', label: 'Imagens de Estações' },
  { id: 'landing-images', label: 'Imagens da Landing Page' },
];

export default function ImageLibraryPage() {
  const { user } = useAuth();
  const [images, setImages] = useState<StorageImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBucket, setSelectedBucket] = useState('all');
  const [deleteImage, setDeleteImage] = useState<StorageImage | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    setLoading(true);
    const allImages: StorageImage[] = [];

    for (const bucket of BUCKETS) {
      try {
        const { data: files, error } = await supabase.storage
          .from(bucket.id)
          .list('', { limit: 500, sortBy: { column: 'created_at', order: 'desc' } });

        if (error) {
          console.error(`Error loading from ${bucket.id}:`, error);
          continue;
        }

        if (files) {
          // Also check subdirectories
          const topLevelFiles = files.filter(f => f.id && !f.id.endsWith('/'));
          const folders = files.filter(f => !f.id || f.metadata === null);

          for (const file of topLevelFiles) {
            const { data: urlData } = supabase.storage.from(bucket.id).getPublicUrl(file.name);
            allImages.push({
              name: file.name,
              url: urlData.publicUrl,
              bucket: bucket.id,
            });
          }

          // Load files from subdirectories
          for (const folder of folders) {
            if (folder.name) {
              const { data: subFiles } = await supabase.storage
                .from(bucket.id)
                .list(folder.name, { limit: 100 });

              if (subFiles) {
                for (const file of subFiles.filter(f => f.id)) {
                  const filePath = `${folder.name}/${file.name}`;
                  const { data: urlData } = supabase.storage.from(bucket.id).getPublicUrl(filePath);
                  allImages.push({
                    name: file.name,
                    url: urlData.publicUrl,
                    bucket: bucket.id,
                  });
                }
              }
            }
          }
        }
      } catch (err) {
        console.error(`Error loading bucket ${bucket.id}:`, err);
      }
    }

    setImages(allImages);
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteImage) return;

    setDeleting(true);
    try {
      // Extract the path from URL
      const urlParts = deleteImage.url.split(`${deleteImage.bucket}/`);
      const filePath = urlParts[1] || deleteImage.name;

      const { error } = await supabase.storage
        .from(deleteImage.bucket)
        .remove([decodeURIComponent(filePath)]);

      if (error) throw error;

      setImages(prev => prev.filter(img => img.url !== deleteImage.url));
      toast.success('Imagem excluída com sucesso');
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Erro ao excluir imagem');
    } finally {
      setDeleting(false);
      setDeleteImage(null);
    }
  };

  const handleCopyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      toast.success('URL copiada!');
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (error) {
      toast.error('Erro ao copiar URL');
    }
  };

  const filteredImages = images.filter(img => {
    const matchesSearch = img.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBucket = selectedBucket === 'all' || img.bucket === selectedBucket;
    return matchesSearch && matchesBucket;
  });

  const getBucketLabel = (bucketId: string) => {
    return BUCKETS.find(b => b.id === bucketId)?.label || bucketId;
  };

  if (!user || user.role !== 'admin') {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-destructive">Acesso Negado</h2>
          <p className="text-muted-foreground mt-2">
            Você não tem permissão para acessar esta página.
          </p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-cinzel font-bold text-primary">Repositório de Imagens</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie todas as imagens enviadas para a plataforma
            </p>
          </div>
          <Button onClick={loadImages} variant="outline" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Atualizar'}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar imagens..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedBucket} onValueChange={setSelectedBucket}>
              <TabsList className="mb-4 flex-wrap h-auto gap-1">
                <TabsTrigger value="all" className="gap-2">
                  <FolderOpen className="h-4 w-4" />
                  Todos ({images.length})
                </TabsTrigger>
                {BUCKETS.map(bucket => {
                  const count = images.filter(img => img.bucket === bucket.id).length;
                  return (
                    <TabsTrigger key={bucket.id} value={bucket.id} className="gap-2">
                      <Image className="h-4 w-4" />
                      {bucket.label} ({count})
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              <TabsContent value={selectedBucket} className="mt-0">
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : filteredImages.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Image className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma imagem encontrada</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {filteredImages.map((image, index) => (
                      <div
                        key={`${image.bucket}-${image.name}-${index}`}
                        className="group relative aspect-square rounded-lg overflow-hidden border bg-muted flex items-center justify-center"
                      >
                        <img
                          src={image.url}
                          alt={image.name}
                          className="max-w-full max-h-full object-contain"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                          <p className="text-white text-xs text-center truncate w-full">
                            {image.name}
                          </p>
                          <p className="text-white/70 text-[10px]">
                            {getBucketLabel(image.bucket)}
                          </p>
                          <div className="flex gap-1">
                            <Button
                              size="icon"
                              variant="secondary"
                              className="h-8 w-8"
                              onClick={() => handleCopyUrl(image.url)}
                            >
                              {copiedUrl === image.url ? (
                                <Check className="h-4 w-4 text-green-600" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              size="icon"
                              variant="destructive"
                              className="h-8 w-8"
                              onClick={() => setDeleteImage(image)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <AlertDialog open={!!deleteImage} onOpenChange={() => setDeleteImage(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir imagem?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. A imagem será permanentemente removida do armazenamento.
                {deleteImage && (
                  <span className="block mt-2 font-medium text-foreground">
                    {deleteImage.name}
                  </span>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={deleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Excluindo...
                  </>
                ) : (
                  'Excluir'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
}
