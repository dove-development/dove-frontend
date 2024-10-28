import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ReactNode } from "react";

interface ValueCardProps {
    label: string;
    value?: ReactNode;
}

export default function ValueCard({ label, value }: ValueCardProps) {
    return (
        <Card>
            <CardContent className="p-6 flex flex-col items-center">
                <p className="text-base font-medium mb-1">{label}</p>
                {value !== undefined ? (
                    <p className="text-3xl font-bold flex items-center">{value}</p>
                ) : (
                    <Skeleton className="w-20 h-7" />
                )}
            </CardContent>
        </Card>
    );
}
