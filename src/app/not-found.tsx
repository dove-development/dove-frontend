import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center pt-32 bg-background text-foreground">
            <h1 className="text-6xl font-bold mb-4">404</h1>
            <p className="text-xl mb-8">Page not found.</p>
            <Button asChild>
                <Link href="/">Go back home</Link>
            </Button>
        </div>
    );
}
