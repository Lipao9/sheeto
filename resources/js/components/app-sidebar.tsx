import { NavUser } from '@/components/nav-user';
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
import { resolveUrl } from '@/lib/utils';
import { dashboard } from '@/routes';
import {
    create as worksheetsCreate,
    index as worksheetsIndex,
} from '@/routes/worksheets';
import {
    create as summariesCreate,
    index as summariesIndex,
} from '@/routes/summaries';
import { dashboard as adminDashboard } from '@/routes/admin';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    Brain,
    ClipboardList,
    FileText,
    LayoutDashboard,
    Plus,
    Shield,
    Target,
} from 'lucide-react';
import AppLogo from './app-logo';

const comingSoonItems = [
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
    const isAdmin = Boolean(props.auth?.user?.is_admin);

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
                            <SidebarMenuAction asChild>
                                <Link href={worksheetsCreate()} prefetch>
                                    <Plus className="size-4" />
                                    <span className="sr-only">Nova lista</span>
                                </Link>
                            </SidebarMenuAction>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                asChild
                                isActive={resolveUrl(url).includes('resumos')}
                            >
                                <Link href={summariesIndex()} prefetch>
                                    <Brain className="size-4" />
                                    <span>Resumos</span>
                                </Link>
                            </SidebarMenuButton>
                            <SidebarMenuAction asChild>
                                <Link href={summariesCreate()} prefetch>
                                    <Plus className="size-4" />
                                    <span className="sr-only">Novo resumo</span>
                                </Link>
                            </SidebarMenuAction>
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
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
