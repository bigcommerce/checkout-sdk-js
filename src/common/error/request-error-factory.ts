import { Response } from '@bigcommerce/request-sender';
import { last } from 'lodash';

import ErrorResponseBody, { InternalErrorResponseBody, StorefrontErrorResponseBody } from './error-response-body';
import { mapFromInternalErrorResponse, mapFromPaymentErrorResponse, mapFromStorefrontErrorResponse, RequestError, TimeoutError } from './errors';

export default class RequestErrorFactory {
    private _factoryMethods: { [key: string]: ErrorFactoryMethod } = {};

    constructor() {
        this.register('default', (response, message) => new RequestError(response, { message }));
        this.register('internal', (response, message) => mapFromInternalErrorResponse(response, message));
        this.register('storefront', (response, message) => mapFromStorefrontErrorResponse(response, message));
        this.register('payment', (response, message) => mapFromPaymentErrorResponse(response, message));
        this.register('timeout', response => new TimeoutError(response));
    }

    register(type: string, factoryMethod: ErrorFactoryMethod): void {
        this._factoryMethods[type] = factoryMethod;
    }

    createError(response: Response, message?: string): RequestError {
        const factoryMethod = this._factoryMethods[this._getType(response)] || this._factoryMethods.default;

        return factoryMethod(response, message);
    }

    private _getType(response: Response<ErrorResponseBody>): string {
        if (response.status === 0) {
            return 'timeout';
        }

        if (this._isStorefrontErrorResponseBody(response.body)) {
            return 'storefront';
        }

        if (this._isInternalErrorResponseBody(response.body)) {
            const internalType = last(response.body.type.split('/'));

            return internalType && this._factoryMethods[internalType] ?
                internalType :
                'internal';
        }

        const error = last(response.body && response.body.errors);

        if (error && error.code && this._factoryMethods[error.code]) {
            return error.code;
        }

        return 'payment';
    }

    private _isStorefrontErrorResponseBody(
        errorResponse: ErrorResponseBody
    ): errorResponse is StorefrontErrorResponseBody {
        const storefrontErrorResponse = errorResponse as StorefrontErrorResponseBody;

        return !this._isInternalErrorResponseBody(errorResponse) &&
            typeof storefrontErrorResponse.title === 'string' &&
            typeof storefrontErrorResponse.type === 'string' &&
            typeof storefrontErrorResponse.status === 'number' &&
            typeof storefrontErrorResponse.detail === 'string';
    }

    private _isInternalErrorResponseBody(
        errorResponse: ErrorResponseBody
    ): errorResponse is InternalErrorResponseBody {
        const internalErrorResponse = errorResponse as InternalErrorResponseBody;

        return typeof internalErrorResponse.errors === 'object' &&
            typeof internalErrorResponse.title === 'string' &&
            typeof internalErrorResponse.type === 'string' &&
            typeof internalErrorResponse.status === 'number';
    }
}

export type ErrorFactoryMethod = (response: Response, message?: string) => RequestError;
