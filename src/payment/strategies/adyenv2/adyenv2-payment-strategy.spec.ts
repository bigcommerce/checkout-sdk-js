import { createRequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';

import { getCartState } from '../../../cart/carts.mock';
import { createCheckoutStore, CheckoutRequestSender, CheckoutValidator } from '../../../checkout';
import CheckoutStore from '../../../checkout/checkout-store';
import { getCheckoutState } from '../../../checkout/checkouts.mock';
import { InvalidArgumentError, MissingDataError } from '../../../common/error/errors';
import { getConfigState } from '../../../config/configs.mock';
import { getCustomerState } from '../../../customer/customers.mock';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import OrderActionCreator from '../../../order/order-action-creator';
import { createSpamProtection, SpamProtectionActionCreator } from '../../../order/spam-protection';
import {
    createPaymentClient,
    PaymentInitializeOptions,
    PaymentMethodActionCreator,
    PaymentMethodRequestSender,
    PaymentRequestSender
} from '../../../payment';
import { PaymentArgumentInvalidError } from '../../errors';
import PaymentActionCreator from '../../payment-action-creator';
import { getAdyenV2, getPaymentMethodsState } from '../../payment-methods.mock';
import PaymentRequestTransformer from '../../payment-request-transformer';

import { AdyenCardState, AdyenComponent } from './adyenv2';
import AdyenV2PaymentStrategy from './adyenv2-payment-strategy';
import AdyenV2ScriptLoader from './adyenv2-script-loader';
import {
    getAdyenClient,
    getAdyenInitializeOptions,
    getAdyenOrderRequestBody,
    getInvalidCardState,
    getValidCardState
} from './adyenv2.mock';

describe('AdyenV2PaymentStrategy', () => {
    let store: CheckoutStore;
    let strategy: AdyenV2PaymentStrategy;
    let paymentMethodActionCreator: PaymentMethodActionCreator;
    let paymentActionCreator: PaymentActionCreator;
    let paymentRequestSender: PaymentRequestSender;
    let orderActionCreator: OrderActionCreator;
    let paymentRequestTransformer: PaymentRequestTransformer;
    let adyenV2ScriptLoader: AdyenV2ScriptLoader;

    beforeEach(() => {
        store = createCheckoutStore({
            checkout: getCheckoutState(),
            customer: getCustomerState(),
            config: getConfigState(),
            cart: getCartState(),
            paymentMethods: getPaymentMethodsState(),
        });

        const requestSender = createRequestSender();
        const paymentMethodRequestSender: PaymentMethodRequestSender = new PaymentMethodRequestSender(requestSender);
        const paymentClient = createPaymentClient(store);
        const scriptLoader = createScriptLoader();
        paymentRequestSender = new PaymentRequestSender(paymentClient);
        paymentRequestTransformer = new PaymentRequestTransformer();

        paymentMethodActionCreator = new PaymentMethodActionCreator(paymentMethodRequestSender);
        paymentActionCreator = new PaymentActionCreator(paymentRequestSender, orderActionCreator, paymentRequestTransformer);
        orderActionCreator = new OrderActionCreator(
            paymentClient,
            new CheckoutValidator(
                new CheckoutRequestSender(requestSender)
            ),
            new SpamProtectionActionCreator(createSpamProtection(scriptLoader)
        ));
        adyenV2ScriptLoader = new AdyenV2ScriptLoader(scriptLoader);

        strategy = new AdyenV2PaymentStrategy(
            store,
            paymentActionCreator,
            orderActionCreator,
            adyenV2ScriptLoader
        );
    });

    describe('#initialize()', () => {
        const adyenClient = getAdyenClient();
        let options: PaymentInitializeOptions;

        beforeEach(() => {
            options = getAdyenInitializeOptions();

            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValue(getAdyenV2());
        });

        it('loads adyen V2 script', async () => {
            jest.spyOn(adyenV2ScriptLoader, 'load').mockReturnValue(Promise.resolve(adyenClient));

            const promise =  strategy.initialize(options);

            expect(adyenV2ScriptLoader.load).toHaveBeenCalled();

            return expect(promise).resolves.toBe(store.getState());
        });

        it('loads adyen V2 script with no storeConfig', async () => {
            jest.spyOn(adyenV2ScriptLoader, 'load').mockReturnValue(Promise.resolve(adyenClient));
            jest.spyOn(store.getState().config, 'getStoreConfig').mockReturnValue(undefined);

            const promise =  strategy.initialize(options);

            expect(adyenV2ScriptLoader.load).toHaveBeenCalled();

            return expect(promise).resolves.toBe(store.getState());
        });

        it('does not load adyen V2 if initialization options are not provided', () => {
            options.adyenv2 = undefined;

            expect(() => strategy.initialize(options))
                .toThrow(InvalidArgumentError);
        });

        it('does not load adyen V2 if paymentMethod is not provided', () => {
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValue(undefined);

            expect(() => strategy.initialize(options))
                .toThrow(MissingDataError);
        });
    });

    describe('#callbacks', () => {
        const adyenClient = getAdyenClient();
        let options: PaymentInitializeOptions;
        let adyenComponent: AdyenComponent;
        let handleOnChange: (state: AdyenCardState, component: AdyenComponent) => {};

        beforeEach(() => {
            options = getAdyenInitializeOptions();

            adyenClient.adyenCheckout = jest.fn(() => {
                return {
                    create: jest.fn((type, options) => {
                        const { onChange } = options;
                        handleOnChange = onChange;

                        return adyenComponent;
                    }),
                };
            });

            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValue(getAdyenV2());
        });

        it('fires onChange with valid state', async () => {
            adyenComponent = {
                mount: jest.fn((containerId: string) => {
                    handleOnChange(getValidCardState(), adyenComponent);

                    return;
                }),
                unmount: jest.fn(),
            };

            jest.spyOn(adyenV2ScriptLoader, 'load').mockReturnValue(Promise.resolve(adyenClient));

            const promise =  strategy.initialize(options);

            return expect(promise).resolves.toBe(store.getState());
        });

        it('fires onChange with invalid state', async () => {
            adyenComponent = {
                mount: jest.fn((containerId: string) => {
                    handleOnChange(getInvalidCardState(), adyenComponent);

                    return;
                }),
                unmount: jest.fn(),
            };

            jest.spyOn(adyenV2ScriptLoader, 'load').mockReturnValue(Promise.resolve(adyenClient));

            const promise =  strategy.initialize(options);

            return expect(promise).resolves.toBe(store.getState());
        });
    });

    describe('#execute', () => {
        let options: PaymentInitializeOptions;
        const adyenClient = getAdyenClient();

        beforeEach(() => {
            options = getAdyenInitializeOptions();
            jest.spyOn(store, 'dispatch').mockReturnValue(Promise.resolve(store.getState()));
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValue(getAdyenV2());
            jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod').mockReturnValue(Promise.resolve());
            jest.spyOn(orderActionCreator, 'submitOrder').mockReturnValue(Promise.resolve());
            jest.spyOn(paymentActionCreator, 'submitPayment').mockReturnValue(Promise.resolve());
            jest.spyOn(paymentRequestTransformer, 'transform').mockReturnValue({
                state: 'state',
            });
        });

        it('creates the order and submit payment', async () => {
            jest.spyOn(adyenV2ScriptLoader, 'load').mockReturnValue(Promise.resolve(adyenClient));

            await strategy.initialize(options);
            const response = await strategy.execute(getAdyenOrderRequestBody());

            expect(store.getState().paymentMethods.getPaymentMethod).toHaveBeenCalled();
            expect(orderActionCreator.submitOrder).toHaveBeenCalled();
            expect(paymentActionCreator.submitPayment).toHaveBeenCalled();
            expect(response).toBe(store.getState());
        });

        it('throws an error when payment is not set properly into payload', () => {
            const payload = {
                payment: undefined,
            };

            expect(() => strategy.execute(payload))
                .toThrow(PaymentArgumentInvalidError);
        });
    });

    describe('#finalize()', () => {
        it('throws an error to inform that order finalization is not required', async () => {
            const promise = strategy.finalize();

            return expect(promise).rejects.toBeInstanceOf(OrderFinalizationNotRequiredError);
        });
    });

    describe('#deinitialize', () => {
        it('deinitializes adyen payment strategy', async () => {
            const adyenClient = getAdyenClient();
            const adyenCheckout = adyenClient.adyenCheckout();
            const adyenComponent = adyenCheckout.create('scheme', {});

            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValue(getAdyenV2());
            jest.spyOn(adyenV2ScriptLoader, 'load').mockReturnValue(Promise.resolve(adyenClient));
            jest.spyOn(adyenClient, 'adyenCheckout').mockReturnValue(adyenCheckout);
            jest.spyOn(adyenClient.adyenCheckout(), 'create').mockReturnValue(adyenComponent);

            await strategy.initialize(getAdyenInitializeOptions());
            const promise = strategy.deinitialize();

            expect(adyenComponent.unmount).toHaveBeenCalled();

            return expect(promise).resolves.toBe(store.getState());
        });

        it('does not unmount when adyen component is not available', async () => {
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValue(getAdyenV2());

            const promise = strategy.deinitialize();

            return expect(promise).resolves.toBe(store.getState());
        });
    });
});
