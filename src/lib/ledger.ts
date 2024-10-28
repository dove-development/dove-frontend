import {
    Keypair,
    PublicKey,
    SystemProgram,
    Transaction,
    TransactionInstruction
} from "@solana/web3.js";
import { Wallet } from "@/lib/wallet";
import {
    AuthorityType,
    createAssociatedTokenAccountInstruction,
    createCloseAccountInstruction,
    createInitializeMintInstruction,
    createMintToInstruction,
    createSetAuthorityInstruction,
    createSyncNativeInstruction,
    getAssociatedTokenAddressSync,
    getMinimumBalanceForRentExemptMint,
    MINT_SIZE,
    TOKEN_PROGRAM_ID
} from "@solana/spl-token";
import {
    PROGRAM_ID as METADATA_PROGRAM_ID,
    createCreateMetadataAccountV3Instruction
} from "@metaplex-foundation/mpl-token-metadata";
import {
    AccountWasm,
    AuctionConfig,
    AuthorityCreate,
    CollateralSetOracle,
    CollateralCreate,
    CollateralUpdateMaxDeposit,
    Config,
    OracleKind,
    SavingsCreate,
    SavingsDeposit,
    SavingsWithdraw,
    WorldCreate,
    UserFeed,
    UserFeedCreate,
    UserFeedSetPrice,
    VaultBorrow,
    VaultConfig,
    VaultCreate,
    VaultCreateReserve,
    VaultDeposit,
    VaultRepay,
    VaultWithdraw,
    BookConfig,
    Vault,
    Decimal,
    Schedule,
    OfferingConfig,
    FlashMintConfig,
    Oracle,
    ConfigUpdate,
    World,
    VaultClaimRewards,
    SavingsClaimRewards,
    StabilityCreate,
    StabilityUpdateMintLimit,
    StabilityBuyDvd,
    StabilitySellDvd,
    VaultUnliquidate,
    VaultBuyCollateral,
    VaultLiquidate,
    VaultFailAuction,
    VestingClaim,
    OfferingStart,
    OfferingEnd,
    OfferingBuy,
    Stability,
    FlashMintBegin,
    FlashMintEnd
} from "@/../pkg/dove";
import { DOVE_PROGRAM_ID } from "@/lib/constants";
import { solToLamports, unwrap } from "@/lib/utils";
import DvdCache from "@/lib/cache/dvd-cache";
import VaultCache from "@/lib/cache/vault-cache";
import WorldCache from "@/lib/cache/world-cache";
import CollateralCache from "@/lib/cache/collateral-cache";
import AssetCache from "@/lib/cache/asset-cache";
import { Asset } from "@/lib/structs/asset";
import { SavingsCache } from "@/lib/cache/savings-cache";
import AuthorityCache from "@/lib/cache/authority-cache";
import { CacheAny } from "@/components/providers/cache-provider";
import DoveCache from "@/lib/cache/dove-cache";
import StabilityCache from "@/lib/cache/stability-cache";
import Stablecoin from "@/lib/structs/stablecoin";
import StablecoinCache from "@/lib/cache/stablecoin-cache";

function makeInstruction(data: Uint8Array, accounts: AccountWasm[]) {
    const keys = accounts.map((account) => ({
        pubkey: new PublicKey(account.get_key()),
        isSigner: account.is_signer(),
        isWritable: account.is_writable()
    }));
    return new TransactionInstruction({
        keys,
        programId: DOVE_PROGRAM_ID,
        data: Buffer.from(data)
    });
}

export default class Ledger {
    private readonly wallet: Wallet;
    public readonly invalidate: (c: CacheAny[]) => void;

    public constructor(wallet: Wallet, invalidate: (c: CacheAny[]) => void) {
        this.wallet = wallet;
        this.invalidate = invalidate;
    }

    public async repayDvd(
        amount: number,
        maxAmount: number,
        world: World,
        vault: Vault,
        dvdCache: DvdCache
    ): Promise<void> {
        const pubkey = unwrap(this.wallet.pubkey, "Wallet not connected!");
        if (vault.isDebtZero || !amount) {
            return;
        }
        const target = maxAmount - amount;
        if (target < 0.02) {
            amount = 10 ** 12;
        }
        if (!dvdCache.hasTokenAccount) {
            throw new Error("Dvd token account not found");
        }
        amount = Math.min(amount, dvdCache.balance);
        const tx = new Transaction();
        tx.add(
            makeInstruction(
                VaultRepay.getData(amount),
                VaultRepay.getAccounts(
                    DOVE_PROGRAM_ID.toBuffer(),
                    pubkey.toBuffer(),
                    world.dvd.mint
                )
            )
        );
        await this.wallet.sendAndConfirmTransaction(tx);
        this.invalidate([DvdCache, VaultCache, WorldCache]);
    }

