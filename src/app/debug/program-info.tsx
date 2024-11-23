import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import InfoItem from "./info-item";
import { PublicKey } from "@solana/web3.js";
import { DOVE_PROGRAM_ID } from "@/lib/constants";
import DvdCache from "@/lib/cache/dvd-cache";
import DoveCache from "@/lib/cache/dove-cache";
import WorldCache from "@/lib/cache/world-cache";

interface ProgramInfoProps {
    authorityKey: PublicKey | undefined;
    walletBalance: number;
    cacheError: any;
    dvdCache: any;
    doveCache: any;
    dvdMint: PublicKey | undefined;
    doveMint: PublicKey | undefined;
    ledger: any;
}

export default function ProgramInfo({
    authorityKey,
    walletBalance,
    cacheError,
    dvdCache,
    doveCache,
    dvdMint,
    doveMint,
    ledger
}: ProgramInfoProps) {
    return (
        <Card className="mb-8 shadow-lg bg-gray-800 border-gray-700">
            <CardHeader className="bg-gradient-to-r from-blue-900 to-purple-900 text-white rounded-t-lg">
                <CardTitle className="text-2xl">Program Information</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
                <InfoItem label="Program ID" value={DOVE_PROGRAM_ID.toBase58()} />
                <InfoItem
                    label="Authority Key"
                    value={authorityKey?.toBase58() || "Not created"}
                />
                <InfoItem label="Wallet Balance" value={`${walletBalance || 0} SOL`} />
                <InfoItem label="Cache Error" value={JSON.stringify(cacheError)} />
                <InfoItem
                    label="DVD Balance"
                    value={`${dvdCache?.balance || 0} DVD`}
                    onClick={() => ledger.invalidate([DvdCache])}
                    loading={!dvdCache && !cacheError}
                />
                <InfoItem
                    label="DOVE Balance"
                    value={`${doveCache?.balance || 0} DOVE`}
                    onClick={() => ledger.invalidate([DoveCache])}
                    loading={!doveCache && !cacheError}
                />
                <InfoItem
                    label="DVD Mint"
                    value={dvdMint?.toBase58() || "Not created"}
                />
                <InfoItem
                    label="DOVE Mint"
                    value={doveMint?.toBase58() || "Not created"}
                />
            </CardContent>
        </Card>
    );
}
