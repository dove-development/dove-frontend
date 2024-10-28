import { ReactNode } from "react";

export function InterfaceContainer({ children }: { children: ReactNode }) {
    return <div className="max-w-6xl mx-auto px-4 md:px-6 pb-8">{children}</div>;
}

export function UnequalSplit({ children }: { children: ReactNode }) {
    return <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-8">{children}</div>;
}

export function WiderContent({ children }: { children: ReactNode }) {
    return <div className="col-span-7">{children}</div>;
}

export function NarrowerContent({ children }: { children: ReactNode }) {
    return <div className="col-span-5">{children}</div>;
}

export function Sidebar({ children }: { children: ReactNode }) {
    return (
        <aside className="pt-6 lg:pt-0 flex flex-col">
            <div className="space-y-6">{children}</div>
        </aside>
    );
}

export function TwoColumn({ children }: { children: React.ReactNode }) {
    return (
        <div className="grid grid-rows-2 xs:grid-rows-1 xs:grid-cols-2 gap-6">
            {children}
        </div>
    );
}

export function InterfaceHeader({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col md:flex-row items-center justify-between rounded-lg py-6 mb-1 gap-4 md:pl-4">
            {children}
        </div>
    );
}

export function InterfaceSplit({ children }: { children: React.ReactNode }) {
    return <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-8">{children}</div>;
}

export function ResponsiveList({ children }: { children: React.ReactNode }) {
    return (
        <div className="w-full md:w-auto mt-4 md:mt-0 md:flex md:justify-center">
            <div className="flex flex-col md:flex-row gap-4">{children}</div>
        </div>
    );
}
