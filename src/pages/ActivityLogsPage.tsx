import { useState, useEffect, useCallback } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Filter, X, Activity, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ACTION_LABELS: Record<string, string> = {
  login: 'Fez Login',
  logout: 'Fez Logout',
  view_dashboard: 'Acessou Dashboard',
  view_journey: 'Acessou Jornada',
  view_station: 'Acessou Estação',
  view_activity: 'Acessou Atividade',
  submit_activity: 'Enviou Atividade',
  mark_video_complete: 'Marcou Vídeo',
  mark_podcast_complete: 'Marcou Podcast',
  mark_supplementary_complete: 'Marcou Material',
  upload_file: 'Fez Upload',
  create_support_ticket: 'Criou Ticket',
};

const RESOURCE_TYPE_LABELS: Record<string, string> = {
  platform: 'Plataforma',
  journey: 'Jornada',
  station: 'Estação',
  activity: 'Atividade',
  file: 'Arquivo',
};

const PAGE_SIZE = 50;

interface LogEntry {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  journey_id: string | null;
  station_id: string | null;
  activity_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  user_name?: string;
  journey_title?: string;
  station_title?: string;
  activity_title?: string;
}

interface Profile {
  id: string;
  name: string;
}

interface Journey {
  id: string;
  title: string;
}

interface Station {
  id: string;
  title: string;
}

interface ActivityRecord {
  id: string;
  title: string;
}

export default function ActivityLogsPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [filterUser, setFilterUser] = useState('all');
  const [filterAction, setFilterAction] = useState('all');
  const [filterJourney, setFilterJourney] = useState('all');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  // Reference data
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [stationsMap, setStationsMap] = useState<Record<string, string>>({});
  const [activitiesMap, setActivitiesMap] = useState<Record<string, string>>({});

  // Fetch reference data on mount
  useEffect(() => {
    const fetchReferenceData = async () => {
      const [profilesRes, journeysRes, stationsRes, activitiesRes] = await Promise.all([
        supabase.from('profiles').select('id, name').order('name'),
        supabase.from('journeys').select('id, title').order('title'),
        supabase.from('stations').select('id, title'),
        supabase.from('activities').select('id, title'),
      ]);

      if (profilesRes.data) setProfiles(profilesRes.data);
      if (journeysRes.data) setJourneys(journeysRes.data);
      if (stationsRes.data) {
        const map: Record<string, string> = {};
        stationsRes.data.forEach(s => { map[s.id] = s.title; });
        setStationsMap(map);
      }
      if (activitiesRes.data) {
        const map: Record<string, string> = {};
        activitiesRes.data.forEach(a => { map[a.id] = a.title; });
        setActivitiesMap(map);
      }
    };

    fetchReferenceData();
  }, []);

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);

    let query = supabase
      .from('user_activity_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (filterUser !== 'all') {
      query = query.eq('user_id', filterUser);
    }
    if (filterAction !== 'all') {
      query = query.eq('action', filterAction);
    }
    if (filterJourney !== 'all') {
      query = query.eq('journey_id', filterJourney);
    }
    if (filterDateFrom) {
      query = query.gte('created_at', `${filterDateFrom}T00:00:00`);
    }
    if (filterDateTo) {
      query = query.lte('created_at', `${filterDateTo}T23:59:59`);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching logs:', error);
      setIsLoading(false);
      return;
    }

    if (data) {
      const profileMap = new Map(profiles.map(p => [p.id, p.name]));
      const journeyMap = new Map(journeys.map(j => [j.id, j.title]));

      const enrichedLogs: LogEntry[] = data.map(log => ({
        ...log,
        metadata: (log.metadata as Record<string, unknown>) || {},
        user_name: profileMap.get(log.user_id) || 'Usuário desconhecido',
        journey_title: log.journey_id ? journeyMap.get(log.journey_id) : undefined,
        station_title: log.station_id ? stationsMap[log.station_id] : undefined,
        activity_title: log.activity_id ? activitiesMap[log.activity_id] : undefined,
      }));

      setLogs(enrichedLogs);
      setTotalCount(count || 0);
    }

    setIsLoading(false);
  }, [page, filterUser, filterAction, filterJourney, filterDateFrom, filterDateTo, profiles, journeys, stationsMap, activitiesMap]);

  useEffect(() => {
    if (profiles.length > 0) {
      fetchLogs();
    }
  }, [fetchLogs, profiles]);

  const handleFilter = () => {
    setPage(0);
    fetchLogs();
  };

  const clearFilters = () => {
    setFilterUser('all');
    setFilterAction('all');
    setFilterJourney('all');
    setFilterDateFrom('');
    setFilterDateTo('');
    setPage(0);
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  if (!user || user.role !== 'admin') {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Acesso restrito a administradores.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold flex items-center gap-3">
            <Activity className="h-8 w-8 text-primary" />
            Logs de Atividade
          </h1>
          <p className="text-muted-foreground">
            Histórico de acessos e ações na plataforma
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-5">
              <div className="space-y-2">
                <Label>Usuário</Label>
                <Select value={filterUser} onValueChange={setFilterUser}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {profiles.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Ação</Label>
                <Select value={filterAction} onValueChange={setFilterAction}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {Object.entries(ACTION_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Jornada</Label>
                <Select value={filterJourney} onValueChange={setFilterJourney}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {journeys.map(j => (
                      <SelectItem key={j.id} value={j.id}>{j.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>De</Label>
                <Input
                  type="date"
                  value={filterDateFrom}
                  onChange={e => setFilterDateFrom(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Até</Label>
                <Input
                  type="date"
                  value={filterDateTo}
                  onChange={e => setFilterDateTo(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-2 mt-4 justify-end">
              <Button variant="outline" onClick={clearFilters} className="gap-2">
                <X className="h-4 w-4" />
                Limpar
              </Button>
              <Button onClick={handleFilter} className="gap-2">
                <Filter className="h-4 w-4" />
                Filtrar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {totalCount} {totalCount === 1 ? 'registro encontrado' : 'registros encontrados'}
          </p>
        </div>

        {/* Logs Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Nenhum registro encontrado.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Ação</TableHead>
                      <TableHead>Recurso</TableHead>
                      <TableHead>Jornada / Estação</TableHead>
                      <TableHead>Data/Hora</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map(log => (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">
                          {log.user_name}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="whitespace-nowrap">
                            {ACTION_LABELS[log.action] || log.action}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <span className="text-xs text-muted-foreground">
                              {RESOURCE_TYPE_LABELS[log.resource_type] || log.resource_type}
                            </span>
                            {log.activity_title && (
                              <p className="text-sm font-medium">{log.activity_title}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {log.journey_title ? (
                            <div className="space-y-1">
                              <p className="text-sm">{log.journey_title}</p>
                              {log.station_title && (
                                <p className="text-xs text-muted-foreground">
                                  &gt; {log.station_title}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <div>
                            <p className="text-sm">
                              {format(new Date(log.created_at), "dd/MM/yyyy", { locale: ptBR })}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(log.created_at), "HH:mm", { locale: ptBR })}
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <span className="text-sm text-muted-foreground">
              Página {page + 1} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="gap-2"
            >
              Próximo
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
