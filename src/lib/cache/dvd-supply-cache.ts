export default class DvdSupplyCache extends Array<[Date, number]> {
    public static readonly userDependent: boolean = false;

    public static getHashCode(): string {
        return "dvd-supply-cache";
    }

    public static mock(): DvdSupplyCache {
        let base = new Date(1968, 9, 3);
        let oneDay = 24 * 3600 * 1000;
        let result: [Date, number][] = [[base, 100]];
        let miniPumpDuration = 100;
        let miniDumpDuration = 50;
        let pumpDuration = 200;
        let dumpDuration = 220;

        for (let i = 1; i < 720; i++) {
            let now = new Date(base.getTime() + i * oneDay);
            let value;

            let prevValue = i === 1 ? 100 : result[i - 1]![1]!;
            let volatilityFactor;

            if (i < miniPumpDuration) {
                volatilityFactor = 0.2;
                value = Math.round(
                    prevValue * (1 + 0.01 + (Math.random() - 0.5) * volatilityFactor)
                );
            } else if (i < miniPumpDuration + miniDumpDuration) {
                let miniDumpProgress = (i - miniPumpDuration) / miniDumpDuration;
                volatilityFactor = 0.3;
                value = Math.round(
                    prevValue *
                        (1 -
                            0.03 * miniDumpProgress +
                            (Math.random() - 0.55) * volatilityFactor)
                );
            } else if (i < miniPumpDuration + miniDumpDuration + pumpDuration) {
                volatilityFactor = 0.18;
                value = Math.round(
                    prevValue * (1 + 0.025 + (Math.random() - 0.5) * volatilityFactor)
                );
            } else if (
                i <
                miniPumpDuration + miniDumpDuration + pumpDuration + dumpDuration
            ) {
                let dumpProgress =
                    (i - (miniPumpDuration + miniDumpDuration + pumpDuration)) /
                    dumpDuration;
                volatilityFactor = 0.3;
                value = Math.round(
                    prevValue *
                        (1 -
                            0.06 * dumpProgress +
                            (Math.random() - 0.6) * volatilityFactor)
                );
            } else {
                volatilityFactor = 0.12;
                value = Math.round(
                    prevValue * (1 + (Math.random() - 0.48) * volatilityFactor)
                );
            }

            value = Math.max(0, value);
            result.push([now, value]);
        }
        return new DvdSupplyCache(...result);
    }

    public static async fetch(): Promise<DvdSupplyCache> {
        const response = await fetch("/dvd_supply.json");
        const supplyData = await response.json();

        return new DvdSupplyCache(
            ...supplyData.map((entry: { timestamp: number; supply: number }) => [
                new Date(entry.timestamp * 1000), // Convert Unix timestamp to Date
                entry.supply
            ])
        );
    }
}
