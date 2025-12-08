import { createRequestSender } from '@bigcommerce/request-sender';

import {
    BigCommercePaymentsFastlaneUtils,
    createBigCommercePaymentsFastlaneUtils,
    createBigCommercePaymentsSdk,
    getBigCommercePaymentsFastlanePaymentMethod,
    getPayPalFastlane,
    getPayPalFastlaneAuthenticationResultMock,
    getPayPalFastlaneSdk,
    PayPalFastlaneAuthenticationState,
    PayPalFastlaneSdk,
    PayPalSdkHelper,
} from '@bigcommerce/checkout-sdk/bigcommerce-payments-utils';
import {
    Cart,
    Customer,
    StoreConfig,
    UntrustedShippingCardVerificationType,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getBillingAddress,
    getCart,
    getConfig,
    getCustomer,
    getShippingAddress,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

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

import BigCommercePaymentsFastlaneShippingStrategy from './bigcommerce-payments-fastlane-shipping-strategy';

describe('BigCommercePaymentsFastlaneShippingStrategy', () => {
    let billingAddressActionCreator: BillingAddressActionCreator;
    let billingAddress: BillingAddress;
    let cart: Cart;
    let consignmentActionCreator: ConsignmentActionCreator;
    let customer: Customer;
    let paymentMethodActionCreator: PaymentMethodActionCreator;
    let paymentMethod: PaymentMethod;
    let paymentProviderCustomerActionCreator: PaymentProviderCustomerActionCreator;
    let paypalFastlaneSdk: PayPalFastlaneSdk;
    let payPalSdkHelper: PayPalSdkHelper;
    let bigCommercePaymentsFastlaneUtils: BigCommercePaymentsFastlaneUtils;
    let store: CheckoutStore;
    let storeConfig: StoreConfig;
    let strategy: BigCommercePaymentsFastlaneShippingStrategy;

    const methodId = 'bigcommerce_payments_fastlane';
    const initializationOptions = { methodId };
    const authenticationResultMock = getPayPalFastlaneAuthenticationResultMock();
    const customerContextId = 'asd123';
    const paypalFastlane = getPayPalFastlane();
    const shippingAddresses = [getShippingAddress()];

    const requestSender = createRequestSender();

    const bcAddressMock = {
        id: 1,
        address1: 'addressLine1',
        address2: 'addressLine2',
        city: 'addressCity',
        company: 'BigCommerce',
        country: 'US',
        countryCode: 'US',
        customFields: [],
        firstName: 'John',
        lastName: 'Doe',
        phone: '333333333333',
        postalCode: '03004',
        stateOrProvince: 'addressState',
        stateOrProvinceCode: 'addressState',
        type: 'residential',
    };

    const bcInstrumentMock = {
        bigpayToken: 'nonce/token',
        brand: 'Visa',
        defaultInstrument: false,
        expiryMonth: '12',
        expiryYear: '2030',
        iin: '',
        last4: '1111',
        method: 'bigcommerce_payments_fastlane',
        provider: 'bigcommerce_payments_fastlane',
        trustedShippingAddress: false,
        type: 'card' as const,
        untrustedShippingCardVerificationMode: UntrustedShippingCardVerificationType.CVV,
    };

    beforeEach(() => {
        billingAddress = getBillingAddress();
        cart = getCart();
        customer = { ...getCustomer(), isGuest: true };
        storeConfig = getConfig().storeConfig;
        paymentMethod = getBigCommercePaymentsFastlanePaymentMethod();
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
        payPalSdkHelper = createBigCommercePaymentsSdk();
        bigCommercePaymentsFastlaneUtils = createBigCommercePaymentsFastlaneUtils();

        strategy = new BigCommercePaymentsFastlaneShippingStrategy(
            store,
            billingAddressActionCreator,
            consignmentActionCreator,
            paymentMethodActionCreator,
            paymentProviderCustomerActionCreator,
            payPalSdkHelper,
            bigCommercePaymentsFastlaneUtils,
        );

        jest.spyOn(store.getState().cart, 'getCartOrThrow').mockReturnValue(cart);
        // TODO: remove ts-ignore and update test with related type
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
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
        // TODO: remove ts-ignore and update test with related type
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod').mockReturnValue(paymentMethod);

        jest.spyOn(payPalSdkHelper, 'getPayPalFastlaneSdk').mockImplementation(
            // TODO: remove ts-ignore and update test with related type
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            () => paypalFastlaneSdk,
        );
        jest.spyOn(bigCommercePaymentsFastlaneUtils, 'initializePayPalFastlane').mockImplementation(
            jest.fn(),
        );
        jest.spyOn(bigCommercePaymentsFastlaneUtils, 'getPayPalFastlaneOrThrow').mockImplementation(
            () => paypalFastlane,
        );
        jest.spyOn(bigCommercePaymentsFastlaneUtils, 'getStorageSessionId').mockReturnValue(
            cart.id,
        );
        jest.spyOn(bigCommercePaymentsFastlaneUtils, 'updateStorageSessionId').mockImplementation(
            () => jest.fn(),
        );
        // TODO: remove ts-ignore and update test with related type
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        jest.spyOn(bigCommercePaymentsFastlaneUtils, 'lookupCustomerOrThrow').mockImplementation(
            () =>
                Promise.resolve({
                    customerContextId,
                }),
        );

        jest.spyOn(
            bigCommercePaymentsFastlaneUtils,
            'triggerAuthenticationFlowOrThrow',
            // TODO: remove ts-ignore and update test with related type
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
        ).mockImplementation(() => authenticationResultMock);
        jest.spyOn(
            bigCommercePaymentsFastlaneUtils,
            'mapPayPalFastlaneProfileToBcCustomerData',
            // TODO: remove ts-ignore and update test with related type
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
        ).mockImplementation(() => ({
            authenticationState: authenticationResultMock.authenticationState,
            addresses: [bcAddressMock],
            billingAddress: bcAddressMock,
            shippingAddress: bcAddressMock,
            instruments: [bcInstrumentMock],
        }));
        jest.spyOn(bigCommercePaymentsFastlaneUtils, 'mapPayPalToBcAddress').mockImplementation(
            // TODO: remove ts-ignore and update test with related type
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            () => bcAddressMock,
        );
        // TODO: remove ts-ignore and update test with related type
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        jest.spyOn(bigCommercePaymentsFastlaneUtils, 'filterAddresses').mockImplementation(() => [
            bcAddressMock,
        ]);

        jest.spyOn(
            paymentProviderCustomerActionCreator,
            'updatePaymentProviderCustomer',
            // TODO: remove ts-ignore and update test with related type
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
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
            // TODO: remove ts-ignore and update test with related type
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
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
            expect(
                bigCommercePaymentsFastlaneUtils.initializePayPalFastlane,
            ).not.toHaveBeenCalled();
        });

        it('gets paypal fastlane with correct styles', async () => {
            // TODO: remove ts-ignore and update test with related type
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValue({
                clientToken: '123',
                initializationData: {
                    isFastlaneEnabled: true,
                    isFastlaneStylingEnabled: true,
                    isAcceleratedCheckoutEnabled: true,
                    fastlaneStyles: {
                        fastlaneRootSettingsBackgroundColor: 'orange',
                        fastlaneTextCaptionSettingsColor: 'blue',
                    },
                },
            });

            const initOptions = {
                methodId: 'bigcommerce_payments_fastlane',
                bigcommerce_payments_fastlane: {
                    styles: {
                        root: {
                            backgroundColorPrimary: 'red',
                        },
                        input: {
                            borderRadius: '10px',
                        },
                    },
                },
            };

            await strategy.initialize(initOptions);

            expect(bigCommercePaymentsFastlaneUtils.initializePayPalFastlane).toHaveBeenCalledWith(
                paypalFastlaneSdk,
                false,
                {
                    root: {
                        backgroundColorPrimary: 'orange',
                    },
                    input: {
                        borderRadius: '10px',
                    },
                    text: {
                        caption: {
                            color: 'blue',
                        },
                    },
                },
            );
        });

        it('does not load payment method if BigCommercePayments Fastlane feature is disabled', async () => {
            jest.spyOn(
                store.getState().paymentProviderCustomer,
                'getPaymentProviderCustomerOrThrow',
            ).mockReturnValue({});

            jest.spyOn(bigCommercePaymentsFastlaneUtils, 'getStorageSessionId').mockReturnValue(
                // TODO: remove ts-ignore and update test with related type
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                undefined,
            );

            await strategy.initialize(initializationOptions);

            expect(paymentMethodActionCreator.loadPaymentMethod).not.toHaveBeenCalled();
        });

        it('initializes paypal sdk and authenticates user with paypal fastlane', async () => {
            paymentMethod.initializationData.isFastlaneEnabled = true;

            await strategy.initialize(initializationOptions);

            expect(paymentMethodActionCreator.loadPaymentMethod).toHaveBeenCalledWith(methodId);
            expect(payPalSdkHelper.getPayPalFastlaneSdk).toHaveBeenCalledWith(
                paymentMethod,
                cart.currency.code,
                cart.id,
            );
            expect(bigCommercePaymentsFastlaneUtils.initializePayPalFastlane).toHaveBeenCalledWith(
                paypalFastlaneSdk,
                paymentMethod.initializationData.isDeveloperModeApplicable,
                {},
            );
            expect(bigCommercePaymentsFastlaneUtils.lookupCustomerOrThrow).toHaveBeenCalledWith(
                customer.email,
            );
            expect(
                bigCommercePaymentsFastlaneUtils.triggerAuthenticationFlowOrThrow,
            ).toHaveBeenCalledWith(customerContextId);
            expect(
                bigCommercePaymentsFastlaneUtils.mapPayPalFastlaneProfileToBcCustomerData,
            ).toHaveBeenCalledWith(methodId, authenticationResultMock);
            expect(
                paymentProviderCustomerActionCreator.updatePaymentProviderCustomer,
            ).toHaveBeenCalledWith({
                authenticationState: authenticationResultMock.authenticationState,
                addresses: [bcAddressMock],
                instruments: [bcInstrumentMock],
            });
            expect(bigCommercePaymentsFastlaneUtils.updateStorageSessionId).toHaveBeenCalledWith(
                cart.id,
            );
            expect(billingAddressActionCreator.updateAddress).toHaveBeenCalledWith({
                ...bcAddressMock,
                id: String(bcAddressMock.id),
            });
        });

        it('does not authenticate user if the authentication was canceled before', async () => {
            jest.spyOn(
                store.getState().paymentProviderCustomer,
                'getPaymentProviderCustomerOrThrow',
            ).mockReturnValue({
                authenticationState: PayPalFastlaneAuthenticationState.CANCELED,
            });

            jest.spyOn(bigCommercePaymentsFastlaneUtils, 'getStorageSessionId').mockReturnValue(
                cart.id,
            );

            await strategy.initialize(initializationOptions);

            expect(paymentMethodActionCreator.loadPaymentMethod).not.toHaveBeenCalled();
            expect(
                bigCommercePaymentsFastlaneUtils.initializePayPalFastlane,
            ).not.toHaveBeenCalled();
            expect(bigCommercePaymentsFastlaneUtils.lookupCustomerOrThrow).not.toHaveBeenCalled();
        });

        it('does not authenticate user if it was authenticated before', async () => {
            jest.spyOn(
                store.getState().paymentProviderCustomer,
                'getPaymentProviderCustomerOrThrow',
            ).mockReturnValue({
                authenticationState: PayPalFastlaneAuthenticationState.SUCCEEDED,
                // TODO: remove ts-ignore and update test with related type
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                addresses: [bcAddressMock],
                // TODO: remove ts-ignore and update test with related type
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                instruments: [bcInstrumentMock],
            });

            jest.spyOn(bigCommercePaymentsFastlaneUtils, 'getStorageSessionId').mockReturnValue(
                cart.id,
            );

            await strategy.initialize(initializationOptions);

            expect(bigCommercePaymentsFastlaneUtils.lookupCustomerOrThrow).not.toHaveBeenCalled();
        });

        it('does not provide Fastlane Shipping selector method if onPayPalFastlaneAddressChange is not a function', async () => {
            jest.spyOn(
                store.getState().paymentProviderCustomer,
                'getPaymentProviderCustomerOrThrow',
            ).mockReturnValue({
                authenticationState: PayPalFastlaneAuthenticationState.SUCCEEDED,
                // TODO: remove ts-ignore and update test with related type
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                addresses: [bcAddressMock],
                // TODO: remove ts-ignore and update test with related type
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                instruments: [bcInstrumentMock],
            });

            await strategy.initialize({
                ...initializationOptions,
                bigcommerce_payments_fastlane: {
                    onPayPalFastlaneAddressChange: undefined,
                },
            });

            expect(paymentMethodActionCreator.loadPaymentMethod).not.toHaveBeenCalled();
            expect(
                bigCommercePaymentsFastlaneUtils.initializePayPalFastlane,
            ).not.toHaveBeenCalled();
        });

        it('initializes paypal sdk and provides Fastlane Shipping selector method to onPayPalFastlaneAddressChange callback', async () => {
            const onPayPalFastlaneAddressChange = jest.fn();

            jest.spyOn(
                store.getState().paymentProviderCustomer,
                'getPaymentProviderCustomerOrThrow',
            ).mockReturnValue({
                authenticationState: PayPalFastlaneAuthenticationState.SUCCEEDED,
                // TODO: remove ts-ignore and update test with related type
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                addresses: [bcAddressMock],
                // TODO: remove ts-ignore and update test with related type
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                instruments: [bcInstrumentMock],
            });

            await strategy.initialize({
                ...initializationOptions,
                bigcommerce_payments_fastlane: {
                    onPayPalFastlaneAddressChange,
                },
            });

            expect(paymentMethodActionCreator.loadPaymentMethod).toHaveBeenCalled();
            expect(bigCommercePaymentsFastlaneUtils.initializePayPalFastlane).toHaveBeenCalled();
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
                // TODO: remove ts-ignore and update test with related type
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                addresses: [bcAddressMock],
                // TODO: remove ts-ignore and update test with related type
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                instruments: [bcInstrumentMock],
            });

            jest.spyOn(paypalFastlane.profile, 'showShippingAddressSelector').mockImplementation(
                // TODO: remove ts-ignore and update test with related type
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                () => ({
                    selectionChanged: true,
                    selectedAddress: authenticationResultMock.profileData.shippingAddress,
                }),
            );

            await strategy.initialize({
                ...initializationOptions,
                bigcommerce_payments_fastlane: {
                    onPayPalFastlaneAddressChange,
                },
            });

            expect(paypalFastlane.profile.showShippingAddressSelector).toHaveBeenCalled();
            expect(bigCommercePaymentsFastlaneUtils.mapPayPalToBcAddress).toHaveBeenCalledWith(
                authenticationResultMock.profileData.shippingAddress.address,
                authenticationResultMock.profileData.shippingAddress.name,
                authenticationResultMock.profileData.shippingAddress.phoneNumber,
                shippingAddresses[0].customFields,
            );
            expect(bigCommercePaymentsFastlaneUtils.filterAddresses).toHaveBeenCalledWith([
                bcAddressMock,
            ]);
            expect(
                paymentProviderCustomerActionCreator.updatePaymentProviderCustomer,
            ).toHaveBeenCalledWith({
                addresses: [bcAddressMock],
            });
            expect(consignmentActionCreator.updateAddress).toHaveBeenCalledWith(bcAddressMock);
        });

        it('supports unified "fastlane" key with styles', async () => {
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValue({
                ...paymentMethod,
                clientToken: '123',
                initializationData: {
                    isFastlaneEnabled: true,
                    isFastlaneStylingEnabled: true,
                    isAcceleratedCheckoutEnabled: true,
                    fastlaneStyles: {
                        fastlaneRootSettingsBackgroundColor: 'orange',
                        fastlaneTextCaptionSettingsColor: 'blue',
                    },
                },
            });

            const initOptions = {
                methodId,
                fastlane: {
                    styles: {
                        root: {
                            backgroundColorPrimary: 'red',
                        },
                        input: {
                            borderRadius: '10px',
                        },
                    },
                },
            };

            await strategy.initialize(initOptions);

            expect(bigCommercePaymentsFastlaneUtils.initializePayPalFastlane).toHaveBeenCalledWith(
                paypalFastlaneSdk,
                false,
                {
                    root: {
                        backgroundColorPrimary: 'orange',
                    },
                    input: {
                        borderRadius: '10px',
                    },
                    text: {
                        caption: {
                            color: 'blue',
                        },
                    },
                },
            );
        });

        it('supports the unified "fastlane" key with onPayPalFastlaneAddressChange callback', async () => {
            const onPayPalFastlaneAddressChange = jest.fn();

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
                fastlane: {
                    onPayPalFastlaneAddressChange,
                },
            });

            expect(paymentMethodActionCreator.loadPaymentMethod).toHaveBeenCalled();
            expect(bigCommercePaymentsFastlaneUtils.initializePayPalFastlane).toHaveBeenCalled();
            expect(onPayPalFastlaneAddressChange).toHaveBeenCalled();
        });

        it('prioritizes unified "fastlane" key over provider-specific key', async () => {
            const providerSpecificCallback = jest.fn();
            const unifiedCallback = jest.fn();

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
                bigcommerce_payments_fastlane: {
                    onPayPalFastlaneAddressChange: providerSpecificCallback,
                },
                fastlane: {
                    onPayPalFastlaneAddressChange: unifiedCallback,
                },
            });

            expect(unifiedCallback).toHaveBeenCalled();
            expect(providerSpecificCallback).not.toHaveBeenCalled();
        });
    });
});
