import { createAction } from '@bigcommerce/data-store';
import { createFormPoster, FormPoster } from '@bigcommerce/form-poster';
import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader, getScriptLoader } from '@bigcommerce/script-loader';
import { EventEmitter } from 'events';
import { from, of } from 'rxjs';

import { BillingAddressActionCreator, BillingAddressRequestSender } from '../../../billing';
import { Cart } from '../../../cart';
import { getCart } from '../../../cart/carts.mock';
import { createCheckoutStore, CheckoutActionCreator, CheckoutActionType, CheckoutRequestSender, CheckoutStore, CheckoutValidator } from '../../../checkout';
import { getCheckout, getCheckoutStoreState } from '../../../checkout/checkouts.mock';
import { InvalidArgumentError, MissingDataError, MissingDataErrorType } from '../../../common/error/errors';
import { ConfigActionCreator, ConfigRequestSender } from '../../../config';
import { FormFieldsActionCreator, FormFieldsRequestSender } from '../../../form';
import { CountryActionCreator, CountryActionType, CountryRequestSender } from '../../../geography';
import { getCountries } from '../../../geography/countries.mock';
import { OrderActionCreator, OrderRequestSender } from '../../../order';
import { PaymentMethod,
    PaymentMethodActionType,
    PaymentRequestSender,
    PaymentRequestTransformer } from '../../../payment';
// eslint-disable-next-line import/no-internal-modules
import PaymentActionCreator from '../../../payment/payment-action-creator';
import { getPaypalCommerce } from '../../../payment/payment-methods.mock';
import { ApproveActions, PaypalCommercePaymentProcessor, PaypalCommerceRequestSender, PaypalCommerceScriptLoader, StyleButtonColor, StyleButtonLabel } from '../../../payment/strategies/paypal-commerce';
import { ConsignmentActionCreator, ConsignmentActionType, ConsignmentRequestSender } from '../../../shipping';
import { getShippingOptions } from '../../../shipping/shipping-options.mock';
import { createSpamProtection, PaymentHumanVerificationHandler } from '../../../spam-protection';
import { SubscriptionsActionCreator, SubscriptionsRequestSender } from '../../../subscription';
import { CheckoutButtonInitializeOptions } from '../../checkout-button-options';
import CheckoutButtonMethodType from '../checkout-button-method-type';

import { PaypalCommerceButtonInitializeOptions } from './paypal-commerce-button-options';
import PaypalCommerceButtonStrategy from './paypal-commerce-button-strategy';

