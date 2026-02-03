import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trash2, Send, Loader2 } from 'lucide-react';
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

interface ForumBoardProps {
  activityId: string;
  description?: string;
}

export function ForumBoard({ activityId, description }: ForumBoardProps) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [newContent, setNewContent] = useState('');
  const [selectedColor, setSelectedColor] = useState(POST_COLORS[0].value);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

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

    // Subscribe to realtime changes
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

  const handleSubmit = async () => {
    if ((!newContent.trim() && !audioBlob) || !user) return;

    setIsSubmitting(true);

    let audioUrl: string | null = null;

    // Upload audio if present
    if (audioBlob) {
      audioUrl = await uploadAudio(audioBlob);
      if (audioBlob && !audioUrl) {
        setIsSubmitting(false);
        return; // Upload failed
      }
    }

    const { error } = await supabase.from('forum_posts').insert({
      activity_id: activityId,
      user_id: user.id,
      content: newContent.trim() || '',
      color: selectedColor,
      audio_url: audioUrl,
    });

    if (error) {
      console.error('Error creating post:', error);
      toast.error('Erro ao criar post');
    } else {
      toast.success('Reflexão compartilhada!');
      setNewContent('');
      setAudioBlob(null);
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

    const { error } = await supabase
      .from('forum_posts')
      .delete()
      .eq('id', post.id);

    if (error) {
      console.error('Error deleting post:', error);
      toast.error('Erro ao excluir post');
    } else {
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
            disabled={(!newContent.trim() && !audioBlob) || isSubmitting}
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
    </div>
  );
}