    public async borrowDvd(
        amount: number,
        world: World,
        vaultCache: VaultCache,
        dvdCache: DvdCache
    ): Promise<void> {
        const pubkey = unwrap(this.wallet.pubkey, "Wallet not connected!");
        unwrap(vaultCache.vault, "Vault not found");
        if (!amount) {
            return;
        }
        const tx = new Transaction();
        const dvdMint = new PublicKey(world.dvd.mint);
        if (!dvdCache.hasTokenAccount) {
            tx.add(
                createAssociatedTokenAccountInstruction(
                    pubkey,
                    getAssociatedTokenAddressSync(dvdMint, pubkey),
                    pubkey,
                    dvdMint
                )
            );
        }
        tx.add(
            makeInstruction(
                VaultBorrow.getData(amount),
                VaultBorrow.getAccounts(
                    DOVE_PROGRAM_ID.toBuffer(),
                    pubkey.toBuffer(),
                    dvdMint.toBuffer(),
                    vaultCache.reserveMints.map((mint) => mint.toBuffer()),
                    vaultCache.reserveOracles.map((oracle) => oracle.toBuffer())
                )
            )
        );
        await this.wallet.sendAndConfirmTransaction(tx);
        this.invalidate([DvdCache, VaultCache, WorldCache]);
    }

    public async claimRewards(
        world: World,
        doveCache: DoveCache,
        store: "vault" | "savings"
    ): Promise<void> {
        const tx = new Transaction();
        const pubkey = unwrap(this.wallet.pubkey, "Wallet not connected");
        const doveMint = new PublicKey(world.dove.mint);
        if (!doveCache.hasTokenAccount) {
            tx.add(
                createAssociatedTokenAccountInstruction(
                    pubkey,
                    getAssociatedTokenAddressSync(doveMint, pubkey),
                    pubkey,
                    doveMint
                )
            );
        }
        const claimCommand =
            store === "vault" ? VaultClaimRewards : SavingsClaimRewards;
        tx.add(
            makeInstruction(
                claimCommand.getData(),
                claimCommand.getAccounts(
                    DOVE_PROGRAM_ID.toBuffer(),
                    pubkey.toBuffer(),
                    doveMint.toBuffer()
                )
            )
        );
        await this.wallet.sendAndConfirmTransaction(tx);
        const claimCache = store === "vault" ? VaultCache : SavingsCache;
        this.invalidate([claimCache, WorldCache, DoveCache]);
    }

