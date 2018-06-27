import { createAction } from '@bigcommerce/data-store';
import { createTimeout } from '@bigcommerce/request-sender';
import { map, merge } from 'lodash';
import { Observable } from 'rxjs';

import { BillingAddressActionCreator } from '../billing';
import { getBillingAddress, getBillingAddressState } from '../billing/billing-addresses.mock';
import { getCartResponseBody, getCartState } from '../cart/internal-carts.mock';
import { getResponse } from '../common/http-request/responses.mock';
import { ConfigActionCreator } from '../config';
import { getConfig, getConfigState } from '../config/configs.mock';
import { CouponActionCreator, GiftCertificateActionCreator } from '../coupon';
import { createCustomerStrategyRegistry, CustomerStrategyActionCreator } from '../customer';
import { getFormFields } from '../form/form.mocks';
import { CountryActionCreator } from '../geography';
import { getCountriesResponseBody } from '../geography/countries.mock';
import { OrderActionCreator } from '../order';
import { getCompleteOrderResponseBody, getCompleteOrderState, getOrderRequestBody } from '../order/internal-orders.mock';
import { getOrder } from '../order/orders.mock';
import { PaymentMethodActionCreator, PaymentStrategyActionCreator } from '../payment';
import { getAuthorizenet, getBraintree, getPaymentMethod, getPaymentMethodResponseBody, getPaymentMethodsResponseBody } from '../payment/payment-methods.mock';
import { InstrumentActionCreator } from '../payment/instrument';
import { deleteInstrumentResponseBody, getVaultAccessTokenResponseBody, getLoadInstrumentsResponseBody } from '../payment/instrument/instrument.mock';
import { createShippingStrategyRegistry, ConsignmentActionCreator, ShippingCountryActionCreator, ShippingStrategyActionCreator } from '../shipping';
import { getShippingAddress, getShippingAddressResponseBody } from '../shipping/internal-shipping-addresses.mock';
import { getShippingOptions } from '../shipping/shipping-options.mock';

import CheckoutActionCreator from './checkout-action-creator';
import CheckoutService from './checkout-service';
import { getCheckout, getCheckoutState } from './checkouts.mock';
import createCheckoutStore from './create-checkout-store';
import CheckoutStoreSelector from './checkout-store-selector';
import CheckoutStoreErrorSelector from './checkout-store-error-selector';
import CheckoutStoreStatusSelector from './checkout-store-status-selector';
import { getConsignmentsState } from '../shipping/consignments.mock';
import { getCustomerState } from '../customer/customers.mock';

