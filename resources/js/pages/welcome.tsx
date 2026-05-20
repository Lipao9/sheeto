import { login, register } from '@/routes';
import { index as worksheetsIndex } from '@/routes/worksheets';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    ArrowUpRight,
    BookMarked,
    Check,
    Command,
    FileText,
    GraduationCap,
    Layers,
    Minus,
    Plus,
    ScrollText,
    Sparkles,
    Target,
    Wand2,
    Waves,
    Zap,
} from 'lucide-react';
import {
    type CSSProperties,
    type ReactNode,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';

/* ----------------------------------------------------------------
 *  Data
 * ---------------------------------------------------------------- */

const demoScenarios = [
    {
        prompt: 'Matemática · 9º ano · Equações do 2º grau · 5 questões',
        meta: 'Lista de exercícios',
        questions: [
            'Resolva 2x² − 8x + 6 = 0 usando Bhaskara.',
            'Para quais valores de k a equação x² + kx + 4 = 0 tem raízes reais?',
            'Determine o vértice da parábola y = x² − 6x + 5.',
        ],
    },
    {
        prompt: 'História · ENEM · Era Vargas · resumo objetivo',
        meta: 'Resumo inteligente',
        questions: [
            'Contexto político: ascensão de Vargas após a crise de 1929.',
            'Estado Novo (1937–1945) — centralização e propaganda.',
            'Legado trabalhista: CLT, Justiça do Trabalho, salário mínimo.',
        ],
    },
    {
        prompt: 'Biologia · 3º EM · Genética mendeliana · 5 questões',
        meta: 'Simulado personalizado',
        questions: [
            'Cruzamento Aa × Aa: qual a probabilidade de descendente aa?',
            'Diferencie heterozigose de homozigose.',
            'Explique a 1ª Lei de Mendel com um exemplo prático.',
        ],
    },
] as const;

const bentoFeatures = [
    {
        title: 'Listas de exercícios',
        description:
            'Defina disciplina, tema, número de questões e dificuldade. A IA monta uma lista única em segundos — com gabarito e explicações.',
        icon: ScrollText,
        accent: 'violet' as const,
        live: true,
        span: 'md:col-span-2 md:row-span-2',
    },
    {
        title: 'Resumos',
        description:
            'Conteúdo extenso virando resumo claro e estruturado, pronto para revisão.',
        icon: BookMarked,
        accent: 'cyan' as const,
        live: false,
        span: 'md:col-span-1 md:row-span-1',
    },
    {
        title: 'Simulados',
        description:
            'Provas no estilo de vestibular ou ENEM, no tamanho que você precisa.',
        icon: Target,
        accent: 'amber' as const,
        live: false,
        span: 'md:col-span-1 md:row-span-1',
    },
    {
        title: 'Flashcards',
        description:
            'Cartões inteligentes para fixar fórmulas, datas e conceitos.',
        icon: Layers,
        accent: 'violet' as const,
        live: false,
        span: 'md:col-span-2 md:row-span-1',
    },
];

const steps = [
    {
        n: '01',
        title: 'Escolha o que estudar',
        body: 'Selecione disciplina, tema e nível. O Sheeto entende português, exemplos vagos e até bagunça — você não precisa formatar nada.',
        icon: Wand2,
    },
    {
        n: '02',
        title: 'A IA gera em segundos',
        body: 'Listas, resumos, simulados ou flashcards saem prontos, no formato e na dificuldade que você pediu.',
        icon: Sparkles,
    },
    {
        n: '03',
        title: 'Pratique e revise',
        body: 'Resolva, confira o gabarito comentado e guarde no histórico. Sempre que precisar, gere uma nova versão.',
        icon: GraduationCap,
    },
];

const stats = [
    {
        value: 10,
        suffix: 's',
        label: 'Tempo médio para gerar uma lista completa',
    },
    {
        value: 4,
        suffix: '',
        label: 'Ferramentas de estudo em uma só plataforma',
    },
    {
        value: 100,
        suffix: '%',
        label: 'Personalização — nada de material genérico',
    },
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
    'Atualidades',
    'Artes',
];

const faqs = [
    {
        q: 'O Sheeto é gratuito?',
        a: 'Você cria sua conta e começa a gerar material sem custo. A plataforma está em evolução constante e novas ferramentas chegam de tempos em tempos.',
    },
    {
        q: 'Funciona para qualquer disciplina?',
        a: 'Sim. Português, matemática, ciências, humanas, idiomas — se for matéria de estudo, o Sheeto gera material. Basta descrever em linguagem natural.',
    },
    {
        q: 'Posso usar para o ENEM e vestibulares?',
        a: 'Pode. As listas de exercícios já funcionam para qualquer nível, do fundamental ao pré-vestibular. Simulados no estilo ENEM chegam em breve.',
    },
    {
        q: 'O material gerado tem gabarito?',
        a: 'Sim. Cada exercício vem com resposta e uma explicação curta para você entender o caminho — não decorar.',
    },
    {
        q: 'Onde fica o que eu gero?',
        a: 'Tudo no seu painel. Você revisita listas antigas, gera variações e organiza por disciplina ou tema.',
    },
];

/* ----------------------------------------------------------------
 *  Hooks
 * ---------------------------------------------------------------- */

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
            { threshold: 0.15, rootMargin: '0px 0px -80px 0px', ...options },
        );
        observer.observe(node);
        return () => observer.disconnect();
    }, [inView, options]);

    return { ref, inView } as const;
}

