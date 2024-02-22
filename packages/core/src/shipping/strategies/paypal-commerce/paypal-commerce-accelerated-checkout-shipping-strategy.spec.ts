import { createRequestSender } from '@bigcommerce/request-sender';

import { Cart, Customer } from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getBillingAddress,
    getCart,
    getCustomer,
    getShippingAddress,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';
import {
    createPayPalCommerceAcceleratedCheckoutUtils,
    createPayPalCommerceSdk,
    getPayPalAxoSdk,
    getPayPalCommerceAcceleratedCheckoutPaymentMethod,
    getPayPalConnectAuthenticationResultMock,
    PayPalAxoSdk,
    PayPalCommerceAcceleratedCheckoutUtils,
    PayPalCommerceSdk,
} from '@bigcommerce/checkout-sdk/paypal-commerce-utils';

import { BillingAddress, BillingAddressActionCreator } from '../../../billing';
import BillingAddressRequestSender from '../../../billing/billing-address-request-sender';
import { CheckoutRequestSender, CheckoutStore, createCheckoutStore } from '../../../checkout';
import { InvalidArgumentError } from '../../../common/error/errors';
import {
    PaymentMethod,
    PaymentMethodActionCreator,
    PaymentMethodRequestSender,
} from '../../../payment';
import { PaymentProviderCustomerActionCreator } from '../../../payment-provider-customer';
import { SubscriptionsActionCreator, SubscriptionsRequestSender } from '../../../subscription';
import ConsignmentActionCreator from '../../consignment-action-creator';
import ConsignmentRequestSender from '../../consignment-request-sender';
import { getFlatRateOption } from '../../internal-shipping-options.mock';

import PayPalCommerceAcceleratedCheckoutShippingStrategy from './paypal-commerce-accelerated-checkout-shipping-strategy';

