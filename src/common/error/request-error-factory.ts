import { Response } from '@bigcommerce/request-sender';
import { last } from 'lodash';

import ErrorResponseBody from './error-response-body';
import { RequestError, TimeoutError } from './errors';

export default class RequestErrorFactory {
    private _factoryMethods: { [key: string]: ErrorFactoryMethod } = {};

    constructor() {
        this.register('default', (response, message) => new RequestError(response, message));
        this.register('timeout', response => new TimeoutError(response));
    }

    register(type: string, factoryMethod: ErrorFactoryMethod): void {
        this._factoryMethods[type] = factoryMethod;
    }

    createError(response: Response, message?: string): Error {
        const factoryMethod = this._factoryMethods[this._getType(response)] || this._factoryMethods.default;

        return factoryMethod(response, message);
    }

    private _getType(response: Response<ErrorResponseBody>): string {
        if (response.status === 0) {
            return 'timeout';
        }

        if (response.body && typeof response.body.type === 'string') {
            return last(response.body.type.split('/')) || 'default';
        }

        const error = last(response.body && response.body.errors);

        return error && error.code ? error.code : 'default';
    }
}

export type ErrorFactoryMethod = (response: Response, message?: string) => Error;
