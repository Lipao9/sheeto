import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useTranslation } from '@/hooks/use-translation';
import { cn, isSameUrl, resolveUrl } from '@/lib/utils';
import { edit as editAppearance } from '@/routes/appearance';
import { edit as editLanguage } from '@/routes/language';
import { edit } from '@/routes/profile';
import { show } from '@/routes/two-factor';
import { edit as editPassword } from '@/routes/user-password';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

export default function SettingsLayout({ children }: PropsWithChildren) {
    // When server-side rendering, we only render the layout on the client...
    if (typeof window === 'undefined') {
        return null;
    }

    const { t } = useTranslation();
    const currentPath = window.location.pathname;

    const sidebarNavItems: NavItem[] = [
        {
            title: t('Profile'),
            href: edit(),
            icon: null,
        },
        {
            title: t('Password'),
            href: editPassword(),
            icon: null,
        },
        {
            title: t('Two-factor authentication'),
            href: show(),
            icon: null,
        },
        {
            title: t('Appearance'),
            href: editAppearance(),
            icon: null,
        },
        {
            title: t('Language'),
            href: editLanguage(),
            icon: null,
        },
    ];

    return (
        <div className="px-4 py-6">
            <Heading
                title={t('Settings')}
                description={t('Manage your profile and account preferences')}
            />

            <div className="flex flex-col lg:flex-row lg:space-x-12">
                <aside className="w-full max-w-xl lg:w-48">
                    <nav className="flex flex-col space-y-1 space-x-0">
                        {sidebarNavItems.map((item, index) => (
                            <Button
                                key={`${resolveUrl(item.href)}-${index}`}
                                size="sm"
                                variant="ghost"
                                asChild
                                className={cn('w-full justify-start', {
                                    'bg-muted': isSameUrl(
                                        currentPath,
                                        item.href,
                                    ),
                                })}
                            >
                                <Link href={item.href}>
                                    {item.icon && (
                                        <item.icon className="h-4 w-4" />
                                    )}
                                    {item.title}
                                </Link>
                            </Button>
                        ))}
                    </nav>
                </aside>

                <Separator className="my-6 lg:hidden" />

                <div className="flex-1 md:max-w-2xl">
                    <section className="max-w-xl space-y-12">
                        {children}
                    </section>
                </div>
            </div>
        </div>
    );
}
