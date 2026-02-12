import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

interface UserFiltersProps {
  searchName: string;
  onSearchNameChange: (value: string) => void;
  filterRole: string;
  onFilterRoleChange: (value: string) => void;
}

export function UserFilters({ searchName, onSearchNameChange, filterRole, onFilterRoleChange }: UserFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome..."
          value={searchName}
          onChange={(e) => onSearchNameChange(e.target.value)}
          className="pl-9"
        />
      </div>
      <Select value={filterRole} onValueChange={onFilterRoleChange}>
        <SelectTrigger className="w-full sm:w-[200px]">
          <SelectValue placeholder="Filtrar por perfil" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os perfis</SelectItem>
          <SelectItem value="admin">Administrador(a)</SelectItem>
          <SelectItem value="professor">Tutor(a)</SelectItem>
          <SelectItem value="aluno">Participante</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
