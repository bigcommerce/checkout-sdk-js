import { createAction } from '@bigcommerce/data-store';
import { createTimeout } from '@bigcommerce/request-sender';
import { merge, map } from 'lodash';
import { Observable } from 'rxjs';
import { BillingAddressActionCreator } from '../billing';
import { CartActionCreator } from '../cart';
import { ConfigActionCreator } from '../config';
import { CountryActionCreator } from '../geography';
import { CouponActionCreator, GiftCertificateActionCreator } from '../coupon';
import { createCustomerStrategyRegistry, CustomerStrategyActionCreator } from '../customer';
import { OrderActionCreator } from '../order';
import { PaymentMethodActionCreator, PaymentStrategyActionCreator } from '../payment';
import { InstrumentActionCreator } from '../payment/instrument';
import { QuoteActionCreator } from '../quote';
import { createShippingStrategyRegistry, ShippingCountryActionCreator, ShippingOptionActionCreator, ShippingStrategyActionCreator } from '../shipping';
import { getConfig, getConfigState } from '../config/configs.mock';
import { getBillingAddress, getBillingAddressResponseBody } from '../billing/internal-billing-addresses.mock';
import { getCartResponseBody } from '../cart/internal-carts.mock';
import { getCountriesResponseBody } from '../geography/countries.mock';
import { getCouponResponseBody } from '../coupon/internal-coupons.mock';
import { getCompleteOrderResponseBody, getOrderRequestBody, getSubmittedOrder } from '../order/internal-orders.mock';
import { getCustomerResponseBody, getGuestCustomer } from '../customer/internal-customers.mock';
import { getFormFields } from '../form/form.mocks';
import { getGiftCertificateResponseBody } from '../coupon/internal-gift-certificates.mock';
import { getQuoteResponseBody } from '../quote/internal-quotes.mock';
import { getAuthorizenet, getBraintree, getPaymentMethodResponseBody, getPaymentMethodsResponseBody, getPaymentMethod } from '../payment/payment-methods.mock';
import { getInstrumentsMeta, getVaultAccessTokenResponseBody, getInstrumentsResponseBody, vaultInstrumentRequestBody, vaultInstrumentResponseBody, deleteInstrumentResponseBody } from '../payment/instrument/instrument.mock';
import { getShippingAddress, getShippingAddressResponseBody } from '../shipping/internal-shipping-addresses.mock';
import { getShippingOptionResponseBody } from '../shipping/internal-shipping-options.mock';
import { getResponse } from '../common/http-request/responses.mock';
import createCheckoutStore from './create-checkout-store';
import CheckoutService from './checkout-service';
import CheckoutStoreSelector from './checkout-store-selector';
import CheckoutStoreErrorSelector from './checkout-store-error-selector';
import CheckoutStoreStatusSelector from './checkout-store-status-selector';

