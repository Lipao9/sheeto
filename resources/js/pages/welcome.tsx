import { login, register } from '@/routes';
import { index as worksheetsIndex } from '@/routes/worksheets';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    BookOpen,
    Brain,
    CheckCircle2,
    ClipboardList,
    FileText,
    Sparkles,
    Target,
    Zap,
} from 'lucide-react';
import { type CSSProperties } from 'react';

const features = [
    {
        icon: ClipboardList,
        title: 'Listas de exercícios',
        description:
            'Gere listas personalizadas com IA. Escolha disciplina, tema, dificuldade e tipo de questão.',
        color: 'var(--sheeto-accent)',
    },
    {
        icon: Brain,
        title: 'Resumos inteligentes',
        description:
            'Transforme conteúdos longos em resumos claros e objetivos para revisão rápida.',
        color: 'var(--sheeto-accent-2)',
        soon: true,
    },
    {
        icon: Target,
        title: 'Simulados personalizados',
        description:
            'Monte simulados sob medida para se preparar para provas e vestibulares.',
        color: 'var(--sheeto-accent-3)',
        soon: true,
    },
    {
        icon: FileText,
        title: 'Flashcards',
        description:
            'Crie cartões de memorização para fixar conceitos e fórmulas importantes.',
        color: 'var(--sheeto-accent)',
        soon: true,
    },
];

const steps = [
    {
        number: '01',
        title: 'Escolha a ferramenta',
        description:
            'Selecione entre listas de exercícios, resumos, simulados ou flashcards.',
    },
    {
        number: '02',
        title: 'Descreva o conteúdo',
        description:
            'Informe disciplina, tema, nível de dificuldade e o que precisa praticar.',
    },
    {
        number: '03',
        title: 'Receba e pratique',
        description:
            'A IA gera o material em segundos. Revise, pratique e acompanhe seu progresso.',
    },
];

