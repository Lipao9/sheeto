import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { click as summariesShareClick } from '@/routes/summaries/share';
import {
    index as summariesIndex,
    show as summariesShow,
    destroy as summariesDestroy,
    create as summariesCreate,
} from '@/routes/summaries';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePoll } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

type Summary = {
    id: number;
    title: string;
    discipline: string;
    topic: string;
    source_file_name?: string | null;
    page_range_start?: number | null;
    page_range_end?: number | null;
    total_pages?: number | null;
    content?: string | null;
    status: string;
    error_message?: string | null;
    share_url?: string | null;
    share_link_copies_count?: number;
    share_link_visits_count?: number;
    created_at: string;
};

type SummaryShowProps = {
    summary: Summary;
};

const formatCreatedAt = (value: string): string => {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat('pt-BR', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(date);
};

export default function SummaryShowPage({ summary }: SummaryShowProps) {
    const [isShareCopied, setIsShareCopied] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    const isProcessing = summary.status === 'processing';
    const isFailed = summary.status === 'failed';
    const isCompleted = summary.status === 'completed';

    usePoll(3000, {}, { autoStart: isProcessing });

    const canShare = isCompleted && Boolean(summary.share_url);
    const canCopy = isCompleted && Boolean(summary.content);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Resumos',
            href: summariesIndex().url,
        },
        {
            title: summary.title,
            href: summariesShow(summary.id).url,
        },
    ];

    const handleShare = () => {
        if (!summary.share_url) {
            return;
        }

        navigator.clipboard.writeText(summary.share_url).then(() => {
            setIsShareCopied(true);
            setTimeout(() => setIsShareCopied(false), 2500);

            router.post(
                summariesShareClick(summary.id).url,
                {},
                { preserveScroll: true, preserveState: true },
            );
        });
    };

    const handleCopy = () => {
        if (!summary.content) {
            return;
        }

        navigator.clipboard.writeText(summary.content).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2500);
        });
    };

    const handlePrint = () => {
        window.print();
    };

    const handleDelete = () => {
        if (!window.confirm('Deseja remover este resumo?')) {
            return;
        }

        router.delete(summariesDestroy(summary.id).url, {
            preserveScroll: true,
        });
    };

    const handleRetry = () => {
        router.visit(summariesCreate().url);
    };

    const pageRangeLabel =
        summary.page_range_start && summary.page_range_end
            ? `Páginas ${summary.page_range_start}–${summary.page_range_end}`
            : summary.total_pages
              ? `${summary.total_pages} páginas (documento inteiro)`
              : null;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={summary.title} />

            {/* Print-only view */}
            <div className="hidden print:block">
                <div className="mb-4 border-b pb-4">
                    <h1 className="text-xl font-bold">{summary.title}</h1>
                    <p className="text-sm text-gray-600">
                        {summary.discipline} - {summary.topic}
                    </p>
                    {pageRangeLabel && (
                        <p className="text-sm text-gray-500">
                            {pageRangeLabel}
                        </p>
                    )}
                </div>
                <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                    {summary.content}
                </pre>
            </div>

            <div className="no-print flex h-full flex-col gap-4 overflow-x-auto p-4">
                <Card>
                    <CardHeader className="gap-2">
                        <CardTitle>{isProcessing ? 'Gerando resumo...' : summary.title}</CardTitle>
                        <CardDescription className="text-sm">
                            {isProcessing
                                ? 'Seu resumo está sendo gerado. Isso pode levar alguns instantes.'
                                : isFailed
                                  ? 'Houve um erro ao gerar o resumo.'
                                  : 'Revise o resumo gerado e compartilhe.'}
                        </CardDescription>

                        {isCompleted && (
                            <div className="flex flex-col gap-2">
                                <div className="flex flex-wrap gap-2">
                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={handleShare}
                                        disabled={!canShare}
                                    >
                                        {isShareCopied
                                            ? 'Link copiado!'
                                            : 'Copiar link de compartilhamento'}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        size="sm"
                                        onClick={handlePrint}
                                    >
                                        Imprimir / PDF
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        size="sm"
                                        onClick={handleCopy}
                                        disabled={!canCopy}
                                    >
                                        {isCopied ? 'Copiado!' : 'Copiar resumo'}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        onClick={handleDelete}
                                    >
                                        Excluir
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {isShareCopied
                                        ? 'Link pronto para compartilhar.'
                                        : 'Use o link compartilhável para enviar o resumo sem exigir login.'}
                                </p>
                            </div>
                        )}

                        {isFailed && (
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={handleRetry}
                                >
                                    Tentar novamente
                                </Button>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    onClick={handleDelete}
                                >
                                    Excluir
                                </Button>
                            </div>
                        )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {isProcessing && (
                            <div className="flex flex-col items-center justify-center gap-4 py-12">
                                <Loader2 className="size-8 animate-spin text-primary" />
                                <div className="space-y-2 text-center">
                                    <p className="text-sm font-medium text-foreground">
                                        Analisando documento e gerando resumo...
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {summary.source_file_name && (
                                            <span>Arquivo: {summary.source_file_name}</span>
                                        )}
                                    </p>
                                </div>
                                <div className="mt-2 w-full max-w-md space-y-3">
                                    <div className="h-4 animate-pulse rounded bg-muted" />
                                    <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
                                    <div className="h-4 w-4/6 animate-pulse rounded bg-muted" />
                                    <div className="mt-4 h-4 animate-pulse rounded bg-muted" />
                                    <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                                    <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
                                </div>
                            </div>
                        )}

                        {isFailed && (
                            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-6 text-center dark:border-red-900 dark:bg-red-950/30">
                                <p className="text-sm text-red-700 dark:text-red-400">
                                    {summary.error_message ?? 'Não foi possível gerar o resumo. Tente novamente.'}
                                </p>
                            </div>
                        )}

                        {isCompleted && (
                            <>
                                <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2 sm:gap-3">
                                    <div>
                                        <span className="font-medium text-foreground">
                                            Disciplina:
                                        </span>{' '}
                                        {summary.discipline}
                                    </div>
                                    <div>
                                        <span className="font-medium text-foreground">
                                            Tópico:
                                        </span>{' '}
                                        {summary.topic}
                                    </div>
                                    {summary.source_file_name && (
                                        <div>
                                            <span className="font-medium text-foreground">
                                                Arquivo:
                                            </span>{' '}
                                            {summary.source_file_name}
                                        </div>
                                    )}
                                    {pageRangeLabel && (
                                        <div>
                                            <span className="font-medium text-foreground">
                                                Intervalo:
                                            </span>{' '}
                                            {pageRangeLabel}
                                        </div>
                                    )}
                                    <div>
                                        <span className="font-medium text-foreground">
                                            Compartilhamentos:
                                        </span>{' '}
                                        {summary.share_link_copies_count ?? 0}
                                    </div>
                                    <div>
                                        <span className="font-medium text-foreground">
                                            Aberturas do link:
                                        </span>{' '}
                                        {summary.share_link_visits_count ?? 0}
                                    </div>
                                    <div className="sm:col-span-2">
                                        <span className="font-medium text-foreground">
                                            Criado em:
                                        </span>{' '}
                                        {formatCreatedAt(summary.created_at)}
                                    </div>
                                </div>
                                <div className="rounded-lg border bg-muted/60 px-4 py-3 text-sm leading-relaxed text-foreground">
                                    <pre className="whitespace-pre-wrap">
                                        {summary.content ??
                                            'Nenhum conteúdo gerado para este resumo.'}
                                    </pre>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
