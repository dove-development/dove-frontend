import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Savings | Dove",
    description: "Deposit DVD and earn interest with Dove"
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
