import {
    NotImplementedError,
    PaymentIntegrationService,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getConfig,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import createSquareV2PaymentStrategy from './create-squarev2-payment-strategy';
import SquareV2PaymentStrategy from './squarev2-payment-strategy';

describe('createSquareV2PaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates squarev2 payment strategy', () => {
        const storeConfigMock = getConfig().storeConfig;

        storeConfigMock.checkoutSettings.features = {
            'PROJECT-4113.squarev2_web_payments_sdk': true,
        };
        jest.spyOn(paymentIntegrationService.getState(), 'getStoreConfig').mockReturnValueOnce(
            storeConfigMock,
        );

        const strategy = createSquareV2PaymentStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(SquareV2PaymentStrategy);
    });

    it('should fail to instantiate squarev2 payment strategy', () => {
        const factory = () => createSquareV2PaymentStrategy(paymentIntegrationService);

        expect(factory).toThrow(NotImplementedError);
    });
});
