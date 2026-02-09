import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Trash2, Send, Loader2, ImagePlus, X } from 'lucide-react';
import { toast } from 'sonner';
import { ForumPost } from '@/types';
import { AudioRecorder } from './AudioRecorder';

const POST_COLORS = [
  { name: 'Amarelo', value: 'bg-yellow-100 border-yellow-300' },
  { name: 'Rosa', value: 'bg-pink-100 border-pink-300' },
  { name: 'Verde', value: 'bg-green-100 border-green-300' },
  { name: 'Azul', value: 'bg-blue-100 border-blue-300' },
  { name: 'Lilás', value: 'bg-purple-100 border-purple-300' },
];

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

interface ForumBoardProps {
  activityId: string;
  description?: string;
  allowImages?: boolean;
  requireImage?: boolean;
}

export function ForumBoard({ activityId, description, allowImages = false, requireImage = false }: ForumBoardProps) {
  const { user } = useAuth();
  const { submissions, submitActivity } = useData();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [newContent, setNewContent] = useState('');
  const [selectedColor, setSelectedColor] = useState(POST_COLORS[0].value);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Fetch posts with user profiles
  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('forum_posts')
      .select('*')
      .eq('activity_id', activityId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching posts:', error);
      return;
    }

    // Fetch user profiles for all posts
    const userIds = [...new Set(data.map(p => p.user_id))];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, name, avatar_url')
      .in('id', userIds);

    const postsWithUsers = data.map(post => {
      const profile = profiles?.find(p => p.id === post.user_id);
      return {
        ...post,
        user_name: profile?.name || 'Anônimo',
        user_avatar: profile?.avatar_url,
      };
    });

    setPosts(postsWithUsers);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPosts();

    const channel = supabase
      .channel('forum-posts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'forum_posts',
          filter: `activity_id=eq.${activityId}`,
        },
        () => {
          fetchPosts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activityId]);

  const uploadAudio = async (blob: Blob): Promise<string | null> => {
    if (!user) return null;

    const fileName = `${user.id}/${Date.now()}.webm`;
    
    const { data, error } = await supabase.storage
      .from('forum-audios')
      .upload(fileName, blob, {
        contentType: blob.type,
        cacheControl: '3600',
      });

    if (error) {
      console.error('Error uploading audio:', error);
      toast.error('Erro ao enviar áudio');
      return null;
    }

    const { data: urlData } = supabase.storage
      .from('forum-audios')
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    if (!user) return null;

    const ext = file.name.split('.').pop() || 'jpg';
    const fileName = `${user.id}/${Date.now()}.${ext}`;

    const { data, error } = await supabase.storage
      .from('forum-images')
      .upload(fileName, file, {
        contentType: file.type,
        cacheControl: '3600',
      });

    if (error) {
      console.error('Error uploading image:', error);
      toast.error('Erro ao enviar imagem');
      return null;
    }

    const { data: urlData } = supabase.storage
      .from('forum-images')
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error('Formato não suportado. Use JPEG, PNG, WebP ou GIF.');
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      toast.error('Imagem muito grande. Máximo: 10MB.');
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const canSubmit = () => {
    const hasContent = newContent.trim() || audioBlob;
    if (requireImage) return !!hasContent && !!imageFile;
    return !!hasContent || !!imageFile;
  };

  const handleSubmit = async () => {
    if (!canSubmit() || !user) return;

    setIsSubmitting(true);

    let audioUrl: string | null = null;
    let imageUrl: string | null = null;

    // Upload audio if present
    if (audioBlob) {
      audioUrl = await uploadAudio(audioBlob);
      if (audioBlob && !audioUrl) {
        setIsSubmitting(false);
        return;
      }
    }

    // Upload image if present
    if (imageFile) {
      imageUrl = await uploadImage(imageFile);
      if (imageFile && !imageUrl) {
        setIsSubmitting(false);
        return;
      }
    }

    const { error } = await supabase.from('forum_posts').insert({
      activity_id: activityId,
      user_id: user.id,
      content: newContent.trim() || '',
      color: selectedColor,
      audio_url: audioUrl,
      image_url: imageUrl,
    });

    if (error) {
      console.error('Error creating post:', error);
      toast.error('Erro ao criar post');
    } else {
      toast.success('Reflexão compartilhada!');
      setNewContent('');
      setAudioBlob(null);
      clearImage();

      // Auto-create activity submission on first forum post to track completion
      const hasExistingSubmission = submissions.some(
        s => s.activity_id === activityId && s.user_id === user.id
      );
      if (!hasExistingSubmission) {
        await submitActivity({
          activity_id: activityId,
          user_id: user.id,
          content: 'Participação no fórum',
          score: null,
        });
      }
    }

    setIsSubmitting(false);
  };

  const handleDelete = async (post: ForumPost) => {
    // Delete audio from storage if exists
    if (post.audio_url) {
      const path = post.audio_url.split('/forum-audios/')[1];
      if (path) {
        await supabase.storage.from('forum-audios').remove([path]);
      }
    }

    // Delete image from storage if exists
    if (post.image_url) {
      const path = post.image_url.split('/forum-images/')[1];
      if (path) {
        await supabase.storage.from('forum-images').remove([path]);
      }
    }

    const { error } = await supabase
      .from('forum_posts')
      .delete()
      .eq('id', post.id);

    if (error) {
      console.error('Error deleting post:', error);
      toast.error('Erro ao excluir post');
    } else {
      setPosts((prev) => prev.filter((p) => p.id !== post.id));
      toast.success('Post excluído');
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Description */}
      {description && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">Orientação</span>
            <div className="flex-1 h-px bg-primary/20"></div>
          </div>
          <div 
            className="text-foreground leading-relaxed [&>p]:mb-4 [&>p:last-child]:mb-0 [&_strong]:font-semibold [&_strong]:text-primary [&_em]:italic"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        </div>
      )}

      {/* New Post Form */}
      <div className="bg-cream/50 border border-primary/20 rounded-lg p-4 space-y-4">
        <Textarea
          placeholder="Compartilhe sua reflexão..."
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          rows={3}
          className="resize-none border-primary/30 focus:border-primary focus:ring-primary/20 bg-white"
        />

        {/* Image Section - only shown when allowImages is true */}
        {allowImages && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-primary/20" />
              <span className="text-xs text-muted-foreground">
                {requireImage ? 'anexe uma foto (obrigatório)' : 'anexe uma foto (opcional)'}
              </span>
              <div className="flex-1 h-px bg-primary/20" />
            </div>

            {imagePreview ? (
              <div className="relative inline-block">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-h-48 rounded-lg border border-primary/20 object-contain"
                />
                <button
                  onClick={clearImage}
                  className="absolute -top-2 -right-2 p-1 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors shadow-md"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => imageInputRef.current?.click()}
                className="gap-2 border-primary/30 text-primary hover:bg-primary/5"
              >
                <ImagePlus className="h-4 w-4" />
                Selecionar Foto
              </Button>
            )}

            <input
              ref={imageInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleImageSelect}
              className="hidden"
            />
          </div>
        )}

        {/* Audio Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-primary/20" />
            <span className="text-xs text-muted-foreground">ou grave um áudio</span>
            <div className="flex-1 h-px bg-primary/20" />
          </div>
          
          <AudioRecorder
            onRecordingComplete={(blob) => setAudioBlob(blob)}
            onClear={() => setAudioBlob(null)}
            disabled={isSubmitting}
          />
        </div>
        
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Color Selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Cor:</span>
            <div className="flex gap-1">
              {POST_COLORS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setSelectedColor(color.value)}
                  className={`w-6 h-6 rounded-full border-2 transition-all ${color.value} ${
                    selectedColor === color.value 
                      ? 'ring-2 ring-primary ring-offset-2 scale-110' 
                      : 'hover:scale-105'
                  }`}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!canSubmit() || isSubmitting}
            className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Compartilhar
          </Button>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">Mural de Reflexões</span>
          <div className="flex-1 h-px bg-primary/20"></div>
          <span className="text-sm text-muted-foreground">{posts.length} {posts.length === 1 ? 'post' : 'posts'}</span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted/50 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 bg-cream/30 rounded-lg border border-dashed border-primary/30">
            <p className="text-muted-foreground">Seja a primeira a compartilhar sua reflexão! ✨</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className={`${post.color} border-2 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow animate-fade-in relative group`}
              >
                {/* Delete Button */}
                {(user?.id === post.user_id || user?.role === 'admin' || user?.role === 'professor') && (
                  <button
                    onClick={() => handleDelete(post)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 hover:bg-red-100 text-muted-foreground hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"
                    title="Excluir"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}

                {/* Image */}
                {post.image_url && (
                  <div className="mb-3">
                    <img
                      src={post.image_url}
                      alt="Foto do post"
                      className="w-full rounded-md object-cover max-h-48 cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => setEnlargedImage(post.image_url!)}
                    />
                  </div>
                )}

                {/* Text Content */}
                {post.content && (
                  <p className="text-foreground text-sm leading-relaxed mb-3 whitespace-pre-wrap">
                    {post.content}
                  </p>
                )}

                {/* Audio Player */}
                {post.audio_url && (
                  <div className="mb-3">
                    <audio 
                      src={post.audio_url} 
                      controls 
                      className="w-full h-10 rounded"
                      controlsList="nodownload"
                    />
                  </div>
                )}

                {/* Author */}
                <div className="flex items-center gap-2 pt-3 border-t border-black/10">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={post.user_avatar} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {getInitials(post.user_name || 'A')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-medium text-foreground/80">{post.user_name}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Enlarged Image Modal */}
      <Dialog open={!!enlargedImage} onOpenChange={() => setEnlargedImage(null)}>
        <DialogContent className="max-w-3xl p-2">
          {enlargedImage && (
            <img
              src={enlargedImage}
              alt="Imagem ampliada"
              className="w-full h-auto rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
