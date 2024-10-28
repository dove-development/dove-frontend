import AlertBanner from "./alert-banner";
import { TriangleAlert } from "lucide-react";

export default function ErrorBanner({
    error,
    buttonText,
    onClick,
    className
}: {
    error: string;
    buttonText: string;
    onClick: () => void;
    className?: string;
}) {
    return (
        <AlertBanner
            message={error || "Oops, something went wrong! Please try again."}
            button={{
                text: buttonText,
                onClick
            }}
            className={className}
            colorScheme="red"
            iconComponent={TriangleAlert}
        />
    );
}
