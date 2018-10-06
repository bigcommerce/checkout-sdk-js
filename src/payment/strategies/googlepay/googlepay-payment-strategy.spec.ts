import {createRequestSender, RequestSender} from '@bigcommerce/request-sender';
import createScriptLoader from '@bigcommerce/script-loader/lib/create-script-loader';

import BillingAddressActionCreator from '../../../billing/billing-address-action-creator';
import BillingAddressRequestSender from '../../../billing/billing-address-request-sender';
import {getCartState} from '../../../cart/carts.mock';
import {
    createCheckoutStore, CheckoutActionCreator, CheckoutRequestSender, CheckoutStore,
    CheckoutValidator
} from '../../../checkout';
import {getCheckoutState} from '../../../checkout/checkouts.mock';
import InvalidArgumentError from '../../../common/error/errors/invalid-argument-error';
import MissingDataError from '../../../common/error/errors/missing-data-error';
import {ConfigActionCreator, ConfigRequestSender} from '../../../config';
import {getConfigState} from '../../../config/configs.mock';
import {getCustomerState} from '../../../customer/customers.mock';
import {OrderActionCreator} from '../../../order';
import {
    createPaymentClient,
    createPaymentStrategyRegistry, PaymentActionCreator, PaymentMethodActionCreator,
    PaymentStrategyActionCreator
} from '../../../payment';
import createShippingStrategyRegistry from '../../../shipping/create-shipping-strategy-registry';
import ShippingStrategyActionCreator from '../../../shipping/shipping-strategy-action-creator';
import {ShippingStrategyActionType} from '../../../shipping/shipping-strategy-actions';
import PaymentMethod from '../../payment-method';
import PaymentMethodRequestSender from '../../payment-method-request-sender';
import {getGooglePay, getPaymentMethodsState} from '../../payment-methods.mock';
import {PaymentInitializeOptions} from '../../payment-request-options';
import PaymentRequestSender from '../../payment-request-sender';
import BraintreeScriptLoader from '../braintree/braintree-script-loader';
import BraintreeSDKCreator from '../braintree/braintree-sdk-creator';
import PaymentStrategy from '../payment-strategy';

import {GooglePayInitializer} from './googlepay';
import GooglePayBraintreeInitializer from './googlepay-braintree-initializer';
import GooglePayPaymentProcessor from './googlepay-payment-processor';
import GooglePayPaymentStrategy from './googlepay-payment-strategy';
import GooglePayScriptLoader from './googlepay-script-loader';
import {
    getGoogleOrderRequestBody, getGooglePaymentDataMock, getGooglePaymentDataPayload,
    getGooglePaySDKMock
} from './googlepay.mock';
import {MissingDataErrorType} from "../../../common/error/errors";

