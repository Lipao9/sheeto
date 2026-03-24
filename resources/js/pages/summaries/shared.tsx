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

type SharedSummary = {
    id: number;
    title: string;
    discipline: string;
    topic: string;
    content?: string | null;
    created_at: string;
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

export default function SharedSummaryPage({
    summary,
}: {
    summary: SharedSummary;
}) {
    return (
        <div className="min-h-screen bg-muted/30 px-4 py-8 md:px-6">
            <Head title={`Resumo compartilhado: ${summary.topic}`}>
                <meta
                    name="description"
                    content={`Resumo de ${summary.discipline} sobre ${summary.topic}. Gerado com IA no Sheeto.`}
                />
                <meta
                    property="og:title"
                    content={`${summary.title} | Sheeto`}
                />
                <meta
                    property="og:description"
                    content={`Resumo de estudo sobre ${summary.topic} em ${summary.discipline}. Criado com IA no Sheeto.`}
                />
                <meta
                    name="twitter:title"
                    content={`${summary.title} | Sheeto`}
                />
                <meta
                    name="twitter:description"
                    content={`Resumo de estudo sobre ${summary.topic}. Criado com IA no Sheeto.`}
                />
                <meta name="robots" content="index, follow" />
            </Head>

            <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
                <Card className="border-border/70 bg-card/95">
                    <CardHeader className="gap-3">
                        <CardTitle className="text-xl">
                            {summary.title}
                        </CardTitle>
                        <CardDescription>
                            Resumo compartilhado por um estudante no Sheeto.
                        </CardDescription>
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                            <Badge variant="secondary">
                                {summary.discipline}
                            </Badge>
                            <Badge variant="secondary">{summary.topic}</Badge>
                            <Badge variant="secondary">
                                Criado em {formatCreatedAt(summary.created_at)}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-6">
                        <div className="rounded-lg border border-border/70 bg-background px-4 py-4">
                            <pre className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                                {summary.content ??
                                    'Nenhum conteúdo disponível neste resumo.'}
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
