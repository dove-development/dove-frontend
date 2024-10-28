import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Debug | Dove",
    description: "Debugging tools for the Dove protocol"
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