    public async depositAsset(
        asset: Asset,
        amount: number,
        assetAccountCache: AssetCache,
        vaultCache: VaultCache
    ): Promise<void> {
        const pubkey = unwrap(this.wallet.pubkey, "Wallet not connected!");
        if (amount <= 0) {
            return;
        }
        const assetAccount = unwrap(
            assetAccountCache.get(asset),
            `Can't find asset wallet for ${asset}`
        );
        const tx = new Transaction();
        if (asset.isNative && !assetAccount.hasTokenAccount) {
            const nativeAccount = getAssociatedTokenAddressSync(asset.mint, pubkey);
            tx.add(
                createAssociatedTokenAccountInstruction(
                    pubkey,
                    nativeAccount,
                    pubkey,
                    asset.mint
                ),
                SystemProgram.transfer({
                    fromPubkey: pubkey,
                    toPubkey: nativeAccount,
                    lamports: solToLamports(amount)
                }),
                createSyncNativeInstruction(nativeAccount)
            );
        }
        if (!vaultCache.vault) {
            tx.add(
                makeInstruction(
                    VaultCreate.getData(),
                    VaultCreate.getAccounts(
                        DOVE_PROGRAM_ID.toBuffer(),
                        pubkey.toBuffer()
                    )
                )
            );
        }
        if (vaultCache.reserveIndices.get(asset) === undefined) {
            tx.add(
                makeInstruction(
                    VaultCreateReserve.getData(),
                    VaultCreateReserve.getAccounts(
                        DOVE_PROGRAM_ID.toBuffer(),
                        pubkey.toBuffer(),
                        asset.mint.toBuffer()
                    )
                )
            );
        }
        tx.add(
            makeInstruction(
                VaultDeposit.getData(amount),
                VaultDeposit.getAccounts(
                    DOVE_PROGRAM_ID.toBuffer(),
                    pubkey.toBuffer(),
                    asset.mint.toBuffer()
                )
            )
        );
        if (asset.isNative && !assetAccount.hasTokenAccount) {
            const nativeAccount = getAssociatedTokenAddressSync(asset.mint, pubkey);
            tx.add(createCloseAccountInstruction(nativeAccount, pubkey, pubkey));
        }
        await this.wallet.sendAndConfirmTransaction(tx);
        this.invalidate([VaultCache, AssetCache, CollateralCache]);
    }
    public async withdrawAsset(
        asset: Asset,
        amount: number,
        assetAccountCache: AssetCache,
        vaultCache: VaultCache
    ): Promise<void> {
        const pubkey = unwrap(this.wallet.pubkey, "Wallet not connected!");
        if (amount <= 0) {
            return;
        }
        if (!vaultCache.vault) {
            throw new Error("No vault found");
        }
        const reserveIndex = vaultCache.reserveIndices.get(asset);
        if (reserveIndex === undefined) {
            throw new Error("Asset not in vault");
        }
        const tx = new Transaction();
        if (asset.isNative && !assetAccountCache.get(asset)?.hasTokenAccount) {
            const nativeAccount = getAssociatedTokenAddressSync(asset.mint, pubkey);
            tx.add(
                createAssociatedTokenAccountInstruction(
                    pubkey,
                    nativeAccount,
                    pubkey,
                    asset.mint
                )
            );
        }
        tx.add(
            makeInstruction(
                VaultWithdraw.getData(amount, reserveIndex),
                VaultWithdraw.getAccounts(
                    DOVE_PROGRAM_ID.toBuffer(),
                    pubkey.toBuffer(),
                    vaultCache.reserveMints.map((mint) => mint.toBuffer()),
                    vaultCache.reserveOracles.map((oracle) => oracle.toBuffer()),
                    reserveIndex
                )
            )
        );
        if (asset.isNative) {
            const nativeAccount = getAssociatedTokenAddressSync(asset.mint, pubkey);
            tx.add(createCloseAccountInstruction(nativeAccount, pubkey, pubkey));
        }
        await this.wallet.sendAndConfirmTransaction(tx);
        this.invalidate([VaultCache, AssetCache, CollateralCache]);
    }
    public async depositDvd(
        amount: number,
        world: World,
        savingsCache: SavingsCache
    ): Promise<void> {
        const pubkey = unwrap(this.wallet.pubkey, "Wallet not connected!");
        if (!amount) {
            return;
        }
        const tx = new Transaction();
        if (!savingsCache.savings) {
            tx.add(
                makeInstruction(
                    SavingsCreate.getData(),
                    SavingsCreate.getAccounts(
                        DOVE_PROGRAM_ID.toBuffer(),
                        pubkey.toBuffer()
                    )
                )
            );
        }
        tx.add(
            makeInstruction(
                SavingsDeposit.getData(amount),
                SavingsDeposit.getAccounts(
                    DOVE_PROGRAM_ID.toBuffer(),
                    pubkey.toBuffer(),
                    world.dvd.mint
                )
            )
        );
        await this.wallet.sendAndConfirmTransaction(tx);
        this.invalidate([SavingsCache, DvdCache, WorldCache]);
    }

    public async withdrawDvd(
        amount: number,
        world: World,
        savingsCache: SavingsCache
    ): Promise<void> {
        const pubkey = unwrap(this.wallet.pubkey, "Wallet not connected!");
        if (!amount) {
            return;
        }
        if (!savingsCache.savings) {
            throw new Error("No savings account found");
        }
        const tx = new Transaction();
        tx.add(
            makeInstruction(
                SavingsWithdraw.getData(amount),
                SavingsWithdraw.getAccounts(
                    DOVE_PROGRAM_ID.toBuffer(),
                    pubkey.toBuffer(),
                    world.dvd.mint
                )
            )
        );
        await this.wallet.sendAndConfirmTransaction(tx);
        this.invalidate([SavingsCache, DvdCache, WorldCache]);
    }

    public async liquidate(vaultCache: VaultCache, world: World, dvdCache: DvdCache) {
        const pubkey = unwrap(this.wallet.pubkey, "Wallet not connected!");
        const tx = new Transaction();
        const dvdMint = new PublicKey(world.dvd.mint);
        if (!dvdCache.hasTokenAccount) {
            tx.add(
                createAssociatedTokenAccountInstruction(
                    pubkey,
                    getAssociatedTokenAddressSync(dvdMint, pubkey),
                    pubkey,
                    dvdMint
                )
            );
        }
        tx.add(
            makeInstruction(
                VaultLiquidate.getData(),
                VaultLiquidate.getAccounts(
                    DOVE_PROGRAM_ID.toBuffer(),
                    pubkey.toBuffer(),
                    Vault.deriveKey(DOVE_PROGRAM_ID.toBuffer(), pubkey.toBuffer()),
                    dvdMint.toBuffer(),
                    vaultCache.reserveMints.map((mint) => mint.toBuffer()),
                    vaultCache.reserveOracles.map((oracle) => oracle.toBuffer())
                )
            )
        );
        await this.wallet.sendAndConfirmTransaction(tx);
        this.invalidate([VaultCache]);
    }

