import { execSync } from "child_process";

const commitHash = execSync("git log --pretty=format:'%h' -n1").toString().trim();
const buildTimestamp = Math.floor(new Date().getTime() / 1000).toString();

/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "export",
    images: {
        unoptimized: true
    },
    env: {
        COMMIT_HASH: commitHash,
        BUILD_TIMESTAMP: buildTimestamp
    }
};

export default nextConfig;
