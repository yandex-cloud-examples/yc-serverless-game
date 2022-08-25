import axios, {
    AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse,
} from 'axios';
import axiosRetry from 'axios-retry';
import { ServerState } from '../../common/types';

const DEFAULT_RETRY_COUNT = 2;
const DEFAULT_BASE_URL = '/api/';

export class ApiClient {
    private readonly axiosInstance: AxiosInstance;

    constructor(baseURL: string = DEFAULT_BASE_URL, retryCount = DEFAULT_RETRY_COUNT) {
        this.axiosInstance = axios.create({
            baseURL,
            withCredentials: true,
        });

        axiosRetry(this.axiosInstance, {
            retries: retryCount,
            retryDelay: axiosRetry.exponentialDelay,
            // intentionally retry non-idempotent
            retryCondition: (error) => axiosRetry.isNetworkError(error) || axiosRetry.isRetryableError(error),
        });
    }

    private async request<T, D = unknown>(config: AxiosRequestConfig<D>) {
        return this.axiosInstance
            .request<T, AxiosResponse<T>, D>(config)
            .catch((error: AxiosError) => {
                if (error.response?.status && [401, 403].includes(error.response?.status)) {
                    window.location.replace('/login.html');
                }

                throw error;
            });
    }

    async getState() {
        const response = await this.request<ServerState>({
            method: 'GET',
            url: '/get-state',
        });

        return response.data;
    }
}
