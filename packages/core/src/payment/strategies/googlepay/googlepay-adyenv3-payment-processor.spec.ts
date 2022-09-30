import { RequestError } from "@bigcommerce/checkout-sdk/payment-integration-api";
import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader, getStylesheetLoader } from '@bigcommerce/script-loader';

import { createPaymentClient, PaymentActionCreator, PaymentRequestSender, PaymentRequestTransformer } from '../..';
import { getCartState } from '../../../cart/carts.mock';
import { createCheckoutStore, CheckoutRequestSender, CheckoutStore, CheckoutValidator } from '../../../checkout';
import { getCheckoutState } from '../../../checkout/checkouts.mock';
import { getConfig, getConfigState } from '../../../config/configs.mock';
import { getCustomerState } from '../../../customer/customers.mock';
import { OrderActionCreator } from '../../../order';
import { createSpamProtection, PaymentHumanVerificationHandler } from '../../../spam-protection';
import { getGooglePayAdyenV3, getPaymentMethodsState } from '../../payment-methods.mock';
import { AdyenV3ScriptLoader } from '../adyenv3';

import { GooglePayAdyenV3PaymentProcessor } from './index';

describe('GooglePayAdyenV3PaymentProcessor', () => {
    let processor: GooglePayAdyenV3PaymentProcessor;
    let store: CheckoutStore;
    let requestSender: RequestSender;
    let paymentActionCreator: PaymentActionCreator;
    let orderActionCreator: OrderActionCreator;
    let adyenV3ScriptLoader: AdyenV3ScriptLoader;
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
        adyenV3ScriptLoader = new AdyenV3ScriptLoader(scriptLoader, getStylesheetLoader());

        jest.spyOn(adyenV3ScriptLoader, 'load').mockReturnValue({createFromAction});
        jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow').mockReturnValue(getGooglePayAdyenV3());
        jest.spyOn(store.getState().config, 'getStoreConfig').mockReturnValue(getConfig().storeConfig);
        jest.spyOn(store, 'dispatch').mockReturnValue(Promise.resolve(store.getState()));
    });

    it('#initialize()', () => {
        processor = new GooglePayAdyenV3PaymentProcessor(
            store,
            paymentActionCreator,
            adyenV3ScriptLoader
        );
        processor.initialize({methodId: 'googlepayadyenv3'});
        expect(adyenV3ScriptLoader.load).toBeCalled();
    });

    it('#processAdditionalAction', async () => {
        processor.initialize({methodId: 'googlepayadyenv3'});
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
        processor.initialize({methodId: 'googlepayadyenv3'});

        try {
            await processor.processAdditionalAction({code: 'processAdditionalAction'});
        } catch (error) {
            expect(error).toStrictEqual({code: 'processAdditionalAction'});
        }
    });
});
