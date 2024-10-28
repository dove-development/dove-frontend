import { Loader2 } from "lucide-react";

// Add types for LoadingIndicator props
interface LoadingIndicatorProps {
    message: string;
}

export default function LoadingIndicator({ message }: LoadingIndicatorProps) {
    return (
        <div className="mt-8 p-4 bg-blue-900 border border-blue-700 rounded-md flex items-center">
            <Loader2 className="h-6 w-6 animate-spin text-blue-400 mr-3" />
            <p className="text-blue-300 font-medium">{message}</p>
        </div>
    );
}
