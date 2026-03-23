import { NavUser } from '@/components/nav-user';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { cn, resolveUrl } from '@/lib/utils';
import { dashboard } from '@/routes';
import {
    create as worksheetsCreate,
    destroy as worksheetsDestroy,
    index as worksheetsIndex,
} from '@/routes/worksheets';
import { dashboard as adminDashboard } from '@/routes/admin';
import { type SharedData } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import {
    Brain,
    ClipboardList,
    FileText,
    LayoutDashboard,
    MoreHorizontal,
    Plus,
    Search,
    Shield,
    Target,
    Trash2,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import AppLogo from './app-logo';

const comingSoonItems = [
    {
        title: 'Resumos',
        icon: Brain,
    },
    {
        title: 'Simulados',
        icon: Target,
    },
    {
        title: 'Flashcards',
        icon: FileText,
    },
];

export function AppSidebar() {
    const { props, url } = usePage<SharedData>();
    const history = useMemo(
        () => props.worksheetHistory ?? [],
        [props.worksheetHistory],
    );
    const isAdmin = Boolean(props.auth?.user?.is_admin);
    const [search, setSearch] = useState('');

    const handleRemoveWorksheet = (worksheetId: number) => {
                        if (!window.confirm('Deseja remover esta ficha?')) {
                            return;
                        }

        router.delete(worksheetsDestroy(worksheetId).url, {
            preserveScroll: true,
        });
    };

    const filteredHistory = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) {
            return history;
        }

        return history.filter(
            (item) =>
                item.topic.toLowerCase().includes(term) ||
                item.discipline.toLowerCase().includes(term),
        );
    }, [history, search]);

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {/* Main navigation */}
                <SidebarGroup>
                    <SidebarGroupLabel>Navegação</SidebarGroupLabel>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                asChild
                                isActive={resolveUrl(url) === resolveUrl(dashboard())}
                            >
                                <Link href={dashboard()} prefetch>
                                    <LayoutDashboard className="size-4" />
                                    <span>Início</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                asChild
                                isActive={resolveUrl(url).includes('fichas')}
                            >
                                <Link href={worksheetsIndex()} prefetch>
                                    <ClipboardList className="size-4" />
                                    <span>Listas de exercícios</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <Button
                                asChild
                                size="sm"
                                className="my-1 w-full justify-start gap-2"
                            >
                                <Link href={worksheetsCreate()} prefetch>
                                    <Plus className="size-4" />
                                    Nova lista
                                </Link>
                            </Button>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>

                {/* Coming soon */}
                <SidebarGroup>
                    <SidebarGroupLabel>Em breve</SidebarGroupLabel>
                    <SidebarMenu>
                        {comingSoonItems.map((item) => (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton disabled className="opacity-50">
                                    <item.icon className="size-4" />
                                    <span>{item.title}</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>

                {isAdmin && (
                    <SidebarGroup>
                        <SidebarGroupLabel>Admin</SidebarGroupLabel>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Link href={adminDashboard()} prefetch>
                                        <Shield className="size-4" />
                                        <span>Dashboard admin</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroup>
                )}

                {/* Worksheet history */}
                <SidebarGroup className="flex-1">
                    <SidebarGroupLabel>
                        <span>Histórico de listas</span>
                    </SidebarGroupLabel>
                    <div className="px-2 pb-2">
                        <div className="flex items-center gap-2 rounded-md border border-input px-2 py-1.5 text-sm text-muted-foreground shadow-xs">
                            <Search className="size-4 shrink-0" />
                            <Input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Buscar listas"
                                className="h-7 border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0"
                            />
                        </div>
                    </div>
                    <div className="flex-1 space-y-1 px-2 pb-2">
                        {filteredHistory.length === 0 ? (
                            <div className="rounded-md border border-dashed border-input px-3 py-4 text-sm text-muted-foreground">
                                Nenhuma lista encontrada.
                            </div>
                        ) : (
                            filteredHistory.map((item) => (
                                <SidebarMenuItem key={item.id}>
                                    <SidebarMenuButton
                                        asChild
                                        className={cn(
                                            'flex items-start gap-3 text-left',
                                            resolveUrl(url).includes('fichas')
                                                ? 'data-[active=true]:bg-accent data-[active=true]:text-foreground'
                                                : '',
                                        )}
                                        isActive={
                                            resolveUrl(url) ===
                                            resolveUrl(
                                                worksheetsIndex({
                                                    query: { worksheet: item.id },
                                                }),
                                            )
                                        }
                                    >
                                        <Link
                                            href={worksheetsIndex({
                                                query: { worksheet: item.id },
                                            })}
                                            prefetch
                                        >
                                            <div className="flex flex-col gap-0.5">
                                                <span className="line-clamp-1 text-sm font-medium">
                                                    {item.topic}
                                                </span>
                                                <span className="line-clamp-1 text-xs text-muted-foreground">
                                                    {item.discipline}
                                                </span>
                                            </div>
                                        </Link>
                                    </SidebarMenuButton>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <SidebarMenuAction showOnHover>
                                                <span className="sr-only">
                                                    Opções da lista
                                                </span>
                                                <MoreHorizontal className="size-4" />
                                            </SidebarMenuAction>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem
                                                variant="destructive"
                                                onClick={() =>
                                                    handleRemoveWorksheet(item.id)
                                                }
                                            >
                                                <Trash2 className="size-4" />
                                                Remover lista
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </SidebarMenuItem>
                            ))
                        )}
                    </div>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
