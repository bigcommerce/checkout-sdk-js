import {
    BraintreeFastlaneAuthenticationState,
    BraintreeIntegrationService,
    getBraintreeFastlaneAuthenticationResultMock,
    getBraintreeFastlaneProfileDataMock,
    getFastlaneMock,
} from '@bigcommerce/checkout-sdk/braintree-utils';
import { PaymentMethod } from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getBillingAddress,
    getCart,
    getConfig,
    getCountries,
    getCustomer,
    getPaymentMethod,
    getShippingAddress,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';
import { BrowserStorage } from '@bigcommerce/checkout-sdk/storage';

import { BillingAddressActionCreator } from '../../../billing';
import { CheckoutStore, createCheckoutStore } from '../../../checkout';
import { InvalidArgumentError } from '../../../common/error/errors';
import { PaymentMethodActionCreator } from '../../../payment';
import { PaymentProviderCustomerActionCreator } from '../../../payment-provider-customer';
import ConsignmentActionCreator from '../../consignment-action-creator';
import { getFlatRateOption } from '../../internal-shipping-options.mock';

import BraintreeFastlaneShippingStrategy from './braintree-fastlane-shipping-strategy';

const BRAINTREE_AXO_METHOD_ID = 'braintreeacceleratedcheckout';

class PaymentMethodActionCreatorMock {
    loadPaymentMethod(methodId: string): PaymentMethod | undefined {
        return {
            ...getPaymentMethod(),
            id: methodId,
        };
    }
}

class PaymentProviderCustomerActionCreatorMock {
    updatePaymentProviderCustomer() {}
}

class BraintreeIntegrationServiceMock {
    initialize() {}
    getBraintreeFastlane() {}
}

class BillingAddressActionCreatorMock {
    updateAddress() {}
}

class ConsignmentActionCreatorMock {
    updateAddress() {}
    selectShippingOption() {}
}