    public async unliquidate() {
        const pubkey = unwrap(this.wallet.pubkey, "Wallet not connected!");
        const tx = new Transaction();
        tx.add(
            makeInstruction(
                VaultUnliquidate.getData(),
                VaultUnliquidate.getAccounts(
                    Vault.deriveKey(DOVE_PROGRAM_ID.toBuffer(), pubkey.toBuffer())
                )
            )
        );
        await this.wallet.sendAndConfirmTransaction(tx);
        this.invalidate([VaultCache]);
    }

    public async buyCollateral(
        dvdAmount: number,
        world: World,
        dvdCache: DvdCache,
        vault: Vault,
        reserveIndex: number
    ) {
        const pubkey = unwrap(this.wallet.pubkey, "Wallet not connected!");
        const dvdMint = new PublicKey(world.dvd.mint);
        const reserve = vault.reserves[reserveIndex];
        if (!reserve) {
            throw new Error("Reserve not found");
        }
        const reserveMint = new PublicKey(reserve.mintKey);
        const asset = Asset.byMint(reserveMint);

        const tx = new Transaction();

        if (!dvdCache.hasTokenAccount) {
            tx.add(
                createAssociatedTokenAccountInstruction(
                    pubkey,
                    getAssociatedTokenAddressSync(dvdMint, pubkey),
                    pubkey,
                    dvdMint
                )
            );
        }

        if (asset && asset.isNative) {
            const nativeAccount = getAssociatedTokenAddressSync(reserveMint, pubkey);
            tx.add(
                createAssociatedTokenAccountInstruction(
                    pubkey,
                    nativeAccount,
                    pubkey,
                    reserveMint
                )
            );
        }

        tx.add(
            makeInstruction(
                VaultBuyCollateral.getData(dvdAmount, reserveIndex),
                VaultBuyCollateral.getAccounts(
                    DOVE_PROGRAM_ID.toBuffer(),
                    pubkey.toBuffer(),
                    Vault.deriveKey(DOVE_PROGRAM_ID.toBuffer(), pubkey.toBuffer()),
                    dvdMint.toBuffer(),
                    reserveMint.toBuffer()
                )
            )
        );

        if (asset && asset.isNative) {
            const nativeAccount = getAssociatedTokenAddressSync(reserveMint, pubkey);
            tx.add(createCloseAccountInstruction(nativeAccount, pubkey, pubkey));
        }

        await this.wallet.sendAndConfirmTransaction(tx);
        this.invalidate([VaultCache, DvdCache, AssetCache]);
    }

    public async failAuction(world: World) {
        const pubkey = unwrap(this.wallet.pubkey, "Wallet not connected!");
        const dvdMint = new PublicKey(world.dvd.mint);
        const tx = new Transaction();
        tx.add(
            makeInstruction(
                VaultFailAuction.getData(),
                VaultFailAuction.getAccounts(
                    DOVE_PROGRAM_ID.toBuffer(),
                    pubkey.toBuffer(),
                    Vault.deriveKey(DOVE_PROGRAM_ID.toBuffer(), pubkey.toBuffer()),
                    dvdMint.toBuffer()
                )
            )
        );
        await this.wallet.sendAndConfirmTransaction(tx);
        this.invalidate([VaultCache, DvdCache]);
    }

