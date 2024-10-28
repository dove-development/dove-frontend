import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Privacy | Dove",
    description: "The Privacy Policy for the Dove website"
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
