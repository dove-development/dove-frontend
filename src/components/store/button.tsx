import React from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RefreshButtonProps {
    loading: boolean;
    refresh: () => void;
}

export function RefreshButton({ loading, refresh }: RefreshButtonProps) {
    return (
        <HeaderButton onClick={refresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </HeaderButton>
    );
}

interface HeaderButtonProps {
    children: React.ReactNode;
    onClick: () => void;
    disabled?: boolean;
}

export function HeaderButton({
    children,
    onClick,
    disabled = false
}: HeaderButtonProps) {
    return (
        <Button
            variant="outline"
            onClick={onClick}
            disabled={disabled}
            className="h-12 rounded-full"
        >
            {children}
        </Button>
    );
}
