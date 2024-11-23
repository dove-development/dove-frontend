import React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

const RiskSlider = React.forwardRef<
    HTMLSpanElement,
    React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
    <div className="w-full max-w-md mx-auto">
        <SliderPrimitive.Root
            ref={ref}
            className={cn(
                "relative flex w-full touch-none select-none cursor-pointer items-center",
                className
            )}
            {...props}
        >
            <SliderPrimitive.Track className="relative h-6 w-full grow overflow-hidden rounded-xl bg-gradient-to-r from-green-400 via-yellow-400 via-orange-400 to-red-500">
                <SliderPrimitive.Range className="absolute h-full" />
            </SliderPrimitive.Track>
            <SliderPrimitive.Thumb className="block h-10 w-6 rounded-lg border-2 border-white bg-white shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
        </SliderPrimitive.Root>
        <div className="mt-3 flex justify-between text-xs font-semibold">
            <span className="text-green-500">Conservative</span>
            <span className="text-yellow-500">Moderate</span>
            <span className="text-orange-500">Aggressive</span>
            <span className="text-red-500">Liquidation</span>
        </div>
    </div>
));

RiskSlider.displayName = "RiskSlider";

export default RiskSlider;
