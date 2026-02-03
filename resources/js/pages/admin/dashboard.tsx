import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { dashboard as adminDashboard } from '@/routes/admin';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

type Metrics = {
    users_total: number;
    users_verified: number;
    users_admins: number;
    users_last_30_days: number;
    worksheets_total: number;
    worksheets_last_7_days: number;
    worksheets_last_30_days: number;
    worksheets_with_content: number;
    worksheets_average_questions: number;
    worksheets_average_per_user: number;
};

type LatestWorksheet = {
    id: number;
    topic: string;
    discipline: string;
    created_at: string;
    user?: {
        name?: string | null;
        email?: string | null;
    } | null;
} | null;

type TopUser = {
    id: number;
    name: string;
    email: string;
    worksheets_count: number;
};

type AdminDashboardProps = {
    metrics: Metrics;
    latestWorksheet: LatestWorksheet;
    topUsers: TopUser[];
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard admin',
        href: adminDashboard().url,
    },
];

const formatNumber = (value: number, digits = 0) =>
    new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
    }).format(value);

export default function AdminDashboard({
    metrics,
    latestWorksheet,
    topUsers,
}: AdminDashboardProps) {
    const metricCards = [
        {
            title: 'Usuários',
            value: formatNumber(metrics.users_total),
            description: 'Total cadastrado',
        },
        {
            title: 'Usuários verificados',
            value: formatNumber(metrics.users_verified),
            description: 'E-mails confirmados',
        },
        {
            title: 'Administradores',
            value: formatNumber(metrics.users_admins),
            description: 'Contas com acesso admin',
        },
        {
            title: 'Novos usuários (30 dias)',
            value: formatNumber(metrics.users_last_30_days),
            description: 'Últimos 30 dias',
        },
        {
            title: 'Fichas criadas',
            value: formatNumber(metrics.worksheets_total),
            description: 'Total de worksheets',
        },
        {
            title: 'Fichas (7 dias)',
            value: formatNumber(metrics.worksheets_last_7_days),
            description: 'Últimos 7 dias',
        },
        {
            title: 'Fichas (30 dias)',
            value: formatNumber(metrics.worksheets_last_30_days),
            description: 'Últimos 30 dias',
        },
        {
            title: 'Fichas com conteúdo',
            value: formatNumber(metrics.worksheets_with_content),
            description: 'Já processadas/geradas',
        },
        {
            title: 'Média de questões',
            value: formatNumber(metrics.worksheets_average_questions, 1),
            description: 'Por ficha',
        },
        {
            title: 'Fichas por usuário',
            value: formatNumber(metrics.worksheets_average_per_user, 2),
            description: 'Média geral',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard admin" />

            <div className="space-y-8 px-6 py-6">
                <div className="space-y-2">
                    <h1 className="text-2xl font-semibold">Visão geral</h1>
                    <p className="text-sm text-muted-foreground">
                        Acompanhe o desempenho da plataforma e o comportamento
                        dos usuários.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
                    {metricCards.map((metric) => (
                        <Card key={metric.title}>
                            <CardHeader className="space-y-1">
                                <CardDescription>{metric.title}</CardDescription>
                                <CardTitle className="text-2xl">
                                    {metric.value}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-xs text-muted-foreground">
                                {metric.description}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Última ficha criada</CardTitle>
                            <CardDescription>
                                Registro mais recente em worksheets
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {latestWorksheet ? (
                                <div className="space-y-2 text-sm">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="font-medium">
                                            {latestWorksheet.topic}
                                        </span>
                                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                                            {latestWorksheet.discipline}
                                        </span>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        Criada em{' '}
                                        {new Date(
                                            latestWorksheet.created_at,
                                        ).toLocaleString('pt-BR')}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {latestWorksheet.user?.name ??
                                            'Usuário não identificado'}{' '}
                                        •{' '}
                                        {latestWorksheet.user?.email ??
                                            'E-mail não disponível'}
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    Nenhuma ficha criada ainda.
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Top usuários</CardTitle>
                            <CardDescription>
                                Contas com maior volume de fichas
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {topUsers.length ? (
                                <div className="space-y-3">
                                    {topUsers.map((user) => (
                                        <div
                                            key={user.id}
                                            className="flex items-center justify-between gap-4 text-sm"
                                        >
                                            <div className="space-y-0.5">
                                                <p className="font-medium">
                                                    {user.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {user.email}
                                                </p>
                                            </div>
                                            <span className="text-sm font-semibold">
                                                {formatNumber(user.worksheets_count)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    Ainda não há usuários com fichas.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
