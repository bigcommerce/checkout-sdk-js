import {
    PaymentMethodClientUnavailableError,
    UntrustedShippingCardVerificationType,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { BrowserStorage } from '@bigcommerce/checkout-sdk/storage';

import {
    getPayPalAxoSdk,
    getPayPalFastlaneAuthenticationResultMock,
    getPayPalFastlaneSdk,
} from './mocks';
import PayPalCommerceFastlaneUtils from './paypal-commerce-fastlane-utils';
import {
    PayPalAxoSdk,
    PayPalCommerceConnectAuthenticationState,
    PayPalCommerceHostWindow,
    PayPalFastlaneAuthenticationState,
    PayPalFastlaneSdk,
} from './paypal-commerce-types';

describe('PayPalCommerceFastlaneUtils', () => {
    let browserStorage: BrowserStorage;
    let paypalAxoSdk: PayPalAxoSdk;
    let paypalFastlaneSdk: PayPalFastlaneSdk;
    let subject: PayPalCommerceFastlaneUtils;

    const methodIdMock = 'paypalcommerceacceleratedcheckout';
    const authenticationResultMock = getPayPalFastlaneAuthenticationResultMock();

    const bcAddressMock = {
        address1: 'addressLine1',
        address2: 'addressLine2',
        city: 'addressCity',
        company: 'BigCommerce',
        country: 'United States',
        countryCode: 'US',
        customFields: [],
        firstName: 'John',
        lastName: 'Doe',
        phone: '15551113344',
        postalCode: '03004',
        stateOrProvince: 'addressState',
        stateOrProvinceCode: 'addressState',
    };

    const paypalToBcAddressMock = {
        ...bcAddressMock,
        id: 1,
        country: 'US',
        type: 'paypal-address',
    };

    const paypalToBcInstrumentMock = {
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
        untrustedShippingCardVerificationMode: UntrustedShippingCardVerificationType.PAN,
        type: 'card',
    };

    beforeEach(() => {
        browserStorage = new BrowserStorage('paypalFastlane');
        paypalAxoSdk = getPayPalAxoSdk();
        paypalFastlaneSdk = getPayPalFastlaneSdk();

        subject = new PayPalCommerceFastlaneUtils(browserStorage);

        jest.spyOn(Date, 'now').mockImplementation(() => 1);
    });

    afterEach(() => {
        (window as PayPalCommerceHostWindow).paypalConnect = undefined;
        (window as PayPalCommerceHostWindow).paypalFastlane = undefined;

        jest.resetAllMocks();
        jest.restoreAllMocks();

        localStorage.clear();
    });

    // TODO: remove this tests when PPCP Fastlane experiment will be rollout to 100%
    describe('#initializePayPalConnect', () => {
        it('initializes paypal connect with paypal sdk', async () => {
            jest.spyOn(paypalAxoSdk, 'Connect');

            await subject.initializePayPalConnect(paypalAxoSdk, false);

            expect(paypalAxoSdk.Connect).toHaveBeenCalled();
        });

        it('sets axo to sandbox mode if test mode is enabled', async () => {
            jest.spyOn(Storage.prototype, 'setItem').mockImplementation(jest.fn);

            await subject.initializePayPalConnect(paypalAxoSdk, true);

            expect(window.localStorage.setItem).toHaveBeenCalledWith('axoEnv', 'sandbox');
        });
    });

    describe('#initializePayPalFastlane', () => {
        it('initializes paypal fastlane with paypal sdk', async () => {
            jest.spyOn(paypalFastlaneSdk, 'Fastlane');

            await subject.initializePayPalFastlane(paypalFastlaneSdk, false);

            expect(paypalFastlaneSdk.Fastlane).toHaveBeenCalled();
        });

        it('sets axo to sandbox mode if test mode is enabled', async () => {
            jest.spyOn(Storage.prototype, 'setItem').mockImplementation(jest.fn);

            await subject.initializePayPalFastlane(paypalFastlaneSdk, true);

            expect(window.localStorage.setItem).toHaveBeenCalledWith('fastlaneEnv', 'sandbox');
            expect(window.localStorage.setItem).toHaveBeenCalledWith('axoEnv', 'sandbox');
        });
    });

    // TODO: remove this tests when PPCP Fastlane experiment will be rollout to 100%
    describe('#getPayPalConnectOrThrow', () => {
        it('successfully returns paypal connect with no errors', async () => {
            const expectedResult = await subject.initializePayPalConnect(paypalAxoSdk, false);

            expect(subject.getPayPalConnectOrThrow()).toEqual(expectedResult);
        });

        it('throws an error if paypal connect did not initialize before', () => {
            try {
                subject.getPayPalConnectOrThrow();
            } catch (error: unknown) {
                expect(error).toBeInstanceOf(PaymentMethodClientUnavailableError);
            }
        });
    });

    describe('#getPayPalFastlaneOrThrow', () => {
        it('successfully returns paypal fastlane with no errors', async () => {
            const expectedResult = await subject.initializePayPalFastlane(paypalFastlaneSdk, false);

            expect(subject.getPayPalFastlaneOrThrow()).toEqual(expectedResult);
        });

        it('throws an error if paypal fastlane did not initialize before', () => {
            try {
                subject.getPayPalFastlaneOrThrow();
            } catch (error: unknown) {
                expect(error).toBeInstanceOf(PaymentMethodClientUnavailableError);
            }
        });
    });

    // TODO: remove this tests when PPCP Fastlane experiment will be rollout to 100%
    describe('#connectLookupCustomerOrThrow', () => {
        const testEmail = 'john@doe.com';

        it('successfully triggers lookup method with provided email', async () => {
            const paypalConnectMock = await subject.initializePayPalConnect(paypalAxoSdk, false);

            await subject.connectLookupCustomerOrThrow(testEmail);

            expect(paypalConnectMock.identity.lookupCustomerByEmail).toHaveBeenCalledWith(
                testEmail,
            );
        });

        it('throws an error if paypal connect did not initialize before', async () => {
            try {
                await subject.connectLookupCustomerOrThrow(testEmail);
            } catch (error: unknown) {
                expect(error).toBeInstanceOf(PaymentMethodClientUnavailableError);
            }
        });
    });

    describe('#lookupCustomerOrThrow', () => {
        const testEmail = 'john@doe.com';

        it('successfully triggers lookup method with provided email', async () => {
            const paypalConnectMock = await subject.initializePayPalFastlane(
                paypalFastlaneSdk,
                false,
            );

            await subject.lookupCustomerOrThrow(testEmail);

            expect(paypalConnectMock.identity.lookupCustomerByEmail).toHaveBeenCalledWith(
                testEmail,
            );
        });

        it('throws an error if paypal fastlane did not initialize before', async () => {
            try {
                await subject.lookupCustomerOrThrow(testEmail);
            } catch (error: unknown) {
                expect(error).toBeInstanceOf(PaymentMethodClientUnavailableError);
            }
        });
    });

    // TODO: remove this tests when PPCP Fastlane experiment will be rollout to 100%
    describe('#connectTriggerAuthenticationFlowOrThrow', () => {
        const customerContextIdMock = 'ryanRecognised123';

        it('successfully triggers authentication flow with provided customer id and styles', async () => {
            const paypalConnectMock = await subject.initializePayPalConnect(paypalAxoSdk, false);

            await subject.connectTriggerAuthenticationFlowOrThrow(customerContextIdMock);

            expect(paypalConnectMock.identity.triggerAuthenticationFlow).toHaveBeenCalledWith(
                customerContextIdMock,
            );
        });

        it('throws an error if paypal connect did not initialize before', async () => {
            try {
                await subject.connectTriggerAuthenticationFlowOrThrow(customerContextIdMock);
            } catch (error: unknown) {
                expect(error).toBeInstanceOf(PaymentMethodClientUnavailableError);
            }
        });
    });

    describe('#triggerAuthenticationFlowOrThrow', () => {
        const customerContextIdMock = 'ryanRecognised123';

        it('successfully triggers authentication flow with provided customer id and styles', async () => {
            const paypalFastlaneMock = await subject.initializePayPalFastlane(
                paypalFastlaneSdk,
                false,
            );

            await subject.triggerAuthenticationFlowOrThrow(customerContextIdMock);

            expect(paypalFastlaneMock.identity.triggerAuthenticationFlow).toHaveBeenCalledWith(
                customerContextIdMock,
            );
        });

        it('throws an error if paypal fastlane did not initialize before', async () => {
            try {
                await subject.triggerAuthenticationFlowOrThrow(customerContextIdMock);
            } catch (error: unknown) {
                expect(error).toBeInstanceOf(PaymentMethodClientUnavailableError);
            }
        });
    });

    describe('#updateStorageSessionId', () => {
        const sessionIdMock = 'cartId123';

        it('sets session id to browser storage', () => {
            jest.spyOn(browserStorage, 'setItem');

            subject.updateStorageSessionId(false, sessionIdMock);

            expect(browserStorage.setItem).toHaveBeenCalledWith('sessionId', sessionIdMock);
        });

        it('removes session id from browser storage', () => {
            jest.spyOn(browserStorage, 'removeItem');

            subject.updateStorageSessionId(true, sessionIdMock);

            expect(browserStorage.removeItem).toHaveBeenCalledWith('sessionId');
        });
    });

    describe('#getStorageSessionId', () => {
        it('returns session id to browser storage', () => {
            jest.spyOn(browserStorage, 'getItem');

            subject.getStorageSessionId();

            expect(browserStorage.getItem).toHaveBeenCalledWith('sessionId');
        });
    });

    describe('#mapPayPalFastlaneProfileToBcCustomerData', () => {
        it('returns default "empty" data if authenticationResult is undefined', () => {
            expect(subject.mapPayPalFastlaneProfileToBcCustomerData(methodIdMock, {})).toEqual({
                authenticationState: PayPalCommerceConnectAuthenticationState.UNRECOGNIZED,
                addresses: [],
                billingAddress: undefined,
                shippingAddress: undefined,
                instruments: [],
            });
        });

        it('returns mapped PayPal Fastlane Profile to BC like data', () => {
            expect(
                subject.mapPayPalFastlaneProfileToBcCustomerData(
                    methodIdMock,
                    authenticationResultMock,
                ),
            ).toEqual({
                authenticationState: PayPalFastlaneAuthenticationState.SUCCEEDED,
                addresses: [paypalToBcAddressMock],
                billingAddress: paypalToBcAddressMock,
                shippingAddress: paypalToBcAddressMock,
                instruments: [paypalToBcInstrumentMock],
            });
        });
    });

    describe('#mapBcToPayPalInstrument()', () => {
        it('maps and returns PayPal Instrument mapped to BC shape', () => {
            const result = subject.mapPayPalToBcInstrument(
                methodIdMock,
                authenticationResultMock.profileData.card,
            );

            expect(result).toEqual([paypalToBcInstrumentMock]);
        });
    });

    describe('#mapBcToPayPalAddress()', () => {
        it('maps and returns PayPal Address based on provided BC address', () => {
            const result = subject.mapBcToPayPalAddress(bcAddressMock);

            expect(result).toEqual({
                addressLine1: 'addressLine1',
                addressLine2: 'addressLine2',
                adminArea1: 'addressState',
                adminArea2: 'addressCity',
                company: 'BigCommerce',
                countryCode: 'US',
                postalCode: '03004',
            });
        });
    });

    describe('#mapPayPalToBcAddress()', () => {
        it('maps and returns PayPal Address based on provided BC address', () => {
            const result = subject.mapPayPalToBcAddress(
                authenticationResultMock.profileData.shippingAddress.address,
                authenticationResultMock.profileData.shippingAddress.name,
                authenticationResultMock.profileData.shippingAddress.phoneNumber,
                [],
            );

            expect(result).toEqual(paypalToBcAddressMock);
        });
    });

    describe('#filterAddresses()', () => {
        it('returns only one address if provided addresses are the same', () => {
            const result = subject.filterAddresses([paypalToBcAddressMock, paypalToBcAddressMock]);

            expect(result).toHaveLength(1);
        });

        it('returns an array of addresses if provided addresses are different', () => {
            const result = subject.filterAddresses([
                paypalToBcAddressMock,
                {
                    ...paypalToBcAddressMock,
                    firstName: 'John',
                    lastName: 'Son',
                },
            ]);

            expect(result).toHaveLength(2);
        });
    });
});
