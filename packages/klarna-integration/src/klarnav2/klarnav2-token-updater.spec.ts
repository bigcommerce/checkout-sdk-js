import { createRequestSender } from '@bigcommerce/request-sender';

import {
    MissingDataError,
    MissingDataErrorType,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import KlarnaV2TokenUpdater from './klarnav2-token-updater';

describe('KlarnaV2TokenUpdater', () => {
    const requestSender = createRequestSender();
    const klarnaV2TokenUpdater = new KlarnaV2TokenUpdater(requestSender);

    beforeEach(() => {
        jest.spyOn(requestSender, 'get').mockImplementation(jest.fn());
        jest.spyOn(requestSender, 'put').mockImplementation(jest.fn());
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('calls request sender to load payment method', async () => {
        await klarnaV2TokenUpdater.updateClientToken('klarna', { params: 'cart' });

        expect(requestSender.get).toHaveBeenCalledWith('/api/storefront/payments/klarna', {
            headers: {
                Accept: 'application/vnd.bc.v1+json',
                'X-API-INTERNAL':
                    'This API endpoint is for internal use only and may change in the future',
                'X-Checkout-SDK-Version': '1.0.0',
            },
            params: 'cart',
            timeout: undefined,
        });
    });

    it('calls request sender to load payment method with empty params', async () => {
        await klarnaV2TokenUpdater.updateClientToken('klarna');

        expect(requestSender.get).toHaveBeenCalledWith('/api/storefront/payments/klarna', {
            headers: {
                Accept: 'application/vnd.bc.v1+json',
                'X-API-INTERNAL':
                    'This API endpoint is for internal use only and may change in the future',
                'X-Checkout-SDK-Version': '1.0.0',
            },
            params: undefined,
            timeout: undefined,
        });
    });

    it('throws an error when the request sender is unable to load payment method', async () => {
        jest.spyOn(requestSender, 'get').mockReturnValue(
            Promise.reject(new MissingDataError(MissingDataErrorType.MissingPaymentMethod)),
        );

        await expect(
            klarnaV2TokenUpdater.updateClientToken('klarna', { params: 'cart' }),
        ).rejects.toThrow(MissingDataError);

        expect(requestSender.get).toHaveBeenCalledWith('/api/storefront/payments/klarna', {
            headers: {
                Accept: 'application/vnd.bc.v1+json',
                'X-API-INTERNAL':
                    'This API endpoint is for internal use only and may change in the future',
                'X-Checkout-SDK-Version': '1.0.0',
            },
            params: 'cart',
            timeout: undefined,
        });
    });

    it('calls klarnaOrderInitialization to initialize klarna order', async () => {
        await klarnaV2TokenUpdater.klarnaOrderInitialization('4444', '123456789');

        expect(requestSender.put).toHaveBeenCalledWith('/api/storefront/initialization/klarna', {
            headers: {
                Accept: 'application/vnd.bc.v1+json',
                'X-API-INTERNAL':
                    'This API endpoint is for internal use only and may change in the future',
                'X-Checkout-SDK-Version': '1.0.0',
            },
            body: {
                cartId: '4444',
                clientToken: '123456789',
            },
            timeout: undefined,
        });
    });

    it('throws an error when the klarnaOrderInitialization fails to initialize klarna order', async () => {
        jest.spyOn(requestSender, 'put').mockReturnValue(
            Promise.reject(new MissingDataError(MissingDataErrorType.MissingPaymentMethod)),
        );

        await expect(
            klarnaV2TokenUpdater.klarnaOrderInitialization('4444', '123456789'),
        ).rejects.toThrow(MissingDataError);

        expect(requestSender.put).toHaveBeenCalledWith('/api/storefront/initialization/klarna', {
            headers: {
                Accept: 'application/vnd.bc.v1+json',
                'X-API-INTERNAL':
                    'This API endpoint is for internal use only and may change in the future',
                'X-Checkout-SDK-Version': '1.0.0',
            },
            body: {
                cartId: '4444',
                clientToken: '123456789',
            },
            timeout: undefined,
        });
    });
});
