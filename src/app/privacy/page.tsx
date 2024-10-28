import React from "react";
import Link from "next/link";

export default function Privacy() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
            <p className="mb-4">Last updated: 27 September 2024</p>

            <section className="mb-6">
                <h2 className="text-2xl font-semibold mb-3">1. Data We Collect</h2>
                <p>We collect minimal data from users:</p>
                <ul className="list-disc list-inside ml-4">
                    <li>
                        IP Addresses: For analyzing traffic patterns and security
                        purposes.
                    </li>
                    <li>
                        Solana Network Data: Cached to optimize read calls and reduce
                        compute costs.
                    </li>
                </ul>
            </section>

            <section className="mb-6">
                <h2 className="text-2xl font-semibold mb-3">2. How We Use Your Data</h2>
                <p>The data we collect is used only for:</p>
                <ul className="list-disc list-inside ml-4">
                    <li>Analyzing traffic patterns and securing our servers.</li>
                    <li>Optimizing read calls to the Solana network.</li>
                </ul>
            </section>

            <section className="mb-6">
                <h2 className="text-2xl font-semibold mb-3">3. Your Rights</h2>
                <p>
                    You have the right to request a copy, correction, or deletion of
                    your personal data. Contact us at{" "}
                    <Link
                        href="mailto:privacy@dove.swap"
                        className="text-blue-500 hover:underline"
                    >
                        privacy@dove.swap
                    </Link>{" "}
                    to exercise these rights.
                </p>
            </section>

            <section className="mb-6">
                <h2 className="text-2xl font-semibold mb-3">
                    4. Changes to This Policy
                </h2>
                <p>
                    We may update this Privacy Policy periodically. Check this page for
                    the latest version.
                </p>
            </section>

            <section>
                <h2 className="text-2xl font-semibold mb-3">5. Contact Us</h2>
                <p>
                    If you have any questions about this Privacy Policy, please contact
                    us at{" "}
                    <Link
                        href="mailto:privacy@dove.swap"
                        className="text-blue-500 hover:underline"
                    >
                        privacy@dove.swap
                    </Link>
                    .
                </p>
            </section>
        </div>
    );
}
