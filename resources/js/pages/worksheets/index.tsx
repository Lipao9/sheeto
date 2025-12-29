import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { create as worksheetsCreate, index as worksheetsIndex } from '@/routes/worksheets';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

type Worksheet = {
    id: number;
    education_level: string;
    discipline: string;
    topic: string;
    difficulty: string;
    goal: string;
    question_count: number;
    exercise_types?: string[] | null;
    answer_style?: string | null;
    grade_year?: string | null;
    semester_period?: string | null;
    notes?: string | null;
    content?: string | null;
    created_at: string;
};

type WorksheetQuestion = {
    number: number;
    type?: string;
    prompt: string;
    options: string[];
    statements: string[];
    details: string[];
};

type WorksheetAnswerKeyItem = {
    number: number;
    answer: string;
    explanation?: string;
};

type WorksheetContent = {
    summary: string[];
    questions: WorksheetQuestion[];
    answerKey: WorksheetAnswerKeyItem[];
};

type WorksheetsPageProps = {
    worksheet?: Worksheet | null;
};

const educationLevelLabels: Record<string, string> = {
    escola: 'Escola',
    faculdade: 'Faculdade',
    'pos-graduacao': 'Pós-graduação',
    mestrado: 'Mestrado',
    doutorado: 'Doutorado',
    outro: 'Outro',
    outros: 'Outro',
};

const exerciseTypeLabels: Record<string, string> = {
    multipla_escolha: 'Múltipla escolha',
    discursivo: 'Discursivo',
    verdadeiro_falso: 'Verdadeiro/Falso',
    problemas_praticos: 'Problemas práticos',
};

const answerStyleLabels: Record<string, string> = {
    simples: 'Resposta simples',
    explicacao: 'Resposta com explicação',
};

const questionTypeLabels: Record<string, string> = {
    multipla_escolha: 'Múltipla escolha',
    verdadeiro_falso: 'Verdadeiro/Falso',
    discursivo: 'Discursivo',
    problemas_praticos: 'Problemas práticos',
};

const normalizeText = (value: string): string =>
    value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();

const normalizeQuestionType = (value?: string | null): string | undefined => {
    if (!value) {
        return undefined;
    }

    const trimmed = value.trim();
    if (!trimmed) {
        return undefined;
    }

    const normalized = normalizeText(trimmed);

    if (normalized.includes('verdadeiro')) {
        return 'verdadeiro_falso';
    }

    if (normalized.includes('multipla')) {
        return 'multipla_escolha';
    }

    if (normalized.includes('discurs')) {
        return 'discursivo';
    }

    if (normalized.includes('problema')) {
        return 'problemas_praticos';
    }

    const slug = normalized
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');

    if (questionTypeLabels[slug]) {
        return slug;
    }

    return trimmed;
};

const inferQuestionType = (
    question: WorksheetQuestion,
    exerciseTypes?: string[] | null,
): string | undefined => {
    const explicitType = normalizeQuestionType(question.type);
    if (explicitType) {
        return explicitType;
    }

    if (question.statements.length > 0) {
        return 'verdadeiro_falso';
    }

    if (question.options.length > 0) {
        return 'multipla_escolha';
    }

    const openEndedTypes = (exerciseTypes ?? []).filter(
        (type) => type === 'discursivo' || type === 'problemas_praticos',
    );

    if (openEndedTypes.length === 1) {
        return openEndedTypes[0];
    }

    if (openEndedTypes.length > 1) {
        const text = normalizeText(
            [question.prompt, ...question.details].filter(Boolean).join(' '),
        );
        const practicalHints = [
            'problema',
            'problemas',
            'situacao',
            'cenario',
            'contexto',
            'dados',
            'tarefa',
            'aplicacao',
            'aplique',
            'resolva',
            'realista',
        ];

        return practicalHints.some((hint) => text.includes(hint))
            ? 'problemas_praticos'
            : 'discursivo';
    }

    if (exerciseTypes?.length === 1) {
        return exerciseTypes[0];
    }

    return undefined;
};

const resolveQuestionTypes = (
    questions: WorksheetQuestion[],
    exerciseTypes?: string[] | null,
): WorksheetQuestion[] =>
    questions.map((question) => ({
        ...question,
        type: inferQuestionType(question, exerciseTypes),
    }));

