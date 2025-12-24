import { home } from '@/routes';
import { Head, Link } from '@inertiajs/react';
import { type CSSProperties, type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    name?: string;
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: PropsWithChildren<AuthLayoutProps>) {
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
            className="relative min-h-svh overflow-hidden bg-[var(--sheeto-canvas)] text-[var(--sheeto-ink)]"
            style={themeStyles}
        >
            <Head>
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=space-grotesk:400,500,600,700|fraunces:600,700"
                    rel="stylesheet"
                />
            </Head>

            <div className="absolute inset-0 -z-10">
                <div className="absolute -top-24 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,var(--sheeto-glow)_0%,transparent_65%)] blur-3xl" />
                <div className="absolute left-[-6rem] top-20 h-[20rem] w-[20rem] rounded-full bg-[radial-gradient(circle,var(--sheeto-glow-2)_0%,transparent_70%)] blur-3xl" />
                <div className="absolute bottom-[-5rem] right-[-3rem] h-[20rem] w-[20rem] rounded-full bg-[radial-gradient(circle,var(--sheeto-accent-3)_0%,transparent_65%)] blur-3xl" />
                <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.92)_0%,rgba(255,255,255,0.25)_40%,rgba(255,255,255,0.85)_100%)]" />
                <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(90deg,var(--sheeto-grid)_1px,transparent_1px),linear-gradient(0deg,var(--sheeto-grid)_1px,transparent_1px)] [background-size:28px_28px]" />
            </div>

            <div className="mx-auto flex min-h-svh w-full max-w-md items-center px-6 py-12">
                <div className="w-full rounded-[28px] border border-[color:rgba(29,27,23,0.18)] bg-[var(--sheeto-card)] p-6 shadow-[0_24px_50px_-30px_var(--sheeto-shadow)] sm:p-8">
                    <Link href={home()} className="inline-flex items-center gap-3">
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--sheeto-ink)] text-sm font-bold uppercase tracking-[0.2em] text-[var(--sheeto-canvas)]">
                            Sh
                        </span>
                        <span className="text-xs uppercase tracking-[0.3em] text-[var(--sheeto-accent)]">
                            Sheeto
                        </span>
                    </Link>

                    {title && (
                        <h1
                            className="mt-6 text-2xl font-semibold text-[var(--sheeto-ink)]"
                            style={{ fontFamily: '"Fraunces", serif' }}
                        >
                            {title}
                        </h1>
                    )}

                    {description && (
                        <p className="mt-2 text-sm text-[color:rgba(29,27,23,0.65)]">
                            {description}
                        </p>
                    )}

                    <div className="mt-6">{children}</div>
                </div>
            </div>
        </div>
    );
}
