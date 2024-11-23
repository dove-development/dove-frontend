import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Stake | Dove",
    description: "Deposit DVD and earn rewards with Dove"
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
