import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

// Add types for InfoItem props
interface InfoItemProps {
    label: string;
    value: string;
    onClick?: () => void;
    loading?: boolean;
}

export default function InfoItem({ label, value, onClick, loading }: InfoItemProps) {
    return (
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2">
            <span className="font-semibold text-gray-300">{label}:</span>
            {onClick ? (
                <Button
                    onClick={onClick}
                    variant="link"
                    className="p-0 h-auto font-normal text-blue-400 hover:text-blue-300 text-left break-all"
                    disabled={loading}
                >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : value}
                </Button>
            ) : (
                <span className="text-gray-400 break-all">{value}</span>
            )}
        </div>
    );
}