function useTypewriter(text: string, enabled: boolean, speed = 28) {
    const [out, setOut] = useState('');
    const [token, setToken] = useState(`${text}|${enabled}`);
    const currentToken = `${text}|${enabled}`;

    // Reset output when input changes — "adjusting state when a prop changes"
    // pattern from the React docs (state setters here run during render).
    if (token !== currentToken) {
        setToken(currentToken);
        setOut('');
    }

    useEffect(() => {
        if (!enabled) {
            return;
        }
        let i = 0;
        const id = setInterval(() => {
            i += 1;
            setOut(text.slice(0, i));
            if (i >= text.length) {
                clearInterval(id);
            }
        }, speed);
        return () => clearInterval(id);
    }, [text, enabled, speed]);

    return out;
}

/**
 * Scroll progress bar that updates via direct DOM manipulation + rAF,
 * avoiding React re-renders on every scroll event.
 */
function ScrollProgressBar() {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let ticking = false;
        let raf = 0;

        const update = () => {
            const h =
                document.documentElement.scrollHeight -
                document.documentElement.clientHeight;
            const p = h > 0 ? window.scrollY / h : 0;
            if (ref.current) {
                ref.current.style.transform = `scaleX(${p})`;
            }
            ticking = false;
        };

        const onScroll = () => {
            if (!ticking) {
                raf = requestAnimationFrame(update);
                ticking = true;
            }
        };

        update();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', onScroll);
            cancelAnimationFrame(raf);
        };
    }, []);

    return (
        <div
            ref={ref}
            aria-hidden
            className="fixed top-0 right-0 left-0 z-50 h-0.5 origin-left bg-gradient-to-r from-[var(--sheeto-violet)] via-[var(--sheeto-cyan)] to-[var(--sheeto-amber)]"
            style={{ transform: 'scaleX(0)', willChange: 'transform' }}
        />
    );
}

/* ----------------------------------------------------------------
 *  Building blocks
 * ---------------------------------------------------------------- */

