import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { create as summariesCreate, index as summariesIndex, show as summariesShow } from '@/routes/summaries';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';

type SummaryItem = {
    id: number;
    title: string;
    discipline: string;
    topic: string;
    source_file_name?: string | null;
    created_at: string;
};

type PaginatedSummaries = {
    data: SummaryItem[];
    current_page: number;
    last_page: number;
    next_page_url: string | null;
    prev_page_url: string | null;
};

type SummariesIndexProps = {
    summaries: PaginatedSummaries;
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
        title: 'Resumos',
        href: summariesIndex().url,
    },
];

export default function SummariesIndexPage({ summaries }: SummariesIndexProps) {
    const items = summaries.data;
    const hasItems = items.length > 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Resumos" />

            <div className="flex h-full flex-col gap-6 p-4 sm:p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold tracking-tight">
                        Resumos
                    </h1>
                    <Button asChild size="sm">
                        <Link href={summariesCreate()} prefetch>
                            Novo resumo
                        </Link>
                    </Button>
                </div>

                {hasItems ? (
                    <>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {items.map((s) => (
                                <Link
                                    key={s.id}
                                    href={summariesShow(s.id)}
                                    className="group flex flex-col gap-3 rounded-xl border bg-card p-5 shadow-xs transition hover:-translate-y-0.5 hover:shadow-md"
                                    prefetch
                                >
                                    <div className="flex flex-col gap-1">
                                        <h3 className="line-clamp-1 text-sm font-semibold">
                                            {s.title}
                                        </h3>
                                        <p className="line-clamp-1 text-xs text-muted-foreground">
                                            {s.discipline} - {s.topic}
                                        </p>
                                    </div>
                                    {s.source_file_name && (
                                        <span className="line-clamp-1 text-xs text-muted-foreground">
                                            {s.source_file_name}
                                        </span>
                                    )}
                                    <span className="mt-auto text-xs text-muted-foreground">
                                        {formatDate(s.created_at)}
                                    </span>
                                </Link>
                            ))}
                        </div>

                        {summaries.last_page > 1 && (
                            <div className="flex items-center justify-center gap-2">
                                {summaries.prev_page_url && (
                                    <Button asChild variant="outline" size="sm">
                                        <Link href={summaries.prev_page_url} prefetch>
                                            Anterior
                                        </Link>
                                    </Button>
                                )}
                                <span className="text-sm text-muted-foreground">
                                    Página {summaries.current_page} de {summaries.last_page}
                                </span>
                                {summaries.next_page_url && (
                                    <Button asChild variant="outline" size="sm">
                                        <Link href={summaries.next_page_url} prefetch>
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
                                Nenhum resumo ainda
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Crie seu primeiro resumo de estudo com IA.
                            </p>
                        </div>
                        <Button asChild size="sm">
                            <Link href={summariesCreate()} prefetch>
                                Criar primeiro resumo
                            </Link>
                        </Button>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
