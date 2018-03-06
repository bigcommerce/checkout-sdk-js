import { last } from 'lodash';
import { RequestError, TimeoutError } from './errors';

export default class RequestErrorFactory {
    /**
     * @constructor
     */
    constructor() {
        this._factoryMethods = {};

        this.register('default', (...args) => new RequestError(...args));
        this.register('timeout', (...args) => new TimeoutError(...args));
    }

    /**
     * @param {string} type
     * @param {function(response: Response, message: string): Error} factoryMethod
     * @return {void}
     */
    register(type, factoryMethod) {
        this._factoryMethods[type] = factoryMethod;
    }

    /**
     * @param {Response} response
     * @param {string} [message]
     * @return {Error}
     */
    createError(response, message) {
        const factoryMethod = this._factoryMethods[this._getType(response)] || this._factoryMethods.default;

        return factoryMethod(response, message);
    }

    /**
     * @private
     * @param {Response} response
     * @return {string}
     */
    _getType(response) {
        if (response.status === 0) {
            return 'timeout';
        }

        const { body = {} } = response;

        if (typeof body.type === 'string') {
            return last(body.type.split('/'));
        }

        return (last(body.errors) || {}).code;
    }
}
