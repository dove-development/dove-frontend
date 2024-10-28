import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useState } from "react";

interface SetupButtonProps {
    onClick: () => Promise<void>;
    disabled: boolean;
    text: string;
    status: "created" | "not-created";
}

export default function SetupButton({
    onClick,
    disabled,
    text,
    status
}: SetupButtonProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleClick = async () => {
        setLoading(true);
        setError(null);
        try {
            await onClick();
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center space-x-4">
            <Button
                onClick={handleClick}
                disabled={disabled || loading}
                className="bg-green-700 hover:bg-green-600 text-white"
            >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {text}
            </Button>
            <span
                className={`flex items-center ${
                    status === "created" ? "text-green-400" : "text-red-400"
                }`}
            >
                {status === "created" ? (
                    <CheckCircle className="h-5 w-5 mr-1" />
                ) : (
                    <XCircle className="h-5 w-5 mr-1" />
                )}
                {status === "created" ? "Created" : "Not Created"}
            </span>
            {error && (
                <span className="flex items-center text-red-500">
                    <AlertCircle className="h-5 w-5 mr-1" />
                    {error}
                </span>
            )}
        </div>
    );
}
