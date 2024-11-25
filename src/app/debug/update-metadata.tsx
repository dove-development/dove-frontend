import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Ledger from "@/lib/ledger";
import { PublicKey } from "@solana/web3.js";

export default function UpdateMetadata({
    ledger
}: {
    ledger: Ledger;
}) {
    const [mint, setMint] = useState("");
    const [name, setName] = useState("");
    const [symbol, setSymbol] = useState("");
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleUpdateMetadata = async () => {
        setLoading(true);
        setError(null);
        try {
            let mintPubkey: PublicKey;
            try {
                mintPubkey = new PublicKey(mint);
            } catch {
                throw new Error("Invalid mint address");
            }

            if (!name.trim() || !symbol.trim() || !url.trim()) {
                throw new Error("All fields are required");
            }

            await ledger.updateMetadata({
                mint: mintPubkey,
                name,
                symbol,
                url
            });
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="mt-8 shadow-lg bg-gray-800 border-gray-700">
            <CardHeader className="bg-gradient-to-r from-cyan-900 to-blue-900 text-white rounded-t-lg">
                <CardTitle className="text-2xl">Update Token Metadata</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                {error && (
                    <div className="mb-4 p-3 bg-red-900 text-red-200 rounded-md flex items-center">
                        <AlertCircle className="mr-2 h-5 w-5" />
                        <span>{error}</span>
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <Input
                            value={mint}
                            onChange={(e) => setMint(e.target.value)}
                            placeholder="Mint Address"
                            className="w-full"
                        />
                    </div>
                    <div>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Token Name"
                            className="w-full"
                        />
                    </div>
                    <div>
                        <Input
                            value={symbol}
                            onChange={(e) => setSymbol(e.target.value)}
                            placeholder="Token Symbol"
                            className="w-full"
                        />
                    </div>
                    <div>
                        <Input
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="Metadata URL"
                            className="w-full"
                        />
                    </div>
                    <Button
                        onClick={handleUpdateMetadata}
                        disabled={loading}
                        className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
                    >
                        {loading && (
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        )}
                        Update Metadata
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
