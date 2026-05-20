import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import { create as summariesCreate, index as summariesIndex, show as summariesShow } from '@/routes/summaries';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';

type SummaryItem = {
    id: number;
    title: string;
    discipline: string;
    topic: string;
    source_file_name?: string | null;
    status?: string;
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

export default function SummariesIndexPage({ summaries }: SummariesIndexProps) {
    const { locale } = usePage<SharedData>().props;
    const { t } = useTranslation();
    const items = summaries.data;
    const hasItems = items.length > 0;
    const dateLocale = locale === 'pt_BR' ? 'pt-BR' : 'en-US';

    const formatDate = (value: string): string => {
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return value;
        }
        return new Intl.DateTimeFormat(dateLocale, {
            dateStyle: 'medium',
        }).format(date);
    };

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('Summaries'),
            href: summariesIndex().url,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('Summaries')} />

            <div className="flex h-full flex-col gap-6 p-4 sm:p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold tracking-tight">
                        {t('Summaries')}
                    </h1>
                    <Button asChild size="sm">
                        <Link href={summariesCreate()} prefetch>
                            {t('New summary')}
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
                                    <div className="mt-auto flex items-center justify-between">
                                        <span className="text-xs text-muted-foreground">
                                            {formatDate(s.created_at)}
                                        </span>
                                        {s.status === 'processing' && (
                                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                                {t('Generating...')}
                                            </span>
                                        )}
                                        {s.status === 'failed' && (
                                            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                                {t('Error')}
                                            </span>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {summaries.last_page > 1 && (
                            <div className="flex items-center justify-center gap-2">
                                {summaries.prev_page_url && (
                                    <Button asChild variant="outline" size="sm">
                                        <Link href={summaries.prev_page_url} prefetch>
                                            {t('Previous')}
                                        </Link>
                                    </Button>
                                )}
                                <span className="text-sm text-muted-foreground">
                                    {t('Page :current of :last', {
                                        current: summaries.current_page,
                                        last: summaries.last_page,
                                    })}
                                </span>
                                {summaries.next_page_url && (
                                    <Button asChild variant="outline" size="sm">
                                        <Link href={summaries.next_page_url} prefetch>
                                            {t('Next')}
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
                                {t('No summaries yet')}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {t('Create your first AI-powered study summary.')}
                            </p>
                        </div>
                        <Button asChild size="sm">
                            <Link href={summariesCreate()} prefetch>
                                {t('Create first summary')}
                            </Link>
                        </Button>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
