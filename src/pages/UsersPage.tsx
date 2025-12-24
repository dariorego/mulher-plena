import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Shield, GraduationCap, UserCheck } from 'lucide-react';

export default function UsersPage() {
  const { user } = useAuth();

  if (!user || user.role !== 'admin') return null;

  // Mock users data
  const users = [
    { id: '1', name: 'Administrador', email: 'admin@test.com', role: 'admin' },
    { id: '2', name: 'Professor Silva', email: 'professor@test.com', role: 'professor' },
    { id: '3', name: 'João Aluno', email: 'aluno@test.com', role: 'aluno' },
  ];

  const roleIcons = { admin: Shield, professor: UserCheck, aluno: GraduationCap };
  const roleLabels = { admin: 'Administrador', professor: 'Professor', aluno: 'Aluno' };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Usuários</h1>
          <p className="text-muted-foreground">Gerencie os usuários da plataforma</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {(['admin', 'professor', 'aluno'] as const).map(role => {
            const Icon = roleIcons[role];
            const count = users.filter(u => u.role === role).length;
            return (
              <Card key={role}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">{roleLabels[role]}s</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{count}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Usuários</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {users.map(u => {
                const Icon = roleIcons[u.role as keyof typeof roleIcons];
                return (
                  <div key={u.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{u.name}</p>
                        <p className="text-sm text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                    <Badge variant="secondary">{roleLabels[u.role as keyof typeof roleLabels]}</Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}