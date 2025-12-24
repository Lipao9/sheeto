export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-white dark:text-black">
                    Sh
                </span>
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    Sheeto
                </span>
            </div>
        </>
    );
}
