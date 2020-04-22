import { createAction } from '@bigcommerce/data-store';
import { createRequestSender, createTimeout } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';
import { get, map, merge } from 'lodash';
import { from, of, Observable } from 'rxjs';

import { BillingAddressActionCreator, BillingAddressRequestSender } from '../billing';
import { getBillingAddress } from '../billing/billing-addresses.mock';
import { ErrorActionCreator } from '../common/error';
import { getResponse } from '../common/http-request/responses.mock';
import { ConfigActionCreator, ConfigRequestSender } from '../config';
import { getConfig } from '../config/configs.mock';
import { CouponActionCreator, CouponRequestSender, GiftCertificateActionCreator, GiftCertificateRequestSender } from '../coupon';
import { createCustomerStrategyRegistry, CustomerStrategyActionCreator } from '../customer';
import { getFormFields } from '../form/form.mock';
import { CountryActionCreator, CountryRequestSender } from '../geography';
import { getCountriesResponseBody } from '../geography/countries.mock';
import { OrderActionCreator, OrderRequestSender } from '../order';
import { getCompleteOrderResponseBody, getOrderRequestBody } from '../order/internal-orders.mock';
import { getOrder } from '../order/orders.mock';
import { createPaymentClient, PaymentMethodActionCreator, PaymentMethodRequestSender, PaymentStrategyActionCreator, PaymentStrategyRegistry } from '../payment';
import { InstrumentActionCreator, InstrumentRequestSender } from '../payment/instrument';
import { deleteInstrumentResponseBody, getLoadInstrumentsResponseBody, getVaultAccessTokenResponseBody } from '../payment/instrument/instrument.mock';
import { getAuthorizenet, getPaymentMethod, getPaymentMethods } from '../payment/payment-methods.mock';
import { PaymentStrategy } from '../payment/strategies';
import { NoPaymentDataRequiredPaymentStrategy } from '../payment/strategies/no-payment';
import { OfflinePaymentStrategy } from '../payment/strategies/offline';
import { createShippingStrategyRegistry, ConsignmentActionCreator, ConsignmentRequestSender, ShippingCountryActionCreator, ShippingCountryRequestSender, ShippingStrategyActionCreator } from '../shipping';
import { getShippingAddress } from '../shipping/shipping-addresses.mock';
import { getShippingOptions } from '../shipping/shipping-options.mock';
import { SignInEmailActionCreator, SignInEmailRequestSender } from '../signin-email';
import { createSpamProtection, SpamProtectionActionCreator, SpamProtectionActionType, SpamProtectionOptions, SpamProtectionRequestSender } from '../spam-protection';
import { StoreCreditActionCreator, StoreCreditRequestSender } from '../store-credit';
import { SubscriptionsActionCreator, SubscriptionsRequestSender } from '../subscription';

import CheckoutActionCreator from './checkout-action-creator';
import CheckoutRequestSender from './checkout-request-sender';
import CheckoutService from './checkout-service';
import CheckoutStore from './checkout-store';
import CheckoutValidator from './checkout-validator';
import { getCheckout, getCheckoutStoreState, getCheckoutWithCoupons, getCheckoutWithPayments } from './checkouts.mock';
import createCheckoutStore from './create-checkout-store';