describe('PayPalCommerceAcceleratedCheckoutShippingStrategy', () => {
    let billingAddressActionCreator: BillingAddressActionCreator;
    let billingAddress: BillingAddress;
    let cart: Cart;
    let consignmentActionCreator: ConsignmentActionCreator;
    let customer: Customer;
    let paymentMethodActionCreator: PaymentMethodActionCreator;
    let paymentMethod: PaymentMethod;
    let paymentProviderCustomerActionCreator: PaymentProviderCustomerActionCreator;
    let paypalAxoSdk: PayPalAxoSdk;
    let paypalCommerceSdk: PayPalCommerceSdk;
    let paypalCommerceAcceleratedCheckoutUtils: PayPalCommerceAcceleratedCheckoutUtils;
    let store: CheckoutStore;
    let strategy: PayPalCommerceAcceleratedCheckoutShippingStrategy;

    const methodId = 'paypalcommerceacceleratedcheckout';
    const initializationOptions = { methodId };

    const authenticationResultMock = getPayPalConnectAuthenticationResultMock();
    const customerContextId = 'asd123';
    const requestSender = createRequestSender();

    const bcAddressMock = {
        id: 'asd333',
        address1: 'addressLine1',
        address2: 'addressLine2',
        city: 'addressCity',
        company: 'BigCommerce',
        countryCode: 'US',
        customFields: [],
        firstName: 'John',
        lastName: 'Doe',
        phone: '333333333333',
        postalCode: '03004',
        stateOrProvince: 'addressState',
        stateOrProvinceCode: 'addressState',
    };

    const bcInstrumentMock = {
        bigpayToken: 'nonce/token',
        brand: 'Visa',
        defaultInstrument: false,
        expiryMonth: '12',
        expiryYear: '2030',
        iin: '',
        last4: '1111',
        method: 'paypalcommerceacceleratedcheckout',
        provider: 'paypalcommerceacceleratedcheckout',
        trustedShippingAddress: false,
        type: 'card',
    };

    beforeEach(() => {
        billingAddress = getBillingAddress();
        cart = getCart();
        customer = getCustomer();
        paymentMethod = getPayPalCommerceAcceleratedCheckoutPaymentMethod();
        paypalAxoSdk = getPayPalAxoSdk();

        store = createCheckoutStore();
        billingAddressActionCreator = new BillingAddressActionCreator(
            new BillingAddressRequestSender(requestSender),
            new SubscriptionsActionCreator(new SubscriptionsRequestSender(requestSender)),
        );
        consignmentActionCreator = new ConsignmentActionCreator(
            new ConsignmentRequestSender(requestSender),
            new CheckoutRequestSender(requestSender),
        );
        paymentMethodActionCreator = new PaymentMethodActionCreator(
            new PaymentMethodRequestSender(requestSender),
        );
        paymentProviderCustomerActionCreator = new PaymentProviderCustomerActionCreator();
        paypalCommerceSdk = createPayPalCommerceSdk();
        paypalCommerceAcceleratedCheckoutUtils = createPayPalCommerceAcceleratedCheckoutUtils();

        strategy = new PayPalCommerceAcceleratedCheckoutShippingStrategy(
            store,
            billingAddressActionCreator,
            consignmentActionCreator,
            paymentMethodActionCreator,
            paymentProviderCustomerActionCreator,
            paypalCommerceSdk,
            paypalCommerceAcceleratedCheckoutUtils,
        );

        jest.spyOn(store.getState().cart, 'getCartOrThrow').mockReturnValue(cart);
        jest.spyOn(store.getState().customer, 'getCustomer').mockReturnValue(customer);
        jest.spyOn(store.getState().billingAddress, 'getBillingAddress').mockReturnValue(
            billingAddress,
        );
        jest.spyOn(
            store.getState().paymentProviderCustomer,
            'getPaymentProviderCustomerOrThrow',
        ).mockReturnValue({});
        jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow').mockReturnValue(
            paymentMethod,
        );

        jest.spyOn(billingAddressActionCreator, 'updateAddress').mockImplementation(() =>
            jest.fn(),
        );
        jest.spyOn(consignmentActionCreator, 'updateAddress').mockImplementation(() => jest.fn());
        jest.spyOn(consignmentActionCreator, 'selectShippingOption').mockImplementation(() =>
            jest.fn(),
        );
        jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod').mockReturnValue(paymentMethod);

        jest.spyOn(paypalCommerceSdk, 'getPayPalAxo').mockImplementation(() => paypalAxoSdk);

        jest.spyOn(
            paypalCommerceAcceleratedCheckoutUtils,
            'initializePayPalConnect',
        ).mockImplementation(() => jest.fn());
        jest.spyOn(paypalCommerceAcceleratedCheckoutUtils, 'getStorageSessionId').mockReturnValue(
            cart.id,
        );
        jest.spyOn(
            paypalCommerceAcceleratedCheckoutUtils,
            'updateStorageSessionId',
        ).mockImplementation(() => jest.fn());
        jest.spyOn(
            paypalCommerceAcceleratedCheckoutUtils,
            'lookupCustomerOrThrow',
        ).mockImplementation(() => ({ customerContextId }));
        jest.spyOn(
            paypalCommerceAcceleratedCheckoutUtils,
            'triggerAuthenticationFlowOrThrow',
        ).mockImplementation(() => authenticationResultMock);
        jest.spyOn(
            paypalCommerceAcceleratedCheckoutUtils,
            'mapPayPalConnectProfileToBcCustomerData',
        ).mockImplementation(() => ({
            authenticationState: authenticationResultMock.authenticationState,
            addresses: [bcAddressMock],
            billingAddress: bcAddressMock,
            shippingAddress: bcAddressMock,
            instruments: [bcInstrumentMock],
        }));

        jest.spyOn(
            paymentProviderCustomerActionCreator,
            'updatePaymentProviderCustomer',
        ).mockImplementation(() => jest.fn());
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('#updateAddress()', () => {
        it('updates shipping address', async () => {
            const address = getShippingAddress();
            const options = {};

            await strategy.updateAddress(address, options);

            expect(consignmentActionCreator.updateAddress).toHaveBeenCalledWith(address, options);
        });
    });

    describe('selectOption', () => {
        it('selects shipping option', async () => {
            const method = getFlatRateOption();
            const options = {};

            await strategy.selectOption(method.id, options);

            expect(consignmentActionCreator.selectShippingOption).toHaveBeenCalledWith(
                method.id,
                options,
            );
        });
    });

    describe('deinitialize', () => {
        it('deinitialize shipping strategy', async () => {
            jest.spyOn(store, 'getState').mockReturnValue('storeState');

            expect(await strategy.deinitialize()).toBe('storeState');
        });
    });

    describe('initialize', () => {
        it('throws an error if method id is not provided', async () => {
            try {
                await strategy.initialize({ methodId: '' });
            } catch (error: unknown) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('does not load payment method if accelerated checkout feature is disabled', async () => {
            jest.spyOn(
                store.getState().paymentProviderCustomer,
                'getPaymentProviderCustomerOrThrow',
            ).mockReturnValue({});

            jest.spyOn(
                paypalCommerceAcceleratedCheckoutUtils,
                'getStorageSessionId',
            ).mockReturnValue(undefined);

            await strategy.initialize(initializationOptions);

            expect(paymentMethodActionCreator.loadPaymentMethod).not.toHaveBeenCalled();
        });

        it('authenticates user with paypal connect', async () => {
            await strategy.initialize(initializationOptions);

            expect(paymentMethodActionCreator.loadPaymentMethod).toHaveBeenCalledWith(methodId);
            expect(paypalCommerceSdk.getPayPalAxo).toHaveBeenCalledWith(
                paymentMethod,
                cart.currency.code,
                cart.id,
            );
            expect(
                paypalCommerceAcceleratedCheckoutUtils.initializePayPalConnect,
            ).toHaveBeenCalledWith(
                paypalAxoSdk,
                paymentMethod.initializationData.isDeveloperModeApplicable,
                undefined,
            );
            expect(
                paypalCommerceAcceleratedCheckoutUtils.lookupCustomerOrThrow,
            ).toHaveBeenCalledWith(customer.email);
            expect(
                paypalCommerceAcceleratedCheckoutUtils.triggerAuthenticationFlowOrThrow,
            ).toHaveBeenCalledWith(customerContextId);
            expect(
                paypalCommerceAcceleratedCheckoutUtils.mapPayPalConnectProfileToBcCustomerData,
            ).toHaveBeenCalledWith(methodId, authenticationResultMock);
            expect(
                paymentProviderCustomerActionCreator.updatePaymentProviderCustomer,
            ).toHaveBeenCalledWith({
                authenticationState: authenticationResultMock.authenticationState,
                addresses: [bcAddressMock],
                instruments: [bcInstrumentMock],
            });
            expect(
                paypalCommerceAcceleratedCheckoutUtils.updateStorageSessionId,
            ).toHaveBeenCalledWith(false, cart.id);
            expect(billingAddressActionCreator.updateAddress).toHaveBeenCalledWith(bcAddressMock);
            expect(billingAddressActionCreator.updateAddress).toHaveBeenCalledWith(bcAddressMock);
        });
    });
});
