import { Keypair, PublicKey } from "@solana/web3.js";
import { NATIVE_MINT } from "@solana/spl-token";
import { DEBUG } from "../constants";
import { Hashable } from "./hash-map";

export class Asset implements Hashable {
    public readonly name: string;
    public readonly symbol: string;
    public readonly icon: string;
    public readonly mint: PublicKey;
    public readonly pythOracle: PublicKey | undefined;
    public readonly debugPrice: number;
    public readonly debugKeypair: Keypair | undefined;
    public readonly isNative: boolean;

    constructor({
        name,
        symbol,
        icon,
        mint,
        pythOracle,
        debugPrice,
        isNative
    }: {
        name: string;
        symbol: string;
        icon: string;
        mint: PublicKey;
        pythOracle: PublicKey;
        debugPrice: number;
        isNative: boolean;
    }) {
        const debugKeypair =
            DEBUG && !isNative ? Keypair.fromSeed(Buffer.alloc(32, symbol)) : undefined;
        this.name = name;
        this.symbol = symbol;
        this.icon = icon;
        this.mint = debugKeypair?.publicKey || mint;
        this.pythOracle = DEBUG ? undefined : pythOracle;
        this.debugPrice = debugPrice;
        this.isNative = isNative;
        this.debugKeypair = debugKeypair;
    }

    public getHashCode() {
        return this.symbol;
    }

    public static readonly SOL = new Asset({
        name: "Solana",
        symbol: "SOL",
        icon: "icons/solana.svg",
        mint: NATIVE_MINT,
        pythOracle: new PublicKey("7UVimffxr9ow1uXYxsr4LHAcV58mLzhmwaeKvJ1pjLiE"),
        debugPrice: 159.23,
        isNative: true
    });

    public static readonly HNT = new Asset({
        name: "Helium",
        symbol: "HNT",
        icon: "icons/helium.svg",
        mint: new PublicKey("hntyVP6YFm1Hg25TN9WGLqM12b8TQmcknKrdu1oxWux"),
        pythOracle: new PublicKey("4DdmDswskDxXGpwHrXUfn2CNUm9rt21ac79GHNTN3J33"),
        debugPrice: 7.495,
        isNative: false
    });

    public static readonly PYTH = new Asset({
        name: "Pyth Network",
        symbol: "PYTH",
        icon: "icons/pyth.svg",
        mint: new PublicKey("HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3"),
        pythOracle: new PublicKey("8vjchtMuJNY4oFQdTi8yCe6mhCaNBFaUbktT482TpLPS"),
        debugPrice: 0.3566,
        isNative: false
    });

    public static readonly JUP = new Asset({
        name: "Jupiter",
        symbol: "JUP",
        icon: "icons/jupiter.svg",
        mint: new PublicKey("JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN"),
        pythOracle: new PublicKey("7dbob1psH1iZBS7qPsm3Kwbf5DzSXK8Jyg31CTgTnxH5"),
        debugPrice: 0.8971,
        isNative: false
    });

    public static readonly RENDER = new Asset({
        name: "Render",
        symbol: "RENDER",
        icon: "icons/render.svg",
        mint: new PublicKey("rndrizKT3MK1iimdxRdWabcF7Zg7AR5T4nud4EkHBof"),
        pythOracle: new PublicKey("HAm5DZhrgrWa12heKSxocQRyJWGCtXegC77hFQ8F5QTH"),
        debugPrice: 6.427,
        isNative: false
    });

    public static readonly LIST: Asset[] = [
        Asset.SOL,
        Asset.HNT,
        Asset.PYTH,
        Asset.JUP,
        Asset.RENDER
    ];

    public static readonly NOTHING = new Asset({
        name: "Nothing",
        symbol: "NOTHING",
        icon: "icons/nothing.svg",
        mint: new PublicKey("11111111111111111111111111111111"),
        pythOracle: new PublicKey("11111111111111111111111111111111"),
        debugPrice: 0,
        isNative: false
    });

    public static byMint(mint: PublicKey): Asset | undefined {
        return this.LIST.find((c) => c.mint.equals(mint));
    }

    public toString(): string {
        return `Asset{${this.name} ${this.symbol} ${this.mint.toBase58()} ${this.debugPrice} ${this.isNative}}`;
    }
}
