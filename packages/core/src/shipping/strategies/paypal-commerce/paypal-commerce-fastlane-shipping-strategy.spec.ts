import { createRequestSender } from '@bigcommerce/request-sender';

import { Cart, Customer, StoreConfig } from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getBillingAddress,
    getCart,
    getConfig,
    getCustomer,
    getShippingAddress,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';
import {
    createPayPalCommerceFastlaneUtils,
    createPayPalCommerceSdk,
    getPayPalCommerceAcceleratedCheckoutPaymentMethod,
    getPayPalFastlane,
    getPayPalFastlaneAuthenticationResultMock,
    getPayPalFastlaneSdk,
    PayPalCommerceFastlaneUtils,
    PayPalCommerceSdk,
    PayPalFastlaneAuthenticationState,
    PayPalFastlaneSdk,
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

import PayPalCommerceFastlaneShippingStrategy from './paypal-commerce-fastlane-shipping-strategy';

describe('PayPalCommerceFastlaneShippingStrategy', () => {
    let billingAddressActionCreator: BillingAddressActionCreator;
    let billingAddress: BillingAddress;
    let cart: Cart;
    let consignmentActionCreator: ConsignmentActionCreator;
    let customer: Customer;
    let paymentMethodActionCreator: PaymentMethodActionCreator;
    let paymentMethod: PaymentMethod;
    let paymentProviderCustomerActionCreator: PaymentProviderCustomerActionCreator;
    let paypalFastlaneSdk: PayPalFastlaneSdk;
    let paypalCommerceSdk: PayPalCommerceSdk;
    let paypalCommerceFastlaneUtils: PayPalCommerceFastlaneUtils;
    let store: CheckoutStore;
    let storeConfig: StoreConfig;
    let strategy: PayPalCommerceFastlaneShippingStrategy;

    const methodId = 'paypalcommerceacceleratedcheckout';
    const initializationOptions = { methodId };
    const authenticationResultMock = getPayPalFastlaneAuthenticationResultMock();
    const customerContextId = 'asd123';
    const paypalFastlane = getPayPalFastlane();
    const shippingAddresses = [getShippingAddress()];

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
        customer = { ...getCustomer(), isGuest: true };
        storeConfig = getConfig().storeConfig;
        paymentMethod = getPayPalCommerceAcceleratedCheckoutPaymentMethod();
        paypalFastlaneSdk = getPayPalFastlaneSdk();

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
        paypalCommerceFastlaneUtils = createPayPalCommerceFastlaneUtils();

        strategy = new PayPalCommerceFastlaneShippingStrategy(
            store,
            billingAddressActionCreator,
            consignmentActionCreator,
            paymentMethodActionCreator,
            paymentProviderCustomerActionCreator,
            paypalCommerceSdk,
            paypalCommerceFastlaneUtils,
        );

        jest.spyOn(store.getState().cart, 'getCartOrThrow').mockReturnValue(cart);
        jest.spyOn(store.getState().config, 'getStoreConfigOrThrow').mockReturnValue(storeConfig);
        jest.spyOn(store.getState().customer, 'getCustomerOrThrow').mockReturnValue(customer);
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
        jest.spyOn(store.getState().shippingAddress, 'getShippingAddressesOrThrow').mockReturnValue(
            shippingAddresses,
        );

        jest.spyOn(billingAddressActionCreator, 'updateAddress').mockImplementation(() =>
            jest.fn(),
        );
        jest.spyOn(consignmentActionCreator, 'updateAddress').mockImplementation(() => jest.fn());
        jest.spyOn(consignmentActionCreator, 'selectShippingOption').mockImplementation(() =>
            jest.fn(),
        );
        jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod').mockReturnValue(paymentMethod);

        jest.spyOn(paypalCommerceSdk, 'getPayPalFastlaneSdk').mockImplementation(
            () => paypalFastlaneSdk,
        );
        jest.spyOn(paypalCommerceFastlaneUtils, 'initializePayPalFastlane').mockImplementation(
            jest.fn(),
        );
        jest.spyOn(paypalCommerceFastlaneUtils, 'getPayPalFastlaneOrThrow').mockImplementation(
            () => paypalFastlane,
        );
        jest.spyOn(paypalCommerceFastlaneUtils, 'getStorageSessionId').mockReturnValue(cart.id);
        jest.spyOn(paypalCommerceFastlaneUtils, 'updateStorageSessionId').mockImplementation(() =>
            jest.fn(),
        );
        jest.spyOn(paypalCommerceFastlaneUtils, 'lookupCustomerOrThrow').mockImplementation(() => ({
            customerContextId,
        }));
        jest.spyOn(
            paypalCommerceFastlaneUtils,
            'triggerAuthenticationFlowOrThrow',
        ).mockImplementation(() => authenticationResultMock);
        jest.spyOn(
            paypalCommerceFastlaneUtils,
            'mapPayPalFastlaneProfileToBcCustomerData',
        ).mockImplementation(() => ({
            authenticationState: authenticationResultMock.authenticationState,
            addresses: [bcAddressMock],
            billingAddress: bcAddressMock,
            shippingAddress: bcAddressMock,
            instruments: [bcInstrumentMock],
        }));
        jest.spyOn(paypalCommerceFastlaneUtils, 'mapPayPalToBcAddress').mockImplementation(
            () => bcAddressMock,
        );
        jest.spyOn(paypalCommerceFastlaneUtils, 'filterAddresses').mockImplementation(() => [
            bcAddressMock,
        ]);

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
                await strategy.initialize({});
            } catch (error: unknown) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('does not trigger with Fastlane flow for store members', async () => {
            const guestCustomer = {
                ...customer,
                isGuest: false,
            };

            jest.spyOn(store.getState().customer, 'getCustomerOrThrow').mockReturnValue(
                guestCustomer,
            );

            await strategy.initialize(initializationOptions);

            expect(paymentMethodActionCreator.loadPaymentMethod).not.toHaveBeenCalled();
            expect(paypalCommerceFastlaneUtils.initializePayPalFastlane).not.toHaveBeenCalled();
        });

        it('does not load payment method if accelerated checkout feature is disabled', async () => {
            jest.spyOn(
                store.getState().paymentProviderCustomer,
                'getPaymentProviderCustomerOrThrow',
            ).mockReturnValue({});

            jest.spyOn(paypalCommerceFastlaneUtils, 'getStorageSessionId').mockReturnValue(
                undefined,
            );

            await strategy.initialize(initializationOptions);

            expect(paymentMethodActionCreator.loadPaymentMethod).not.toHaveBeenCalled();
        });

        it('initializes paypal sdk and authenticates user with paypal fastlane', async () => {
            paymentMethod.initializationData.isFastlaneEnabled = true;

            await strategy.initialize(initializationOptions);

            expect(paymentMethodActionCreator.loadPaymentMethod).toHaveBeenCalledWith(methodId);
            expect(paypalCommerceSdk.getPayPalFastlaneSdk).toHaveBeenCalledWith(
                paymentMethod,
                cart.currency.code,
                cart.id,
            );
            expect(paypalCommerceFastlaneUtils.initializePayPalFastlane).toHaveBeenCalledWith(
                paypalFastlaneSdk,
                paymentMethod.initializationData.isDeveloperModeApplicable,
                undefined,
            );
            expect(paypalCommerceFastlaneUtils.lookupCustomerOrThrow).toHaveBeenCalledWith(
                customer.email,
            );
            expect(
                paypalCommerceFastlaneUtils.triggerAuthenticationFlowOrThrow,
            ).toHaveBeenCalledWith(customerContextId);
            expect(
                paypalCommerceFastlaneUtils.mapPayPalFastlaneProfileToBcCustomerData,
            ).toHaveBeenCalledWith(methodId, authenticationResultMock);
            expect(
                paymentProviderCustomerActionCreator.updatePaymentProviderCustomer,
            ).toHaveBeenCalledWith({
                authenticationState: authenticationResultMock.authenticationState,
                addresses: [bcAddressMock],
                instruments: [bcInstrumentMock],
            });
            expect(paypalCommerceFastlaneUtils.updateStorageSessionId).toHaveBeenCalledWith(
                false,
                cart.id,
            );
            expect(billingAddressActionCreator.updateAddress).toHaveBeenCalledWith(bcAddressMock);
        });

        it('does not authenticate user if the authentication was canceled before', async () => {
            jest.spyOn(
                store.getState().paymentProviderCustomer,
                'getPaymentProviderCustomerOrThrow',
            ).mockReturnValue({
                authenticationState: PayPalFastlaneAuthenticationState.CANCELED,
            });

            jest.spyOn(paypalCommerceFastlaneUtils, 'getStorageSessionId').mockReturnValue(cart.id);

            await strategy.initialize(initializationOptions);

            expect(paymentMethodActionCreator.loadPaymentMethod).not.toHaveBeenCalled();
            expect(paypalCommerceFastlaneUtils.initializePayPalFastlane).not.toHaveBeenCalled();
            expect(paypalCommerceFastlaneUtils.lookupCustomerOrThrow).not.toHaveBeenCalled();
        });

        it('does not authenticate user if it was authenticated before', async () => {
            jest.spyOn(
                store.getState().paymentProviderCustomer,
                'getPaymentProviderCustomerOrThrow',
            ).mockReturnValue({
                authenticationState: PayPalFastlaneAuthenticationState.SUCCEEDED,
                addresses: [bcAddressMock],
                instruments: [bcInstrumentMock],
            });

            jest.spyOn(paypalCommerceFastlaneUtils, 'getStorageSessionId').mockReturnValue(cart.id);

            await strategy.initialize(initializationOptions);

            expect(paypalCommerceFastlaneUtils.lookupCustomerOrThrow).not.toHaveBeenCalled();
        });

        it('does not provide PayPal Shipping selector method if onPayPalFastlaneAddressChange is not a function', async () => {
            jest.spyOn(
                store.getState().paymentProviderCustomer,
                'getPaymentProviderCustomerOrThrow',
            ).mockReturnValue({
                authenticationState: PayPalFastlaneAuthenticationState.SUCCEEDED,
                addresses: [bcAddressMock],
                instruments: [bcInstrumentMock],
            });

            await strategy.initialize({
                ...initializationOptions,
                paypalcommercefastlane: {
                    onPayPalFastlaneAddressChange: undefined,
                },
            });

            expect(paymentMethodActionCreator.loadPaymentMethod).not.toHaveBeenCalled();
            expect(paypalCommerceFastlaneUtils.initializePayPalFastlane).not.toHaveBeenCalled();
        });

        it('initializes paypal sdk and provides PayPal Shipping selector method to onPayPalFastlaneAddressChange callback', async () => {
            const onPayPalFastlaneAddressChange = jest.fn();

            jest.spyOn(
                store.getState().paymentProviderCustomer,
                'getPaymentProviderCustomerOrThrow',
            ).mockReturnValue({
                authenticationState: PayPalFastlaneAuthenticationState.SUCCEEDED,
                addresses: [bcAddressMock],
                instruments: [bcInstrumentMock],
            });

            jest.spyOn(store.getState().config, 'getStoreConfigOrThrow').mockReturnValue({
                ...storeConfig,
                checkoutSettings: {
                    ...storeConfig.checkoutSettings,
                    features: {
                        ...storeConfig.checkoutSettings.features,
                        'PAYPAL-3996.paypal_fastlane_shipping_update': true,
                    },
                },
            });

            await strategy.initialize({
                ...initializationOptions,
                paypalcommercefastlane: {
                    onPayPalFastlaneAddressChange,
                },
            });

            expect(paymentMethodActionCreator.loadPaymentMethod).toHaveBeenCalled();
            expect(paypalCommerceFastlaneUtils.initializePayPalFastlane).toHaveBeenCalled();
            expect(onPayPalFastlaneAddressChange).toHaveBeenCalled();
        });

        it('updates shipping address with PayPal Shipping selector', async () => {
            const onPayPalFastlaneAddressChange = jest.fn((showPayPalFastlaneAddressSelector) => {
                showPayPalFastlaneAddressSelector();
            });

            jest.spyOn(
                store.getState().paymentProviderCustomer,
                'getPaymentProviderCustomerOrThrow',
            ).mockReturnValue({
                authenticationState: PayPalFastlaneAuthenticationState.SUCCEEDED,
                addresses: [bcAddressMock],
                instruments: [bcInstrumentMock],
            });

            jest.spyOn(store.getState().config, 'getStoreConfigOrThrow').mockReturnValue({
                ...storeConfig,
                checkoutSettings: {
                    ...storeConfig.checkoutSettings,
                    features: {
                        ...storeConfig.checkoutSettings.features,
                        'PAYPAL-3996.paypal_fastlane_shipping_update': true,
                    },
                },
            });

            jest.spyOn(paypalFastlane.profile, 'showShippingAddressSelector').mockImplementation(
                () => ({
                    selectionChanged: true,
                    selectedAddress: authenticationResultMock.profileData.shippingAddress,
                }),
            );

            await strategy.initialize({
                ...initializationOptions,
                paypalcommercefastlane: {
                    onPayPalFastlaneAddressChange,
                },
            });

            expect(paypalFastlane.profile.showShippingAddressSelector).toHaveBeenCalled();
            expect(paypalCommerceFastlaneUtils.mapPayPalToBcAddress).toHaveBeenCalledWith(
                authenticationResultMock.profileData.shippingAddress.address,
                authenticationResultMock.profileData.shippingAddress.name,
                authenticationResultMock.profileData.shippingAddress.phoneNumber,
                shippingAddresses[0].customFields,
            );
            expect(paypalCommerceFastlaneUtils.filterAddresses).toHaveBeenCalledWith([
                bcAddressMock,
            ]);
            expect(
                paymentProviderCustomerActionCreator.updatePaymentProviderCustomer,
            ).toHaveBeenCalledWith({
                addresses: [bcAddressMock],
            });
            expect(consignmentActionCreator.updateAddress).toHaveBeenCalledWith(bcAddressMock);
        });
    });
});
