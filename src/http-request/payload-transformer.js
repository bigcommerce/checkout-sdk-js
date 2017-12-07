const JSON_CONTENT_TYPE_REGEXP = /application\/(\w+\+)?json/;

export default class PayloadTransformer {
    /**
     * @param {RequestOptions} options
     * @returns {any}
     */
    toRequestBody(options) {
        const contentType = this._getHeader(options.headers, 'Content-Type');

        if (options.body && JSON_CONTENT_TYPE_REGEXP.test(contentType)) {
            return JSON.stringify(options.body);
        }

        return options.body;
    }

    /**
     * @param {XMLHttpRequest} xhr
     * @returns {Response}
     */
    toResponse(xhr) {
        const headers = this._parseResponseHeaders(xhr.getAllResponseHeaders());
        const body = this._parseResponseBody('response' in xhr ? xhr.response : xhr.responseText, headers);

        return {
            body,
            headers,
            status: xhr.status,
            statusText: xhr.statusText,
        };
    }

    /**
     * @private
     * @param {string} body
     * @param {Object} headers
     * @return {any}
     */
    _parseResponseBody(body, headers) {
        const contentType = this._getHeader(headers, 'Content-Type');

        if (body && JSON_CONTENT_TYPE_REGEXP.test(contentType)) {
            return JSON.parse(body);
        }

        return body;
    }

    /**
     * @private
     * @param {string} rawHeaders
     * @return {Object}
     */
    _parseResponseHeaders(rawHeaders) {
        const lines = rawHeaders ? rawHeaders.replace(/\r?\n[\t ]+/g, ' ').split(/\r?\n/) : [];

        return lines.reduce((headers, line) => {
            const parts = line.split(':');
            const key = parts.shift().trim();

            if (!key) {
                return headers;
            }

            return {
                ...headers,
                [key.toLowerCase()]: parts.join(':').trim(),
            };
        }, {});
    }

    /**
     * @private
     * @param {Object} headers
     * @param {string} key
     * @return {string}
     */
    _getHeader(headers, key) {
        if (!headers || !key) {
            return '';
        }

        return headers[key] || headers[key.toLowerCase()] || '';
    }
}