describe('PaypalCommerceButtonStrategy', () => {
    let store: CheckoutStore;
    let checkoutActionCreator: CheckoutActionCreator;
    let orderActionCreator: OrderActionCreator;
    let countryActionCreator: CountryActionCreator;
    let formPoster: FormPoster;
    let paypalOptions: PaypalCommerceButtonInitializeOptions;
    let options: CheckoutButtonInitializeOptions;
    let eventEmitter: EventEmitter;
    let strategy: PaypalCommerceButtonStrategy;
    let requestSender: RequestSender;
    let paymentMethod: PaymentMethod;
    let orderID: string;
    let actions: ApproveActions;
    let paypalCommercePaymentProcessor: PaypalCommercePaymentProcessor;
    let cart: Cart;
    let fundingSource: string;
    let messageContainer: HTMLDivElement;
    let consignmentActionCreator: ConsignmentActionCreator;
    let consignmentRequestSender: ConsignmentRequestSender;
    let billingAdressActionCreator: BillingAddressActionCreator;
    let paymentActionCreator: PaymentActionCreator;
    const paymentClient = {};

    beforeEach(() => {
        store = createCheckoutStore(getCheckoutStoreState());
        requestSender = createRequestSender();
        paymentMethod = { ...getPaypalCommerce() };
        cart = { ...getCart() };
        formPoster = createFormPoster();

        orderActionCreator = new OrderActionCreator(
            new OrderRequestSender(requestSender),
            new CheckoutValidator(new CheckoutRequestSender(requestSender))
        );

        countryActionCreator = new CountryActionCreator(new CountryRequestSender(requestSender, {}));
        consignmentRequestSender = new ConsignmentRequestSender(requestSender);
        billingAdressActionCreator = new BillingAddressActionCreator(new BillingAddressRequestSender(requestSender), new SubscriptionsActionCreator(new SubscriptionsRequestSender(requestSender)));
        paymentActionCreator = new PaymentActionCreator(new PaymentRequestSender(paymentClient), orderActionCreator, new PaymentRequestTransformer(), new PaymentHumanVerificationHandler(createSpamProtection(createScriptLoader())));

        checkoutActionCreator = new CheckoutActionCreator(
            new CheckoutRequestSender(requestSender),
            new ConfigActionCreator(new ConfigRequestSender(requestSender)),
            new FormFieldsActionCreator(new FormFieldsRequestSender(requestSender))
        );
        paypalCommercePaymentProcessor = new PaypalCommercePaymentProcessor(new PaypalCommerceScriptLoader(getScriptLoader()), new PaypalCommerceRequestSender(requestSender));
        eventEmitter = new EventEmitter();
        consignmentActionCreator = new ConsignmentActionCreator(
            consignmentRequestSender,
            new CheckoutRequestSender(requestSender)
        );

        paypalOptions = {
            style: {
                color: StyleButtonColor.white,
                label: StyleButtonLabel.buynow,
                height: 45,
            },
            messagingContainer: 'paypal-commerce-cart-messaging-banner',
        };

        options = {
            containerId: 'paypalcommerce-container',
            methodId: CheckoutButtonMethodType.PAYPALCOMMERCE,
            paypalCommerce: paypalOptions,
        };

        const payerDetails = {
                payer: {
                    name: {
                        given_name: 'Andrew',
                        surname: 'Brown',
                    },
                    email_address: 'test@bigcommerce.com',
                    payer_id: '123',
                    address: {
                        country_code: '123',
                    },
                },
                purchase_units: [ {
                    reference_id: '123',
                    amount: {
                        currency_code: 'USD',
                        value: '100',
                    },
                    payee: {
                        email_address: 'test@bigcommerce.com',
                        merchant_id: '123',
                    },
                    shipping: {
                        address: {
                            address_line_1: '',
                            address_area_1: '',
                            address_area2: '',
                            country_code: 'USD',
                            postal_code: '968',
                        },
                        name: {
                            full_name: 'ANDREW BROWN',
                        },
                    },
                } ],
        };

        const onShippingChangeData = {
            amount: {
                breakdown: {
                    item_total: {
                        currency_code: 'USD',
                        value: '100',
                    },
                shipping: {
                    currency_code: 'USD',
                    value: '100',
                },
                tax_total: {
                    currency_code: 'USD',
                    value: '100',
                },
                },
                currency_code: 'USD',
                value: '100',
            },
            orderID: '123',
            payment_token: 'PAYMENT_TOKEN',
            shipping_address: {
                city: 'Los-Angeles',
                postal_code: '08547',
                country_code: 'US',
                state: 'CA',
            },
            selected_shipping_option: {
                id: '123',
                amount: {
                    currency_code: 'USD',
                        value: '100',
                },
            },
        };

        orderID = 'ORDER_ID';
        fundingSource = 'paypal';
        actions = {
            order: {
                capture: jest.fn(() => new Promise(resolve => {
                    return resolve(payerDetails);
                })),
                authorize: jest.fn(() => new Promise(resolve => {
                    return resolve(payerDetails);
                })),
                patch: jest.fn(() => new Promise(resolve => {
                    return resolve() ;
                })),
                get:  jest.fn(() => new Promise(resolve => {
                    return resolve() ;
                })),
            },
            resolve: jest.fn().mockReturnValue(Promise.resolve()),
            reject: jest.fn().mockReturnValue(Promise.reject()),
         };

        jest.spyOn(checkoutActionCreator, 'loadDefaultCheckout')
            .mockReturnValue(() => {
                return from([
                    createAction(CheckoutActionType.LoadCheckoutRequested),
                    createAction(CheckoutActionType.LoadCheckoutSucceeded, getCheckout()),
                ]);
            });

        jest.spyOn(countryActionCreator, 'loadCountries')
            .mockReturnValue(() => {
                return from([
                    createAction(CountryActionType.LoadCountriesRequested),
                    createAction(CountryActionType.LoadCountriesSucceeded, getCountries()),
                ]);
            });

        jest.spyOn(consignmentActionCreator, 'loadShippingOptions')
            .mockReturnValue(() => {
                return from([
                    createAction(ConsignmentActionType.LoadShippingOptionsRequested),
                    createAction(ConsignmentActionType.LoadShippingOptionsSucceeded, getShippingOptions()),
                ]);
            });
        jest.spyOn(consignmentActionCreator, 'updateConsignment')
            .mockReturnValue(() => {
                return from([
                    createAction(ConsignmentActionType.UpdateConsignmentRequested),
                    createAction(ConsignmentActionType.UpdateConsignmentSucceeded, getCheckout()),
                ]);
            });

        jest.spyOn(paypalCommercePaymentProcessor, 'initialize')
            .mockReturnValue(Promise.resolve());

        jest.spyOn(paypalCommercePaymentProcessor, 'renderButtons')
            .mockImplementation((...arg) => {
                const [, , options] = arg;

                eventEmitter.on('onClick', () => {
                    if (options.onClick) {
                        options.onClick({ fundingSource });
                    }
                });

                eventEmitter.on('onApprove', () => {
                    if (options.onApprove) {
                        options.onApprove({ orderID }, actions);
                    }
                });

                eventEmitter.on('onShippingChange', () => {
                    if (options.onShippingChange) {
                        options.onShippingChange(onShippingChangeData, actions);
                    }
                });
            });

        jest.spyOn(paypalCommercePaymentProcessor, 'renderMessages')
            .mockImplementation(() => {} );

        jest.spyOn(formPoster, 'postForm')
            .mockImplementation(() => {});

        strategy = new PaypalCommerceButtonStrategy(
            store,
            checkoutActionCreator,
            formPoster,
            paypalCommercePaymentProcessor,
            orderActionCreator,
            countryActionCreator,
            consignmentActionCreator,
            billingAdressActionCreator,
            paymentActionCreator
        );

        if (paypalOptions.messagingContainer != null) {
            messageContainer = document.createElement('div');
            messageContainer.setAttribute('id', paypalOptions.messagingContainer);
            document.body.appendChild(messageContainer);
        }
    });

    afterEach(() => {
        if (paypalOptions.messagingContainer != null && document.getElementById(paypalOptions.messagingContainer)) {
                document.body.removeChild(messageContainer);
        }
    });

    it('initializes PaypalCommerce and PayPal credit disabled & messaging enabled', async () => {
        await strategy.initialize(options);

        const obj = {
            'client-id': 'abc',
            commit: false,
            currency: 'USD',
            intent: 'capture',
            components: ['buttons', 'messages'],
            'disable-funding': [ 'card', 'credit', 'paylater'],
        };

        expect(paypalCommercePaymentProcessor.initialize).toHaveBeenCalledWith(obj);
    });

    it('initializes PaypalCommerce and PayPal credit enabled & messaging enabled', async () => {
        paymentMethod.initializationData.isPayPalCreditAvailable = true;
        await store.dispatch(of(createAction(PaymentMethodActionType.LoadPaymentMethodsSucceeded, [paymentMethod])));

        await strategy.initialize(options);

        const obj = {
                'client-id': 'abc',
                commit: false,
                currency: 'USD',
                intent: 'capture',
                components: ['buttons', 'messages'],
                'disable-funding': [ 'card'],
                'enable-funding': ['credit', 'paylater'],
        };

        expect(paypalCommercePaymentProcessor.initialize).toHaveBeenCalledWith(obj);
    });

    it('Loads with intent authorize', async () => {
        paymentMethod.initializationData.isPayPalCreditAvailable = true;
        paymentMethod.initializationData.intent = 'authorize';
        await store.dispatch(of(createAction(PaymentMethodActionType.LoadPaymentMethodsSucceeded, [paymentMethod])));

        await strategy.initialize(options);

        const obj = {
            'client-id': 'abc',
            commit: false,
            currency: 'USD',
            intent: 'authorize',
            components: ['buttons', 'messages'],
            'disable-funding': ['card'],
            'enable-funding': ['credit', 'paylater'],
        };

        expect(paypalCommercePaymentProcessor.initialize).toHaveBeenCalledWith(obj);
    });

    it('Do not call formPoster if isHosted true in initializationData', async () => {
        paymentMethod.initializationData.isHosted = true;
        await store.dispatch(of(createAction(PaymentMethodActionType.LoadPaymentMethodsSucceeded, [paymentMethod])));

        await strategy.initialize(options);
        eventEmitter.emit('onApprove');

        expect(formPoster.postForm).toHaveBeenCalledTimes(0);
    });

    it('calls order get', async () => {
        paymentMethod.initializationData.isHosted = true;
        paymentMethod.initializationData.intent = 'capture';
        await store.dispatch(of(createAction(PaymentMethodActionType.LoadPaymentMethodsSucceeded, [paymentMethod])));
        await strategy.initialize(options);
        eventEmitter.emit('onClick');
        await new Promise(resolve => process.nextTick(resolve));
        eventEmitter.emit('onShippingChange');
        await new Promise(resolve => process.nextTick(resolve));
        eventEmitter.emit('onApprove');

        expect(actions.order.get).toHaveBeenCalled();
    });

    it('calls actions.order.patch', async () => {
        jest.spyOn(consignmentActionCreator, 'createConsignments').mockReturnValue(ConsignmentActionType.CreateConsignmentsSucceeded);
        jest.spyOn(countryActionCreator, 'loadCountries')
            .mockImplementation( () => Promise.resolve([{
                code: 'US',
                hasPostalCodes: true,
                id: 1,
                name: 'United States',
                requiresState: false,
                subdivisions: [{
                    code: 'CA',
                    id: 12,
                    name: 'California',
                }],
            }]));
        await strategy.initialize(options);
        eventEmitter.emit('onClick');
        eventEmitter.emit('onShippingChange');
        await new Promise(resolve => process.nextTick(resolve));

        expect(actions.order.patch).toHaveBeenCalled();
    });

    it('initializes PaypalCommerce with enabled APMs', async () => {

        paymentMethod.initializationData.availableAlternativePaymentMethods = ['sepa', 'venmo', 'sofort', 'mybank'];
        paymentMethod.initializationData.enabledAlternativePaymentMethods = ['sofort', 'mybank'];
        await store.dispatch(of(createAction(PaymentMethodActionType.LoadPaymentMethodsSucceeded, [paymentMethod])));

        await strategy.initialize(options);

        const obj = {
                'client-id': 'abc',
                commit: false,
                currency: 'USD',
                intent: 'capture',
                components: ['buttons', 'messages'],
                'disable-funding': ['card', 'sepa', 'venmo', 'credit', 'paylater'],
                'enable-funding': ['sofort', 'mybank'],
        };

        expect(paypalCommercePaymentProcessor.initialize).toHaveBeenCalledWith(obj);
    });

    it('call createConsignments', async () => {
        paymentMethod.initializationData.isHosted = true;
        await store.dispatch(of(createAction(PaymentMethodActionType.LoadPaymentMethodsSucceeded, [paymentMethod])));
        const action = ConsignmentActionType.CreateConsignmentsSucceeded;
        jest.spyOn(consignmentActionCreator, 'createConsignments').mockReturnValue(action);
        jest.spyOn(store, 'dispatch');
        consignmentActionCreator.createConsignments = jest.fn();
        await strategy.initialize(options);
        eventEmitter.emit('onClick');
        await new Promise(resolve => process.nextTick(resolve));
        eventEmitter.emit('onShippingChange');
        await new Promise(resolve => process.nextTick(resolve));
        eventEmitter.emit('onApprove');
        await new Promise(resolve => process.nextTick(resolve));

        expect(consignmentActionCreator.createConsignments).toHaveBeenCalled();
    });

    it('goes to checkout page when initializationData.isHosted = false', async () => {
        paymentMethod.initializationData.isHosted = false;
        await store.dispatch(of(createAction(PaymentMethodActionType.LoadPaymentMethodsSucceeded, [paymentMethod])));
        await strategy.initialize(options);
        eventEmitter.emit('onApprove');
        await new Promise(resolve => process.nextTick(resolve));
        expect(formPoster.postForm).toHaveBeenCalled();
    });

    it('does not render any paypal message', async () => {
        await strategy.initialize({...options, paypalCommerce: {messagingContainer: undefined}});

        expect(paypalCommercePaymentProcessor.renderMessages).toHaveBeenCalledTimes(0);
    });

    it('initializes PaypalCommerce with disabled APMs', async () => {
        paymentMethod.initializationData.availableAlternativePaymentMethods = ['sepa', 'venmo', 'sofort', 'mybank'];
        paymentMethod.initializationData.enabledAlternativePaymentMethods = [];
        await store.dispatch(of(createAction(PaymentMethodActionType.LoadPaymentMethodsSucceeded, [paymentMethod])));

        await strategy.initialize(options);

        const obj = {
                'client-id': 'abc',
                commit: false,
                currency: 'USD',
                intent: 'capture',
                components: ['buttons', 'messages'],
                'disable-funding': [ 'card', 'sepa', 'venmo', 'sofort', 'mybank', 'credit', 'paylater'],
        };

        expect(paypalCommercePaymentProcessor.initialize).toHaveBeenCalledWith(obj);
    });

    it('render PayPal buttons', async () => {
        await strategy.initialize(options);

        const buttonOption = {
            onApprove: expect.any(Function),
            onClick: expect.any(Function),
            style: paypalOptions.style,
            onShippingChange: expect.any(Function),
        };

        expect(paypalCommercePaymentProcessor.renderButtons).toHaveBeenCalledWith(cart.id, `#${options.containerId}`, buttonOption);
    });

    it('do not render PayPal messaging without banner element', async () => {
        document.body.removeChild(messageContainer);

        await strategy.initialize(options);

        expect(paypalCommercePaymentProcessor.renderMessages).not.toHaveBeenCalled();
    });

    it('render PayPal messaging with banner element', async () => {
        await store.dispatch(of(createAction(PaymentMethodActionType.LoadPaymentMethodsSucceeded, [paymentMethod])));
        await strategy.initialize(options);

        expect(paypalCommercePaymentProcessor.renderMessages).toHaveBeenCalledWith(cart.cartAmount, `#${paypalOptions.messagingContainer}`);
    });

    describe('throws error during initialize', () => {
        it('without clientId', async () => {
            paymentMethod.initializationData.clientId = null;

            await store.dispatch(of(createAction(PaymentMethodActionType.LoadPaymentMethodsSucceeded, [paymentMethod])));

            strategy = new PaypalCommerceButtonStrategy(
                store,
                checkoutActionCreator,
                formPoster,
                paypalCommercePaymentProcessor,
                orderActionCreator,
                countryActionCreator,
                consignmentActionCreator,
                billingAdressActionCreator,
                paymentActionCreator
            );

            try {
                await strategy.initialize(options);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('throws error if payment method is not loaded', async () => {
            try {
                store = createCheckoutStore();
                strategy = new PaypalCommerceButtonStrategy(
                    store,
                    checkoutActionCreator,
                    formPoster,
                    paypalCommercePaymentProcessor,
                    orderActionCreator,
                    countryActionCreator,
                    consignmentActionCreator,
                    billingAdressActionCreator,
                    paymentActionCreator
                );

                options = {
                    containerId: 'paypalcommerce-container1',
                    paypalCommerce: paypalOptions,
                } as CheckoutButtonInitializeOptions;

                await strategy.initialize(options);
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
            }
        });

        it('throw error without cart', async () => {
            const state = getCheckoutStoreState();
            delete state.cart.data;

            store = createCheckoutStore(state);

            strategy = new PaypalCommerceButtonStrategy(
                store,
                checkoutActionCreator,
                formPoster,
                paypalCommercePaymentProcessor,
                orderActionCreator,
                countryActionCreator,
                consignmentActionCreator,
                billingAdressActionCreator,
                paymentActionCreator
            );
            const checkout = getCheckout();
            delete checkout.cart;

            jest.spyOn(checkoutActionCreator, 'loadDefaultCheckout')
                .mockReturnValue(() => {
                    return from([
                        createAction(CheckoutActionType.LoadCheckoutRequested),
                        createAction(CheckoutActionType.LoadCheckoutSucceeded, checkout),
                    ]);
                });

            try {
                await strategy.initialize(options);
            } catch (error) {
                expect(error).toEqual(new MissingDataError(MissingDataErrorType.MissingCart));
            }
        });
    });
});
