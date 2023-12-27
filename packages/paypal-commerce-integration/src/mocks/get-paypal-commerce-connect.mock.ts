import { PayPalCommerceConnect, PayPalCommerceConnectAuthenticationState } from '../paypal-commerce-types';

export default function getPayPalCommerceConnect(): PayPalCommerceConnect {
    return {
        identity: {
            lookupCustomerByEmail(email: string) {
                console.log('lookupCustomerByEmail ', email);

                return Promise.resolve({
                    customerContextId: 'mockedCustomerContextId',
                });
            },
            triggerAuthenticationFlow(customerContextId: string) {
                console.log('triggerAuthenticationFlow ', customerContextId);

                return Promise.resolve({
                    authenticationState: PayPalCommerceConnectAuthenticationState.SUCCEEDED,
                    profileData: {
                        card: {
                            id: 'nonce',
                            paymentSource: {
                                card: {
                                    brand: 'Visa',
                                    expiry: '2025-12',
                                    lastDigits: '1111',
                                    name: 'name?',
                                    billingAddress: {
                                        firstName: 'John',
                                        lastName: 'Doe',
                                        company: 'BC',
                                        streetAddress: 'Test address',
                                        extendedAddress: 'what address',
                                        locality: 'New York', // City
                                        region: 'New York', // State
                                        postalCode: '01001',
                                        countryCodeNumeric: undefined,
                                        countryCodeAlpha2: 'NY',
                                        countryCodeAlpha3: undefined,
                                    },
                                },
                            },
                        },
                        name: {
                            firstName: 'John',
                            lastName: 'Doe',
                        },
                        shippingAddress: {
                            firstName: 'John',
                            lastName: 'Doe',
                            company: 'BC',
                            streetAddress: 'Test address',
                            extendedAddress: 'what address',
                            locality: 'New York', // City
                            region: 'New York', // State
                            postalCode: '01001',
                            countryCodeNumeric: undefined,
                            countryCodeAlpha2: 'NY',
                            countryCodeAlpha3: undefined,
                        },
                    },
                });
            },
        },
    };
}
