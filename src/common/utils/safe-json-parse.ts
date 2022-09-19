export const safeJsonParse = <T extends object>(input: string): T | undefined => {
    try {
        return JSON.parse(input);
    } catch {
        return undefined;
    }
};
