import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface StorageImage {
  name: string;
  url: string;
  bucket: string;
  created_at?: string;
}

const BUCKETS = ['journey-covers', 'station-images', 'landing-images'];

export function useStorageImages(bucketFilter?: string) {
  const [images, setImages] = useState<StorageImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchImages = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const allImages: StorageImage[] = [];
      const bucketsToFetch = bucketFilter ? [bucketFilter] : BUCKETS;
      
      for (const bucket of bucketsToFetch) {
        const { data, error: listError } = await supabase.storage
          .from(bucket)
          .list('', {
            limit: 100,
            sortBy: { column: 'created_at', order: 'desc' },
          });

        if (listError) {
          console.error(`Error listing bucket ${bucket}:`, listError);
          continue;
        }

        if (data) {
          for (const file of data) {
            // Skip folders (they have no metadata.size)
            if (!file.metadata?.size) continue;
            
            const { data: { publicUrl } } = supabase.storage
              .from(bucket)
              .getPublicUrl(file.name);
            
            allImages.push({
              name: file.name,
              url: publicUrl,
              bucket,
              created_at: file.created_at,
            });
          }
        }
      }
      
      // Also check for nested files in station-images (they use journeyId folders)
      if (!bucketFilter || bucketFilter === 'station-images') {
        const { data: folders } = await supabase.storage
          .from('station-images')
          .list('', { limit: 50 });
        
        if (folders) {
          for (const folder of folders) {
            if (folder.id === null) {
              // This is a folder, list its contents
              const { data: files } = await supabase.storage
                .from('station-images')
                .list(folder.name, { limit: 50 });
              
              if (files) {
                for (const file of files) {
                  if (!file.metadata?.size) continue;
                  
                  const filePath = `${folder.name}/${file.name}`;
                  const { data: { publicUrl } } = supabase.storage
                    .from('station-images')
                    .getPublicUrl(filePath);
                  
                  allImages.push({
                    name: file.name,
                    url: publicUrl,
                    bucket: 'station-images',
                    created_at: file.created_at,
                  });
                }
              }
            }
          }
        }
      }
      
      setImages(allImages);
    } catch (err) {
      console.error('Error fetching storage images:', err);
      setError('Erro ao carregar imagens');
    } finally {
      setIsLoading(false);
    }
  }, [bucketFilter]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  return { images, isLoading, error, refresh: fetchImages };
}
