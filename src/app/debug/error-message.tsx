// Add types for ErrorMessage props
interface ErrorMessageProps {
    message: string;
}

export default function ErrorMessage({ message }: ErrorMessageProps) {
    return (
        <div className="mt-8 p-4 bg-red-900 border border-red-700 rounded-md">
            <h3 className="text-lg font-semibold text-red-300 mb-2">Error</h3>
            <p className="text-red-400">{message}</p>
        </div>
    );
}
