import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import { Form, Head } from '@inertiajs/react';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
    googleLoginUrl: string;
    oauthError?: string;
}

function GoogleIcon() {
    return (
        <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="size-5"
        >
            <path
                fill="#4285F4"
                d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.31h6.45a5.52 5.52 0 0 1-2.4 3.62v3.01h3.88c2.27-2.09 3.56-5.16 3.56-8.67Z"
            />
            <path
                fill="#34A853"
                d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.88-3.01c-1.08.72-2.46 1.14-4.07 1.14-3.13 0-5.79-2.11-6.74-4.95H1.24v3.1A12 12 0 0 0 12 24Z"
            />
            <path
                fill="#FBBC05"
                d="M5.26 14.27A7.2 7.2 0 0 1 4.88 12c0-.79.14-1.55.38-2.27v-3.1H1.24A12 12 0 0 0 0 12c0 1.93.46 3.75 1.24 5.37l4.02-3.1Z"
            />
            <path
                fill="#EA4335"
                d="M12 4.77c1.76 0 3.34.61 4.58 1.8l3.43-3.43C17.95 1.24 15.24 0 12 0A12 12 0 0 0 1.24 6.63l4.02 3.1c.95-2.84 3.61-4.96 6.74-4.96Z"
            />
        </svg>
    );
}

export default function Login({
    status,
    canResetPassword,
    canRegister,
    googleLoginUrl,
    oauthError,
}: LoginProps) {
    const inputClassName =
        'bg-white/80 border-[color:rgba(29,27,23,0.16)] focus-visible:border-[var(--sheeto-accent)] focus-visible:ring-[var(--sheeto-accent)]/30';

    return (
        <AuthLayout
            title="Entrar"
        >
            <Head title="Entrar" />

            {oauthError && (
                <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-center text-sm font-medium text-red-700">
                    {oauthError}
                </div>
            )}

            <Button
                asChild
                variant="outline"
                className="h-11 w-full border-[color:rgba(29,27,23,0.18)] bg-white/95 text-[color:rgba(29,27,23,0.88)] shadow-[0_6px_20px_rgba(16,24,40,0.08)]"
                data-test="google-login-button"
            >
                <a
                    href={googleLoginUrl}
                    className="inline-flex items-center justify-center gap-2"
                >
                    <GoogleIcon />
                    <span>Continuar com Google</span>
                </a>
            </Button>

            <div className="text-center text-xs uppercase tracking-[0.2em] text-muted-foreground">
                ou use seu e-mail
            </div>

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="email">E-mail</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder="voce@exemplo.com"
                                    className={inputClassName}
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password">Senha</Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="ml-auto text-sm text-[var(--sheeto-accent)]"
                                            tabIndex={5}
                                        >
                                            Esqueceu a senha?
                                        </TextLink>
                                    )}
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="Sua senha"
                                    className={inputClassName}
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center space-x-3">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                />
                                <Label htmlFor="remember">Lembrar de mim</Label>
                            </div>

                            <Button
                                type="submit"
                                className="mt-4 w-full bg-[var(--sheeto-ink)] text-[var(--sheeto-canvas)] hover:bg-[color:rgba(29,27,23,0.92)]"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing && <Spinner />}
                                Entrar
                            </Button>
                        </div>

                        {canRegister && (
                            <div className="text-center text-sm text-muted-foreground">
                                Não tem uma conta?{' '}
                                <TextLink
                                    href={register()}
                                    tabIndex={5}
                                    className="text-[var(--sheeto-accent)]"
                                >
                                    Criar conta
                                </TextLink>
                            </div>
                        )}
                    </>
                )}
            </Form>

            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}
        </AuthLayout>
    );
}