const parseWorksheetContent = (
    content: string | null | undefined,
    exerciseTypes?: string[] | null,
): WorksheetContent | null => {
    if (!content) {
        return null;
    }

    const trimmed = content.trim();
    if (trimmed.startsWith('{')) {
        try {
            const parsed = JSON.parse(content);

            if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
                return null;
            }

            const summary =
                typeof parsed.summary === 'string'
                    ? parsed.summary
                          .split(/\r?\n/)
                          .map((line: string) => line.trim())
                          .filter(Boolean)
                    : [];
            const questions = Array.isArray(parsed.questions)
                ? parsed.questions.map((question: Record<string, unknown>, index: number) => ({
                      number:
                          typeof question?.number === 'number'
                              ? (question.number as number)
                              : index + 1,
                      type:
                          typeof question?.type === 'string'
                              ? (question.type as string)
                              : undefined,
                      prompt:
                          typeof question?.prompt === 'string'
                              ? (question.prompt as string)
                              : '',
                      options: Array.isArray(question?.options)
                          ? question.options.filter((option) => typeof option === 'string')
                          : [],
                      statements: Array.isArray(question?.statements)
                          ? question.statements.filter(
                                (statement) => typeof statement === 'string',
                            )
                          : [],
                      details: [],
                  }))
                : [];
            const answerKey = Array.isArray(parsed.answer_key)
                ? parsed.answer_key.map((item: Record<string, unknown>, index: number) => ({
                      number:
                          typeof item?.number === 'number'
                              ? (item.number as number)
                              : index + 1,
                      answer:
                          typeof item?.answer === 'string'
                              ? (item.answer as string)
                              : '',
                      explanation:
                          typeof item?.explanation === 'string'
                              ? (item.explanation as string)
                              : undefined,
                  }))
                : [];

            return {
                summary,
                questions: resolveQuestionTypes(questions, exerciseTypes),
                answerKey,
            };
        } catch {
            return null;
        }
    }

    const lines = content.split(/\r?\n/).map((line) => line.trimEnd());
    const normalized = (line: string) => line.trim().toLowerCase();
    const normalizedHeader = (line: string) =>
        normalized(line).replace(/[:\s-–—]+$/, '');
    const summaryHeader = ['resumo'];
    const questionsHeader = ['questoes', 'questões'];
    const answerHeader = ['gabarito', 'resposta', 'respostas'];
    const isHeader = (line: string, targets: string[]) => {
        const header = normalizedHeader(line);

        return targets.some((target) => header.startsWith(target));
    };
    const findHeaderIndex = (targets: string[]) =>
        lines.findIndex((line) => isHeader(line, targets));

    const summaryIndex = findHeaderIndex(summaryHeader);
    const questionsIndex = findHeaderIndex(questionsHeader);
    const answerIndex = findHeaderIndex(answerHeader);

    if (summaryIndex === -1 && questionsIndex === -1 && answerIndex === -1) {
        return null;
    }

    const sectionLines = (start: number, end: number) => {
        if (start === -1) {
            return [];
        }

        const sectionEnd = end === -1 ? lines.length : end;
        return lines.slice(start + 1, sectionEnd).filter((line) => line.trim() !== '');
    };

    const nextIndex = (current: number) =>
        [summaryIndex, questionsIndex, answerIndex]
            .filter((index) => index > current)
            .sort((a, b) => a - b)[0] ?? -1;

    const summaryLines = sectionLines(summaryIndex, nextIndex(summaryIndex)).map((line) =>
        line.replace(/^-+\s*/, '').trim(),
    );
    const questionLines = sectionLines(questionsIndex, nextIndex(questionsIndex));
    const answerLines = sectionLines(answerIndex, nextIndex(answerIndex));

    const questions: WorksheetQuestion[] = [];
    let currentQuestion: WorksheetQuestion | null = null;

    for (const line of questionLines) {
        const trimmedLine = line.trim();
        const questionMatch = trimmedLine.match(/^(\d+)[.)]\s*(?:\(([^)]+)\)\s*)?(.*)$/);

        if (questionMatch) {
            if (currentQuestion) {
                questions.push(currentQuestion);
            }

            currentQuestion = {
                number: Number(questionMatch[1]),
                type: questionMatch[2]?.trim() || undefined,
                prompt: questionMatch[3]?.trim() || '',
                options: [],
                statements: [],
                details: [],
            };
            continue;
        }

        if (!currentQuestion) {
            continue;
        }

        if (/^[a-e]\)\s+/i.test(trimmedLine)) {
            currentQuestion.options.push(trimmedLine);
            continue;
        }

        if (trimmedLine.startsWith('(   )')) {
            currentQuestion.statements.push(trimmedLine);
            continue;
        }

        currentQuestion.details.push(trimmedLine);
    }

    if (currentQuestion) {
        questions.push(currentQuestion);
    }

    const answerKey: WorksheetAnswerKeyItem[] = [];
    let currentAnswer: WorksheetAnswerKeyItem | null = null;

    for (const [index, line] of answerLines.entries()) {
        const trimmedLine = line.trim();
        const match = trimmedLine.match(/^[-*]?\s*(\d+)\s*[.)-:]\s*(.+)$/);

        if (!match) {
            if (currentAnswer) {
                const extra = trimmedLine
                    .replace(/^(explicacao|explicação)\s*:\s*/i, '')
                    .replace(/^[-–—]\s*/, '')
                    .trim();
                if (extra) {
                    currentAnswer.explanation = currentAnswer.explanation
                        ? `${currentAnswer.explanation} ${extra}`
                        : extra;
                }
            }

            continue;
        }

        let answer = match[2].trim();
        let explanation = '';
        const parts = answer.split(/\s[-–—]\s/);

        if (parts.length > 1) {
            answer = parts[0]?.trim() ?? '';
            explanation = parts.slice(1).join(' - ').trim();
        } else {
            const parenthetical = answer.match(/^(.*)\((.+)\)$/);
            if (parenthetical) {
                answer = parenthetical[1]?.trim() ?? '';
                explanation = parenthetical[2]?.trim() ?? '';
            }
        }

        currentAnswer = {
            number: Number(match[1]) || index + 1,
            answer,
            explanation: explanation || undefined,
        };
        answerKey.push(currentAnswer);
    }

    return {
        summary: summaryLines.filter(Boolean),
        questions: resolveQuestionTypes(questions, exerciseTypes),
        answerKey,
    };
};

