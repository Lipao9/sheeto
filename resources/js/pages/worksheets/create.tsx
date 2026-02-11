import { store as worksheetsStore } from '@/actions/App/Http/Controllers/WorksheetController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { create as worksheetsCreate, index as worksheetsIndex } from '@/routes/worksheets';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Form, Head, Link, usePage } from '@inertiajs/react';
import {
    ChevronDown,
    ClipboardList,
    FileText,
    LayoutTemplate,
    SlidersHorizontal,
} from 'lucide-react';
import { type ChangeEvent, useMemo, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Fichas de estudo',
        href: worksheetsIndex().url,
    },
    {
        title: 'Nova ficha',
        href: worksheetsCreate().url,
    },
];

const selectClassName =
    'border-input placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm shadow-xs transition-[color,box-shadow,border-color] duration-150 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 dark:[color-scheme:dark]';

const sectionCardClassName =
    'rounded-xl border border-border/70 bg-card/90 p-4 shadow-xs transition-colors duration-150 hover:border-border md:p-5';

type EducationLevel =
    | 'escola'
    | 'faculdade'
    | 'pos-graduacao'
    | 'mestrado'
    | 'doutorado'
    | 'outro';

type Goal = 'prova' | 'revisao' | 'aprendizado';

type Difficulty = 'iniciante' | 'intermediario' | 'avancado';

type AnswerStyle = 'simples' | 'explicacao';

type ExerciseType =
    | 'multipla_escolha'
    | 'discursivo'
    | 'verdadeiro_falso'
    | 'problemas_praticos';

type CreationMode = 'form' | 'document';

type LastWorksheet = {
    education_level: EducationLevel;
    grade_year: string | null;
    semester_period: string | null;
    question_count: number;
    answer_style: AnswerStyle;
};

type WorksheetsCreateProps = SharedData & {
    lastWorksheet?: LastWorksheet | null;
};

const exerciseTypeOptions: {
    value: ExerciseType;
    label: string;
    description: string;
}[] = [
    {
        value: 'multipla_escolha',
        label: 'Múltipla escolha',
        description: 'Rápido para revisar conceitos e fixar conteúdo.',
    },
    {
        value: 'discursivo',
        label: 'Discursivo',
        description: 'Treina argumentação e aprofundamento do tema.',
    },
    {
        value: 'verdadeiro_falso',
        label: 'Verdadeiro/Falso',
        description: 'Ótimo para validar fatos e definições-chave.',
    },
    {
        value: 'problemas_praticos',
        label: 'Problemas práticos',
        description: 'Aplica o conteúdo em situações reais.',
    },
];

const educationLevelLabels: Record<EducationLevel, string> = {
    escola: 'Escola',
    faculdade: 'Faculdade',
    'pos-graduacao': 'Pós-graduação',
    mestrado: 'Mestrado',
    doutorado: 'Doutorado',
    outro: 'Outro',
};

const goalLabels: Record<Goal, string> = {
    prova: 'Prova',
    revisao: 'Revisão',
    aprendizado: 'Aprendizado',
};

const questionCountPresets = [5, 10, 15, 20];
const minQuestionCount = 1;
const maxQuestionCount = 20;
const maxNotesLength = 1000;

const normalizeQuestionCount = (value?: number | null): string => {
    if (typeof value !== 'number' || Number.isNaN(value)) {
        return '10';
    }

    return String(
        Math.min(maxQuestionCount, Math.max(minQuestionCount, value)),
    );
};

const hasSameValues = (
    current: ExerciseType[],
    target: ExerciseType[],
): boolean => {
    if (current.length !== target.length) {
        return false;
    }

    const currentSet = new Set(current);

    return target.every((value) => currentSet.has(value));
};