describe('BraintreeFastlaneShippingStrategy', () => {
    let store: CheckoutStore;
    let billingAddressActionCreator: BillingAddressActionCreatorMock;
    let consignmentActionCreator: ConsignmentActionCreatorMock;
    let paymentMethodActionCreator: PaymentMethodActionCreatorMock;
    let paymentProviderCustomerActionCreator: PaymentProviderCustomerActionCreatorMock;
    let braintreeIntegrationServiceMock: BraintreeIntegrationServiceMock;
    const defaultOptions = {
        methodId: BRAINTREE_AXO_METHOD_ID,
    };
    const mappedAddress = {
        id: 123123,
        type: 'paypal-address',
        firstName: 'John',
        lastName: 'Doe',
        company: '',
        address1: 'Hello World Address',
        address2: '',
        city: 'Bellingham',
        stateOrProvince: 'WA',
        stateOrProvinceCode: 'WA',
        country: 'United States',
        countryCode: 'US',
        postalCode: '98225',
        phone: '14085551234',
        customFields: [],
    };
    const braintreeFastlane = getFastlaneMock();
    const mappedBillingAddress = {
        ...mappedAddress,
        id: '123123',
    };

    const mappedInstrument = {
        bigpayToken: 'pp-vaulted-instrument-id',
        brand: 'VISA',
        defaultInstrument: false,
        expiryMonth: undefined,
        expiryYear: '02/2037',
        iin: '',
        last4: '1111',
        method: 'braintreeacceleratedcheckout',
        provider: 'braintreeacceleratedcheckout',
        trustedShippingAddress: false,
        type: 'card',
        untrustedShippingCardVerificationMode: 'cvv',
    };

    const createStrategy = () => {
        return new BraintreeFastlaneShippingStrategy(
            store,
            billingAddressActionCreator as unknown as BillingAddressActionCreator,
            consignmentActionCreator as unknown as ConsignmentActionCreator,
            paymentMethodActionCreator as unknown as PaymentMethodActionCreator,
            paymentProviderCustomerActionCreator as unknown as PaymentProviderCustomerActionCreator,
            braintreeIntegrationServiceMock as unknown as BraintreeIntegrationService,
        );
    };

    beforeEach(() => {
        store = createCheckoutStore();
        paymentMethodActionCreator = new PaymentMethodActionCreatorMock();
        paymentProviderCustomerActionCreator = new PaymentProviderCustomerActionCreatorMock();
        braintreeIntegrationServiceMock = new BraintreeIntegrationServiceMock();
        jest.spyOn(store, 'dispatch').mockImplementation((args) => args);
        billingAddressActionCreator = new BillingAddressActionCreatorMock();
        consignmentActionCreator = new ConsignmentActionCreatorMock();

        jest.spyOn(store.getState().cart, 'getCart').mockReturnValue(getCart());
        jest.spyOn(store.getState().cart, 'getCartOrThrow').mockReturnValue(getCart());
        jest.spyOn(store.getState().countries, 'getCountries').mockReturnValue(getCountries());
        jest.spyOn(store.getState().config, 'getStoreConfigOrThrow').mockReturnValue(
            getConfig().storeConfig,
        );
        jest.spyOn(store.getState().customer, 'getCustomerOrThrow').mockReturnValue({
            ...getCustomer(),
            isGuest: true,
        });
        jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow').mockReturnValue({
            clientToken: 'clientToken',
        });
        jest.spyOn(store.getState().billingAddress, 'getBillingAddress').mockReturnValue(
            getBillingAddress(),
        );
        jest.spyOn(BrowserStorage.prototype, 'getItem').mockReturnValue(getCart().id);
        jest.spyOn(BrowserStorage.prototype, 'removeItem').mockImplementation(jest.fn());
        jest.spyOn(braintreeIntegrationServiceMock, 'getBraintreeFastlane').mockReturnValue({
            identity: {
                lookupCustomerByEmail: () => ({ customerContextId: 'customerContextId' }),
                triggerAuthenticationFlow: () =>
                    Promise.resolve({
                        authenticationState: 'authenticationState',
                        profileData: getBraintreeFastlaneProfileDataMock(),
                    }),
            },
        });

        jest.spyOn(Date, 'now').mockImplementation(() => mappedAddress.id);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('updateAddress', () => {
        it('updates shipping address', async () => {
            const address = getShippingAddress();
            const options = {};
            const updateAction = jest.fn();

            jest.spyOn(consignmentActionCreator, 'updateAddress').mockImplementation(updateAction);

            const strategy = createStrategy();

            await strategy.updateAddress(address, options);

            expect(updateAction).toHaveBeenCalledWith(address, options);
        });
    });

    describe('selectOption', () => {
        it('selects shipping option', async () => {
            const method = getFlatRateOption();
            const options = {};
            const updateAction = jest.fn();

            jest.spyOn(consignmentActionCreator, 'selectShippingOption').mockImplementation(
                updateAction,
            );

            const strategy = createStrategy();

            await strategy.selectOption(method.id, options);

            expect(consignmentActionCreator.selectShippingOption).toHaveBeenCalledWith(
                method.id,
                options,
            );
            expect(updateAction).toHaveBeenCalledWith(method.id, options);
        });
    });

    describe('deinitialize', () => {
        it('deinitialize shilling strategy', async () => {
            jest.spyOn(store, 'getState').mockReturnValue('storeState');

            const strategy = createStrategy();

            expect(await strategy.deinitialize()).toBe('storeState');
        });
    });

    describe('initialize', () => {
        it('throws an error if no method Id in options', async () => {
            const strategy = createStrategy();
            const response = strategy.initialize({});

            return expect(response).rejects.toThrow(InvalidArgumentError);
        });

        it('should not run authentication flow if OTP was already shown', async () => {
            const loadPaymentMethodMock = jest.fn();

            jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod').mockImplementation(
                loadPaymentMethodMock,
            );
            jest.spyOn(
                store.getState().paymentProviderCustomer,
                'getPaymentProviderCustomer',
            ).mockReturnValue({
                authenticationState: 'anyState',
            });

            const strategy = createStrategy();

            await strategy.initialize(defaultOptions);

            expect(loadPaymentMethodMock).not.toHaveBeenCalled();
        });

        it('should not run authentication flow if the OPT window was canceled/closed before', async () => {
            const loadPaymentMethodMock = jest.fn();

            jest.spyOn(
                store.getState().paymentProviderCustomer,
                'getPaymentProviderCustomer',
            ).mockReturnValue({
                authenticationState: BraintreeFastlaneAuthenticationState.CANCELED,
                addresses: [],
                instruments: [],
            });

            const strategy = createStrategy();

            await strategy.initialize(defaultOptions);

            expect(loadPaymentMethodMock).not.toHaveBeenCalled();
        });

        it('gets braintree fastlane instead of connect if fastlane enabled', async () => {
            const strategy = createStrategy();

            await strategy.initialize(defaultOptions);

            braintreeIntegrationServiceMock.initialize();

            expect(braintreeIntegrationServiceMock.getBraintreeFastlane).toHaveBeenCalled();
        });

        it('should not run authentication flow if PayPal session id is different', async () => {
            const loadPaymentMethodMock = jest.fn();

            jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod').mockImplementation(
                loadPaymentMethodMock,
            );
            jest.spyOn(
                store.getState().paymentProviderCustomer,
                'getPaymentProviderCustomer',
            ).mockReturnValue(undefined);
            jest.spyOn(BrowserStorage.prototype, 'getItem').mockReturnValue('123');

            const strategy = createStrategy();

            await strategy.initialize(defaultOptions);

            expect(loadPaymentMethodMock).not.toHaveBeenCalled();
        });

        it('should run authentication flow', async () => {
            const loadPaymentMethodMock = jest.fn();

            jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod').mockImplementation(
                loadPaymentMethodMock,
            );

            const strategy = createStrategy();

            await strategy.initialize(defaultOptions);

            expect(loadPaymentMethodMock).toHaveBeenCalledWith(BRAINTREE_AXO_METHOD_ID);
        });

        it('skip authentication flow for store members', async () => {
            const getBraintreeFastlaneMock = jest.fn();

            const storeMember = getCustomer();

            jest.spyOn(braintreeIntegrationServiceMock, 'getBraintreeFastlane').mockImplementation(
                getBraintreeFastlaneMock,
            );
            jest.spyOn(store.getState().customer, 'getCustomerOrThrow').mockReturnValue(
                storeMember,
            );

            const strategy = createStrategy();

            await strategy.initialize(defaultOptions);

            expect(braintreeIntegrationServiceMock.getBraintreeFastlane).not.toHaveBeenCalled();
        });

        it('skip authentication if clientToken does not exist', async () => {
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow').mockReturnValue({
                clientToken: '',
            });

            const getBraintreeFastlaneMock = jest.fn();

            jest.spyOn(braintreeIntegrationServiceMock, 'getBraintreeFastlane').mockImplementation(
                getBraintreeFastlaneMock,
            );

            const strategy = createStrategy();

            await strategy.initialize(defaultOptions);

            expect(getBraintreeFastlaneMock).not.toHaveBeenCalled();
        });

        it('skip authentication if customerContextId does not exist', async () => {
            const lookupCustomerByEmailMock = () => ({ customerContextId: undefined });

            const triggerAuthenticationFlowMock = jest.fn();

            jest.spyOn(braintreeIntegrationServiceMock, 'getBraintreeFastlane').mockReturnValue({
                identity: {
                    lookupCustomerByEmail: lookupCustomerByEmailMock,
                    triggerAuthenticationFlow: triggerAuthenticationFlowMock,
                },
            });

            const strategy = createStrategy();

            await strategy.initialize(defaultOptions);

            expect(triggerAuthenticationFlowMock).not.toHaveBeenCalled();
        });

        it('update payment provider customer with canceled authentication state if the OTP was canceled', async () => {
            const updatePaymentProviderCustomerMock = jest.fn();

            const lookupCustomerByEmailMock = () => ({ customerContextId: 'asd' });
            const triggerAuthenticationFlowMock = jest.fn().mockImplementation(() => ({
                authenticationState: BraintreeFastlaneAuthenticationState.CANCELED,
                profileData: {},
            }));

            jest.spyOn(braintreeIntegrationServiceMock, 'getBraintreeFastlane').mockImplementation(
                () => ({
                    identity: {
                        lookupCustomerByEmail: lookupCustomerByEmailMock,
                        triggerAuthenticationFlow: triggerAuthenticationFlowMock,
                    },
                }),
            );

            jest.spyOn(
                paymentProviderCustomerActionCreator,
                'updatePaymentProviderCustomer',
            ).mockImplementation(updatePaymentProviderCustomerMock);

            const strategy = createStrategy();

            await strategy.initialize(defaultOptions);

            expect(triggerAuthenticationFlowMock).toHaveBeenCalled();
            expect(BrowserStorage.prototype.removeItem).toHaveBeenCalledWith('sessionId');
            expect(updatePaymentProviderCustomerMock).toHaveBeenCalledWith({
                authenticationState: BraintreeFastlaneAuthenticationState.CANCELED,
                addresses: [],
                instruments: [],
            });
        });

        it('update billing address for digital product', async () => {
            const updatePaymentProviderCustomerMock = jest.fn();
            const updateBillingAddressMock = jest.fn();
            const updateShippingAddressMock = jest.fn();

            jest.spyOn(
                paymentProviderCustomerActionCreator,
                'updatePaymentProviderCustomer',
            ).mockImplementation(updatePaymentProviderCustomerMock);
            jest.spyOn(billingAddressActionCreator, 'updateAddress').mockImplementation(
                updateBillingAddressMock,
            );
            jest.spyOn(consignmentActionCreator, 'updateAddress').mockImplementation(
                updateShippingAddressMock,
            );
            jest.spyOn(store.getState().cart, 'getCartOrThrow').mockReturnValue({
                ...getCart(),
                lineItems: {
                    ...getCart().lineItems,
                    physicalItems: [],
                },
            });

            const strategy = createStrategy();

            await strategy.initialize(defaultOptions);

            expect(updatePaymentProviderCustomerMock).toHaveBeenCalledWith({
                authenticationState: 'authenticationState',
                addresses: [mappedAddress],
                instruments: [mappedInstrument],
            });
            expect(updateBillingAddressMock).toHaveBeenCalledWith(mappedBillingAddress);
            expect(updateShippingAddressMock).not.toHaveBeenCalled();
        });
    });

    it('update billing and shipping address for physical items', async () => {
        const updatePaymentProviderCustomerMock = jest.fn();
        const updateBillingAddressMock = jest.fn();
        const updateShippingAddressMock = jest.fn();

        jest.spyOn(
            paymentProviderCustomerActionCreator,
            'updatePaymentProviderCustomer',
        ).mockImplementation(updatePaymentProviderCustomerMock);
        jest.spyOn(billingAddressActionCreator, 'updateAddress').mockImplementation(
            updateBillingAddressMock,
        );
        jest.spyOn(consignmentActionCreator, 'updateAddress').mockImplementation(
            updateShippingAddressMock,
        );

        const strategy = createStrategy();

        await strategy.initialize(defaultOptions);

        expect(updatePaymentProviderCustomerMock).toHaveBeenCalledWith({
            authenticationState: 'authenticationState',
            addresses: [mappedAddress],
            instruments: [mappedInstrument],
        });
        expect(updateBillingAddressMock).toHaveBeenCalledWith(mappedBillingAddress);
        expect(updateShippingAddressMock).toHaveBeenCalledWith(mappedAddress);
    });

    it('update payment provider customer data with different billing and shipping addresses', async () => {
        const updatePaymentProviderCustomerMock = jest.fn();
        const profileData = getBraintreeFastlaneProfileDataMock();

        const billingAddress = {
            ...mappedAddress,
            firstName: 'Mrs.',
            lastName: 'Smith',
        };

        profileData.card.paymentSource.card.billingAddress = {
            ...profileData.card.paymentSource.card.billingAddress,
            firstName: 'Mrs.',
            lastName: 'Smith',
        };

        jest.spyOn(
            paymentProviderCustomerActionCreator,
            'updatePaymentProviderCustomer',
        ).mockImplementation(updatePaymentProviderCustomerMock);
        jest.spyOn(braintreeIntegrationServiceMock, 'getBraintreeFastlane').mockReturnValue({
            identity: {
                lookupCustomerByEmail: () => ({ customerContextId: 'customerContextId' }),
                triggerAuthenticationFlow: () =>
                    Promise.resolve({
                        authenticationState: 'authenticationState',
                        profileData,
                    }),
            },
        });

        const strategy = createStrategy();

        await strategy.initialize(defaultOptions);

        expect(updatePaymentProviderCustomerMock).toHaveBeenCalledWith({
            authenticationState: 'authenticationState',
            addresses: [mappedAddress, billingAddress],
            instruments: [mappedInstrument],
        });
    });

    describe('#handleBraintreeFastlaneShippingAddressChange', () => {
        beforeEach(() => {
            const storeConfig = getConfig().storeConfig;

            const storeConfigWithAFeature = {
                ...storeConfig,
                checkoutSettings: {
                    ...storeConfig.checkoutSettings,
                    features: {
                        ...storeConfig.checkoutSettings.features,
                        'PAYPAL-3996.paypal_fastlane_shipping_update': true,
                    },
                },
            };

            jest.spyOn(braintreeIntegrationServiceMock, 'getBraintreeFastlane').mockImplementation(
                () => braintreeFastlane,
            );
            jest.spyOn(
                store.getState().shippingAddress,
                'getShippingAddressesOrThrow',
            ).mockReturnValue([getShippingAddress()]);
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValue({
                clientToken: '123',
                initializationData: {
                    isFastlaneEnabled: true,
                },
            });
            jest.spyOn(store.getState().config, 'getStoreConfigOrThrow').mockReturnValue(
                storeConfigWithAFeature,
            );
            jest.spyOn(
                store.getState().paymentProviderCustomer,
                'getPaymentProviderCustomer',
            ).mockReturnValue({
                authenticationState: BraintreeFastlaneAuthenticationState.SUCCEEDED,
                addresses: [],
                instruments: [],
            });
        });

        it('shows paypal shipping address selector', async () => {
            const strategy = createStrategy();
            const authenticationResultMock = getBraintreeFastlaneAuthenticationResultMock();
            const onPayPalFastlaneAddressChange = jest.fn((showPaypalAddressSelector) => {
                showPaypalAddressSelector();
            });

            jest.spyOn(braintreeFastlane.profile, 'showShippingAddressSelector').mockImplementation(
                () => ({
                    selectionChanged: true,
                    selectedAddress: authenticationResultMock.profileData.shippingAddress,
                }),
            );

            await strategy.initialize({
                ...defaultOptions,
                braintreefastlane: {
                    onPayPalFastlaneAddressChange,
                },
            });

            expect(braintreeFastlane.profile.showShippingAddressSelector).toHaveBeenCalled();
        });

        it('loads fastlane sdk', async () => {
            const strategy = createStrategy();
            const onPayPalFastlaneAddressChange = jest.fn((showPaypalAddressSelector) => {
                showPaypalAddressSelector();
            });

            await strategy.initialize({
                ...defaultOptions,
                braintreefastlane: {
                    onPayPalFastlaneAddressChange,
                },
            });

            expect(braintreeIntegrationServiceMock.getBraintreeFastlane).toHaveBeenCalled();
        });

        it('updates provider customer data', async () => {
            const updatePaymentProviderCustomerMock = jest.fn();
            const strategy = createStrategy();
            const authenticationResultMock = getBraintreeFastlaneAuthenticationResultMock();
            const braintreeFastlane = getFastlaneMock();
            const onPayPalFastlaneAddressChange = jest.fn((showPaypalAddressSelector) => {
                showPaypalAddressSelector();
            });

            jest.spyOn(braintreeFastlane.profile, 'showShippingAddressSelector').mockImplementation(
                () => ({
                    selectionChanged: true,
                    selectedAddress: authenticationResultMock.profileData.shippingAddress,
                }),
            );
            jest.spyOn(
                paymentProviderCustomerActionCreator,
                'updatePaymentProviderCustomer',
            ).mockImplementation(updatePaymentProviderCustomerMock);

            await strategy.initialize({
                ...defaultOptions,
                braintreefastlane: {
                    onPayPalFastlaneAddressChange,
                },
            });

            expect(updatePaymentProviderCustomerMock).toHaveBeenCalled();
        });

        it('updates address', async () => {
            const updatePaymentProviderCustomerMock = jest.fn();
            const updateAction = jest.fn();
            const strategy = createStrategy();
            const authenticationResultMock = getBraintreeFastlaneAuthenticationResultMock();
            const braintreeFastlane = getFastlaneMock();
            const onPayPalFastlaneAddressChange = jest.fn((showPaypalAddressSelector) => {
                showPaypalAddressSelector();
            });

            jest.spyOn(braintreeIntegrationServiceMock, 'getBraintreeFastlane').mockImplementation(
                () => braintreeFastlane,
            );
            jest.spyOn(braintreeFastlane.profile, 'showShippingAddressSelector').mockImplementation(
                () => ({
                    selectionChanged: true,
                    selectedAddress: authenticationResultMock.profileData.shippingAddress,
                }),
            );
            jest.spyOn(
                paymentProviderCustomerActionCreator,
                'updatePaymentProviderCustomer',
            ).mockImplementation(updatePaymentProviderCustomerMock);

            jest.spyOn(consignmentActionCreator, 'updateAddress').mockImplementation(updateAction);

            await strategy.initialize({
                ...defaultOptions,
                braintreefastlane: {
                    onPayPalFastlaneAddressChange,
                },
            });

            expect(consignmentActionCreator.updateAddress).toHaveBeenCalled();
        });
    });
});