export default function WorksheetsPage({
    worksheet = null,
}: WorksheetsPageProps) {
    const [isCopied, setIsCopied] = useState(false);
    const educationLevelLabel = worksheet
        ? (educationLevelLabels[worksheet.education_level] ??
              worksheet.education_level)
        : '';
    const exerciseTypesLabel = worksheet?.exercise_types?.length
        ? worksheet.exercise_types
              .map((type) => exerciseTypeLabels[type] ?? type)
              .join(', ')
        : '';
    const answerStyleLabel = worksheet?.answer_style
        ? answerStyleLabels[worksheet.answer_style] ?? worksheet.answer_style
        : '';
    const worksheetContent = parseWorksheetContent(
        worksheet?.content,
        worksheet?.exercise_types,
    );
    const summary = worksheetContent?.summary ?? [];
    const questions = worksheetContent?.questions ?? [];
    const answerKey = worksheetContent?.answerKey ?? [];
    const hasStructuredContent = Boolean(
        worksheetContent && (summary.length || questions.length || answerKey.length),
    );
    const copyText = worksheet?.content ?? '';
    const canCopy = copyText.trim().length > 0;

    const handleCopy = async () => {
        if (!canCopy) {
            return;
        }

        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(copyText);
            } else {
                const textarea = document.createElement('textarea');
                textarea.value = copyText;
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
            }

            setIsCopied(true);
            window.setTimeout(() => setIsCopied(false), 2000);
        } catch {
            setIsCopied(false);
        }
    };

    const handlePrint = () => {
        if (!worksheet) {
            return;
        }

        window.print();
    };

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Fichas de estudo',
            href: worksheetsIndex().url,
        },
    ];

    if (worksheet) {
        breadcrumbs.push({
            title: worksheet.topic,
            href: worksheetsIndex({
                query: { worksheet: worksheet.id },
            }).url,
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={worksheet ? worksheet.topic : 'Fichas de estudo'} />
            <style>{`
                .print-only {
                    display: none;
                }

                @media print {
                    @page {
                        margin: 14mm 16mm;
                    }

                    body {
                        print-color-adjust: exact;
                        -webkit-print-color-adjust: exact;
                        background: white;
                    }

                    header {
                        display: none !important;
                    }

                    [data-slot="sidebar"],
                    [data-slot="sidebar-rail"],
                    [data-slot="sidebar-trigger"],
                    [data-slot="sidebar-header"],
                    [data-slot="sidebar-footer"],
                    [data-slot="sidebar-content"],
                    [data-slot="sidebar-menu"] {
                        display: none !important;
                    }

                    .no-print {
                        display: none !important;
                    }

                    .print-only {
                        display: block !important;
                    }

                    .print-page {
                        color: #0f172a;
                        font-family: "Iowan Old Style", "Palatino Linotype",
                            "Book Antiqua", Palatino, serif;
                        font-size: 11pt;
                        line-height: 1.55;
                        max-width: 180mm;
                        margin: 0 auto;
                    }

                    .print-header {
                        border-bottom: 1px solid #e2e8f0;
                        padding-bottom: 8pt;
                        margin-bottom: 10pt;
                    }

                    .print-title {
                        font-size: 18pt;
                        font-weight: 700;
                    }

                    .print-subtitle {
                        color: #475569;
                        font-size: 11pt;
                        margin-top: 2pt;
                    }

                    .print-meta {
                        display: flex;
                        flex-wrap: wrap;
                        gap: 10pt;
                        margin-top: 6pt;
                        color: #64748b;
                        font-size: 10pt;
                    }

                    .print-section {
                        margin-top: 14pt;
                    }

                    .print-section-title {
                        font-size: 12pt;
                        font-weight: 600;
                        letter-spacing: 0.2pt;
                        text-transform: uppercase;
                        margin-bottom: 8pt;
                    }

                    .print-list {
                        margin-left: 16pt;
                    }

                    .print-question {
                        display: grid;
                        grid-template-columns: 22pt 1fr;
                        column-gap: 8pt;
                        margin-top: 10pt;
                        break-inside: avoid;
                    }

                    .print-question-number {
                        font-weight: 700;
                    }

                    .print-question-text {
                        font-weight: 500;
                    }

                    .print-detail,
                    .print-option,
                    .print-statement {
                        margin-left: 12pt;
                        margin-top: 4pt;
                    }
                }
            `}</style>

            {worksheet && (
                <div className="print-only">
                    <div className="print-page">
                        <div className="print-header">
                            <div className="print-title">
                                Ficha de estudo - {worksheet.topic}
                            </div>
                            <div className="print-subtitle">
                                {worksheet.discipline}
                            </div>
                            <div className="print-meta">
                                {educationLevelLabel && (
                                    <span>{educationLevelLabel}</span>
                                )}
                                {worksheet.grade_year && (
                                    <span>Série/Ano: {worksheet.grade_year}</span>
                                )}
                                <span>{worksheet.question_count} questões</span>
                            </div>
                        </div>

                        {hasStructuredContent ? (
                            <>
                                {questions.length > 0 && (
                                    <section className="print-section">
                                        <div className="print-section-title">
                                            Lista de exercícios
                                        </div>
                                        <div>
                                            {questions.map(
                                                (question, index) => {
                                                    const number =
                                                        question.number ??
                                                        index + 1;

                                                    return (
                                                        <div
                                                            key={`print-question-${number}-${index}`}
                                                            className="print-question"
                                                        >
                                                            <div className="print-question-number">
                                                                {number}.
                                                            </div>
                                                            <div>
                                                                <div className="print-question-text">
                                                                    {question.prompt}
                                                                </div>
                                                                {question.details
                                                                    .length > 0 && (
                                                                    <div>
                                                                        {question.details.map(
                                                                            (
                                                                                detail,
                                                                                detailIndex,
                                                                            ) => (
                                                                                <div
                                                                                    key={`print-detail-${number}-${detailIndex}`}
                                                                                    className="print-detail"
                                                                                >
                                                                                    {detail}
                                                                                </div>
                                                                            ),
                                                                        )}
                                                                    </div>
                                                                )}
                                                                {question.options
                                                                    .length > 0 && (
                                                                    <div>
                                                                        {question.options.map(
                                                                            (
                                                                                option,
                                                                                optionIndex,
                                                                            ) => (
                                                                                <div
                                                                                    key={`print-option-${number}-${optionIndex}`}
                                                                                    className="print-option"
                                                                                >
                                                                                    {option}
                                                                                </div>
                                                                            ),
                                                                        )}
                                                                    </div>
                                                                )}
                                                                {question.statements
                                                                    .length > 0 && (
                                                                    <div>
                                                                        {question.statements.map(
                                                                            (
                                                                                statement,
                                                                                statementIndex,
                                                                            ) => (
                                                                                <div
                                                                                    key={`print-statement-${number}-${statementIndex}`}
                                                                                    className="print-statement"
                                                                                >
                                                                                    {statement}
                                                                                </div>
                                                                            ),
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                },
                                            )}
                                        </div>
                                    </section>
                                )}
                            </>
                        ) : (
                            <pre className="whitespace-pre-wrap text-sm">
                                {worksheet.content ??
                                    'Nenhum conteúdo gerado para esta ficha.'}
                            </pre>
                        )}
                    </div>
                </div>
            )}

            <div className="no-print flex h-full flex-col gap-4 overflow-x-auto p-4">
                <Card>
                    <CardHeader className="gap-2">
                        <CardTitle>
                            {worksheet
                                ? `${worksheet.discipline} - ${worksheet.topic}`
                                : 'Nenhuma ficha selecionada'}
                        </CardTitle>
                        <CardDescription className="text-sm">
                            {worksheet
                                ? 'Revise a ficha gerada e compartilhe com o aluno.'
                                : 'Crie uma nova ficha para visualizar aqui.'}
                        </CardDescription>
                        {worksheet && (
                            <div className="flex flex-wrap gap-2">
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
                                    {isCopied ? 'Copiado!' : 'Copiar lista'}
                                </Button>
                            </div>
                        )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {worksheet ? (
                            <>
                                <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2 sm:gap-3">
                                    <div>
                                        <span className="font-medium text-foreground">
                                            Nível:
                                        </span>{' '}
                                        {educationLevelLabel}
                                    </div>
                                    <div>
                                        <span className="font-medium text-foreground">
                                            Objetivo:
                                        </span>{' '}
                                        {worksheet.goal}
                                    </div>
                                    <div>
                                        <span className="font-medium text-foreground">
                                            Dificuldade:
                                        </span>{' '}
                                        {worksheet.difficulty}
                                    </div>
                                    <div>
                                        <span className="font-medium text-foreground">
                                            Questões:
                                        </span>{' '}
                                        {worksheet.question_count}
                                    </div>
                                    {answerStyleLabel && (
                                        <div>
                                            <span className="font-medium text-foreground">
                                                Gabarito:
                                            </span>{' '}
                                            {answerStyleLabel}
                                        </div>
                                    )}
                                    {exerciseTypesLabel && (
                                        <div className="sm:col-span-2">
                                            <span className="font-medium text-foreground">
                                                Tipos de exercícios:
                                            </span>{' '}
                                            {exerciseTypesLabel}
                                        </div>
                                    )}
                                    {worksheet.grade_year && (
                                        <div>
                                            <span className="font-medium text-foreground">
                                                Série/Ano:
                                            </span>{' '}
                                            {worksheet.grade_year}
                                        </div>
                                    )}
                                    {worksheet.semester_period && (
                                        <div>
                                            <span className="font-medium text-foreground">
                                                Período:
                                            </span>{' '}
                                            {worksheet.semester_period}
                                        </div>
                                    )}
                                    {worksheet.notes && (
                                        <div className="sm:col-span-2">
                                            <span className="font-medium text-foreground">
                                                Observações:
                                            </span>{' '}
                                            {worksheet.notes}
                                        </div>
                                    )}
                                </div>
                                <div className="rounded-lg border bg-muted/60 px-4 py-3 text-sm leading-relaxed text-foreground">
                                    {hasStructuredContent ? (
                                        <div className="flex flex-col gap-6">
                                            {summary.length > 0 && (
                                                <div className="flex flex-col gap-2">
                                                    <div className="text-sm font-semibold text-foreground">
                                                        Resumo
                                                    </div>
                                                    <div className="rounded-md border bg-background px-3 py-2 text-sm text-muted-foreground">
                                                        <ul className="flex list-disc flex-col gap-1 pl-5">
                                                            {summary.map((line, index) => (
                                                                <li key={`summary-${index}`}>
                                                                    {line}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            )}
                                            {questions.length > 0 && (
                                                <div className="flex flex-col gap-3">
                                                    <div className="flex items-center justify-between">
                                                        <div className="text-sm font-semibold text-foreground">
                                                            Questões
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {questions.length}{' '}
                                                            itens
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col gap-3">
                                                        {questions.map(
                                                            (question, index) => {
                                                                const number =
                                                                    question.number ??
                                                                    index + 1;
                                                                const typeLabel =
                                                                    question.type
                                                                        ? questionTypeLabels[
                                                                              question.type
                                                                          ] ??
                                                                          question.type
                                                                        : '';

                                                                return (
                                                                    <div
                                                                        key={`${number}-${index}`}
                                                                        className="flex flex-col gap-2 rounded-lg border bg-background px-4 py-3 text-sm"
                                                                    >
                                                                        <div className="flex flex-wrap items-center gap-2">
                                                                            <span className="font-semibold text-foreground">
                                                                                Questão{' '}
                                                                                {number}
                                                                            </span>
                                                                            {typeLabel && (
                                                                                <Badge
                                                                                    variant="secondary"
                                                                                    className="text-[11px]"
                                                                                >
                                                                                    {typeLabel}
                                                                                </Badge>
                                                                            )}
                                                                        </div>
                                                                        {question.prompt && (
                                                                            <p className="text-foreground">
                                                                                {question.prompt}
                                                                            </p>
                                                                        )}
                                                                        {question.details
                                                                            .length > 0 && (
                                                                            <div className="flex flex-col gap-1 text-muted-foreground">
                                                                                {question.details.map(
                                                                                    (
                                                                                        detail,
                                                                                        detailIndex,
                                                                                    ) => (
                                                                                        <p
                                                                                            key={`${number}-detail-${detailIndex}`}
                                                                                        >
                                                                                            {detail}
                                                                                        </p>
                                                                                    ),
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                        {question.options.length >
                                                                            0 && (
                                                                            <ul className="flex flex-col gap-1 text-muted-foreground">
                                                                                {question.options.map(
                                                                                    (
                                                                                        option,
                                                                                        optionIndex,
                                                                                    ) => (
                                                                                        <li
                                                                                            key={`${number}-option-${optionIndex}`}
                                                                                        >
                                                                                            {option}
                                                                                        </li>
                                                                                    ),
                                                                                )}
                                                                            </ul>
                                                                        )}
                                                                        {question.statements
                                                                            .length > 0 && (
                                                                            <ul className="flex flex-col gap-1 text-muted-foreground">
                                                                                {question.statements.map(
                                                                                    (
                                                                                        statement,
                                                                                        statementIndex,
                                                                                    ) => (
                                                                                        <li
                                                                                            key={`${number}-statement-${statementIndex}`}
                                                                                        >
                                                                                            {statement}
                                                                                        </li>
                                                                                    ),
                                                                                )}
                                                                            </ul>
                                                                        )}
                                                                    </div>
                                                                );
                                                            },
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                            {answerKey.length > 0 && (
                                                <div className="flex flex-col gap-3">
                                                    <div className="text-sm font-semibold text-foreground">
                                                        Gabarito
                                                    </div>
                                                    <div className="grid gap-2 sm:grid-cols-2">
                                                        {answerKey.map(
                                                            (item, index) => {
                                                                const number =
                                                                    item.number ??
                                                                    index + 1;

                                                                return (
                                                                    <div
                                                                        key={`${number}-${index}`}
                                                                        className="flex flex-col gap-1 rounded-md border bg-background px-3 py-2"
                                                                    >
                                                                        <div className="text-xs font-semibold text-muted-foreground">
                                                                            Questão{' '}
                                                                            {number}
                                                                        </div>
                                                                        <div className="text-sm text-foreground">
                                                                            {item.answer ??
                                                                                'Resposta não informada.'}
                                                                        </div>
                                                                        {item.explanation && (
                                                                            <div className="text-xs text-muted-foreground">
                                                                                {
                                                                                    item.explanation
                                                                                }
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                );
                                                            },
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <pre className="whitespace-pre-wrap">
                                            {worksheet.content ??
                                                'Nenhum conteúdo gerado para esta ficha.'}
                                        </pre>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center justify-between rounded-lg border border-dashed px-4 py-3 text-sm text-muted-foreground">
                                <span>Crie uma ficha para visualizá-la aqui.</span>
                                <Button asChild variant="secondary" size="sm">
                                    <Link href={worksheetsCreate()}>
                                        Nova ficha
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
