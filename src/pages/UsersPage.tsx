import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Shield, GraduationCap, UserCheck, Calendar, ChevronDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { JourneyAccessManager } from '@/components/admin/JourneyAccessManager';
import type { UserRole } from '@/types';

interface UserWithRole {
  id: string;
  name: string;
  email: string | null;
  avatar_url: string | null;
  created_at: string;
  role: UserRole;
  role_id: string;
}

const roleIcons: Record<UserRole, typeof Shield> = {
  admin: Shield,
  professor: UserCheck,
  aluno: GraduationCap,
};

const roleLabels: Record<UserRole, string> = {
  admin: 'Administrador',
  professor: 'Tutor(a)',
  aluno: 'Aluno',
};

export default function UsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const [profilesRes, rolesRes] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at'),
        supabase.from('user_roles').select('*'),
      ]);

      if (profilesRes.error) throw profilesRes.error;
      if (rolesRes.error) throw rolesRes.error;

      const profiles = profilesRes.data || [];
      const roles = rolesRes.data || [];

      const combined: UserWithRole[] = profiles.map((profile) => {
        const userRole = roles.find((r) => r.user_id === profile.id);
        return {
          id: profile.id,
          name: profile.name,
          email: (profile as any).email ?? null,
          avatar_url: profile.avatar_url,
          created_at: profile.created_at,
          role: (userRole?.role as UserRole) || 'aluno',
          role_id: userRole?.id || '',
        };
      });

      setUsers(combined);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar usuários',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchUsers();
    }
  }, [user, fetchUsers]);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    setUpdatingUserId(userId);
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (error) throw error;

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );

      toast({
        title: 'Role atualizada',
        description: `Usuário alterado para ${roleLabels[newRole]}.`,
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar role',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUpdatingUserId(null);
    }
  };

  if (!user || user.role !== 'admin') return null;

  const roleCounts: Record<UserRole, number> = {
    admin: users.filter((u) => u.role === 'admin').length,
    professor: users.filter((u) => u.role === 'professor').length,
    aluno: users.filter((u) => u.role === 'aluno').length,
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Usuários</h1>
          <p className="text-muted-foreground">Gerencie os usuários da plataforma</p>
        </div>

        {/* Cards de contagem */}
        <div className="grid gap-4 md:grid-cols-3">
          {(['admin', 'professor', 'aluno'] as const).map((role) => {
            const Icon = roleIcons[role];
            return (
              <Card key={role}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">{roleLabels[role]}s</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-8 w-12" />
                  ) : (
                    <div className="text-2xl font-bold">{roleCounts[role]}</div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Lista de usuários */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Usuários</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-48" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-9 w-36" />
                  </div>
                ))}
              </div>
            ) : users.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">Nenhum usuário encontrado.</p>
            ) : (
              <div className="space-y-2">
                {users.map((u) => {
                  const Icon = roleIcons[u.role];
                  return (
                    <Collapsible key={u.id}>
                      <div className="rounded-lg bg-muted/50">
                        <div className="flex items-center justify-between p-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <Icon className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{u.name}</p>
                              <p className="text-sm text-muted-foreground">{u.email || 'Sem email'}</p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Cadastro: {new Date(u.created_at).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Select
                              value={u.role}
                              onValueChange={(value) => handleRoleChange(u.id, value as UserRole)}
                              disabled={updatingUserId === u.id}
                            >
                              <SelectTrigger className="w-[160px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="admin">Administrador</SelectItem>
                                <SelectItem value="professor">Tutor(a)</SelectItem>
                                <SelectItem value="aluno">Aluno</SelectItem>
                              </SelectContent>
                            </Select>
                            {u.role === 'aluno' && (
                              <CollapsibleTrigger asChild>
                                <button className="p-2 rounded hover:bg-muted transition-colors">
                                  <ChevronDown className="h-4 w-4" />
                                </button>
                              </CollapsibleTrigger>
                            )}
                          </div>
                        </div>
                        {u.role === 'aluno' && (
                          <CollapsibleContent className="px-3 pb-3">
                            <JourneyAccessManager userId={u.id} userName={u.name} />
                          </CollapsibleContent>
                        )}
                      </div>
                    </Collapsible>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
