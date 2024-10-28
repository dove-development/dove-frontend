import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Terms | Dove",
    description: "The Terms of Service for the Dove website"
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
