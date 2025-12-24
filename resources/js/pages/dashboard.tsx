import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { index as worksheetsIndex } from '@/routes/worksheets';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Home',
        href: dashboard().url,
    },
];

export default function Dashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Home" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                <div className="max-w-3xl space-y-4">
                    <p className="text-sm font-semibold uppercase tracking-wide text-primary">
                        Bem-vindo(a)
                    </p>
                    <h1 className="text-3xl font-bold leading-tight text-foreground">
                        Crie fichas de estudo personalizadas em segundos.
                    </h1>
                    <p className="max-w-2xl text-base text-muted-foreground">
                        Informe nível, disciplina, tópico, quantidade de questões e objetivos.
                        A ficha gerada pela IA fica salva no seu histórico para você acessar
                        depois.
                    </p>
                    <div className="flex items-center gap-3">
                        <Button asChild size="lg">
                            <Link href={worksheetsIndex()}>
                                Criar nova ficha
                            </Link>
                        </Button>
                        <Link
                            href={worksheetsIndex()}
                            className="text-sm font-medium text-primary underline underline-offset-4"
                        >
                            Ver histórico de fichas
                        </Link>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
