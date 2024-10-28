import { ReactNode } from "react";

export function MobileSpan({ children }: { children: ReactNode }) {
    return <span className="inline md:hidden">{children}</span>;
}

export function DesktopSpan({ children }: { children: ReactNode }) {
    return <span className="hidden md:inline">{children}</span>;
}
