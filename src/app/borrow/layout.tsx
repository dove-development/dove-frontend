import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Borrow | Dove",
    description: "Deposit your assets and borrow DVD with Dove"
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
