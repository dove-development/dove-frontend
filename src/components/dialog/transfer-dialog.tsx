"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogFooter,
    AlertDialogOverlay,
    AlertDialogDescription
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
    AlertCircle,
    AlertTriangle,
    InfoIcon,
    Loader2,
    ChevronLeft
} from "lucide-react";
import DialogAmount from "@/lib/structs/dialog-amount";
import { useMediaQuery } from "usehooks-ts";

interface TransferDialogProps {
    open: boolean;
    close: () => void;
    amount: number;
    setAmount: (amount: number) => void;
    title: string;
    max: number;
    decimals: number;
    stats: {
        label: string;
        value: string;
    }[];
    execute: (amount: number) => Promise<void>;
    warning?: React.ReactNode;
    children?: React.ReactNode;
}

export default function TransferDialog({
    open,
    close,
    amount,
    setAmount,
    title,
    max,
    decimals,
    stats,
    execute,
    warning,
    children
}: TransferDialogProps) {
    const [dialogAmount, setDialogAmount] = useState(DialogAmount.zero(decimals));
    useEffect(() => {
        setDialogAmount((d) => {
            if (d.eq(amount)) {
                return d;
            }
            return DialogAmount.fromNumber(amount, decimals).max(0).min(max);
        });
    }, [amount]);
    function updateDialogAmount(newDialogAmount: DialogAmount) {
        setDialogAmount(newDialogAmount);
        setAmount(newDialogAmount.toNumber());
    }

    const [warningCopy, setWarningCopy] = useState(warning);
    const warningAlertRef = useRef<HTMLDivElement>(null);
    const [warningHeight, setWarningHeight] = useState(warning ? "auto" : "0px");
    useEffect(() => {
        if (!warningAlertRef.current) {
            return;
        }
        if (!warning) {
            setWarningHeight("0px");
            return;
        }
        setWarningCopy(warning);
        setWarningHeight(`${warningAlertRef.current.clientHeight + 1}px`);
    }, [warning]);

    const [error, setError] = useState<string>("");
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        if (open) {
            setError("");
            setLoading(false);
            updateDialogAmount(DialogAmount.zero(decimals));
            setWarningCopy(undefined);
        }
    }, [open]);

    const isMobile = useMediaQuery("(max-width: 768px)");
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <></>;
    }

    const dialogContent = (
        <>
            <div className="space-y-6 my-2">
                <div className="flex items-center gap-2">
                    <Input
                        type="string"
                        value={dialogAmount.toString()}
                        onChange={(e) => {
                            const a = DialogAmount.fromString(e.target.value, decimals)
                                .max(0)
                                .min(max);
                            updateDialogAmount(a);
                        }}
                        className="text-2xl font-bold flex-grow"
                    />
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            const maxAmount = DialogAmount.fromNumber(max, decimals);
                            updateDialogAmount(maxAmount);
                        }}
                        className="whitespace-nowrap h-10"
                    >
                        Max
                    </Button>
                </div>
                {children}
                <div className="space-y-2 text-sm">
                    {stats.map(({ label, value }) => (
                        <div key={label} className="flex justify-between">
                            <span>{label}</span>
                            <span className="font-medium">{value}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div
                className={`transition-all duration-500 ease-in-out overflow-hidden ${!warning ? "my-0" : "my-2"}`}
                style={{
                    height: warningHeight
                }}
            >
                <Alert
                    ref={warningAlertRef}
                    variant="destructive"
                    className="border-yellow-600 bg-yellow-50 text-yellow-800"
                >
                    <AlertTitle className="font-semibold flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Warning
                    </AlertTitle>
                    <AlertDescription className="mt-1">
                        {warningCopy || warning}
                    </AlertDescription>
                </Alert>
            </div>
            {error && (
                <Alert
                    variant="destructive"
                    className="border-red-600 bg-red-50 text-red-800 overflow-x-hidden my-2"
                >
                    <AlertTitle className="font-semibold flex items-center gap-2 mb-1">
                        <AlertCircle className="h-4 w-4" />
                        Error
                    </AlertTitle>
                    <AlertDescription className="mt-1 max-h-24 overflow-y-auto overflow-x-hidden w-full scrollbar-hide">
                        {error}
                    </AlertDescription>
                </Alert>
            )}
            <div className="flex flex-row justify-end gap-4 mt-4">
                <Button
                    disabled={loading}
                    variant="outline"
                    onClick={() => {
                        close();
                        updateDialogAmount(DialogAmount.zero(decimals));
                    }}
                    className="px-6 rounded-full w-full md:w-auto"
                >
                    Cancel
                </Button>
                <Button
                    disabled={
                        loading ||
                        dialogAmount.lt(0.00001) ||
                        dialogAmount.gt(max + 0.00001)
                    }
                    onClick={() => {
                        setLoading(true);
                        execute(dialogAmount.toNumber())
                            .then(() => {
                                close();
                                updateDialogAmount(DialogAmount.zero(decimals));
                            })
                            .catch((error) => {
                                setError(error?.message || "Unknown error");
                            })
                            .finally(() => {
                                setLoading(false);
                            });
                    }}
                    className="px-6 rounded-full w-full md:w-auto"
                >
                    {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    Confirm
                </Button>
            </div>
        </>
    );

    if (isMobile) {
        return (
            <div
                className={`fixed inset-0 bg-background z-40 transition-opacity duration-300 ease-in-out ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                style={{ transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)" }}
            >
                <div className="flex justify-center h-full">
                    <div
                        className={`p-6 transition-transform duration-300 ease-in-out ${open ? "translate-y-0" : "translate-y-full"} max-w-[450px] w-full`}
                        style={{
                            transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)"
                        }}
                    >
                        <Button variant="ghost" onClick={close} className="mb-4">
                            <ChevronLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                        <div className="grid gap-0">
                            <h2 className="text-xl font-bold">{title}</h2>
                            {dialogContent}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <AlertDialog open={open} onOpenChange={(v) => !v && close()}>
            <AlertDialogContent className="w-full max-w-md rounded-lg gap-0">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-xl font-bold mb-2">
                        {title}
                    </AlertDialogTitle>
                </AlertDialogHeader>
                <AlertDialogDescription className="sr-only">
                    {title} dialog
                </AlertDialogDescription>
                {dialogContent}
            </AlertDialogContent>
            <AlertDialogOverlay />
        </AlertDialog>
    );
}
