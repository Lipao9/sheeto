import { login, register } from '@/routes';
import { index as worksheetsIndex } from '@/routes/worksheets';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    BookOpen,
    Brain,
    CheckCircle2,
    ClipboardList,
    Clock,
    FileText,
    GraduationCap,
    Sparkles,
    Target,
    TrendingUp,
    Wand2,
    Zap,
} from 'lucide-react';
import {
    type CSSProperties,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';

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
        icon: Wand2,
    },
    {
        number: '02',
        title: 'Descreva o conteúdo',
        description:
            'Informe disciplina, tema, nível de dificuldade e o que precisa praticar.',
        icon: GraduationCap,
    },
    {
        number: '03',
        title: 'Receba e pratique',
        description:
            'A IA gera o material em segundos. Revise, pratique e acompanhe seu progresso.',
        icon: Sparkles,
    },
];

const benefits = [
    'Material personalizado para o seu nível',
    'Gabaritos com explicações detalhadas',
    'Histórico salvo para revisitar quando quiser',
    'Funciona para qualquer disciplina e nível escolar',
];

const subjects = [
    'Matemática',
    'Português',
    'Física',
    'Química',
    'Biologia',
    'História',
    'Geografia',
    'Filosofia',
    'Sociologia',
    'Inglês',
    'Literatura',
    'Redação',
];

const stats = [
    { value: 10, suffix: 's', label: 'Material gerado em segundos' },
    { value: 100, suffix: '%', label: 'Personalizado ao seu nível' },
    { value: 24, suffix: '/7', label: 'Disponível quando precisar' },
];

const heroWords = ['inteligente', 'eficiente', 'personalizado', 'no seu ritmo'];

function useInView<T extends HTMLElement>(options?: IntersectionObserverInit) {
    const ref = useRef<T | null>(null);
    const [inView, setInView] = useState(false);

    useEffect(() => {
        const node = ref.current;
        if (!node || inView) {
            return;
        }
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setInView(true);
                        observer.disconnect();
                    }
                });
            },
            { threshold: 0.15, rootMargin: '0px 0px -60px 0px', ...options },
        );
        observer.observe(node);
        return () => observer.disconnect();
    }, [inView, options]);

    return { ref, inView } as const;
}

