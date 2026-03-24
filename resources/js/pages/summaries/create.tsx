import { store as summariesStore } from '@/actions/App/Http/Controllers/SummaryController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import {
    create as summariesCreate,
    index as summariesIndex,
    detectPages as summariesDetectPages,
} from '@/routes/summaries';
import { type BreadcrumbItem } from '@/types';
import { Form, Head } from '@inertiajs/react';
import {
    Brain,
    ChevronDown,
    FileText,
    Loader2,
    SlidersHorizontal,
} from 'lucide-react';
import { type ChangeEvent, useCallback, useRef, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Resumos',
        href: summariesIndex().url,
    },
    {
        title: 'Novo resumo',
        href: summariesCreate().url,
    },
];

const sectionCardClassName =
    'rounded-xl border border-border/70 bg-card/90 p-4 shadow-xs transition-colors duration-150 hover:border-border md:p-5';

const maxNotesLength = 1000;

export default function SummariesCreatePage() {
    const [title, setTitle] = useState('');
    const [discipline, setDiscipline] = useState('');
    const [topic, setTopic] = useState('');
    const [notes, setNotes] = useState('');
    const [pageRangeStart, setPageRangeStart] = useState('');
    const [pageRangeEnd, setPageRangeEnd] = useState('');
    const [pageCount, setPageCount] = useState<number | null>(null);
    const [isPdf, setIsPdf] = useState(false);
    const [isDetecting, setIsDetecting] = useState(false);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [pageRangeError, setPageRangeError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const requiresRange = isPdf && pageCount !== null && pageCount > 30;

    const validatePageRange = useCallback(
        (start: string, end: string, total: number | null) => {
            const startNum = Number(start);
            const endNum = Number(end);

            if (start && end) {
                if (endNum - startNum + 1 > 30) {
                    return 'O intervalo não pode exceder 30 páginas.';
                }

                if (total !== null && endNum > total) {
                    return `A página final não pode ser maior que ${total}.`;
                }
            }

            if (total !== null && total > 30 && (!start || !end)) {
                return `Este PDF tem ${total} páginas. Informe um intervalo de até 30 páginas.`;
            }

            return '';
        },
        [],
    );

    const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        setPageCount(null);
        setPageRangeStart('');
        setPageRangeEnd('');
        setPageRangeError('');

        if (!file) {
            setIsPdf(false);
            return;
        }

        const extension = file.name.split('.').pop()?.toLowerCase();
        const fileIsPdf = extension === 'pdf';
        setIsPdf(fileIsPdf);

        if (!fileIsPdf) {
            return;
        }

        setIsDetecting(true);

        try {
            const formData = new FormData();
            formData.append('source_document', file);

            const response = await fetch(summariesDetectPages.url(), {
                method: 'POST',
                body: formData,
                headers: {
                    Accept: 'application/json',
                    'X-XSRF-TOKEN':
                        document.cookie
                            .split('; ')
                            .find((row) => row.startsWith('XSRF-TOKEN='))
                            ?.split('=')[1]
                            ?.replace(/%3D/g, '=') ?? '',
                },
            });

            if (response.ok) {
                const data = await response.json();
                const detected = data.page_count as number | null;
                setPageCount(detected);

                if (detected !== null && detected > 30) {
                    setPageRangeError(
                        `Este PDF tem ${detected} páginas. Informe um intervalo de até 30 páginas.`,
                    );
                }
            }
        } catch {
            // Silently fail - user can still submit
        } finally {
            setIsDetecting(false);
        }
    };

    const handlePageRangeStartChange = (
        event: ChangeEvent<HTMLInputElement>,
    ) => {
        const value = event.target.value;
        setPageRangeStart(value);
        setPageRangeError(validatePageRange(value, pageRangeEnd, pageCount));
    };

    const handlePageRangeEndChange = (
        event: ChangeEvent<HTMLInputElement>,
    ) => {
        const value = event.target.value;
        setPageRangeEnd(value);
        setPageRangeError(validatePageRange(pageRangeStart, value, pageCount));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Novo resumo de estudo" />

            <div className="flex h-full flex-col gap-6 p-4 pb-24">
                <Card className="border-border/70 bg-card/90">
                    <CardHeader className="gap-3 border-b border-border/60 pb-5">
                        <CardTitle className="text-balance text-xl">
                            Novo resumo de estudo
                        </CardTitle>
                        <CardDescription className="max-w-3xl text-sm leading-relaxed">
                            Envie um documento e gere um resumo estruturado e
                            didático. Para PDFs grandes, selecione o intervalo
                            de páginas que deseja resumir.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="pt-6">
                        <Form
                            {...summariesStore.form()}
                            options={{
                                preserveScroll: true,
                                preserveState: true,
                            }}
                            encType="multipart/form-data"
                            disableWhileProcessing
                        >
                            {({ processing, errors }) => (
                                <div className="flex flex-col gap-5">
                                    {/* 1. Document upload */}
                                    <section className={sectionCardClassName}>
                                        <div className="mb-4 flex items-start gap-3">
                                            <div className="mt-0.5 rounded-md bg-primary/10 p-2 text-primary">
                                                <FileText className="size-4" />
                                            </div>
                                            <div className="space-y-1">
                                                <h2 className="text-sm font-semibold">
                                                    1. Documento de referência
                                                </h2>
                                                <p className="text-sm text-muted-foreground">
                                                    Envie o arquivo que deseja
                                                    resumir.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="rounded-lg border border-dashed border-border/70 bg-muted/30 p-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="source_document">
                                                    Arquivo (PDF, DOCX ou TXT)
                                                </Label>
                                                <Input
                                                    ref={fileInputRef}
                                                    id="source_document"
                                                    name="source_document"
                                                    type="file"
                                                    accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                                                    required
                                                    onChange={handleFileChange}
                                                    className="bg-background"
                                                />
                                                <p className="text-xs text-muted-foreground">
                                                    Máximo 10 MB. PDFs
                                                    escaneados não são
                                                    suportados nesta versão.
                                                </p>
                                                <InputError
                                                    message={
                                                        errors.source_document
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </section>

                                    {/* 2. Page range (PDF only) */}
                                    {isPdf && (
                                        <section
                                            className={cn(
                                                sectionCardClassName,
                                                'animate-in fade-in-0 slide-in-from-top-1 duration-200',
                                            )}
                                        >
                                            <div className="mb-4 flex items-start gap-3">
                                                <div className="mt-0.5 rounded-md bg-primary/10 p-2 text-primary">
                                                    <Brain className="size-4" />
                                                </div>
                                                <div className="space-y-1">
                                                    <h2 className="text-sm font-semibold">
                                                        2. Intervalo de páginas
                                                    </h2>
                                                    <p className="text-sm text-muted-foreground">
                                                        {isDetecting ? (
                                                            <span className="flex items-center gap-2">
                                                                <Loader2 className="size-3 animate-spin" />
                                                                Detectando
                                                                número de
                                                                páginas...
                                                            </span>
                                                        ) : pageCount !==
                                                          null ? (
                                                            `Este PDF tem ${pageCount} páginas.`
                                                        ) : (
                                                            'Defina quais páginas deseja resumir.'
                                                        )}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="grid gap-4 md:grid-cols-2">
                                                <div className="grid gap-2">
                                                    <Label htmlFor="page_range_start">
                                                        Página inicial
                                                    </Label>
                                                    <Input
                                                        id="page_range_start"
                                                        name="page_range_start"
                                                        type="number"
                                                        min={1}
                                                        max={pageCount ?? undefined}
                                                        value={pageRangeStart}
                                                        onChange={
                                                            handlePageRangeStartChange
                                                        }
                                                        placeholder="Ex: 1"
                                                        required={requiresRange}
                                                    />
                                                    <InputError
                                                        message={
                                                            errors.page_range_start
                                                        }
                                                    />
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="page_range_end">
                                                        Página final
                                                    </Label>
                                                    <Input
                                                        id="page_range_end"
                                                        name="page_range_end"
                                                        type="number"
                                                        min={1}
                                                        max={pageCount ?? undefined}
                                                        value={pageRangeEnd}
                                                        onChange={
                                                            handlePageRangeEndChange
                                                        }
                                                        placeholder="Ex: 30"
                                                        required={requiresRange}
                                                    />
                                                    <InputError
                                                        message={
                                                            errors.page_range_end
                                                        }
                                                    />
                                                </div>
                                            </div>

                                            {pageRangeError && (
                                                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                                                    {pageRangeError}
                                                </p>
                                            )}

                                            <p className="mt-3 text-xs text-muted-foreground">
                                                Deixe em branco para resumir o
                                                documento inteiro (até 30
                                                páginas). Para PDFs maiores,
                                                selecione um intervalo de até 30
                                                páginas.
                                            </p>
                                        </section>
                                    )}

                                    {/* 3. Optional fields */}
                                    <Collapsible
                                        open={isDetailsOpen}
                                        onOpenChange={setIsDetailsOpen}
                                    >
                                        <section className={sectionCardClassName}>
                                            <CollapsibleTrigger className="flex w-full items-center justify-between">
                                                <div className="flex items-start gap-3">
                                                    <div className="mt-0.5 rounded-md bg-primary/10 p-2 text-primary">
                                                        <SlidersHorizontal className="size-4" />
                                                    </div>
                                                    <div className="space-y-1 text-left">
                                                        <h2 className="text-sm font-semibold">
                                                            {isPdf ? '3' : '2'}
                                                            . Configurações
                                                            opcionais
                                                        </h2>
                                                        <p className="text-sm text-muted-foreground">
                                                            Título, disciplina,
                                                            tópico e
                                                            observações.
                                                        </p>
                                                    </div>
                                                </div>
                                                <ChevronDown
                                                    className={cn(
                                                        'size-4 text-muted-foreground transition-transform duration-200',
                                                        isDetailsOpen &&
                                                            'rotate-180',
                                                    )}
                                                />
                                            </CollapsibleTrigger>

                                            <CollapsibleContent className="mt-4">
                                                <div className="grid gap-4 md:grid-cols-2">
                                                    <div className="grid gap-2 md:col-span-2">
                                                        <Label htmlFor="title">
                                                            Título do resumo
                                                        </Label>
                                                        <Input
                                                            id="title"
                                                            name="title"
                                                            value={title}
                                                            onChange={(e) =>
                                                                setTitle(
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder="Gerado automaticamente se deixado em branco"
                                                            maxLength={255}
                                                        />
                                                        <InputError
                                                            message={
                                                                errors.title
                                                            }
                                                        />
                                                    </div>
                                                    <div className="grid gap-2">
                                                        <Label htmlFor="discipline">
                                                            Disciplina
                                                        </Label>
                                                        <Input
                                                            id="discipline"
                                                            name="discipline"
                                                            value={discipline}
                                                            onChange={(e) =>
                                                                setDiscipline(
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder="Inferida do documento"
                                                            maxLength={255}
                                                        />
                                                        <InputError
                                                            message={
                                                                errors.discipline
                                                            }
                                                        />
                                                    </div>
                                                    <div className="grid gap-2">
                                                        <Label htmlFor="topic">
                                                            Tópico
                                                        </Label>
                                                        <Input
                                                            id="topic"
                                                            name="topic"
                                                            value={topic}
                                                            onChange={(e) =>
                                                                setTopic(
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder="Inferido do documento"
                                                            maxLength={255}
                                                        />
                                                        <InputError
                                                            message={
                                                                errors.topic
                                                            }
                                                        />
                                                    </div>
                                                    <div className="grid gap-2 md:col-span-2">
                                                        <Label htmlFor="notes">
                                                            Observações
                                                        </Label>
                                                        <textarea
                                                            id="notes"
                                                            name="notes"
                                                            value={notes}
                                                            onChange={(e) =>
                                                                setNotes(
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder="Ex: Focar nos conceitos do capítulo 3..."
                                                            maxLength={
                                                                maxNotesLength
                                                            }
                                                            rows={3}
                                                            className="border-input placeholder:text-muted-foreground flex w-full rounded-md border bg-background px-3 py-2 text-sm shadow-xs transition-[color,box-shadow,border-color] duration-150 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50"
                                                        />
                                                        <div className="flex items-center justify-between">
                                                            <InputError
                                                                message={
                                                                    errors.notes
                                                                }
                                                            />
                                                            <span className="text-xs text-muted-foreground">
                                                                {notes.length}/
                                                                {maxNotesLength}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CollapsibleContent>
                                        </section>
                                    </Collapsible>

                                    {/* Submit */}
                                    <div className="flex justify-end">
                                        <Button
                                            type="submit"
                                            disabled={
                                                processing ||
                                                isDetecting ||
                                                (requiresRange &&
                                                    (!pageRangeStart ||
                                                        !pageRangeEnd)) ||
                                                pageRangeError !== ''
                                            }
                                            className="min-w-[160px]"
                                        >
                                            {processing ? (
                                                <span className="flex items-center gap-2">
                                                    <Loader2 className="size-4 animate-spin" />
                                                    Gerando resumo...
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-2">
                                                    <Brain className="size-4" />
                                                    Gerar Resumo
                                                </span>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