const benefits = [
    'Material personalizado para o seu nível',
    'Gabaritos com explicações detalhadas',
    'Histórico salvo para revisitar quando quiser',
    'Funciona para qualquer disciplina e nível escolar',
];

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth } = usePage<SharedData>().props;
    const isAuthenticated = Boolean(auth.user);
    const themeStyles = {
        '--sheeto-canvas': '#F6F1EA',
        '--sheeto-ink': '#1D1B17',
        '--sheeto-card': '#FFF8F1',
        '--sheeto-accent': '#E46D3A',
        '--sheeto-accent-2': '#1F9C8C',
        '--sheeto-accent-3': '#F0B36E',
        '--sheeto-grid': 'rgba(29,27,23,0.08)',
        '--sheeto-glow': 'rgba(228,109,58,0.22)',
        '--sheeto-glow-2': 'rgba(31,156,140,0.2)',
        '--sheeto-shadow': 'rgba(29,27,23,0.08)',
        fontFamily: '"Space Grotesk", sans-serif',
    } as CSSProperties;

    return (
        <div
            className="relative min-h-screen overflow-hidden bg-[var(--sheeto-canvas)] text-[var(--sheeto-ink)]"
            style={themeStyles}
        >
            <Head title="Sua plataforma de estudos com IA">
                <meta
                    name="description"
                    content="Sheeto usa inteligência artificial para gerar listas de exercícios, resumos e materiais de estudo personalizados. Estude de forma mais inteligente, não mais difícil."
                />
                <meta property="og:title" content="Sheeto — Sua plataforma de estudos com IA" />
                <meta
                    property="og:description"
                    content="Gere listas de exercícios, resumos e materiais de estudo personalizados com IA. Funciona para qualquer disciplina e nível escolar."
                />
                <meta name="twitter:title" content="Sheeto — Sua plataforma de estudos com IA" />
                <meta
                    name="twitter:description"
                    content="Gere listas de exercícios, resumos e materiais de estudo personalizados com IA. Funciona para qualquer disciplina e nível escolar."
                />
                <meta
                    name="keywords"
                    content="estudos com IA, listas de exercícios, resumos inteligentes, simulados, flashcards, plataforma de estudos, estudo personalizado"
                />
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=space-grotesk:400,500,600,700|fraunces:600,700"
                    rel="stylesheet"
                />
                <script type="application/ld+json">
                    {JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'WebApplication',
                        name: 'Sheeto',
                        description:
                            'Plataforma de estudos com inteligência artificial que gera listas de exercícios, resumos e materiais personalizados.',
                        applicationCategory: 'EducationalApplication',
                        operatingSystem: 'Web',
                        offers: {
                            '@type': 'Offer',
                            price: '0',
                            priceCurrency: 'BRL',
                        },
                        inLanguage: 'pt-BR',
                    })}
                </script>
            </Head>

            {/* Background decorations */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute -top-40 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,var(--sheeto-glow)_0%,transparent_65%)] blur-3xl" />
                <div className="absolute top-32 left-[-10rem] h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(circle,var(--sheeto-glow-2)_0%,transparent_70%)] blur-3xl" />
                <div className="absolute right-[-6rem] bottom-[-8rem] h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(circle,var(--sheeto-accent-3)_0%,transparent_65%)] opacity-60 blur-3xl" />
                <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.92)_0%,rgba(255,255,255,0.15)_45%,rgba(255,255,255,0.88)_100%)]" />
                <div className="absolute inset-0 [background-image:linear-gradient(90deg,var(--sheeto-grid)_1px,transparent_1px),linear-gradient(0deg,var(--sheeto-grid)_1px,transparent_1px)] [background-size:32px_32px] opacity-30" />
            </div>

            {/* Header */}
            <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6 md:px-10">
                <div className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--sheeto-ink)] text-sm font-bold tracking-[0.2em] text-[var(--sheeto-canvas)] uppercase">
                        Sh
                    </span>
                    <span className="text-lg font-semibold tracking-tight text-[var(--sheeto-ink)]">
                        Sheeto
                    </span>
                </div>

                <nav className="flex items-center gap-3">
                    {isAuthenticated ? (
                        <Link
                            href={worksheetsIndex()}
                            className="rounded-full bg-[var(--sheeto-ink)] px-5 py-2.5 text-sm font-semibold text-[var(--sheeto-canvas)] shadow-[0_12px_30px_-18px_var(--sheeto-shadow)] transition hover:-translate-y-0.5"
                        >
                            Ir para o painel
                        </Link>
                    ) : (
                        <>
                            <Link
                                href={login()}
                                className="hidden rounded-full border border-[color:rgba(29,27,23,0.2)] px-5 py-2.5 text-sm font-semibold text-[var(--sheeto-ink)] transition hover:border-[var(--sheeto-ink)] sm:inline-flex"
                            >
                                Entrar
                            </Link>
                            {canRegister && (
                                <Link
                                    href={register()}
                                    className="rounded-full bg-[var(--sheeto-ink)] px-5 py-2.5 text-sm font-semibold text-[var(--sheeto-canvas)] shadow-[0_12px_30px_-18px_var(--sheeto-shadow)] transition hover:-translate-y-0.5"
                                >
                                    Criar conta grátis
                                </Link>
                            )}
                        </>
                    )}
                </nav>
            </header>

            <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-24 px-6 pt-8 pb-24 md:px-10">
                {/* Hero */}
                <section aria-label="Apresentação" className="flex flex-col items-center gap-8 text-center">
                    <div className="flex items-center gap-2 rounded-full border border-[color:rgba(29,27,23,0.12)] bg-[var(--sheeto-card)] px-4 py-1.5 shadow-[0_8px_20px_-16px_var(--sheeto-shadow)]">
                        <Sparkles className="size-4 text-[var(--sheeto-accent)]" />
                        <span className="text-xs font-semibold tracking-[0.2em] text-[var(--sheeto-accent)] uppercase">
                            Plataforma de estudos com IA
                        </span>
                    </div>

                    <h1
                        className="max-w-3xl text-4xl leading-[1.15] font-semibold text-[var(--sheeto-ink)] md:text-6xl"
                        style={{ fontFamily: '"Fraunces", serif' }}
                    >
                        Estude de forma mais{' '}
                        <span className="relative inline-block">
                            <span className="relative z-10">inteligente</span>
                            <span className="absolute bottom-1 left-0 -z-0 h-3 w-full bg-[var(--sheeto-accent)]/20 md:bottom-2 md:h-4" />
                        </span>
                        , não mais difícil.
                    </h1>

                    <p className="max-w-2xl text-lg text-[color:rgba(29,27,23,0.65)] md:text-xl">
                        O Sheeto usa inteligência artificial para gerar listas
                        de exercícios, resumos e materiais de estudo
                        personalizados para o seu nível. Tudo em poucos cliques.
                    </p>

                    <div className="flex flex-col gap-3 sm:flex-row">
                        {isAuthenticated ? (
                            <Link
                                href={worksheetsIndex()}
                                className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--sheeto-accent)] px-8 py-3.5 text-sm font-semibold text-white shadow-[0_16px_30px_-12px_var(--sheeto-accent)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_40px_-12px_var(--sheeto-accent)]"
                            >
                                <Zap className="size-4" />
                                Acessar o painel
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={register()}
                                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--sheeto-accent)] px-8 py-3.5 text-sm font-semibold text-white shadow-[0_16px_30px_-12px_var(--sheeto-accent)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_40px_-12px_var(--sheeto-accent)]"
                                >
                                    <Zap className="size-4" />
                                    Começar agora — é grátis
                                </Link>
                                <Link
                                    href={login()}
                                    className="inline-flex items-center justify-center rounded-full border border-[color:rgba(29,27,23,0.2)] px-8 py-3.5 text-sm font-semibold text-[var(--sheeto-ink)] transition hover:border-[var(--sheeto-ink)]"
                                >
                                    Já tenho conta
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Hero preview card */}
                    <div className="mt-4 w-full max-w-3xl">
                        <div className="rounded-[28px] border border-[color:rgba(29,27,23,0.14)] bg-[var(--sheeto-card)] p-6 shadow-[0_32px_60px_-30px_var(--sheeto-shadow)] md:p-8">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex size-10 items-center justify-center rounded-2xl bg-[var(--sheeto-accent)]/10">
                                        <ClipboardList className="size-5 text-[var(--sheeto-accent)]" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-[var(--sheeto-ink)]">
                                            Lista de exercícios
                                        </p>
                                        <p className="text-xs text-[color:rgba(29,27,23,0.55)]">
                                            Gerada com IA em segundos
                                        </p>
                                    </div>
                                </div>
                                <span className="rounded-full bg-[var(--sheeto-accent-2)]/10 px-3 py-1 text-xs font-semibold text-[var(--sheeto-accent-2)]">
                                    Matemática • 9º ano
                                </span>
                            </div>
                            <div className="mt-5 grid gap-3 md:grid-cols-3">
                                <div className="rounded-2xl border border-[color:rgba(29,27,23,0.1)] bg-white/60 p-4">
                                    <p className="text-xs tracking-[0.2em] text-[color:rgba(29,27,23,0.5)] uppercase">
                                        Questões
                                    </p>
                                    <p className="mt-1.5 text-2xl font-semibold text-[var(--sheeto-ink)]">
                                        10
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-[color:rgba(29,27,23,0.1)] bg-white/60 p-4">
                                    <p className="text-xs tracking-[0.2em] text-[color:rgba(29,27,23,0.5)] uppercase">
                                        Dificuldade
                                    </p>
                                    <p className="mt-1.5 text-2xl font-semibold text-[var(--sheeto-accent)]">
                                        Médio
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-[color:rgba(29,27,23,0.1)] bg-white/60 p-4">
                                    <p className="text-xs tracking-[0.2em] text-[color:rgba(29,27,23,0.5)] uppercase">
                                        Tempo
                                    </p>
                                    <p className="mt-1.5 text-2xl font-semibold text-[var(--sheeto-accent-2)]">
                                        ~3 min
                                    </p>
                                </div>
                            </div>
                            <div className="mt-4 space-y-2">
                                {[
                                    'Resolva a equação 2x + 5 = 15.',
                                    'Calcule a área de um triângulo com base 8cm e altura 5cm.',
                                    'Simplifique a expressão 3(2x - 4) + 2(x + 1).',
                                ].map((q, i) => (
                                    <div
                                        key={i}
                                        className="flex items-start gap-3 rounded-xl border border-[color:rgba(29,27,23,0.08)] bg-white/40 px-4 py-3"
                                    >
                                        <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-[var(--sheeto-ink)] text-xs font-semibold text-[var(--sheeto-canvas)]">
                                            {i + 1}
                                        </span>
                                        <p className="text-sm text-[color:rgba(29,27,23,0.75)]">
                                            {q}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features */}
                <section aria-label="Ferramentas" className="flex flex-col gap-10">
                    <div className="flex flex-col items-center gap-3 text-center">
                        <p className="text-xs font-semibold tracking-[0.3em] text-[var(--sheeto-accent)] uppercase">
                            Ferramentas
                        </p>
                        <h2
                            className="max-w-xl text-3xl font-semibold text-[var(--sheeto-ink)] md:text-4xl"
                            style={{ fontFamily: '"Fraunces", serif' }}
                        >
                            Tudo que você precisa para estudar melhor.
                        </h2>
                    </div>
                    <div className="grid gap-5 md:grid-cols-2">
                        {features.map((feature) => (
                            <div
                                key={feature.title}
                                className="group relative flex flex-col gap-4 rounded-3xl border border-[color:rgba(29,27,23,0.1)] bg-[var(--sheeto-card)] p-6 shadow-[0_16px_35px_-26px_var(--sheeto-shadow)] transition hover:-translate-y-1 hover:shadow-[0_24px_50px_-24px_var(--sheeto-shadow)] md:p-8"
                            >
                                {feature.soon && (
                                    <span className="absolute top-6 right-6 rounded-full bg-[var(--sheeto-accent-3)]/15 px-3 py-1 text-xs font-semibold text-[var(--sheeto-accent-3)]">
                                        Em breve
                                    </span>
                                )}
                                <div
                                    className="flex size-12 items-center justify-center rounded-2xl"
                                    style={{
                                        backgroundColor: `color-mix(in srgb, ${feature.color} 12%, transparent)`,
                                    }}
                                >
                                    <feature.icon
                                        className="size-6"
                                        style={{ color: feature.color }}
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <h3 className="text-lg font-semibold text-[var(--sheeto-ink)]">
                                        {feature.title}
                                    </h3>
                                    <p className="text-sm leading-relaxed text-[color:rgba(29,27,23,0.65)]">
                                        {feature.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* How it works */}
                <section aria-label="Como funciona" className="flex flex-col gap-10">
                    <div className="flex flex-col items-center gap-3 text-center">
                        <p className="text-xs font-semibold tracking-[0.3em] text-[var(--sheeto-accent-2)] uppercase">
                            Como funciona
                        </p>
                        <h2
                            className="max-w-xl text-3xl font-semibold text-[var(--sheeto-ink)] md:text-4xl"
                            style={{ fontFamily: '"Fraunces", serif' }}
                        >
                            Simples, rápido e feito para o seu ritmo.
                        </h2>
                    </div>
                    <div className="grid gap-6 lg:grid-cols-3">
                        {steps.map((step) => (
                            <div
                                key={step.number}
                                className="relative flex flex-col gap-4 rounded-3xl border border-[color:rgba(29,27,23,0.1)] bg-[var(--sheeto-card)] p-6 shadow-[0_16px_35px_-26px_var(--sheeto-shadow)] transition hover:-translate-y-1 md:p-8"
                            >
                                <span
                                    className="text-5xl font-bold text-[var(--sheeto-accent)]/15"
                                    style={{ fontFamily: '"Fraunces", serif' }}
                                >
                                    {step.number}
                                </span>
                                <h3 className="text-lg font-semibold text-[var(--sheeto-ink)]">
                                    {step.title}
                                </h3>
                                <p className="text-sm leading-relaxed text-[color:rgba(29,27,23,0.65)]">
                                    {step.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Benefits */}
                <section aria-label="Benefícios" className="flex flex-col items-center gap-8 text-center">
                    <div className="flex flex-col items-center gap-3">
                        <p className="text-xs font-semibold tracking-[0.3em] text-[var(--sheeto-accent-3)] uppercase">
                            Por que o Sheeto
                        </p>
                        <h2
                            className="max-w-xl text-3xl font-semibold text-[var(--sheeto-ink)] md:text-4xl"
                            style={{ fontFamily: '"Fraunces", serif' }}
                        >
                            Feito por estudantes, para estudantes.
                        </h2>
                        <p className="max-w-lg text-base text-[color:rgba(29,27,23,0.6)]">
                            Sabemos como é difícil encontrar material de
                            qualidade. O Sheeto resolve isso com IA.
                        </p>
                    </div>
                    <div className="grid w-full max-w-lg gap-4 text-left">
                        {benefits.map((benefit) => (
                            <div
                                key={benefit}
                                className="flex items-center gap-4 rounded-2xl border border-[color:rgba(29,27,23,0.1)] bg-[var(--sheeto-card)] px-5 py-4 shadow-[0_8px_20px_-16px_var(--sheeto-shadow)]"
                            >
                                <CheckCircle2 className="size-5 shrink-0 text-[var(--sheeto-accent-2)]" />
                                <span className="text-sm font-medium text-[var(--sheeto-ink)]">
                                    {benefit}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CTA */}
                <section aria-label="Chamada para ação" className="flex flex-col items-center gap-8 rounded-[36px] border border-[color:rgba(29,27,23,0.14)] bg-[var(--sheeto-ink)] px-6 py-14 text-center text-[var(--sheeto-canvas)] shadow-[0_32px_60px_-30px_var(--sheeto-shadow)] md:px-12">
                    <div className="flex flex-col items-center gap-4">
                        <BookOpen className="size-10 text-[var(--sheeto-accent-3)]" />
                        <h2
                            className="max-w-lg text-3xl font-semibold md:text-4xl"
                            style={{ fontFamily: '"Fraunces", serif' }}
                        >
                            Pronto para estudar de verdade?
                        </h2>
                        <p className="max-w-md text-sm text-[color:rgba(246,241,234,0.7)]">
                            Crie sua conta e comece a gerar materiais de estudo
                            personalizados em minutos. Sem complicação.
                        </p>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row">
                        {isAuthenticated ? (
                            <Link
                                href={worksheetsIndex()}
                                className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--sheeto-accent-3)] px-8 py-3.5 text-sm font-semibold text-[var(--sheeto-ink)] transition hover:-translate-y-0.5"
                            >
                                <Zap className="size-4" />
                                Acessar o painel
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={register()}
                                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--sheeto-accent-3)] px-8 py-3.5 text-sm font-semibold text-[var(--sheeto-ink)] transition hover:-translate-y-0.5"
                                >
                                    <Zap className="size-4" />
                                    Criar conta gratuita
                                </Link>
                                <Link
                                    href={login()}
                                    className="inline-flex items-center justify-center rounded-full border border-[color:rgba(246,241,234,0.3)] px-8 py-3.5 text-sm font-semibold text-[var(--sheeto-canvas)] transition hover:border-[var(--sheeto-canvas)]"
                                >
                                    Entrar
                                </Link>
                            </>
                        )}
                    </div>
                </section>

                {/* Footer */}
                <footer className="flex flex-col items-center gap-2 text-center">
                    <div className="flex items-center gap-2">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--sheeto-ink)] text-[10px] font-bold tracking-[0.15em] text-[var(--sheeto-canvas)] uppercase">
                            Sh
                        </span>
                        <span className="text-sm font-semibold text-[var(--sheeto-ink)]">
                            Sheeto
                        </span>
                    </div>
                    <p className="text-xs text-[color:rgba(29,27,23,0.45)]">
                        Plataforma de estudos com inteligência artificial.
                    </p>
                </footer>
            </main>
        </div>
    );
}
