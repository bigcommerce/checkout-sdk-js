import * as isPromise from 'is-promise';
import { merge } from 'lodash';
import Timeout from './timeout';

export default class RequestSender {
    /**
     * @constructor
     * @param {RequestFactory} requestFactory
     * @param {PayloadTransformer} payloadTransformer
     * @param {Cookie} cookie
     */
    constructor(requestFactory, payloadTransformer, cookie) {
        this._requestFactory = requestFactory;
        this._payloadTransformer = payloadTransformer;
        this._cookie = cookie;
    }

    /**
     * @param {string} url
     * @param {RequestOptions} [options={}]
     * @return {Promise<any>}
     */
    sendRequest(url, options = {}) {
        const requestOptions = this._mergeDefaultOptions(options);
        const request = this._requestFactory.createRequest(url, requestOptions);

        return new Promise((resolve, reject) => {
            const requestHandler = () => {
                const response = this._payloadTransformer.toResponse(request);

                if (response.status >= 200 && response.status < 300) {
                    resolve(response);
                } else {
                    reject(response);
                }
            };

            request.onload = requestHandler;
            request.onerror = requestHandler;
            request.onabort = requestHandler;
            request.ontimeout = requestHandler;

            if (requestOptions.timeout instanceof Timeout) {
                requestOptions.timeout.onComplete(() => request.abort());
                requestOptions.timeout.start();
            }

            if (isPromise(requestOptions.timeout)) {
                requestOptions.timeout.then(() => request.abort());
            }

            request.send(this._payloadTransformer.toRequestBody(requestOptions));
        });
    }

    /**
     * @param {string} url
     * @param {RequestOptions} [options={}]
     * @return {Promise<any>}
     */
    get(url, options = {}) {
        return this.sendRequest(url, { ...options, method: 'GET' });
    }

    /**
     * @param {string} url
     * @param {RequestOptions} [options={}]
     * @return {Promise<any>}
     */
    post(url, options = {}) {
        return this.sendRequest(url, { ...options, method: 'POST' });
    }

    /**
     * @param {string} url
     * @param {RequestOptions} [options={}]
     * @return {Promise<any>}
     */
    put(url, options = {}) {
        return this.sendRequest(url, { ...options, method: 'PUT' });
    }

    /**
     * @param {string} url
     * @param {RequestOptions} [options={}]
     * @return {Promise<any>}
     */
    patch(url, options = {}) {
        return this.sendRequest(url, { ...options, method: 'PATCH' });
    }

    /**
     * @param {string} url
     * @param {RequestOptions} [options={}]
     * @return {Promise<any>}
     */
    delete(url, options = {}) {
        return this.sendRequest(url, { ...options, method: 'DELETE' });
    }

    /**
     * @private
     * @param {RequestOptions} options
     * @return {RequestOptions}
     */
    _mergeDefaultOptions(options) {
        const defaultOptions = {
            credentials: true,
            method: 'GET',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json',
            },
        };

        const csrfToken = this._cookie.get('XSRF-TOKEN');

        if (csrfToken) {
            defaultOptions.headers['X-XSRF-TOKEN'] = csrfToken;
        }

        return merge({}, defaultOptions, options);
    }
}
