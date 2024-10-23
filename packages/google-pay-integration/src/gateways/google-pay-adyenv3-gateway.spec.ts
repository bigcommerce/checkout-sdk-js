import { createScriptLoader, getStylesheetLoader } from '@bigcommerce/script-loader';

import { AdyenV3ScriptLoader } from '@bigcommerce/checkout-sdk/adyen-utils';
import {
    PaymentIntegrationService,
    RequestError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import { getAdyenV3 } from '../mocks/google-pay-payment-method.mock';

import GooglePayAdyenV3Gateway from './google-pay-adyenv3-gateway';

describe('GooglePayAdyenV3Gateway', () => {
    let gateway: GooglePayAdyenV3Gateway;
    let paymentIntegrationService: PaymentIntegrationService;
    let adyenV3ScriptLoader: AdyenV3ScriptLoader;
    const createFromAction = jest.fn((action, { onAdditionalDetails }) => {
        onAdditionalDetails({ action });

        return {
            mount: jest.fn(() => {
                return document.createElement('div');
            }),
            unmount: jest.fn(),
            submit: jest.fn(),
        };
    });
    const scriptLoader = createScriptLoader();

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
        adyenV3ScriptLoader = new AdyenV3ScriptLoader(scriptLoader, getStylesheetLoader());
        gateway = new GooglePayAdyenV3Gateway(paymentIntegrationService, adyenV3ScriptLoader);
        jest.spyOn(adyenV3ScriptLoader, 'load').mockResolvedValue({
            createFromAction,
            create: jest.fn(),
        });
    });

    it('#initialize()', async () => {
        await gateway.initialize(getAdyenV3);

        expect(adyenV3ScriptLoader.load).toHaveBeenCalled();
    });

    it('#processAdditionalAction', async () => {
        await gateway.initialize(getAdyenV3);

        const err: RequestError = new RequestError({
            body: {
                errors: [{ code: 'additional_action_required' }],
                provider_data: {
                    action: '{}',
                },
            },
            headers: {},
            status: 400,
            statusText: 'Please continue with additional actions.',
        });

        await gateway.processAdditionalAction(err);

        expect(createFromAction).toHaveBeenCalledTimes(1);
    });

    it('#processAdditionalAction failed', async () => {
        await gateway.initialize(getAdyenV3);

        try {
            await gateway.processAdditionalAction({ code: 'processAdditionalAction' });
        } catch (error) {
            expect(error).toStrictEqual({ code: 'processAdditionalAction' });
        }
    });
});
