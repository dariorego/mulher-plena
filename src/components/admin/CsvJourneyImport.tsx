import { useState, useRef } from 'react';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Upload, FileText, CheckCircle2, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ImportResult {
  line: number;
  email: string;
  journey: number;
  status: 'success' | 'error' | 'skipped';
  message: string;
}

export function CsvJourneyImport() {
  const { journeys, journeyAccess, grantJourneyAccess, getJourneyProgress, refreshData } = useData();
  const [open, setOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<ImportResult[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setResults([]);
    setFileName(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setResults([]);
  };

  const parseCsv = (text: string): { email: string; journey: number }[] => {
    const lines = text.trim().split('\n');
    const rows: { email: string; journey: number }[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Skip header
      const lower = line.toLowerCase();
      if (lower.startsWith('email') && (lower.includes('jornada') || lower.includes('journey'))) continue;

      const parts = line.split(/[,;]/).map(p => p.trim());
      if (parts.length >= 2) {
        const journeyNum = parseInt(parts[1], 10);
        if (!isNaN(journeyNum)) {
          rows.push({ email: parts[0], journey: journeyNum });
        }
      }
    }
    return rows;
  };

  const handleImport = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    setImporting(true);
    setResults([]);

    try {
      const text = await file.text();
      const rows = parseCsv(text);

      if (rows.length === 0) {
        setResults([{ line: 1, email: '-', journey: 0, status: 'error', message: 'Nenhuma linha válida encontrada no CSV.' }]);
        setImporting(false);
        return;
      }

      // Fetch all profiles to map email -> id
      const { data: profiles } = await supabase.from('profiles').select('id, email');
      const emailToId = new Map<string, string>();
      (profiles || []).forEach(p => {
        if (p.email) emailToId.set(p.email.toLowerCase(), p.id);
      });

      const importResults: ImportResult[] = [];

      for (let i = 0; i < rows.length; i++) {
        const { email, journey: journeyNum } = rows[i];
        const result: ImportResult = { line: i + 1, email, journey: journeyNum, status: 'error', message: '' };

        // Find user
        const userId = emailToId.get(email.toLowerCase());
        if (!userId) {
          result.message = 'Email não encontrado.';
          importResults.push(result);
          continue;
        }

        // Find journey by order_index
        const journey = journeys.find(j => j.order_index === journeyNum);
        if (!journey) {
          result.message = `Jornada ${journeyNum} não existe.`;
          importResults.push(result);
          continue;
        }

        // Check if already granted
        const alreadyGranted = journeyAccess.some(a => a.user_id === userId && a.journey_id === journey.id);
        if (alreadyGranted) {
          result.status = 'skipped';
          result.message = 'Acesso já liberado.';
          importResults.push(result);
          continue;
        }

        // Check prerequisites for journeys 4+
        if (journey.order_index > 3) {
          const prereqJourneys = journeys.filter(j => j.order_index <= 3);
          const prereqsMet = prereqJourneys.every(j => getJourneyProgress(userId, j.id) >= 100);
          if (!prereqsMet) {
            result.status = 'error';
            result.message = 'Pré-requisitos não cumpridos (Jornadas 1-3 incompletas).';
            importResults.push(result);
            continue;
          }
        }

        // Grant access
        try {
          await grantJourneyAccess(userId, journey.id);
          result.status = 'success';
          result.message = 'Acesso liberado com sucesso.';
        } catch (err: any) {
          result.message = err.message || 'Erro ao liberar acesso.';
        }

        importResults.push(result);
      }

      setResults(importResults);
      await refreshData();
    } catch (err: any) {
      setResults([{ line: 0, email: '-', journey: 0, status: 'error', message: `Erro ao processar arquivo: ${err.message}` }]);
    } finally {
      setImporting(false);
    }
  };

  const successCount = results.filter(r => r.status === 'success').length;
  const errorCount = results.filter(r => r.status === 'error').length;
  const skippedCount = results.filter(r => r.status === 'skipped').length;

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetState(); }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Upload className="h-4 w-4" />
          Importar CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Importar Liberação de Jornadas via CSV</DialogTitle>
          <DialogDescription>
            O arquivo deve conter as colunas <strong>email</strong> e <strong>jornada</strong> (número), separados por vírgula ou ponto e vírgula.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File input */}
          <div className="flex items-center gap-3">
            <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()} disabled={importing}>
              <FileText className="h-4 w-4 mr-2" />
              Selecionar arquivo
            </Button>
            <span className="text-sm text-muted-foreground truncate">
              {fileName || 'Nenhum arquivo selecionado'}
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.txt"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>

          {/* Example */}
          <div className="rounded-md bg-muted p-3 text-xs font-mono">
            <p className="text-muted-foreground mb-1">Exemplo:</p>
            email,jornada<br />
            maria@exemplo.com,1<br />
            joao@exemplo.com,4
          </div>

          {/* Import button */}
          <Button onClick={handleImport} disabled={importing || !fileName} className="w-full gap-2">
            {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {importing ? 'Importando...' : 'Importar'}
          </Button>

          {/* Results */}
          {results.length > 0 && (
            <div className="space-y-3">
              {/* Summary */}
              <div className="flex gap-4 text-sm">
                {successCount > 0 && (
                  <span className="flex items-center gap-1 text-green-600">
                    <CheckCircle2 className="h-4 w-4" /> {successCount} liberado(s)
                  </span>
                )}
                {skippedCount > 0 && (
                  <span className="flex items-center gap-1 text-yellow-600">
                    <AlertTriangle className="h-4 w-4" /> {skippedCount} já existente(s)
                  </span>
                )}
                {errorCount > 0 && (
                  <span className="flex items-center gap-1 text-destructive">
                    <XCircle className="h-4 w-4" /> {errorCount} erro(s)
                  </span>
                )}
              </div>

              {/* Detail list */}
              <ScrollArea className="h-[200px] rounded-md border">
                <div className="p-2 space-y-1">
                  {results.map((r, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs py-1 border-b last:border-0">
                      {r.status === 'success' && <CheckCircle2 className="h-3.5 w-3.5 text-green-600 mt-0.5 shrink-0" />}
                      {r.status === 'error' && <XCircle className="h-3.5 w-3.5 text-destructive mt-0.5 shrink-0" />}
                      {r.status === 'skipped' && <AlertTriangle className="h-3.5 w-3.5 text-yellow-600 mt-0.5 shrink-0" />}
                      <div className="min-w-0">
                        <span className="font-medium">{r.email}</span>
                        <span className="text-muted-foreground"> — Jornada {r.journey}</span>
                        <p className="text-muted-foreground">{r.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
