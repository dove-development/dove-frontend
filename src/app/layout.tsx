import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Header from "@/app/header";
import { CacheProvider } from "@/components/providers/cache-provider";
import { WalletProvider } from "@/components/providers/wallet-provider";
import { RPC_URL } from "@/lib/constants";
import { DoveProvider } from "@/components/providers/dove-provider";
import { LedgerProvider } from "@/components/providers/ledger-provider";
const font = localFont({
    src: "../fonts/Inter.woff2"
});
import Script from "next/script";

export const metadata: Metadata = {
    title: "Home | Dove",
    description:
        "The Dove protocol enables the creation of Dove USD (DVD), Solana's decentralized stablecoin."
};

export default function Layout({
    children
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={font.className}>
                <WalletProvider rpcUrl={RPC_URL}>
                    <DoveProvider>
                        <CacheProvider>
                            <LedgerProvider>
                                <Header />
                                {children}
                            </LedgerProvider>
                        </CacheProvider>
                    </DoveProvider>
                </WalletProvider>
                <Script src="/main-v3.js" />
            </body>
        </html>
    );
}