export default function WorksheetsCreatePage() {
    const { lastWorksheet } = usePage<WorksheetsCreateProps>().props;
    const [creationMode, setCreationMode] = useState<CreationMode>('form');
    const [educationLevel, setEducationLevel] = useState<EducationLevel>(
        lastWorksheet?.education_level ?? 'escola',
    );
    const [goal, setGoal] = useState<Goal>('prova');
    const [difficulty, setDifficulty] = useState<Difficulty>('intermediario');
    const [gradeYear, setGradeYear] = useState(lastWorksheet?.grade_year ?? '');
    const [semesterPeriod, setSemesterPeriod] = useState(
        lastWorksheet?.semester_period ?? '',
    );
    const [questionCount, setQuestionCount] = useState(
        normalizeQuestionCount(lastWorksheet?.question_count),
    );
    const [exerciseTypes, setExerciseTypes] = useState<ExerciseType[]>([
        'multipla_escolha',
    ]);
    const [answerStyle, setAnswerStyle] = useState<AnswerStyle>(
        lastWorksheet?.answer_style ?? 'simples',
    );
    const [discipline, setDiscipline] = useState('');
    const [topic, setTopic] = useState('');
    const [notes, setNotes] = useState('');
    const [documentFileName, setDocumentFileName] = useState('');
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    const isDocumentMode = creationMode === 'document';
    const showGradeYear = educationLevel === 'escola';
    const showSemesterPeriod =
        educationLevel === 'faculdade' || educationLevel === 'pos-graduacao';
    const questionCountValue = Number(questionCount);

    const selectedExerciseTypesLabel = useMemo(() => {
        if (exerciseTypes.length === 0) {
            return 'Nenhum tipo selecionado';
        }

        const labels = exerciseTypes
            .map(
                (exerciseType) =>
                    exerciseTypeOptions.find((option) => option.value === exerciseType)
                        ?.label ?? exerciseType,
            )
            .join(', ');

        return labels;
    }, [exerciseTypes]);

    const handleEducationLevelChange = (
        event: ChangeEvent<HTMLSelectElement>,
    ) => {
        const nextLevel = event.target.value as EducationLevel;

        setEducationLevel(nextLevel);

        if (nextLevel !== 'escola') {
            setGradeYear('');
        }

        if (nextLevel !== 'faculdade' && nextLevel !== 'pos-graduacao') {
            setSemesterPeriod('');
        }
    };

    const handleQuestionCountChange = (event: ChangeEvent<HTMLInputElement>) => {
        setQuestionCount(event.target.value);
    };

    const handleQuestionCountBlur = () => {
        if (!questionCount) {
            return;
        }

        const numericValue = Number(questionCount);

        if (Number.isNaN(numericValue)) {
            setQuestionCount(String(minQuestionCount));
            return;
        }

        const clamped = Math.min(
            maxQuestionCount,
            Math.max(minQuestionCount, numericValue),
        );

        if (clamped !== numericValue) {
            setQuestionCount(String(clamped));
        }
    };

    const handleExerciseTypeChange = (
        exerciseType: ExerciseType,
        checked: boolean | 'indeterminate',
    ) => {
        setExerciseTypes((currentTypes) => {
            if (checked === true) {
                return currentTypes.includes(exerciseType)
                    ? currentTypes
                    : [...currentTypes, exerciseType];
            }

            return currentTypes.filter((type) => type !== exerciseType);
        });
    };

    const handleExercisePreset = (preset: ExerciseType[]) => {
        setExerciseTypes(preset);
    };

    const applyLastWorksheetConfig = () => {
        if (!lastWorksheet) {
            return;
        }

        setEducationLevel(lastWorksheet.education_level);
        setGradeYear(lastWorksheet.grade_year ?? '');
        setSemesterPeriod(lastWorksheet.semester_period ?? '');
        setQuestionCount(normalizeQuestionCount(lastWorksheet.question_count));
        setAnswerStyle(lastWorksheet.answer_style);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nova ficha de estudo" />

            <div className="flex h-full flex-col gap-6 p-4 pb-24">
                <Card className="border-border/70 bg-card/90">
                    <CardHeader className="gap-3 border-b border-border/60 pb-5">
                        <CardTitle className="text-balance text-xl">
                            Nova ficha de estudo
                        </CardTitle>
                        <CardDescription className="max-w-3xl text-sm leading-relaxed">
                            Organize o contexto, escolha o formato e gere uma lista
                            com mais consistência visual. O modo Documento acelera a
                            preparação quando você já tem material base.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="pt-6">
                        <Form
                            {...worksheetsStore.form()}
                            options={{
                                preserveScroll: true,
                                preserveState: true,
                            }}
                            encType="multipart/form-data"
                            disableWhileProcessing
                        >
                            {({ processing, errors }) => (
                                <>
                                    <input
                                        type="hidden"
                                        name="creation_mode"
                                        value={creationMode}
                                    />

                                    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-start">
                                        <div className="flex flex-col gap-5">
                                            <section className={sectionCardClassName}>
                                                <div className="mb-4 flex items-start gap-3">
                                                    <div className="mt-0.5 rounded-md bg-primary/10 p-2 text-primary">
                                                        <LayoutTemplate className="size-4" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <h2 className="text-sm font-semibold">
                                                            1. Modo de criação
                                                        </h2>
                                                        <p className="text-sm text-muted-foreground">
                                                            Escolha como deseja montar a ficha.
                                                        </p>
                                                    </div>
                                                </div>

                                                <ToggleGroup
                                                    type="single"
                                                    value={creationMode}
                                                    onValueChange={(value) => {
                                                        if (value === 'form' || value === 'document') {
                                                            setCreationMode(value);
                                                        }
                                                    }}
                                                    variant="outline"
                                                    className="w-full rounded-lg border border-border/70 bg-muted/40 p-1"
                                                >
                                                    <ToggleGroupItem
                                                        value="form"
                                                        className="h-9 flex-1 rounded-md text-sm font-medium data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-xs"
                                                    >
                                                        Formulário
                                                    </ToggleGroupItem>
                                                    <ToggleGroupItem
                                                        value="document"
                                                        className="h-9 flex-1 rounded-md text-sm font-medium data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-xs"
                                                    >
                                                        Documento
                                                    </ToggleGroupItem>
                                                </ToggleGroup>
                                            </section>

                                            {isDocumentMode && (
                                                <section
                                                    className={cn(
                                                        sectionCardClassName,
                                                        'animate-in fade-in-0 slide-in-from-top-1 duration-200',
                                                    )}
                                                >
                                                    <div className="mb-4 flex items-start gap-3">
                                                        <div className="mt-0.5 rounded-md bg-primary/10 p-2 text-primary">
                                                            <FileText className="size-4" />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <h2 className="text-sm font-semibold">
                                                                2. Documento de referência
                                                            </h2>
                                                            <p className="text-sm text-muted-foreground">
                                                                Envie um arquivo para extrair contexto
                                                                e acelerar a criação.
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="rounded-lg border border-dashed border-border/70 bg-muted/30 p-4">
                                                        <div className="grid gap-2">
                                                            <Label htmlFor="source_document">
                                                                Arquivo (PDF, DOCX ou TXT)
                                                            </Label>
                                                            <Input
                                                                id="source_document"
                                                                name="source_document"
                                                                type="file"
                                                                accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                                                                required={isDocumentMode}
                                                                onChange={(event) =>
                                                                    setDocumentFileName(
                                                                        event.target.files?.[0]
                                                                            ?.name ??
                                                                            '',
                                                                    )
                                                                }
                                                                className="bg-background"
                                                            />
                                                            <p className="text-xs text-muted-foreground">
                                                                Máximo 10 MB. PDFs escaneados não
                                                                são suportados nesta versão.
                                                            </p>
                                                            <InputError
                                                                message={errors.source_document}
                                                            />
                                                        </div>
                                                    </div>
                                                </section>
                                            )}

                                            <section className={sectionCardClassName}>
                                                <div className="mb-4 flex items-start justify-between gap-3">
                                                    <div className="flex items-start gap-3">
                                                        <div className="mt-0.5 rounded-md bg-primary/10 p-2 text-primary">
                                                            <ClipboardList className="size-4" />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <h2 className="text-sm font-semibold">
                                                                3. Contexto do estudo
                                                            </h2>
                                                            <p className="text-sm text-muted-foreground">
                                                                Ajuste nível, objetivo e tema para
                                                                gerar uma ficha coerente.
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {lastWorksheet && (
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={applyLastWorksheetConfig}
                                                            className="shrink-0"
                                                        >
                                                            Reaproveitar última configuração
                                                        </Button>
                                                    )}
                                                </div>

                                                <div className="grid gap-4 md:grid-cols-2">
                                                    <div className="grid gap-2">
                                                        <Label htmlFor="education_level">
                                                            Nível de ensino
                                                        </Label>
                                                        <select
                                                            id="education_level"
                                                            name="education_level"
                                                            value={educationLevel}
                                                            onChange={
                                                                handleEducationLevelChange
                                                            }
                                                            className={selectClassName}
                                                            required
                                                        >
                                                            <option value="escola">
                                                                Escola
                                                            </option>
                                                            <option value="faculdade">
                                                                Faculdade
                                                            </option>
                                                            <option value="pos-graduacao">
                                                                Pós-graduação
                                                            </option>
                                                            <option value="mestrado">
                                                                Mestrado
                                                            </option>
                                                            <option value="doutorado">
                                                                Doutorado
                                                            </option>
                                                            <option value="outro">
                                                                Outro
                                                            </option>
                                                        </select>
                                                        <InputError
                                                            message={errors.education_level}
                                                        />
                                                    </div>

                                                    <div className="grid gap-2">
                                                        <Label htmlFor="goal">Objetivo</Label>
                                                        <select
                                                            id="goal"
                                                            name="goal"
                                                            value={goal}
                                                            onChange={(event) =>
                                                                setGoal(
                                                                    event.target
                                                                        .value as Goal,
                                                                )
                                                            }
                                                            className={selectClassName}
                                                            required
                                                        >
                                                            <option value="prova">
                                                                Prova
                                                            </option>
                                                            <option value="revisao">
                                                                Revisão
                                                            </option>
                                                            <option value="aprendizado">
                                                                Aprendizado
                                                            </option>
                                                        </select>
                                                        <InputError message={errors.goal} />
                                                    </div>
                                                </div>

                                                <div className="mt-4 grid gap-4 md:grid-cols-2">
                                                    <div className="grid gap-2">
                                                        <Label
                                                            htmlFor="discipline"
                                                            className="flex items-center justify-between gap-2"
                                                        >
                                                            Disciplina
                                                            {isDocumentMode && (
                                                                <span className="text-xs font-normal text-muted-foreground">
                                                                    Opcional
                                                                </span>
                                                            )}
                                                        </Label>
                                                        <Input
                                                            id="discipline"
                                                            name="discipline"
                                                            placeholder="Ex.: Matemática"
                                                            value={discipline}
                                                            onChange={(event) =>
                                                                setDiscipline(
                                                                    event.target
                                                                        .value,
                                                                )
                                                            }
                                                            required={!isDocumentMode}
                                                            autoComplete="off"
                                                            className="bg-background"
                                                        />
                                                        <p className="text-xs text-muted-foreground">
                                                            {isDocumentMode
                                                                ? 'Se não informar, a disciplina será inferida a partir do documento.'
                                                                : 'Use uma disciplina específica para melhorar o resultado.'}
                                                        </p>
                                                        <InputError
                                                            message={errors.discipline}
                                                        />
                                                    </div>

                                                    <div className="grid gap-2">
                                                        <Label
                                                            htmlFor="topic"
                                                            className="flex items-center justify-between gap-2"
                                                        >
                                                            Tópico
                                                            {isDocumentMode && (
                                                                <span className="text-xs font-normal text-muted-foreground">
                                                                    Opcional
                                                                </span>
                                                            )}
                                                        </Label>
                                                        <Input
                                                            id="topic"
                                                            name="topic"
                                                            placeholder="Ex.: Funções exponenciais"
                                                            value={topic}
                                                            onChange={(event) =>
                                                                setTopic(
                                                                    event.target
                                                                        .value,
                                                                )
                                                            }
                                                            required={!isDocumentMode}
                                                            autoComplete="off"
                                                            className="bg-background"
                                                        />
                                                        <p className="text-xs text-muted-foreground">
                                                            {isDocumentMode
                                                                ? 'Se não informar, o tópico será inferido automaticamente.'
                                                                : 'Quanto mais claro o tópico, melhor a qualidade das questões.'}
                                                        </p>
                                                        <InputError
                                                            message={errors.topic}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="mt-4 grid gap-4 md:grid-cols-2">
                                                    {showGradeYear && (
                                                        <div className="grid gap-2">
                                                            <Label htmlFor="grade_year">
                                                                Série ou ano
                                                            </Label>
                                                            <Input
                                                                id="grade_year"
                                                                name="grade_year"
                                                                value={gradeYear}
                                                                onChange={(event) =>
                                                                    setGradeYear(
                                                                        event
                                                                            .target
                                                                            .value,
                                                                    )
                                                                }
                                                                placeholder="Ex.: 2º ano do ensino médio"
                                                                required
                                                                className="bg-background"
                                                            />
                                                            <InputError
                                                                message={errors.grade_year}
                                                            />
                                                        </div>
                                                    )}

                                                    {showSemesterPeriod && (
                                                        <div className="grid gap-2">
                                                            <Label htmlFor="semester_period">
                                                                Semestre ou período
                                                            </Label>
                                                            <Input
                                                                id="semester_period"
                                                                name="semester_period"
                                                                value={semesterPeriod}
                                                                onChange={(event) =>
                                                                    setSemesterPeriod(
                                                                        event
                                                                            .target
                                                                            .value,
                                                                    )
                                                                }
                                                                placeholder="Ex.: 3º semestre"
                                                                required
                                                                className="bg-background"
                                                            />
                                                            <InputError
                                                                message={
                                                                    errors.semester_period
                                                                }
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </section>

                                            <section className={sectionCardClassName}>
                                                <div className="mb-4 flex items-start gap-3">
                                                    <div className="mt-0.5 rounded-md bg-primary/10 p-2 text-primary">
                                                        <SlidersHorizontal className="size-4" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <h2 className="text-sm font-semibold">
                                                            4. Formato da ficha
                                                        </h2>
                                                        <p className="text-sm text-muted-foreground">
                                                            Controle dificuldade, quantidade e tipo
                                                            de exercícios.
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="grid gap-4 md:grid-cols-2">
                                                    <div className="grid gap-2">
                                                        <Label htmlFor="difficulty">
                                                            Dificuldade
                                                        </Label>
                                                        <select
                                                            id="difficulty"
                                                            name="difficulty"
                                                            value={difficulty}
                                                            onChange={(event) =>
                                                                setDifficulty(
                                                                    event.target
                                                                        .value as Difficulty,
                                                                )
                                                            }
                                                            className={selectClassName}
                                                            required
                                                        >
                                                            <option value="iniciante">
                                                                Iniciante
                                                            </option>
                                                            <option value="intermediario">
                                                                Intermediário
                                                            </option>
                                                            <option value="avancado">
                                                                Avançado
                                                            </option>
                                                        </select>
                                                        <InputError
                                                            message={errors.difficulty}
                                                        />
                                                    </div>

                                                    <div className="grid gap-2">
                                                        <Label htmlFor="question_count">
                                                            Quantidade de questões
                                                        </Label>
                                                        <Input
                                                            id="question_count"
                                                            name="question_count"
                                                            type="number"
                                                            min={minQuestionCount}
                                                            max={maxQuestionCount}
                                                            value={questionCount}
                                                            onChange={
                                                                handleQuestionCountChange
                                                            }
                                                            onBlur={
                                                                handleQuestionCountBlur
                                                            }
                                                            required
                                                            className="bg-background"
                                                        />
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            {questionCountPresets.map(
                                                                (count) => (
                                                                    <Button
                                                                        key={
                                                                            count
                                                                        }
                                                                        type="button"
                                                                        size="sm"
                                                                        variant={
                                                                            questionCountValue ===
                                                                            count
                                                                                ? 'default'
                                                                                : 'outline'
                                                                        }
                                                                        onClick={() =>
                                                                            setQuestionCount(
                                                                                String(
                                                                                    count,
                                                                                ),
                                                                            )
                                                                        }
                                                                        className="transition-all duration-150"
                                                                    >
                                                                        {count}
                                                                    </Button>
                                                                ),
                                                            )}
                                                        </div>
                                                        <InputError
                                                            message={
                                                                errors.question_count
                                                            }
                                                        />
                                                    </div>
                                                </div>

                                                <div className="mt-4 grid gap-2">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <Label>
                                                            Tipo de exercícios
                                                        </Label>
                                                        <span className="text-xs text-muted-foreground">
                                                            Selecione ao menos 1
                                                        </span>
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant={
                                                                hasSameValues(
                                                                    exerciseTypes,
                                                                    [
                                                                        'multipla_escolha',
                                                                        'discursivo',
                                                                    ],
                                                                )
                                                                    ? 'default'
                                                                    : 'outline'
                                                            }
                                                            onClick={() =>
                                                                handleExercisePreset([
                                                                    'multipla_escolha',
                                                                    'discursivo',
                                                                ])
                                                            }
                                                        >
                                                            Equilibrado
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant={
                                                                hasSameValues(
                                                                    exerciseTypes,
                                                                    [
                                                                        'multipla_escolha',
                                                                    ],
                                                                )
                                                                    ? 'default'
                                                                    : 'outline'
                                                            }
                                                            onClick={() =>
                                                                handleExercisePreset([
                                                                    'multipla_escolha',
                                                                ])
                                                            }
                                                        >
                                                            Só múltipla escolha
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant={
                                                                hasSameValues(
                                                                    exerciseTypes,
                                                                    exerciseTypeOptions.map(
                                                                        (
                                                                            option,
                                                                        ) =>
                                                                            option.value,
                                                                    ),
                                                                )
                                                                    ? 'default'
                                                                    : 'outline'
                                                            }
                                                            onClick={() =>
                                                                handleExercisePreset(
                                                                    exerciseTypeOptions.map(
                                                                        (
                                                                            option,
                                                                        ) =>
                                                                            option.value,
                                                                    ),
                                                                )
                                                            }
                                                        >
                                                            Todos
                                                        </Button>
                                                    </div>

                                                    <div className="mt-1 grid gap-3 sm:grid-cols-2">
                                                        {exerciseTypeOptions.map(
                                                            (option) => (
                                                                <label
                                                                    key={
                                                                        option.value
                                                                    }
                                                                    className={cn(
                                                                        'flex cursor-pointer items-start gap-3 rounded-lg border p-3 shadow-xs transition-all duration-150',
                                                                        exerciseTypes.includes(
                                                                            option.value,
                                                                        )
                                                                            ? 'border-primary/40 bg-primary/5'
                                                                            : 'border-input bg-background hover:border-foreground/20',
                                                                    )}
                                                                >
                                                                    <Checkbox
                                                                        name="exercise_types[]"
                                                                        value={
                                                                            option.value
                                                                        }
                                                                        checked={exerciseTypes.includes(
                                                                            option.value,
                                                                        )}
                                                                        onCheckedChange={(
                                                                            checked,
                                                                        ) =>
                                                                            handleExerciseTypeChange(
                                                                                option.value,
                                                                                checked,
                                                                            )
                                                                        }
                                                                        className="mt-0.5"
                                                                    />
                                                                    <span className="grid gap-1">
                                                                        <span className="text-sm font-medium text-foreground">
                                                                            {
                                                                                option.label
                                                                            }
                                                                        </span>
                                                                        <span className="text-xs text-muted-foreground">
                                                                            {
                                                                                option.description
                                                                            }
                                                                        </span>
                                                                    </span>
                                                                </label>
                                                            ),
                                                        )}
                                                    </div>
                                                    <InputError
                                                        message={
                                                            errors.exercise_types
                                                        }
                                                    />
                                                </div>

                                                <div className="mt-4 grid gap-2">
                                                    <Label htmlFor="answer_style">
                                                        Tipo de gabarito
                                                    </Label>
                                                    <select
                                                        id="answer_style"
                                                        name="answer_style"
                                                        value={answerStyle}
                                                        onChange={(event) =>
                                                            setAnswerStyle(
                                                                event.target
                                                                    .value as AnswerStyle,
                                                            )
                                                        }
                                                        className={selectClassName}
                                                        required
                                                    >
                                                        <option value="simples">
                                                            Resposta simples
                                                        </option>
                                                        <option value="explicacao">
                                                            Resposta com explicação
                                                        </option>
                                                    </select>
                                                    <InputError
                                                        message={
                                                            errors.answer_style
                                                        }
                                                    />
                                                </div>
                                            </section>

                                            <section className={sectionCardClassName}>
                                                <Collapsible
                                                    open={isDetailsOpen}
                                                    onOpenChange={
                                                        setIsDetailsOpen
                                                    }
                                                >
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="flex items-start gap-3">
                                                            <div className="mt-0.5 rounded-md bg-primary/10 p-2 text-primary">
                                                                <FileText className="size-4" />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <h2 className="text-sm font-semibold">
                                                                    5. Detalhes extras
                                                                </h2>
                                                                <p className="text-sm text-muted-foreground">
                                                                    Opcional: use para orientar tom,
                                                                    critérios e observações.
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <CollapsibleTrigger
                                                            asChild
                                                        >
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                className="shrink-0"
                                                            >
                                                                {isDetailsOpen
                                                                    ? 'Ocultar'
                                                                    : 'Abrir'}
                                                                <ChevronDown
                                                                    className={cn(
                                                                        'size-4 transition-transform duration-150',
                                                                        isDetailsOpen
                                                                            ? 'rotate-180'
                                                                            : 'rotate-0',
                                                                    )}
                                                                />
                                                            </Button>
                                                        </CollapsibleTrigger>
                                                    </div>

                                                    <CollapsibleContent className="mt-4 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-top-1 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-1 duration-200">
                                                        <Separator className="mb-4" />
                                                        <div className="grid gap-2">
                                                            <Label
                                                                htmlFor="notes"
                                                                className="flex items-center justify-between gap-2"
                                                            >
                                                                Observações
                                                                <span className="text-xs text-muted-foreground">
                                                                    {notes.length}/
                                                                    {
                                                                        maxNotesLength
                                                                    }
                                                                </span>
                                                            </Label>
                                                            <textarea
                                                                id="notes"
                                                                name="notes"
                                                                rows={4}
                                                                maxLength={
                                                                    maxNotesLength
                                                                }
                                                                className={`${selectClassName} min-h-[120px] resize-none`}
                                                                value={notes}
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    setNotes(
                                                                        event
                                                                            .target
                                                                            .value,
                                                                    )
                                                                }
                                                                placeholder="Inclua detalhes sobre avaliação, recursos permitidos ou preferências de formato."
                                                            />
                                                            <InputError
                                                                message={errors.notes}
                                                            />
                                                        </div>
                                                    </CollapsibleContent>
                                                </Collapsible>
                                            </section>

                                            <div className="sticky bottom-2 z-20 rounded-xl border border-border/70 bg-background/90 p-3 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/75">
                                                <div className="flex flex-wrap items-center justify-between gap-3">
                                                    <div className="space-y-1">
                                                        <p className="text-sm font-medium">
                                                            {isDocumentMode
                                                                ? 'Modo documento ativo'
                                                                : 'Modo formulário ativo'}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {isDocumentMode
                                                                ? 'A análise do arquivo pode levar alguns segundos.'
                                                                : 'A geração costuma ser concluída rapidamente.'}
                                                        </p>
                                                    </div>

                                                    <Button
                                                        type="submit"
                                                        disabled={processing}
                                                        className="min-w-44"
                                                    >
                                                        {processing
                                                            ? isDocumentMode
                                                                ? 'Analisando documento e gerando ficha...'
                                                                : 'Gerando...'
                                                            : 'Gerar ficha'}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>

                                        <aside className="lg:sticky lg:top-20">
                                            <Card className="border-border/70 bg-muted/30 shadow-sm">
                                                <CardHeader className="pb-4">
                                                    <CardTitle className="text-sm">
                                                        Resumo em tempo real
                                                    </CardTitle>
                                                    <CardDescription>
                                                        Revise os principais pontos antes de gerar.
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent className="grid gap-3 text-sm">
                                                    <div className="rounded-lg border border-border/70 bg-background/80 p-3">
                                                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                                            Modo
                                                        </p>
                                                        <p className="mt-1 font-medium">
                                                            {isDocumentMode
                                                                ? 'Documento'
                                                                : 'Formulário'}
                                                        </p>
                                                        {isDocumentMode && (
                                                            <p className="mt-2 text-xs text-muted-foreground">
                                                                {documentFileName
                                                                    ? `Arquivo: ${documentFileName}`
                                                                    : 'Aguardando arquivo para análise.'}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div className="rounded-lg border border-border/70 bg-background/80 p-3">
                                                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                                            Contexto
                                                        </p>
                                                        <div className="mt-1 grid gap-1 text-sm">
                                                            <p>
                                                                Nível:{' '}
                                                                <span className="font-medium">
                                                                    {
                                                                        educationLevelLabels[
                                                                            educationLevel
                                                                        ]
                                                                    }
                                                                </span>
                                                            </p>
                                                            <p>
                                                                Objetivo:{' '}
                                                                <span className="font-medium">
                                                                    {
                                                                        goalLabels[
                                                                            goal
                                                                        ]
                                                                    }
                                                                </span>
                                                            </p>
                                                            <p>
                                                                Questões:{' '}
                                                                <span className="font-medium">
                                                                    {
                                                                        questionCount
                                                                    }
                                                                </span>
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="rounded-lg border border-border/70 bg-background/80 p-3">
                                                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                                            Formato
                                                        </p>
                                                        <p className="mt-1 text-sm font-medium">
                                                            {
                                                                selectedExerciseTypesLabel
                                                            }
                                                        </p>
                                                        <p className="mt-2 text-xs text-muted-foreground">
                                                            Gabarito: {answerStyle}
                                                        </p>
                                                    </div>

                                                    <div className="grid gap-2 pt-1">
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            asChild
                                                        >
                                                            <Link
                                                                href={
                                                                    worksheetsIndex()
                                                                }
                                                                prefetch
                                                            >
                                                                Ver histórico
                                                            </Link>
                                                        </Button>
                                                        {lastWorksheet && (
                                                            <Button
                                                                type="button"
                                                                variant="secondary"
                                                                size="sm"
                                                                onClick={
                                                                    applyLastWorksheetConfig
                                                                }
                                                            >
                                                                Reusar último padrão
                                                            </Button>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </aside>
                                    </div>
                                </>
                            )}
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
