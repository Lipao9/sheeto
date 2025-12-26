import { login, register } from '@/routes';
import { index as worksheetsIndex } from '@/routes/worksheets';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { type CSSProperties } from 'react';

const steps = [
    {
        title: 'Descreva a turma e o objetivo',
        description:
            'Você informa disciplina, tema, dificuldade e o tipo de exercício que quer trabalhar.',
    },
    {
        title: 'A IA monta a ficha completa',
        description:
            'O Sheeto organiza questões, opções e gabarito em um layout pronto para revisar.',
    },
    {
        title: 'Revise e compartilhe',
        description:
            'Ajuste o que quiser, copie, imprima em PDF ou envie direto para o aluno.',
    },
];

const highlights = [
    {
        title: 'Conteúdo sob medida',
        description:
            'Fichas alinhadas ao nível do estudante, com equilíbrio entre teoria e prática.',
    },
    {
        title: 'Controle pedagógico',
        description:
            'Escolha formatos, número de questões e estilo do gabarito em poucos cliques.',
    },
    {
        title: 'Histórico inteligente',
        description:
            'Tudo fica salvo para reaproveitar, duplicar ou ajustar sem retrabalho.',
    },
];

const statItems = [
    {
        label: 'Tempo médio por ficha',
        value: '3 min',
    },
    {
        label: 'Modelos combináveis',
        value: '12+',
    },
    {
        label: 'Tipos de questão',
        value: '4 tipos',
    },
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
            <Head title="Sheeto">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=space-grotesk:400,500,600,700|fraunces:600,700"
                    rel="stylesheet"
                />
            </Head>

            <div className="absolute inset-0 -z-10">
                <div className="absolute -top-32 left-1/2 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,var(--sheeto-glow)_0%,transparent_65%)] blur-3xl" />
                <div className="absolute left-[-8rem] top-24 h-[22rem] w-[22rem] rounded-full bg-[radial-gradient(circle,var(--sheeto-glow-2)_0%,transparent_70%)] blur-3xl" />
                <div className="absolute bottom-[-6rem] right-[-4rem] h-[22rem] w-[22rem] rounded-full bg-[radial-gradient(circle,var(--sheeto-accent-3)_0%,transparent_65%)] blur-3xl" />
                <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.9)_0%,rgba(255,255,255,0.2)_40%,rgba(255,255,255,0.85)_100%)]" />
                <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(90deg,var(--sheeto-grid)_1px,transparent_1px),linear-gradient(0deg,var(--sheeto-grid)_1px,transparent_1px)] [background-size:28px_28px]" />
            </div>

            <div className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 pb-20 pt-8 md:px-10">
                <header className="flex flex-col gap-6">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--sheeto-ink)] text-sm font-bold uppercase tracking-[0.2em] text-[var(--sheeto-canvas)]">
                                Sh
                            </span>
                            <div>
                                <p className="text-xs uppercase tracking-[0.3em] text-[var(--sheeto-accent)]">
                                    Sheeto
                                </p>
                                <p className="text-sm text-[color:rgba(29,27,23,0.7)]">
                                    Fichas inteligentes para professores.
                                </p>
                            </div>
                        </div>

                        <nav className="hidden items-center gap-3 md:flex">
                            {isAuthenticated ? (
                                <Link
                                    href={worksheetsIndex()}
                                    className="rounded-full bg-[var(--sheeto-ink)] px-5 py-2 text-sm font-semibold text-[var(--sheeto-canvas)] shadow-[0_12px_30px_-18px_var(--sheeto-shadow)] transition hover:-translate-y-0.5"
                                >
                                    Acessar fichas
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={login()}
                                        className="rounded-full border border-[color:rgba(29,27,23,0.2)] px-5 py-2 text-sm font-semibold text-[var(--sheeto-ink)] transition hover:border-[var(--sheeto-ink)]"
                                    >
                                        Entrar
                                    </Link>
                                    {canRegister && (
                                        <Link
                                            href={register()}
                                            className="rounded-full bg-[var(--sheeto-ink)] px-5 py-2 text-sm font-semibold text-[var(--sheeto-canvas)] shadow-[0_12px_30px_-18px_var(--sheeto-shadow)] transition hover:-translate-y-0.5"
                                        >
                                            Criar conta
                                        </Link>
                                    )}
                                </>
                            )}
                        </nav>
                    </div>
                </header>

                <main className="flex flex-col gap-16">
                    <section className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
                        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
                            <p className="inline-flex w-fit items-center gap-2 rounded-full bg-[var(--sheeto-card)] px-4 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-[var(--sheeto-accent)] shadow-[0_16px_30px_-20px_var(--sheeto-shadow)]">
                                IA aplicada ao ensino
                            </p>
                            <h1 className="text-4xl font-semibold leading-tight text-[var(--sheeto-ink)] md:text-5xl"
                                style={{ fontFamily: '"Fraunces", serif' }}
                            >
                                O Sheeto transforma instruções simples em fichas de estudo prontas para praticar.
                            </h1>
                            <p className="max-w-xl text-base text-[color:rgba(29,27,23,0.7)] md:text-lg">
                                A plataforma organiza perguntas, gabaritos e níveis de dificuldade para você ganhar
                                tempo sem perder tempo. Tudo com uma estética clara e
                                elegante.
                            </p>
                            <div className="flex flex-col gap-3 sm:flex-row">
                                {isAuthenticated ? (
                                    <Link
                                        href={worksheetsIndex()}
                                        className="inline-flex items-center justify-center rounded-full bg-[var(--sheeto-accent)] px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_30px_-18px_var(--sheeto-accent)] transition hover:-translate-y-0.5"
                                    >
                                        Acessar minhas fichas
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={login()}
                                            className="inline-flex items-center justify-center rounded-full bg-[var(--sheeto-accent)] px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_30px_-18px_var(--sheeto-accent)] transition hover:-translate-y-0.5"
                                        >
                                            Entrar no Sheeto
                                        </Link>
                                        {canRegister && (
                                            <Link
                                                href={register()}
                                                className="inline-flex items-center justify-center rounded-full border border-[color:rgba(29,27,23,0.2)] px-6 py-3 text-sm font-semibold text-[var(--sheeto-ink)] transition hover:border-[var(--sheeto-ink)]"
                                            >
                                                Criar conta gratuita
                                            </Link>
                                        )}
                                    </>
                                )}
                            </div>
                            <div className="grid gap-4 rounded-3xl border border-[color:rgba(29,27,23,0.12)] bg-[var(--sheeto-card)] p-5 text-sm text-[color:rgba(29,27,23,0.75)] shadow-[0_16px_30px_-24px_var(--sheeto-shadow)] md:max-w-lg">
                                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--sheeto-accent-2)]">
                                    O que é o Sheeto
                                </p>
                                <p>
                                    Sheeto é um gerador de fichas de estudo pensado para alunos e professores que
                                    precisam preparar atividades rápidas, mas bem estruturadas. Você define o contexto e
                                    a IA entrega uma ficha alinhada ao seu objetivo.
                                </p>
                            </div>
                        </div>

                        <div className="relative animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
                            <div className="absolute -inset-4 -z-10 rounded-[32px] bg-[radial-gradient(circle,var(--sheeto-glow)_0%,transparent_65%)] blur-2xl" />
                            <div className="rounded-[28px] border border-[color:rgba(29,27,23,0.18)] bg-[var(--sheeto-card)] p-6 shadow-[0_24px_50px_-30px_var(--sheeto-shadow)]">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--sheeto-accent-2)]">
                                        Prévia da ficha
                                    </p>
                                    <span className="rounded-full bg-[color:rgba(29,27,23,0.08)] px-3 py-1 text-xs font-semibold text-[var(--sheeto-ink)]">
                                        História • 8º ano
                                    </span>
                                </div>
                                <div className="mt-5 space-y-3">
                                    <div className="rounded-2xl border border-[color:rgba(29,27,23,0.12)] bg-white/70 p-4">
                                        <p className="text-sm font-semibold text-[var(--sheeto-ink)]">
                                            Tema: Revolução Industrial
                                        </p>
                                        <p className="mt-2 text-sm text-[color:rgba(29,27,23,0.7)]">
                                            10 questões, objetivas e discursivas. Gabarito com explicações.
                                        </p>
                                    </div>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        {statItems.map((item) => (
                                            <div
                                                key={item.label}
                                                className="rounded-2xl border border-[color:rgba(29,27,23,0.12)] bg-white/70 p-4"
                                            >
                                                <p className="text-xs uppercase tracking-[0.22em] text-[color:rgba(29,27,23,0.55)]">
                                                    {item.label}
                                                </p>
                                                <p className="mt-2 text-lg font-semibold text-[var(--sheeto-ink)]">
                                                    {item.value}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="grid gap-6 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
                        <div className="flex flex-col gap-2">
                            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--sheeto-accent)]">
                                Como funciona
                            </p>
                            <h2
                                className="text-3xl font-semibold text-[var(--sheeto-ink)]"
                                style={{ fontFamily: '"Fraunces", serif' }}
                            >
                                Um fluxo simples, pensado para o ritmo da escola.
                            </h2>
                        </div>
                        <div className="grid gap-4 lg:grid-cols-3">
                            {steps.map((step, index) => (
                                <div
                                    key={step.title}
                                    className="flex h-full flex-col gap-3 rounded-3xl border border-[color:rgba(29,27,23,0.12)] bg-[var(--sheeto-card)] p-6 shadow-[0_18px_35px_-26px_var(--sheeto-shadow)] transition hover:-translate-y-1"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--sheeto-accent-2)]">
                                            Passo {index + 1}
                                        </span>
                                        <span className="h-10 w-10 rounded-2xl bg-[var(--sheeto-ink)] text-center text-sm font-semibold leading-10 text-[var(--sheeto-canvas)]">
                                            {index + 1}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-semibold text-[var(--sheeto-ink)]">
                                        {step.title}
                                    </h3>
                                    <p className="text-sm text-[color:rgba(29,27,23,0.7)]">
                                        {step.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="grid gap-6 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
                        <div className="flex flex-col gap-2">
                            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--sheeto-accent-2)]">
                                Identidade Sheeto
                            </p>
                            <h2
                                className="text-3xl font-semibold text-[var(--sheeto-ink)]"
                                style={{ fontFamily: '"Fraunces", serif' }}
                            >
                                Clareza visual, ritmo pedagógico e elegância funcional.
                            </h2>
                        </div>
                        <div className="grid gap-4 md:grid-cols-3">
                            {highlights.map((item) => (
                                <div
                                    key={item.title}
                                    className="rounded-3xl border border-[color:rgba(29,27,23,0.12)] bg-[var(--sheeto-card)] p-6 shadow-[0_18px_35px_-26px_var(--sheeto-shadow)]"
                                >
                                    <h3 className="text-lg font-semibold text-[var(--sheeto-ink)]">
                                        {item.title}
                                    </h3>
                                    <p className="mt-2 text-sm text-[color:rgba(29,27,23,0.7)]">
                                        {item.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="flex flex-col gap-6 rounded-[36px] border border-[color:rgba(29,27,23,0.14)] bg-[var(--sheeto-ink)] px-6 py-10 text-[var(--sheeto-canvas)] shadow-[0_24px_50px_-30px_var(--sheeto-shadow)] animate-in fade-in slide-in-from-bottom-6 duration-700 delay-500 md:px-12">
                        <div className="flex flex-col gap-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--sheeto-accent-3)]">
                                Pronto para começar
                            </p>
                            <h2
                                className="text-3xl font-semibold"
                                style={{ fontFamily: '"Fraunces", serif' }}
                            >
                                Crie fichas gratuitas em minutos.
                            </h2>
                            <p className="max-w-2xl text-sm text-[color:rgba(246,241,234,0.8)]">
                                Entre no Sheeto e mantenha suas listas organizadas por disciplina, com histórico e
                                gabaritos fáceis de compartilhar.
                            </p>
                        </div>
                        <div className="flex flex-col gap-3 sm:flex-row">
                            {isAuthenticated ? (
                                <Link
                                    href={worksheetsIndex()}
                                    className="inline-flex items-center justify-center rounded-full bg-[var(--sheeto-accent-3)] px-6 py-3 text-sm font-semibold text-[var(--sheeto-ink)] transition hover:-translate-y-0.5"
                                >
                                    Acessar listas
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={login()}
                                        className="inline-flex items-center justify-center rounded-full bg-[var(--sheeto-accent-3)] px-6 py-3 text-sm font-semibold text-[var(--sheeto-ink)] transition hover:-translate-y-0.5"
                                    >
                                        Entrar no Sheeto
                                    </Link>
                                    {canRegister && (
                                        <Link
                                            href={register()}
                                            className="inline-flex items-center justify-center rounded-full border border-[color:rgba(246,241,234,0.4)] px-6 py-3 text-sm font-semibold text-[var(--sheeto-canvas)] transition hover:border-[var(--sheeto-canvas)]"
                                        >
                                            Criar conta
                                        </Link>
                                    )}
                                </>
                            )}
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
}
