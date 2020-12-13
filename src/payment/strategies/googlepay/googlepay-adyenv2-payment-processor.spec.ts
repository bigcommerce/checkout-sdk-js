import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader, getStylesheetLoader } from '@bigcommerce/script-loader';

import { createPaymentClient, PaymentActionCreator, PaymentRequestSender, PaymentRequestTransformer } from '../..';
import { getCartState } from '../../../cart/carts.mock';
import { createCheckoutStore, CheckoutRequestSender, CheckoutStore, CheckoutValidator } from '../../../checkout';
import { getCheckoutState } from '../../../checkout/checkouts.mock';
import { RequestError } from '../../../common/error/errors';
import { getConfig, getConfigState } from '../../../config/configs.mock';
import { getCustomerState } from '../../../customer/customers.mock';
import { OrderActionCreator } from '../../../order';
import { createSpamProtection, PaymentHumanVerificationHandler } from '../../../spam-protection';
import { getGooglePayAdyenV2, getPaymentMethodsState } from '../../payment-methods.mock';
import { AdyenV2ScriptLoader } from '../adyenv2';

import { GooglePayAdyenV2PaymentProcessor } from './index';

describe('GooglePayAdyenV2PaymentProcessor', () => {
    let processor: GooglePayAdyenV2PaymentProcessor;
    let store: CheckoutStore;
    let requestSender: RequestSender;
    let paymentActionCreator: PaymentActionCreator;
    let orderActionCreator: OrderActionCreator;
    let adyenV2ScriptLoader: AdyenV2ScriptLoader;
    const createFromAction = jest.fn((action, {onAdditionalDetails}) => {
        onAdditionalDetails({action});
    });

    beforeEach(() => {
        store = createCheckoutStore({
            checkout: getCheckoutState(),
            customer: getCustomerState(),
            config: getConfigState(),
            cart: getCartState(),
            paymentMethods: getPaymentMethodsState(),
        });
        const scriptLoader = createScriptLoader();
        const paymentClient = createPaymentClient(store);

        orderActionCreator = new OrderActionCreator(
            paymentClient,
            new CheckoutValidator(
                new CheckoutRequestSender(requestSender)
            )
        );
        paymentActionCreator = new PaymentActionCreator(
            new PaymentRequestSender(paymentClient),
            orderActionCreator,
            new PaymentRequestTransformer(),
            new PaymentHumanVerificationHandler(createSpamProtection(scriptLoader))
        );
        requestSender = createRequestSender();
        adyenV2ScriptLoader = new AdyenV2ScriptLoader(scriptLoader, getStylesheetLoader());

        jest.spyOn(adyenV2ScriptLoader, 'load').mockReturnValue({createFromAction});
        jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow').mockReturnValue(getGooglePayAdyenV2());
        jest.spyOn(store.getState().config, 'getStoreConfig').mockReturnValue(getConfig().storeConfig);
        jest.spyOn(store, 'dispatch').mockReturnValue(Promise.resolve(store.getState()));
    });

    it('#initialize()', () => {
        processor = new GooglePayAdyenV2PaymentProcessor(
            store,
            paymentActionCreator,
            adyenV2ScriptLoader
        );
        processor.initialize({methodId: 'googlepayadyenv2'});
        expect(adyenV2ScriptLoader.load).toBeCalled();
    });

    it('#processAdditionalAction', async () => {
        processor.initialize({methodId: 'googlepayadyenv2'});
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

        await processor.processAdditionalAction(err);
        expect(createFromAction).toBeCalledTimes(1);
    });

    it('#processAdditionalAction failed', async () => {
        processor.initialize({methodId: 'googlepayadyenv2'});

        try {
            await processor.processAdditionalAction({code: 'processAdditionalAction'});
        } catch (error) {
            expect(error).toStrictEqual({code: 'processAdditionalAction'});
        }
    });
});
