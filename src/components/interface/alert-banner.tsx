import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import React, { useState, useEffect, useRef, ReactNode } from "react";
import { Loader2 } from "lucide-react";

const colors = {
    red: {
        bg: "bg-red-900/50",
        text: "text-red-100",
        border: "border-red-700",
        button: "bg-red-800 hover:bg-red-900 text-red-100 border-red-700",
        icon: "text-red-300"
    },
    blue: {
        bg: "bg-blue-900/50",
        text: "text-blue-100",
        border: "border-blue-700",
        button: "bg-blue-800 hover:bg-blue-900 text-blue-100 border-blue-700",
        icon: "text-blue-300"
    },
    yellow: {
        bg: "bg-yellow-700/70",
        text: "text-yellow-50",
        border: "border-yellow-500",
        button: "bg-yellow-600 hover:bg-yellow-700 text-yellow-50 border-yellow-400 shadow-lg",
        icon: "text-yellow-100"
    }
};

export default function AlertBanner({
    message,
    button,
    className,
    colorScheme,
    iconComponent,
    error
}: {
    message: ReactNode;
    button?: {
        text: string;
        disabled?: boolean;
        loading?: boolean;
        onClick: () => void;
    };
    className?: string;
    colorScheme: "red" | "blue" | "yellow";
    iconComponent?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    error?: string;
}) {
    const [containerWidth, setContainerWidth] = useState(window.innerWidth);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const updateWidth = () => {
            if (containerRef.current) {
                setContainerWidth(containerRef.current.offsetWidth);
            }
        };

        updateWidth();
        window.addEventListener("resize", updateWidth);

        return () => window.removeEventListener("resize", updateWidth);
    }, []);

    const isWide = containerWidth >= 375;

    const colorClasses = colors[colorScheme];
    const IconComponent = iconComponent;

    return (
        <div
            ref={containerRef}
            className={cn(
                `w-full ${colorClasses.bg} ${colorClasses.text} rounded-lg border ${colorClasses.border} overflow-hidden`,
                className
            )}
            role="alert"
        >
            <div className="py-4 px-4">
                <div
                    className={cn(
                        "flex flex-col items-start justify-between overflow-x-hidden",
                        isWide && "flex-row items-center"
                    )}
                >
                    <div
                        className={cn(
                            "flex items-center space-x-4 mb-4",
                            isWide && "mb-0"
                        )}
                    >
                        {IconComponent && (
                            <IconComponent
                                className={`h-6 w-6 ${colorClasses.icon} flex-shrink-0`}
                            />
                        )}
                        <p className="text-base font-medium">
                            {message || "Oops, something went wrong! Please try again."}
                        </p>
                    </div>
                    {button && (
                        <div className={cn("w-full mt-0", isWide && "w-auto")}>
                            <Button
                                size="lg"
                                className={cn(
                                    `rounded-full w-full ${colorClasses.button}`,
                                    isWide && "w-auto"
                                )}
                                onClick={button.onClick}
                                disabled={!!button.disabled}
                            >
                                {button.loading && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                {button.text}
                            </Button>
                        </div>
                    )}
                </div>
            </div>
            {error && (
                <div
                    className={`px-4 py-2 ${colorClasses.bg} border-t ${colorClasses.border}`}
                >
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}
        </div>
    );
}
