import { useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Shield, GraduationCap, UserCheck, Calendar, ChevronDown, Pencil, Check, X } from 'lucide-react';
import { JourneyAccessManager } from '@/components/admin/JourneyAccessManager';
import { JourneyStatusIcons } from '@/components/admin/JourneyStatusIcons';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
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
  admin: 'Administrador(a)',
  professor: 'Tutor(a)',
  aluno: 'Participante',
};

interface UserRowProps {
  user: UserWithRole;
  onRoleChange: (userId: string, newRole: UserRole) => Promise<void>;
  onNameUpdate: (userId: string, newName: string) => void;
  updatingUserId: string | null;
}

export function UserRow({ user: u, onRoleChange, onNameUpdate, updatingUserId }: UserRowProps) {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(u.name);
  const [saving, setSaving] = useState(false);
  const Icon = roleIcons[u.role];

  const handleSaveName = async () => {
    const trimmed = editName.trim();
    if (!trimmed || trimmed === u.name) {
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.from('profiles').update({ name: trimmed }).eq('id', u.id);
      if (error) throw error;
      onNameUpdate(u.id, trimmed);
      toast({ title: 'Nome atualizado', description: `Nome alterado para "${trimmed}".` });
      setEditing(false);
    } catch (err: any) {
      toast({ title: 'Erro ao atualizar nome', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Collapsible>
      <div className="rounded-lg bg-muted/50">
        <div className="flex items-center justify-between p-3 gap-2">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                {editing ? (
                  <div className="flex items-center gap-1">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="h-7 text-sm w-40"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveName();
                        if (e.key === 'Escape') setEditing(false);
                      }}
                    />
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleSaveName} disabled={saving}>
                      <Check className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditing(false)}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <p className="font-medium truncate">{u.name}</p>
                    <button
                      onClick={() => { setEditName(u.name); setEditing(true); }}
                      className="p-1 rounded hover:bg-muted transition-colors shrink-0"
                    >
                      <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  </>
                )}
              </div>
              <p className="text-sm text-muted-foreground truncate">{u.email || 'Sem email'}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Cadastro: {new Date(u.created_at).toLocaleDateString('pt-BR')}
              </p>
              {u.role === 'aluno' && (
                <div className="mt-1.5">
                  <JourneyStatusIcons userId={u.id} />
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Select
              value={u.role}
              onValueChange={(value) => onRoleChange(u.id, value as UserRole)}
              disabled={updatingUserId === u.id}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">{roleLabels.admin}</SelectItem>
                <SelectItem value="professor">{roleLabels.professor}</SelectItem>
                <SelectItem value="aluno">{roleLabels.aluno}</SelectItem>
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
}

export { roleIcons, roleLabels };
export type { UserWithRole };
