import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface ListCardProps {
    items: { label: string; value: string | undefined }[];
}

export default function ListCard({ items }: ListCardProps) {
    return (
        <Card>
            <CardContent className="p-6 space-y-2">
                {items.map((item, index) => (
                    <div
                        key={index}
                        className="flex justify-between items-center text-base"
                    >
                        <p className="text-base font-medium">{item.label}</p>
                        {item.value ? (
                            <p className="text-base">{item.value}</p>
                        ) : (
                            <Skeleton className="w-20 h-5" />
                        )}
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