function AnimatedCounter({
    target,
    suffix = '',
    duration = 1400,
}: {
    target: number;
    suffix?: string;
    duration?: number;
}) {
    const { ref, inView } = useInView<HTMLSpanElement>();
    const [value, setValue] = useState(0);

    useEffect(() => {
        if (!inView) {
            return;
        }
        let raf = 0;
        const start = performance.now();
        const tick = (now: number) => {
            const progress = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.round(target * eased));
            if (progress < 1) {
                raf = requestAnimationFrame(tick);
            }
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [inView, target, duration]);

    return (
        <span ref={ref}>
            {value}
            {suffix}
        </span>
    );
}

function Reveal({
    children,
    delay = 0,
    className = '',
}: {
    children: React.ReactNode;
    delay?: number;
    className?: string;
}) {
    const { ref, inView } = useInView<HTMLDivElement>();
    return (
        <div
            ref={ref}
            className={className}
            style={{
                opacity: inView ? 1 : 0,
                transform: inView ? 'translateY(0)' : 'translateY(24px)',
                transition: `opacity 700ms cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform 700ms cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
                willChange: 'opacity, transform',
            }}
        >
            {children}
        </div>
    );
}

function RotatingWord({ words }: { words: string[] }) {
    const [index, setIndex] = useState(0);
    useEffect(() => {
        const id = setInterval(() => {
            setIndex((i) => (i + 1) % words.length);
        }, 2400);
        return () => clearInterval(id);
    }, [words.length]);

    return (
        <span className="relative inline-block align-baseline">
            <span className="invisible whitespace-nowrap" aria-hidden>
                {words.reduce((a, b) => (a.length > b.length ? a : b))}
            </span>
            {words.map((word, i) => (
                <span
                    key={word}
                    className="absolute inset-0 flex items-center justify-start"
                    style={{
                        opacity: i === index ? 1 : 0,
                        transform:
                            i === index ? 'translateY(0)' : 'translateY(12px)',
                        transition: 'opacity 500ms ease, transform 500ms ease',
                    }}
                >
                    <span className="relative">
                        <span className="relative z-10 text-[var(--sheeto-accent)]">
                            {word}
                        </span>
                        <span className="absolute bottom-1 left-0 -z-0 h-3 w-full bg-[var(--sheeto-accent)]/20 md:bottom-2 md:h-4" />
                    </span>
                </span>
            ))}
        </span>
    );
}

function AnimatedQuestions() {
    const questions = useMemo(
        () => [
            'Resolva a equação 2x + 5 = 15.',
            'Calcule a área de um triângulo com base 8cm e altura 5cm.',
            'Simplifique a expressão 3(2x - 4) + 2(x + 1).',
        ],
        [],
    );
    const { ref, inView } = useInView<HTMLDivElement>();

    return (
        <div ref={ref} className="mt-4 space-y-2">
            {questions.map((q, i) => (
                <div
                    key={i}
                    className="flex items-start gap-3 rounded-xl border border-[color:rgba(29,27,23,0.08)] bg-white/40 px-4 py-3"
                    style={{
                        opacity: inView ? 1 : 0,
                        transform: inView
                            ? 'translateX(0)'
                            : 'translateX(-16px)',
                        transition: `opacity 600ms ease ${i * 180 + 200}ms, transform 600ms ease ${i * 180 + 200}ms`,
                    }}
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
    );
}

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
                <meta
                    property="og:title"
                    content="Sheeto — Sua plataforma de estudos com IA"
                />
                <meta
                    property="og:description"
                    content="Gere listas de exercícios, resumos e materiais de estudo personalizados com IA. Funciona para qualquer disciplina e nível escolar."
                />
                <meta
                    name="twitter:title"
                    content="Sheeto — Sua plataforma de estudos com IA"
                />
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

            {/* Keyframes scoped to this page */}
            <style>{`
                @keyframes sheeto-blob {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(20px, -30px) scale(1.05); }
                    66% { transform: translate(-15px, 20px) scale(0.95); }
                }
                @keyframes sheeto-float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-8px); }
                }
                @keyframes sheeto-shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                @keyframes sheeto-marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                @keyframes sheeto-pulse-ring {
                    0% { transform: scale(0.85); opacity: 0.6; }
                    80%, 100% { transform: scale(1.6); opacity: 0; }
                }
                @keyframes sheeto-fade-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .sheeto-blob-1 { animation: sheeto-blob 18s ease-in-out infinite; }
                .sheeto-blob-2 { animation: sheeto-blob 22s ease-in-out infinite reverse; }
                .sheeto-blob-3 { animation: sheeto-blob 26s ease-in-out infinite; }
                .sheeto-float { animation: sheeto-float 5s ease-in-out infinite; }
                .sheeto-marquee { animation: sheeto-marquee 35s linear infinite; }
                .sheeto-fade-up { animation: sheeto-fade-up 800ms cubic-bezier(0.22,1,0.36,1) both; }
                .sheeto-pulse-ring::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    border-radius: 9999px;
                    background: var(--sheeto-accent);
                    opacity: 0.5;
                    animation: sheeto-pulse-ring 2.4s ease-out infinite;
                }
                .sheeto-shimmer {
                    position: relative;
                    overflow: hidden;
                }
                .sheeto-shimmer::after {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent);
                    animation: sheeto-shimmer 2.6s infinite;
                }
                @media (prefers-reduced-motion: reduce) {
                    .sheeto-blob-1, .sheeto-blob-2, .sheeto-blob-3,
                    .sheeto-float, .sheeto-marquee, .sheeto-pulse-ring::before,
                    .sheeto-shimmer::after, .sheeto-fade-up {
                        animation: none !important;
                    }
                }
            `}</style>

            {/* Background decorations */}
            <div className="pointer-events-none absolute inset-0 -z-10">
                <div className="sheeto-blob-1 absolute -top-40 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,var(--sheeto-glow)_0%,transparent_65%)] blur-3xl" />
                <div className="sheeto-blob-2 absolute top-32 left-[-10rem] h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(circle,var(--sheeto-glow-2)_0%,transparent_70%)] blur-3xl" />
                <div className="sheeto-blob-3 absolute right-[-6rem] bottom-[-8rem] h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(circle,var(--sheeto-accent-3)_0%,transparent_65%)] opacity-60 blur-3xl" />
                <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.92)_0%,rgba(255,255,255,0.15)_45%,rgba(255,255,255,0.88)_100%)]" />
                <div className="absolute inset-0 [background-image:linear-gradient(90deg,var(--sheeto-grid)_1px,transparent_1px),linear-gradient(0deg,var(--sheeto-grid)_1px,transparent_1px)] [background-size:32px_32px] opacity-30" />
            </div>

            {/* Header */}
            <header className="sheeto-fade-up relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6 md:px-10">
                <div className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--sheeto-ink)] text-sm font-bold tracking-[0.2em] text-[var(--sheeto-canvas)] uppercase transition-transform hover:rotate-[-6deg]">
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

            <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-28 px-6 pt-8 pb-24 md:px-10">
                {/* Hero */}
                <section
                    aria-label="Apresentação"
                    className="flex flex-col items-center gap-8 text-center"
                >
                    <div
                        className="sheeto-fade-up flex items-center gap-2 rounded-full border border-[color:rgba(29,27,23,0.12)] bg-[var(--sheeto-card)] px-4 py-1.5 shadow-[0_8px_20px_-16px_var(--sheeto-shadow)]"
                        style={{ animationDelay: '80ms' }}
                    >
                        <span className="relative flex size-2">
                            <span className="absolute inline-flex size-full animate-ping rounded-full bg-[var(--sheeto-accent)] opacity-60" />
                            <span className="relative inline-flex size-2 rounded-full bg-[var(--sheeto-accent)]" />
                        </span>
                        <Sparkles className="size-4 text-[var(--sheeto-accent)]" />
                        <span className="text-xs font-semibold tracking-[0.2em] text-[var(--sheeto-accent)] uppercase">
                            Plataforma de estudos com IA
                        </span>
                    </div>

                    <h1
                        className="sheeto-fade-up max-w-3xl text-4xl leading-[1.1] font-semibold text-[var(--sheeto-ink)] md:text-6xl"
                        style={{
                            fontFamily: '"Fraunces", serif',
                            animationDelay: '160ms',
                        }}
                    >
                        Estude de forma mais <RotatingWord words={heroWords} />
                        <br className="hidden md:block" /> não mais difícil.
                    </h1>

                    <p
                        className="sheeto-fade-up max-w-2xl text-lg text-[color:rgba(29,27,23,0.65)] md:text-xl"
                        style={{ animationDelay: '260ms' }}
                    >
                        O Sheeto usa inteligência artificial para gerar listas
                        de exercícios, resumos e materiais de estudo
                        personalizados para o seu nível. Tudo em poucos cliques
                        —{' '}
                        <span className="font-semibold text-[var(--sheeto-ink)]">
                            sem perder tempo procurando material
                        </span>
                        .
                    </p>

                    <div
                        className="sheeto-fade-up flex flex-col gap-3 sm:flex-row"
                        style={{ animationDelay: '360ms' }}
                    >
                        {isAuthenticated ? (
                            <Link
                                href={worksheetsIndex()}
                                className="group inline-flex items-center justify-center gap-2 rounded-full bg-[var(--sheeto-accent)] px-8 py-3.5 text-sm font-semibold text-white shadow-[0_16px_30px_-12px_var(--sheeto-accent)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_40px_-12px_var(--sheeto-accent)]"
                            >
                                <Zap className="size-4 transition-transform group-hover:rotate-12" />
                                Acessar o painel
                                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={register()}
                                    className="group inline-flex items-center justify-center gap-2 rounded-full bg-[var(--sheeto-accent)] px-8 py-3.5 text-sm font-semibold text-white shadow-[0_16px_30px_-12px_var(--sheeto-accent)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_40px_-12px_var(--sheeto-accent)]"
                                >
                                    <Zap className="size-4 transition-transform group-hover:rotate-12" />
                                    Começar agora — é grátis
                                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
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

                    <div
                        className="sheeto-fade-up flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-[color:rgba(29,27,23,0.55)]"
                        style={{ animationDelay: '460ms' }}
                    >
                        <span className="inline-flex items-center gap-1.5">
                            <CheckCircle2 className="size-3.5 text-[var(--sheeto-accent-2)]" />
                            Sem cartão de crédito
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <CheckCircle2 className="size-3.5 text-[var(--sheeto-accent-2)]" />
                            Pronto em segundos
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <CheckCircle2 className="size-3.5 text-[var(--sheeto-accent-2)]" />
                            Qualquer disciplina
                        </span>
                    </div>

                    {/* Hero preview card */}
                    <div
                        className="sheeto-fade-up sheeto-float relative mt-6 w-full max-w-3xl"
                        style={{ animationDelay: '560ms' }}
                    >
                        {/* Floating mini cards */}
                        <div className="pointer-events-none absolute -top-6 -left-4 hidden rotate-[-6deg] rounded-2xl border border-[color:rgba(29,27,23,0.1)] bg-[var(--sheeto-card)] px-4 py-3 shadow-[0_16px_35px_-26px_var(--sheeto-shadow)] md:block">
                            <div className="flex items-center gap-2">
                                <div className="flex size-8 items-center justify-center rounded-lg bg-[var(--sheeto-accent-2)]/15">
                                    <Brain className="size-4 text-[var(--sheeto-accent-2)]" />
                                </div>
                                <div className="text-left">
                                    <p className="text-[10px] tracking-[0.18em] text-[color:rgba(29,27,23,0.5)] uppercase">
                                        Resumo
                                    </p>
                                    <p className="text-xs font-semibold text-[var(--sheeto-ink)]">
                                        Pronto em 8s
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="pointer-events-none absolute -right-4 -bottom-6 hidden rotate-[5deg] rounded-2xl border border-[color:rgba(29,27,23,0.1)] bg-[var(--sheeto-card)] px-4 py-3 shadow-[0_16px_35px_-26px_var(--sheeto-shadow)] md:block">
                            <div className="flex items-center gap-2">
                                <div className="flex size-8 items-center justify-center rounded-lg bg-[var(--sheeto-accent-3)]/20">
                                    <Target className="size-4 text-[var(--sheeto-accent-3)]" />
                                </div>
                                <div className="text-left">
                                    <p className="text-[10px] tracking-[0.18em] text-[color:rgba(29,27,23,0.5)] uppercase">
                                        Acerto
                                    </p>
                                    <p className="text-xs font-semibold text-[var(--sheeto-ink)]">
                                        +38% na revisão
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-[28px] border border-[color:rgba(29,27,23,0.14)] bg-[var(--sheeto-card)] p-6 shadow-[0_32px_60px_-30px_var(--sheeto-shadow)] md:p-8">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex size-10 items-center justify-center rounded-2xl bg-[var(--sheeto-accent)]/10">
                                        <ClipboardList className="size-5 text-[var(--sheeto-accent)]" />
                                    </div>
                                    <div className="text-left">
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
                                <div className="sheeto-shimmer rounded-2xl border border-[color:rgba(29,27,23,0.1)] bg-white/60 p-4 text-left">
                                    <p className="text-xs tracking-[0.2em] text-[color:rgba(29,27,23,0.5)] uppercase">
                                        Questões
                                    </p>
                                    <p className="mt-1.5 text-2xl font-semibold text-[var(--sheeto-ink)]">
                                        10
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-[color:rgba(29,27,23,0.1)] bg-white/60 p-4 text-left">
                                    <p className="text-xs tracking-[0.2em] text-[color:rgba(29,27,23,0.5)] uppercase">
                                        Dificuldade
                                    </p>
                                    <p className="mt-1.5 text-2xl font-semibold text-[var(--sheeto-accent)]">
                                        Médio
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-[color:rgba(29,27,23,0.1)] bg-white/60 p-4 text-left">
                                    <p className="text-xs tracking-[0.2em] text-[color:rgba(29,27,23,0.5)] uppercase">
                                        Tempo
                                    </p>
                                    <p className="mt-1.5 text-2xl font-semibold text-[var(--sheeto-accent-2)]">
                                        ~3 min
                                    </p>
                                </div>
                            </div>
                            <AnimatedQuestions />
                        </div>
                    </div>
                </section>

                {/* Subjects marquee */}
                <section aria-label="Disciplinas">
                    <Reveal className="flex flex-col items-center gap-5">
                        <p className="text-xs font-semibold tracking-[0.3em] text-[color:rgba(29,27,23,0.45)] uppercase">
                            Funciona para qualquer disciplina
                        </p>
                        <div className="relative w-full overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_15%,#000_85%,transparent)]">
                            <div className="sheeto-marquee flex w-max gap-3">
                                {[...subjects, ...subjects].map(
                                    (subject, i) => (
                                        <span
                                            key={`${subject}-${i}`}
                                            className="rounded-full border border-[color:rgba(29,27,23,0.12)] bg-[var(--sheeto-card)] px-5 py-2 text-sm font-medium whitespace-nowrap text-[var(--sheeto-ink)] shadow-[0_8px_20px_-16px_var(--sheeto-shadow)]"
                                        >
                                            {subject}
                                        </span>
                                    ),
                                )}
                            </div>
                        </div>
                    </Reveal>
                </section>

                {/* Stats */}
                <section aria-label="Estatísticas">
                    <Reveal>
                        <div className="grid gap-5 rounded-[32px] border border-[color:rgba(29,27,23,0.1)] bg-[var(--sheeto-card)] p-8 shadow-[0_24px_50px_-30px_var(--sheeto-shadow)] md:grid-cols-3 md:p-10">
                            {stats.map((stat, i) => (
                                <div
                                    key={stat.label}
                                    className="flex flex-col items-center gap-2 text-center md:border-r md:border-[color:rgba(29,27,23,0.08)] md:last:border-r-0"
                                    style={{ minHeight: '92px' }}
                                >
                                    <p
                                        className="text-5xl font-semibold text-[var(--sheeto-ink)]"
                                        style={{
                                            fontFamily: '"Fraunces", serif',
                                        }}
                                    >
                                        <AnimatedCounter
                                            target={stat.value}
                                            suffix={stat.suffix}
                                            duration={1200 + i * 200}
                                        />
                                    </p>
                                    <p className="text-sm text-[color:rgba(29,27,23,0.6)]">
                                        {stat.label}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </Reveal>
                </section>

                {/* Features */}
                <section
                    aria-label="Ferramentas"
                    className="flex flex-col gap-10"
                >
                    <Reveal>
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
                            <p className="max-w-xl text-base text-[color:rgba(29,27,23,0.6)]">
                                Uma ferramenta para cada etapa do seu estudo —
                                da prática à revisão, da memorização ao
                                simulado.
                            </p>
                        </div>
                    </Reveal>
                    <div className="grid gap-5 md:grid-cols-2">
                        {features.map((feature, i) => (
                            <Reveal key={feature.title} delay={i * 100}>
                                <div className="group relative flex h-full flex-col gap-4 overflow-hidden rounded-3xl border border-[color:rgba(29,27,23,0.1)] bg-[var(--sheeto-card)] p-6 shadow-[0_16px_35px_-26px_var(--sheeto-shadow)] transition hover:-translate-y-1 hover:shadow-[0_24px_50px_-24px_var(--sheeto-shadow)] md:p-8">
                                    <div
                                        className="pointer-events-none absolute -top-12 -right-12 size-40 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-70"
                                        style={{
                                            backgroundColor: `color-mix(in srgb, ${feature.color} 30%, transparent)`,
                                        }}
                                    />
                                    {feature.soon && (
                                        <span className="absolute top-6 right-6 rounded-full bg-[var(--sheeto-accent-3)]/15 px-3 py-1 text-xs font-semibold text-[var(--sheeto-accent-3)]">
                                            Em breve
                                        </span>
                                    )}
                                    <div
                                        className="relative flex size-12 items-center justify-center rounded-2xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-[-6deg]"
                                        style={{
                                            backgroundColor: `color-mix(in srgb, ${feature.color} 12%, transparent)`,
                                        }}
                                    >
                                        <feature.icon
                                            className="size-6"
                                            style={{ color: feature.color }}
                                        />
                                    </div>
                                    <div className="relative flex flex-col gap-2">
                                        <h3 className="text-lg font-semibold text-[var(--sheeto-ink)]">
                                            {feature.title}
                                        </h3>
                                        <p className="text-sm leading-relaxed text-[color:rgba(29,27,23,0.65)]">
                                            {feature.description}
                                        </p>
                                    </div>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </section>

                {/* How it works */}
                <section
                    aria-label="Como funciona"
                    className="flex flex-col gap-10"
                >
                    <Reveal>
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
                    </Reveal>
                    <div className="relative grid gap-6 lg:grid-cols-3">
                        <div
                            className="pointer-events-none absolute top-16 right-12 left-12 hidden h-px lg:block"
                            style={{
                                backgroundImage:
                                    'linear-gradient(90deg, transparent 0%, rgba(29,27,23,0.18) 50%, transparent 100%)',
                            }}
                        />
                        {steps.map((step, i) => (
                            <Reveal key={step.number} delay={i * 140}>
                                <div className="group relative flex h-full flex-col gap-4 rounded-3xl border border-[color:rgba(29,27,23,0.1)] bg-[var(--sheeto-card)] p-6 shadow-[0_16px_35px_-26px_var(--sheeto-shadow)] transition hover:-translate-y-1 md:p-8">
                                    <div className="flex items-start justify-between">
                                        <span
                                            className="text-5xl font-bold text-[var(--sheeto-accent)]/15"
                                            style={{
                                                fontFamily: '"Fraunces", serif',
                                            }}
                                        >
                                            {step.number}
                                        </span>
                                        <div className="relative flex size-10 items-center justify-center rounded-2xl bg-[var(--sheeto-accent)]/10 transition-transform group-hover:rotate-6">
                                            <step.icon className="size-5 text-[var(--sheeto-accent)]" />
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-semibold text-[var(--sheeto-ink)]">
                                        {step.title}
                                    </h3>
                                    <p className="text-sm leading-relaxed text-[color:rgba(29,27,23,0.65)]">
                                        {step.description}
                                    </p>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </section>

                {/* Comparison */}
                <section aria-label="Comparativo">
                    <Reveal>
                        <div className="grid gap-5 md:grid-cols-2">
                            <div className="flex flex-col gap-4 rounded-3xl border border-[color:rgba(29,27,23,0.1)] bg-[var(--sheeto-card)]/60 p-6 md:p-8">
                                <p className="text-xs font-semibold tracking-[0.3em] text-[color:rgba(29,27,23,0.45)] uppercase">
                                    Sem o Sheeto
                                </p>
                                <ul className="flex flex-col gap-3 text-sm text-[color:rgba(29,27,23,0.6)]">
                                    {[
                                        'Horas procurando exercícios na internet',
                                        'Material genérico que não combina com o seu nível',
                                        'Sem gabarito ou explicação detalhada',
                                        'Difícil acompanhar o que já estudou',
                                    ].map((item) => (
                                        <li
                                            key={item}
                                            className="flex items-start gap-3"
                                        >
                                            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[color:rgba(29,27,23,0.3)]" />
                                            <span className="line-through decoration-[color:rgba(29,27,23,0.3)]">
                                                {item}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="flex flex-col gap-4 rounded-3xl border border-[var(--sheeto-accent)]/30 bg-[var(--sheeto-card)] p-6 shadow-[0_24px_50px_-30px_var(--sheeto-shadow)] md:p-8">
                                <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.3em] text-[var(--sheeto-accent)] uppercase">
                                    <Sparkles className="size-3.5" />
                                    Com o Sheeto
                                </p>
                                <ul className="flex flex-col gap-3 text-sm text-[var(--sheeto-ink)]">
                                    {benefits.map((benefit) => (
                                        <li
                                            key={benefit}
                                            className="flex items-start gap-3"
                                        >
                                            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-[var(--sheeto-accent-2)]" />
                                            <span className="font-medium">
                                                {benefit}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </Reveal>
                </section>

                {/* Quote */}
                <section aria-label="Citação">
                    <Reveal>
                        <div className="relative mx-auto max-w-3xl rounded-[32px] border border-[color:rgba(29,27,23,0.1)] bg-[var(--sheeto-card)] p-8 text-center shadow-[0_24px_50px_-30px_var(--sheeto-shadow)] md:p-12">
                            <div className="absolute -top-5 left-1/2 flex size-10 -translate-x-1/2 items-center justify-center rounded-full bg-[var(--sheeto-accent)] text-white">
                                <TrendingUp className="size-5" />
                            </div>
                            <p
                                className="text-2xl leading-relaxed text-[var(--sheeto-ink)] md:text-3xl"
                                style={{ fontFamily: '"Fraunces", serif' }}
                            >
                                “Estudar deixou de ser sobre achar material e
                                passou a ser sobre{' '}
                                <span className="text-[var(--sheeto-accent)]">
                                    realmente aprender
                                </span>
                                .”
                            </p>
                            <p className="mt-4 text-sm text-[color:rgba(29,27,23,0.55)]">
                                A proposta do Sheeto, em uma frase.
                            </p>
                        </div>
                    </Reveal>
                </section>

                {/* CTA */}
                <section aria-label="Chamada para ação">
                    <Reveal>
                        <div className="relative flex flex-col items-center gap-8 overflow-hidden rounded-[36px] border border-[color:rgba(29,27,23,0.14)] bg-[var(--sheeto-ink)] px-6 py-14 text-center text-[var(--sheeto-canvas)] shadow-[0_32px_60px_-30px_var(--sheeto-shadow)] md:px-12">
                            <div className="pointer-events-none absolute inset-0">
                                <div className="sheeto-blob-1 absolute -top-24 left-1/4 size-80 rounded-full bg-[var(--sheeto-accent)]/20 blur-3xl" />
                                <div className="sheeto-blob-2 absolute -right-16 -bottom-24 size-80 rounded-full bg-[var(--sheeto-accent-2)]/20 blur-3xl" />
                            </div>
                            <div className="relative flex flex-col items-center gap-4">
                                <BookOpen className="sheeto-float size-10 text-[var(--sheeto-accent-3)]" />
                                <h2
                                    className="max-w-lg text-3xl font-semibold md:text-4xl"
                                    style={{ fontFamily: '"Fraunces", serif' }}
                                >
                                    Pronto para estudar de verdade?
                                </h2>
                                <p className="max-w-md text-sm text-[color:rgba(246,241,234,0.7)]">
                                    Crie sua conta e comece a gerar materiais de
                                    estudo personalizados em minutos. Sem
                                    complicação.
                                </p>
                            </div>
                            <div className="relative flex flex-col gap-3 sm:flex-row">
                                {isAuthenticated ? (
                                    <Link
                                        href={worksheetsIndex()}
                                        className="group inline-flex items-center justify-center gap-2 rounded-full bg-[var(--sheeto-accent-3)] px-8 py-3.5 text-sm font-semibold text-[var(--sheeto-ink)] transition hover:-translate-y-0.5"
                                    >
                                        <Zap className="size-4 transition-transform group-hover:rotate-12" />
                                        Acessar o painel
                                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={register()}
                                            className="group inline-flex items-center justify-center gap-2 rounded-full bg-[var(--sheeto-accent-3)] px-8 py-3.5 text-sm font-semibold text-[var(--sheeto-ink)] transition hover:-translate-y-0.5"
                                        >
                                            <Zap className="size-4 transition-transform group-hover:rotate-12" />
                                            Criar conta gratuita
                                            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
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
                            <p className="relative inline-flex items-center gap-2 text-xs text-[color:rgba(246,241,234,0.55)]">
                                <Clock className="size-3.5" />
                                Leva menos de 1 minuto para começar
                            </p>
                        </div>
                    </Reveal>
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
