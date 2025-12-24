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
    SidebarHeader,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { cn, resolveUrl } from '@/lib/utils';
import {
    create as worksheetsCreate,
    destroy as worksheetsDestroy,
    index as worksheetsIndex,
} from '@/routes/worksheets';
import { type SharedData } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { MoreHorizontal, Plus, Search, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import AppLogo from './app-logo';

export function AppSidebar() {
    const { props, url } = usePage<SharedData>();
    const history = useMemo(
        () => props.worksheetHistory ?? [],
        [props.worksheetHistory],
    );
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
                            <Link href={worksheetsIndex()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <Button
                            asChild
                            size="sm"
                            className="w-full justify-start gap-2"
                        >
                            <Link href={worksheetsCreate()} prefetch>
                                <Plus className="size-4" />
                                Nova ficha
                            </Link>
                        </Button>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <div className="flex items-center gap-2 rounded-md border border-input px-2 py-1.5 text-sm text-muted-foreground shadow-xs">
                            <Search className="size-4 shrink-0" />
                            <Input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Buscar fichas"
                                className="h-7 border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0"
                            />
                        </div>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <div className="px-2 py-1">
                    <p className="px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Histórico
                    </p>
                </div>
                <div className="flex-1 space-y-1 px-2 pb-2">
                    {filteredHistory.length === 0 ? (
                        <div className="rounded-md border border-dashed border-input px-3 py-4 text-sm text-muted-foreground">
                            Nenhuma ficha encontrada.
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
                                                Opções da ficha
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
                                            Remover ficha
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </SidebarMenuItem>
                        ))
                    )}
                </div>
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
