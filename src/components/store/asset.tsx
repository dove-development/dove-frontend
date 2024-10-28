import SvgIcon from "@/components/interface/svg-icon";
import { Skeleton } from "@/components/ui/skeleton";
import { nf } from "@/lib/utils";

interface AssetDisplayProps {
    icon: string;
    name: string;
    symbol: string;
}

export function AssetDisplay({ icon, name, symbol }: AssetDisplayProps) {
    return (
        <div className="flex items-center space-x-4">
            <SvgIcon icon={icon} className="w-10 h-10" alt={`${symbol} icon`} />
            <div>
                <p className="text-base font-medium">{name}</p>
                <p className="text-sm text-gray-400">{symbol}</p>
            </div>
        </div>
    );
}

interface AssetBalanceProps {
    balance: number | undefined;
    decimals: number;
}

export function AssetBalance({ balance, decimals }: AssetBalanceProps) {
    return balance !== undefined ? (
        <span className="text-base font-medium">{nf(balance, decimals)}</span>
    ) : (
        <Skeleton className="w-16 h-6 ml-auto" />
    );
}

interface AssetTitleProps {
    title: string;
    value?: number;
    icon: string;
}

export function AssetTitle({ title, value, icon }: AssetTitleProps) {
    return (
        <div className="">
            <div className="text-md font-medium text-center md:text-left mb-1">
                {title}
            </div>
            {value !== undefined ? (
                <div className="flex items-center">
                    <SvgIcon icon={icon} className="w-8 h-8 mr-[10px]" alt="icon" />
                    <span className="text-4xl font-bold mr-2">{nf(value, 2)}</span>
                </div>
            ) : (
                <Skeleton className="w-44 h-10" />
            )}
        </div>
    );
}
