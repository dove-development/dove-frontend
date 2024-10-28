import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Metrics | Dove",
    description: "Metrics for the Dove protocol"
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
