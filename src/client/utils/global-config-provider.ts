import { IGlobalConfig } from '../../common/types';

export class GlobalConfigProvider {
    private static globalConfig: IGlobalConfig | undefined;

    static getConfig(): IGlobalConfig {
        if (!this.globalConfig) {
            throw new Error('Global Config is not set up yet');
        }

        return this.globalConfig;
    }

    static init(globalConfig: IGlobalConfig) {
        if (this.globalConfig) {
            throw new Error('Global config has been already set up. User update() to set new values.');
        }

        this.globalConfig = globalConfig;
    }
}
