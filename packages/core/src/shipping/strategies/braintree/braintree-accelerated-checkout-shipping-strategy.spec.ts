import { BraintreeIntegrationService } from '@bigcommerce/checkout-sdk/braintree-utils';
import { PaymentMethod } from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getBillingAddress,
    getCart,
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

import BraintreeAcceleratedCheckoutInitializeOptions from './braintree-accelerated-checkout-initialize-options';
import BraintreeAcceleratedCheckoutShippingStrategy from './braintree-accelerated-checkout-shipping-strategy';

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
    getBraintreeConnect() {}
}

class BillingAddressActionCreatorMock {
    updateAddress() {}
}

class ConsignmentActionCreatorMock {
    updateAddress() {}
    selectShippingOption() {}
}

describe('BraintreeAcceleratedCheckoutShippingStrategy', () => {
    let store: CheckoutStore;
    let billingAddressActionCreator: BillingAddressActionCreatorMock;
    let consignmentActionCreator: ConsignmentActionCreatorMock;
    let paymentMethodActionCreator: PaymentMethodActionCreatorMock;
    let paymentProviderCustomerActionCreator: PaymentProviderCustomerActionCreatorMock;
    let braintreeIntegrationServiceMock: BraintreeIntegrationServiceMock;
    const defaultOptions = {
        methodId: BRAINTREE_AXO_METHOD_ID,
    };
    const ppAddress = {
        id: '123',
        firstName: 'firstName',
        lastName: 'lastName',
        company: 'company',
        streetAddress: 'streetAddress',
        extendedAddress: 'extendedAddress',
        locality: 'locality',
        region: 'region',
        countryCodeAlpha2: 'countryCodeAlpha2',
        postalCode: 'postalCode',
    };
    const mappedAddress = {
        id: 123,
        type: 'paypal-address',
        firstName: 'firstName',
        lastName: 'lastName',
        company: 'company',
        address1: 'streetAddress',
        address2: 'extendedAddress',
        city: 'locality',
        stateOrProvince: 'region',
        stateOrProvinceCode: 'region',
        country: '',
        countryCode: 'countryCodeAlpha2',
        postalCode: 'postalCode',
        phone: '',
        customFields: [],
    };
    const createStrategy = () => {
        return new BraintreeAcceleratedCheckoutShippingStrategy(
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

        jest.spyOn(store.getState().cart, 'getCart').mockReturnValue({
            ...getCart(),
        });
        jest.spyOn(store.getState().cart, 'getCartOrThrow').mockReturnValue({
            ...getCart(),
        });
        jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow').mockReturnValue({
            clientToken: 'clientToken',
            initializationData: {},
        });
        jest.spyOn(store.getState().billingAddress, 'getBillingAddress').mockReturnValue({
            ...getBillingAddress(),
        });
        jest.spyOn(BrowserStorage.prototype, 'getItem').mockReturnValue(getCart().id);
        jest.spyOn(braintreeIntegrationServiceMock, 'getBraintreeConnect').mockReturnValue({
            identity: {
                lookupCustomerByEmail: () => ({ customerContextId: 'customerContextId' }),
                triggerAuthenticationFlow: () =>
                    Promise.resolve({
                        authenticationState: 'authenticationState',
                        profileData: { addresses: [ppAddress] },
                    }),
            },
        });
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
            const response = strategy.initialize(
                {} as BraintreeAcceleratedCheckoutInitializeOptions,
            );

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

        it('skip authentication if clientToken does not exist', async () => {
            const getBraintreeConnectMock = jest.fn();

            jest.spyOn(braintreeIntegrationServiceMock, 'getBraintreeConnect').mockImplementation(
                getBraintreeConnectMock,
            );
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow').mockReturnValue({
                initializationData: {},
            });

            const strategy = createStrategy();

            await strategy.initialize(defaultOptions);

            expect(getBraintreeConnectMock).not.toHaveBeenCalled();
        });

        it('skip authentication if initializationData does not exist', async () => {
            const getBraintreeConnectMock = jest.fn();

            jest.spyOn(braintreeIntegrationServiceMock, 'getBraintreeConnect').mockImplementation(
                getBraintreeConnectMock,
            );
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow').mockReturnValue({
                clientToken: 'clientToken',
            });

            const strategy = createStrategy();

            await strategy.initialize(defaultOptions);

            expect(getBraintreeConnectMock).not.toHaveBeenCalled();
        });

        it('skip authentication if customerContextId does not exist', async () => {
            const lookupCustomerByEmailMock = () => ({ customerContextId: undefined });
            const triggerAuthenticationFlowMock = jest.fn();

            jest.spyOn(braintreeIntegrationServiceMock, 'getBraintreeConnect').mockReturnValue({
                braintreeConnect: {
                    identity: {
                        lookupCustomerByEmail: lookupCustomerByEmailMock,
                        triggerAuthenticationFlow: triggerAuthenticationFlowMock,
                    },
                },
            });

            const strategy = createStrategy();

            await strategy.initialize(defaultOptions);

            expect(triggerAuthenticationFlowMock).not.toHaveBeenCalled();
        });

        it('skip authentication if customerContextId does not exist', async () => {
            const triggerAuthenticationFlowMock = jest.fn();

            jest.spyOn(braintreeIntegrationServiceMock, 'getBraintreeConnect').mockReturnValue({
                braintreeConnect: {
                    identity: {
                        lookupCustomerByEmail: () => ({ customerContextId: undefined }),
                        triggerAuthenticationFlow: triggerAuthenticationFlowMock,
                    },
                },
            });

            const strategy = createStrategy();

            await strategy.initialize(defaultOptions);

            expect(triggerAuthenticationFlowMock).not.toHaveBeenCalled();
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
                instruments: [],
            });
            expect(updateBillingAddressMock).toHaveBeenCalledWith({
                ...mappedAddress,
                id: '123',
            });
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
            instruments: [],
        });
        expect(updateBillingAddressMock).toHaveBeenCalledWith({
            ...mappedAddress,
            id: '123',
        });
        expect(updateShippingAddressMock).toHaveBeenCalledWith(mappedAddress);
    });
});
