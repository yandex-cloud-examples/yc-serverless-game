import axios, {
    AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse,
} from 'axios';
import axiosRetry from 'axios-retry';
import { Mutex } from 'async-mutex';
import { GameConfig, ServerState } from '../../common/types';
import { createLogger } from '../../common/logger';
import { ApiClient } from './index';

const DEFAULT_RETRY_COUNT = 2;
const DEFAULT_REQUEST_TIMEOUT_MS = 2000;
const DEFAULT_BASE_URL = '/api/';
const IDEMPOTENT_HTTP_METHODS = new Set(['put', 'delete', 'get', 'head', 'options']);
const logger = createLogger('HttpClient');

const isTimoutError = (error: AxiosError): boolean => {
    return error.code === 'ECONNABORTED';
};

const isRetryable = (error: AxiosError): boolean => {
    return axiosRetry.isNetworkOrIdempotentRequestError(error)
        || (isTimoutError(error) && IDEMPOTENT_HTTP_METHODS.has(error.config?.method || ''));
};

export class HttpClient implements ApiClient {
    private readonly axiosInstance: AxiosInstance;
    private readonly modificationMutex: Mutex;

    constructor(baseURL: string = DEFAULT_BASE_URL, retryCount = DEFAULT_RETRY_COUNT) {
        this.modificationMutex = new Mutex();

        this.axiosInstance = axios.create({
            baseURL,
            withCredentials: true,
            timeout: DEFAULT_REQUEST_TIMEOUT_MS,
        });

        axiosRetry(this.axiosInstance, {
            retries: retryCount,
            retryDelay: axiosRetry.exponentialDelay,
            // intentionally retry non-idempotent
            retryCondition: isRetryable,
            shouldResetTimeout: true,
        });
    }

    private async request<T, D = unknown>(config: AxiosRequestConfig<D>) {
        logger.debug(`starting request to ${config.url}`);

        return this.axiosInstance
            .request<T, AxiosResponse<T>, D>(config)
            .then((result) => {
                logger.debug(`finished request to ${config.url}`);

                return result;
            })
            .catch((error: AxiosError) => {
                logger.debug(`error request to ${config.url}`);

                if (error.response?.status && [401, 403].includes(error.response?.status)) {
                    window.location.replace('/login.html');
                }

                throw error;
            });
    }

    // Returns undefined in case of state is possible stale
    async getState(withStats = false) {
        let result: ServerState | undefined;

        const response = await this.modificationMutex.runExclusive(async () => {
            return this.request<ServerState>({
                method: 'GET',
                url: '/get-state',
                params: {
                    withStats: withStats || undefined,
                },
            });
        });

        // if modification mutex is locked, consider state is possible stale
        if (!this.modificationMutex.isLocked()) {
            result = response.data;
        }

        return result;
    }

    async getConfig() {
        const response = await this.request<GameConfig>({
            method: 'GET',
            url: '/get-config',
            timeout: 5000,
        });

        return response.data;
    }

    async moveTo(gridX: number, gridY: number) {
        await this.modificationMutex.runExclusive(() => {
            return this.request({
                method: 'POST',
                url: '/move',
                data: {
                    gridX,
                    gridY,
                },
            });
        });
    }
}