    public async createMint({
        name,
        symbol,
        decimals,
        initialSupply,
        mintAuthority,
        freezeAuthority,
        updateAuthority,
        createMetadata,
        metadataUrl,
        keypair
    }: {
        name: string;
        symbol: string;
        decimals: number;
        initialSupply: number;
        mintAuthority: PublicKey;
        freezeAuthority: PublicKey | null;
        updateAuthority: PublicKey | null;
        createMetadata: boolean;
        metadataUrl: string;
        keypair?: Keypair;
    }): Promise<PublicKey> {
        name = name.trim();
        symbol = symbol.trim();
        if (!name || !symbol) {
            throw new Error("Name and symbol are required");
        }
        const pubkey = unwrap(this.wallet.pubkey, "Wallet not connected!");
        const connection = unwrap(this.wallet.connection, "Wallet not connected!");
        const minBalance = await getMinimumBalanceForRentExemptMint(connection);
        const mintKeypair = keypair || Keypair.generate();
        const tx = new Transaction();
        // Create empty account for mint
        tx.add(
            SystemProgram.createAccount({
                fromPubkey: pubkey,
                newAccountPubkey: mintKeypair.publicKey,
                space: MINT_SIZE,
                lamports: minBalance,
                programId: TOKEN_PROGRAM_ID
            })
        );
        // Initialize empty account as mint
        // Set wallet.pubkey as initial mint authority
        // This is necessary because:
        // - metadata creation requires the authority as a signer
        // - we need to mint the initial supply
        // We'll transfer the authority to the intended mintAuthority afterwards
        tx.add(
            createInitializeMintInstruction(
                mintKeypair.publicKey,
                decimals,
                pubkey,
                freezeAuthority
            )
        );
        // Mint initial supply to wallet
        if (initialSupply > 0) {
            const ata = getAssociatedTokenAddressSync(mintKeypair.publicKey, pubkey);
            tx.add(
                createAssociatedTokenAccountInstruction(
                    pubkey,
                    ata,
                    pubkey,
                    mintKeypair.publicKey
                )
            );
            tx.add(
                createMintToInstruction(
                    mintKeypair.publicKey,
                    ata,
                    pubkey,
                    Decimal.numberToTokenAmount(initialSupply, decimals)
                )
            );
        }
        // Create metadata account
        if (createMetadata) {
            tx.add(
                createCreateMetadataAccountV3Instruction(
                    {
                        metadata: PublicKey.findProgramAddressSync(
                            [
                                Buffer.from("metadata"),
                                METADATA_PROGRAM_ID.toBuffer(),
                                mintKeypair.publicKey.toBuffer()
                            ],
                            METADATA_PROGRAM_ID
                        )[0],
                        mint: mintKeypair.publicKey,
                        mintAuthority: pubkey,
                        payer: pubkey,
                        updateAuthority:
                            updateAuthority || new PublicKey(new Uint8Array(32))
                    },
                    {
                        createMetadataAccountArgsV3: {
                            data: {
                                name: name,
                                symbol: symbol,
                                uri: metadataUrl,
                                sellerFeeBasisPoints: 0,
                                creators: null,
                                collection: null,
                                uses: null
                            },
                            isMutable: !!updateAuthority,
                            collectionDetails: null
                        }
                    }
                )
            );
        }
        // Transfer mint authority to intended authority
        if (!pubkey.equals(mintAuthority)) {
            tx.add(
                createSetAuthorityInstruction(
                    mintKeypair.publicKey,
                    pubkey,
                    AuthorityType.MintTokens,
                    mintAuthority,
                    []
                )
            );
        }
        await this.wallet.sendAndConfirmTransaction(tx, {
            signers: [mintKeypair]
        });
        this.invalidate([DoveCache, AssetCache]);
        return mintKeypair.publicKey;
    }

    public async createAuthority() {
        const pubkey = unwrap(this.wallet.pubkey, "Wallet not connected!");
        const tx = new Transaction();
        tx.add(
            makeInstruction(
                AuthorityCreate.getData(),
                AuthorityCreate.getAccounts(
                    DOVE_PROGRAM_ID.toBuffer(),
                    pubkey.toBuffer()
                )
            )
        );
        await this.wallet.sendAndConfirmTransaction(tx);
        this.invalidate([AuthorityCache]);
    }

