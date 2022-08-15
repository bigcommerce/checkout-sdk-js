import { createRequestSender } from '@bigcommerce/request-sender';
import { MissingDataError, MissingDataErrorType } from '../../../common/error/errors';
import KlarnaV2TokenUpdater from './klarnav2-token-updater';

describe('KlarnaV2TokenUpdater', () => {
    const requestSender = createRequestSender();
    const klarnaV2TokenUpdater = new KlarnaV2TokenUpdater(requestSender);

    beforeEach(() => {
        jest.spyOn(requestSender, 'get').mockReturnValue(Promise.resolve(true));
    });

    it('calls request sender to load payment method', async () => {
        await klarnaV2TokenUpdater.updateClientToken('klarna', { params: 'cart' });

        expect(requestSender.get).toHaveBeenCalledWith(
            '/api/storefront/payments/klarna',
            {
                "headers": {
                "Accept": "application/vnd.bc.v1+json",
                     "X-API-INTERNAL": "This API endpoint is for internal use only and may change in the future",
                     "X-Checkout-SDK-Version": "1.0.0",
                },
                "params": "cart",
                "timeout": undefined,
            }
        );
    });

    it('throws an error when the request sender is unable to load payment method', () => {
        jest.spyOn(requestSender, 'get')
            .mockReturnValue(Promise.reject(new MissingDataError(MissingDataErrorType.MissingPaymentMethod)));

        expect(klarnaV2TokenUpdater.updateClientToken('klarna', { params: 'cart' }))
            .rejects.toThrow(MissingDataError);
        expect(requestSender.get).toHaveBeenCalledWith(
            '/api/storefront/payments/klarna',
            {
                "headers": {
                    "Accept": "application/vnd.bc.v1+json",
                    "X-API-INTERNAL": "This API endpoint is for internal use only and may change in the future",
                    "X-Checkout-SDK-Version": "1.0.0",
                },
                "params": "cart",
                "timeout": undefined,
            }
        );
    });
});
