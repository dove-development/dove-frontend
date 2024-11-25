import { PublicKey } from "@solana/web3.js";

export const DOVE_PROGRAM_ID = new PublicKey(
    "4VTAkPgexLTY4bTqAEvuZdqyyD5ei4ePJ9FaSSDXHaVL"
);
export const RPC_URL = "https://rpc.dove.money";
export const ASSET_DECIMALS = 4;
export const DEBUG = false;
export const MOCK_BACKEND = false;

// For instant loading
export const DVD_INTEREST_RATE = 0.07;
export const DVD_BORROW_RATE = 0.08;
export const TVL = DEBUG ? 5682520334 : 89.41;

export const DVD_TRADE_MINT = "3k32iFf2MHNp7ZRJWv3ksjoTKnPJDRQybwrahfCHhixw";
export const DOVE_TRADE_MINT = "FZUBBztCWKHUdjdWgkPNYPLbnVcaxTwPjobawKAnRXut";
export const USDC_TRADE_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";