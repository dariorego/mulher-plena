import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square, Play, Pause, X, Loader2 } from 'lucide-react';

interface AudioRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
  onClear: () => void;
  disabled?: boolean;
}

export function AudioRecorder({ onRecordingComplete, onClear, disabled }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const MAX_DURATION = 120; // 2 minutes

  useEffect(() => {
    // Check if MediaRecorder is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setIsSupported(false);
    }

    return () => {
      // Cleanup
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mediaRecorder.mimeType });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        onRecordingComplete(blob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setDuration(prev => {
          if (prev >= MAX_DURATION - 1) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setIsSupported(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const togglePlayback = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const clearRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setDuration(0);
    setIsPlaying(false);
    onClear();
  };

  if (!isSupported) {
    return (
      <div className="text-sm text-muted-foreground bg-muted/50 rounded-lg px-4 py-2">
        Gravação de áudio não suportada neste navegador.
      </div>
    );
  }

  // Has recorded audio
  if (audioUrl && audioBlob) {
    return (
      <div className="flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-lg px-4 py-3">
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        />
        
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={togglePlayback}
          className="h-8 w-8 p-0 rounded-full bg-primary/10 hover:bg-primary/20"
        >
          {isPlaying ? (
            <Pause className="h-4 w-4 text-primary" />
          ) : (
            <Play className="h-4 w-4 text-primary" />
          )}
        </Button>

        <div className="flex-1">
          <div className="text-sm font-medium text-primary">Áudio gravado</div>
          <div className="text-xs text-muted-foreground">{formatTime(duration)}</div>
        </div>

        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={clearRecording}
          disabled={disabled}
          className="h-8 w-8 p-0 rounded-full hover:bg-destructive/10 hover:text-destructive"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  // Recording state
  if (isRecording) {
    return (
      <div className="flex items-center gap-3 bg-destructive/5 border border-destructive/20 rounded-lg px-4 py-3">
        <div className="h-3 w-3 rounded-full bg-destructive animate-pulse" />
        
        <div className="flex-1">
          <div className="text-sm font-medium text-destructive">Gravando...</div>
          <div className="text-xs text-muted-foreground">
            {formatTime(duration)} / {formatTime(MAX_DURATION)}
          </div>
        </div>

        <Button
          type="button"
          size="sm"
          onClick={stopRecording}
          variant="destructive"
          className="gap-2"
        >
          <Square className="h-3 w-3" />
          Parar
        </Button>
      </div>
    );
  }

  // Idle state
  return (
    <Button
      type="button"
      variant="outline"
      onClick={startRecording}
      disabled={disabled}
      className="gap-2 border-primary/30 text-primary hover:bg-primary/10 hover:text-primary"
    >
      <Mic className="h-4 w-4" />
      Gravar Áudio
    </Button>
  );
}