function Reveal({
    children,
    delay = 0,
    className = '',
}: {
    children: ReactNode;
    delay?: number;
    className?: string;
}) {
    const { ref, inView } = useInView<HTMLDivElement>();
    // Only hint will-change while the element is still about to animate.
    // Leaving it on permanently allocates GPU layers for every revealed block.
    return (
        <div
            ref={ref}
            className={className}
            style={{
                opacity: inView ? 1 : 0,
                transform: inView ? 'none' : 'translateY(28px)',
                transition: `opacity 700ms cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform 700ms cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
                willChange: inView ? 'auto' : 'opacity, transform',
            }}
        >
            {children}
        </div>
    );
}

function Counter({
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

/* ----------------------------------------------------------------
 *  Hero live demo — "watch the AI generate"
 * ---------------------------------------------------------------- */

function HeroDemo() {
    const [index, setIndex] = useState(0);
    const [stage, setStage] = useState<'typing' | 'generating' | 'ready'>(
        'typing',
    );

    const scenario = demoScenarios[index];
    const typed = useTypewriter(scenario.prompt, stage === 'typing', 26);

    useEffect(() => {
        if (stage === 'typing') {
            const dur = scenario.prompt.length * 26 + 600;
            const t = setTimeout(() => setStage('generating'), dur);
            return () => clearTimeout(t);
        }
        if (stage === 'generating') {
            const t = setTimeout(() => setStage('ready'), 1200);
            return () => clearTimeout(t);
        }
        const t = setTimeout(() => {
            setStage('typing');
            setIndex((i) => (i + 1) % demoScenarios.length);
        }, 4200);
        return () => clearTimeout(t);
    }, [stage, scenario.prompt.length]);

    return (
        <div className="relative w-full max-w-2xl">
            {/* Glow behind */}
            <div className="pointer-events-none absolute -inset-6 -z-10 rounded-[40px] bg-[radial-gradient(circle_at_30%_20%,var(--sheeto-glow-violet)_0%,transparent_60%),radial-gradient(circle_at_80%_70%,var(--sheeto-glow-cyan)_0%,transparent_55%)]" />

            <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[color:rgba(15,13,23,0.92)] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.6)]">
                {/* Window chrome */}
                <div className="flex items-center justify-between border-b border-white/5 px-5 py-3">
                    <div className="flex items-center gap-1.5">
                        <span className="size-2.5 rounded-full bg-white/15" />
                        <span className="size-2.5 rounded-full bg-white/15" />
                        <span className="size-2.5 rounded-full bg-white/15" />
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] tracking-[0.2em] text-white/40 uppercase">
                        <Command className="size-3" />
                        sheeto · gerador
                    </div>
                </div>

                {/* Prompt */}
                <div className="border-b border-white/5 px-5 py-4">
                    <p className="mb-2 text-[10px] tracking-[0.22em] text-white/40 uppercase">
                        Você pede
                    </p>
                    <div className="flex items-center gap-3">
                        <Wand2 className="size-4 shrink-0 text-[var(--sheeto-violet)]" />
                        <p className="font-mono text-sm text-white/90">
                            {typed}
                            {stage === 'typing' && (
                                <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 animate-pulse bg-[var(--sheeto-violet)] align-middle" />
                            )}
                        </p>
                    </div>
                </div>

                {/* Output */}
                <div className="px-5 py-5">
                    <div className="mb-4 flex items-center justify-between">
                        <p className="text-[10px] tracking-[0.22em] text-white/40 uppercase">
                            Sheeto entrega
                        </p>
                        <span
                            key={`${index}-${stage}`}
                            className="sheeto-fade-in inline-flex items-center gap-1.5 rounded-full border border-[var(--sheeto-cyan)]/30 bg-[var(--sheeto-cyan)]/10 px-2.5 py-0.5 text-[10px] font-medium text-[var(--sheeto-cyan)]"
                        >
                            <Sparkles className="size-3" />
                            {scenario.meta}
                        </span>
                    </div>

                    {stage === 'generating' ? (
                        <div className="flex h-32 items-center justify-center gap-2 text-white/60">
                            <span className="size-2 animate-bounce rounded-full bg-[var(--sheeto-violet)] [animation-delay:-0.3s]" />
                            <span className="size-2 animate-bounce rounded-full bg-[var(--sheeto-cyan)] [animation-delay:-0.15s]" />
                            <span className="size-2 animate-bounce rounded-full bg-[var(--sheeto-amber)]" />
                            <span className="ml-2 text-xs">
                                gerando seu material…
                            </span>
                        </div>
                    ) : stage === 'ready' ? (
                        <ul className="space-y-2.5">
                            {scenario.questions.map((q, i) => (
                                <li
                                    key={q}
                                    className="sheeto-slide-in flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3"
                                    style={{
                                        animationDelay: `${i * 120}ms`,
                                    }}
                                >
                                    <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-md bg-[var(--sheeto-violet)]/20 text-[10px] font-semibold text-[var(--sheeto-violet)]">
                                        {i + 1}
                                    </span>
                                    <p className="text-sm leading-relaxed text-white/85">
                                        {q}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="h-32" />
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-white/5 px-5 py-3 text-xs text-white/40">
                    <span className="inline-flex items-center gap-1.5">
                        <span className="size-1.5 animate-pulse rounded-full bg-[var(--sheeto-cyan)]" />
                        Em tempo real
                    </span>
                    <span className="font-mono">
                        {String(index + 1).padStart(2, '0')} /{' '}
                        {String(demoScenarios.length).padStart(2, '0')}
                    </span>
                </div>
            </div>
        </div>
    );
}

/* ----------------------------------------------------------------
 *  Bento card
 * ---------------------------------------------------------------- */

const accentMap = {
    violet: 'var(--sheeto-violet)',
    cyan: 'var(--sheeto-cyan)',
    amber: 'var(--sheeto-amber)',
} as const;

function BentoCard({
    title,
    description,
    icon: Icon,
    accent,
    live,
    span,
}: {
    title: string;
    description: string;
    icon: typeof ScrollText;
    accent: keyof typeof accentMap;
    live: boolean;
    span: string;
}) {
    const color = accentMap[accent];
    return (
        <div
            className={`group relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.025] p-7 transition duration-500 hover:border-white/15 hover:bg-white/[0.04] ${span}`}
        >
            <div
                className="pointer-events-none absolute -top-24 -right-24 size-64 rounded-full opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-60"
                style={{
                    background: `radial-gradient(circle, ${color} 0%, transparent 65%)`,
                }}
            />

            <div className="relative flex items-start justify-between">
                <div
                    className="flex size-12 items-center justify-center rounded-2xl border border-white/10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-[-6deg]"
                    style={{
                        background: `linear-gradient(135deg, color-mix(in srgb, ${color} 20%, transparent), transparent)`,
                    }}
                >
                    <Icon className="size-5" style={{ color }} aria-hidden />
                </div>
                <span
                    className="rounded-full border px-2.5 py-1 text-[10px] font-semibold tracking-[0.15em] uppercase"
                    style={{
                        color: live ? color : 'rgba(255,255,255,0.45)',
                        borderColor: live
                            ? `color-mix(in srgb, ${color} 35%, transparent)`
                            : 'rgba(255,255,255,0.12)',
                        background: live
                            ? `color-mix(in srgb, ${color} 10%, transparent)`
                            : 'transparent',
                    }}
                >
                    {live ? 'Disponível' : 'Em breve'}
                </span>
            </div>

            <div className="relative mt-12 flex flex-col gap-2">
                <h3
                    className="text-2xl font-normal text-white md:text-3xl"
                    style={{ fontFamily: '"Instrument Serif", serif' }}
                >
                    {title}
                </h3>
                <p className="max-w-md text-sm leading-relaxed text-white/55">
                    {description}
                </p>
            </div>
        </div>
    );
}

/* ----------------------------------------------------------------
 *  FAQ
 * ---------------------------------------------------------------- */

function FAQItem({ q, a }: { q: string; a: string }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] transition hover:border-white/15">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left"
                aria-expanded={open}
            >
                <span className="text-base font-medium text-white md:text-lg">
                    {q}
                </span>
                <span
                    className={`flex size-8 shrink-0 items-center justify-center rounded-full border border-white/10 text-white/70 transition ${
                        open
                            ? 'border-[var(--sheeto-violet)]/40 bg-[var(--sheeto-violet)]/10 text-[var(--sheeto-violet)]'
                            : ''
                    }`}
                >
                    {open ? (
                        <Minus className="size-4" />
                    ) : (
                        <Plus className="size-4" />
                    )}
                </span>
            </button>
            <div
                className="grid overflow-hidden px-6 transition-[grid-template-rows,padding] duration-500"
                style={{
                    gridTemplateRows: open ? '1fr' : '0fr',
                    paddingBottom: open ? '20px' : '0px',
                }}
            >
                <div className="overflow-hidden">
                    <p className="text-sm leading-relaxed text-white/60">{a}</p>
                </div>
            </div>
        </div>
    );
}

/* ----------------------------------------------------------------
 *  Page
 * ---------------------------------------------------------------- */

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth } = usePage<SharedData>().props;
    const isAuthenticated = Boolean(auth.user);

    const themeStyles = useMemo<CSSProperties>(
        () =>
            ({
                '--sheeto-canvas': '#08070D',
                '--sheeto-canvas-2': '#0F0D17',
                '--sheeto-ink': '#F5F1EA',
                '--sheeto-violet': '#A78BFA',
                '--sheeto-cyan': '#67E8F9',
                '--sheeto-amber': '#FBBF24',
                '--sheeto-glow-violet': 'rgba(167,139,250,0.35)',
                '--sheeto-glow-cyan': 'rgba(103,232,249,0.25)',
                '--sheeto-glow-amber': 'rgba(251,191,36,0.18)',
                fontFamily:
                    '"Inter", ui-sans-serif, system-ui, -apple-system, sans-serif',
            }) as CSSProperties,
        [],
    );

    return (
        <div
            className="relative min-h-screen overflow-x-hidden bg-[var(--sheeto-canvas)] text-[var(--sheeto-ink)] antialiased"
            style={themeStyles}
        >
            <Head title="Sua plataforma de estudos com IA">
                <meta
                    name="description"
                    content="Sheeto gera listas de exercícios, resumos e materiais de estudo personalizados com inteligência artificial — em segundos, para qualquer disciplina e nível."
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
                    name="keywords"
                    content="estudos com IA, listas de exercícios, resumos inteligentes, simulados, flashcards, plataforma de estudos, estudo personalizado"
                />
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-serif:400,400i|inter:400,500,600,700|jetbrains-mono:400,500"
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

            {/* Local keyframes */}
            <style>{`
                @keyframes sheeto-drift {
                    0%, 100% { transform: translate3d(0, 0, 0); }
                    50% { transform: translate3d(0, -10px, 0); }
                }
                @keyframes sheeto-marquee {
                    from { transform: translate3d(0, 0, 0); }
                    to { transform: translate3d(-50%, 0, 0); }
                }
                @keyframes sheeto-fade-in {
                    from { opacity: 0; transform: scale(0.96); }
                    to { opacity: 1; transform: scale(1); }
                }
                @keyframes sheeto-slide-in {
                    from { opacity: 0; transform: translate3d(-12px, 0, 0); }
                    to { opacity: 1; transform: translate3d(0, 0, 0); }
                }
                @keyframes sheeto-fade-up {
                    from { opacity: 0; transform: translate3d(0, 24px, 0); }
                    to { opacity: 1; transform: translate3d(0, 0, 0); }
                }
                @keyframes sheeto-shimmer {
                    0% { background-position: 0% 50%; }
                    100% { background-position: 200% 50%; }
                }
                .sheeto-drift { animation: sheeto-drift 6s ease-in-out infinite; will-change: transform; }
                .sheeto-marquee { animation: sheeto-marquee 40s linear infinite; will-change: transform; }
                .sheeto-fade-in { animation: sheeto-fade-in 500ms ease-out both; }
                .sheeto-slide-in { animation: sheeto-slide-in 500ms ease-out both; }
                .sheeto-fade-up { animation: sheeto-fade-up 900ms cubic-bezier(0.22,1,0.36,1) both; }
                .sheeto-text-gradient {
                    background: linear-gradient(110deg, #F5F1EA 0%, #A78BFA 35%, #67E8F9 65%, #F5F1EA 100%);
                    background-size: 250% 100%;
                    background-clip: text;
                    -webkit-background-clip: text;
                    color: transparent;
                    animation: sheeto-shimmer 8s linear infinite;
                }
                /* Backdrop layer isolated from page paint so scroll doesn't repaint it */
                .sheeto-backdrop {
                    contain: strict;
                    transform: translateZ(0);
                }
                @media (prefers-reduced-motion: reduce) {
                    .sheeto-drift, .sheeto-marquee, .sheeto-text-gradient,
                    .sheeto-fade-in, .sheeto-slide-in, .sheeto-fade-up {
                        animation: none !important;
                    }
                }
            `}</style>

            <ScrollProgressBar />

            {/*
                Background — fixed, paint-contained. No filter:blur, no
                animation, no mix-blend. The "aurora" effect is built from
                pure radial-gradients on a single layer so the GPU can cache
                a static texture and never repaint during scroll.
            */}
            <div
                aria-hidden
                className="sheeto-backdrop pointer-events-none fixed inset-0 -z-10 overflow-hidden"
                style={{
                    backgroundColor: 'var(--sheeto-canvas)',
                    backgroundImage: [
                        'radial-gradient(60rem 40rem at -10% -10%, var(--sheeto-glow-violet) 0%, transparent 55%)',
                        'radial-gradient(50rem 36rem at 110% 30%, var(--sheeto-glow-cyan) 0%, transparent 55%)',
                        'radial-gradient(40rem 30rem at 50% 110%, var(--sheeto-glow-amber) 0%, transparent 55%)',
                    ].join(','),
                }}
            >
                <div className="absolute inset-0 [background-image:linear-gradient(rgba(255,255,255,0.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:48px_48px] opacity-[0.025]" />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,var(--sheeto-canvas)_90%)]" />
            </div>

            {/* Header — solid translucent bg (no backdrop-blur, much cheaper) */}
            <header className="sheeto-fade-up sticky top-0 z-40 bg-[var(--sheeto-canvas)]/85">
                <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5 md:px-10">
                    <div className="flex items-center gap-2.5">
                        <div className="relative">
                            <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--sheeto-violet)] to-[var(--sheeto-cyan)] text-[11px] font-bold tracking-[0.12em] text-[var(--sheeto-canvas)] uppercase">
                                Sh
                            </div>
                            <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-br from-[var(--sheeto-violet)] to-[var(--sheeto-cyan)] opacity-50 blur-md" />
                        </div>
                        <span className="text-base font-semibold tracking-tight">
                            Sheeto
                        </span>
                    </div>

                    <nav className="flex items-center gap-2">
                        {isAuthenticated ? (
                            <Link
                                href={worksheetsIndex()}
                                className="group inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[var(--sheeto-canvas)] transition hover:bg-white/90"
                            >
                                Ir para o painel
                                <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={login()}
                                    className="hidden rounded-full px-4 py-2 text-sm font-medium text-white/70 transition hover:text-white sm:inline-flex"
                                >
                                    Entrar
                                </Link>
                                {canRegister && (
                                    <Link
                                        href={register()}
                                        className="group inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[var(--sheeto-canvas)] transition hover:bg-white/90"
                                    >
                                        Criar conta
                                        <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                    </Link>
                                )}
                            </>
                        )}
                    </nav>
                </div>
            </header>

            <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-32 px-6 pt-12 pb-24 md:px-10 md:pt-20 md:pb-32">
                {/* ========== HERO ========== */}
                <section className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
                    <div className="flex flex-col gap-7">
                        <div
                            className="sheeto-fade-up inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs tracking-wide text-white/70"
                            style={{ animationDelay: '60ms' }}
                        >
                            <span className="relative flex size-2">
                                <span className="absolute inline-flex size-full animate-ping rounded-full bg-[var(--sheeto-cyan)] opacity-50" />
                                <span className="relative inline-flex size-2 rounded-full bg-[var(--sheeto-cyan)]" />
                            </span>
                            Estudo com IA · Em fase aberta
                        </div>

                        <h1
                            className="sheeto-fade-up text-5xl leading-[1.02] font-normal tracking-tight md:text-7xl"
                            style={{
                                fontFamily: '"Instrument Serif", serif',
                                animationDelay: '140ms',
                            }}
                        >
                            Estude o que importa.
                            <br />
                            <span className="sheeto-text-gradient italic">
                                Em segundos.
                            </span>
                        </h1>

                        <p
                            className="sheeto-fade-up max-w-lg text-lg leading-relaxed text-white/65"
                            style={{ animationDelay: '240ms' }}
                        >
                            O Sheeto é uma plataforma de estudos com
                            inteligência artificial. Você descreve o que precisa{' '}
                            <span className="text-white">
                                — em português, do seu jeito —
                            </span>{' '}
                            e a IA monta listas de exercícios, resumos e
                            simulados personalizados na hora.
                        </p>

                        <div
                            className="sheeto-fade-up flex flex-col gap-3 sm:flex-row"
                            style={{ animationDelay: '340ms' }}
                        >
                            {isAuthenticated ? (
                                <Link
                                    href={worksheetsIndex()}
                                    className="group inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-[var(--sheeto-canvas)] transition hover:scale-[1.02]"
                                >
                                    <Zap className="size-4" />
                                    Acessar painel
                                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={register()}
                                        className="group inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-[var(--sheeto-canvas)] transition hover:scale-[1.02]"
                                        style={{
                                            background:
                                                'linear-gradient(110deg, #F5F1EA, #67E8F9 80%)',
                                        }}
                                    >
                                        <Zap className="size-4" />
                                        Começar grátis
                                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                                    </Link>
                                    <Link
                                        href={login()}
                                        className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-7 py-3.5 text-sm font-semibold text-white/85 transition hover:border-white/40 hover:text-white"
                                    >
                                        Entrar
                                    </Link>
                                </>
                            )}
                        </div>

                        <div
                            className="sheeto-fade-up flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-white/45"
                            style={{ animationDelay: '440ms' }}
                        >
                            {[
                                'Sem cartão de crédito',
                                'Qualquer disciplina',
                                'Pronto em segundos',
                            ].map((t) => (
                                <span
                                    key={t}
                                    className="inline-flex items-center gap-1.5"
                                >
                                    <Check className="size-3.5 text-[var(--sheeto-cyan)]" />
                                    {t}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div
                        className="sheeto-fade-up sheeto-drift flex justify-center lg:justify-end"
                        style={{ animationDelay: '500ms' }}
                    >
                        <HeroDemo />
                    </div>
                </section>

                {/* ========== SUBJECTS MARQUEE ========== */}
                <section aria-label="Disciplinas">
                    <Reveal className="flex flex-col items-center gap-6">
                        <p className="text-[11px] tracking-[0.32em] text-white/40 uppercase">
                            Funciona para qualquer matéria
                        </p>
                        <div className="relative w-full overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
                            <div className="sheeto-marquee flex w-max gap-3">
                                {[...subjects, ...subjects].map(
                                    (subject, i) => (
                                        <span
                                            key={`${subject}-${i}`}
                                            className="rounded-full border border-white/10 bg-white/[0.03] px-5 py-2 text-sm font-medium whitespace-nowrap text-white/75"
                                        >
                                            {subject}
                                        </span>
                                    ),
                                )}
                            </div>
                        </div>
                    </Reveal>
                </section>

                {/* ========== BENTO ========== */}
                <section
                    aria-label="Ferramentas"
                    className="flex flex-col gap-12"
                >
                    <Reveal>
                        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                            <div className="flex max-w-xl flex-col gap-3">
                                <p className="text-[11px] tracking-[0.32em] text-[var(--sheeto-violet)] uppercase">
                                    O que o Sheeto cria por você
                                </p>
                                <h2
                                    className="text-4xl leading-[1.05] font-normal md:text-5xl"
                                    style={{
                                        fontFamily: '"Instrument Serif", serif',
                                    }}
                                >
                                    Quatro ferramentas,{' '}
                                    <span className="text-[var(--sheeto-violet)] italic">
                                        uma única plataforma.
                                    </span>
                                </h2>
                            </div>
                            <p className="max-w-sm text-sm text-white/55">
                                Do exercício à revisão, da memorização ao
                                simulado — tudo gerado e organizado no seu
                                ritmo.
                            </p>
                        </div>
                    </Reveal>

                    <Reveal delay={120}>
                        <div className="grid auto-rows-[minmax(220px,auto)] grid-cols-1 gap-4 md:grid-cols-3">
                            {bentoFeatures.map((f) => (
                                <BentoCard
                                    key={f.title}
                                    title={f.title}
                                    description={f.description}
                                    icon={f.icon}
                                    accent={f.accent}
                                    live={f.live}
                                    span={f.span}
                                />
                            ))}
                        </div>
                    </Reveal>
                </section>

                {/* ========== HOW IT WORKS ========== */}
                <section
                    aria-label="Como funciona"
                    className="flex flex-col gap-14"
                >
                    <Reveal>
                        <div className="flex flex-col items-center gap-3 text-center">
                            <p className="text-[11px] tracking-[0.32em] text-[var(--sheeto-cyan)] uppercase">
                                Como funciona
                            </p>
                            <h2
                                className="max-w-2xl text-4xl leading-[1.05] font-normal md:text-5xl"
                                style={{
                                    fontFamily: '"Instrument Serif", serif',
                                }}
                            >
                                Três passos.{' '}
                                <span className="text-[var(--sheeto-cyan)] italic">
                                    Nenhum atrito.
                                </span>
                            </h2>
                        </div>
                    </Reveal>

                    <div className="relative grid gap-5 lg:grid-cols-3">
                        <svg
                            aria-hidden
                            className="pointer-events-none absolute top-16 right-16 left-16 hidden h-12 lg:block"
                            preserveAspectRatio="none"
                            viewBox="0 0 1000 50"
                        >
                            <path
                                d="M 0 25 Q 250 0 500 25 T 1000 25"
                                stroke="url(#sheeto-line)"
                                strokeWidth="1.5"
                                strokeDasharray="6 8"
                                fill="none"
                            />
                            <defs>
                                <linearGradient
                                    id="sheeto-line"
                                    x1="0"
                                    x2="1"
                                    y1="0"
                                    y2="0"
                                >
                                    <stop
                                        offset="0%"
                                        stopColor="rgba(167,139,250,0.6)"
                                    />
                                    <stop
                                        offset="50%"
                                        stopColor="rgba(103,232,249,0.6)"
                                    />
                                    <stop
                                        offset="100%"
                                        stopColor="rgba(251,191,36,0.6)"
                                    />
                                </linearGradient>
                            </defs>
                        </svg>

                        {steps.map((step, i) => (
                            <Reveal key={step.n} delay={i * 140}>
                                <div className="group relative flex h-full flex-col gap-5 rounded-3xl border border-white/[0.08] bg-white/[0.025] p-7 transition hover:border-white/15 hover:bg-white/[0.04]">
                                    <div className="flex items-center justify-between">
                                        <span
                                            className="text-5xl font-normal text-white/15"
                                            style={{
                                                fontFamily:
                                                    '"Instrument Serif", serif',
                                            }}
                                        >
                                            {step.n}
                                        </span>
                                        <div className="flex size-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] transition-transform group-hover:rotate-6">
                                            <step.icon className="size-5 text-white/80" />
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-semibold text-white">
                                        {step.title}
                                    </h3>
                                    <p className="text-sm leading-relaxed text-white/55">
                                        {step.body}
                                    </p>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </section>

                {/* ========== STATS ========== */}
                <section aria-label="Estatísticas">
                    <Reveal>
                        <div className="grid gap-px overflow-hidden rounded-[28px] border border-white/[0.08] bg-white/5 md:grid-cols-3">
                            {stats.map((stat) => (
                                <div
                                    key={stat.label}
                                    className="flex flex-col gap-3 bg-[var(--sheeto-canvas)] p-8 md:p-10"
                                >
                                    <p
                                        className="text-6xl font-normal text-white md:text-7xl"
                                        style={{
                                            fontFamily:
                                                '"Instrument Serif", serif',
                                        }}
                                    >
                                        <Counter
                                            target={stat.value}
                                            suffix={stat.suffix}
                                        />
                                    </p>
                                    <p className="max-w-[20ch] text-sm text-white/55">
                                        {stat.label}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </Reveal>
                </section>

                {/* ========== DEEP PITCH ========== */}
                <section aria-label="Por que o Sheeto">
                    <Reveal>
                        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
                            <div className="flex flex-col gap-6">
                                <p className="text-[11px] tracking-[0.32em] text-[var(--sheeto-amber)] uppercase">
                                    Feito para estudantes
                                </p>
                                <h2
                                    className="text-4xl leading-[1.05] font-normal md:text-5xl"
                                    style={{
                                        fontFamily: '"Instrument Serif", serif',
                                    }}
                                >
                                    Procurar material{' '}
                                    <span className="text-[var(--sheeto-amber)] italic">
                                        cansa.
                                    </span>{' '}
                                    Estudar com Sheeto{' '}
                                    <span className="italic">é diferente.</span>
                                </h2>
                                <p className="max-w-md text-base leading-relaxed text-white/65">
                                    Você não perde mais tempo abrindo dez abas
                                    pra montar uma lista de exercícios decente.
                                    O Sheeto pega o seu pedido e devolve um
                                    material sob medida — no nível certo, com
                                    gabarito comentado e organizado pra revisão.
                                </p>
                                <ul className="flex flex-col gap-3">
                                    {[
                                        'Personalização real para o seu nível e estilo',
                                        'Gabaritos com explicação, não só o resultado',
                                        'Histórico salvo — revisite quando quiser',
                                        'Tudo em um único lugar, sem fricção',
                                    ].map((b) => (
                                        <li
                                            key={b}
                                            className="flex items-start gap-3 text-sm text-white/80"
                                        >
                                            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[var(--sheeto-cyan)]/15">
                                                <Check className="size-3 text-[var(--sheeto-cyan)]" />
                                            </span>
                                            {b}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Mock dashboard */}
                            <div className="relative">
                                <div className="pointer-events-none absolute -inset-8 -z-10 rounded-[40px] bg-[radial-gradient(circle_at_50%_50%,var(--sheeto-glow-amber)_0%,transparent_60%)]" />
                                <div className="rounded-[28px] border border-white/10 bg-white/[0.025] p-6 md:p-8">
                                    <div className="flex items-center justify-between border-b border-white/5 pb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--sheeto-violet)] to-[var(--sheeto-cyan)] text-[10px] font-bold tracking-[0.15em] text-[var(--sheeto-canvas)] uppercase">
                                                Sh
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-white">
                                                    Seu painel
                                                </p>
                                                <p className="text-xs text-white/45">
                                                    7 materiais esta semana
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-white/40">
                                            <Waves className="size-3.5" />
                                            ao vivo
                                        </div>
                                    </div>

                                    <div className="mt-5 space-y-3">
                                        {[
                                            {
                                                t: 'Equações do 2º grau',
                                                s: 'Matemática · 10 questões',
                                                c: 'var(--sheeto-violet)',
                                                i: ScrollText,
                                            },
                                            {
                                                t: 'Era Vargas',
                                                s: 'História · Resumo',
                                                c: 'var(--sheeto-cyan)',
                                                i: BookMarked,
                                            },
                                            {
                                                t: 'Genética mendeliana',
                                                s: 'Biologia · Simulado',
                                                c: 'var(--sheeto-amber)',
                                                i: Target,
                                            },
                                            {
                                                t: 'Verbos irregulares',
                                                s: 'Inglês · Flashcards',
                                                c: 'var(--sheeto-violet)',
                                                i: Layers,
                                            },
                                        ].map((item, i) => (
                                            <div
                                                key={item.t}
                                                className="sheeto-fade-up flex items-center justify-between gap-4 rounded-2xl border border-white/5 bg-white/[0.025] px-4 py-3 transition hover:border-white/15"
                                                style={{
                                                    animationDelay: `${i * 100}ms`,
                                                }}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="flex size-9 items-center justify-center rounded-xl"
                                                        style={{
                                                            background: `color-mix(in srgb, ${item.c} 14%, transparent)`,
                                                        }}
                                                    >
                                                        <item.i
                                                            className="size-4"
                                                            style={{
                                                                color: item.c,
                                                            }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-white">
                                                            {item.t}
                                                        </p>
                                                        <p className="text-xs text-white/45">
                                                            {item.s}
                                                        </p>
                                                    </div>
                                                </div>
                                                <ArrowUpRight className="size-4 text-white/30" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Reveal>
                </section>

                {/* ========== FAQ ========== */}
                <section aria-label="Perguntas frequentes">
                    <Reveal>
                        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
                            <div className="flex flex-col gap-4">
                                <p className="text-[11px] tracking-[0.32em] text-white/40 uppercase">
                                    Perguntas frequentes
                                </p>
                                <h2
                                    className="text-4xl leading-[1.05] font-normal md:text-5xl"
                                    style={{
                                        fontFamily: '"Instrument Serif", serif',
                                    }}
                                >
                                    Quase tudo que <br />
                                    <span className="italic">
                                        você quer saber.
                                    </span>
                                </h2>
                                <p className="max-w-sm text-sm text-white/55">
                                    Se ainda faltou alguma coisa, é só criar
                                    conta e testar — leva um minuto.
                                </p>
                            </div>

                            <div className="flex flex-col gap-3">
                                {faqs.map((item) => (
                                    <FAQItem
                                        key={item.q}
                                        q={item.q}
                                        a={item.a}
                                    />
                                ))}
                            </div>
                        </div>
                    </Reveal>
                </section>

                {/* ========== FINAL CTA ========== */}
                <section aria-label="Chamada final">
                    <Reveal>
                        <div className="relative overflow-hidden rounded-[40px] border border-white/10 bg-[var(--sheeto-canvas-2)] px-6 py-16 text-center md:px-12 md:py-24">
                            <div
                                aria-hidden
                                className="pointer-events-none absolute inset-0"
                                style={{
                                    backgroundImage: [
                                        'radial-gradient(28rem 22rem at 25% -10%, rgba(167,139,250,0.18) 0%, transparent 60%)',
                                        'radial-gradient(28rem 22rem at 110% 110%, rgba(103,232,249,0.18) 0%, transparent 60%)',
                                    ].join(','),
                                }}
                            />

                            <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-6">
                                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-xs text-white/65">
                                    <Sparkles className="size-3.5 text-[var(--sheeto-amber)]" />
                                    Grátis para começar
                                </span>
                                <h2
                                    className="text-5xl leading-[1.02] font-normal md:text-7xl"
                                    style={{
                                        fontFamily: '"Instrument Serif", serif',
                                    }}
                                >
                                    Estude do{' '}
                                    <span className="sheeto-text-gradient italic">
                                        seu jeito.
                                    </span>
                                </h2>
                                <p className="max-w-xl text-base text-white/60 md:text-lg">
                                    Crie sua conta agora, descreva o que precisa
                                    e veja a IA montar seu material em segundos.
                                    Sem complicação. Sem decepção.
                                </p>
                                <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                                    {isAuthenticated ? (
                                        <Link
                                            href={worksheetsIndex()}
                                            className="group inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-semibold text-[var(--sheeto-canvas)] transition hover:scale-[1.02]"
                                        >
                                            <Zap className="size-4" />
                                            Acessar painel
                                            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                                        </Link>
                                    ) : (
                                        <>
                                            <Link
                                                href={register()}
                                                className="group inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-sm font-semibold text-[var(--sheeto-canvas)] transition hover:scale-[1.02]"
                                                style={{
                                                    background:
                                                        'linear-gradient(110deg, #F5F1EA, #67E8F9 80%)',
                                                }}
                                            >
                                                <Zap className="size-4" />
                                                Criar conta grátis
                                                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                                            </Link>
                                            <Link
                                                href={login()}
                                                className="inline-flex items-center justify-center rounded-full border border-white/15 px-8 py-4 text-sm font-semibold text-white/85 transition hover:border-white/40 hover:text-white"
                                            >
                                                Já tenho conta
                                            </Link>
                                        </>
                                    )}
                                </div>
                                <p className="inline-flex items-center gap-2 text-xs text-white/40">
                                    <FileText className="size-3.5" />
                                    Menos de 1 minuto para começar
                                </p>
                            </div>
                        </div>
                    </Reveal>
                </section>

                {/* ========== FOOTER ========== */}
                <footer className="flex flex-col items-center gap-3 text-center">
                    <div className="flex items-center gap-2.5">
                        <div className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--sheeto-violet)] to-[var(--sheeto-cyan)] text-[10px] font-bold tracking-[0.15em] text-[var(--sheeto-canvas)] uppercase">
                            Sh
                        </div>
                        <span className="text-sm font-semibold">Sheeto</span>
                    </div>
                    <p className="text-xs text-white/35">
                        Estudo com inteligência artificial · Feito com cuidado.
                    </p>
                </footer>
            </main>
        </div>
    );
}
