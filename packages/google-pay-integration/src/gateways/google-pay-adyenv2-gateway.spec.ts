import { createScriptLoader, getStylesheetLoader } from '@bigcommerce/script-loader';

import { AdyenV2ScriptLoader } from '@bigcommerce/checkout-sdk/adyen-utils';
import {
    PaymentIntegrationService,
    RequestError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import { getAdyenV2 } from '../mocks/google-pay-payment-method.mock';

import GooglePayAdyenV2Gateway from './google-pay-adyenv2-gateway';

describe('GooglePayAdyenV2Gateway', () => {
    let gateway: GooglePayAdyenV2Gateway;
    let paymentIntegrationService: PaymentIntegrationService;
    let adyenV2ScriptLoader: AdyenV2ScriptLoader;
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
        adyenV2ScriptLoader = new AdyenV2ScriptLoader(scriptLoader, getStylesheetLoader());
        gateway = new GooglePayAdyenV2Gateway(paymentIntegrationService, adyenV2ScriptLoader);
        jest.spyOn(adyenV2ScriptLoader, 'load').mockResolvedValue({
            createFromAction,
            create: jest.fn(),
        });
    });

    it('#initialize()', async () => {
        await gateway.initialize(getAdyenV2);

        expect(adyenV2ScriptLoader.load).toHaveBeenCalled();
    });

    it('#processAdditionalAction', async () => {
        await gateway.initialize(getAdyenV2);

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
        await gateway.initialize(getAdyenV2);

        try {
            await gateway.processAdditionalAction({ code: 'processAdditionalAction' });
        } catch (error) {
            expect(error).toStrictEqual({ code: 'processAdditionalAction' });
        }
    });
});
