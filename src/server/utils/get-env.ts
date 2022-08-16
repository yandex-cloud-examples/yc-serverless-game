export const getEnv = (envName: string, defaultVal?: string): string => {
    const value = process.env[envName] || defaultVal;

    if (!value) {
        throw new Error(`Env var ${envName} is not defined and default value is not specified`);
    }

    return value;
};
