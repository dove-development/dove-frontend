import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import BuildInfo from "@/components/interface/build-info";
import Image from "next/image";

import doveCover from "@/images/dove_cover.png";
import doveUpright from "@/images/dove_upright.png";
import spotlight from "@/images/spotlight.jpg";
import decentralizedAssets from "@/images/decentralized_assets.png";
import stack from "@/images/stack.png";
import vault from "@/images/vault.png";
import doveToken from "@/images/dove_token.png";
import { JupiterLink } from "@/components/interface/jupiter-link";

export default function Home() {
    return (
        <main className="overflow-x-clip">
            <Image
                src={doveCover}
                alt="Dove background"
                className="hidden lg:block animate-fade-in absolute top-0 left-0 w-full h-full object-cover object-[75%_center] z-[-3]"
            />

            <Image
                src={doveUpright}
                alt="Dove background"
                className="block lg:hidden absolute top-0 left-0 w-full mt-[-6%] object-cover z-[-3]"
            />
            <section className="mx-auto mt-[calc(80vw-80px)] lg:mx-0 lg:mt-0 lg:mb-0 lg:px-0 lg:h-[calc(100vh-80px)] lg:pl-16 lg:flex lg:w-1/2 lg:items-center">
                <div className="text-center lg:text-left justify-end lg:mt-[-8%] lg:ml-auto px-0">
                    <h1 className="text-[40px] xxs:text-[48px] xs:text-[60px] sm:text-[72px] md:text-[80px] xl:text-[84px] 3xl:text-[96px] font-bold leading-none text-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                        <span
                            style={{
                                WebkitTextFillColor: "transparent",
                                WebkitTextStroke: "1px #FFFFFF"
                            }}
                        >
                            Solana&apos;s&nbsp;
                        </span>
                        <br />
                        <span className="text-shadow-[0_3px_6px_rgba(0,0,0,0.9)]">
                            decentralized
                        </span>
                        <br />
                        <span className="text-shadow-[0_3px_6px_rgba(0,0,0,0.9)]">
                            stablecoin
                        </span>
                    </h1>
                    <p className="text-lg mx-auto max-w-xl md:max-w-3xl lg:mx-0 lg:max-w-none px-8 md:text-xl md:px-24 lg:px-0 3xl:text-2xl mt-6 mb-8 text-shadow-[0_2px_4px_rgba(0,0,0,0.9)] text-center lg:text-left">
                        Dove USD (DVD) is a stable, decentralized currency backed
                        <br className="hidden lg:block" /> by on-chain assets.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start px-8 lg:px-0">
                        <Link href="/savings" className="w-full sm:w-auto">
                            <Button className="w-full sm:w-auto h-14 md:h-auto text-lg 3xl:text-xl rounded-full py-3 px-6 text-white shadow-xl transition-all duration-300 ease-in-out hover:shadow-3xl hover:-translate-y-1 bg-gradient-to-r from-emerald-400 to-green-500 hover:from-emerald-500 hover:to-green-600 border-none">
                                Earn at 7% APY
                            </Button>
                        </Link>
                        <Link href="/vault" className="w-full sm:w-auto">
                            <Button className="w-full sm:w-auto h-14 md:h-auto text-lg 3xl:text-xl rounded-full py-3 px-6 text-white shadow-xl transition-all duration-300 ease-in-out hover:shadow-3xl hover:-translate-y-1 bg-gradient-to-r from-blue-400 to-sky-500 hover:from-blue-500 hover:to-sky-600 border-none will-change-transform">
                                Borrow at 8% APY
                            </Button>
                        </Link>
                        <JupiterLink
                            outputMint={"Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB"}
                        >
                            <Button
                                variant="outline"
                                className="w-full sm:w-auto h-14 md:h-auto text-lg 3xl:text-xl rounded-full py-3 px-6 text-white shadow-xl transition-all duration-300 ease-in-out hover:shadow-3xl hover:-translate-y-1 bg-gradient-to-r from-purple-400 to-violet-500 hover:from-purple-500 hover:to-violet-600 border-none"
                            >
                                Swap for DVD
                            </Button>
                        </JupiterLink>
                    </div>
                </div>
            </section>

            <div className="lg:hidden">
                <div className="h-16 xxs:h-32 bg-gradient-to-b from-transparent to-background"></div>
                <div className="relative pt-16 xxs:pt-0">
                    <div className="absolute top-0 left-0 w-full h-[1440px] bg-background z-[-2]"></div>
                </div>
            </div>

            <div className="mx-auto lg:max-w-8xl lg:px-32">
                <div className="overflow-hidden mx-auto max-w-xl lg:max-w-none lg:mx-0 grid grid-cols-1 space-y-48 mb-48 lg:mb-12 lg:auto-rows-fr lg:grid-cols-1 lg:space-y-24">
                    <section className="grid grid-cols-1 lg:grid-cols-2 lg:gap-16 items-center px-8 lg:px-0 my-24">
                        <div className="pt-4 lg:pt-0 lg:pb-0 lg:order-1 order-2 flex flex-col justify-center text-center lg:text-left">
                            <h3 className="text-3xl sm:text-4xl leading-none pb-4 font-bold bg-gradient-to-r from-[#7175f7] via-[#d652d4] to-[#f54640] bg-clip-text text-transparent">
                                Fully decentralized
                            </h3>
                            <p className="text-lg lg:text-xl">
                                DVD is backed solely by decentralized assets,
                                eliminating reliance on centralized entities.
                            </p>
                        </div>
                        <div className="lg:order-2 order-1 relative w-full h-full">
                            <Image
                                src={spotlight}
                                alt="Spotlight background"
                                className="absolute top-0 left-0 w-full h-full object-contain"
                            />
                            <Image
                                src={decentralizedAssets}
                                alt="DVD Decentralized Assets"
                                className="relative w-full h-full object-contain transition-transform duration-1000 hover:-translate-y-[10px]"
                            />
                        </div>
                    </section>
                    <section className="lg:mb-0 grid grid-cols-1 lg:grid-cols-2 lg:gap-16 items-center relative">
                        <Image
                            src={stack}
                            alt="DVD Staking"
                            className="lg:hidden relative h-full w-[200%] object-cover max-w-none z-[-1]"
                        />
                        <Image
                            src={stack}
                            alt="DVD Staking"
                            className="hidden lg:block absolute top-0 left-0 w-full h-full object-cover z-[-1]"
                        />
                        <div className="lg:order-1 order-2"></div>
                        <div className="lg:order-2 order-1 flex flex-col justify-center h-full text-center lg:text-left mt-8 lg:mt-0 px-8 lg:px-0">
                            <h3 className="text-3xl sm:text-4xl leading-none pb-4 font-bold bg-gradient-to-r from-[#82def3] to-[#42acf5] bg-clip-text text-transparent">
                                Grow your wealth effortlessly
                            </h3>
                            <p className="text-lg lg:text-xl">
                                Save your DVD and watch your assets flourish with a
                                generous 7% APY. Your financial future blooms here,
                                nurtured by the power of decentralized finance.
                            </p>
                            <div className="mt-6">
                                <Button
                                    variant="secondary"
                                    className="w-full lg:w-auto h-14 lg:h-auto rounded-full py-3 px-6 text-lg bg-blue-500 hover:bg-blue-600 text-white"
                                >
                                    Earn at 7% APY
                                </Button>
                            </div>
                        </div>
                    </section>
                    <section className="lg:mb-0 grid grid-cols-1 lg:grid-cols-2 lg:gap-16 items-center relative">
                        <div className="lg:hidden w-full h-full relative">
                            <Image
                                src={vault}
                                alt="DVD Minting"
                                className="relative h-full w-[200%] ml-[-90%] object-cover max-w-none z-[-1]"
                            />
                        </div>
                        <Image
                            src={vault}
                            alt="DVD Minting"
                            className="hidden lg:block absolute top-0 left-0 w-full h-full object-cover z-[-1]"
                        />
                        <div className="lg:order-2 order-1"></div>
                        <div className="lg:order-1 order-2 flex flex-col justify-center h-full text-center lg:text-left mt-8 lg:mt-0 px-8 lg:px-0">
                            <h3 className="text-3xl sm:text-4xl leading-none pb-4 font-bold bg-gradient-to-r from-[#f9f295] to-[#e0aa3e] bg-clip-text text-transparent">
                                Unlock your assets&rsquo; potential
                            </h3>
                            <p className="text-lg lg:text-xl">
                                Mint DVD instantly by depositing your decentralized
                                assets as collateral.
                            </p>
                            <div className="mt-6">
                                <Button
                                    variant="secondary"
                                    className="w-full lg:w-auto h-14 lg:h-auto rounded-full py-3 px-6 text-lg bg-yellow-600 hover:bg-yellow-700 text-white"
                                >
                                    Borrow at 8% APY
                                </Button>
                            </div>
                        </div>
                    </section>
                    <section className="lg:mb-0 grid grid-cols-1 lg:grid-cols-2 lg:gap-16 items-center px-8 lg:px-0">
                        <div className="lg:order-2 order-2 text-center lg:text-left">
                            <h3 className="text-3xl sm:text-4xl leading-none pb-4 font-bold bg-gradient-to-r from-[#808080] to-[#D3D3D3] bg-clip-text text-transparent">
                                Governed by the community
                            </h3>
                            <p className="text-lg lg:text-xl mb-6">
                                Earn DOVE by borrowing or saving DVD. Participate in
                                Dove&nbsp;DAO governance to shape the protocol&rsquo;s
                                future. 100% of protocol surplus is used to buy back and
                                burn DOVE.
                            </p>
                            <div className="flex flex-col lg:flex-row lg:space-x-4 space-y-4 lg:space-y-0 justify-center lg:justify-start">
                                <a
                                    href="https://realms.vote"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full lg:w-auto"
                                >
                                    <Button
                                        variant="outline"
                                        className="w-full h-14 lg:h-auto rounded-full py-3 px-6 text-lg"
                                    >
                                        Cast your vote{" "}
                                        <ExternalLink className="ml-1 h-4 w-4" />
                                    </Button>
                                </a>
                                <JupiterLink
                                    outputMint={
                                        "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB"
                                    }
                                >
                                    <Button className="w-full h-14 lg:h-auto rounded-full py-3 px-6 text-lg bg-foreground text-background">
                                        Swap for DOVE
                                    </Button>
                                </JupiterLink>
                            </div>
                        </div>
                        <div className="w-full h-full lg:order-1 order-1 flex items-center justify-center">
                            <Image
                                src={doveToken}
                                alt="DVD Governance"
                                className="w-full h-auto max-w-full max-h-full object-contain"
                            />
                        </div>
                    </section>
                </div>
            </div>

            <footer className="max-w-auto md:max-w-6xl md:mx-auto">
                <div className="container border-y mx-auto px-8 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <img
                            src="/icons/dove_black.svg"
                            alt="Dove Logo"
                            className="h-16 w-16"
                        />
                        <div>
                            <h4 className="font-bold mb-4">Protocol</h4>
                            <ul className="space-y-2">
                                <li>
                                    <Link
                                        href="/vault"
                                        className="text-sm hover:underline"
                                    >
                                        Vault
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/savings"
                                        className="text-sm hover:underline"
                                    >
                                        Savings
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/governance"
                                        className="text-sm hover:underline"
                                    >
                                        Governance
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4">Resources</h4>
                            <ul className="space-y-2">
                                <li>
                                    <a href="/docs" className="text-sm hover:underline">
                                        Documentation
                                    </a>
                                </li>
                                <li>
                                    <a href="/faq" className="text-sm hover:underline">
                                        FAQ
                                    </a>
                                </li>
                                <li>
                                    <a href="/blog" className="text-sm hover:underline">
                                        Blog
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4">Community</h4>
                            <ul className="space-y-2">
                                <li>
                                    <a
                                        href="https://twitter.com/doveusd"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm hover:underline"
                                    >
                                        Twitter
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="https://github.com/doveusd"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm hover:underline"
                                    >
                                        GitHub
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="https://discord.gg/doveusd"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm hover:underline"
                                    >
                                        Discord
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="container mx-auto px-8 py-8 md:py-12">
                    <div className="flex flex-col md:flex-row justify-between items-center md:max-w-6xl md:mx-auto">
                        <BuildInfo
                            commitHash={process.env.COMMIT_HASH}
                            buildTimestamp={process.env.BUILD_TIMESTAMP}
                            href="https://github.com/doveprotocol/dove-frontend"
                        />
                        <div className="mt-6 md:mt-0">
                            <a href="/privacy" className="text-sm hover:underline mr-4">
                                Privacy Policy
                            </a>
                            <a href="/terms" className="text-sm hover:underline">
                                Terms of Service
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </main>
    );
}
