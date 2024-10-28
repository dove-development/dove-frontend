"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Rotate } from "hamburger-react";
import WalletButton from "../components/interface/wallet-button";

export default function Header() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    const toggleMenu = () => {
        setIsOpen((v) => !v);
    };

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }

        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    const navLinks = [
        { label: "Docs", href: "https://docs.dove.money", external: true },
        {
            label: "Governance",
            href: "https://governance.dove.money",
            external: true
        },
        { label: "Vault", href: "/vault" },
        { label: "Savings", href: "/savings" },
        { label: "Metrics", href: "/metrics" }
    ];

    return (
        <header className="px-4 md:px-6 pt-4 max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
                <Link
                    href="/"
                    className="flex items-center z-[2]"
                    onClick={() => setIsOpen(false)}
                >
                    <img
                        src="/icons/dove_black.svg"
                        alt="Dove Logo"
                        className="h-16 w-16"
                    />
                    <span className="sr-only">Dove</span>
                </Link>

                <nav className="hidden md:flex items-center">
                    {navLinks.map((link) => (
                        <Link
                            key={link.label}
                            href={link.href}
                            className={`text-md font-medium ml-8 relative group flex items-center ${pathname === link.href ? "text-primary rounded-md" : ""}`}
                            target={link.external ? "_blank" : undefined}
                            rel={link.external ? "noopener noreferrer" : undefined}
                        >
                            {link.label}
                            <span
                                className={`absolute left-0 right-0 bottom-0 h-0.5 bg-current transform origin-center transition-transform duration-300 ease-out ${pathname === link.href ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`}
                            ></span>
                        </Link>
                    ))}
                </nav>

                <div className="flex items-center">
                    <WalletButton className="z-[2] !rounded-full" />
                    <div className="md:hidden ml-6 z-[2]">
                        <Rotate
                            toggled={isOpen}
                            toggle={toggleMenu}
                            color="#e0e0e0"
                            size={30}
                            label="Menu"
                            duration={0.5}
                        />
                    </div>
                </div>
            </div>

            {/* Full-screen overlay menu */}
            <div
                className={`fixed inset-0 bg-background z-[1] transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            >
                <div className="flex flex-col h-full px-6 py-4">
                    {/* Navigation links */}
                    <nav className="flex flex-col items-center justify-center flex-grow space-y-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.label}
                                href={link.href}
                                className={`text-white hover:text-primary text-4xl font-medium transition-colors duration-300 flex items-center p-4 ${pathname === link.href ? "text-primary bg-primary/10 rounded-md" : ""}`}
                                onClick={toggleMenu}
                                target={link.external ? "_blank" : undefined}
                                rel={link.external ? "noopener noreferrer" : undefined}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                </div>
            </div>
        </header>
    );
}
