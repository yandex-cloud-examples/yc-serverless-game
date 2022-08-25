import { GameConfig } from '../../common/types';

export class ConfigProvider {
    private static globalConfig: GameConfig | undefined;

    static getConfig(): GameConfig {
        if (!this.globalConfig) {
            throw new Error('Global config is not set up yet');
        }

        return this.globalConfig;
    }

    static init(globalConfig: GameConfig) {
        if (this.globalConfig) {
            throw new Error('Global config has been already set up');
        }

        this.globalConfig = globalConfig;
    }
}
