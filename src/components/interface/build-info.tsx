import React from "react";
import { GitCommit, Calendar } from "lucide-react";
import { FaGitAlt } from "react-icons/fa6";

const BuildInfo = ({
    commitHash,
    buildTimestamp,
    href
}: {
    commitHash?: string;
    buildTimestamp?: string | number;
    href: string;
}) => {
    commitHash = commitHash || "develop";
    if (typeof buildTimestamp === "string") {
        buildTimestamp = parseInt(buildTimestamp);
    }
    if (!buildTimestamp) {
        buildTimestamp = Math.floor(new Date().getTime() / 1000);
    }
    const d = new Date(buildTimestamp * 1000);
    const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec"
    ];

    const buildDate = `${d.getUTCDate()} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`;

    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="block transition-colors duration-200 hover:bg-gray-700/50 rounded-md"
        >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 sm:space-x-4 p-3 rounded-md text-sm text-white border border-gray-700">
                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                    <div className="flex items-center">
                        <FaGitAlt className="w-4 h-4 mr-2 text-sky-500" />
                        <span>dove-frontend</span>
                    </div>
                    <div className="flex items-center">
                        <GitCommit className="w-4 h-4 mr-2 text-teal-400" />
                        <span>{commitHash.substring(0, 7)}</span>
                    </div>
                </div>
                <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-indigo-400" />
                    <span>{buildDate}</span>
                </div>
            </div>
        </a>
    );
};

export default BuildInfo;