describe('CheckoutService', () => {
    let billingAddressActionCreator;
    let checkoutClient;
    let checkoutService;
    let checkoutValidator;
    let checkoutRequestSender;
    let couponRequestSender;
    let customerStrategyActionCreator;
    let instrumentActionCreator;
    let paymentStrategy;
    let paymentStrategyRegistry;
    let shippingStrategyActionCreator;
    let store;
    let giftCertificateRequestSender;

    beforeEach(() => {
        checkoutClient = {
            loadCart: jest.fn(() =>
                Promise.resolve(getResponse(getCartResponseBody()))
            ),

            loadConfig: jest.fn(() =>
                Promise.resolve(getResponse(getConfig()))
            ),

            loadCountries: jest.fn(() =>
                Promise.resolve(getResponse(getCountriesResponseBody()))
            ),

            loadOrder: jest.fn(() =>
                Promise.resolve(getResponse(getOrder()))
            ),

            submitOrder: jest.fn(() =>
                Promise.resolve(getResponse(getCompleteOrderResponseBody()))
            ),

            finalizeOrder: jest.fn(() =>
                Promise.resolve(getResponse(getCompleteOrderResponseBody()))
            ),

            loadPaymentMethod: jest.fn(() =>
                Promise.resolve(getResponse(getPaymentMethodResponseBody()))
            ),

            loadPaymentMethods: jest.fn(() =>
                Promise.resolve(getResponse(getPaymentMethodsResponseBody()))
            ),

            loadShippingCountries: jest.fn(() =>
                Promise.resolve(getResponse(getCountriesResponseBody()))
            ),

            loadShippingOptions: jest.fn(() =>
                Promise.resolve(getResponse(getCheckout())),
            ),

            updateBillingAddress: jest.fn(() =>
                Promise.resolve(getResponse(merge({}, getCheckout(), {
                    customer: {
                        email: 'foo@bar.com',
                    },
                    billingAddress: {
                        email: 'foo@bar.com',
                    },
                })))
            ),

            updateShippingAddress: jest.fn(() =>
                Promise.resolve(getResponse(getShippingAddressResponseBody())),
            ),

            selectShippingOption: jest.fn(() =>
                Promise.resolve(getResponse(getCheckout())),
            ),

            getVaultAccessToken: jest.fn(() =>
                Promise.resolve(getResponse(getVaultAccessTokenResponseBody()))
            ),

            loadInstruments: jest.fn(() =>
                Promise.resolve(getResponse(getLoadInstrumentsResponseBody()))
            ),

            deleteInstrument: jest.fn(() =>
                Promise.resolve(getResponse(deleteInstrumentResponseBody()))
            ),
        };

        store = createCheckoutStore({
            cart: getCartState(),
            customer: getCustomerState(),
            billingAddress: getBillingAddressState(),
            checkout: getCheckoutState(),
            config: getConfigState(),
            consignments: getConsignmentsState(),
            order: getCompleteOrderState(),
        });

        paymentStrategy = {
            execute: jest.fn(() => Promise.resolve(store.getState())),
            finalize: jest.fn(() => Promise.resolve(store.getState())),
            initialize: jest.fn(() => Promise.resolve(store.getState())),
            deinitialize: jest.fn(() => Promise.resolve(store.getState())),
        };

        paymentStrategyRegistry = {
            getByMethod: jest.fn(() => paymentStrategy),
        };

        giftCertificateRequestSender = {
            applyGiftCertificate: jest.fn(() =>
                Promise.resolve(getResponse(getCheckout()))
            ),

            removeGiftCertificate: jest.fn(() =>
                Promise.resolve(getResponse(getCheckout()))
            ),
        };

        checkoutRequestSender = {
            loadCheckout: jest.fn(() =>
                Promise.resolve(getResponse(getCheckout())),
            ),
        };

        couponRequestSender = {
            applyCoupon: jest.fn(() =>
                Promise.resolve(getResponse(getCheckout()))
            ),

            removeCoupon: jest.fn(() =>
                Promise.resolve(getResponse(getCheckout()))
            ),
        };

        checkoutValidator = {
            validate: jest.fn(() => Promise.resolve()),
        };

        billingAddressActionCreator = new BillingAddressActionCreator(checkoutClient);

        customerStrategyActionCreator = new CustomerStrategyActionCreator(
            createCustomerStrategyRegistry(store, checkoutClient)
        );

        instrumentActionCreator = new InstrumentActionCreator(checkoutClient);

        shippingStrategyActionCreator = new ShippingStrategyActionCreator(
            createShippingStrategyRegistry(store, checkoutClient)
        );

        checkoutService = new CheckoutService(
            store,
            billingAddressActionCreator,
            new CheckoutActionCreator(checkoutRequestSender),
            new ConfigActionCreator(checkoutClient),
            new ConsignmentActionCreator(checkoutClient, checkoutRequestSender),
            new CountryActionCreator(checkoutClient),
            new CouponActionCreator(couponRequestSender),
            customerStrategyActionCreator,
            new GiftCertificateActionCreator(giftCertificateRequestSender),
            instrumentActionCreator,
            new OrderActionCreator(checkoutClient, checkoutValidator),
            new PaymentMethodActionCreator(checkoutClient),
            new PaymentStrategyActionCreator(
                paymentStrategyRegistry,
                new OrderActionCreator(checkoutClient, checkoutValidator)
            ),
            new ShippingCountryActionCreator(checkoutClient),
            shippingStrategyActionCreator
        );
    });

    describe('#getState()', () => {
        it('returns state', () => {
            expect(checkoutService.getState()).toEqual(expect.objectContaining({
                data: expect.any(CheckoutStoreSelector),
                errors: expect.any(CheckoutStoreErrorSelector),
                statuses: expect.any(CheckoutStoreStatusSelector),
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

            expect(filter).toHaveBeenCalledWith(checkoutService.getState());
        });

        it('calls subscriber on state change', async () => {
            const subscriber = jest.fn();

            checkoutService.subscribe(subscriber, state => state.data.getConfig());
            subscriber.mockReset();

            jest.spyOn(checkoutClient, 'loadConfig')
                .mockReturnValue(Promise.resolve(getResponse({ ...getConfig(), storeConfig: {} })));

            await checkoutService.loadConfig();
            await checkoutService.loadConfig();

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

        it('loads checkout data', async () => {
            const state = await checkoutService.loadCheckout(id);

            expect(checkoutRequestSender.loadCheckout).toHaveBeenCalled();
            expect(state.data.getCheckout()).toEqual(store.getState().checkout.getCheckout());
        });
    });

    describe('#loadConfig()', () => {
        it('loads config data', async () => {
            const state = await checkoutService.loadConfig();

            expect(checkoutClient.loadConfig).toHaveBeenCalled();
            expect(state.data.getConfig()).toEqual(getConfig().storeConfig);
        });

        it('dispatches load config action with queue id', async () => {
            jest.spyOn(store, 'dispatch');

            await checkoutService.loadConfig();

            expect(store.dispatch).toHaveBeenCalledWith(expect.any(Observable), { queueId: 'config' });
        });
    });

    describe('#loadShippingAddressFields()', () => {
        it('loads config data', async () => {
            const state = await checkoutService.loadCheckout();
            const result = state.data.getShippingAddressFields();
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
            const state = await checkoutService.loadCheckout();
            const result = state.data.getBillingAddressFields();
            const expected = getFormFields();

            expect(map(result, 'id')).toEqual(map(expected, 'id'));
        });

        it('loads extra countries data', async () => {
            const state = await checkoutService.loadBillingAddressFields();

            expect(state.data.getBillingCountries()).toEqual(getCountriesResponseBody().data);
        });
    });

    describe('#loadOrder()', () => {
        it('loads order data', async () => {
            const state = await checkoutService.loadOrder(295);

            expect(state.data.getOrder()).toEqual(store.getState().order.getOrder());
        });
    });

    describe('#submitOrder()', () => {
        let noPaymentDataRequiredPaymentStrategy;

        beforeEach(async () => {
            await checkoutService.loadCheckout();

            noPaymentDataRequiredPaymentStrategy = {
                execute: jest.fn(() => Promise.resolve(store.getState())),
            };

            paymentStrategyRegistry.get = jest.fn(() => noPaymentDataRequiredPaymentStrategy);
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
                { methodId: payload.payment.methodId, gatewayId: payload.payment.gatewayId }
            );
        });

        it('executes payment strategy with timeout', async () => {
            const payload = getOrderRequestBody();
            const options = { timeout: createTimeout() };

            await checkoutService.loadPaymentMethods();
            await checkoutService.submitOrder(payload, options);

            expect(paymentStrategy.execute).toHaveBeenCalledWith(
                payload,
                { ...options, methodId: payload.payment.methodId, gatewayId: payload.payment.gatewayId }
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
                gatewayId: null,
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
                gatewayId: null,
            });
        });
    });

    describe('#loadPaymentMethods()', () => {
        it('loads payment methods', async () => {
            await checkoutService.loadPaymentMethods();

            expect(checkoutClient.loadPaymentMethods).toHaveBeenCalledWith(undefined);
        });

        it('loads payment methods with timeout', async () => {
            const options = { timeout: createTimeout() };

            await checkoutService.loadPaymentMethods(options);

            expect(checkoutClient.loadPaymentMethods).toHaveBeenCalledWith(options);
        });

        it('returns payment methods', async () => {
            const state = await checkoutService.loadPaymentMethods();

            expect(state.data.getPaymentMethods()).toEqual(getPaymentMethodsResponseBody().data.paymentMethods);
        });

        it('dispatches action with queue id', async () => {
            jest.spyOn(store, 'dispatch');

            await checkoutService.loadPaymentMethods();

            expect(store.dispatch).toHaveBeenCalledWith(expect.any(Observable), { queueId: 'paymentMethods' });
        });
    });

    describe('#loadPaymentMethod()', () => {
        it('loads payment method', async () => {
            await checkoutService.loadPaymentMethod('authorizenet');

            expect(checkoutClient.loadPaymentMethod).toHaveBeenCalledWith('authorizenet', undefined);
        });

        it('loads payment method with timeout', async () => {
            const options = { timeout: createTimeout() };

            await checkoutService.loadPaymentMethod('authorizenet', options);

            expect(checkoutClient.loadPaymentMethod).toHaveBeenCalledWith('authorizenet', options);
        });

        it('returns payment method', async () => {
            const state = await checkoutService.loadPaymentMethod('authorizenet');

            expect(state.data.getPaymentMethod('authorizenet')).toEqual(getPaymentMethodResponseBody().data.paymentMethod);
        });

        it('dispatches action with queue id', async () => {
            jest.spyOn(store, 'dispatch');

            await checkoutService.loadPaymentMethod('authorizenet');

            expect(store.dispatch).toHaveBeenCalledWith(expect.any(Observable), { queueId: 'paymentMethods' });
        });
    });

    describe('#initializePayment()', () => {
        it('finds payment strategy', async () => {
            await checkoutService.loadPaymentMethods();
            await checkoutService.initializePayment({ methodId: 'braintree' });

            expect(paymentStrategyRegistry.getByMethod).toHaveBeenCalledWith(getBraintree());
        });

        it('initializes payment strategy', async () => {
            await checkoutService.loadPaymentMethods();
            await checkoutService.initializePayment({ methodId: 'braintree' });

            expect(paymentStrategy.initialize).toHaveBeenCalledWith({
                methodId: getBraintree().id,
                gatewayId: undefined,
            });
        });
    });

    describe('#deinitializePayment()', () => {
        it('finds payment strategy', async () => {
            await checkoutService.loadPaymentMethods();
            await checkoutService.deinitializePayment({ methodId: 'braintree' });

            expect(paymentStrategyRegistry.getByMethod).toHaveBeenCalledWith(getBraintree());
        });

        it('deinitializes payment strategy', async () => {
            await checkoutService.loadPaymentMethods();
            await checkoutService.deinitializePayment({ methodId: 'braintree' });

            expect(paymentStrategy.deinitialize).toHaveBeenCalled();
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
            const action = Observable.of(createAction('INITIALIZE_CUSTOMER'));

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
            const action = Observable.of(createAction('DEINITIALIZE_CUSTOMER'));

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
            const action = Observable.of(createAction('SIGN_IN_GUEST'));

            jest.spyOn(billingAddressActionCreator, 'updateAddress')
                .mockReturnValue(action);

            jest.spyOn(store, 'dispatch');

            await checkoutService.continueAsGuest({ email: 'foo@bar.com' });

            expect(billingAddressActionCreator.updateAddress).toHaveBeenCalledWith({ email: 'foo@bar.com' }, undefined);
            expect(store.dispatch).toHaveBeenCalledWith(action, undefined);
        });
    });

    describe('#signInCustomer()', () => {
        it('dispatches action to sign in customer', async () => {
            const options = { methodId: getPaymentMethod().id };
            const action = Observable.of(createAction('SIGN_IN_CUSTOMER'));

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
            const action = Observable.of(createAction('SIGN_OUT_CUSTOMER'));

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
            const action = Observable.of(createAction('INITIALIZE_SHIPPING'));

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
            const action = Observable.of(createAction('DEINITIALIZE_SHIPPING'));

            jest.spyOn(shippingStrategyActionCreator, 'deinitialize')
                .mockReturnValue(action);

            jest.spyOn(store, 'dispatch');

            await checkoutService.deinitializeShipping(options);

            expect(shippingStrategyActionCreator.deinitialize).toHaveBeenCalledWith(options);
            expect(store.dispatch).toHaveBeenCalledWith(action, { queueId: 'shippingStrategy' });
        });
    });

    describe('#updateShippingAddress()', () => {
        it('dispatches action to update shipping address', async () => {
            const address = getShippingAddress();
            const options = { timeout: createTimeout() };
            const action = Observable.of(createAction('UPDATE_SHIPPING_ADDRESS'));

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
            const action = Observable.of(createAction('SELECT_SHIPPING_OPTION'));

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

            expect(checkoutClient.updateBillingAddress)
                .toHaveBeenCalledWith(getCheckout().id, address, options);
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
            const action = Observable.of(createAction('LOAD_INSTRUMENTS'));

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
            const action = Observable.of(createAction('DELETE_INSTRUMENT'));

            jest.spyOn(instrumentActionCreator, 'deleteInstrument')
                .mockReturnValue(action);

            jest.spyOn(store, 'dispatch');

            await checkoutService.deleteInstrument(instrumentId);

            expect(instrumentActionCreator.deleteInstrument).toHaveBeenCalledWith(instrumentId);
            expect(store.dispatch).toHaveBeenCalledWith(action, undefined);
        });
    });
});
