import * as queryString from 'query-string';

export default class RequestFactory {
    /**
     * @param {string} url
     * @param {Object} [options={}]
     * @returns {XMLHttpRequest}
     */
    createRequest(url, options = {}) {
        const xhr = new XMLHttpRequest();

        this._configureRequest(xhr, url, options);

        return xhr;
    }

    /**
     * @private
     * @param {XMLHttpRequest} xhr
     * @param {string} url
     * @param {RequestOptions} options
     * @returns {void}
     */
    _configureRequest(xhr, url, options) {
        xhr.open(options.method, this._formatUrl(url, options.params), true);

        this._configureRequestHeaders(xhr, options.headers);

        if (typeof options.credentials === 'boolean') {
            xhr.withCredentials = options.credentials;
        }

        if (typeof options.timeout === 'number') {
            xhr.timeout = options.timeout;
        }
    }

    /**
     * @private
     * @param {XMLHttpRequest} xhr
     * @param {Object} headers
     * @return {void}
     */
    _configureRequestHeaders(xhr, headers) {
        if (!headers) {
            return;
        }

        Object.keys(headers).forEach((key) => {
            xhr.setRequestHeader(key, headers[key]);
        });
    }

    /**
     * @private
     * @param {string} url
     * @param {Object} params
     * @return {string}
     */
    _formatUrl(url, params) {
        if (!params || Object.keys(params).length === 0) {
            return url;
        }

        return `${url}?${queryString.stringify(params)}`;
    }
}
