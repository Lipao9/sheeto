import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { home, login } from '@/routes';
import { Head, Link } from '@inertiajs/react';

type SharedWorksheet = {
    id: number;
    education_level: string;
    discipline: string;
    topic: string;
    question_count: number;
    content?: string | null;
    created_at: string;
};

const educationLevelLabels: Record<string, string> = {
    escola: 'Escola',
    faculdade: 'Faculdade',
    'pos-graduacao': 'Pós-graduação',
    mestrado: 'Mestrado',
    doutorado: 'Doutorado',
    outro: 'Outro',
};

const formatCreatedAt = (value: string): string => {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat('pt-BR', {
        dateStyle: 'medium',
    }).format(date);
};

export default function SharedWorksheetPage({
    worksheet,
}: {
    worksheet: SharedWorksheet;
}) {
    const educationLevelLabel =
        educationLevelLabels[worksheet.education_level] ?? worksheet.education_level;

    return (
        <div className="min-h-screen bg-muted/30 px-4 py-8 md:px-6">
            <Head title={`Ficha compartilhada: ${worksheet.topic}`}>
                <meta
                    name="description"
                    content={`Ficha de ${worksheet.discipline} sobre ${worksheet.topic} com ${worksheet.question_count} questões. Gerada com IA no Sheeto.`}
                />
                <meta property="og:title" content={`${worksheet.discipline} - ${worksheet.topic} | Sheeto`} />
                <meta
                    property="og:description"
                    content={`Ficha de estudo com ${worksheet.question_count} questões sobre ${worksheet.topic}. Nível: ${worksheet.education_level}. Criada com IA no Sheeto.`}
                />
                <meta name="twitter:title" content={`${worksheet.discipline} - ${worksheet.topic} | Sheeto`} />
                <meta
                    name="twitter:description"
                    content={`Ficha de estudo com ${worksheet.question_count} questões sobre ${worksheet.topic}. Criada com IA no Sheeto.`}
                />
                <meta name="robots" content="index, follow" />
            </Head>

            <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
                <Card className="border-border/70 bg-card/95">
                    <CardHeader className="gap-3">
                        <CardTitle className="text-xl">
                            {worksheet.discipline} - {worksheet.topic}
                        </CardTitle>
                        <CardDescription>
                            Ficha compartilhada por um professor no Sheeto.
                        </CardDescription>
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                            <Badge variant="secondary">{educationLevelLabel}</Badge>
                            <Badge variant="secondary">
                                {worksheet.question_count} questões
                            </Badge>
                            <Badge variant="secondary">
                                Criada em {formatCreatedAt(worksheet.created_at)}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-6">
                        <div className="rounded-lg border border-border/70 bg-background px-4 py-4">
                            <pre className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                                {worksheet.content ??
                                    'Nenhum conteúdo disponível nesta ficha.'}
                            </pre>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <Button asChild size="sm">
                                <Link href={login()}>Entrar no Sheeto</Link>
                            </Button>
                            <Button asChild size="sm" variant="outline">
                                <Link href={home()}>Conhecer o Sheeto</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
