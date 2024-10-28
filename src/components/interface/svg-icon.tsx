import { cn } from "@/lib/utils";
import Image, { StaticImageData } from "next/image";
import React from "react";

export default function SvgIcon({
    className,
    icon,
    alt
}: {
    className?: string;
    icon: string | StaticImageData;
    alt: string;
}) {
    return (
        <span
            className={cn("rounded-full inline-block", className)}
            style={{
                backgroundImage: `url(${icon})`,
                backgroundSize: "contain",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center"
            }}
            title={alt}
        />
    );
}
