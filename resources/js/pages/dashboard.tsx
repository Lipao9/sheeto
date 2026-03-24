import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { create as worksheetsCreate, index as worksheetsIndex, show as worksheetsShow } from '@/routes/worksheets';
import { create as summariesCreate, index as summariesIndex, show as summariesShow } from '@/routes/summaries';
import { dashboard } from '@/routes';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    Brain,
    ClipboardList,
    FileText,
    Plus,
    Target,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Início',
        href: dashboard().url,
    },
];

type RecentActivityItem = {
    id: number;
    type: 'worksheet' | 'summary';
    title: string;
    discipline: string;
    created_at: string;
};

type DashboardProps = SharedData & {
    worksheetCount: number;
    summaryCount: number;
    recentActivity: RecentActivityItem[];
};

const tools = [
    {
        icon: ClipboardList,
        title: 'Listas de exercícios',
        description: 'Gere listas com questões personalizadas para o seu nível.',
        href: worksheetsCreate(),
        color: '#E46D3A',
        available: true,
    },
    {
        icon: Brain,
        title: 'Resumos',
        description: 'Transforme conteúdos em resumos claros e objetivos.',
        href: summariesCreate(),
        color: '#1F9C8C',
        available: true,
    },
    {
        icon: Target,
        title: 'Simulados',
        description: 'Monte simulados sob medida para provas e vestibulares.',
        color: '#F0B36E',
        available: false,
    },
    {
        icon: FileText,
        title: 'Flashcards',
        description: 'Crie cartões de memorização para fixar conceitos.',
        color: '#E46D3A',
        available: false,
    },
];

export default function Dashboard({
    worksheetCount,
    summaryCount,
    recentActivity,
}: DashboardProps) {
    const { auth } = usePage<SharedData>().props;
    const firstName = auth.user.name.split(' ')[0];
    const totalCount = worksheetCount + summaryCount;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Início" />

            <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 p-6">
                {/* Welcome */}
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Olá, {firstName}!
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        O que você quer estudar hoje?
                    </p>
                </div>

                {/* Quick actions */}
                <div className="grid gap-4 sm:grid-cols-2">
                    {tools.map((tool) => (
                        <div
                            key={tool.title}
                            className={`group relative flex flex-col gap-3 rounded-2xl border bg-card p-5 shadow-xs transition ${
                                tool.available
                                    ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-md'
                                    : 'opacity-60'
                            }`}
                        >
                            {!tool.available && (
                                <span className="absolute right-4 top-4 rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                    Em breve
                                </span>
                            )}
                            <div
                                className="flex size-10 items-center justify-center rounded-xl"
                                style={{ backgroundColor: `${tool.color}15` }}
                            >
                                <tool.icon
                                    className="size-5"
                                    style={{ color: tool.color }}
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <h3 className="text-sm font-semibold">
                                    {tool.title}
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    {tool.description}
                                </p>
                            </div>
                            {tool.available && tool.href && (
                                <Link
                                    href={tool.href}
                                    className="absolute inset-0 rounded-2xl"
                                    prefetch
                                >
                                    <span className="sr-only">
                                        Acessar {tool.title}
                                    </span>
                                </Link>
                            )}
                        </div>
                    ))}
                </div>

                {/* Recent activity */}
                <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold">
                            Atividade recente
                        </h2>
                        <div className="flex gap-2">
                            <Button asChild variant="outline" size="sm">
                                <Link href={worksheetsIndex()} prefetch>
                                    Listas
                                </Link>
                            </Button>
                            <Button asChild variant="outline" size="sm">
                                <Link href={summariesIndex()} prefetch>
                                    Resumos
                                </Link>
                            </Button>
                        </div>
                    </div>

                    {totalCount === 0 ? (
                        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed bg-card p-10 text-center">
                            <div className="flex size-14 items-center justify-center rounded-2xl bg-muted">
                                <ClipboardList className="size-7 text-muted-foreground" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <p className="text-sm font-semibold">
                                    Nenhuma atividade ainda
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Crie sua primeira lista ou resumo com IA.
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Button asChild size="sm">
                                    <Link href={worksheetsCreate()} prefetch>
                                        <Plus className="mr-1 size-4" />
                                        Nova lista
                                    </Link>
                                </Button>
                                <Button asChild size="sm" variant="outline">
                                    <Link href={summariesCreate()} prefetch>
                                        <Plus className="mr-1 size-4" />
                                        Novo resumo
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {recentActivity.map((item) => {
                                const Icon = item.type === 'worksheet' ? ClipboardList : Brain;
                                const href = item.type === 'worksheet'
                                    ? worksheetsShow(item.id)
                                    : summariesShow(item.id);
                                const typeLabel = item.type === 'worksheet' ? 'Lista' : 'Resumo';

                                return (
                                    <Link
                                        key={`${item.type}-${item.id}`}
                                        href={href}
                                        className="flex items-center gap-4 rounded-xl border bg-card p-4 transition hover:bg-accent/50"
                                        prefetch
                                    >
                                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent/80">
                                            <Icon className="size-4 text-accent-foreground" />
                                        </div>
                                        <div className="flex min-w-0 flex-col gap-0.5">
                                            <span className="truncate text-sm font-medium">
                                                {item.title}
                                            </span>
                                            <span className="truncate text-xs text-muted-foreground">
                                                {item.discipline}
                                            </span>
                                        </div>
                                        <span className="ml-auto shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                                            {typeLabel}
                                        </span>
                                        <span className="shrink-0 text-xs text-muted-foreground">
                                            {new Date(item.created_at).toLocaleDateString('pt-BR')}
                                        </span>
                                    </Link>
                                );
                            })}
                            <div className="flex gap-2 mt-1">
                                <Button asChild variant="ghost" size="sm">
                                    <Link href={worksheetsCreate()} prefetch>
                                        <Plus className="mr-1 size-4" />
                                        Nova lista
                                    </Link>
                                </Button>
                                <Button asChild variant="ghost" size="sm">
                                    <Link href={summariesCreate()} prefetch>
                                        <Plus className="mr-1 size-4" />
                                        Novo resumo
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
