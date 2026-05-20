import HeadingSmall from '@/components/heading-small';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { edit as editLanguage } from '@/routes/language';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';

export default function Language() {
    const { t, locale } = useTranslation();

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('Language settings'),
            href: editLanguage().url,
        },
    ];

    const switchLocale = (newLocale: string) => {
        router.patch(
            editLanguage().url,
            { locale: newLocale },
            { preserveScroll: true },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('Language settings')} />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall
                        title={t('Language')}
                        description={t('Choose your preferred language')}
                    />

                    <div className="grid gap-4 sm:grid-cols-2">
                        <button
                            type="button"
                            onClick={() => switchLocale('pt_BR')}
                            className={`flex w-full cursor-pointer flex-col items-center gap-3 rounded-xl border-2 p-6 text-center transition hover:border-primary/50 ${
                                locale === 'pt_BR'
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border'
                            }`}
                        >
                            <span className="text-3xl">🇧🇷</span>
                            <div className="flex flex-col gap-1">
                                <span className="text-sm font-semibold">
                                    {t('Portuguese (Brazil)')}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    Português (Brasil)
                                </span>
                            </div>
                            {locale === 'pt_BR' && (
                                <span className="rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                                    ✓
                                </span>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => switchLocale('en')}
                            className={`flex w-full cursor-pointer flex-col items-center gap-3 rounded-xl border-2 p-6 text-center transition hover:border-primary/50 ${
                                locale === 'en'
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border'
                            }`}
                        >
                            <span className="text-3xl">🇺🇸</span>
                            <div className="flex flex-col gap-1">
                                <span className="text-sm font-semibold">
                                    {t('English')}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    English
                                </span>
                            </div>
                            {locale === 'en' && (
                                <span className="rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                                    ✓
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
