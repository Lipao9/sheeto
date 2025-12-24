import WorksheetController from '@/actions/App/Http/Controllers/WorksheetController';
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
import AppLayout from '@/layouts/app-layout';
import { create as worksheetsCreate, index as worksheetsIndex } from '@/routes/worksheets';
import { type BreadcrumbItem } from '@/types';
import { Form, Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';

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
    'border-input placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-10 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50';

type EducationLevel =
    | 'escola'
    | 'faculdade'
    | 'pos-graduacao'
    | 'mestrado'
    | 'doutorado'
    | 'outro';

export default function WorksheetsCreatePage() {
    const [educationLevel, setEducationLevel] = useState<EducationLevel>('escola');
    const [gradeYear, setGradeYear] = useState('');
    const [semesterPeriod, setSemesterPeriod] = useState('');
    const showGradeYear = educationLevel === 'escola';
    const showSemesterPeriod =
        educationLevel === 'faculdade' || educationLevel === 'pos-graduacao';

    useEffect(() => {
        if (!showGradeYear) {
            setGradeYear('');
        }

        if (!showSemesterPeriod) {
            setSemesterPeriod('');
        }
    }, [showGradeYear, showSemesterPeriod]);

    const storeRoute = WorksheetController.store();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nova ficha de estudo" />

            <div className="flex h-full flex-col gap-4 overflow-x-auto p-4">
                <Card className="h-fit">
                    <CardHeader className="gap-2">
                        <CardTitle>Nova ficha de estudo</CardTitle>
                        <CardDescription className="text-sm">
                            Informe o contexto e deixe a IA montar as questões para você.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <Form
                            action={storeRoute.url}
                            method={storeRoute.method}
                            options={{
                                preserveScroll: true,
                            }}
                            className="space-y-4"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="grid gap-2">
                                            <Label htmlFor="education_level">
                                                Nível de ensino
                                            </Label>
                                            <select
                                                id="education_level"
                                                name="education_level"
                                                value={educationLevel}
                                                onChange={(event) =>
                                                    setEducationLevel(
                                                        event.target.value as EducationLevel,
                                                    )
                                                }
                                                className={selectClassName}
                                                required
                                            >
                                                <option value="escola">Escola</option>
                                                <option value="faculdade">Faculdade</option>
                                                <option value="pos-graduacao">
                                                    Pós-graduação
                                                </option>
                                                <option value="mestrado">Mestrado</option>
                                                <option value="doutorado">Doutorado</option>
                                                <option value="outro">Outro</option>
                                            </select>
                                            <InputError message={errors.education_level} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="goal">Objetivo</Label>
                                            <select
                                                id="goal"
                                                name="goal"
                                                defaultValue="prova"
                                                className={selectClassName}
                                                required
                                            >
                                                <option value="prova">Prova</option>
                                                <option value="revisao">Revisão</option>
                                                <option value="aprendizado">Aprendizado</option>
                                            </select>
                                            <InputError message={errors.goal} />
                                        </div>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="grid gap-2">
                                            <Label htmlFor="discipline">Disciplina</Label>
                                            <Input
                                                id="discipline"
                                                name="discipline"
                                                placeholder="Ex.: Matemática"
                                                required
                                                autoComplete="off"
                                            />
                                            <InputError message={errors.discipline} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="topic">Tópico</Label>
                                            <Input
                                                id="topic"
                                                name="topic"
                                                placeholder="Ex.: Funções exponenciais"
                                                required
                                                autoComplete="off"
                                            />
                                            <InputError message={errors.topic} />
                                        </div>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="grid gap-2">
                                            <Label htmlFor="difficulty">Dificuldade</Label>
                                            <select
                                                id="difficulty"
                                                name="difficulty"
                                                defaultValue="intermediario"
                                                className={selectClassName}
                                                required
                                            >
                                                <option value="iniciante">Iniciante</option>
                                                <option value="intermediario">
                                                    Intermediário
                                                </option>
                                                <option value="avancado">Avançado</option>
                                            </select>
                                            <InputError message={errors.difficulty} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="question_count">
                                                Quantidade de questões
                                            </Label>
                                            <Input
                                                id="question_count"
                                                name="question_count"
                                                type="number"
                                                min={1}
                                                max={50}
                                                defaultValue={10}
                                                required
                                            />
                                            <InputError message={errors.question_count} />
                                        </div>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label>Tipo de exercícios</Label>
                                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                                            <label className="flex items-center gap-2 text-sm text-foreground">
                                                <Checkbox
                                                    name="exercise_types[]"
                                                    value="multipla_escolha"
                                                    defaultChecked
                                                />
                                                Múltipla escolha
                                            </label>
                                            <label className="flex items-center gap-2 text-sm text-foreground">
                                                <Checkbox
                                                    name="exercise_types[]"
                                                    value="discursivo"
                                                />
                                                Discursivo
                                            </label>
                                            <label className="flex items-center gap-2 text-sm text-foreground">
                                                <Checkbox
                                                    name="exercise_types[]"
                                                    value="verdadeiro_falso"
                                                />
                                                Verdadeiro/Falso
                                            </label>
                                            <label className="flex items-center gap-2 text-sm text-foreground">
                                                <Checkbox
                                                    name="exercise_types[]"
                                                    value="problemas_praticos"
                                                />
                                                Problemas práticos
                                            </label>
                                        </div>
                                        <InputError message={errors.exercise_types} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="answer_style">Tipo de gabarito</Label>
                                        <select
                                            id="answer_style"
                                            name="answer_style"
                                            defaultValue="simples"
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
                                        <InputError message={errors.answer_style} />
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        {showGradeYear && (
                                            <div className="grid gap-2">
                                                <Label htmlFor="grade_year">Série ou ano</Label>
                                                <Input
                                                    id="grade_year"
                                                    name="grade_year"
                                                    value={gradeYear}
                                                    onChange={(event) =>
                                                        setGradeYear(event.target.value)
                                                    }
                                                    placeholder="Ex.: 2º ano do ensino médio"
                                                    required
                                                />
                                                <InputError message={errors.grade_year} />
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
                                                        setSemesterPeriod(event.target.value)
                                                    }
                                                    placeholder="Ex.: 3º semestre"
                                                    required
                                                />
                                                <InputError message={errors.semester_period} />
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="notes">
                                            Observações para personalizar a ficha
                                        </Label>
                                        <textarea
                                            id="notes"
                                            name="notes"
                                            rows={4}
                                            className={`${selectClassName} resize-none`}
                                            placeholder="Inclua detalhes sobre avaliação, recursos permitidos ou preferências de formato."
                                        />
                                        <InputError message={errors.notes} />
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Button type="submit" disabled={processing}>
                                            {processing ? 'Gerando...' : 'Gerar ficha'}
                                        </Button>
                                        <p className="text-sm text-muted-foreground">
                                            A ficha será salva no histórico automaticamente.
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
