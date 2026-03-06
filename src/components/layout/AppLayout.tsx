import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuPortal } from '@/components/ui/dropdown-menu';
import { Home, BookOpen, Trophy, Users, Settings, LogOut, ClipboardCheck, GraduationCap, Menu, X, Pencil, ChevronDown, ImageIcon, Calendar, HelpCircle, Activity } from 'lucide-react';
import logoSNI from '@/assets/logoSNI.png';
interface AppLayoutProps {
  children: ReactNode;
}
interface NavItem {
  path: string;
  label: string;
  icon: React.ComponentType<{
    className?: string;
  }>;
}
interface NavGroup {
  label: string;
  icon: React.ComponentType<{
    className?: string;
  }>;
  items: NavItem[];
}
type NavEntry = NavItem | NavGroup;
const isNavGroup = (entry: NavEntry): entry is NavGroup => {
  return 'items' in entry;
};
const navItems: Record<string, NavEntry[]> = {
  aluno: [{
    path: '/dashboard',
    label: 'Início',
    icon: Home
  }, {
    path: '/jornadas',
    label: 'Jornadas',
    icon: BookOpen
  }, {
    path: '/conquistas',
    label: 'Conquistas',
    icon: Trophy
  }, {
    path: '/suporte',
    label: 'Suporte',
    icon: HelpCircle
  }],
  professor: [{
    path: '/dashboard',
    label: 'Início',
    icon: Home
  }, {
    path: '/jornadas',
    label: 'Jornadas',
    icon: BookOpen
  }, {
    path: '/avaliacoes',
    label: 'Avaliações',
    icon: ClipboardCheck
  }, {
    path: '/suporte',
    label: 'Suporte',
    icon: HelpCircle
  }],
  admin: [{
    path: '/dashboard',
    label: 'Início',
    icon: Home
  }, {
    label: 'Edição',
    icon: Pencil,
    items: [{
      path: '/jornadas',
      label: 'Editar Conteúdo da Jornada',
      icon: BookOpen
    }, {
      path: '/gerenciar',
      label: 'Editar a Jornada',
      icon: GraduationCap
    }, {
      path: '/gerenciar-landing',
      label: 'Página Inicial',
      icon: Home
    }]
  }, {
    path: '/avaliacoes',
    label: 'Avaliações',
    icon: ClipboardCheck
  }, {
    label: 'Administração',
    icon: Settings,
    items: [{
      path: '/usuarios',
      label: 'Usuários',
      icon: Users
    }, {
      path: '/calendario',
      label: 'Calendário',
      icon: Calendar
    }, {
      path: '/imagens',
      label: 'Repositório de Imagens',
      icon: ImageIcon
    }, {
      path: '/logs',
      label: 'Logs de Atividade',
      icon: Activity
    }, {
      path: '/suporte',
      label: 'Suporte',
      icon: HelpCircle
    }, {
      path: '/configuracoes',
      label: 'Configurações',
      icon: Settings
    }]
  }]
};
export function AppLayout({
  children
}: AppLayoutProps) {
  const {
    user,
    logout
  } = useAuth();
  const { headerBorderColor } = useSettings();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  if (!user) return null;
  const userNavItems = navItems[user.role];
  const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  const isPathActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };
  const isGroupActive = (group: NavGroup) => {
    return group.items.some(item => isPathActive(item.path));
  };
  const toggleMobileGroup = (label: string) => {
    setExpandedGroups(prev => prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]);
  };
  return <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60" style={{ borderBottom: `6px solid #2d6582` }}>
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <Link to="/dashboard" className="flex items-center gap-2">
              <img src={logoSNI} alt="Logo" className="h-[54px] w-auto object-contain" />
              
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {userNavItems.map((entry, index) => {
            if (isNavGroup(entry)) {
              const Icon = entry.icon;
              const groupActive = isGroupActive(entry);
              return <DropdownMenu key={entry.label}>
                    <DropdownMenuTrigger asChild>
                      <Button variant={groupActive ? 'secondary' : 'ghost'} className={cn('gap-2 hover:!bg-[#2D6582] hover:!text-white', groupActive && 'bg-primary/10 text-primary')}>
                        <Icon className="h-4 w-4" />
                        {entry.label}
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      {entry.items.map(item => {
                    const ItemIcon = item.icon;
                    const isActive = isPathActive(item.path);
                    return <DropdownMenuItem key={item.path} onClick={() => navigate(item.path)} className={cn('gap-2 cursor-pointer', isActive && 'bg-primary/10 text-primary')}>
                            <ItemIcon className="h-4 w-4" />
                            {item.label}
                          </DropdownMenuItem>;
                  })}
                    </DropdownMenuContent>
                  </DropdownMenu>;
            }
            const Icon = entry.icon;
            const isActive = isPathActive(entry.path);
            return <Link key={entry.path} to={entry.path}>
                  <Button variant={isActive ? 'secondary' : 'ghost'} className={cn('gap-2', isActive && 'bg-primary/10 text-primary hover:bg-primary/20')}>
                    <Icon className="h-4 w-4" />
                    {entry.label}
                  </Button>
                </Link>;
          })}
          </nav>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline text-sm font-medium">{user.name}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
                <p className="text-xs text-primary capitalize mt-1">{user.role}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/configuracoes')}>
                <Settings className="mr-2 h-4 w-4" />
                Configurações
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Mobile Navigation */}
      {mobileMenuOpen && <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-foreground/20" onClick={() => setMobileMenuOpen(false)} />
          <nav className="fixed left-0 top-16 bottom-0 w-64 bg-card border-r p-4 animate-slide-in overflow-y-auto">
            <div className="flex flex-col gap-1">
              {userNavItems.map(entry => {
            if (isNavGroup(entry)) {
              const Icon = entry.icon;
              const groupActive = isGroupActive(entry);
              const isExpanded = expandedGroups.includes(entry.label) || groupActive;
              return <div key={entry.label} className="space-y-1">
                      <Button variant={groupActive ? 'secondary' : 'ghost'} className={cn('w-full justify-between gap-2', groupActive && 'bg-primary/10 text-primary')} onClick={() => toggleMobileGroup(entry.label)}>
                        <span className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {entry.label}
                        </span>
                        <ChevronDown className={cn("h-4 w-4 transition-transform", isExpanded && "rotate-180")} />
                      </Button>
                      {isExpanded && <div className="ml-4 pl-2 border-l space-y-1">
                          {entry.items.map(item => {
                    const ItemIcon = item.icon;
                    const isActive = isPathActive(item.path);
                    return <Link key={item.path} to={item.path} onClick={() => setMobileMenuOpen(false)}>
                                <Button variant={isActive ? 'secondary' : 'ghost'} className={cn('w-full justify-start gap-2', isActive && 'bg-primary/10 text-primary')}>
                                  <ItemIcon className="h-4 w-4" />
                                  {item.label}
                                </Button>
                              </Link>;
                  })}
                        </div>}
                    </div>;
            }
            const Icon = entry.icon;
            const isActive = isPathActive(entry.path);
            return <Link key={entry.path} to={entry.path} onClick={() => setMobileMenuOpen(false)}>
                    <Button variant={isActive ? 'secondary' : 'ghost'} className={cn('w-full justify-start gap-2', isActive && 'bg-primary/10 text-primary')}>
                      <Icon className="h-4 w-4" />
                      {entry.label}
                    </Button>
                  </Link>;
          })}
            </div>
          </nav>
        </div>}

      {/* Main Content */}
      <main className="container py-6 animate-fade-in">
        {children}
      </main>
    </div>;
}