    public async createWorld(debtTokenMint: PublicKey, equityTokenMint: PublicKey) {
        const pubkey = unwrap(this.wallet.pubkey, "Wallet not connected!");
        const tx = new Transaction();
        const userFeedIndex = 255;
        const initialDovePrice = 2.5;
        tx.add(
            makeInstruction(
                UserFeedCreate.getData(userFeedIndex),
                UserFeedCreate.getAccounts(
                    DOVE_PROGRAM_ID.toBuffer(),
                    pubkey.toBuffer(),
                    userFeedIndex
                )
            ),
            makeInstruction(
                UserFeedSetPrice.getData(initialDovePrice),
                UserFeedSetPrice.getAccounts(
                    DOVE_PROGRAM_ID.toBuffer(),
                    pubkey.toBuffer(),
                    userFeedIndex
                )
            )
        );
        const doveOracle = new Oracle(
            OracleKind.UserFeed,
            UserFeed.derive_key(
                DOVE_PROGRAM_ID.toBuffer(),
                pubkey.toBuffer(),
                userFeedIndex
            )
        );
        // emission: 300,000 DOVE over 1 year
        const debtSchedule = new Schedule(
            /* maximum */ 857.142857143,
            /* warmupLength */ 30,
            /* distributionLength */ 365
        );
        if (Math.round(debtSchedule.total_emission) !== 300_000) {
            throw new Error(
                "Debt schedule total emission is not 300,000, but " +
                    debtSchedule.total_emission
            );
        }
        // emission: 300,000 DOVE over 1 year
        const savingsSchedule = new Schedule(
            /* maximum */ 857.142857143,
            /* warmupLength */ 30,
            /* distributionLength */ 365
        );
        if (Math.round(savingsSchedule.total_emission) !== 300_000) {
            throw new Error(
                "Savings schedule total emission is not 300,000, but " +
                    savingsSchedule.total_emission
            );
        }
        // emission: 400,000 DOVE over 1 year
        const vestingSchedule = new Schedule(
            /* maximum */ 1142.85714286,
            /* warmupLength */ 30,
            /* distributionLength */ 365
        );
        if (Math.round(vestingSchedule.total_emission) !== 400_000) {
            throw new Error(
                "Vesting schedule total emission is not 400,000, but " +
                    vestingSchedule.total_emission
            );
        }
        tx.add(
            makeInstruction(
                WorldCreate.getData(
                    /* debtSchedule */ debtSchedule,
                    /* savingsSchedule */ savingsSchedule,
                    /* vestingRecipient */ pubkey.toBuffer(),
                    /* vestingSchedule */ vestingSchedule
                ),
                WorldCreate.getAccounts(
                    DOVE_PROGRAM_ID.toBuffer(),
                    pubkey.toBuffer(),
                    debtTokenMint.toBuffer(),
                    equityTokenMint.toBuffer()
                )
            )
        );
        const auctionConfig = new AuctionConfig(
            /* beginScale */ 1.5,
            /* decayRate */ 0.9995,
            /* endScale */ 0.15
        );
        const offeringConfig = new OfferingConfig(
            /* surplusLimit */ 100_000,
            /* deficitLimit */ 100_000,
            /* dvdOfferingSize */ 50_000,
            /* doveOfferingSize */ 10_000
        );
        const flashMintConfig = new FlashMintConfig(/* fee */ 0.0005, /* limit */ 0);
        const vaultConfig = new VaultConfig(
            /* liquidationPenaltyRate */ 0.05,
            /* liquidationRewardCap */ 1_000,
            /* liquidationRewardRate */ 0.025,
            /* auctionFailureRewardCap */ 1_000,
            /* auctionFailureRewardRate */ 0.005
        );
        const config = new Config(
            /* maxLtv */ 0.8,
            /* doveOracle */ doveOracle,
            /* auctionConfig */ auctionConfig,
            /* debtConfig */ new BookConfig(/* apy */ 0.08),
            /* flashMintConfig */ flashMintConfig,
            /* offeringConfig */ offeringConfig,
            /* savingsConfig */ new BookConfig(/* apy */ 0.07),
            /* vaultConfig */ vaultConfig
        );
        tx.add(
            makeInstruction(
                ConfigUpdate.getData(config),
                ConfigUpdate.getAccounts(DOVE_PROGRAM_ID.toBuffer(), pubkey.toBuffer())
            )
        );
        await this.wallet.sendAndConfirmTransaction(tx);
        this.invalidate([WorldCache]);
    }

    public async createCollateral(
        mint: PublicKey,
        maxDeposit: number,
        initialPrice: number,
        userFeedIndex: number
    ) {
        const pubkey = unwrap(this.wallet.pubkey, "Wallet not connected!");
        const tx = new Transaction();
        tx.add(
            makeInstruction(
                CollateralCreate.getData(),
                CollateralCreate.getAccounts(
                    DOVE_PROGRAM_ID.toBuffer(),
                    pubkey.toBuffer(),
                    mint.toBuffer()
                )
            ),
            makeInstruction(
                CollateralUpdateMaxDeposit.getData(maxDeposit),
                CollateralUpdateMaxDeposit.getAccounts(
                    DOVE_PROGRAM_ID.toBuffer(),
                    pubkey.toBuffer(),
                    mint.toBuffer()
                )
            ),
            makeInstruction(
                UserFeedCreate.getData(userFeedIndex),
                UserFeedCreate.getAccounts(
                    DOVE_PROGRAM_ID.toBuffer(),
                    pubkey.toBuffer(),
                    userFeedIndex
                )
            ),
            makeInstruction(
                UserFeedSetPrice.getData(initialPrice),
                UserFeedSetPrice.getAccounts(
                    DOVE_PROGRAM_ID.toBuffer(),
                    pubkey.toBuffer(),
                    userFeedIndex
                )
            ),
            makeInstruction(
                CollateralSetOracle.getData(
                    OracleKind.UserFeed,
                    UserFeed.derive_key(
                        DOVE_PROGRAM_ID.toBuffer(),
                        pubkey.toBuffer(),
                        userFeedIndex
                    )
                ),
                CollateralSetOracle.getAccounts(
                    DOVE_PROGRAM_ID.toBuffer(),
                    pubkey.toBuffer(),
                    mint.toBuffer()
                )
            )
        );
        await this.wallet.sendAndConfirmTransaction(tx);
        this.invalidate([CollateralCache, AssetCache]);
    }

    public async createStability(mint: PublicKey, mintLimit: number): Promise<void> {
        const pubkey = unwrap(this.wallet.pubkey, "Wallet not connected!");
        const tx = new Transaction();

        tx.add(
            makeInstruction(
                StabilityCreate.getData(),
                StabilityCreate.getAccounts(
                    DOVE_PROGRAM_ID.toBuffer(),
                    pubkey.toBuffer(),
                    mint.toBuffer()
                )
            ),
            makeInstruction(
                StabilityUpdateMintLimit.getData(mintLimit),
                StabilityUpdateMintLimit.getAccounts(
                    DOVE_PROGRAM_ID.toBuffer(),
                    pubkey.toBuffer(),
                    mint.toBuffer()
                )
            )
        );

        await this.wallet.sendAndConfirmTransaction(tx);
        this.invalidate([StabilityCache, StablecoinCache, AssetCache]);
    }

