import { RequestOptions, RequestSender, Response } from '@bigcommerce/request-sender';

import { StoreConfig } from '../../config';

export interface ExperimentConfig {
    getBasePath: () => string | undefined;
    getFeatures: () => StoreConfig['checkoutSettings']['features'];
}

export default class ExperimentAwareRequestSender {
    constructor(private _requestSender: RequestSender, private _config: ExperimentConfig) {}

    sendRequest<T>(url: string, options?: RequestOptions): Promise<Response<T>> {
        return this._requestSender.sendRequest(url, options);
    }

    get<T>(url: string, options?: RequestOptions): Promise<Response<T>> {
        return this._requestSender.get(url, options);
    }

    post<T>(url: string, options?: RequestOptions): Promise<Response<T>> {
        return this._requestSender.post(this._prefixed(url), options);
    }

    put<T>(url: string, options?: RequestOptions): Promise<Response<T>> {
        return this._requestSender.put(this._prefixed(url), options);
    }

    patch<T>(url: string, options?: RequestOptions): Promise<Response<T>> {
        return this._requestSender.patch(this._prefixed(url), options);
    }

    delete<T>(url: string, options?: RequestOptions): Promise<Response<T>> {
        return this._requestSender.delete(this._prefixed(url), options);
    }

    private _prefixed(url: string): string {
        const basePath = this._config.getBasePath();

        const isExperimentEnabled =
            this._config.getFeatures()['CHECKOUT-9950.update_sf_checkout_url_for_subfolder'];

        if (
            !isExperimentEnabled ||
            !basePath ||
            basePath.endsWith('/checkout') ||
            /^https?:\/\//.test(url)
        ) {
            return url;
        }

        return `${basePath}${url}`;
    }
}
