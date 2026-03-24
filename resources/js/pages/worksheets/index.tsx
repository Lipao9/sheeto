import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { create as worksheetsCreate, index as worksheetsIndex, show as worksheetsShow } from '@/routes/worksheets';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';

type WorksheetItem = {
    id: number;
    discipline: string;
    topic: string;
    difficulty: string;
    education_level: string;
    question_count: number;
    created_at: string;
};

type PaginatedWorksheets = {
    data: WorksheetItem[];
    current_page: number;
    last_page: number;
    next_page_url: string | null;
    prev_page_url: string | null;
};

type WorksheetsIndexProps = {
    worksheets: PaginatedWorksheets;
};

const difficultyColors: Record<string, string> = {
    facil: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    intermediario: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    dificil: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

const difficultyLabels: Record<string, string> = {
    facil: 'Fácil',
    intermediario: 'Intermediário',
    dificil: 'Difícil',
};

const formatDate = (value: string): string => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }
    return new Intl.DateTimeFormat('pt-BR', {
        dateStyle: 'medium',
    }).format(date);
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Listas de exercícios',
        href: worksheetsIndex().url,
    },
];

export default function WorksheetsIndexPage({ worksheets }: WorksheetsIndexProps) {
    const items = worksheets.data;
    const hasItems = items.length > 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Listas de exercícios" />

            <div className="flex h-full flex-col gap-6 p-4 sm:p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold tracking-tight">
                        Listas de exercícios
                    </h1>
                    <Button asChild size="sm">
                        <Link href={worksheetsCreate()} prefetch>
                            Nova lista
                        </Link>
                    </Button>
                </div>

                {hasItems ? (
                    <>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {items.map((ws) => (
                                <Link
                                    key={ws.id}
                                    href={worksheetsShow(ws.id)}
                                    className="group flex flex-col gap-3 rounded-xl border bg-card p-5 shadow-xs transition hover:-translate-y-0.5 hover:shadow-md"
                                    prefetch
                                >
                                    <div className="flex flex-col gap-1">
                                        <h3 className="line-clamp-1 text-sm font-semibold">
                                            {ws.topic}
                                        </h3>
                                        <p className="line-clamp-1 text-xs text-muted-foreground">
                                            {ws.discipline}
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Badge
                                            variant="outline"
                                            className={difficultyColors[ws.difficulty] ?? ''}
                                        >
                                            {difficultyLabels[ws.difficulty] ?? ws.difficulty}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">
                                            {ws.question_count} questões
                                        </span>
                                    </div>
                                    <span className="mt-auto text-xs text-muted-foreground">
                                        {formatDate(ws.created_at)}
                                    </span>
                                </Link>
                            ))}
                        </div>

                        {worksheets.last_page > 1 && (
                            <div className="flex items-center justify-center gap-2">
                                {worksheets.prev_page_url && (
                                    <Button asChild variant="outline" size="sm">
                                        <Link href={worksheets.prev_page_url} prefetch>
                                            Anterior
                                        </Link>
                                    </Button>
                                )}
                                <span className="text-sm text-muted-foreground">
                                    Página {worksheets.current_page} de {worksheets.last_page}
                                </span>
                                {worksheets.next_page_url && (
                                    <Button asChild variant="outline" size="sm">
                                        <Link href={worksheets.next_page_url} prefetch>
                                            Próxima
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed bg-card p-10 text-center">
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
                                Criar primeira lista
                            </Link>
                        </Button>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
