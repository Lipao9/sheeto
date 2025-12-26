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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { create as worksheetsCreate, index as worksheetsIndex } from '@/routes/worksheets';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Form, Head, usePage } from '@inertiajs/react';
import { type ChangeEvent, useState } from 'react';

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
    'border-input placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 md:text-sm';

type EducationLevel =
    | 'escola'
    | 'faculdade'
    | 'pos-graduacao'
    | 'mestrado'
    | 'doutorado'
    | 'outro';

type AnswerStyle = 'simples' | 'explicacao';

type ExerciseType =
    | 'multipla_escolha'
    | 'discursivo'
    | 'verdadeiro_falso'
    | 'problemas_praticos';

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

export default function WorksheetsCreatePage() {
    const { lastWorksheet } = usePage<WorksheetsCreateProps>().props;
    const [educationLevel, setEducationLevel] = useState<EducationLevel>(
        lastWorksheet?.education_level ?? 'escola',
    );
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
    const [discipline, setDiscipline] = useState('');
    const [topic, setTopic] = useState('');
    const [notes, setNotes] = useState('');

    const showGradeYear = educationLevel === 'escola';
    const showSemesterPeriod =
        educationLevel === 'faculdade' || educationLevel === 'pos-graduacao';
    const questionCountValue = Number(questionCount);
    const defaultAnswerStyle = lastWorksheet?.answer_style ?? 'simples';

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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nova ficha de estudo" />

            <div className="flex h-full flex-col gap-6 overflow-x-auto p-4">
                <Card className="h-fit">
                    <CardHeader className="gap-2">
                        <CardTitle>Nova ficha de estudo</CardTitle>
                        <CardDescription className="text-sm">
                            Leva menos de 1 minuto. Informe o contexto e deixe a
                            IA montar as questões.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <Form
                            {...worksheetsStore.form()}
                            options={{
                                preserveScroll: true,
                                preserveState: true,
                            }}
                            disableWhileProcessing
                            className="grid gap-6"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <fieldset className="grid gap-4">
                                        <div className="grid gap-1">
                                            <p className="text-sm font-medium">
                                                Contexto do estudo
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Ajuste o nível, disciplina e
                                                tema para perguntas mais
                                                alinhadas.
                                            </p>
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
                                                <p className="text-xs text-muted-foreground">
                                                    Isso ajusta linguagem e
                                                    profundidade das questões.
                                                </p>
                                                <InputError
                                                    message={
                                                        errors.education_level
                                                    }
                                                />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="goal">
                                                    Objetivo
                                                </Label>
                                                <select
                                                    id="goal"
                                                    name="goal"
                                                    defaultValue="prova"
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
                                                <p className="text-xs text-muted-foreground">
                                                    Direcione o tipo de
                                                    treinamento da ficha.
                                                </p>
                                                <InputError
                                                    message={errors.goal}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="grid gap-2">
                                                <Label htmlFor="discipline">
                                                    Disciplina
                                                </Label>
                                                <Input
                                                    id="discipline"
                                                    name="discipline"
                                                    placeholder="Ex.: Matemática"
                                                    value={discipline}
                                                    onChange={(event) =>
                                                        setDiscipline(
                                                            event.target.value,
                                                        )
                                                    }
                                                    required
                                                    autoComplete="off"
                                                />
                                                <p className="text-xs text-muted-foreground">
                                                    Ex.: História, Biologia,
                                                    Química.
                                                </p>
                                                <InputError
                                                    message={errors.discipline}
                                                />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="topic">
                                                    Tópico
                                                </Label>
                                                <Input
                                                    id="topic"
                                                    name="topic"
                                                    placeholder="Ex.: Funções exponenciais"
                                                    value={topic}
                                                    onChange={(event) =>
                                                        setTopic(
                                                            event.target.value,
                                                        )
                                                    }
                                                    required
                                                    autoComplete="off"
                                                />
                                                <p className="text-xs text-muted-foreground">
                                                    Seja específico para gerar
                                                    perguntas melhores.
                                                </p>
                                                <InputError
                                                    message={errors.topic}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid gap-4 md:grid-cols-2">
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
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                        placeholder="Ex.: 2º ano do ensino médio"
                                                        required
                                                    />
                                                    <p className="text-xs text-muted-foreground">
                                                        Ajuda a calibrar o
                                                        nível de complexidade.
                                                    </p>
                                                    <InputError
                                                        message={
                                                            errors.grade_year
                                                        }
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
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                        placeholder="Ex.: 3º semestre"
                                                        required
                                                    />
                                                    <p className="text-xs text-muted-foreground">
                                                        Ajuda a ajustar o
                                                        conteúdo ao período.
                                                    </p>
                                                    <InputError
                                                        message={
                                                            errors.semester_period
                                                        }
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </fieldset>

                                    <Separator />

                                    <fieldset className="grid gap-4">
                                        <div className="grid gap-1">
                                            <p className="text-sm font-medium">
                                                Formato da ficha
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Defina dificuldade, quantidade
                                                e o tipo de gabarito.
                                            </p>
                                        </div>

                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="grid gap-2">
                                                <Label htmlFor="difficulty">
                                                    Dificuldade
                                                </Label>
                                                <select
                                                    id="difficulty"
                                                    name="difficulty"
                                                    defaultValue="intermediario"
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
                                                <p className="text-xs text-muted-foreground">
                                                    Combine com o objetivo da
                                                    ficha.
                                                </p>
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
                                                />
                                                <div className="flex flex-wrap items-center gap-2">
                                                    {questionCountPresets.map(
                                                        (count) => (
                                                            <Button
                                                                key={count}
                                                                type="button"
                                                                size="sm"
                                                                variant={
                                                                    questionCountValue ===
                                                                    count
                                                                        ? 'secondary'
                                                                        : 'outline'
                                                                }
                                                                onClick={() =>
                                                                    setQuestionCount(
                                                                        String(
                                                                            count,
                                                                        ),
                                                                    )
                                                                }
                                                            >
                                                                {count}
                                                            </Button>
                                                        ),
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    Até {maxQuestionCount}{' '}
                                                    questões por ficha.
                                                </p>
                                                <InputError
                                                    message={
                                                        errors.question_count
                                                    }
                                                />
                                            </div>
                                        </div>

                                        <div className="grid gap-2">
                                            <div className="flex items-center justify-between gap-2">
                                                <Label>
                                                    Tipo de exercícios
                                                </Label>
                                                <span className="text-xs text-muted-foreground">
                                                    Selecione ao menos 1.
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="secondary"
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
                                                    variant="outline"
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
                                                    variant="outline"
                                                    onClick={() =>
                                                        handleExercisePreset(
                                                            exerciseTypeOptions.map(
                                                                (option) =>
                                                                    option.value,
                                                            ),
                                                        )
                                                    }
                                                >
                                                    Todos
                                                </Button>
                                            </div>
                                            <div className="grid gap-3 sm:grid-cols-2">
                                                {exerciseTypeOptions.map(
                                                    (option) => (
                                                        <label
                                                            key={option.value}
                                                            className="flex items-start gap-3 rounded-lg border border-input p-3 shadow-xs transition hover:border-foreground/20"
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
                                                                className="peer mt-0.5"
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
                                                message={errors.exercise_types}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="answer_style">
                                                Tipo de gabarito
                                            </Label>
                                            <select
                                                id="answer_style"
                                                name="answer_style"
                                                defaultValue={defaultAnswerStyle}
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
                                            <p className="text-xs text-muted-foreground">
                                                Escolha respostas diretas ou
                                                explicadas.
                                            </p>
                                            <InputError
                                                message={errors.answer_style}
                                            />
                                        </div>
                                    </fieldset>

                                    <Separator />

                                    <fieldset className="grid gap-4">
                                        <div className="grid gap-1">
                                            <p className="text-sm font-medium">
                                                Detalhes extras
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Use observações para ajustar o
                                                tom e o formato.
                                            </p>
                                        </div>

                                        <div className="grid gap-2">
                                            <Label
                                                htmlFor="notes"
                                                className="flex items-center justify-between gap-2"
                                            >
                                                Observações para personalizar a
                                                ficha
                                                <span className="text-xs text-muted-foreground">
                                                    {notes.length}/
                                                    {maxNotesLength}
                                                </span>
                                            </Label>
                                            <textarea
                                                id="notes"
                                                name="notes"
                                                rows={4}
                                                maxLength={maxNotesLength}
                                                className={`${selectClassName} min-h-[120px] resize-none`}
                                                value={notes}
                                                onChange={(event) =>
                                                    setNotes(event.target.value)
                                                }
                                                placeholder="Inclua detalhes sobre avaliação, recursos permitidos ou preferências de formato."
                                            />
                                            <InputError
                                                message={errors.notes}
                                            />
                                        </div>
                                    </fieldset>

                                    <div className="flex flex-wrap items-center gap-3">
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                        >
                                            {processing
                                                ? 'Gerando...'
                                                : 'Gerar ficha'}
                                        </Button>
                                        <p className="text-sm text-muted-foreground">
                                            A ficha será salva no histórico
                                            automaticamente.
                                        </p>
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