describe('CheckoutService', () => {
    let checkoutClient;
    let checkoutService;
    let customerStrategyRegistry;
    let paymentStrategy;
    let paymentStrategyRegistry;
    let shippingStrategyActionCreator;
    let store;

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
                Promise.resolve(getResponse(getCompleteOrderResponseBody()))
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

            loadCheckout: jest.fn(() =>
                Promise.resolve(getResponse(getQuoteResponseBody()))
            ),

            loadShippingCountries: jest.fn(() =>
                Promise.resolve(getResponse(getCountriesResponseBody()))
            ),

            signInCustomer: jest.fn(() =>
                Promise.resolve(getResponse(getCustomerResponseBody())),
            ),

            signOutCustomer: jest.fn(() =>
                Promise.resolve(getResponse(getCustomerResponseBody())),
            ),

            loadShippingOptions: jest.fn(() =>
                Promise.resolve(getResponse(getShippingOptionResponseBody())),
            ),

            updateBillingAddress: jest.fn(() =>
                Promise.resolve(getResponse(getBillingAddressResponseBody())),
            ),

            updateShippingAddress: jest.fn(() =>
                Promise.resolve(getResponse(getShippingAddressResponseBody())),
            ),

            selectShippingOption: jest.fn(() =>
                Promise.resolve(getResponse(getShippingOptionResponseBody())),
            ),

            applyCoupon: jest.fn(() =>
                Promise.resolve(getResponse(getCouponResponseBody()))
            ),

            removeCoupon: jest.fn(() =>
                Promise.resolve(getResponse(getCouponResponseBody()))
            ),

            applyGiftCertificate: jest.fn(() =>
                Promise.resolve(getResponse(getGiftCertificateResponseBody()))
            ),

            removeGiftCertificate: jest.fn(() =>
                Promise.resolve(getResponse(getGiftCertificateResponseBody()))
            ),

            getVaultAccessToken: jest.fn(() =>
                Promise.resolve(getResponse(getVaultAccessTokenResponseBody()))
            ),

            getInstruments: jest.fn(() =>
                Promise.resolve(getResponse(getInstrumentsResponseBody()))
            ),

            vaultInstrument: jest.fn(() =>
                Promise.resolve(getResponse(vaultInstrumentResponseBody()))
            ),

            deleteInstrument: jest.fn(() =>
                Promise.resolve(getResponse(deleteInstrumentResponseBody()))
            ),
        };

        store = createCheckoutStore({
            config: getConfigState(),
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

        shippingStrategyActionCreator = new ShippingStrategyActionCreator(
            createShippingStrategyRegistry(store, checkoutClient)
        );

        customerStrategyRegistry = createCustomerStrategyRegistry(store, checkoutClient);

        checkoutService = new CheckoutService(
            store,
            new BillingAddressActionCreator(checkoutClient),
            new CartActionCreator(checkoutClient),
            new ConfigActionCreator(checkoutClient),
            new CountryActionCreator(checkoutClient),
            new CouponActionCreator(checkoutClient),
            new CustomerStrategyActionCreator(customerStrategyRegistry),
            new GiftCertificateActionCreator(checkoutClient),
            new InstrumentActionCreator(checkoutClient),
            new OrderActionCreator(checkoutClient),
            new PaymentMethodActionCreator(checkoutClient),
            new PaymentStrategyActionCreator(paymentStrategyRegistry),
            new QuoteActionCreator(checkoutClient),
            new ShippingCountryActionCreator(checkoutClient),
            new ShippingOptionActionCreator(checkoutClient),
            shippingStrategyActionCreator
        );
    });

    describe('#getState()', () => {
        it('returns state', () => {
            expect(checkoutService.getState()).toEqual({
                checkout: expect.any(CheckoutStoreSelector),
                errors: expect.any(CheckoutStoreErrorSelector),
                statuses: expect.any(CheckoutStoreStatusSelector),
            });
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

            checkoutService.subscribe(subscriber, ({ checkout }) => checkout.getCart());
            subscriber.mockReset();

            await checkoutService.loadCart();
            await checkoutService.loadCart();

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
        it('loads quote data', async () => {
            const { checkout } = await checkoutService.loadCheckout();

            expect(checkoutClient.loadCheckout).toHaveBeenCalled();
            expect(checkout.getQuote()).toEqual(getQuoteResponseBody().data.quote);
        });
    });

    describe('#loadConfig()', () => {
        it('loads config data', async () => {
            const { checkout } = await checkoutService.loadConfig();

            expect(checkoutClient.loadConfig).toHaveBeenCalled();
            expect(checkout.getConfig()).toEqual(getConfig().storeConfig);
        });

        it('dispatches load config action with queue id', async () => {
            jest.spyOn(store, 'dispatch');

            await checkoutService.loadConfig();

            expect(store.dispatch).toHaveBeenCalledWith(expect.any(Observable), { queueId: 'config' });
        });
    });

    describe('#loadShippingAddressFields()', () => {
        it('loads config data', async () => {
            const { checkout } = await checkoutService.loadCheckout();
            const result = checkout.getShippingAddressFields();
            const expected = getFormFields();

            expect(map(result, 'id')).toEqual(map(expected, 'id'));
        });

        it('loads extra countries data', async () => {
            const { checkout } = await checkoutService.loadShippingAddressFields();

            expect(checkout.getShippingCountries()).toEqual(getCountriesResponseBody().data);
        });
    });

    describe('#loadBillingAddressFields()', () => {
        it('loads config data', async () => {
            const { checkout } = await checkoutService.loadCheckout();
            const result = checkout.getBillingAddressFields();
            const expected = getFormFields();

            expect(map(result, 'id')).toEqual(map(expected, 'id'));
        });

        it('loads extra countries data', async () => {
            const { checkout } = await checkoutService.loadBillingAddressFields();

            expect(checkout.getBillingCountries()).toEqual(getCountriesResponseBody().data);
        });
    });

    describe('#loadOrder()', () => {
        it('loads order data', async () => {
            const { checkout } = await checkoutService.loadOrder(295);

            expect(checkout.getOrder()).toEqual(getCompleteOrderResponseBody().data.order);
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
                { methodId: payload.payment.name, gatewayId: payload.payment.gateway }
            );
        });

        it('executes payment strategy with timeout', async () => {
            const payload = getOrderRequestBody();
            const options = { timeout: createTimeout() };

            await checkoutService.loadPaymentMethods();
            await checkoutService.submitOrder(payload, options);

            expect(paymentStrategy.execute).toHaveBeenCalledWith(
                payload,
                { ...options, methodId: payload.payment.name, gatewayId: payload.payment.gateway }
            );
        });
    });

    describe('#finalizeOrderIfNeeded()', () => {
        beforeEach(() => {
            jest.spyOn(checkoutClient, 'loadCheckout').mockReturnValue(
                Promise.resolve(getResponse(merge({}, getQuoteResponseBody(), {
                    data: { order: getSubmittedOrder() },
                })))
            );
        });

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
            const { checkout } = await checkoutService.loadPaymentMethods();

            expect(checkout.getPaymentMethods()).toEqual(getPaymentMethodsResponseBody().data.paymentMethods);
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
            const { checkout } = await checkoutService.loadPaymentMethod('authorizenet');

            expect(checkout.getPaymentMethod('authorizenet')).toEqual(getPaymentMethodResponseBody().data.paymentMethod);
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
            const { checkout } = await checkoutService.loadBillingCountries();

            expect(checkout.getBillingCountries()).toEqual(getCountriesResponseBody().data);
        });

        it('dispatches action with queue id', async () => {
            jest.spyOn(store, 'dispatch');

            await checkoutService.loadBillingCountries();

            expect(store.dispatch).toHaveBeenCalledWith(expect.any(Observable), { queueId: 'billingCountries' });
        });
    });

    describe('#loadShippingCountries()', () => {
        it('loads shipping countries data', async () => {
            const { checkout } = await checkoutService.loadShippingCountries();

            expect(checkout.getShippingCountries()).toEqual(getCountriesResponseBody().data);
        });

        it('dispatches action with queue id', async () => {
            jest.spyOn(store, 'dispatch');

            await checkoutService.loadShippingCountries();

            expect(store.dispatch).toHaveBeenCalledWith(expect.any(Observable), { queueId: 'shippingCountries' });
        });
    });

    describe('#initializeCustomer()', () => {
        it('finds customer strategy by id', async () => {
            const options = { methodId: getPaymentMethod().id };

            jest.spyOn(customerStrategyRegistry, 'get');

            await checkoutService.initializeCustomer(options);

            expect(customerStrategyRegistry.get).toHaveBeenCalledWith(options.methodId);
        });

        it('initializes default customer strategy if method id is not provided', async () => {
            const strategy = customerStrategyRegistry.get('default');
            const options = {};

            jest.spyOn(strategy, 'initialize');

            await checkoutService.initializeCustomer(options);

            expect(strategy.initialize).toHaveBeenCalledWith(options);
        });

        it('returns current state', async () => {
            const output = await checkoutService.initializeCustomer();

            expect(output).toEqual(checkoutService.getState());
        });
    });

    describe('#deinitializeCustomer()', () => {
        it('finds and uses customer strategy by id', async () => {
            const methodId = 'amazon';
            const strategy = customerStrategyRegistry.get(methodId);

            jest.spyOn(customerStrategyRegistry, 'get');
            jest.spyOn(strategy, 'deinitialize');

            await checkoutService.deinitializeCustomer({ methodId });

            expect(customerStrategyRegistry.get).toHaveBeenCalledWith(methodId);
            expect(strategy.deinitialize).toHaveBeenCalled();
        });

        it('uses default customer strategy by default', async () => {
            const strategy = customerStrategyRegistry.get('default');

            jest.spyOn(strategy, 'deinitialize');

            await checkoutService.deinitializeCustomer();

            expect(strategy.deinitialize).toHaveBeenCalled();
        });

        it('returns current state', async () => {
            const output = await checkoutService.deinitializeCustomer();

            expect(output).toEqual(checkoutService.getState());
        });
    });

    describe('#signInCustomer()', () => {
        it('finds customer strategy by id', async () => {
            const credentials = { email: 'foo@bar.com', password: 'foobar' };
            const options = { methodId: getPaymentMethod().id };

            jest.spyOn(customerStrategyRegistry, 'get');

            await checkoutService.signInCustomer(credentials, options);

            expect(customerStrategyRegistry.get).toHaveBeenCalledWith(options.methodId);
        });

        it('uses default customer strategy by default', async () => {
            const strategy = customerStrategyRegistry.get('default');
            const credentials = { email: 'foo@bar.com', password: 'foobar' };
            const options = {};

            jest.spyOn(strategy, 'signIn');

            await checkoutService.signInCustomer(credentials, options);

            expect(strategy.signIn).toHaveBeenCalledWith(credentials, options);
        });

        it('signs in customer', async () => {
            const credentials = { email: 'foo@bar.com', password: 'foobar' };
            const { checkout } = await checkoutService.signInCustomer(credentials);

            expect(checkout.getCustomer()).toEqual(getCustomerResponseBody().data.customer);
        });
    });

    describe('#signOutCustomer()', () => {
        it('finds customer strategy by id', async () => {
            const options = { methodId: getPaymentMethod().id };

            jest.spyOn(customerStrategyRegistry, 'get');

            await checkoutService.signOutCustomer(options);

            expect(customerStrategyRegistry.get).toHaveBeenCalledWith(options.methodId);
        });

        it('uses default customer strategy by default', async () => {
            const strategy = customerStrategyRegistry.get('default');
            const options = {};

            jest.spyOn(strategy, 'signOut');

            await checkoutService.signOutCustomer(options);

            expect(strategy.signOut).toHaveBeenCalledWith(options);
        });

        it('signs in customer', async () => {
            const { checkout } = await checkoutService.signOutCustomer();

            expect(checkout.getCustomer()).toEqual(getCustomerResponseBody().data.customer);
        });
    });

    describe('#loadShippingOptions()', () => {
        it('loads shipping options', async () => {
            const { checkout } = await checkoutService.loadShippingOptions();

            expect(checkout.getShippingOptions()).toEqual(getShippingOptionResponseBody().data.shippingOptions);
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

    describe('#updateShippingOption()', () => {
        it('dispatches action to select shipping option', async () => {
            const addressId = 'address-id-123';
            const shippingOptionId = 'shipping-option-id-456';
            const options = { timeout: createTimeout() };
            const action = Observable.of(createAction('SELECT_SHIPPING_OPTION'));

            jest.spyOn(shippingStrategyActionCreator, 'selectOption')
                .mockReturnValue(action);

            jest.spyOn(store, 'dispatch');

            await checkoutService.selectShippingOption(addressId, shippingOptionId, options);

            expect(shippingStrategyActionCreator.selectOption).toHaveBeenCalledWith(addressId, shippingOptionId, options);
            expect(store.dispatch).toHaveBeenCalledWith(action, { queueId: 'shippingStrategy' });
        });
    });

    describe('#updateBillingAddress()', () => {
        it('updates the billing address', async () => {
            const address = getBillingAddress();
            const options = { timeout: createTimeout() };
            await checkoutService.updateBillingAddress(address, options);

            expect(checkoutClient.updateBillingAddress)
                .toHaveBeenCalledWith(address, options);
        });
    });

    describe('#applyCoupon()', () => {
        it('applies a coupon', async () => {
            const code = 'myCoupon1234';
            const options = { timeout: createTimeout() };
            await checkoutService.applyCoupon(code, options);

            expect(checkoutClient.applyCoupon)
                .toHaveBeenCalledWith(code, options);
        });
    });

    describe('#removeCoupon()', () => {
        it('removes a coupon', async () => {
            const code = 'myCoupon1234';
            const options = { timeout: createTimeout() };
            await checkoutService.removeCoupon(code, options);

            expect(checkoutClient.removeCoupon)
                .toHaveBeenCalledWith(code, options);
        });
    });

    describe('#applyGiftCertificate()', () => {
        it('applies a gift certificate', async () => {
            const code = 'myGiftCertificate1234';
            const options = { timeout: createTimeout() };
            await checkoutService.applyGiftCertificate(code, options);

            expect(checkoutClient.applyGiftCertificate)
                .toHaveBeenCalledWith(code, options);
        });
    });

    describe('#removeGiftCertificate()', () => {
        it('removes a gift certificate', async () => {
            const code = 'myGiftCertificate1234';
            const options = { timeout: createTimeout() };
            await checkoutService.removeGiftCertificate(code, options);

            expect(checkoutClient.removeGiftCertificate)
                .toHaveBeenCalledWith(code, options);
        });
    });

    describe('#loadInstruments()', () => {
        it('loads instruments', async () => {
            const { storeId } = getConfig().storeConfig.storeProfile;
            const { customerId } = getGuestCustomer();
            const { vaultAccessToken } = getInstrumentsMeta();

            await checkoutService.signInCustomer();
            await checkoutService.loadInstruments();

            expect(checkoutClient.getInstruments)
                .toHaveBeenCalledWith({ storeId, customerId, vaultAccessToken });
        });
    });

    describe('#vaultInstrument()', () => {
        it('vaults an instrument', async () => {
            const instrument = vaultInstrumentRequestBody();
            const { storeId } = getConfig().storeConfig.storeProfile;
            const { customerId } = getGuestCustomer();
            const { vaultAccessToken } = getInstrumentsMeta();

            await checkoutService.signInCustomer();
            await checkoutService.vaultInstrument(instrument);

            expect(checkoutClient.vaultInstrument)
                .toHaveBeenCalledWith({ storeId, customerId, vaultAccessToken }, instrument);
        });
    });

    describe('#deleteInstrument()', () => {
        it('deletes an instrument', async () => {
            const instrumentId = '456';
            const { storeId } = getConfig().storeConfig.storeProfile;
            const { customerId } = getGuestCustomer();
            const { vaultAccessToken } = getInstrumentsMeta();

            await checkoutService.signInCustomer();
            await checkoutService.deleteInstrument(instrumentId);

            expect(checkoutClient.deleteInstrument)
                .toHaveBeenCalledWith({ storeId, customerId, vaultAccessToken }, instrumentId);
        });
    });
});
