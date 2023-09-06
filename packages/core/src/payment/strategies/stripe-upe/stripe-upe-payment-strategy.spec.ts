import { createClient as createPaymentClient } from '@bigcommerce/bigpay-client';
import { Action, createAction, createErrorAction } from '@bigcommerce/data-store';
import { createRequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';
import { Observable, of } from 'rxjs';

import { PaymentMethodFailedError } from '@bigcommerce/checkout-sdk/payment-integration-api';

import {
    BillingAddressActionCreator,
    BillingAddressActionType,
    BillingAddressRequestSender,
} from '../../../billing';
import { getBillingAddress } from '../../../billing/billing-addresses.mock';
import {
    Checkout,
    CheckoutRequestSender,
    CheckoutStore,
    CheckoutValidator,
    createCheckoutStore,
} from '../../../checkout';
import { getCheckout, getCheckoutStoreState } from '../../../checkout/checkouts.mock';
import {
    InvalidArgumentError,
    MissingDataError,
    NotInitializedError,
    RequestError,
} from '../../../common/error/errors';
import { getResponse } from '../../../common/http-request/responses.mock';
import { getCustomer } from '../../../customer/customers.mock';
import {
    FinalizeOrderAction,
    OrderActionCreator,
    OrderActionType,
    OrderRequestSender,
    SubmitOrderAction,
} from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import {
    LoadPaymentMethodAction,
    PaymentInitializeOptions,
    PaymentMethodActionType,
    PaymentMethodRequestSender,
    PaymentRequestSender,
} from '../../../payment';
import { getShippingAddress } from '../../../shipping/shipping-addresses.mock';
import { createSpamProtection, PaymentHumanVerificationHandler } from '../../../spam-protection';
import {
    StoreCreditActionCreator,
    StoreCreditActionType,
    StoreCreditRequestSender,
} from '../../../store-credit';
import { SubscriptionsActionCreator, SubscriptionsRequestSender } from '../../../subscription';
import { PaymentArgumentInvalidError, PaymentMethodCancelledError } from '../../errors';
import PaymentActionCreator from '../../payment-action-creator';
import { PaymentActionType, SubmitPaymentAction } from '../../payment-actions';
import PaymentMethod from '../../payment-method';
import PaymentMethodActionCreator from '../../payment-method-action-creator';
import { getStripeUPE } from '../../payment-methods.mock';
import PaymentRequestTransformer from '../../payment-request-transformer';
import { getErrorPaymentResponseBody } from '../../payments.mock';

import {
    StripeElementsOptions,
    StripeElementType,
    StripePaymentMethodType,
    StripeUPEClient,
} from './stripe-upe';
import StripeUPEPaymentStrategy from './stripe-upe-payment-strategy';
import StripeUPEScriptLoader from './stripe-upe-script-loader';
import {
    getConfirmPaymentResponse,
    getFailingStripeUPEJsMock,
    getRetrievePaymentIntentResponse,
    getRetrievePaymentIntentResponseSucceeded,
    getStripeUPEInitializeOptionsMock,
    getStripeUPEJsMock,
    getStripeUPEOrderRequestBodyMock,
    getStripeUPEOrderRequestBodyVaultMock,
    getStripeUPEWithLinkOrderRequestBodyMock,
} from './stripe-upe.mock';

describe('StripeUPEPaymentStrategy', () => {
    let billingAddressActionCreator: BillingAddressActionCreator;
    let billingAddressRequestSender: BillingAddressRequestSender;
    let checkoutMock: Checkout;
    let finalizeOrderAction: Observable<FinalizeOrderAction>;
    let loadPaymentMethodAction: Observable<LoadPaymentMethodAction>;
    let orderActionCreator: OrderActionCreator;
    let orderRequestSender: OrderRequestSender;
    let paymentActionCreator: PaymentActionCreator;
    let paymentMethodActionCreator: PaymentMethodActionCreator;
    let paymentMethodMock: PaymentMethod;
    let store: CheckoutStore;
    let storeCreditActionCreator: StoreCreditActionCreator;
    let strategy: StripeUPEPaymentStrategy;
    let stripeScriptLoader: StripeUPEScriptLoader;
    let submitOrderAction: Observable<SubmitOrderAction>;
    let submitPaymentAction: Observable<SubmitPaymentAction>;
    let updateAddressAction: Observable<Action>;

    beforeEach(() => {
        store = createCheckoutStore(getCheckoutStoreState());

        const requestSender = createRequestSender();

        billingAddressRequestSender = new BillingAddressRequestSender(requestSender);

        const paymentMethodRequestSender: PaymentMethodRequestSender =
            new PaymentMethodRequestSender(requestSender);
        const scriptLoader = createScriptLoader();

        paymentMethodActionCreator = new PaymentMethodActionCreator(paymentMethodRequestSender);

        orderRequestSender = new OrderRequestSender(requestSender);
        orderActionCreator = new OrderActionCreator(
            orderRequestSender,
            new CheckoutValidator(new CheckoutRequestSender(requestSender)),
        );

        paymentActionCreator = new PaymentActionCreator(
            new PaymentRequestSender(createPaymentClient()),
            orderActionCreator,
            new PaymentRequestTransformer(),
            new PaymentHumanVerificationHandler(createSpamProtection(scriptLoader)),
        );

        billingAddressActionCreator = new BillingAddressActionCreator(
            billingAddressRequestSender,
            new SubscriptionsActionCreator(new SubscriptionsRequestSender(requestSender)),
        );

        storeCreditActionCreator = new StoreCreditActionCreator(
            new StoreCreditRequestSender(requestSender),
        );
        paymentMethodMock = { ...getStripeUPE(), clientToken: 'myToken' };

        stripeScriptLoader = new StripeUPEScriptLoader(scriptLoader);
        finalizeOrderAction = of(createAction(OrderActionType.FinalizeOrderRequested));
        submitOrderAction = of(createAction(OrderActionType.SubmitOrderRequested));
        submitPaymentAction = of(createAction(PaymentActionType.SubmitPaymentRequested));
        loadPaymentMethodAction = of(
            createAction(PaymentMethodActionType.LoadPaymentMethodSucceeded, paymentMethodMock, {
                methodId: `stripeupe?method=${paymentMethodMock.id}`,
            }),
        );
        checkoutMock = getCheckout();
        updateAddressAction = of(
            createAction(BillingAddressActionType.UpdateBillingAddressRequested),
        );

        jest.useFakeTimers();

        jest.spyOn(store, 'dispatch');

        jest.spyOn(orderActionCreator, 'submitOrder').mockReturnValue(submitOrderAction);

        jest.spyOn(paymentActionCreator, 'submitPayment').mockReturnValue(submitPaymentAction);

        jest.spyOn(orderActionCreator, 'finalizeOrder').mockReturnValue(finalizeOrderAction);

        jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod').mockReturnValue(
            loadPaymentMethodAction,
        );

        jest.spyOn(storeCreditActionCreator, 'applyStoreCredit').mockReturnValue(
            of(createAction(StoreCreditActionType.ApplyStoreCreditSucceeded)),
        );

        jest.spyOn(store.getState().checkout, 'getCheckoutOrThrow').mockReturnValue(checkoutMock);

        jest.spyOn(billingAddressActionCreator, 'updateAddress').mockReturnValue(
            updateAddressAction,
        );

        jest.spyOn(store, 'subscribe');

        strategy = new StripeUPEPaymentStrategy(
            store,
            paymentMethodActionCreator,
            paymentActionCreator,
            orderActionCreator,
            stripeScriptLoader,
            storeCreditActionCreator,
            billingAddressActionCreator,
        );
    });

    describe('#initialize()', () => {
        let options: PaymentInitializeOptions;
        const elementsOptions: StripeElementsOptions = { clientSecret: 'myToken' };
        let stripeUPEJsMock: StripeUPEClient;
        const testColor = '#123456';
        const style = {
            labelText: testColor,
            fieldText: testColor,
            fieldPlaceholderText: testColor,
            fieldErrorText: testColor,
            fieldBackground: testColor,
            fieldInnerShadow: testColor,
            fieldBorder: testColor,
        };

        beforeEach(() => {
            stripeUPEJsMock = getStripeUPEJsMock();
            options = getStripeUPEInitializeOptionsMock(StripePaymentMethodType.CreditCard, style);

            const { create, getElement, update, fetchUpdates } =
                stripeUPEJsMock.elements(elementsOptions);

            stripeUPEJsMock.elements = jest
                .fn()
                .mockReturnValue({ create, getElement, update, fetchUpdates });
            jest.spyOn(stripeScriptLoader, 'getStripeClient').mockReturnValueOnce(
                Promise.resolve(stripeUPEJsMock),
            );
        });

        it('loads a single instance of StripeUPEClient and StripeElements including styles', async () => {
            await expect(strategy.initialize(options)).resolves.toBe(store.getState());
            await expect(strategy.initialize(options)).resolves.toBe(store.getState());

            expect(stripeScriptLoader.getStripeClient).toHaveBeenCalledTimes(1);
            expect(stripeUPEJsMock.elements).toHaveBeenNthCalledWith(1, {
                locale: 'en',
                clientSecret: 'myToken',
                appearance: {
                    rules: {
                        '.Input': {
                            borderColor: testColor,
                            boxShadow: testColor,
                            color: testColor,
                        },
                    },
                    variables: {
                        colorBackground: testColor,
                        colorDanger: testColor,
                        colorIcon: testColor,
                        colorPrimary: testColor,
                        colorText: testColor,
                        colorTextPlaceholder: testColor,
                        colorTextSecondary: testColor,
                    },
                },
            });
        });

        it('loads stripeUPE script', async () => {
            await expect(strategy.initialize(options)).resolves.toBe(store.getState());

            expect(stripeScriptLoader.getStripeClient).toHaveBeenCalled();
        });

        it('loads subscribe once', async () => {
            await expect(strategy.initialize(options)).resolves.toBe(store.getState());

            store.notifyState();

            expect(store.subscribe).toHaveBeenCalledTimes(1);
        });

        it('does not load stripeUPE if initialization options are not provided', () => {
            delete options.stripeupe;

            const promise = strategy.initialize(options);

            expect(promise).rejects.toThrow(NotInitializedError);
        });

        it('fails to load stripeUPE', async () => {
            jest.spyOn(stripeScriptLoader, 'getStripeClient').mockReturnValue(undefined);

            await expect(strategy.initialize(options)).resolves.toBe(store.getState());

            expect(stripeUPEJsMock.elements).not.toHaveBeenCalled();
        });

        it('does not load stripeUPE if gatewayId is not provided', () => {
            delete options.gatewayId;

            const promise = strategy.initialize(options);

            expect(promise).rejects.toThrow(InvalidArgumentError);
        });

        describe('mounts single payment element', () => {
            beforeEach(() => {
                const elements = stripeUPEJsMock.elements(elementsOptions);

                elements.create(StripeElementType.PAYMENT);
                jest.spyOn(stripeUPEJsMock, 'elements').mockReturnValue(elements);
            });

            it('mounts a previously created stripe element', async () => {
                const { create: getElement, getElement: create } =
                    stripeUPEJsMock.elements(elementsOptions);

                stripeUPEJsMock.elements = jest.fn().mockReturnValue({ create, getElement });

                jest.spyOn(stripeScriptLoader, 'getStripeClient').mockReturnValue(
                    Promise.resolve(stripeUPEJsMock),
                );

                await strategy.initialize(options);

                expect(getElement).toHaveBeenCalledWith('payment');
                expect(create).not.toHaveBeenCalled();
            });

            it('fails mounting a stripe payment element', async () => {
                stripeUPEJsMock = getFailingStripeUPEJsMock();

                const { create, getElement } = stripeUPEJsMock.elements(elementsOptions);

                stripeUPEJsMock.elements = jest.fn().mockReturnValue({ create, getElement });

                const { mount, unmount } = create(StripeElementType.PAYMENT);

                stripeUPEJsMock.elements(elementsOptions).create = jest
                    .fn()
                    .mockReturnValue({ mount, unmount });

                jest.spyOn(stripeScriptLoader, 'getStripeClient').mockReturnValue(
                    Promise.resolve(stripeUPEJsMock),
                );

                await expect(strategy.initialize(options)).resolves.toBe(store.getState());
                expect(mount).not.toHaveBeenCalled();
            });
        });
    });

    describe('#execute()', () => {
        let options: PaymentInitializeOptions;
        const elementsOptions: StripeElementsOptions = { clientSecret: 'myToken', locale: 'en' };
        let stripeUPEJsMock: StripeUPEClient;

        beforeEach(() => {
            options = getStripeUPEInitializeOptionsMock();
            stripeUPEJsMock = getStripeUPEJsMock();

            const { create, getElement, update } = stripeUPEJsMock.elements(elementsOptions);

            stripeUPEJsMock.elements = jest.fn().mockReturnValue({ create, getElement, update });
            jest.spyOn(stripeScriptLoader, 'getStripeClient').mockReturnValue(
                Promise.resolve(stripeUPEJsMock),
            );
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow').mockReturnValue(
                getStripeUPE(),
            );
            jest.spyOn(store.getState().billingAddress, 'getBillingAddressOrThrow').mockReturnValue(
                getBillingAddress(),
            );
        });

        describe('creates the order and submit payment', () => {
            it('throws error when clientToken is undefined', async () => {
                paymentMethodMock.clientToken = undefined;

                await expect(strategy.initialize(options)).resolves.toBe(store.getState());

                expect(stripeScriptLoader.getStripeClient).not.toHaveBeenCalled();
                expect(stripeUPEJsMock.elements).not.toHaveBeenCalled();
            });

            describe('with normal initialization', () => {
                beforeEach(async () => {
                    await strategy.initialize(options);
                });

                it('with a stored instrument passing on the "make default" flag', async () => {
                    stripeUPEJsMock.confirmPayment = jest.fn(() =>
                        Promise.resolve(getConfirmPaymentResponse()),
                    );

                    await strategy.execute(
                        getStripeUPEOrderRequestBodyVaultMock(
                            StripePaymentMethodType.CreditCard,
                            true,
                        ),
                    );

                    expect(paymentActionCreator.submitPayment).toHaveBeenCalledWith({
                        methodId: 'card',
                        paymentData: {
                            formattedPayload: {
                                bigpay_token: {
                                    token: 'token',
                                },
                                confirm: false,
                                client_token: 'myToken',
                                set_as_default_stored_instrument: true,
                            },
                        },
                    });
                });

                describe('with card', () => {
                    beforeEach(() => {
                        stripeUPEJsMock.confirmPayment = jest.fn(() =>
                            Promise.resolve(getConfirmPaymentResponse()),
                        );
                    });

                    describe('with both shipping and billing address', () => {
                        beforeEach(() => {
                            jest.spyOn(
                                store.getState().shippingAddress,
                                'getShippingAddress',
                            ).mockReturnValue(getShippingAddress());
                            jest.spyOn(
                                store.getState().billingAddress,
                                'getBillingAddress',
                            ).mockReturnValue(getBillingAddress());
                        });

                        it('with a signed user', async () => {
                            const response = await strategy.execute(
                                getStripeUPEOrderRequestBodyMock(),
                            );

                            expect(orderActionCreator.submitOrder).toHaveBeenCalled();
                            expect(paymentMethodActionCreator.loadPaymentMethod).toHaveBeenCalled();
                            expect(paymentActionCreator.submitPayment).toHaveBeenCalled();
                            expect(response).toBe(store.getState());
                        });

                        it('with a signed user and using stripeLink', async () => {
                            jest.spyOn(
                                store.getState().customer,
                                'getCustomerOrThrow',
                            ).mockReturnValue({
                                ...getCustomer(),
                                isStripeLinkAuthenticated: true,
                            });
                            jest.spyOn(
                                store.getState().billingAddress,
                                'getBillingAddressOrThrow',
                            ).mockReturnValue(getBillingAddress());

                            const response = await strategy.execute(
                                getStripeUPEWithLinkOrderRequestBodyMock(),
                            );

                            expect(orderActionCreator.submitOrder).toHaveBeenCalled();
                            expect(paymentMethodActionCreator.loadPaymentMethod).toHaveBeenCalled();
                            expect(paymentActionCreator.submitPayment).toHaveBeenCalled();
                            expect(response).toBe(store.getState());
                            expect(
                                billingAddressActionCreator.updateAddress,
                            ).not.toHaveBeenCalled();
                        });

                        it('with a guest user', async () => {
                            jest.spyOn(store.getState().customer, 'getCustomer').mockReturnValue(
                                undefined,
                            );

                            const response = await strategy.execute(
                                getStripeUPEOrderRequestBodyMock(),
                            );

                            expect(orderActionCreator.submitOrder).toHaveBeenCalled();
                            expect(paymentMethodActionCreator.loadPaymentMethod).toHaveBeenCalled();
                            expect(paymentActionCreator.submitPayment).toHaveBeenCalled();
                            expect(response).toBe(store.getState());
                        });

                        it('with a guest user and using stripeLink', async () => {
                            jest.spyOn(store.getState().customer, 'getCustomer').mockReturnValue(
                                undefined,
                            );
                            jest.spyOn(
                                store.getState().customer,
                                'getCustomerOrThrow',
                            ).mockReturnValue({
                                ...getCustomer(),
                                isStripeLinkAuthenticated: false,
                                email: '',
                            });
                            jest.spyOn(
                                store.getState().billingAddress,
                                'getBillingAddressOrThrow',
                            ).mockReturnValue(getBillingAddress());

                            const response = await strategy.execute(
                                getStripeUPEWithLinkOrderRequestBodyMock(),
                            );

                            expect(orderActionCreator.submitOrder).toHaveBeenCalled();
                            expect(paymentMethodActionCreator.loadPaymentMethod).toHaveBeenCalled();
                            expect(paymentActionCreator.submitPayment).toHaveBeenCalled();
                            expect(response).toBe(store.getState());
                            expect(billingAddressActionCreator.updateAddress).toHaveBeenCalled();
                        });
                    });

                    describe('without shipping and billing address', () => {
                        beforeEach(() => {
                            const errorResponse = new RequestError(
                                getResponse({
                                    ...getErrorPaymentResponseBody(),
                                    errors: [{ code: 'additional_action_required' }],
                                    additional_action_required: {
                                        type: 'additional_action_requires_payment_method',
                                        data: {
                                            redirect_url: 'https://redirect-url.com',
                                            token: 'token',
                                        },
                                    },
                                    status: 'error',
                                }),
                            );

                            jest.spyOn(paymentActionCreator, 'submitPayment').mockReturnValue(
                                of(
                                    createErrorAction(
                                        PaymentActionType.SubmitPaymentFailed,
                                        errorResponse,
                                    ),
                                ),
                            );
                            jest.spyOn(
                                store.getState().shippingAddress,
                                'getShippingAddress',
                            ).mockReturnValue({});
                            jest.spyOn(
                                store.getState().billingAddress,
                                'getBillingAddress',
                            ).mockReturnValue({});
                            stripeUPEJsMock.retrievePaymentIntent = jest.fn(() =>
                                Promise.resolve(getRetrievePaymentIntentResponse()),
                            );
                        });

                        it('with a signed user', async () => {
                            await expect(
                                strategy.execute(getStripeUPEOrderRequestBodyMock()),
                            ).rejects.toBeInstanceOf(MissingDataError);

                            expect(orderActionCreator.submitOrder).toHaveBeenCalledTimes(1);
                            expect(paymentActionCreator.submitPayment).toHaveBeenCalledTimes(1);
                            expect(stripeUPEJsMock.confirmPayment).not.toHaveBeenCalled();
                        });

                        it('with a guest user', async () => {
                            jest.spyOn(store.getState().customer, 'getCustomer').mockReturnValue(
                                undefined,
                            );

                            await expect(
                                strategy.execute(getStripeUPEOrderRequestBodyMock()),
                            ).rejects.toBeInstanceOf(MissingDataError);

                            expect(orderActionCreator.submitOrder).toHaveBeenCalledTimes(1);
                            expect(paymentActionCreator.submitPayment).toHaveBeenCalledTimes(1);
                            expect(stripeUPEJsMock.confirmPayment).not.toHaveBeenCalled();
                        });
                    });

                    it('with store credit', async () => {
                        checkoutMock.isStoreCreditApplied = true;

                        const promise = await strategy.execute(getStripeUPEOrderRequestBodyMock());

                        expect(orderActionCreator.submitOrder).toHaveBeenCalled();
                        expect(paymentMethodActionCreator.loadPaymentMethod).toHaveBeenCalled();
                        expect(storeCreditActionCreator.applyStoreCredit).toHaveBeenCalledWith(
                            true,
                        );
                        expect(paymentActionCreator.submitPayment).toHaveBeenCalled();
                        expect(promise).toBe(store.getState());
                    });

                    it('passing on the "save card" flag', async () => {
                        const response = await strategy.execute(
                            getStripeUPEOrderRequestBodyMock(
                                StripePaymentMethodType.CreditCard,
                                true,
                            ),
                        );

                        expect(orderActionCreator.submitOrder).toHaveBeenCalled();
                        expect(paymentMethodActionCreator.loadPaymentMethod).toHaveBeenCalled();
                        expect(paymentActionCreator.submitPayment).toHaveBeenCalled();
                        expect(response).toBe(store.getState());
                    });

                    it('submit payment with credit card and passes back the client token', async () => {
                        const response = await strategy.execute(getStripeUPEOrderRequestBodyMock());

                        expect(orderActionCreator.submitOrder).toHaveBeenCalled();
                        expect(paymentActionCreator.submitPayment).toHaveBeenCalledWith(
                            expect.objectContaining({
                                methodId: 'card',
                                paymentData: expect.objectContaining({
                                    formattedPayload: expect.objectContaining({
                                        confirm: false,
                                        credit_card_token: {
                                            token: 'myToken',
                                        },
                                        vault_payment_instrument: false,
                                    }),
                                }),
                            }),
                        );
                        expect(response).toBe(store.getState());
                    });

                    it('with a signed user without phone number', async () => {
                        const customer = getCustomer();

                        customer.addresses[0].phone = '';

                        jest.spyOn(store.getState().customer, 'getCustomer').mockReturnValue(
                            customer,
                        );
                        jest.spyOn(
                            store.getState().billingAddress,
                            'getBillingAddress',
                        ).mockReturnValue({
                            ...getBillingAddress(),
                            phone: '',
                        });

                        const response = await strategy.execute(getStripeUPEOrderRequestBodyMock());

                        expect(orderActionCreator.submitOrder).toHaveBeenCalled();
                        expect(paymentMethodActionCreator.loadPaymentMethod).toHaveBeenCalled();
                        expect(paymentActionCreator.submitPayment).toHaveBeenCalled();
                        expect(response).toBe(store.getState());
                    });

                    it('with a guest user without phone number', async () => {
                        jest.spyOn(store.getState().customer, 'getCustomer').mockReturnValue(
                            undefined,
                        );
                        jest.spyOn(
                            store.getState().billingAddress,
                            'getBillingAddress',
                        ).mockReturnValue({
                            ...getBillingAddress(),
                            phone: '',
                        });

                        const response = await strategy.execute(getStripeUPEOrderRequestBodyMock());

                        expect(orderActionCreator.submitOrder).toHaveBeenCalled();
                        expect(paymentMethodActionCreator.loadPaymentMethod).toHaveBeenCalled();
                        expect(paymentActionCreator.submitPayment).toHaveBeenCalled();
                        expect(response).toBe(store.getState());
                    });

                    it('with a guest user without postal code', async () => {
                        jest.spyOn(store.getState().customer, 'getCustomer').mockReturnValue(
                            undefined,
                        );
                        jest.spyOn(
                            store.getState().shippingAddress,
                            'getShippingAddress',
                        ).mockReturnValue({
                            ...getShippingAddress(),
                            postalCode: '',
                        });

                        const response = await strategy.execute(getStripeUPEOrderRequestBodyMock());

                        expect(orderActionCreator.submitOrder).toHaveBeenCalled();
                        expect(paymentMethodActionCreator.loadPaymentMethod).toHaveBeenCalled();
                        expect(paymentActionCreator.submitPayment).toHaveBeenCalled();
                        expect(response).toBe(store.getState());
                    });

                    it('with a guest user with postal code', async () => {
                        jest.spyOn(store.getState().customer, 'getCustomer').mockReturnValue(
                            undefined,
                        );
                        jest.spyOn(
                            store.getState().shippingAddress,
                            'getShippingAddress',
                        ).mockReturnValue({
                            ...getShippingAddress(),
                            postalCode: '12345',
                        });

                        const response = await strategy.execute(getStripeUPEOrderRequestBodyMock());

                        expect(orderActionCreator.submitOrder).toHaveBeenCalled();
                        expect(paymentMethodActionCreator.loadPaymentMethod).toHaveBeenCalled();
                        expect(paymentActionCreator.submitPayment).toHaveBeenCalled();
                        expect(response).toBe(store.getState());
                    });

                    it('with a guest user with address line1', async () => {
                        jest.spyOn(store.getState().customer, 'getCustomer').mockReturnValue(
                            undefined,
                        );
                        jest.spyOn(
                            store.getState().shippingAddress,
                            'getShippingAddress',
                        ).mockReturnValue({
                            ...getShippingAddress(),
                            line1: '12345',
                        });

                        const response = await strategy.execute(getStripeUPEOrderRequestBodyMock());

                        expect(orderActionCreator.submitOrder).toHaveBeenCalled();
                        expect(paymentMethodActionCreator.loadPaymentMethod).toHaveBeenCalled();
                        expect(paymentActionCreator.submitPayment).toHaveBeenCalled();
                        expect(response).toBe(store.getState());
                    });

                    it('with a guest user with address line2', async () => {
                        jest.spyOn(store.getState().customer, 'getCustomer').mockReturnValue(
                            undefined,
                        );
                        jest.spyOn(
                            store.getState().shippingAddress,
                            'getShippingAddress',
                        ).mockReturnValue({
                            ...getShippingAddress(),
                            line2: '123456',
                        });

                        const response = await strategy.execute(getStripeUPEOrderRequestBodyMock());

                        expect(orderActionCreator.submitOrder).toHaveBeenCalled();
                        expect(paymentMethodActionCreator.loadPaymentMethod).toHaveBeenCalled();
                        expect(paymentActionCreator.submitPayment).toHaveBeenCalled();
                        expect(response).toBe(store.getState());
                    });

                    it('without shipping address if there is not physical items in cart', async () => {
                        jest.spyOn(store.getState().cart, 'getCart').mockReturnValue({
                            ...store.getState().cart.getCart(),
                            lineItems: { physicalItems: [] },
                        });

                        const response = await strategy.execute(getStripeUPEOrderRequestBodyMock());

                        expect(orderActionCreator.submitOrder).toHaveBeenCalled();
                        expect(paymentMethodActionCreator.loadPaymentMethod).toHaveBeenCalled();
                        expect(paymentActionCreator.submitPayment).toHaveBeenCalled();
                        expect(response).toBe(store.getState());
                    });

                    it('with a guest user and without shipping and billing address', async () => {
                        const errorResponse = new RequestError(
                            getResponse({
                                ...getErrorPaymentResponseBody(),
                                errors: [{ code: 'additional_action_required' }],
                                additional_action_required: {
                                    type: 'additional_action_requires_payment_method',
                                    data: {
                                        redirect_url: 'https://redirect-url.com',
                                        token: 'token',
                                    },
                                },
                                status: 'error',
                            }),
                        );

                        stripeUPEJsMock.retrievePaymentIntent = jest.fn(() =>
                            Promise.resolve(getRetrievePaymentIntentResponse()),
                        );

                        jest.spyOn(store.getState().customer, 'getCustomer').mockReturnValue(
                            undefined,
                        );
                        jest.spyOn(
                            store.getState().shippingAddress,
                            'getShippingAddress',
                        ).mockReturnValue(undefined);
                        jest.spyOn(
                            store.getState().billingAddress,
                            'getBillingAddress',
                        ).mockReturnValue(undefined);
                        jest.spyOn(paymentActionCreator, 'submitPayment').mockReturnValue(
                            of(
                                createErrorAction(
                                    PaymentActionType.SubmitPaymentFailed,
                                    errorResponse,
                                ),
                            ),
                        );

                        await expect(
                            strategy.execute(getStripeUPEOrderRequestBodyMock()),
                        ).rejects.toBeInstanceOf(MissingDataError);

                        expect(paymentMethodActionCreator.loadPaymentMethod).toHaveBeenCalled();
                        expect(orderActionCreator.submitOrder).toHaveBeenCalledTimes(1);
                        expect(paymentActionCreator.submitPayment).toHaveBeenCalledTimes(1);
                        expect(stripeUPEJsMock.confirmPayment).not.toHaveBeenCalled();
                    });

                    it('fires unknown additional action', async () => {
                        const errorResponse = new RequestError(
                            getResponse({
                                ...getErrorPaymentResponseBody(),
                                errors: [{ code: 'additional_action_required' }],
                                additional_action_required: {
                                    type: 'unknown_action',
                                },
                                status: 'error',
                            }),
                        );

                        jest.spyOn(paymentActionCreator, 'submitPayment').mockReturnValue(
                            of(
                                createErrorAction(
                                    PaymentActionType.SubmitPaymentFailed,
                                    errorResponse,
                                ),
                            ),
                        );

                        try {
                            await strategy.execute(getStripeUPEOrderRequestBodyMock());
                        } catch (error) {
                            expect(orderActionCreator.submitOrder).toHaveBeenCalled();
                            expect(paymentActionCreator.submitPayment).toHaveBeenCalledTimes(1);
                        }
                    });

                    it('fires additional action requires payment method', async () => {
                        const errorResponse = new RequestError(
                            getResponse({
                                ...getErrorPaymentResponseBody(),
                                errors: [{ code: 'additional_action_required' }],
                                additional_action_required: {
                                    type: 'additional_action_requires_payment_method',
                                    data: {
                                        redirect_url: 'https://redirect-url.com',
                                        token: 'token',
                                    },
                                },
                                status: 'error',
                            }),
                        );

                        jest.spyOn(paymentActionCreator, 'submitPayment').mockReturnValue(
                            of(
                                createErrorAction(
                                    PaymentActionType.SubmitPaymentFailed,
                                    errorResponse,
                                ),
                            ),
                        );

                        stripeUPEJsMock.retrievePaymentIntent = jest.fn(() =>
                            Promise.resolve(getRetrievePaymentIntentResponse()),
                        );

                        try {
                            await strategy.execute(getStripeUPEOrderRequestBodyMock());
                        } catch (error) {
                            expect(orderActionCreator.submitOrder).toHaveBeenCalled();
                            expect(paymentActionCreator.submitPayment).toHaveBeenCalledTimes(2);
                            expect(stripeUPEJsMock.confirmPayment).toHaveBeenCalledTimes(1);
                        }
                    });

                    it('throws stripe error if empty payment intent is sent', async () => {
                        const requiredFieldErrorResponse = new RequestError(
                            getResponse({
                                ...getErrorPaymentResponseBody(),
                                errors: [{ code: 'additional_action_required' }],
                                additional_action_required: {
                                    type: 'additional_action_requires_payment_method',
                                    data: {
                                        redirect_url: 'https://redirect-url.com',
                                        token: 'token',
                                    },
                                },
                                status: 'error',
                            }),
                        );
                        const stripeErrorMessage = 'Stripe error message.';

                        jest.spyOn(paymentActionCreator, 'submitPayment').mockReturnValueOnce(
                            of(
                                createErrorAction(
                                    PaymentActionType.SubmitPaymentFailed,
                                    requiredFieldErrorResponse,
                                ),
                            ),
                        );

                        stripeUPEJsMock.retrievePaymentIntent = jest.fn(() =>
                            Promise.resolve(getRetrievePaymentIntentResponse()),
                        );

                        stripeUPEJsMock.confirmPayment = jest.fn(() =>
                            Promise.resolve({
                                error: {
                                    type: 'invalid_request_error',
                                    message: stripeErrorMessage,
                                },
                            }),
                        );

                        await expect(
                            strategy.execute(getStripeUPEOrderRequestBodyMock()),
                        ).rejects.toThrow(stripeErrorMessage);

                        expect(orderActionCreator.submitOrder).toHaveBeenCalledTimes(1);
                        expect(paymentActionCreator.submitPayment).toHaveBeenCalledTimes(1);
                        expect(stripeUPEJsMock.confirmPayment).toHaveBeenCalledTimes(1);
                    });

                    it('throws unknown error', async () => {
                        const unexpectedError = {
                            message: 'An unexpected error has occurred.',
                        };
                        const errorResponse = new RequestError(
                            getResponse({
                                ...getErrorPaymentResponseBody(),
                                errors: [{ code: 'unknown_error' }],
                                status: 'error',
                            }),
                        );

                        jest.spyOn(paymentActionCreator, 'submitPayment').mockReturnValue(
                            of(
                                createErrorAction(
                                    PaymentActionType.SubmitPaymentFailed,
                                    errorResponse,
                                ),
                            ),
                        );

                        try {
                            await strategy.execute(getStripeUPEOrderRequestBodyMock());
                        } catch (error) {
                            expect(orderActionCreator.submitOrder).toHaveBeenCalled();
                            expect(paymentActionCreator.submitPayment).toHaveBeenCalledTimes(1);
                            expect(error.message).toEqual(
                                unexpectedError && unexpectedError.message,
                            );
                        }
                    });

                    it('throws an error that is not a RequestError', async () => {
                        const errorResponse = new Error();

                        jest.spyOn(paymentActionCreator, 'submitPayment').mockReturnValue(
                            of(
                                createErrorAction(
                                    PaymentActionType.SubmitPaymentFailed,
                                    errorResponse,
                                ),
                            ),
                        );

                        await expect(
                            strategy.execute(getStripeUPEOrderRequestBodyMock()),
                        ).rejects.toThrow(Error);

                        expect(orderActionCreator.submitOrder).toHaveBeenCalled();
                        expect(paymentActionCreator.submitPayment).toHaveBeenCalledTimes(1);
                    });

                    it('throws stripe error when confirm fails but 3DS is accepted', async () => {
                        stripeUPEJsMock.confirmCardPayment = jest.fn(() =>
                            Promise.reject(new Error('Error with 3ds')),
                        );

                        stripeUPEJsMock.retrievePaymentIntent = jest.fn(() =>
                            Promise.resolve(getRetrievePaymentIntentResponse()),
                        );

                        await strategy.execute(getStripeUPEOrderRequestBodyMock());

                        expect(orderActionCreator.submitOrder).toHaveBeenCalled();
                        expect(paymentActionCreator.submitPayment).toHaveBeenCalled();
                    });

                    it('call confirmCardPayment to shopper auth with stored card and complete the payment', async () => {
                        const threeDSecureRequiredErrorResponse = new RequestError(
                            getResponse({
                                ...getErrorPaymentResponseBody(),
                                errors: [{ code: 'three_d_secure_required' }],
                                three_ds_result: {
                                    token: 'token',
                                },
                            }),
                        );

                        jest.spyOn(paymentActionCreator, 'submitPayment').mockReturnValueOnce(
                            of(
                                createErrorAction(
                                    PaymentActionType.SubmitPaymentFailed,
                                    threeDSecureRequiredErrorResponse,
                                ),
                            ),
                        );

                        stripeUPEJsMock.confirmCardPayment = jest.fn(() =>
                            Promise.resolve(getConfirmPaymentResponse()),
                        );

                        await expect(
                            strategy.execute(getStripeUPEOrderRequestBodyVaultMock()),
                        ).resolves.toBe(store.getState());

                        expect(orderActionCreator.submitOrder).toHaveBeenCalled();
                        expect(stripeUPEJsMock.confirmCardPayment).toHaveBeenCalled();
                        expect(paymentActionCreator.submitPayment).toHaveBeenCalledTimes(2);
                    });

                    it('call confirmCardPayment to shopper auth with stored card fails with stripeError containing canceled payment intent message and throws request error', async () => {
                        const threeDSecureRequiredErrorResponse = new RequestError(
                            getResponse({
                                ...getErrorPaymentResponseBody(),
                                errors: [{ code: 'three_d_secure_required' }],
                                three_ds_result: {
                                    token: 'token',
                                },
                            }),
                        );

                        jest.spyOn(paymentActionCreator, 'submitPayment').mockReturnValueOnce(
                            of(
                                createErrorAction(
                                    PaymentActionType.SubmitPaymentFailed,
                                    threeDSecureRequiredErrorResponse,
                                ),
                            ),
                        );

                        stripeUPEJsMock.confirmCardPayment = jest.fn(() =>
                            Promise.resolve({
                                error: {
                                    payment_intent: {
                                        last_payment_error: {
                                            message: 'canceled',
                                        },
                                    },
                                },
                            }),
                        );

                        await expect(
                            strategy.execute(getStripeUPEOrderRequestBodyVaultMock()),
                        ).rejects.toBeInstanceOf(PaymentMethodCancelledError);

                        expect(orderActionCreator.submitOrder).toHaveBeenCalled();
                        expect(stripeUPEJsMock.confirmCardPayment).toHaveBeenCalled();
                        expect(paymentActionCreator.submitPayment).toHaveBeenCalledTimes(1);
                    });

                    it('call confirmCardPayment to shopper auth with stored card fails with stripeError containing unknown error and throws request error', async () => {
                        const threeDSecureRequiredErrorResponse = new RequestError(
                            getResponse({
                                ...getErrorPaymentResponseBody(),
                                errors: [{ code: 'three_d_secure_required' }],
                                three_ds_result: {
                                    token: 'token',
                                },
                            }),
                        );

                        jest.spyOn(paymentActionCreator, 'submitPayment').mockReturnValueOnce(
                            of(
                                createErrorAction(
                                    PaymentActionType.SubmitPaymentFailed,
                                    threeDSecureRequiredErrorResponse,
                                ),
                            ),
                        );

                        stripeUPEJsMock.confirmCardPayment = jest.fn(() =>
                            Promise.resolve({
                                error: {
                                    payment_intent: {
                                        last_payment_error: {
                                            message: 'error',
                                        },
                                    },
                                    type: 'unknown_error',
                                },
                            }),
                        );

                        await expect(
                            strategy.execute(getStripeUPEOrderRequestBodyVaultMock()),
                        ).rejects.toBeInstanceOf(PaymentMethodFailedError);

                        expect(orderActionCreator.submitOrder).toHaveBeenCalled();
                        expect(stripeUPEJsMock.confirmCardPayment).toHaveBeenCalled();
                        expect(paymentActionCreator.submitPayment).toHaveBeenCalledTimes(1);
                    });

                    it('call confirmCardPayment to shopper auth with stored card fails with no body and throws request error', async () => {
                        const threeDSecureRequiredErrorResponse = new RequestError(
                            getResponse({
                                ...getErrorPaymentResponseBody(),
                                errors: [{ code: 'three_d_secure_required' }],
                                three_ds_result: {
                                    token: 'token',
                                },
                            }),
                        );

                        jest.spyOn(paymentActionCreator, 'submitPayment').mockReturnValueOnce(
                            of(
                                createErrorAction(
                                    PaymentActionType.SubmitPaymentFailed,
                                    threeDSecureRequiredErrorResponse,
                                ),
                            ),
                        );

                        stripeUPEJsMock.confirmCardPayment = jest.fn(() => Promise.resolve({}));

                        await expect(
                            strategy.execute(getStripeUPEOrderRequestBodyVaultMock()),
                        ).rejects.toBeInstanceOf(RequestError);

                        expect(orderActionCreator.submitOrder).toHaveBeenCalled();
                        expect(stripeUPEJsMock.confirmCardPayment).toHaveBeenCalled();
                        expect(paymentActionCreator.submitPayment).toHaveBeenCalledTimes(1);
                    });

                    it('throws stripe error when auth fails with stored card', async () => {
                        const threeDSecureRequiredErrorResponse = new RequestError(
                            getResponse({
                                ...getErrorPaymentResponseBody(),
                                errors: [{ code: 'three_d_secure_required' }],
                                three_ds_result: {
                                    token: 'token',
                                },
                            }),
                        );
                        const stripeErrorMessage = 'Stripe error message.';

                        jest.spyOn(paymentActionCreator, 'submitPayment').mockReturnValueOnce(
                            of(
                                createErrorAction(
                                    PaymentActionType.SubmitPaymentFailed,
                                    threeDSecureRequiredErrorResponse,
                                ),
                            ),
                        );

                        stripeUPEJsMock.confirmCardPayment = jest.fn(() =>
                            Promise.resolve({
                                error: {
                                    type: 'card_error',
                                    payment_intent: {
                                        last_payment_error: { message: stripeErrorMessage },
                                    },
                                    message: stripeErrorMessage,
                                },
                            }),
                        );

                        await expect(
                            strategy.execute(getStripeUPEOrderRequestBodyVaultMock()),
                        ).rejects.toThrow(stripeErrorMessage);

                        expect(orderActionCreator.submitOrder).toHaveBeenCalled();
                        expect(stripeUPEJsMock.confirmCardPayment).toHaveBeenCalled();
                        expect(paymentActionCreator.submitPayment).toHaveBeenCalledTimes(1);
                    });

                    it('throws unknown error when using stored instrument', async () => {
                        const errorResponse = new RequestError(
                            getResponse(getErrorPaymentResponseBody()),
                        );

                        jest.spyOn(paymentActionCreator, 'submitPayment').mockReturnValue(
                            of(
                                createErrorAction(
                                    PaymentActionType.SubmitPaymentFailed,
                                    errorResponse,
                                ),
                            ),
                        );

                        const promise = strategy.execute(getStripeUPEOrderRequestBodyVaultMock());

                        await expect(promise).rejects.toThrow(errorResponse);

                        expect(orderActionCreator.submitOrder).toHaveBeenCalled();
                        expect(paymentActionCreator.submitPayment).toHaveBeenCalledTimes(1);
                        expect(stripeUPEJsMock.confirmCardPayment).not.toHaveBeenCalled();
                    });

                    it('throws stripe error when confirmCardPayment fails using stored card but 3DS is accepted', async () => {
                        const threeDSecureRequiredErrorResponse = new RequestError(
                            getResponse({
                                ...getErrorPaymentResponseBody(),
                                errors: [{ code: 'three_d_secure_required' }],
                                three_ds_result: {
                                    token: 'token',
                                },
                            }),
                        );

                        jest.spyOn(paymentActionCreator, 'submitPayment')
                            .mockReturnValueOnce(
                                of(
                                    createErrorAction(
                                        PaymentActionType.SubmitPaymentFailed,
                                        threeDSecureRequiredErrorResponse,
                                    ),
                                ),
                            )
                            .mockReturnValueOnce(submitPaymentAction);

                        stripeUPEJsMock.confirmCardPayment = jest.fn(() =>
                            Promise.reject(new Error('Error with 3ds')),
                        );

                        stripeUPEJsMock.retrievePaymentIntent = jest.fn(() =>
                            Promise.resolve(getRetrievePaymentIntentResponse()),
                        );

                        await strategy.execute(getStripeUPEOrderRequestBodyVaultMock());

                        expect(orderActionCreator.submitOrder).toHaveBeenCalled();
                        expect(paymentActionCreator.submitPayment).toHaveBeenNthCalledWith(
                            1,
                            expect.objectContaining({
                                paymentData: expect.objectContaining({
                                    formattedPayload: expect.objectContaining({
                                        bigpay_token: { token: 'token' },
                                    }),
                                }),
                            }),
                        );
                        expect(paymentActionCreator.submitPayment).toHaveBeenNthCalledWith(
                            2,
                            expect.objectContaining({
                                paymentData: expect.objectContaining({
                                    formattedPayload: expect.objectContaining({
                                        credit_card_token: { token: 'pi_1234' },
                                    }),
                                }),
                            }),
                        );
                        expect(stripeUPEJsMock.confirmCardPayment).toHaveBeenCalled();
                        expect(stripeUPEJsMock.retrievePaymentIntent).toHaveBeenCalled();
                    });

                    it('not calling confirmPayment method when Payment Intent status is already „succeeded", case with additional_action_requires_payment_method and PI-626 Experiment on', async () => {
                        const storeConfig = {
                            checkoutSettings: {
                                features: {
                                    'PI-626.Block_unnecessary_payment_confirmation_for_StripeUPE':
                                        true,
                                },
                            },
                        };

                        jest.spyOn(
                            store.getState().config,
                            'getStoreConfigOrThrow',
                        ).mockReturnValue(storeConfig);

                        const errorResponse = new RequestError(
                            getResponse({
                                ...getErrorPaymentResponseBody(),
                                errors: [{ code: 'additional_action_required' }],
                                additional_action_required: {
                                    type: 'additional_action_requires_payment_method',
                                    data: {
                                        redirect_url: 'https://redirect-url.com',
                                        token: 'token',
                                    },
                                },
                                status: 'error',
                            }),
                        );

                        jest.spyOn(paymentActionCreator, 'submitPayment').mockReturnValue(
                            of(
                                createErrorAction(
                                    PaymentActionType.SubmitPaymentFailed,
                                    errorResponse,
                                ),
                            ),
                        );

                        stripeUPEJsMock.retrievePaymentIntent = jest.fn(() =>
                            Promise.resolve(getRetrievePaymentIntentResponseSucceeded()),
                        );

                        try {
                            await strategy.execute(getStripeUPEOrderRequestBodyMock());
                        } catch {
                            expect(orderActionCreator.submitOrder).toHaveBeenCalled();
                            expect(paymentActionCreator.submitPayment).toHaveBeenCalledTimes(2);
                            expect(stripeUPEJsMock.confirmPayment).not.toHaveBeenCalled();
                        }
                    });

                    it('not calling confirmPayment method when Payment Intent status is already „succeeded", case with redirect_to_url and PI-626 Experiment on', async () => {
                        const storeConfig = {
                            checkoutSettings: {
                                features: {
                                    'PI-626.Block_unnecessary_payment_confirmation_for_StripeUPE':
                                        true,
                                },
                            },
                        };

                        jest.spyOn(
                            store.getState().config,
                            'getStoreConfigOrThrow',
                        ).mockReturnValue(storeConfig);

                        const errorResponse = new RequestError(
                            getResponse({
                                ...getErrorPaymentResponseBody(),
                                errors: [{ code: 'additional_action_required' }],
                                additional_action_required: {
                                    type: 'redirect_to_url',
                                    data: {
                                        redirect_url: 'https://redirect-url.com',
                                    },
                                },
                                status: 'error',
                            }),
                        );

                        jest.spyOn(paymentActionCreator, 'submitPayment').mockReturnValue(
                            of(
                                createErrorAction(
                                    PaymentActionType.SubmitPaymentFailed,
                                    errorResponse,
                                ),
                            ),
                        );

                        stripeUPEJsMock.retrievePaymentIntent = jest.fn(() =>
                            Promise.resolve(getRetrievePaymentIntentResponseSucceeded()),
                        );

                        try {
                            await strategy.execute(getStripeUPEOrderRequestBodyMock());
                        } catch {
                            expect(orderActionCreator.submitOrder).toHaveBeenCalled();
                            expect(paymentActionCreator.submitPayment).toHaveBeenCalledTimes(1);
                            expect(stripeUPEJsMock.confirmPayment).not.toHaveBeenCalled();
                        }
                    });

                    it('not calling confirmPayment method when Payment Intent status is already „succeeded", case with additional_action_requires_payment_method and PI-626 Experiment off', async () => {
                        const storeConfig = {
                            checkoutSettings: {
                                features: {
                                    'PI-626.Block_unnecessary_payment_confirmation_for_StripeUPE':
                                        false,
                                },
                            },
                        };

                        jest.spyOn(
                            store.getState().config,
                            'getStoreConfigOrThrow',
                        ).mockReturnValue(storeConfig);

                        const errorResponse = new RequestError(
                            getResponse({
                                ...getErrorPaymentResponseBody(),
                                errors: [{ code: 'additional_action_required' }],
                                additional_action_required: {
                                    type: 'additional_action_requires_payment_method',
                                    data: {
                                        redirect_url: 'https://redirect-url.com',
                                        token: 'token',
                                    },
                                },
                                status: 'error',
                            }),
                        );

                        jest.spyOn(paymentActionCreator, 'submitPayment').mockReturnValue(
                            of(
                                createErrorAction(
                                    PaymentActionType.SubmitPaymentFailed,
                                    errorResponse,
                                ),
                            ),
                        );

                        stripeUPEJsMock.retrievePaymentIntent = jest.fn(() =>
                            Promise.resolve(getRetrievePaymentIntentResponseSucceeded()),
                        );

                        try {
                            await strategy.execute(getStripeUPEOrderRequestBodyMock());
                        } catch {
                            expect(orderActionCreator.submitOrder).toHaveBeenCalled();
                            expect(paymentActionCreator.submitPayment).toHaveBeenCalledTimes(2);
                            expect(stripeUPEJsMock.confirmPayment).toHaveBeenCalled();
                        }
                    });

                    it('not calling confirmPayment method when Payment Intent status is already „succeeded", case with redirect_to_url and PI-626 Experiment off', async () => {
                        const storeConfig = {
                            checkoutSettings: {
                                features: {
                                    'PI-626.Block_unnecessary_payment_confirmation_for_StripeUPE':
                                        false,
                                },
                            },
                        };

                        jest.spyOn(
                            store.getState().config,
                            'getStoreConfigOrThrow',
                        ).mockReturnValue(storeConfig);

                        const errorResponse = new RequestError(
                            getResponse({
                                ...getErrorPaymentResponseBody(),
                                errors: [{ code: 'additional_action_required' }],
                                additional_action_required: {
                                    type: 'redirect_to_url',
                                    data: {
                                        redirect_url: 'https://redirect-url.com',
                                    },
                                },
                                status: 'error',
                            }),
                        );

                        jest.spyOn(paymentActionCreator, 'submitPayment').mockReturnValue(
                            of(
                                createErrorAction(
                                    PaymentActionType.SubmitPaymentFailed,
                                    errorResponse,
                                ),
                            ),
                        );

                        stripeUPEJsMock.retrievePaymentIntent = jest.fn(() =>
                            Promise.resolve(getRetrievePaymentIntentResponseSucceeded()),
                        );

                        try {
                            await strategy.execute(getStripeUPEOrderRequestBodyMock());
                        } catch {
                            expect(orderActionCreator.submitOrder).toHaveBeenCalled();
                            expect(paymentActionCreator.submitPayment).toHaveBeenCalledTimes(1);
                            expect(stripeUPEJsMock.confirmPayment).toHaveBeenCalled();
                        }
                    });
                });

                describe('with SOFORT', () => {
                    const method = StripePaymentMethodType.SOFORT;

                    beforeEach(() => {
                        options = getStripeUPEInitializeOptionsMock(method);
                        paymentMethodMock = { ...getStripeUPE(method), clientToken: 'myToken' };
                        loadPaymentMethodAction = of(
                            createAction(
                                PaymentMethodActionType.LoadPaymentMethodSucceeded,
                                paymentMethodMock,
                                { methodId: `stripeupe?method=${paymentMethodMock.id}` },
                            ),
                        );

                        jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod').mockReturnValue(
                            loadPaymentMethodAction,
                        );
                        jest.spyOn(
                            store.getState().paymentMethods,
                            'getPaymentMethodOrThrow',
                        ).mockReturnValue(getStripeUPE(method));
                    });

                    it('fires additional action outside of bigcommerce', async () => {
                        const errorResponse = new RequestError(
                            getResponse({
                                ...getErrorPaymentResponseBody(),
                                errors: [{ code: 'additional_action_required' }],
                                additional_action_required: {
                                    type: 'redirect_to_url',
                                    data: {
                                        redirect_url: 'https://redirect-url.com',
                                    },
                                },
                                status: 'error',
                            }),
                        );

                        jest.spyOn(paymentActionCreator, 'submitPayment').mockReturnValue(
                            of(
                                createErrorAction(
                                    PaymentActionType.SubmitPaymentFailed,
                                    errorResponse,
                                ),
                            ),
                        );

                        stripeUPEJsMock.retrievePaymentIntent = jest.fn(() =>
                            Promise.resolve(getRetrievePaymentIntentResponse()),
                        );

                        try {
                            await strategy.execute(getStripeUPEOrderRequestBodyMock(method));
                        } catch (error) {
                            expect(orderActionCreator.submitOrder).toHaveBeenCalled();
                            expect(paymentActionCreator.submitPayment).toHaveBeenCalledTimes(1);
                            expect(stripeUPEJsMock.confirmPayment).toHaveBeenCalledTimes(1);
                            expect(stripeUPEJsMock.confirmPayment).toHaveBeenCalledWith(
                                expect.objectContaining({
                                    confirmParams: {
                                        payment_method_data: {
                                            billing_details: expect.objectContaining({
                                                email: 'test@bigcommerce.com',
                                            }),
                                        },
                                        return_url: 'https://redirect-url.com',
                                    },
                                }),
                            );
                        }
                    });

                    it('do not fire additional action because of missing url', async () => {
                        const errorResponse = new RequestError(
                            getResponse({
                                ...getErrorPaymentResponseBody(),
                                errors: [{ code: 'additional_action_required' }],
                                additional_action_required: {
                                    type: 'redirect_to_url',
                                    data: {},
                                },
                                status: 'error',
                            }),
                        );

                        window.location.replace = jest.fn();

                        jest.spyOn(paymentActionCreator, 'submitPayment').mockReturnValue(
                            of(
                                createErrorAction(
                                    PaymentActionType.SubmitPaymentFailed,
                                    errorResponse,
                                ),
                            ),
                        );

                        try {
                            await strategy.execute(getStripeUPEOrderRequestBodyMock(method));
                        } catch (error) {
                            expect(orderActionCreator.submitOrder).toHaveBeenCalled();
                            expect(paymentActionCreator.submitPayment).toHaveBeenCalledTimes(1);
                            expect(stripeUPEJsMock.confirmPayment).not.toHaveBeenCalled();
                        }
                    });
                });
            });
        });

        it('throws an error when payment is not set properly into payload', () => {
            const payload = {
                payment: undefined,
            };

            expect(strategy.execute(payload)).rejects.toThrow(PaymentArgumentInvalidError);
        });

        it('throws an error when payment.paymentData is not set properly into payload', () => {
            const payload = {
                payment: {
                    methodId: 'stripeupe',
                    paymentData: undefined,
                },
            };

            expect(strategy.execute(payload)).rejects.toThrow(PaymentArgumentInvalidError);
        });
    });

    describe('#finalize()', () => {
        it('throws an error to inform that order finalization is not required', () => {
            const promise = strategy.finalize();

            expect(promise).rejects.toBeInstanceOf(OrderFinalizationNotRequiredError);
        });
    });

    describe('#deinitialize()', () => {
        const stripeUPEJsMock = getStripeUPEJsMock();

        beforeEach(async () => {
            jest.spyOn(stripeScriptLoader, 'getStripeClient').mockReturnValue(
                Promise.resolve(stripeUPEJsMock),
            );

            await strategy.initialize(getStripeUPEInitializeOptionsMock());
        });

        it('deinitializes stripe payment strategy', async () => {
            const promise = await strategy.deinitialize();

            expect(promise).toBe(store.getState());

            expect(stripeScriptLoader.getStripeClient).toHaveBeenCalledTimes(1);
            expect(stripeUPEJsMock.elements).toHaveBeenCalledTimes(0);
        });
    });
});
