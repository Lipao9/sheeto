import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { useCallback } from 'react';

export type Locale = 'pt_BR' | 'en';

export function useTranslation() {
    const { locale, translations } = usePage<SharedData>().props;

    const t = useCallback(
        (key: string, replacements?: Record<string, string | number>): string => {
            let value = (translations as Record<string, string>)?.[key] ?? key;

            if (replacements) {
                Object.entries(replacements).forEach(([param, replacement]) => {
                    value = value.replace(`:${param}`, String(replacement));
                });
            }

            return value;
        },
        [translations],
    );

    return { t, locale: locale as Locale } as const;
}
