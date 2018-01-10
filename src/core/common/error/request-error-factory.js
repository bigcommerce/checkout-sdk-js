import { last } from 'lodash';
import { RequestError } from './errors';

export default class RequestErrorFactory {
    /**
     * @constructor
     */
    constructor() {
        this._factoryMethods = {};

        this.register('default', (...args) => new RequestError(...args));
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
        const { body = {} } = response;

        if (typeof body.type === 'string') {
            return last(body.type.split('/'));
        }

        return (last(body.errors) || {}).code;
    }
}