describe('CheckoutService', () => {
    let billingAddressActionCreator: BillingAddressActionCreator;
    let billingAddressRequestSender: BillingAddressRequestSender;
    let checkoutActionCreator: CheckoutActionCreator;
    let instrumentRequestSender: InstrumentRequestSender;
    let countryRequestSender: CountryRequestSender;
    let consignmentRequestSender: ConsignmentRequestSender;
    let consignmentActionCreator: ConsignmentActionCreator;
    let checkoutRequestSender: CheckoutRequestSender;
    let checkoutService: CheckoutService;
    let checkoutValidator: CheckoutValidator;
    let configActionCreator: ConfigActionCreator;
    let configRequestSender: ConfigRequestSender;
    let couponRequestSender: CouponRequestSender;
    let customerStrategyActionCreator: CustomerStrategyActionCreator;
    let errorActionCreator: ErrorActionCreator;
    let giftCertificateRequestSender: GiftCertificateRequestSender;
    let instrumentActionCreator: InstrumentActionCreator;
    let orderActionCreator: OrderActionCreator;
    let orderRequestSender: OrderRequestSender;
    let paymentMethodRequestSender: PaymentMethodRequestSender;
    let paymentMethodActionCreator: PaymentMethodActionCreator;
    let paymentStrategy: PaymentStrategy;
    let paymentStrategyActionCreator: PaymentStrategyActionCreator;
    let paymentStrategyRegistry: PaymentStrategyRegistry;
    let shippingStrategyActionCreator: ShippingStrategyActionCreator;
    let shippingCountryRequestSender: ShippingCountryRequestSender;
    let signInEmailActionCreator: SignInEmailActionCreator;
    let signInEmailRequestSender: SignInEmailRequestSender;
    let subscriptionsRequestSender: SubscriptionsRequestSender;
    let subscriptionsActionCreator: SubscriptionsActionCreator;
    let spamProtectionActionCreator: SpamProtectionActionCreator;
    let store: CheckoutStore;
    let storeCreditRequestSender: StoreCreditRequestSender;

    beforeEach(() => {
        store = createCheckoutStore(getCheckoutStoreState());

        const locale = 'en';
        const requestSender = createRequestSender();
        const paymentClient = createPaymentClient(store);

        instrumentRequestSender = new InstrumentRequestSender(paymentClient, requestSender);

        jest.spyOn(instrumentRequestSender, 'getVaultAccessToken')
            .mockResolvedValue(getResponse(getVaultAccessTokenResponseBody()));
        jest.spyOn(instrumentRequestSender, 'loadInstruments')
            .mockResolvedValue(getResponse(getLoadInstrumentsResponseBody()));
        jest.spyOn(instrumentRequestSender, 'deleteInstrument')
            .mockResolvedValue(getResponse(deleteInstrumentResponseBody()));

        shippingCountryRequestSender = new ShippingCountryRequestSender(requestSender, { locale });

        jest.spyOn(shippingCountryRequestSender, 'loadCountries')
            .mockResolvedValue(getResponse(getCountriesResponseBody()));

        billingAddressRequestSender = new BillingAddressRequestSender(requestSender);
        subscriptionsRequestSender = new SubscriptionsRequestSender(requestSender);
        subscriptionsActionCreator = new SubscriptionsActionCreator(subscriptionsRequestSender);

        jest.spyOn(subscriptionsRequestSender, 'updateSubscriptions').mockResolvedValue(getResponse({}));

        signInEmailRequestSender = new SignInEmailRequestSender(requestSender);
        signInEmailActionCreator = new SignInEmailActionCreator(signInEmailRequestSender);

        jest.spyOn(signInEmailRequestSender, 'sendSignInEmail').mockResolvedValue(getResponse({
            sent_email: 'foo@bar.com',
            expiry: 0,
        }));

        jest.spyOn(billingAddressRequestSender, 'updateAddress')
            .mockResolvedValue(getResponse(merge({}, getCheckout(), {
                customer: {
                    email: 'foo@bar.com',
                },
                billingAddress: {
                    email: 'foo@bar.com',
                },
            })));

        countryRequestSender = new CountryRequestSender(requestSender, { locale });

        jest.spyOn(countryRequestSender, 'loadCountries')
            .mockResolvedValue(getResponse(getCountriesResponseBody()));

        paymentStrategy = new OfflinePaymentStrategy(store, orderActionCreator);

        jest.spyOn(paymentStrategy, 'execute')
            .mockResolvedValue(store.getState());

        jest.spyOn(paymentStrategy, 'finalize')
            .mockResolvedValue(store.getState());

        jest.spyOn(paymentStrategy, 'initialize')
            .mockResolvedValue(store.getState());

        jest.spyOn(paymentStrategy, 'deinitialize')
            .mockResolvedValue(store.getState());

        paymentStrategyRegistry = new PaymentStrategyRegistry(store);

        jest.spyOn(paymentStrategyRegistry, 'getByMethod').mockReturnValue(paymentStrategy);

        orderRequestSender = new OrderRequestSender(requestSender);

        jest.spyOn(orderRequestSender, 'loadOrder').mockResolvedValue(getResponse(getOrder()));
        jest.spyOn(orderRequestSender, 'submitOrder').mockResolvedValue(getResponse(getCompleteOrderResponseBody()));
        jest.spyOn(orderRequestSender, 'finalizeOrder').mockResolvedValue(getResponse(getCompleteOrderResponseBody()));

        consignmentRequestSender = new ConsignmentRequestSender(requestSender);

        jest.spyOn(consignmentRequestSender, 'createConsignments').mockResolvedValue(getResponse(getCheckout()));
        jest.spyOn(consignmentRequestSender, 'updateConsignment').mockResolvedValue(getResponse(getCheckout()));

        giftCertificateRequestSender = new GiftCertificateRequestSender(requestSender);

        jest.spyOn(giftCertificateRequestSender, 'applyGiftCertificate').mockResolvedValue(getResponse(getCheckout()));
        jest.spyOn(giftCertificateRequestSender, 'removeGiftCertificate').mockResolvedValue(getResponse(getCheckout()));

        checkoutRequestSender = new CheckoutRequestSender(requestSender);

        jest.spyOn(checkoutRequestSender, 'loadCheckout').mockResolvedValue(getResponse(getCheckout()));
        jest.spyOn(checkoutRequestSender, 'updateCheckout').mockResolvedValue(getResponse(getCheckout()));

        couponRequestSender = new CouponRequestSender(requestSender);

        jest.spyOn(couponRequestSender, 'applyCoupon').mockResolvedValue(getResponse(getCheckout()));
        jest.spyOn(couponRequestSender, 'removeCoupon').mockResolvedValue(getResponse(getCheckout()));

        storeCreditRequestSender = new StoreCreditRequestSender(requestSender);

        jest.spyOn(storeCreditRequestSender, 'applyStoreCredit').mockResolvedValue(getResponse(getCheckout()));
        jest.spyOn(storeCreditRequestSender, 'removeStoreCredit').mockResolvedValue(getResponse(getCheckout()));

        configRequestSender = new ConfigRequestSender(requestSender);

        jest.spyOn(configRequestSender, 'loadConfig').mockResolvedValue(getResponse(getConfig()));

        paymentMethodRequestSender = new PaymentMethodRequestSender(requestSender);

        jest.spyOn(paymentMethodRequestSender, 'loadPaymentMethod')
            .mockResolvedValue(getResponse(getPaymentMethod()));
        jest.spyOn(paymentMethodRequestSender, 'loadPaymentMethods')
            .mockResolvedValue(getResponse(getPaymentMethods()));

        checkoutValidator = new CheckoutValidator(checkoutRequestSender);

        jest.spyOn(checkoutValidator, 'validate').mockResolvedValue(undefined);

        checkoutValidator = new CheckoutValidator(checkoutRequestSender);

        billingAddressActionCreator = new BillingAddressActionCreator(
            billingAddressRequestSender,
            subscriptionsActionCreator
        );

        configActionCreator = new ConfigActionCreator(configRequestSender);

        checkoutActionCreator = new CheckoutActionCreator(
            checkoutRequestSender,
            configActionCreator
        );

        consignmentActionCreator = new ConsignmentActionCreator(consignmentRequestSender, checkoutRequestSender);

        customerStrategyActionCreator = new CustomerStrategyActionCreator(
            createCustomerStrategyRegistry(store, requestSender)
        );

        instrumentActionCreator = new InstrumentActionCreator(instrumentRequestSender);

        spamProtectionActionCreator = new SpamProtectionActionCreator(
            createSpamProtection(createScriptLoader()),
            new SpamProtectionRequestSender(requestSender)
        );

        orderActionCreator = new OrderActionCreator(orderRequestSender, checkoutValidator);

        paymentMethodActionCreator = new PaymentMethodActionCreator(paymentMethodRequestSender);

        paymentStrategyActionCreator = new PaymentStrategyActionCreator(
            paymentStrategyRegistry,
            orderActionCreator,
            spamProtectionActionCreator
        );

        shippingStrategyActionCreator = new ShippingStrategyActionCreator(
            createShippingStrategyRegistry(store, requestSender)
        );

        errorActionCreator = new ErrorActionCreator();

        checkoutService = new CheckoutService(
            store,
            billingAddressActionCreator,
            checkoutActionCreator,
            configActionCreator,
            consignmentActionCreator,
            new CountryActionCreator(countryRequestSender),
            new CouponActionCreator(couponRequestSender),
            customerStrategyActionCreator,
            errorActionCreator,
            new GiftCertificateActionCreator(giftCertificateRequestSender),
            instrumentActionCreator,
            orderActionCreator,
            paymentMethodActionCreator,
            paymentStrategyActionCreator,
            new ShippingCountryActionCreator(shippingCountryRequestSender),
            shippingStrategyActionCreator,
            signInEmailActionCreator,
            spamProtectionActionCreator,
            new StoreCreditActionCreator(storeCreditRequestSender),
            subscriptionsActionCreator
        );
    });

    it('has methods that can be destructed', () => {
        const { loadCheckout, loadOrder } = checkoutService;

        expect(() => loadCheckout())
            .not.toThrow(TypeError);
        expect(() => loadOrder(123))
            .not.toThrow(TypeError);
    });

    describe('#getState()', () => {
        it('returns state', () => {
            expect(checkoutService.getState()).toEqual(expect.objectContaining({
                data: expect.any(Object),
                errors: expect.any(Object),
                statuses: expect.any(Object),
            }));
        });

        it('returns same state unless it is changed', () => {
            const state = checkoutService.getState();

            expect(state).toBe(checkoutService.getState());

            checkoutService.loadPaymentMethods();

            expect(state).not.toBe(checkoutService.getState());
        });
    });

    describe('#subscribe()', () => {
        it('passes state to subscriber', () => {
            const subscriber = jest.fn();

            checkoutService.subscribe(subscriber);

            expect(subscriber).toHaveBeenCalledWith(checkoutService.getState());
        });

        it('passes state to filters', async () => {
            const filter = jest.fn(state => state);

            checkoutService.subscribe(() => {}, filter);

            await checkoutService.loadCheckout();

            expect(Object.keys((filter as jest.Mock).mock.calls[0][0]))
                .toEqual(Object.keys(checkoutService.getState()));
        });

        it('calls subscriber on state change', async () => {
            const subscriber = jest.fn();

            checkoutService.subscribe(subscriber, state => state.data.getCheckout());
            subscriber.mockReset();

            jest.spyOn(checkoutRequestSender, 'loadCheckout')
                .mockReturnValue(Promise.resolve(getResponse(getCheckoutWithCoupons())));

            await checkoutService.loadCheckout('abc');
            await checkoutService.loadCheckout('abc');

            expect(subscriber).toHaveBeenCalledTimes(1);
        });

        it('only calls subscriber when filters are matched', async () => {
            const subscriber = jest.fn();

            checkoutService.subscribe(
                subscriber,
                state => get(state.data.getCheckout(), 'payments')
            );
            subscriber.mockReset();

            jest.spyOn(checkoutRequestSender, 'loadCheckout')
                .mockReturnValue(Promise.resolve(getResponse(getCheckoutWithPayments())));

            await checkoutService.loadCheckout('abc');

            expect(subscriber).toHaveBeenCalledTimes(1);

            jest.spyOn(checkoutRequestSender, 'loadCheckout')
                .mockReturnValue(Promise.resolve(getResponse(getCheckoutWithCoupons())));

            await checkoutService.loadCheckout('abc');

            expect(subscriber).toHaveBeenCalledTimes(1);
        });
    });

    describe('#notifyState()', () => {
        it('notifies subscribers of its current state', () => {
            const subscriber = jest.fn();

            checkoutService.subscribe(subscriber);
            checkoutService.notifyState();

            expect(subscriber).toHaveBeenLastCalledWith(checkoutService.getState());
            expect(subscriber).toHaveBeenCalledTimes(2);
        });
    });

    describe('#loadCheckout()', () => {
        const { id } = getCheckout();

        beforeEach(() => {
            jest.spyOn(checkoutActionCreator, 'loadCheckout');
            jest.spyOn(checkoutActionCreator, 'loadDefaultCheckout');
            jest.spyOn(configActionCreator, 'loadConfig');
        });

        it('calls loadCheckout with the provided id', () => {
            checkoutService.loadCheckout(id);

            expect(checkoutActionCreator.loadCheckout).toHaveBeenCalledWith(id, undefined);
        });

        it('calls loadDefaultCheckout when no id is provided', async () => {
            await checkoutService.loadCheckout();

            expect(checkoutActionCreator.loadDefaultCheckout).toHaveBeenCalledWith(undefined);
        });

        it('returns a state with a hydrated checkout', async () => {
            const state = await checkoutService.loadCheckout();

            expect(state.data.getCheckout()).toEqual(store.getState().checkout.getCheckout());
        });
    });

    describe('#sendSignInEmail()', () => {
        it('sends sign-in email', async () => {
            const state = await checkoutService.sendSignInEmail('foo@bar.com');

            expect(signInEmailRequestSender.sendSignInEmail)
                .toHaveBeenCalledWith('foo@bar.com', undefined);

            expect(state.data.getCheckout())
                .toEqual(store.getState().checkout.getCheckout());
        });
    });

    describe('#updateSubscriptions()', () => {
        it('updates subscriptions', async () => {
            const state = await checkoutService.updateSubscriptions({
                email: 'foo@bar.com',
                acceptsAbandonedCartEmails: true,
                acceptsMarketingNewsletter: false,
            });

            expect(subscriptionsRequestSender.updateSubscriptions)
                .toHaveBeenCalledWith({
                    email: 'foo@bar.com',
                    acceptsAbandonedCartEmails: true,
                    acceptsMarketingNewsletter: false,
                 }, undefined);

            expect(state.data.getCheckout())
                .toEqual(store.getState().checkout.getCheckout());
        });
    });

    describe('#updateCheckout()', () => {
        const { id } = getCheckout();

        it('updates checkout data', async () => {
            const state = await checkoutService.updateCheckout({ customerMessage: 'foo' });

            expect(checkoutRequestSender.updateCheckout)
                .toHaveBeenCalledWith(id, { customerMessage: 'foo' }, undefined);

            expect(state.data.getCheckout())
                .toEqual(store.getState().checkout.getCheckout());
        });
    });

    describe('#loadShippingAddressFields()', () => {
        it('loads config data', async () => {
            const state = await checkoutService.loadShippingAddressFields();
            const result = state.data.getShippingAddressFields('');
            const expected = getFormFields();

            expect(map(result, 'id')).toEqual(map(expected, 'id'));
        });

        it('loads extra countries data', async () => {
            const state = await checkoutService.loadShippingAddressFields();

            expect(state.data.getShippingCountries()).toEqual(getCountriesResponseBody().data);
        });
    });

    describe('#loadBillingAddressFields()', () => {
        it('loads config data', async () => {
            const state = await checkoutService.loadBillingAddressFields();
            const result = state.data.getBillingAddressFields('');
            const expected = getFormFields();

            expect(map(result, 'id')).toEqual(map(expected, 'id'));
        });

        it('loads extra countries data', async () => {
            const state = await checkoutService.loadBillingAddressFields();

            expect(state.data.getBillingCountries()).toEqual(getCountriesResponseBody().data);
        });
    });

    describe('#loadOrder()', () => {
        beforeEach(() => {
            jest.spyOn(orderActionCreator, 'loadOrder');
            jest.spyOn(configActionCreator, 'loadConfig');
        });

        it('loads order data', async () => {
            const state = await checkoutService.loadOrder(295);

            expect(orderActionCreator.loadOrder).toHaveBeenCalled();
            expect(state.data.getOrder()).toEqual(store.getState().order.getOrder());
        });

        it('loads config data', async () => {
            const state = await checkoutService.loadOrder(295);

            expect(configActionCreator.loadConfig).toHaveBeenCalled();
            expect(state.data.getConfig()).toEqual(getConfig().storeConfig);
        });
    });

    describe('#submitOrder()', () => {
        let noPaymentDataRequiredPaymentStrategy: NoPaymentDataRequiredPaymentStrategy;

        beforeEach(async () => {
            await checkoutService.loadCheckout();

            noPaymentDataRequiredPaymentStrategy = new NoPaymentDataRequiredPaymentStrategy(store, orderActionCreator);

            jest.spyOn(noPaymentDataRequiredPaymentStrategy, 'execute').mockResolvedValue(store.getState());

            paymentStrategyRegistry.get = jest.fn(() => noPaymentDataRequiredPaymentStrategy);

            jest.spyOn(spamProtectionActionCreator, 'execute')
                .mockReturnValue(() => from([
                    createAction(SpamProtectionActionType.ExecuteRequested),
                    createAction(SpamProtectionActionType.ExecuteSucceeded),
                ]));
        });

        it('finds payment strategy', async () => {
            await checkoutService.loadPaymentMethods();
            await checkoutService.submitOrder(getOrderRequestBody());

            expect(paymentStrategyRegistry.getByMethod).toHaveBeenCalledWith(getAuthorizenet());
        });

        it('executes payment strategy', async () => {
            const payload = getOrderRequestBody();

            await checkoutService.loadPaymentMethods();
            await checkoutService.submitOrder(payload);

            expect(paymentStrategy.execute).toHaveBeenCalledWith(
                getOrderRequestBody(),
                // tslint:disable-next-line:no-non-null-assertion
                { methodId: payload.payment!.methodId, gatewayId: payload.payment!.gatewayId }
            );
        });

        it('executes payment strategy with timeout', async () => {
            const payload = getOrderRequestBody();
            const options = { timeout: createTimeout() };

            await checkoutService.loadPaymentMethods();
            await checkoutService.submitOrder(payload, options);

            expect(paymentStrategy.execute).toHaveBeenCalledWith(
                payload,
                // tslint:disable-next-line:no-non-null-assertion
                { ...options, methodId: payload.payment!.methodId, gatewayId: payload.payment!.gatewayId }
            );
        });
    });

    describe('#finalizeOrderIfNeeded()', () => {
        it('finds payment strategy', async () => {
            await checkoutService.loadCheckout();
            await checkoutService.loadPaymentMethods();
            await checkoutService.finalizeOrderIfNeeded();

            expect(paymentStrategyRegistry.getByMethod).toHaveBeenCalledWith(getAuthorizenet());
        });

        it('finalizes order', async () => {
            await checkoutService.loadCheckout();
            await checkoutService.loadPaymentMethods();
            await checkoutService.finalizeOrderIfNeeded();

            expect(paymentStrategy.finalize).toHaveBeenCalledWith({
                methodId: getAuthorizenet().id,
            });
        });

        it('finalizes order with timeout', async () => {
            const options = { timeout: createTimeout() };

            await checkoutService.loadCheckout();
            await checkoutService.loadPaymentMethods();
            await checkoutService.finalizeOrderIfNeeded(options);

            expect(paymentStrategy.finalize).toHaveBeenCalledWith({
                ...options,
                methodId: getAuthorizenet().id,
            });
        });
    });

    describe('#loadPaymentMethods()', () => {
        it('loads payment methods', async () => {
            await checkoutService.loadPaymentMethods();

            expect(paymentMethodRequestSender.loadPaymentMethods).toHaveBeenCalledWith(undefined);
        });

        it('loads payment methods with timeout', async () => {
            const options = { timeout: createTimeout() };

            await checkoutService.loadPaymentMethods(options);

            expect(paymentMethodRequestSender.loadPaymentMethods).toHaveBeenCalledWith(options);
        });

        it('returns payment methods', async () => {
            const state = await checkoutService.loadPaymentMethods();

            expect(state.data.getPaymentMethods()).toEqual(getPaymentMethods());
        });

        it('dispatches action with queue id', async () => {
            jest.spyOn(store, 'dispatch');

            await checkoutService.loadPaymentMethods();

            expect(store.dispatch).toHaveBeenCalledWith(expect.any(Observable), { queueId: 'paymentMethods' });
        });
    });

    describe('#initializePayment()', () => {
        it('dispatches action to initialize payment', async () => {
            const options = { methodId: getPaymentMethod().id };
            const action = of(createAction('INITIALIZE_PAYMENT'));

            jest.spyOn(paymentStrategyActionCreator, 'initialize')
                .mockReturnValue(action);

            jest.spyOn(store, 'dispatch');

            await checkoutService.initializePayment(options);

            expect(paymentStrategyActionCreator.initialize).toHaveBeenCalledWith(options);
            expect(store.dispatch).toHaveBeenCalledWith(action, { queueId: 'paymentStrategy' });
        });
    });

    describe('#deinitializePayment()', () => {
        it('dispatches action to deinitialize payment', async () => {
            const options = { methodId: getPaymentMethod().id };
            const action = of(createAction('DEINITIALIZE_PAYMENT'));

            jest.spyOn(paymentStrategyActionCreator, 'deinitialize')
                .mockReturnValue(action);

            jest.spyOn(store, 'dispatch');

            await checkoutService.deinitializePayment(options);

            expect(paymentStrategyActionCreator.deinitialize).toHaveBeenCalledWith(options);
            expect(store.dispatch).toHaveBeenCalledWith(action, { queueId: 'paymentStrategy' });
        });
    });

    describe('#loadBillingCountries()', () => {
        it('loads billing countries data', async () => {
            const state = await checkoutService.loadBillingCountries();

            expect(state.data.getBillingCountries()).toEqual(getCountriesResponseBody().data);
        });

        it('dispatches action with queue id', async () => {
            jest.spyOn(store, 'dispatch');

            await checkoutService.loadBillingCountries();

            expect(store.dispatch).toHaveBeenCalledWith(expect.any(Observable), { queueId: 'billingCountries' });
        });
    });

    describe('#loadShippingCountries()', () => {
        it('loads shipping countries data', async () => {
            const state = await checkoutService.loadShippingCountries();

            expect(state.data.getShippingCountries()).toEqual(getCountriesResponseBody().data);
        });

        it('dispatches action with queue id', async () => {
            jest.spyOn(store, 'dispatch');

            await checkoutService.loadShippingCountries();

            expect(store.dispatch).toHaveBeenCalledWith(expect.any(Observable), { queueId: 'shippingCountries' });
        });
    });

    describe('#initializeCustomer()', () => {
        it('dispatches action to initialize customer', async () => {
            const options = { methodId: getPaymentMethod().id };
            const action = of(createAction('INITIALIZE_CUSTOMER'));

            jest.spyOn(customerStrategyActionCreator, 'initialize')
                .mockReturnValue(action);

            jest.spyOn(store, 'dispatch');

            await checkoutService.initializeCustomer(options);

            expect(customerStrategyActionCreator.initialize).toHaveBeenCalledWith(options);
            expect(store.dispatch).toHaveBeenCalledWith(action, { queueId: 'customerStrategy' });
        });
    });

    describe('#deinitializeCustomer()', () => {
        it('dispatches action to deinitialize customer', async () => {
            const options = { methodId: getPaymentMethod().id };
            const action = of(createAction('DEINITIALIZE_CUSTOMER'));

            jest.spyOn(customerStrategyActionCreator, 'deinitialize')
                .mockReturnValue(action);

            jest.spyOn(store, 'dispatch');

            await checkoutService.deinitializeCustomer(options);

            expect(customerStrategyActionCreator.deinitialize).toHaveBeenCalledWith(options);
            expect(store.dispatch).toHaveBeenCalledWith(action, { queueId: 'customerStrategy' });
        });
    });

    describe('#continueAsGuest()', () => {
        it('dispatches action to continue as guest', async () => {
            const action = of(createAction('SIGN_IN_GUEST'));

            jest.spyOn(billingAddressActionCreator, 'continueAsGuest')
                .mockReturnValue(action);

            jest.spyOn(store, 'dispatch');

            await checkoutService.continueAsGuest({ email: 'foo@bar.com' });

            expect(billingAddressActionCreator.continueAsGuest).toHaveBeenCalledWith({ email: 'foo@bar.com' }, undefined);
            expect(store.dispatch).toHaveBeenCalledWith(action, undefined);
        });
    });

    describe('#signInCustomer()', () => {
        it('dispatches action to sign in customer', async () => {
            const options = { methodId: getPaymentMethod().id };
            const action = of(createAction('SIGN_IN_CUSTOMER'));

            jest.spyOn(customerStrategyActionCreator, 'signIn')
                .mockReturnValue(action);

            jest.spyOn(store, 'dispatch');

            await checkoutService.signInCustomer({ email: 'foo@bar.com', password: 'password1' }, options);

            expect(customerStrategyActionCreator.signIn).toHaveBeenCalledWith({ email: 'foo@bar.com', password: 'password1' }, options);
            expect(store.dispatch).toHaveBeenCalledWith(action, { queueId: 'customerStrategy' });
        });
    });

    describe('#signOutCustomer()', () => {
        it('dispatches action to sign out customer', async () => {
            const options = { methodId: getPaymentMethod().id };
            const action = of(createAction('SIGN_OUT_CUSTOMER'));

            jest.spyOn(customerStrategyActionCreator, 'signOut')
                .mockReturnValue(action);

            jest.spyOn(store, 'dispatch');

            await checkoutService.signOutCustomer(options);

            expect(customerStrategyActionCreator.signOut).toHaveBeenCalledWith(options);
            expect(store.dispatch).toHaveBeenCalledWith(action, { queueId: 'customerStrategy' });
        });
    });

    describe('#loadShippingOptions()', () => {
        it('loads shipping options', async () => {
            const state = await checkoutService.loadShippingOptions();

            expect(checkoutRequestSender.loadCheckout).toHaveBeenCalled();
            expect(state.data.getShippingOptions()).toEqual(getShippingOptions());
        });
    });

    describe('#initializeShipping()', () => {
        it('dispatches action to initialize shipping', async () => {
            const options = { timeout: createTimeout() };
            const action = of(createAction('INITIALIZE_SHIPPING'));

            jest.spyOn(shippingStrategyActionCreator, 'initialize')
                .mockReturnValue(action);

            jest.spyOn(store, 'dispatch');

            await checkoutService.initializeShipping(options);

            expect(shippingStrategyActionCreator.initialize).toHaveBeenCalledWith(options);
            expect(store.dispatch).toHaveBeenCalledWith(action, { queueId: 'shippingStrategy' });
        });
    });

    describe('#deinitializeShipping()', () => {
        it('dispatches action to deinitialize shipping', async () => {
            const options = { timeout: createTimeout() };
            const action = of(createAction('DEINITIALIZE_SHIPPING'));

            jest.spyOn(shippingStrategyActionCreator, 'deinitialize')
                .mockReturnValue(action);

            jest.spyOn(store, 'dispatch');

            await checkoutService.deinitializeShipping(options);

            expect(shippingStrategyActionCreator.deinitialize).toHaveBeenCalledWith(options);
            expect(store.dispatch).toHaveBeenCalledWith(action, { queueId: 'shippingStrategy' });
        });
    });

    describe('#selectConsignmentShippingOption()', () => {
        it('dispatches action to update shipping option for a consignment', async () => {
            const options = { timeout: createTimeout() };
            const action = of(createAction('UPDATE_CONSIGNMENT'));

            jest.spyOn(consignmentActionCreator, 'updateShippingOption')
                .mockReturnValue(action);

            jest.spyOn(store, 'dispatch');

            await checkoutService.selectConsignmentShippingOption('foo', 'bar', options);

            expect(consignmentActionCreator.updateShippingOption).toHaveBeenCalledWith({
                id: 'foo',
                shippingOptionId: 'bar',
            }, options);

            expect(store.dispatch).toHaveBeenCalledWith(action, { queueId: 'shippingStrategy' });
        });
    });

    describe('#updateConsignment()', () => {
        it('dispatches action to update address for a consignment', async () => {
            const address = getShippingAddress();
            const options = { timeout: createTimeout() };
            const action = of(createAction('UPDATE_CONSIGNMENT'));

            jest.spyOn(consignmentActionCreator, 'updateConsignment')
                .mockReturnValue(action);

            jest.spyOn(store, 'dispatch');

            const payload = {
                id: 'foo',
                shippingAddress: address,
                lineItems: [],
            };

            await checkoutService.updateConsignment(payload, options);

            expect(consignmentActionCreator.updateConsignment)
                .toHaveBeenCalledWith(payload, options);

            expect(store.dispatch)
                .toHaveBeenCalledWith(action, { queueId: 'shippingStrategy' });
        });
    });

    describe('#assignItemsToAddress()', () => {
        it('dispatches action to update consignment', async () => {
            const address = getShippingAddress();
            const options = { timeout: createTimeout() };
            const action = of(createAction('bar'));

            jest.spyOn(consignmentActionCreator, 'assignItemsByAddress')
                .mockReturnValue(action);

            jest.spyOn(store, 'dispatch');

            const payload = {
                shippingAddress: address,
                lineItems: [{
                    itemId: 'item-foo',
                    quantity: 2,
                }],
            };

            await checkoutService.assignItemsToAddress(payload, options);

            expect(consignmentActionCreator.assignItemsByAddress)
                .toHaveBeenCalledWith(payload, options);

            expect(store.dispatch)
                .toHaveBeenCalledWith(action, { queueId: 'shippingStrategy' });
        });
    });

    describe('#unassignItemsToAddress()', () => {
        it('dispatches action to update consignment', async () => {
            const address = getShippingAddress();
            const options = { timeout: createTimeout() };
            const action = of(createAction('bar'));

            jest.spyOn(consignmentActionCreator, 'unassignItemsByAddress')
                .mockReturnValue(action);

            jest.spyOn(store, 'dispatch');

            const payload = {
                shippingAddress: address,
                lineItems: [{
                    itemId: 'item-foo',
                    quantity: 2,
                }],
            };

            await checkoutService.unassignItemsToAddress(payload, options);

            expect(consignmentActionCreator.unassignItemsByAddress)
                .toHaveBeenCalledWith(payload, options);

            expect(store.dispatch)
                .toHaveBeenCalledWith(action, { queueId: 'shippingStrategy' });
        });
    });

    describe('#createConsignments()', () => {
        it('dispatches action to create consignments', async () => {
            const consignments = [{
                lineItems: [],
                shippingAddress: getShippingAddress(),
            }];
            const options = { timeout: createTimeout() };
            const action = of(createAction('CREATE_CONSIGNMENTS'));

            jest.spyOn(consignmentActionCreator, 'createConsignments')
                .mockReturnValue(action);

            jest.spyOn(store, 'dispatch');

            await checkoutService.createConsignments(consignments, options);

            expect(consignmentActionCreator.createConsignments).toHaveBeenCalledWith(consignments, options);

            expect(store.dispatch).toHaveBeenCalledWith(action, { queueId: 'shippingStrategy' });
        });
    });

    describe('#updateShippingAddress()', () => {
        it('dispatches action to update shipping address', async () => {
            const address = getShippingAddress();
            const options = { timeout: createTimeout() };
            const action = of(createAction('UPDATE_SHIPPING_ADDRESS'));

            jest.spyOn(shippingStrategyActionCreator, 'updateAddress')
                .mockReturnValue(action);

            jest.spyOn(store, 'dispatch');

            await checkoutService.updateShippingAddress(address, options);

            expect(shippingStrategyActionCreator.updateAddress).toHaveBeenCalledWith(address, options);
            expect(store.dispatch).toHaveBeenCalledWith(action, { queueId: 'shippingStrategy' });
        });
    });

    describe('#selectShippingOption()', () => {
        it('dispatches action to select shipping option', async () => {
            const shippingOptionId = 'shipping-option-id-456';
            const options = { timeout: createTimeout() };
            const action = of(createAction('SELECT_SHIPPING_OPTION'));

            jest.spyOn(shippingStrategyActionCreator, 'selectOption')
                .mockReturnValue(action);

            jest.spyOn(store, 'dispatch');

            await checkoutService.selectShippingOption(shippingOptionId, options);

            expect(shippingStrategyActionCreator.selectOption).toHaveBeenCalledWith(shippingOptionId, options);
            expect(store.dispatch).toHaveBeenCalledWith(action, { queueId: 'shippingStrategy' });
        });
    });

    describe('#updateBillingAddress()', () => {
        it('updates the billing address', async () => {
            const address = getBillingAddress();
            const options = { timeout: createTimeout() };
            await checkoutService.updateBillingAddress(address, options);

            expect(billingAddressRequestSender.updateAddress)
                .toHaveBeenCalledWith(getCheckout().id, address, options);
        });
    });

    describe('#applyStoreCredit()', () => {
        it('applies store credit when called with true', async () => {
            const options = { timeout: createTimeout() };
            await checkoutService.applyStoreCredit(true, options);

            expect(storeCreditRequestSender.applyStoreCredit)
                .toHaveBeenCalledWith(getCheckout().id, options);
        });

        it('removes store credit when called with false', async () => {
            const options = { timeout: createTimeout() };
            await checkoutService.applyStoreCredit(false, options);

            expect(storeCreditRequestSender.removeStoreCredit)
                .toHaveBeenCalledWith(getCheckout().id, options);
        });
    });

    describe('#applyCoupon()', () => {
        it('applies a coupon', async () => {
            const code = 'myCoupon1234';
            const options = { timeout: createTimeout() };
            await checkoutService.applyCoupon(code, options);

            expect(couponRequestSender.applyCoupon)
                .toHaveBeenCalledWith(getCheckout().id, code, options);
        });
    });

    describe('#removeCoupon()', () => {
        it('removes a coupon', async () => {
            const code = 'myCoupon1234';
            const options = { timeout: createTimeout() };
            await checkoutService.removeCoupon(code, options);

            expect(couponRequestSender.removeCoupon)
                .toHaveBeenCalledWith(getCheckout().id, code, options);
        });
    });

    describe('#applyGiftCertificate()', () => {
        it('applies a gift certificate', async () => {
            const code = 'myGiftCertificate1234';
            const options = { timeout: createTimeout() };
            await checkoutService.applyGiftCertificate(code, options);

            expect(giftCertificateRequestSender.applyGiftCertificate)
                .toHaveBeenCalledWith(getCheckout().id, code, options);
        });
    });

    describe('#removeGiftCertificate()', () => {
        it('removes a gift certificate', async () => {
            const code = 'myGiftCertificate1234';
            const options = { timeout: createTimeout() };
            await checkoutService.removeGiftCertificate(code, options);

            expect(giftCertificateRequestSender.removeGiftCertificate)
                .toHaveBeenCalledWith(getCheckout().id, code, options);
        });
    });

    describe('#loadInstruments()', () => {
        it('loads instruments', async () => {
            const action = of(createAction('LOAD_INSTRUMENTS'));

            jest.spyOn(instrumentActionCreator, 'loadInstruments')
                .mockReturnValue(action);

            jest.spyOn(store, 'dispatch');

            await checkoutService.loadInstruments();

            expect(instrumentActionCreator.loadInstruments).toHaveBeenCalled();
            expect(store.dispatch).toHaveBeenCalledWith(action, undefined);
        });
    });

    describe('#deleteInstrument()', () => {
        it('deletes an instrument', async () => {
            const instrumentId = '456';
            const deleteAction = of(createAction('DELETE_INSTRUMENT'));
            jest.spyOn(instrumentActionCreator, 'deleteInstrument')
                .mockReturnValue(deleteAction);

            jest.spyOn(store, 'dispatch');

            const loadAction = of(createAction('LOAD_INSTRUMENTS'));
            jest.spyOn(instrumentActionCreator, 'loadInstruments')
                .mockReturnValue(loadAction);

            await checkoutService.deleteInstrument(instrumentId);

            expect(instrumentActionCreator.deleteInstrument).toHaveBeenCalledWith(instrumentId);
            expect(store.dispatch).toHaveBeenCalledWith(deleteAction, undefined);
            expect(instrumentActionCreator.loadInstruments).toHaveBeenCalled();
        });
    });

    describe('#clearError()', () => {
        it('dispatches "clear error" action', () => {
            jest.spyOn(errorActionCreator, 'clearError');

            const error = new Error('Unexpected error');

            checkoutService.clearError(error);

            expect(errorActionCreator.clearError)
                .toHaveBeenCalledWith(error);
        });
    });

    describe('#initializeSpamProtection()', () => {
        let options: SpamProtectionOptions;

        beforeEach(() => {
            options = { containerId: 'spamProtectionContainer' };
            const action = of(createAction(SpamProtectionActionType.InitializeSucceeded));

            jest.spyOn(spamProtectionActionCreator, 'initialize')
                .mockReturnValue(action);

            jest.spyOn(store, 'dispatch');
        });

        it('initializes spam protection', async () => {
            await checkoutService.initializeSpamProtection(options);

            expect(spamProtectionActionCreator.initialize)
                .toHaveBeenCalledWith(options);
        });
    });

    describe('#executeSpamCheck()', () => {
        beforeEach(() => {
            jest.spyOn(spamProtectionActionCreator, 'initialize')
                .mockReturnValue(of(createAction(SpamProtectionActionType.InitializeSucceeded)));

            jest.spyOn(spamProtectionActionCreator, 'execute')
                .mockReturnValue(() => from([
                    createAction(SpamProtectionActionType.ExecuteRequested),
                    createAction(SpamProtectionActionType.ExecuteSucceeded),
                ]));
        });

        it('executes spam check', async () => {
            await checkoutService.executeSpamCheck();

            expect(spamProtectionActionCreator.initialize)
                .toHaveBeenCalled();
            expect(spamProtectionActionCreator.execute)
                .toHaveBeenCalled();
        });
    });
});
