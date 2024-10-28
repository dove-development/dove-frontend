"use client";

import React, {
    createContext,
    useContext,
    useEffect,
    useRef,
    useCallback,
    useState
} from "react";
import { useWallet } from "@/components/providers/wallet-provider";
import { Dove, useDove } from "@/components/providers/dove-provider";
import { Wallet } from "@/lib/wallet";
import { unwrap } from "@/lib/utils";
import { Hashable, HashMap } from "@/lib/structs/hash-map";
import { MOCK_BACKEND } from "@/lib/constants";

type CacheEntry = any | string;

export interface Cache<T, D extends Array<any>> extends Hashable {
    readonly userDependent: boolean;
    mock(): T;
    fetch(wallet: Wallet, dependencies: D): Promise<T>;
}

export type CacheAny = Cache<any, any>;

type CacheContextData = {
    wallet: Wallet;
    dove: Dove;
    state: React.RefObject<HashMap<CacheAny, CacheEntry>>;
    stateKey: number;
    setStateKey: (updater: (key: number) => number) => void;
    fetching: React.RefObject<HashMap<CacheAny, boolean>>;
    invalidate: (c: CacheAny[]) => void;
};

const CacheContext = createContext<CacheContextData | undefined>(undefined);

export function CacheProvider({ children }: { children: React.ReactNode }) {
    const wallet = useWallet();
    const dove = useDove();
    const state = useRef(new HashMap<CacheAny, CacheEntry>());
    const [stateKey, setStateKey] = useState(0);
    const fetching = useRef(new HashMap<CacheAny, boolean>());
    const invalidate = (c: CacheAny[]) => {
        let changed = false;
        for (const cc of c) {
            const deleted = state.current.remove(cc);
            changed ||= deleted;
        }
        if (changed) {
            setStateKey((k) => k + 1);
        }
    };
    useEffect(() => {
        let changed = false;
        state.current.forEach((_, c) => {
            if (c.userDependent) {
                state.current.remove(c);
                changed = true;
            }
        });
        if (changed) {
            setStateKey((k) => k + 1);
        }
    }, [wallet.connected]);

    return (
        <CacheContext.Provider
            value={{
                wallet,
                dove,
                state,
                stateKey,
                setStateKey,
                fetching,
                invalidate
            }}
        >
            {children}
        </CacheContext.Provider>
    );
}

function flattenUndefined<A extends any[]>(a: {
    [K in keyof A]: A[K] | undefined;
}): A | undefined {
    for (const e of a) {
        if (e === undefined) {
            return undefined;
        }
    }
    return a as A;
}

export function useCacheInvalidate() {
    const context = useContext(CacheContext);
    if (!context) {
        throw new Error("useLedger must be used within a LedgerProvider");
    }
    return context.invalidate;
}

export function useCache<T, D extends any[]>(
    cache: Cache<T, D>,
    dependencies: { [K in keyof D]: D[K] | undefined }
): [T | undefined, string] {
    const context = useContext(CacheContext);
    if (!context) {
        throw new Error("useCache must be used within a CacheProvider");
    }

    const { wallet, dove, state, stateKey, setStateKey, fetching } = context;

    useEffect(() => {
        if (MOCK_BACKEND) {
            return;
        }
        const flattenedDependencies = flattenUndefined(dependencies);
        if (!flattenedDependencies || !dove.initialized) {
            return;
        }

        const currentState = unwrap(state.current, "State is not initialized");
        if (currentState.get(cache)) {
            return;
        }

        const currentFetching = unwrap(fetching.current, "Fetching is not initialized");
        if (currentFetching.get(cache)) {
            return;
        }

        currentFetching.insert(cache, true);

        cache
            .fetch(wallet, flattenedDependencies)
            .then((value) => {
                currentState.insert(cache, value);
                setStateKey((prevKey) => prevKey + 1);
            })
            .catch((error) => {
                console.log(error);
                currentState.insert(
                    cache,
                    `Could not fetch ${cache.getHashCode()}: ${String(error)}`
                );
                setStateKey((prevKey) => prevKey + 1);
            })
            .finally(() => {
                currentFetching.insert(cache, false);
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stateKey, dove]);

    if (MOCK_BACKEND) {
        if (!dove.initialized) {
            return [undefined, ""];
        }
        return [cache.mock(), ""];
    }

    const flattenedDependencies = flattenUndefined(dependencies);
    if (!flattenedDependencies) {
        return [undefined, ""];
    }

    const currentState = unwrap(state.current, "State is not initialized");
    const value = currentState.get(cache);

    return typeof value === "string" ? [undefined, value] : [value, ""];
}
