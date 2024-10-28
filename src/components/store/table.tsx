import { TableHead, TableCell, TableRow } from "@/components/ui/table";

export function TableHeadLeft({ children }: { children: React.ReactNode }) {
    return (
        <TableHead className="pl-3 md:pl-6 pr-0 py-4 text-sm font-medium text-left">
            {children}
        </TableHead>
    );
}

export function TableHeadRight({ children }: { children: React.ReactNode }) {
    return (
        <TableHead className="pl-0 pr-3 md:pr-1 py-4 text-sm font-medium text-right">
            {children}
        </TableHead>
    );
}

export function TableHeadDesktop() {
    return <TableHead className="hidden md:table-cell p-0 w-0"></TableHead>;
}

export function TableCellLeft({ children }: { children: React.ReactNode }) {
    return <TableCell className="pl-3 md:pl-6 pr-0 py-4">{children}</TableCell>;
}

export function TableCellRight({ children }: { children: React.ReactNode }) {
    return (
        <TableCell className="pl-0 pr-3 md:pr-1 py-4 text-right">{children}</TableCell>
    );
}

export function TableRowMobileClickable({
    children,
    onClick
}: {
    children: React.ReactNode;
    onClick: () => void;
}) {
    return (
        <TableRow
            className="cursor-pointer md:cursor-default"
            onClick={(ev) => {
                if (window.getComputedStyle(ev.currentTarget).cursor === "pointer") {
                    onClick();
                }
            }}
        >
            {children}
        </TableRow>
    );
}

export function TableCellDesktop({ children }: { children: React.ReactNode }) {
    return <TableCell className="hidden md:table-cell">{children}</TableCell>;
}