    public async buyDvd(
        amount: number,
        stablecoin: Stablecoin,
        world: World,
        dvdCache: DvdCache
    ) {
        const pubkey = unwrap(this.wallet.pubkey, "Wallet not connected!");
        const tx = new Transaction();
        const dvdMint = new PublicKey(world.dvd.mint);
        if (!dvdCache.hasTokenAccount) {
            const account = getAssociatedTokenAddressSync(dvdMint, pubkey);
            tx.add(
                createAssociatedTokenAccountInstruction(
                    pubkey,
                    account,
                    pubkey,
                    dvdMint
                )
            );
        }
        tx.add(
            makeInstruction(
                StabilityBuyDvd.getData(amount),
                StabilityBuyDvd.getAccounts(
                    DOVE_PROGRAM_ID.toBuffer(),
                    pubkey.toBuffer(),
                    stablecoin.mint.toBuffer(),
                    dvdMint.toBuffer()
                )
            )
        );
        await this.wallet.sendAndConfirmTransaction(tx);
        this.invalidate([StabilityCache, DvdCache]);
    }

    public async sellDvd(
        amount: number,
        stablecoin: Stablecoin,
        world: World,
        stablecoinInfoCache: StablecoinCache
    ) {
        const pubkey = unwrap(this.wallet.pubkey, "Wallet not connected!");
        const tx = new Transaction();
        if (!stablecoinInfoCache.get(stablecoin)?.hasTokenAccount) {
            const account = getAssociatedTokenAddressSync(stablecoin.mint, pubkey);
            tx.add(
                createAssociatedTokenAccountInstruction(
                    pubkey,
                    account,
                    pubkey,
                    stablecoin.mint
                )
            );
        }
        tx.add(
            makeInstruction(
                StabilitySellDvd.getData(amount),
                StabilitySellDvd.getAccounts(
                    DOVE_PROGRAM_ID.toBuffer(),
                    pubkey.toBuffer(),
                    world.dvd.mint,
                    stablecoin.mint.toBuffer()
                )
            )
        );
        await this.wallet.sendAndConfirmTransaction(tx);
        this.invalidate([StabilityCache, DvdCache]);
    }

    public async setCollateralPrice(price: number, userFeedIndex: number) {
        const pubkey = unwrap(this.wallet.pubkey, "Wallet not connected!");
        const tx = new Transaction();
        tx.add(
            makeInstruction(
                UserFeedSetPrice.getData(price),
                UserFeedSetPrice.getAccounts(
                    DOVE_PROGRAM_ID.toBuffer(),
                    pubkey.toBuffer(),
                    userFeedIndex
                )
            )
        );
        await this.wallet.sendAndConfirmTransaction(tx);
        this.invalidate([CollateralCache]);
    }

    public async setCollateralMaxDeposit(maxDeposit: number, asset: Asset) {
        const pubkey = unwrap(this.wallet.pubkey, "Wallet not connected!");
        const tx = new Transaction();
        tx.add(
            makeInstruction(
                CollateralUpdateMaxDeposit.getData(maxDeposit),
                CollateralUpdateMaxDeposit.getAccounts(
                    DOVE_PROGRAM_ID.toBuffer(),
                    pubkey.toBuffer(),
                    asset.mint.toBuffer()
                )
            )
        );
        await this.wallet.sendAndConfirmTransaction(tx);
        this.invalidate([CollateralCache]);
    }

    public async claimVesting(world: World, doveCache: DoveCache) {
        const pubkey = unwrap(this.wallet.pubkey, "Wallet not connected!");
        const tx = new Transaction();
        const doveMint = new PublicKey(world.dove.mint);
        if (!doveCache.hasTokenAccount) {
            const account = getAssociatedTokenAddressSync(doveMint, pubkey);
            tx.add(
                createAssociatedTokenAccountInstruction(
                    pubkey,
                    account,
                    pubkey,
                    doveMint
                )
            );
        }
        tx.add(
            makeInstruction(
                VestingClaim.getData(),
                VestingClaim.getAccounts(
                    DOVE_PROGRAM_ID.toBuffer(),
                    pubkey.toBuffer(),
                    doveMint.toBuffer()
                )
            )
        );
        await this.wallet.sendAndConfirmTransaction(tx);
        this.invalidate([WorldCache, DoveCache]);
    }

