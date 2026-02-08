import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FontSizeControl } from '@/components/ui/font-size-control';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Video, Link as LinkIcon, Upload, X, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface ReconciliationReportActivityProps {
  activityId: string;
  description?: string | null;
  onSubmit: (content: string) => Promise<void>;
  isSubmitting: boolean;
  fontSizeClass: string;
}

const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm'];

function getVideoEmbedUrl(url: string): string | null {
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;

  return null;
}

export function ReconciliationReportActivity({
  activityId,
  description,
  onSubmit,
  isSubmitting,
  fontSizeClass,
}: ReconciliationReportActivityProps) {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [videoLink, setVideoLink] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const hasText = text.trim().length >= 100;
  const hasVideoLink = videoLink.trim().length > 0;
  const hasVideoFile = videoFile !== null;
  const hasAnyContent = hasText || hasVideoLink || hasVideoFile;
  const textTooShort = text.trim().length > 0 && text.trim().length < 100;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_VIDEO_TYPES.includes(file.type)) {
      toast.error('Formato não suportado. Use MP4, MOV ou WEBM.');
      return;
    }

    if (file.size > MAX_VIDEO_SIZE) {
      toast.error('O vídeo deve ter no máximo 50MB.');
      return;
    }

    setVideoFile(file);
    setVideoLink(''); // Clear link if file is selected
  };

  const removeFile = () => {
    setVideoFile(null);
  };

  const handleSubmit = async () => {
    if (!user || !hasAnyContent) return;

    let videoUrl = '';

    // Upload video file if present
    if (videoFile) {
      setIsUploading(true);
      try {
        const fileExt = videoFile.name.split('.').pop();
        const filePath = `${user.id}/${activityId}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('activity-videos')
          .upload(filePath, videoFile);

        if (uploadError) {
          toast.error('Erro ao enviar vídeo. Tente novamente.');
          setIsUploading(false);
          return;
        }

        const { data: urlData } = supabase.storage
          .from('activity-videos')
          .getPublicUrl(filePath);

        videoUrl = urlData.publicUrl;
      } catch {
        toast.error('Erro ao enviar vídeo.');
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    } else if (hasVideoLink) {
      videoUrl = videoLink.trim();
    }

    // Format the submission content
    let content = '### Relato de Reconciliação com a História Familiar\n\n';

    if (hasText) {
      content += text.trim();
    } else {
      content += '[Relato enviado em formato de vídeo]';
    }

    if (videoUrl) {
      content += '\n\n---\n\n**Vídeo anexado:** ' + videoUrl;
    }

    await onSubmit(content);
  };

  const embedUrl = videoLink ? getVideoEmbedUrl(videoLink) : null;
  const busy = isSubmitting || isUploading;

  return (
    <div className="space-y-6">
      {/* Orientation */}
      {description && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-primary uppercase tracking-wider">Orientação</span>
              <div className="flex-1 h-px bg-primary/20"></div>
            </div>
            <FontSizeControl />
          </div>
          <div
            className={`text-foreground leading-relaxed [&>p]:mb-4 [&>p:last-child]:mb-0 [&_strong]:font-semibold [&_strong]:text-primary ${fontSizeClass}`}
            dangerouslySetInnerHTML={{ __html: description }}
          />
        </div>
      )}

      {/* Text Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">Seu Relato</span>
          <div className="flex-1 h-px bg-primary/20"></div>
        </div>
        <Textarea
          placeholder="Escreva aqui o seu relato sobre como os conteúdos da jornada contribuíram para ampliar sua compreensão das relações familiares..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          className="resize-none border-primary/30 focus:border-primary focus:ring-primary/20 bg-cream/30 text-base leading-relaxed"
        />
        <p className="text-xs text-muted-foreground">
          Mínimo de 100 caracteres. Atual:{' '}
          <span className={hasText ? 'text-green-600 font-medium' : ''}>
            {text.trim().length}
          </span>
        </p>
      </div>

      {/* Video Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Video className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">Vídeo (Opcional)</span>
          <div className="flex-1 h-px bg-primary/20"></div>
        </div>

        <div className="bg-muted/30 border border-border rounded-lg p-4 space-y-4">
          {/* Link input */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm">
              <LinkIcon className="h-3.5 w-3.5" />
              Inserir link do vídeo (YouTube, Vimeo)
            </Label>
            <Input
              placeholder="https://www.youtube.com/watch?v=..."
              value={videoLink}
              onChange={(e) => {
                setVideoLink(e.target.value);
                if (e.target.value) setVideoFile(null); // Clear file if link is entered
              }}
              disabled={!!videoFile}
              className="border-primary/20"
            />
          </div>

          {/* Preview embed */}
          {embedUrl && (
            <div className="rounded-lg overflow-hidden border border-border">
              <iframe
                src={embedUrl}
                className="w-full aspect-video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Preview do vídeo"
              />
            </div>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border"></div>
            <span className="text-xs text-muted-foreground">ou</span>
            <div className="flex-1 h-px bg-border"></div>
          </div>

          {/* File upload */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm">
              <Upload className="h-3.5 w-3.5" />
              Fazer upload de vídeo (máx. 50MB)
            </Label>
            {!videoFile ? (
              <Input
                type="file"
                accept=".mp4,.mov,.webm,video/mp4,video/quicktime,video/webm"
                onChange={handleFileSelect}
                disabled={!!videoLink}
                className="cursor-pointer border-primary/20"
              />
            ) : (
              <div className="flex items-center gap-3 p-3 bg-background border border-primary/20 rounded-lg">
                <Video className="h-5 w-5 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{videoFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(videoFile.size / (1024 * 1024)).toFixed(1)} MB
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={removeFile} className="flex-shrink-0">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Validation message */}
      {!hasAnyContent && (
        <p className="text-sm text-muted-foreground text-center">
          Preencha pelo menos o relato escrito ou anexe um vídeo para enviar.
        </p>
      )}

      {textTooShort && !hasVideoLink && !hasVideoFile && (
        <p className="text-sm text-destructive text-center">
          O relato deve ter no mínimo 100 caracteres, ou anexe um vídeo.
        </p>
      )}

      {/* Submit */}
      <Button
        onClick={handleSubmit}
        disabled={busy || !hasAnyContent || (textTooShort && !hasVideoLink && !hasVideoFile)}
        className="w-full bg-accent hover:bg-accent/90 text-primary font-semibold py-6 text-lg"
      >
        {isUploading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Enviando vídeo...
          </>
        ) : isSubmitting ? (
          'Enviando...'
        ) : (
          'Enviar Atividade'
        )}
      </Button>
    </div>
  );
}

// Helper component used in SubmissionView and Evaluations to render submitted content
export function SubmittedReconciliationView({ content }: { content: string }) {
  // Parse the markdown format
  const textMatch = content.match(/### Relato de Reconciliação com a História Familiar\n\n([\s\S]*?)(?:\n\n---\n\n\*\*Vídeo anexado:\*\*|$)/);
  const videoMatch = content.match(/\*\*Vídeo anexado:\*\* (.+)$/m);

  const reportText = textMatch?.[1]?.trim() || '';
  const videoUrl = videoMatch?.[1]?.trim() || '';
  const embedUrl = videoUrl ? getVideoEmbedUrl(videoUrl) : null;
  const isPlaceholder = reportText === '[Relato enviado em formato de vídeo]';

  return (
    <div className="space-y-4">
      {/* Text */}
      {reportText && !isPlaceholder && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-primary">Relato escrito:</p>
          <p className="whitespace-pre-wrap text-foreground">{reportText}</p>
        </div>
      )}

      {isPlaceholder && (
        <p className="text-sm text-muted-foreground italic">{reportText}</p>
      )}

      {/* Video */}
      {videoUrl && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-primary">Vídeo anexado:</p>
          {embedUrl ? (
            <div className="rounded-lg overflow-hidden border border-border">
              <iframe
                src={embedUrl}
                className="w-full aspect-video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Vídeo do relato"
              />
            </div>
          ) : (
            <a
              href={videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary hover:underline"
            >
              <ExternalLink className="h-4 w-4" />
              Abrir vídeo
            </a>
          )}
        </div>
      )}
    </div>
  );
}
