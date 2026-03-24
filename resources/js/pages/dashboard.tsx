import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { create as worksheetsCreate, index as worksheetsIndex } from '@/routes/worksheets';
import { create as summariesCreate, index as summariesIndex } from '@/routes/summaries';
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

type DashboardProps = SharedData & {
    worksheetCount: number;
    recentWorksheets: {
        id: number;
        topic: string;
        discipline: string;
        created_at: string;
    }[];
    summaryCount: number;
    recentSummaries: {
        id: number;
        title: string;
        discipline: string;
        created_at: string;
    }[];
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
    recentWorksheets,
    summaryCount,
    recentSummaries,
}: DashboardProps) {
    const { auth } = usePage<SharedData>().props;
    const firstName = auth.user.name.split(' ')[0];

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

                {/* Stats + recent worksheets */}
                <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold">
                            Suas listas
                        </h2>
                        <Button asChild variant="outline" size="sm">
                            <Link href={worksheetsIndex()} prefetch>
                                Ver todas
                            </Link>
                        </Button>
                    </div>

                    {worksheetCount === 0 ? (
                        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed bg-card p-10 text-center">
                            <div className="flex size-14 items-center justify-center rounded-2xl bg-muted">
                                <ClipboardList className="size-7 text-muted-foreground" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <p className="text-sm font-semibold">
                                    Nenhuma lista ainda
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Crie sua primeira lista de exercícios com IA.
                                </p>
                            </div>
                            <Button asChild size="sm">
                                <Link href={worksheetsCreate()} prefetch>
                                    <Plus className="mr-1 size-4" />
                                    Criar primeira lista
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {recentWorksheets.map((ws) => (
                                <Link
                                    key={ws.id}
                                    href={worksheetsIndex({
                                        query: { worksheet: ws.id },
                                    })}
                                    className="flex items-center gap-4 rounded-xl border bg-card p-4 transition hover:bg-accent/50"
                                    prefetch
                                >
                                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent/80">
                                        <ClipboardList className="size-4 text-accent-foreground" />
                                    </div>
                                    <div className="flex min-w-0 flex-col gap-0.5">
                                        <span className="truncate text-sm font-medium">
                                            {ws.topic}
                                        </span>
                                        <span className="truncate text-xs text-muted-foreground">
                                            {ws.discipline}
                                        </span>
                                    </div>
                                    <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                                        {new Date(ws.created_at).toLocaleDateString('pt-BR')}
                                    </span>
                                </Link>
                            ))}
                            <Button asChild variant="ghost" size="sm" className="mt-1 self-start">
                                <Link href={worksheetsCreate()} prefetch>
                                    <Plus className="mr-1 size-4" />
                                    Nova lista
                                </Link>
                            </Button>
                        </div>
                    )}
                </div>

                {/* Recent summaries */}
                <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold">
                            Seus resumos
                        </h2>
                        <Button asChild variant="outline" size="sm">
                            <Link href={summariesIndex()} prefetch>
                                Ver todos
                            </Link>
                        </Button>
                    </div>

                    {summaryCount === 0 ? (
                        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed bg-card p-10 text-center">
                            <div className="flex size-14 items-center justify-center rounded-2xl bg-muted">
                                <Brain className="size-7 text-muted-foreground" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <p className="text-sm font-semibold">
                                    Nenhum resumo ainda
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Crie seu primeiro resumo de estudo com IA.
                                </p>
                            </div>
                            <Button asChild size="sm">
                                <Link href={summariesCreate()} prefetch>
                                    <Plus className="mr-1 size-4" />
                                    Criar primeiro resumo
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {recentSummaries.map((s) => (
                                <Link
                                    key={s.id}
                                    href={summariesIndex({
                                        query: { summary: s.id },
                                    })}
                                    className="flex items-center gap-4 rounded-xl border bg-card p-4 transition hover:bg-accent/50"
                                    prefetch
                                >
                                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent/80">
                                        <Brain className="size-4 text-accent-foreground" />
                                    </div>
                                    <div className="flex min-w-0 flex-col gap-0.5">
                                        <span className="truncate text-sm font-medium">
                                            {s.title}
                                        </span>
                                        <span className="truncate text-xs text-muted-foreground">
                                            {s.discipline}
                                        </span>
                                    </div>
                                    <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                                        {new Date(s.created_at).toLocaleDateString('pt-BR')}
                                    </span>
                                </Link>
                            ))}
                            <Button asChild variant="ghost" size="sm" className="mt-1 self-start">
                                <Link href={summariesCreate()} prefetch>
                                    <Plus className="mr-1 size-4" />
                                    Novo resumo
                                </Link>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