    public async startOffering(world: World) {
        const oracleKey = new PublicKey(world.config.doveOracle.key);
        const tx = new Transaction();
        tx.add(
            makeInstruction(
                OfferingStart.getData(),
                OfferingStart.getAccounts(
                    DOVE_PROGRAM_ID.toBuffer(),
                    oracleKey.toBuffer()
                )
            )
        );
        await this.wallet.sendAndConfirmTransaction(tx);
        this.invalidate([WorldCache]);
    }

    public async buyOffering(
        amount: number,
        world: World,
        dvdCache: DvdCache,
        doveCache: DoveCache
    ) {
        const pubkey = unwrap(this.wallet.pubkey, "Wallet not connected!");
        const tx = new Transaction();
        amount = Math.min(amount, dvdCache.balance);
        const dvdMint = new PublicKey(world.dvd.mint);
        if (!dvdCache.hasTokenAccount) {
            const account = getAssociatedTokenAddressSync(dvdMint, pubkey);
            tx.add(
                createAssociatedTokenAccountInstruction(
                    pubkey,
                    account,
                    pubkey,
                    dvdMint
                )
            );
        }
        const doveMint = new PublicKey(world.dove.mint);
        if (!doveCache.hasTokenAccount) {
            const account = getAssociatedTokenAddressSync(doveMint, pubkey);
            tx.add(
                createAssociatedTokenAccountInstruction(
                    pubkey,
                    account,
                    pubkey,
                    doveMint
                )
            );
        }
        tx.add(
            makeInstruction(
                OfferingBuy.getData(amount),
                OfferingBuy.getAccounts(
                    DOVE_PROGRAM_ID.toBuffer(),
                    pubkey.toBuffer(),
                    dvdMint.toBuffer(),
                    doveMint.toBuffer()
                )
            )
        );
        await this.wallet.sendAndConfirmTransaction(tx);
        this.invalidate([WorldCache, DvdCache, DoveCache]);
    }

    public async endOffering() {
        const tx = new Transaction();
        tx.add(
            makeInstruction(
                OfferingEnd.getData(),
                OfferingEnd.getAccounts(DOVE_PROGRAM_ID.toBuffer())
            )
        );
        await this.wallet.sendAndConfirmTransaction(tx);
        this.invalidate([WorldCache]);
    }

    public async setStabilityMintLimit(mintLimit: number, stability: Stability) {
        const pubkey = unwrap(this.wallet.pubkey, "Wallet not connected!");
        const tx = new Transaction();
        const stabilityMint = new PublicKey(stability.mintKey);
        tx.add(
            makeInstruction(
                StabilityUpdateMintLimit.getData(mintLimit),
                StabilityUpdateMintLimit.getAccounts(
                    DOVE_PROGRAM_ID.toBuffer(),
                    pubkey.toBuffer(),
                    stabilityMint.toBuffer()
                )
            )
        );
        await this.wallet.sendAndConfirmTransaction(tx);
        this.invalidate([StabilityCache]);
    }

    public async flashMint(
        amount: number,
        world: World,
        dvdCache: DvdCache,
        includeBegin: boolean,
        includeEnd: boolean
    ) {
        const pubkey = unwrap(this.wallet.pubkey, "Wallet not connected!");
        const tx = new Transaction();
        const dvdMintKey = new PublicKey(world.dvd.mint);
        if (!dvdCache.hasTokenAccount) {
            const account = getAssociatedTokenAddressSync(dvdMintKey, pubkey);
            tx.add(
                createAssociatedTokenAccountInstruction(
                    pubkey,
                    account,
                    pubkey,
                    dvdMintKey
                )
            );
        }
        if (includeBegin) {
            tx.add(
                makeInstruction(
                    FlashMintBegin.getData(amount),
                    FlashMintBegin.getAccounts(
                        DOVE_PROGRAM_ID.toBuffer(),
                        pubkey.toBuffer(),
                        dvdMintKey.toBuffer()
                    )
                )
            );
        }
        if (includeEnd) {
            tx.add(
                makeInstruction(
                    FlashMintEnd.getData(),
                    FlashMintEnd.getAccounts(
                        DOVE_PROGRAM_ID.toBuffer(),
                        pubkey.toBuffer(),
                        dvdMintKey.toBuffer()
                    )
                )
            );
        }
        await this.wallet.sendAndConfirmTransaction(tx);
        this.invalidate([WorldCache, DvdCache]);
    }

    public async setConfig(config: Config) {
        const pubkey = unwrap(this.wallet.pubkey, "Wallet not connected!");
        const tx = new Transaction();
        tx.add(
            makeInstruction(
                ConfigUpdate.getData(config),
                ConfigUpdate.getAccounts(DOVE_PROGRAM_ID.toBuffer(), pubkey.toBuffer())
            )
        );
        await this.wallet.sendAndConfirmTransaction(tx);
        this.invalidate([WorldCache]);
    }
}