describe('GooglePayPaymentStrategy', () => {
    let store: CheckoutStore;
    let googlePayScriptLoader: GooglePayScriptLoader;
    let strategy: GooglePayPaymentStrategy;
    let checkoutActionCreator: CheckoutActionCreator;
    let paymentMethodActionCreator: PaymentMethodActionCreator;
    let paymentStrategyActionCreator: PaymentStrategyActionCreator;
    let paymentActionCreator: PaymentActionCreator;
    let orderActionCreator: OrderActionCreator;
    let googlePayInitializer: GooglePayInitializer;
    let requestSender: RequestSender;
    let googlePayPaymentProcessor: GooglePayPaymentProcessor;
    let container: HTMLDivElement;
    let walletButton: HTMLAnchorElement;
    let paymentMethodMock: PaymentMethod;

    beforeEach(() => {
        store = createCheckoutStore({
            checkout: getCheckoutState(),
            customer: getCustomerState(),
            config: getConfigState(),
            cart: getCartState(),
            paymentMethods: getPaymentMethodsState(),
        });

        const checkoutRequestSender = new CheckoutRequestSender(createRequestSender());
        const configRequestSender = new ConfigRequestSender(createRequestSender());
        const configActionCreator = new ConfigActionCreator(configRequestSender);
        const _requestSender: PaymentMethodRequestSender = new PaymentMethodRequestSender(requestSender);
        const paymentClient = createPaymentClient(store);
        const registry = createPaymentStrategyRegistry(store, paymentClient, requestSender);
        const scriptLoader = createScriptLoader();
        const braintreeScriptLoader = new BraintreeScriptLoader(scriptLoader);
        const braintreeSdkCreator = new BraintreeSDKCreator(braintreeScriptLoader);
        const billingAddressActionCreator = new BillingAddressActionCreator(new BillingAddressRequestSender(requestSender));
        const shippingRegistry = createShippingStrategyRegistry(store, requestSender);
        const shippingStrategyActionCreator = new ShippingStrategyActionCreator(shippingRegistry);

        googlePayScriptLoader = new GooglePayScriptLoader(createScriptLoader());
        requestSender = createRequestSender();
        checkoutActionCreator = new CheckoutActionCreator(checkoutRequestSender, configActionCreator);
        paymentMethodActionCreator = new PaymentMethodActionCreator(_requestSender);
        paymentStrategyActionCreator = new PaymentStrategyActionCreator(registry, orderActionCreator);
        paymentActionCreator = new PaymentActionCreator(new PaymentRequestSender(paymentClient), orderActionCreator);
        orderActionCreator = new OrderActionCreator(
            paymentClient,
            new CheckoutValidator(
                new CheckoutRequestSender(createRequestSender())
            )
        );
        googlePayInitializer = new GooglePayBraintreeInitializer(braintreeSdkCreator);
        googlePayPaymentProcessor = new GooglePayPaymentProcessor(
            store,
            paymentMethodActionCreator,
            googlePayScriptLoader,
            googlePayInitializer,
            billingAddressActionCreator,
            shippingStrategyActionCreator
        );

        strategy = new GooglePayPaymentStrategy(
            store,
            checkoutActionCreator,
            paymentMethodActionCreator,
            paymentStrategyActionCreator,
            paymentActionCreator,
            orderActionCreator,
            googlePayInitializer,
            requestSender,
            googlePayPaymentProcessor
        );

        container = document.createElement('div');
        walletButton = document.createElement('a');
        container.setAttribute('id', 'login');
        walletButton.setAttribute('id', 'mockButton');
        document.body.appendChild(container);
        document.body.appendChild(walletButton);

        spyOn(walletButton, 'removeEventListener');
        spyOn(requestSender, 'post').and.returnValue(Promise.resolve());
        spyOn(googlePayInitializer, 'initialize').and.returnValue(getGooglePaymentDataPayload());
        spyOn(checkoutActionCreator, 'loadCurrentCheckout').and.returnValue(Promise.resolve());
        spyOn(paymentMethodActionCreator, 'loadPaymentMethod').and.returnValue(Promise.resolve(store.getState()))
        spyOn(googlePayPaymentProcessor, 'initialize').and.returnValue(Promise.resolve());

        paymentMethodMock = { ...getGooglePay() };
    });

    afterEach(() => {
        document.body.removeChild(container);
        document.body.removeChild(walletButton);
    });

    it('creates an instance of GooglePayPaymentStrategy', () => {
        expect(strategy).toBeInstanceOf(GooglePayPaymentStrategy);
    });

    describe('#initialize()', () => {
        let googlePayOptions: PaymentInitializeOptions;

        beforeEach(() => {
            spyOn(walletButton, 'addEventListener');
            googlePayOptions = { methodId: 'googlepay', googlepay: { walletButton: 'mockButton' } };
        });

        it('loads googlepay script', async () => {
            paymentMethodMock.config.testMode = true;

            await strategy.initialize(googlePayOptions);

            expect(googlePayPaymentProcessor.initialize).toHaveBeenCalled();
        });

        it('does not load googlepay if initialization options are not provided', async () => {
            googlePayOptions = { methodId: 'googlepay'};

            expect(() => strategy.initialize(googlePayOptions)).toThrowError(InvalidArgumentError);
        });

        it('adds the event listener to the wallet button', async () => {
            await strategy.initialize(googlePayOptions);

            expect(walletButton.addEventListener).toHaveBeenCalled();
        });

        it('does not add the event listener to the wallet button', async () => {
            googlePayOptions = { methodId: 'googlepay', googlepay: { } };

            await strategy.initialize(googlePayOptions);

            expect(walletButton.addEventListener).toHaveBeenCalledTimes(0);
        });

        it('checks if element exist in the DOM', async () => {
            if (googlePayOptions.googlepay && googlePayOptions.googlepay.walletButton) {
                spyOn(document, 'getElementById').and.returnValue(document.getElementById(googlePayOptions.googlepay.walletButton));

                await strategy.initialize(googlePayOptions);

                expect(document.getElementById).toHaveBeenCalledWith(googlePayOptions.googlepay.walletButton);
            }
        });
    });

    describe('#deinitialize', () => {
        let googlePayOptions: PaymentInitializeOptions;

        beforeEach(() => {
            spyOn(walletButton, 'addEventListener');
            googlePayOptions = { methodId: 'googlepay', googlepay: { walletButton: 'mockButton' } };
        });

        it('deinitializes googlePayInitializer and GooglePayment Processor', async () => {
            spyOn(googlePayInitializer, 'teardown').and.returnValue(Promise.resolve());
            spyOn(googlePayPaymentProcessor, 'deinitialize').and.returnValue(Promise.resolve());

            await strategy.deinitialize();

            expect(googlePayInitializer.teardown).toHaveBeenCalled();
            expect(googlePayPaymentProcessor.deinitialize).toHaveBeenCalled();
        });

        it('removes the eventListener', async () => {
            spyOn(googlePayInitializer, 'teardown').and.returnValue(Promise.resolve());
            spyOn(googlePayPaymentProcessor, 'deinitialize').and.returnValue(Promise.resolve());

            await strategy.initialize(googlePayOptions);
            await strategy.deinitialize();

            expect(googlePayInitializer.teardown).toHaveBeenCalled();
            expect(googlePayPaymentProcessor.deinitialize).toHaveBeenCalled();
        });
    });

    describe('#execute', () => {
        let googlePayOptions: PaymentInitializeOptions;

        beforeEach(() => {
            spyOn(walletButton, 'addEventListener');
            spyOn(store, 'dispatch').and.returnValue(Promise.resolve());
            googlePayOptions = { methodId: 'googlepay', googlepay: { walletButton: 'mockButton' } };
        });

        it('creates the order and submit payment', async () => {
            spyOn(orderActionCreator, 'submitOrder').and.returnValue(Promise.resolve());
            spyOn(paymentActionCreator, 'submitPayment').and.returnValue(Promise.resolve());

            await strategy.initialize(googlePayOptions);
            await strategy.execute(getGoogleOrderRequestBody());

            expect(orderActionCreator.submitOrder).toHaveBeenCalled();
            expect(paymentActionCreator.submitPayment).toHaveBeenCalled();
        });

        it('throws and error when payment method is not available', async () => {
            // const googlePay = getGooglePay();
            // googlePay.initializationData = {};

            spyOn(store.getState().paymentMethods, 'getPaymentMethod').and.returnValue(undefined);

            await strategy.initialize(googlePayOptions);

            try {
                await strategy.execute(getGoogleOrderRequestBody());
            } catch (exception) {
                expect(exception).toBeInstanceOf(MissingDataError);
                expect(exception).toEqual(new MissingDataError(MissingDataErrorType.MissingPaymentMethod));
            }
        });

        it('throws and error when payment method initialization data is not available', async () => {
            const googlePay = getGooglePay();
            googlePay.initializationData = {};

            spyOn(store.getState().paymentMethods, 'getPaymentMethod').and.returnValue(googlePay);

            await strategy.initialize(googlePayOptions);

            try {
                await strategy.execute(getGoogleOrderRequestBody());
            } catch (exception) {
                expect(exception).toBeInstanceOf(MissingDataError);
                expect(exception).toEqual(new MissingDataError(MissingDataErrorType.MissingPayment));
            }
        });
    });

    describe('#handleWalletButtonClick', () => {
        let googlePayOptions: PaymentInitializeOptions;
        let paymentData: any;
        let tokenizePayload: any;

        beforeEach(() => {
            googlePayOptions = {
                methodId: 'googlepay',
                googlepay: {
                    walletButton: 'mockButton',
                    onError: () => {},
                    onPaymentSelect: () => {},
                },
            };

            paymentData = {
                cardInfo: {
                    billingAddress: {},
                },
            };

            tokenizePayload = {
                details: {
                    cardType: 'MasterCard',
                    lastFour: '4111',
                },
                type: 'Google Pay',
                nonce: 'nonce',
            };
        });

        it('handles wallet button event', async () => {
            spyOn(googlePayPaymentProcessor, 'displayWallet').and.returnValue(Promise.resolve(paymentData));
            spyOn(googlePayPaymentProcessor, 'parseResponse').and.returnValue(Promise.resolve(tokenizePayload));
            spyOn(googlePayPaymentProcessor, 'updateBillingAddress').and.callFake(() => {
                spyOn(store, 'dispatch').and.callFake(() => {});
            });

            await strategy.initialize(googlePayOptions).then(() => {
                walletButton.click();
            });

            expect(googlePayPaymentProcessor.initialize).toHaveBeenCalled();
        });

        it('misses methodId when handling wallet button event', async () => {
            spyOn(googlePayPaymentProcessor, 'displayWallet').and.returnValue(Promise.resolve(paymentData));
            spyOn(googlePayPaymentProcessor, 'parseResponse').and.returnValue(Promise.resolve(tokenizePayload));
            spyOn(googlePayPaymentProcessor, 'updateBillingAddress').and.callFake(() => {
                spyOn(store, 'dispatch').and.callFake(() => {});
            });

            const googlePayOptionsWithOutMethodId: any = {
                googlepay: {
                    walletButton: 'mockButton',
                    onError: () => {},
                    onPaymentSelect: () => {},
                },
            };

            await strategy.initialize(googlePayOptionsWithOutMethodId).then(() => {
                walletButton.click();
            });

            expect(googlePayPaymentProcessor.initialize).toHaveBeenCalled();
        });
    });
});
